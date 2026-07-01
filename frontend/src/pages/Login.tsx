import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FaEnvelope, FaLock, FaGoogle, FaTriangleExclamation } from 'react-icons/fa6';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, loginWithGoogle } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoadingLocal(true);
    setErrorMsg(null);
    try {
      await login(data.email, data.password);
      const pendingInvite = sessionStorage.getItem('pending_invite');
      if (pendingInvite) {
        sessionStorage.removeItem('pending_invite');
        navigate(`/invite/${pendingInvite}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingLocal(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      const pendingInvite = sessionStorage.getItem('pending_invite');
      if (pendingInvite) {
        sessionStorage.removeItem('pending_invite');
        navigate(`/invite/${pendingInvite}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark text-white gradient-bg px-4">
      <div className="w-full max-w-md glass-panel-neon-purple p-8 rounded-3xl relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-pink/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-pink shadow-lg shadow-neon-purple/25 mb-4 animate-float">
            <span className="font-display font-black text-2xl text-white">C</span>
          </div>
          <h1 className="font-display font-black text-2xl tracking-wider mb-1 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            CRACKPLACE AI
          </h1>
          <p className="text-xs text-gray-400 font-medium">Ready to conquer your placement journey?</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs">
            <FaTriangleExclamation className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-3.5 text-gray-500 w-4 h-4" />
              <input
                type="email"
                placeholder="student@college.edu"
                className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-sm"
                {...registerField('email')}
              />
            </div>
            {errors.email && <p className="text-neon-pink text-[11px] font-semibold mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-neon-purple hover:text-neon-pink transition-colors">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-3.5 text-gray-500 w-4 h-4" />
              <input
                type="password"
                placeholder="••••••••"
                className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-sm"
                {...registerField('password')}
              />
            </div>
            {errors.password && <p className="text-neon-pink text-[11px] font-semibold mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loadingLocal}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink font-display font-bold text-sm tracking-wider text-white shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40 active:scale-98 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {loadingLocal ? 'LOGGING IN...' : 'LOG IN'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-gray-500">Or continue with</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loadingLocal}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 font-display font-semibold text-sm cursor-pointer disabled:opacity-50"
        >
          <FaGoogle className="w-4 h-4 text-neon-pink" />
          <span>Google Account</span>
        </button>

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-400 mt-8">
          New to CrackPlace?{' '}
          <Link to="/register" className="font-bold text-neon-purple hover:text-neon-pink transition-colors">
            Register Profile
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
