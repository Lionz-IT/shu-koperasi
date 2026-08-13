export type Anggota = {
  id: number;
  nama: string;
  noHp: string | null;
  alamat: string | null;
  aktif: boolean;
};

export type NotaItem = { 
  id?: number; 
  namaBarang: string; 
  qty: number; 
  hargaModal: number; 
  hargaSatuan: number; 
  subtotal?: number;
};

export type Nota = { 
  id: number; 
  nomorNota: string; 
  tanggal: string; 
  total: number; 
  anggota?: { id: number; nama: string }; 
  catatan?: string; 
  fotoNota?: string; 
  items?: NotaItem[];
};

export type AnggotaPembagian = {
  id: number;
  nama: string;
};

export type Pembagian = {
  id: number;
  anggotaId: number;
  totalBelanja: number;
  proporsi: number;
  nominalShu: number;
  anggota: AnggotaPembagian;
};

export type Periode = {
  id: number;
  nama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  totalLaba: number;
  status: 'AKTIF' | 'DITUTUP';
  createdAt: string;
  pembagian?: Pembagian[];
};

export type LaporanData = {
  periode: { nama: string; tanggalMulai: string; tanggalSelesai: string };
  summary: { totalLaba: number; totalBelanja: number; jumlahAnggota: number };
  pembagian: Pembagian[];
};
