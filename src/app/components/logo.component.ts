import { Component, Input, computed, inject, signal } from '@angular/core';
import { StoreService } from '../core/store.service';
import { IconComponent } from './icon.component';

/** სკოლის ლოგო (ზედა მენიუ და ქვედა ნაწილი). თუ ფოტო არ არის ან ვერ ჩაიტვირთა, ჩანს ხატულა */
@Component({
  selector: 'app-logo',
  imports: [IconComponent],
  host: {
    '[class.custom]': 'show()',
    '[style.width.px]': 'size',
    '[style.height.px]': 'size',
    '[style.border-radius.px]': 'size * 0.28',
  },
  template: `
    @if (show()) { <img [src]="src()" alt="" (error)="failed.set(src())" /> }
    @else { <app-icon name="school" [size]="20" /> }`,
  styles: [`
    :host{display:grid;place-items:center;flex:none;overflow:hidden;background:var(--brand);color:#fff}
    :host(.custom){background:#fff}
    img{width:100%;height:100%;object-fit:contain;display:block}
  `],
})
export class LogoComponent {
  private store = inject(StoreService);
  @Input() size = 36;
  readonly src = computed(() => this.store.state().logo);
  /** ბმული, რომელიც ვერ ჩაიტვირთა (ახალი ბმულის ჩასმისას ისევ ვცდით) */
  readonly failed = signal('');
  readonly show = computed(() => !!this.src() && this.src() !== this.failed());
}
