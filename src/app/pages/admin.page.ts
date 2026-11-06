import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { StoreService, csvToStudents, fileToDataUrl, hashCode, studentsToCsv } from '../core/store.service';
import { DEFAULT_PHOTOS, FooterHeads, PHOTO_LABELS, Project, SECTION_KEYS } from '../core/defaults';
import { Student } from '../data/students';
import { computeStats } from '../core/stats';
import { IconComponent } from '../components/icon.component';
import { ImageFieldComponent } from '../components/image-field.component';
import { IconName } from '../core/icons';
import { DatePipe, DecimalPipe } from '@angular/common';

type Tab = 'overview' | 'projects' | 'texts' | 'brand' | 'students' | 'photos' | 'settings';

/** ადმინ პანელი: საიტის ტექსტების, პროექტების, მოსწავლეების და ფოტოების რედაქტირება */
@Component({
  selector: 'app-admin-page',
  imports: [FormsModule, RouterLink, IconComponent, ImageFieldComponent, DatePipe, DecimalPipe],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss',
})
export class AdminPage {
  store = inject(StoreService);
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private qp = toSignal(this.route.queryParamMap);

  readonly tabs: { id: Tab; label: string; icon: IconName }[] = [
    { id: 'overview', label: 'მიმოხილვა', icon: 'dashboard' },
    { id: 'projects', label: 'პროექტები', icon: 'folder' },
    { id: 'texts', label: 'ტექსტები და სექციები', icon: 'type' },
    { id: 'brand', label: 'ლოგო და ფუტერი', icon: 'school' },
    { id: 'students', label: 'მოსწავლეები', icon: 'users' },
    { id: 'photos', label: 'ფოტოები', icon: 'image' },
    { id: 'settings', label: 'პარამეტრები', icon: 'settings' },
  ];
  readonly tab = computed<Tab>(() => (this.qp()?.get('tab') as Tab) || 'overview');
  readonly editId = computed(() => this.qp()?.get('edit') ?? '');
  readonly creating = computed(() => this.qp()?.get('new') === '1');
  readonly editing = computed(() => this.store.project(this.editId()));

  // ---------- შესვლა ----------
  code = '';
  readonly loginError = signal(false);
  async login() {
    if (await this.store.login(this.code)) { this.code = ''; this.loginError.set(false); }
    else this.loginError.set(true);
  }
  logout() { this.store.logout(); this.router.navigate(['/']); }

  setTab(t: Tab) { this.router.navigate([], { queryParams: { tab: t } }); }
  openEdit(id: string) { this.router.navigate([], { queryParams: { tab: 'projects', edit: id } }); }
  closeEdit() { this.router.navigate([], { queryParams: { tab: 'projects' } }); }

  // ---------- ახალი პროექტი ----------
  draft = { title: '', eyebrow: '', subtitle: '', hero: '', accent: '#1D4ED8' };
  readonly accents = ['#C8102E', '#1D4ED8', '#0E7C66', '#D97706', '#7C3AED', '#0F1B2D', '#DB2777', '#0891B2'];
  createProject() {
    if (!this.draft.title.trim()) return;
    const p = this.store.addProject(this.draft);
    this.draft = { title: '', eyebrow: '', subtitle: '', hero: '', accent: '#1D4ED8' };
    this.openEdit(p.id);
  }
  readonly confirmDelete = signal('');
  deleteProject(p: Project) {
    if (this.confirmDelete() !== p.id) { this.confirmDelete.set(p.id); return; }
    if (this.store.projects().length <= 1) return;
    this.store.deleteProject(p.id);
    this.confirmDelete.set('');
    if (this.editId()) this.closeEdit();
  }
  setP<K extends keyof Project>(id: string, key: K, value: Project[K]) { this.store.updateProject(id, p => (p[key] = value)); }

