import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Home } from './components/home/home';
import { Queue } from './components/queue/queue';
import { Login } from './components/login/login';
import { ManageAccount } from './components/manage-account/manage-account';
import { ManageQueue } from './components/manage-queue/manage-queue';
import { QueueLog } from './components/queue-log/queue-log';
import { Payment } from './components/payment/payment';
import { RoleGuard } from './guard/auth-guard';

const routes: Routes = [

  {
    path: "queue",
    component: Queue,
    title: "Queue"
  },

  {
    path: "manage-queue",
    component: ManageQueue,
    title: "Manage Queue",
    canActivate: [RoleGuard], data: { roles: ['barber'] }
  },

  {
    path: "manage-account",
    component: ManageAccount,
    title: "Manage Account",
    canActivate: [RoleGuard], data: { roles: ['owner', 'admin'] }
  },

  {
    path: "queue-log",
    component: QueueLog,
    title: "Queue Log",
    canActivate: [RoleGuard], data: { roles: ['owner', 'admin'] }
  },

  {
    path: "payment",
    component: Payment,
    title: "Payment",
    canActivate: [RoleGuard], data: { roles: ['owner', 'admin'] }
  },

  {
    path: "login",
    component: Login,
    title: "Login"
  },

  {
    path: "",
    redirectTo: '/home',
    pathMatch: 'full',
    title: "Home"
  },

  {
    path: "home",
    component: Home,
    title: "Home"
  },

  {
    path: "**",
    redirectTo: '/home',
    pathMatch: 'full',
    title: "Home"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
