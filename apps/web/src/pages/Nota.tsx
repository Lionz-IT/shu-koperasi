import { useState, useEffect } from 'react';
import api from '../lib/api';

type Anggota = { id: string; nomorAnggota: string; nama: string };
type NotaItem = { id?: string; namaBarang: string; qty: number; hargaSatuan: number };
type Nota = { id: string; nomorNota: string; tanggal: string; total: number; anggota?: { nama: string }; catatan?: string; fotoNota?: string };

const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
const formatDate = (val: string) => new Date(val).toLocaleDateString('id-ID');

export default function Nota() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [notasList, setNotasList] = useState<Nota[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [detailNota, setDetailNota] = useState<(Nota & { items: NotaItem[] }) | null>(null);

  const [filterAnggota, setFilterAnggota] = useState('');
  const [filterDari, setFilterDari] = useState('');
  const [filterSampai, setFilterSampai] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const [formAnggotaId, setFormAnggotaId] = useState('');
  const [formTanggal, setFormTanggal] = useState('');
  const [formCatatan, setFormCatatan] = useState('');
  const [formFoto, setFormFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [formItems, setFormItems] = useState<NotaItem[]>([{ namaBarang: '', qty: 1, hargaSatuan: 0 }]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    api.get('/anggota?aktif=true').then(res => setAnggotaList(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    return () => {
      if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    };
  }, [fotoPreview]);

  const fetchList = async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (filterAnggota) params.append('anggotaId', filterAnggota);
      if (filterDari) params.append('tanggalDari', filterDari);
      if (filterSampai) params.append('tanggalSampai', filterSampai);
      if (filterSearch) params.append('search', filterSearch);
      const res = await api.get('/nota?' + params.toString());
      setNotasList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (view === 'list') fetchList();
  }, [view, filterAnggota, filterDari, filterSampai, filterSearch]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus nota ini?')) return;
    try {
      await api.delete('/nota/' + id);
      fetchList();
    } catch {
      alert('Gagal menghapus nota');
    }
  };

  const handleLihat = async (id: string) => {
    try {
      const res = await api.get('/nota/' + id);
      setDetailNota(res.data);
    } catch {
      alert('Gagal memuat detail nota');
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = formItems.filter(i => i.namaBarang && i.qty > 0);
    if (validItems.length === 0) return alert('Minimal 1 item');
    setFormSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('anggotaId', formAnggotaId);
      formData.append('tanggal', formTanggal);
      formData.append('catatan', formCatatan);
      formData.append('items', JSON.stringify(validItems));
      if (formFoto) formData.append('foto', formFoto);

      await api.post('/nota', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setView('list');
      setFormAnggotaId('');
      setFormTanggal('');
      setFormCatatan('');
      setFormFoto(null);
      setFotoPreview('');
      setFormItems([{ namaBarang: '', qty: 1, hargaSatuan: 0 }]);
    } catch {
      alert('Gagal menyimpan nota');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (view === 'form') {
    return (
      <div>
        <div className="page-header">
          <h1>Tambah Nota</h1>
          <button className="btn-secondary" onClick={() => {
            setView('list');
            setFormFoto(null);
            setFotoPreview('');
          }}>Batal</button>
        </div>
        <form className="nota-form" onSubmit={handleSaveForm}>
          <div className="filters-bar">
            <div className="form-group">
              <label>Anggota</label>
              <select value={formAnggotaId} onChange={e => setFormAnggotaId(e.target.value)} required className="form-control">
                <option value="">Pilih Anggota...</option>
                {anggotaList.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tanggal</label>
              <input type="date" value={formTanggal} onChange={e => setFormTanggal(e.target.value)} required className="form-control" />
            </div>
          </div>
          <div className="form-group">
            <label>Catatan (Opsional)</label>
            <textarea value={formCatatan} onChange={e => setFormCatatan(e.target.value)} className="form-control" rows={3}></textarea>
          </div>
          <div className="form-group">
            <label>Foto Nota (Opsional)</label>
            <input type="file" accept="image/*" onChange={e => {
              if (fotoPreview) URL.revokeObjectURL(fotoPreview);
              const file = e.target.files?.[0] || null;
              setFormFoto(file);
              setFotoPreview(file ? URL.createObjectURL(file) : '');
            }} className="form-control" />
            {fotoPreview && <img src={fotoPreview} alt="Preview" style={{ maxHeight: '200px', marginTop: '10px', borderRadius: '4px' }} />}
          </div>
          
          <table className="items-table">
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th style={{ width: 100 }}>Qty</th>
                <th style={{ width: 150 }}>Harga Satuan</th>
                <th style={{ width: 150 }}>Subtotal</th>
                <th style={{ width: 60 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {formItems.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input type="text" required value={item.namaBarang} onChange={e => {
                      const newItems = [...formItems];
                      newItems[idx].namaBarang = e.target.value;
                      setFormItems(newItems);
                    }} />
                  </td>
                  <td>
                    <input type="number" required min="1" value={item.qty} onChange={e => {
                      const newItems = [...formItems];
                      newItems[idx].qty = Number(e.target.value);
                      setFormItems(newItems);
                    }} />
                  </td>
                  <td>
                    <input type="number" required min="0" value={item.hargaSatuan} onChange={e => {
                      const newItems = [...formItems];
                      newItems[idx].hargaSatuan = Number(e.target.value);
                      setFormItems(newItems);
                    }} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formatRp(item.qty * item.hargaSatuan)}
                  </td>
                  <td>
                    <button type="button" className="btn-danger" onClick={() => {
                      setFormItems(formItems.filter((_, i) => i !== idx));
                    }}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total:</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  {formatRp(formItems.reduce((acc, curr) => acc + (curr.qty * curr.hargaSatuan), 0))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <button type="button" className="btn-secondary" style={{ marginBottom: '1rem' }} onClick={() => {
            setFormItems([...formItems, { namaBarang: '', qty: 1, hargaSatuan: 0 }]);
          }}>+ Tambah Item</button>
          
          <div>
            <button type="submit" className="btn-primary" disabled={formSubmitting}>
              {formSubmitting ? 'Menyimpan...' : 'Simpan Nota'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Nota</h1>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setView('form')}>+ Tambah Nota</button>
      </div>

      <div className="filters-bar">
        <div className="form-group">
          <label>Cari Nomor Nota</label>
          <input type="text" placeholder="Cari..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} className="form-control" />
        </div>
        <div className="form-group">
          <label>Anggota</label>
          <select value={filterAnggota} onChange={e => setFilterAnggota(e.target.value)} className="form-control">
            <option value="">Semua Anggota</option>
            {anggotaList.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Tanggal Dari</label>
          <input type="date" value={filterDari} onChange={e => setFilterDari(e.target.value)} className="form-control" />
        </div>
        <div className="form-group">
          <label>Tanggal Sampai</label>
          <input type="date" value={filterSampai} onChange={e => setFilterSampai(e.target.value)} className="form-control" />
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nomor Nota</th>
            <th>Tanggal</th>
            <th>Anggota</th>
            <th>Total</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loadingList ? (
            <tr><td colSpan={5} style={{ textAlign: 'center' }}>Memuat...</td></tr>
          ) : notasList.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center' }}>Tidak ada data</td></tr>
          ) : (
            notasList.map(n => (
              <tr key={n.id}>
                <td>{n.nomorNota}</td>
                <td>{formatDate(n.tanggal)}</td>
                <td>{n.anggota?.nama || '-'}</td>
                <td>{formatRp(n.total)}</td>
                <td>
                  <button className="btn-small" onClick={() => handleLihat(n.id)}>Lihat</button>
                  <button className="btn-danger" onClick={() => handleDelete(n.id)}>Hapus</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {detailNota && (
        <div className="modal-overlay" onClick={() => setDetailNota(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Nota {detailNota.nomorNota}</h2>
              <button className="modal-close" onClick={() => setDetailNota(null)}>&times;</button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Tanggal:</strong> {formatDate(detailNota.tanggal)}</p>
              <p><strong>Anggota:</strong> {detailNota.anggota?.nama || '-'}</p>
              {detailNota.catatan && <p><strong>Catatan:</strong> {detailNota.catatan}</p>}
            </div>
            {detailNota.fotoNota && (
              <div style={{ marginBottom: '1rem' }}>
                <p><strong>Foto Nota:</strong></p>
                <img 
                  src={`http://localhost:3000${detailNota.fotoNota}`}
                  alt="Foto Nota"
                  style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>
            )}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Barang</th>
                  <th>Qty</th>
                  <th>Harga Satuan</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detailNota.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.namaBarang}</td>
                    <td>{it.qty}</td>
                    <td>{formatRp(it.hargaSatuan)}</td>
                    <td style={{ textAlign: 'right' }}>{formatRp(it.qty * it.hargaSatuan)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total:</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRp(detailNota.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
