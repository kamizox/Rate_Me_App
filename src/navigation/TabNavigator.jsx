import React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens Import
import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import CreateScreen from '../screens/CreateScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false, // Text labels hide kar diye taake clean look aaye (Instagram ki tarah)
        tabBarActiveTintColor: '#5A9624', // Active tab ka green color
        tabBarInactiveTintColor: '#888888', // Inactive tab ka grey color
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60, // Bar ki height thori set ki hai
        },
        // Icons set karne ka logic
        tabBarIcon: ({ color, size }) => {
          let iconSource;

    if (route.name === 'Home') {
            iconSource = require('../assets/icons/home.png');
          } else if (route.name === 'Discover') {
            // NOTE: search icon ka poora naam khud dekh lijiyega, yahan maine guess kiya hai
            iconSource = require('../assets/icons/search-interface.png'); 
          } else if (route.name === 'Create') {
            iconSource = require('../assets/icons/add-button.png');
          } else if (route.name === 'Inbox') {
            iconSource = require('../assets/icons/bell.png');
          } else if (route.name === 'Profile') {
            iconSource = require('../assets/icons/user.png');
          }

          return (
            <Image
              source={iconSource}
              style={{
                width: 26,
                height: 26,
                tintColor: color, // Yeh line active/inactive ka color khud badal degi
              }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}