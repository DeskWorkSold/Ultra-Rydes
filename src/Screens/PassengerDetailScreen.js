import React, { useState } from 'react'
import { ScrollView, Text, StyleSheet, useWindowDimensions, View, Image, KeyboardAvoidingView, ToastAndroid, PermissionsAndroid, TouchableOpacity } from 'react-native'
import CustomHeader from '../Components/CustomHeader'
import Colors from '../Constants/Colors'
import { TextInput } from 'react-native-paper';
import CustomButton from '../Components/CustomButton';
import ModalImg from '../Components/ModalImg';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

export default function PassengerDetailScreen({ navigation }) {
    const { height, width } = useWindowDimensions()
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [Email, setEmail] = useState('');
    const [firstNameError, setFirstNameError] = useState(false)
    const [lastNameError, setLastNameError] = useState(false)
    const [dateOfBirthError, setDateOfBirthError] = useState(false)
    const [EmailError, setEmailError] = useState(false)

    //Date picker
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [Date, setDate] = useState('');
    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = date => {
        // console.warn('A date has been picked: ', date);
        setDateOfBirth(moment(date).format('MM/DD/yy'));
        hideDatePicker();
    };
    //date picker functions end

    //Profile Pic Functions start
    const setToastMsg = (msg) => {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    };
    const [visible1, setVisible1] = useState(false);
    const showModal1 = () => { console.log('pressed'); setVisible1(true); }
    const hideModal1 = () => setVisible1(false);
    const [profilePicture, setprofilePicture] = useState('');
    const defaultImg = require('../Assets/Images/dummyPic.png');

    let options = {
        saveToPhotos: true,
        mediaType: 'photo',
    };

    const openCamera = async () => {
        console.log('pressed');
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
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
                console.log(result.assets[0].uri)
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

    const strongRegex = new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$");
    const askScreenHandler = async () => {
        if (firstName == '' || lastName == '' || dateOfBirth == '' || Email == '' || !strongRegex.test(Email)) {
            if (firstName == '') {
                ToastAndroid.show("First Name cannot be empty", ToastAndroid.SHORT);
                setFirstNameError(true);
                return false;
            }
            if (lastName == '') {
                ToastAndroid.show("last Name cannot be empty", ToastAndroid.SHORT);
                setLastNameError(true);
                return false;
            }
            if (dateOfBirth == '') {
                ToastAndroid.show("Date Of Birth cannot be empty", ToastAndroid.SHORT);
                setDateOfBirthError(true);
                return false;
            }
            if (Email == '') {
                ToastAndroid.show("Email cannot be empty", ToastAndroid.SHORT);
                setEmailError(true);
                return false;
            }
            if (!strongRegex.test(Email)) {
                setEmailError(true)
                ToastAndroid.show("Please Enter Valid Email", ToastAndroid.SHORT);
                return false;
            }
            // if (profilePicture == '') {
            //     ToastAndroid.show("Please set Profile Picture", ToastAndroid.SHORT);
            //     return false;
            // }
        }
        else {
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
                        Email: Email
                    })
                    .then(() => {
                        console.log('User added!');
                    });
                navigation.navigate('AskScreen')
            } catch (err) {
                console.log(err)
            }
        }
    }

    return (
        <ScrollView style={styles.rootContainer}>
            <CustomHeader iconname={'chevron-back-circle'} color={Colors.fontColor} onPress={() => { navigation.goBack() }} />
            <View style={{ width: width }}>
                <View style={styles.upperContainer}>
                    <Text style={styles.regText} >Passenger Registration</Text>
                    <TouchableOpacity onPress={showModal1}>
                        <Image
                            style={styles.proPic}
                            resizeMode="contain"
                            source={profilePicture ? { uri: profilePicture } : defaultImg}
                        /></TouchableOpacity>
                </View>
                <KeyboardAvoidingView>
                    <View style={styles.midContainer}>
                        <TextInput
                            style={styles.fieldStyles}
                            label='First Name'
                            value={firstName}
                            error={firstNameError}
                            onChangeText={setFirstName}
                            selectionColor={Colors.black}
                            underlineColor={Colors.black}
                            activeOutlineColor={Colors.fontColor}
                            activeUnderlineColor={Colors.fontColor}
                            onFocus={() => { setFirstNameError(false) }}
                        />
                        <TextInput
                            style={styles.fieldStyles}
                            label='Last Name'
                            value={lastName}
                            error={lastNameError}
                            onChangeText={setLastName}
                            selectionColor={Colors.black}
                            underlineColor={Colors.black}
                            activeOutlineColor={Colors.fontColor}
                            activeUnderlineColor={Colors.fontColor}
                            onFocus={() => { setLastNameError(false) }}
                        />
                        <TextInput
                            style={styles.fieldStyles}
                            label='Date of Birth'
                            value={dateOfBirth}
                            error={dateOfBirthError}
                            onChangeText={setDateOfBirth}
                            selectionColor={Colors.black}
                            underlineColor={Colors.black}
                            activeOutlineColor={Colors.fontColor}
                            activeUnderlineColor={Colors.fontColor}
                            onFocus={() => { setDateOfBirthError(false) }}
                            // editable={false}
                            onPressIn={() => showDatePicker()}
                        />
                        <TextInput
                            style={styles.fieldStyles}
                            label='Email'
                            value={Email}
                            error={EmailError}
                            onChangeText={setEmail}
                            selectionColor={Colors.black}
                            underlineColor={Colors.black}
                            activeOutlineColor={Colors.fontColor}
                            activeUnderlineColor={Colors.fontColor}
                            onFocus={() => { setEmailError(false) }}
                        />
                    </View>
                    <View style={styles.btnContainer}>
                        <CustomButton text='Next' onPress={askScreenHandler} />
                    </View>
                </KeyboardAvoidingView>
            </View>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                display='spinner'
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
    )
}

const styles = StyleSheet.create({
    btnContainer: {
        marginTop: 20,
        alignItems: 'center'
    },
    fieldStyles: {
        backgroundColor: 'transparent',
        width: '80%',
        margin: 10
    },
    midContainer: {
        alignItems: 'center',
    },
    proPic: {
        width: 100,
        height: 100,
        borderRadius: 50
    },
    rootContainer: {
        backgroundColor: Colors.white
    },
    regText: {
        fontFamily: 'Poppins-Medium',
        color: Colors.fontColor,
        margin: 5,
        fontSize: 20

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
        fontFamily: 'Poppins-Medium'
    }
})