const serviceService = require('../services/service.service');

async function index(req, res, next) {
  try {
    const result = await serviceService.getAll(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const result = await serviceService.getById(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const result = await serviceService.create(req.body);
    res.status(201).json({ success: true, message: 'Data service berhasil ditambahkan', data: result });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await serviceService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Data service berhasil diperbarui', data: result });
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const result = await serviceService.remove(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show, store, update, destroy };
