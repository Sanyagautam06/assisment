import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Briefcase, 
  CheckSquare, 
  Users, 
  ChevronRight,
  TrendingUp,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  CalendarCheck
} from 'lucide-react';
import { Card, Button, Badge, cn } from './UI';
import { useGoogleCalendar } from './GoogleCalendarSync';
import { downloadICS } from '../utils/icsGenerator';

export const InviteMemberModal = ({ isOpen, onClose, onInvite }: { isOpen: boolean, onClose: () => void, onInvite: (data: any) => void, key?: React.Key }) => {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'MEMBER', project: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!formData.name) return "Name is required.";
    if (!formData.email || !formData.email.includes('@')) return "Valid email is required.";
    return null;
  };

  const handleInvite = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to send invitation');
        setIsLoading(false);
        return;
      }

      // If email was sent successfully, add to local state
      onInvite(formData);
      onClose();
    } catch (err) {
      setError('Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <h3 className="text-xl font-display font-bold mb-6 dark:text-white uppercase tracking-tight italic">Invite Member</h3>
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Error: {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
            <input 
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary transition-all dark:text-white font-bold"
              value={formData.name} onChange={e => { setFormData({...formData, name: e.target.value}); setError(null); }}
              placeholder="e.g. Alex Thorne"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
            <input 
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary transition-all dark:text-white font-bold"
              value={formData.email} onChange={e => { setFormData({...formData, email: e.target.value}); setError(null); }}
              placeholder="alex@valora.io"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</label>
              <select 
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary transition-all dark:text-white appearance-none font-bold text-xs"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Project</label>
              <select 
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary transition-all dark:text-white appearance-none font-bold text-xs"
                value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})}
              >
                <option value="">None</option>
                <option value="stellar-alpha">Stellar Alpha</option>
                <option value="nebula-genesis">Nebula Genesis</option>
              </select>
            </div>
          </div>
          <Button 
            className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest mt-4" 
            onClick={handleInvite}
            isLoading={isLoading}
          >
            {isLoading ? 'Sending invite...' : 'Send Invitation'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export const CreateTaskModal = ({ isOpen, onClose, initialStatus = 'TODO', onCreate }: { isOpen: boolean, onClose: () => void, initialStatus?: any, onCreate: (data: any) => void, key?: React.Key }) => {
  const [formData, setFormData] = useState({
    title: '',
    status: initialStatus || 'TODO',
    priority: 'MEDIUM',
    projectId: '1'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, status: initialStatus || 'TODO' }));
    }
  }, [isOpen, initialStatus]);

  const handleCreate = () => {
    if (!formData.title) {
      setError("Objective Title is required.");
      return;
    }
    onCreate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <h3 className="text-xl font-display font-bold mb-6 dark:text-white uppercase tracking-tight italic">Create Task</h3>
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
             SYNC FAILED: {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Task Title</label>
            <input 
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary transition-all dark:text-white font-bold"
              value={formData.title} onChange={e => { setFormData({...formData, title: e.target.value}); setError(null); }}
              placeholder="e.g. Protocol refinement"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</label>
              <select 
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary transition-all dark:text-white appearance-none font-bold text-xs"
                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="TODO">TO DO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="REVIEW">REVIEW</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority</label>
              <select 
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary transition-all dark:text-white appearance-none font-bold text-xs"
                value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Project</label>
            <select 
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary transition-all dark:text-white appearance-none font-bold text-xs"
              value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}
            >
              <option value="1">Velora Core Interface</option>
              <option value="2">Quantum Sync Layer</option>
            </select>
          </div>

          <Button className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest mt-4" onClick={handleCreate}>Create Task</Button>
        </div>
      </motion.div>
    </div>
  );
};

export const CreateProjectModal = ({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate: (data: any) => void, key?: React.Key }) => {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-white/10"
      >
        <h3 className="text-xl font-display font-bold mb-6 dark:text-white uppercase tracking-tight">Create Project</h3>
        <div className="space-y-4">
          <input 
            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-brand-primary transition-all dark:text-white"
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Mission Name..."
          />
          <Button className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest" onClick={() => { onCreate({ name }); onClose(); }}>Create Project</Button>
        </div>
      </motion.div>
    </div>
  );
};

export const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title = "Delete?" }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title?: string, key?: React.Key }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-rose-500/20 text-center"
      >
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
           <X size={32} />
        </div>
        <h3 className="text-xl font-display font-bold mb-2 dark:text-white uppercase tracking-tight">{title}</h3>
        <p className="text-slate-500 text-sm font-medium mb-8">This action is permanent and cannot be undone.</p>
        
        <div className="grid grid-cols-2 gap-4">
           <Button variant="outline" className="h-12 rounded-xl text-xs uppercase font-bold tracking-widest" onClick={onClose}>Cancel</Button>
           <Button className="h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white border-0 text-xs uppercase font-bold tracking-widest" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
        </div>
      </motion.div>
    </div>
  );
};

export const SyncCalendarModal = ({ isOpen, onClose, deadlines }: { isOpen: boolean, onClose: () => void, deadlines: any[] }) => {
  const { isConnected, isLoading, connect, disconnect, syncAll } = useGoogleCalendar();
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSyncAll = async () => {
    setSyncStatus('SYNCING');
    try {
      await syncAll(deadlines);
      setSyncStatus('SUCCESS');
    } catch (error: any) {
      setSyncStatus('ERROR');
      setErrorMessage(error.message || 'Sync failed');
    }
  };

  const handleICSFallback = () => {
    deadlines.forEach(d => {
      downloadICS(`Velora: ${d.title}`, `${d.project} - ${d.priority}`, d.dueDate);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-3xl p-10 border border-slate-200 dark:border-white/10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl -z-10"></div>
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-brand-primary shadow-inner">
             <CalendarCheck size={40} />
          </div>
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2 italic">Calendar Resonance</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Synchronize your strategic deadlines with Google ecosystem.</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
               <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300")}></div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {isConnected === null ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}
                  </span>
               </div>
            </div>
            {!isConnected && isConnected !== null && (
              <Button size="sm" className="rounded-xl h-10 px-4 text-[10px] font-bold uppercase tracking-widest" onClick={connect} isLoading={isLoading}>
                Connect
              </Button>
            )}
            {isConnected && (
              <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 text-[10px] font-bold uppercase tracking-widest border-rose-500/20 text-rose-500 hover:bg-rose-500/5" onClick={disconnect} isLoading={isLoading}>
                Disconnect
              </Button>
            )}
          </div>

          <div className="space-y-3">
             <Button 
              className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest gap-2" 
              disabled={!isConnected || syncStatus === 'SYNCING'}
              onClick={handleSyncAll}
              isLoading={syncStatus === 'SYNCING'}
             >
                <RefreshCw size={18} className={cn(syncStatus === 'SYNCING' && "animate-spin")} />
                {syncStatus === 'SUCCESS' ? 'Sync Completed' : 'Sync All Deadlines'}
             </Button>
             
             {syncStatus === 'ERROR' && (
               <div className="flex flex-col gap-3">
                 <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-tight text-center">
                   SYNC FAILED: {errorMessage}
                 </div>
                 <Button variant="outline" className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] gap-2" onClick={handleICSFallback}>
                    <Download size={14} />
                    Download .ics Fallback
                 </Button>
               </div>
             )}
          </div>
        </div>

        <button onClick={onClose} className="mt-8 w-full text-slate-400 hover:text-slate-600 dark:hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
};

