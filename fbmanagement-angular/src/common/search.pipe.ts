import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'search' })

export class SearchPipe implements PipeTransform {
  transform(metrics: any[], type: string, searchText) {
    switch (type) {
      case 'ad':
        return metrics.filter((ad) => {
          if (typeof searchText !== 'undefined') {
            return ad.name.toLowerCase().indexOf(searchText) !== -1;
          }
          return true;
        });
      case 'adset':
        return metrics.filter((adset) => {
          if (typeof searchText !== 'undefined') {
            return adset.toLowerCase().name.indexOf(searchText) !== -1;
          }
          return true;
        });
      case 'campaign':
        return metrics.filter((campaign) => {
          if (typeof searchText !== 'undefined') {
            return campaign.toLowerCase().name.indexOf(searchText) !== -1;
          }
          return true;
        });
    }
  }
}
