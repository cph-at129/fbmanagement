import { Response } from '@angular/http';

export class GlobalFunctions {

  static extractData(res: Response) {
    let body = res.json();
    return body || {};
  }

  static handleError(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';

    console.error(error); // log to console instead
    return Promise.reject(errMsg);
  }
}
