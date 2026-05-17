import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mail, 
  MessageCircle, 
  Zap,
  ArrowLeft,
  UserPlus,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, cn, Toast } from '../components/UI';
import { MOCK_USERS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmDeleteModal } from '../components/Modals';

export const TeamPage = ({ role, onBack, onInviteTrigger }: { role: string, onBack: () => void, onInviteTrigger?: () => void }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('velora_team');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('velora_team', JSON.stringify(users));
  }, [users]);

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteUserId) {
      setUsers(users.filter((u: any) => u.id !== deleteUserId));
      setDeleteUserId(null);
      setToast('Member removed successfully.');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto pb-20">
      <AnimatePresence>
        {toast && (
          <Toast message={toast} type="success" onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      <ConfirmDeleteModal 
        isOpen={!!deleteUserId} 
        onClose={() => setDeleteUserId(null)} 
        onConfirm={handleDelete}
        title="Remove Team Member?"
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
             <ArrowLeft size={18} />
           </button>
           <div>
             <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight italic uppercase">Team Resonance</h2>
             <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Inventory of collaborative nodes within your ecosystem.</p>
           </div>
        </div>
        {role === 'ADMIN' && (
          <Button className="gap-2 rounded-xl h-12 px-6 uppercase tracking-widest text-[10px] font-bold" onClick={onInviteTrigger}>
             <UserPlus size={18} />
             <span>Invite Member</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
         <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collaborative nodes..." 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-primary transition-all text-sm font-medium dark:text-white"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredUsers.map((user: any, i: number) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-8 flex flex-col items-center text-center group hover:border-brand-primary transition-all duration-500 dark:bg-slate-900/40 relative overflow-hidden h-full">
               {role === 'ADMIN' && (
                 <button 
                   onClick={() => setDeleteUserId(user.id)}
                   className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                 >
                    <Trash2 size={16} />
                 </button>
               )}

               <div className="relative mb-6">
                  <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                  <img src={user.avatar} className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-slate-800 shadow-xl relative z-10 bg-slate-100 object-cover" alt={user.name} />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-white/10 flex items-center justify-center relative z-20">
                     <Zap size={20} className={cn(user.role === 'ADMIN' ? "text-brand-primary" : "text-brand-secondary")} />
                  </div>
               </div>

               <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-tight italic">{user.name}</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 italic">{user.role}</p>

               <div className="grid grid-cols-2 w-full gap-4 mb-8">
                  <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Missions</p>
                     <p className="text-lg font-display font-bold dark:text-white tracking-tight">{user.tasksCompleted}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Streak</p>
                     <p className="text-lg font-display font-bold dark:text-white tracking-tight">{user.streak}d</p>
                  </div>
               </div>

               <div className="flex gap-2 w-full mt-auto">
                  <Button variant="outline" className="flex-1 gap-2 rounded-xl text-[10px] uppercase font-bold tracking-widest h-10" size="sm">
                     <Mail size={14} />
                     <span>Signal</span>
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 rounded-xl text-[10px] uppercase font-bold tracking-widest h-10" size="sm">
                     <MessageCircle size={14} />
                     <span>Comms</span>
                  </Button>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const DeadlinesPage = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto pb-20">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
             <ArrowLeft size={18} />
           </button>
           <div>
             <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Deadlines</h2>
             <p className="text-slate-500 dark:text-slate-400">Upcoming task deadlines and priority management.</p>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            {[
              { label: 'Past Resonance (Overdue)', color: 'text-rose-500', bg: 'bg-rose-50' },
              { label: 'Immediate Sync (Today)', color: 'text-brand-primary', bg: 'bg-indigo-50' },
              { label: 'Future Calibration (Next 7 Days)', color: 'text-brand-secondary', bg: 'bg-purple-50' }
            ].map((section, idx) => (
              <div key={idx} className="space-y-4">
                 <h3 className={cn("text-xs font-bold uppercase tracking-[0.2em] px-2", section.color)}>{section.label}</h3>
                 <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Card key={i} className="p-6 flex items-center gap-6 hover:translate-x-2 transition-transform cursor-pointer dark:bg-slate-900/40">
                         <div className={cn("w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 border", section.bg.replace('bg-', 'border-').replace('50', '200'))}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">MAY</span>
                            <span className={cn("font-display font-bold text-xl leading-none", section.color)}>{10 + i + idx * 5}</span>
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white truncate">Marketing Review {i}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">INTERNAL PROJECT</p>
                         </div>
                         <div className="flex items-center gap-4">
                            <Badge variant={idx === 0 ? 'urgent' : 'danger'}>{idx === 0 ? 'CRITICAL' : 'HIGH'}</Badge>
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-white dark:border-slate-800"></div>
                         </div>
                      </Card>
                    ))}
                 </div>
              </div>
            ))}
         </div>

         <div className="space-y-8">
            <Card className="p-8 dark:bg-slate-900/40">
               <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Deadline Health</h3>
               <div className="space-y-6">
                  {[
                    { label: 'On-Time Completion', val: 82, color: 'bg-emerald-500' },
                    { label: 'Minor Delays', val: 12, color: 'bg-amber-500' },
                    { label: 'Major Delays', val: 6, color: 'bg-rose-500' }
                  ].map((stat) => (
                    <div key={stat.label} className="space-y-2">
                       <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-500 uppercase tracking-widest">{stat.label}</span>
                          <span className="dark:text-white">{stat.val}%</span>
                       </div>
                       <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", stat.color)} style={{ width: `${stat.val}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

            <Card className="p-8 bg-slate-900 text-white border-none relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 blur-3xl"></div>
               <h3 className="text-xl font-display font-bold mb-4 italic">Next Major Deadline</h3>
               <p className="text-sm text-slate-400 mb-8 font-medium">New Product Launch</p>
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Time Remaining</p>
                    <p className="text-4xl font-display font-bold italic tracking-tighter">14 : 02 : 45</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">SYNC CALENDAR</Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
};
