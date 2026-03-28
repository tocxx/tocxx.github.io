import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  get(key: string) {
    return localStorage.getItem(`tocxxio-${key}`);
  }

  set(key: string, data: any) {
    localStorage.setItem(`tocxxio-${key}`, JSON.stringify(data));
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}
