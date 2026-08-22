const { cloudinary } = require('../config/cloudinary');

const uploadImage = async (filePath, folder = 'fashion-fusion') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      use_filename: true,
    });
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
