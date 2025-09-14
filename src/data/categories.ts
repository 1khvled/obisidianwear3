export interface Category {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'hoodies',
    name: 'hoodies',
    displayName: 'Hoodies',
    description: 'Comfortable and stylish hoodies'
  },
  {
    id: 'tshirts',
    name: 'tshirts',
    displayName: 'T-Shirts',
    description: 'Classic and trendy t-shirts'
  },
  {
    id: 'pants',
    name: 'pants',
    displayName: 'Pants',
    description: 'Various styles of pants and trousers'
  },
  {
    id: 'shoes',
    name: 'shoes',
    displayName: 'Shoes',
    description: 'Footwear for every occasion'
  },
  {
    id: 'accessories',
    name: 'accessories',
    displayName: 'Accessories',
    description: 'Stylish accessories to complete your look'
  },
  {
    id: 'underwear',
    name: 'underwear',
    displayName: 'Underwear',
    description: 'Comfortable and quality underwear'
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(category => category.id === id);
};

export const getCategoryByName = (name: string): Category | undefined => {
  return CATEGORIES.find(category => category.name === name);
};
