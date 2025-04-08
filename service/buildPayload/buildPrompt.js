var prompt_test = "rice field, ( <lora:AoDaiNam_V36_Locon:1>clothes, 1 man, handsome male, masculine,face, asian, male, a male, handsome man in suite) (Duong Lam Ancient Village blur background), straight face, wearing (long pants), flat clothes,(thatched wood house), (hyperrealistic ancient thatched ancestral houses faraway villages and countryside background made of wood), (detailed face:1.2), ( high detailed hair), ((high detailed skin:0.9)), DLSR, art photographer, photographed on a FUJIFILM GFX 100S Camera, Fujifilm GF 63mm lens, F/6 aperture, tele angle, highly detailed (analog photography), (film grain:0.5), sharp outline, ((sharp focus on face)), ((sharp focus on body)), (depth of field), award winning photo, POV, 8K, UHD, key light, backlit, diffused soft light, soft lighting, lens flare, natural warm lighting, light from above, (strong front main lighting), crystal clear, high res, photorealistic, depth layering, physically-based rendering, polite, elegant, full body, outfit,  (apricot yellow and red blossom),(red and yellow flower blur background),(a lot of spring red and yellow flower),(flower market),(red and yellow flower blur background country side)"

var negative_prompt_test = "((sunglasses)),((logos)),((brand logo, logo), text),chinese character, (watermark), moles, earrings, (((nipples))),(((nipple))),(((man nipples))),(((female nipples))), bad hands, bad fingers, nsfw, sex, porn,beard, close up, closeup, upper body,realisticvision-negative-embedding"
var woman_love_bg_fix = [
    ",(((inside the wedding hall) marrying, wedding ceremony, ((full body photoshoot wearing bridal veil and white luxury and shinning wedding dress at the wedding on the beach and wedding party depth of field wedding flower gate background)))) ((wedding photography)),",
    ",((((inside the wedding hall)), marrying, ((wedding ceremony)), ((full body photoshoot wearing bridal veil and white luxury and shinning wedding dress at the wedding)), wedding hall ,(((wedding  party background ))))),((white suite)),flower background ((wedding photography)),",
    " ,(((wedding) (inside the church) marrying, wedding ceremony, ((bride and groom clothes)), people catholic Crucifix background)) ,"
]

/**
 * Gender, Profession, Wish, Newyear_style
 * Background sẽ dựa vào wish để gen
 * Cloth sẽ dựa vào newyear_style và profession
 */

const baseData = require('./promptDictionary/baseData')
const genderData   = require('./promptDictionary/genderData')
const backgroundData = require('./promptDictionary/backgroundData')
const clothData = require('./promptDictionary/clothData')


const buildPrompt =({gender,profession,wish,newyear_style}) => { 
    console.log(`API called with param ${gender} ${profession} ${wish} ${newyear_style}`);
    let prompt = ""

   
    // //2. Generate Gender
    prompt = prompt + buildGenderPrompt(gender)

    // //3. gen background
    prompt = prompt + buildBackgroundPrompt(newyear_style,wish,gender)


    // //4. gen cloth 
    prompt =  prompt +  buildClothStylePrompt(newyear_style,profession, gender)

  // 5. negative prompt???
   //1. Generate base Prompt
     prompt =  prompt + buildBasePrompt();
     prompt_test = prompt;
console.log("prompt: " + prompt);
 return {prompt_test, negative_prompt_test};
}

// gen 8k, 4k ...
const buildBasePrompt = () => {  
    return baseData;
}
// 
const buildGenderPrompt = (gender) => { 
    let temp = gender.toLowerCase()
    if(temp=="male") return genderData[temp]
    if(temp=="female") return genderData[temp]
 }

//Gen background theo file pptx gửi trước đó
// Sửa wish thì sửa cái này 
const buildBackgroundPrompt = (newyear_style, wish,gender) => { 

    let wishStyle = getWishCatagory(wish);
    console.log("wishStyle: " + wishStyle);
// wish chia theo sức khoẻ tài lộc ,....  mà ra đc background phải chia sức khoẻ hiện đại hoặc sức khoẻ modern
     if(newyear_style == "Cổ Truyền"){
        // console.log(backgroundData.tradition.default[0]);
     return backgroundData.tradition.default[0];
     }

     if(newyear_style == "Hiện Đại"){
        // rẽ luồng, nếu khách chọn tài lộc(chỉ applied vào nữ) thì if else ở đây luôn, if(wishStyle == "wealth" && gender == "female") return backgroundData.modern[wishStyle] something female here
        let temp = gender.toLowerCase()
        if(temp==="female" && wishStyle =="love") return woman_love_bg_fix[Math.floor(Math.random()*3)]
        if(temp=="female" && wishStyle =="wealth") return[",((((wearing elegant trench coat))))<lora:old_money:0.5>, (((full body photoshoot) Paris city landscape with Paris Eiffel Tower very faraway background)),(((cash and money dropping and gold and pile of cash background)(((a lot of money background))) and (old money style),(fashionista, celebrity),((luxury and super rich)),luxury gold gilded necklace, diamond earings and a lot of diamond shining rings with gucci and versace bag)), ((((((full body model photoshoot)) fashionable style with very faraway Paris landscape background)))),",",((((wearing elegant trench coat)))), (((full body photoshoot, travel photography) standing in front of Sydney Harbour Bridge with Sydney Opera House faraway background at the sea )) ,"][Math.floor(Math.random() * 2)];
        
        return backgroundData.modern[wishStyle][Math.floor(Math.random() * backgroundData.modern[wishStyle].length)];
     }

}

const buildClothStylePrompt = (newyear_style,profession,gender) => { 

    let professionStyle = getProfessionCatagory(profession);
    console.log("professionStyle: " + professionStyle);
    if(newyear_style == "Cổ Truyền"){
        let temp = gender.toLowerCase()
        if(temp=="male") return clothData.tradition.default.male[0];
        let femaleLength = clothData.tradition.default.female.length;
        if(temp=="female") return clothData.tradition.default.female[Math.floor(Math.random()* femaleLength)];
        
    }

    if(newyear_style == "Hiện Đại"){
        return clothData.modern[professionStyle][Math.floor(Math.random() * clothData.modern[professionStyle].length)];
    }
}

const getProfessionCatagory = (profession) => {
    if(profession == "Nhân viên văn phòng") return "officer";
    if(profession == "Công nhân") return "worker";
    if(profession == "Kinh doanh tự do") return "seller";
    if(profession == "Công chức nhà nước") return "officer";
    if(profession == "Lao động khác") return "worker";
    if(profession) return "default";
}

// cần trả về 2 nhánh, nhánh 1 tương lai bản thân return random 3 option, nhánh 2 mqh xung quanh là love
// if(wish == "Tương lai của bản thân") return [health,wealth,job].[Math.floor(Math.random() * 3)];
// if(wish == "Mối quan hệ xung quanh") return [love].[Math.floor(Math.random() * 1)];


const getWishCatagory = (wish) => {
    if(wish == "Tình duyên") return "love";
    if(wish == "Sức khỏe") return "health";
    if(wish == "Tài lộc") return "wealth";
    if(wish =="Sự nghiệp") return "job";
    // if(wish =="Gia đạo") return "family";
    if(wish) return "default";
}

module.exports = {buildPrompt, getWishCatagory, getProfessionCatagory};