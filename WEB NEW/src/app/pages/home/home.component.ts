import { DatePipe } from '@angular/common';
import { TruncatePipe } from '../../pipe/truncate.pipe';
import { NewService } from '../../services/news.service';
import { HeaderComponent } from './../../components/header/header.component';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { Article } from '../../model/article.model';
import { CountryService } from '../../services/country.service';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, DatePipe, TruncatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {

  articles: Article[] = [];
  articleCategory: Article[] = [];
  defaultPathImage = '/assets/images/error404.png';
  selectedName = 'Tổng quan';
  selectedCountry = 'us';
  searchData: Article[] = [];
  displayedSearchData: Article[] = [];
  isSearching: boolean = false;
  isLoading = false;
  private increment = 20;
  currentIndex = 0;

  @ViewChild('containerTopNews', { static: false }) containerTopNews!: ElementRef;

  constructor(
    private newsService: NewService,
    private dataService: DataService,
    private countryService: CountryService,
    private sharedService: SharedService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.dataService.getArticleCategory().subscribe((articles: Article[]) => {
      const nameCategory = localStorage.getItem('nameCategory');
      this.selectedName =
        typeof nameCategory === 'string' ? JSON.parse(nameCategory) : 'Tổng hợp';
      this.isSearching = false;
      this.articleCategory = articles;
    });

    this.countryService.selectedCountry$.subscribe(country => {
      this.selectedCountry = country;
      this.getTopHeadLines();
    });

    this.newsService.getSearchData().subscribe(data => {
      if (data && data.articles) {
        this.isLoading = true;
        setTimeout(() => {
          this.isSearching = true;
          this.searchData = data.articles;
          this.currentIndex = 0;
          this.displayedSearchData = this.searchData.slice(0, this.increment);
          // cap nhat lai de lay du lieu theo title
          this.dataService.setArticles(data.articles);
          this.isLoading = false;
        }, 1000);
      } else {
        this.isSearching = false;
      }
    })
  }


  loadMore() {
    if (this.currentIndex < this.searchData.length) {
      this.isLoading = true;
      setTimeout(() => {
        this.currentIndex += this.increment;
        const newItem = this.searchData.slice(this.currentIndex, this.currentIndex + this.increment);
        this.displayedSearchData = [...this.displayedSearchData, ...newItem];
        this.isLoading = false;
      }, 1000);
    }
  }

  getTopHeadLines() {
    this.newsService.getTopHeadLines(this.selectedCountry).subscribe({
      next: (respone: any) => {
        this.articles = respone.articles;
      },
      error: (error) => {
        console.error('Error fetching top headlines: ', error);
      },
      complete: () => {
        console.log('Resquest complete');
      },
    });
  }

  ngAfterViewInit() {
    if (this.containerTopNews) {
      const container = this.containerTopNews.nativeElement;
      container.addEventListener('mousemove', this.onMouseMove.bind(this));
    }
  }

  onMouseMove(event: MouseEvent) {
    const screenWidth = window.innerWidth;
    const percentMoveX = (event.clientX / screenWidth) * 100;

    const topnews = this.containerTopNews.nativeElement.querySelector('.topnews');
    topnews.style.transform = `translateX(-${percentMoveX}%)`;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultPathImage;
  }

  viewArticle(article: any) {
    this.dataService.setArticle(article);
    this.router.navigate(['/news', article.title]);
    this.sharedService.resetSearch();
  }

  viewArticleTopNew(article: any) {
    this.dataService.setArticle(article);
    this.router.navigate(['/news', article.title], { queryParams: { source: 'top-news' } });
    this.sharedService.resetSearch();
  }
}
