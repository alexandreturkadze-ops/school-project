import { STUDENTS, Student } from '../data/students';

export interface StatPair { label: string; value: string; }
export interface CustomSection {
  id: string;
  title: string;
  text: string;
  image: string;
  stats: StatPair[];
}
export interface Project {
  id: string;
  kind: 'demography' | 'custom';
  title: string;
  eyebrow: string;
  subtitle: string;
  hero: string;
  accent: string;
  sections: CustomSection[];
}
export interface SectionText { title: string; desc: string; }
export interface FooterHeads { projects: string; links: string; info: string; }
export interface SiteState {
  version: 3;
  brand: string;
  /** სკოლის ლოგო (ბმული ან ატვირთული ფაილი). ცარიელზე ჩანს ხატულა */
  logo: string;
  footer: string;
  /** ქვედა ხაზი. {year} მიმდინარე წლით იცვლება */
  footerCopy: string;
  footerHeads: FooterHeads;
  /** „ინფორმაციის“ სამი ხაზი. {total} მოსწავლეების რაოდენობით იცვლება, ცარიელი ხაზი არ ჩანს */
  footerInfo: string[];
  /** მთავარი ფერი (ღილაკები, აქცენტები) */
  brandColor: string;
  /** ადმინ პანელის კოდის ჰეში (თავად კოდი არსად ინახება) */
  adminCodeHash: string;
  /** დამალული სექციები (s1…s15) */
  hidden: string[];
  projects: Project[];
  texts: Record<string, SectionText>;
  photos: Record<string, string>;
  /** მთავარი სლაიდერის დამატებითი ფოტოები (პირველი სლაიდი „მთავარი ფოტოა“) */
  heroSlides: string[];
  students: Student[];
}

// ფოტოები Wikimedia Commons-იდან და Unsplash-იდან (ყველა შემოწმებულია, რომ იტვირთება)
const W = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/';
const wiki = (path: string, file: string, w = 1280) => `${W}${path}/${file}/${w}px-${file}`;
const un = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const DEFAULT_PHOTOS: Record<string, string> = {
  hero: wiki('e/e2', '2014_Tbilisi%2C_Widoki_z_Twierdzy_Narikala_%2823%29.jpg', 1920),
  tbilisi: wiki('a/a0', 'Peace_Bridge_and_Narikala%2C_Tbilisi.jpg'),
  vake: wiki('5/54', 'Vake_Park%2C_Tbilisi_City%2C_Georgia_Country%2C_autumn_Season_01.jpg'),
  saburtalo: wiki('2/24', 'Saburtalo_neighborhood%2C_Tbilisi.jpg'),
  imereti: wiki('4/49', '2014_Imeretia%2C_Gelati%2C_Monastyr_Gelati_%2819%29.jpg'),
  kakheti: wiki('1/1e', 'Alaverdi_Monastery_02.jpg'),
  kartli: wiki('9/95', 'Uplistsikhe_view.jpg'),
  samegrelo: wiki('7/7f', 'Martvili_Canyon_Augas.jpg'),
  racha: wiki('3/34', '2015-08-27_%2830%29_Shaori_reservoir.jpg'),
  svaneti: wiki('b/b3', 'Ushguli_Village%2C_Svaneti%2C_view_of_Shkhara_mountain.jpg'),
  world: wiki('1/1c', 'Flag_map_of_the_world.png'),
  primary: un('photo-1588072432836-e10032774350'),
  basic: un('photo-1577896851231-70ef18881754'),
  secondary: un('photo-1571260899304-425eee4c7efc'),
  library: un('photo-1427504494785-3a9ca7044f45'),
  books: un('photo-1497633762265-9d179a990aa6'),
  lecture: un('photo-1524178232363-1fb2b075b655'),
  classroom: un('photo-1580582932707-520aed937b7b'),
  desk: un('photo-1503676260728-1c00da094a0b'),
};

