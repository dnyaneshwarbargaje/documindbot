
import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Mail, Sparkles, ArrowRight, Loader2, ShieldCheck, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import emailjs from 'https://esm.sh/@emailjs/browser@^4.4.1';

// --- CONFIGURATION ---
// Replace these with your actual EmailJS credentials
const EMAILJS_SERVICE_ID = 'service_default'; 
const EMAILJS_TEMPLATE_ID = 'template_otp';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; 

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthStep = 'IDENTITY' | 'OTP';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('IDENTITY');
  const [isLoading, setIsLoading] = useState(false);
  const [identity, setIdentity] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle resend countdown
  useEffect(() => {
    let interval: number;
    if (resendTimer > 0) {
      interval = window.setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const newOtp = generateRandomOtp();
    setGeneratedOtp(newOtp);

    try {
      // In a real production app with keys, this would be:
      // await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      //   to_name: name,
      //   to_email: identity,
      //   otp_code: newOtp
      // }, EMAILJS_PUBLIC_KEY);
      
      // For demonstration, we simulate the network delay
      console.log(`[DEBUG] OTP Sent to ${identity}: ${newOtp}`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep('OTP');
      setResendTimer(60); // 60 seconds cooldown
    } catch (err) {
      setError("I couldn't send the email right now. Maybe check your connection or try again later?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const enteredOtp = otp.join('');
    
    // Artificial verification delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 1200));

    // For this prototype, '123456' works alongside the generated one for easy testing
    if (enteredOtp === generatedOtp || enteredOtp === '123456') {
      const mockUser: User = {
        id: Math.random().toString(36).substring(7),
        name: name || identity.split('@')[0],
        email: identity,
      };
      localStorage.setItem('doc_assistant_user', JSON.stringify(mockUser));
      onLogin(mockUser);
    } else {
      setError("That code doesn't match the one I sent. Mind double-checking your inbox?");
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
    setIsLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-50">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden ring-1 ring-white/5">
          <div className="p-10">
            
            {/* Brand Identity */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-500/20 rotate-3 transition-transform hover:rotate-0">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter mb-3">
                {step === 'IDENTITY' ? "Secure Entry" : "Verification"}
              </h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed px-4">
                {step === 'IDENTITY' 
                  ? "Tell me who you are, and I'll send a one-time secure code to your email." 
                  : `Check your inbox! I've sent a 6-digit code to ${identity}.`}
              </p>
            </div>

            {step === 'IDENTITY' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    required
                    type="text"
                    placeholder="Your full name"
                    className="w-full py-4 pl-12 pr-4 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white placeholder:text-slate-600 text-base"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    required
                    type="email"
                    placeholder="Work email address"
                    className="w-full py-4 pl-12 pr-4 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white placeholder:text-slate-600 text-base"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Email me a code
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      // Fix: Ref callback must return void or a cleanup function; assignment alone returns the value
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-16 bg-slate-950 border-2 border-slate-800 rounded-xl text-center text-2xl font-black text-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                    <ShieldCheck className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-rose-200 leading-snug">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading || otp.some(d => !d)}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Confirm & Continue"
                    )}
                  </button>
                  
                  <div className="flex flex-col items-center gap-2">
                    {resendTimer > 0 ? (
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Resend available in {resendTimer}s
                      </p>
                    ) : (
                      <button 
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-colors flex items-center gap-2"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        I didn't get the email
                      </button>
                    )}
                    
                    <button 
                      type="button"
                      onClick={() => setStep('IDENTITY')}
                      className="text-slate-500 hover:text-white text-xs font-bold transition-colors"
                    >
                      Use a different email address
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>
        
        {/* Verification Badges */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No Password Required</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.4em]">
            Identity Layer v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
