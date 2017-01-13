import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { FbmanagerService } from '../../fbmanager.service';
import { MetricsService } from '../metrics.service';

var insights_tooltips = require('./insights-tooltips.json');

@Component({
  selector: 'metrics-adsets',
  templateUrl: 'adsets.component.html',
  styles: [
    `table th {
      text-align: center;
    }`
  ]
})
export class AdsetsComponent implements OnInit {
  // campaign_insights_tooltips = insights_tooltips.campaign;

  @Input('adsets') adsetsInput;
  @Output() onFilter = new EventEmitter<boolean>();
  adsets = [];
  preferred_currency = '';

  constructor(private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.adsets = this.adsetsInput;
  }

  filterByCriteria(criteria: string) {
    var sortedData = [];
    this.adsets = [];
    this.ref.detectChanges();
    sortedData = this.adsetsInput;
    switch (criteria) {
      case 'newest':
        this.adsets = sortedData.sort((a, b) => {
          return new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
        });
        break;
      case 'oldest':
        this.adsets = sortedData.sort((a, b) => {
          return new Date(a.created_time).getTime() - new Date(b.created_time).getTime();
        });
        break;
      case 'reset':
        this.adsets = this.adsetsInput;
        break;
      default:
        this.adsets = sortedData.sort((a, b) => {
          return b[criteria] - a[criteria];
        });
    }
    this.onFilter.emit(true);
    this.ref.detectChanges();
  }

  filterByObjective(objective: string) {
    var filteredAdsets = [];
    var emptyArray = this.adsetsInput.length === 0;
    if (objective === 'all') {
      filteredAdsets = this.adsetsInput;
    } else {
      if (!emptyArray) {
        this.adsetsInput.forEach((ad) => {
          var adObjective = ad.objective;
          if (adObjective) {
            if (adObjective.toLowerCase() === objective) {
              filteredAdsets.push(ad);
            }
          }
        });
      } else {
        filteredAdsets = this.adsetsInput;
      }
    }

    this.adsets = filteredAdsets;
    this.onFilter.emit(true);
    this.ref.detectChanges();
  }

  setCurrency(preferred_currency) {
    this.preferred_currency = preferred_currency;
  }
}
