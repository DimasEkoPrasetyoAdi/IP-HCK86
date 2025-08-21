const { geocodeCity } = require('../services/geocode');
const { getProvinces, getRegencies } = require('../services/emsifa');

async function search(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'q query required' });
    const geo = await geocodeCity(q);
    if (!geo) return res.status(404).json({ message: 'Location not found' });
    res.json(geo);
  } catch (e) { next(e); }
}

async function provinces(req, res, next) {
  try {
    const list = await getProvinces();
    res.json(list);
  } catch (e) { next(e); }
}

async function regencies(req, res, next) {
  try {
    const { provinceId } = req.params;
    if (!provinceId) return res.status(400).json({ message: 'provinceId param required' });
    const list = await getRegencies(provinceId);
    res.json(list);
  } catch (e) { next(e); }
}

module.exports = { search, provinces, regencies };
