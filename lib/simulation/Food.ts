import { FoodSource, FoodType, Vector2D } from './types';

export function createFoodSource(position: Vector2D, type: FoodType, id?: string): FoodSource {
  let quantity: number;
  let radius: number;

  switch (type) {
    case FoodType.SMALL_CRUMB:
      quantity = 40;
      radius = 5;
      break;
    case FoodType.MEDIUM:
      quantity = 150;
      radius = 15;
      break;
    case FoodType.LARGE:
      quantity = 500;
      radius = 30;
      break;
    case FoodType.SUGAR:
      quantity = Infinity;
      radius = 20;
      break;
    case FoodType.PROTEIN:
      quantity = 300;
      radius = 25;
      break;
  }

  return {
    id: id || Math.random().toString(36).substr(2, 9),
    type,
    position,
    quantity,
    maxQuantity: quantity,
    radius
  };
}

export function getFoodColor(type: FoodType): string {
  switch (type) {
    case FoodType.SMALL_CRUMB:
      return '#FFE66D'; // Light yellow
    case FoodType.MEDIUM:
      return '#FF9F40'; // Orange
    case FoodType.LARGE:
      return '#E74C3C'; // Red
    case FoodType.SUGAR:
      return '#FFFFFF'; // White
    case FoodType.PROTEIN:
      return '#FF6B9D'; // Pink
  }
}

export function getFoodName(type: FoodType): string {
  switch (type) {
    case FoodType.SMALL_CRUMB:
      return 'Small Crumb';
    case FoodType.MEDIUM:
      return 'Medium Food';
    case FoodType.LARGE:
      return 'Large Food';
    case FoodType.SUGAR:
      return 'Sugar Source';
    case FoodType.PROTEIN:
      return 'Protein Source';
  }
}

export function canCarryFood(type: FoodType): boolean {
  // Small crumbs can be carried by single ants
  // Others require multiple ants or on-site collection
  return type === FoodType.SMALL_CRUMB;
}

export function harvest(food: FoodSource, amount: number): number {
  if (food.quantity === Infinity) {
    return amount;
  }

  const harvested = Math.min(amount, food.quantity);
  food.quantity -= harvested;
  return harvested;
}

export function isDepleted(food: FoodSource): boolean {
  return food.quantity <= 0 && food.quantity !== Infinity;
}

export function getCurrentRadius(food: FoodSource): number {
  if (food.quantity === Infinity) {
    return food.radius;
  }
  // Scale radius based on remaining quantity
  const ratio = food.quantity / food.maxQuantity;
  return Math.max(3, food.radius * Math.sqrt(ratio));
}
