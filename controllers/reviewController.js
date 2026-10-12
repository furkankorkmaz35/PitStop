import { partReviews as reviews, garages } from '../data/demoData.js';

export function partReviews(req, res) {
  res.render('review/partReviews', { title: 'Parça İncelemeleri', reviews });
}

export function garageFinder(req, res) {
  const city = typeof req.query.city === 'string' ? req.query.city : '';
  const filteredGarages = garages.filter(garage =>
    !city.trim() || garage.city.toLowerCase().includes(city.toLowerCase()));
  res.render('review/garageFinder', { title: 'Servis Bul', garages: filteredGarages });
}
