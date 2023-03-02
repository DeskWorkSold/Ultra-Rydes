import React, { useEffect, useState } from 'react'
import { ScrollView, Text, StyleSheet, useWindowDimensions, View, Image, KeyboardAvoidingView, ToastAndroid, PermissionsAndroid, TouchableOpacity, ActivityIndicator } from 'react-native'
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

export default function DriverDetailScreen({ navigation }) {
    const { height, width } = useWindowDimensions()
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [Email, setEmail] = useState('');
    const [cnic, setCinic] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [rating,setRating] = useState(4.9)
    //error fields start
    const [firstNameError, setFirstNameError] = useState(false)
    const [lastNameError, setLastNameError] = useState(false)
    const [dateOfBirthError, setDateOfBirthError] = useState(false)
    const [EmailError, setEmailError] = useState(false)
    const [CnicError, setCnicError] = useState(false)
    const [addressError, setAddressError] = useState(false)
    const [cityError, setCityError] = useState(false);
    const [phoneNumberError, setPhoneNumberError] = useState(false)
    //error fields end
    //Date picker
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [Date, setDate] = useState('');
    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
        setDateOfBirthError(false);
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
    const showModal1 = () => { setVisible1(true); }
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
                setprofilePicture(result.assets[0].uri);
            }
        }
    };
    const removeImage = () => {
        hideModal1();
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
            setprofilePicture(result.assets[0].uri);
        }
    };

    //profile pic functions end

    //documents upload functions start

    //for Cnic Front Pic start
    const defaultDocImage = require('../Assets/Images/uploadDocs.png');
    const [cnicFrontVisible, setCnicFrontVisible] = useState(false);
    const [cnicFrontImg, setCnicFrontImg] = useState('');
    const cnicFrontShowModal = () => setCnicFrontVisible(true);
    const cnicFrontHideModal = () => setCnicFrontVisible(false);
    const cnicFrontOpenCamera = async () => {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const result = await ImagePicker.launchCamera(options);
            if (result.didCancel) {
                cnicFrontHideModal();
                setToastMsg('Cancelled image selection');
            } else if (result.errorCode == 'permission') {
                cnicFrontHideModal();
                setToastMsg('Permission Not Satisfied');
            } else if (result.errorCode == 'others') {
                cnicFrontHideModal();
                setToastMsg(result.errorMessage);
            } else {
                cnicFrontHideModal();
                setCnicFrontImg(result.assets[0].uri);
            }
        }
    };

    const cnicFrontRemoveImage = () => {
        cnicFrontHideModal();
        setCnicFrontImg('');
    };
    const cnicFrontOpenGallery = async () => {
        const result = await ImagePicker.launchImageLibrary(options);
        if (result.didCancel) {
            cnicFrontHideModal();
            setToastMsg('Cancelled image selection');
        } else if (result.errorCode == 'permission') {
            cnicFrontHideModal();
            setToastMsg('Permission Not Satisfied');
        } else if (result.errorCode == 'others') {
            cnicFrontHideModal();
            setToastMsg(result.errorMessage);
        } else {
            cnicFrontHideModal();
            setCnicFrontImg(result.assets[0].uri);
        }
    };
    //for Cnic Front Pic end

    //for Cnic Back Pic start
    const [cnicBackVisible, setCnicBackVisible] = useState(false);
    const [cnicBackImg, setCnicBackImg] = useState('');
    const cnicBackShowModal = () => setCnicBackVisible(true);
    const cnicBackHideModal = () => setCnicBackVisible(false);
    const cnicBackOpenCamera = async () => {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const result = await ImagePicker.launchCamera(options);
            if (result.didCancel) {
                cnicBackHideModal();
                setToastMsg('Cancelled image selection');
            } else if (result.errorCode == 'permission') {
                cnicBackHideModal();
                setToastMsg('Permission Not Satisfied');
            } else if (result.errorCode == 'others') {
                cnicBackHideModal();
                setToastMsg(result.errorMessage);
            } else {
                cnicBackHideModal();
                setCnicBackImg(result.assets[0].uri);
            }
        }
    };

    const cnicBackRemoveImage = () => {
        cnicBackHideModal();
        setCnicBackImg('');
    };
    const cnicBackOpenGallery = async () => {
        const result = await ImagePicker.launchImageLibrary(options);
        if (result.didCancel) {
            cnicBackHideModal();
            setToastMsg('Cancelled image selection');
        } else if (result.errorCode == 'permission') {
            cnicBackHideModal();
            setToastMsg('Permission Not Satisfied');
        } else if (result.errorCode == 'others') {
            cnicBackHideModal();
            setToastMsg(result.errorMessage);
        } else {
            cnicBackHideModal();
            setCnicBackImg(result.assets[0].uri);
        }
    };
    //for Cnic Back Pic end

    //for license front pic start
    const [licenseFrontVisible, setLicenseFrontVisible] = useState(false);
    const [licenseFrontImg, setLicenseFrontImg] = useState('');
    const licenseFrontShowModal = () => setLicenseFrontVisible(true);
    const licenseFrontHideModal = () => setLicenseFrontVisible(false);
    const licenseFrontOpenCamera = async () => {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const result = await ImagePicker.launchCamera(options);
            if (result.didCancel) {
                licenseFrontHideModal();
                setToastMsg('Cancelled image selection');
            } else if (result.errorCode == 'permission') {
                licenseFrontHideModal();
                setToastMsg('Permission Not Satisfied');
            } else if (result.errorCode == 'others') {
                licenseFrontHideModal();
                setToastMsg(result.errorMessage);
            } else {
                licenseFrontHideModal();
                setLicenseFrontImg(result.assets[0].uri);
            }
        }
    };

    const licenseFrontRemoveImage = () => {
        licenseFrontHideModal();
        setLicenseFrontImg('');
    };
    const licenseFrontOpenGallery = async () => {
        const result = await ImagePicker.launchImageLibrary(options);
        if (result.didCancel) {
            licenseFrontHideModal();
            setToastMsg('Cancelled image selection');
        } else if (result.errorCode == 'permission') {
            licenseFrontHideModal();
            setToastMsg('Permission Not Satisfied');
        } else if (result.errorCode == 'others') {
            licenseFrontHideModal();
            setToastMsg(result.errorMessage);
        } else {
            licenseFrontHideModal();
            setLicenseFrontImg(result.assets[0].uri);
        }
    };
    //for license front pic end
    //for license back pic start
    const [licenseBackVisible, setLicenseBackVisible] = useState(false);
    const [licenseBackImg, setLicenseBackImg] = useState('');
    const licenseBackShowModal = () => setLicenseBackVisible(true);
    const licenseBackHideModal = () => setLicenseBackVisible(false);
    const licenseBackOpenCamera = async () => {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const result = await ImagePicker.launchCamera(options);
            if (result.didCancel) {
                licenseBackHideModal();
                setToastMsg('Cancelled image selection');
            } else if (result.errorCode == 'permission') {
                licenseBackHideModal();
                setToastMsg('Permission Not Satisfied');
            } else if (result.errorCode == 'others') {
                licenseBackHideModal();
                setToastMsg(result.errorMessage);
            } else {
                licenseBackHideModal();
                setLicenseBackImg(result.assets[0].uri);
            }
        }
    };

    const licenseBackRemoveImage = () => {
        licenseBackHideModal();
        setLicenseBackImg('');
    };
    const licenseBackOpenGallery = async () => {
        const result = await ImagePicker.launchImageLibrary(options);
        if (result.didCancel) {
            licenseBackHideModal();
            setToastMsg('Cancelled image selection');
        } else if (result.errorCode == 'permission') {
            licenseBackHideModal();
            setToastMsg('Permission Not Satisfied');
        } else if (result.errorCode == 'others') {
            licenseBackHideModal();
            setToastMsg(result.errorMessage);
        } else {
            licenseBackHideModal();
            setLicenseBackImg(result.assets[0].uri);
        }
    };
    //for license back pic end

    
