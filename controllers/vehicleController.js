import { vehicles, maintenanceLogs } from '../data/demoData.js';

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

function findVehicle(param) {
  if (!param || typeof param !== 'string') return null;
  const clean = param.trim().toLowerCase();
  return vehicles.find(v => {
    const fullName = `${v.brand} ${v.model}`.toLowerCase();
    return fullName === clean ||
           v.model.toLowerCase() === clean ||
           fullName.replace(/\s+/g, '') === clean.replace(/\s+/g, '') ||
           clean.includes(fullName);
  }) || null;
}

function getVehicleMaintenance(vehicle) {
  const brandLower = vehicle.brand.toLowerCase();
  const modelLower = vehicle.model.toLowerCase();
  const relatedLogs = maintenanceLogs.filter(log => {
    const logVehicle = log.vehicle.toLowerCase();
    return logVehicle.includes(brandLower) || logVehicle.includes(modelLower);
  });

  const count = relatedLogs.length;
  const totalCost = relatedLogs.reduce((acc, curr) => acc + curr.cost, 0);
  const avgCost = count > 0 ? Math.round(totalCost / count) : 3400;

  return {
    count,
    totalCost,
    avgCost,
    hasLogs: count > 0,
    logs: relatedLogs
  };
}

export function compare(req, res) {
  const v1Param = typeof req.query.v1 === 'string' ? req.query.v1 : (req.query.brand1 || '');
  const v2Param = typeof req.query.v2 === 'string' ? req.query.v2 : (req.query.brand2 || '');

  let vehicle1 = findVehicle(v1Param);
  let vehicle2 = findVehicle(v2Param);

  if (!vehicle1 && !vehicle2) {
    vehicle1 = vehicles[0]; // Toyota Corolla
    vehicle2 = vehicles[1]; // Volkswagen Golf
  } else if (!vehicle1) {
    vehicle1 = vehicles.find(v => v !== vehicle2) || vehicles[0];
  } else if (!vehicle2) {
    vehicle2 = vehicles.find(v => v !== vehicle1) || vehicles[1];
  }

  const v1Maintenance = getVehicleMaintenance(vehicle1);
  const v2Maintenance = getVehicleMaintenance(vehicle2);

  const powerDiff = vehicle1.power - vehicle2.power;
  const yearDiff = vehicle1.year - vehicle2.year;

  res.render('vehicle/compare', {
    title: `${vehicle1.brand} ${vehicle1.model} vs ${vehicle2.brand} ${vehicle2.model} Karşılaştırması`,
    vehicles,
    vehicle1,
    vehicle2,
    v1Maintenance,
    v2Maintenance,
    powerDiff,
    yearDiff,
    v1Key: `${vehicle1.brand} ${vehicle1.model}`,
    v2Key: `${vehicle2.brand} ${vehicle2.model}`
  });
}
