import { partReviews as reviews, garages } from '../data/demoData.js';

export function partReviews(req, res) {
  res.render('review/partReviews', { title: 'Parça İncelemeleri', reviews });
}

export function garageFinder(req, res) {
  const city = typeof req.query.city === 'string' ? req.query.city : '';
  const normalizedCity = city.trim().toLocaleLowerCase('tr-TR');
  const filteredGarages = garages.filter(garage =>
    !normalizedCity || garage.city.toLocaleLowerCase('tr-TR').includes(normalizedCity));
  res.render('review/garageFinder', { title: 'Servis Bul', garages: filteredGarages, city, hasFilter: Boolean(normalizedCity) });
}
