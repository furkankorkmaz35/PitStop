import { Router } from 'express';
import { partReviews, garageFinder, apiGarages } from '../controllers/reviewController.js';

const router = Router();
// Parça incelemeleri rotaları
router.get(['/PartReviews', '/PartReviews/:id', '/review/partreviews'], partReviews);
// Servis bulucu sayfası rotası
router.get(['/GarageFinder', '/GarageFinder/:id', '/review/garagefinder'], garageFinder);

// İleri Web Programlama: Harita pinleri ve asenkron istemci için RESTful JSON API rotası
router.get('/api/garages', apiGarages);

export default router;
