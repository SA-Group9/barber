import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { AuthService } from '../../services/auth-service';

import Swal from 'sweetalert2';
import { ServiceService } from '../../services/service-service';
import { BarberService } from '../../services/barber-service';
import { Barber } from '../../common/models/barber.model';
import { Service } from '../../common/models/service.model';
import { Account } from '../../common/models/account.model';
import { QueueModel } from '../../common/models/queue.model';
import { AccountService } from '../../services/account-service';
import { QueueService } from '../../services/queue-service';

@Component({
  selector: 'app-queue',
  standalone: false,
  templateUrl: './queue.html',
  styleUrl: './queue.scss'
})
export class Queue {
  constructor(private auth: AuthService,
    private barberService: BarberService,
    private serviceService: ServiceService,
    private accountService: AccountService,
    private queueService: QueueService
  ) { }

  queueRefreshSub!: Subscription;

  ngOnInit(): void {
    this.loadServices();
    this.loadBarbers();
    this.subs.push(
      this.auth.currentAccount$.subscribe(account => {
        this.account = account;
        console.log(this.account);

        this.userQueuing = this.account.queuing === true;
        console.log('User queuing:', this.userQueuing);

        if (this.userQueuing) {
          this.loadMyQueue();
        }
      })
    );

    this.queueRefreshSub = interval(5000).subscribe(() => {
      if (this.userQueuing) {
        this.loadMyQueue();
        if (this.selectedBarberId) {
          this.getPreviousQueueFromBarber();
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.queueRefreshSub) {
      this.queueRefreshSub.unsubscribe();
    }
    this.subs.forEach(sub => sub.unsubscribe());
  }


  private subs: Subscription[] = [];
  account: any = null;

  barbers: Barber[] = [];
  services: Service[] = [];

  selectedServiceId: number = 0;
  selectedBarberId: number = 0;
  selectedBarberName: string = "";

  serviceName: string = "";
  servicePrice: number = 0;

  userQueuing: boolean = false;

  loadServices(): void {
    this.serviceService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
        if (this.services.length > 0) {
          this.serviceToggle(0);
        }
        console.log('Loaded services:', data);
      },
      error: (err) => {
        console.error('Error loading services:', err);
      }
    });
    this.selectedServiceId = 0;
  }

  loadBarbers(): void {
    this.barberService.getAllAvailableBarbers().subscribe({
      next: (barbers) => {
        this.barbers = barbers;
        console.log('โหลดรายชื่อช่างตัดผมสำเร็จ:', barbers);

        this.barbers.forEach((barber) => {
          this.barberService.getBarberInfoFromAccountId(barber.accountId)
            .subscribe({
              next: (account) => {
                barber.firstName = account.firstName;
                barber.lastName = account.lastName;
                barber.telNumber = account.telNumber;
                if (barber.barberId === this.selectedBarberId) {
                  this.selectedBarberName = `${barber.firstName} ${barber.lastName}`;
                }
              },
              error: (err) => console.error('Error loading barber info', err)
            });
        });
      },
      error: (err) => console.error('Error loading barbers', err)
    });
  }

