import { Component } from '@angular/core';
import { Router } from '@angular/router';

const template = require('./navigation.html');

@Component({
  selector: 'navigation',
  template: template
})

export class Navigation {
  isLoggedIn: any;

  constructor(public router: Router) {
    this.isLoggedIn = localStorage.getItem('id_token');
  }

  logout() {
    localStorage.removeItem('id_token');
    this.router.navigate(['login']);
  }
}
