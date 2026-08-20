export type Background = 'white' | 'grey' | 'lifestyle' | 'custom';
export type ModelChoice = 'male' | 'female' | 'none';

export interface ProductInfo {
  name: string;
  category: string;
  hsn: string;
  productCost: number;
  sellingPrice: number;
  weight: number;
  length: number;
  width: number;
  height: number;
}

export interface PriceInputs {
  productCost: number;
  packagingCost: number;
  otherCosts: number;
  marketplacePct: number;
  shippingCost: number;
  desiredProfit: number;
  gstPct: number;
}

export interface GeneratedImage {
  id: string;
  title: string;
  url: string;
  mode: 'demo' | 'ai';
}

export interface ProjectState {
  product: ProductInfo;
  price: PriceInputs;
  originalImageDataUrl: string;
  generated: GeneratedImage[];
  model: ModelChoice;
  background: Background;
  customBackground: string;
  updatedAt: number;
}
