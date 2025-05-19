import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DataService } from '../../services/data.service';
import { HeaderComponent } from '../../components/header/header.component';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TruncatePipe } from '../../pipe/truncate.pipe';
import { Subscription } from 'rxjs';
import { Article } from '../../model/article.model';
import { NewService } from '../../services/news.service';
import { CountryService } from '../../services/country.service';

@Component({
  selector: 'app-news-content',
  standalone: true,
  imports: [HeaderComponent, DatePipe, TruncatePipe],
  templateUrl: './news-content.component.html',
  styleUrl: './news-content.component.scss',
})
export class NewsContentComponent implements OnInit, OnDestroy {
  defaultPathImage = '/assets/images/error404.png';
  article: Article | null = null;
  articles: Article[] = [];
  private routeSub!: Subscription;

  constructor(private dataService: DataService, private countryService: CountryService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const title = params['id'];
      this.route.queryParams.subscribe(queryParams => {
        const source = queryParams['source'];

        if (source === 'top-news') {
          const country = this.countryService.getSelectedCountry();
          this.dataService.getArticleByTopNew(country, title).subscribe(article => {
            this.article = article || null;
            this.dataService.searchMode = false;
          });
        } else {
          this.dataService.getArticleByTitle(title).subscribe(article => {
            this.article = article || null;
            this.dataService.searchMode = false;
          });
        }
      });
    });


    this.dataService.getArticleCategory().subscribe((articles: Article[]) => {
      this.articles = articles;
    });

    const nextElement = document.querySelector('.next');
    const prevElement = document.querySelector('.prev');

    if (nextElement) {
      nextElement.addEventListener('click', () => {
        const items = document.querySelectorAll('.item-content');
        if (items) {
          const slide = document.querySelector('.slide');
          if (slide) {
            slide.appendChild(items[0]);
          }
        }
      });
    }

    if (prevElement) {
      prevElement.addEventListener('click', () => {
        const items = document.querySelectorAll('.item-content');
        if (items) {
          const slide = document.querySelector('.slide');
          if (slide) {
            slide.prepend(items[items.length - 1]);
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  viewArticle(article: Article) {
    this.dataService.setArticle(article);
    this.router.navigate(['/news', article.title]);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultPathImage;
  }

}
