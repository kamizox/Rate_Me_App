import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, Text } from 'react-native'
import React from 'react'
import {CustomButton} from './src/components/CustomButton.jsx'


const Stack = createNativeStackNavigator()

function HomeScreen() {
  return (
    <View >
      <CustomButton title=" Press button" bgColor="red" />
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