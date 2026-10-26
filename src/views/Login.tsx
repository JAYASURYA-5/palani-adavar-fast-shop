import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../store/restaurantStore';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Flame, 
  UserCheck, 
  KeyRound, 
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { employees, setCurrentUser, settings } = useRestaurantStore();

  const [mode, setMode] = useState<'credentials' | 'pin'>('pin');
  const [email, setEmail] = useState('palani@andavarfastfood.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // PIN login states
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetEmp = employees.find(
      (emp) => emp.email.toLowerCase() === email.toLowerCase()
    );

    if (targetEmp && password === 'password123') {
      setCurrentUser(targetEmp);
      navigate('/dashboard');
    } else {
      setErrorMsg('Invalid email or password. Use password123 to log in.');
    }
  };

  const handlePinClick = (digit: string) => {
    setErrorMsg('');
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      
      // Auto submit when 4 digits are typed
      if (nextPin === '1234') {
        const targetEmp = employees.find((emp) => emp.id === selectedEmpId);
        if (targetEmp) {
          setCurrentUser(targetEmp);
          navigate('/dashboard');
        }
      } else if (nextPin.length === 4) {
        // Wrong PIN
        setTimeout(() => {
          setErrorMsg('Invalid PIN. Use 1234.');
          setPin('');
        }, 150);
      }
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handlePinClear = () => {
    setPin('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0b1a] text-white font-poppins relative overflow-hidden">
      
      {/* Background illustration styling */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(124,58,237,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(217,119,6,0.22),transparent_45%)] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#160f2e_1px,transparent_1px),linear-gradient(to_bottom,#160f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      
      <div className="w-full max-w-5xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        
        {/* Left Side: Brand presentation */}
        <div className="lg:col-span-6 flex flex-col justify-center text-left space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <span className="text-5xl md:text-6xl text-brand-400 animate-pulse">{settings.logo}</span>
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-300 to-amber-400">
                {settings.name}
              </h1>
              <span className="text-xs text-primary-400 font-semibold tracking-widest uppercase">
                Premium POS &amp; Business Suite
              </span>
            </div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md"
          >
            Manage orders, inventory, kitchen dispatch and financial registers in real-time. Optimize fast-food service with absolute speed and reliability.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:flex flex-col gap-4 text-xs bg-[#160f2e]/60 border border-[#2a1f4e]/60 rounded-3xl p-5 max-w-sm backdrop-blur-md"
          >
            <div className="font-bold text-primary-400 uppercase tracking-wider">Developer &amp; Demo Credentials</div>
            <div className="space-y-2 text-slate-300 font-mono">
              <div>👨‍💼 Owner PIN: <strong className="text-white">1234</strong> (Select Palani)</div>
              <div>🧑‍🍳 Staff PIN: <strong className="text-white">1234</strong> (Select Chef/Cashier)</div>
              <div>📧 Email: <strong className="text-white">palani@andavarfastfood.com</strong></div>
              <div>🔑 Password: <strong className="text-white">password123</strong></div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Login Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 flex items-center justify-center"
        >
          <div className="w-full max-w-md bg-[#160f2e]/90 backdrop-blur-xl border border-[#2a1f4e] rounded-3xl p-8 shadow-2xl relative">
            
            {/* Mode Switcher */}
            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setMode('pin'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'pin' 
                    ? 'bg-gradient-to-r from-brand-500 to-primary-500 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                POS PIN Pad
              </button>
              <button
                type="button"
                onClick={() => { setMode('credentials'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'credentials' 
                    ? 'bg-gradient-to-r from-brand-500 to-primary-500 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Email Sign In
              </button>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-2xl flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {errorMsg}
              </motion.div>
            )}

            {/* CREDENTIALS LOGIN MODE */}
            {mode === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <Mail size={16} />
                    </span>
                    <input 
                      type="email"
                      required
                      placeholder="e.g. palani@andavarfastfood.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center pl-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setErrorMsg('Enter default password "password123".')}
                      className="text-[10px] text-brand-500 font-bold hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between py-1 text-xs text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-0"
                    />
                    Remember Me
                  </label>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-brand-500 to-primary-500 hover:from-brand-600 hover:to-primary-600 font-bold rounded-2xl text-sm shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                >
                  Sign In <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* TOUCH PIN LOG IN MODE */}
            {mode === 'pin' && (
              <div className="flex flex-col items-center">
                {/* Employee Profiles Selectors */}
                <div className="flex gap-3 overflow-x-auto w-full pb-4 scrollbar-none snap-x mb-4 justify-center">
                  {employees.map((emp) => {
                    const isSelected = selectedEmpId === emp.id;
                    return (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmpId(emp.id);
                          setPin('');
                        }}
                        className={`flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all snap-start min-w-[76px] ${
                          isSelected 
                            ? 'bg-gradient-to-br from-brand-500/20 to-primary-500/20 border-2 border-brand-500 shadow'
                            : 'bg-slate-900/60 border border-slate-800 hover:bg-slate-900'
                        }`}
                      >
                        <img 
                          src={emp.avatar} 
                          alt={emp.name} 
                          className="w-10 h-10 rounded-full object-cover mb-2 border border-slate-800"
                        />
                        <span className="text-[9px] font-bold text-center text-slate-300 truncate max-w-full">
                          {emp.name.split(' ')[0]}
                        </span>
                        <span className="text-[7px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                          {emp.role}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* PIN dots display */}
                <div className="flex gap-4 justify-center py-4 mb-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full border border-slate-600 transition-all ${
                        pin.length > i 
                          ? 'bg-gradient-to-r from-brand-500 to-primary-500 scale-110 shadow-md shadow-brand-500/20' 
                          : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>

                {/* 3x4 Touch Numeric Pad */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => {
                    const isAction = ['C', '⌫'].includes(btn);
                    return (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => {
                          if (btn === 'C') handlePinClear();
                          else if (btn === '⌫') handlePinDelete();
                          else handlePinClick(btn);
                        }}
                        className={`w-full py-3 rounded-2xl font-bold font-mono text-sm transition-all active:scale-90 hover:bg-slate-800/50 ${
                          isAction 
                            ? 'bg-slate-900 text-slate-400' 
                            : 'bg-slate-900/60 text-white border border-slate-800/40'
                        }`}
                      >
                        {btn}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
          </div>
        </motion.div>
      </div>
    </div>
  );
};
