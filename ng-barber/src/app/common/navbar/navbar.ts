import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { NavbarService } from '../../services/navbar';
import { AuthService } from '../../services/auth-service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Account } from '../models/account.model';
import { AccountService } from '../../services/account-service';
import { Password } from '../models/password.model';
import { BarberService } from '../../services/barber-service';

enum MyProfileState {
  Normal = 'Normal',
  EditProfile = 'EditProfile',
  ChangePassword = 'ChangePassword'
};

// enum Role {
//   Customer = 0,
//   Barber = 1,
//   Admin = 2,
//   Owner = 3
// };

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  private subs: Subscription[] = [];
  account: any = null;

  public MyProfileState = MyProfileState;
  public profileState: MyProfileState = MyProfileState.Normal;
  private fb = inject(FormBuilder);

  constructor(
    private navbarService: NavbarService,
    private router: Router,
    private auth: AuthService,
    private accountService: AccountService,
    private barberService: BarberService
  ) { }

  editProfileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    telNumber: ['', Validators.required],
    role: [{ value: '', disabled: true }, Validators.required]
  });


  changePasswordForm = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
    confirmNewPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    this.subs.push(
      this.auth.currentAccount$.subscribe(account => {
        this.account = account;
        if (this.isNormal()) {
          this.resetEditProfileForm();
        }

        if (this.account?.role === 'barber') {
          this.loadBarberStatus(this.account.accountId);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  loadBarberStatus(accountId: number) {
    this.barberService.getBarberStatus(accountId).subscribe({
      next: (res: any) => {
        console.log('โหลดสถานะ barber จาก backend:', res);
        this.barberStatus = res.barberStatus === 'available';
      },
      error: (err) => {
        console.error('ไม่สามารถโหลดสถานะ barber ได้', err);
      }
    });
  }


  goToSection(section: string, event: Event) {
    event.preventDefault();

    if (this.router.url === '/home') {
      this.navbarService.triggerScrollTo(section);
    } else {
      this.router.navigate(['/home']).then(() => {
        this.navbarService.triggerScrollTo(section);
      });
    }
  }

  goToHome() {
    this.router.navigate(['/home']);
    console.log(this.account);
  }

  goToQueue() {
    this.router.navigate(['/queue']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  //Owner + Barber
  goToQueueManagement() {
    this.router.navigate(['/manage-queue']);
  }

  //Owner
  goToAccountManagement() {
    this.router.navigate(['/manage-account']);
  }

  goToQueueLog() {
    this.router.navigate(['/queue-log']);
  }

  goToPayment() {
    this.router.navigate(['/payment']);
  }

  onLogoutButton() {
    this.auth.onLogoutButton();
    this.router.navigate(['/login']);
  }

  onMyProfileButton() {
    this.profileState = MyProfileState.Normal;
  }

  public isChangePassword(): boolean {
    return this.profileState == MyProfileState.ChangePassword;
  }

  public isEditProfile(): boolean {
    return this.profileState == MyProfileState.EditProfile;
  }

  public isNormal(): boolean {
    return this.profileState == MyProfileState.Normal;
  }

  onSaveChangePassword() {
    this.changePasswordForm.markAllAsTouched();

    if (this.changePasswordForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลรหัสผ่านเก่าและรหัสผ่านใหม่ให้ครบทุกช่อง',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    const password: Password = {
      accountId: this.account?.accountId!,
      oldPassword: this.changePasswordForm.value.oldPassword!,
      newPassword: this.changePasswordForm.value.newPassword!,
      confirmNewPassword: this.changePasswordForm.value.confirmNewPassword!
    };

    this.accountService.changePassword(password).subscribe({
      next: (res: any) => {
        if (res) {
          Swal.fire({
            icon: 'success',
            title: 'เปลี่ยนรหัสผ่านสำเร็จ!',
            text: 'รหัสผ่านของคุณถูกอัปเดตเรียบร้อยแล้ว',
            confirmButtonText: 'ตกลง'
          });
          this.changePasswordForm.reset();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'รหัสผ่านเก่าผิด หรือรหัสผ่านใหม่ไม่ตรงกัน',
            confirmButtonText: 'ลองใหม่'
          });
        }
      },
      error: (err: { error: { message: any; }; }) => {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err?.error?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ในขณะนี้',
          confirmButtonText: 'ลองใหม่'
        });
      }
    });
  }

  onBackButtonClick() {
    if (this.profileState === MyProfileState.EditProfile) {
      this.profileState = MyProfileState.Normal;
    } else if (this.profileState === MyProfileState.ChangePassword) {
      this.profileState = MyProfileState.EditProfile;
    }

    this.resetEditProfileForm();
    this.resetChangePasswordForm();
  }

  onSaveChangeEditProfile() {
    this.editProfileForm.markAllAsTouched();

    if (this.editProfileForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    const newTelNumber = this.editProfileForm.value.telNumber!;
    const oldTelNumber = this.account?.telNumber;

    // ✅ เช็คว่าเบอร์โทรเปลี่ยนหรือไม่ก่อนเรียก checkTelNumber()
    if (newTelNumber === oldTelNumber) {
      // ถ้าเบอร์ไม่เปลี่ยน ให้บันทึกโปรไฟล์ได้เลย
      this.saveEditedProfile(newTelNumber);
      return;
    }

    // ✅ ถ้าเบอร์เปลี่ยน -> ตรวจสอบเบอร์ซ้ำก่อน
    this.accountService.checkTelNumber(newTelNumber).subscribe({
      next: (exists) => {
        if (exists) {
          Swal.fire({
            icon: 'warning',
            title: 'เบอร์โทรนี้ถูกใช้งานแล้ว',
            text: 'กรุณาใช้เบอร์โทรอื่น',
            confirmButtonText: 'ตกลง'
          });
          return;
        }

        this.saveEditedProfile(newTelNumber);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err?.error?.message || 'ไม่สามารถตรวจสอบเบอร์โทรได้',
          confirmButtonText: 'ลองใหม่'
        });
      }
    });
  }

  saveEditedProfile(telNumber: string) {
    const account: Account = {
      accountId: this.account?.accountId,
      firstName: this.editProfileForm.value.firstName!,
      lastName: this.editProfileForm.value.lastName!,
      telNumber,
      password: '',
      queuing: this.account?.queuing ?? false,
      role: this.account?.role
    };

    this.accountService.editAccount(account).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'แก้ไขโปรไฟล์สำเร็จ!',
          text: 'ข้อมูลของคุณถูกอัปเดตเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง'
        });
        this.account = res;
        this.auth.setAccount(res);
        this.resetEditProfileForm();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err?.error?.message || 'ไม่สามารถแก้ไขโปรไฟล์ได้ในขณะนี้',
          confirmButtonText: 'ลองใหม่'
        });
      }
    });
  }



  onChangePasswordClick() {
    this.resetChangePasswordForm();
    this.profileState = MyProfileState.ChangePassword;
  }

  onEditProfileClick() {
    this.resetEditProfileForm();
    this.profileState = MyProfileState.EditProfile;
  }

  resetEditProfileForm() {
    if (!this.account) return;

    this.editProfileForm.patchValue({
      firstName: this.account.firstName || '',
      lastName: this.account.lastName || '',
      telNumber: this.account.telNumber || '',
      role: this.getTranslatedRole(this.account.role || '')
    });
  }


  resetChangePasswordForm() {
    this.changePasswordForm.patchValue({
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    })
  }

  getTranslatedRole(role: string): string {
    switch (role) {
      case 'customer': return 'ลูกค้า';
      case 'barber': return 'ช่างตัดผม';
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'owner': return 'เจ้าของร้าน';
      default: return role;
    }
  }

  barberStatus: boolean = false;

  onToggleBarberStatus() {
    console.log('สถานะ toggle (boolean):', this.barberStatus);
    const statusString = this.barberStatus ? 'available' : 'non_available';

    const barberData = {
      accountId: this.account.accountId,
      barberStatus: statusString
    };

    this.barberService.toggleBarberStatus(barberData).subscribe({
      next: (res) => {
        console.log('อัปเดตสถานะสำเร็จ', res);
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ', err);
      }
    });
  }


}
