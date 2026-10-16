import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PieChart,
  Database,
  BarChart3,
  Cpu,
  TrendingDown,
  DollarSign,
  MessageSquare,
  Lightbulb,
  Megaphone,
  Settings2,
  FileText,
  Bell,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Calendar,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useTheme } from '@/contexts/ThemeContext';

// ─────────────────────────────────────────────
// Nav items definition
// ─────────────────────────────────────────────
interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/segments', icon: PieChart, label: 'Customer Segments' },
  { to: '/data', icon: Database, label: 'Data Management' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/prediction', icon: Cpu, label: 'Prediction Studio' },
  { to: '/churn', icon: TrendingDown, label: 'Churn Analysis' },
  { to: '/lifetime-value', icon: DollarSign, label: 'Lifetime Value' },
  { to: '/sentiment', icon: MessageSquare, label: 'Sentiment Analysis' },
  { to: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/models', icon: Settings2, label: 'Model Management' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
];

// Derive page title from current pathname
function getPageTitle(pathname: string): string {
  const found = navItems.find(
    (item) => pathname === item.to || pathname.startsWith(item.to + '/')
  );
  return found?.label ?? 'Dashboard';
}

// ─────────────────────────────────────────────
// Search Modal
// ─────────────────────────────────────────────
interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const suggestions = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: 'var(--text-primary)' }}
            placeholder="Search pages, customers, reports…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="text-xs px-2 py-1 rounded"
            style={{
              background: 'var(--bg)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
            onClick={onClose}
          >
            ESC
          </button>
        </div>

        {/* Suggestions */}
        <ul className="py-2 max-h-72 overflow-y-auto">
          {suggestions.length === 0 ? (
            <li
              className="px-5 py-4 text-sm text-center"
              style={{ color: 'var(--text-muted)' }}
            >
              No results found
            </li>
          ) : (
            suggestions.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <button
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors text-left"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--bg)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                    onClick={() => {
                      navigate(item.to);
                      onClose();
                    }}
                  >
                    <Icon size={16} style={{ color: 'var(--accent)' }} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div
          className="px-5 py-3 text-xs flex gap-4"
          style={{
            borderTop: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>ESC close</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// User Avatar Dropdown
// ─────────────────────────────────────────────
interface UserDropdownProps {
  user: { name?: string; email?: string; avatar?: string } | null;
  onLogout: () => void;
  onNavigate: (to: string) => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'U';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all"
        style={{ border: '1px solid transparent' }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.border = '1px solid var(--border)')
        }
        onMouseLeave={(e) =>
          !open && (e.currentTarget.style.border = '1px solid transparent')
        }
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {initials}
        </div>
        <ChevronDown
          size={14}
          style={{ color: 'var(--text-muted)' }}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-56 rounded-xl shadow-2xl overflow-hidden z-50"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          {/* User info */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {user?.name ?? 'User'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {user?.email ?? ''}
            </p>
          </div>

          {/* Menu items */}
          {[
            { icon: User, label: 'Profile', to: '/settings/profile' },
            { icon: Settings, label: 'Settings', to: '/settings' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--bg)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
                onClick={() => {
                  onNavigate(item.to);
                  setOpen(false);
                }}
              >
                <Icon size={15} style={{ color: 'var(--text-muted)' }} />
                {item.label}
              </button>
            );
          })}

          <div style={{ borderTop: '1px solid var(--border)' }}>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
              style={{ color: '#ef4444' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(239,68,68,0.07)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Sidebar Component
// ─────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  user: { name?: string; email?: string } | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  user,
  onLogout,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarWidth = collapsed ? 64 : 260;

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'U';

  const sidebarContent = (
    <aside
      className="flex flex-col h-full relative transition-all duration-300 ease-in-out"
      style={{
        width: sidebarWidth,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          <Sparkles size={16} color="#fff" />
        </div>
        {!collapsed && (
          <span
            className="text-base font-bold tracking-tight whitespace-nowrap overflow-hidden"
            style={{ color: 'var(--text-primary)' }}
          >
            CustomerIQ
          </span>
        )}
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full items-center justify-center shadow-md transition-colors"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + '/');

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`nav-link${isActive ? ' active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px' : '10px 12px',
                borderRadius: 8,
                marginBottom: 2,
                textDecoration: 'none',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
              onClick={() => {
                if (mobileOpen) onMobileClose();
              }}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile at bottom */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
              style={{ background: 'var(--accent)', color: '#fff' }}
              title={user?.name ?? 'User'}
              onClick={() => navigate('/settings/profile')}
            >
              {initials}
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#ef4444' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 cursor-pointer"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onClick={() => navigate('/settings/profile')}
            >
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {user?.name ?? 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {user?.email ?? ''}
              </p>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#ef4444' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0" style={{ width: sidebarWidth, transition: 'width 0.3s ease' }}>
        <div className="fixed top-0 left-0 h-full z-30" style={{ width: sidebarWidth, transition: 'width 0.3s ease' }}>
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="relative z-50 flex-shrink-0" style={{ width: 260 }}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

// ─────────────────────────────────────────────
// Top Navbar Component
// ─────────────────────────────────────────────
interface TopNavbarProps {
  onMobileMenuToggle: () => void;
  pageTitle: string;
  onSearchOpen: () => void;
  unreadCount: number;
  onNavigate: (to: string) => void;
  onLogout: () => void;
  user: { name?: string; email?: string } | null;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  onMobileMenuToggle,
  pageTitle,
  onSearchOpen,
  unreadCount,
  onNavigate,
  onLogout,
  user,
}) => {
  const { theme, toggleTheme } = useTheme();

  // Compute date range label
  const now = new Date();
  const past = new Date(now);
  past.setDate(past.getDate() - 30);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dateLabel = `${fmt(past)} – ${fmt(now)}`;

  return (
    <header
      className="h-16 flex items-center px-4 gap-3 flex-shrink-0 sticky top-0 z-20"
      style={{
        background: 'var(--bg-topbar)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onClick={onMobileMenuToggle}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Menu size={20} />
      </button>

      {/* Page Title / Breadcrumb */}
      <div className="flex-1">
        <h1
          className="text-base font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {pageTitle}
        </h1>
        <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
          AI Customer Intelligence System
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Date Range */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          <Calendar size={13} />
          <span>{dateLabel}</span>
        </div>

        {/* Search */}
        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onClick={onSearchOpen}
          title="Search"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Search size={18} />
        </button>

        {/* Theme Toggle */}
        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onClick={() => onNavigate('/notifications')}
          title="Notifications"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: '#ef4444', color: '#fff' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div
          className="w-px h-6 mx-1"
          style={{ background: 'var(--border)' }}
        />

        {/* User Avatar Dropdown */}
        <UserDropdown
          user={user}
          onLogout={onLogout}
          onNavigate={onNavigate}
        />
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────
// Main DashboardLayout
// ─────────────────────────────────────────────
const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Keyboard shortcut: Ctrl+K opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarWidth = sidebarCollapsed ? 64 : 260;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main content area — shifts right on desktop to accommodate sidebar */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: 0,
        }}
      >
        {/* Top Navbar */}
        <TopNavbar
          onMobileMenuToggle={() => setMobileOpen((p) => !p)}
          pageTitle={pageTitle}
          onSearchOpen={() => setSearchOpen(true)}
          unreadCount={unreadCount ?? 0}
          onNavigate={(to) => navigate(to)}
          onLogout={handleLogout}
          user={user}
        />

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--bg)' }}
        >
          <Outlet />
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
