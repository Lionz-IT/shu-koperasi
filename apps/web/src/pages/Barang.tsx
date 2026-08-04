import { useState, useEffect } from 'react';
import api from '../lib/api';

type Barang = {
  id: number;
  namaBarang: string;
  hargaDefault: number;
  aktif: boolean;
};

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function Barang() {
  const [data, setData] = useState<Barang[]>([]);
  const [search, setSearch] = useState('');
  const [showNonAktif, setShowNonAktif] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Partial<Barang> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchBarang = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await api.get('/barang', {
        params: { search, aktif: showNonAktif ? undefined : true }
      });
      setData(res);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, [search, showNonAktif]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.namaBarang || form.hargaDefault === undefined) return;
    setSaving(true);
    try {
      if (form.id) {
        await api.put(`/barang/${form.id}`, form);
      } else {
        await api.post('/barang', form);
      }
      setForm(null);
      fetchBarang();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus?')) return;
    try {
      await api.delete(`/barang/${id}`);
      fetchBarang();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal menghapus data');
    }
  };

  return (
    <div className="crud-page">
      <div className="header-actions">
        <h1>Barang</h1>
        <button className="btn-primary btn-add" onClick={() => setForm({ namaBarang: '', hargaDefault: 0 })}>
          Tambah Barang
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Cari barang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showNonAktif}
            onChange={(e) => setShowNonAktif(e.target.checked)}
          />
          Tampilkan Non-Aktif
        </label>
      </div>

      {error && <div className="error-text">{error}</div>}

      {form && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{form.id ? 'Edit Barang' : 'Tambah Barang'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nama Barang</label>
                <input
                  required
                  value={form.namaBarang || ''}
                  onChange={e => setForm({ ...form, namaBarang: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Harga Default</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.hargaDefault ?? ''}
                  onChange={e => setForm({ ...form, hargaDefault: parseInt(e.target.value) || 0 })}
                />
              </div>
              {form.id && (
                <div className="form-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={form.aktif !== false}
                      onChange={e => setForm({ ...form, aktif: e.target.checked })}
                    />
                    Status Aktif
                  </label>
                </div>
              )}
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

      {loading ? (
        <p className="muted">Memuat...</p>
      ) : data.length === 0 ? (
        <p className="muted">Data tidak ditemukan.</p>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th>Harga Default</th>
                <th>Status</th>
                <th className="actions-cell">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.namaBarang}</td>
                  <td>{formatRupiah(item.hargaDefault)}</td>
                  <td>
                    <span className={`badge ${item.aktif ? 'badge-success' : 'badge-danger'}`}>
                      {item.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-sm btn-edit" onClick={() => setForm(item)}>Edit</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
