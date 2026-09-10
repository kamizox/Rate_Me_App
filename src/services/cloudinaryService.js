export const uploadImageToCloudinary = async (imageUri) => {
  const CLOUD_NAME = 'kbss0jyk';
  const UPLOAD_PRESET = 'rateme_uploads';

  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url; // This URL will be save in firestore
};