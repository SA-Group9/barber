import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BarberService } from '../../services/barber-service';
import { ServiceService } from '../../services/service-service';
import { AccountService } from '../../services/account-service';
import { QueueService } from '../../services/queue-service';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { Barber } from '../../common/models/barber.model';
import { Service } from '../../common/models/service.model';
import { Account } from '../../common/models/account.model';

@Component({
  selector: 'app-queue-log',
  standalone: false,
  templateUrl: './queue-log.html',
  styleUrl: './queue-log.scss'
})
export class QueueLog {

  constructor(private http: HttpClient,
    private auth: AuthService,
    private barberService: BarberService,
    private serviceService: ServiceService,
    private accountService: AccountService,
    private queueService: QueueService
  ) { }

  private searchChanged = new Subject<void>();
  private subs: Subscription[] = [];
  account: any = null;

  ngOnInit(): void {
    this.loadQueuesLog();
    this.loadServices();
    this.loadBarbers();
    this.loadCustomerInfo();
    this.loadEditedByList();
    this.subs.push(
      this.auth.currentAccount$.subscribe(account => {
        this.account = account;
        console.log(this.account);
      })
    );

    this.searchChanged.pipe(debounceTime(300)).subscribe(() => {
      this.loadQueuesLog();
    });

    // this.queueRefreshSub = interval(5000).subscribe(() => {
    //   if (this.userQueuing) {
    //     this.loadMyQueue();
    //     if (this.selectedBarberId) {
    //       this.getPreviousQueueFromBarber();
    //     }
    //   }
    // });
  }

  startDate = '';
  endDate = '';
  selectedBarberId: number = 0;
  selectedStatus = '';
  selectedServiceId: number = 0;

  totalElements = 0;
  page = 0;
  size = 5;

  totalPages: number = 0;
  pageCurrent: number = 1;
  firstDisplay: number = 0;
  lastDisplay: number = 0;

  onPageChange(pageCurrent: number): void {
    this.pageCurrent = pageCurrent;
    this.page = pageCurrent - 1;
    this.loadQueuesLog();
  }

  onSearchChanged() {
    this.page = 0;
    this.searchChanged.next();
  }

  queues: any[] = [];
  barbers: Barber[] = [];
  services: Service[] = [];

  loadQueuesLog() {
    const barberId = this.selectedBarberId && this.selectedBarberId !== 0 ? this.selectedBarberId : undefined;
    const serviceId = this.selectedServiceId && this.selectedServiceId !== 0 ? this.selectedServiceId : undefined; // ✅ เพิ่ม
    const status = this.selectedStatus && this.selectedStatus !== '' ? this.selectedStatus : undefined;

    this.queueService.searchQueues(
      this.page,
      this.size,
      barberId,
      serviceId,
      status,
      this.startDate,
      this.endDate
    ).subscribe(
      data => {
        console.log('Response from API:', data);
        this.queues = data.content;
        this.totalElements = data.totalElements;
      },
      err => {
        console.error('Error loading queues', err);
      }
    );
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

  barberNames: { barberId: number; accountId: number; name: string }[] = [];

  loadBarbers(): void {
    this.barberService.getAllAvailableBarbers().subscribe({
      next: (barbers) => {
        if (!barbers || barbers.length === 0) {
          this.barberNames = [];
          return;
        }

        const tempArray: { barberId: number; accountId: number; name: string }[] = [];
        let loadedCount = 0;

        barbers.forEach((barber) => {
          this.barberService.getBarberInfoFromAccountId(barber.accountId).subscribe({
            next: (account) => {
              tempArray.push({
                barberId: barber.barberId ?? 0, // ✅ เพิ่ม barberId เข้าไป
                accountId: barber.accountId,
                name: `${account.firstName} ${account.lastName}`
              });
              loadedCount++;

              if (loadedCount === barbers.length) {
                this.barberNames = tempArray.sort((a, b) => a.name.localeCompare(b.name));
                console.log('โหลด barberNames สำเร็จ (เรียงชื่อแล้ว):', this.barberNames);
              }

            },
            error: (err) => {
              console.error('Error loading barber info', err);
              loadedCount++;
              if (loadedCount === barbers.length) {
                this.barberNames = tempArray;
              }
            }
          });
        });
      },
      error: (err) => console.error('Error loading barbers', err)
    });
  }

  customers: any[] = [];
  loadCustomerInfo(): void {
    this.queueService.getCustomerNameList().subscribe({
      next: (data: any[]) => {
        this.customers = data.map(c => ({
          accountId: c.accountId,
          firstName: c.firstName,
          lastName: c.lastName
        }));
        console.log('Loaded customers:', this.customers);
      },
      error: (err) => console.error('Error loading customers', err)
    });
  }

  editedByList: any[] = [];
  loadEditedByList(): void {
    this.queueService.getEditedByList().subscribe({
      next: (data: any[]) => {
        this.editedByList = data.map(e => ({
          accountId: e.accountId,
          firstName: e.firstName,
          lastName: e.lastName
        }));
        console.log('Loaded editedByList:', this.editedByList);
      },
      error: (err) => console.error('Error loading editedByList', err)
    });
  }

  getEditorNameFromId(accountId: number | undefined): string {
    if (!accountId) return '-';
    const editor = this.editedByList.find(e => e.accountId === accountId);
    return editor ? `${editor.firstName} ${editor.lastName}` : '-';
  }


  getCustomerNameFromAccountId(accountId: number | undefined): string {
    if (!accountId) return '-';
    const customer = this.customers.find(c => c.accountId === accountId);
    return customer ? `${customer.firstName} ${customer.lastName}` : '-';
  }


  getBarberNameFromBarberId(barberId: number | undefined): string {
    if (!barberId) return '';
    const barber = this.barberNames.find(b => b.barberId === barberId);
    return barber ? barber.name : '-';
  }

  translateStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'queuing':
        return 'กำลังรอคิว';
      case 'done':
        return 'เสร็จสิ้น';
      case 'canceled':
        return 'ยกเลิก';
      default:
        return status;
    }
  }

  formatTimestampToThaiDateTime(ts: number): string {
    const date = new Date(ts);

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

  getServiceNameThai(serviceId: number): string {
    const service = this.services.find(s => s.serviceId === serviceId);
    if (!service) return '-';

    switch (service.serviceName) {
      case 'haircut': return 'ตัดผม';
      case 'fix_haircut': return 'แก้ทรงผม';
      default: return service.serviceName;
    }
  }

}
