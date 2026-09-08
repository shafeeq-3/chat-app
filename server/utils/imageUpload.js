const cloudinary = require('../config/cloudinary');

const uploadImage = async (imageBuffer, folder = 'profile-pictures') => {
    try {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'image',
                    transformation: [
                        { width: 400, height: 400, crop: 'fill' },
                        { quality: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.secure_url);
                    }
                }
            ).end(imageBuffer);
        });
    } catch (error) {
        throw error;
    }
};

const deleteImage = async (imageUrl) => {
    try {
        // Extract public_id from Cloudinary URL
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};

module.exports = {
    uploadImage,
    deleteImage
};
