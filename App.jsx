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
    <View >
      
      <CustomButton title="Get Started" bgColor= {COLORS.primary} textColor="white" />
      <CustomButton title="Log in" bgColor= {COLORS.white} textColor="black" />
    </View>
  )
}

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App