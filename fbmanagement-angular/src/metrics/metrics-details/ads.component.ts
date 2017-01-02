import { Component, ChangeDetectorRef, EventEmitter, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'metrics-ads',
  templateUrl: 'ads.component.html'
})

export class AdsComponent implements OnInit {

  @Input('ads') adsInput;
  @Output() onFilter = new EventEmitter<boolean>();
  ads = [];

  constructor(private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.ads = this.adsInput;
  }

  filterByCriteria(criteria: string) {
    var sortedData = [];
    this.ads = [];
    this.ref.detectChanges();
    sortedData = this.adsInput;
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
        this.ads = this.adsInput;
        break;
      default:
        this.ads = sortedData.sort((a, b) => {
          return b[criteria] - a[criteria];
        });
    }
    this.onFilter.emit(true);
    this.ref.detectChanges();
  }

  filterByObjective(objective: string) {
    var filteredAds = [];
    var emptyArray = this.adsInput.length === 0;
    if (objective === 'all') {
      filteredAds = this.adsInput;
    } else {
      if (!emptyArray) {
        this.adsInput.forEach((ad) => {
          var adObjective = ad.objective;
          if (adObjective) {
            if (adObjective.toLowerCase() === objective) {
              filteredAds.push(ad);
            }
          }
        });
      } else {
        filteredAds = this.adsInput;
      }
    }

    this.ads = filteredAds;
    this.onFilter.emit(true);
    this.ref.detectChanges();
  }
}
