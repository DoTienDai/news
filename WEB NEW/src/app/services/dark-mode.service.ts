import { Injectable, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {

  darkModeSignal = signal<string>(
    JSON.parse(localStorage.getItem('darkModeSignal') ?? 'null')
  );

  updateDarkMode() {
    this.darkModeSignal.update(value => (value === "dark" ? "null" : "dark"));
  }

  constructor() {
    effect(() => {
      localStorage.setItem('darkModeSignal', JSON.stringify(this.darkModeSignal()));
    });
  }
}
