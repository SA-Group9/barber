import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Home } from './components/home/home';
import { Queue } from './components/queue/queue';
import { Navbar } from './common/navbar/navbar';
import { Login } from './components/login/login';
import { ManageAccount } from './components/manage-account/manage-account';
import { ManageQueue } from './components/manage-queue/manage-queue';
import { QueueLog } from './components/queue-log/queue-log';
import { Payment } from './components/payment/payment';
import { Pagination } from './common/pagination/pagination';

@NgModule({
  declarations: [
    App,
    Home,
    Queue,
    Navbar,
    Login,
    ManageAccount,
    ManageQueue,
    QueueLog,
    Payment,
    Pagination
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient()
  ],
  bootstrap: [App]
})
export class AppModule { }
