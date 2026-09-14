import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc } from '@react-native-firebase/firestore';
import { COLORS } from '../constant/colors';

export default function InboxScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    // Current user ki notifications ko naye se purane ki tarteeb mein mangwana
    const q = query(
      collection(db, `users/${currentUser.uid}/notifications`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot) return;
      const notifs = [];
      querySnapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Jab notification par click ho tou usay "Read" mark karo aur aage bhejo
  const handleNotificationPress = async (item) => {
    const db = getFirestore();
    const currentUser = getAuth().currentUser;

    // 1. Database mein isko isRead: true kar do
    if (!item.isRead) {
      try {
        const notifRef = doc(db, `users/${currentUser.uid}/notifications`, item.id);
        await updateDoc(notifRef, { isRead: true });
      } catch (error) {
        console.log("Error marking as read", error);
      }
    }

    // 2. Agar Follow ki notification thi, tou us banday ki profile par bhej do
    if (item.type === 'follow') {
      navigation.navigate('PublicProfile', { userId: item.senderId });
    }
    // (Agar vote ki hai tou aap user ki profile par ya wahi rehne de sakte hain)
    else if (item.type === 'vote') {
        navigation.navigate('PublicProfile', { userId: item.senderId });
    }
  };

  const renderItem = ({ item }) => {
    // Agar profile pic null ho tou default avatar lagao
    const avatarUrl = item.senderAvatar && item.senderAvatar.includes('http') 
        ? item.senderAvatar 
        : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        
        <View style={styles.textContainer}>
          <Text style={styles.messageText}>
            <Text style={styles.boldName}>{item.senderName} </Text>
            {item.message}
          </Text>
        </View>

        {/* NAYA: Agar Read nahi hui tou Green Dot dikhao */}
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary || '#5A9624'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications 🔔</Text>
      </View>

      {/* NOTIFICATIONS LIST */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  listContainer: {
    padding: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  unreadCard: {
    backgroundColor: '#f2f8f2', // Halka sabz background unread ke liye
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 15,
    backgroundColor: '#eee',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  boldName: {
    fontWeight: 'bold',
    color: '#000',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary || '#5A9624',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});