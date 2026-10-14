export function index(req, res) {
  res.render('home/index', {
    title: 'Aracını tanı',
    description: 'PitStop ile araçların teknik özelliklerini, bakım konularını ve parça seçeneklerini keşfet. Eğitim amaçlı otomobil rehberi.'
  });
}

export function about(req, res) {
  res.render('home/about', { title: 'PitStop Hakkında' });
}
