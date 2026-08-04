import { Router } from 'express';
import { getLaporanShuController } from '../controllers/laporan';

const router = Router();

router.get('/periode/:periodeId', getLaporanShuController);

export default router;
