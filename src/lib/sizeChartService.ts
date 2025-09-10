// Size Chart Service - Manages default size charts and custom product size charts
export interface SizeMeasurement {
  size: string;
  [key: string]: string | number;
}

export interface SizeChartData {
  title: string;
  measurements: SizeMeasurement[];
  instructions: string;
  category: string;
}

export interface SizeChartCategory {
  id: string;
  name: string;
  defaultChart: SizeChartData;
  measurementKeys: string[];
  measurementLabels: string[];
}

// Default size chart categories with their standard measurements
export const SIZE_CHART_CATEGORIES: Record<string, SizeChartCategory> = {
  't-shirts': {
    id: 't-shirts',
    name: 'T-Shirts',
    measurementKeys: ['chest', 'length', 'shoulder'],
    measurementLabels: ['Chest (cm)', 'Length (cm)', 'Shoulder (cm)'],
    defaultChart: {
      title: 'T-Shirts Size Chart',
      category: 't-shirts',
      instructions: 'Measure your chest at the fullest part, length from shoulder to hem, and shoulder from seam to seam.',
      measurements: [
        { size: 'XS', chest: 86, length: 66, shoulder: 42 },
        { size: 'S', chest: 91, length: 68, shoulder: 44 },
        { size: 'M', chest: 96, length: 70, shoulder: 46 },
        { size: 'L', chest: 101, length: 72, shoulder: 48 },
        { size: 'XL', chest: 106, length: 74, shoulder: 50 },
        { size: 'XXL', chest: 111, length: 76, shoulder: 52 },
        { size: 'XXXL', chest: 116, length: 78, shoulder: 54 }
      ]
    }
  },
  'hoodies': {
    id: 'hoodies',
    name: 'Hoodies',
    measurementKeys: ['chest', 'length', 'shoulder', 'sleeve'],
    measurementLabels: ['Chest (cm)', 'Length (cm)', 'Shoulder (cm)', 'Sleeve (cm)'],
    defaultChart: {
      title: 'Hoodies Size Chart',
      category: 'hoodies',
      instructions: 'Measure your chest at the fullest part, length from shoulder to hem, shoulder from seam to seam, and sleeve from shoulder to cuff.',
      measurements: [
        { size: 'XS', chest: 88, length: 68, shoulder: 43, sleeve: 60 },
        { size: 'S', chest: 93, length: 70, shoulder: 45, sleeve: 62 },
        { size: 'M', chest: 98, length: 72, shoulder: 47, sleeve: 64 },
        { size: 'L', chest: 103, length: 74, shoulder: 49, sleeve: 66 },
        { size: 'XL', chest: 108, length: 76, shoulder: 51, sleeve: 68 },
        { size: 'XXL', chest: 113, length: 78, shoulder: 53, sleeve: 70 },
        { size: 'XXXL', chest: 118, length: 80, shoulder: 55, sleeve: 72 }
      ]
    }
  },
  'pants': {
    id: 'pants',
    name: 'Pants',
    measurementKeys: ['waist', 'length'],
    measurementLabels: ['Waist (cm)', 'Length (cm)'],
    defaultChart: {
      title: 'Pants Size Chart',
      category: 'pants',
      instructions: 'Measure your waist at the narrowest part and length from waist to hem.',
      measurements: [
        { size: 'XS', waist: 71, length: 102 },
        { size: 'S', waist: 76, length: 104 },
        { size: 'M', waist: 81, length: 106 },
        { size: 'L', waist: 86, length: 108 },
        { size: 'XL', waist: 91, length: 110 },
        { size: 'XXL', waist: 96, length: 112 },
        { size: 'XXXL', waist: 101, length: 114 }
      ]
    }
  },
  'shoes': {
    id: 'shoes',
    name: 'Shoes',
    measurementKeys: ['footLength', 'footWidth'],
    measurementLabels: ['Foot Length (cm)', 'Foot Width (cm)'],
    defaultChart: {
      title: 'Shoes Size Chart',
      category: 'shoes',
      instructions: 'Measure your foot length from heel to toe and width at the widest part.',
      measurements: [
        { size: '36', footLength: 23, footWidth: 8.5 },
        { size: '37', footLength: 23.5, footWidth: 8.7 },
        { size: '38', footLength: 24, footWidth: 8.9 },
        { size: '39', footLength: 24.5, footWidth: 9.1 },
        { size: '40', footLength: 25, footWidth: 9.3 },
        { size: '41', footLength: 25.5, footWidth: 9.5 },
        { size: '42', footLength: 26, footWidth: 9.7 },
        { size: '43', footLength: 26.5, footWidth: 9.9 },
        { size: '44', footLength: 27, footWidth: 10.1 },
        { size: '45', footLength: 27.5, footWidth: 10.3 }
      ]
    }
  },
  'watches': {
    id: 'watches',
    name: 'Watches',
    measurementKeys: ['wrist', 'bandWidth'],
    measurementLabels: ['Wrist (cm)', 'Band Width (cm)'],
    defaultChart: {
      title: 'Watches Size Chart',
      category: 'watches',
      instructions: 'Measure your wrist circumference and the desired band width.',
      measurements: [
        { size: 'S', wrist: 15, bandWidth: 20 },
        { size: 'M', wrist: 16, bandWidth: 22 },
        { size: 'L', wrist: 17, bandWidth: 24 },
        { size: 'XL', wrist: 18, bandWidth: 26 }
      ]
    }
  }
};

