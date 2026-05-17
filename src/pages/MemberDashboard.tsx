import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Flame, 
  Calendar,
  ChevronRight,
  Layout,
  Plus,
  PlayCircle,
  Zap
} from 'lucide-react';
import { Card, Badge, Button, cn } from '../components/UI';
import { MOCK_PROJECTS, MOCK_TASKS, MOCK_USERS } from '../data';
import { ProgressRing } from '../components/DashboardComponents';
import { SyncCalendarModal } from '../components/Modals';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const MemberDashboard = ({ user }: { user: any }) => {
  const myTasks = MOCK_TASKS.filter(t => t.assigneeId === user.id);
  const myProjects = MOCK_PROJECTS.filter(p => p.memberIds.includes(user.id));
  const overdueCount = myTasks.filter(t => t.status !== 'DONE' && new Date(t.dueDate) < new Date()).length;
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleUpdateClick = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899']
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight italic">Welcome back, {user.name.split(' ')[0]}!</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Here is an overview of your current tasks and projects.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2 dark:border-white/10 dark:text-white dark:hover:bg-white/5 rounded-xl uppercase tracking-widest text-[10px] font-bold h-10 px-4" size="sm">
              <Layout size={16} />
              <span>Kanban Board</span>
           </Button>
           <Button className="gap-2 rounded-xl uppercase tracking-widest text-[10px] font-bold h-10 px-6" size="sm" onClick={handleUpdateClick}>
              <Plus size={16} />
              <span>Create Task</span>
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {[
          { label: 'My Active Tasks', value: myTasks.filter(t => t.status !== 'DONE').length, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Completed Tasks', value: 12, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Overdue Tasks', value: overdueCount, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 dark:bg-slate-900/40">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm dark:bg-slate-800/50", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{stat.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card className="p-8 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">Today's Focus Tasks</h3>
                 <Badge variant="info">{myTasks.filter(t => t.status !== 'DONE').length} REMAINING</Badge>
              </div>
              <div className="space-y-4">
                 {myTasks.filter(t => t.status !== 'DONE').map((task, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-brand-primary/20 transition-all cursor-pointer">
                      <div className="w-6 h-6 rounded-lg border-2 border-slate-200 dark:border-white/20 flex items-center justify-center group-hover:border-brand-primary transition-colors"></div>
                      <div className="flex-1 text-left">
                         <p className="text-sm font-bold text-slate-800 dark:text-white">{task.title}</p>
                         <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">{MOCK_PROJECTS.find(p => p.id === task.projectId)?.name}</p>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="flex flex-col items-end">
                            <Badge variant={task.priority === 'URGENT' ? 'urgent' : task.priority === 'HIGH' ? 'danger' : 'neutral'}>
                               {task.priority}
                            </Badge>
                            <span className="text-[10px] text-rose-500 font-bold mt-1">DUE IN 2H</span>
                         </div>
                         <ChevronRight size={18} className="text-slate-300 group-hover:text-brand-primary transition-colors" />
                      </div>
                   </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-brand-primary font-bold text-xs" size="sm">
                 OPEN ALL ASSIGNED TASKS <ChevronRight size={14} />
              </Button>
           </Card>

           <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 flex flex-col dark:bg-slate-900/40">
                 <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-6">Task Progress</h3>
                 <div className="flex-1 flex flex-col items-center justify-center py-4">
                    <div className="relative mb-6">
                       <ProgressRing progress={72} size={140} strokeWidth={12} color="#6366f1" />
                    </div>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 italic">"Consistency is the key to velocity."</p>
                 </div>
              </Card>

              <Card className="p-8 dark:bg-slate-900/40">
                 <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-6">Recent Collaborators</h3>
                 <div className="flex flex-wrap gap-4 justify-center py-2">
                    {MOCK_USERS.map((u, i) => (
                       <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl border-2 transition-all p-0.5",
                            u.id === user.id ? "border-brand-primary" : "border-transparent group-hover:border-slate-200"
                          )}>
                             <img src={u.avatar} alt="avatar" className="w-full h-full rounded-xl bg-slate-50 dark:bg-slate-800" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">{u.name.split(' ')[0]}</span>
                       </div>
                    ))}
                 </div>
              </Card>
           </div>

           <Card className="p-8 dark:bg-slate-900/40">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">Mini Kanban Board</h3>
                  <button className="text-brand-primary text-[10px] font-bold tracking-widest uppercase">Full Board</button>
               </div>
               <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {['TO DO', 'IN PROGRESS', 'REVIEW'].map((status) => (
                     <div key={status} className="flex-shrink-0 w-48">
                        <div className="flex items-center justify-between mb-4 px-1">
                           <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{status}</span>
                           <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[8px] font-bold text-slate-500">2</span>
                        </div>
                        <div className="space-y-3">
                           {[1, 2].map((i) => (
                              <div key={i} className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm text-left">
                                 <div className="w-6 h-1 rounded-full bg-brand-primary/30 mb-2"></div>
                                 <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1">Velora Feature Task {i}</p>
                                 <div className="mt-3 flex items-center justify-between">
                                    <div className="flex -space-x-1">
                                       <div className="w-4 h-4 rounded-full bg-slate-200 border border-white dark:border-slate-800"></div>
                                       <div className="w-4 h-4 rounded-full bg-slate-300 border border-white dark:border-slate-800"></div>
                                    </div>
                                    <Clock size={10} className="text-slate-300" />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </Card>
        </div>

        <div className="space-y-8">
           <Card className="p-8 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">Upcoming Deadlines</h3>
                 <button 
                  onClick={() => setIsCalendarOpen(true)}
                  className="flex items-center gap-2 text-brand-primary hover:text-brand-secondary transition-colors group"
                 >
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Sync Calendar</span>
                    <Calendar size={18} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
                 </button>
              </div>
              <div className="space-y-6 text-left">
                 {myTasks.slice(0, 4).map((task, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="flex flex-col items-center pt-1">
                          <div className="w-2 h-2 rounded-full bg-brand-primary mb-1"></div>
                          <div className="w-[2px] h-full bg-slate-100 dark:bg-white/5"></div>
                       </div>
                       <div className="flex-1 pb-6 border-b border-slate-50 dark:border-white/5 last:border-0 last:pb-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{task.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">{MOCK_PROJECTS.find(p => p.id === task.projectId)?.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <Clock size={12} className="text-brand-accent" />
                             <span className="text-[10px] font-bold text-brand-accent">{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="p-8 bg-gradient-to-br from-brand-primary to-brand-secondary text-white border-none shadow-xl shadow-brand-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
              <h3 className="text-xl font-display font-bold mb-4 relative z-10">Weekly Goals</h3>
              <p className="text-sm opacity-80 mb-6 font-medium relative z-10">Complete 5 tasks today to hit your weekly target.</p>
              <div className="space-y-3 relative z-10">
                 <div className="flex justify-between text-xs font-bold">
                    <span>PROGRESS</span>
                    <span>3 / 5</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      className="h-full bg-white shadow-glow"
                    />
                 </div>
              </div>
           </Card>

           <Card className="p-8 bg-emerald-50 dark:bg-emerald-500/5 dark:border-emerald-500/10 border-emerald-100">
              <div className="flex items-center gap-2 mb-4">
                 <CheckCircle2 size={18} className="text-emerald-500" />
                 <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">Recent Wins</h3>
              </div>
              <div className="space-y-3 text-left">
                 {[
                   'Completed velora interface audit',
                   'Resolved high priority sync bug',
                   'Optimized dashboard rendering'
                 ].map((win, i) => (
                   <motion.div 
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400"
                   >
                     <Zap size={10} className="fill-emerald-500" />
                     <span>{win.toUpperCase()}</span>
                   </motion.div>
                 ))}
              </div>
           </Card>
        </div>
      </div>

      <AnimatePresence>
        {isCalendarOpen && (
          <SyncCalendarModal 
            isOpen={isCalendarOpen} 
            onClose={() => setIsCalendarOpen(false)} 
            deadlines={myTasks.map(t => ({
              title: t.title,
              dueDate: t.dueDate,
              project: MOCK_PROJECTS.find(p => p.id === t.projectId)?.name || 'General',
              priority: t.priority,
              status: t.status
            }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
