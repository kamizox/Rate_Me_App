import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth, signOut } from '@react-native-firebase/auth';

export default function HomeScreen() {
  
  // Logout Function
  const handleLogout = () => {
    signOut(getAuth())
      .then(() => console.log('User signed out!'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to RateMe Feed! 🌟</Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 30, color: '#000' },
  logoutButton: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 10, width: '50%', alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});