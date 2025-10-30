import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '../common/models/service.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(private http: HttpClient) { }
  
  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`api/service/all`);
  }
}
