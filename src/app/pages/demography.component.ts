import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ChartConfiguration as CC, TooltipItem } from 'chart.js';
import { StoreService } from '../core/store.service';
import { NAME_STATS } from '../data/students';
import { computeStats, countBy, Item } from '../core/stats';
import { IconName } from '../core/icons';
import { ChartComponent } from '../components/chart.component';
import { PhotoComponent } from '../components/photo.component';
import { IconComponent } from '../components/icon.component';
import { FlagComponent } from '../components/flag.component';
import { CountUpDirective } from '../components/count-up.directive';
import { RevealDirective } from '../components/reveal.directive';

/** Chart.js კონფიგურაცია ნებისმიერი ტიპის დიაგრამისთვის */
type Cfg = CC<any>;
type Stage = 'all' | 'primary' | 'basic' | 'secondary';

/** სექციების ფერები (იგივეა, რაც CSS-ში --c1…--c6) */
const HUES = ['#E8384F', '#F59F00', '#12B886', '#228BE6', '#7950F2', '#E64980'];
const PALETTE = ['#228BE6', '#E8384F', '#12B886', '#F59F00', '#7950F2', '#E64980', '#15AABF', '#FD7E14', '#82C91E', '#4C6EF5', '#BE4BDB', '#FAB005', '#868E96'];

/** კუთხეები, რომლებსაც ფოტო აქვთ */
const REGION_PHOTOS: { key: string; label: string }[] = [
  { key: 'imereti', label: 'იმერეთი' }, { key: 'kakheti', label: 'კახეთი' }, { key: 'kartli', label: 'ქართლი' },
  { key: 'samegrelo', label: 'სამეგრელო' }, { key: 'racha', label: 'რაჭა' }, { key: 'svaneti', label: 'სვანეთი' },
];

@Component({
  selector: 'app-demography',
  imports: [DecimalPipe, ChartComponent, PhotoComponent, IconComponent, FlagComponent, CountUpDirective, RevealDirective],
  templateUrl: './demography.component.html',
  styleUrl: './demography.component.scss',
})
export class DemographyComponent {
  store = inject(StoreService);
  readonly active = signal('s1');
  readonly regionPhotos = REGION_PHOTOS;

  readonly nav: { id: string; n: number; t: string; icon: IconName }[] = [
    { id: 's1', n: 1, t: 'რაოდენობა', icon: 'users' }, { id: 's2', n: 2, t: 'ასაკ. ჯგუფები', icon: 'calendar' },
    { id: 's3', n: 3, t: 'პირამიდა', icon: 'bar' }, { id: 's4', n: 4, t: 'ასაკები', icon: 'bar' },
    { id: 's5', n: 5, t: 'კლასები', icon: 'layout' }, { id: 's6', n: 6, t: 'საფეხურები', icon: 'layers' },
    { id: 's7', n: 7, t: 'სახელები', icon: 'id' }, { id: 's8', n: 8, t: 'გვარები', icon: 'id' },
    { id: 's9', n: 9, t: 'კუთხეები', icon: 'mountain' }, { id: 's10', n: 10, t: 'უბნები', icon: 'pin' },
    { id: 's11', n: 11, t: 'ენა', icon: 'languages' }, { id: 's12', n: 12, t: 'ეროვნება', icon: 'flag' },
    { id: 's13', n: 13, t: 'სქესი კლასებში', icon: 'users' }, { id: 's14', n: 14, t: 'სიმჭიდროვე', icon: 'grid' },
    { id: 's15', n: 15, t: 'კლასის ბარათი', icon: 'id' },
  ];
  readonly visibleNav = computed(() => this.nav.filter(n => !this.store.hidden().has(n.id)));

  // ---------- ფილტრი საფეხურის მიხედვით ----------
  readonly stage = signal<Stage>('all');
  readonly stageOptions: { id: Stage; label: string }[] = [
    { id: 'all', label: 'ყველა' }, { id: 'primary', label: '1–4' }, { id: 'basic', label: '5–9' }, { id: 'secondary', label: '10–12' },
  ];
  readonly list = computed(() => {
    const all = this.store.students();
    const range = { all: [0, 99], primary: [1, 4], basic: [5, 9], secondary: [10, 12] }[this.stage()];
    return all.filter(s => s.grade >= range[0] && s.grade <= range[1]);
  });
  readonly stageLabel = computed(() => ({ all: '', primary: '1–4 კლასი', basic: '5–9 კლასი', secondary: '10–12 კლასი' })[this.stage()]);

  readonly st = computed(() => computeStats(this.list()));
  /** სახელები სიაში აღარ არის, ამიტომ ეს რიცხვები მზა სახითაა შენახული */
  readonly nameStats = computed(() => NAME_STATS[this.stage()]);
  readonly t = computed(() => this.store.texts());
  readonly ph = computed(() => this.store.photos());
  show(id: string) { return !this.store.hidden().has(id); }
  hue(id: string) { return HUES[(parseInt(id.slice(1), 10) - 1) % HUES.length]; }

