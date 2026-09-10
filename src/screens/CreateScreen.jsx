import { View, Text, TouchableOpacity } from 'react-native';
import React, {useState,useEffect} from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImageToCloudinary } from '../services/cloudinaryService';

export default function CreateScreen() {
  const [imageUrl, setImageUrl] = useState(null);
const [uploading, setUploading] = useState(false);

const pickAndUploadImage = async () => {
  const result = await launchImageLibrary({ mediaType: 'photo' });

  if (result.didCancel || !result.assets) return;

  const localUri = result.assets[0].uri;
  setUploading(true);

  try {
    const uploadedUrl = await uploadImageToCloudinary(localUri);
    setImageUrl(uploadedUrl);
    console.log('Uploaded! URL:', uploadedUrl);
  } catch (error) {
    console.log('Upload Error:', error);
  } finally {
    setUploading(false);
  }
};
return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Create Screen 🔍</Text>

    <TouchableOpacity onPress={pickAndUploadImage} style={{ marginTop: 20, backgroundColor: '#4CAF50', padding: 12, borderRadius: 8 }}>
      <Text style={{ color: '#fff' }}>{uploading ? 'Uploading...' : 'Pick & Upload Image'}</Text>
    </TouchableOpacity>
  </View>
);
}