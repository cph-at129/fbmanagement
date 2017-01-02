// import {
//   async, ComponentFixture, fakeAsync, inject, TestBed, tick
// } from '@angular/core/testing';

// import { By }           from '@angular/platform-browser';
// import { DebugElement } from '@angular/core';

// import { addMatchers, newEvent, Router, RouterStub } from '../../testing';
// import { METRICS, FakeMetricsService } from '../../testing/fake-metrics.service.ts';
// import { MetricsService }   from './metrics.service';

// import { AdInsightMetrics }    from './ad-insight-metrics';
// import { AdsetInsightMetrics }    from './adset-insight-metrics';
// import { CampaignInsightMetrics }    from './campaign-insight-metrics';
// import { DashboardMetricsComponent } from './dashboard-metrics.component';
// import { Navigation } from '../common/navigation';
// import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';

// let comp: DashboardMetricsComponent;
// let fixture: ComponentFixture<DashboardMetricsComponent>;
// let page: Page;

// describe('DashboardMetricsComponent', () => {

//   beforeEach( async(() => {
//     addMatchers();
//     TestBed.configureTestingModule({
//       imports: [
//         Ng2BootstrapModule
//       ],
//       declarations: [
//         Navigation,
//         DashboardMetricsComponent
//       ],
//       providers: [
//         { provide: MetricsService, useClass: FakeMetricsService },
//         { provide: Router,         useClass: RouterStub}
//       ]
//     })
//     .compileComponents()
//     .then(createComponent);
//   }));

//   it('should display metrics', () => {
//     console.log('page.campaignPanels.length', page.campaignPanels.length);
//     expect(page.campaignPanels.length).toBeGreaterThan(0);
//   });
// });

// function createComponent() {
//   fixture = TestBed.createComponent(DashboardMetricsComponent);
//   comp = fixture.componentInstance;

//   fixture.detectChanges();

//   return fixture.whenStable().then(() => {
//     fixture.detectChanges();
//     page = new Page();
//   });
// }

// class Page {
//   /** Hero line elements */
//   campaignPanels: HTMLLIElement[];

//   /** Spy on router navigate method */
//   navSpy: jasmine.Spy;

//   constructor() {
//     this.campaignPanels    = fixture.debugElement.queryAll(By.css('.campaignPanel')).map(de => de.nativeElement);
//     const router = fixture.debugElement.injector.get(Router);
//     this.navSpy = spyOn(router, 'navigate');
//   };
// }