  // ---------- კლასის ბარათი ----------
  readonly picked = signal('');
  readonly classCard = computed(() => {
    const all = this.store.students();
    const classes = computeStats(all).classes;
    const cls = this.picked() && classes.some(c => c.label === this.picked()) ? this.picked() : classes[0]?.label ?? '';
    const l = all.filter(s => s.cls === cls);
    const boys = l.filter(s => s.gender === 'M').length;
    const avgAge = l.length ? l.reduce((a, s) => a + s.age, 0) / l.length : 0;
    const sorted = [...classes].sort((a, b) => b.value - a.value);
    return {
      cls, classes, total: l.length, boys, girls: l.length - boys, avgAge,
      rank: sorted.findIndex(c => c.label === cls) + 1,
      schoolAvg: all.length / Math.max(1, classes.length),
      districts: countBy(l, s => s.district).slice(0, 4),
      regions: countBy(l, s => s.region).slice(0, 4),
      nats: countBy(l, s => s.nat),
      langs: countBy(l, s => s.lang),
    };
  });

  // ---------- დიაგრამის ფერები (ღია/მუქი ფონი) ----------
  private readonly th = computed(() => this.store.dark()
    ? { grid: '#1E2840', text: '#94A0BA', card: '#121A2C', soft: '#2A3550', boy: '#5B8CFF', girl: '#FF6FA5' }
    : { grid: '#EBEEF5', text: '#5B6680', card: '#FFFFFF', soft: '#D5DBE8', boy: '#3B6EF5', girl: '#F0508A' });

  private axes(extra: Record<string, unknown> = {}) {
    const th = this.th();
    return {
      x: { grid: { display: false }, ticks: { color: th.text }, border: { color: th.grid } },
      y: { beginAtZero: true, grid: { color: th.grid }, ticks: { color: th.text }, border: { display: false } },
      ...extra,
    };
  }
  private legend() { return { position: 'bottom', labels: { color: this.th().text, usePointStyle: true, padding: 16 } }; }

  readonly cGender = computed<Cfg>(() => ({
    type: 'doughnut',
    data: { labels: ['ბიჭი', 'გოგო'], datasets: [{ data: [this.st().boys, this.st().girls], backgroundColor: [this.th().boy, this.th().girl], borderWidth: 0, hoverOffset: 8 }] },
    options: { cutout: '72%', maintainAspectRatio: false, plugins: { legend: this.legend() } },
  }));

