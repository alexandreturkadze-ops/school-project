import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { fileToDataUrl } from '../core/store.service';
import { IconComponent } from './icon.component';

/** ფოტოს ველი: ინტერნეტის ბმული ან ფაილის ატვირთვა, გადახედვით */
@Component({
  selector: 'app-image-field',
  imports: [FormsModule, IconComponent],
  template: `
    <div class="img-field">
      <div class="preview" [class.empty]="!value" [class.contain]="logo">
        @if (value) { <img [src]="value" alt="" (error)="broken.set(true)" (load)="broken.set(false)" /> }
        @else { <app-icon name="image" [size]="26" [stroke]="1.5" /> }
        @if (value && broken()) { <span class="bad"><app-icon name="warn" [size]="14" /> ვერ ჩაიტვირთა</span> }
      </div>
      <div class="controls">
        <label class="lbl" [for]="fid + '-url'">{{ label }}</label>
        <input [id]="fid + '-url'" type="url" placeholder="https://… ფოტოს ბმული"
          [ngModel]="value.startsWith('data:') ? '' : value" (ngModelChange)="valueChange.emit($event)" />
        <div class="row">
          <label class="btn sm"><app-icon name="upload" [size]="15" /> ატვირთვა
            <input type="file" accept="image/*" hidden (change)="upload($event)" /></label>
          @if (value && clearable) { <button type="button" class="btn sm danger" (click)="valueChange.emit('')"><app-icon name="trash" [size]="15" /> წაშლა</button> }
          @if (value.startsWith('data:')) { <span class="hint">ატვირთული ფაილი</span> }
          @if (busy()) { <span class="hint">მუშავდება…</span> }
        </div>
      </div>
    </div>`,
  styles: [`
    .img-field{display:grid;grid-template-columns:120px minmax(0,1fr);gap:14px;align-items:start}
    .preview{position:relative;height:84px;border-radius:10px;overflow:hidden;background:var(--soft);display:grid;place-items:center;color:var(--muted)}
    .preview img{width:100%;height:100%;object-fit:cover}
    .preview.contain img{object-fit:contain}
    .bad{position:absolute;inset:auto 0 0 0;background:#B91C1C;color:#fff;font-size:.7rem;padding:3px 6px;display:flex;gap:4px;align-items:center}
    .controls{display:grid;gap:8px;min-width:0}
    .lbl{font-size:.82rem;font-weight:600;color:var(--muted)}
    input[type=url]{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);min-width:0}
    .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
    .hint{font-size:.78rem;color:var(--muted)}
    @media (max-width:480px){.img-field{grid-template-columns:minmax(0,1fr)}.preview{height:140px}}
  `],
})
export class ImageFieldComponent {
  @Input() value = '';
  @Input() label = 'ფოტო';
  /** ლოგოს რეჟიმი: პატარა ზომა, გამჭვირვალე ფონი, ფოტო არ იჭრება */
  @Input() logo = false;
  /** წაშლის ღილაკი (სლაიდერის სიას საკუთარი აქვს) */
  @Input() clearable = true;
  @Output() valueChange = new EventEmitter<string>();
  readonly fid = 'img' + Math.random().toString(36).slice(2, 8);
  readonly broken = signal(false);
  readonly busy = signal(false);

  async upload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.busy.set(true);
    try { this.valueChange.emit(await (this.logo ? fileToDataUrl(file, 256, 'image/png') : fileToDataUrl(file))); } finally { this.busy.set(false); input.value = ''; }
  }
}
