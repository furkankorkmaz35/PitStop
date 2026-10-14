import { vehicles } from '../data/demoData.js';

export function catalog(req, res) {
  const brand = typeof req.query.brand === 'string' ? req.query.brand : '';
  const engine = typeof req.query.engine === 'string' ? req.query.engine : '';
  const matches = (value, filter) => !filter.trim() || value.toLowerCase().includes(filter.toLowerCase());
  const filteredVehicles = vehicles.filter(vehicle =>
    matches(vehicle.brand, brand) && matches(vehicle.engine, engine));

  res.render('vehicle/catalog', { title: 'Araç Kataloğu', vehicles: filteredVehicles, filters: { brand, engine }, hasFilters: Boolean(brand.trim() || engine.trim()) });
}

export function detail(req, res) {
  const { brand = 'Toyota', model = 'Corolla' } = req.query;
  const vehicle = vehicles.find(item => item.brand === brand && item.model === model);
  res.render('vehicle/detail', { title: 'Araç Detayı', vehicle: vehicle ?? vehicles[0] });
}
