/**
 * @file maintenanceRoutes.js
 * @description Bakım ve Servis Rotaları
 * 
 * Rotalar:
 * - GET  /Maintenance/Logs        -> Bakım kayıtları listeleme sayfası (Görüntüleme Sayfası)
 * - GET  /Maintenance/Create      -> Yeni bakım kaydı formu (Veri Giriş Sayfası - HtmlHelpers ile)
 * - POST /Maintenance/Create      -> Form verilerini işleme ve kaydetme
 * - GET  /Maintenance/Guide       -> DIY bakım rehberleri
 * - GET  /Maintenance/Logs/:id/pdf -> Bakım raporu PDF çıktısı
 */

import { Router } from 'express';
import { logs, guide, downloadLogPdf, createLogPage, createLogSubmit } from '../controllers/maintenanceController.js';

const router = Router();

// Yeni Bakım Kaydı Formu (HtmlHelpers ile oluşturulan form sayfası)
router.get(['/Create', '/New'], createLogPage);
router.post(['/Create', '/New'], createLogSubmit);

// Bakım kayıtları ve PDF dökümü rotaları
router.get('/Logs/:id/pdf', downloadLogPdf);
router.get(['/Logs', '/Logs/:id'], logs);

// DIY bakım rehberi rotaları
router.get(['/Guide', '/Guide/:id'], guide);

export default router;
