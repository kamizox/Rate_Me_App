import {Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { styles } from '../styleSheet';

function CustomButton(props) {
      const { title, bgColor, textColor} = props;
  return (
    <View>
     <TouchableOpacity style = {[styles.button,{backgroundColor: bgColor}]}>
      <Text style= {[styles.text,{color: textColor}]}>{title}</Text>
    </TouchableOpacity>
    </View>
  )
}



export {CustomButton};