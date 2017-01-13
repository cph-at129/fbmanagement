import { Injectable } from '@angular/core';
import { AuthHttp } from 'angular2-jwt';
import { FbmanagerService } from '../fbmanager.service';
import { GlobalFunctions } from '../common';
import 'rxjs';

var adAccountsCache = [];
var pagesMetricsCache = null;

@Injectable()
export class MetricsService {
  API = FbmanagerService.API;
  constructor(
    private fbmanagerService: FbmanagerService,
    private authHttp: AuthHttp,
  ) {
    this.fbmanagerService.loginCheck();
  }

  getPostDetails(id: string): Promise<any> {
    return this.authHttp.get(this.API.post_details + id)
      .toPromise()
      .then(GlobalFunctions.extractData)
      .catch(GlobalFunctions.handleError);
  }

  getPageDetails(id: string): Promise<any> {
    if (pagesMetricsCache) {
      var page;
      pagesMetricsCache.pages.forEach(function (item) {
        if (item.page_id === id) page = item; return;
      });
      return Promise.resolve(page);
    }
    return this.authHttp.get(this.API.page_details + id)
      .toPromise()
      .then(GlobalFunctions.extractData)
      .catch(GlobalFunctions.handleError);
  }

  getAdAccount(id: string): Promise<any> {
    if (adAccountsCache.length > 0) {
      return this._getAdAccountCached(id);
    } else {
      return this._getAdAccountFromServer(id);
    }
  }

  _getAdAccountCached(id: string) {
    var adAccountCache;
    adAccountsCache.forEach((adAccount) => {
      if (adAccount.id === id) {
        adAccountCache = adAccount;
      }
    });
    if (!adAccountCache) {
      adAccountsCache = [];
      return this._getAdAccountFromServer(id);
    } else {
      return Promise.resolve(adAccountCache);
    }
  }

  _getAdAccountFromServer(id: string) {
    return this.authHttp.get(this.API.ad_account_details + id)
      .toPromise()
      .then(GlobalFunctions.extractData)
      .then((adAccount) => {
        if (adAccount.campaigns) {
          if (adAccount.campaigns.length > 0) {
            adAccount.id = id;
            adAccountsCache.push(adAccount);
          }
        }
        return adAccount;
      })
      .catch(GlobalFunctions.handleError);
  }

  syncAdAccount(id: string): Promise<any> {
    adAccountsCache = [];
    return this.authHttp.get(this.API.sync_ad_account + id)
      .toPromise()
      .then(GlobalFunctions.extractData)
      .then((adAccount) => {
        if (adAccount.campaigns) {
          if (adAccount.campaigns.length > 0) {
            adAccountsCache = adAccount;
          }
        }
        return adAccount;
      })
      .catch(GlobalFunctions.handleError);
  }

  syncAdAccountForDateRange(id: string, from: Date, until: Date): Promise<any> {
    return this.authHttp.get(this.API.sync_ad_account_for_date_range + id + '/' + from + '/' + until)
      .toPromise()
      .then(GlobalFunctions.extractData)
      .then((adAccount) => {
        return adAccount;
      })
      .catch(GlobalFunctions.handleError);
  }
  syncAdAccountForDateRangeType(id: string, dateRangeType: String): Promise<any> {
    return this.authHttp.get(this.API.sync_ad_account_for_date_range_type + id + '/' + dateRangeType)
      .toPromise()
      .then(GlobalFunctions.extractData)
      .then((adAccount) => {
        return adAccount;
      })
      .catch(GlobalFunctions.handleError);
  }

  syncPage(id: string): Promise<any> {
    return this.authHttp.get(this.API.sync_page + id)
      .toPromise()
      .then(GlobalFunctions.extractData)
      .catch(GlobalFunctions.handleError);
  }

  getPage(id: string): Promise<any> {
    return this.authHttp.get(this.API.page_details + id)
      .toPromise()
      .then(GlobalFunctions.extractData)
      .catch(GlobalFunctions.handleError);
  }
}
