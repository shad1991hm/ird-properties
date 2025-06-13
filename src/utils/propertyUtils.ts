// src/utils/propertyUtils.ts
// Minimal Property-like interface for what getStockStatus needs
export interface Stockable {
  availableQuantity: number;
  quantity: number;
}

export const getStockStatus = (item: Stockable) => {
  if (item.quantity < 0 || item.availableQuantity < 0) { // Basic sanity check
     return { status: 'invalid_data', color: 'text-gray-600 bg-gray-50' };
  }
  if (item.availableQuantity > item.quantity) { // available cannot be more than total
     return { status: 'inconsistent_data', color: 'text-red-700 bg-red-100'};
  }
  if (item.quantity === 0) {
    return item.availableQuantity === 0 ?
           { status: 'empty', color: 'text-gray-600 bg-gray-50'} :
           { status: 'inconsistent_data', color: 'text-red-700 bg-red-100'}; // available > 0 but total is 0
  }

  const percentage = (item.availableQuantity / item.quantity) * 100;

  if (percentage <= 10) return { status: 'critical', color: 'text-red-600 bg-red-50' };
  if (percentage <= 25) return { status: 'low', color: 'text-orange-600 bg-orange-50' };
  if (percentage <= 50) return { status: 'medium', color: 'text-yellow-600 bg-yellow-50' };
  return { status: 'good', color: 'text-green-600 bg-green-50' };
};
