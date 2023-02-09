import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, KeyboardAvoidingView, ScrollView, Image, PermissionsAndroid, ToastAndroid, ActivityIndicator, Alert } from 'react-native'
import { TextInput, Provider } from 'react-native-paper';
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import CustomButton from '../../Components/CustomButton';
import DropDown from "react-native-paper-dropdown";
import { TouchableOpacity } from 'react-native-gesture-handler';
import ModalImg from '../../Components/ModalImg';
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';


export default function DriverVehicleEdit({ navigation, route }) {
    //storing state
    const { vehicleDetails } = route.params;
    useEffect(() => {
        async function fetchUrl() {
            setLoading(true);

            if (vehicleDetails.vehiclePicFront.length) {
               
                const vehicleFrontPicUrl = await storage().ref(vehicleDetails.vehiclePicFront).getDownloadURL();
                setVehiclePicFront(vehicleFrontPicUrl);
           
            }
            
            
            if (vehicleDetails.vehiclePicBack.length) {
               
                const vehicleBackPicUrl = await storage().ref(vehicleDetails.vehiclePicBack).getDownloadURL();
                setVehiclePicBack(vehicleBackPicUrl);

            }
            
            
            if (vehicleDetails.vehicleNumPlatePic.length) {

                const vehicleNumPlatePicUrl = await storage().ref(vehicleDetails.vehicleNumPlatePic).getDownloadURL();
                setVehicleNumPlatePic(vehicleNumPlatePicUrl);
            }

            setLoading(false);
        }
        
        fetchUrl();
        fetchCategories();
    }, [])
    const fetchCategories = async () => {
        firestore()
            .collection('Categories')
            .doc("8w6hVPveXKR6kTvYVWwy")
            .onSnapshot((documentSnapshot) => {
                const GetUserData = documentSnapshot.data();
                // console.log(GetUserData.categories[0].categoryName);
                let cats = GetUserData.categories;
                let catName = []
                cats.forEach(function (item) {
                    catName.push({ label: item.carName, value: item.carName });
                });
                setMyCategories(catName);
            });
    }

    //check status start
    const [isVehFrontPicUpdated, setIsVehicleFrontPicUpdated] = useState(false);
    const [isVehBackPicUpdated, setIsVehicleBackPicUpdated] = useState(false);
    const [isVehNumPlatePicUpdated, setIsVehicleNumPlatePicUpdated] = useState(false);
    //check status end
    const [myCategories, setMyCategories] = useState([])
    const [vehicleData, setVehicleData] = useState(vehicleDetails);
    const [loading, setLoading] = useState(false);
    const [vehicleName, setVehicleName] = useState(vehicleData.vehicleName);
    const [vehicleModel, setVehicleModel] = useState(vehicleData.vehicleModel);
    const [vehicleNumPlate, setVehicleNumPlate] = useState(vehicleData.vehicleNumPlate);
    const [vehicleCategory, setVehicleCategory] = useState(vehicleData.vehicleCategory);
    const [showDropDown, setShowDropDown] = useState(false);
    // console.log(categories);
    //error state
    const [vehicleNameError, setVehicleNameError] = useState(false)
    const [vehicleModelError, setVehicleModelError] = useState(false);
    const [vehicleNumPlateError, setVehicleNumPlateError] = useState(false);
    const [vehicleCategoryError, setVehicleCategoryError] = useState(false);


    //Documents Function start
    const setToastMsg = (msg) => {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    };

    //vehicle Front Images start
    const [visible1, setVisible1] = useState(false);
    const showModal1 = () => { setVisible1(true); }
    const hideModal1 = () => setVisible1(false);
    const [vehiclePicFront, setVehiclePicFront] = useState('');
    const vehicleFrontDefaultImg = require('../../Assets/Images/carFront.png');

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
                setVehiclePicFront(result.assets[0].uri);
                setIsVehicleFrontPicUpdated(true);
            }
        }
    };
    const removeImage = () => {
        hideModal1();
        setVehiclePicFront('');
        setIsVehicleFrontPicUpdated(false);
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
            setVehiclePicFront(result.assets[0].uri);
            setIsVehicleFrontPicUpdated(true);
        }
    };
    //vehicle front images end

    //vehicle back images start
    const [vehBackVisible, setVehBackVisible] = useState(false);
    const showVehBackModal = () => { setVehBackVisible(true) }
    const hideVehBackModal = () => { setVehBackVisible(false) }
    const [vehiclePicBack, setVehiclePicBack] = useState('');
    const vehicleBackDefaultImg = require('../../Assets/Images/carBack.png');
    const openCameraVehicleBack = async () => {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const result = await ImagePicker.launchCamera(options);
            if (result.didCancel) {
                hideVehBackModal();
                setToastMsg('Cancelled image selection');
            } else if (result.errorCode == 'permission') {
                hideVehBackModal();
                setToastMsg('Permission Not Satisfied');
            } else if (result.errorCode == 'others') {
                hideVehBackModal();
                setToastMsg(result.errorMessage);
            } else {
                hideVehBackModal();
                setVehiclePicBack(result.assets[0].uri);
                setIsVehicleBackPicUpdated(true);
            }
        }
    };
    const removeImageVehicleBack = () => {
        hideVehBackModal();
        setVehiclePicBack('');
        setIsVehicleBackPicUpdated(false);
    };
    const openGalleryVehicleBack = async () => {
        const result = await ImagePicker.launchImageLibrary(options);
        if (result.didCancel) {
            hideVehBackModal();
            setToastMsg('Cancelled image selection');
        } else if (result.errorCode == 'permission') {
            hideVehBackModal();
            setToastMsg('Permission Not Satisfied');
        } else if (result.errorCode == 'others') {
            hideVehBackModal();
            setToastMsg(result.errorMessage);
        } else {
            hideVehBackModal();
            setVehiclePicBack(result.assets[0].uri);
            setIsVehicleBackPicUpdated(true);
        }
    };
    //vehicle back images end

    //number plate images function start
    const [vehNumPlateVisible, setVehNumPlateVisible] = useState(false);
    const showVehNumPlateModal = () => { setVehNumPlateVisible(true) }
    const hideVehNumPlateModal = () => { setVehNumPlateVisible(false) }
    const [vehicleNumPlatePic, setVehicleNumPlatePic] = useState('');
    const vehicleNumPlateDefaultImg = require('../../Assets/Images/numPlate.png');
    const openCameraVehicleNumPlate = async () => {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const result = await ImagePicker.launchCamera(options);
            if (result.didCancel) {
                hideVehNumPlateModal();
                setToastMsg('Cancelled image selection');
            } else if (result.errorCode == 'permission') {
                hideVehNumPlateModal();
                setToastMsg('Permission Not Satisfied');
            } else if (result.errorCode == 'others') {
                hideVehNumPlateModal();
                setToastMsg(result.errorMessage);
            } else {
                hideVehNumPlateModal();
                setVehicleNumPlatePic(result.assets[0].uri);
                setIsVehicleNumPlatePicUpdated(true);
            }
        }
    };
    const removeImageVehicleNumPlate = () => {
        hideVehNumPlateModal();
        setVehicleNumPlatePic('');
        setIsVehicleNumPlatePicUpdated(false);
    };
    const openGalleryVehicleNumPlate = async () => {
        const result = await ImagePicker.launchImageLibrary(options);
        if (result.didCancel) {
            hideVehNumPlateModal();
            setToastMsg('Cancelled image selection');
        } else if (result.errorCode == 'permission') {
            hideVehNumPlateModal();
            setToastMsg('Permission Not Satisfied');
        } else if (result.errorCode == 'others') {
            hideVehNumPlateModal();
            setToastMsg(result.errorMessage);
        } else {
            hideVehNumPlateModal();
            setVehicleNumPlatePic(result.assets[0].uri);
            setIsVehicleNumPlatePicUpdated(true);
        }
    };
    //number plate images function end

    //Documents Function end

    //fields Validation start
    const driverModeHandler = async () => {
        if (vehicleName == '' ||
            vehicleModel == '' ||
            vehicleNumPlate == '' ||
            vehicleCategory == '' ||
            vehiclePicFront == '' ||
            vehiclePicBack == '' ||
            vehicleNumPlatePic == ''
        ) {
            if (vehicleName == '') {
                setToastMsg("Vehicle Name cannot be empty");
                setVehicleNameError(true);
                return false;
            }
            if (vehicleModel == '') {
                setToastMsg("Please enter vehicle model");
                setVehicleModelError(true);
                return false;
            }
            if (vehicleNumPlate == '') {
                setToastMsg("please enter vehicle number plate");
                setVehicleNumPlateError(true);
                return false;
            }
            if (vehicleCategory == '') {
                setToastMsg("Choose vehicle category");
                setVehicleCategoryError(true);
                return false;
            }
            if (vehiclePicFront == '') {
                setToastMsg("Please upload vehicle front picture");
                return false;
            }
            if (vehiclePicBack == '') {
                setToastMsg("Please upload vehicle back picture");
                return false;
            }
            if (vehicleNumPlatePic == '') {
                setToastMsg("Please upload vehicle number plate picture");
                return false;
            }
        }
        else {
            Alert.alert(
                "Confirmation",
                "Are you sure you want to make changes to vehicle details?",
                [
                    {
                        text: "Cancel",
                        onPress: () => { return false },
                        style: "cancel"
                    },
                    { text: "OK", onPress: () => updateVehicle() }
                ]
            );

        }
    }

    const updateVehicle = async () => {
        try {
            setLoading(true);
            const CurrentUser = auth().currentUser;
            if (isVehFrontPicUpdated) {
                const vehicleReferenceFront = storage().ref(vehiclePicFront);
                await vehicleReferenceFront.putFile(vehiclePicFront);
            }
            if (isVehBackPicUpdated) {
                const vehicleReferenceBack = storage().ref(vehiclePicBack);
                await vehicleReferenceBack.putFile(vehiclePicBack);
            }
            if (isVehNumPlatePicUpdated) {
                const vehicleReferenceNumPlate = storage().ref(vehicleNumPlatePic);
                await vehicleReferenceNumPlate.putFile(vehicleNumPlatePic);
            }
            firestore()
                .collection('Drivers')
                .doc(CurrentUser.uid)
                .update({
                    vehicleDetails: {
                        vehicleName: vehicleName,
                        vehicleModel: vehicleModel,
                        vehicleNumPlate: vehicleNumPlate,
                        vehicleCategory: vehicleCategory,
                        vehiclePicFront: isVehFrontPicUpdated ? vehiclePicFront : vehicleData.vehiclePicFront,
                        vehiclePicBack: isVehBackPicUpdated ? vehiclePicBack : vehicleData.vehiclePicBack,
                        vehicleNumPlatePic: isVehNumPlatePicUpdated ? vehicleNumPlatePic : vehicleData.vehicleNumPlatePic,
                    }
                })
                .then(() => {
                    setLoading(false);
                    console.log('User added!');
                });

            navigation.navigate('DriverHomeScreen')
        } catch (err) {
            console.log(err)
        }

    }
    //fields Validation end

    return (
        <Provider>
            {loading ? <View style={styles.activityIndicatorStyles}><ActivityIndicator size="large" color={Colors.fontColor} /></View> :
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <CustomHeader iconname={'chevron-back-circle'} color={Colors.white}
                            source={require('../../Assets/Images/URWhiteLogo.png')}
                            onPress={() => { navigation.goBack() }} />
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <KeyboardAvoidingView>
                            <Text style={styles.headingStyle}>Vehicle Details Edit</Text>
                            <View style={styles.midContainer}>
                                <TextInput
                                    style={styles.fieldStyles}
                                    label='Vehicle Name'
                                    value={vehicleName}
                                    error={vehicleNameError}
                                    textColor={Colors.black}
                                    onChangeText={setVehicleName}
                                    selectionColor={Colors.black}
                                    underlineColor={Colors.black}
                                    activeOutlineColor={Colors.fontColor}
                                    activeUnderlineColor={Colors.fontColor}
                                    onFocus={() => { setVehicleNameError(false) }}
                                />
                                <TextInput
                                    style={styles.fieldStyles}
                                    label='Vehicle Model'
                                    value={vehicleModel}
                                    error={vehicleModelError}
                                    onChangeText={setVehicleModel}
                                    selectionColor={Colors.black}
                                    underlineColor={Colors.black}
                                    activeOutlineColor={Colors.fontColor}
                                    activeUnderlineColor={Colors.fontColor}
                                    onFocus={() => { setVehicleModelError(false) }}
                                />
                                <TextInput
                                    style={styles.fieldStyles}
                                    label='Vehicle Number Plate'
                                    value={vehicleNumPlate}
                                    error={vehicleNumPlateError}
                                    onChangeText={setVehicleNumPlate}
                                    selectionColor={Colors.black}
                                    underlineColor={Colors.black}
                                    activeOutlineColor={Colors.fontColor}
                                    activeUnderlineColor={Colors.fontColor}
                                    onFocus={() => { setVehicleNumPlateError(false) }}
                                />
                                <View style={styles.dropDownContainer}>
                                    <DropDown
                                        label={"Category"}
                                        mode={"outlined"}
                                        visible={showDropDown}
                                        showDropDown={() => setShowDropDown(true)}
                                        onDismiss={() => setShowDropDown(false)}
                                        value={vehicleCategory}
                                        setValue={setVehicleCategory}
                                        list={myCategories}
                                        dropDownItemSelectedTextStyle={{ color: Colors.white }}
                                        dropDownItemSelectedStyle={{ backgroundColor: Colors.fontColor }}
                                    /></View>
                            </View>
                            <View style={styles.vehiclePicContainer}><Text style={styles.innerHeading}>Upload Vehicle Pictures</Text>
                                <View style={styles.fieldPicContainer}>
                                    <TouchableOpacity onPress={showModal1}>
                                        <Image
                                            style={styles.imgStyle}
                                            resizeMode="contain"
                                            source={vehiclePicFront ? { uri: vehiclePicFront } : vehicleFrontDefaultImg}
                                        /></TouchableOpacity>
                                    <TouchableOpacity onPress={showVehBackModal}>
                                        <Image
                                            style={styles.imgStyle}
                                            resizeMode="contain"
                                            source={vehiclePicBack ? { uri: vehiclePicBack } : vehicleBackDefaultImg}
                                        /></TouchableOpacity>
                                </View></View>
                            <View style={styles.vehiclePicContainer}><Text style={styles.innerHeading}>Upload Number Plate Picture</Text>
                                <View >
                                    <TouchableOpacity onPress={showVehNumPlateModal}>
                                        <Image
                                            style={styles.numPlateImgStyle}
                                            resizeMode="contain"
                                            source={vehicleNumPlatePic ? { uri: vehicleNumPlatePic } : vehicleNumPlateDefaultImg}
                                        /></TouchableOpacity>
                                </View></View>
                            <View style={styles.btnContainer}>
                                <CustomButton text='Save' onPress={driverModeHandler} />
                            </View>
                        </KeyboardAvoidingView></ScrollView>
                    <ModalImg
                        modalVisible={visible1}
                        openGallery={openGallery}
                        openCamera={openCamera}
                        removeImage={removeImage}
                        closeModal={hideModal1}
                    />
                    <ModalImg
                        modalVisible={vehBackVisible}
                        openGallery={openGalleryVehicleBack}
                        openCamera={openCameraVehicleBack}
                        removeImage={removeImageVehicleBack}
                        closeModal={hideVehBackModal}
                    />
                    <ModalImg
                        modalVisible={vehNumPlateVisible}
                        openGallery={openGalleryVehicleNumPlate}
                        openCamera={openCameraVehicleNumPlate}
                        removeImage={removeImageVehicleNumPlate}
                        closeModal={hideVehNumPlateModal}
                    />
                </View>
            }


        </Provider>
    )
}

const styles = StyleSheet.create({
    activityIndicatorStyles: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnContainer: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    dropDownContainer: {
        width: '80%'
    },
    fieldPicContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    fieldStyles: {
        width: '80%',
        margin: 10,
    },
    headerContainer: {
        backgroundColor: Colors.fontColor
    },
    headingStyle: {
        margin: 10,
        textAlign: 'center',
        fontSize: 20,
        color: Colors.fontColor,
        fontFamily: 'Poppins-Medium',
    },
    innerHeading: {
        margin: 5,
        fontSize: 18,
        color: Colors.fontColor,
        textAlign: 'center',
        fontFamily: 'Poppins-Medium',
    },
    imgStyle: {
        width: 80,
        height: 80
    },
    midContainer: {
        alignItems: 'center',
    },
    numPlateImgStyle: {
        width: 80,
        height: 80,
        alignSelf: 'center'
    },
    vehiclePicContainer: {
        width: '80%',
        alignSelf: 'center',
        margin: 10
    }
})