const express = require('express');
const router = express.Router();

const { addTemplateHandler, getTemplateHandler, getTemplateByIdHandler, updateTemplateByIdHandler, deleteTemplateByIdHandler, getTemplateStatisticsHandler } = require('./handlers/templateHandler');
const { inputTemplateValidator } = require('../validator/inputTemplateValidator');
const modelRoutes = require('./modelRoutes');
const authenticate = require('../middleware/authenticate');


// POST - Add a new input template or multiple templates
router.post('/', authenticate, inputTemplateValidator, addTemplateHandler);

// READ - Get all templates with optional filters
router.get('/', authenticate, getTemplateHandler);

// GET - Get template statistics
router.get('/statistics', authenticate, getTemplateStatisticsHandler);

// READ - Get single template by ID
router.get('/:id', authenticate, getTemplateByIdHandler);

// UPDATE - Update a template
router.put('/:id', authenticate, inputTemplateValidator, updateTemplateByIdHandler);

// DELETE - Delete a template
router.delete('/:id', authenticate, deleteTemplateByIdHandler);



module.exports = router;