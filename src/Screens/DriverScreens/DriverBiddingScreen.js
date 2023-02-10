import React, {useState, useRef, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Touchable,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import AddressPickup from '../../Components/AddressPickup';
import CustomButton from '../../Components/CustomButton';
import auth from '@react-native-firebase/auth';
import {
  locationPermission,
  getCurrentLocation,
} from '../../Helper/HelperFunction';
import Geocoder from 'react-native-geocoding';
import firestore from '@react-native-firebase/firestore';
import {ToastAndroid} from 'react-native';
// import { TextInput } from 'react-native-paper';

export default function DriverBiddingScreen({navigation, route}) {
  const {passengerState} = route.params;

  useEffect(() => {
    gettingFormattedAddress();
    getBookingData();
  }, [passengerState]);

  const gettingFormattedAddress = () => {
    Geocoder.init(GoogleMapKey.GOOGLE_MAP_KEY);
    Geocoder.from(
      passengerState.pickupCords.latitude,
      passengerState.pickupCords.longitude,
    )
      .then(json => {
        var addressPickup = json.results[0].formatted_address;
        setpickUpLocation(addressPickup);
      })
      .catch(error => console.warn(error));
    Geocoder.from(
      passengerState.dropLocationCords.latitude,
      passengerState.dropLocationCords.longitude,
    )
      .then(json => {
        var addressDropOff = json.results[0].formatted_address;
        setdropOffLocation(addressDropOff);
      })
      .catch(error => console.warn(error));
  };

  const [pickUpLocation, setpickUpLocation] = useState('');
  const [dropOffLocation, setdropOffLocation] = useState('');
  const [driverUid, setDriverUid] = useState('');
  const [availableDriver, setAvailableDriver] = useState('');
  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;
  const LATITUDE_DELTA = 0.04;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
  const [state, setState] = useState({
    pickupCords: passengerState.pickupCords,
    dropLocationCords: passengerState.dropLocationCords,
  });
  const {pickupCords, dropLocationCords} = state;

  const getBookingData = () => {
    const Userid = route.params.data.id;
    firestore()
      .collection('booking')
      .doc(Userid)
      .onSnapshot(querySnapshot => {
        const data = querySnapshot.data();
        setAvailableDriver(data.availableDriver);
      });
  };

  const sendRequest = async () => {
    const Userid = route.params.data.id;

    if (availableDriver && Array.isArray(availableDriver)) {
      let flag = availableDriver.some((e, i) => e == driverUid);

      if (flag) {
        ToastAndroid.show('You have already requested', ToastAndroid.SHORT);
      }
      return;
    }

    if (availableDriver && !Array.isArray(availableDriver)) {
      if (availableDriver === driverUid) {
        ToastAndroid.show('You have already requested', ToastAndroid.SHORT);
      }
      return;
    }

    if (availableDriver && !Array.isArray(availableDriver)) {
      let availableDriverArray = [availableDriver, driverUid];

      firestore()
        .collection('booking')
        .doc(Userid)
        .update({
          availableDriver: availableDriverArray,
        })
        .then(() => {
          ToastAndroid.show('Your request has been sent', ToastAndroid.SHORT);
        })
        .catch(error => {
          console.log(error);
        });
    } else if (availableDriver && Array.isArray(availableDriver)) {
      let upDateAvailableDriverArray = [...availableDriver, driverUid];
      firestore()
        .collection('booking')
        .doc(Userid)
        .update({
          availableDriver: upDateAvailableDriverArray,
        })
        .then(() => {
          ToastAndroid.show('Your request has been sent', ToastAndroid.SHORT);
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      firestore()
        .collection('booking')
        .doc(Userid)
        .update({availableDriver: driverUid})
        .then(() => {
          ToastAndroid.show('Your request has been sent', ToastAndroid.SHORT);
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    console.log('hello');
    let uid = auth().currentUser.uid;
    setDriverUid(uid);
  }, []);

  const mapRef = useRef();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CustomHeader
          iconname={'menu'}
          color={Colors.white}
          onPress={() => {
            navigation.toggleDrawer();
          }}
          source={require('../../Assets/Images/URWhiteLogo.png')}
        />
      </View>
      <View style={styles.mapContainer}>
        {state.pickupCords && (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              ...pickupCords,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}>
            <Marker coordinate={pickupCords} />
            {/* <Marker
                        coordinate={dropLocationCords}
                    /> */}
            {Object.keys(dropLocationCords).length > 0 && (
              <Marker
                coordinate={dropLocationCords}
                // image={ImagePath.isGreenMarker}
              />
            )}
            {Object.keys(dropLocationCords).length > 0 && (
              <MapViewDirections
                origin={pickupCords}
                destination={dropLocationCords}
                apikey={GoogleMapKey.GOOGLE_MAP_KEY}
                strokeColor={Colors.black}
                strokeWidth={3}
                optimizeWayPoints={true}
                onReady={result => {
                  mapRef.current.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: 30,
                      bottom: 100,
                      left: 30,
                      top: 100,
                    },
                  });
                }}
              />
            )}
          </MapView>
        )}
      </View>
      <View style={styles.bottomCard}>
        <KeyboardAvoidingView>
          <ScrollView
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView>
              {/* <ScrollView
                                    nestedScrollEnabled={true}
                                    keyboardShouldPersistTaps="handled"
                                > */}
              <TextInput
                placeholder="PickUp Location"
                placeholderTextColor={Colors.gray}
                value={pickUpLocation}
                onChangeText={setpickUpLocation}
                selectionColor={Colors.black}
                activeUnderlineColor={Colors.gray}
                style={styles.textInputStyle}
                editable={false}
              />
              <TextInput
                placeholder="Destination Location"
                placeholderTextColor={Colors.gray}
                value={dropOffLocation}
                onChangeText={setdropOffLocation}
                selectionColor={Colors.black}
                activeUnderlineColor={Colors.gray}
                style={styles.textInputStyle}
                editable={false}
              />

              {/* </ScrollView> */}
              <View style={styles.btnContainer}>
                <CustomButton text="Request" onPress={sendRequest} />
              </View>
            </KeyboardAvoidingView>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  btnContainer: {
    marginTop: 5,
    width: '100%',
    alignItems: 'center', //
  },
  bottomCard: {
    width: '100%',
    padding: 20,
    backgroundColor: Colors.white,
    elevation: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20, //
  },
  container: {
    flex: 1, //
  },
  headerContainer: {
    zIndex: 1,
    backgroundColor: Colors.fontColor, //
  },
  mapContainer: {
    flex: 1, //
  },
  textInputStyle: {
    zIndex: 1,
    width: '100%',
    color: Colors.black,
    fontSize: 14,
    backgroundColor: 'white',
    borderColor: 'grey',
    borderBottomWidth: 1,
    paddingLeft: 10, //
  },
});
