import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class ResponseDataValidatorService {
  /**
   * Проверяет, что все обязательные поля объекта присутствуют и не пусты.
   * Работает рекурсивно — проверяет и вложенные объекты/массивы.
   * @param obj объект для проверки
   * @returns true, если все обязательные поля присутствуют и не пусты
   */
  validateRequiredFields<T extends Record<string, any>>(obj: T): boolean {
    if (!obj || typeof obj !== 'object') return false;

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (this.isEmpty(value)) {
        // если поле пустое — сразу false
        return false;
      }

      // если значение — объект, проверяем рекурсивно
      if (typeof value === 'object' && !Array.isArray(value)) {
        const isValid = this.validateRequiredFields(value);
        if (!isValid) return false;
      }

      // если значение — массив, проверяем, что он не пуст
      if (Array.isArray(value)) {
        if (value.length === 0) return false;

        // проверяем элементы массива (если это объекты)
        for (const item of value) {
          if (typeof item === 'object') {
            const isValid = this.validateRequiredFields(item);
            if (!isValid) return false;
          } else if (this.isEmpty(item)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
  }//Вспомогательная функция — проверяет, что значение пустое.
}
