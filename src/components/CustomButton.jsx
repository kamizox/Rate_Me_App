import {Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { styles } from '../styleSheet';

function CustomButton(props) {
      const { title, bgColor, textColor,marginTop, borderwith} = props;
  return (
    <View>
     <TouchableOpacity style = {[styles.button,{backgroundColor: bgColor, marginTop: marginTop, borderWidth: borderwith}]}>
      <Text style= {[styles.text,{color: textColor}]}>{title}</Text>
    </TouchableOpacity>
    </View>
  )
}



export {CustomButton};