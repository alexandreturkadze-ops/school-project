import { Component, ElementRef, Input, OnChanges, inject } from '@angular/core';
import { ICONS, IconName } from '../core/icons';

/** Lucide ხატულა: <app-icon name="users" [size]="20" /> */
@Component({
  selector: 'app-icon',
  template: '',
  styles: [':host{display:inline-flex;line-height:0;flex:none} :host ::ng-deep svg{display:block}'],
})
export class IconComponent implements OnChanges {
  @Input({ required: true }) name!: IconName;
  @Input() size = 20;
  @Input() stroke = 2;
  private el = inject(ElementRef<HTMLElement>);

  ngOnChanges() {
    const node = ICONS[this.name];
    const host = this.el.nativeElement as HTMLElement;
    host.innerHTML = '';
    if (!node) return;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    const attrs = { ...(node[1] as Record<string, string | number>), width: this.size, height: this.size, 'stroke-width': this.stroke };
    for (const [k, v] of Object.entries(attrs)) svg.setAttribute(k, String(v));
    svg.setAttribute('aria-hidden', 'true');
    for (const [tag, a] of node[2] as [string, Record<string, string>][]) {
      const child = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(a)) child.setAttribute(k, v);
      svg.appendChild(child);
    }
    host.appendChild(svg);
  }
}
