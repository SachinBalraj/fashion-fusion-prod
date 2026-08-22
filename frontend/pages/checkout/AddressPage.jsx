import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, MapPin, Home, Building2, Landmark, Plus, Trash2, Check, Edit2, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCheckout } from '@/context/CheckoutContext';
import api, { normalizeAddressList } from '@/services/api';
import { toast } from 'sonner';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir',
  'Ladakh','Lakshadweep','Puducherry',
];

export default function AddressPage() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user } = useAuth();
  const { selectedAddress, setSelectedAddress, addressForm, setAddressForm, buyNowItem } = useCheckout();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const hasItems = buyNowItem || cartItems.length > 0;

  useEffect(() => {
    if (!hasItems) {
      navigate('/cart', { replace: true });
    }
  }, [hasItems, navigate]);

  useEffect(() => {
    if (user) {
      api.get('/addresses')
        .then(({ data }) => {
          const addresses = normalizeAddressList(data);
          setSavedAddresses(addresses);
          if (addresses.length > 0 && !selectedAddress) {
            const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr);
          }
        })
        .catch(() => toast.error('Failed to load addresses'))
        .finally(() => setLoadingAddresses(false));
    } else {
      setSavedAddresses([]);
      setLoadingAddresses(false);
      setShowForm(true);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const phoneDigits = addressForm.phone.replace(/\D/g, '');
    const normalizedPhone = phoneDigits.startsWith('91') && phoneDigits.length === 12
      ? phoneDigits.slice(2)
      : phoneDigits;
    if (!addressForm.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!addressForm.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!addressForm.phone.trim()) newErrors.phone = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(normalizedPhone)) newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!addressForm.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressForm.email)) newErrors.email = 'Enter a valid email';
    if (!addressForm.houseNo.trim()) newErrors.houseNo = 'House/Flat number is required';
    if (!addressForm.street.trim()) newErrors.street = 'Street/Area is required';
    if (!addressForm.city.trim()) newErrors.city = 'City is required';
    if (!addressForm.state.trim()) newErrors.state = 'State is required';
    if (!addressForm.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(addressForm.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async (continueToPayment = false) => {
    if (!validate()) return;

    if (!user) {
      const guestAddress = {
        street: `${addressForm.houseNo}, ${addressForm.street}${addressForm.landmark ? `, Near ${addressForm.landmark}` : ''}`,
        city: addressForm.city,
        state: addressForm.state,
        zip: addressForm.pincode,
        country: addressForm.country,
        label: addressForm.addressType,
        firstName: addressForm.firstName,
        lastName: addressForm.lastName,
        email: addressForm.email,
        phone: addressForm.phone,
      };
      setSelectedAddress(guestAddress);
      setShowForm(false);
      resetForm();
      toast.success('Address saved for this order');
      if (continueToPayment) {
        navigate('/checkout/payment');
      }
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        street: `${addressForm.houseNo}, ${addressForm.street}${addressForm.landmark ? `, Near ${addressForm.landmark}` : ''}`,
        city: addressForm.city,
        state: addressForm.state,
        zip: addressForm.pincode,
        country: addressForm.country,
        label: addressForm.addressType,
        isDefault: addressForm.saveAddress && savedAddresses.length === 0,
      };

      let res;
      if (editingId) {
        res = await api.put(`/addresses/${editingId}`, payload);
      } else {
        res = await api.post('/addresses', payload);
      }

      setSavedAddresses(res.data);
      const newAddr = res.data[res.data.length - 1];
      setSelectedAddress(newAddr);
      setShowForm(false);
      const wasEditing = !!editingId;
      setEditingId(null);
      resetForm();
      toast.success(wasEditing ? 'Address updated' : 'Address saved');
      if (continueToPayment) {
        navigate('/checkout/payment');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await api.delete(`/addresses/${id}`);
      setSavedAddresses(data);
      if (selectedAddress?._id === id) {
        const defaultAddr = data.find((a) => a.isDefault) || data[0] || null;
        setSelectedAddress(defaultAddr);
      }
      toast.success('Address deleted');
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const handleEditAddress = (addr) => {
    const streetParts = addr.street || '';
    const houseMatch = streetParts.split(',')[0] || '';
    setEditingId(addr._id);
    setAddressForm({
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      phone: user?.phone || '',
      altPhone: '',
      email: user?.email || '',
      houseNo: houseMatch.trim(),
      street: streetParts.split(',').slice(1).join(',').trim(),
      landmark: '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.zip || '',
      country: addr.country || 'India',
      addressType: addr.label || 'Home',
      saveAddress: false,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setAddressForm({
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      phone: user?.phone || '',
      altPhone: '',
      email: user?.email || '',
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      addressType: 'Home',
      saveAddress: true,
    });
    setErrors({});
    setEditingId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
  };

  const handleContinue = () => {
    if (!selectedAddress && !showForm) {
      toast.error('Please select or add a delivery address');
      return;
    }
    if (showForm) {
      handleSaveAddress(true);
      return;
    }
    navigate('/checkout/payment');
  };

  const fieldClass = (name) =>
    `w-full rounded-xl border ${errors[name] ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white'} px-4 py-2.5 text-sm outline-none transition-all focus:border-[gold] focus:ring-2 focus:ring-[gold]/10`;

  return (
    <>
      <Helmet>
        <title>Delivery Address — Fashion's Fusion</title>
      </Helmet>

      <div className="min-h-screen bg-[#FFFDF8]">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-[gold]">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Link>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-16 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-['Poppins'] text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="mt-1 text-sm text-gray-500">Select or add your delivery address</p>
          </motion.div>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">1</span>
              <span className="font-medium text-[gold]">Address</span>
              <span className="mx-2 h-px w-8 bg-gray-200" />
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-400">2</span>
              <span className="text-gray-400">Payment</span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-8 space-y-6">
            {/* Saved Addresses */}
            {!loadingAddresses && savedAddresses.length > 0 && !showForm && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-['Poppins'] text-lg font-bold text-gray-900">Saved Addresses</h2>
                  <button onClick={handleAddNew} className="flex items-center gap-1.5 rounded-xl border border-[gold] bg-[gold]/5 px-4 py-2 text-xs font-semibold text-[gold] transition-all hover:bg-[gold] hover:text-white">
                    <Plus className="h-3.5 w-3.5" /> Add New
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                        selectedAddress?._id === addr._id
                          ? 'border-[gold] bg-[gold]/5 shadow-md shadow-[gold]/10'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {selectedAddress?._id === addr._id && (
                        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[gold]">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        {addr.label === 'Home' ? <Home className="h-4 w-4 text-[gold]" /> : <Building2 className="h-4 w-4 text-[gold]" />}
                        <span className="text-xs font-bold uppercase tracking-wider text-[gold]">{addr.label || 'Home'}</span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Default</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{addr.street}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                      <p className="text-sm text-gray-600">{addr.country}</p>
                      <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                        <button onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[gold] transition-colors">
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Address Button when no saved addresses */}
            {!loadingAddresses && !user && selectedAddress && !showForm && (
              <div className="rounded-2xl border-2 border-gold bg-gold/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gold">
                    Selected Delivery Address
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedAddress.firstName} {selectedAddress.lastName}
                </p>
                <p className="text-sm text-gray-700">{selectedAddress.street}</p>
                <p className="text-sm text-gray-700">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}</p>
                <p className="text-sm text-gray-700">Phone: {selectedAddress.phone}</p>
                <div className="mt-3">
                  <button
                    onClick={handleAddNew}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gold bg-white px-4 py-2 text-xs font-semibold text-gold transition-all hover:bg-gold hover:text-white"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit Address
                  </button>
                </div>
              </div>
            )}

            {!loadingAddresses && savedAddresses.length === 0 && !showForm && !selectedAddress && (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
                <MapPin className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-3 text-lg font-semibold text-gray-900">No saved addresses</h3>
                <p className="mt-1 text-sm text-gray-500">Add a delivery address to continue</p>
                <button onClick={handleAddNew} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[gold] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B8921F]">
                  <Plus className="h-4 w-4" /> Add Address
                </button>
              </div>
            )}

            {/* Address Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-['Poppins'] text-lg font-bold text-gray-900">
                        {editingId ? 'Edit Address' : 'Add New Address'}
                      </h2>
                      {savedAddresses.length > 0 && (
                        <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-sm text-gray-500 hover:text-[gold] transition-colors">
                          Use saved address
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">First Name *</label>
                        <input name="firstName" value={addressForm.firstName} onChange={handleChange} placeholder="First name" className={fieldClass('firstName')} />
                        {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Last Name *</label>
                        <input name="lastName" value={addressForm.lastName} onChange={handleChange} placeholder="Last name" className={fieldClass('lastName')} />
                        {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number *</label>
                        <input name="phone" type="tel" value={addressForm.phone} onChange={handleChange} placeholder="10-digit mobile number" className={fieldClass('phone')} />
                        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Alternative Mobile</label>
                        <input name="altPhone" type="tel" value={addressForm.altPhone} onChange={handleChange} placeholder="Optional" className={fieldClass('altPhone')} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Email Address *</label>
                        <input name="email" type="email" value={addressForm.email} onChange={handleChange} placeholder="you@example.com" className={fieldClass('email')} />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">House No / Flat No *</label>
                        <input name="houseNo" value={addressForm.houseNo} onChange={handleChange} placeholder="Flat/House number" className={fieldClass('houseNo')} />
                        {errors.houseNo && <p className="mt-1 text-xs text-red-500">{errors.houseNo}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Street / Area *</label>
                        <input name="street" value={addressForm.street} onChange={handleChange} placeholder="Street name, Area" className={fieldClass('street')} />
                        {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Landmark</label>
                        <input name="landmark" value={addressForm.landmark} onChange={handleChange} placeholder="Nearby landmark (optional)" className={fieldClass('landmark')} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
                        <input name="city" value={addressForm.city} onChange={handleChange} placeholder="City" className={fieldClass('city')} />
                        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">State *</label>
                        <select name="state" value={addressForm.state} onChange={handleChange} className={fieldClass('state')}>
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Pincode *</label>
                        <input name="pincode" value={addressForm.pincode} onChange={handleChange} placeholder="6-digit pincode" className={fieldClass('pincode')} />
                        {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
                        <input name="country" value={addressForm.country} onChange={handleChange} className={fieldClass('country')} disabled />
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-medium text-gray-700">Address Type</label>
                      <div className="flex gap-3">
                        {['Home', 'Office', 'Other'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAddressForm((prev) => ({ ...prev, addressType: type }))}
                            className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                              addressForm.addressType === type
                                ? 'border-[gold] bg-[gold]/5 text-[gold]'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {type === 'Home' && <Home className="h-4 w-4" />}
                            {type === 'Office' && <Building2 className="h-4 w-4" />}
                            {type === 'Other' && <Landmark className="h-4 w-4" />}
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="mt-4 flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="saveAddress"
                        checked={addressForm.saveAddress}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-[gold] focus:ring-[gold]"
                      />
                      <span className="text-sm text-gray-600">Save this address for future orders</span>
                    </label>

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={handleSaveAddress}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-[gold] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B8921F] disabled:opacity-50"
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        {editingId ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        onClick={() => { setShowForm(false); setEditingId(null); }}
                        className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-[gold] hover:text-[gold]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Continue Button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8">
            <button
              onClick={handleContinue}
              disabled={!selectedAddress && !showForm}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[gold] py-4 text-base font-bold text-white shadow-lg shadow-[gold]/20 transition-all hover:bg-[#B8921F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Payment <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
