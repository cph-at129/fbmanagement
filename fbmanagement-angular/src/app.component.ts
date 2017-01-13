import { Component } from '@angular/core';

const template = require('./app.component.html');

@Component({
  selector: 'auth-app',
  template: template,
  styles: [
    `.shadow {
      -moz-box-shadow:    3px 3px 5px 6px #ccc;
      -webkit-box-shadow: 3px 3px 5px 6px #ccc;
      box-shadow:         3px 3px 5px 6px #ccc;
}`
  ]
})

export class AppComponent {

  constructor() {
  }
}
