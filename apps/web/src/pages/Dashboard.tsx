import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import Anggota from './Anggota';
import Barang from './Barang';
import Nota from './Nota';
import Periode from './Periode';
import { DashboardHome } from './DashboardHome';
import { Laporan } from './Laporan';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/anggota', label: 'Anggota' },
  { to: '/barang', label: 'Barang' },
  { to: '/nota', label: 'Nota' },
  { to: '/periode', label: 'Periode' },
  { to: '/laporan', label: 'Laporan' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
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
          <Route path="barang" element={<Barang />} />
          <Route path="nota" element={<Nota />} />
          <Route path="periode" element={<Periode />} />
          <Route path="laporan" element={<Laporan />} />
        </Routes>
      </main>
    </div>
  );
}
