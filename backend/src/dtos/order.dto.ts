import { z } from 'zod';

const addressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  postalCode: z.string().min(2),
  city: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().min(6).max(20)
});

const paymentMethodSchema = z.object({
  cardholderName: z.string().min(1),
  cardNumber: z
    .string()
    .min(12)
    .max(19)
    .regex(/^[0-9 ]+$/, 'Card number must contain only digits and spaces'),
  expMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
  expYear: z.string().regex(/^\d{2}$/),
  cvc: z.string().regex(/^\d{3,4}$/)
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive()
      })
    )
    .min(1),
  paymentProvider: z.string().min(1),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: paymentMethodSchema
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'SHIPPED', 'DELIVERED'])
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
