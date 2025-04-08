const axios = require('axios');
const compositeImages = require('./utils/compose');
const buildTxt2ImgOptions = require('./buildPayload/buildTxt2ImgOptions');
const buildReactorOptions = require('./buildPayload/buildReactorOptions');
const buildImg2ImgOptions = require('./buildPayload/buildImg2ImgOptions');
const buildFaceswapLabOptions = require('./buildPayload/buildFaceswapLabOptions');
const { saveOutputToSpaces } = require('./storage');

// https://ly0q4vvupmsg34-3001.proxy.runpod.net


let AI_API_URL = () => { 
    return ["https://xyvql8iz8qd6s7-3001.proxy.runpod.net","https://lgeihuwfshcbq9-3001.proxy.runpod.net"][Math.floor(Math.random() * 2)];
 }
//  process.env.AI_API_URL;

const generateTxt2Img = async ({prompt,negative_prompt,sampler_name,cfg_scale}) => {
    const temp_SRV_URL = `${process.env.TXT2IMG_API_URL}`;
    let options,res;


    try {
         options = buildTxt2ImgOptions({prompt,negative_prompt,sampler_name,cfg_scale});
         res = await axios.post(`${temp_SRV_URL}/sdapi/v1/txt2img`,JSON.stringify(options),{
            headers: {
                'Content-Type': 'application/json',
                'Connection': 'keep-alive'
            }
        });
        return res.data.images[0];
    } catch (error) {
        if (typeof error.response != "undefined") {
            console.log("AI Core response with error status: " + error.response.status);
            console.log(error.response.data);
            //   console.log(error.response.headers);
        }
       
        throw new Error(`Error in generate generateTxt2Img, AI Core response with error status: ${error.response.status} \n ${JSON.stringify(error.response.data,null,2)}`);

    } finally{
        options = null;
        res = null;
    }
    
};

const generateFace = async ({origin_image,target_image,gender}) => {
    const temp_SRV_URL = `${process.env.FACE_API_URL}`;
    let processor;
    let options,res;

    try {
        let tempGender = getGender(gender)
        
        if(Math.random() > 0.5){
            processor = "Reactor";
            options = buildReactorOptions({origin_image,target_image,tempGender});
            res = await axios.post(`${temp_SRV_URL}/reactor/image`,JSON.stringify(options),{
                headers: {
                    'Content-Type': 'application/json',
                    'Connection': 'keep-alive'
                }
            });
            return res.data.image;

        }else{
            processor = "FaceswapLab";
            options = buildFaceswapLabOptions({origin_image,target_image,tempGender});
            
            res = await axios.post(`${temp_SRV_URL}/faceswaplab/swap_face`,JSON.stringify(options),{
                headers: {
                    'Content-Type': 'application/json',
                    'Connection': 'keep-alive'
                }
            });
            return res.data.images[0];
        }
    } catch (error) {  
            if (typeof error.response != "undefined") {
                console.log("AI Core response with error status: " + error.response.status);
                console.log(error.response.data);
            }
        throw new Error(`Error in generate ${processor}, AI Core response with error status: ${error.response.status} \n ${JSON.stringify(error.response.data,null,2)}`);
    } finally{
        processor = null;
        options = null;
        res = null;
    }
   
};

const generateAnimePaint = async ({prompt,negative_prompt,cfg_scale,denoising_strength,sampler_name}) => {
    try {
        const options = buildImg2ImgOptions({prompt,negative_prompt,cfg_scale,denoising_strength,sampler_name});
        const res = await axios.post(`${AI_API_URL}/sdapi/v1/img2img`,options);
    } catch (error) {
        throw new Error("Error in AnimePaint");
    }
};
function getGender (gender){
    if(gender.toLowerCase() == "male")return 0;
    if(gender.toLowerCase() == "female")return 1;
    return [1,0][Math.floor(Math.random() * 2)];
  }
function isValidHttpUrl(string) {
    let url;
  
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
  }



const service = {generateFace,generateTxt2Img,generateAnimePaint, compositeImages,isValidHttpUrl,saveOutputToSpaces};

module.exports = service;