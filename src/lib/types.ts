export interface SanityImageRef {
  asset: { _ref: string };
  hotspot?: { x: number; y: number };
}

export interface CategoryRef {
  title: string;
  slug: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  sku?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  tags?: string[];
  image?: SanityImageRef | null;
  category?: CategoryRef | null;
  brand?: CategoryRef | null;
}

export interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  productCount?: number;
}

export interface OrderItem {
  _key: string;
  title?: string;
  price?: number;
  quantity?: number;
  size?: string;
  color?: string;
  productSlug?: string | null;
  productImage?: SanityImageRef | null;
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  placedAt?: string;
  items?: OrderItem[];
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string;
}
