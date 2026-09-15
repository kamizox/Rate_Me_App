import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, Text, Image,ActivityIndicator } from 'react-native'
import React, {useState,useEffect}from 'react'
import {CustomButton} from './src/components/CustomButton.jsx'
import {COLORS} from './src/constant/colors.js'
import { styles } from './src/styleSheet.js'
import { SignupScreen} from './src/screens/auth/SignupScreen.jsx'
import { LoginScreen} from './src/screens/auth/LoginScreen.jsx'
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import TabNavigator from './src/navigation/TabNavigator';
import PublicProfileScreen from './src/screens/PublicProfileScreen';
import ResultScreen from './src/screens/ResultScreen';
import FollowListScreen from './src/screens/FollowListScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';


const Stack = createNativeStackNavigator()

function WelcomeScreen({navigation}) {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: "white" }}>
      <Image source={require ('./src/assets/OnboardingImage.png')}
      style={{width:400, height:400}}/>
      <Text style= {{fontWeight: 'bold',fontSize: 52}}>
        <Text >Rate</Text>
        <Text style={{color: COLORS.primary}}>Me</Text>
      </Text>
      <View style= {{width: '100%'}}>
      <CustomButton 
          title="Get Started" 
          bgColor={COLORS.primary} 
          textColor="white" 
          marginTop={33} 
          onPress={() => navigation.navigate('SignupScreen')} 
        />
      <CustomButton 
          title="Log in" 
          bgColor={COLORS.white} 
          textColor="black" 
          marginTop={23} 
          borderwith={1} 
          onPress={() => navigation.navigate('Login')}
        />
      </View>
      <Text style= {{marginTop: 10}} >By continuing you agree to our </Text>
      <Text style={{fontWeight:'bold'}}>Terms & Privacy Policy</Text>
    </View>
  )
}

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
   useEffect(() => {
  const subscriber = onAuthStateChanged(getAuth(), (currentUser) => {
    console.log('Auth state changed:', currentUser ? currentUser.uid : 'no user');
    setUser(currentUser);
    if (initializing) setInitializing(false);
  });
  return subscriber;
  }, [initializing]);
if (initializing) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        
        {user ? (
           <>
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FollowList" component={FollowListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ headerShown: false }} />
  </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ headerShown: false }} 
           />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  )
}


export default App