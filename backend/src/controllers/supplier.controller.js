const supplierService = require('../services/supplier.service');

async function index(req, res, next) {
  try {
    const result = await supplierService.getAll(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function active(req, res, next) {
  try {
    const result = await supplierService.getActive();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const result = await supplierService.getById(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const result = await supplierService.create(req.body);
    res.status(201).json({ success: true, message: 'Supplier berhasil ditambahkan', data: result });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await supplierService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Supplier berhasil diperbarui', data: result });
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await supplierService.remove(req.params.id);
    res.json({ success: true, message: 'Supplier berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, active, show, store, update, destroy };