  getBarberName(barberId: number): string {
    const barber = this.barbers.find(b => b.barberId === barberId);
    return barber ? `${barber.firstName}` : '-';
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



  myQueue: QueueModel | null = null;
  loadMyQueue() {
    const accountDto = { accountId: this.account.accountId };
    this.queueService.getMyQueue(accountDto).subscribe(
      data => {
        this.myQueue = data;
        console.log('ข้อมูลคิวของผู้ใช้:', this.myQueue);
        this.previousQueueCount();
      },
      error => {
        console.error('เกิดข้อผิดพลาดโหลดคิว:', error);
      }
    );
  }

  previousCountForYourQueue: number = 0;
  alreadyNotified: boolean = localStorage.getItem('alreadyNotified') === 'true';

  previousQueueCount(): void {
    if (this.myQueue && this.myQueue.queueNumber != null && this.myQueue.barberId != null) {
      const queueDto = {
        queueNumber: this.myQueue.queueNumber,
        barberId: this.myQueue.barberId
      };
      this.queueService.getPreviousQueueCount(queueDto).subscribe(
        count => {
          this.previousCountForYourQueue = count;
          console.log('จำนวนคิวก่อนหน้า:', count);

          if (count === 0 && this.userQueuing && !this.alreadyNotified) {
            this.notifyMyTurn();
            this.alreadyNotified = true;
            localStorage.setItem('alreadyNotified', 'true');
          }

          if (count > 0) {
            this.alreadyNotified = false;
            localStorage.setItem('alreadyNotified', 'false');
          }
        },
        error => console.error('เกิดข้อผิดพลาด:', error)
      );
    } else {
      console.warn('queueNumber หรือ barberId ยังไม่ถูกกำหนด');
    }
  }

  notifyMyTurn() {
    Swal.fire({
      icon: 'success',
      title: 'ถึงคิวของคุณแล้ว!',
      text: 'เชิญรับบริการ',
      confirmButtonText: 'ตกลง'
    });

    const audio = new Audio('assets/sounds/notify.mp3');
    audio.play();

    if (Notification.permission === 'granted') {
      new Notification('ถึงคิวของคุณแล้ว!', {
        body: 'เชิญรับบริการ',
      icon: 'assets/icons/barber.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('ถึงคิวของคุณแล้ว!', {
            body: 'เชิญรับบริการ',
          icon: 'assets/icons/barber.png'
          });
        }
      });
    }
  }

  formatQueueNumber(num: number | null): string {
    if (num === null || num === undefined) {
      return '-';
    }
    return num < 10 ? '0' + num : num.toString();
  }

  waitingQueueCount!: number;
  selectBarber(barber: any) {
    this.selectedBarberId = barber.barberId;

    // ดึงข้อมูล account ของช่าง
    this.barberService.getBarberInfoFromAccountId(barber.accountId)
      .subscribe({
        next: (account) => {
          this.selectedBarberName = `${account.firstName} ${account.lastName}`;
          console.log('Selected barber name:', this.selectedBarberName);
        },
        error: (err) => console.error('Error getting barber account info', err)
      });

    this.getPreviousQueueFromBarber()
  }

  getPreviousQueueFromBarber() {
    this.queueService.getPreviousQueueFromBarber({ barberId: this.selectedBarberId })
      .subscribe({
        next: (count) => {
          this.waitingQueueCount = count;
          console.log('Waiting queue count:', this.waitingQueueCount);
        },
        error: (err) => console.error('Error getting waiting queue count', err)
      });
  }


  translateServiceName(serviceName: string): string {
    if (serviceName === "haircut") return "ตัดผม";
    if (serviceName === "fix_haircut") return "แก้ทรงผม";
    return serviceName;
  }

  serviceToggle(index: number) {
    if (!this.services[index]) {
      console.warn('Service index ไม่ถูกต้อง');
      return;
    }

    const selectedService = this.services[index];
    if (this.selectedServiceId === selectedService.serviceId) return;

    this.selectedServiceId = selectedService.serviceId;
    this.serviceName = selectedService.serviceName;
    this.servicePrice = selectedService.servicePrice;

    console.log(`Selected service: ${this.serviceName} - ${this.servicePrice}`);
  }

  timeQueued: number = 0;

  onQueueButton() {
    this.timeQueued = Date.now();
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

  formatIsoStringToThaiDateTime(isoString: string): string {
    const date = new Date(isoString); // แปลงจาก ISO string เป็น Date

    const day = date.getDate();
    const monthNamesThai = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const month = monthNamesThai[date.getMonth()];

    const year = date.getFullYear() + 543;

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} เวลา ${hours}.${minutes} น.`;
  }


  confirmQueuing() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    if (hour > 19 || (hour === 19 && minute >= 30)) {
      Swal.fire({
        icon: 'warning',
        title: 'หมดเวลาจองคิวแล้ว',
        text: 'ขออภัย การจองคิวจะปิดหลัง 19:30 น.',
        confirmButtonText: 'ตกลง',
      });
      return;
    }
    if (!this.account) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาทำการเข้าสู่ระบบก่อน',
        text: 'โปรดทำการเข้าสู่ระบบ',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    if (this.selectedBarberId === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือกช่าง',
        text: 'โปรดเลือกช่างก่อนทำการจอง',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    const newQueue: QueueModel = {
      accountId: this.account.accountId,
      barberId: this.selectedBarberId,
      serviceId: this.selectedServiceId,
      editedBy: this.account.accountId
    };

    this.queueService.createQueue(newQueue).subscribe({
      next: (createdQueue: QueueModel) => {
        console.log('Queue created:', createdQueue);

        this.accountService.toggleIsQueuing(this.account).subscribe({
          next: (updatedAccount: Account) => {
            this.account = updatedAccount;
            this.auth.setAccount(updatedAccount);
            this.userQueuing = updatedAccount.queuing;
            this.timeQueued = Date.now();
            this.bookingSuccess();
            this.previousQueueCount();
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          },
          error: (err) => {
            console.error('Error toggling isQueuing:', err);
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถอัปเดตสถานะการจองได้',
              confirmButtonText: 'ตกลง',
            });
          }
        });
      },
      error: (err) => {
        console.error('Error creating queue:', err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถสร้างคิวได้ กรุณาลองใหม่',
          confirmButtonText: 'ตกลง',
        });
      }
    });
  }

  cancelQueuing() {
    if (!this.myQueue) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่มีคิวให้ยกเลิก',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    Swal.fire({
      title: 'ต้องการยกเลิกคิวหรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่ ยกเลิก',
      cancelButtonText: 'ไม่',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.queueService.cancelQueue(this.myQueue!).subscribe({
          next: (updatedQueue: QueueModel) => {
            this.myQueue = updatedQueue;

            this.accountService.toggleIsQueuing(this.account).subscribe({
              next: (updatedAccount: Account) => {
                console.log('toggleIsQueuing response:', updatedAccount);
                this.account = updatedAccount;
                this.userQueuing = updatedAccount.queuing;
                Swal.fire({
                  icon: 'success',
                  title: 'ยกเลิกคิวสำเร็จ',
                  confirmButtonText: 'ตกลง'
                });
              },
              error: (err) => {
                console.error('Error updating account:', err);
                Swal.fire({
                  icon: 'error',
                  title: 'เกิดข้อผิดพลาด',
                  text: 'ไม่สามารถอัปเดตสถานะผู้ใช้ได้',
                  confirmButtonText: 'ตกลง'
                });
              }
            });
          },
          error: (err) => {
            console.error('Error canceling queue:', err);
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถยกเลิกคิวได้ กรุณาลองใหม่',
              confirmButtonText: 'ตกลง'
            });
          }
        });
      }
    });
  }

  bookingSuccess() {
    Swal.fire({
      icon: 'success',
      title: 'จองคิวสำเร็จ',
      text: 'คุณได้ทำการจองคิวแล้ว!',
      showConfirmButton: false,
      timer: 1200
    });
  }

}