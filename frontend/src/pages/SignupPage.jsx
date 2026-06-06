import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthTabs from '../components/auth/AuthTabs';
import EmailAuthForm from '../components/auth/EmailAuthForm';
import GoogleAuthForm from '../components/auth/GoogleAuthForm';
import OtpAuthForm from '../components/auth/OtpAuthForm';

export default function SignupPage() {
  const [tab, setTab] = useState('email');

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join VendorBridge and streamline procurement"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover transition-colors">
            Sign in
          </Link>
        </>
      }
    >
      <AuthTabs active={tab} onChange={setTab} mode="signup" />
      {tab === 'email' && <EmailAuthForm mode="signup" />}
      {tab === 'google' && <GoogleAuthForm mode="signup" />}
      {tab === 'otp' && <OtpAuthForm mode="signup" />}
    </AuthLayout>
  );
}
