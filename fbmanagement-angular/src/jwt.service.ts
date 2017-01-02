import { Injectable } from '@angular/core';
import { JwtHelper } from 'angular2-jwt';
import { Router } from '@angular/router';

@Injectable()
export class JwtService {
  token: any;

  constructor(
    public router: Router) {
  }

  decodeToken(inputToken) {
    const jwtHelper = new JwtHelper();
    if (!inputToken) {
      this.router.navigate(['login']);
    }
    return jwtHelper.decodeToken(inputToken);
  }
}
