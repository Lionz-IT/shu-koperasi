import { useState } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import Anggota from './Anggota';
import Nota from './Nota';
import Periode from './Periode';
import { DashboardHome } from './DashboardHome';
import { Laporan } from './Laporan';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/anggota', label: 'Anggota' },
  { to: '/nota', label: 'Nota' },
  { to: '/periode', label: 'Periode' },
  { to: '/laporan', label: 'Laporan' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  }

  return (
    <div className="dashboard-layout">
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <div className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>SHU Koperasi</h2>
          <span>Sistem Pembagian SHU</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout}>Keluar</button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route
            index
            element={<DashboardHome />}
          />
          <Route path="anggota" element={<Anggota />} />
          <Route path="nota" element={<Nota />} />
          <Route path="periode" element={<Periode />} />
          <Route path="laporan" element={<Laporan />} />
        </Routes>
      </main>
    </div>
  );
}
