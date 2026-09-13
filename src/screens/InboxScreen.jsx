import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, updateDoc, doc } from '@react-native-firebase/firestore';
import { COLORS } from '../constant/colors';

export default function InboxScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // NAYA: Live Notifications Listener
  useEffect(() => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) return;

    const db = getFirestore();
    // Hum current user ke andar 'notifications' naam ke sub-folder ko sun (listen) rahe hain
    const q = query(
      collection(db, `users/${currentUser.uid}/notifications`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // NAYA: Notification par click karne se wo "Read" (Parh li gayi) ho jayegi
  const markAsRead = async (notifId, isRead) => {
    if (isRead) return; // Agar pehle se parh li hai tou kuch mat karo

    const currentUser = getAuth().currentUser;
    const db = getFirestore();
    try {
      await updateDoc(doc(db, `users/${currentUser.uid}/notifications`, notifId), {
        isRead: true
      });
    } catch (error) {
      console.log("Error marking notification as read:", error);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]} 
      onPress={() => markAsRead(item.id, item.isRead)}
      activeOpacity={0.8}
    >
      {/* Sender ki tasveer */}
      <Image 
        source={{ uri: item.senderAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
        style={styles.avatar} 
      />
      
      {/* Notification ka text */}
      <View style={styles.textContainer}>
        <Text style={styles.notificationText}>
          <Text style={styles.boldText}>{item.senderName}</Text> {item.message}
        </Text>
      </View>

      {/* Agar notification unread hai tou ek chota sa green dot dikhao */}
      {!item.isRead && <View style={styles.unreadDot} />}
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
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications 🔔</Text>
      </View>

      {/* NOTIFICATIONS LIST */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No notifications yet.</Text>
            <Text style={styles.emptySubText}>When someone follows you or votes on your challenge, you'll see it here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
  header: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },

  notificationCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  unreadCard: { backgroundColor: '#f4faee' }, // Halka sa green background unread ke liye
  
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#eee', marginRight: 15 },
  
  textContainer: { flex: 1, paddingRight: 10 },
  notificationText: { fontSize: 15, color: '#333', lineHeight: 20 },
  boldText: { fontWeight: 'bold', color: '#000' },
  
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary || '#5A9624' },

  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 30 },
  emptyIcon: { fontSize: 50, marginBottom: 15 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  emptySubText: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 }
});