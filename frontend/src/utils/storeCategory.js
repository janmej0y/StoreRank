const CATEGORY_KEYWORDS = {
  'Coffee Shop': ['coffee', 'cafe', 'café', 'roaster', 'espresso'],
  Restaurant: ['restaurant', 'kitchen', 'diner', 'dining', 'eatery'],
  Bookstore: ['book', 'bookstore', 'library'],
  'Electronics Store': ['electronic', 'gadget', 'tech', 'mobile', 'bazaar electronics'],
  'Hardware Store': ['hardware', 'tool', 'supply depot'],
  'Clothing Store': ['fashion', 'apparel', 'clothing', 'boutique'],
  'Furniture Store': ['furniture', 'home decor', 'interiors'],
  'Jewelry Store': ['jewelry', 'jewellery', 'gems'],
  'Grocery Store': ['grocery', 'market', 'organic', 'fresh', 'farmers'],
  Bakery: ['bakery', 'bake', 'pastry'],
  Pharmacy: ['pharmacy', 'medical', 'health'],
  Gym: ['gym', 'fitness', 'workout'],
  Salon: ['salon', 'spa', 'beauty'],
  'Handicrafts & Gifts': ['handicraft', 'emporium', 'craft', 'gift'],
};

const FALLBACK_CATEGORY = 'General Store';

export function getStoreCategory(name) {
  const normalized = (name || '').toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }

  return FALLBACK_CATEGORY;
}

export { FALLBACK_CATEGORY };
