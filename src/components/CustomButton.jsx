import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

function CustomButton(props) {
      const {bgColor, title} = props;
  return (
    <TouchableOpacity style = {{backgroundColor : bgColor, padding:22}}>
      <Text style= {{ fontSize:22}}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({})

export {CustomButton};