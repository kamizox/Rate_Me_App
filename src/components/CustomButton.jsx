import {Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { styles } from '../styleSheet';

function CustomButton(props) {
      const { title, bgColor, textColor,marginTop, borderwith, onPress} = props;
  return (
    <View>
     <TouchableOpacity onPress={onPress} style = {[styles.button,{backgroundColor: bgColor, marginTop: marginTop, borderWidth: borderwith}]}>
      <Text style= {[styles.text,{color: textColor}]}>{title}</Text>
    </TouchableOpacity>
    </View>
  )
}


export {CustomButton};