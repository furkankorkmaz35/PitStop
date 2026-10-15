import { maintenanceLogs, guides } from '../data/demoData.js';
import { generateMaintenancePdf } from '../services/pdfService.js';

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

export function downloadLogPdf(req, res) {
  const id = parseInt(req.params.id, 10);
  const log = maintenanceLogs.find(l => l.id === id);

  if (!log) {
    return res.status(404).redirect('/Maintenance/Logs');
  }

  const safeVehicle = log.vehicle.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `PitStop-Bakim-Kaydi-${log.id}-${safeVehicle}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

  generateMaintenancePdf(log, res);
}
