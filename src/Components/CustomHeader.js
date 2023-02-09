import React from 'react'
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native'
import Colors from '../Constants/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CustomHeader({ onPress, iconname, color, source }) {
    const { height } = useWindowDimensions();
    return (
        <View style={styles.header}>
            {/* <Image
                    style={[styles.toggle, { height: height * 0.05 }]}
                    resizeMode="contain"
                    source={require('../Assets/Images/blackImg.png')}
                /> */}
            <Ionicons
                onPress={onPress}
                name={iconname}
                size={30}
                color={color}
                style={styles.backIcon}
            />
            <Image
                style={[styles.Logo, { height: height * 0.06 }]}
                resizeMode="contain"
                source={source}
            />
            <View style={styles.emptyContainer}></View>

        </View>

    )
}

const styles = StyleSheet.create({
    backIcon: {
        flex: 1,
        marginLeft: 10
    },
    emptyContainer: {
        flex: 1
    },
    header: {
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    Logo: {
        flex: 1,
        width: '15%',
    },
    personImg: {
        width: '10%',
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: Colors.black,
        marginTop: 25,
        borderRadius: 5,
    },
    toggle: {
        width: '5%'
    }
})