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
  userInfo: any;
  campaigns = [];
  ads = [];
  bestPerformanceAd: any;

  constructor(private router: Router,
    private JwtService: JwtService,
    private fbmanagerService: FbmanagerService,
    private metricsService: MetricsService,
    private ref: ChangeDetectorRef) {
  }

  // syncAll() {
  //   state_syncedAll = true;
  //   this.fbmanagerService.getUser()
  //     .then((userInfo) => {
  //       if (!userInfo || Object.keys(userInfo).length === 0) {
  //         this.fbmanagerService.logout();
  //       } else {
  //         this.userInfo = userInfo;
  //         userInfo.adAccounts.forEach((adAccount) => {
  //           this.syncAdAccount(adAccount.id);
  //         });
  //         userInfo.pages.forEach((page)=>{
  //           this.syncPage(page.id);
  //         });
  //       }
  //     })
  // }

  ngOnInit() {
    this.fbmanagerService.loginCheck();
    // this.clearAdAccount();
    this.getUser();
  }

  getUser() {
    this.fbmanagerService.getUser()
      .then((userInfo) => {
        if (!userInfo || Object.keys(userInfo).length === 0) {
          this.fbmanagerService.logout();
        } else {
          this.userInfo = userInfo;
          userInfo.adAccounts.forEach((adAccount) => {
            this.getAdAccount(adAccount.id);
          });
        }
      })
  }

  getAdAccount(account_id) {
    this.metricsService.getAdAccount(account_id)
      .then((adAccount) => {
        if (adAccount) {
          this.initAdAccount(adAccount);
          this.filterBestPerformanceAd();
        }
      })
  }

  syncPage(page_id) {
    this.synchronizing = true;
    this.synchronizingPages = true;
    this.metricsService.syncPage(page_id)
      .then((pageMetrics) => {
        this.synchronizing = false;
        this.synchronizingPages = false;
      })
  }

  syncAdAccount(id: string) {
    this.synchronizing = true;
    this.metricsService.syncAdAccount(id)
      .then((result) => {
        this.synchronizing = false;
        this.getAdAccount(id);
      })
  }

  initAdAccount(adAccount) {
    if (adAccount.campaigns) {
      adAccount.campaigns.forEach((campaign) => {
        this.campaigns.push(campaign);
      });
    }
    if (adAccount.ads) {
      adAccount.ads.forEach((ad) => {
        this.ads.push(ad);
      });
    }
    this.ref.detectChanges();
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
        this.bestPerformanceAd = ad;
      }
    });
  }
}
