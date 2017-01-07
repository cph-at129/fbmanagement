import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MetricsService } from './metrics.service';
import { FbmanagerService } from './../fbmanager.service';

const template = require('./dashboard.component.html');

@Component({
  selector: 'dashboard',
  template: template
})
export class DashboardComponent implements OnInit {

  error: string;
  info: string;
  chartType = '';
  itemsType = '';
  userInfo: any;
  selectedAcccountId: string;
  adAccounts = [];
  campaigns = [];
  adsets = [];
  ads = [];
  selectedAccount: any;
  datePickerType: String;
  syncDateRangeFrom: Date;
  syncDateRangeUntil: Date;
  syncDateRangeType: String;
  showOldData = false;
  showDateRangeUntil = false;

  constructor(
    private router: Router,
    private metricsService: MetricsService,
    private fbmanagerService: FbmanagerService,
    private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.fbmanagerService.loginCheck();
    this.getUser();
  }

  getUser() {
    this.fbmanagerService.getUser()
      .then((userInfo) => {
        if (!userInfo || Object.keys(userInfo).length === 0) {
          this.fbmanagerService.logout();
        } else {
          this.userInfo = userInfo;
          this.adAccounts = userInfo.adAccountsInfo;
        }
      })
  }

  getAdAccount(account_id, itemsType) {
    this.clearAdAccount();
    this.metricsService.getAdAccount(account_id)
      .then((adAccount) => {
        if (adAccount) {
          this.initData(adAccount);
          this.showOldData = true;
        }
      })
  }

  syncAdAccount(id: string) {
    this.metricsService.syncAdAccount(id)
      .then((result) => {
      })
  }

  selectAccount(account: any){
    this.selectedAccount = account;
    this.getAdAccount(this.selectedAccount.id, this.itemsType);
  }

  syncAdAccountForDateRange(id: string) {
    this.showOldData = false;
    this.metricsService.syncAdAccountForDateRange(id, this.syncDateRangeFrom, this.syncDateRangeUntil)
      .then((data) => {
        this.clearDateRangeValues();
        this.initData(data);
      })
  }

  syncAdAccountForDateRangeType(id: string) {
    this.showOldData = false;
    this.metricsService.syncAdAccountForDateRangeType(id, this.syncDateRangeType)
      .then((data) => {
        this.clearDateRangeValues();
        this.initData(data);
      })
  }

  setItemsType(itemsType) {
    this.itemsType = '';
    this.ref.detectChanges();
    switch (itemsType) {
      case 'ads':
        this.itemsType = 'ads';
        break;
      case 'adsets':
        this.itemsType = 'adsets';
        break;
      case 'campaigns':
        this.itemsType = 'campaigns';
        break;
      default:
        this.itemsType = '';
    }
  }

  onFiltered(event: Boolean) {
    this.ref.detectChanges();
  }

  onPickedDateRangeFrom(event: Date) {
    this.ref.detectChanges();
    this.syncDateRangeFrom = event;
    this.showDateRangeUntil = true;
  }

  onPickedDateRangeUntil(event: Date) {
    this.ref.detectChanges();
    this.syncDateRangeUntil = event;
  }

  onPickedDateRangeType(event: string) {
    this.ref.detectChanges();
    console.log(event);
    this.syncDateRangeType = event;
  }

  setDatePickerType(datePickerType: string) {
    this.clearDateRangeValues();
    this.datePickerType = datePickerType;
    this.ref.detectChanges();
  }

  clearDateRangeValues(){
    this.datePickerType = '';
    this.syncDateRangeFrom = null;
    this.syncDateRangeUntil = null;
    this.syncDateRangeType = null;
  }

  initData(data) {
    this.campaigns = data.campaigns;
    this.adsets = data.adsets;
    this.ads = data.ads;
  }

  clearAdAccount() {
    this.campaigns = [];
    this.adsets = [];
    this.ads = [];
  }

  setChartType(chartType) {
    switch (chartType) {
      case 'line': this.chartType = 'line'; break;
      case 'line-video': this.chartType = 'line-video'; break;
      case 'bar': this.chartType = 'bar'; break;
      case 'pie': this.chartType = 'pie'; break;
      default: this.chartType = 'all';
    }
  }
}
