import { Component, Output, EventEmitter } from '@angular/core';

const template = require('./metrics-objective.filter.html');

@Component({
  selector: 'metrics-objective-filter',
  template: template
})


export class MetricsObjectiveFilter {
  @Output() sortBy = new EventEmitter<string>();

  sortByTrigger( inputString ) {
    let toEmit = inputString;
    this.sortBy.emit( toEmit );
  }
}