useEffect(()=>{

    let minutes = new Date().getMinutes()

    if(minutes <= 15 || minutes >=45 ){
        setRating(5)
    }else{
        setRating(4.9)
    }

},[])




    //docments upload functions end 
    const strongRegex = new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$");
    const strongRegexphone = new RegExp("\\+\\d+$");
    const askScreenHandler = async () => {
        if (firstName == '' ||
            lastName == '' ||
            dateOfBirth == '' ||
            Email == '' ||
            !strongRegex.test(Email) ||
            !strongRegexphone.test(phoneNumber) ||
            phoneNumber == '' ||
            phoneNumber.length < 10 ||
            isNaN(phoneNumber) ||
            cnic == '' ||
            address == '' ||
            city == '' ||
            profilePicture == '' ||
            cnicFrontImg == '' ||
            cnicBackImg == '' ||
            licenseFrontImg == '' ||
            licenseBackImg == ''
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
            if (cnic == '') {
                setToastMsg("Cnic cannot be empty");
                setCnicError(true);
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
            if (cnicFrontImg == '') {
                setToastMsg("Please upload Cnic front Picture");
                return false;
            }
            if (cnicBackImg == '') {
                setToastMsg("Please upload Cnic back Picture");
                return false;
            }
            if (licenseFrontImg == '') {
                setToastMsg("Please upload license front Picture");
                return false;
            }
            if (licenseBackImg == '') {
                setToastMsg("Please upload license back Picture");
                return false;
            }
        }
        else {
            try {
                setLoading(true);
                const CurrentUser = auth().currentUser;
                const reference = storage().ref(profilePicture);
                const cnicReferenceFront = storage().ref(cnicFrontImg);
                const cnicReferenceBack = storage().ref(cnicBackImg);
                const licenseReferenceFront = storage().ref(licenseFrontImg);
                const licenseReferenceBack = storage().ref(licenseBackImg);
                const pathToFile = profilePicture;
                await reference.putFile(pathToFile);
                await cnicReferenceFront.putFile(cnicFrontImg);
                await cnicReferenceBack.putFile(cnicBackImg);
                await licenseReferenceFront.putFile(licenseFrontImg);
                await licenseReferenceBack.putFile(licenseBackImg);
                firestore()
                    .collection('Drivers')
                    .doc(CurrentUser.uid)
                    .set({
                        profilePicture: profilePicture,
                        firstName: firstName,
                        lastName: lastName,
                        dateOfBirth: dateOfBirth,
                        Email: Email,
                        cnic: cnic,
                        address: address,
                        city: city,
                        phoneNumber: phoneNumber,
                        cnicFrontImg: cnicFrontImg,
                        cnicBackImg: cnicBackImg,
                        licenseFrontImg: licenseFrontImg,
                        licenseBackImg: licenseBackImg,
                        id : CurrentUser.uid,
                        date : new Date(),
                        rating : rating
                    })
                    .then(() => {
                        console.log('User added!');
                    });
                setLoading(false);
                navigation.navigate('DriverRoutes', { screen: 'DriverVehicleAdd' });
            } catch (err) {
                console.log(err)
            }
        }
    }

    return (
        <View style={styles.mainRootContainer}>
            {loading ? <View style={styles.activityIndicatorStyles}><ActivityIndicator size="large" color={Colors.fontColor} /></View> :
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <CustomHeader iconname={'chevron-back-circle'} color={Colors.white} onPress={() => { navigation.goBack() }}
                            source={require('../Assets/Images/URWhiteLogo.png')}
                        />
                    </View>
                    <ScrollView style={styles.rootContainer}>
                        <View style={{ width: width }}>
                            <View style={styles.upperContainer}>
                                <Text style={styles.regText} >Driver Registration</Text>
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
                                        outlineColor={Colors.gray}
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
                                    <TextInput
                                        style={styles.fieldStyles}
                                        label='Cnic'
                                        value={cnic}
                                        error={CnicError}
                                        onChangeText={setCinic}
                                        selectionColor={Colors.black}
                                        underlineColor={Colors.black}
                                        activeOutlineColor={Colors.fontColor}
                                        activeUnderlineColor={Colors.fontColor}
                                        onFocus={() => { setCnicError(false) }}
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
                                        value={phoneNumber}
                                        error={phoneNumberError}
                                        keyboardType='phone-pad'
                                        onChangeText={setPhoneNumber}
                                        selectionColor={Colors.black}
                                        underlineColor={Colors.black}
                                        activeOutlineColor={Colors.fontColor}
                                        activeUnderlineColor={Colors.fontColor}
                                        onFocus={() => { setPhoneNumberError(false) }}
                                    />
                                </View>
                                <View style={styles.picsContainer}>
                                    <Text style={styles.picsHeadingStyle}>Cnic Pictures</Text>
                                    <View style={styles.picItemContainer}>
                                        <TouchableOpacity onPress={cnicFrontShowModal} style={styles.itemContainer}>
                                            <Image
                                                style={styles.imagesStyle}
                                                resizeMode="contain"
                                                source={cnicFrontImg ? { uri: cnicFrontImg } : defaultDocImage}
                                            />
                                            <Text style={styles.itemTextStyle}>Front</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={cnicBackShowModal} style={styles.itemContainer}>
                                            <Image
                                                style={styles.imagesStyle}
                                                resizeMode="contain"
                                                source={cnicBackImg ? { uri: cnicBackImg } : defaultDocImage}
                                            />
                                            <Text style={styles.itemTextStyle}>Back</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.picsContainer}>
                                    <Text style={styles.picsHeadingStyle}>License Pictures</Text>
                                    <View style={styles.picItemContainer}>
                                        <TouchableOpacity style={styles.itemContainer} onPress={licenseFrontShowModal} >
                                            <Image
                                                style={styles.imagesStyle}
                                                resizeMode="contain"
                                                source={licenseFrontImg ? { uri: licenseFrontImg } : defaultDocImage}
                                            />
                                            <Text style={styles.itemTextStyle}>Front</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.itemContainer} onPress={licenseBackShowModal}>
                                            <Image
                                                style={styles.imagesStyle}
                                                resizeMode="contain"
                                                source={licenseBackImg ? { uri: licenseBackImg } : defaultDocImage}
                                            />
                                            <Text style={styles.itemTextStyle}>Back</Text>
                                        </TouchableOpacity>
                                    </View>
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
                        <ModalImg
                            modalVisible={cnicFrontVisible}
                            openGallery={cnicFrontOpenGallery}
                            openCamera={cnicFrontOpenCamera}
                            removeImage={cnicFrontRemoveImage}
                            closeModal={cnicFrontHideModal}
                        />
                        <ModalImg
                            modalVisible={cnicBackVisible}
                            openGallery={cnicBackOpenGallery}
                            openCamera={cnicBackOpenCamera}
                            removeImage={cnicBackRemoveImage}
                            closeModal={cnicBackHideModal}
                        />
                        <ModalImg
                            modalVisible={licenseFrontVisible}
                            openGallery={licenseFrontOpenGallery}
                            openCamera={licenseFrontOpenCamera}
                            removeImage={licenseFrontRemoveImage}
                            closeModal={licenseFrontHideModal}
                        />
                        <ModalImg
                            modalVisible={licenseBackVisible}
                            openGallery={licenseBackOpenGallery}
                            openCamera={licenseBackOpenCamera}
                            removeImage={licenseBackRemoveImage}
                            closeModal={licenseBackHideModal}
                        />
                    </ScrollView></View>}</View>
    )
}

const styles = StyleSheet.create({
    activityIndicatorStyles: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
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
    mainRootContainer: {
        flex: 1
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
    regText: {
        fontFamily: 'Poppins-Medium',
        color: Colors.fontColor,
        margin: 5,
        fontSize: 20

    },
    rootContainer: {
        backgroundColor: Colors.white
    },
    upperContainer: {
        margin: 10,
        alignItems: 'center',
    },

})