import { Injectable, computed, effect, signal } from '@angular/core';
import { Student } from '../data/students';
import { CustomSection, Project, SiteState, defaultState, migrate } from './defaults';

const KEY = 'school-site-v1';
const AUTH_KEY = 'school-site-admin';
const THEME_KEY = 'school-site-theme';
const HISTORY_LIMIT = 40;

export type ThemeChoice = 'light' | 'dark' | 'system';

/**
 * საიტის მთელი მონაცემი (პროექტები, ტექსტები, ფოტოები, მოსწავლეები).
 * ცვლილებები ინახება ბრაუზერის localStorage-ში. აქვს „დაბრუნება“ (undo) და „გამეორება“ (redo).
 */
@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly state = signal<SiteState>(this.load());
  readonly isAdmin = signal(this.readAuth());
  readonly saveError = signal('');
  readonly savedAt = signal<Date | null>(null);

  readonly projects = computed(() => this.state().projects);
  readonly students = computed(() => this.state().students);
  readonly texts = computed(() => this.state().texts);
  readonly photos = computed(() => this.state().photos);
  readonly hidden = computed(() => new Set(this.state().hidden));

  // ---------- თემა (ღია / მუქი) ----------
  readonly themeChoice = signal<ThemeChoice>(this.readTheme());
  private readonly systemDark = signal(matchMedia('(prefers-color-scheme: dark)').matches);
  readonly dark = computed(() => this.themeChoice() === 'dark' || (this.themeChoice() === 'system' && this.systemDark()));

  // ---------- ისტორია ----------
  private past: SiteState[] = [];
  private future: SiteState[] = [];
  private lastPush = 0;
  readonly canUndo = signal(false);
  readonly canRedo = signal(false);

  constructor() {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => this.systemDark.set(e.matches));

    effect(() => {
      const s = this.state();
      try {
        localStorage.setItem(KEY, JSON.stringify(s));
        this.saveError.set('');
        this.savedAt.set(new Date());
      } catch {
        this.saveError.set('ცვლილება ვერ შეინახა: ბრაუზერის მეხსიერება სავსეა. შეამცირეთ ატვირთული ფოტოების რაოდენობა.');
      }
    });

    effect(() => {
      const root = document.documentElement;
      root.dataset['theme'] = this.dark() ? 'dark' : 'light';
      root.style.setProperty('--brand', this.state().brandColor);
    });
  }

  private load(): SiteState {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return migrate(JSON.parse(raw));
    } catch { /* ცარიელი ან დაზიანებული მეხსიერება */ }
    return defaultState();
  }

  setTheme(t: ThemeChoice) {
    this.themeChoice.set(t);
    try { localStorage.setItem(THEME_KEY, t); } catch { /* */ }
  }
  toggleTheme() { this.setTheme(this.dark() ? 'light' : 'dark'); }
  private readTheme(): ThemeChoice {
    try { return (localStorage.getItem(THEME_KEY) as ThemeChoice) || 'system'; } catch { return 'system'; }
  }

  // ---------- ადმინი ----------
  async login(code: string): Promise<boolean> {
    const ok = (await hashCode(code.trim())) === this.state().adminCodeHash;
    if (ok) {
      this.isAdmin.set(true);
      try { sessionStorage.setItem(AUTH_KEY, '1'); } catch { /* */ }
    }
    return ok;
  }
  logout() {
    this.isAdmin.set(false);
    try { sessionStorage.removeItem(AUTH_KEY); } catch { /* */ }
  }
  private readAuth() {
    try { return sessionStorage.getItem(AUTH_KEY) === '1'; } catch { return false; }
  }

  // ---------- ზოგადი ცვლილება + ისტორია ----------
  patch(fn: (s: SiteState) => void) {
    const before = this.state();
    const copy = structuredClone(before);
    fn(copy);
    this.remember(before);
    this.state.set(copy);
  }
  /** ერთმანეთის მიყოლებით აკრეფილი ასოები ერთ ნაბიჯად ითვლება */
  private remember(before: SiteState) {
    const now = Date.now();
    if (now - this.lastPush > 900) {
      this.past.push(before);
      if (this.past.length > HISTORY_LIMIT) this.past.shift();
    }
    this.lastPush = now;
    this.future = [];
    this.syncHistory();
  }
  undo() {
    const prev = this.past.pop();
    if (!prev) return;
    this.future.push(this.state());
    this.state.set(prev);
    this.lastPush = 0;
    this.syncHistory();
  }
  redo() {
    const next = this.future.pop();
    if (!next) return;
    this.past.push(this.state());
    this.state.set(next);
    this.lastPush = 0;
    this.syncHistory();
  }
  private syncHistory() { this.canUndo.set(this.past.length > 0); this.canRedo.set(this.future.length > 0); }

  resetAll() { this.remember(this.state()); this.state.set(defaultState()); }
  resetStudents() { this.patch(s => (s.students = defaultState().students)); }
  importJson(text: string) {
    const next = migrate(JSON.parse(text));
    if (!next.projects.length) throw new Error('bad');
    this.remember(this.state());
    this.state.set(next);
  }
  replaceStudents(list: Student[]) { this.patch(s => (s.students = list)); }

  project(id: string) { return this.projects().find(p => p.id === id); }
  isHidden(key: string) { return this.hidden().has(key); }
  toggleHidden(key: string) {
    this.patch(s => (s.hidden = s.hidden.includes(key) ? s.hidden.filter(k => k !== key) : [...s.hidden, key]));
  }

  // ---------- პროექტები ----------
  uid() { return Math.random().toString(36).slice(2, 9); }

  addProject(p: Partial<Project>): Project {
    const n = this.projects().length + 1;
    const project: Project = {
      id: this.uid(), kind: 'custom',
      title: p.title || 'ახალი პროექტი',
      eyebrow: p.eyebrow || `პროექტი ${String(n).padStart(2, '0')}`,
      subtitle: p.subtitle || '',
      hero: p.hero || '', accent: p.accent || '#4F46E5', sections: [],
    };
    this.patch(s => s.projects.push(project));
    return project;
  }
  duplicateProject(id: string): Project | undefined {
    const src = this.project(id);
    if (!src) return;
    const copy: Project = { ...structuredClone(src), id: this.uid(), kind: 'custom', title: src.title + ' (ასლი)' };
    copy.sections = copy.sections.map(s => ({ ...s, id: this.uid() }));
    this.patch(s => s.projects.splice(s.projects.findIndex(p => p.id === id) + 1, 0, copy));
    return copy;
  }
  updateProject(id: string, fn: (p: Project) => void) {
    this.patch(s => { const p = s.projects.find(x => x.id === id); if (p) fn(p); });
  }
  deleteProject(id: string) { this.patch(s => (s.projects = s.projects.filter(p => p.id !== id))); }
  moveProject(id: string, dir: -1 | 1) {
    this.patch(s => {
      const i = s.projects.findIndex(p => p.id === id), j = i + dir;
      if (i < 0 || j < 0 || j >= s.projects.length) return;
      [s.projects[i], s.projects[j]] = [s.projects[j], s.projects[i]];
    });
  }

  // ---------- სექციები ----------
  addSection(projectId: string): CustomSection {
    const sec: CustomSection = { id: this.uid(), title: 'ახალი სექცია', text: '', image: '', stats: [] };
    this.updateProject(projectId, p => p.sections.push(sec));
    return sec;
  }
  updateSection(projectId: string, secId: string, fn: (s: CustomSection) => void) {
    this.updateProject(projectId, p => { const s = p.sections.find(x => x.id === secId); if (s) fn(s); });
  }
  deleteSection(projectId: string, secId: string) {
    this.updateProject(projectId, p => (p.sections = p.sections.filter(s => s.id !== secId)));
  }
  moveSection(projectId: string, secId: string, dir: -1 | 1) {
    this.updateProject(projectId, p => {
      const i = p.sections.findIndex(s => s.id === secId), j = i + dir;
      if (i < 0 || j < 0 || j >= p.sections.length) return;
      [p.sections[i], p.sections[j]] = [p.sections[j], p.sections[i]];
    });
  }

  // ---------- მოსწავლეები ----------
  updateStudent(n: number, field: keyof Student, value: string) {
    this.patch(s => {
      const st = s.students.find(x => x.n === n);
      if (!st) return;
      const rec = st as unknown as Record<string, unknown>;
      if (field === 'age') rec[field] = Number(value) || 0;
      else if (field === 'abroad') rec[field] = value === 'true';
      else rec[field] = value;
      if (field === 'cls') {
        st.grade = parseInt(value, 10) || 0;
        st.sec = value.trim().slice(-1);
      }
    });
  }
  addStudent(): number {
    const n = Math.max(0, ...this.students().map(s => s.n)) + 1;
    this.patch(s => s.students.unshift({
      n, cls: '1ა', grade: 1, sec: 'ა', age: 6, nat: 'ქართველი',
      region: 'უცნობი', abroad: false, lang: 'ქართული', district: 'უცნობი', gender: 'F',
    }));
    return n;
  }
  deleteStudent(n: number) { this.patch(s => (s.students = s.students.filter(x => x.n !== n))); }
}