  readonly cAgeGroups = computed<Cfg>(() => {
    const g = this.st().ageGroups;
    return {
      type: 'bar',
      data: { labels: g.map(x => x.label), datasets: [{ label: 'მოსწავლე', data: g.map(x => x.value), backgroundColor: HUES.slice(0, 5), borderRadius: 10, maxBarThickness: 72 }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: this.axes() },
    };
  });

  readonly cPyramid = computed<Cfg>(() => {
    const pyr = [...this.st().pyramid].reverse();
    const th = this.th();
    return {
      type: 'bar',
      data: {
        labels: pyr.map(p => p.age + ' წ.'),
        datasets: [
          { label: 'ბიჭები', data: pyr.map(p => -p.boys), backgroundColor: th.boy, borderRadius: 6 },
          { label: 'გოგოები', data: pyr.map(p => p.girls), backgroundColor: th.girl, borderRadius: 6 },
        ],
      },
      options: {
        indexAxis: 'y', maintainAspectRatio: false,
        scales: {
          x: { stacked: true, ticks: { color: th.text, callback: (v: string | number) => Math.abs(+v) }, grid: { color: th.grid }, border: { display: false } },
          y: { stacked: true, grid: { display: false }, ticks: { color: th.text } },
        },
        plugins: { tooltip: { callbacks: { label: (c: TooltipItem<'bar'>) => `${c.dataset.label}: ${Math.abs(c.raw as number)}` } }, legend: this.legend() },
      },
    };
  });

  readonly cAges = computed<Cfg>(() => this.barHighlight(this.st().ages.map(a => a.label + ' წ.'), this.st().ages.map(a => a.value)));
  readonly cClasses = computed<Cfg>(() => this.barHighlight(this.st().classes.map(c => c.label), this.st().classes.map(c => c.value)));
  readonly cGrades = computed<Cfg>(() => this.barHighlight(this.st().gradeTotals.map(g => g.label), this.st().gradeTotals.map(g => g.value)));

  readonly cStages = computed<Cfg>(() => {
    const s = this.st().stages, th = this.th();
    return {
      type: 'bar',
      data: {
        labels: s.map(x => x.range),
        datasets: [
          { label: 'ბიჭები', data: s.map(x => x.boys), backgroundColor: th.boy, borderRadius: 8, maxBarThickness: 90 },
          { label: 'გოგოები', data: s.map(x => x.girls), backgroundColor: th.girl, borderRadius: 8, maxBarThickness: 90 },
        ],
      },
      options: { maintainAspectRatio: false, scales: this.stacked(), plugins: { legend: this.legend() } },
    };
  });

  readonly cRegions = computed<Cfg>(() => this.hbar(this.st().regionsGeo, HUES[2]));
  readonly cDistricts = computed<Cfg>(() => this.hbar(this.st().districts.slice(0, 12), HUES[3]));
  readonly cLangs = computed<Cfg>(() => this.doughnut(this.st().langs));
  readonly cNats = computed<Cfg>(() => this.doughnut(this.st().nats));

  readonly cGenderClass = computed<Cfg>(() => {
    const g = this.st().genderByClass, th = this.th();
    return {
      type: 'bar',
      data: {
        labels: g.map(x => x.cls),
        datasets: [
          { label: 'ბიჭები', data: g.map(x => x.boys), backgroundColor: th.boy, borderRadius: 4 },
          { label: 'გოგოები', data: g.map(x => x.girls), backgroundColor: th.girl, borderRadius: 4 },
        ],
      },
      options: { maintainAspectRatio: false, scales: this.stacked(true), plugins: { legend: this.legend() } },
    };
  });

  private stacked(small = false) {
    const th = this.th();
    return {
      x: { stacked: true, grid: { display: false }, ticks: { color: th.text, autoSkip: false, font: { size: small ? 10 : 12 } } },
      y: { stacked: true, grid: { color: th.grid }, ticks: { color: th.text }, border: { display: false } },
    };
  }

  private barHighlight(labels: string[], data: number[]): Cfg {
    const max = Math.max(...data), min = Math.min(...data), th = this.th();
    return {
      type: 'bar',
      data: { labels, datasets: [{ label: 'მოსწავლე', data, borderRadius: 8, backgroundColor: data.map(v => v === max ? '#12B886' : v === min ? '#F04452' : th.soft) }] },
      options: {
        maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: this.axes({ x: { grid: { display: false }, ticks: { color: th.text, autoSkip: false, font: { size: labels.length > 20 ? 10 : 12 } } } }),
      },
    };
  }

  private hbar(items: Item[], color: string): Cfg {
    const th = this.th();
    return {
      type: 'bar',
      data: { labels: items.map(i => i.label), datasets: [{ label: 'მოსწავლე', data: items.map(i => i.value), backgroundColor: color, borderRadius: 6 }] },
      options: {
        indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { x: { grid: { color: th.grid }, ticks: { color: th.text }, border: { display: false } }, y: { grid: { display: false }, ticks: { color: th.text, autoSkip: false } } },
      },
    };
  }

  private doughnut(items: Item[]): Cfg {
    return {
      type: 'doughnut',
      data: { labels: items.map(i => i.label), datasets: [{ data: items.map(i => i.value), backgroundColor: PALETTE, borderWidth: 3, borderColor: this.th().card }] },
      options: { cutout: '66%', maintainAspectRatio: false, plugins: { legend: { display: false } } },
    };
  }

  // ---------- დამხმარე ----------
  pct(v: number, of = this.st().total) { return of ? (v / of) * 100 : 0; }
  barW(v: number, items: Item[]) { return items[0]?.value ? (v / items[0].value) * 100 : 0; }
  paletteColor(i: number) { return PALETTE[i % PALETTE.length]; }
  hueAt(i: number) { return HUES[i % HUES.length]; }
  heat(v: number) {
    const d = this.st().density;
    if (!v) return 'transparent';
    const t = d.max === d.min ? 1 : (v - d.min) / (d.max - d.min);
    return `color-mix(in srgb, #7950F2 ${Math.round(14 + t * 80)}%, var(--soft))`;
  }
  heatInk(v: number) {
    const d = this.st().density;
    const t = d.max === d.min ? 1 : (v - d.min) / (d.max - d.min);
    return t > 0.4 ? '#fff' : 'var(--ink)';
  }

  setStage(s: Stage) { this.stage.set(s); }
  go(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }

  @HostListener('window:scroll')
  onScroll() {
    for (const n of [...this.visibleNav()].reverse()) {
      const el = document.getElementById(n.id);
      if (el && el.getBoundingClientRect().top < 220) {
        if (this.active() !== n.id) {
          this.active.set(n.id);
          const chip = document.getElementById('nav-' + n.id), bar = chip?.parentElement;
          if (chip && bar) bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
        }
        return;
      }
    }
    this.active.set(this.visibleNav()[0]?.id ?? 's1');
  }
}
