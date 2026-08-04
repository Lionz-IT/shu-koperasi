import { useState, useEffect } from 'react';
import api from '../lib/api';

type AnggotaPembagian = {
  id: number;
  nama: string;
};

type Pembagian = {
  id: number;
  anggotaId: number;
  totalBelanja: number;
  proporsi: number;
  nominalShu: number;
  anggota: AnggotaPembagian;
};

type Periode = {
  id: number;
  nama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  totalLaba: number;
  status: 'AKTIF' | 'DITUTUP';
  createdAt: string;
  pembagian?: Pembagian[];
};

const formatRp = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const formatDate = (val: string) => new Date(val).toLocaleDateString('id-ID');

export default function Periode() {
  const [data, setData] = useState<Periode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Partial<Periode> | null>(null);
  const [saving, setSaving] = useState(false);

  const [tutupForm, setTutupForm] = useState<Periode | null>(null);
  const [labaInput, setLabaInput] = useState('');

  const [detail, setDetail] = useState<Periode | null>(null);

  const fetchPeriode = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await api.get('/periode');
      setData(res);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriode();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.nama || !form?.tanggalMulai || !form?.tanggalSelesai) return;
    if (new Date(form.tanggalSelesai) <= new Date(form.tanggalMulai)) {
      alert('Tanggal selesai harus setelah tanggal mulai');
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await api.put(`/periode/${form.id}`, form);
      } else {
        await api.post('/periode', form);
      }
      setForm(null);
      fetchPeriode();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus periode ini?')) return;
    try {
      await api.delete(`/periode/${id}`);
      fetchPeriode();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Gagal menghapus data');
    }
  };

  const handleTutup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutupForm || !labaInput) return;
    setSaving(true);
    try {
      await api.post(`/periode/${tutupForm.id}/tutup`, { totalLaba: Number(labaInput) });
      const { data: res } = await api.get(`/periode/${tutupForm.id}`);
      setTutupForm(null);
      setLabaInput('');
      fetchPeriode();
      setDetail(res);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Gagal menutup periode');
    } finally {
      setSaving(false);
    }
  };

  const loadDetail = async (id: number) => {
    try {
      const { data: res } = await api.get(`/periode/${id}`);
      setDetail(res);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Gagal memuat detail');
    }
  };

  return (
    <div className="crud-page">
      <div className="header-actions">
        <h1>Periode</h1>
        <button className="btn-primary btn-add" onClick={() => setForm({ nama: '', tanggalMulai: '', tanggalSelesai: '' })}>
          Tambah Periode
        </button>
      </div>

      {error && <p className="text-danger">{error}</p>}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Tanggal</th>
              <th>Total Laba</th>
              <th>Status</th>
              <th className="actions-cell">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="muted">Tidak ada data</td></tr>
            ) : (
              data.map(p => (
                <tr key={p.id}>
                  <td>{p.nama}</td>
                  <td>{formatDate(p.tanggalMulai)} - {formatDate(p.tanggalSelesai)}</td>
                  <td>{p.totalLaba ? formatRp(p.totalLaba) : '-'}</td>
                  <td>
                    <span className={`badge ${p.status === 'AKTIF' ? 'badge-success' : 'badge-danger'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {p.status === 'AKTIF' ? (
                        <>
                          <button className="btn-sm btn-secondary" onClick={() => setForm(p)}>Edit</button>
                          <button className="btn-sm btn-primary" onClick={() => setTutupForm(p)}>Tutup Periode</button>
                          <button className="btn-sm text-danger" onClick={() => handleDelete(p.id)}>Hapus</button>
                        </>
                      ) : (
                        <button className="btn-sm btn-secondary" onClick={() => loadDetail(p.id)}>Lihat Hasil</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="modal-overlay" onClick={() => setForm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{form.id ? 'Edit Periode' : 'Tambah Periode'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nama Periode</label>
                <input 
                  type="text" 
                  value={form.nama || ''} 
                  onChange={e => setForm({ ...form, nama: e.target.value })} 
                  required 
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Tanggal Mulai</label>
                <input 
                  type="date" 
                  value={form.tanggalMulai ? form.tanggalMulai.split('T')[0] : ''} 
                  onChange={e => setForm({ ...form, tanggalMulai: e.target.value })} 
                  required 
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Tanggal Selesai</label>
                <input 
                  type="date" 
                  value={form.tanggalSelesai ? form.tanggalSelesai.split('T')[0] : ''} 
                  onChange={e => setForm({ ...form, tanggalSelesai: e.target.value })} 
                  required 
                  className="form-control"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setForm(null)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tutupForm && (
        <div className="modal-overlay" onClick={() => setTutupForm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Tutup Periode</h2>
            <p style={{ marginBottom: '1rem' }}>
              <strong>{tutupForm.nama}</strong> ({formatDate(tutupForm.tanggalMulai)} - {formatDate(tutupForm.tanggalSelesai)})
            </p>
            <form onSubmit={handleTutup}>
              <div className="form-group">
                <label>Total Laba (Rp)</label>
                <input 
                  type="number" 
                  min="0"
                  value={labaInput} 
                  onChange={e => setLabaInput(e.target.value)} 
                  required 
                  className="form-control"
                  placeholder="0"
                />
              </div>
              <p className="text-danger" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                Peringatan: Setelah ditutup, periode tidak bisa diubah lagi.
              </p>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setTutupForm(null)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={saving || !labaInput}>
                  {saving ? 'Memproses...' : 'Tutup & Hitung SHU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <h2>Hasil Pembagian SHU</h2>
            <div className="detail-header" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Nama:</strong> {detail.nama}</div>
              <div><strong>Tanggal:</strong> {formatDate(detail.tanggalMulai)} - {formatDate(detail.tanggalSelesai)}</div>
              <div><strong>Total Laba:</strong> {formatRp(detail.totalLaba)}</div>
            </div>

            <div className="table-responsive" style={{ maxHeight: '60vh' }}>
              <table className="data-table detail-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Anggota</th>
                    <th style={{ textAlign: 'right' }}>Total Belanja</th>
                    <th style={{ textAlign: 'right' }}>Proporsi</th>
                    <th style={{ textAlign: 'right' }}>Nominal SHU</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.pembagian?.length ? detail.pembagian.map((p, i) => (
                    <tr key={p.id}>
                      <td>{i + 1}</td>
                      <td>{p.anggota.nama}</td>
                      <td style={{ textAlign: 'right' }}>{formatRp(p.totalBelanja)}</td>
                      <td style={{ textAlign: 'right' }}>{(p.proporsi * 100).toFixed(2)}%</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRp(p.nominalShu)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="muted text-center">Tidak ada data pembagian</td></tr>
                  )}
                  {detail.pembagian && detail.pembagian.length > 0 && (
                    <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                      <td colSpan={2}>TOTAL</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatRp(detail.pembagian.reduce((acc, curr) => acc + curr.totalBelanja, 0))}
                      </td>
                      <td style={{ textAlign: 'right' }}>100%</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatRp(detail.pembagian.reduce((acc, curr) => acc + curr.nominalShu, 0))}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <button className="btn-primary" onClick={() => setDetail(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}