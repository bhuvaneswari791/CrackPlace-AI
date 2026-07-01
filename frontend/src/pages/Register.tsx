import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaBuilding, FaTriangleExclamation } from 'react-icons/fa6';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  college: z.string().min(2, 'College name is required'),
  department: z.string().min(2, 'Department is required'),
  year: z.number().min(1).max(5),
  dreamCompany: z.string().min(1, 'Target dream company is required')
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      year: 1
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoadingLocal(true);
    setErrorMsg(null);
    try {
      await registerUser(data.email, data.password, data.displayName, {
        college: data.college,
        department: data.department,
        year: Number(data.year),
        dreamCompany: data.dreamCompany
      });
      const pendingInvite = sessionStorage.getItem('pending_invite');
      if (pendingInvite) {
        sessionStorage.removeItem('pending_invite');
        navigate(`/invite/${pendingInvite}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Registration failed. Email might already be in use.');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark text-white gradient-bg px-4 py-8">
      <div className="w-full max-w-2xl glass-panel-neon-purple p-8 rounded-3xl relative overflow-hidden">
        {/* Glow Details */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-pink shadow-lg shadow-neon-purple/25 mb-4 animate-float">
            <span className="font-display font-black text-2xl text-white">C</span>
          </div>
          <h1 className="font-display font-black text-2xl tracking-wider mb-1 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            CREATE ACCOUNT
          </h1>
          <p className="text-xs text-gray-400 font-medium">Join the ranks and begin your placement quest.</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs">
            <FaTriangleExclamation className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Credentials Column */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-neon-purple mb-2">Account Details</h3>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-3 text-gray-500 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Alex Mercer"
                    className="glass-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm"
                    {...registerField('displayName')}
                  />
                </div>
                {errors.displayName && <p className="text-neon-pink text-[10px] font-semibold mt-1">{errors.displayName.message}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-3 text-gray-500 w-3.5 h-3.5" />
                  <input
                    type="email"
                    placeholder="alex@college.edu"
                    className="glass-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm"
                    {...registerField('email')}
                  />
                </div>
                {errors.email && <p className="text-neon-pink text-[10px] font-semibold mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-3 text-gray-500 w-3.5 h-3.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="glass-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm"
                    {...registerField('password')}
                  />
                </div>
                {errors.password && <p className="text-neon-pink text-[10px] font-semibold mt-1">{errors.password.message}</p>}
              </div>
            </div>

            {/* Academic Stats Column */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-neon-cyan mb-2">Academic Stats</h3>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">University / College</label>
                <div className="relative">
                  <FaGraduationCap className="absolute left-4 top-3 text-gray-500 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Stanford University"
                    className="glass-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm"
                    {...registerField('college')}
                  />
                </div>
                {errors.college && <p className="text-neon-pink text-[10px] font-semibold mt-1">{errors.college.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Department</label>
                  <input
                    type="text"
                    placeholder="CSE"
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                    {...registerField('department')}
                  />
                  {errors.department && <p className="text-neon-pink text-[10px] font-semibold mt-1">{errors.department.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Current Year</label>
                  <select
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm appearance-none bg-bg-dark/80 cursor-pointer"
                    {...registerField('year', { valueAsNumber: true })}
                  >
                    <option value={1} className="bg-bg-dark text-white">1st Year</option>
                    <option value={2} className="bg-bg-dark text-white">2nd Year</option>
                    <option value={3} className="bg-bg-dark text-white">3rd Year</option>
                    <option value={4} className="bg-bg-dark text-white">4th Year</option>
                    <option value={5} className="bg-bg-dark text-white">5th Year</option>
                  </select>
                  {errors.year && <p className="text-neon-pink text-[10px] font-semibold mt-1">{errors.year.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Dream Company</label>
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-3 text-gray-500 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Google, Zoho, TCS..."
                    className="glass-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm"
                    {...registerField('dreamCompany')}
                  />
                </div>
                {errors.dreamCompany && <p className="text-neon-pink text-[10px] font-semibold mt-1">{errors.dreamCompany.message}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingLocal}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan font-display font-bold text-sm tracking-wider text-white shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40 active:scale-98 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {loadingLocal ? 'INITIALIZING PROFILE...' : 'SIGN UP & START TRAINING'}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-neon-purple hover:text-neon-pink transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
