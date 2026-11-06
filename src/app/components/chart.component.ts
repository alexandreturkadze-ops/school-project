import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);
Chart.defaults.font.family = "'Noto Sans Georgian', system-ui, sans-serif";
Chart.defaults.color = '#5A6475';
Chart.defaults.plugins.tooltip.backgroundColor = '#0F1B2D';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.legend.labels.usePointStyle = true;

/** Chart.js დიაგრამა. იხატება, როცა ეკრანზე გამოჩნდება, და ახლდება მონაცემის შეცვლისას. */
@Component({
  selector: 'app-chart',
  template: `<div class="chart-wrap" [style.height.px]="height"><canvas #canvas role="img" [attr.aria-label]="label"></canvas></div>`,
  styles: [`.chart-wrap{position:relative;width:100%;min-width:0}`],
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) config!: ChartConfiguration<any>;
  @Input() height = 320;
  @Input() label = 'დიაგრამა';
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private io?: IntersectionObserver;
  private visible = false;

  ngAfterViewInit() {
    this.io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        this.visible = true;
        this.draw();
        this.io?.disconnect();
      }
    }, { threshold: 0.1 });
    this.io.observe(this.canvas.nativeElement);
  }

  ngOnChanges() { if (this.visible) this.draw(); }

  private draw() {
    this.chart?.destroy();
    this.chart = new Chart(this.canvas.nativeElement, this.config);
  }

  ngOnDestroy() { this.io?.disconnect(); this.chart?.destroy(); }
}
