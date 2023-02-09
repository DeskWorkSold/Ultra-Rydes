import React, { useState, useEffect } from 'react'
import { ScrollView, Text, StyleSheet, useWindowDimensions, View, Image, KeyboardAvoidingView, ToastAndroid, PermissionsAndroid, TouchableOpacity, Alert } from 'react-native'
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import { TextInput } from 'react-native-paper';
import CustomButton from '../../Components/CustomButton';
import ModalImg from '../../Components/ModalImg';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'react-native-image-picker';

export default function PassengerDetailsEdit({ navigation, route }) {
    const { passengerData, profilePicUrl } = route.params;
    const { height, width } = useWindowDimensions()
    const [firstName, setFirstName] = useState(passengerData.firstName);
    const [lastName, setLastName] = useState(passengerData.lastName);
    const [dateOfBirth, setDateOfBirth] = useState(passengerData.dateOfBirth);
    const [Email, setEmail] = useState(passengerData.Email);
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
        setDateOfBirth(moment(date).format('MM/DD/yy'));
        hideDatePicker();
    };
    //date picker functions end

    //Profile Pic Functions start
    const setToastMsg = (msg) => {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    };
    const [visible1, setVisible1] = useState(false);
    const showModal1 = () => { setVisible1(true); }
    const hideModal1 = () => setVisible1(false);
    const [profilePicture, setprofilePicture] = useState(profilePicUrl);
    const [IsProfilePicChanged, setIsProfilePicChanged] = useState(false);
    const defaultImg = require('../../Assets/Images/dummyPic.png');

    let options = {
        saveToPhotos: true,
        mediaType: 'photo',
    };

    const openCamera = async () => {
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
                setIsProfilePicChanged(true);
                setprofilePicture(result.assets[0].uri);
            }
        }
    };
    const removeImage = () => {
        hideModal1();
        setIsProfilePicChanged(false);
        setprofilePicture('');
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
            setIsProfilePicChanged(true);
            setprofilePicture(result.assets[0].uri);
        }
    };

    //profile pic functions end

    const strongRegex = new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$");
    const askScreenHandler = async () => {
        if (firstName == '' || lastName == '' || dateOfBirth == '' || Email == '' || !strongRegex.test(Email) || profilePicture == '') {
            if (firstName == '') {
                setToastMsg("First Name cannot be empty");
                setFirstNameError(true);
                return false;
            }
            if (lastName == '') {
                setToastMsg("last Name cannot be empty");
                setLastNameError(true);
                return false;
            }
            if (dateOfBirth == '') {
                setToastMsg("Date Of Birth cannot be empty");
                setDateOfBirthError(true);
                return false;
            }
            if (Email == '') {
                setToastMsg("Email cannot be empty");
                setEmailError(true);
                return false;
            }
            if (!strongRegex.test(Email)) {
                setEmailError(true)
                setToastMsg("Please Enter Valid Email");
                return false;
            }
            if (profilePicture == '') {
                setToastMsg("Please set Profile Picture");
                return false;
            }
        }
        else {
            Alert.alert(
                "Confirmation",
                "Are you sure you want to make changes",
                [
                    {
                        text: "Cancel",
                        onPress: () => { return false },
                        style: "cancel"
                    },
                    { text: "OK", onPress: () => updateData() }
                ]
            );

        }
    }
    const updateData = async () => {
        try {
            const CurrentUser = auth().currentUser;
            if (IsProfilePicChanged) {
                const reference = storage().ref(profilePicture);
                const pathToFile = profilePicture;
                await reference.putFile(pathToFile);
            }
            firestore()
                .collection('Passengers')
                .doc(CurrentUser.uid)
                .update({
                    profilePicture: IsProfilePicChanged ? profilePicture : passengerData.profilePicture,
                    firstName: firstName,
                    lastName: lastName,
                    dateOfBirth: dateOfBirth,
                    Email: Email
                })

                .then(() => {
                    setToastMsg('Done');
                });
            navigation.navigate('PassengerHomeScreen')
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <ScrollView style={styles.rootContainer}>
            <View style={styles.headerContainer}>
                <CustomHeader iconname={'chevron-back-circle'} color={Colors.white} onPress={() => { navigation.goBack() }}
                    source={require('../../Assets/Images/URWhiteLogo.png')}
                />
            </View>
            <View style={{ width: width }}>
                <View style={styles.upperContainer}>
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
                        <CustomButton text='Save' onPress={askScreenHandler} />
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
    headerContainer: {
        backgroundColor: Colors.fontColor
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