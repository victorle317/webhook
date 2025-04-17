/**
 * @swagger
 * components:
 *   schemas:
 *     GenerationInput:
 *       type: object
 *       properties:
 *         gender:
 *           type: string
 *           description: Filter by gender classification
 *           example: "male"
 *         clothing_type:
 *           type: string
 *           description: Filter by clothing type
 *           example: "giaolinhnam"
 *         background:
 *           type: string
 *           description: Filter by background type
 *           example: "hanoi"
 *         style:
 *           type: string
 *           description: Filter by style
 *           example: "red"
 *     GenerationResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: ['starting', 'processing', 'succeeded', 'succeeded_with_error', 'failed', 'canceled', 'unknown']
 *         generation_id:
 *           type: string
 *         statusUrl:
 *           type: string
 *           format: uri
 * 
 *     GenerationStatus:
 *       type: object
 *       properties:
 *         modelName:
 *           type: string
 *         generationId:
 *           type: string
 *         status:
 *           type: string
 *           enum: ['starting', 'processing', 'succeeded', 'succeeded_with_error', 'failed', 'canceled', 'unknown']
 *         url:
 *           type: string
 *           format: uri
 *         prompt:
 *           type: string
 *         userInput:
 *           type: object
 *           properties:
 *             clothing_type:
 *               type: array
 *               items:
 *                 type: string
 *             background:
 *               type: array
 *               items:
 *                 type: string
 *             gender:
 *               type: array
 *               items:
 *                 type: string
 *             style:
 *               type: array
 *               items:
 *                 type: string
 *         chosenSettings:
 *           type: object
 *           properties:
 *             model:
 *               type: string
 *             prompt:
 *               type: string
 *             go_fast:
 *               type: boolean
 *             lora_scale:
 *               type: number
 *             megapixels:
 *               type: string
 *             num_outputs:
 *               type: number
 *             aspect_ratio:
 *               type: string
 *             output_format:
 *               type: string
 *             guidance_scale:
 *               type: number
 *             output_quality:
 *               type: number
 *             prompt_strength:
 *               type: number
 *             extra_lora_scale:
 *               type: number
 *             num_inference_steps:
 *               type: number
 *             lora_weights:
 *               type: string
 *               nullable: true
 */ 