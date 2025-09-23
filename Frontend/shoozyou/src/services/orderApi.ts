import { httpRequest } from './httpClient';

type UUID = string;

type RawOrderItemProduct = {
  id: UUID;
  name: string;
  imageUrl?: string | null;
  price: number | string;
  sku: string;
};

type RawOrderItem = {
  id: UUID;
  orderId: UUID;
  productId: UUID;
  quantity: number;
  unitPrice: number | string;
  product: RawOrderItemProduct;
};

type RawPayment = {
  id: UUID;
  status: 'INITIATED' | 'SUCCEEDED' | 'FAILED';
  provider: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

type RawOrder = {
  id: UUID;
  userId: UUID;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'SHIPPED' | 'DELIVERED';
  total: number | string;
  createdAt: string;
  updatedAt: string;
  items: RawOrderItem[];
  payment?: RawPayment | null;
};

export interface OrderProductSummary {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
  sku: string;
}

export interface OrderItemDto {
  id: string;
  quantity: number;
  unitPrice: number;
  product: OrderProductSummary;
}

export interface PaymentDto {
  id: string;
  status: RawPayment['status'];
  provider: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface OrderDto {
  id: string;
  status: RawOrder['status'];
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
  payment?: PaymentDto | null;
}

const toNumber = (value: number | string): number => {
  return typeof value === 'number' ? value : Number(value);
};

const mapOrder = (order: RawOrder): OrderDto => ({
  id: order.id,
  status: order.status,
  total: toNumber(order.total),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  items: order.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    unitPrice: toNumber(item.unitPrice),
    product: {
      id: item.product.id,
      name: item.product.name,
      price: toNumber(item.product.price),
      imageUrl: item.product.imageUrl ?? undefined,
      sku: item.product.sku,
    },
  })),
  payment: order.payment
    ? {
        id: order.payment.id,
        status: order.payment.status,
        provider: order.payment.provider,
        metadata: order.payment.metadata ?? undefined,
        createdAt: order.payment.createdAt,
      }
    : null,
});

export async function fetchMyOrders(): Promise<OrderDto[]> {
  const response = await httpRequest<RawOrder[]>('/orders/my', { method: 'GET' });
  return response.map(mapOrder);
}

export const displayOrderStatus = (status: OrderDto['status']): string => {
  switch (status) {
    case 'PENDING':
      return 'En attente';
    case 'PAID':
      return 'Payée';
    case 'FAILED':
      return 'Paiement échoué';
    case 'CANCELLED':
      return 'Annulée';
    case 'SHIPPED':
      return 'Expédiée';
    case 'DELIVERED':
      return 'Livrée';
    default:
      return status;
  }
};
