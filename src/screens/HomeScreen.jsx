import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, ActivityIndicator, Alert, TextInput, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, getDoc, getDocs, setDoc, updateDoc, increment, serverTimestamp, where, deleteDoc } from '@react-native-firebase/firestore';
import { COLORS } from '../constant/colors';

const PostCard = ({ item, userVotes, onVote, navigation }) => {
  const [creator, setCreator] = useState(null);
  const [guessInput, setGuessInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  
  const currentUser = getAuth().currentUser;
  const isOwner = currentUser?.uid === item.creatorId;

  // POST TYPES
  const isYesNo = item.type === 'YES_NO';
  const isRate = item.type === 'RATE';
  const isPoll = item.type === 'POLL';
  const isGuess = item.type === 'GUESS'; 

  const avgRating = item.totalVotes > 0 && item.ratingSum ? (item.ratingSum / item.totalVotes).toFixed(1) : 0;

  useEffect(() => {
    const db = getFirestore();
    
    // Creator ki details mangwana
    const fetchCreatorDetails = async () => {
      if (item.creatorId && item.creatorId !== 'anonymous') {
        const userDoc = await getDoc(doc(db, 'users', item.creatorId));
        if (userDoc.exists()) setCreator(userDoc.data());
      }
    };
    
    // Check karna ke current user ne yeh post save ki hui hai ya nahi
    const checkSavedStatus = async () => {
      if (!currentUser) return;
      const savedRef = doc(db, `users/${currentUser.uid}/savedChallenges`, item.id);
      const savedSnap = await getDoc(savedRef);
      setIsSaved(savedSnap.exists());
    };

    fetchCreatorDetails();
    checkSavedStatus();
  }, [item.creatorId, currentUser, item.id]);

  // Delete Logic
  const handleDelete = () => {
    Alert.alert(
      "Delete Challenge",
      "Are you sure you want to permanently delete this challenge?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            try {
              const db = getFirestore();
              await deleteDoc(doc(db, 'challenges', item.id));
              Alert.alert("Deleted", "Your challenge has been deleted.");
            } catch (error) {
              console.log("Delete error:", error);
              Alert.alert("Error", "Could not delete the challenge.");
            }
        }}
      ]
    );
  };

  // Report Logic
  const handleReport = () => {
    Alert.alert(
      "Report Post",
     "Do you think this post violates the rules or is inappropriate?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Report", style: "destructive", onPress: async () => {
            try {
              const db = getFirestore();
              await setDoc(doc(db, 'reports', `${currentUser.uid}_${item.id}`), {
                challengeId: item.id,
                reportedBy: currentUser.uid,
                creatorId: item.creatorId,
                createdAt: serverTimestamp(),
                status: 'pending' 
              });
              Alert.alert("Reported", "Thank you! Our team will review this post.");
            } catch (error) {
              console.log("Report error:", error);
              Alert.alert("Error", "Could not submit the report.");
            }
        }}
      ]
    );
  };

  // Social Sharing Logic
  const handleShare = async () => {
    try {
      const shareUrl = `https://ratemeapp.com/challenge/${item.id}`; 
      const message = `Check out this challenge on RateMe: "${item.question}"\n\nVote now: ${shareUrl}`;

      const result = await Share.share({
        message: message,
      });

      if (result.action === Share.sharedAction) {
        console.log("Shared successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while sharing.");
      console.log(error.message);
    }
  };

  // Save / Unsave Logic
  const handleSave = async () => {
    if (!currentUser) return;
    const db = getFirestore();
    const savedRef = doc(db, `users/${currentUser.uid}/savedChallenges`, item.id);

    try {
      if (isSaved) {
        await deleteDoc(savedRef);
        setIsSaved(false);
      } else {
        await setDoc(savedRef, { savedAt: serverTimestamp(), challengeId: item.id });
        setIsSaved(true);
      }
    } catch (error) {
      console.log("Save error:", error);
    }
  };

  const total = item.totalVotes || 0;
  const countA = item.voteCountA || 0;
  const countB = item.voteCountB || 0;
  const percentA = total > 0 ? Math.round((countA / total) * 100) : 0;
  const percentB = total > 0 ? Math.round((countB / total) * 100) : 0;
  const hasVoted = userVotes[item.id] !== undefined;
  const selectedOption = userVotes[item.id]; 
  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

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
      {isPoll ? (
        <View style={styles.pollWrapper}>
          {['A', 'B', 'C', 'D'].map((opt) => {
            if (!item.pollOptions || !item.pollOptions[opt]) return null;
            const optCount = item[`voteCount${opt}`] || 0;
            const optPercent = total > 0 ? Math.round((optCount / total) * 100) : 0;
            const isSelected = selectedOption === opt;

            return (
              <TouchableOpacity key={opt} style={[styles.pollOptionBtn, hasVoted && isSelected && styles.pollSelectedBtn]} onPress={() => !hasVoted && onVote(item.id, opt, item.creatorId)} activeOpacity={hasVoted ? 1 : 0.7}>
                {hasVoted && <View style={[styles.pollProgressBar, { width: `${optPercent}%` }]} />}
                <View style={styles.pollTextContent}>
                  <Text style={[styles.pollOptText, hasVoted && isSelected && {fontWeight: 'bold', color: COLORS.primary || '#5A9624'}]}>{item.pollOptions[opt]}</Text>
                  {hasVoted && <Text style={styles.pollPercentVal}>{optPercent}%</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : isGuess ? (
        <View style={styles.singleImageContainer}>
          <Image source={{ uri: item.imageA_URL }} style={styles.singleImage} />
          {hasVoted ? (
            <View style={styles.guessResultBox}>
              <Text style={styles.guessUserText}>Your Guess: <Text style={{fontWeight: 'bold'}}>{selectedOption}</Text></Text>
              <Text style={styles.guessCorrectText}>Actual Answer: <Text style={{fontWeight: 'bold', color: COLORS.primary || '#5A9624'}}>{item.correctAnswer}</Text></Text>
            </View>
          ) : (
            <View style={styles.guessInputRow}>
              <TextInput style={styles.guessInputField} placeholder="Type your guess here..." placeholderTextColor="#999" value={guessInput} onChangeText={setGuessInput} />
              <TouchableOpacity style={styles.guessSubmitBtn} onPress={() => { if(!guessInput) return; onVote(item.id, guessInput.trim().toLowerCase(), item.creatorId); }}>
                <Text style={styles.guessSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : isYesNo ? (
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
        <View style={styles.imagesRow}>
          <TouchableOpacity style={[styles.imageWrapper, hasVoted && selectedOption === 'A' && styles.selectedBorder]} onPress={() => !hasVoted && onVote(item.id, 'A', item.creatorId)} activeOpacity={hasVoted ? 1 : 0.7}>
            <Image source={{ uri: item.imageA_URL }} style={styles.postImage} />
            {hasVoted ? <View style={styles.resultOverlay}><Text style={styles.percentText}>{percentA}%</Text>{selectedOption === 'A' && <Text style={styles.yourChoiceText}>Your Choice</Text>}</View> : <View style={styles.voteButton}><Text style={styles.voteButtonText}>Vote A</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.imageWrapper, hasVoted && selectedOption === 'B' && styles.selectedBorder]} onPress={() => !hasVoted && onVote(item.id, 'B', item.creatorId)} activeOpacity={hasVoted ? 1 : 0.7}>
            <Image source={{ uri: item.imageB_URL }} style={styles.postImage} />
            {hasVoted ? <View style={styles.resultOverlay}><Text style={styles.percentText}>{percentB}%</Text>{selectedOption === 'B' && <Text style={styles.yourChoiceText}>Your Choice</Text>}</View> : <View style={styles.voteButton}><Text style={styles.voteButtonText}>Vote B</Text></View>}
          </TouchableOpacity>
        </View>
      )}

      {/* Footer Actions */}
      <View style={styles.postFooter}>
        <Text style={styles.totalVotesText}>{total} votes</Text>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Text style={styles.actionBtnText}>🔗 Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
            <Text style={[styles.actionBtnText, isSaved && {color: COLORS.primary || '#5A9624'}]}>
              {isSaved ? '🔖 Saved' : '🔖 Save'}
            </Text>
          </TouchableOpacity>
          {isOwner ? (
            <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
              <Text style={[styles.actionBtnText, {color: '#FF3B30'}]}>🗑️ Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionBtn} onPress={handleReport}>
              <Text style={[styles.actionBtnText, {color: '#FF9800'}]}>🚩 Report</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({}); 
  const HOME_CATEGORIES = ['All', 'Fashion', 'Food', 'Travel', 'Fun', 'Sports', 'Tech'];
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFeed, setActiveFeed] = useState('For You');

  useEffect(() => {
    const db = getFirestore();
    const currentUser = getAuth().currentUser;
    let unsubscribePosts = () => {};

    const fetchPosts = async () => {
      setLoading(true);
      let followingIds = [];

      if (activeFeed === 'Following' && currentUser) {
        try {
          const followingSnap = await getDocs(collection(db, `users/${currentUser.uid}/following`));
          followingIds = followingSnap.docs.map(doc => doc.id);
          
          if (followingIds.length === 0) {
            setChallenges([]);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log("Error fetching following IDs:", error);
        }
      }

      let q;
      if (activeCategory === 'All') {
        q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(db, 'challenges'), where('category', '==', activeCategory), orderBy('createdAt', 'desc'));
      }

      unsubscribePosts = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot) return; 
        const posts = [];
        
        querySnapshot.forEach((doc) => { 
          const postData = { id: doc.id, ...doc.data() };
          
          if (activeFeed === 'Following') {
            if (followingIds.includes(postData.creatorId)) {
              posts.push(postData);
            }
          } else {
            posts.push(postData);
          }
        });
        
        setChallenges(posts);
        setLoading(false);
      }, (error) => {
        console.log('Firestore Query Error:', error);
        setLoading(false);
      });
    };

    fetchPosts();

    return () => unsubscribePosts();
  }, [activeCategory, activeFeed]); 

  const handleLogout = () => {
    signOut(getAuth()).then(() => console.log('User signed out!'));
  };

  const handleVote = async (challengeId, option, creatorId) => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) return;

    const db = getFirestore();
    const voteRef = doc(db, 'challenges', challengeId, 'votes', currentUser.uid);
    const challengeRef = doc(db, 'challenges', challengeId);

    // NAYA LOGIC: Yahan hum post ka data state (challenges array) se dhoond rahe hain
    const postItem = challenges.find(c => c.id === challengeId);

    try {
      const voteDoc = await getDoc(voteRef);
      if (voteDoc.exists()) {
        Alert.alert("Already Voted!", "You have already voted on this challenge.");
        setUserVotes(prev => ({ ...prev, [challengeId]: voteDoc.data().selectedOption }));
        return;
      }

      await setDoc(voteRef, { selectedOption: option, userId: currentUser.uid, votedAt: new Date() });
      
      let updateData = {};
      if (typeof option === 'number') { 
        updateData = { ratingSum: increment(option), totalVotes: increment(1) };
      } else if (['A', 'B', 'C', 'D'].includes(option)) { 
        updateData = { [`voteCount${option}`]: increment(1), totalVotes: increment(1) };
      } else {
        updateData = { totalVotes: increment(1) };
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

      // NAYA LOGIC: Result Screen ke liye manually percentage nikalna
      let newTotal = (postItem?.totalVotes || 0) + 1;
      let newCountA = (postItem?.voteCountA || 0) + (option === 'A' ? 1 : 0);
      let newCountB = (postItem?.voteCountB || 0) + (option === 'B' ? 1 : 0);
      let pA = Math.round((newCountA / newTotal) * 100);
      let pB = Math.round((newCountB / newTotal) * 100);

      navigation.navigate('ResultScreen', {
        challenge: { id: challengeId, type: postItem?.type, question: postItem?.question, pollOptions: postItem?.pollOptions, ...updateData }, 
        selectedOption: option,
        totalVotes: newTotal,
        percentA: pA, 
        percentB: pB
      });

    } catch (error) {
      console.log('Voting Error:', error);
      Alert.alert('Error', 'Could not save your vote. Please check your internet connection.');
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
                <TouchableOpacity onPress={() => setActiveFeed('For You')}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold', 
                    color: activeFeed === 'For You' ? (COLORS.primary || '#5A9624') : '#888', 
                    borderBottomWidth: activeFeed === 'For You' ? 2 : 0, 
                    borderBottomColor: COLORS.primary || '#5A9624', 
                    paddingBottom: 5 
                  }}>
                    For You
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveFeed('Following')}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold', 
                    color: activeFeed === 'Following' ? (COLORS.primary || '#5A9624') : '#888', 
                    borderBottomWidth: activeFeed === 'Following' ? 2 : 0, 
                    borderBottomColor: COLORS.primary || '#5A9624', 
                    paddingBottom: 5 
                  }}>
                    Following
                  </Text>
                </TouchableOpacity>
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

  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  totalVotesText: { color: '#666', fontSize: 13, fontWeight: 'bold' },
  actionButtonsContainer: { flexDirection: 'row', gap: 15 },
  actionBtn: { paddingVertical: 5, paddingHorizontal: 10, backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  actionBtnText: { fontSize: 13, fontWeight: 'bold', color: '#555' },
  
  imagesRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  imageWrapper: { flex: 1, position: 'relative', borderRadius: 12, overflow: 'hidden' }, 
  postImage: { width: '100%', height: 220, backgroundColor: '#e0e0e0' },
  voteButton: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  voteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  resultOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  percentText: { color: '#fff', fontSize: 32, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
  yourChoiceText: { color: '#fff', backgroundColor: COLORS.primary || '#5A9624', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: 'bold', marginTop: 10 },
  selectedBorder: { borderWidth: 3, borderColor: COLORS.primary || '#5A9624' },
  
  singleImageContainer: { width: '100%' },
  singleImage: { width: '100%', height: 250, borderRadius: 12, backgroundColor: '#e0e0e0', marginBottom: 15 },
  yesNoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  yesButton: { flex: 1, backgroundColor: '#f0f0f0', paddingVertical: 12, borderRadius: 25, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  noButton: { flex: 1, backgroundColor: '#f0f0f0', paddingVertical: 12, borderRadius: 25, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  selectedYes: { backgroundColor: '#e8f5e9', borderColor: '#4CAF50' },
  selectedNo: { backgroundColor: '#ffebee', borderColor: '#F44336' },
  yesNoText: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  homeCatBadge: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  homeActiveCatBadge: { backgroundColor: COLORS.primary || '#5A9624' },
  homeCatText: { color: '#666', fontWeight: 'bold' },
  homeActiveCatText: { color: '#fff' },
  
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginVertical: 10 },
  starIcon: { fontSize: 45 },
  starSelected: { color: '#FFD700' }, 
  starUnselected: { color: '#e0e0e0' }, 
  avgText: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: COLORS.primary || '#5A9624', marginTop: 5 },

  pollWrapper: { marginTop: 5, gap: 10 },
  pollOptionBtn: { width: '100%', height: 45, backgroundColor: '#f5f5f5', borderRadius: 8, justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  pollSelectedBtn: { borderColor: COLORS.primary || '#5A9624', borderWidth: 1.5 },
  pollProgressBar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#e8f5e9' },
  pollTextContent: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, position: 'absolute', width: '100%', alignItems: 'center' },
  pollOptText: { fontSize: 15, color: '#333' },
  pollPercentVal: { fontSize: 14, fontWeight: 'bold', color: '#555' },

  guessInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 },
  guessInputField: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 15, height: 45, backgroundColor: '#f9f9f9', color: '#000' },
  guessSubmitBtn: { backgroundColor: COLORS.primary || '#5A9624', paddingHorizontal: 20, height: 45, borderRadius: 25, justifyContent: 'center' },
  guessSubmitText: { color: '#fff', fontWeight: 'bold' },
  guessResultBox: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginTop: 5, borderWidth: 1, borderColor: '#ddd' },
  guessUserText: { fontSize: 15, color: '#555', marginBottom: 5 },
  guessCorrectText: { fontSize: 16, color: '#000' },
});