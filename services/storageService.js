const AWS = require('aws-sdk');
const https = require('https');

// Configure the DigitalOcean Spaces endpoint
const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    credentials: {
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET,
    },
    region: process.env.SPACES_REGION || 'sgp1'
});

/**
 * Downloads an image from a URL and uploads it to DigitalOcean Spaces
 * @param {string} imageUrl - The URL of the image to download
 * @param {string} predictionId - The prediction ID to use in the filename
 * @returns {Promise<string>} - The URL of the uploaded file in Spaces
 */
const saveOutputToSpaces = async (imageUrl, predictionId) => {
    try {
        // Download the image
        const imageBuffer = await downloadImage(imageUrl);

        // Generate a unique filename
        const timestamp = Date.now();
        const filename = `predictions/${predictionId}-${timestamp}.png`;

        // Upload parameters
        const uploadParams = {
            Bucket: process.env.SPACES_BUCKET,
            Key: filename,
            Body: imageBuffer,
            ContentType: 'image/png',
            ACL: 'public-read' // Make the file publicly accessible
        };

        // Upload to Spaces
        await s3.upload(uploadParams).promise();

        // Construct the public URL correctly
        const publicUrl = `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_ENDPOINT.replace('https://', '')}/${filename}`;
        return publicUrl;

    } catch (error) {
        console.error('Error saving file to Spaces:', error);
        throw error;
    }
};

/**
 * Helper function to download an image from a URL
 * @param {string} url - The URL to download from
 * @returns {Promise<Buffer>} - The downloaded image as a buffer
 */
const downloadImage = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
};

module.exports = {
    saveOutputToSpaces
}; 