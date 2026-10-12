import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vehicleRoutes from './routes/vehicleRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(directory, 'views'));
app.use(express.static(path.join(directory, 'public')));
app.use('/', vehicleRoutes);
app.use('/Maintenance', maintenanceRoutes);
app.use('/Review', reviewRoutes);

export default app;
