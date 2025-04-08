const buildFaceswapLabOptions = ({origin_image,target_image,tempGender}) => {
return {
    "image": target_image,
    "units": [
      {
        "source_img": origin_image,
        "blend_faces": false,
        "same_gender": false,
        "sort_by_size": false,
        "check_similarity": false,
        "compute_similarity": false,
        "min_sim": 0,
        "min_ref_sim": 0,
        "faces_index": [
          0
        ],
        "reference_face_index": 0
      }
    ],
    "postprocessing": {
      "face_restorer_name": "CodeFormer",
      "restorer_visibility": 1,
      "codeformer_weight": 1,
      "upscaler_name": "",
      "scale": 1,
      "upscaler_visibility": 1
    }
}
}
module.exports = buildFaceswapLabOptions;

