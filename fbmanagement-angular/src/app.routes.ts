// core
import { Routes } from '@angular/router';

// auth stuff
import { AuthGuard } from './common/auth.guard';

// pages
import { LoginComponent } from './login';
import { DoLoginComponent } from './doLogin';
import { HomeComponent } from './home';
import {
  AdsComponent, CampaignsComponent,
  AdAccountDetailsComponent, PageDetailsComponent,
  PostDetailsComponent, DashboardComponent
} from './metrics';

export const routes: Routes = [
  { path: '',       component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login',  component: LoginComponent },
  { path: 'doLogin/:token', component: DoLoginComponent },
  { path: 'home',   component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'dashboard',   component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'ads', component: AdsComponent, canActivate: [AuthGuard] },
  { path: 'campaigns', component: CampaignsComponent, canActivate: [AuthGuard] },
  { path: 'adAccount/:id', component: AdAccountDetailsComponent, canActivate: [AuthGuard] },
  { path: 'page/:id', component: PageDetailsComponent, canActivate: [AuthGuard] },
  { path: 'post/:id', component: PostDetailsComponent, canActivate: [AuthGuard] },
  // { path: 'ad/:id', component: AdDetailsComponent, canActivate: [AuthGuard] },
  // { path: 'adset/:id', component: AdsetDetailsComponent, canActivate: [AuthGuard] },
  // { path: 'campaign/:id', component: CampaignDetailsComponent, canActivate: [AuthGuard] },
  { path: '**',     component: LoginComponent }
];
