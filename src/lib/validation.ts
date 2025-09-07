// Input validation and sanitization utilities
export class ValidationUtils {
  // Sanitize HTML input to prevent XSS
  static sanitizeHtml(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  // Validate phone number (basic)
  static isValidPhone(phone: string): boolean {
    if (typeof phone !== 'string') return false;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone.trim());
  }

  // Validate required fields
  static validateRequired(data: any, fields: string[]): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];
    
    for (const field of fields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  // Validate string length
  static validateLength(input: string, min: number, max: number): boolean {
    if (typeof input !== 'string') return false;
    const length = input.trim().length;
    return length >= min && length <= max;
  }

  // Validate numeric input
  static isValidNumber(input: any, min?: number, max?: number): boolean {
    const num = Number(input);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
  }

  // Sanitize product data
  static sanitizeProductData(data: any): any {
    return {
      ...data,
      name: this.sanitizeHtml(data.name || ''),
      description: this.sanitizeHtml(data.description || ''),
      category: this.sanitizeHtml(data.category || ''),
      price: this.isValidNumber(data.price, 0, 999999) ? Number(data.price) : 0,
      stock: data.stock || {},
      image: this.sanitizeHtml(data.image || ''),
      colors: Array.isArray(data.colors) ? data.colors.map((c: any) => this.sanitizeHtml(c)) : [],
      sizes: Array.isArray(data.sizes) ? data.sizes.map((s: any) => this.sanitizeHtml(s)) : []
    };
  }

  // Sanitize order data
  static sanitizeOrderData(data: any): any {
    return {
      ...data,
      customerName: this.sanitizeHtml(data.customerName || ''),
      customerEmail: this.isValidEmail(data.customerEmail) ? data.customerEmail.trim() : '',
      customerPhone: this.isValidPhone(data.customerPhone) ? data.customerPhone.trim() : '',
      customerAddress: this.sanitizeHtml(data.customerAddress || ''),
      productName: this.sanitizeHtml(data.productName || ''),
      selectedSize: this.sanitizeHtml(data.selectedSize || ''),
      selectedColor: this.sanitizeHtml(data.selectedColor || ''),
      notes: this.sanitizeHtml(data.notes || ''),
      quantity: this.isValidNumber(data.quantity, 1, 100) ? Number(data.quantity) : 1,
      total: this.isValidNumber(data.total, 0, 999999) ? Number(data.total) : 0
    };
  }
}
