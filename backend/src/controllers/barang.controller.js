const barangService = require('../services/barang.service');
const { generateKodeBarang } = require('../utils/autoNumber');

async function index(req, res, next) {
  try {
    const result = await barangService.getAll(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function byPemakai(req, res, next) {
  try {
    const exclude = req.query.exclude ? req.query.exclude.split(',') : [];
    const result = await barangService.getByPemakai(req.params.pemakaiId, exclude);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getKode(req, res, next) {
  try {
    const kode = await generateKodeBarang();
    res.json({ success: true, data: { kodeBarang: kode } });
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const result = await barangService.getById(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const result = await barangService.create(req.body);
    res.status(201).json({ success: true, message: 'Barang berhasil ditambahkan', data: result });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await barangService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Barang berhasil diperbarui', data: result });
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await barangService.remove(req.params.id);
    res.json({ success: true, message: 'Barang berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, byPemakai, getKode, show, store, update, destroy };
