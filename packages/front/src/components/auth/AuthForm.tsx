
import React, { useState } from 'react';
import { 
  Typography, Button, Input, Icon, Divider, Alert, Badge 
} from '../ui/index';
import { authService } from '../../services/authService';
import { cn } from '../../lib/utils';

interface AuthFormProps {
  onSuccess: () => void;
  onNavigate: (page: string) => void;
}

type AuthTab = 'login' | 'signup';
type UserRole = 'guest' | 'agency';

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form Data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Agency Specific
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');

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
          if (profile?.role === 'admin') onNavigate('admin-kitchen');
          else if (profile?.role === 'agency') onNavigate('agency-portal');
          else onNavigate('user');
        }
      } else {
        if (role === 'agency') {
          await authService.signUpAgency(email, password, companyName, taxId, "");
        } else {
          await authService.signUp(email, password, fullName);
        }
        onSuccess();
        onNavigate(role === 'agency' ? 'agency-portal' : 'user');
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
          
          {activeTab === 'signup' && !isForgotPassword && (
            <div className="inline-flex bg-white/5 p-1 rounded-xl border border-white/5">
              {(['guest', 'agency'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    role === r 
                      ? "bg-primary text-white shadow-lg" 
                      : "text-white/40 hover:text-white"
                  )}
                >
                  {r === 'guest' ? 'Individual' : 'B2B Partner'}
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {activeTab === 'signup' && !isForgotPassword && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
              {role === 'guest' ? (
                <Input 
                  label="Full Name" 
                  placeholder="e.g. Somchai Akha" 
                  leftIcon="person" 
                  variant="mineral"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              ) : (
                <>
                  <Input 
                    label="Company Name" 
                    placeholder="Travel Co. Ltd." 
                    leftIcon="business"
                    variant="mineral"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    required
                  />
                  <Input 
                    label="Tax ID" 
                    placeholder="Tax Identification Number" 
                    leftIcon="badge"
                    variant="mineral"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    required
                  />
                </>
              )}
            </div>
          )}

          <Input 
            label="Email Address" 
            type="email" 
            placeholder="chef@example.com" 
            leftIcon="mail" 
            variant="mineral"
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
                variant="mineral"
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
              <div className="relative flex justify-center"><span className="bg-[#0a0b0d] px-4 text-[10px] text-white/30 uppercase tracking-widest font-black">Or continue with</span></div>
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
