import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import RoleSelect from './RoleSelect';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export default function GoogleAuthForm({ mode = 'login' }) {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsRole, setNeedsRole] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);
  const [role, setRole] = useState('procurement_officer');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleSuccess = async (credentialResponse, selectedRole) => {
    setError('');
    setLoading(true);

    try {
      const payload = { idToken: credentialResponse.credential };
      if (selectedRole) payload.role = selectedRole;

      const { data } = await authApi.google(payload);
      setSession(data, data.token);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Google authentication failed';

      if (message.includes('Role is required') && mode === 'signup') {
        setPendingToken(credentialResponse.credential);
        setNeedsRole(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmRoleSignup = async () => {
    if (!pendingToken) return;
    await handleGoogleSuccess({ credential: pendingToken }, role);
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
      <AnimatePresence mode="wait">
        {needsRole ? (
          <motion.div
            key="role"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <p className="text-sm text-muted">Select your role to complete Google signup.</p>
            <RoleSelect value={role} onChange={setRole} />
            <Button onClick={confirmRoleSignup} loading={loading} className="w-full" size="lg">
              Complete signup
            </Button>
            <Button variant="ghost" onClick={() => setNeedsRole(false)} className="w-full">
              Back
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="google"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center space-y-4"
          >
            <p className="text-center text-sm text-muted">
              {mode === 'login'
                ? 'Sign in with your Google account'
                : 'Create your account using Google'}
            </p>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={(res) => handleGoogleSuccess(res, mode === 'signup' ? role : undefined)}
                onError={() => setError('Google sign-in was cancelled or failed')}
                theme="outline"
                size="large"
                text={mode === 'login' ? 'signin_with' : 'signup_with'}
                shape="pill"
                width="100%"
              />
            </div>

            {mode === 'signup' && !needsRole && (
              <div className="w-full pt-2">
                <RoleSelect value={role} onChange={setRole} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
