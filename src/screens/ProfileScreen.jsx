import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc } from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImageToCloudinary } from '../services/cloudinaryService'; // Cloudinary function
import { COLORS } from '../constant/colors';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Created');

  // --- EDIT PROFILE STATES ---
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editProfilePic, setEditProfilePic] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        const q = query(collection(db, 'challenges'), where('creatorId', '==', currentUser.uid));
        const postSnapshot = await getDocs(q);
        
        const posts = [];
        postSnapshot.forEach((doc) => {
          posts.push({ id: doc.id, ...doc.data() });
        });
        
        posts.sort((a, b) => b.createdAt - a.createdAt);
        setUserPosts(posts);
      } catch (error) {
        console.log("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser]);

  const handleLogout = () => {
    signOut(auth).then(() => console.log('User signed out!'));
  };

  // --- NAYE FUNCTIONS: EDIT PROFILE ---
  const openEditModal = () => {
    setEditName(userData?.name || '');
    setEditBio(userData?.bio || '');
    setEditProfilePic(userData?.profilePic || null);
    setEditModalVisible(true);
  };

  const pickProfileImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.5 });
    if (!result.didCancel && result.assets) {
      setEditProfilePic(result.assets[0].uri); // Local image save ki
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      let newPicUrl = userData?.profilePic; // Default purani pic

      // Agar user ne nayi picture select ki hai (yani URL 'http' se start nahi ho raha)
      if (editProfilePic && !editProfilePic.startsWith('http')) {
        newPicUrl = await uploadImageToCloudinary(editProfilePic);
      }

      // Firebase me Update karna
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: editName,
        bio: editBio,
        profilePic: newPicUrl || null,
      });

      // App ki screen par bhi naya data foran dikhana
      setUserData(prev => ({ ...prev, name: editName, bio: editBio, profilePic: newPicUrl }));
      setEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");

    } catch (error) {
      console.log("Update Error:", error);
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStat = (value, label) => (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderGridPost = ({ item }) => (
    <TouchableOpacity style={styles.gridPost}>
      <Image source={{ uri: item.imageA_URL }} style={styles.gridImage} />
      <View style={styles.gridOverlay}>
        <Text style={styles.gridVotes}>👍 {item.totalVotes || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary || '#5A9624'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'Created' ? userPosts : []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.profileSection}>
              <Image 
                source={{ uri: userData?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
                style={styles.profileImage} 
              />
              <Text style={styles.nameText}>{userData?.name || 'Loading...'}</Text>
              <Text style={styles.usernameText}>@{userData?.username || 'user'}</Text>
              <Text style={styles.bioText}>{userData?.bio || 'Add a bio to your profile ✍️'}</Text>

              {/* NAYA: Edit Profile Button */}
              <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              {renderStat(userData?.followersCount || 0, 'Followers')}
              {renderStat(0, 'Following')}
              {renderStat(userData?.avgRating || 0, 'Avg Rating')}
            </View>

            <View style={styles.tabsContainer}>
              {['Created', 'Saved', 'Achievements'].map((tab) => (
                <TouchableOpacity 
                  key={tab} 
                  style={[styles.tabButton, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        renderItem={renderGridPost}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'Created' ? "You haven't created any challenges yet." : `Nothing in ${activeTab} yet.`}
          </Text>
        }
      />

      {/* ==========================================
          EDIT PROFILE MODAL (Pop-up Form)
          ========================================== */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <Text style={styles.modalTitle}>Edit Profile</Text>

            {/* Profile Picture Change */}
            <TouchableOpacity onPress={pickProfileImage} style={styles.imageEditContainer}>
              <Image 
                source={{ uri: editProfilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
                style={styles.modalProfileImage} 
              />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Name</Text>
            <TextInput 
              style={styles.input} 
              value={editName} 
              onChangeText={setEditName} 
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              value={editBio} 
              onChangeText={setEditBio} 
              multiline 
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... Purane styles waise hi hain ...
  container: { flex: 1, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  logoutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 14 },

  profileSection: { alignItems: 'center', marginTop: 20, paddingHorizontal: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee', marginBottom: 10 },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  usernameText: { fontSize: 15, color: '#5A9624', fontWeight: '600', marginBottom: 5 },
  bioText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 5 },

  // NAYA: Edit Button Style
  editButton: { marginTop: 15, paddingHorizontal: 20, paddingVertical: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 20 },
  editButtonText: { color: '#333', fontWeight: 'bold', fontSize: 13 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 25, paddingHorizontal: 10 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  statLabel: { fontSize: 13, color: '#888', marginTop: 2 },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tabButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#5A9624' },
  tabText: { fontSize: 14, color: '#888', fontWeight: '600' },
  activeTabText: { color: '#5A9624' },

  gridPost: { width: width / 2, height: width / 2, padding: 1 },
  gridImage: { width: '100%', height: '100%', backgroundColor: '#eee' },
  gridOverlay: { position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  gridVotes: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 14 },

  // NAYA: Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 20 },
  
  imageEditContainer: { alignItems: 'center', marginBottom: 20 },
  modalProfileImage: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#eee' },
  changePhotoText: { color: '#5A9624', fontWeight: 'bold', marginTop: 10 },
  
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fafafa', marginBottom: 15, color: '#000' },
  
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelButton: { flex: 1, padding: 15, alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 10, marginRight: 10 },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
  saveButton: { flex: 1, padding: 15, alignItems: 'center', backgroundColor: '#5A9624', borderRadius: 10, marginLeft: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});