import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { NotificationProvider } from '../context/NotificationContext.jsx';
import {
  LayoutDashboard, Sprout, ClipboardCheck, Landmark,
  History, LogOut, Menu, X
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sell', icon: Sprout, label: 'Sell Crop' },
  { to: '/my-booking', icon: ClipboardCheck, label: 'My Booking' },
  { to: '/bank-details', icon: Landmark, label: 'Bank Details' },
  { to: '/history', icon: History, label: 'History' },
];

export default function FarmerLayout() {
  const { farmer, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <NotificationProvider>
      <div className="app-container">
        {/* Mobile menu button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">Smart Farmer</div>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.72rem', marginTop: 2 }}>
              {farmer?.farmer_name || 'Farmer'}
            </p>
          </div>

          <nav>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button onClick={handleLogout}>
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </NotificationProvider>
  );
}
