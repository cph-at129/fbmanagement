import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FbmanagerService } from '../../fbmanager.service';
import { MetricsService } from '../metrics.service';

@Component({
  selector: 'post-details',
  templateUrl: 'post-details.component.html'
})
export class PostDetailsComponent implements OnInit {

  post_id: string;
  post = [];
  error: string;
  info: string;

  constructor(
    private fbmanagerService: FbmanagerService,
    private metricsService: MetricsService,
    private route: ActivatedRoute,
    private router: Router,) {
  }

  ngOnInit() {
    this.fbmanagerService.loginCheck();
    this.route.params.forEach((params: Params) => {
      this.post_id = params['id'];
      this.getPost(this.post_id);
    });
  }

  getPost(id: string) {
    this.metricsService.getPostDetails(id)
      .then((post) => {
        this.post = post;
      }, (error) => {
        this.error = error;
      })
  }
}
