const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const getImageAsBase64 = require("./getImageAsBase64");
const {getWishCatagory, getProfessionCatagory} = require("../buildPayload/buildPrompt");
// Note: Convert base 64, lưu file ở đây!!!

async function compositeImages(frame_path = null, person_base64, wish, profession){
    let wishStyle = getWishCatagory(wish);
    let professionStyle = getProfessionCatagory(profession);
    let randomWishOverlay = readRandomWishOverlay(path.join(__dirname, "wish_overlay"),wishStyle,professionStyle)
    //   person_base64 = await getImageAsBase64("https://res.cloudinary.com/doeai8a2u/image/upload/v1702525153/Cookies/image_10.png");

    var framebuf = fs.readFileSync(path.join(__dirname, "Frame_Transparent_Demo.png"));
    const frame = sharp(framebuf);
    const person = sharp(Buffer.from(person_base64, 'base64'));

return new Promise((resolve, reject) => {
    frame.metadata()
    .then(metadata => {
        return person.resize({
            width: metadata.width,
            fit: sharp.fit.inside
        }).toBuffer();
    })
    .then(data => {
        return frame.composite([{
            input: data,
            top: 130,
            left: 0
        },
        {
            input:framebuf,
            top: 0,
            left: 0
         },
         {
            input:randomWishOverlay,
            top:-3,
            left: 0,
            gravity: 'centre'
         }
        ])
        .toBuffer()
    //    .toFile('output.png')
    })
    .then(buf=>{
        let base64 = buf.toString('base64');
        return resolve(base64);
    })
    .catch(err => {
        console.error(err);
        return reject(err);
    });
})
}

function readRandomWishOverlay(dirPath,wishStyle,professionStyle) {
    try {
        // Bỏ wishstyle thì sẽ random trong nhóm profession
        dirPath = path.join(dirPath, professionStyle,wishStyle);
        const files =  fs.readdirSync(dirPath);
        const randomFile = files[Math.floor(Math.random() * files.length)];
        const txtOverlayBuff = fs.readFileSync(path.join(dirPath, randomFile));
        return txtOverlayBuff;
    } catch (error) {
        console.error(error);
    }
}
//   compositeImages("e","","Tình duyên","Nhân viên văn phòng");

module.exports = compositeImages;