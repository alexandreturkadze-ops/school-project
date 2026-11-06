import { Component, computed, effect, input, signal } from '@angular/core';
import { PhotoComponent } from './photo.component';
import { IconComponent } from './icon.component';

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 50;

/**
 * ზედა ნაწილის ფოტოების სლაიდერი: თავისით იცვლება, აქვს ისრები, წერტილები, პაუზა და გადასმა თითით.
 * ერთი ფოტოს შემთხვევაში მართვის ღილაკები არ ჩანს.
 */
@Component({
  selector: 'app-hero-slider',
  imports: [PhotoComponent, IconComponent],
  template: `
    @for (src of images(); track $index; let i = $index) {
      @if (shouldRender(i)) {
        <div class="slide" [class.on]="i === current()" [attr.aria-hidden]="i !== current()">
          <app-photo [src]="src" [alt]="i === current() ? alt() : ''" [eager]="true" [fallback]="fallback()" />
        </div>
      }
    } @empty {
      <div class="slide on"><app-photo [fallback]="fallback()" /></div>
    }

    @if (images().length > 1) {
      <div class="controls" role="group" aria-label="ფოტოების სლაიდერი"
        (mouseenter)="hovering.set(true)" (mouseleave)="hovering.set(false)">
        <button type="button" (click)="prev()" aria-label="წინა ფოტო"><app-icon name="left" [size]="18" /></button>
        <div class="dots">
          @for (src of images(); track $index; let i = $index) {
            <button type="button" class="dot" [class.on]="i === current()" (click)="go(i)"
              [attr.aria-label]="'ფოტო ' + (i + 1) + ' / ' + images().length" [attr.aria-current]="i === current() ? 'true' : null"></button>
          }
        </div>
        <button type="button" (click)="next()" aria-label="შემდეგი ფოტო"><app-icon name="right" [size]="18" /></button>
        <button type="button" (click)="paused.set(!paused())" [attr.aria-label]="paused() ? 'გაგრძელება' : 'პაუზა'" [title]="paused() ? 'გაგრძელება' : 'პაუზა'">
          <app-icon [name]="paused() ? 'play' : 'pause'" [size]="16" />
        </button>
      </div>
    }`,
  styles: [`
    /* z-index-ის გარეშე: ფოტოები ჩრდილის ქვემოთ რჩება, ღილაკები კი ტექსტის ზემოთ */
    :host{position:absolute;inset:0;display:block}
    .slide{position:absolute;inset:0;opacity:0;transition:opacity 1s ease}
    .slide.on{opacity:1;animation:settle 14s ease-out both}
    @keyframes settle{from{transform:scale(1.08)}}
    .controls{position:absolute;z-index:3;bottom:16px;right:max(16px,calc((100% - 1240px) / 2 + 16px));
      display:flex;align-items:center;gap:4px;padding:4px;border-radius:99px;color:#fff;
      background:rgba(10,16,30,.55);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
    button{display:grid;place-items:center;border:0;background:none;color:inherit;padding:0;cursor:pointer}
    .controls>button{width:34px;height:34px;border-radius:50%;transition:background .15s}
    .controls>button:hover{background:rgba(255,255,255,.18)}
    .dots{display:flex;align-items:center;padding:0 2px}
    .dot{width:20px;height:34px}
    .dot::before{content:'';width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.45);transition:background .2s,transform .2s}
    .dot:hover::before{background:rgba(255,255,255,.8)}
    .dot.on::before{background:#fff;transform:scale(1.3)}
    button:focus-visible{outline:2px solid #fff;outline-offset:1px}
    @media (max-width:860px){.controls{right:auto;left:50%;transform:translateX(-50%);bottom:12px}}
    @media (prefers-reduced-motion:reduce){.slide{transition:none}.slide.on{animation:none}}
  `],
})
export class HeroSliderComponent {
  readonly images = input<string[]>([]);
  readonly alt = input('');
  readonly fallback = input('');

  /** მოძრაობის შემცირების პარამეტრის მქონე მომხმარებლისთვის სლაიდერი თავიდან გაჩერებულია */
  readonly paused = signal(matchMedia('(prefers-reduced-motion: reduce)').matches);
  readonly hovering = signal(false);

  private readonly index = signal(0);
  readonly current = computed(() => this.images().length ? this.index() % this.images().length : 0);
  /** უკვე ნანახი ფოტოები რჩება გვერდზე, რომ გადასვლისას რბილად გაქრეს */
  private readonly seen = signal(new Set<number>());
  private touchX = 0;
  private touchY = 0;

  constructor() {
    // სხვა პროექტზე გადასვლისას სლაიდერი თავიდან იწყება
    effect(() => { this.images(); this.index.set(0); this.seen.set(new Set()); });

    effect(onCleanup => {
      this.current();
      if (this.paused() || this.hovering() || this.images().length < 2) return;
      const timer = setTimeout(() => this.next(), AUTOPLAY_MS);
      onCleanup(() => clearTimeout(timer));
    });
  }

  /** მხოლოდ ნანახი და შემდეგი ფოტო იტვირთება */
  shouldRender(i: number) {
    const n = this.images().length, c = this.current();
    return i === c || i === (c + 1) % n || this.seen().has(i);
  }

  go(i: number) {
    this.seen.update(s => new Set(s).add(this.current()));
    this.index.set(i);
  }
  next() { this.go((this.current() + 1) % this.images().length); }
  prev() { this.go((this.current() - 1 + this.images().length) % this.images().length); }

  touchStart(e: TouchEvent) {
    this.touchX = e.changedTouches[0].clientX;
    this.touchY = e.changedTouches[0].clientY;
  }
  touchEnd(e: TouchEvent) {
    if (this.images().length < 2) return;
    const dx = e.changedTouches[0].clientX - this.touchX;
    const dy = e.changedTouches[0].clientY - this.touchY;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) this.next(); else this.prev();
  }
}
