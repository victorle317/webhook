/**
 * @swagger
 * /model:
 *   get:
 *     tags:
 *       - Models
 *     summary: Get all models
 *     description: Retrieves all models. Returns full model data for admin users, and reduced data for regular users.
 *     security:
 *       - ClientAuth: []
 *     responses:
 *       200:
 *         description: List of models
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModelResponse'
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
 *                   example: "Error fetching models"
 */

module.exports = {}; 