import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, query, orderBy, limit, getDocs, where } from '@react-native-firebase/firestore';
import { COLORS } from '../constant/colors';

export default function DiscoverScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const [topCreators, setTopCreators] = useState([]);
  const [trending, setTrending] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // App khulte hi Top Creators aur Trending Posts mangwana
  useEffect(() => {
    fetchDiscoverData();
  }, []);

  const fetchDiscoverData = async () => {
    const db = getFirestore();
    try {
      // 1. Top Creators (Jinke Followers sabse zyada hain - Limit: Top 5)
      const creatorsQ = query(collection(db, 'users'), orderBy('followersCount', 'desc'), limit(5));
      const creatorsSnap = await getDocs(creatorsQ);
      const creatorsData = creatorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTopCreators(creatorsData);

      // 2. Trending Challenges (Jin par sabse zyada votes hain - Limit: Top 10)
      const trendingQ = query(collection(db, 'challenges'), orderBy('totalVotes', 'desc'), limit(10));
      const trendingSnap = await getDocs(trendingQ);
      const trendingData = trendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrending(trendingData);

    } catch (error) {
      console.log("Error fetching discover data: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Search Bar ka Logic
  const handleSearch = async (text) => {
    const lowerText = text.toLowerCase();
    setSearchQuery(lowerText);

    // Agar search bar khali hai tou results clear kar do
    if (lowerText.length === 0) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const db = getFirestore();
    try {
      // Firebase mein search karna jo letters match karein
      const q = query(
        collection(db, 'users'),
        where('username', '>=', lowerText),
        where('username', '<=', lowerText + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSearchResults(users);
    } catch (error) {
      console.log("Search error: ", error);
    } finally {
      setSearching(false);
    }
  };

  // --- UI Components ---

  const renderUserCard = ({ item }) => (
    <TouchableOpacity style={styles.userCard}>
      <Image 
        source={{ uri: item.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userHandle}>@{item.username}</Text>
      </View>
      <View style={styles.followButton}>
        <Text style={styles.followButtonText}>View</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTrendingPost = ({ item }) => (
    <TouchableOpacity style={styles.trendingCard}>
      <Image source={{ uri: item.imageA_URL }} style={styles.trendingImage} />
      <View style={styles.trendingOverlay}>
        <Text style={styles.trendingQuestion} numberOfLines={2}>{item.question}</Text>
        <Text style={styles.trendingVotes}>🔥 {item.totalVotes || 0} Votes</Text>
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
      
      {/* HEADER & SEARCH BAR */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={styles.searchInput}
            placeholder="Search users by @username..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* DYNAMIC CONTENT: Search Results YA Trending Feed */}
      {searchQuery.length > 0 ? (
        // Agar kuch type kiya hai tou yeh Search Results dikhayega
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searching ? (
            <ActivityIndicator size="small" color={COLORS.primary || '#5A9624'} style={{marginTop: 20}}/>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderUserCard}
              ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
            />
          )}
        </View>
      ) : (
        // Agar search bar khali hai tou Default Discover Feed dikhayega
        <FlatList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.contentContainer}>
              
              {/* TOP CREATORS (Horizontal Scroll) */}
              <Text style={styles.sectionTitle}>Top Creators 🌟</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={topCreators}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.topCreatorCard}>
                    <Image 
                      source={{ uri: item.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
                      style={styles.topCreatorAvatar} 
                    />
                    <Text style={styles.topCreatorName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.topCreatorHandle}>@{item.username}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No creators yet.</Text>}
              />

              {/* TRENDING CHALLENGES (Vertical Scroll) */}
              <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Trending Challenges 🔥</Text>
            </View>
          }
          data={trending}
          keyExtractor={(item) => item.id}
          renderItem={renderTrendingPost}
          ListEmptyComponent={<Text style={styles.emptyText}>No trending challenges yet.</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
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

  // Search Results & User Card Styles
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', marginRight: 15 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  userHandle: { fontSize: 14, color: '#5A9624', marginTop: 2 },
  followButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  followButtonText: { color: '#000', fontWeight: 'bold', fontSize: 13 },

  // Top Creators Styles (Horizontal)
  topCreatorCard: { alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginRight: 15, width: 110, elevation: 1 },
  topCreatorAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee', marginBottom: 10 },
  topCreatorName: { fontSize: 14, fontWeight: 'bold', color: '#000', textAlign: 'center' },
  topCreatorHandle: { fontSize: 12, color: '#888', marginTop: 2 },

  // Trending Posts Styles
  trendingCard: { marginHorizontal: 15, marginBottom: 15, borderRadius: 15, overflow: 'hidden', height: 200, backgroundColor: '#eee', elevation: 2 },
  trendingImage: { width: '100%', height: '100%' },
  trendingOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 15 },
  trendingQuestion: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  trendingVotes: { color: '#FFD700', fontSize: 13, fontWeight: 'bold' }
});