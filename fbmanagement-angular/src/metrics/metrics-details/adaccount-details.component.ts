import { Component, ChangeDetectorRef, OnInit, HostBinding, trigger, transition, animate, style, state } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MetricsService } from '../metrics.service';
import { FbmanagerService } from '../../fbmanager.service';

@Component({
  selector: 'metrics-adaccount-details',
  templateUrl: 'adaccount-details.component.html'
})
export class AdAccountDetailsComponent implements OnInit {
  error: string;
  info: string;
  account_id: string;
  campaigns = [];
  adsets = [];
  ads = [];
  hasAdAccountDetails = false;
  lastSynced: number;
  preferred_currency = '';

  constructor(
    private fbmanagerService: FbmanagerService,
    private route: ActivatedRoute,
    private router: Router,
    private metricsService: MetricsService,
    private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.fbmanagerService.loginCheck();
    this.route.params.forEach((params: Params) => {
      let id = params['id'];
      this.account_id = id;
      this.getAdAccount(id);
    });
  }

  initAdAccount(adAccount) {
    if (!adAccount) {
      this.error = 'No data for this account!';
    } else {
      adAccount.campaigns.forEach((campaign) => {
        this.campaigns.push(campaign);
      });
      adAccount.adsets.forEach((adset)=>{
        this.adsets.push(adset);
      });
      adAccount.ads.forEach((ad)=>{
        this.ads.push(ad);
      });
      if(this.campaigns.length > 0){
        this.lastSynced = this.findLastSynced(this.campaigns[0].scan_id);
        this.setCurrency(this.campaigns[0].currency.user_currency);
        this.hasAdAccountDetails = true;
      }else{
        this.hasAdAccountDetails = false;
        this.error = 'No data for this account!';
      }
    }
  }

  clearAdAccount() {
    this.campaigns = [];
    this.adsets = [];
    this.ads = [];
  }

  syncAdAccount(id: string) {
    this.clearAdAccount();
    this.metricsService.syncAdAccount(id)
      .then((result) => {
        this.info = 'Successfully synchronized!';
        this.getAdAccount(this.account_id);
      }, (error) => {
        this.error = error;
      })
  }

  getAdAccount(id: string) {
    this.clearAdAccount();
    this.metricsService.getAdAccount(id)
      .then((adAccount) => {
        this.initAdAccount(adAccount);
      }, (error) => {
        this.error = error;
      })
  }

  findLastSynced(scan_id: string) {
    return parseInt(scan_id.split('_')[0]) * 1000;
  }

  setCurrency(preferred_currency) {
    this.preferred_currency = preferred_currency;
  }

  filterByCriteria(criteria: string) {
    var sortedData = [];
    this.ads = [];
    this.metricsService.getAdAccount(this.account_id)
      .then((adAccount) => {
        sortedData = adAccount.ads;
        switch (criteria) {
          case 'newest':
            this.ads = sortedData.sort((a, b) => {
              return new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
            });
            break;
          case 'oldest':
            this.ads = sortedData.sort((a, b) => {
              return new Date(a.created_time).getTime() - new Date(b.created_time).getTime();
            });
            break;
          case 'reset':
            this.ads = adAccount.ads;
            break;
          default:
            this.ads = sortedData.sort((a, b) => {
              return b[criteria] - a[criteria];
            });
        }
      }, (error) => {
        this.error = error;
      });
    this.ref.detectChanges();
  }

  filterByObjective(objective: string) {
    var filteredAds = [];
    this.info = '';
    this.clearAdAccount();
    this.metricsService.getAdAccount(this.account_id)
      .then((adAccount) => {
        this.initAdAccount(adAccount);
        this.ads.forEach((ad) => {
          if (ad.objective.toLowerCase() === objective) {
            filteredAds.push(ad);
          }
        });
        if (filteredAds.length === 0) {
          this.info = `No ads found with ${objective} objective`;
        } else {
          this.ads = filteredAds;
        }
      }, (error) => {
        this.error = error;
      })
  }
}
