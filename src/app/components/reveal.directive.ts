import { Directive, ElementRef, OnInit } from '@angular/core';

/** სექციის რბილი გამოჩენა სქროლისას (თუ ანიმაცია ჩართულია) */
@Directive({ selector: '[reveal]' })
export class RevealDirective implements OnInit {
  constructor(private el: ElementRef<HTMLElement>) {}
  ngOnInit() {
    const el = this.el.nativeElement;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight) return; // უკვე ჩანს ეკრანზე
    el.classList.add('reveal');
    const io = new IntersectionObserver(e => {
      if (e[0].isIntersecting) { el.classList.add('visible'); io.disconnect(); }
    }, { threshold: 0.05 });
    io.observe(el);
  }
}
