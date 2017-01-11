import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtService } from '../jwt.service';
import { FbmanagerService } from '../fbmanager.service';
import { MetricsService } from '../metrics';

const template = require('./home.component.html');
var state_syncedAll = false;

@Component({
  selector: 'home',
  template: template
})


export class HomeComponent implements OnInit {
  jwt: string;
  decodedJwt: string;
  // ------------------
  error: string;
  info: string;
  synchronizing = false;
  synchronizingPages = false;
  // ---------------------
  preferred_currency = '';
  userInfo: any;
  campaigns = [];
  ads = [];
  bestPerformanceAd: any;
  DEFAULT_DATE_RANGE = 'lifetime';

  constructor(private router: Router,
    private JwtService: JwtService,
    private fbmanagerService: FbmanagerService,
    private metricsService: MetricsService,
    private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.fbmanagerService.loginCheck();
    this.getUser();
  }

  onFiltered(event: Boolean) {
    this.ref.detectChanges();
  }

  getUser() {
    this.fbmanagerService.getUser()
      .then((userInfo) => {
        if (!userInfo || Object.keys(userInfo).length === 0) {
          this.fbmanagerService.logout();
        } else {
          this.userInfo = userInfo;
          console.log(userInfo.adAccountsInfo);
          userInfo.adAccounts.forEach((adAccount) => {
            this.getAdAccount(adAccount.id);
          });
        }
      })
  }

  setCurrency(preferred_currency) {
    this.preferred_currency = preferred_currency;
  }

  getAdAccount(account_id) {
    this.metricsService.getAdAccount(account_id)
      .then((data) => {
        if (data) {
          if (data.campaigns.length === 0) {
            this.syncAdAccountForDateRange(account_id, this.DEFAULT_DATE_RANGE);
          } else {
            this.initData(data);
            this.filterBestPerformanceAd();
          }
        }
      })
  }

  syncAdAccountForDateRange(id: string, date_range: string) {
    this.synchronizing = true;
    this.metricsService.syncAdAccountForDateRangeType(id, date_range)
      .then((data) => {
        this.synchronizing = false;
        this.initData(data);
        this.filterBestPerformanceAd();
        this.ref.detectChanges();
      })
  }

  initData(data) {
    data.campaigns.forEach(campaign => {
      var assignedItem = this.assignCurrency(campaign);
      this.campaigns.push(assignedItem);
    });
    data.ads.forEach(ad => {
      var assignedItem = this.assignCurrency(ad);
      this.ads.push(assignedItem);
    });
    this.ref.detectChanges();
  }

  assignCurrency(item) {
    var assignedItem = item;
    this.userInfo.adAccountsInfo.forEach(account => {
      if (account.account_id === item.account_id) {
        assignedItem.currency = account.currency;
      }
    });
    return assignedItem;
  }

  clearAdAccount() {
    this.campaigns = [];
    this.ads = [];
  }

  filterBestPerformanceAd() {
    if (!this.bestPerformanceAd) {
      this.bestPerformanceAd = this.ads[0];
    }
    this.ads.forEach((ad) => {
      if (parseInt(ad.unique_impressions) > parseInt(this.bestPerformanceAd.unique_impressions)) {
        var assignedItem = this.assignCurrency(ad);
        this.bestPerformanceAd = assignedItem;
        this.preferred_currency = assignedItem.currency;
      }
    });
    this.ref.detectChanges();
  }
}
