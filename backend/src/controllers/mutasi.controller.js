const mutasiService = require('../services/mutasi.service');
const { generateNomorMutasi } = require('../utils/autoNumber');

async function index(req, res, next) {
  try {
    const result = await mutasiService.getAll(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getNomor(req, res, next) {
  try {
    const jenis = req.query.jenis || 'pembelian';
    const noMutasi = await generateNomorMutasi(jenis);
    res.json({ success: true, data: { noMutasi } });
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const result = await mutasiService.getById(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const result = await mutasiService.create(req.body);
    res.status(201).json({ success: true, message: 'Data mutasi berhasil disimpan', data: result });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await mutasiService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Data mutasi berhasil diperbarui', data: result });
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const result = await mutasiService.remove(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, getNomor, show, store, update, destroy };
