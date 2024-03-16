import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  loading: boolean = false;

  constructor() { }

  showLoader(loader: boolean) {
    this.loading = loader
  }
}
