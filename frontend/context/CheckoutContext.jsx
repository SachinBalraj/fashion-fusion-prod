import { createContext, useContext, useState, useCallback } from 'react';

const CheckoutContext = createContext();

const defaultAddress = {
  firstName: '',
  lastName: '',
  phone: '',
  altPhone: '',
  email: '',
  houseNo: '',
  street: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  addressType: 'Home',
  saveAddress: true,
};

export function CheckoutProvider({ children }) {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressForm, setAddressForm] = useState(defaultAddress);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [buyNowItem, setBuyNowItem] = useState(null);

  const resetCheckout = useCallback(() => {
    setSelectedAddress(null);
    setAddressForm(defaultAddress);
    setPaymentMethod('razorpay');
    setBuyNowItem(null);
  }, []);

  const formatAddress = useCallback((addr) => {
    if (!addr) return '';
    if (addr.houseNo) {
      const parts = [addr.houseNo, addr.street, addr.landmark].filter(Boolean);
      return parts.join(', ');
    }
    return addr.street || '';
  }, []);

  const value = {
    selectedAddress,
    setSelectedAddress,
    addressForm,
    setAddressForm,
    paymentMethod,
    setPaymentMethod,
    buyNowItem,
    setBuyNowItem,
    resetCheckout,
    formatAddress,
    defaultAddress,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error('useCheckout must be used within CheckoutProvider');
  return context;
};
