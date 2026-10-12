import { maintenanceLogs, guides } from '../data/demoData.js';

export function logs(req, res) {
  res.render('maintenance/logs', {
    title: 'Bakım Kayıtları',
    logs: maintenanceLogs,
    totalCost: maintenanceLogs.reduce((total, log) => total + log.cost, 0)
  });
}

export function guide(req, res) {
  res.render('maintenance/guide', { title: 'DIY Rehber', guides });
}
