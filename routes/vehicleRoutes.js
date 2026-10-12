import { Router } from 'express';
import { catalog, detail } from '../controllers/vehicleController.js';

const router = Router();
router.get(['/', '/Vehicle', '/Vehicle/Catalog', '/Vehicle/Catalog/:id'], catalog);
router.get(['/Vehicle/Detail', '/Vehicle/Detail/:id'], detail);
export default router;
