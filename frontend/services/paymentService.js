import api from './api';

export const createRazorpayOrder = async (checkoutData) => {
  const { data } = await api.post('/payments/razorpay', checkoutData);
  return data;
};

export const verifyRazorpayPayment = async (paymentData) => {
  const { data } = await api.post('/payments/razorpay/verify', paymentData);
  return data;
};

export const getPaymentDetails = async (orderId) => {
  const { data } = await api.get(`/payments/${orderId}/details`);
  return data;
};

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
