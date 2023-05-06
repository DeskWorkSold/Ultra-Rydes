import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  PermissionsAndroid,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import {TextInput, Provider} from 'react-native-paper';
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import CustomButton from '../../Components/CustomButton';
import DropDown from 'react-native-paper-dropdown';
import {TouchableOpacity} from 'react-native-gesture-handler';
import ModalImg from '../../Components/ModalImg';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

export default function DriverVehicleAdd({navigation}) {
  //storing state
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    firestore()
      .collection('Categories')
      .doc('8w6hVPveXKR6kTvYVWwy')
      .onSnapshot(documentSnapshot => {
        const GetUserData = documentSnapshot.data();
        // console.log(GetUserData.categories[0].categoryName);
        let cats = GetUserData.categories;
        let catName = [];
        cats.forEach(function (item) {
          catName.push({label: item.carName, value: item.carName});
        });
        setMyCategories(catName);
      });
  };
  const [myCategories, setMyCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumPlate, setVehicleNumPlate] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehicleColorError, setVehicleColorError] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);
  //error state
  const [vehicleNameError, setVehicleNameError] = useState(false);
  const [vehicleModelError, setVehicleModelError] = useState(false);
  const [vehicleNumPlateError, setVehicleNumPlateError] = useState(false);
  const [vehicleCategoryError, setVehicleCategoryError] = useState(false);

  //Documents Function start
  const setToastMsg = msg => {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  };

  //vehicle Front Images start
  const [visible1, setVisible1] = useState(false);
  const showModal1 = () => {
    setVisible1(true);
  };
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
        setVehiclePicFront(result.assets[0].uri);
      }
    }
  };
  const removeImage = () => {
    hideModal1();
    setVehiclePicFront('');
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
      setVehiclePicFront(result.assets[0].uri);
    }
  };
  //vehicle front images end

  //vehicle back images start
  const [vehBackVisible, setVehBackVisible] = useState(false);
  const showVehBackModal = () => {
    setVehBackVisible(true);
  };
  const hideVehBackModal = () => {
    setVehBackVisible(false);
  };
  const [vehiclePicBack, setVehiclePicBack] = useState('');
  const vehicleBackDefaultImg = require('../../Assets/Images/carBack.png');
  const openCameraVehicleBack = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      hideVehBackModal();
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
      }
    }
  };
  const removeImageVehicleBack = () => {
    hideVehBackModal();
    setVehiclePicBack('');
  };
  const openGalleryVehicleBack = async () => {
    hideVehBackModal();
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
    }
  };
  //vehicle back images end

  //number plate images function start
  const [vehNumPlateVisible, setVehNumPlateVisible] = useState(false);
  const showVehNumPlateModal = () => {
    setVehNumPlateVisible(true);
  };
  const hideVehNumPlateModal = () => {
    setVehNumPlateVisible(false);
  };
  const [vehicleNumPlatePic, setVehicleNumPlatePic] = useState('');
  const vehicleNumPlateDefaultImg = require('../../Assets/Images/numPlate.png');
  const openCameraVehicleNumPlate = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      hideVehNumPlateModal();
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
      }
    }
  };
  const removeImageVehicleNumPlate = () => {
    hideVehNumPlateModal();
    setVehicleNumPlatePic('');
  };
  const openGalleryVehicleNumPlate = async () => {
    hideVehNumPlateModal();
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
    }
  };
  //number plate images function end

  //Documents Function end

  //fields Validation start
  const driverModeHandler = async () => {
    if (
      vehicleName == '' ||
      vehicleModel == '' ||
      vehicleNumPlate == '' ||
      vehicleCategory == '' ||
      vehiclePicFront == '' ||
      vehiclePicBack == '' ||
      vehicleNumPlatePic == '' ||
      vehicleColor == ''
    ) {
      if (vehicleName == '') {
        setToastMsg('Vehicle Name cannot be empty');
        setVehicleNameError(true);
        return false;
      }
      if (vehicleModel == '') {
        setToastMsg('Please enter vehicle model');
        setVehicleModelError(true);
        return false;
      }
      if (vehicleNumPlate == '') {
        setToastMsg('please enter vehicle number plate');
        setVehicleNumPlateError(true);
        return false;
      }
      if (vehicleColor == '') {
        setToastMsg('Please enter vehicle color');
        setVehicleColorError(true);
        return false;
      }
      if (vehicleCategory == '') {
        setToastMsg('Choose vehicle category');
        setVehicleCategoryError(true);
        return false;
      }
      if (vehiclePicFront == '') {
        setToastMsg('Please upload vehicle front picture');
        return false;
      }
      if (vehiclePicBack == '') {
        setToastMsg('Please upload vehicle back picture');
        return false;
      }
      if (vehicleNumPlatePic == '') {
        setToastMsg('Please upload vehicle number plate picture');
        return false;
      }
    } else {
      try {
        setLoading(true);
        const CurrentUser = auth().currentUser;
        const vehicleReferenceFront = storage().ref(vehiclePicFront);
        const vehicleReferenceBack = storage().ref(vehiclePicBack);
        const vehicleReferenceNumPlate = storage().ref(vehicleNumPlatePic);
        await vehicleReferenceFront.putFile(vehiclePicFront);
        await vehicleReferenceBack.putFile(vehiclePicBack);
        await vehicleReferenceNumPlate.putFile(vehicleNumPlatePic);
        firestore()
          .collection('Drivers')
          .doc(CurrentUser.uid)
          .update({
            vehicleDetails: {
              vehicleName: vehicleName,
              vehicleModel: vehicleModel,
              vehicleNumPlate: vehicleNumPlate,
              vehicleColor: vehicleColor,
              vehicleCategory: vehicleCategory,
              vehiclePicFront: vehiclePicFront,
              vehiclePicBack: vehiclePicBack,
              vehicleNumPlatePic: vehicleNumPlatePic,
            },
          })
          .then(() => {
            console.log('User added!');
          });
        setLoading(false);
        navigation.replace('DriverRoutes', {screen: 'DriverHomeScreen'});
      } catch (err) {
        console.log(err);
      }
    }
  };
  //fields Validation end

  return (
    <Provider>
      {loading ? (
        <View style={styles.activityIndicatorStyles}>
          <ActivityIndicator size="large" color={Colors.fontColor} />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <CustomHeader
              iconname={'chevron-back-circle'}
              color={Colors.white}
              source={require('../../Assets/Images/URWhiteLogo.png')}
              onPress={() => {
                navigation.goBack();
              }}
            />
          </View>
          <ScrollView>
            <KeyboardAvoidingView>
              <Text style={styles.headingStyle}>Vehicle Registration</Text>
              <View style={styles.midContainer}>
                <TextInput
                  style={styles.fieldStyles}
                  label="Vehicle Name"
                  value={vehicleName}
                  error={vehicleNameError}
                  onChangeText={setVehicleName}
                  selectionColor={Colors.black}
                  underlineColor={Colors.black}
                  activeOutlineColor={Colors.fontColor}
                  activeUnderlineColor={Colors.fontColor}
                  onFocus={() => {
                    setVehicleNameError(false);
                  }}
                  outlineColor={Colors.gray}
                />
                <TextInput
                  style={styles.fieldStyles}
                  label="Vehicle Model"
                  value={vehicleModel}
                  error={vehicleModelError}
                  onChangeText={setVehicleModel}
                  selectionColor={Colors.black}
                  underlineColor={Colors.black}
                  activeOutlineColor={Colors.fontColor}
                  activeUnderlineColor={Colors.fontColor}
                  onFocus={() => {
                    setVehicleModelError(false);
                  }}
                />
                <TextInput
                  style={styles.fieldStyles}
                  label="Vehicle Number Plate"
                  value={vehicleNumPlate}
                  error={vehicleNumPlateError}
                  onChangeText={setVehicleNumPlate}
                  selectionColor={Colors.black}
                  underlineColor={Colors.black}
                  activeOutlineColor={Colors.fontColor}
                  activeUnderlineColor={Colors.fontColor}
                  onFocus={() => {
                    setVehicleNumPlateError(false);
                  }}
                />
                <TextInput
                  style={styles.fieldStyles}
                  label="Vehicle Color"
                  value={vehicleColor}
                  error={vehicleColorError}
                  onChangeText={setVehicleColor}
                  selectionColor={Colors.black}
                  underlineColor={Colors.black}
                  activeOutlineColor={Colors.fontColor}
                  activeUnderlineColor={Colors.fontColor}
                  onFocus={() => {
                    setVehicleColorError(false);
                  }}
                />
                <View style={styles.dropDownContainer}>
                  <DropDown
                    label={'Category'}
                    mode={'outlined'}
                    visible={showDropDown}
                    showDropDown={() => setShowDropDown(true)}
                    onDismiss={() => setShowDropDown(false)}
                    value={vehicleCategory}
                    setValue={setVehicleCategory}
                    list={myCategories}
                    dropDownItemSelectedTextStyle={{color: Colors.white}}
                    dropDownItemSelectedStyle={{
                      backgroundColor: Colors.fontColor,
                    }}
                  />
                </View>
              </View>
              <View style={styles.vehiclePicContainer}>
                <Text style={styles.innerHeading}>Upload Vehicle Pictures</Text>
                <View style={styles.fieldPicContainer}>
                  <TouchableOpacity onPress={showModal1}>
                    <Image
                      style={styles.imgStyle}
                      resizeMode="contain"
                      source={
                        vehiclePicFront
                          ? {uri: vehiclePicFront}
                          : vehicleFrontDefaultImg
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={showVehBackModal}>
                    <Image
                      style={styles.imgStyle}
                      resizeMode="contain"
                      source={
                        vehiclePicBack
                          ? {uri: vehiclePicBack}
                          : vehicleBackDefaultImg
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.vehiclePicContainer}>
                <Text style={styles.innerHeading}>
                  Upload Number Plate Picture
                </Text>
                <View>
                  <TouchableOpacity onPress={showVehNumPlateModal}>
                    <Image
                      style={styles.numPlateImgStyle}
                      resizeMode="contain"
                      source={
                        vehicleNumPlatePic
                          ? {uri: vehicleNumPlatePic}
                          : vehicleNumPlateDefaultImg
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.btnContainer}>
                <CustomButton text="Next" onPress={driverModeHandler} />
              </View>
            </KeyboardAvoidingView>
          </ScrollView>
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
      )}
    </Provider>
  );
}

const styles = StyleSheet.create({
  activityIndicatorStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  dropDownContainer: {
    width: '80%',
  },
  fieldPicContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldStyles: {
    width: '80%',
    margin: 10,
    color: Colors.black,
  },
  headerContainer: {
    backgroundColor: Colors.fontColor,
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
    height: 80,
  },
  midContainer: {
    alignItems: 'center',
  },
  numPlateImgStyle: {
    width: 80,
    height: 80,
    alignSelf: 'center',
  },
  vehiclePicContainer: {
    width: '80%',
    alignSelf: 'center',
    margin: 10,
  },
});
