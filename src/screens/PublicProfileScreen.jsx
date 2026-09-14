import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, updateDoc, increment, setDoc, deleteDoc, onSnapshot, serverTimestamp } from '@react-native-firebase/firestore';
import { COLORS } from '../constant/colors';

const { width } = Dimensions.get('window');

export default function PublicProfileScreen({ route, navigation }) {
  const { userId } = route.params; 
  
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!userId) return;

    const unsubscribeUser = onSnapshot(doc(db, 'users', userId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setUserData(docSnapshot.data());
      }
    });

    const q = query(collection(db, 'challenges'), where('creatorId', '==', userId));
    const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      posts.sort((a, b) => b.createdAt - a.createdAt);
      setUserPosts(posts);
      setLoading(false);
    });

    const checkFollowing = async () => {
      if (!currentUser) return;
      const followingRef = doc(db, `users/${currentUser.uid}/following`, userId);
      const followingSnap = await getDoc(followingRef);
      setIsFollowing(followingSnap.exists());
    };
    checkFollowing();

    return () => {
      unsubscribeUser();
      unsubscribePosts();
    };
  }, [userId, currentUser, db]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    if (currentUser.uid === userId) return; 

    const followingRef = doc(db, `users/${currentUser.uid}/following`, userId);
    const followerRef = doc(db, `users/${userId}/followers`, currentUser.uid); // NAYA
    const targetUserRef = doc(db, 'users', userId);
    const currentUserRef = doc(db, 'users', currentUser.uid);

    try {
      if (isFollowing) {
        // UNFOLLOW
        await deleteDoc(followingRef);
        await deleteDoc(followerRef); // NAYA
        await updateDoc(currentUserRef, { followingCount: increment(-1) });
        await updateDoc(targetUserRef, { followersCount: increment(-1) });
        setIsFollowing(false);
      } else {
        // FOLLOW
        await setDoc(followingRef, { followedAt: new Date() });
        await setDoc(followerRef, { followedAt: new Date() }); // NAYA
        await updateDoc(currentUserRef, { followingCount: increment(1) });
        await updateDoc(targetUserRef, { followersCount: increment(1) });
        setIsFollowing(true);

        // NOTIFICATION
        const currentUserSnap = await getDoc(currentUserRef);
        const currentUserData = currentUserSnap.data();
        const notifRef = doc(collection(db, `users/${userId}/notifications`));
        
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
    } catch (error) {
      console.log("Follow toggle error: ", error);
      Alert.alert("Error", "Could not complete action.");
    }
  };

  // NAYA: Clickable Stats Function Yahan Hai
  const renderStat = (value, label, type) => (
    <TouchableOpacity 
      style={styles.statBox} 
      onPress={() => {
        if (type === 'followers' || type === 'following') {
          navigation.navigate('FollowList', { userId: userId, type: type });
        }
      }}
      disabled={type === 'rating'} 
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
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

  const isOwnProfile = currentUser?.uid === userId;

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userData?.username || 'Profile'}</Text>
        <View style={{ width: 30 }} /> 
      </View>

      <FlatList
        data={userPosts}
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
              <Text style={styles.bioText}>{userData?.bio || 'No bio yet.'}</Text>

              {!isOwnProfile && (
                <TouchableOpacity 
                  style={[styles.followButton, isFollowing && styles.followingButton]} 
                  onPress={handleFollowToggle}
                >
                  <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* NAYA: Stats Container Jisme 3no Stats Call Ho Rahe Hain */}
            <View style={styles.statsContainer}>
              {renderStat(userData?.followersCount || 0, 'Followers', 'followers')}
              {renderStat(userData?.followingCount || 0, 'Following', 'following')}
              {renderStat(userData?.avgRating || 0, 'Avg Rating', 'rating')}
            </View>

            <View style={styles.divider} />
          </>
        }
        renderItem={renderGridPost}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No challenges created yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { padding: 5 },
  backIcon: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },

  profileSection: { alignItems: 'center', marginTop: 20, paddingHorizontal: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee', marginBottom: 10 },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  usernameText: { fontSize: 15, color: '#5A9624', fontWeight: '600', marginBottom: 5 },
  bioText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },

  followButton: { marginTop: 15, backgroundColor: COLORS.primary || '#5A9624', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: COLORS.primary || '#5A9624' },
  followButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  followingButton: { backgroundColor: '#fff', borderColor: '#ccc' },
  followingButtonText: { color: '#333' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 25, paddingHorizontal: 10 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  statLabel: { fontSize: 13, color: '#888', marginTop: 2 },

  divider: { height: 1, backgroundColor: '#eee', marginBottom: 5 },

  gridPost: { width: width / 2, height: width / 2, padding: 1 },
  gridImage: { width: '100%', height: '100%', backgroundColor: '#eee' },
  gridOverlay: { position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  gridVotes: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 14 }
});