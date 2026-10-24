import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import homeRoutes from './routes/homeRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import { attachDemoUser } from './controllers/accountController.js';
import { HtmlHelper } from './services/htmlHelper.js';
import { ViewComponentManager } from './services/viewComponents/ViewComponentManager.js';
import { QuickStatsViewComponent } from './services/viewComponents/QuickStatsViewComponent.js';
import { RecentActivityViewComponent } from './services/viewComponents/RecentActivityViewComponent.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(directory, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader('Clear-Site-Data', '"cache"');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
app.use(express.static(path.join(directory, 'public'), {
  etag: false,
  lastModified: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));
app.use(attachDemoUser);
app.use((req, res, next) => {
  res.locals.currentPath = req.path.toLowerCase().replace(/\/$/, '') || '/';
  res.locals.assetVersion = Date.now();

  const viewsDir = path.join(directory, 'views');
  // ASP.NET MVC mimarisindeki HtmlHelper motorunu şablonlara bağla (@Html.*)
  res.locals.Html = new HtmlHelper(viewsDir, res.locals);

  // ASP.NET Core MVC mimarisindeki ViewComponent motorunu şablonlara bağla (@Component.Invoke)
  const componentManager = new ViewComponentManager(viewsDir, res.locals);
  componentManager.register(new QuickStatsViewComponent());
  componentManager.register(new RecentActivityViewComponent());
  res.locals.Component = componentManager;

  next();
});
app.use('/', homeRoutes);
app.use('/', vehicleRoutes);
app.use('/Maintenance', maintenanceRoutes);
app.use('/Review', reviewRoutes);
app.use('/Account', accountRoutes);

export default app;
