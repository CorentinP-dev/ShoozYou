import { prisma } from '../config/prisma';
import { HttpError } from '../utils/httpError';

type PaymentResult = {
  success: boolean;
  status: 'SUCCEEDED' | 'FAILED';
  reference: string;
};

const simulateProviderPayment = async (_orderId: string): Promise<PaymentResult> => {
  const success = Math.random() > 0.1; // 90% success rate for demo
  return {
    success,
    status: success ? 'SUCCEEDED' : 'FAILED',
    reference: `SIM-${Date.now()}`
  };
};

export const processPayment = async (
  orderId: string,
  provider: string,
  details?: Record<string, unknown>
) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new HttpError(404, 'Order not found');
  }

  const result = await simulateProviderPayment(orderId);

  const payment = await prisma.payment.upsert({
    where: { orderId },
    update: {
      status: result.status,
      provider,
      metadata: { reference: result.reference, ...(details ?? {}) }
    },
    create: {
      orderId,
      provider,
      status: result.status,
      metadata: { reference: result.reference, ...(details ?? {}) }
    }
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: result.success ? 'PAID' : 'FAILED' }
  });

  return { payment, orderStatus: result.success ? 'PAID' : 'FAILED' };
};
