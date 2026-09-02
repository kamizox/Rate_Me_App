import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, Text, Image } from 'react-native'
import React from 'react'
import {CustomButton} from './src/components/CustomButton.jsx'
import {COLORS} from './src/constant/colors.js'
import { styles } from './src/styleSheet.js'


const Stack = createNativeStackNavigator()

function HomeScreen() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', }}>
      <Image source={require ('./src/assets/OnboardingImage.png')}
      style={{width:400, height:400}}/>
      <View style= {{width: '100%'}}>
      <CustomButton title="Get Started" bgColor= {COLORS.primary} textColor="white" marginTop = {33} />
      <CustomButton title="Log in" bgColor= {COLORS.white} textColor="black" marginTop = {23} borderwith= {1}/>
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
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App