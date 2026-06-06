import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Input from '../ui/Input';
import RoleSelect from './RoleSelect';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export default function EmailAuthForm({ mode = 'login' }) {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'procurement_officer',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } =
        mode === 'login'
          ? await authApi.login({ email: form.email, password: form.password })
          : await authApi.signup(form);

      setSession(data, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {mode === 'signup' && (
        <Input
          label="Full name"
          placeholder="John Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      )}

      <Input
        label="Email address"
        type="email"
        placeholder="you@company.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        minLength={6}
      />

      {mode === 'signup' && (
        <RoleSelect value={form.role} onChange={(role) => setForm({ ...form, role })} />
      )}

      {mode === 'login' && (
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-muted hover:text-accent transition-colors">
            Forgot password?
          </Link>
        </div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>
    </motion.form>
  );
}
