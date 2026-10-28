import { apiClient } from "./apiClient";

export const paymentsApi = {
  createOrder: (courseId: string, couponCode?: string, provider: "razorpay" | "stripe" = "razorpay") =>
    apiClient.post("/checkout/create-order/", { course_id: courseId, coupon_code: couponCode, provider }).then((r) => r.data),
  verifyPayment: (orderId: string, payload: Record<string, string>) =>
    apiClient.post("/checkout/verify-payment/", { order_id: orderId, ...payload }).then((r) => r.data),
};
