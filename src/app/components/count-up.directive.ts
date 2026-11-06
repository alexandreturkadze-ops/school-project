import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

/** რიცხვის ანიმაციური ზრდა, როცა ელემენტი ეკრანზე ჩანს */
@Directive({ selector: '[countUp]' })
export class CountUpDirective implements OnChanges {
  @Input('countUp') target = 0;
  @Input() decimals = 0;
  private done = false;
  constructor(private el: ElementRef<HTMLElement>) {}
  ngOnChanges() {
    const el = this.el.nativeElement;
    if (this.done || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = this.target.toFixed(this.decimals);
      return;
    }
    el.textContent = this.target.toFixed(this.decimals);
    const io = new IntersectionObserver(e => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      this.done = true;
      const start = performance.now(), dur = 1100;
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (this.target * eased).toFixed(this.decimals);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    io.observe(el);
  }
}
