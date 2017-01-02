import { Component } from '@angular/core';
import { FbmanagerService } from '../fbmanager.service';

const styles   = require('./login.component.css');
const template = require('./login.component.html');

var api = require('../api-dev.json');

@Component({
  selector: 'login',
  template: template,
  styles: [ styles ]
})
export class LoginComponent {
  LOGIN_URL = FbmanagerService.API.login;
  constructor() {
  }
}
