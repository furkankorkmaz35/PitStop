import { Router } from 'express';
import { catalog, detail, compare, apiVehicles } from '../controllers/vehicleController.js';
import { apiGarages } from '../controllers/reviewController.js'; // from '../controllers/vehicleController.js';

const router = Router();
// Araç kataloğu listeleme rotaları (Sunucu taraflı MVC görünümü)
router.get(['/Vehicle', '/Vehicle/Catalog', '/Vehicle/Catalog/:id'], catalog);
// Tekil araç detay sayfası rotası
router.get(['/Vehicle/Detail', '/Vehicle/Detail/:id'], detail);
// İki aracı yan yana karşılaştıran kıyaslama sayfası rotası
router.get(['/Vehicle/Compare', '/Vehicle/Compare/:id'], compare);

// Canlı AJAX/Fetch araması için RESTful JSON API uç noktası
// Sayfa yenilenmeden anlık arama sonuçlarını JSON formatında istemciye sunar
router.get('/api/vehicles', apiVehicles);
router.get('/api/garages', apiGarages);

export default router;
