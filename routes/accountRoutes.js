import { Router } from 'express';
import { loginPage, login, logout } from '../controllers/accountController.js';

const router = Router();
router.get('/Login', loginPage);
router.post('/Login', login);
router.post('/Logout', logout);
export default router;
