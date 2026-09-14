import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, getDocs, doc, getDoc } from '@react-native-firebase/firestore';
import { COLORS } from '../constant/colors';

export default function FollowListScreen({ route, navigation }) {
  const { userId, type } = route.params; // type hamesha 'followers' ya 'following' hoga
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      try {
        // 1. Pehle sub-collection se IDs nikalo
        const snapshot = await getDocs(collection(db, `users/${userId}/${type}`));
        const userIds = snapshot.docs.map(doc => doc.id);

        // 2. Har ID ki asal profile detail fetch karo
        const profiles = [];
        for (let id of userIds) {
          const userDoc = await getDoc(doc(db, 'users', id));
          if (userDoc.exists()) {
            profiles.push({ id, ...userDoc.data() });
          }
        }
        setUsersList(profiles);
      } catch (error) {
        console.log(`Error fetching ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{type === 'followers' ? 'Followers' : 'Following'}</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary || '#5A9624'} />
        </View>
      ) : (
        <FlatList
          data={usersList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.userCard} 
              onPress={() => navigation.push('PublicProfile', { userId: item.id })}
            >
              <Image 
                source={{ uri: item.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
                style={styles.avatar} 
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Koi {type} nahi mila.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { padding: 5 },
  backIcon: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', textTransform: 'capitalize' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', marginRight: 15 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  username: { fontSize: 14, color: '#888' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 15 }
});