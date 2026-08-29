/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, User, Plus, X, ArrowRight, ArrowLeft, CheckCircle, AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

interface AuthPageProps {
  initialMode: 'login' | 'register';
  onAuthSuccess: (token: string, user: any, profile: any, skills: any[]) => void;
  onNavigate: (view: string) => void;
}

export default function AuthPage({ initialMode, onAuthSuccess, onNavigate }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Registration Steps: 1 = Basic Info, 2 = Skills configuration
  const [step, setStep] = useState(1);
  
  // Common states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Skill setup states
  const [canTeachInput, setCanTeachInput] = useState('');
  const [canTeach, setCanTeach] = useState<string[]>(['Java', 'Spring Boot']);
  const [wantsToLearnInput, setWantsToLearnInput] = useState('');
  const [wantsToLearn, setWantsToLearn] = useState<string[]>(['React', 'UI/UX']);
  
  // Status feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available skill tags for quick selection
  const skillPresets = [
    'React', 'Java', 'Spring Boot', 'Python', 'Photoshop', 'UI/UX', 'SEO', 
    'Growth Marketing', 'Node.js', 'Typescript', 'SQL', 'FastAPI', 'Figma', 'Docker'
  ];

  useEffect(() => {
    setMode(initialMode);
    setStep(1);
    setError(null);
  }, [initialMode]);

  const handleAddCanTeach = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !canTeach.includes(trimmed)) {
      setCanTeach([...canTeach, trimmed]);
      setCanTeachInput('');
    }
  };

  const handleRemoveCanTeach = (index: number) => {
    setCanTeach(canTeach.filter((_, i) => i !== index));
  };

  const handleAddWantsToLearn = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !wantsToLearn.includes(trimmed)) {
      setWantsToLearn([...wantsToLearn, trimmed]);
      setWantsToLearnInput('');
    }
  };

  const handleRemoveWantsToLearn = (index: number) => {
    setWantsToLearn(wantsToLearn.filter((_, i) => i !== index));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      onAuthSuccess(data.token, data.user, data.profile, data.skills);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (canTeach.length === 0 || wantsToLearn.length === 0) {
      setError('Please add at least one skill to teach and one skill to learn.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          canTeach,
          wantsToLearn
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onAuthSuccess(data.token, data.user, data.profile, data.skills);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (!email || !password || !name) {
      setError('Name, Email, and Password are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setError(null);
    setStep(2);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/40">
        
        {/* Header */}
        <div className="text-center">
          <span 
            onClick={() => onNavigate('landing')} 
            className="inline-flex cursor-pointer text-xs font-semibold text-indigo-400 hover:underline mb-3"
          >
            ← Back to landing
          </span>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-100">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 font-sans text-sm text-slate-400">
            {mode === 'login' ? (
              <>
                New to SkillBridge?{' '}
                <button 
                  onClick={() => { setMode('register'); setStep(1); setError(null); }} 
                  className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                  id="auth-go-register-btn"
                >
                  Register here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => { setMode('login'); setError(null); }} 
                  className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                  id="auth-go-login-btn"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="flex items-center space-x-2 rounded-xl bg-red-950/40 border border-red-500/20 p-3.5 text-xs font-semibold text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Body */}
        {mode === 'login' ? (
          /* LOGIN FORM */
          <form className="mt-8 space-y-4" onSubmit={handleLoginSubmit} id="auth-login-form">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="name@company.com"
                  id="login-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                  id="login-password-input"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800" />
                <span>Remember me</span>
              </label>
              <span className="hover:underline cursor-pointer hover:text-indigo-400">Forgot Password?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full justify-center rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 hover:bg-indigo-500 active:scale-95 transition disabled:bg-slate-800 disabled:text-slate-600"
              id="login-submit-btn"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* REGISTER FORM MULTI-STEP */
          <div className="mt-8 space-y-6">
            
            {/* Step indicators */}
            <div className="flex items-center justify-center space-x-2">
              <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
              <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
            </div>

            {step === 1 ? (
              /* STEP 1: basic info */
              <div className="space-y-4" id="register-step-1">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Gokul Ramasamy"
                      id="register-name-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. gokul@company.com"
                      id="register-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Choose Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Min. 6 characters"
                      id="register-password-input"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="mt-6 flex w-full items-center justify-center space-x-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 hover:bg-indigo-500 active:scale-95 transition"
                  id="register-next-btn"
                >
                  <span>Continue to Skills</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* STEP 2: skills mapping */
              <div className="space-y-5" id="register-step-2">
                
                {/* BACK TO STEP 1 */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
                  id="register-back-btn"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Account Info</span>
                </button>

                {/* SKILLS I CAN TEACH */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Skills I Can Teach
                    </label>
                    <span className="text-[10px] text-emerald-400 font-bold">Add at least 1</span>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={canTeachInput}
                      onChange={(e) => setCanTeachInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCanTeach(canTeachInput))}
                      placeholder="e.g. Java, Python, Figma"
                      className="block flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                      id="register-teach-input"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCanTeach(canTeachInput)}
                      className="rounded-xl bg-slate-800 p-2 text-white hover:bg-indigo-600 transition"
                      id="register-teach-add-btn"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {canTeach.map((skill, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center space-x-1 rounded-full bg-emerald-950/45 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/10"
                      >
                        <span>{skill}</span>
                        <X className="w-3 h-3 cursor-pointer text-emerald-500 hover:text-emerald-300" onClick={() => handleRemoveCanTeach(index)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* SKILLS I WANT TO LEARN */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Skills I Want To Learn
                    </label>
                    <span className="text-[10px] text-indigo-400 font-bold">Add at least 1</span>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={wantsToLearnInput}
                      onChange={(e) => setWantsToLearnInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddWantsToLearn(wantsToLearnInput))}
                      placeholder="e.g. React, UI/UX, SEO"
                      className="block flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                      id="register-learn-input"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddWantsToLearn(wantsToLearnInput)}
                      className="rounded-xl bg-slate-800 p-2 text-white hover:bg-indigo-600 transition"
                      id="register-learn-add-btn"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {wantsToLearn.map((skill, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center space-x-1 rounded-full bg-indigo-950/45 px-2.5 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/10"
                      >
                        <span>{skill}</span>
                        <X className="w-3 h-3 cursor-pointer text-indigo-500 hover:text-indigo-300" onClick={() => handleRemoveWantsToLearn(index)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Presets picker */}
                <div className="border-t border-slate-800/80 pt-3">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quick presets</span>
                  <div className="flex flex-wrap gap-1">
                    {skillPresets.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          // Default to add to canTeach or wantsToLearn
                          if (canTeach.length < 3) {
                            handleAddCanTeach(preset);
                          } else {
                            handleAddWantsToLearn(preset);
                          }
                        }}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-2xs font-medium text-slate-400 hover:bg-indigo-950/60 hover:text-indigo-400 hover:border-indigo-500/30 transition"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRegisterSubmit}
                  className="mt-6 flex w-full justify-center rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 hover:bg-indigo-500 active:scale-95 transition disabled:bg-slate-800 disabled:text-slate-600"
                  id="register-submit-btn"
                >
                  {loading ? 'Creating account...' : 'Complete & Start Swapping!'}
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
