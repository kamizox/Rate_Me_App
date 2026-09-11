import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Image, ActivityIndicator, Alert  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImageToCloudinary } from '../services/cloudinaryService'; // Aapka function
import { getFirestore, collection, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { COLORS } from '../constant/colors';

const CHALLENGE_TYPES = [
  { id: '1', title: 'A vs B', desc: 'Compare two things', icon: '🅰️', type: 'A_vs_B' },
  { id: '2', title: 'Rate 1–10', desc: 'Let people rate', icon: '⭐', type: 'RATE' },
  { id: '3', title: 'Yes / No', desc: 'Ask a yes or no question', icon: '👍', type: 'YES_NO' },
  { id: '4', title: 'Poll', desc: 'Create a poll', icon: '📊', type: 'POLL' },
  { id: '5', title: 'Guess', desc: 'Let people guess', icon: '❓', type: 'GUESS' },
];

export default function CreateScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);

  // Form States
  const [question, setQuestion] = useState('');
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSelectType = (item) => {
    setSelectedType(item);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType(null);
  };

  // Gallery se image uthane ka function
  const pickImage = async (type) => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets) return;
    
    const uri = result.assets[0].uri;
    if (type === 'A') setImageA(uri);
    else setImageB(uri);
  };

  // Cloudinary + Firestore Publish Logic
  const handlePublish = async () => {
    if (!question || !imageA || !imageB) {
      Alert.alert('Incomplete', 'Please add a question and select both images.');
      return;
    }

    setIsPublishing(true);
    try {
      // 1. Cloudinary par dono images upload karein
      const urlA = await uploadImageToCloudinary(imageA);
      const urlB = await uploadImageToCloudinary(imageB);

      // 2. Current user ki ID nikalein
      const currentUser = getAuth().currentUser;

      // 3. Firestore ke 'challenges' collection mein data save karein
await addDoc(collection(getFirestore(), 'challenges'), {
  type: selectedType.type,
  question: question,
  imageA_URL: urlA,
  imageB_URL: urlB,
  creatorId: currentUser ? currentUser.uid : 'anonymous',
  createdAt: serverTimestamp(),
  voteCountA: 0,
  voteCountB: 0,
  totalVotes: 0,
});

      Alert.alert('Success', 'Challenge Published successfully!');
      
      // Form reset karke Home par bhej dein
      setQuestion('');
      setImageA(null);
      setImageB(null);
      setStep(1);
      navigation.navigate('Home');

    } catch (error) {
      console.log('Publish Error:', error);
      Alert.alert('Error', 'Failed to publish challenge.');
    } finally {
      setIsPublishing(false);
    }
  };

  // --- STEP 1 UI: Type Selection ---
  if (step === 1) {
    return (
      <SafeAreaView  style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Challenge</Text>
        </View>
        <Text style={styles.questionText}>What do you want to ask?</Text>
        <FlatList
          data={CHALLENGE_TYPES}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.typeCard} onPress={() => handleSelectType(item)}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  // --- STEP 2 UI: Form (A vs B) ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={{ fontSize: 24, color: '#000' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create {selectedType?.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>What's your question?</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g., Which outfit looks better?"
          value={question}
          onChangeText={setQuestion}
        />

        <Text style={styles.label}>Add Photos</Text>
        <View style={styles.imageSelectorRow}>
          
          {/* Image A Selector */}
          <TouchableOpacity style={styles.imageBox} onPress={() => pickImage('A')}>
            {imageA ? (
              <Image source={{ uri: imageA }} style={styles.previewImage} />
            ) : (
              <Text style={styles.addPhotoText}>+ Photo A</Text>
            )}
          </TouchableOpacity>

          {/* Image B Selector */}
          <TouchableOpacity style={styles.imageBox} onPress={() => pickImage('B')}>
            {imageB ? (
              <Image source={{ uri: imageB }} style={styles.previewImage} />
            ) : (
              <Text style={styles.addPhotoText}>+ Photo B</Text>
            )}
          </TouchableOpacity>

        </View>

        {/* Publish Button */}
        <TouchableOpacity 
          style={[styles.publishButton, isPublishing && { backgroundColor: '#a5d6a7' }]} 
          onPress={handlePublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.publishButtonText}>Publish</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', flex: 1, textAlign: 'center' },
  
  // Step 1 Styles
  questionText: { fontSize: 22, fontWeight: 'bold', color: '#000', margin: 20 },
  typeCard: { flexDirection: 'row', alignItems: 'center', padding: 15, marginHorizontal: 20, marginBottom: 15, backgroundColor: '#f9f9f9', borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconText: { fontSize: 24 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#666' },

  // Step 2 Styles
  formContainer: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 10, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 15, backgroundColor: '#fafafa', marginBottom: 20 },
  
  imageSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 30 },
  imageBox: { flex: 1, height: 180, backgroundColor: '#f0f0f0', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed' },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  addPhotoText: { color: '#888', fontWeight: 'bold' },

  publishButton: { backgroundColor: COLORS.primary || '#5A9624', padding: 16, borderRadius: 10, alignItems: 'center' },
  publishButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});