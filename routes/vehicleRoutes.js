import { Router } from 'express';
import { catalog, detail, compare } from '../controllers/vehicleController.js';

const router = Router();
// Araç kataloğu listeleme rotaları
router.get(['/Vehicle', '/Vehicle/Catalog', '/Vehicle/Catalog/:id'], catalog);
// Tekil araç detay sayfası rotası
router.get(['/Vehicle/Detail', '/Vehicle/Detail/:id'], detail);
// İki aracı yan yana karşılaştıran kıyaslama sayfası rotası
router.get(['/Vehicle/Compare', '/Vehicle/Compare/:id'], compare);
export default router;
