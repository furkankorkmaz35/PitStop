import { Router } from 'express';
import { catalog, detail, compare } from '../controllers/vehicleController.js';

const router = Router();
router.get(['/Vehicle', '/Vehicle/Catalog', '/Vehicle/Catalog/:id'], catalog);
router.get(['/Vehicle/Detail', '/Vehicle/Detail/:id'], detail);
router.get(['/Vehicle/Compare', '/Vehicle/Compare/:id'], compare);
export default router;
