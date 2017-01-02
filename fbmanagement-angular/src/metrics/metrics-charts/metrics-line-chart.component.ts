import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'metrics-line-chart',
  templateUrl: './metrics-line-chart.component.html'
})
export class MetricsLineChartComponent implements OnInit {

  @Input('adData') adData: any;

  public lineChartData: Array<any> = [{
    data: [], label: 'Ad watched video length percentage'
  }];
  public lineChartLabels: Array<any> = ['25 %', '75 %', '95 %'];
  public lineChartOptions: any = {
    animation: false,
    responsive: true
  };
  public lineChartColors: Array<any> = [
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  constructor(
  ) { }

  ngOnInit() {
    this.setChartData(this.adData);
    console.log(this.adData);
  }

  setChartData(data) {
    if (data) {
      console.log('All good!');
      for (var i = 0; i < data.length; i++) {
        if('video_p25_watched_actions_video_view' in data[i]){
          this.lineChartData[0].data.push(
            data[i]['video_p25_watched_actions_video_view'],
            data[i]['video_p75_watched_actions_video_view'],
            data[i]['video_p95_watched_actions_video_view']
          );
          console.log('After pushing', this.lineChartData[0].data.length);
        }
      }
    }
  }

  public chartClicked(e: any): void { }
  public chartHovered(e: any): void { }

}
