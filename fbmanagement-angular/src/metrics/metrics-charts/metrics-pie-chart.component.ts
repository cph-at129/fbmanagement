import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'metrics-pie-chart',
  templateUrl: './metrics-pie-chart.component.html'
})
export class MetricsPieChartComponent implements OnInit {

  @Input('adData') adData: any;

  public pieChartLabels: string[] = [];
  public pieChartData: number[] = [];
  public pieChartType: string = 'pie';

  constructor() { }

  ngOnInit() {
    this.setChartData(this.adData);
    console.log(this.adData);
  }

  setChartData(data) {
    if (data) {
      for (var i = 0; i < data.length; i++) {
        this.pieChartLabels.push('Ad ' + (i+1));
        this.pieChartData.push(data[i].reach);
      }
    }
  }

  public chartClicked(e: any): void { }
  public chartHovered(e: any): void { }

}
