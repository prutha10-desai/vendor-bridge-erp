import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Input from '../ui/Input';
import OtpInput from '../ui/OtpInput';
import RoleSelect from './RoleSelect';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export default function OtpAuthForm({ mode = 'login' }) {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [step, setStep] = useState('send');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [form, setForm] = useState({
    email: '',
    name: '',
    role: 'procurement_officer',
    otp: '',
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      const payload = {
        email: form.email,
        purpose: mode,
      };
      if (mode === 'signup') {
        payload.name = form.name;
        payload.role = form.role;
      }

      await authApi.sendOtp(payload);
      setStep('verify');
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.verifyOtp({ email: form.email, otp: form.otp });
      setSession(data, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {step === 'send' ? (
          <motion.div
            key="send"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {mode === 'signup' && (
              <>
                <Input
                  label="Full name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <RoleSelect
                  value={form.role}
                  onChange={(role) => setForm({ ...form, role })}
                />
              </>
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            )}

            <Button
              onClick={sendOtp}
              loading={loading}
              className="w-full"
              size="lg"
              disabled={!form.email || (mode === 'signup' && !form.name)}
            >
              Send verification code
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="verify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <p className="text-sm text-muted">Enter the 6-digit code sent to</p>
              <p className="mt-1 font-mono text-sm font-medium text-ink">{form.email}</p>
            </div>

            <OtpInput
              value={form.otp}
              onChange={(otp) => setForm({ ...form, otp })}
              error={error}
            />

            <Button
              onClick={verifyOtp}
              loading={loading}
              className="w-full"
              size="lg"
              disabled={form.otp.length !== 6}
            >
              Verify & {mode === 'login' ? 'sign in' : 'create account'}
            </Button>

            <div className="flex items-center justify-between text-xs text-muted">
              <button
                type="button"
                onClick={() => {
                  setStep('send');
                  setForm({ ...form, otp: '' });
                  setError('');
                }}
                className="hover:text-ink transition-colors"
              >
                ← Change email
              </button>
              <button
                type="button"
                onClick={sendOtp}
                disabled={countdown > 0 || loading}
                className="hover:text-accent transition-colors disabled:opacity-40"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
