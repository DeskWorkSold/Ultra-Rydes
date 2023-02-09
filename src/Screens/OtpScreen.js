import React, { useState } from 'react'
import { Text, StyleSheet, ImageBackground, View, Image, useWindowDimensions, ScrollView, KeyboardAvoidingView, ToastAndroid } from 'react-native'
import CustomHeader from '../Components/CustomHeader'
import Colors from '../Constants/Colors'
import { TextInput } from 'react-native-paper';
import CustomButton from '../Components/CustomButton';



export default function OtpScreen({ navigation, route }) {
    const { height } = useWindowDimensions();
    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState(false)
    const { confirmation, phoneNum } = route.params;

    const onConfirmPressed = async () => {
        try {
            const response = await confirmation.confirm(code)
                .then(navigation.navigate('AskScreen'));
        } catch (error) {
            console.log('Invalid code.' + error);
        }
    };


    const getCodeHandler = () => {
        if (code == '') {
            setCodeError(true);
            if (code == '') {
                ToastAndroid.show("Code cannot be empty", ToastAndroid.SHORT);
                return false;
            }
            return false;
        }
        else {
            setCode('')
            onConfirmPressed();
        }
    }
    return (
        <ImageBackground
            source={require('../Assets/Images/GetStartedBackground.png')}
            resizeMode="cover"
            style={styles.container}
            imageStyle={styles.backgroundImage}
        >
            <CustomHeader iconname={'chevron-back-circle'} color={Colors.white} onPress={() => { navigation.goBack() }}
                source={require('../Assets/Images/URWhiteLogo.png')}
            />
            <View style={styles.innerContainer}>
                <KeyboardAvoidingView behavior='padding'>
                    <ScrollView style={styles.innerItems} showsVerticalScrollIndicator={false}>
                        <View style={styles.upperItemsContainer}>
                            <ImageBackground
                                source={require('../Assets/Images/phoneNumBg.png')}
                                resizeMode="cover"
                            >
                                <Image
                                    source={require('../Assets/Images/enterCode.png')}
                                    resizeMode='contain'
                                    style={[styles.imgStyles, { height: height * 0.2 }]}
                                />
                            </ImageBackground>
                        </View>
                        <View style={styles.midContainer}>
                            <Text style={styles.enterCode}>Enter Code</Text>
                            <Text style={styles.descText}>We've sent code to {phoneNum}</Text>
                        </View>
                        <View style={styles.fieldItems}>
                            <TextInput
                                value={code}
                                placeholder='Enter Code'
                                placeholderTextColor={Colors.gray}
                                onChangeText={setCode}
                                selectionColor={Colors.black}
                                activeUnderlineColor={Colors.fontColor}
                                style={styles.fieldStyles}
                                error={codeError}
                                keyboardType='phone-pad'
                                onFocus={() => { setCodeError(false) }}
                                left={<TextInput.Icon name="security" color={codeError ? 'red' : Colors.fontColor} />}
                            />
                            <CustomButton text='Continue' onPress={getCodeHandler} />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

            </View>
        </ImageBackground>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    descText: {
        textAlign: 'center',
        color: Colors.gray
    },
    enterCode: {
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
    midContainer: {

    },
    upperItemsContainer: {
        width: '100%',
    }

})
