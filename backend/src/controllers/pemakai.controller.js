const pemakaiService = require('../services/pemakai.service');

async function index(req, res, next) {
  try {
    const result = await pemakaiService.getAll(req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function allList(req, res, next) {
  try {
    const result = await pemakaiService.getAllList();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const result = await pemakaiService.getById(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const result = await pemakaiService.create(req.body);
    res.status(201).json({ success: true, message: 'Pemakai berhasil ditambahkan', data: result });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await pemakaiService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Pemakai berhasil diperbarui', data: result });
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await pemakaiService.remove(req.params.id);
    res.json({ success: true, message: 'Pemakai berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, allList, show, store, update, destroy };
