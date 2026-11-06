import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { StoreService } from './core/store.service';

/** მთავარი გვერდი = სიაში პირველი პროექტი */
const firstProject = () => 'p/' + (inject(StoreService).projects()[0]?.id ?? 'school');
import { ProjectPage } from './pages/project.page';
import { AdminPage } from './pages/admin.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: firstProject },
  { path: 'p/:id', component: ProjectPage },
  { path: 'admin', component: AdminPage },
  { path: '**', redirectTo: firstProject },
];
