import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { auth } from '../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FaEnvelope, FaCircleCheck, FaTriangleExclamation } from 'react-icons/fa6';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setSuccessMsg('Reset link sent! Please check your email inbox.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to send recovery email. Double check the address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark text-white gradient-bg px-4">
      <div className="w-full max-w-md glass-panel-neon-purple p-8 rounded-3xl relative overflow-hidden">
        {/* Glow Detail */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-pink shadow-lg shadow-neon-purple/25 mb-4 animate-float">
            <span className="font-display font-black text-2xl text-white">C</span>
          </div>
          <h1 className="font-display font-black text-2xl tracking-wider mb-1 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            RECOVER PASSWORD
          </h1>
          <p className="text-xs text-gray-400 font-medium">Reset your authorization credentials</p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs">
            <FaCircleCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs">
            <FaTriangleExclamation className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Registered Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-3.5 text-gray-500 w-4 h-4" />
              <input
                type="email"
                placeholder="student@college.edu"
                className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-sm"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-neon-pink text-[11px] font-semibold mt-1">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink font-display font-bold text-sm tracking-wider text-white shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40 active:scale-98 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'SENDING RESET LINK...' : 'SEND RESET LINK'}
          </button>
        </form>

        {/* Return to Login */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Remembered your details?{' '}
          <Link to="/login" className="font-bold text-neon-purple hover:text-neon-pink transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
