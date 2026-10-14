import { vehicles, guides } from '../data/demoData.js';

export function index(req, res) {
  res.render('home/index', { title: 'Otomobil ve bakım rehberi', description: 'PitStop ile araçların teknik özelliklerini, bakım konularını ve parça seçeneklerini keşfet. Eğitim amaçlı otomobil rehberi.', featuredVehicles: vehicles.slice(0, 2), featuredGuides: guides });
}

export function about(req, res) {
  res.render('home/about', { title: 'PitStop Hakkında' });
}
