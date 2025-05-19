import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { Article } from '../model/article.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  categoryName!: string;
  private article: Article | null = null;
  private articles: Article[] = [];
  searchMode: boolean = false;
  private _articleCategory: BehaviorSubject<Article[]> = new BehaviorSubject<Article[]>(
    []
  );
  private articleCategory$: Observable<Article[]> =
    this._articleCategory.asObservable();

  constructor() { }

  setArticle(article: Article) {
    this.article = article;
    localStorage.setItem('currentArticle', JSON.stringify(article));
  }

  getArticle() {
    const article = localStorage.getItem('currentArticle');
    return article ? JSON.parse(article) : null;
  }

  setArticles(articles: Article[]) {
    this.articles = articles;
    localStorage.setItem('articles', JSON.stringify(articles));
  }

  getArticles() {
    const articles = localStorage.getItem('articles');
    return articles ? JSON.parse(articles) : [];
  }

  getArticleByTitle(title: string): Observable<Article | undefined> {
    if (this.searchMode) {
      const articles = this.getArticles();
      return of(articles.find((article: Article) => article.title === title));
    }

    return this.articleCategory$.pipe(
      map(articles => articles.find((article: Article) => article.title === title))
    );
  }

  getArticleByTopNew(country: String, title: string): Observable<Article | undefined> {
    const saveData = localStorage.getItem(`topHeadLines_${country}`);
    const articles = saveData ? JSON.parse(saveData).articles : [];

    const article = articles.find((articleData: Article) => articleData.title === title);
    return of(article);
  }

  setArticleCategory(articles: Article[]): void {
    this._articleCategory.next(articles);
    localStorage.setItem('articleCategory', JSON.stringify(articles));
  }

  getArticleCategory(): Observable<Article[]> {
    const storedArticles = localStorage.getItem('articleCategory');
    if (storedArticles) {
      this._articleCategory.next(JSON.parse(storedArticles));
    }
    return this.articleCategory$;
  }
}
