const { cloudinary } = require('../config/cloudinary');

const uploadImage = async (imageData, folder = 'fashion-fusion') => {
  try {
    const isBase64 = typeof imageData === 'string' && !imageData.startsWith('http');
    const result = await cloudinary.uploader.upload(
      imageData,
      {
        folder,
        use_filename: true,
        ...(isBase64 ? { resource_type: 'auto' } : {}),
      }
    );
    return result;
  } catch (error) {
    throw new Error('Image upload failed');
  }
};

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error('Image deletion failed');
  }
};

module.exports = { uploadImage, deleteImage };