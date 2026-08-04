import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export function DashboardHome() {
  const [stats, setStats] = useState({
    anggotaAktif: 0,
    totalNota: 0,
    periodeAktif: 0
  });

  const [notaData, setNotaData] = useState<Record<string, unknown>[]>([]);
  const [periodeData, setPeriodeData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [anggotaRes, notaRes, periodeRes] = await Promise.all([
          api.get('/anggota?aktif=true'),
          api.get('/nota'),
          api.get('/periode')
        ]);
        
        setStats({
          anggotaAktif: anggotaRes.data.length,
          totalNota: notaRes.data.length,
          periodeAktif: periodeRes.data.filter((p: Record<string, unknown>) => p.status === 'AKTIF').length
        });

        setNotaData(notaRes.data);
        setPeriodeData(periodeRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const belanjaPerAnggota = notaData.reduce((acc: Record<string, number>, nota: Record<string, unknown>) => {
    const anggota = nota.anggota as Record<string, unknown> | undefined;
    const nama = (anggota?.nama as string) || 'Unknown';
    acc[nama] = (acc[nama] || 0) + (Number(nota.total) || 0);
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(belanjaPerAnggota),
    datasets: [
      {
        label: 'Total Belanja',
        data: Object.values(belanjaPerAnggota),
        backgroundColor: '#2563eb',
      },
    ],
  };

  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Total Belanja per Anggota' },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { x: number | null } }) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.x !== null) {
              label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.parsed.x);
            }
            return label;
          }
        }
      }
    },
  };

  const aktifCount = periodeData.filter((p) => p.status === 'AKTIF').length;
  const ditutupCount = periodeData.filter((p) => p.status === 'DITUTUP').length;

  const doughnutData = {
    labels: ['AKTIF', 'DITUTUP'],
    datasets: [
      {
        label: 'Status Periode',
        data: [aktifCount, ditutupCount],
        backgroundColor: ['#2563eb', '#64748b'],
      },
    ],
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">Selamat datang di Sistem Pembagian SHU Koperasi.</p>
      
      <div className="stats-grid" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{stats.anggotaAktif}</div>
          <div className="stat-label">Total Anggota Aktif</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalNota}</div>
          <div className="stat-label">Total Nota</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.periodeAktif}</div>
          <div className="stat-label">Periode Aktif</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <Bar options={barOptions} data={barData} />
        </div>
        <div className="chart-container">
          <Doughnut options={{ responsive: true, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Status Periode' } } }} data={doughnutData} />
        </div>
      </div>
    </div>
  );
}
