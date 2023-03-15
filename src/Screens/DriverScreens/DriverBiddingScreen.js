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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRoute} from '@react-navigation/native';
import {Linking, Platform} from 'react-native';

export default function DriverBiddingScreen({navigation}) {
  const route = useRoute();

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

  passengerData.mobileNumber = '+923455437281';

  const [pickUpLocation, setpickUpLocation] = useState(
    data && data.pickupAddress ? data.pickupAddress : '',
  );
  const [cancelRide, setCancelRide] = useState(false);
  const [dropOffLocation, setdropOffLocation] = useState(
    data && data.dropOffAddress ? data.dropOffAddress : '',
  );
  const [driverUid, setDriverUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [offerFare, setOfferFare] = useState(null);
  const [reasonForCancelRide, setReasonForCancelRide] = useState(false);
  const [driverReasonForCancelRide, setDriverReasonForCancelRide] = useState(
    '',
  );
  const [input, setInput] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(
    route.params.selectedDriver ?? '',
  );
  const [pressInInput, setPressInInput] = useState(false);
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

  const [myDriverData, setMyDriverData] = useState(
    data && route.params.selectedDriver ? route.params.selectedDriver : [],
  );
  const [arrivePickUpLocation, setArrivePickupLocation] = useState(false);
  const [arriveDropOffLocation, setArriveDropOffLocation] = useState(false);
  const [arrive, setArrive] = useState({
    pickUpLocation: false,
    dropOffLocation: false,
  });
  const [startRide, setStartRide] = useState(false);
  const [
    minutesAndDistanceDifference,
    setMinutesAndDistanceDifference,
  ] = useState({
    minutes: '',
    distance: '',
    details: '',
  });
  const [driverCurrentLocation, setDriverCurrentLocation] = useState({});
  const [endRide, setEndRide] = useState(false);

  useEffect(() => {
    if (!selectedDriver) {
      gettingFormattedAddress();
      getDriverUid();

      getDriverData();
      route.params &&
        route.params.selectedDriver &&
        setSelectedDriver(route.params.selectedDriver);
    }
  }, []);

  useEffect(() => {
    if (!selectedDriver) {
      let interval = setInterval(() => {
        checkRequestStatus();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [loading]);

  const getLocationUpdates = () => {
    if (
      !arrive.pickUpLocation &&
      selectedDriver &&
      driverCurrentLocation &&
      !route.params.driverArrive &&
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
        let {latitude, longitude, heading} = res;
        setDriverCurrentLocation({
          ...driverCurrentLocation,
          latitude: latitude,
          longitude: longitude,
          heading: heading,
        });
      })
      .catch(error => {
        console.log(error, 'error');
      });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getLocationUpdates();
    }, 15000);

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
  }, [selectedDriver, loading]);

  const sendDriverLocationToPassenger = () => {
    if (
      selectedDriver &&
      Object.keys(selectedDriver).length > 0 &&
      driverCurrentLocation &&
      driverCurrentLocation.latitude &&
      driverCurrentLocation.longitude
    ) {
      let driverData = {...myDriverData};
      driverData.currentLocation = driverCurrentLocation;
      if (passengerData.bidFare > 0) {
        firestore()
          .collection('Request')
          .doc(passengerData.id)
          .update({
            myDriversData: driverData,
          })
          .then(() => {
            setLoading(false);
            console.log('location send in firebase');
          })
          .catch(error => {
            console.log(error, 'error');
          });
      } else {
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
    if (!selectedDriver && !route.params.selectedDriver) {
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

  const checkRequestStatus = async () => {
    if (!selectedDriver) {
      if (passengerData && passengerData.bidFare) {
        await firestore()
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
              navigation.navigate('DriverHomeScreen');
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
                navigation.navigate('DriverHomeScreen');
                return;
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
                data.myDriversData.requestStatus == 'accepted' &&
                !selectedDriver
              ) {
                setLoading(false);
                ToastAndroid.show(
                  'Your request has been accepted',
                  ToastAndroid.SHORT,
                );

                firestore()
                  .collection('inlinedDriver')
                  .doc(driverUid)
                  .set({
                    inlined: true,
                    id: driverUid,
                  })
                  .then(() => {
                    console.log('Driver has been inlined');
                  })
                  .catch(error => {
                    console.log(error);
                  });

                setSelectedDriver(data.myDriversData);
                try {
                  let myData = JSON.stringify(data);
                  AsyncStorage.setItem('driverBooking', myData);
                } catch (error) {
                  console.log(error);
                }
              } else if (
                data.myDriversData.id == driverUid &&
                data.myDriversData.requestStatus == 'rejected'
              ) {
                ToastAndroid.show(
                  'Your request has been rejected',
                  ToastAndroid.SHORT,
                );
                setLoading(false);
                navigation.navigate('DriverHomeScreen');
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
              if (flag && !flag1 & !selectedDriver) {
                ToastAndroid.show(
                  'Your request has been accepted',
                  ToastAndroid.SHORT,
                );

                firestore()
                  .collection('inlinedDriver')
                  .doc(driverUid)
                  .set({
                    inlined: true,
                    id: driverUid,
                  })
                  .then(() => {
                    console.log('Driver has been inlined');
                  })
                  .catch(error => {
                    console.log(error);
                  });

                try {
                  let myData = JSON.stringify(data);
                  AsyncStorage.setItem('driverBooking', myData);
                } catch (error) {
                  console.log(error);
                }

                setSelectedDriver(myDriverData);
                setLoading(false);
              } else if (!flag && flag1) {
                ToastAndroid.show(
                  'Your request has been rejected',
                  ToastAndroid.SHORT,
                );
                setLoading(false);
                navigation.navigate('DriverHomeScreen');
              }
            }
          });
      }
    }
  };

  const sendArriveMessageToPassenger = async () => {
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

    try {
      await AsyncStorage.setItem(
        'ArrivedAtpickUpLocation',
        'driverArrivedAtPickupLocation',
      );
    } catch (error) {
      console.log(error);
    }
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
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View>
                <Icon size={80} color="white" name="hand-stop-o" />
              </View>
              <Text style={styles.modalText}>
                You have arrived at customer location!
              </Text>
              <TouchableOpacity
                style={[
                  styles.button,
                  {marginBottom: 10, backgroundColor: Colors.primary},
                ]}
                onPress={() => sendArriveMessageToPassenger()}
              >
                <Text style={styles.textStyle}>confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [arrivePickUpLocation]);

  const bookingComplete = () => {
    let uid = auth().currentUser.uid;
    firestore()
      .collection('Drivers')
      .doc(uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          let data = doc.data();
          if (data.wallet) {
            let wallet =
              Number(data.wallet) + driverBidFare
                ? driverBidFare
                : route.params.selectedDriver.bidFare;
            firestore()
              .collection('Drivers')
              .doc(uid)
              .update({
                wallet: wallet,
              })
              .then(() => {
                ToastAndroid.show(
                  'Amount has been successfully add in your wallet',
                  ToastAndroid.SHORT,
                );
              })
              .catch(error => {
                console.log(error);
              });
          } else {
            let wallet = driverBidFare
              ? driverBidFare
              : route.params.selectedDriver.bidFare;
            firestore()
              .collection('Drivers')
              .doc(uid)
              .update({
                wallet: wallet,
              })
              .then(() => {
                ToastAndroid.show(
                  'Amount has been successfully add in your wallet',
                );
              })
              .catch(error => {
                console.log(error);
              });
          }
        }
      });

    firestore()
      .collection('inlinedDriver')
      .doc(uid)
      .update({
        inlined: false,
      })
      .then(() => {
        console.log('driver has been successfully lined');
      })
      .catch(error => {
        console.log(error);
      });

    firestore()
      .collection('Request')
      .doc(data.id)
      .update({
        driverArriveAtDropoffLocation: true,
      })
      .then(() => {
        AsyncStorage.removeItem('driverBooking');
        AsyncStorage.removeItem('ArrivedAtpickUpLocation');
        AsyncStorage.removeItem('startRide');
        AsyncStorage.removeItem('EndRide');
        navigation.navigate('AskScreen');
      })
      .catch(error => {
        console.log(error);
      });
  };

  const DropOffModal = useCallback(() => {
    console.log(input);
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={endRide || (route.params && route.params.endRide)}
          onRequestClose={() => {
            setInput(false);
          }}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, {height: input ? '70%' : '50%'}]}>
              <Text
                style={[
                  styles.modalText,
                  {fontSize: 26, fontWeight: '600', color: 'white'},
                ]}
              >
                Congratulations!
              </Text>
              <Text
                style={[
                  styles.modalText,
                  {
                    fontSize: 18,
                    fontWeight: '500',
                    color: 'white',
                    marginTop: 0,
                  },
                ]}
              >
                You have arrived at destination
              </Text>
              <Text
                style={[
                  styles.modalText,
                  {
                    marginTop: 0,
                    paddingHorizontal: 2,
                    marginHorizontal: 5,
                    fontWeight: '500',
                    fontSize: 14,
                    alignSelf: 'flex-start',
                  },
                ]}
              >
                Bill Amount:{' '}
                <Text style={{fontSize: 16, color: 'yellow', width: '100%'}}>
                  {data.bidFare ?? data.fare}$
                </Text>
              </Text>

              <TouchableOpacity
                style={[
                  styles.button,
                  {marginBottom: 10, backgroundColor: Colors.primary},
                ]}
                onPress={() => bookingComplete()}
              >
                <Text style={styles.textStyle}>confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [endRide]);

  const cancelBookingByDriver = () => {
    if (!driverReasonForCancelRide) {
      ToastAndroid.show(
        'Kindly Enter Reason of cancelling Ride',
        ToastAndroid.SHORT,
      );
      return;
    }

    let cancelRide = {
      passengerData: passengerData,
      driverData: myDriverData,
      rideCancelByDriver: true,
      reasonForCancelRide: driverReasonForCancelRide,
      date: new Date(),
    };

    firestore()
      .collection('Request')
      .doc(passengerData.id)
      .update({
        rideCancelByDriver: true,
      })
      .then(() => {
        firestore()
          .collection('RideCancel')
          .doc(myDriverData.id)
          .set(
            {
              cancelledRides: firestore.FieldValue.arrayUnion(cancelRide),
            },
            {merge: true},
          )
          .then(() => {
            firestore()
              .collection('inlinedDriver')
              .doc(myDriverData.id)
              .update({
                inlined: false,
              })
              .then(() => {
                AsyncStorage.removeItem('driverBooking');
                AsyncStorage.removeItem('ArrivedAtpickUpLocation');
                AsyncStorage.removeItem('startRide');
                AsyncStorage.removeItem('EndRide');
                ToastAndroid.show(
                  'Your ride has been succesfully cancelled',
                  ToastAndroid.SHORT,
                );
                navigation.navigate('AskScreen');
              })
              .catch(() => {
                console.log(error);
              });
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error, 'error');
      });
  };

  const cancelRideModal = useCallback(() => {
    return (
      cancelRide && (
        <View style={styles.centeredView}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={cancelRide}
            onRequestClose={() => {
              setCancelRide(false);
              setInput(false);
              setReasonForCancelRide(false);
            }}
          >
            <View style={styles.centeredView}>
              <View
                style={[
                  styles.modalView,
                  {
                    height: input ? '65%' : reasonForCancelRide ? '40%' : '45%',
                    width: '90%',
                  },
                ]}
              >
                {!reasonForCancelRide && (
                  <MaterialCommunityIcons
                    size={80}
                    color="white"
                    name="cancel"
                  />
                )}

                {!reasonForCancelRide && (
                  <Text
                    style={[
                      styles.modalText,
                      {
                        alignSelf: 'flex-start',
                        fontWeight: '600',
                        fontSize: 26,
                        marginTop: 0,
                        textAlign: 'left',
                      },
                    ]}
                  >
                    Are you sure You want to cancel Ride!
                  </Text>
                )}
                {!reasonForCancelRide && (
                  <Text
                    style={[
                      styles.modalText,
                      {
                        fontSize: 18,
                        alignSelf: 'flex-start',
                        marginTop: 0,
                        fontWeight: '400',
                      },
                    ]}
                  >
                    Your Passenger is waiting for you!
                  </Text>
                )}

                {!reasonForCancelRide && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          marginBottom: 10,
                          backgroundColor: Colors.black,
                          position: 'relative',
                          width: '48%',
                          bottom: -40,
                        },
                      ]}
                      onPress={() => setCancelRide(false)}
                    >
                      <Text
                        style={[
                          styles.textStyle,
                          {backgroundColor: Colors.black},
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          marginBottom: 10,
                          backgroundColor: Colors.primary,
                          position: 'relative',
                          width: '48%',
                          bottom: -40,
                        },
                      ]}
                      onPress={() => setReasonForCancelRide(true)}
                    >
                      <Text
                        style={[
                          styles.textStyle,
                          {backgroundColor: Colors.primary},
                        ]}
                      >
                        confirm
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {reasonForCancelRide && (
                  <View style={{width: '100%'}}>
                    <Text
                      style={[
                        styles.modalText,
                        {
                          alignSelf: 'flex-start',
                          fontWeight: '600',
                          fontSize: 26,
                          marginTop: 0,
                          textAlign: 'left',
                        },
                      ]}
                    >
                      Kindly Write below the reasons for cancelling Ride!
                    </Text>
                    <TextInput
                      onChangeText={e => setDriverReasonForCancelRide(e)}
                      multiline={true}
                      maxLength={100}
                      style={{
                        color: 'black',
                        borderWidth: 1,
                        backgroundColor: 'white',
                        width: '95%',
                        borderRadius: 10,
                        paddingHorizontal: 10,
                      }}
                      placeholder={'Enter Reason'}
                      placeholderTextColor="black"
                      onPressIn={() => setInput(true)}
                    />
                    <View style={{alignItems: 'center'}}>
                      <TouchableOpacity
                        style={[
                          styles.button,
                          {
                            marginBottom: 10,
                            backgroundColor: Colors.primary,
                            position: 'relative',
                            width: '90%',
                            bottom: -40,
                          },
                        ]}
                        onPress={() => cancelBookingByDriver()}
                      >
                        <Text
                          style={[
                            styles.textStyle,
                            {backgroundColor: Colors.primary},
                          ]}
                        >
                          Cancel Ride
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </View>
      )
    );
  }, [cancelRide, reasonForCancelRide, input, driverReasonForCancelRide]);

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

  console.log(route.params, 'parmass');

  const sendRequest = () => {
    if (!selectedDriver) {
      const Userid = route.params.data.id;

      if (
        passengerData &&
        !route.params.data.bidFare &&
        passengerData.requestStatus &&
        !selectedDriver
      ) {
        ToastAndroid.show(
          'You have already accepted this request',
          ToastAndroid.SHORT,
        );

        return;
      }

      console.log(selectedDriver, 'selected');

      if (
        passengerData &&
        !passengerData.requestStatus &&
        !route.params.data.bidFare
      ) {
        passengerData.requestStatus = 'accepted';
        firestore()
          .collection('Request')
          .doc(passengerData.id)
          .update({
            requestStatus: 'accepted',
          })
          .then(() => {
            setSelectedDriver(driverData ? driverData : myDriverData);
            ToastAndroid.show(
              'You have accepted customer Request',
              ToastAndroid.SHORT,
            );

            try {
              let myData = JSON.stringify(data);
              AsyncStorage.setItem('driverBooking', myData);
            } catch (error) {
              console.log(error);
            }

            firestore()
              .collection('inlinedDriver')
              .doc(driverUid)
              .set({
                inlined: true,
                id: driverUid,
              })
              .then(() => {
                console.log('Driver has been inlined');
              })
              .catch(error => {
                console.log(error);
              });
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

  const cancelRideByPassenger = () => {
    firestore()
      .collection('Request')
      .doc(passengerData.id)
      .onSnapshot(doc => {
        let data = doc.data();
        console.log(data, 'dataaa');
        if (data && data.rideCancelByPassenger) {
          firestore()
            .collection('inlinedDriver')
            .doc(myDriverData.id)
            .update({
              inlined: false,
            })
            .then(() => {
              ToastAndroid.show(
                'Ride has been cancelled by passenger',
                ToastAndroid.SHORT,
              );
              AsyncStorage.removeItem('driverBooking');
              AsyncStorage.removeItem('startRide');
              AsyncStorage.removeItem('EndRide');
              AsyncStorage.removeItem("'ArrivedAtpickUpLocation'");
              navigation.navigate('AskScreen');
            })
            .catch(error => {
              console.log(error);
            });
        }
      });
  };

  useEffect(() => {
    if (selectedDriver) {
      let interval = setInterval(() => {
        cancelRideByPassenger();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [selectedDriver]);

  const sendDriverRequestInFirebase = () => {
    if (
      !selectedDriver &&
      typeof selectedDriver !== 'object' &&
      !loading &&
      passengerData.bidFare > 0
    ) {
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
          }

          if (
            data &&
            data.myDriversData &&
            !Array.isArray(data.myDriversData)
          ) {
            const uid = auth().currentUser.uid;
            if (
              data.myDriversData.id == uid &&
              data.myDriversData.requestStatus == 'rejected'
            ) {
              ToastAndroid.show(
                'You request has been rejected',
                ToastAndroid.SHORT,
              );
              return;
            }
          }

          if (data && data.myDriversData && Array.isArray(data.myDriversData)) {
            const uid = auth().currentUser.uid;

            data.myDriversData.map((e, i) => {
              if (e.id == uid && e.requestStatus == 'rejected') {
                ToastAndroid.show(
                  'You request has been rejected',
                  ToastAndroid.SHORT,
                );

                return;
              }
            });
          }

          if (
            data &&
            Array.isArray(data.myDriversData) &&
            !data.requestStatus
          ) {
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

    setDriverBidFare(Number(myFare));
  };

  const getMinutesAndDistance = result => {
    setMinutesAndDistanceDifference({
      ...minutesAndDistanceDifference,
      minutes: result.duration,
      distance: result.distance,
      details: result.legs[0],
    });
  };

  const rideStartByDriver = async () => {
    setStartRide(true);

    try {
      await AsyncStorage.setItem('startRide', 'Ride has been started');
    } catch (error) {
      console.log(error);
    }
  };

  console.log(myDriverData, 'driver');

  const getViewLocation = useCallback(() => {
    return (
      <MapViewDirections
        origin={
          driverCurrentLocation && Object.keys(driverCurrentLocation).length > 0
            ? driverCurrentLocation
            : myDriverData.currentLocation
            ? myDriverData.currentLocation
            : driverData.currentLocation
        }
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
  }, [selectedDriver, myDriverData, driverCurrentLocation]);

  const cancelRideByDriver = () => {
    setCancelRide(true);
  };

  const rideEndByDriver = async () => {
    setEndRide(true);
    setArriveDropOffLocation(false);

    await AsyncStorage.setItem('EndRide', 'Ride End by Driver');
  };

  const mapRef = useRef();

  return loading ? (
    <View
      style={{alignItems: 'center', justifyContent: 'center', height: '90%'}}
    >
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
          rightButton={selectedDriver ? 'show' : ''}
          cancelRideFunction={cancelRideByDriver}
        />
      </View>
      <View style={styles.mapContainer}>
        {state.pickupCords && (
          <MapView
            ref={mapRef}
            zoomEnabled={true}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              ...pickupCords,
              latitudeDelta: 0.005,
              longitudeDelta: 0.001,
            }}
          >
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
              driverCurrentLocation.longitude && (
                <Marker
                  coordinate={{
                    latitude:
                      driverCurrentLocation && driverCurrentLocation.latitude,
                    longitude:
                      driverCurrentLocation && driverCurrentLocation.longitude,
                    heading:
                      driverCurrentLocation && driverCurrentLocation.heading,
                  }}
                  title="Your Location"
                  description={
                    minutesAndDistanceDifference.details.start_address
                  }
                  pinColor="blue"
                >
                  <Image
                    source={require('../../Assets/Images/mapCar.png')}
                    style={{
                      width: 40,
                      height: 40,
                      transform: [
                        {rotate: `${driverCurrentLocation.heading}deg`},
                      ],
                    }}
                    resizeMode="contain"
                  />
                </Marker>
              )}
            {myDriverData && driverCurrentLocation && getViewLocation()}
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

        {arrive.pickUpLocation ||
          (route.params.driverArriveAtPickupLocation &&
            !startRide &&
            !route.params.startRide &&
            selectedDriver && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  borderWidth: 1,
                  borderColor: 'black',
                  padding: 10,
                  backgroundColor: Colors.secondary,
                  borderRadius: 10,
                  paddingHorizontal: 20,
                }}
                onPress={() => rideStartByDriver()}
              >
                <Text style={{fontSize: 16, color: 'white', fontWeight: '600'}}>
                  Start Ride
                </Text>
              </TouchableOpacity>
            ))}

        {arrive.pickUpLocation ||
          (arriveDropOffLocation && !route.params.endRide && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                borderWidth: 1,
                borderColor: 'black',
                padding: 10,
                backgroundColor: Colors.secondary,
                borderRadius: 10,
                paddingHorizontal: 20,
              }}
              onPress={() => rideEndByDriver()}
            >
              <Text style={{fontSize: 16, color: 'white', fontWeight: '600'}}>
                End Ride
              </Text>
            </TouchableOpacity>
          ))}

        <View style={{position: 'absolute', right: 10, top: 10}}>
          <Text
            style={{
              color: 'black',
              fontSize: 18,
              fontWeight: '900',
              marginTop: 10,
            }}
          >
            Duration:{' '}
            {arrivePickUpLocation ||
            arrive.pickUpLocation ||
            route.params.driverArrive
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
            }}
          >
            Distance:{' '}
            {arrivePickUpLocation ||
            arrive.pickUpLocation ||
            route.params.driverArrive
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
            keyboardShouldPersistTaps="handled"
          >
            <KeyboardAvoidingView>
              {selectedDriver && (
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: Colors.secondary,
                    }}
                  >
                    Contact Passenger:
                  </Text>
                  <TouchableOpacity
                    style={{
                      width: '100%',
                      paddingVertical: 10,
                      borderRadius: 10,
                      justifyContent: 'center',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                    onPress={() => {
                      Linking.openURL(`tel:${passengerData.mobileNumber}`);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: Colors.primary,
                      }}
                    >
                      {passengerData.mobileNumber}
                    </Text>
                    <View style={{marginRight: 160}}>
                      <Icon name="phone" size={30} color={Colors.secondary} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

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
                  passengerData.bidFare > 0
                    ? 'Customer Bid:'
                    : 'Recomended Fare:'
                } ${
                  passengerData.bidFare > 0
                    ? passengerData.bidFare
                    : data.bidFare
                    ? data.bidFare
                    : passengerData.fare
                }$`}
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
                  value={`Your Bid ${
                    driverBidFare
                      ? driverBidFare
                      : route.params.selectedDriver.bidFare
                  }$`}
                />
              )}
              {passengerData.bidFare > 0 && !selectedDriver && (
                <TouchableOpacity
                  onPress={() => setAppearBiddingOption(true)}
                  style={{
                    marginTop: 10,
                    marginHorizontal: 5,
                    backgroundColor: 'skyblue',
                    padding: 8,
                    width: '30%',
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 20,
                      fontWeight: '700',
                    }}
                  >
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
              {arrivePickUpLocation && <ArriveModal />}
              {endRide ||
                (route.params && route.params.endRide && <DropOffModal />)}
              {cancelRide && cancelRideModal()}

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
    backgroundColor: Colors.secondary,
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
