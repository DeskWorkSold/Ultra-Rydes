import React from 'react'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Colors from '../Constants/Colors';

export default function CustomButton({ text, onPress, bgColor, styleContainer, btnTextStyle }) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, styleContainer]}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={bgColor ? [Colors.black, Colors.black] : [Colors.primary, Colors.secondary]} style={styles.linearGradient}>
                <Text style={[styles.buttonText, btnTextStyle]}>
                    {text}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    buttonText: {
        fontSize: 18,
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent',
        fontFamily: 'Poppins-Medium'
    },
    container: {
        width: '80%',
    },
    linearGradient: {
        padding: 3,
        justifyContent: 'center',
        borderRadius: 30,
        elevation: 1,
    },

});