import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, Text, Image } from 'react-native'
import React from 'react'
import {CustomButton} from './src/components/CustomButton.jsx'
import {COLORS} from './src/constant/colors.js'
import { styles } from './src/styleSheet.js'
import {LoginScreen} from '../Pr/src/screens/auth/LoginScreen.jsx'


const Stack = createNativeStackNavigator()

function HomeScreen({navigation}) {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: "white" }}>
      <Image source={require ('./src/assets/OnboardingImage.png')}
      style={{width:400, height:400}}/>
      <Text style= {{fontWeight: 'bold',fontSize: 52}}>
        <Text >Rate</Text>
        <Text style={{color: COLORS.primary}}>Me</Text>
      </Text>
      <View style= {{width: '100%'}}>
      <CustomButton title="Get Started" bgColor= {COLORS.primary} textColor="white" marginTop = {33} />
      <CustomButton title="Log in" bgColor= {COLORS.white} textColor="black" 
       marginTop = {23} borderwith= {1} onPress={()=> navigation.navigation('login')}/>
      </View>
      <Text style= {{marginTop: 10}} >By continuing you agree to our </Text>
      <Text style={{fontWeight:'bold'}}>Terms & Privacy Policy</Text>
    </View>
  )
}

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name='login' component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App