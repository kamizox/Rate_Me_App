import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, updateDoc, increment } from '@react-native-firebase/firestore';
import { COLORS } from '../constant/colors';

// ==========================================
// 1. NAYA COMPONENT: POST CARD (User Info Fetcher)
// ==========================================
const PostCard = ({ item, userVotes, onVote }) => {
  const [creator, setCreator] = useState(null);

  // Jab post load ho, uske creator ki details Firebase 'users' table se mangwao
  useEffect(() => {
    const fetchCreatorDetails = async () => {
      if (item.creatorId && item.creatorId !== 'anonymous') {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', item.creatorId));
        if (userDoc.exists()) {
          setCreator(userDoc.data());
        }
      }
    };
    fetchCreatorDetails();
  }, [item.creatorId]);

  // Voting Math
  const total = item.totalVotes || 0;
  const countA = item.voteCountA || 0;
  const countB = item.voteCountB || 0;
  const percentA = total > 0 ? Math.round((countA / total) * 100) : 0;
  const percentB = total > 0 ? Math.round((countB / total) * 100) : 0;

  const hasVoted = userVotes[item.id] !== undefined;
  const selectedOption = userVotes[item.id]; 

  // Agar database me profile pic nahi hai tou yeh default image dikhao
  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  return (
    <View style={styles.postCard}>
      
      {/* NAYA: REAL USER INFO SECTION */}
      <View style={styles.userInfo}>
        <Image 
          source={{ uri: creator?.profilePic || defaultAvatar }} 
          style={styles.avatar} 
        />
        <View>
          <Text style={styles.userName}>{creator ? creator.name : 'Loading...'}</Text>
          {creator?.username && <Text style={styles.usernameHandle}>@{creator.username}</Text>}
        </View>
      </View>

      <Text style={styles.question}>{item.question}</Text>

      <View style={styles.imagesRow}>
        {/* Image A */}
        <TouchableOpacity 
          style={[styles.imageWrapper, hasVoted && selectedOption === 'A' && styles.selectedBorder]} 
          onPress={() => !hasVoted && onVote(item.id, 'A')}
          activeOpacity={hasVoted ? 1 : 0.7}
        >
          <Image source={{ uri: item.imageA_URL }} style={styles.postImage} />
          {hasVoted ? (
            <View style={styles.resultOverlay}>
              <Text style={styles.percentText}>{percentA}%</Text>
              {selectedOption === 'A' && <Text style={styles.yourChoiceText}>Your Choice</Text>}
            </View>
          ) : (
            <View style={styles.voteButton}>
              <Text style={styles.voteButtonText}>Vote A</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Image B */}
        <TouchableOpacity 
          style={[styles.imageWrapper, hasVoted && selectedOption === 'B' && styles.selectedBorder]} 
          onPress={() => !hasVoted && onVote(item.id, 'B')}
          activeOpacity={hasVoted ? 1 : 0.7}
        >
          <Image source={{ uri: item.imageB_URL }} style={styles.postImage} />
          {hasVoted ? (
            <View style={styles.resultOverlay}>
              <Text style={styles.percentText}>{percentB}%</Text>
              {selectedOption === 'B' && <Text style={styles.yourChoiceText}>Your Choice</Text>}
            </View>
          ) : (
            <View style={styles.voteButton}>
              <Text style={styles.voteButtonText}>Vote B</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.totalVotesText}>{total} votes</Text>
    </View>
  );
};


// ==========================================
// 2. MAIN HOME SCREEN
// ==========================================
export default function HomeScreen() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({}); 

  useEffect(() => {
    const db = getFirestore();
    const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() }); 
      });
      setChallenges(posts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(getAuth()).then(() => console.log('User signed out!'));
  };

  const handleVote = async (challengeId, option) => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) return;

    const db = getFirestore();
    const voteRef = doc(db, 'challenges', challengeId, 'votes', currentUser.uid);
    const challengeRef = doc(db, 'challenges', challengeId);

    try {
      const voteDoc = await getDoc(voteRef);
      if (voteDoc.exists()) {
        Alert.alert("Already Voted!", "You have already voted on this challenge.");
        setUserVotes(prev => ({ ...prev, [challengeId]: voteDoc.data().selectedOption }));
        return;
      }

      await setDoc(voteRef, {
        selectedOption: option,
        userId: currentUser.uid,
        votedAt: new Date()
      });

      await updateDoc(challengeRef, {
        [option === 'A' ? 'voteCountA' : 'voteCountB']: increment(1),
        totalVotes: increment(1)
      });

      setUserVotes(prev => ({ ...prev, [challengeId]: option }));
    } catch (error) {
      console.log('Voting Error:', error);
      Alert.alert('Error', 'Vote save nahi ho saka. Internet check karein.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rate<Text style={{color: COLORS.primary}}>Me</Text></Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          // Yahan humne apna naya PostCard component laga diya hai
          renderItem={({ item }) => (
            <PostCard item={item} userVotes={userVotes} onVote={handleVote} />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No challenges found. Create one!</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' }, 
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  logoutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 14 },
  
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },

  postCard: { backgroundColor: '#fff', marginTop: 15, padding: 15, borderRadius: 15, marginHorizontal: 10, elevation: 3 },
  
  // USER INFO STYLING
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 10, backgroundColor: '#eee' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  usernameHandle: { fontSize: 13, color: '#888' }, // @test_user dikhane ke liye
  
  question: { fontSize: 15, color: '#333', marginBottom: 15, fontWeight: '500' },
  
  imagesRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  imageWrapper: { flex: 1, position: 'relative', borderRadius: 12, overflow: 'hidden' }, 
  postImage: { width: '100%', height: 220, backgroundColor: '#e0e0e0' },
  
  voteButton: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  voteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  totalVotesText: { textAlign: 'right', marginTop: 10, color: '#666', fontSize: 13, fontWeight: 'bold' },

  resultOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  percentText: { color: '#fff', fontSize: 32, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
  yourChoiceText: { color: '#fff', backgroundColor: COLORS.primary || '#5A9624', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: 'bold', marginTop: 10 },
  selectedBorder: { borderWidth: 3, borderColor: COLORS.primary || '#5A9624' }
});