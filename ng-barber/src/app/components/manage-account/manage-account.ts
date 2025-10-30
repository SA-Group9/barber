import { Component, inject } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { AccountService } from '../../services/account-service';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Account } from '../../common/models/account.model';

@Component({
  selector: 'app-manage-account',
  standalone: false,
  templateUrl: './manage-account.html',
  styleUrl: './manage-account.scss'
})
export class ManageAccount {

  getTranslateRole(role: string): string {
    switch (role) {
      case 'customer': return 'ลูกค้า';
      case 'barber': return 'ช่างตัดผม';
      case 'owner': return 'เจ้าของร้าน';
      case 'admin': return 'ผู้ดูแลระบบ';
      default: return 'ตำแหน่ง';
    }
  }

  private fb = inject(FormBuilder);

  addAccountForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    telNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    password: ['', Validators.required],
    role: ['', Validators.required]
  });

  editAccountForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    telNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    password: [''],
    role: ['', Validators.required]
  });

  submitAddAccount() {
    this.addAccountForm.markAllAsTouched();

    if (this.addAccountForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      });
      return;
    }

    const account: Account = {
      firstName: this.addAccountForm.value.firstName!,
      lastName: this.addAccountForm.value.lastName!,
      telNumber: this.addAccountForm.value.telNumber!,
      password: this.addAccountForm.value.password!,
      queuing: false,
      role: this.addAccountForm.value.role!,
    };

    this.accountService.createAccountByAdmin(account).subscribe({
      next: (res) => {
        Swal.fire({
          title: 'เพิ่มบัญชีสำเร็จ!',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        });

        this.addAccountForm.reset({
          firstName: '',
          lastName: '',
          telNumber: '',
          password: '',
          role: ''
        });
        this.searchChanged.next();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err?.error?.message || 'โปรดลองใหม่อีกครั้ง'
        });
      }
    });
  }

  selectedAccountId: number = 0;
  selectedAccount?: Account;

  onEditButton(id: number) {
    this.resetForm(); // รีเซ็ตฟอร์ม
    this.selectedAccountId = id;
    console.log('selectedId:', id);

    this.accountService.getAccountById(this.selectedAccountId).subscribe({
      next: (selectedAccount: Account) => {
        this.editAccountForm.patchValue({
          firstName: selectedAccount.firstName,
          lastName: selectedAccount.lastName,
          telNumber: selectedAccount.telNumber,
          password: '',
          role: selectedAccount.role
        });
        this.selectedAccount = selectedAccount;
      },
      error: (err: any) => {
        console.error('Failed to load user', err);
      }
    });
  }

  submitEditAccount() {
    // ทำให้ฟอร์มถูกเช็กก่อน
    this.editAccountForm.markAllAsTouched();

    if (this.editAccountForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      });
      return;
    }

    const telNumber = this.editAccountForm.value.telNumber!;
    const isTelChanged = telNumber !== this.selectedAccount?.telNumber;

    // ✅ ถ้าเบอร์ไม่เปลี่ยน -> ข้ามการเช็กซ้ำ
    if (!isTelChanged) {
      const account: Account = {
        accountId: this.selectedAccountId,
        firstName: this.editAccountForm.value.firstName!,
        lastName: this.editAccountForm.value.lastName!,
        telNumber: telNumber,
        password: this.editAccountForm.value.password!,
        queuing: this.selectedAccount?.queuing ?? false,
        role: this.editAccountForm.value.role!
      };

      this.accountService.editAccountByAdmin(account).subscribe({
        next: () => {
          Swal.fire({
            title: 'แก้ไขบัญชีสำเร็จ!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
          });
          this.searchChanged.next();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: err?.error?.message || 'โปรดลองใหม่อีกครั้ง'
          });
        }
      });
      return;
    }

    // ถ้าเบอร์เปลี่ยน -> ตรวจหมายเลขซ้ำก่อน
    this.accountService.checkTelNumber(telNumber).subscribe({
      next: (isTaken) => {
        if (isTaken) {
          Swal.fire({
            icon: 'error',
            title: 'หมายเลขโทรศัพท์นี้ถูกใช้งานแล้ว',
          });
          return;
        }

        // ถ้าไม่ซ้ำ -> ดำเนินการแก้ไข
        const account: Account = {
          accountId: this.selectedAccountId,
          firstName: this.editAccountForm.value.firstName!,
          lastName: this.editAccountForm.value.lastName!,
          telNumber: telNumber,
          password: this.editAccountForm.value.password!,
          queuing: this.selectedAccount?.queuing ?? false,
          role: this.editAccountForm.value.role!
        };

        this.accountService.editAccountByAdmin(account).subscribe({
          next: () => {
            Swal.fire({
              title: 'แก้ไขบัญชีสำเร็จ!',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500
            });
            this.searchChanged.next();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: err?.error?.message || 'โปรดลองใหม่อีกครั้ง'
            });
          }
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'ตรวจสอบหมายเลขโทรศัพท์ไม่สำเร็จ',
        });
      }
    });
  }

  resetForm() {
    this.addAccountForm.reset({
      firstName: '',
      lastName: '',
      telNumber: '',
      password: '',
      role: ''  // <-- กำหนด role เป็น '' เพื่อให้ default option ถูกเลือก
    });

    this.editAccountForm.reset({
      firstName: '',
      lastName: '',
      telNumber: '',
      password: '',
      role: '' // สำหรับ edit กำหนด default ถ้าจำเป็น
    });
  }


  // ส่วนรีหน้า Search Page Size
  keyword: string = '';
  page: number = 0;
  size: number = 5;
  sizes: number[] = [5, 10]; // Page Size DropBox
  accounts: any[] = [];
  roles: any = ['admin', 'owner', 'barber', 'customer'];
  role: string = '';

  constructor(private accountService: AccountService,
    private router: Router
  ) {
    this.searchChanged.pipe(debounceTime(300)).subscribe(() => {
      this.loadAccounts();
    });
  }

  private searchChanged = new Subject<void>();

  ngOnInit(): void {
    console.log(this.accounts);
    if (!this.role) { this.role = ''; }
    this.searchChanged.next();
  }

  onSearchChanged() {
    this.searchChanged.next();
  }

  onRoleChange(role: any) {
    this.role = role;
    this.page = 0; // Reset to first page when category changes
    this.pageCurrent = 1;
    this.searchChanged.next();
  }

  onPageSizeChange(size: any) {
    this.size = size;
    this.pageCurrent = 1;
    this.page = 0; // reset to first page when page size changes
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.searchAccounts(this.page, this.size, this.keyword, this.role)
      .subscribe((res: any) => {
        this.totalElements = res.totalElements;
        if (res.content.length === 0) {
          this.firstDisplay = 0;
        } else {
          this.firstDisplay = (this.page * this.size) + 1;
        }
        this.lastDisplay = Math.min(this.firstDisplay + this.size - 1, this.totalElements);
        this.totalPages = res.totalPages;
        this.accounts = res.content;
        console.log(this.accounts);
      });
  }

  // ส่วน Pagination And Result ...
  firstDisplay: number = 0;
  lastDisplay: number = 0;
  totalElements: number = 0;

  totalPages: number = 0;
  pageCurrent: number = 1;
  onPageChange(pageCurrent: number): void {
    this.pageCurrent = pageCurrent;
    this.page = pageCurrent - 1;
    this.loadAccounts();
  }
}