class SizeChartService {
  /**
   * Get all available size chart categories
   */
  getCategories(): SizeChartCategory[] {
    return Object.values(SIZE_CHART_CATEGORIES);
  }

  /**
   * Get a specific category by ID
   */
  getCategory(categoryId: string): SizeChartCategory | null {
    return SIZE_CHART_CATEGORIES[categoryId] || null;
  }

  /**
   * Get the default size chart for a category
   */
  getDefaultChart(categoryId: string): SizeChartData | null {
    const category = this.getCategory(categoryId);
    return category ? category.defaultChart : null;
  }

  /**
   * Get measurement keys for a category
   */
  getMeasurementKeys(categoryId: string): string[] {
    const category = this.getCategory(categoryId);
    return category ? category.measurementKeys : ['chest', 'length', 'shoulder'];
  }

  /**
   * Get measurement labels for a category
   */
  getMeasurementLabels(categoryId: string): string[] {
    const category = this.getCategory(categoryId);
    return category ? category.measurementLabels : ['Chest (cm)', 'Length (cm)', 'Shoulder (cm)'];
  }

  /**
   * Create a custom size chart for a product based on category defaults
   */
  createCustomChart(categoryId: string, productName: string): SizeChartData {
    const defaultChart = this.getDefaultChart(categoryId);
    if (!defaultChart) {
      throw new Error(`Category ${categoryId} not found`);
    }

    return {
      ...defaultChart,
      title: `${productName} Size Chart`,
      instructions: `Instructions for measuring ${productName.toLowerCase()}`
    };
  }

  /**
   * Validate size chart data
   */
  validateSizeChart(chart: SizeChartData, categoryId: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const category = this.getCategory(categoryId);
    
    if (!category) {
      errors.push(`Invalid category: ${categoryId}`);
      return { isValid: false, errors };
    }

    if (!chart.title || chart.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!chart.instructions || chart.instructions.trim() === '') {
      errors.push('Instructions are required');
    }

    if (!chart.measurements || chart.measurements.length === 0) {
      errors.push('At least one size measurement is required');
    }

    // Validate each measurement
    chart.measurements.forEach((measurement, index) => {
      if (!measurement.size || measurement.size.trim() === '') {
        errors.push(`Size ${index + 1}: Size name is required`);
      }

      // Check that all required measurement keys are present
      category.measurementKeys.forEach(key => {
        if (measurement[key] === undefined || measurement[key] === null) {
          errors.push(`Size ${index + 1}: ${key} measurement is required`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get the appropriate size chart for a product (custom or default)
   */
  getProductSizeChart(
    product: { 
      sizeChartCategory?: string; 
      customSizeChart?: SizeChartData; 
      useCustomSizeChart?: boolean;
      category?: string;
    }
  ): SizeChartData | null {
    const categoryId = product.sizeChartCategory || product.category || 't-shirts';
    
    // If product has custom size chart and it's enabled, use it
    if (product.useCustomSizeChart && product.customSizeChart) {
      return product.customSizeChart;
    }
    
    // Otherwise use the default chart for the category
    return this.getDefaultChart(categoryId);
  }
}

export const sizeChartService = new SizeChartService();
