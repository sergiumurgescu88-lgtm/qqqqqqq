import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, BookOpen, LayoutDashboard, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from './store/useAuthStore';
import { RoleGuard } from './components/RoleGuard';
import { ModuleGuard } from './components/ModuleGuard';
import ConnectionStatus from './components/ConnectionStatus';

// Lazy loading pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Training = lazy(() => import('./pages/Training'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const Module0 = lazy(() => import('./components/assessment/Module0'));
const Quiz = lazy(() => import('./components/assessment/Quiz'));
const Scenarios = lazy(() => import('./components/assessment/Scenarios'));

const Loading = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export default function App() {
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <ConnectionStatus />
        
        {user && (
          <nav className="bg-secondary text-white sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-20 items-center">
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="bg-primary p-2 rounded group-hover:bg-primary-dark transition-colors">
                    <Shield size={28} />
                  </div>
                  <span className="font-bold text-xl tracking-tight uppercase">WALDEVAR <span className="text-primary">ACADEMY</span></span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-8 text-sm font-bold items-center uppercase tracking-widest">
                  <Link to="/" className="hover:text-primary transition-colors flex items-center gap-2">
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <Link to="/training" className="hover:text-primary transition-colors flex items-center gap-2">
                    <BookOpen size={18} /> Training
                  </Link>
                  {(user.role === 'manager' || user.role === 'hr') && (
                    <Link to="/manager" className="hover:text-primary transition-colors flex items-center gap-2">
                      <LayoutDashboard size={18} /> Manager
                    </Link>
                  )}
                  <div className="h-6 w-[1px] bg-white/20 mx-2" />
                  <Link to="/profile" className="hover:text-primary transition-colors flex items-center gap-2">
                    <User size={18} /> {user.name.split(' ')[0]}
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={18} />
                  </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                  onClick={toggleMenu}
                  className="md:hidden p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                  aria-label="Toggle Menu"
                >
                  {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>
            </div>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden bg-secondary border-t border-white/10 overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <Link to="/" onClick={toggleMenu} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl font-bold text-lg">
                      <LayoutDashboard size={24} className="text-primary" /> Dashboard
                    </Link>
                    <Link to="/training" onClick={toggleMenu} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl font-bold text-lg">
                      <BookOpen size={24} className="text-primary" /> Training
                    </Link>
                    {(user.role === 'manager' || user.role === 'hr') && (
                      <Link to="/manager" onClick={toggleMenu} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl font-bold text-lg">
                        <LayoutDashboard size={24} className="text-primary" /> Manager Dashboard
                      </Link>
                    )}
                    <Link to="/profile" onClick={toggleMenu} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl font-bold text-lg">
                      <User size={24} className="text-primary" /> Profilul Meu
                    </Link>
                    <button 
                      onClick={() => { logout(); toggleMenu(); }}
                      className="w-full flex items-center gap-4 p-4 bg-red-500/10 text-red-400 rounded-2xl font-bold text-lg"
                    >
                      <LogOut size={24} /> Deconectare
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        )}

        <main className="flex-grow">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
              
              <Route path="/" element={
                <RoleGuard>
                  <Dashboard />
                </RoleGuard>
              } />
              
              <Route path="/training" element={
                <RoleGuard>
                  <Training />
                </RoleGuard>
              } />

              <Route path="/training/mod-0" element={
                <RoleGuard>
                  <ModuleGuard>
                    <Module0 />
                  </ModuleGuard>
                </RoleGuard>
              } />

              <Route path="/training/:moduleId" element={
                <RoleGuard>
                  <ModuleGuard>
                    <Quiz />
                  </ModuleGuard>
                </RoleGuard>
              } />

              <Route path="/training/:moduleId/scenarios" element={
                <RoleGuard>
                  <ModuleGuard>
                    <Scenarios />
                  </ModuleGuard>
                </RoleGuard>
              } />

              <Route path="/manager" element={
                <RoleGuard>
                  <ManagerDashboard />
                </RoleGuard>
              } />

              <Route path="/profile" element={
                <RoleGuard>
                  <Profile />
                </RoleGuard>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="bg-gray-100 border-t border-gray-200 p-8 text-center">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            © 2026 Waldevar Energy | Securitate Integrată | Versiune 1.0.4
          </p>
        </footer>
      </div>
    </Router>
  );
}
