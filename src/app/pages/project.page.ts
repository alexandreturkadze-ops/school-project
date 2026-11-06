import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StoreService } from '../core/store.service';
import { computeStats } from '../core/stats';
import { PhotoComponent } from '../components/photo.component';
import { HeroSliderComponent } from '../components/hero-slider.component';
import { IconComponent } from '../components/icon.component';
import { CountUpDirective } from '../components/count-up.directive';
import { RevealDirective } from '../components/reveal.directive';
import { DemographyComponent } from './demography.component';
import { FooterComponent } from '../layout/footer.component';

/** პროექტის გვერდი: საკუთარი ზედა ნაწილით (სათაური, ტექსტი, ფოტო) და სექციებით */
@Component({
  selector: 'app-project-page',
  imports: [RouterLink, PhotoComponent, HeroSliderComponent, IconComponent, CountUpDirective, RevealDirective, DemographyComponent, FooterComponent],
  templateUrl: './project.page.html',
  styleUrl: './project.page.scss',
})
export class ProjectPage {
  store = inject(StoreService);
  private route = inject(ActivatedRoute);
  readonly id = toSignal(this.route.paramMap.pipe(map(p => p.get('id') ?? '')), { initialValue: '' });
  readonly project = computed(() => this.store.project(this.id()));
  readonly index = computed(() => this.store.projects().findIndex(p => p.id === this.id()));
  readonly stats = computed(() => computeStats(this.store.students()));
  readonly heroImg = computed(() => {
    const p = this.project();
    if (!p) return '';
    return p.hero || (p.kind === 'demography' ? this.store.photos()['hero'] : '');
  });
  /** დემოგრაფიის პროექტს სლაიდერი აქვს, დანარჩენებს ერთი ფოტო */
  readonly heroImages = computed(() => {
    const extra = this.project()?.kind === 'demography' ? this.store.state().heroSlides : [];
    return [...new Set([this.heroImg(), ...extra].map(s => s.trim()).filter(Boolean))];
  });
  readonly next = computed(() => {
    const all = this.store.projects();
    return all.length > 1 ? all[(this.index() + 1) % all.length] : undefined;
  });

  scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
}
