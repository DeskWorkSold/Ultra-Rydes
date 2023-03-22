import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import Icon from 'react-native-vector-icons/AntDesign';
import {useState} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

function PassengerPhoneNumberChangeScreen({navigation, route}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [loading, setLoading] = useState(false);

  let data = route.params;

  const updatePhoneNumber = () => {
    setLoading(true);
    const id = auth().currentUser.uid;

    firestore()
      .collection('Passengers')
      .doc(id)
      .update({
        mobileNumber: phoneNumber,
      })
      .then(() => {
        setLoading(false);
        setPhoneNumber(null);
        ToastAndroid.show(
          'Your phone number has been successfully updated',
          ToastAndroid.SHORT,
        );
        //  navigation.navigate("SettingsPassenger")
      })
      .catch(error => {
        setLoading(false);
        ToastAndroid.show(error, ToastAndroid.SHORT);
      });
  };

  const strongRegex = new RegExp('\\+\\d+$');

  const getCodeHandler = () => {
    if (
      phoneNumber == '' ||
      phoneNumber.length < 10 ||
      isNaN(phoneNumber) ||
      !strongRegex.test(phoneNumber)
    ) {
      setPhoneNumberError(true);
      if (phoneNumber == '') {
        ToastAndroid.show('Phone Number cannot be empty', ToastAndroid.SHORT);
        return false;
      }
      if (phoneNumber.length < 10) {
        ToastAndroid.show(
          'Phone Number Must Contain 10 digits',
          ToastAndroid.SHORT,
        );
        return false;
      }
      if (isNaN(phoneNumber)) {
        ToastAndroid.show(
          'Phone Number Must be in Numbers',
          ToastAndroid.SHORT,
        );
        return false;
      }
      if (!strongRegex.test(phoneNumber)) {
        ToastAndroid.show(
          "Please include '+' sign and country code",
          ToastAndroid.SHORT,
        );
        return false;
      }
      return false;
    } else {
      updatePhoneNumber();
    }
  };

  console.log(phoneNumber, 'phoneNumber');

  return (
    <View style={{flex: 1}}>
      <View style={styles.headerContainer}>
        <CustomHeader
          iconname={'arrow-back'}
          color={Colors.white}
          onPress={() => {
            navigation.goBack();
          }}
          source={require('../../Assets/Images/URWhiteLogo.png')}
        />
      </View>
      <Text style={styles.heading}>Phone Number</Text>
      <Text style={styles.text}>
        Your account and data will be linked to a new number.
      </Text>
      <View style={{alignItems: 'center'}}>
        <View
          style={{
            borderWidth: 1,
            borderColor: 'black',
            width: '80%',
            marginTop: 20,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <Icon name="phone" color={Colors.secondary} size={25} />
          <TextInput
            style={styles.textInput}
            onChangeText={setPhoneNumber}
            maxLength={13}
            value={phoneNumber}
            keyboardType="phone-pad"
            placeholder="Enter Phone Number Here..."
            placeholderTextColor={Colors.black}
          />
        </View>
      </View>
      <View
        style={{
          alignItems: 'center',
          position: 'absolute',
          bottom: 20,
          width: '100%',
        }}
      >
        <CustomButton
          styleContainer={{width: '90%'}}
          text={
            loading ? (
              <ActivityIndicator size={'large'} color={Colors.secondary} />
            ) : (
              'Continue'
            )
          }
          onPress={getCodeHandler}
        />
      </View>
    </View>
  );
}

export default PassengerPhoneNumberChangeScreen;

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 1,
    backgroundColor: Colors.fontColor,
  },
  heading: {
    color: Colors.secondary,
    fontSize: 28,
    padding: 20,
  },
  text: {
    color: Colors.black,
    fontSize: 18,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  textInput: {
    paddingHorizontal: 10,
    color: Colors.black,
    fontSize: 16,
  },
});
