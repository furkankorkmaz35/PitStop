import { Router } from 'express';
import { index, about } from '../controllers/homeController.js';

const router = Router();
router.get(['/', '/Home', '/Home/Index'], index);
router.get('/Home/About', about);
export default router;
