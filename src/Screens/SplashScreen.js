import React from 'react'
import { ImageBackground, StyleSheet, View, useWindowDimensions, Image, Text, TextInput } from 'react-native'
import Colors from '../Constants/Colors';
import auth from '@react-native-firebase/auth'

export default function SplashScreen({ navigation }) {

    setTimeout(() => {
        const CheckUser = auth().currentUser;

        if (CheckUser) {
            navigation.replace('AskScreen');
        } else {
            navigation.replace('MyScreen');
        }
    }, 3000);
    const { height } = useWindowDimensions();
    return (
        <ImageBackground
            source={require('../Assets/Images/Bg.png')}
            resizeMode="cover"
            style={styles.container}
            imageStyle={styles.backgroundImage}
        >
            <ImageBackground
                source={require('../Assets/Images/bgHighLight.png')}
                resizeMode="cover"
                style={styles.innerContainer}
            >
                <View style={styles.imgContainer}>
                    <Image
                        style={[styles.Logo, { height: height * 0.25 }]}
                        resizeMode="contain"
                        source={require('../Assets/Images/URBlueLogo.png')}
                    />
                    <Text style={styles.bottomText}>ULTRA RYDES</Text>
                </View>
            </ImageBackground>
        </ImageBackground >
    )
}

const styles = StyleSheet.create({
    bottomContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomText: {
        color: Colors.white,
        fontSize: 25,
        fontFamily: 'Poppins-Medium',
        textAlign: 'center'
    },
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        alignItems: 'center'
    },
    imgContainer: {
        flex: 1,
        // alignItems: 'center'
        justifyContent: 'center'
    },
})