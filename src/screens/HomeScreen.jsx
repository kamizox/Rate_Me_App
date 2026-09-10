import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { COLORS } from '../constant/colors'; // Aapke colors import kiye

export default function HomeScreen() {
  
  // Logout Function
  const handleLogout = () => {
    signOut(getAuth()).then(() => console.log('User signed out!'));
  };

  return (
    <View style={styles.container}>
      
      {/* 1. TOP HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rate<Text style={{color: COLORS.primary}}>Me</Text></Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
        
        {/* 2. POST CARD */}
        <View style={styles.postCard}>
          
          {/* Profile Section */}
          <View style={styles.userInfo}>
            <Image 
              source={{uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}} 
              style={styles.avatar} 
            />
            <Text style={styles.userName}>Nimra Tariq</Text>
          </View>

          {/* Sawal (Question) */}
          <Text style={styles.question}>Which outfit should I wear for the university event? 🤔</Text>
          {/* 3. IMAGES SIDE-BY-SIDE */}
          <View style={styles.imagesRow}>
            {/* Image A */}
            <TouchableOpacity style={styles.imageWrapper}>
              <Image 
                source={{uri: 'https://images.unsplash.com/photo-1515347619152-140fa851c20f?w=400'}} 
                style={styles.postImage} 
              />
              <View style={styles.voteButton}>
                <Text style={styles.voteButtonText}>Vote A</Text>
              </View>
            </TouchableOpacity>

            {/* Image B */}
            <TouchableOpacity style={styles.imageWrapper}>
              <Image 
                source={{uri: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'}} 
                style={styles.postImage} 
              />
              <View style={styles.voteButton}>
                <Text style={styles.voteButtonText}>Vote B</Text>
              </View>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' }, 
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  logoutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 14 },
  
  postCard: { backgroundColor: '#fff', marginTop: 15, padding: 15, borderRadius: 15, marginHorizontal: 10, elevation: 3 },
  
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  
  question: { fontSize: 15, color: '#333', marginBottom: 15 },
  
  imagesRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  imageWrapper: { flex: 1, position: 'relative' }, 
  postImage: { width: '100%', height: 220, borderRadius: 10 },
  
  voteButton: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  voteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});