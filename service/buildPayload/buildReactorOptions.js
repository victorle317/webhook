
const buildReactorOptions = ({origin_image,target_image,tempGender}) => {
    return{
        "source_image": `${origin_image}`,
        "target_image": `${target_image}`,
        "source_faces_index": [
          0
        ],
        "face_index": [
          0
        ],
        "upscaler": "None",
        "scale": 1,
        "upscale_visibility": 1,
        "face_restorer": "CodeFormer",
        "restorer_visibility": 1,
        "codeformer_weight": 0.5,
        "restore_first": 0,
        "model": "inswapper_128.onnx",
        "save_to_file": 0,
        "result_file_path": "",
        "device": "CUDA",
        "mask_face": 0,
        "select_source": 0,

    } 
};

module.exports = buildReactorOptions;