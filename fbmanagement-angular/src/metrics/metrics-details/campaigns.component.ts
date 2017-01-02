import { Component, OnInit } from '@angular/core';
import { FbmanagerService } from '../../fbmanager.service';
import { MetricsService } from '../metrics.service';

var insights_tooltips = require('./insights-tooltips.json');

@Component({
  selector: 'metrics-campaigns',
  templateUrl: 'campaigns.component.html'
})
export class CampaignsComponent implements OnInit {
  campaign_insights_tooltips = insights_tooltips.campaign;
  error: string;
  info: string;
  synchronizing = false;
  userInfo: any;
  campaigns = [];
  lastSynced: number;
  preferred_currency = '';

  constructor(
    private fbmanagerService: FbmanagerService,
    private metricsService: MetricsService) {
  }

  ngOnInit() {
    this.fbmanagerService.loginCheck();
    this.clearAdAccount();
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
        }
      })
  }

  // syncAdAccount(id: string) {
  //   this.clearAdAccount();
  //   this.metricsService.syncAdAccount(id)
  //     .then((result) => {
  //       this.info = 'Successfully synchronized!';
  //       this.getAdAccount(this.account_id);
  //     }, (error) => {
  //       this.error = error;
  //     })
  // }

  findLastSynced(scan_id: string) {
    return parseInt(scan_id.split('_')[0]) * 1000;
  }

  setCurrency(preferred_currency) {
    this.preferred_currency = preferred_currency;
  }

  initAdAccount(adAccount) {
    if (adAccount.campaigns.length > 0) {
      adAccount.campaigns.forEach((campaign) => {
        this.campaigns.push(campaign);
      });
      this.lastSynced = this.findLastSynced(this.campaigns[0].scan_id);
      this.setCurrency(this.campaigns[0].currency.user_currency);
    }
  }

  clearAdAccount() {
    this.campaigns = [];
  }
}
