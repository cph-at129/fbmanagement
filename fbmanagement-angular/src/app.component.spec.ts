import { async, ComponentFixture, TestBed
} from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { NO_ERRORS_SCHEMA }          from '@angular/core';
import { Component }                 from '@angular/core';
import { AppComponent }              from './app.component';
import { RouterLinkStubDirective }   from '../testing';
import { RouterOutletStubComponent } from '../testing';

@Component({selector: 'app-welcome', template: ''})
  class WelcomeStubComponent {}

let comp:    AppComponent;
let fixture: ComponentFixture<AppComponent>;

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        WelcomeStubComponent,
        RouterLinkStubDirective, RouterOutletStubComponent
      ]
    })

    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(AppComponent);
      comp    = fixture.componentInstance;
    });
  }));
  tests();
});

  //////// Testing w/ real root module //////
// Tricky because we are disabling the router and its configuration
// Better to use RouterTestingModule
import { AppModule }    from './app.module';
import { routes as AppRoutingModule } from './app.routes';

describe('AppComponent & AppModule', () => {

  beforeEach( async(() => {

    TestBed.configureTestingModule({
      imports: [ AppModule ]
    })

    // Get rid of app's Router configuration otherwise many failures.
    // Doing so removes Router declarations; add the Router stubs
    .overrideModule(AppModule, {
      remove: {
        imports: [ AppRoutingModule ]
      },
      add: {
        declarations: [ RouterLinkStubDirective, RouterOutletStubComponent ]
      }
    })

    .compileComponents()

    .then(() => {
      fixture = TestBed.createComponent(AppComponent);
      comp    = fixture.componentInstance;
    });
  }));

  tests();
});

function tests() {
  let links: RouterLinkStubDirective[];
  let linkDes: DebugElement[];

  beforeEach(() => {
    // trigger initial data binding
    fixture.detectChanges();
  });

  it('can instantiate it', () => {
    expect(comp).not.toBeNull();
  });
}