/** ადმინის კოდის ჰეში (PBKDF2). მუშაობს მხოლოდ https-ზე და localhost-ზე */
export async function hashCode(code: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('school-site-admin-v1'), iterations: 200000 }, key, 256);
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** ატვირთული ფოტოს შემცირება (მაქს. 1400px), რომ მეხსიერებაში დაეტიოს. ლოგოსთვის png ინახავს გამჭვირვალე ფონს */
export function fileToDataUrl(file: File, max = 1400, type: 'image/jpeg' | 'image/png' = 'image/jpeg'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL(type, 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ---------- CSV (Excel-ში გასახსნელად) ----------
const CSV_COLS: { key: keyof Student; title: string }[] = [
  { key: 'cls', title: 'კლასი' },
  { key: 'age', title: 'ასაკი' }, { key: 'gender', title: 'სქესი (M/F)' }, { key: 'nat', title: 'ეროვნება' },
  { key: 'region', title: 'კუთხე' }, { key: 'abroad', title: 'საზღვარგარეთი (1/0)' }, { key: 'lang', title: 'ენა' },
  { key: 'district', title: 'უბანი' },
];

export function studentsToCsv(list: Student[]): string {
  const esc = (v: unknown) => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const rows = list.map(s => CSV_COLS.map(c => esc(c.key === 'abroad' ? (s.abroad ? 1 : 0) : s[c.key])).join(','));
  return '﻿' + [CSV_COLS.map(c => c.title).join(','), ...rows].join('\n');
}

export function csvToStudents(text: string): Student[] {
  const lines = parseCsv(text.replace(/^﻿/, '')).filter(r => r.some(c => c.trim()));
  if (lines.length < 2) throw new Error('empty');
  // სვეტები სათაურით იძებნება, ამიტომ ძველი ფაილის „სახელი“ და „გვარი“ უბრალოდ იგნორირდება
  const header = lines[0].map(h => h.trim());
  return lines.slice(1).map((r, i) => {
    const get = (k: keyof Student) => (r[header.indexOf(CSV_COLS.find(c => c.key === k)!.title)] ?? '').trim();
    const cls = get('cls');
    const g = get('gender').toUpperCase();
    return {
      n: i + 1, cls, grade: parseInt(cls, 10) || 0, sec: cls.slice(-1),
      age: Number(get('age')) || 0, gender: (g === 'M' || g === 'ბ' || g.startsWith('ბიჭ') ? 'M' : 'F') as 'M' | 'F',
      nat: get('nat') || 'უცნობი', region: get('region') || 'უცნობი', abroad: ['1', 'true', 'კი'].includes(get('abroad').toLowerCase()),
      lang: get('lang') || 'უცნობი', district: get('district') || 'უცნობი',
    };
  });
}

function parseCsv(text: string): string[][] {
  const sep = (text.split('\n')[0].match(/;/g)?.length ?? 0) > (text.split('\n')[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
