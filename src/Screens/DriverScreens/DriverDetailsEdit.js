import React, { useState } from 'react'
import { ScrollView, StyleSheet, useWindowDimensions, View, Image, KeyboardAvoidingView, ToastAndroid, PermissionsAndroid, TouchableOpacity, Alert } from 'react-native'
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import { TextInput } from 'react-native-paper';
import CustomButton from '../../Components/CustomButton';
import ModalImg from '../../Components/ModalImg';
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'react-native-image-picker';

export default function DriverDetailsEdit({ navigation, route }) {
    const { driverData, profilePicUrl } = route.params;
    const { height, width } = useWindowDimensions()
    const [firstName, setFirstName] = useState(driverData.firstName);
    const [lastName, setLastName] = useState(driverData.lastName);
    const [Email, setEmail] = useState(driverData.Email);
    const [address, setAddress] = useState(driverData.address);
    const [city, setCity] = useState(driverData.city);
    const [phoneNumber, setPhoneNumber] = useState(driverData.phoneNumber);
    //error fields start
    const [firstNameError, setFirstNameError] = useState(false)
    const [lastNameError, setLastNameError] = useState(false)
    const [EmailError, setEmailError] = useState(false)
    const [addressError, setAddressError] = useState(false)
    const [cityError, setCityError] = useState(false);
    const [phoneNumberError, setPhoneNumberError] = useState(false)
    //error fields end
    //Profile Pic Functions start
    const setToastMsg = (msg) => {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    };
    const [visible1, setVisible1] = useState(false);
    const showModal1 = () => { setVisible1(true); }
    const hideModal1 = () => setVisible1(false);
    const [profilePicture, setprofilePicture] = useState(profilePicUrl);
    const [isProfilePicChanged, setIsProfilePicChanged] = useState(false);

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
    const strongRegexphone = new RegExp("\\+\\d+$");
    const updateDataHandler = async () => {
        if (firstName == '' ||
            lastName == '' ||
            Email == '' ||
            !strongRegex.test(Email) ||
            !strongRegexphone.test(phoneNumber) ||
            phoneNumber == '' ||
            phoneNumber.length < 10 ||
            isNaN(phoneNumber) ||
            address == '' ||
            city == '' ||
            profilePicture == ''
        ) {
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
            if (address == '') {
                setToastMsg("Address cannot be empty");
                setAddressError(true);
                return false;
            }
            if (city == '') {
                setToastMsg("City cannot be empty");
                setCityError(true);
                return false;
            }
            if (phoneNumber == '') {
                setPhoneNumberError(true)
                setToastMsg("Phone Number cannot be empty");
                return false;
            }
            if (phoneNumber.length < 10) {
                setPhoneNumberError(true)
                setToastMsg("Phone Number Must Contain 10 digits");
                return false;
            }
            if (isNaN(phoneNumber)) {
                setPhoneNumberError(true)
                setToastMsg("Phone Number Must be in Numbers");
                return false;
            }
            if (!strongRegexphone.test(phoneNumber)) {
                setPhoneNumberError(true)
                setToastMsg("Please include '+' sign and country code");
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
            if (isProfilePicChanged) {
                const reference = storage().ref(profilePicture);
                const pathToFile = profilePicture;
                await reference.putFile(pathToFile);
            }
            firestore()
                .collection('Drivers')
                .doc(CurrentUser.uid)
                .update({
                    profilePicture: isProfilePicChanged ? profilePicture : driverData.profilePicture,
                    firstName: firstName,
                    lastName: lastName,
                    Email: Email,
                    address: address,
                    city: city,
                    phoneNumber: phoneNumber,
                    id : currentUser.uid
                
                })
                .then(() => {
                    ToastAndroid.show('Done', ToastAndroid.SHORT);
                });
            navigation.navigate('DriverHomeScreen')
        } catch (error) {
            console.log(err)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <CustomHeader iconname={'chevron-back-circle'} color={Colors.white} onPress={() => { navigation.goBack() }}
                    source={require('../../Assets/Images/URWhiteLogo.png')}
                />
            </View>
            <ScrollView style={styles.rootContainer}>
                <View style={{ width: width }}>
                    <View style={styles.upperContainer}>
                        {/* <Text style={styles.editText} >Edit Driver Profile</Text> */}
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
                            <TextInput
                                style={styles.fieldStyles}
                                label='Address'
                                value={address}
                                error={addressError}
                                onChangeText={setAddress}
                                selectionColor={Colors.black}
                                underlineColor={Colors.black}
                                activeOutlineColor={Colors.fontColor}
                                activeUnderlineColor={Colors.fontColor}
                                onFocus={() => { setAddressError(false) }}
                            />
                            <TextInput
                                style={styles.fieldStyles}
                                label='City'
                                value={city}
                                error={cityError}
                                onChangeText={setCity}
                                selectionColor={Colors.black}
                                underlineColor={Colors.black}
                                activeOutlineColor={Colors.fontColor}
                                activeUnderlineColor={Colors.fontColor}
                                onFocus={() => { setCityError(false) }}
                            />
                            <TextInput
                                style={styles.fieldStyles}
                                label='Phone Number'
                                keyboardType='phone-pad'
                                value={phoneNumber}
                                error={phoneNumberError}
                                onChangeText={setPhoneNumber}
                                selectionColor={Colors.black}
                                underlineColor={Colors.black}
                                activeOutlineColor={Colors.fontColor}
                                activeUnderlineColor={Colors.fontColor}
                                onFocus={() => { setPhoneNumberError(false) }}
                            />
                        </View>
                        <View style={styles.btnContainer}>
                            <CustomButton text='Save' onPress={updateDataHandler} />
                        </View>
                    </KeyboardAvoidingView>
                </View>
                <ModalImg
                    modalVisible={visible1}
                    openGallery={openGallery}
                    openCamera={openCamera}
                    removeImage={removeImage}
                    closeModal={hideModal1}
                />
            </ScrollView></View>
    )
}

const styles = StyleSheet.create({
    btnContainer: {
        marginVertical: 20,
        alignItems: 'center'
    },
    container: {
        flex: 1
    },
    fieldStyles: {
        backgroundColor: 'transparent',
        width: '80%',
        margin: 10
    },
    headerContainer: {
        backgroundColor: Colors.fontColor
    },
    imagesStyle: {
        width: 80,
        height: 80,
    },
    itemTextStyle: {
        fontSize: 15,
        color: Colors.black,
        fontFamily: 'Poppins-Medium',
    },
    itemContainer: {
        alignItems: 'center'
    },
    midContainer: {
        alignItems: 'center',
    },
    proPic: {
        width: 100,
        height: 100,
        borderRadius: 50
    },
    picsHeadingStyle: {
        margin: 5,
        fontSize: 18,
        color: Colors.fontColor,
        textAlign: 'center',
        fontFamily: 'Poppins-Medium',
    },
    picsContainer: {
        // backgroundColor: 'red',
        margin: 4
    },
    picItemContainer: {
        flexDirection: 'row',
        // backgroundColor: 'green',
        alignSelf: 'center',
        width: '80%',
        justifyContent: 'space-between'
    },
    // editText: {
    //     fontFamily: 'Poppins-Medium',
    //     color: Colors.fontColor,
    //     margin: 5,
    //     fontSize: 20
    // },
    rootContainer: {
        backgroundColor: Colors.white
    },
    upperContainer: {
        margin: 10,
        alignItems: 'center',
    },

})