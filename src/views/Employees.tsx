import React from 'react';
import { useRestaurantStore } from '../store/restaurantStore';
import { 
  Contact, 
  Star, 
  Phone, 
  Mail, 
  Calendar, 
  Award,
  Wallet,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const Employees: React.FC = () => {
  const { employees, updateEmployeeAttendance } = useRestaurantStore();

  // Compute stats
  const presentCount = employees.filter(e => e.attendanceStatus === 'Present').length;
  const onLeaveCount = employees.filter(e => e.attendanceStatus === 'On Leave').length;
  const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0);
  const avgRating = employees.reduce((sum, e) => sum + e.rating, 0) / employees.length;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-500">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={12} 
            fill={i < Math.floor(rating) ? 'currentColor' : 'none'} 
            className={i < Math.floor(rating) ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'} 
          />
        ))}
        <span className="text-[10px] text-slate-400 font-bold ml-1 font-mono">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 font-poppins text-slate-800 dark:text-slate-100 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* KPI statistics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Present Today</span>
            <span className="text-base font-extrabold text-emerald-500 font-mono mt-1">{presentCount} / {employees.length}</span>
          </div>
          <CheckCircle size={22} className="text-emerald-500 opacity-60" />
        </div>
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Staff On Leave</span>
            <span className="text-base font-extrabold text-amber-500 font-mono mt-1">{onLeaveCount} Staff</span>
          </div>
          <HelpCircle size={22} className="text-amber-500 opacity-60" />
        </div>
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Wage bill</span>
            <span className="text-base font-extrabold text-brand-500 font-mono mt-1">₹{totalSalaries}</span>
          </div>
          <Wallet size={22} className="text-brand-500 opacity-60" />
        </div>
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Staff Rating Average</span>
            <span className="text-base font-extrabold text-blue-500 font-mono mt-1">{avgRating.toFixed(1)} / 5.0</span>
          </div>
          <Award size={22} className="text-blue-500 opacity-60" />
        </div>
      </div>

      {/* Main Roster Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* Roster Cards List */}
        <div className="lg:col-span-8 overflow-y-auto no-scrollbar space-y-4 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {employees.map((emp) => (
              <div 
                key={emp.id}
                className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder/40 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Employee Header details */}
                <div className="flex items-center gap-3 mb-4">
                  <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/10" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{emp.name}</span>
                    <span className="text-[9px] text-primary-500 font-bold uppercase tracking-wider mt-0.5">{emp.role}</span>
                    <div className="mt-1">{renderStars(emp.rating)}</div>
                  </div>
                </div>

                {/* Contacts & Metadata */}
                <div className="space-y-2 text-[10px] font-medium text-slate-500 border-t border-slate-100 dark:border-darkBorder/45 pt-3">
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400" />
                    <span className="font-mono text-slate-600 dark:text-slate-300">{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400 animate-pulse" />
                    <span>{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-slate-400" />
                    <span>Joined: {emp.joinedDate}</span>
                  </div>
                  {emp.salary > 0 && (
                    <div className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300">
                      <Wallet size={12} className="text-slate-400" />
                      <span>Wage: ₹{emp.salary.toLocaleString()}/mo</span>
                    </div>
                  )}
                </div>

                {/* Attendance marking buttons (unless owner) */}
                {emp.role !== 'Owner' ? (
                  <div className="border-t border-slate-100 dark:border-darkBorder/45 pt-3 mt-4 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>Attendance Status:</span>
                    <div className="flex bg-slate-100 dark:bg-darkBorder p-0.5 rounded-lg">
                      {(['Present', 'Absent', 'On Leave'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateEmployeeAttendance(emp.id, st)}
                          className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${
                            emp.attendanceStatus === st 
                              ? st === 'Present' 
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : st === 'Absent'
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'bg-amber-500 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'
                          }`}
                        >
                          {st.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 dark:border-darkBorder/45 pt-3 mt-4 text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle size={12} /> Active Managing Profile
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Salary & role descriptions */}
        <div className="lg:col-span-4 glass-panel border border-slate-200/50 dark:border-darkBorder rounded-3xl p-5 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-3">
              🔒 Roster Access & Roles
            </span>
            <div className="space-y-3 text-xs leading-relaxed text-slate-500">
              <div className="p-3 bg-slate-100/50 dark:bg-darkBorder/20 rounded-2xl">
                <span className="font-bold text-slate-800 dark:text-white block">🤵 Owner Profile</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Palani Andavar • Ultimate root access</span>
              </div>
              <div className="p-3 bg-slate-100/50 dark:bg-darkBorder/20 rounded-2xl">
                <span className="font-bold text-slate-800 dark:text-white block">📈 Manager Role</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Arumugam K • Registers expenses, menu logs</span>
              </div>
              <div className="p-3 bg-slate-100/50 dark:bg-darkBorder/20 rounded-2xl">
                <span className="font-bold text-slate-800 dark:text-white block">💰 Cashier Role</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Muthu Swamy • Manages POS Terminal register</span>
              </div>
              <div className="p-3 bg-slate-100/50 dark:bg-darkBorder/20 rounded-2xl">
                <span className="font-bold text-slate-800 dark:text-white block">🍳 Kitchen Staff</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Selvam R • Follows KDS ticket timers</span>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-400 leading-normal border-t border-slate-100 dark:border-darkBorder/40 pt-3 mt-4">
            * Note: Employee attendance toggles adjust the active present parameters. Wage audits occur on the 1st of every month.
          </div>
        </div>

      </div>

    </div>
  );
};
