import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  Users, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Code2,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { Button, Card, cn } from '../components/UI';
import { Role } from '../types';

interface AuthPageProps {
  type: 'LOGIN' | 'SIGNUP';
  onAuthSuccess: (role: Role, name?: string, email?: string) => void;
  onToggleType: () => void;
}

export const AuthPage = ({ type, onAuthSuccess, onToggleType }: AuthPageProps) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('MEMBER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (type === 'SIGNUP' && !name) newErrors.name = 'Full Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (type === 'SIGNUP' && role === 'MEMBER' && !workspaceCode) {
      newErrors.workspaceCode = 'Workspace code required for members';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      if (type === 'SIGNUP') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: role,
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          onAuthSuccess(role, name || email.split('@')[0], email);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          // Fetch role from users table (mocked for now, assuming role from metadata)
          const userRole = data.user.user_metadata?.role || 'MEMBER';
          onAuthSuccess(userRole as Role, data.user.user_metadata?.full_name || email.split('@')[0], email);
        }
      }
    } catch (err: any) {
      setErrors({ email: err.message || 'Authentication failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl"
      >
        <Card className="p-10 md:p-12 glass relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-3xl -z-10 animate-pulse"></div>
          
          <button 
            onClick={() => navigate('/')}
            className="absolute top-8 left-8 p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            <span>Return</span>
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary mb-6 shadow-inner">
              <Sparkles size={32} />
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
              {type === 'LOGIN' ? 'Welcome back to Velora' : 'Start your journey'}
            </h2>
            <p className="text-slate-500">
              {type === 'LOGIN' ? 'Enter your credentials to access resonance' : 'Create your workspace ecosystem'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                  role === 'ADMIN' 
                    ? "bg-brand-primary/5 border-brand-primary text-brand-primary shadow-sm" 
                    : "border-slate-200 text-slate-400 hover:border-slate-300 dark:border-white/10"
                )}
              >
                <ShieldCheck size={20} />
                <span className="font-bold text-sm">Administrator</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('MEMBER')}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                  role === 'MEMBER' 
                    ? "bg-brand-secondary/5 border-brand-secondary text-brand-secondary shadow-sm" 
                    : "border-slate-200 text-slate-400 hover:border-slate-300 dark:border-white/10"
                )}
              >
                <Users size={20} />
                <span className="font-bold text-sm">Team Member</span>
              </button>
            </div>

            {/* Demo Login Options */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="bg-white dark:bg-slate-900 px-4 text-slate-400">Quick Access Demo</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Button 
                type="button" 
                variant="outline" 
                className="h-12 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-primary/5 transition-all dark:border-white/10 dark:text-white"
                onClick={() => onAuthSuccess('ADMIN')}
               >
                 Demo Admin
               </Button>
               <Button 
                type="button" 
                variant="outline" 
                className="h-12 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-secondary/5 transition-all dark:border-white/10 dark:text-white"
                onClick={() => onAuthSuccess('MEMBER')}
               >
                 Demo Member
               </Button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="bg-white dark:bg-slate-900 px-4 text-slate-400">Or use email</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-left">
              {type === 'SIGNUP' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sanya Gautam"
                      className={cn(
                        "w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 transition-all text-slate-700",
                        errors.name && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/5"
                      )}
                    />
                  </div>
                  {errors.name && <p className="text-xs font-medium text-rose-500 pl-1">{errors.name}</p>}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sanya@velora.ai"
                    className={cn(
                      "w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 transition-all text-slate-700",
                      errors.email && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/5"
                    )}
                  />
                </div>
                {errors.email && <p className="text-xs font-medium text-rose-500 pl-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn(
                      "w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 transition-all text-slate-700",
                      errors.password && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/5"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs font-medium text-rose-500 pl-1">{errors.password}</p>}
                
                {/* Password Strength Indicator */}
                <div className="flex gap-1 h-1 mt-2 px-1">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={cn(
                        "flex-1 rounded-full transition-colors duration-500",
                        passwordStrength >= s 
                          ? (passwordStrength === 1 ? "bg-rose-400" : passwordStrength === 2 ? "bg-amber-400" : "bg-emerald-400")
                          : "bg-slate-200"
                      )}
                    />
                  ))}
                </div>
              </div>

              {type === 'SIGNUP' && role === 'MEMBER' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Workspace Frequency Code</label>
                  <div className="relative group">
                    <Code2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-secondary transition-colors" />
                    <input
                      type="text"
                      value={workspaceCode}
                      onChange={(e) => setWorkspaceCode(e.target.value)}
                      placeholder="VEL-10293-SYNC"
                      className={cn(
                        "w-full bg-slate-50/50 border-2 border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-brand-secondary/30 focus:ring-4 focus:ring-brand-secondary/5 transition-all text-slate-700 dark:text-slate-200",
                        errors.workspaceCode && "border-rose-300 focus:border-rose-400"
                      )}
                    />
                  </div>
                  {errors.workspaceCode && <p className="text-xs font-medium text-rose-500 pl-1">{errors.workspaceCode}</p>}
                </motion.div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-base rounded-2xl gap-2 mt-4"
              isLoading={isLoading}
            >
              {type === 'LOGIN' ? 'Sign In' : 'Create Account'}
              <ArrowRight size={20} />
            </Button>

            <div className="text-center mt-8">
              <button
                type="button"
                onClick={onToggleType}
                className="text-sm font-medium text-slate-500 hover:text-brand-primary transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                {type === 'LOGIN' ? "Don’t have an account?" : "Already have an account?"}
                <span className="font-bold text-brand-primary">{type === 'LOGIN' ? 'Sign up' : 'Return to Login'}</span>
              </button>
            </div>
          </form>
        </Card>
        
        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Secure Login</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-brand-accent ripple" />
            <span>Protected Session</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
