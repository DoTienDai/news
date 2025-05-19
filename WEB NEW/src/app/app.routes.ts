import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { NewsContentComponent } from './pages/news-content/news-content.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'news/:id', component: NewsContentComponent },
];
