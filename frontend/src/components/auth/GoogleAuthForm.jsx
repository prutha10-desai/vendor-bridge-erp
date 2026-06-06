import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export default function GoogleAuthForm({ mode = 'login' }) {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.google({ idToken: credentialResponse.credential });
      setSession(data, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!clientId || clientId.includes('your_google_client_id')) {
    return (
      <div className="rounded-xl border border-border bg-canvas px-4 py-6 text-center">
        <p className="text-sm text-muted">
          Set <code className="font-mono text-xs text-ink">VITE_GOOGLE_CLIENT_ID</code> in{' '}
          <code className="font-mono text-xs text-ink">frontend/.env</code>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center space-y-4"
      >
        <p className="text-center text-sm text-muted">
          {mode === 'login'
            ? 'Sign in with your Google account'
            : 'Create your account using Google'}
        </p>

        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in was cancelled or failed')}
            theme="outline"
            size="large"
            text={mode === 'login' ? 'signin_with' : 'signup_with'}
            shape="pill"
            width="100%"
          />
        </div>
      </motion.div>

      {loading && (
        <p className="text-center text-sm text-muted">Signing in...</p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
