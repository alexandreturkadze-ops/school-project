import { Component, computed, input } from '@angular/core';
import { IconComponent } from './icon.component';

/** ქვეყნის კოდი ეროვნების, ენის ან ქვეყნის სახელიდან */
const CODES: Record<string, string> = {
  // ეროვნება
  'ქართველი': 'ge', 'თურქი': 'tr', 'რუსი': 'ru', 'ინდოელი': 'in', 'გერმანელი': 'de', 'ირანელი': 'ir', 'უკრაინელი': 'ua',
  'პოლონელი': 'pl', 'ფრანგი': 'fr', 'სომეხი': 'am', 'ყაზახი': 'kz', 'აზერბაიჯანელი': 'az', 'ინგლისელი': 'gb',
  // ენა
  'ქართული': 'ge', 'თურქული': 'tr', 'რუსული': 'ru', 'ინდური': 'in', 'გერმანული': 'de', 'სპარსული': 'ir', 'უკრაინული': 'ua',
  'პოლონური': 'pl', 'ფრანგული': 'fr', 'სომხური': 'am', 'ყაზახური': 'kz', 'აზერბაიჯანული': 'az', 'ინგლისური': 'gb',
  // ქვეყანა
  'საქართველო': 'ge', 'თურქეთი': 'tr', 'რუსეთი': 'ru', 'ინდოეთი': 'in', 'გერმანია': 'de', 'ირანი': 'ir', 'ფერეიდანი': 'ir',
  'უკრაინა': 'ua', 'პოლონეთი': 'pl', 'საფრანგეთი': 'fr', 'სომხეთი': 'am', 'ყაზახეთი': 'kz', 'აზერბაიჯანი': 'az',
  'ინგლისი': 'gb', 'დიდი ბრიტანეთი': 'gb',
  // საქართველოს კუთხეები
  'იმერეთი': 'ge', 'კახეთი': 'ge', 'ქართლი': 'ge', 'სამეგრელო': 'ge', 'რაჭა': 'ge', 'გურია': 'ge', 'სვანეთი': 'ge',
  'მთიანეთი': 'ge', 'აჭარა': 'ge', 'სამცხე-ჯავახეთი': 'ge', 'თუშეთი': 'ge', 'ლეჩხუმი': 'ge', 'მოხევე': 'ge', 'ლაზეთი': 'tr',
};
export const flagCode = (name: string) => CODES[name?.trim()] ?? '';

/** პატარა დროშა (SVG), მაგ.: <app-flag name="თურქეთი" /> */
@Component({
  selector: 'app-flag',
  imports: [IconComponent],
  template: `
    @switch (code()) {
      @case ('ge') {
        <svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><rect x="13" width="4" height="20" fill="#E8112D"/><rect y="8" width="30" height="4" fill="#E8112D"/>
          @for (c of crosses; track $index) { <rect [attr.x]="c[0] - 0.7" [attr.y]="c[1] - 2.2" width="1.4" height="4.4" fill="#E8112D"/><rect [attr.x]="c[0] - 2.2" [attr.y]="c[1] - 0.7" width="4.4" height="1.4" fill="#E8112D"/> }
        </svg>
      }
      @case ('tr') {
        <svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#E30A17"/><circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.3" cy="10" r="4" fill="#E30A17"/>
          <polygon points="17.2,10 19.9,9.1 19.9,7.6 21.6,9 24.2,8.3 22.6,10 24.2,11.7 21.6,11 19.9,12.4 19.9,10.9" fill="#fff"/></svg>
      }
      @case ('ru') { <svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><rect y="6.67" width="30" height="6.67" fill="#0039A6"/><rect y="13.33" width="30" height="6.67" fill="#D52B1E"/></svg> }
      @case ('in') {
        <svg viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#FF9933"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><rect y="13.33" width="30" height="6.67" fill="#138808"/>
          <circle cx="15" cy="10" r="2.4" fill="none" stroke="#000080" stroke-width=".7"/><circle cx="15" cy="10" r=".5" fill="#000080"/></svg>
      }
      @case ('de') { <svg viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#000"/><rect y="6.67" width="30" height="6.67" fill="#DD0000"/><rect y="13.33" width="30" height="6.67" fill="#FFCE00"/></svg> }
      @case ('ir') {
        <svg viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#239F40"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><rect y="13.33" width="30" height="6.67" fill="#DA0000"/>
          <circle cx="15" cy="10" r="2" fill="none" stroke="#DA0000" stroke-width=".9"/></svg>
      }
      @case ('ua') { <svg viewBox="0 0 30 20"><rect width="30" height="10" fill="#0057B7"/><rect y="10" width="30" height="10" fill="#FFD700"/></svg> }
      @case ('pl') { <svg viewBox="0 0 30 20"><rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#DC143C"/></svg> }
      @case ('fr') { <svg viewBox="0 0 30 20"><rect width="10" height="20" fill="#0055A4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#EF4135"/></svg> }
      @case ('am') { <svg viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#D90012"/><rect y="6.67" width="30" height="6.67" fill="#0033A0"/><rect y="13.33" width="30" height="6.67" fill="#F2A800"/></svg> }
      @case ('kz') {
        <svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#00AFCA"/><circle cx="15" cy="8.5" r="3.2" fill="#FEC50C"/><path d="M10 13.2 Q15 11 20 13.2" stroke="#FEC50C" stroke-width="1" fill="none"/>
          <rect x="2" y="2" width="1.2" height="16" fill="#FEC50C" opacity=".85"/></svg>
      }
      @case ('az') {
        <svg viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#0092BC"/><rect y="6.67" width="30" height="6.67" fill="#E4002B"/><rect y="13.33" width="30" height="6.67" fill="#00AF66"/>
          <circle cx="14" cy="10" r="2.5" fill="#fff"/><circle cx="14.8" cy="10" r="2" fill="#E4002B"/><circle cx="17.6" cy="10" r=".9" fill="#fff"/></svg>
      }
      @case ('gb') {
        <svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.4"/>
          <path d="M15 0V20M0 10H30" stroke="#fff" stroke-width="6"/><path d="M15 0V20M0 10H30" stroke="#C8102E" stroke-width="3.4"/></svg>
      }
      @default { <span class="unknown"><app-icon name="globe" [size]="12" /></span> }
    }`,
  styles: [`
    :host{display:inline-flex;flex:none;width:var(--fw,24px);aspect-ratio:3/2;border-radius:3px;overflow:hidden;
      box-shadow:0 0 0 1px rgba(15,23,42,.12);vertical-align:middle;background:var(--soft)}
    svg{width:100%;height:100%;display:block}
    .unknown{width:100%;height:100%;display:grid;place-items:center;color:var(--muted)}
  `],
})
export class FlagComponent {
  readonly name = input('');
  readonly code = computed(() => flagCode(this.name()));
  readonly crosses = [[6.5, 4], [23.5, 4], [6.5, 16], [23.5, 16]];
}
