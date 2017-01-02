import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FbmanagerService } from '../../fbmanager.service';
import { MetricsService } from '../metrics.service';

@Component({
  selector: 'page-details',
  templateUrl: 'page-details.component.html'
})
export class PageDetailsComponent implements OnInit {

  page_id: string;
  page = [];
  error: string;
  info: string;
  synchronizing = false;

  constructor(
    private fbmanagerService: FbmanagerService,
    private metricsService: MetricsService,
    private route: ActivatedRoute,
    private router: Router,) {
  }

  ngOnInit() {
    this.fbmanagerService.loginCheck();
    this.route.params.forEach((params: Params) => {
      this.page_id = params['id'];
      this.getPage(this.page_id);
    });
  }

  syncPage(id: string) {
    this.synchronizing = true;
    this.metricsService.syncPage(id)
      .then((result) => {
        this.info = 'Page synchronized succesfully!';
        this.synchronizing = false;
        this.getPage(this.page_id);
      }, (error) => {
        this.error = error;
      })
  }

  getPage(id: string) {
    this.metricsService.getPage(id)
      .then((page) => {
        this.page = page;
      }, (error) => {
        this.error = error;
      })
  }
}
