import { Component } from '@angular/core';

@Component({
  selector: 'app-queue-log',
  standalone: false,
  templateUrl: './queue-log.html',
  styleUrl: './queue-log.scss'
})
export class QueueLog {
  startDate = '';
  endDate = '';
  selectedBarber = '';
  selectedStatus = '';
  searchTerm = '';

  barbers = ['ช่าง A', 'ช่าง B', 'ช่าง C'];

  queues = [
    { queueNumber: 1, firstName: 'AAAAAAA', lastName: 'AAAAA', phone: '08XXXXXXXX', service: 1, barber: 1, status: "queuing", latestEdit: "27/10/2568 10:00", editedBy:"0"
       },
    { queueNumber: 1, firstName: 'AAAAAAA', lastName: 'AAAAA', phone: '08XXXXXXXX', service: 1, barber: 1, status: "done", latestEdit: "27/10/2568 10:30", editedBy:"1" },
    { queueNumber: 2, firstName: 'BBBBBBB', lastName: 'BBBBBB', phone: '08XXXXXXXX', service: 2, barber: 2, status: "queuing", latestEdit: "27/10/2568 10:05", editedBy:"2"},
    { queueNumber: 2, firstName: 'BBBBBBB', lastName: 'BBBBBB', phone: '08XXXXXXXX', service: 2, barber: 2, status: "done", latestEdit: "27/10/2568 10:45", editedBy:"2"},
    { queueNumber: 3, firstName: 'CCCCCC', lastName: 'CCCCC', phone: '08XXXXXXXX', service: 1, barber: 2, status: "queuing", latestEdit: "27/10/2568 10:15", editedBy:"2"},
    { queueNumber: 4, firstName: 'DDDDD', lastName: 'DDDDDDD', phone: '08XXXXXXXX', service: 1, barber: 3, status: "queuing", latestEdit: "27/10/2568 10:20", editedBy:"3"},
    { queueNumber: 5, firstName: 'EEEEEEEE', lastName: 'EEEEEEEEE', phone: '08XXXXXXXX', service: 2, barber: 1, status: "queuing", latestEdit: "27/10/2568 10:18", editedBy:"1" },
    { queueNumber: 5, firstName: 'EEEEEEEE', lastName: 'EEEEEEEEE', phone: '08XXXXXXXX', service: 2, barber: 1, status: "canceled", latestEdit: "27/10/2568 10:25", editedBy:"1" }
  ];

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

}
