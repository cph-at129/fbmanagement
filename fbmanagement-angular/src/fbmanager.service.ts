import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import { JwtService } from './jwt.service';
import { GlobalFunctions } from './common';
import { GlobalVariables } from './common';
import 'rxjs';
var api = require('./api-dev.json');

switch (GlobalVariables.ENVIRONMENT) {
  case 'prod':
    api = require('./api-prod.json');
  case 'prev':
    api = require('./api-prev.json');
  default:
    api = require('./api-dev.json');
}

var userCache;

@Injectable()
export class FbmanagerService {

  static API = api;
  jwt: string;
  decodedJwt: string;

  constructor(
    private router: Router,
    private authHttp: AuthHttp,
    private jwtService: JwtService) {
    this.loginCheck();
  }

  getUser(): Promise<any> {
    if (userCache) {
      return Promise.resolve(userCache);
    } else {
      return this.authHttp.get(api.user_info)
        .toPromise()
        .then(GlobalFunctions.extractData)
        .then((user) => {
          if (user) {
            userCache = user;
            return user;
          }else{
            return null;
          }
        })
        .catch(GlobalFunctions.handleError);
    }
  }



  loginCheck() {
    this.jwt = localStorage.getItem('id_token');
    this.decodedJwt = this.jwtService.decodeToken(this.jwt);
  }

  logout() {
    localStorage.removeItem('id_token');
    this.router.navigate(['login']);
  }
}
