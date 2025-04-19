/**
 * @swagger
 * /inputTemplate:
 *   post:
 *     tags:
 *       - Templates
 *     summary: Add a new input template or multiple templates
 *     description: Creates one or more input templates for image generation
 *     security:
 *       - ClientAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/InputTemplate'
 *     responses:
 *       201:
 *         description: Template(s) created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 templates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InputTemplate'
 *                 invalidModels:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid input or model not found
 *       500:
 *         description: Server error
 * 
 *   get:
 *     tags:
 *       - Templates
 *     summary: Get all templates with optional filters
 *     description: Retrieves templates with optional filtering by modelName, gender, clothing_type, style, and background
 *     security:
 *       - ClientAuth: []
 *     parameters:
 *       - in: query
 *         name: modelName
 *         schema:
 *           type: string
 *         description: Filter by model name
 *       - in: query
 *         name: gender
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: ["male", "female"]
 *         description: Filter by gender
 *       - in: query
 *         name: clothing_type
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by clothing type
 *       - in: query
 *         name: style
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by style
 *       - in: query
 *         name: background
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by background
 *     responses:
 *       200:
 *         description: List of templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InputTemplate'
 *       500:
 *         description: Server error
 * 
 * /inputTemplate/{template_id}:
 *   get:
 *     tags:
 *       - Templates
 *     summary: Get template by ID
 *     description: Retrieves a specific template by its ID
 *     security:
 *       - ClientAuth: []
 *     parameters:
 *       - in: path
 *         name: template_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InputTemplate'
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 * 
 *   put:
 *     tags:
 *       - Templates
 *     summary: Update template by ID
 *     description: Updates a specific template by its ID
 *     security:
 *       - ClientAuth: []
 *     parameters:
 *       - in: path
 *         name: template_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InputTemplate'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InputTemplate'
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 * 
 *   delete:
 *     tags:
 *       - Templates
 *     summary: Delete template by ID
 *     description: Deletes a specific template by its ID
 *     security:
 *       - ClientAuth: []
 *     parameters:
 *       - in: path
 *         name: template_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Template deleted successfully
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 * 
 * /inputTemplate/statistics:
 *   get:
 *     tags:
 *       - Templates
 *     summary: Get template statistics
 *     description: Retrieve statistics about templates including total count, classification stats, and model usage
 *     security:
 *       - ClientAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved template statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TemplateStatistics'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Error"
 *                 error:
 *                   type: string
 *                   example: "Error fetching template statistics"
 */

module.exports = {};
