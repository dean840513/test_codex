import { errorJson, json } from './_shared.js';
import { onRequestPost as createOrder } from './orders/create.js';

export async function onRequestPost(context) {
  try {
    const response = await createOrder(context);
    const payload = await response.json();
    return json({ ...payload, message: payload.order ? '已创建 pending 订单，请继续支付' : payload.error }, { status: response.status });
  } catch (error) {
    return errorJson(error);
  }
}
