/**
 * @swagger
 * components:
 *   schemas:
 *     InputTemplate:
 *       type: object
 *       required:
 *         - modelName
 *         - classification
 *         - prompt
 *         - aspect_ratio
 *         - output_quality
 *         - output_format
 *         - prompt_strength
 *         - lora_scale
 *         - num_inference_steps
 *         - guidance_scale
 *       properties:
 *         template_id:
 *           type: string
 *           description: Unique identifier for the template
 *           example: "67fe06238a0397139a469c42"
 *         modelName:
 *           type: string
 *           description: Name of the model
 *           example: "victorle317/giaolinhnam"
 *         go_fast:
 *           type: boolean
 *           description: Whether to use fast generation mode
 *           example: false
 *         image:
 *           type: string
 *           description: Reference image URL | Ảnh gốc đầu vào (nếu có, thường dùng trong img2img)
 *           example: "https://i.pinimg.com/564x/4d/8d/8d/4d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d.jpg"
 *         classification:
 *           type: object
 *           required:
 *             - clothing_type
 *             - background
 *             - gender
 *             - style
 *           properties:
 *             clothing_type:
 *               type: array
 *               items:
 *                 type: string
 *               description: Type of clothing | Loại trang phục (áo dài, áo tấc, v.v.)
 *               example: ["giaolinhnam"]
 *             background:
 *               type: array
 *               items:
 *                 type: string
 *               description: Background | Bối cảnh ảnh (Hà nội, huế,..)
 *               example: ["hanoi", "hue"]
 *             gender:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: ["male", "female"]
 *               description: Gender | Giới tính (nam/nữ)
 *               example: ["male"]
 *             style:
 *               type: array
 *               items:
 *                 type: string
 *               description: Style | Phong cách (cổ trang, hiện đại, hoạt hình,...)
 *               example: []
 *         prompt:
 *           type: string
 *           description: Generation prompt | Nội dung mô tả ảnh cần tạo
 *           example: "a white American Man TOK ,a muscular american henry cavil justin bieber lookalike face man wearing a TOK style of traditional cross-collar dress wearing hat in front of traditional background"
 *         aspect_ratio:
 *           type: string
 *           default: "1:1"
 *           description: Output image aspect ratio | Tỉ lệ khung hình ảnh (mặc định 1:1)
 *           example: "1:1"
 *         output_quality:
 *           type: number
 *           default: 100
 *           description: Output image quality | Chất lượng ảnh đầu ra (0–100)
 *           example: 100
 *         output_format:
 *           type: string
 *           default: "jpg"
 *           description: Output image format | Định dạng ảnh đầu ra (webp, jpg,...)
 *           example: "jpg"
 *         prompt_strength:
 *           type: number
 *           default: 0.8
 *           description: Prompt strength for generation | Ảnh hưởng của prompt (0–1), càng cao càng bám sát prompt
 *           example: 0.8
 *         lora_scale:
 *           type: number
 *           default: 1.1
 *           description: LoRA scale for generation | Mức độ ảnh hưởng của LoRA nếu có dùng
 *           example: 1.1
 *         num_inference_steps:
 *           type: number
 *           default: 28
 *           description: Number of inference steps | Số bước sinh ảnh (nhiều hơn = chi tiết hơn)
 *           example: 28
 *         guidance_scale:
 *           type: number
 *           default: 3
 *           description: Guidance scale for generation | Độ bám sát prompt, thường từ 3–7 (càng cao càng bám sát nhưng dễ mất tự nhiên)
 *           example: 3
 *     InputTemplateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Successfully created 1 templates"
 *         templates:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               template_id:
 *                 type: string
 *                 description: Unique identifier for the template
 *                 example: "67fe06238a0397139a469c42"
 *               modelName:
 *                 type: string
 *                 description: Name of the model
 *                 example: "victorle317/giaolinhnam"
 *               go_fast:
 *                 type: boolean
 *                 description: Whether to use fast generation mode
 *                 example: false
 *               image:
 *                 type: string
 *                 description: Reference image URL | Ảnh gốc đầu vào (nếu có, thường dùng trong img2img)
 *                 example: ""
 *               classification:
 *                 type: object
 *                 properties:
 *                   clothing_type:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Type of clothing | Loại trang phục (áo dài, áo tấc, v.v.)
 *                     example: ["giaolinhnam"]
 *                   background:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Background | Bối cảnh ảnh (Hà nội, huế,..)
 *                     example: ["hanoi", "hue"]
 *                   gender:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: ["male", "female"]
 *                     description: Gender | Giới tính (nam/nữ)
 *                     example: ["male"]
 *                   style:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Style | Phong cách (cổ trang, hiện đại, hoạt hình,...)
 *                     example: []
 *               prompt:
 *                 type: string
 *                 description: Generation prompt | Nội dung mô tả ảnh cần tạo
 *                 example: "a white American Man TOK ,a muscular american henry cavil justin bieber lookalike face man wearing a TOK style of traditional cross-collar dress wearing hat in front of traditional background"
 *               aspect_ratio:
 *                 type: string
 *                 description: Output image aspect ratio | Tỉ lệ khung hình ảnh (mặc định 1:1)
 *                 example: "1:1"
 *               output_quality:
 *                 type: number
 *                 description: Output image quality | Chất lượng ảnh đầu ra (0–100)
 *                 example: 100
 *               output_format:
 *                 type: string
 *                 description: Output image format | Định dạng ảnh đầu ra (webp, jpg,...)
 *                 example: "jpg"
 *               prompt_strength:
 *                 type: number
 *                 description: Prompt strength for generation | Ảnh hưởng của prompt (0–1), càng cao càng bám sát prompt
 *                 example: 0.8
 *               lora_scale:
 *                 type: number
 *                 description: LoRA scale for generation | Mức độ ảnh hưởng của LoRA nếu có dùng
 *                 example: 1.1
 *               num_inference_steps:
 *                 type: number
 *                 description: Number of inference steps | Số bước sinh ảnh (nhiều hơn = chi tiết hơn)
 *                 example: 28
 *               guidance_scale:
 *                 type: number
 *                 description: Guidance scale for generation | Độ bám sát prompt, thường từ 3–7 (càng cao càng bám sát nhưng dễ mất tự nhiên)
 *                 example: 3
 *     TemplateStatistics:
 *       type: object
 *       properties:
 *         totalTemplates:
 *           type: integer
 *           description: Total number of templates
 *           example: 55
 *         classificationStats:
 *           type: object
 *           properties:
 *             clothingTypes:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *               description: Count of templates by clothing type
 *               example: {"nguthannu": 4, "giaolinhnam": 3}
 *             backgrounds:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *               description: Count of templates by background
 *               example: {"hue": 26, "hanoi": 55}
 *             genders:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *               description: Count of templates by gender
 *               example: {"female": 34, "male": 21}
 *             styles:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *               description: Count of templates by style
 *               example: {"blue": 4, "turquoise": 4}
 *         modelStats:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Count of templates by model
 *           example: {"NhatBinh5": 6, "NhatBinh3": 3}
 */

module.exports = {}; 