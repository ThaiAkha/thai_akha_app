
import React, { useState } from 'react';
import { 
  Typography, Button, Icon, Divider, Alert, Badge 
} from '../ui/index';
import { Input } from '../ui/form';
import { authService } from '../../services/auth.service';
import { cn } from '@thaiakha/shared/lib/utils';

interface AuthFormProps {
  onSuccess: () => void;
  onNavigate: (page: string) => void;
}

type AuthTab = 'login' | 'signup';

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form Data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isForgotPassword) {
        await authService.resetPassword(email);
        setSuccessMsg("Reset link sent! Check your email kha.");
        setLoading(false);
        return;
      }

      if (activeTab === 'login') {
        const { user } = await authService.signIn(email, password);
        if (user) {
          const profile = await authService.getCurrentUserProfile();
          onSuccess();

          // Staff roles (admin, manager, driver, kitchen, logistics, agency) redirect to Admin App
          if (profile?.role && ['admin', 'manager', 'driver', 'kitchen', 'logistics', 'agency'].includes(profile.role)) {
            const adminUrl = import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:3001';
            // Redirect to admin app
            window.location.href = `${adminUrl}?token=${user.id}&app=front`;
          } else {
            // Customers (guest, customer) stay in Front App
            onNavigate('user');
          }
        }
      } else {
        await authService.signUp(email, password, fullName);
        onSuccess();
        // New signups always go to user page
        onNavigate('user');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed.');
    } finally {
      if (!isForgotPassword) setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* 1. HEADER TABS */}
      <div className="flex border-b border-white/5 mb-8">
        {(['login', 'signup'] as AuthTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setIsForgotPassword(false); setError(null); }}
            className={cn(
              "flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative",
              activeTab === tab && !isForgotPassword
                ? "text-primary bg-white/5" 
                : "text-white/30 hover:text-white hover:bg-white/5"
            )}
          >
            {tab === 'login' ? 'Member Login' : 'New Account'}
            {activeTab === tab && !isForgotPassword && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-brand-glow" />}
          </button>
        ))}
      </div>

      <div className="px-6 md:px-10 pb-10">
        <div className="mb-8 text-center space-y-4">
          <Typography variant="h4" className="text-white italic">
            {isForgotPassword ? "Reset Password" : (activeTab === 'login' ? "Welcome Back" : "Join the Kitchen")}
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {activeTab === 'signup' && !isForgotPassword && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
              <Input 
                label="Full Name" 
                placeholder="e.g. Somchai Akha" 
                leftIcon="person" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <Input 
            label="Email Address" 
            type="email" 
            placeholder="chef@example.com" 
            leftIcon="mail" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          {!isForgotPassword && (
            <div className="space-y-2">
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                leftIcon="lock" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {activeTab === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] font-bold text-white/40 hover:text-white transition-colors">
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          )}

          {error && <Alert variant="error" message={error} className="py-3 text-xs" />}
          {successMsg && <Alert variant="success" message={successMsg} className="py-3 text-xs" />}

          <Button 
            fullWidth 
            size="xl" 
            variant="brand" 
            type="submit" 
            isLoading={loading}
            className="rounded-2xl shadow-brand-glow mt-4"
            icon="arrow_forward"
          >
            {isForgotPassword ? 'Send Recovery Link' : (activeTab === 'login' ? 'Enter Kitchen' : 'Create Account')}
          </Button>
        </form>

        {!isForgotPassword && (
          <>
            <div className="relative py-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center"><span className="bg-surface-overlay px-4 text-[10px] text-white/30 uppercase tracking-widest font-black">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="mineral" 
                onClick={() => console.log("Google Login Clicked")}
                className="rounded-xl border-white/10"
                icon="language"
              >
                Google
              </Button>
              <Button 
                variant="mineral" 
                onClick={() => console.log("Facebook Login Clicked")}
                className="rounded-xl border-white/10"
                icon="facebook"
              >
                Facebook
              </Button>
            </div>
          </>
        )}

        {isForgotPassword && (
          <button 
            onClick={() => setIsForgotPassword(false)} 
            className="w-full mt-6 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
