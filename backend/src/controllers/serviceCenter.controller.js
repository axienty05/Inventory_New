const serviceCenterService = require('../services/serviceCenter.service');

async function index(req, res, next) {
  try {
    const result = await serviceCenterService.getAll(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function active(req, res, next) {
  try {
    const result = await serviceCenterService.getActive();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const result = await serviceCenterService.getById(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const result = await serviceCenterService.create(req.body);
    res.status(201).json({ success: true, message: 'Service center berhasil ditambahkan', data: result });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await serviceCenterService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Service center berhasil diperbarui', data: result });
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await serviceCenterService.remove(req.params.id);
    res.json({ success: true, message: 'Service center berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, active, show, store, update, destroy };