  // ---------- სექციები ----------
  setS(pid: string, sid: string, key: 'title' | 'text' | 'image', value: string) {
    this.store.updateSection(pid, sid, s => (s[key] = value));
  }
  setStat(pid: string, sid: string, i: number, key: 'label' | 'value', value: string) {
    this.store.updateSection(pid, sid, s => (s.stats[i][key] = value));
  }
  addStat(pid: string, sid: string) { this.store.updateSection(pid, sid, s => s.stats.push({ label: 'წარწერა', value: '0' })); }
  removeStat(pid: string, sid: string, i: number) { this.store.updateSection(pid, sid, s => s.stats.splice(i, 1)); }
  readonly openSection = signal('');
  addSection(pid: string) { const s = this.store.addSection(pid); this.openSection.set(s.id); }

  duplicate(id: string) { const c = this.store.duplicateProject(id); if (c) this.openEdit(c.id); }

  // ---------- მიმოხილვა ----------
  readonly overview = computed(() => {
    const s = this.store.state();
    const bytes = new Blob([JSON.stringify(s)]).size;
    const uploaded = Object.values(s.photos).filter(v => v.startsWith('data:')).length
      + (s.logo.startsWith('data:') ? 1 : 0)
      + s.heroSlides.filter(v => v.startsWith('data:')).length
      + s.projects.reduce((a, p) => a + (p.hero.startsWith('data:') ? 1 : 0) + p.sections.filter(x => x.image.startsWith('data:')).length, 0);
    const changedPhotos = Object.keys(DEFAULT_PHOTOS).filter(k => s.photos[k] !== DEFAULT_PHOTOS[k]).length;
    return {
      projects: s.projects.length,
      sections: s.projects.reduce((a, p) => a + p.sections.length, 0),
      students: s.students.length,
      hidden: s.hidden.length,
      kb: bytes / 1024,
      pctStorage: Math.min(100, (bytes / (5 * 1024 * 1024)) * 100),
      uploaded, changedPhotos,
    };
  });

  // ---------- ტექსტები და ხილვადობა ----------
  readonly sectionKeys = SECTION_KEYS;
  setText(key: string, field: 'title' | 'desc', value: string) { this.store.patch(s => (s.texts[key][field] = value)); }
  setBrand(v: string) { this.store.patch(s => (s.brand = v)); }
  setFooter(v: string) { this.store.patch(s => (s.footer = v)); }
  setLogo(v: string) { this.store.patch(s => (s.logo = v)); }
  setFooterCopy(v: string) { this.store.patch(s => (s.footerCopy = v)); }
  setFooterHead(key: keyof FooterHeads, v: string) { this.store.patch(s => (s.footerHeads[key] = v)); }
  setFooterInfo(i: number, v: string) { this.store.patch(s => (s.footerInfo[i] = v)); }