/** ფოტოების სახელები ადმინ პანელისთვის */
export const PHOTO_LABELS: Record<string, string> = {
  hero: 'მთავარი ფოტო (ზედა ნაწილი)', tbilisi: 'თბილისი', vake: 'ვაკე', saburtalo: 'საბურთალო',
  imereti: 'იმერეთი', kakheti: 'კახეთი', kartli: 'ქართლი', samegrelo: 'სამეგრელო', racha: 'რაჭა', svaneti: 'სვანეთი',
  world: 'მსოფლიო (ენა, ეროვნება)', primary: 'დაწყებითი საფეხური', basic: 'საბაზო საფეხური', secondary: 'საშუალო საფეხური',
  library: 'ბიბლიოთეკა (სახელები)', books: 'წიგნები', lecture: 'აუდიტორია (სიმჭიდროვე)', classroom: 'საკლასო ოთახი (ბოლო ნაწილი)',
  desk: 'მერხი (რაოდენობა)',
};

export const DEFAULT_TEXTS: Record<string, SectionText> = {
  s1: { title: 'მოსწავლეთა რაოდენობა', desc: 'სკოლაში სულ ირიცხება' },
  s2: { title: 'ასაკობრივი ჯგუფები', desc: 'მოსწავლეები დაყოფილია ხუთ ასაკობრივ ჯგუფად' },
  s3: { title: 'სქესობრივ-ასაკობრივი სტრუქტურა', desc: 'ასაკობრივი პირამიდა: მარცხნივ ბიჭები, მარჯვნივ გოგოები' },
  s4: { title: 'რომელი ასაკია ყველაზე მეტი და ნაკლები?', desc: 'მწვანე სვეტი ყველაზე მეტია, წითელი ყველაზე ნაკლები' },
  s5: { title: 'რომელ კლასშია ყველაზე მეტი და ნაკლები მოსწავლე?', desc: 'ყველა კლასის (პარალელის) შედარება' },
  s6: { title: 'დაწყებითი, საბაზო და საშუალო საფეხური', desc: '1–4, 5–9 და 10–12 კლასები' },
  s7: { title: 'ტოპ 5 სახელი', desc: 'ყველაზე გავრცელებული სახელები' },
  s8: { title: 'ტოპ 5 გვარი', desc: 'ყველაზე გავრცელებული გვარები' },
  s9: { title: 'მოსწავლეები კუთხეების მიხედვით', desc: 'საქართველოს რომელი კუთხიდან არიან მოსწავლეთა ოჯახები' },
  s10: { title: 'მოსწავლეები უბნების მიხედვით', desc: 'თბილისის რომელ უბანში ცხოვრობენ მოსწავლეები' },
  s11: { title: 'მშობლიური ენა', desc: 'რა ენაზე ლაპარაკობენ სახლში' },
  s12: { title: 'ეროვნება', desc: 'მოსწავლეთა ეროვნული შემადგენლობა' },
  s13: { title: 'სქესთა შორის განაწილება კლასებში', desc: 'ბიჭები და გოგოები თითოეულ კლასში' },
  s14: { title: 'მოსწავლეთა სიმჭიდროვე', desc: 'რამდენი მოსწავლე მოდის ერთ კლასზე. რაც უფრო მუქია უჯრა, მით მეტი მოსწავლეა კლასში' },
  s15: { title: 'კლასის ბარათი', desc: 'აირჩიე კლასი და ნახე მისი მოსწავლეების მონაცემები' },
  vake: { title: 'ვაკე', desc: 'ჩვენი მოსწავლეების უდიდესი ნაწილი ვაკეში ცხოვრობს. აქ არის ვაკის პარკი, სადაც ბევრი მოსწავლე სეირნობს სკოლის შემდეგ.' },
  saburtalo: { title: 'საბურთალო', desc: 'მეორე ყველაზე დიდი უბანი. საბურთალო თბილისის ერთ-ერთი ყველაზე მჭიდროდ დასახლებული უბანია.' },
};

