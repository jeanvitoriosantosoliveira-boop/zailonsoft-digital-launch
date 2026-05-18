import React from 'react';
import { Outlet, Navigate, Link, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  PlusCircle, 
  Settings, 
  HelpCircle, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const MainLayout = () => {
  const { isLoggedIn, isActive, user, logout, lojaSlug, lojaInfo, loading, subscription } = useAuth();
  const location = useLocation();
  const { lojaSlug: urlSlug } = useParams();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  // Show loading while auth is resolving
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isActive) {
    const status = subscription?.status;
    if (status === 'past_due' || status === 'unpaid') {
      return <Navigate to="/inadimplente" replace />;
    }
    return <Navigate to="/assinar" replace />;
  }

  // If user is trying to access another store's slug, block
  if (urlSlug && lojaSlug && urlSlug !== lojaSlug) {
    return <Navigate to={`/${lojaSlug}/dashboard`} replace />;
  }

  const basePath = `/${lojaSlug || urlSlug}`;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `${basePath}/dashboard` },
    { icon: Package, label: 'Catálogo', path: `${basePath}/catalogo` },
    { icon: Users, label: 'Leads / CRM', path: `${basePath}/crm` },
    { icon: PlusCircle, label: 'Adicionar Veículo', path: `${basePath}/adicionar` },
    { icon: Settings, label: 'Configurações', path: `${basePath}/configuracoes` }
  ];

  const handleLogout = () => {
    logout();
  };

  const storeName = lojaInfo?.nome || 'AutoConnect';

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 sidebar-premium fixed inset-y-0 left-0 z-30">
        <div className="p-6 border-b border-white/5">
          <Link to={`${basePath}/dashboard`} className="flex items-center gap-3">
            {lojaInfo?.logo_url ? (
              <img src={lojaInfo.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <img src="/favicon.ico" alt="Logo" className="w-10 h-10 rounded-xl" />
            )}
            <div>
              <h1 className="text-lg font-bold text-white truncate max-w-[140px]">{storeName}</h1>
              <p className="text-xs text-muted-foreground">Painel Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isItemActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isItemActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isItemActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                <span className="font-medium">{item.label}</span>
                {isItemActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center">
              <span className="text-cyan-400 font-semibold">{user?.email?.charAt(0).toUpperCase() || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.email || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground truncate">{storeName}</p>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={`${basePath}/dashboard`} className="flex items-center gap-2">
            {lojaInfo?.logo_url ? (
              <img src={lojaInfo.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <img src="/favicon.ico" alt="Logo" className="w-8 h-8 rounded-lg" />
            )}
            <span className="font-bold text-white">{storeName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 sidebar-premium z-50"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  {lojaInfo?.logo_url ? (
                    <img src={lojaInfo.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <img src="/favicon.ico" alt="Logo" className="w-10 h-10 rounded-xl" />
                  )}
                  <span className="font-bold text-white">{storeName}</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const isItemActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isItemActive
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirm Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="w-full max-w-sm glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-2">Sair da conta?</h3>
                <p className="text-muted-foreground mb-6">Você será redirecionado para a página de login.</p>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleLogout} className="flex-1">
                    Sair
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
