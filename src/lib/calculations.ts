import type { PriceInputs } from '../types';

export function volumetricWeight(length: number, width: number, height: number, divisor = 5000): number {
  if ([length, width, height].some(v => !Number.isFinite(v) || v < 0)) return 0;
  return (length * width * height) / divisor;
}

export function chargeableWeight(weightG: number, length: number, width: number, height: number): number {
  const actualKg = Math.max(0, weightG) / 1000;
  return Math.max(actualKg, volumetricWeight(length, width, height));
}

export interface PriceResult {
  baseCost: number;
  marketplaceFee: number;
  gst: number;
  totalCost: number;
  profit: number;
  marginPct: number;
  requiredPrice: number;
}

export function calculatePrice(input: PriceInputs): PriceResult {
  const baseCost = Math.max(0, input.productCost) + Math.max(0, input.packagingCost) + Math.max(0, input.otherCosts) + Math.max(0, input.shippingCost);
  const desiredProfit = Math.max(0, input.desiredProfit);
  const feeRate = Math.max(0, input.marketplacePct) / 100;
  const gstRate = Math.max(0, input.gstPct) / 100;
  const denominator = 1 - feeRate - gstRate;
  const requiredPrice = denominator > 0 ? (baseCost + desiredProfit) / denominator : 0;
  const marketplaceFee = requiredPrice * feeRate;
  const gst = requiredPrice * gstRate;
  const totalCost = baseCost + marketplaceFee + gst;
  const profit = requiredPrice - totalCost;
  const marginPct = requiredPrice > 0 ? (profit / requiredPrice) * 100 : 0;
  return { baseCost, marketplaceFee, gst, totalCost, profit, marginPct, requiredPrice };
}

export function psychologicalPrice(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const bands = [99, 149, 199, 249, 299, 349, 399, 449, 499, 599, 699, 799, 899, 999, 1199, 1299, 1499, 1799, 1999, 2499, 2999, 3999, 4999, 5999, 7999, 9999];
  const found = bands.find(v => v >= value);
  if (found) return found;
  const step = value < 20000 ? 500 : 1000;
  return Math.ceil(value / step) * step - 1;
}
