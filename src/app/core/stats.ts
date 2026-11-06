import { Student } from '../data/students';
import { IconName } from './icons';

export interface Item { label: string; value: number; }

/** დათვლა ნებისმიერი ველის მიხედვით, კლებადობით დალაგებული */
export function countBy(list: Student[], key: (s: Student) => string | number): Item[] {
  const map = new Map<string, number>();
  for (const s of list) {
    const k = String(key(s));
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'ka'));
}

const clsOrder = (c: string) => (parseInt(c, 10) || 0) * 10 + 'აბგდე'.indexOf(c.slice(-1));

/** ყველა სტატისტიკა მოსწავლეთა სიიდან */
export function computeStats(all: Student[]) {
  const list = all.length ? all : [];
  const total = list.length;
  const boys = list.filter(s => s.gender === 'M').length;
  const girls = total - boys;

  const classes = countBy(list, s => s.cls).sort((a, b) => clsOrder(a.label) - clsOrder(b.label));
  const ages = countBy(list, s => s.age).sort((a, b) => +a.label - +b.label);
  const byValueDesc = [...ages].sort((a, b) => b.value - a.value);
  const cv = classes.map(c => c.value);
  const maxC = Math.max(0, ...cv), minC = cv.length ? Math.min(...cv) : 0;

  const ageGroups: { label: string; min: number; max: number; icon: IconName; value: number }[] = [
    { label: '5–7 წელი', min: 5, max: 7, icon: 'baby' },
    { label: '8–10 წელი', min: 8, max: 10, icon: 'backpack' },
    { label: '11–13 წელი', min: 11, max: 13, icon: 'book' },
    { label: '14–15 წელი', min: 14, max: 15, icon: 'flask' },
    { label: '16–17 წელი', min: 16, max: 17, icon: 'cap' },
  ].map(g => ({ ...g, icon: g.icon as IconName, value: list.filter(s => s.age >= g.min && s.age <= g.max).length }));

  const pyramid = ages.map(a => ({
    age: a.label,
    boys: list.filter(s => String(s.age) === a.label && s.gender === 'M').length,
    girls: list.filter(s => String(s.age) === a.label && s.gender === 'F').length,
  }));

  const stages = ([
    { key: 'primary', label: 'დაწყებითი', range: '1–4 კლასი', min: 1, max: 4, icon: 'pencil', color: '#D97706' },
    { key: 'basic', label: 'საბაზო', range: '5–9 კლასი', min: 5, max: 9, icon: 'flask', color: '#0E7C66' },
    { key: 'secondary', label: 'საშუალო', range: '10–12 კლასი', min: 10, max: 12, icon: 'cap', color: '#1D4ED8' },
  ] as const).map(x => {
    const l = list.filter(s => s.grade >= x.min && s.grade <= x.max);
    return { ...x, icon: x.icon as IconName, value: l.length, boys: l.filter(s => s.gender === 'M').length,
      girls: l.filter(s => s.gender === 'F').length, classes: new Set(l.map(s => s.cls)).size };
  });

  const genderByClass = classes.map(c => ({
    cls: c.label,
    boys: list.filter(s => s.cls === c.label && s.gender === 'M').length,
    girls: list.filter(s => s.cls === c.label && s.gender === 'F').length,
  }));

  const secs = [...new Set(list.map(s => s.sec))].sort((a, b) => 'აბგდე'.indexOf(a) - 'აბგდე'.indexOf(b));
  const grades = [...new Set(list.map(s => s.grade))].sort((a, b) => a - b);
  const density = {
    secs,
    rows: grades.map(g => ({
      grade: g,
      cells: secs.map(sec => {
        const v = list.filter(s => s.grade === g && s.sec === sec).length;
        return { sec, value: v, exists: v > 0 };
      }),
    })),
    avg: classes.length ? total / classes.length : 0,
    max: maxC, min: minC, classCount: classes.length,
  };

  const regions = countBy(list, s => s.region);
  return {
    total, boys, girls, classes, ages, ageGroups, pyramid, stages, genderByClass, density, regions,
    ageMax: byValueDesc[0] ?? { label: '-', value: 0 },
    ageMin: byValueDesc[byValueDesc.length - 1] ?? { label: '-', value: 0 },
    classMax: classes.filter(c => c.value === maxC),
    classMin: classes.filter(c => c.value === minC),
    gradeTotals: grades.map(g => ({ label: `${g} კლ.`, value: list.filter(s => s.grade === g).length })),
    regionsGeo: countBy(list.filter(s => !s.abroad), s => s.region),
    regionsAbroad: countBy(list.filter(s => s.abroad), s => s.region),
    abroadCount: list.filter(s => s.abroad).length,
    districts: countBy(list, s => s.district),
    langs: countBy(list, s => s.lang),
    nats: countBy(list, s => s.nat),
    regionCount: (r: string) => regions.find(x => x.label === r)?.value ?? 0,
  };
}

export type Stats = ReturnType<typeof computeStats>;
