const maintenanceService = require('../services/maintenance.service');

async function index(req, res, next) {
  try {
    const result = await maintenanceService.getAll(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const result = await maintenanceService.create(req.body);
    res.status(201).json({ success: true, message: 'Data maintenance berhasil ditambahkan', data: result });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await maintenanceService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Data maintenance berhasil diperbarui', data: result });
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await maintenanceService.remove(req.params.id);
    res.json({ success: true, message: 'Data maintenance berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, store, update, destroy };
