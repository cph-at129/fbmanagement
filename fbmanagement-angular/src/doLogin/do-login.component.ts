import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Jsonp, URLSearchParams, Http, Request, RequestOptions, Headers } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { ActivatedRoute } from '@angular/router';

const template = require('./do-login.component.html');

@Component({
  selector: 'doLogin',
  template: template
})

export class DoLoginComponent implements OnInit {

  private sub: any;

  constructor(public router: Router, public http: Http, public jsonp: Jsonp, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      var token = params['token'];
      this.login(token);
    });
  }

  login(token) {
    localStorage.setItem('id_token', token);
    this.router.navigate(['dashboard']);
  }
}
