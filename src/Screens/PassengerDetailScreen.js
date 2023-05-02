import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  useWindowDimensions,
  View,
  Image,
  KeyboardAvoidingView,
  ToastAndroid,
  PermissionsAndroid,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import CustomHeader from '../Components/CustomHeader';
import Colors from '../Constants/Colors';
import {TextInput, Provider} from 'react-native-paper';
import CustomButton from '../Components/CustomButton';
import ModalImg from '../Components/ModalImg';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import DropDown from 'react-native-paper-dropdown';
import DropDownPicker from 'react-native-dropdown-picker';

export default function PassengerDetailScreen({navigation}) {
  const {height, width} = useWindowDimensions();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [Email, setEmail] = useState('');
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [dateOfBirthError, setDateOfBirthError] = useState(false);
  const [EmailError, setEmailError] = useState(false);
  const [tipError, setTipError] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [mobileNumberError, setMobileNumberError] = useState(false);
  const [tip, setTip] = useState('');
  const [open, setOpen] = useState(false);
  const [close, setClose] = useState(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginFromEmail, setLoginFromEmail] = useState(false);
  //Date picker
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [Date, setDate] = useState('');
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  useEffect(() => {
    let userEmail = auth().currentUser?.email;
    userEmail && setEmail(userEmail);

    userEmail && setLoginFromEmail(true);
  }, []);

  const handleConfirm = date => {
    // console.warn('A date has been picked: ', date);
    setDateOfBirth(moment(date).format('MM/DD/yy'));
    hideDatePicker();
  };
  //date picker functions end

  //Profile Pic Functions start
  const setToastMsg = msg => {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  };
  const [visible1, setVisible1] = useState(false);
  const showModal1 = () => {
    setVisible1(true);
  };
  const hideModal1 = () => setVisible1(false);
  const [profilePicture, setprofilePicture] = useState('');
  const defaultImg = require('../Assets/Images/dummyPic.png');

  let options = {
    saveToPhotos: true,
    mediaType: 'photo',
  };

  const openCamera = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      hideModal1();
      const result = await ImagePicker.launchCamera(options);
      if (result.didCancel) {
        hideModal1();
        setToastMsg('Cancelled image selection');
      } else if (result.errorCode == 'permission') {
        hideModal1();
        setToastMsg('Permission Not Satisfied');
      } else if (result.errorCode == 'others') {
        hideModal1();
        setToastMsg(result.errorMessage);
      } else {
        hideModal1();
        console.log(result.assets[0].uri);
        setprofilePicture(result.assets[0].uri);
      }
    }
  };
  const removeImage = () => {
    hideModal1();
    setprofilePicture('');
    console.log(profilePicture);
  };
  const openGallery = async () => {
    hideModal1();
    const result = await ImagePicker.launchImageLibrary(options);
    if (result.didCancel) {
      hideModal1();
      setToastMsg('Cancelled image selection');
    } else if (result.errorCode == 'permission') {
      hideModal1();
      setToastMsg('Permission Not Satisfied');
    } else if (result.errorCode == 'others') {
      hideModal1();
      setToastMsg(result.errorMessage);
    } else {
      hideModal1();
      setprofilePicture(result.assets[0].uri);
    }
  };

  //profile pic functions end

  const strongRegex = new RegExp(
    '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$',
  );
  const askScreenHandler = async () => {
    if (
      firstName == '' ||
      lastName == '' ||
      dateOfBirth == '' ||
      Email == '' ||
      !mobileNumber ||
      !tip ||
      (tip == 'Custom' && !value)
    ) {
      if (firstName == '') {
        ToastAndroid.show('First Name cannot be empty', ToastAndroid.SHORT);
        setFirstNameError(true);
        return false;
      }
      if (lastName == '') {
        ToastAndroid.show('last Name cannot be empty', ToastAndroid.SHORT);
        setLastNameError(true);
        return false;
      }
      if (dateOfBirth == '') {
        ToastAndroid.show('Date Of Birth cannot be empty', ToastAndroid.SHORT);
        setDateOfBirthError(true);
        return false;
      }
      if (Email == '') {
        ToastAndroid.show('Email cannot be empty', ToastAndroid.SHORT);
        setEmailError(true);
        return false;
      }
      if (mobileNumber == '') {
        ToastAndroid.show('Mobile number cannot be empty', ToastAndroid.SHORT);
        setMobileNumberError(true);
        return false;
      }
      if (!tip && !value) {
        ToastAndroid.show('Tip cannot be less then 1$', ToastAndroid.SHORT);
        setTipError(true);
        return false;
      }
      if (tip == 'Custom' && !value) {
        ToastAndroid.show('Tip cannot be less then 1$', ToastAndroid.SHORT);
        setTipError(true);
        return false;
      }
      // if (!strongRegex.test(Email)) {
      //     setEmailError(true)
      //     ToastAndroid.show("Please Enter Valid Email", ToastAndroid.SHORT);
      //     return false;
      // }
      // if (profilePicture == '') {
      //     ToastAndroid.show("Please set Profile Picture", ToastAndroid.SHORT);
      //     return false;
      // }
    } else {
      setLoading(true);
      let number = mobileNumber.replace(/\s/g, '');
      try {
        const CurrentUser = auth().currentUser;
        if (profilePicture.length > 0) {
          const reference = storage().ref(profilePicture);
          const pathToFile = profilePicture;
          await reference.putFile(pathToFile);
        }
        firestore()
          .collection('Passengers')
          .doc(CurrentUser.uid)
          .set({
            profilePicture: profilePicture.length > 0 ? profilePicture : '',
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            Email: Email,
            tipOffered: value ? value : tip,
            mobileNumber: number,
          })
          .then(() => {
            setLoading(false);
            console.log('User added!');
            navigation.replace('AddCardScreen');
          })
          .catch(error => {
            console.log(error);
          });
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handlePhoneNumberChange = text => {
    // Remove all non-numeric characters from the input

    // Format the phone number as +1 (123) 456-7890
    if (text.length === 2) {
      text += ' ';
    }
    setMobileNumber(text);
  };

  const [item, setItem] = useState([
    {
      label: '5%',
      value: '5%',
    },
    {
      label: '10%',
      value: '10%',
    },
    {
      label: '25%',
      value: '15%',
    },
    {
      label: '50%',
      value: '20%',
    },
    {
      label: 'Custom',
      value: 'Custom',
    },
  ]);

  return (
    <ScrollView style={styles.rootContainer} nestedScrollEnabled={true}>
      <CustomHeader
        iconname={'chevron-back-circle'}
        color={Colors.fontColor}
        onPress={() => {
          navigation.goBack();
        }}
      />
      <View style={{width: width}}>
        <View style={styles.upperContainer}>
          <Text style={styles.regText}>Passenger Registration</Text>
          <TouchableOpacity onPress={showModal1}>
            <Image
              style={styles.proPic}
              resizeMode="contain"
              source={profilePicture ? {uri: profilePicture} : defaultImg}
            />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView>
          <View style={styles.midContainer}>
            <TextInput
              style={styles.fieldStyles}
              label="First Name"
              value={firstName}
              error={firstNameError}
              onChangeText={setFirstName}
              selectionColor={Colors.black}
              underlineColor={Colors.black}
              activeOutlineColor={Colors.fontColor}
              activeUnderlineColor={Colors.fontColor}
              onFocus={() => {
                setFirstNameError(false);
              }}
            />
            <TextInput
              style={styles.fieldStyles}
              label="Last Name"
              value={lastName}
              error={lastNameError}
              onChangeText={setLastName}
              selectionColor={Colors.black}
              underlineColor={Colors.black}
              activeOutlineColor={Colors.fontColor}
              activeUnderlineColor={Colors.fontColor}
              onFocus={() => {
                setLastNameError(false);
              }}
            />
            <TextInput
              style={styles.fieldStyles}
              label="Date of Birth"
              value={dateOfBirth}
              error={dateOfBirthError}
              onChangeText={setDateOfBirth}
              selectionColor={Colors.black}
              underlineColor={Colors.black}
              activeOutlineColor={Colors.fontColor}
              activeUnderlineColor={Colors.fontColor}
              onFocus={() => {
                setDateOfBirthError(false);
              }}
              // editable={false}
              onPressIn={() => showDatePicker()}
            />
            <TextInput
              style={styles.fieldStyles}
              placeholder="+1 XXXXXXXXXX"
              keyboardType="phone-pad"
              value={mobileNumber}
              maxLength={13}
              error={mobileNumberError}
              onChangeText={handlePhoneNumberChange}
              selectionColor={Colors.black}
              underlineColor={Colors.black}
              activeOutlineColor={Colors.fontColor}
              activeUnderlineColor={Colors.fontColor}
              onFocus={() => {
                setMobileNumberError(false);
              }}
              // editable={false}
            />
            <TextInput
              style={styles.fieldStyles}
              label="Email"
              value={Email}
              editable={loginFromEmail ? false : true}
              error={EmailError}
              onChangeText={setEmail}
              selectionColor={Colors.black}
              underlineColor={Colors.black}
              activeOutlineColor={Colors.fontColor}
              activeUnderlineColor={Colors.fontColor}
              onFocus={() => {
                setEmailError(false);
              }}
            />
            <View
              style={{
                width: '80%',
                alignSelf: 'center',
                backgroundColor: Colors.white,
              }}
            >
              <DropDownPicker
                label={'Tip'}
                items={item}
                value={tip}
                open={open}
                close={close}
                setOpen={setOpen}
                setValue={setTip}
                setClose={setClose}
                style={{zIndex: 1000}}
                scrollViewProps={{
                  scrollEnabled: true,
                  keyboardShouldPersistTaps: 'handled',
                  showsVerticalScrollIndicator: true,
                }}
                nestedScrollEnabled={true}
                placeholder="Select Tip"
              />
            </View>
            {tip == 'Custom' && (
              <TextInput
                style={styles.fieldStyles}
                keyboardType="numeric"
                editable={true}
                value={value}
                error={tipError}
                onChangeText={setValue}
                selectionColor={Colors.black}
                underlineColor={Colors.black}
                activeOutlineColor={Colors.fontColor}
                activeUnderlineColor={Colors.fontColor}
                placeholder="Enter Amount"
                onFocus={() => {
                  setEmailError(false);
                }}
              />
            )}
          </View>

          <View style={[styles.btnContainer, {marginBottom: 20}]}>
            <CustomButton
              text={
                loading ? (
                  <ActivityIndicator size={'small'} color={'black'} />
                ) : (
                  'Next'
                )
              }
              onPress={askScreenHandler}
            />
          </View>
        </KeyboardAvoidingView>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        display="spinner"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      <ModalImg
        modalVisible={visible1}
        openGallery={openGallery}
        openCamera={openCamera}
        removeImage={removeImage}
        closeModal={hideModal1}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  fieldStyles: {
    backgroundColor: 'transparent',
    width: '80%',
    margin: 10,
  },
  midContainer: {
    alignItems: 'center',
  },
  proPic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  rootContainer: {
    backgroundColor: Colors.white,
  },
  regText: {
    fontFamily: 'Poppins-Medium',
    color: Colors.fontColor,
    margin: 5,
    fontSize: 20,
  },
  upperContainer: {
    margin: 10,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 22,
    margin: 10,
    color: Colors.fontColor,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
});
