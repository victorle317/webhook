/**
 * @swagger
 * components:
 *   schemas:
 *     Model:
 *       type: object
 *       properties:
 *         modelName:
 *           type: string
 *           description: Unique name of the model | Tên duy nhất của model
 *         version:
 *           type: string
 *           description: Version of the model | Phiên bản của model
 *         previewUrl:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of preview image URLs | Danh sách URL ảnh xem trước
 *         classification:
 *           type: object
 *           properties:
 *             clothing_type:
 *               type: array
 *               items:
 *                 type: string
 *               description: Type of clothing | Loại trang phục (áo dài, áo tấc, v.v.)
 *             background:
 *               type: array
 *               items:
 *                 type: string
 *               description: Background | Bối cảnh ảnh (Hà nội, huế,..)
 *             gender:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: ["male", "female"]
 *               description: Gender | Giới tính (nam/nữ)
 *             style:
 *               type: array
 *               items:
 *                 type: string
 *               description: Style | Phong cách (cổ trang, hiện đại, hoạt hình,...)
 *     ModelResponse:
 *       type: object
 *       properties:
 *         modelNameList:
 *           type: array
 *           items:
 *             type: string
 *           description: List of model names | Danh sách tên các model
 *         clothingTypeList:
 *           type: array
 *           items:
 *             type: string
 *           description: List of available clothing types | Danh sách các loại trang phục có sẵn
 *         backgroundList:
 *           type: array
 *           items:
 *             type: string
 *           description: List of available backgrounds | Danh sách các bối cảnh có sẵn
 *         genderList:
 *           type: array
 *           items:
 *             type: string
 *           description: List of available genders | Danh sách các giới tính có sẵn
 *         styleList:
 *           type: array
 *           items:
 *             type: string
 *           description: List of available styles | Danh sách các phong cách có sẵn
 *         models:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               model_id:
 *                 type: string
 *                 description: Unique identifier of the model | ID duy nhất của model
 *               modelName:
 *                 type: string
 *                 description: Name of the model | Tên của model
 *               previewUrl:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of preview image URLs | Danh sách URL ảnh xem trước
 *               classification:
 *                 type: object
 *                 properties:
 *                   clothing_type:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Type of clothing | Loại trang phục (áo dài, áo tấc, v.v.)
 *                   background:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Background | Bối cảnh ảnh (Hà nội, huế,..)
 *                   gender:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: ["male", "female"]
 *                     description: Gender | Giới tính (nam/nữ)
 *                   style:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Style | Phong cách (cổ trang, hiện đại, hoạt hình,...)
 */

module.exports = {};
