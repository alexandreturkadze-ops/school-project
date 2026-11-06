import { Component, Input, OnChanges } from '@angular/core';

/** ფოტო. თუ არ ჩაიტვირთა ან მისამართი ცარიელია, ჩანს ფერადი ფონი. */
@Component({
  selector: 'app-photo',
  template: `
    <figure class="photo" [style.background]="fallback">
      @if (src && !failed) {
        <img [src]="src" [alt]="alt" [attr.loading]="eager ? 'eager' : 'lazy'" (error)="failed = true" />
      }
      @if (caption) { <figcaption>{{ caption }}</figcaption> }
    </figure>`,
  styles: [`
    :host{display:block;height:100%}
    .photo{margin:0;position:relative;height:100%;min-height:inherit;border-radius:inherit;overflow:hidden}
    img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .9s cubic-bezier(.2,.7,.2,1)}
    :host(.zoom) .photo:hover img{transform:scale(1.05)}
    figcaption{position:absolute;left:0;right:0;bottom:0;padding:36px 16px 14px;color:#fff;font-weight:600;font-size:.95rem;
      background:linear-gradient(transparent,rgba(8,14,26,.8))}
  `],
})
export class PhotoComponent implements OnChanges {
  @Input() src = '';
  @Input() alt = '';
  @Input() caption = '';
  @Input() eager = false;
  @Input() fallback = 'linear-gradient(135deg,#1E3A5F,#0F1B2D)';
  failed = false;
  ngOnChanges() { this.failed = false; }
}
