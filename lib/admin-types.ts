export interface AdminMainProduct {
  _id: string;
  name: string;
  thumbnailImageUrl?: string;
  thumbnailImageUrlMobile?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminDesign {
  _id?: string;
  name: string;
  imageUrl: string;
  price?: number;
}

export interface PricingTier {
  _id?: string;
  minQty: number;
  maxQty: number | null;
  price: number;
}

export interface AdminProduct {
  _id: string;
  name: string;
  category: string;
  sport: string;
  thumbnailImageUrl?: string;
  thumbnailImageUrlMobile?: string;
  designs: AdminDesign[];
  pricingTiers: PricingTier[];
  isActive: boolean;
  createdAt?: string;
}

export interface OrderContact {
  name: string;
  phone: string;
  email?: string;
}

export interface AdminOrderPlayer {
  name: string;
  number: string;
  size: string;
  sleeveType: string;
  neckType: string;
  shortsTrack: string;
  note: string;
}

export interface AdminOrderFile {
  _id: string;
  filename: string;
  contentType: string;
}

export interface AdminOrder {
  _id: string;
  orderId: string;
  productName: string;
  category: string;
  sport: string;
  designName: string;
  designImageUrl?: string;
  quantity: number;
  sleeveBreakdown: { label: string; quantity: number }[];
  collarBreakdown: { label: string; quantity: number }[];
  addonLines: { addonName: string; styleLabel: string; quantity: number; price: number }[];
  players: AdminOrderPlayer[];
  additionalFiles: AdminOrderFile[];
  priceBreakdown: { total: number; currency: string; [key: string]: unknown };
  contact: OrderContact;
  advanceAmount: number;
  balanceAmount: number;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt?: string;
}

export type PaymentMethodType = "esewa" | "khalti" | "bank" | "other";

export interface PaymentMethodDetails {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  branch?: string;
  ifsc?: string;
  upiId?: string;
}

export interface PaymentMethod {
  _id?: string;
  type: PaymentMethodType;
  label: string;
  qrCodeImageUrl: string;
  details?: PaymentMethodDetails;
}

export interface PaymentConfig {
  _id?: string;
  methods: PaymentMethod[];
}

export interface ApiListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}
