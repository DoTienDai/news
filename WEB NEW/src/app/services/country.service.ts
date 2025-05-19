import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CountryService {
    private selectedCountrySubject: BehaviorSubject<string> = new BehaviorSubject<string>('us');
    selectedCountry$: Observable<string> = this.selectedCountrySubject.asObservable();

    constructor() { }

    setSelectedCountry(country: string): void {
        this.selectedCountrySubject.next(country);
    }

    getSelectedCountry(): string {
        return this.selectedCountrySubject.getValue();
    }
}