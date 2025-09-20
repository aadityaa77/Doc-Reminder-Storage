const express = require('express');
const router = express.Router();
const ctrl = require('./document.controller');
const { requireAuth } = require('../../middleware/auth');
const { uploadMemory } = require('../../storage/gridfs');

router.use(requireAuth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

router.post('/:id/file', uploadMemory.single('file'), ctrl.uploadFile);
router.get('/:id/file', ctrl.downloadFile);

module.exports = router;
