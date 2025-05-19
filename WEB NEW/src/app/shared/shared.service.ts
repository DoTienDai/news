import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SharedService {
    private resetSearchSource = new BehaviorSubject<boolean>(false);
    resetSearch$ = this.resetSearchSource.asObservable();

    resetSearch() {
        this.resetSearchSource.next(true);
    }

    clearResetSearch() {
        this.resetSearchSource.next(false);
    }
}
