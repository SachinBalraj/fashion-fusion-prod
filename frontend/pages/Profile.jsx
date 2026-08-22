import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Package, Heart, MapPin, LogOut, Edit3, Trash2, Clock, ChevronRight, Eye, EyeOff, Save,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';
import api from '@/services/api';

const SIDEBAR_TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
];

function StatusBadge({ status }) {
  const variants = {
    delivered: 'bg-green-50 text-green-700 border-green-200',
    shipped: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    pending: 'bg-orange-50 text-orange-700 border-orange-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {label}
    </span>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const { addToCart } = useCart();
  const { wishlistItems } = useWishlist();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', zip: '', country: 'India' });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    setAddresses(user.addresses || []);
  }, [user]);

  useEffect(() => {
    if (!user || activeTab !== 'orders') return;
    setOrdersLoading(true);
    api.get('/orders/myorders')
      .then(({ data }) => setOrders(data))
      .catch(() => toast.error('Failed to load recent orders'))
      .finally(() => setOrdersLoading(false));
  }, [user, activeTab]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleProfileSave = async () => {
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setProfileSaving(true);
    try {
      const { data } = await api.put('/auth/profile', profileForm);
      updateUser({ name: data.name, email: data.email, phone: data.phone });
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put('/auth/profile', {
        password: passwordForm.newPassword,
        currentPassword: passwordForm.currentPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!addressForm.street.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.zip.trim()) {
      toast.error('Please fill in all address fields');
      return;
    }
    setAddressSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        addresses: [...addresses, addressForm],
      });
      setAddresses(data.addresses || [...addresses, addressForm]);
      updateUser({ addresses: data.addresses });
      toast.success('Address added');
      setAddressForm({ street: '', city: '', state: '', zip: '', country: 'India' });
      setShowAddressForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (idx) => {
    const updated = addresses.filter((_, i) => i !== idx);
    try {
      const { data } = await api.put('/auth/profile', { addresses: updated });
      setAddresses(data.addresses || updated);
      updateUser({ addresses: data.addresses });
      toast.success('Address removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove address');
    }
  };

  const tabContent = {
    profile: (
      <motion.div
        key="profile"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-gold" /> Profile Information
              </CardTitle>
              {!editMode && (
                <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setEditMode(true)}>
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input id="edit-name" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" type="email" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input id="edit-phone" type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} className="mt-1" placeholder="98765 43210" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="gold" size="sm" onClick={handleProfileSave} disabled={profileSaving} className="gap-1.5">
                    <Save className="h-3.5 w-3.5" />
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditMode(false); setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' }); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</p>
                  <p className="mt-1 font-medium">{user.name}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="mt-1 font-medium">{user.email}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="mt-1 font-medium">{user.phone || '—'}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Member Since</p>
                  <p className="mt-1 font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-gold" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm space-y-3">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} className="mt-1" placeholder="Enter current password" />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative mt-1">
                  <Input id="new-password" type={showPassword ? 'text' : 'password'} value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Min 6 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} className="mt-1" placeholder="Repeat new password" />
              </div>
              <Button variant="gold" size="sm" onClick={handlePasswordChange} disabled={passwordSaving} className="gap-1.5">
                {passwordSaving ? 'Saving...' : 'Change Password'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ),
    orders: (
      <motion.div
        key="orders"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold font-heading">Order History</h3>
          <span className="text-sm text-muted-foreground">{orders.length} orders</span>
        </div>
        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-10">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
              <Button variant="gold" size="sm" className="mt-4" onClick={() => navigate('/shop')}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>·</span>
                        <span>{order.orderItems?.length || 0} {(order.orderItems?.length || 0) === 1 ? 'item' : 'items'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">₹{(order.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <StatusBadge status={order.orderStatus} />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="flex flex-wrap gap-3">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="h-10 w-10 rounded object-cover" />
                          )}
                          <div>
                            <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Qty: {item.quantity}{item.size ? ` · ${item.size}` : ''} · ₹{item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>
    ),
    wishlist: (
      <motion.div
        key="wishlist"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold font-heading">My Wishlist</h3>
          <span className="text-sm text-muted-foreground">{wishlistItems.length} items</span>
        </div>
        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-10">
              <Heart className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">Your wishlist is empty.</p>
              <Button variant="gold" size="sm" className="mt-4" onClick={() => navigate('/products')}>
                Explore Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((item) => {
              const pid = item._id || item.id;
              const itemImage = item.images?.[0] || item.image || '/placeholder.svg';
              return (
                <Card key={pid}>
                  <CardContent className="p-4">
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-3">
                      <img src={itemImage} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.brand || item.category}</p>
                    <p className="mt-0.5 text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="mt-1 font-semibold">₹{(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <Button
                      variant="gold"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => {
                        addToCart(item);
                        toast.success(`${item.name} added to cart`);
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>
    ),
    addresses: (
      <motion.div
        key="addresses"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold font-heading">Saved Addresses</h3>
          <Button variant="gold" size="sm" className="gap-1.5" onClick={() => setShowAddressForm(!showAddressForm)}>
            <MapPin className="h-3.5 w-3.5" /> {showAddressForm ? 'Cancel' : 'Add New'}
          </Button>
        </div>

        {showAddressForm && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Street Address</Label>
                  <Input value={addressForm.street} onChange={(e) => setAddressForm((p) => ({ ...p, street: e.target.value }))} className="mt-1" placeholder="House no, Street, Area" />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={addressForm.state} onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input value={addressForm.zip} onChange={(e) => setAddressForm((p) => ({ ...p, zip: e.target.value }))} className="mt-1" placeholder="000000" />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={addressForm.country} onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <Button variant="gold" size="sm" onClick={handleAddAddress} disabled={addressSaving}>
                {addressSaving ? 'Saving...' : 'Save Address'}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {addresses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-10">
                <MapPin className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">No saved addresses yet.</p>
              </CardContent>
            </Card>
          ) : (
            addresses.map((addr, idx) => (
              <Card key={idx}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="mb-3">{addr.isDefault ? 'Default' : `Address ${idx + 1}`}</Badge>
                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Delete address"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-medium">{addr.name || user.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {addr.street}, {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p className="text-sm text-muted-foreground">{addr.country}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.div>
    ),
  };

  return (
    <>
      <Helmet>
        <title>My Account — Fashion&apos;s Fusion</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold font-heading">My Account</h1>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              {SIDEBAR_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gold/10 text-gold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-gold' : ''}`} />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="ml-auto h-2 w-2 rounded-full bg-gold"
                      />
                    )}
                  </button>
                );
              })}
              <hr className="my-3 border-border" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Mobile Tabs */}
          <div className="lg:hidden">
            <div className="flex overflow-x-auto gap-2 pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
              {SIDEBAR_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all snap-start ${
                      isActive
                        ? 'bg-gold/10 text-gold'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {tabContent[activeTab]}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}
