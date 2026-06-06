import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../components/auth/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { authApi } from '../api/auth';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.forgotPassword({ email });
      setMessage(data.message);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.resetPassword({ token, newPassword });
      setMessage(data.message);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We'll send a reset token to your email"
      footer={
        <Link to="/login" className="font-medium text-accent hover:text-accent-hover transition-colors">
          ← Back to sign in
        </Link>
      }
    >
      {step === 'request' && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={requestReset} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Send reset token
          </Button>
        </motion.form>
      )}

      {step === 'reset' && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={resetPassword} className="space-y-5">
          {message && (
            <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-ink">{message}</p>
          )}
          <Input
            label="Reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Reset password
          </Button>
        </motion.form>
      )}

      {step === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 text-center">
          <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-ink">{message}</p>
          <Link to="/login">
            <Button className="w-full" size="lg">
              Sign in
            </Button>
          </Link>
        </motion.div>
      )}
    </AuthLayout>
  );
}
