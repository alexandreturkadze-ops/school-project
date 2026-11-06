import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../core/store.service';
import { IconComponent } from '../components/icon.component';
import { LogoComponent } from '../components/logo.component';
import { IconName } from '../core/icons';
import { computeStats } from '../core/stats';

/** საიტის ქვედა ნაწილი */
@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent, LogoComponent],
  template: `
    <footer class="footer">
      <div class="stripe"><i style="background:var(--c1)"></i><i style="background:var(--c2)"></i><i style="background:var(--c3)"></i><i style="background:var(--c4)"></i><i style="background:var(--c5)"></i><i style="background:var(--c6)"></i></div>
      <div class="inner">
        <div class="col brand-col">
          <a class="brand" routerLink="/"><app-logo [size]="38" />{{ store.state().brand }}</a>
          <p>{{ store.state().footer }}</p>
          <div class="nums">
            <div><b>{{ st().total }}</b><span>მოსწავლე</span></div>
            <div><b>{{ st().density.classCount }}</b><span>კლასი</span></div>
            <div><b>{{ st().districts.length }}</b><span>უბანი</span></div>
          </div>
        </div>

        <div class="col">
          <h4>{{ store.state().footerHeads.projects }}</h4>
          <ul>
            @for (p of store.projects(); track p.id) {
              <li><a [routerLink]="['/p', p.id]"><app-icon name="chevron-right" [size]="14" />{{ p.title }}</a></li>
            }
          </ul>
        </div>

        <div class="col">
          <h4>{{ store.state().footerHeads.links }}</h4>
          <ul class="two">
            @for (l of links; track l.id) {
              <li><a [routerLink]="['/p', store.projects()[0]?.id]" [fragment]="l.id" (click)="go(l.id)">{{ l.t }}</a></li>
            }
          </ul>
        </div>

        <div class="col">
          @if (info().length) {
            <h4>{{ store.state().footerHeads.info }}</h4>
            <ul class="info">
              @for (l of info(); track $index) {
                <li><app-icon [name]="l.icon" [size]="16" /><span>{{ l.text }}</span></li>
              }
            </ul>
          }
        </div>
      </div>
      <div class="bottom">
        <span>{{ copy() }}</span>
        <div class="bottom-actions">
          <button (click)="store.toggleTheme()"><app-icon [name]="store.dark() ? 'sun' : 'moon'" [size]="15" />{{ store.dark() ? 'ღია ფონი' : 'მუქი ფონი' }}</button>
          <a routerLink="/admin"><app-icon name="lock" [size]="15" />ადმინი</a>
          <button (click)="top()"><app-icon name="top" [size]="15" />თავში</button>
        </div>
      </div>
    </footer>`,
  styles: [`
    .footer{background:#0B1426;color:#C9D1E3;margin-top:72px}
    :host-context([data-theme=dark]) .footer{background:#070B15;border-top:1px solid var(--line)}
    .stripe{display:flex;height:4px} .stripe i{flex:1}
    .inner{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1.3fr 1.3fr;gap:36px;
      padding:56px max(16px,env(safe-area-inset-right,0px)) 40px max(16px,env(safe-area-inset-left,0px))}
    .col{min-width:0}
    .brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-family:var(--f-display);font-weight:700;font-size:1.15rem}
    p{line-height:1.7;margin:16px 0 20px;font-size:.92rem;color:#94A0BA;max-width:42ch}
    .nums{display:flex;gap:10px}
    .nums div{flex:1;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
    .nums b{display:block;color:#fff;font-size:1.3rem;font-variant-numeric:tabular-nums} .nums span{font-size:.75rem;color:#94A0BA}
    h4{margin:4px 0 16px;color:#fff;font-size:.8rem;letter-spacing:.08em;font-weight:700}
    ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}
    ul.two{grid-template-columns:1fr 1fr;column-gap:14px}
    a{color:#C9D1E3;text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-size:.9rem;transition:color .15s}
    a:hover{color:#fff}
    .info li{display:flex;gap:10px;font-size:.86rem;line-height:1.5;color:#94A0BA} .info app-icon{margin-top:2px;color:var(--brand)}
    .bottom{max-width:1240px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;
      border-top:1px solid rgba(255,255,255,.08);font-size:.82rem;color:#7C88A3;
      padding:18px max(16px,env(safe-area-inset-right,0px)) calc(18px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}
    .bottom-actions{display:flex;gap:6px;flex-wrap:wrap}
    .bottom-actions button,.bottom-actions a{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:9px;font-size:.82rem;
      background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:#C9D1E3}
    .bottom-actions button:hover,.bottom-actions a:hover{background:rgba(255,255,255,.12);color:#fff}
    @media (max-width:980px){.inner{grid-template-columns:1fr 1fr}}
    @media (max-width:600px){.inner{grid-template-columns:1fr;gap:28px;padding-top:40px}.bottom{flex-direction:column;align-items:flex-start}}
  `],
})
export class FooterComponent {
  store = inject(StoreService);
  readonly st = computed(() => computeStats(this.store.students()));
  readonly copy = computed(() => this.store.state().footerCopy.replaceAll('{year}', String(new Date().getFullYear())));
  private readonly infoIcons: IconName[] = ['sheet', 'info', 'image'];
  readonly info = computed(() => this.store.state().footerInfo
    .map((t, i) => ({ text: t.replaceAll('{total}', String(this.st().total)), icon: this.infoIcons[i] }))
    .filter(l => l.text.trim()));
  readonly links = [
    { id: 's1', t: 'რაოდენობა' }, { id: 's3', t: 'პირამიდა' }, { id: 's5', t: 'კლასები' }, { id: 's7', t: 'სახელები' },
    { id: 's9', t: 'კუთხეები' }, { id: 's10', t: 'უბნები' }, { id: 's12', t: 'ეროვნება' }, { id: 's15', t: 'კლასის ბარათი' },
  ];
  go(id: string) { setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60); }
  top() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
