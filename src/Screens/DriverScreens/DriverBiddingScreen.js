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
  Alert,
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
import {BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  locationPermission,
  getCurrentLocation,
} from '../../Helper/HelperFunction';
import Geocoder from 'react-native-geocoding';
import firestore from '@react-native-firebase/firestore';
import {ToastAndroid} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {getPreciseDistance} from 'geolib';
import {Modal} from 'react-native';
import {useCallback} from 'react';


export default function DriverBiddingScreen({navigation, route}) {
  let passengerData = '';
  let driverData = '';

  const {passengerState} = route.params;

  

  let myData = route.params;

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
  const [loading, setLoading] = useState(false);
  const [offerFare, setOfferFare] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
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
  const [myDriverData, setMyDriverData] = useState([]);
  const [arrivePickUpLocation, setArrivePickupLocation] = useState(false);
  const [arriveDropOffLocation, setArriveDropOffLocation] = useState(false);
  const [arrive, setArrive] = useState({
    pickUpLocation: false,
    dropOffLocation: false,
  });
  const [reload,setReload] = useState(false)

  
  const [minutesAndDistanceDifference, setMinutesAndDistanceDifference] =
    useState({
      minutes: '',
      distance: '',
      details: '',
    });
  const [driverCurrentLocation, setDriverCurrentLocation] = useState({});

  useEffect(() => {
    if (!selectedDriver) {
      gettingFormattedAddress();
      getDriverUid();
      checkRequestStatus();
      getDriverData();
    }
    getLocationUpdates();
    // }
  }, []);

  

  const getLocationUpdates = () => {
    if (
      !arrive.pickUpLocation &&
      selectedDriver &&
      driverCurrentLocation &&
      driverCurrentLocation.latitude &&
      driverCurrentLocation.longitude &&
      pickupCords.latitude &&
      pickupCords.longitude
    ) {
      const dis = getPreciseDistance(
        {
          latitude: driverCurrentLocation.latitude,
          longitude: driverCurrentLocation.longitude,
        },
        {latitude: pickupCords.latitude, longitude: pickupCords.longitude},
      );

      if (dis < 50) {
        setArrivePickupLocation(true);
      }
    }

    if (
      !arrive.dropOffLocation &&
      driverCurrentLocation &&
      selectedDriver &&
      driverCurrentLocation.latitude &&
      driverCurrentLocation.longitude &&
      pickupCords.latitude &&
      pickupCords.longitude
    ) {
      const dis = getPreciseDistance(
        {
          latitude: driverCurrentLocation.latitude,
          longitude: driverCurrentLocation.longitude,
        },
        {
          latitude: dropLocationCords.latitude,
          longitude: dropLocationCords.longitude,
        },
      );

      if (dis < 50) {
        setArriveDropOffLocation(true);
      }
    }
    getCurrentLocation()
      .then(res => {
        let {latitude, longitude} = res;
        setDriverCurrentLocation({
          ...driverCurrentLocation,
          latitude: latitude,
          longitude: longitude,
        });
      })
      .catch(error => {
        console.log(error, 'error');
      });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getLocationUpdates();
    }, 5000);

    return () => clearInterval(interval);
  });

  useEffect(() => {
    sendDriverLocationToPassenger();
  }, [driverCurrentLocation]);

  useEffect(() => {
    if (selectedDriver || loading) {
      const backAction = () => {
        Alert.alert('Hold on!', 'You can not go back from here', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }
  }, []);

  const sendDriverLocationToPassenger = () => {
    if (
      selectedDriver &&
      Object.keys(selectedDriver).length > 0 &&
      driverCurrentLocation &&
      driverCurrentLocation.latitude &&
      driverCurrentLocation.longitude
    ) {
      myDriverData.currentLocation = driverCurrentLocation;
        

      if(passengerData.bidFare){

      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .update({
          myDriversData: myDriverData,
        })
        .then(() => {
          setLoading(false);
          console.log('location send in firebase');
        })
        .catch(error => {
          console.log(error, 'error');
        });
    }
    else{
      firestore()
      .collection('Request')
      .doc(passengerData.id)
      .update({
        driverData: myDriverData,
      })
      .then(() => {
        setLoading(false);
        console.log('location send in firebase');
      })
      .catch(error => {
        console.log(error, 'error');
      });
    }
  }
  };

  const getDriverData = () => {
    if (!selectedDriver) {
      const driverId = auth().currentUser.uid;

      firestore()
        .collection('Drivers')
        .doc(driverId)
        .onSnapshot(querySnapshot => {
          let data = querySnapshot.data();
          data.id = driverId;
          setMyDriverData(data);
        });
    }
  };


  console.log(selectedDriver,"selected")

  const checkRequestStatus = () => {
    if (!selectedDriver) {
      if (passengerData && passengerData.bidFare) {
        firestore()
          .collection('Request')
          .doc(passengerData.id)
          .onSnapshot(querySnapshot => {
            let data = querySnapshot.data();

        

            if (
              data &&
              data.myDriversData &&
              !Array.isArray(data.myDriversData) &&
              data.myDriversData.requestStatus == 'rejected'
            ) {
              setLoading(false);
              ToastAndroid.show(
                'Your Request has been rejected',
                ToastAndroid.SHORT,
              );
              navigation.navigate('DriverHomeScreen',!reload);
              return;
            }
            if (
              data &&
              data.myDriversData &&
              Array.isArray(data.myDriversData)
            ) {
              let flag = data.myDriversData.some(
                (e, i) => e.id == driverUid && e.requestStatus == 'rejected',
              );

              if (flag) {
                setLoading(false);
                ToastAndroid.show(
                  'Your Request has been rejected',
                  ToastAndroid.SHORT,
                );
                navigation.navigate('DriverHomeScreen',!reload);
                return
              }
            }
            if (
              data &&
              data.myDriversData &&
              !Array.isArray(data.myDriversData) &&
              data.myDriversData.requestStatus
            ) {
              if (
                data.myDriversData.id == driverUid &&
                data.myDriversData.requestStatus == 'accepted'
              ) {
                ToastAndroid.show(
                  'Your request has been accepted',
                  ToastAndroid.SHORT,
                );

                firestore()
                  .collection('Drivers')
                  .doc(driverUid)
                  .update({
                    inlined: true,
                  })
                  .then(() => {
                    console.log('Driver has been inlined');
                  })
                  .catch(error => {
                    console.log(error);
                  });

                setSelectedDriver(data.myDriversData);
                setLoading(false);
              } else if (
                data.myDriversData.id == driverUid &&
                data.myDriversData.requestStatus == 'rejected'
              ) {
                ToastAndroid.show(
                  'Your request has been rejected',
                  ToastAndroid.SHORT,
                );
                setLoading(false);
                navigation.navigate('DriverHomeScreen',!reload);
              }
            }
            if (
              data &&
              data.myDriversData &&
              Array.isArray(data.myDriversData)
            ) {
              let flag = data.myDriversData.some(
                (e, i) => e.selected && e.id == driverUid,
              );

              let flag1 = data.myDriversData.some(
                (e, i) => e.id == driverUid && e.requestStatus == 'rejected',
              );

              console.log(flag,"flag")
              console.log(flag1,"flag1")

              if (flag && !flag1) {
                ToastAndroid.show(
                  'Your request has been accepted',
                  ToastAndroid.SHORT,
                );

                firestore()
                  .collection('Drivers')
                  .doc(driverUid)
                  .update({
                    inlined: true,
                  })
                  .then(() => {
                    console.log('Driver has been inlined');
                  })
                  .catch(error => {
                    console.log(error);
                  });

                setSelectedDriver(myDriverData);
                setLoading(false);
              }
               else if (!flag && flag1) {
                ToastAndroid.show(
                  'Your request has been rejected',
                  ToastAndroid.SHORT,
                );
                setLoading(false);
                navigation.navigate('DriverHomeScreen',!reload);
              }
            }
          });
      }
    }
  };

  const sendArriveMessageToPassenger = () => {
    setArrive({...arrive, pickUpLocation: true});
    setArrivePickupLocation(false);

    firestore()
      .collection('Request')
      .doc(passengerData.id)
      .update({
        driverArriveAtPickupLocation: true,
      })
      .then(res => {
        console.log('You have arrived at pickup Location');
      })
      .catch(error => {
        console.log(error);
      });
  };

  const ArriveModal = useCallback(() => {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={arrivePickUpLocation}
          onRequestClose={() => {
            setArrivePickupLocation(false);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View>
                <Icon size={80} color="white" name="hand-stop-o" />
              </View>
              <Text style={styles.modalText}>
                You have arrived at customer location!
              </Text>
              <TouchableOpacity
                style={[styles.button, {marginBottom: 10}]}
                onPress={() => sendArriveMessageToPassenger()}>
                <Text style={styles.textStyle}>confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [arrivePickUpLocation]);

  const getDriverUid = () => {
    if (!selectedDriver) {
      let uid = auth().currentUser.uid;
      setDriverUid(uid);
    }
  };
  const gettingFormattedAddress = () => {
    if (!selectedDriver) {
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
    }
  };

  const sendRequest = () => {
    if (!selectedDriver) {
      const Userid = route.params.data.id;

      if (
        passengerData &&
        !passengerData.bidFare &&
        passengerData.requestStatus
      ) {
        ToastAndroid.show(
          'You have already accepted this request',
          ToastAndroid.SHORT,
        );
        console.log(driverData,"driverData")

        return;
      }

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
            setSelectedDriver(driverData)
            firestore()
              .collection('Drivers')
              .doc(driverUid)
              .update({
                inlined: true,
              })
              .then(() => {
                console.log('Driver has been inlined');
              })
              .catch(error => {
                console.log(error);
              })
              
          })
          .catch(error => {
            console.log(error);
          });
      } else if (
        passengerData &&
        passengerData.bidFare &&
        selectedDriver &&
        driverPersonalData &&
        selectedDriver.id == driverPersonalData.id
      ) {
        ToastAndroid.show(
          'You have already accepted this request',
          ToastAndroid.SHORT,
        );
      } else if (passengerData && passengerData.bidFare && !selectedDriver) {
        const uid = auth().currentUser.uid;
        firestore()
          .collection('Drivers')
          .doc(uid)
          .onSnapshot(querySnapshot => {
            let driver = querySnapshot.data();
            driver.id = uid;
            driver.bidFare = driverBidFare
              ? driverBidFare
              : passengerData.bidFare;
            setDriverPersonalData(driver);
          });
      }
    }
  };
  const sendDriverRequestInFirebase = () => {


    if (!selectedDriver && typeof selectedDriver !== 'object') {
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
          } else if (data && Array.isArray(data.myDriversData) && !data.requestStatus ) {
            let flag = data.myDriversData.some(
              (e, i) => e.id == driverPersonalData.id,
            );

            if (flag) {
              ToastAndroid.show(
                'You have already requested',
                ToastAndroid.SHORT,
              );
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
                    'Your request has been send to passenger',
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
            !Array.isArray(data.myDriversData) &&
            driverPersonalData.id !== data.myDriversData.id
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
                  'Your request has been send to passenger',
                  ToastAndroid.SHORT,
                );
                setLoading(true);
              });
          }
          // else if (
          //   data &&
          //   data.myDriversData &&
          //   driverPersonalData.id == data.myDriversData.id &&
          //   !Array.isArray(data.myDriversData)
          // ) {
          //   ToastAndroid.show('You have already Requested', ToastAndroid.SHORT);
          // }
        });
    }
  };

  useEffect(() => {
    if (
      driverPersonalData &&
      Object.keys(driverPersonalData).length > 0 &&
      !selectedDriver
    ) {
      sendDriverRequestInFirebase();
    }
  }, [driverPersonalData]);

  const closeModal = () => {
    setAppearBiddingOption(false);
  };

  const confirmBidFare = selectedBid => {
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

  const getMinutesAndDistance = result => {
    setMinutesAndDistanceDifference({
      ...minutesAndDistanceDifference,
      minutes: result.duration,
      distance: result.distance,
      details: result.legs[0],
    });
  };

  const getViewLocation = useCallback(() => {
    return (
      <MapViewDirections
        origin={myDriverData.currentLocation}
        destination={pickupCords}
        apikey={GoogleMapKey.GOOGLE_MAP_KEY}
        strokeColor={Colors.black}
        strokeWidth={3}
        optimizeWayPoints={true}
        onReady={result => {
          getMinutesAndDistance(result);

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
    );
  }, []);

  
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
            <Marker
              coordinate={pickupCords}
              title="pickup Location"
              description={passengerData.pickupAddress}
            />

            {Object.keys(dropLocationCords).length > 0 && (
              <Marker
                coordinate={dropLocationCords}
                title="DropOff Location"
                description={passengerData.dropOffAddress}
                // image={ImagePath.isGreenMarker}
              />
            )}
            {driverCurrentLocation &&
              driverCurrentLocation.latitude &&
              dropLocationCords.longitude && (
                <Marker
                  coordinate={{
                    latitude:
                      driverCurrentLocation && driverCurrentLocation.latitude,
                    longitude:
                      driverCurrentLocation && driverCurrentLocation.longitude,
                  }}
                  title="Your Location"
                  description={
                    minutesAndDistanceDifference.details.start_address
                  }
                  pinColor="blue">
                  <Image
                    source={require('../../Assets/Images/mapCar.png')}
                    style={{width: 40, height: 40}}
                    resizeMode="contain"
                  />
                </Marker>
              )}
            {myDriverData &&
              myDriverData.currentLocation &&
              myDriverData.currentLocation.longitude && 
              getViewLocation()}
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

        <View style={{position: 'absolute', right: 10, top: 10}}>
          <Text
            style={{
              color: 'black',
              fontSize: 18,
              fontWeight: '900',
              marginTop: 10,
            }}>
            Duration:{' '}
            {arrivePickUpLocation || arrive.pickUpLocation
              ? passengerData.minutes
              : Math.ceil(minutesAndDistanceDifference.minutes)}{' '}
            Minutes
          </Text>
          <Text
            style={{
              color: 'black',
              fontSize: 18,
              fontWeight: '900',
              marginTop: 5,
            }}>
            Distance:{' '}
            {arrivePickUpLocation || arrive.pickUpLocation
              ? passengerData.distance
              : (minutesAndDistanceDifference.distance * 0.621371).toFixed(
                  2,
                )}{' '}
            Miles{' '}
          </Text>
        </View>
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
              {driverBidFare && !selectedDriver && (
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
              {passengerData.bidFare && !selectedDriver && (
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
              {arrivePickUpLocation && (
                <ArriveModal modalVisible={arrivePickUpLocation} />
              )}

              {/* </ScrollView> */}
              {!selectedDriver && (
                <View style={styles.btnContainer}>
                  <CustomButton text="Request" onPress={sendRequest} />
                </View>
              )}
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

    // paddingLeft: 10, //
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'black',
    height: '40%',
    width: '80%',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '90%',
    color: 'white',
    borderWidth: 1,
    borderColor: 'white',
    position: 'absolute',
    bottom: 20,
  },
  buttonOpen: {
    backgroundColor: '#white',
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    marginTop: 30,
    fontWeight: '800',
  },
});
