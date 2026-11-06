import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header.component';
import { StoreService } from './core/store.service';
import { IconComponent } from './components/icon.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, IconComponent],
  template: `
    <div class="progress" [style.transform]="'scaleX(' + progress() + ')'"></div>
    <app-header />
    <router-outlet />
    @if (progress() > 0.08) {
      <button class="to-top" (click)="top()" aria-label="თავში დაბრუნება"><app-icon name="up" [size]="20" /></button>
    }
    @if (store.saveError()) {
      <div class="toast" role="alert"><app-icon name="warn" [size]="18" />{{ store.saveError() }}</div>
    }
  `,
  styles: [`
    .progress{position:fixed;z-index:70;top:0;left:0;right:0;height:3px;transform-origin:0 50%;
      background:linear-gradient(90deg,var(--c1),var(--c2),var(--c3),var(--c4),var(--c5));pointer-events:none}
    .to-top{position:fixed;z-index:50;right:max(18px,env(safe-area-inset-right,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));
      width:48px;height:48px;border-radius:14px;border:0;display:grid;place-items:center;color:#fff;background:var(--brand);
      box-shadow:0 12px 26px -10px var(--brand);animation:in .25s ease-out;transition:transform .2s}
    .to-top:hover{transform:translateY(-3px)}
    @keyframes in{from{opacity:0;transform:translateY(10px)}}
    .toast{position:fixed;z-index:100;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom,0px));
      max-width:calc(100% - 32px);display:flex;gap:10px;align-items:center;padding:12px 16px;border-radius:12px;
      background:#7F1D1D;color:#fff;font-size:.9rem;box-shadow:0 12px 30px -10px rgba(0,0,0,.4)}
  `],
})
export class App {
  store = inject(StoreService);
  readonly progress = signal(0);

  @HostListener('window:scroll')
  onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    this.progress.set(max > 0 ? Math.min(1, scrollY / max) : 0);
  }
  top() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
