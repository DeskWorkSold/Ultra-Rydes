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
import AppModal from '../../Components/modal';
import {
  locationPermission,
  getCurrentLocation,
} from '../../Helper/HelperFunction';
import Geocoder from 'react-native-geocoding';
import firestore from '@react-native-firebase/firestore';
import {ToastAndroid} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
// import { TextInput } from 'react-native-paper';

export default function DriverBiddingScreen({navigation, route}) {
  let passengerData = '';
  let driverData = '';

  const {passengerState} = route.params;

  if (
    route.params &&
    route.params.data.passengerData &&
    route.params.data.driverData
  ) {
    passengerData = route.params.data.passengerData;
    driverData = route.params.data.driverData;
  } else {
    passengerData = route.params.data;
  }

  const {data} = route.params;

  const [pickUpLocation, setpickUpLocation] = useState('');
  const [dropOffLocation, setdropOffLocation] = useState('');
  const [driverUid, setDriverUid] = useState('');
  const [availableDriver, setAvailableDriver] = useState('');
  const [availableDriverDetail, setAvailableDriverDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState([]);
  const [offerFare, setOfferFare] = useState(null);
  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;
  const LATITUDE_DELTA = 0.04;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
  const [state, setState] = useState({
    pickupCords: passengerState.pickupCords,
    dropLocationCords: passengerState.dropLocationCords,
  });
  const {pickupCords, dropLocationCords} = state;
  const [appearBiddingOption, setAppearBiddingOption] = useState(false);
  const [driverBidFare, setDriverBidFare] = useState(false);
  const [driverPersonalData, setDriverPersonalData] = useState({});

  useEffect(() => {
    gettingFormattedAddress();
    // getBookingData();
    getDriverUid();

    // if (
    //   bookingData &&
    //   Object.keys(bookingData).length > 0 &&
    //   bookingData.driverDetail &&
    //   bookingData.bookingStatus == 'done'
    // ) {
    //   checkRequestStatus();
    // }
  }, []);

  const getDriverUid = () => {
    let uid = auth().currentUser.uid;
    setDriverUid(uid);
  };

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

  // const getBookingData = () => {
  //   const Userid = route.params.data.id;

  //   let MybookingData = [];

  //   firestore()
  //     .collection('booking')
  //     .onSnapshot(querySnapshot => {
  //       querySnapshot.forEach(documentSnapshot => {
  //         let data = documentSnapshot.data();

  //         if (data.id == Userid && data.bookingStatus !== 'done') {
  //           MybookingData.push(data);
  //         } else if (
  //           data.id == Userid &&
  //           data.bookingStatus == 'done' &&
  //           data.destination == 'start'
  //         )
  //           MybookingData.push(data);
  //       });

  //       MybookingData &&
  //         MybookingData.length > 0 &&
  //         setBookingData(MybookingData[0]);
  //     });
  // };

  // const checkRequestStatus = () => {

  //   if (
  //     bookingData &&
  //     bookingData.driverDetail &&
  //     !Array.isArray(bookingData.driverDetail)
  //   ) {
  //     if (
  //       bookingData.driverDetail.availableDriver === driverUid &&
  //       bookingData.driverDetail.selected
  //     ) {
  //       setLoading(false);
  //       ToastAndroid.show('Your request has been accepted', ToastAndroid.SHORT);
  //     } else {
  //       setLoading(false);
  //       ToastAndroid.show('Your request has been rejected', ToastAndroid.SHORT);
  //       navigation.navigate('driverHomeScreen');
  //     }
  //   }
  //   if (
  //     bookingData &&
  //     bookingData.driverDetail &&
  //     Array.isArray(bookingData.driverDetail)
  //   ) {
  //     bookingData &&
  //       bookingData.driverDetail.length > 0 &&
  //       bookingData.driverDetail.map((e, i) => {
  //         if (e.availableDriver == driverUid && e.selected) {
  //           setLoading(false);
  //           ToastAndroid.show(
  //             'Your request has been accepted',
  //             ToastAndroid.SHORT,
  //           );

  //           return;
  //         }
  //         if (e.availableDriver == driverUid && !e.selected) {
  //           setLoading(false);
  //           ToastAndroid.show(
  //             'Your request has been rejected',
  //             ToastAndroid.SHORT,
  //           );
  //           setTimeout(() => {
  //             navigation.navigate('DriverHomeScreen');
  //           }, 1000);
  //         }
  //       });
  //   }
  // };

  console.log(passengerData, 'paasenger');

  const sendRequest = async () => {
    const Userid = route.params.data.id;
    if (
      passengerData &&
      !passengerData.bidFare &&
      !passengerData.requestStatus
    ) {
      passengerData.requestStatus = 'accepted';
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .update({
          requestStatus: 'accepted',
        })
        .then(() => {
          ToastAndroid.show(
            'You have accepted customer Request',
            ToastAndroid.SHORT,
          );
        })
        .catch(error => {
          console.log(error);
        });
      return;
    } else if (
      passengerData &&
      !passengerData.bidFare &&
      passengerData.requestStatus
    ) {
      ToastAndroid.show(
        'You have already accepted this request',

        ToastAndroid.SHORT,
      );
    } else if (
      passengerData &&
      passengerData.bidFare &&
      !passengerData.requestStatus
    ) {
      firestore()
        .collection('Drivers')
        .doc(driverUid)
        .onSnapshot(querySnapshot => {
          let driver = querySnapshot.data();
          driver.id = driverUid;
          driver.bidFare = driverBidFare
            ? driverBidFare
            : passengerData.bidFare;
          setDriverPersonalData(driver);
        });
    } else if (
      passengerData &&
      passengerData.bidFare &&
      passengerData.requestStatus == 'accepted'
    ) {
      ToastAndroid.show(
        'You have already accepted this request',
        ToastAndroid.SHORT,
      );
    }
  };

  const sendDriverRequestInFirebase = () => {
    console.log('heeelooo');

    let otherDriverData = [];
    firestore()
      .collection('Request')
      .doc(passengerData.id)
      .onSnapshot(querySnapshot => {
        let data = querySnapshot.data();

        if (data && !data.myDriversData) {
          firestore()
            .collection('Request')
            .doc(data.id)
            .update({
              myDriversData: driverPersonalData,
            })
            .then(() => {
              ToastAndroid.show(
                'Your request has been send to passenger',
                ToastAndroid.SHORT,
              );
              setLoading(true);
            })
            .catch(error => {
              console.log(error);
            });
        } else if (data && Array.isArray(data.myDriversData)) {
          let flag = data.myDriversData.some(
            (e, i) => e.id == driverPersonalData.id,
          );

          if (flag) {
            ToastAndroid.show('You have already requested', ToastAndroid.SHORT);
          } else {
            let driverDataArray = [...data.myDriversData, driverPersonalData];
            firestore()
              .collection('Request')
              .doc(data.id)
              .update({
                myDriversData: driverDataArray,
              })
              .then(() => {
                ToastAndroid.show(
                  'Your request has been send',
                  ToastAndroid.SHORT,
                );
                setLoading(true);
              })
              .catch(error => {
                console.log(error);
              });
          }
        } else if (
          data &&
          data.myDriversData &&
          driverPersonalData.id !== data.myDriversData.id &&
          !Array.isArray(data.myDriversData)
        ) {
          let myData = [data.myDriversData];
          let driverDataArray = [...myData, driverPersonalData];
          firestore()
            .collection('Request')
            .doc(data.id)
            .update({
              myDriversData: driverDataArray,
            })
            .then(() => {
              ToastAndroid.show(
                'Your request has been send',
                ToastAndroid.SHORT,
              );
              setLoading(true);
            });
        } else if (
          data &&
          data.myDriversData &&
          driverPersonalData.id == data.myDriversData.id &&
          !Array.isArray(data.myDriversData)
        ) {
          ToastAndroid.show('You have already Requested', ToastAndroid.SHORT);
        }
      });
  };

  useEffect(() => {
    if (driverPersonalData && Object.keys(driverPersonalData).length > 0) {
      sendDriverRequestInFirebase();
    }
  }, [driverPersonalData]);

  const closeModal = () => {
    setAppearBiddingOption(false);
  };

  const confirmBidFare = selectedBid => {
    console.log(selectedBid, 'selectedFare');

    let myFare = '';

    if (selectedBid.bidWithMinimumDeduction) {
      myFare = (passengerData.bidFare * (103 / 100)).toFixed(2);
      setAppearBiddingOption(false);
    } else if (selectedBid.bidWithMidDeduction) {
      myFare = (passengerData.bidFare * (106 / 100)).toFixed(2);
      setAppearBiddingOption(false);
    } else if (selectedBid.bidWithMaximumDeduction) {
      myFare = (passengerData.bidFare * (110 / 100)).toFixed(2);
      setAppearBiddingOption(false);
    } else {
      Alert.alert('Error Alert', 'Kindly selected Bid Fare');
      return;
    }

    setDriverBidFare(myFare);
  };

  const mapRef = useRef();

  return loading ? (
    <View
      style={{alignItems: 'center', justifyContent: 'center', height: '90%'}}>
      <ActivityIndicator size={100} color="black" />
      <Text style={{color: 'black', marginTop: 20}}>
        Processing Your request Please Wait!
      </Text>
    </View>
  ) : (
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
              <TextInput
                placeholder="Fare"
                placeholderTextColor={Colors.gray}
                selectionColor={Colors.black}
                activeUnderlineColor={Colors.gray}
                style={styles.textInputStyle}
                editable={false}
                keyboardType="numeric"
                onChangeText={setOfferFare}
                value={`${
                  passengerData.bidFare ? 'Customer Bid:' : 'Recomended Fare:'
                } ${passengerData.bidFare ?? passengerData.fare}$`}
              />
              {driverBidFare && (
                <TextInput
                  placeholder="Your Bid"
                  placeholderTextColor={Colors.gray}
                  selectionColor={Colors.black}
                  activeUnderlineColor={Colors.gray}
                  style={styles.textInputStyle}
                  keyboardType="numeric"
                  editable={false}
                  onChangeText={setDriverBidFare}
                  value={`Your Bid ${driverBidFare}$`}
                />
              )}
              {passengerData.bidFare && (
                <TouchableOpacity
                  onPress={() => setAppearBiddingOption(true)}
                  style={{
                    marginTop: 10,
                    marginHorizontal: 5,
                    backgroundColor: 'skyblue',
                    padding: 8,
                    width: '30%',
                    borderRadius: 10,
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 20,
                      fontWeight: '700',
                    }}>
                    Bid Fare
                  </Text>
                </TouchableOpacity>
              )}
              {appearBiddingOption && (
                <AppModal
                  modalVisible={appearBiddingOption}
                  close={closeModal}
                  fare={passengerData.bidFare}
                  confirm={confirmBidFare}
                  state="driver"
                />
              )}

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
