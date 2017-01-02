import { Component, Output, EventEmitter } from '@angular/core';

const template = require('./metrics-criteria.filter.html');

@Component({
  selector: 'metrics-criteria-filter',
  template: template
})


export class MetricsCriteriaFilter {
  @Output() sortBy = new EventEmitter<string>();

  sortByTrigger( inputString ) {
    let toEmit = inputString;
    this.sortBy.emit( toEmit );
  }
}
