// core and third party
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { JsonpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { AUTH_PROVIDERS } from 'angular2-jwt';

// shared modules
import { JwtService } from './jwt.service';
import { FbmanagerService } from './fbmanager.service';
import {
  AuthGuard, Navigation, MetricsCriteriaFilter,
  MetricsObjectiveFilter, SearchPipe,
  CurrencyConverterPipe, ProgressBarCustom,
  DateRangePicker
} from './common';

//custom components and services
import { LoginComponent } from './login';
import { DoLoginComponent } from './doLogin';
import { HomeComponent } from './home';
import {
  MetricsService, AdsComponent, CampaignsComponent,
  AdAccountDetailsComponent, PageDetailsComponent, MetricsBarChartComponent,
  MetricsPieChartComponent, MetricsLineChartComponent, PostDetailsComponent,
  DashboardComponent
 } from './metrics';

//main
import { AppComponent } from './app.component';
import { routes } from './app.routes';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    DoLoginComponent,
    Navigation,
    DashboardComponent,
    AdAccountDetailsComponent,
    AdsComponent,
    CampaignsComponent,
    PageDetailsComponent,
    PostDetailsComponent,
    MetricsBarChartComponent,
    MetricsPieChartComponent,
    MetricsLineChartComponent,
    MetricsCriteriaFilter,
    MetricsObjectiveFilter,
    SearchPipe,
    CurrencyConverterPipe,
    DateRangePicker,
    ProgressBarCustom
  ],
  imports: [
    HttpModule,
    BrowserModule,
    FormsModule,
    Ng2BootstrapModule,
    ChartsModule,
    JsonpModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  providers: [
    AuthGuard,
    AUTH_PROVIDERS,
    MetricsService,
    FbmanagerService,
    JwtService
  ]
})
export class AppModule { }
