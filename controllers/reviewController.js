import { partReviews as reviews, garages } from '../data/demoData.js';

export function partReviews(req, res) {
  res.render('review/partReviews', { title: 'Parça İncelemeleri', reviews });
}

export function garageFinder(req, res) {
  const city = typeof req.query.city === 'string' ? req.query.city : '';
  const brand = typeof req.query.brand === 'string' ? req.query.brand : '';
  const specialty = typeof req.query.specialty === 'string' ? req.query.specialty : '';
  const normalizedCity = city.trim().toLocaleLowerCase('tr-TR');
  const normalizedBrand = brand.trim().toLocaleLowerCase('tr-TR');
  const normalizedSpecialty = specialty.trim().toLocaleLowerCase('tr-TR');
  const filteredGarages = garages.filter(garage => {
    const cityMatches = !normalizedCity || garage.city.toLocaleLowerCase('tr-TR').includes(normalizedCity);
    const brandMatches = !normalizedBrand || garage.brands.toLocaleLowerCase('tr-TR').includes(normalizedBrand);
    const specialtyMatches = !normalizedSpecialty || garage.specialty.toLocaleLowerCase('tr-TR').includes(normalizedSpecialty)
      || garage.services.some(service => service.toLocaleLowerCase('tr-TR').includes(normalizedSpecialty));
    return cityMatches && brandMatches && specialtyMatches;
  });
  const hasFilter = Boolean(normalizedCity || normalizedBrand || normalizedSpecialty);
  res.render('review/garageFinder', {
    title: 'Servis Bul', garages: filteredGarages,
    filters: { city, brand, specialty }, hasFilter
  });
}
