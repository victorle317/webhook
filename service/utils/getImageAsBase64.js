const axios = require('axios');
async function getImageAsBase64(url) {
    try {
      // Fetch the image using Axios
      const response = await axios.get(url, {
        responseType: 'arraybuffer', // Get the response as an ArrayBuffer
      });
  
      if (response.status === 200) {
        // Convert the image to base64
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        return base64;
      } else {
        throw new Error('Failed to fetch image');
      }
    } catch (error) {
      throw new Error('Error fetching image: ' + error.message);
    }
  }

module.exports = getImageAsBase64;