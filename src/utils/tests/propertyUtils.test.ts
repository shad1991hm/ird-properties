/**
 * @jest-environment jsdom
 */
import { getStockStatus, Stockable } from '../propertyUtils';

describe('getStockStatus', () => {
  it('should return "critical" for 10% or less availability', () => {
    const item: Stockable = { availableQuantity: 1, quantity: 10 };
    expect(getStockStatus(item).status).toBe('critical');
    const item2: Stockable = { availableQuantity: 0, quantity: 10 };
    expect(getStockStatus(item2).status).toBe('critical');
  });

  it('should return "low" for 11-25% availability', () => {
    const item: Stockable = { availableQuantity: 2, quantity: 10 }; // 20%
    expect(getStockStatus(item).status).toBe('low');
    const item2: Stockable = { availableQuantity: 25, quantity: 100 }; // 25%
    expect(getStockStatus(item2).status).toBe('low');
  });

  it('should return "medium" for 26-50% availability', () => {
    const item: Stockable = { availableQuantity: 3, quantity: 10 }; // 30%
    expect(getStockStatus(item).status).toBe('medium');
    const item2: Stockable = { availableQuantity: 50, quantity: 100 }; // 50%
    expect(getStockStatus(item2).status).toBe('medium');
  });

  it('should return "good" for over 50% availability', () => {
    const item: Stockable = { availableQuantity: 6, quantity: 10 }; // 60%
    expect(getStockStatus(item).status).toBe('good');
    const item2: Stockable = { availableQuantity: 100, quantity: 100 }; // 100%
    expect(getStockStatus(item2).status).toBe('good');
  });

  it('should return "empty" for 0 available and 0 quantity', () => {
    const item: Stockable = { availableQuantity: 0, quantity: 0 };
    expect(getStockStatus(item).status).toBe('empty');
  });

  it('should return "inconsistent_data" if available > 0 but quantity is 0', () => {
    const item: Stockable = { availableQuantity: 5, quantity: 0 };
    expect(getStockStatus(item).status).toBe('inconsistent_data');
  });

  it('should return "inconsistent_data" if availableQuantity > quantity', () => {
    const item: Stockable = { availableQuantity: 10, quantity: 5 };
    expect(getStockStatus(item).status).toBe('inconsistent_data');
  });

  it('should return "invalid_data" if quantity is negative', () => {
     const item: Stockable = { availableQuantity: 5, quantity: -1 };
     expect(getStockStatus(item).status).toBe('invalid_data');
  });

  it('should return "invalid_data" if availableQuantity is negative', () => {
     const item: Stockable = { availableQuantity: -1, quantity: 5 };
     expect(getStockStatus(item).status).toBe('invalid_data');
  });
});
