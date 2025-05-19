import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, tap } from "rxjs";
import { Article } from "../model/article.model";

@Injectable({ providedIn: 'root' })
export class NewService {
    articles: Article[] = [];
    private apiKey = 'e9569a324a564f079942243aa405fc90';
    private apiUrl = 'https://newsapi.org/v2/top-headlines';
    private apiUrlSearch = 'https://newsapi.org/v2/everything';
    private searchDataSubject = new BehaviorSubject<any>(null);
    private searchData$ = this.searchDataSubject.asObservable();

    constructor(private http: HttpClient) { }

    getTopHeadLines(country: string): Observable<any> {
        const cachedData = localStorage.getItem(`topHeadLines_${country}`);
        if (cachedData) {
            return of(JSON.parse(cachedData));
        } else {
            const params = new HttpParams()
                .set('country', country)
                .set('apiKey', this.apiKey);

            return this.http.get<any>(this.apiUrl, { params })
                .pipe(tap(data => {
                    localStorage.setItem(`topHeadLines_${country}`, JSON.stringify(data));
                })
                );
        }
    }

    getNewsByCategoryAndCountry(category: string, country: string): Observable<any> {
        const params = new HttpParams()
            .set('category', category)
            .set('country', country)
            .set('apiKey', this.apiKey);

        return this.http.get<any>(this.apiUrl, { params });
    }


    saveArticle(articles: []) {
        this.articles = articles;
    }

    search(term: string): Observable<any> {
        const params = new HttpParams()
            .set('q', term)
            .set('apiKey', this.apiKey);
        return this.http.get<any>(this.apiUrlSearch, { params });
    }

    updateHome(data: any): void {
        this.searchDataSubject.next(data);
    }

    resetSearch(): void {
        this.searchDataSubject.next(null);
    }

    getSearchData() {
        return this.searchData$;
    }
}