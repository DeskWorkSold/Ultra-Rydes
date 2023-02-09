import React from 'react';
import { Text, StyleSheet, Pressable, View, TouchableOpacity } from 'react-native';
import Colors from '../Constants/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export default function SocialButtons({
    onPress,
    text,
    type = 'PRIMARY',
    bgColor,
    fgColor,
    name
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.container,
                styles[`container_${type}`],
                bgColor ? { backgroundColor: bgColor } : {},
            ]}>
            <View style={styles.innerContainer}>
                <MaterialCommunityIcons name={name} size={15} color={Colors.white} style={styles.iconStyle} />
                <Text
                    style={[
                        styles.text,
                        styles[`text_${type}`],
                        fgColor ? { color: fgColor } : {},
                    ]}>
                    {text}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        width: '80%',
        justifyContent: 'center',
        borderRadius: 30,
        elevation: 10,
    },
    container_PRIMARY: {
        backgroundColor: Colors.primary,
    },
    container_SECONDARY: {
        borderColor: '#3B71F3',
        borderWidth: 2,
    },
    container_TERTIARY: {},
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconStyle: {
        marginRight: 10,
        marginLeft: 5
    },
    text: {
        margin: 2,
        fontSize: 15,
        color: Colors.white,
    },
    text_SECONDARY: {
        color: '#3B71F3',
    },
    text_TERTIARY: {
        color: 'gray',
    },
});