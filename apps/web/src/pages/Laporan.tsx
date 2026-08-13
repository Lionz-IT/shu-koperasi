import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { Periode, LaporanData } from '../lib/types';

export function Laporan() {
  const [periodeData, setPeriodeData] = useState<Pick<Periode, 'id' | 'nama' | 'status'>[]>([]);
  const [selectedPeriode, setSelectedPeriode] = useState<string>('');
  const [laporan, setLaporan] = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPeriode() {
      try {
        const res = await api.get('/periode');
        const closed = res.data.filter((p: Pick<Periode, 'id' | 'nama' | 'status'>) => p.status === 'DITUTUP');
        setPeriodeData(closed);
        if (closed.length > 0) {
          setSelectedPeriode(closed[0].id.toString());
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchPeriode();
  }, []);

  useEffect(() => {
    if (!selectedPeriode) return;
    
    async function fetchLaporan() {
      setLoading(true);
      try {
        const res = await api.get(`/laporan/periode/${selectedPeriode}`);
        setLaporan(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLaporan();
  }, [selectedPeriode]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  if (periodeData.length === 0) {
    return (
      <div className="laporan-page">
        <h1>Laporan SHU</h1>
        <p className="muted">Belum ada periode yang ditutup</p>
      </div>
    );
  }

  return (
    <div className="laporan-page">
      <div className="header-actions print-hidden">
        <div>
          <h1>Laporan SHU</h1>
          <p className="muted">Laporan pembagian Sisa Hasil Usaha berdasarkan periode</p>
        </div>
        <button className="btn-primary" onClick={() => window.print()}>Cetak Laporan</button>
      </div>

      <div className="filters-bar print-hidden" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ maxWidth: '300px' }}>
          <label>Pilih Periode</label>
          <select 
            className="form-control" 
            value={selectedPeriode} 
            onChange={(e) => setSelectedPeriode(e.target.value)}
          >
            {periodeData.map(p => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p>Memuat laporan...</p>}

      {!loading && laporan && (
        <div className="report-container">
          <div className="report-header">
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Laporan Pembagian SHU</h2>
            <h3 style={{ textAlign: 'center', fontWeight: 'normal', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>Periode: {laporan.periode.nama} ({formatDate(laporan.periode.tanggalMulai)} - {formatDate(laporan.periode.tanggalSelesai)})</h3>
          </div>

          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-label">Total Laba</div>
              <div className="stat-value">{formatCurrency(laporan.summary.totalLaba)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Belanja Anggota</div>
              <div className="stat-value">{formatCurrency(laporan.summary.totalBelanja)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Jumlah Anggota Aktif</div>
              <div className="stat-value">{laporan.summary.jumlahAnggota}</div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>No.</th>
                  <th>Nama Anggota</th>
                  <th style={{ textAlign: 'right' }}>Total Belanja</th>
                  <th style={{ textAlign: 'right' }}>Proporsi (%)</th>
                  <th style={{ textAlign: 'right' }}>Nominal SHU</th>
                </tr>
              </thead>
              <tbody>
                {laporan.pembagian.map((p, index) => (
                  <tr key={p.anggotaId}>
                    <td>{index + 1}</td>
                    <td>{p.anggota.nama}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(p.totalBelanja)}</td>
                    <td style={{ textAlign: 'right' }}>{(Number(p.proporsi) * 100).toFixed(2)}%</td>
                    <td style={{ textAlign: 'right', fontWeight: '500' }}>{formatCurrency(p.nominalShu)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan={2} style={{ textAlign: 'right', padding: '1rem' }}>Grand Total</td>
                  <td style={{ textAlign: 'right', padding: '1rem' }}>{formatCurrency(laporan.summary.totalBelanja)}</td>
                  <td style={{ textAlign: 'right', padding: '1rem' }}>100%</td>
                  <td style={{ textAlign: 'right', padding: '1rem' }}>{formatCurrency(laporan.summary.totalLaba)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
