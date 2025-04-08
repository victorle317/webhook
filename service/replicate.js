const Replicate = require("replicate");


const replicate = new Replicate({
    // get your token from https://replicate.com/account/api-tokens
    auth: process.env.REPLICATE_API_TOKEN, // defaults to process.env.REPLICATE_API_TOKEN
});

module.exports = replicate;
