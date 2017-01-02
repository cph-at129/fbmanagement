import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'metrics-bar-chart',
  templateUrl: './metrics-bar-chart.component.html'
})

export class MetricsBarChartComponent implements OnInit {

  @Input('adData') adData: any;

  public barChartData: Array<any> = [
    {
      data: [],
      label: 'reach'
    },
    {
      data: [],
      label: 'impressions'
    }
  ];
  public barChartLabels: Array<any> = [];
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLegend: boolean = true;
  public barChartType: string = 'bar';

  constructor(
  ) { }

  ngOnInit() {
    this.setChartData(this.adData);
  }

  setChartData(data) {
    if (data) {
      for (var i = 0; i < data.length; i++) {
        this.barChartData[0].data.push(data[i].reach);
        this.barChartData[1].data.push(data[i].impressions);
        this.barChartLabels.push('Ad ' + (i + 1));
      }
    }else{
      console.log('Waiting for Ads...');
    }

  }

  public chartClicked(e: any): void { }
  public chartHovered(e: any): void { }

}