/** სტატისტიკის სექციები (ადმინში დამალვისთვის) */
export const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14', 's15'];
/** საწყისი კოდის PBKDF2 ჰეში. ეს მალავს კოდს, მაგრამ ნამდვილი დაცვა არ არის: შემოწმება ბრაუზერში ხდება */
export const DEFAULT_ADMIN_HASH = '8d96a3d3004ccec50f8665242d555fb9873525113f7c41cfd1e9a6fa7f92c27f';

export function defaultState(): SiteState {
  return {
    version: 3,
    brand: 'სკოლის პროექტები',
    logo: '',
    footer: 'სასკოლო პროექტი: ჩვენი სკოლის მოსწავლეების დემოგრაფიული პროფილი და მათი უბნები.',
    footerCopy: '© {year} · სასკოლო პროექტი',
    footerHeads: { projects: 'პროექტები', links: 'სწრაფი გადასვლა', info: 'ინფორმაცია' },
    footerInfo: [
      'მონაცემები: სკოლის Excel ფაილი ({total} მოსწავლე)',
      'სქესი განისაზღვრა სახელის მიხედვით, რადგან Excel-ში ეს სვეტი არ არის',
      'ფოტოები: Wikimedia Commons და Unsplash',
    ],
    brandColor: '#E8384F',
    adminCodeHash: DEFAULT_ADMIN_HASH,
    hidden: [],
    texts: structuredClone(DEFAULT_TEXTS),
    photos: { ...DEFAULT_PHOTOS },
    heroSlides: ['tbilisi', 'vake', 'svaneti', 'kakheti', 'samegrelo'].map(k => DEFAULT_PHOTOS[k]),
    students: structuredClone(STUDENTS),
    projects: [
      {
        id: 'school', kind: 'demography',
        title: 'სკოლის დემოგრაფიული პროფილი',
        eyebrow: 'პროექტი 01 · სტატისტიკა და უბნები',
        subtitle: 'ვინ სწავლობს ჩვენს სკოლაში და სად ცხოვრობს? მოსწავლეების ასაკი, სქესი, კლასები, სახელები, კუთხეები, უბნები, ენა და ეროვნება ერთ გვერდზე, მარტივ დიაგრამებში.',
        hero: '', accent: '#E8384F', sections: [],
      },
    ],
  };
}

/** ძველი (v1) მონაცემების გადაყვანა ახალ ფორმატზე: „ჩვენი უბნები“ გაერთიანდა დემოგრაფიასთან */
export function migrate(raw: any): SiteState {
  const d = defaultState();
  if (raw?.version === 1) {
    raw = { ...raw, version: 2, projects: (raw.projects ?? []).filter((p: Project) => p.id !== 'tbilisi') };
    const school = raw.projects.find((p: Project) => p.id === 'school');
    if (school) school.eyebrow = d.projects[0].eyebrow;
  }
  // v2 მონაცემებში იყო ნამდვილი სახელები: ძველი სია იცვლება ანონიმურით
  if (raw?.version === 2) {
    raw = { ...raw, version: 3, students: d.students, texts: { ...raw.texts, s8: d.texts['s8'] } };
  }
  if (raw?.version !== 3 || !Array.isArray(raw.projects)) return d;
  // ძველი აღწერა, როცა გვარები არ ჩანდა
  if (raw.texts?.s8?.desc?.includes('გვარები არ იწერება')) {
    raw = { ...raw, texts: { ...raw.texts, s8: d.texts['s8'] } };
  }
  // ძველ მონაცემებში კოდი ღიად ეწერა: ის იშლება და საწყისი კოდი ბრუნდება
  const { adminCode: _plainCode, ...rest } = raw;
  return {
    ...d, ...rest,
    texts: { ...d.texts, ...raw.texts },
    photos: { ...d.photos, ...raw.photos },
    hidden: raw.hidden ?? [],
    adminCodeHash: raw.adminCodeHash || DEFAULT_ADMIN_HASH,
    brandColor: raw.brandColor || d.brandColor,
    projects: raw.projects.length ? raw.projects : d.projects,
  };
}
