import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { FbmanagerService } from '../../fbmanager.service';
import { MetricsService } from '../metrics.service';

var insights_tooltips = require('./insights-tooltips.json');

@Component({
  selector: 'metrics-campaigns',
  templateUrl: 'campaigns.component.html'
})
export class CampaignsComponent implements OnInit {
  // campaign_insights_tooltips = insights_tooltips.campaign;


  @Input('campaigns') campaignsInput;
  @Output() onFilter = new EventEmitter<boolean>();
  campaigns = [];
  preferred_currency = '';

  constructor(private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.campaigns = this.campaignsInput;
  }

  filterByCriteria(criteria: string) {
    var sortedData = [];
    this.campaigns = [];
    this.ref.detectChanges();
    sortedData = this.campaignsInput;
    switch (criteria) {
      case 'newest':
        this.campaigns = sortedData.sort((a, b) => {
          return new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
        });
        break;
      case 'oldest':
        this.campaigns = sortedData.sort((a, b) => {
          return new Date(a.created_time).getTime() - new Date(b.created_time).getTime();
        });
        break;
      case 'reset':
        this.campaigns = this.campaignsInput;
        break;
      default:
        this.campaigns = sortedData.sort((a, b) => {
          return b[criteria] - a[criteria];
        });
    }
    this.onFilter.emit(true);
    this.ref.detectChanges();
  }

  filterByObjective(objective: string) {
    var filteredCampaigns = [];
    var emptyArray = this.campaignsInput.length === 0;
    if (objective === 'all') {
      filteredCampaigns = this.campaignsInput;
    } else {
      if (!emptyArray) {
        this.campaignsInput.forEach((ad) => {
          var adObjective = ad.objective;
          if (adObjective) {
            if (adObjective.toLowerCase() === objective) {
              filteredCampaigns.push(ad);
            }
          }
        });
      } else {
        filteredCampaigns = this.campaignsInput;
      }
    }

    this.campaigns = filteredCampaigns;
    this.onFilter.emit(true);
    this.ref.detectChanges();
  }

  setCurrency(preferred_currency) {
    this.preferred_currency = preferred_currency;
  }
}
