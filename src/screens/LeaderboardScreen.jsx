import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, query, orderBy, limit, getDocs } from '@react-native-firebase/firestore';
import { COLORS } from '../constant/colors';

export default function LeaderboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Creators'); 
  const [topUsers, setTopUsers] = useState([]);
  const [topChallenges, setTopChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    const db = getFirestore();

    try {
      // 1. Fetch Top 10 Creators (Jinke sabse zyada followers hain)
      const usersQuery = query(collection(db, 'users'), orderBy('followersCount', 'desc'), limit(10));
      const usersSnap = await getDocs(usersQuery);
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTopUsers(usersData);

      // 2. Fetch Top 10 Challenges (Jin par sabse zyada votes hain)
      const challengesQuery = query(collection(db, 'challenges'), orderBy('totalVotes', 'desc'), limit(10));
      const challengesSnap = await getDocs(challengesQuery);
      const challengesData = challengesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTopChallenges(challengesData);

    } catch (error) {
      console.log("Leaderboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1st, 2nd, aur 3rd aane walon ko Medal dena
  const renderMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  // Top Creators ka Design
  const renderUserCard = ({ item, index }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PublicProfile', { userId: item.id })}>
      <Text style={styles.medal}>{renderMedal(index)}</Text>
      <Image source={{ uri: item.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtext}>@{item.username}</Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreText}>{item.followersCount || 0}</Text>
        <Text style={styles.scoreLabel}>Followers</Text>
      </View>
    </TouchableOpacity>
  );

  // Top Challenges ka Design
  const renderChallengeCard = ({ item, index }) => {
    // Agar A vs B ho tou pehli tasveer dikhao, warna jo bhi tasveer available ho
    const imageUri = item.imageA_URL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    
    return (
      <View style={styles.card}>
        <Text style={styles.medal}>{renderMedal(index)}</Text>
        <Image source={{ uri: imageUri }} style={styles.challengeImage} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.question}</Text>
          <Text style={styles.subtext}>{item.category}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{item.totalVotes || 0}</Text>
          <Text style={styles.scoreLabel}>Votes</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
    <Text style={{ fontSize: 34, color: '#000' }}>←</Text>
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Leaderboard 🏆</Text>
      </View>

      {/* Tabs (Creators | Challenges) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'Creators' && styles.activeTab]} onPress={() => setActiveTab('Creators')}>
          <Text style={[styles.tabText, activeTab === 'Creators' && styles.activeTabText]}>Top Creators</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'Challenges' && styles.activeTab]} onPress={() => setActiveTab('Challenges')}>
          <Text style={[styles.tabText, activeTab === 'Challenges' && styles.activeTabText]}>Top Challenges</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary || '#5A9624'} />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'Creators' ? topUsers : topChallenges}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === 'Creators' ? renderUserCard : renderChallengeCard}
          contentContainerStyle={{ padding: 15 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', elevation: 2 },
headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000', flex: 1, textAlign: 'center', marginRight: 34 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: COLORS.primary || '#5A9624' },
  tabText: { fontSize: 16, color: '#888', fontWeight: 'bold' },
  activeTabText: { color: COLORS.primary || '#5A9624' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Cards Styling
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 12, elevation: 1 },
  medal: { fontSize: 18, fontWeight: 'bold', width: 35, textAlign: 'center', color: '#555' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', marginRight: 15 },
  challengeImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee', marginRight: 15 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  subtext: { fontSize: 13, color: '#666' },
  scoreBox: { alignItems: 'flex-end' },
  scoreText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary || '#5A9624' },
  scoreLabel: { fontSize: 12, color: '#888' }
});