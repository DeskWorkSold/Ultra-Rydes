import React, { useState } from 'react'
import { ImageBackground, Text, StyleSheet, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, ToastAndroid } from 'react-native'
import CustomButton from '../Components/CustomButton'
import CustomHeader from '../Components/CustomHeader'
import Colors from '../Constants/Colors'
import { TextInput } from 'react-native-paper';
import auth from '@react-native-firebase/auth'

export default function EmailSignInScreen({ navigation }) {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [secureEntry, setSecureEntry] = useState(true)
    const togglePassword = () => {
        setSecureEntry(!secureEntry);

    }
    const signInHandler = async () => {
        try {
            const isUserLogin = await auth().signInWithEmailAndPassword(email, password);
            console.log(isUserLogin);
            setEmail('');
            setPassword('');
            ToastAndroid.show('Login Successfully', ToastAndroid.SHORT);
            navigation.navigate('AskScreen')
        }
        catch (err) {
            ToastAndroid.show(err.message, ToastAndroid.SHORT);
        }
    }
    const signInValidation = () => {
        const strongRegex = new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$");
        if (!strongRegex.test(email)) {
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
        else {
            // setEmail('');
            // setPassword('');
            // navigation.navigate('PassengerDetailScreen')
            signInHandler();
        }
    }

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
                    <Text style={styles.signInText}>Sign In</Text>
                    <View style={styles.midContent}>
                        <Text style={styles.fieldLabelStyles}>Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
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
                            right={<TextInput.Icon name={secureEntry ? 'eye' : 'eye-off'} color="gray" onPress={togglePassword} />}
                            secureTextEntry={secureEntry}

                        />
                        <View style={styles.forgotPass}><TouchableOpacity><Text style={styles.forgotPassText} onPress={() => { navigation.navigate('ForgotPasswordScreen') }}>
                            Forgot Password?
                        </Text></TouchableOpacity></View>
                    </View>
                    <View style={styles.btnContainer}>
                        <CustomButton text="Sign In" onPress={signInValidation} />
                    </View>
                    <View style={styles.bottomText}>
                        <Text style={styles.textStyle}>Don't have an Account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('EmailSignUpScreen')}>
                            <Text style={styles.signUpText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

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
    forgotPass: {
        color: Colors.fontColor,
        alignItems: 'flex-end'
    },
    forgotPassText: {
        color: Colors.fontColor,
        padding: 10,
        margin: 5
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
    signUpText: {
        color: Colors.fontColor,
        margin: 5
    },
    signInText: {
        fontSize: 22,
        margin: 10,
        color: Colors.fontColor,
        textAlign: 'center',
        fontFamily: 'Poppins-Medium'
    },
    textStyle: {
        color: Colors.black
    }
})
