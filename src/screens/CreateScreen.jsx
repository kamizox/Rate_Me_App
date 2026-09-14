import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Image, ActivityIndicator, Alert  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImageToCloudinary } from '../services/cloudinaryService'; 
import { getFirestore, collection, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { COLORS } from '../constant/colors';

const CHALLENGE_TYPES = [
  { id: '1', title: 'A vs B', desc: 'Compare two things', icon: require('../assets/icons/testing.png'), type: 'A_vs_B' },
  { id: '2', title: 'Rate 1–10', desc: 'Let people rate', icon: require('../assets/icons/rating.png'), type: 'RATE' },
  { id: '3', title: 'Yes / No', desc: 'Ask a yes or no question', icon: require('../assets/icons/score.png'), type: 'YES_NO' },
  { id: '4', title: 'Poll', desc: 'Create a poll', icon: require('../assets/icons/polling.png'), type: 'POLL' },
  { id: '5', title: 'Guess', desc: 'Let people guess', icon: require('../assets/icons/guess.png'), type: 'GUESS' },
];

export default function CreateScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [question, setQuestion] = useState('');
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const CATEGORIES = ['Fashion', 'Food', 'Travel', 'Fun', 'Sports', 'Tech'];
  const [selectedCategory, setSelectedCategory] = useState('Fashion'); 

  const handleSelectType = (item) => {
    setSelectedType(item);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType(null);
  };

  const pickImage = async (type) => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets) return;
    const uri = result.assets[0].uri;
    if (type === 'A') setImageA(uri);
    else setImageB(uri);
  };

  const handlePublish = async () => {
    // NAYA: Type ke hisaab se validation
    const isAvsB = selectedType.type === 'A_vs_B';
    
    if (!question || !imageA || (isAvsB && !imageB)) {
      Alert.alert('Incomplete', 'Please add a question and required photos.');
      return;
    }

    setIsPublishing(true);
    try {
      const urlA = await uploadImageToCloudinary(imageA);
      // Agar type A vs B nahi hai tou doosri pic null jayegi
      const urlB = isAvsB ? await uploadImageToCloudinary(imageB) : null;
      const currentUser = getAuth().currentUser;

      await addDoc(collection(getFirestore(), 'challenges'), {
        type: selectedType.type,
        question: question,
        category: selectedCategory,
        imageA_URL: urlA,
        imageB_URL: urlB,
        creatorId: currentUser ? currentUser.uid : 'anonymous',
        createdAt: serverTimestamp(),
        voteCountA: 0,
        voteCountB: 0,
        totalVotes: 0,
      });

      Alert.alert('Success', 'Challenge Published successfully!');
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
                <Image source={item.icon} style={styles.customIcon} />
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

  // --- STEP 2 UI ---
  const isAvsB = selectedType?.type === 'A_vs_B';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}><Text style={{ fontSize: 24, color: '#000' }}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Create {selectedType?.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>What's your question?</Text>
        <TextInput style={styles.input} placeholder="e.g., Which outfit looks better?" placeholderTextColor="#666666" value={question} onChangeText={setQuestion}/>
        
        <Text style={styles.label}>Category</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.catBadge, selectedCategory === cat && styles.activeCatBadge]} onPress={() => setSelectedCategory(cat)}>
              <Text style={[styles.catText, selectedCategory === cat && styles.activeCatText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Add Photo{isAvsB ? 's' : ''}</Text>
        <View style={styles.imageSelectorRow}>
          {/* NAYA: Agar A vs B nahi hai tou 1 photo 100% width par dikhao */}
          <TouchableOpacity style={[styles.imageBox, !isAvsB && { width: '100%' }]} onPress={() => pickImage('A')}>
            {imageA ? <Image source={{ uri: imageA }} style={styles.previewImage} /> : <Text style={styles.addPhotoText}>+ Photo {isAvsB ? 'A' : ''}</Text>}
          </TouchableOpacity>

          {isAvsB && (
            <TouchableOpacity style={styles.imageBox} onPress={() => pickImage('B')}>
              {imageB ? <Image source={{ uri: imageB }} style={styles.previewImage} /> : <Text style={styles.addPhotoText}>+ Photo B</Text>}
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={[styles.publishButton, isPublishing && { backgroundColor: '#a5d6a7' }]} onPress={handlePublish} disabled={isPublishing}>
          {isPublishing ? <ActivityIndicator color="#fff" /> : <Text style={styles.publishButtonText}>Publish</Text>}
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
  questionText: { fontSize: 22, fontWeight: 'bold', color: '#000', margin: 20 },
  typeCard: { flexDirection: 'row', alignItems: 'center', padding: 15, marginHorizontal: 20, marginBottom: 15, backgroundColor: '#f9f9f9', borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  customIcon: { width: 38, height: 38, resizeMode: 'contain' }, 
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#666' },
  formContainer: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 10, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 15, backgroundColor: '#f5f1f1', marginBottom: 20, color: '#000' },
  catBadge: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  activeCatBadge: { backgroundColor: COLORS.primary || '#5A9624', borderColor: COLORS.primary || '#5A9624' },
  catText: { color: '#666', fontWeight: 'bold' },
  activeCatText: { color: '#fff' },
  imageSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 30 },
  imageBox: { flex: 1, height: 180, backgroundColor: '#f0f0f0', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed' },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  addPhotoText: { color: '#888', fontWeight: 'bold' },
  publishButton: { backgroundColor: COLORS.primary || '#5A9624', padding: 16, borderRadius: 10, alignItems: 'center' },
  publishButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});