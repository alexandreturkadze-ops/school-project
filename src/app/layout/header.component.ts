import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { StoreService } from '../core/store.service';
import { IconComponent } from '../components/icon.component';
import { LogoComponent } from '../components/logo.component';

/** ზედა მენიუ: პროექტების სია, ახალი პროექტი, ადმინ პანელი */
@Component({
  selector: 'app-header',
  imports: [RouterLink, IconComponent, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  store = inject(StoreService);
  private router = inject(Router);

  readonly url = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url },
  );
  readonly currentId = computed(() => /\/p\/([^/?#]+)/.exec(this.url())?.[1] ?? '');
  readonly current = computed(() => this.store.projects().find(p => p.id === this.currentId()));
  readonly onAdmin = computed(() => this.url().startsWith('/admin'));

  readonly menuOpen = signal(false);
  readonly drawerOpen = signal(false);
  readonly scrolled = signal(false);

  // გვერდის შეცვლისას მენიუები იხურება
  private closeOnNav = effect(() => { this.url(); this.menuOpen.set(false); this.drawerOpen.set(false); });

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 40); }

  @HostListener('document:keydown.escape')
  close() { this.menuOpen.set(false); this.drawerOpen.set(false); }

  @HostListener('document:click', ['$event'])
  outside(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('.projects-menu')) this.menuOpen.set(false);
  }

  thumb(hero: string, id: string) {
    return hero || (id === 'school' ? this.store.photos()['hero'] : '');
  }
}
