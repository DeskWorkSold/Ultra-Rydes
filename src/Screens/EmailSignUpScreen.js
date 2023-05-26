import React, { useState } from 'react'
import { ImageBackground, Text, StyleSheet, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, ToastAndroid, ActivityIndicator } from 'react-native'
import CustomButton from '../Components/CustomButton'
import CustomHeader from '../Components/CustomHeader'
import Colors from '../Constants/Colors'
import { TextInput } from 'react-native-paper'
import auth from '@react-native-firebase/auth'

export default function EmailSignUpScreen({ navigation }) {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [secureEntryPassword, setSecureEntryPassword] = useState(true);
    const [secureEntryConfirmPassword, setSecureEntryConfirmPassword] = useState(true);
    const [loading,setLoading] = useState(false)
    const [message, setMessage] = useState('');
    const togglePassword = () => {
        setSecureEntryPassword(!secureEntryPassword);
    }
    const toggleConfirmPassword = () => {
        setSecureEntryConfirmPassword(!secureEntryConfirmPassword);
    }
    const signUpHandler = async () => {
        try {
            setLoading(true)
            const isUserCreated = await auth().createUserWithEmailAndPassword(email, password);
            console.log(isUserCreated)
            setLoading(false)
            ToastAndroid.show('User Registered Successfully Login to continue', ToastAndroid.LONG);
            setMessage('');
            navigation.navigate('EmailSignInScreen')
        }
        catch (err) {
            console.log(err);
            setLoading(false)
            setMessage(err.message);
            ToastAndroid.show(message, ToastAndroid.SHORT);
        }

    }
    const signUpValidation = () => {
        const strongRegex = new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$");
        if (!email) {
            setEmailError(true)
            ToastAndroid.show("Please Enter Valid Email", ToastAndroid.SHORT);
            return false;
        }
        else if (password == '' || password.length < 8) {
            setPasswordError(true);
            if (password == '') {
                ToastAndroid.show("Password cannot be empty", ToastAndroid.SHORT);
                return false;
            }
            if (password.length < 8) {
                ToastAndroid.show("Password Must Contain 8 characters", ToastAndroid.SHORT);
                return false;
            }
            return false;
        }
        else if (confirmPassword == '' || confirmPassword.length < 8 || confirmPassword != password) {
            setConfirmPasswordError(true);
            if (confirmPassword == '') {
                ToastAndroid.show("Confirm Password cannot be empty", ToastAndroid.SHORT);
                return false;
            }
            if (confirmPassword.length < 8) {
                ToastAndroid.show("Confirm Password Must Contain 8 characters", ToastAndroid.SHORT);
                return false;
            }
            if (confirmPassword != password) {
                ToastAndroid.show("Confirm Password Must be equal to Password", ToastAndroid.SHORT);
                return false;
            }
            return false;

        }
        else {
            // setEmail('');
            // setPassword('');
            // setConfirmPassword('');
            console.log(email, confirmPassword);
            signUpHandler();
            // ToastAndroid.show("Registered Successfully Sign in to Continue", ToastAndroid.SHORT);
            // navigation.navigate('EmailSignInScreen')
        }
    }

    const handleTextChange = (inputText) => {
        const formattedText = inputText.replace(/\s/g, '');
        setEmail(formattedText);
      };


    return (
        <ImageBackground
            source={require('../Assets/Images/GetStartedBackground.png')}
            resizeMode="cover"
            style={styles.container}
        >
            <CustomHeader iconname={'chevron-back-circle'} color={Colors.white} onPress={() => { navigation.goBack() }}
                source={require('../Assets/Images/URWhiteLogo.png')}
            />

            <View style={styles.innerContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.signUpText}>Sign Up</Text>
                    <KeyboardAvoidingView behavior='padding'>
                        <View style={styles.midContent}>
                            <Text style={styles.fieldLabelStyles}>Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={handleTextChange}
                                selectionColor={Colors.black}
                                activeUnderlineColor={Colors.fontColor}
                                style={styles.fieldStyles}
                                error={emailError}
                                onFocus={() => { setEmailError(false) }}
                                left={<TextInput.Icon name="email" color={emailError ? 'red' : Colors.fontColor} />}
                            />
                            <Text style={styles.fieldLabelStyles}>Password</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                selectionColor={Colors.black}
                                activeUnderlineColor={Colors.fontColor}
                                outlineColor={Colors.gray}
                                style={styles.fieldStyles}
                                error={passwordError}
                                onFocus={() => { setPasswordError(false) }}
                                left={<TextInput.Icon name="lock" color={passwordError ? 'red' : Colors.fontColor} />}
                                right={<TextInput.Icon name={secureEntryPassword ? 'eye' : 'eye-off'} color="gray" onPress={togglePassword} />}
                                secureTextEntry={secureEntryPassword}

                            />
                            <Text style={styles.fieldLabelStyles}>Confirm Password</Text>
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                selectionColor={Colors.black}
                                activeUnderlineColor={Colors.fontColor}
                                outlineColor={Colors.gray}
                                style={styles.fieldStyles}
                                error={confirmPasswordError}
                                onFocus={() => { setConfirmPasswordError(false) }}
                                left={<TextInput.Icon name="lock" color={confirmPasswordError ? 'red' : Colors.fontColor} />}
                                right={<TextInput.Icon name={secureEntryConfirmPassword ? 'eye' : 'eye-off'} color="gray" onPress={toggleConfirmPassword} />}
                                secureTextEntry={secureEntryConfirmPassword}
                            />
                        </View>
                    </KeyboardAvoidingView>
                    <View style={styles.btnContainer}>
                        <CustomButton text= {loading ? <ActivityIndicator size={"large"} color={Colors.secondary} /> : "Sign Up"} onPress={signUpValidation} />
                    </View>
                    <View style={styles.bottomText}><Text style={styles.textStyle}>Already have an Account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('EmailSignInScreen')}>
                            <Text style={styles.signInText}>Sign In</Text>
                        </TouchableOpacity></View>
                </ScrollView>
            </View>
        </ImageBackground>
    )
}
const styles = StyleSheet.create({
    bottomText: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        margin: 10
    },
    btnContainer: {
        alignItems: 'center',
        marginTop: 10
    },
    container: {
        flex: 1,

    },
    fieldLabelStyles: {
        color: Colors.fontColor,
        margin: 4,
        marginRight: 5,
        fontSize: 16,
        fontFamily: 'Poppins-Medium'
    },
    fieldStyles: {
        backgroundColor: 'transparent'
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
        padding: 30,
        overflow: 'hidden'
    },
    midContent: {
        flex: 1
    },
    otherText: {
        maxWidth: '80%',
        marginLeft: 10,
        color: Colors.black,

    },
    signInText: {
        color: Colors.fontColor,
        margin: 5
    },
    signUpText: {
        fontSize: 22,
        margin: 10,
        color: Colors.fontColor,
        fontFamily: 'Poppins-Medium',
        textAlign: 'center'
    },
    textStyle: {
        color: Colors.black
    }
})
