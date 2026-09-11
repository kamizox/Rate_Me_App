import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy } from '@react-native-firebase/firestore';
import { COLORS } from '../constant/colors';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Created'); // Tabs ke liye

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  // Firebase se User ki details aur uski banayi hui posts mangwana
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) return;

      try {
        // 1. User ka Data (Name, Username, Followers)
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // 2. User ki apni Posts (Challenges)
        const q = query(
          collection(db, 'challenges'), 
          where('creatorId', '==', currentUser.uid)
        );
        const postSnapshot = await getDocs(q);
        
        const posts = [];
        postSnapshot.forEach((doc) => {
          posts.push({ id: doc.id, ...doc.data() });
        });
        
        // Latest posts upar dikhane ke liye sort karna
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

  // Profile ke stats (Followers etc.) draw karne ka chota function
  const renderStat = (value, label) => (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // User ki posts ko Grid (2 columns) mein dikhana
  const renderGridPost = ({ item }) => (
    <TouchableOpacity style={styles.gridPost}>
      {/* Hum sirf Image A dikhayenge thumbnail ke tor par */}
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
      
      {/* TOP HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'Created' ? userPosts : []} // Abhi sirf Created tab par data hai
        keyExtractor={(item) => item.id}
        numColumns={2} // Instagram jaisi Grid
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* PROFILE INFO */}
            <View style={styles.profileSection}>
              <Image 
                source={{ uri: userData?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
                style={styles.profileImage} 
              />
              <Text style={styles.nameText}>{userData?.name || 'Loading...'}</Text>
              <Text style={styles.usernameText}>@{userData?.username || 'user'}</Text>
              
              <Text style={styles.bioText}>App Developer & Tech Enthusiast 💻</Text>
            </View>

            {/* STATS SECTION */}
            <View style={styles.statsContainer}>
              {renderStat(userData?.followersCount || 0, 'Followers')}
              {renderStat(0, 'Following')}
              {renderStat(userData?.avgRating || 0, 'Avg Rating')}
            </View>

            {/* TABS SECTION */}
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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 25, paddingHorizontal: 10 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  statLabel: { fontSize: 13, color: '#888', marginTop: 2 },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tabButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#5A9624' },
  tabText: { fontSize: 14, color: '#888', fontWeight: '600' },
  activeTabText: { color: '#5A9624' },

  // Grid Styles
  gridPost: { width: width / 2, height: width / 2, padding: 1 },
  gridImage: { width: '100%', height: '100%', backgroundColor: '#eee' },
  gridOverlay: { position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  gridVotes: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  emptyText: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 14 }
});