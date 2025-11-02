

export class ResponseDataValidator {
  /**
   * Проверяет, что все обязательные поля объекта присутствуют и не пусты.
   * Работает рекурсивно — проверяет вложенные объекты/массивы.
   * @returns true, если все обязательные поля присутствуют и не пусты
   */

  static validateRequiredFields<T extends Record<string, any>>(template: T, data: any): boolean {
    if (Array.isArray(data)) {
      // Проверяем каждый элемент массива
      return data.every(item => this.validateRequiredFields(template, item));
    }

    if (typeof data !== 'object' || data === null) return false;

    for (const key of Object.keys(template)) {
      const expected = template[key];
      const value = data[key];

      // Ключ отсутствует
      if (!(key in data)) return false;

      // Проверяем пустые значения
      if (this.isEmpty(value)) return false;

      // Если ожидается объект — проверяем рекурсивно
      if (typeof expected === 'object' && !Array.isArray(expected)) {
        if (!this.validateRequiredFields(expected, value)) return false;
      }

      // Если ожидается массив
      if (Array.isArray(expected)) {
        if (!Array.isArray(value) || value.length === 0) return false;
        for (const item of value) {
          if (typeof expected[0] === 'object') {
            if (!this.validateRequiredFields(expected[0], item)) return false;
          } else if (this.isEmpty(item)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private static isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
  }//Вспомогательная функция — проверяет, что значение пустое.
}
