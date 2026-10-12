import { Router } from 'express';
import { partReviews, garageFinder } from '../controllers/reviewController.js';

const router = Router();
router.get(['/PartReviews', '/PartReviews/:id'], partReviews);
router.get(['/GarageFinder', '/GarageFinder/:id'], garageFinder);
export default router;
