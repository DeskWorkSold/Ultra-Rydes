import React, {useEffect, useState} from 'react';
import {
  ImageBackground,
  Text,
  StyleSheet,
  View,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import SocialButtons from '../Components/SocialButtons';
import Colors from '../Constants/Colors';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

export default function GetStartedScreen({navigation}) {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '716766761680-uaf4l5b07etjbtac86j7ufnoplfdvagl.apps.googleusercontent.com',
    });
  }, []);
  const [loading, setLoading] = useState('');
  const {height} = useWindowDimensions();

  const phoneNumberHandler = () => {
    navigation.navigate('PhoneLoginScreen');
  };
  const emailHandler = () => {
    navigation.navigate('EmailSignInScreen');
  };
  // const googleSignIn = async () => {
  //     try {
  //         await GoogleSignin.hasPlayServices();
  //         await GoogleSignin.signOut();
  //         const userInfo = await GoogleSignin.signIn();
  //         //   this.setState({ userInfo });
  //         console.log("userInfo", userInfo)
  //     } catch (error) {
  //         if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //             // user cancelled the login flow
  //             console.log(error)
  //         } else if (error.code === statusCodes.IN_PROGRESS) {
  //             // operation (e.g. sign in) is in progress already
  //             console.log(error)
  //         } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //             // play services not available or outdated
  //             console.log(error)
  //         } else {
  //             // some other error happened
  //             console.log("This is Error", error)
  //         }
  //     }
  // };
  async function onGoogleButtonPress() {
    setLoading(true);
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }
  const afterGoogleLogin = () => {
    ToastAndroid.show(
      'User Registered Successfully Login to continue',
      ToastAndroid.SHORT,
    );
    setLoading(false);
    navigation.replace('AskScreen');
  };

  return (
    <View style={styles.mainContainer}>
      {loading ? (
        <View style={styles.activityIndicatorStyles}>
          <ActivityIndicator size="large" color={Colors.fontColor} />
        </View>
      ) : (
        <ImageBackground
          source={require('../Assets/Images/GetStartedBackground.png')}
          resizeMode="cover"
          style={styles.container}
          imageStyle={styles.backgroundImage}>
          <View style={styles.topContainer}>
            <Image
              style={[styles.Logo, {height: height * 0.15}]}
              resizeMode="contain"
              source={require('../Assets/Images/URWhiteLogo.png')}
            />
          </View>
          <View style={styles.midContainer}>
            <View style={styles.midContainerTop}>
              <Text style={styles.getStartedText}>Get Started</Text>
              <Text style={styles.otherText}>
                Ultra rydes will make your rides pleasent with complete security
                and affordable fares.
              </Text>
            </View>
            <View style={styles.socialBtnContainer}>
              <SocialButtons
                name="email"
                text="Continue with Email"
                bgColor={Colors.emailBtnColor}
                onPress={emailHandler}
              />
              <SocialButtons
                name="phone"
                text="Continue with Number"
                bgColor={Colors.phoneNumColor}
                onPress={phoneNumberHandler}
              />
              <SocialButtons
                name="google-plus"
                text="Continue with Google"
                bgColor={Colors.googleBtnColor}
                onPress={() =>
                  onGoogleButtonPress().then(() => afterGoogleLogin())
                }
              />
            </View>
            <View style={styles.bottomInnerContainer}></View>
          </View>
          <View style={styles.bottomContainer}></View>
        </ImageBackground>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  activityIndicatorStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    flex: 1,
  },
  bottomInnerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  container: {
    flex: 2,
  },
  getStartedText: {
    fontSize: 22,
    margin: 10,
    color: Colors.fontColor,
    // fontWeight: 'bold',
    fontFamily: 'Poppins-Medium',
  },
  midContainer: {
    flex: 4,
    backgroundColor: Colors.white,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 30,
    elevation: 15,
    padding: 10,
  },
  midContainerTop: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  otherText: {
    maxWidth: '80%',
    marginLeft: 10,
    color: Colors.black,
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  socialBtnContainer: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flex: 2,
  },
  signUpText: {
    color: Colors.fontColor,
    margin: 5,
  },
  topContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
});
