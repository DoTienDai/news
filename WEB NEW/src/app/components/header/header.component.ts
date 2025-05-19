import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NewService } from '../../services/news.service';
import { DataService } from '../../services/data.service';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CountryService } from '../../services/country.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { Article } from '../../model/article.model';
import { TruncatePipe } from '../../pipe/truncate.pipe';
import { SharedService } from '../../shared/shared.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, TruncatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  activeCategory = 'general';
  countries = [
    { code: 'us', name: 'Hoa Kỳ' },
    { code: 'jp', name: 'Nhật Bản' },
    { code: 'ar', name: 'Argentina' },
    { code: 'au', name: 'Australia' },
    { code: 'ca', name: 'Canada' },
    { code: 'fr', name: 'Pháp' },
    { code: 'cn', name: 'Trung Quốc' },
    { code: 'hk', name: 'Hồng Kông' },
    { code: 'id', name: 'Indonesia' },
    { code: 'ie', name: 'Ireland' },
    { code: 'in', name: 'Ấn độ' },
    { code: 'it', name: 'Italia' },
    { code: 'gb', name: 'Anh' },
  ];
  selectedCountry = 'us';
  @Output() searchEvent = new EventEmitter<string>();
  searchTerm$ = new Subject<string>();
  resultSearch: Article[] = [];
  defaultPathImage = '/assets/images/error404.png';

  constructor(
    private newsService: NewService,
    private dataService: DataService,
    private countryService: CountryService,
    public darkModeService: DarkModeService,
    private sharedService: SharedService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const activeCategoryString = localStorage.getItem('activeCategory');
      this.activeCategory = activeCategoryString
        ? JSON.parse(activeCategoryString)
        : 'general';
    });

    this.searchTerm$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(term => term ? this.newsService.search(term) : [])
    )
      .subscribe(data => {
        this.newsService.updateHome(data);
        this.resultSearch = data.articles;
        this.dataService.searchMode = true;
      });

    this.sharedService.resetSearch$.subscribe(reset => {
      if (reset) {
        this.resetSearchData();
        this.sharedService.clearResetSearch();
      }
    });
  }

  ngOnInit(): void {
    const activeCategoryString = localStorage.getItem('activeCategory');
    this.activeCategory = activeCategoryString
      ? JSON.parse(activeCategoryString)
      : 'general';

    if (this.router.url === '/home') {
      this.fetchNewsByCategory(null, this.activeCategory, 'Tổng hợp');
    }

    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      this.selectedCountry = savedCountry;
    }
  }

  toggleDarkMode() {
    this.darkModeService.updateDarkMode();
  }

  fetchNewsByCategory(event: Event | null, category: string, nameCategory: string) {
    if (event) {
      event.preventDefault();
    }
    this.newsService.getNewsByCategoryAndCountry(category, this.selectedCountry).subscribe({
      next: (respone: any) => {
        this.activeCategory = category;
        localStorage.setItem('activeCategory', JSON.stringify(category));
        this.dataService.categoryName = nameCategory;
        // thuc hien luu vao localStorage cho category name khi chuyen trang thai qua lai
        localStorage.setItem('nameCategory', JSON.stringify(nameCategory));
        this.dataService.setArticleCategory(respone.articles);
        this.dataService.setArticles(respone.articles);
        if (this.router.url !== '/home' && this.router.url !== '/') {
          this.router.navigate(['/home']);
        }
      },
      error: (error: any) => {
        console.log('Fetch news by category error: ', error);
      },
      complete: () => {
        console.log('Request complete');
      },
    });
  }

  onCountryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCountry = selectElement.value;
    this.fetchNewsByCategory(null, this.activeCategory, 'Tổng hợp');
    this.countryService.setSelectedCountry(this.selectedCountry);
    localStorage.setItem('selectedCountry', this.selectedCountry);
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.trim();
    if (searchTerm.length > 0) {
      this.searchTerm$.next(searchTerm);
    } else {
      this.resetSearchData();
    }
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultPathImage;
  }

  viewArticle(article: any) {
    this.dataService.setArticle(article);
    this.router.navigate(['/news', article.title]);
    this.resetSearchData();
  }

  resetSearchData() {
    this.newsService.resetSearch();
    this.resultSearch = [];
  }
}
