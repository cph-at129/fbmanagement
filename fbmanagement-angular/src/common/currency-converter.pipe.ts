import { Pipe, PipeTransform } from '@angular/core';
import { Jsonp, URLSearchParams } from '@angular/http';
import { GlobalFunctions } from './global-functions';

@Pipe({
  name: 'currencyConverter'
})

export class CurrencyConverterPipe implements PipeTransform {

  constructor(private jsonp: Jsonp) { }

  transform(value: number, currency: string, currency_to_convert: string): Promise<string> {
    return this.exchangeCurrency(value, currency, currency_to_convert);
  }

  exchangeCurrency(value, currency, currency_to_convert): Promise<string> {
    let fixerUrl = 'http://api.fixer.io/latest';
    let params = new URLSearchParams();
    params.set('base', currency);
    params.set('format', 'json');
    params.set('callback', 'JSONP_CALLBACK');
    return this.jsonp
      .get(fixerUrl, { search: params })
      .toPromise()
      .then(GlobalFunctions.extractData)
      .then((data: any) => {
        var rates = data.rates;
        var result = currency_to_convert + '' + this.round10((value * rates[currency_to_convert]), -2);
        return result;
      })
      .catch(GlobalFunctions.handleError);
  }

  // Decimal round
  round10(value, exp) {
    return this.decimalAdjust('round', value, exp);
  }

  decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

}
