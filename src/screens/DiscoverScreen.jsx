import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from '@react-native-firebase/auth';
// NAYA: serverTimestamp import kiya hai
import { getFirestore, collection, query, orderBy, limit, getDocs, where, doc, getDoc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } from '@react-native-firebase/firestore';
import { COLORS } from '../constant/colors';

export default function DiscoverScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    fetchDiscoverData();
    fetchFollowingData();
  }, []);

  const fetchFollowingData = async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) return;
    const db = getFirestore();
    try {
      const snap = await getDocs(collection(db, `users/${currentUser.uid}/following`));
      const map = {};
      snap.forEach(doc => { map[doc.id] = true; });
      setFollowingMap(map);
    } catch (error) { console.log(error); }
  };

  const fetchDiscoverData = async () => {
    const db = getFirestore();
    try {
      const creatorsQ = query(collection(db, 'users'), orderBy('followersCount', 'desc'), limit(5));
      const creatorsSnap = await getDocs(creatorsQ);
      setTopCreators(creatorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const trendingQ = query(collection(db, 'challenges'), orderBy('totalVotes', 'desc'), limit(10));
      const trendingSnap = await getDocs(trendingQ);
      setTrending(trendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.log(error); } finally { setLoading(false); }
  };

  const handleSearch = async (text) => {
    const lowerText = text.toLowerCase();
    setSearchQuery(lowerText);
    if (lowerText.length === 0) { setSearchResults([]); return; }
    
    setSearching(true);
    const db = getFirestore();
    try {
      const q = query(collection(db, 'users'), where('username', '>=', lowerText), where('username', '<=', lowerText + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      setSearchResults(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.log(error); } finally { setSearching(false); }
  };

  // --- UPDATED FOLLOW LOGIC (WITH NOTIFICATION) ---
  const handleFollowToggle = async (targetUserId) => {
    const currentUser = getAuth().currentUser;
    if (!currentUser || currentUser.uid === targetUserId) return;

    const db = getFirestore();
    const followingRef = doc(db, `users/${currentUser.uid}/following`, targetUserId);
    const targetUserRef = doc(db, 'users', targetUserId);
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const isFollowing = followingMap[targetUserId];

    try {
      if (isFollowing) {
        await deleteDoc(followingRef);
        await updateDoc(currentUserRef, { followingCount: increment(-1) });
        await updateDoc(targetUserRef, { followersCount: increment(-1) });
        setFollowingMap(prev => ({ ...prev, [targetUserId]: false }));
      } else {
        await setDoc(followingRef, { followedAt: new Date() });
        await updateDoc(currentUserRef, { followingCount: increment(1) });
        await updateDoc(targetUserRef, { followersCount: increment(1) });
        setFollowingMap(prev => ({ ...prev, [targetUserId]: true }));

        // 🔔 NOTIFICATION BHEJNE KA JADU
        const currentUserSnap = await getDoc(currentUserRef);
        const currentUserData = currentUserSnap.data();

        const notifRef = doc(collection(db, `users/${targetUserId}/notifications`));
        await setDoc(notifRef, {
          type: 'follow',
          senderId: currentUser.uid,
          senderName: currentUserData.name || 'Someone',
          senderAvatar: currentUserData.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          message: 'started following you.',
          isRead: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) { console.log(error); }
  };

  const renderUserCard = ({ item }) => {
    const isFollowing = followingMap[item.id];
    return (
      <View style={styles.userCard}>
        <Image source={{ uri: item.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userHandle}>@{item.username}</Text>
        </View>
        <TouchableOpacity style={[styles.followButton, isFollowing && styles.followingButton]} onPress={() => handleFollowToggle(item.id)}>
          <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>{isFollowing ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTrendingPost = ({ item }) => (
    <TouchableOpacity style={styles.trendingCard}>
      <Image source={{ uri: item.imageA_URL }} style={styles.trendingImage} />
      <View style={styles.trendingOverlay}>
        <Text style={styles.trendingQuestion} numberOfLines={2}>{item.question}</Text>
        <Text style={styles.trendingVotes}>🔥 {item.totalVotes || 0} Votes</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <SafeAreaView style={styles.loaderContainer}><ActivityIndicator size="large" color={COLORS.primary} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Search users by @username..." value={searchQuery} onChangeText={handleSearch} autoCapitalize="none" />
        </View>
      </View>

      {searchQuery.length > 0 ? (
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searching ? <ActivityIndicator size="small" color={COLORS.primary} style={{marginTop: 20}}/> : (
            <FlatList data={searchResults} keyExtractor={(item) => item.id} renderItem={renderUserCard} ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>} />
          )}
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.contentContainer}>
              <Text style={styles.sectionTitle}>Top Creators 🌟</Text>
              <FlatList horizontal showsHorizontalScrollIndicator={false} data={topCreators} keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.topCreatorCard}>
                    <Image source={{ uri: item.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.topCreatorAvatar} />
                    <Text style={styles.topCreatorName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.topCreatorHandle}>@{item.username}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No creators yet.</Text>}
              />
              <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Trending Challenges 🔥</Text>
            </View>
          }
          data={trending} keyExtractor={(item) => item.id} renderItem={renderTrendingPost} ListEmptyComponent={<Text style={styles.emptyText}>No trending challenges yet.</Text>} contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 12, height: 45 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#000' },
  contentContainer: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 20 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', marginRight: 15 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  userHandle: { fontSize: 14, color: '#5A9624', marginTop: 2 },
  followButton: { backgroundColor: COLORS.primary || '#5A9624', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary || '#5A9624' },
  followButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  followingButton: { backgroundColor: '#fff', borderColor: '#ccc' },
  followingButtonText: { color: '#333' },
  topCreatorCard: { alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginRight: 15, width: 110, elevation: 1 },
  topCreatorAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee', marginBottom: 10 },
  topCreatorName: { fontSize: 14, fontWeight: 'bold', color: '#000', textAlign: 'center' },
  topCreatorHandle: { fontSize: 12, color: '#888', marginTop: 2 },
  trendingCard: { marginHorizontal: 15, marginBottom: 15, borderRadius: 15, overflow: 'hidden', height: 200, backgroundColor: '#eee', elevation: 2 },
  trendingImage: { width: '100%', height: '100%' },
  trendingOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 15 },
  trendingQuestion: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  trendingVotes: { color: '#FFD700', fontSize: 13, fontWeight: 'bold' }
});