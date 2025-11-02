import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { BarberService } from '../../services/barber-service';
import { ServiceService } from '../../services/service-service';
import { AccountService } from '../../services/account-service';
import { QueueService } from '../../services/queue-service';
import { Barber } from '../../common/models/barber.model';
import { Service } from '../../common/models/service.model';
import { forkJoin, interval, Subscription } from 'rxjs';
import { QueueModel } from '../../common/models/queue.model';
import Swal from 'sweetalert2';
import { Account } from '../../common/models/account.model';
import { FormBuilder, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment-service';


@Component({
  selector: 'app-manage-queue',
  standalone: false,
  templateUrl: './manage-queue.html',
  styleUrl: './manage-queue.scss'
})
export class ManageQueue {
  private subs: Subscription[] = [];
  account: any = null;

  barbers: Barber[] = [];
  services: Service[] = [];

  constructor(private auth: AuthService,
    private barberService: BarberService,
    private serviceService: ServiceService,
    private accountService: AccountService,
    private queueService: QueueService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.subs.push(
      this.auth.currentAccount$.subscribe(account => {
        this.account = account;
        console.log('Current account:', this.account);
        this.loadServices();
        this.loadMyQueue();

        const refreshSub = interval(5000).subscribe(() => {
          if (!this.queueAccepted) {
            this.loadMyQueue();
          }
        });
        this.subs.push(refreshSub);
      })
    );
  }

  selectedQueue: number = 0;
  selectQueue(queueId: number) {
    this.selectedQueue = queueId;
    const selected = this.myQueues.find(q => q.queueId === queueId);

    if (!selected) {
      console.error('ไม่พบคิวที่เลือก');
      return;
    }

    // ✅ ตั้งค่า currentQueue ทันทีที่เลือก
    this.currentQueue = selected;
    console.log('Selected Queue:', selected);

    // โหลดข้อมูลเพิ่มเติม (เจ้าของคิว + จำนวนคิวถัดไป)
    forkJoin({
      accountInfo: this.queueService.getQueueInfoForBarber(queueId),
      laterCount: this.queueService.getLaterQueueCount(queueId)
    }).subscribe({
      next: ({ accountInfo, laterCount }) => {
        this.currentQueueAccountInfo = accountInfo;
        this.laterQueueCount = laterCount;

        // แสดง SweetAlert ให้เลือกว่าจะทำอะไร
        Swal.fire({
          title: 'จัดการคิว',
          text: `คุณต้องการทำอะไรกับคิวที่ ${selected.queueNumber}?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ตัดผม',
          cancelButtonText: 'ยกเลิกคิว',
          reverseButtons: true,
          confirmButtonColor: '#4E7E53',
          cancelButtonColor: '#BF4641',
        }).then((result) => {
          if (result.isConfirmed) {
            this.acceptQueue(selected);
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            this.cancelQueue(selected);
          }
        });
      },
      error: (err) => {
        console.error('โหลดข้อมูลเจ้าของคิว/จำนวนคิวถัดไปล้มเหลว', err);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลคิวเพิ่มเติมได้',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  currentQueue: QueueModel | null = null;
  currentQueueAccountInfo: Account | null = null;
  laterQueueCount: number = 0;
  queueAccepted: boolean = false;

  acceptQueue(selectedQueue: QueueModel) {
    this.queueAccepted = true;
    Swal.fire({
      title: 'เริ่มตัดผม',
      icon: 'success',
      confirmButtonColor: '#4E7E53'
    });
  }

  cancelQueue(selectedQueue: QueueModel) {
    if (!this.account) return;

    const accountIdForCancel = this.account.accountId;
    const accountIdForReset = selectedQueue.accountId!;

    console.log('Cancel queue:', { queueId: selectedQueue.queueId, accountIdForCancel, accountIdForReset });

    this.queueService.setQueueCanceled(selectedQueue.queueId!, accountIdForCancel).subscribe({
      next: (queue) => {
        console.log('Queue canceled:', queue);

        this.accountService.resetQueuing(accountIdForReset).subscribe({
          next: (account) => {
            console.log('Reset queuing done', account);
            Swal.fire({
              title: 'ยกเลิกคิวสำเร็จ',
              icon: 'success',
              confirmButtonColor: '#BF4641'
            });
            this.queueAccepted = false;
            this.loadMyQueue(); // โหลดคิวใหม่
          },
          error: (err) => {
            console.error('Failed to reset queuing', err);
            Swal.fire({
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถรีเซ็ตคิวได้',
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        });
      },
      error: (err) => {
        console.error('Failed to cancel queue', err);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถยกเลิกคิวได้',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }


  returnToAllQueues() {
    this.queueAccepted = false;

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }

  private fb = inject(FormBuilder);
  paymentForm = this.fb.group({
    queueNote: ['']
  });

  onSubmitDone() {
    if (this.paymentForm.invalid || !this.currentQueue) return;

    // const paymentMethod = this.paymentForm.value.queuePaymentMethod;
    // this.paymentMethod = paymentMethod ?? null;

    this.savePayment(this.currentQueue.queueId!);

    Swal.fire({
      title: 'บันทึกการชำระเงินสำเร็จ',
      icon: 'success',
      confirmButtonColor: '#4E7E53'
    });

    this.returnToAllQueues();
  }

  // paymentMethod: string | null = null;
  savePayment(queueId: number) {
    const accountIdForQueue = this.account.accountId;
    const accountIdForReset = this.currentQueue?.accountId!;

    this.queueService.setQueueDone(queueId, accountIdForQueue).subscribe({
      next: (queue) => {
        console.log('Queue done', queue);

        const payment = {
          accountId: accountIdForQueue,
          queueListId: queueId,
          serviceId: this.currentQueue?.serviceId
        };


        this.paymentService.createIncome(payment).subscribe({
          next: (paymentRes) => {
            console.log('Income payment created', paymentRes);
          },
          error: (err) => {
            console.error('Failed to create income payment', err);
          }
        });

        this.accountService.resetQueuing(accountIdForReset).subscribe({
          next: (account) => {
            console.log('Reset queuing done', account);
          },
          error: (err) => {
            console.error('Failed to reset queuing', err);
          }
        });
      },
      error: (err) => {
        console.error('Failed to mark queue as done', err);
      }
    });
  }


  loadServices(): void {
    this.serviceService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
        console.log('Loaded services:', data);
      },
      error: (err) => {
        console.error('Error loading services:', err);
      }
    });
  }

  getServiceNameThai(serviceId: number): string {
    const service = this.services.find(s => s.serviceId === serviceId);
    if (!service) return '-';

    switch (service.serviceName) {
      case 'haircut': return 'ตัดผม';
      case 'fix_haircut': return 'แก้ทรงผม';
      default: return service.serviceName;
    }
  }

  myQueues: QueueModel[] = []; // ประกาศเป็น array

  loadMyQueue() {
    if (!this.account) return;

    const accountDto = { accountId: this.account.accountId };

    this.queueService.getTodayQueuesForOwner(accountDto).subscribe({
      next: (queues) => {
        this.myQueues = queues.slice(0, 5);
        console.log('My queues:', this.myQueues);
      },
      error: (err) => {
        console.error('Failed to load queue:', err);
        this.myQueues = [];
      }
    });
  }

}
