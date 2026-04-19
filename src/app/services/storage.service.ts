import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StorageService {
  get(key: string) {
    let value = localStorage.getItem(`tocxxio-${key}`);
    console.log(key);
    console.log(value);
    if (value) return JSON.parse(value);
    return undefined;
  }

  set(key: string, data: any) {
    localStorage.setItem(`tocxxio-${key}`, JSON.stringify(data));
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}
