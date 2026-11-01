import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertCircle,
  Users
} from 'lucide-react';
import { 
  isFirebaseConfigured, 
  loginWithGoogle, 
  loginWithEmail, 
  setLocalAdminSession,
  isEmailAuthorized,
} from '../services/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (isFirebaseConfigured) {
        const user = await loginWithGoogle();
        if (user && user.email) {
          onLoginSuccess(user.email);
          onClose();
        }
      } else {
        setLocalAdminSession('ashadevi903237@gmail.com');
        onLoginSuccess('ashadevi903237@gmail.com');
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!isEmailAuthorized(email)) {
        throw new Error(`Access Denied: ${email} is not authorized.`);
      }

      if (isFirebaseConfigured) {
        const user = await loginWithEmail(email, password);
        if (user && user.email) {
          onLoginSuccess(user.email);
          onClose();
        }
      } else {
        setLocalAdminSession(email);
        onLoginSuccess(email);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAuthorizedAdmin = (adminEmail: string) => {
    setLocalAdminSession(adminEmail);
    onLoginSuccess(adminEmail);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Tailor Admin Access</h3>
              <p className="text-[11px] text-stone-500">Authorized Single Sign-In</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Authorized Admins Badge */}
        <div className="mt-3.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-stone-900 text-[11px]">
            <Users className="w-3.5 h-3.5 text-stone-500" />
            <span>Allowed Accounts:</span>
          </div>
          <ul className="text-[11px] text-stone-500 space-y-0.5 list-disc list-inside">
            <li>ashadevi903237@gmail.com</li>
            <li>anjalikumari903237@gmail.com</li>
            <li>vishalkumar9032374977@gmail.com</li>
          </ul>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-[11px]">{error}</span>
          </div>
        )}

        <div className="mt-4 space-y-3.5">
          {/* Google Sign-in button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-3.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-2xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>

          <div className="relative flex items-center justify-center text-[11px] text-stone-400">
            <span className="bg-white px-2 z-10">or email</span>
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-2.5">
            <div>
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              Sign In
            </button>
          </form>

          {/* 1-Tap Quick Authorized Admin buttons */}
          <div className="pt-2 border-t border-stone-100 space-y-1.5 text-center">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
              1-Tap Fast Login for Owners:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectAuthorizedAdmin('ashadevi903237@gmail.com')}
                className="py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] truncate border border-stone-200"
                title="Asha Devi"
              >
                Asha Devi
              </button>
              <button
                type="button"
                onClick={() => handleSelectAuthorizedAdmin('anjalikumari903237@gmail.com')}
                className="py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] truncate border border-stone-200"
                title="Anjali Kumari"
              >
                Anjali Kumari
              </button>
              <button
                type="button"
                onClick={() => handleSelectAuthorizedAdmin('vishalkumar9032374977@gmail.com')}
                className="py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] truncate border border-stone-200"
                title="Vishal Kumar"
              >
                Vishal Kumar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
