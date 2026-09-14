import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native'
import { getAuth, signOut } from '@react-native-firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, where } from '@react-native-firebase/firestore';
import { COLORS } from '../constant/colors';

const PostCard = ({ item, userVotes, onVote, navigation }) => {
  const isRate = item.type === 'RATE';
  const [creator, setCreator] = useState(null);

  const avgRating = item.totalVotes > 0 && item.ratingSum ? (item.ratingSum / item.totalVotes).toFixed(1) : 0;

  useEffect(() => {
    const fetchCreatorDetails = async () => {
      if (item.creatorId && item.creatorId !== 'anonymous') {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', item.creatorId));
        if (userDoc.exists()) setCreator(userDoc.data());
      }
    };
    fetchCreatorDetails();
  }, [item.creatorId]);

  const total = item.totalVotes || 0;
  const countA = item.voteCountA || 0;
  const countB = item.voteCountB || 0;
  const percentA = total > 0 ? Math.round((countA / total) * 100) : 0;
  const percentB = total > 0 ? Math.round((countB / total) * 100) : 0;
  const hasVoted = userVotes[item.id] !== undefined;
  const selectedOption = userVotes[item.id]; 
  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  // NAYA: Post Type Check
  const isYesNo = item.type === 'YES_NO';

return (
    <View style={styles.postCard}>
      <View style={styles.userInfo}>
        <TouchableOpacity style={styles.userInfo} onPress={() => navigation.navigate('PublicProfile', { userId: item.creatorId })} activeOpacity={0.7}>
          <Image source={{ uri: creator?.profilePic || defaultAvatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{creator ? creator.name : 'Loading...'}</Text>
            {creator?.username && <Text style={styles.usernameHandle}>@{creator.username}</Text>}
          </View>
        </TouchableOpacity>
      </View>
      <Text style={styles.question}>{item.question}</Text>
      
      {/* DYNAMIC POST DESIGN */}
      {isYesNo ? (
        // 1. YES / NO DESIGN
        <View style={styles.singleImageContainer}>
          <Image source={{ uri: item.imageA_URL }} style={styles.singleImage} />
          <View style={styles.yesNoRow}>
            <TouchableOpacity style={[styles.yesButton, hasVoted && selectedOption === 'A' && styles.selectedYes]} onPress={() => !hasVoted && onVote(item.id, 'A', item.creatorId)} activeOpacity={hasVoted ? 1 : 0.7}>
              <Text style={styles.yesNoText}>{hasVoted ? `👍 Yes (${percentA}%)` : '👍 Yes'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.noButton, hasVoted && selectedOption === 'B' && styles.selectedNo]} onPress={() => !hasVoted && onVote(item.id, 'B', item.creatorId)} activeOpacity={hasVoted ? 1 : 0.7}>
              <Text style={styles.yesNoText}>{hasVoted ? `👎 No (${percentB}%)` : '👎 No'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : isRate ? (
        // 2. RATE DESIGN (1 Image, 5 Stars)
        <View style={styles.singleImageContainer}>
          <Image source={{ uri: item.imageA_URL }} style={styles.singleImage} />
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => !hasVoted && onVote(item.id, star, item.creatorId)} activeOpacity={hasVoted ? 1 : 0.7}>
                <Text style={[styles.starIcon, hasVoted && selectedOption >= star ? styles.starSelected : styles.starUnselected]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {hasVoted && <Text style={styles.avgText}>Average Rating: {avgRating} ⭐</Text>}
        </View>
      ) : (
        // 3. A vs B DESIGN (2 Images)
        <View style={styles.imagesRow}>
          <TouchableOpacity style={[styles.imageWrapper, hasVoted && selectedOption === 'A' && styles.selectedBorder]} onPress={() => !hasVoted && onVote(item.id, 'A', item.creatorId)} activeOpacity={hasVoted ? 1 : 0.7}>
            <Image source={{ uri: item.imageA_URL }} style={styles.postImage} />
            {hasVoted ? (
              <View style={styles.resultOverlay}><Text style={styles.percentText}>{percentA}%</Text>{selectedOption === 'A' && <Text style={styles.yourChoiceText}>Your Choice</Text>}</View>
            ) : <View style={styles.voteButton}><Text style={styles.voteButtonText}>Vote A</Text></View>}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.imageWrapper, hasVoted && selectedOption === 'B' && styles.selectedBorder]} onPress={() => !hasVoted && onVote(item.id, 'B', item.creatorId)} activeOpacity={hasVoted ? 1 : 0.7}>
            <Image source={{ uri: item.imageB_URL }} style={styles.postImage} />
            {hasVoted ? (
              <View style={styles.resultOverlay}><Text style={styles.percentText}>{percentB}%</Text>{selectedOption === 'B' && <Text style={styles.yourChoiceText}>Your Choice</Text>}</View>
            ) : <View style={styles.voteButton}><Text style={styles.voteButtonText}>Vote B</Text></View>}
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.totalVotesText}>{total} votes</Text>
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({}); 
  const HOME_CATEGORIES = ['All', 'Fashion', 'Food', 'Travel', 'Fun', 'Sports', 'Tech'];
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const db = getFirestore();
    let q;
    if (activeCategory === 'All') {
      q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'challenges'), where('category', '==', activeCategory), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot) return; 
      const posts = [];
      querySnapshot.forEach((doc) => { posts.push({ id: doc.id, ...doc.data() }); });
      setChallenges(posts);
      setLoading(false);
    }, (error) => {
      console.log('Firestore Query Error:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [activeCategory]); 

  const handleLogout = () => {
    signOut(getAuth()).then(() => console.log('User signed out!'));
  };

  const handleVote = async (challengeId, option, creatorId) => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) return;

    const db = getFirestore();
    const voteRef = doc(db, 'challenges', challengeId, 'votes', currentUser.uid);
    const challengeRef = doc(db, 'challenges', challengeId);

    try {
      const voteDoc = await getDoc(voteRef);
      if (voteDoc.exists()) {
        Alert.alert("Already Voted!", "Aap is challenge par pehle hi vote kar chuke hain.");
        setUserVotes(prev => ({ ...prev, [challengeId]: voteDoc.data().selectedOption }));
        return;
      }

      await setDoc(voteRef, { selectedOption: option, userId: currentUser.uid, votedAt: new Date() });
      let updateData = {};
      if (typeof option === 'number') {
        updateData = { ratingSum: increment(option), totalVotes: increment(1) };
      } else {
        updateData = { [option === 'A' ? 'voteCountA' : 'voteCountB']: increment(1), totalVotes: increment(1) };
      }
      
      await updateDoc(challengeRef, updateData);
      setUserVotes(prev => ({ ...prev, [challengeId]: option }));

      if (creatorId && creatorId !== currentUser.uid && creatorId !== 'anonymous') {
        const currentUserSnap = await getDoc(doc(db, 'users', currentUser.uid));
        const currentUserData = currentUserSnap.data();

        const notifRef = doc(collection(db, `users/${creatorId}/notifications`));
        await setDoc(notifRef, {
          type: 'vote',
          senderId: currentUser.uid,
          senderName: currentUserData?.name || 'Someone',
          senderAvatar: currentUserData?.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          message: `voted on your challenge.`,
          challengeId: challengeId,
          isRead: false,
          createdAt: serverTimestamp()
        });
      }

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
          ListHeaderComponent={
            <View style={{ padding: 15 }}>
              <View style={{ flexDirection: 'row', gap: 20, marginBottom: 15 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.primary || '#5A9624', borderBottomWidth: 2, borderBottomColor: COLORS.primary || '#5A9624', paddingBottom: 5 }}>For You</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#888' }}>Following</Text>
              </View>
              <FlatList 
                horizontal
                showsHorizontalScrollIndicator={false}
                data={HOME_CATEGORIES}
                keyExtractor={(item) => item}
                renderItem={({item}) => (
                  <TouchableOpacity 
                    style={[styles.homeCatBadge, activeCategory === item && styles.homeActiveCatBadge]}
                    onPress={() => setActiveCategory(item)}
                  >
                    <Text style={[styles.homeCatText, activeCategory === item && styles.homeActiveCatText]}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          }
          renderItem={({ item }) => (
            <PostCard item={item} userVotes={userVotes} onVote={handleVote} navigation={navigation} />
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
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 10, backgroundColor: '#eee' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  usernameHandle: { fontSize: 13, color: '#888' }, 
  question: { fontSize: 15, color: '#333', marginBottom: 15, fontWeight: '500' },
  
  // A vs B Styles
  imagesRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  imageWrapper: { flex: 1, position: 'relative', borderRadius: 12, overflow: 'hidden' }, 
  postImage: { width: '100%', height: 220, backgroundColor: '#e0e0e0' },
  voteButton: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  voteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  resultOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  percentText: { color: '#fff', fontSize: 32, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
  yourChoiceText: { color: '#fff', backgroundColor: COLORS.primary || '#5A9624', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: 'bold', marginTop: 10 },
  selectedBorder: { borderWidth: 3, borderColor: COLORS.primary || '#5A9624' },
  
  // NAYA: Yes / No Styles
  singleImageContainer: { width: '100%' },
  singleImage: { width: '100%', height: 250, borderRadius: 12, backgroundColor: '#e0e0e0', marginBottom: 15 },
  yesNoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  yesButton: { flex: 1, backgroundColor: '#f0f0f0', paddingVertical: 12, borderRadius: 25, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  noButton: { flex: 1, backgroundColor: '#f0f0f0', paddingVertical: 12, borderRadius: 25, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  selectedYes: { backgroundColor: '#e8f5e9', borderColor: '#4CAF50' },
  selectedNo: { backgroundColor: '#ffebee', borderColor: '#F44336' },
  yesNoText: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  totalVotesText: { textAlign: 'right', marginTop: 10, color: '#666', fontSize: 13, fontWeight: 'bold' },
  homeCatBadge: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  homeActiveCatBadge: { backgroundColor: COLORS.primary || '#5A9624' },
  homeCatText: { color: '#666', fontWeight: 'bold' },
  homeActiveCatText: { color: '#fff' },
  // RATE Styles
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginVertical: 10 },
  starIcon: { fontSize: 45 },
  starSelected: { color: '#FFD700' }, // Golden color
  starUnselected: { color: '#e0e0e0' }, // Grey color
  avgText: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: COLORS.primary || '#5A9624', marginTop: 5 },
});