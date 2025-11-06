import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { BarberService } from '../../services/barber-service';
import { ServiceService } from '../../services/service-service';
import { AccountService } from '../../services/account-service';
import { QueueService } from '../../services/queue-service';
import { PaymentService } from '../../services/payment-service';
import { debounceTime, interval, Subject, Subscription } from 'rxjs';
import { PaymentModel } from '../../common/models/payment.model';
import Swal from 'sweetalert2';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class Payment {

  constructor(private auth: AuthService,
    private paymentService: PaymentService
  ) { }

  private searchChanged = new Subject<void>();
  private paymentRefreshSub?: Subscription;

  private subs: Subscription[] = [];
  account: any = null;

  ngOnInit(): void {
    this.subs.push(
      this.auth.currentAccount$.subscribe(account => {
        this.account = account;
        console.log('ข้อมูลผู้ใช้ที่ล็อกอิน:', this.account);

        this.loadInCharge();
        this.searchChanged.next();
      })
    );

    this.searchChanged.pipe(debounceTime(300)).subscribe(() => {
      this.loadPayment();
    });

    this.paymentRefreshSub = interval(5000).subscribe(() => {
      this.loadPayment();
      this.loadInCharge();
    });
  }


  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
    if (this.paymentRefreshSub) {
      this.paymentRefreshSub.unsubscribe();
    }
  }

  onSearchChanged() {
    this.page = 0;
    this.searchChanged.next();
  }

  transactions = [
    { value: 'income', label: 'รายรับ' },
    { value: 'outcome', label: 'รายจ่าย' }
  ];

  selectedTransaction = '';
  selectedStatus = '';
  selectedInCharge = '';
  searchTerm = '';

  payments: any[] = [];
  totalElements = 0;
  page = 0;
  size = 5;
  transactionType = '';
  status = '';
  accountId?: number;
  startDate?: string;
  endDate?: string;

  totalPages: number = 0;
  pageCurrent: number = 1;
  firstDisplay: number = 0;
  lastDisplay: number = 0;

  onPageChange(pageCurrent: number): void {
    this.pageCurrent = pageCurrent;
    this.page = pageCurrent - 1;
    this.loadPayment();
  }

  inCharge: any[] = [];
  loadInCharge(): void {
    this.paymentService.getInCharge().subscribe({
      next: (res) => {
        this.inCharge = res;
        console.log('Incharge', res);
      },
      error: (err) => {
        console.error('Error loading inCharge accounts', err);
        this.inCharge = [];
      }
    });
  }

  incomeTotal: number = 0;
  expenseTotal: number = 0;
  profit: number = 0;
  pendingAmount: number = 0;
  loadPayment(): void {
    // โหลดข้อมูล pagination
    this.paymentService.searchPayments(
      this.page,
      this.size,
      this.selectedTransaction,
      this.selectedStatus,
      this.selectedInCharge ? Number(this.selectedInCharge) : undefined,
      this.startDate,
      this.endDate
    ).subscribe({
      next: (res) => {
        this.payments = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = Math.ceil(this.totalElements / this.size);
      },
      error: (err) => {
        console.error('Error loading payments', err);
        this.payments = [];
        this.totalElements = 0;
      }
    });

    // โหลดยอดรวมทั้งหมดตาม filter
    this.paymentService.getPaymentSummary(
      this.selectedTransaction,
      this.selectedStatus,
      this.selectedInCharge ? Number(this.selectedInCharge) : undefined,
      this.startDate,
      this.endDate
    ).subscribe({
      next: (summary) => {
        this.incomeTotal = summary.incomeTotal;
        this.expenseTotal = summary.expenseTotal;
        this.profit = summary.profit;
        this.pendingAmount = summary.pendingAmount;
      },
      error: (err) => {
        console.error('Error loading summary', err);
        this.incomeTotal = 0;
        this.expenseTotal = 0;
        this.profit = 0;
        this.pendingAmount = 0;
      }
    });
  }


  getTypeInThai(type: string): string {
    switch (type) {
      case 'income':
        return 'รายรับ';
      case 'outcome':
        return 'รายจ่าย';
      default:
        return type;
    }
  }

  getStatusInThai(status: string): string {
    switch (status) {
      case 'paid': return 'จ่ายแล้ว';
      case 'unpaid': return 'ค้างชำระ';
      default: return 'ไม่มี';
    }
  }

  getInChargeNameById(accountId: number): string {
    const acc = this.inCharge.find(a => a.accountId === accountId);
    return acc ? `${acc.firstName} ${acc.lastName}` : '-';
  }

  formatTimestampToThaiDateTime(ts: number): string {
    const date = new Date(ts);

    const day = date.getDate();
    const monthNamesThai = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const month = monthNamesThai[date.getMonth()];

    const year = date.getFullYear() + 543; // เปลี่ยนเป็น พ.ศ.

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} เวลา ${hours}.${minutes} น.`;
  }


  selectedPayment?: PaymentModel;
  selectPayment(paymentId: number) {
    this.paymentService.getPaymentInfoById(paymentId).subscribe({
      next: (payment) => {
        this.selectedPayment = payment;
        console.log('Selected payment:', this.selectedPayment);

        if (payment.status === 'unpaid') {
          Swal.fire({
            title: 'ยืนยันการจ่ายเงิน',
            text: 'คุณต้องการจ่ายเงินให้ช่างหรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'จ่ายเงิน',
            cancelButtonText: 'ยกเลิก'
          }).then((result) => {
            if (result.isConfirmed) {
              this.markPaymentAsPaid(payment.paymentId!);
              this.createOutcome();
            }
          });
        }
      },
      error: (err) => {
        console.error('Error fetching payment info:', err);
      }
    });
  }

  markPaymentAsPaid(paymentId: number) {
    this.paymentService.markAsPaid(paymentId).subscribe({
      next: (res) => {
        Swal.fire('สำเร็จ', 'ชำระเงินเรียบร้อยแล้ว', 'success');
        this.loadPayment();
      },
      error: (err) => {
        Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาด', 'error');
        console.error(err);
      }
    });
  }

  createOutcome() {
    const paymentDto = {
      serviceId: this.selectedPayment?.serviceId,
      accountId: this.account.accountId,
      queueListId: this.selectedPayment?.queueListId
    };

    this.paymentService.createOutcome(paymentDto).subscribe({
      next: (res) => {
        console.log('Outcome payment created:', res);
        Swal.fire('สำเร็จ', 'สร้างรายการรายจ่ายสำเร็จ', 'success');
        this.loadPayment();
      },
      error: (err) => {
        console.error('Error creating outcome:', err);
        Swal.fire('ผิดพลาด', 'ไม่สามารถสร้างรายจ่ายได้', 'error');
      }
    });
  }

  private fb = inject(FormBuilder);

  outcomeForm = this.fb.group({
    amount: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
  });

  onSubmitDone() {
    const amount = Number(this.outcomeForm.value.amount);

    const payment = {
      amount: this.outcomeForm.value.amount,
      accountId: this.account.accountId
    };
    this.paymentService.createOutcomeCustom(payment).subscribe({
      next: (res) => {
        console.log('สร้าง outcome สำเร็จ', res);
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาด', err);
      }
    });
    this.searchChanged.next();
  }

}
