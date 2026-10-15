import { Router } from 'express';
import { logs, guide, downloadLogPdf } from '../controllers/maintenanceController.js';

const router = Router();
router.get('/Logs/:id/pdf', downloadLogPdf);
router.get(['/Logs', '/Logs/:id'], logs);
router.get(['/Guide', '/Guide/:id'], guide);
export default router;
