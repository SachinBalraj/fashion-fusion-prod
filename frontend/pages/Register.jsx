import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import api from '@/services/api';

function PasswordStrength({ password }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getStrength();

  if (!password) return null;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
  const label = labels[strength];
  const color = colors[strength];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs font-medium ${strength <= 2 ? 'text-red-500' : strength <= 3 ? 'text-yellow-500' : 'text-green-600'}`}>
        {label}
      </p>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const claimOrder = location.state?.claimOrder;
  const [name, setName] = useState('');
  const [email, setEmail] = useState(claimOrder?.guestEmail || '');
  const [phone, setPhone] = useState(claimOrder?.guestPhone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (claimOrder?.guestName) {
      setName(claimOrder.guestName);
    }
  }, [claimOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    const normalizedPhone = phoneDigits.startsWith('91') && phoneDigits.length === 12
      ? phoneDigits.slice(2)
      : phoneDigits;
    if (phone && !/^[6-9]\d{9}$/.test(normalizedPhone)) {
      toast.error('Enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, phone);
      if (claimOrder?.orderId && claimOrder?.claimToken) {
        try {
          await api.post('/auth/claim-order', {
            orderId: claimOrder.orderId,
            claimToken: claimOrder.claimToken,
          });
          toast.success('Account created and order linked successfully!');
          navigate('/orders', { replace: true });
          return;
        } catch (claimError) {
          toast.error(claimError.response?.data?.message || 'Account created, but failed to link order');
        }
      }
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account — Fashion's Fusion</title>
      </Helmet>

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            background: [
              'linear-gradient(135deg, #FAFAFA 0%, #E5E7EB 50%, #FAFAFA 100%)',
              'linear-gradient(135deg, #E5E7EB 0%, #FAFAFA 50%, #E5E7EB 100%)',
              'linear-gradient(135deg, #FAFAFA 0%, #E5E7EB 50%, #FAFAFA 100%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl bg-white/90 px-8 py-10 shadow-2xl backdrop-blur-xl sm:px-10">
            {/* Logo / Title */}
            <div className="mb-8 text-center">
              <Link to="/" className="inline-block">
                <h1 className="text-3xl font-bold font-heading tracking-tight">
                  Fashion <span className="text-gold">Fusion</span>
                </h1>
              </Link>
              <h2 className="mt-6 text-2xl font-bold font-heading">Create Account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Join Fashion&apos;s Fusion today
              </p>
              {claimOrder?.orderId && (
                <p className="mt-2 text-xs text-gold">
                  Create this account to track your recent order.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Mobile Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="mt-1"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border accent-gold"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms-and-conditions" className="text-gold hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="text-gold hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" state={{ claimOrder }} className="font-medium text-gold hover:text-gold-dark transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
