/**
 * @swagger
 * /generate:
 *   post:
 *     tags:
 *       - Generation
 *     summary: Generate an image based on input parameters
 *     description: Generates an image using AI model with specified parameters and templates
 *     security:
 *       - ClientAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerationInput'
 *     responses:
 *       201:
 *         description: Generation request successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerationResponse'
 *       500:
 *         description: Server error during generation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 error:
 *                   type: string
 *                   example: Error generating image
 * 
 * /generate/{generation_id}:
 *   get:
 *     tags:
 *       - Generation
 *     summary: Get generation status by ID
 *     description: Retrieves the current status and details of a specific generation request
 *     security:    
 *       - ClientAuth: []
 *     parameters:
 *       - in: path
 *         name: generation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the generation to retrieve
 *     responses:
 *       200:
 *         description: Generation details successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerationStatus'
 *       404:
 *         description: Generation not found
 *       500:
 *         description: Server error while fetching generation
 * 
 * /generate/test:
 *   get:
 *     summary: Generate an image using a specific template ID
 *     description: Generate an image using the provided template ID from the database
 *     tags: [Generation]
 *     security:
 *       - ClientAuth: []
 *     parameters:
 *       - in: query
 *         name: template_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "67f694d4cc2784ec778f1a81"
 *         description: The ID of the template to use for generation
 *     responses:
 *       201:
 *         description: Generation started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 generation_id:
 *                   type: string
 *                   example: "prediction_123456"
 *                 statusUrl:
 *                   type: string
 *                   format: uri
 *                   example: "http://your-server/generate/prediction_123456"
 *       400:
 *         description: Invalid request parameters
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
 *                   example: "template_id is required"
 *       404:
 *         description: Template not found
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
 *                   example: "Template not found"
 *       500:
 *         description: Server error
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
 *                   example: "Error generating image"
 */ 
 

module.exports = {}; 