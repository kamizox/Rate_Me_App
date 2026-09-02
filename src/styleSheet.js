import { StyleSheet } from "react-native"
import {COLORS} from './constant/colors'
import {SIZES} from './constant/font'

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 22,
    margin: 23,
    alignItems: "center"
  },
  text: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.white
  }
})

export {styles};