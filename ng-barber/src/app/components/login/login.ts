import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth-service';
import { AccountService } from '../../services/account-service';
import { Account } from '../../common/models/account.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  isLogin: boolean = true;

  constructor(private authService: AuthService,
    private accountService: AccountService,
    private router: Router
  ) { }

  private fb = inject(FormBuilder);

  toggleLoginRegister() {
    this.isLogin = !this.isLogin;
  }

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    telNumber: ['', [Validators.required, Validators.pattern('^0[0-9]{9}$')]],
    password: ['', Validators.required]
  });

  loginForm = this.fb.group({
    telNumber: ['', [Validators.required, Validators.pattern('^0[0-9]{9}$')]],
    password: ['', Validators.required]
  });

  onLoginButton() {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกหมายเลขโทรศัพท์และรหัสผ่านให้ถูกต้อง',
      });
      return;
    }

    const telNumber = this.loginForm.value.telNumber!;
    const password = this.loginForm.value.password!;
    const loginFormData: any = { telNumber, password };

    this.accountService.authenticateAccount(loginFormData).subscribe((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        Swal.fire({
          icon: 'error',
          title: 'หมายเลขโทรศัพท์หรือรหัสผ่านไม่ถูกต้อง',
        });
        return;
      }

      Swal.fire({
        title: 'เข้าสู่ระบบสำเร็จ!',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        this.authService.getAccountFromApi(telNumber).subscribe(account => {
          this.authService.setAccount(account);

          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        });
      });
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error?.error?.message || 'โปรดลองใหม่อีกครั้ง'
      });
    });
  }

  onRegisterButton() {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง',
      });
      return;
    }

    const telNumber = this.registerForm.value.telNumber!;

    // เช็คเบอร์ซ้ำ
    this.accountService.checkTelNumber(telNumber).subscribe(exists => {
      if (exists) {
        Swal.fire({
          icon: 'warning',
          title: 'เบอร์โทรนี้มีอยู่แล้ว',
          text: 'กรุณาใช้เบอร์โทรอื่น',
          confirmButtonText: 'ตกลง'
        });
        return;
      }

      // ถ้าเบอร์ไม่ซ้ำ ให้สร้าง account
      const account: Account = {
        firstName: this.registerForm.value.firstName!,
        lastName: this.registerForm.value.lastName!,
        telNumber: telNumber,
        password: this.registerForm.value.password!,
        queuing: false
      };

      this.accountService.createAccount(account).subscribe({
        next: (res) => {
          Swal.fire({
            title: 'ลงทะเบียนสำเร็จ!',
            text: 'กรุณาทำการเข้าสู่ระบบต่อไป',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
          });
          this.registerForm.reset();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาดในการลงทะเบียน',
            text: err?.error?.message || 'โปรดลองใหม่อีกครั้งภายหลัง'
          });
        }
      });
    });
  }
}