import React, { useState } from 'react'
import { Text, StyleSheet, ImageBackground, View, Image, useWindowDimensions, ScrollView, KeyboardAvoidingView, ToastAndroid, ActivityIndicator } from 'react-native'
import CustomHeader from '../Components/CustomHeader'
import Colors from '../Constants/Colors'
import { TextInput } from 'react-native-paper';
import CustomButton from '../Components/CustomButton';
import auth from '@react-native-firebase/auth'



export default function PhoneLoginScreen({ navigation }) {
    const { height } = useWindowDimensions();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneNumError, setPhoneNumberError] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSignInPressed = async () => {
        try {
            setLoading(true)
            const response = await auth().signInWithPhoneNumber(phoneNumber);
            
            console.log(response,"ressponse")

            setLoading(false);
            navigation.navigate('OtpScreen', { confirmation: response, phoneNum: phoneNumber });
            ToastAndroid.show("OTP Send Successfully!", ToastAndroid.SHORT);

        } catch (error) {
            console.log("OTP SEND ERROR" + error);
        }
    };
    const strongRegex = new RegExp("\\+\\d+$");

    const getCodeHandler = () => {
        if (phoneNumber == '' || phoneNumber.length < 10 || isNaN(phoneNumber) || !strongRegex.test(phoneNumber)) {
            setPhoneNumberError(true);
            if (phoneNumber == '') {
                ToastAndroid.show("Phone Number cannot be empty", ToastAndroid.SHORT);
                return false;
            }
            if (phoneNumber.length < 10) {
                ToastAndroid.show("Phone Number Must Contain 10 digits", ToastAndroid.SHORT);
                return false;
            }
            if (isNaN(phoneNumber)) {
                ToastAndroid.show("Phone Number Must be in Numbers", ToastAndroid.SHORT);
                return false;
            }
            if (!strongRegex.test(phoneNumber)) {
                ToastAndroid.show("Please include '+' sign and country code", ToastAndroid.SHORT);
                return false;
            }
            return false;
        }
        else {
            setPhoneNumber('')
            onSignInPressed()
        }
    }
    return (
        <>
            {loading ? <View style={styles.container}><View style={styles.activityIndicatorStyles}><ActivityIndicator size="large" color={Colors.fontColor} /></View></View> : <ImageBackground
                source={require('../Assets/Images/GetStartedBackground.png')}
                resizeMode="cover"
                style={styles.container}
                imageStyle={styles.backgroundImage}
            >
                <CustomHeader iconname={'chevron-back-circle'} color={Colors.white} onPress={() => { navigation.goBack() }}
                    source={require('../Assets/Images/URWhiteLogo.png')}
                />
                <View style={styles.innerContainer}>

                    <ScrollView style={styles.innerItems} showsVerticalScrollIndicator={false}>
                        <View style={styles.upperItemsContainer}>
                            <ImageBackground
                                source={require('../Assets/Images/phoneNumBg.png')}
                                resizeMode="cover"
                            >
                                <Image
                                    source={require('../Assets/Images/loginCar.png')}
                                    resizeMode='contain'
                                    style={[styles.imgStyles, { height: height * 0.25 }]}
                                />
                            </ImageBackground>
                        </View>
                        <View >
                            <Text style={styles.compSetupText}>Complete Step</Text>
                        </View>
                        <KeyboardAvoidingView behavior='position'>
                            <View style={styles.fieldItems}>
                                <TextInput
                                    value={phoneNumber}
                                    placeholder='Enter Your Phone Number'
                                    keyboardType='phone-pad'
                                    placeholderTextColor={Colors.gray}
                                    onChangeText={setPhoneNumber}
                                    selectionColor={Colors.black}
                                    activeUnderlineColor={Colors.fontColor}
                                    style={styles.fieldStyles}
                                    error={phoneNumError}
                                    onFocus={() => { setPhoneNumberError(false) }}
                                    left={<TextInput.Icon name="phone" color={phoneNumError ? 'red' : Colors.fontColor} />}
                                />
                                <CustomButton text='Get Verify Code' onPress={getCodeHandler} />
                            </View>
                        </KeyboardAvoidingView>
                    </ScrollView>

                </View>
            </ImageBackground>}
        </>

    )
}
const styles = StyleSheet.create({
    activityIndicatorStyles: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        flex: 1
    },
    compSetupText: {
        fontSize: 22,
        margin: 10,
        color: Colors.fontColor,
        textAlign: 'center',
        fontFamily: 'Poppins-Medium'
    },
    fieldItems: {
        alignItems: 'center',
        marginBottom: 20
    },
    fieldStyles: {
        width: '80%',
        backgroundColor: 'transparent',
        marginBottom: 20
    },
    innerContainer: {
        width: '90%',
        height: '70%',
        backgroundColor: Colors.white,
        alignSelf: 'center',
        margin: 10,
        elevation: 10,
        marginTop: 20,
        borderRadius: 30,
        overflow: 'hidden'
    },
    imgStyles: {
        alignSelf: 'center',
        margin: 20,
    },
    innerImgBg: {
        backgroundColor: 'red'

    },
    upperItemsContainer: {
        width: '100%',
    }

})
