import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet, useWindowDimensions, Image, ActivityIndicator, ToastAndroid } from 'react-native'
import CustomHeader from '../Components/CustomHeader'
import Colors from '../Constants/Colors'
import CustomButton from '../Components/CustomButton'
import firestore from '@react-native-firebase/firestore';
import auth, { firebase } from '@react-native-firebase/auth';


export default function AskScreen({ navigation }) {
    const [loading, setLoading] = useState()
    const { height } = useWindowDimensions();

    const passengerModeHandler = async () => {
        try {
            const CurrentUser = auth().currentUser;
            const checkData = firestore().collection('Passengers').doc(CurrentUser.uid)
                .onSnapshot((documentSnapshot) => {
                    const checkEmpty = documentSnapshot.data();
                    if (checkEmpty == null) {
                        setLoading(false)
                        navigation.navigate('PassengerDetailScreen', { uid: CurrentUser.uid });
                    } else {
                        setLoading(false)
                        navigation.navigate('PassengerRoutes', { screen: 'PassengerHomeScreen' });
                    }
                });
        }

        catch (err) {
            console.log(err);
        }

    }
    const driverModeHandler = () => {
        try {
            const CurrentUser = auth().currentUser;
            const checkData = firestore().collection('Drivers').doc(CurrentUser.uid)
                .onSnapshot((documentSnapshot) => {
                    const checkEmpty = documentSnapshot.data();
                    if (checkEmpty == null) {
                        setLoading(false)
                        navigation.navigate('DriverDetailScreen', { uid: CurrentUser.uid });
                    }
                    else if (!checkEmpty.vehicleDetails) {
                        setLoading(false)
                        navigation.navigate('DriverRoutes', { screen: 'DriverVehicleAdd' });
                    }
                    else {
                        setLoading(false)
                        navigation.navigate('DriverRoutes', { screen: 'DriverHomeScreen' });
                    }
                });
        }

        catch (err) {
            console.log(err);
        }
    }
    return (

        <View style={styles.container}>

            <CustomHeader
                iconname={navigation.canGoBack() ? 'chevron-back-circle' : null}
                color={Colors.fontColor}
                onPress={() => { navigation.canGoBack() ? navigation.goBack() : null }}
                source={require('../Assets/Images/URWhiteLogo.png')}
            />

            <View style={styles.topContainer}>
                <Text style={styles.textStyle}>Are You a Driver or a Passenger</Text>
            </View>
            <View style={styles.midContainer}>
                <Image
                    style={[styles.img, { height: height * 0.2 }]}
                    resizeMode="contain"
                    source={require('../Assets/Images/askImg.png')}
                />
            </View>
            <View style={styles.bottomContainer}>
                <Text style={styles.textStyle}>Who are You</Text>
                <CustomButton text="Driver" onPress={driverModeHandler} />
                <View style={{ marginVertical: 10 }}></View>
                <CustomButton text="Passenger" onPress={passengerModeHandler} bgColor />
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    bottomContainer: {
        flex: 1,
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    img: {
        width: '100%',
    },
    midContainer: {
        flex: 1,
        alignItems: 'center'
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textStyle: {
        fontSize: 20,
        margin: 10,
        color: Colors.fontColor,
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
        maxWidth: '50%',

    },

})