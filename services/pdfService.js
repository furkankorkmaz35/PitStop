import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

export function generateMaintenancePdf(log, stream) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 45,
    info: {
      Title: `PitStop Bakım Kaydı - ${log.vehicle}`,
      Author: 'PitStop Otomobil Rehberi',
      Subject: 'Araç Bakım Kayıt Belgesi',
    }
  });

  doc.pipe(stream);

  // Fonts with local fallbacks
  const regularFont = path.join(projectRoot, 'public/fonts/arial.ttf');
  const boldFont = path.join(projectRoot, 'public/fonts/arialbd.ttf');

  if (fs.existsSync(regularFont)) doc.font(regularFont);

  const primaryColor = '#111315';
  const accentColor = '#f25722';
  const mutedColor = '#64748b';
  const lightBg = '#f8fafc';
  const borderColor = '#e2e8f0';

  // --- TOP HEADER BANNER ---
  doc.rect(45, 45, 505, 75).fill(primaryColor);

  // Brand Logo
  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(24).fillColor('#ffffff').text('PITSTOP', 65, 62, { continued: true });
  doc.fillColor(accentColor).text('.');

  // Subtitle
  doc.fontSize(10).fillColor('#94a3b8').text('RESMİ ARAÇ BAKIM & SERVİS GEÇMİŞİ FORMU', 65, 92);

  // Document Number & Date (Right-aligned)
  if (fs.existsSync(regularFont)) doc.font(regularFont);
  doc.fontSize(9).fillColor('#94a3b8').text('BELGE NO:', 380, 64, { align: 'right', width: 150 });
  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(10).fillColor('#ffffff').text(`PS-LOG-${String(log.id || 1).padStart(3, '0')}`, 380, 77, { align: 'right', width: 150 });
  if (fs.existsSync(regularFont)) doc.font(regularFont);
  doc.fontSize(9).fillColor('#94a3b8').text(`TARİH: ${log.date}`, 380, 93, { align: 'right', width: 150 });

  // Accent divider line
  doc.rect(45, 120, 505, 4).fill(accentColor);

  // --- VEHICLE & SERVICE OVERVIEW CARD ---
  let currentY = 145;
  doc.rect(45, currentY, 505, 95).fillAndStroke(lightBg, borderColor);

  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(10).fillColor(accentColor).text('01 / ARAÇ VE SERVİS BİLGİLERİ', 65, currentY + 14);

  // Left side: Vehicle Model & Date
  if (fs.existsSync(regularFont)) doc.font(regularFont);
  doc.fontSize(9).fillColor(mutedColor).text('Araç Modeli:', 65, currentY + 36);
  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(12).fillColor(primaryColor).text(log.vehicle, 65, currentY + 49);

  if (fs.existsSync(regularFont)) doc.font(regularFont);
  doc.fontSize(9).fillColor(mutedColor).text('İşlem Tarihi:', 65, currentY + 68);
  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(10).fillColor(primaryColor).text(log.date, 128, currentY + 68);

  // Right side: Service point & Verification
  if (fs.existsSync(regularFont)) doc.font(regularFont);
  doc.fontSize(9).fillColor(mutedColor).text('Servis / Bakım Noktası:', 320, currentY + 36);
  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(11).fillColor(primaryColor).text(log.service, 320, currentY + 49);

  if (fs.existsSync(regularFont)) doc.font(regularFont);
  doc.fontSize(9).fillColor(mutedColor).text('Kayıt Durumu:', 320, currentY + 68);
  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(9).fillColor('#16a34a').text('● TAMAMLANDI VE İŞLENDİ', 385, currentY + 68);

  // --- OPERATION DETAILS TABLE ---
  currentY = 260;
  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(10).fillColor(accentColor).text('02 / YAPILAN İŞLEM VE PARÇA DETAYI', 45, currentY);

  currentY += 18;
  // Table Header
  doc.rect(45, currentY, 505, 24).fill('#1e293b');
  doc.fontSize(9).fillColor('#ffffff');
  doc.text('İŞLEM TANIMI', 58, currentY + 7);
  doc.text('KULLANILAN PARÇA / SARF MALZEME', 200, currentY + 7);
  doc.text('TUTAR', 460, currentY + 7, { align: 'right', width: 75 });

  // Table Row
  currentY += 24;
  doc.rect(45, currentY, 505, 60).fillAndStroke('#ffffff', borderColor);

  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(10).fillColor(primaryColor).text(log.operation, 58, currentY + 16);

  if (fs.existsSync(regularFont)) doc.font(regularFont);
  doc.fontSize(9).fillColor(mutedColor).text(log.part, 200, currentY + 16, { width: 240, lineGap: 3 });

  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(12).fillColor(primaryColor).text(`₺${log.cost.toLocaleString('tr-TR')}`, 460, currentY + 16, { align: 'right', width: 75 });

  // --- TOTAL SUMMARY CARD ---
  currentY += 80;
  const summaryBoxWidth = 220;
  const summaryBoxX = 330;
  doc.rect(summaryBoxX, currentY, summaryBoxWidth, 92).fillAndStroke(lightBg, borderColor);

  const subtotal = Math.round(log.cost / 1.2);
  const kdv = log.cost - subtotal;

  if (fs.existsSync(regularFont)) doc.font(regularFont);
  doc.fontSize(9).fillColor(mutedColor);
  doc.text('İşçilik & Parça (Net):', summaryBoxX + 15, currentY + 15);
  doc.text(`₺${subtotal.toLocaleString('tr-TR')}`, summaryBoxX + 110, currentY + 15, { align: 'right', width: 95 });

  doc.text('KDV (%20 Dahil):', summaryBoxX + 15, currentY + 33);
  doc.text(`₺${kdv.toLocaleString('tr-TR')}`, summaryBoxX + 110, currentY + 33, { align: 'right', width: 95 });

  doc.rect(summaryBoxX + 15, currentY + 50, summaryBoxWidth - 30, 1).fill(borderColor);

  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(11).fillColor(primaryColor).text('GENEL TOPLAM:', summaryBoxX + 15, currentY + 62);
  doc.fontSize(13).fillColor(accentColor).text(`₺${log.cost.toLocaleString('tr-TR')}`, summaryBoxX + 90, currentY + 60, { align: 'right', width: 115 });

  // --- DIGITAL VERIFICATION BADGE (Left side) ---
  const badgeX = 45;
  const badgeWidth = 260;
  doc.rect(badgeX, currentY, badgeWidth, 92).fillAndStroke('#f1f5f9', borderColor);

  if (fs.existsSync(boldFont)) doc.font(boldFont);
  doc.fontSize(9).fillColor(primaryColor).text('DİJİTAL SİSTEM KAYDI & DOĞRULAMA', badgeX + 15, currentY + 15);

  if (fs.existsSync(regularFont)) doc.font(regularFont);
  doc.fontSize(8).fillColor(mutedColor).text(
    'Bu doküman PitStop Otomobil Rehberi sistemi tarafından otomatik üretilmiştir. Kayıtlar araç sahibinin ve ustanın teyit ettiği bakım geçmişini ifade eder.',
    badgeX + 15, currentY + 32, { width: badgeWidth - 30, lineGap: 2 }
  );

  const verificationHash = Buffer.from(`${log.vehicle}-${log.date}-${log.cost}`).toString('base64').substring(0, 16).toUpperCase();
  doc.fontSize(8).fillColor(accentColor).text(`✓ Doğrulama Kodu: PS-${verificationHash}`, badgeX + 15, currentY + 72);

  // --- FOOTER ---
  const footerY = 740;
  doc.rect(45, footerY, 505, 1).fill(borderColor);

  if (fs.existsSync(regularFont)) doc.font(regularFont);
  doc.fontSize(8).fillColor(mutedColor);
  doc.text('PitStop • Araç Sahiplerinin Otomobil Rehberi ve Deneyim Kütüphanesi', 45, footerY + 12);
  doc.text('Sayfa 1 / 1 • pitstop.local', 380, footerY + 12, { align: 'right', width: 170 });

  doc.end();
}
