/**
 * Crop Master Data — 89 India-relevant crop types.
 * Source: crop_types_india_90.csv
 *
 * Categories: Cereal, Pulse, Oilseed, Cash Crop, Fiber Crop,
 *             Plantation, Spice, Vegetable, Tuber, Fruit
 */

export const CROP_CATEGORIES = [
  'Cereal', 'Pulse', 'Oilseed', 'Cash Crop', 'Fiber Crop',
  'Plantation', 'Spice', 'Vegetable', 'Tuber', 'Fruit',
];

export const CROPS = [
  // Cereals (15)
  { name: 'Paddy', category: 'Cereal' },
  { name: 'Wheat', category: 'Cereal' },
  { name: 'Maize', category: 'Cereal' },
  { name: 'Barley', category: 'Cereal' },
  { name: 'Sorghum (Jowar)', category: 'Cereal' },
  { name: 'Pearl Millet (Bajra)', category: 'Cereal' },
  { name: 'Finger Millet (Ragi)', category: 'Cereal' },
  { name: 'Foxtail Millet', category: 'Cereal' },
  { name: 'Little Millet', category: 'Cereal' },
  { name: 'Kodo Millet', category: 'Cereal' },
  { name: 'Barnyard Millet', category: 'Cereal' },
  { name: 'Proso Millet', category: 'Cereal' },
  { name: 'Browntop Millet', category: 'Cereal' },
  { name: 'Oat', category: 'Cereal' },
  { name: 'Buckwheat', category: 'Cereal' },
  // Pulses (9)
  { name: 'Red Gram (Tur/Arhar)', category: 'Pulse' },
  { name: 'Black Gram (Urad)', category: 'Pulse' },
  { name: 'Green Gram (Moong)', category: 'Pulse' },
  { name: 'Bengal Gram (Chickpea/Chana)', category: 'Pulse' },
  { name: 'Lentil (Masoor)', category: 'Pulse' },
  { name: 'Field Pea', category: 'Pulse' },
  { name: 'Cowpea (Lobia)', category: 'Pulse' },
  { name: 'Horse Gram', category: 'Pulse' },
  { name: 'Moth Bean', category: 'Pulse' },
  // Oilseeds (9)
  { name: 'Soybean', category: 'Oilseed' },
  { name: 'Groundnut', category: 'Oilseed' },
  { name: 'Sunflower', category: 'Oilseed' },
  { name: 'Sesame', category: 'Oilseed' },
  { name: 'Mustard', category: 'Oilseed' },
  { name: 'Safflower', category: 'Oilseed' },
  { name: 'Castor', category: 'Oilseed' },
  { name: 'Linseed', category: 'Oilseed' },
  { name: 'Niger Seed', category: 'Oilseed' },
  // Cash Crops (3)
  { name: 'Cotton', category: 'Cash Crop' },
  { name: 'Sugarcane', category: 'Cash Crop' },
  { name: 'Tobacco', category: 'Cash Crop' },
  // Fiber Crops (2)
  { name: 'Jute', category: 'Fiber Crop' },
  { name: 'Mesta', category: 'Fiber Crop' },
  // Plantation (5)
  { name: 'Tea', category: 'Plantation' },
  { name: 'Coffee', category: 'Plantation' },
  { name: 'Coconut', category: 'Plantation' },
  { name: 'Arecanut', category: 'Plantation' },
  { name: 'Rubber', category: 'Plantation' },
  // Spices (11)
  { name: 'Pepper', category: 'Spice' },
  { name: 'Cardamom', category: 'Spice' },
  { name: 'Turmeric', category: 'Spice' },
  { name: 'Cumin', category: 'Spice' },
  { name: 'Coriander', category: 'Spice' },
  { name: 'Chilli', category: 'Spice' },
  { name: 'Fenugreek', category: 'Spice' },
  { name: 'Ginger', category: 'Spice' },
  { name: 'Garlic', category: 'Spice' },
  { name: 'Tamarind', category: 'Spice' },
  // Vegetables (18)
  { name: 'Potato', category: 'Vegetable' },
  { name: 'Tomato', category: 'Vegetable' },
  { name: 'Onion', category: 'Vegetable' },
  { name: 'Brinjal (Eggplant)', category: 'Vegetable' },
  { name: 'Okra (Lady\'s Finger)', category: 'Vegetable' },
  { name: 'Cabbage', category: 'Vegetable' },
  { name: 'Cauliflower', category: 'Vegetable' },
  { name: 'Carrot', category: 'Vegetable' },
  { name: 'Radish', category: 'Vegetable' },
  { name: 'Beetroot', category: 'Vegetable' },
  { name: 'Bottle Gourd', category: 'Vegetable' },
  { name: 'Bitter Gourd', category: 'Vegetable' },
  { name: 'Ridge Gourd', category: 'Vegetable' },
  { name: 'Pumpkin', category: 'Vegetable' },
  { name: 'Cucumber', category: 'Vegetable' },
  { name: 'Green Peas', category: 'Vegetable' },
  { name: 'French Bean', category: 'Vegetable' },
  { name: 'Drumstick', category: 'Vegetable' },
  { name: 'Sweet Potato', category: 'Vegetable' },
  // Tubers (1)
  { name: 'Tapioca (Cassava)', category: 'Tuber' },
  // Fruits (15)
  { name: 'Banana', category: 'Fruit' },
  { name: 'Mango', category: 'Fruit' },
  { name: 'Guava', category: 'Fruit' },
  { name: 'Papaya', category: 'Fruit' },
  { name: 'Pomegranate', category: 'Fruit' },
  { name: 'Grapes', category: 'Fruit' },
  { name: 'Orange', category: 'Fruit' },
  { name: 'Sweet Lime (Mosambi)', category: 'Fruit' },
  { name: 'Lemon', category: 'Fruit' },
  { name: 'Watermelon', category: 'Fruit' },
  { name: 'Muskmelon', category: 'Fruit' },
  { name: 'Pineapple', category: 'Fruit' },
  { name: 'Apple', category: 'Fruit' },
  { name: 'Sapota (Chikoo)', category: 'Fruit' },
  { name: 'Jackfruit', category: 'Fruit' },
  { name: 'Custard Apple', category: 'Fruit' },
];

/** Quick lookup: crop name → category. Returns 'Other' for unknown crops. */
export function getCropCategory(cropName) {
  const found = CROPS.find((c) => c.name === cropName);
  return found ? found.category : 'Other';
}

/** Category display — text only (no emoji). */
export const CATEGORY_EMOJI = {
  Cereal: 'Cereal', Pulse: 'Pulse', Oilseed: 'Oilseed', 'Cash Crop': 'Cash Crop',
  'Fiber Crop': 'Fiber Crop', Plantation: 'Plantation', Spice: 'Spice', Vegetable: 'Vegetable',
  Tuber: 'Tuber', Fruit: 'Fruit', Other: 'Other',
};

/** Filter crops by search term (case-insensitive). */
export function searchCrops(query, category) {
  const q = (query || '').toLowerCase().trim();
  return CROPS.filter((c) => {
    if (category && c.category !== category) return false;
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });
}
