import { useState, useEffect } from 'react';
import api from '../lib/api';

type Anggota = {
  id: number;
  nama: string;
  noHp: string | null;
  alamat: string | null;
  aktif: boolean;
};

export default function Anggota() {
  const [data, setData] = useState<Anggota[]>([]);
  const [search, setSearch] = useState('');
  const [showNonAktif, setShowNonAktif] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Partial<Anggota> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAnggota = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await api.get('/anggota', {
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
    fetchAnggota();
  }, [search, showNonAktif]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.nama) return;
    setSaving(true);
    try {
      if (form.id) {
        await api.put(`/anggota/${form.id}`, form);
      } else {
        await api.post('/anggota', form);
      }
      setForm(null);
      fetchAnggota();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus?')) return;
    try {
      await api.delete(`/anggota/${id}`);
      fetchAnggota();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal menghapus data');
    }
  };

  return (
    <div className="crud-page">
      <div className="header-actions">
        <h1>Anggota</h1>
        <button className="btn-primary btn-add" onClick={() => setForm({ nama: '', noHp: '', alamat: '' })}>
          Tambah Anggota
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Cari nama..."
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
            <h2>{form.id ? 'Edit Anggota' : 'Tambah Anggota'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nama</label>
                <input
                  required
                  value={form.nama || ''}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>No HP</label>
                <input
                  value={form.noHp || ''}
                  onChange={e => setForm({ ...form, noHp: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Alamat</label>
                <input
                  value={form.alamat || ''}
                  onChange={e => setForm({ ...form, alamat: e.target.value })}
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
                <th>Nama</th>
                <th>No HP</th>
                <th>Alamat</th>
                <th>Status</th>
                <th className="actions-cell">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.nama}</td>
                  <td>{item.noHp || '-'}</td>
                  <td>{item.alamat || '-'}</td>
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
