/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { MemberDashboard } from './pages/MemberDashboard';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { SettingsPage } from './pages/SettingsPage';
import { TeamPage, DeadlinesPage } from './pages/OperationalPages';
import { InsightsPage } from './pages/InsightsPage';
import { 
  AboutPage, 
  PricingPage, 
  PrivacyPage, 
  ContactPage, 
  FeaturesPage,
  DocumentationPage,
  HelpCenterPage
} from './pages/StaticPages';
import { Sidebar, Topbar } from './components/Navigation';
import { 
  CreateTaskModal,
  CreateProjectModal,
  InviteMemberModal
} from './components/Modals';
import { Button, Toast } from './components/UI';
import { User, Role } from './types';
import { MOCK_USERS } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('velora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<'task' | 'project' | 'member' | null>(null);
  const [taskStatusPreset, setTaskStatusPreset] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('velora_theme', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('velora_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('velora_user');
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('calendar_success')) {
      showToast('Google Calendar connected successfully!', 'success');
      navigate(location.pathname, { replace: true });
    } else if (params.has('calendar_error')) {
      const error = params.get('calendar_error');
      showToast(`Calendar sync failed: ${error}`, 'error');
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleAuthSuccess = (role: Role, name?: string, email?: string) => {
    const mockUser = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    const newUser = {
      ...mockUser,
      name: name || mockUser.name,
      email: email || mockUser.email,
      role: role // Explicitly preserve role
    };
    setUser(newUser);
    const landingPage = role === 'ADMIN' ? 'command-center' : 'workspace';
    setCurrentPage(landingPage);
    navigate('/dashboard');
    showToast(`Welcome, ${newUser.name}.`, 'success');
  };

  const handleDemo = () => {
    handleAuthSuccess('ADMIN');
  };

  const handleLogout = () => {
    const isDemo = !localStorage.getItem('velora_auth_token'); // Simple check
    setUser(null);
    setCurrentPage('dashboard');
    navigate('/');
    showToast('Logged out successfully.', 'info');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateSettings = (updatedUser: User) => {
    setUser(prev => prev ? ({ ...prev, ...updatedUser, role: prev.role }) : updatedUser);
    showToast('System configuration calibrated.');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-primary/20 via-slate-950 to-slate-950"></div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/50 mb-8 animate-glow">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
             >
               <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full"></div>
             </motion.div>
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tighter mb-2 italic">Velora</h1>
          <p className="text-slate-400 font-mono text-[10px] tracking-[0.4em] uppercase tracking-widest">Loading Dashboard</p>
        </motion.div>
      </div>
    );
  }

  const handleNewTaskTrigger = (status?: any) => {
    setTaskStatusPreset(status || null);
    setModalType('task');
  };

  const renderDashboardContent = (page: string, user: User) => {
    const onBack = () => setCurrentPage(user.role === 'ADMIN' ? 'command-center' : 'workspace');
    
    switch (page) {
      case 'command-center':
        return (
          <AdminDashboard 
            onNewProject={() => setModalType('project')}
            onInviteMember={() => setModalType('member')}
          />
        );
      case 'workspace':
        return <MemberDashboard user={user} />;
      case 'projects':
      case 'my-projects':
        return <ProjectsPage role={user.role} onBack={onBack} onNewProjectTrigger={() => setModalType('project')} />;
      case 'tasks':
      case 'my-tasks':
        return <TasksPage role={user.role} onNewTaskTrigger={handleNewTaskTrigger} />;
      case 'settings':
        return (
          <SettingsPage 
            user={user} 
            onBack={onBack} 
            onUpdateUser={handleUpdateSettings}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        );
      case 'roster':
        return <TeamPage role={user.role} onBack={onBack} onInviteTrigger={() => setModalType('member')} />;
      case 'deadlines':
        return <DeadlinesPage onBack={onBack} />;
      case 'reports':
        return <InsightsPage onExport={() => showToast('Protocol export initialized.', 'info')} />;
      default:
        return (
          <div className="p-20 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <div className="w-64 h-64 bg-slate-100 dark:bg-white/5 rounded-[3rem] flex items-center justify-center mb-10 border border-slate-200 dark:border-white/5">
               <div className="w-32 h-32 border-4 border-dashed border-slate-200 dark:border-white/10 rounded-3xl animate-spin-slow"></div>
            </div>
            <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">{page.replace('-', ' ')} Active</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">This ecosystem node is operational but may contain limited telemetry data in the current cycle.</p>
            <Button variant="outline" onClick={onBack} className="rounded-2xl h-14 px-8 uppercase font-bold tracking-widest text-xs">Return to Node Alpha</Button>
          </div>
        );
    }
  };


  return (
    <div className="min-h-screen bg-[#fdfdff] dark:bg-slate-950 transition-colors duration-500">
      <Routes>
        <Route path="/" element={<LandingPage onLogin={() => navigate('/login')} onSignup={() => navigate('/signup')} onDemo={handleDemo} />} />
        <Route path="/login" element={<AuthPage type="LOGIN" onAuthSuccess={handleAuthSuccess} onToggleType={() => navigate('/signup')} />} />
        <Route path="/signup" element={<AuthPage type="SIGNUP" onAuthSuccess={handleAuthSuccess} onToggleType={() => navigate('/login')} />} />
        
        {/* Static Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/demo" element={<Navigate to="/dashboard" />} />

        {/* Dashboard Shell */}
        <Route path="/dashboard" element={
          user ? (
            <div className="flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-500">
              <Sidebar 
                role={user.role} 
                user={user} 
                currentPage={currentPage} 
                onPageChange={setCurrentPage} 
                onLogout={handleLogout}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              />
              <div className="flex-1 ml-64 flex flex-col min-h-screen overflow-x-hidden">
                <Topbar 
                  title={getPageTitle(currentPage)} 
                  currentPage={currentPage}
                  onBack={() => {
                    const fallback = user.role === 'ADMIN' ? 'command-center' : 'workspace';
                    setCurrentPage(fallback);
                  }}
                  onPageChange={setCurrentPage}
                />
                <main className="flex-1 pb-20 overflow-y-auto">
                   <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "anticipate" }}
                      >
                         {renderDashboardContent(currentPage, user)}
                      </motion.div>
                   </AnimatePresence>
                </main>
              </div>
            </div>
          ) : <Navigate to="/login" />
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Global Overlays - Rendered at the end for proper stacking */}
      <AnimatePresence>
        {toast && (
          <Toast 
            key="toast"
            message={toast.message} 
            type={toast.type as any} 
            onClose={() => setToast(null)} 
          />
        )}
        {modalType === 'task' && (
          <CreateTaskModal 
            key="modal-task"
            isOpen={modalType === 'task'} 
            onClose={() => { setModalType(null); setTaskStatusPreset(null); }} 
            initialStatus={taskStatusPreset}
            onCreate={async (task) => {
              const { error } = await supabase.from('tasks').insert({
                title: task.title,
                status: task.status,
                priority: task.priority,
              });
              if (error) {
                showToast(`Error creating task: ${error.message}`, 'error');
              } else {
                showToast(`Task "${task.title}" created.`, 'success');
              }
            }} 
          />
        )}
        {modalType === 'project' && (
          <CreateProjectModal 
            key="modal-project"
            isOpen={modalType === 'project'} 
            onClose={() => setModalType(null)} 
            onCreate={async (proj) => {
              const { error } = await supabase.from('projects').insert({
                name: proj.name,
                description: 'New Project',
              });
              if (error) {
                showToast(`Error creating project: ${error.message}`, 'error');
              } else {
                showToast(`Project "${proj.name}" created.`, 'success');
              }
            }} 
          />
        )}
        {modalType === 'member' && (
          <InviteMemberModal 
            key="modal-member"
            isOpen={modalType === 'member'} 
            onClose={() => setModalType(null)} 
            onInvite={(member) => showToast(`Invitation sent to ${member.name}.`, 'success')} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function getPageTitle(page: string): string {
  const titles: { [key: string]: string } = {
    'command-center': 'Dashboard',
    'workspace': 'Dashboard',
    'projects': 'Projects',
    'my-projects': 'My Projects',
    'tasks': 'Tasks',
    'my-tasks': 'My Tasks',
    'roster': 'Team',
    'reports': 'Reports',
    'deadlines': 'Deadlines',
    'settings': 'Settings'
  };
  return titles[page] || 'Velora';
}
