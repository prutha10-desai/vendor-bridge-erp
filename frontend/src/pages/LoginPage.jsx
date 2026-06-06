import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthTabs from '../components/auth/AuthTabs';
import EmailAuthForm from '../components/auth/EmailAuthForm';
import GoogleAuthForm from '../components/auth/GoogleAuthForm';
import OtpAuthForm from '../components/auth/OtpAuthForm';

export default function LoginPage() {
  const [tab, setTab] = useState('email');

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your VendorBridge workspace"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-accent hover:text-accent-hover transition-colors">
            Create one
          </Link>
        </>
      }
    >
      <AuthTabs active={tab} onChange={setTab} mode="login" />
      {tab === 'email' && <EmailAuthForm mode="login" />}
      {tab === 'google' && <GoogleAuthForm mode="login" />}
      {tab === 'otp' && <OtpAuthForm mode="login" />}
    </AuthLayout>
  );
}
