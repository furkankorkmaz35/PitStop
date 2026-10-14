export function index(req, res) {
  res.render('home/index', { title: 'Aracını tanı' });
}

export function about(req, res) {
  res.render('home/about', { title: 'PitStop Hakkında' });
}