  // ---------- მოსწავლეები ----------
  readonly search = signal('');
  readonly page = signal(0);
  readonly pageSize = 20;
  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const list = this.store.students();
    if (!q) return list;
    return list.filter(s => [s.cls, s.region, s.district, s.nat, s.lang, String(s.age)].some(v => v.toLowerCase().includes(q)));
  });
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  readonly pageRows = computed(() => {
    const p = Math.min(this.page(), this.pages() - 1);
    return this.filtered().slice(p * this.pageSize, (p + 1) * this.pageSize);
  });
  readonly quick = computed(() => computeStats(this.store.students()));
  setSearch(v: string) { this.search.set(v); this.page.set(0); }
  setStudent(n: number, field: keyof Student, value: string) { this.store.updateStudent(n, field, value); }
  addStudent() { this.search.set(''); this.page.set(0); this.store.addStudent(); }
  readonly confirmStudent = signal(0);
  removeStudent(n: number) {
    if (this.confirmStudent() !== n) { this.confirmStudent.set(n); return; }
    this.store.deleteStudent(n);
    this.confirmStudent.set(0);
  }

  exportCsv() { this.download(studentsToCsv(this.store.students()), 'students.csv', 'text/csv;charset=utf-8'); }
  readonly csvMessage = signal('');
  async importCsv(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const list = csvToStudents(await file.text());
      this.store.replaceStudents(list);
      this.csvMessage.set(`ჩაიტვირთა ${list.length} მოსწავლე. თუ რამე არასწორია, დააჭირე „დაბრუნებას“ ზემოთ.`);
    } catch { this.csvMessage.set('ფაილი ვერ წავიკითხე. გამოიყენე აქედან გადმოწერილი .csv ფაილის ფორმატი.'); }
    input.value = '';
  }

  // ---------- ფოტოები ----------
  readonly photoKeys = Object.keys(PHOTO_LABELS);
  readonly photoLabels = PHOTO_LABELS;
  setPhoto(key: string, v: string) { this.store.patch(s => (s.photos[key] = v)); }

  // ---------- მთავარი სლაიდერი ----------
  setSlide(i: number, v: string) { this.store.patch(s => (s.heroSlides[i] = v)); }
  addSlide() { this.store.patch(s => s.heroSlides.push('')); }
  removeSlide(i: number) { this.store.patch(s => s.heroSlides.splice(i, 1)); }
  moveSlide(i: number, dir: -1 | 1) {
    this.store.patch(s => {
      const j = i + dir;
      if (j < 0 || j >= s.heroSlides.length) return;
      [s.heroSlides[i], s.heroSlides[j]] = [s.heroSlides[j], s.heroSlides[i]];
    });
  }
  readonly slideBusy = signal(false);
  readonly slideMsg = signal('');
  async uploadSlides(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = [...(input.files ?? [])];
    if (!files.length) return;
    this.slideBusy.set(true);
    this.slideMsg.set('');
    const results = await Promise.allSettled(files.map(f => fileToDataUrl(f)));
    const urls = results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : []));
    if (urls.length) this.store.patch(s => s.heroSlides.push(...urls));
    if (urls.length < files.length) this.slideMsg.set(`${files.length - urls.length} ფაილი ვერ წავიკითხე. აირჩიე ფოტოს ფაილი.`);
    this.slideBusy.set(false);
    input.value = '';
  }

  // ---------- პარამეტრები ----------
  readonly confirmReset = signal('');
  readonly message = signal('');
  reset(kind: 'all' | 'students') {
    if (this.confirmReset() !== kind) { this.confirmReset.set(kind); return; }
    if (kind === 'all') this.store.resetAll(); else this.store.resetStudents();
    this.confirmReset.set('');
    this.message.set(kind === 'all' ? 'საიტი დაბრუნდა საწყის მდგომარეობაში.' : 'მოსწავლეების სია დაბრუნდა Excel-ის მონაცემებზე.');
  }
  exportJson() { this.download(JSON.stringify(this.store.state(), null, 2), 'school-site.json', 'application/json'); }
  private download(text: string, name: string, type: string) {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // კოდის შეცვლა
  newCode = '';
  newCode2 = '';
  readonly codeMsg = signal<{ ok: boolean; text: string } | null>(null);
  async changeCode() {
    const c = this.newCode.trim();
    if (c.length < 4) { this.codeMsg.set({ ok: false, text: 'კოდი უნდა იყოს მინიმუმ 4 სიმბოლო.' }); return; }
    if (c !== this.newCode2.trim()) { this.codeMsg.set({ ok: false, text: 'კოდები ერთმანეთს არ ემთხვევა.' }); return; }
    const hash = await hashCode(c);
    this.store.patch(s => (s.adminCodeHash = hash));
    this.newCode = this.newCode2 = '';
    this.codeMsg.set({ ok: true, text: 'კოდი შეიცვალა. დაიმახსოვრე ახალი კოდი.' });
  }
  readonly brandColors = ['#E8384F', '#228BE6', '#12B886', '#F59F00', '#7950F2', '#E64980', '#0B1426', '#15AABF'];
  setBrandColor(c: string) { this.store.patch(s => { s.brandColor = c; const p = s.projects.find(x => x.id === 'school'); if (p) p.accent = c; }); }
  async importJson(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try { this.store.importJson(await file.text()); this.message.set('მონაცემები ჩაიტვირთა.'); }
    catch { this.message.set('ფაილი ვერ წავიკითხე. აირჩიეთ აქედან გადმოწერილი .json ფაილი.'); }
    input.value = '';
  }
}
