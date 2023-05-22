import React, { useState, useRef, useEffect } from 'react';
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
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import AddressPickup from '../../Components/AddressPickup';
import CustomButton from '../../Components/CustomButton';
import auth from '@react-native-firebase/auth';
import AppModal from '../../Components/modal';
import { BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  locationPermission,
  getCurrentLocation,
} from '../../Helper/HelperFunction';
import Geocoder from 'react-native-geocoding';
import firestore from '@react-native-firebase/firestore';
import { ToastAndroid } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { getPreciseDistance } from 'geolib';
import { Modal } from 'react-native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { Linking, Platform } from 'react-native';
import axios from 'axios';
import IdleTimerManager from 'react-native-idle-timer';


export default function DriverBiddingScreen({ navigation }) {
  const route = useRoute();

  let passengerData = '';
  let driverData = '';

  const { passengerState } = route.params;

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

  const { data } = route.params;

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
  const [driverReasonForCancelRide, setDriverReasonForCancelRide] =
    useState('');
  const [input, setInput] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(
    route.params.selectedDriver ?? myDriverData,
  );
  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;
  const LATITUDE_DELTA = 0.04;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
  const [state, setState] = useState({
    pickupCords: passengerState.pickupCords,
    dropLocationCords: passengerState.dropLocationCords,
  });
  const { pickupCords, dropLocationCords } = state;
  const [appearBiddingOption, setAppearBiddingOption] = useState(false);
  const [driverBidFare, setDriverBidFare] = useState(false);
  const [driverPersonalData, setDriverPersonalData] = useState({});
  const [rejectLoader, setRejectLoader] = useState(false);

  const [myDriverData, setMyDriverData] = useState(
    data && route.params.selectedDriver ? route.params.selectedDriver : [],
  );
  const [arrivePickUpLocation, setArrivePickupLocation] = useState(false);
  const [arriveDropOffLocation, setArriveDropOffLocation] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [tollAmount, setTollAmount] = useState(null);
  const [arrive, setArrive] = useState({
    pickUpLocation: false,
    dropOffLocation: false,
  });
  const [startRide, setStartRide] = useState(false);
  const [minutesAndDistanceDifference, setMinutesAndDistanceDifference] =
    useState({
      minutes: '',
      distance: '',
      details: '',
    });
  const [driverCurrentLocation, setDriverCurrentLocation] = useState({});
  const [endRide, setEndRide] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [arriveModal, setArriveModal] = useState(false)
  const [riderOnCabConfirmation, setRiderOnCabConfirmation] = useState(false)
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    if (!selectedDriver) {
      gettingFormattedAddress();
      getDriverUid();
      getDriverData();
      route.params &&
        route.params.selectedDriver &&
        setSelectedDriver(route.params.selectedDriver);
    }
  }, [data]);

  useEffect(() => {
    // Disable screen timeout when the component mounts
    IdleTimerManager.setIdleTimerDisabled(true);

    // Re-enable screen timeout when the component unmounts
    return () => {
      IdleTimerManager.setIdleTimerDisabled(false);
    };
  }, []);


  const getLocationUpdates = async () => {
    let checkDriverArrive = await AsyncStorage.getItem(
      'ArrivedAtpickUpLocation',
    );




    // let myDriverArrived;
    firestore()
      .collection('Request')
      .doc(passengerData?.id ?? data.id)
      .get()
      .then(doc => {
        let data = doc.data();
        if (data && Object.keys(data).length > 0) {
          if (data?.tipAmount) {
            setTipAmount(data?.tipAmount);
          }
          if (data?.tollAmount) {
            setTollAmount(data?.tollAmount);
          }
        }
      });

    if (
      !arrive.pickUpLocation &&
      selectedDriver &&
      driverCurrentLocation &&
      !route.params.driverArrive &&
      !data.driverArriveAtPickupLocation &&
      driverCurrentLocation.latitude &&
      driverCurrentLocation.longitude &&
      pickupCords.latitude &&
      pickupCords.longitude
    ) {
      // const dis = getPreciseDistance(
      //   {
      //     latitude: driverCurrentLocation.latitude,
      //     longitude: driverCurrentLocation.longitude,
      //   },
      //   { latitude: pickupCords.latitude, longitude: pickupCords.longitude },
      // );

      // if (dis < 100) {
      setArrivePickupLocation(true);
      // }
    }

    if (
      !arrive.dropOffLocation &&
      driverCurrentLocation &&
      selectedDriver &&
      driverCurrentLocation.latitude &&
      driverCurrentLocation.longitude &&
      !data?.driverArriveAtDropoffLocation &&
      pickupCords.latitude &&
      pickupCords.longitude &&
      (arrive.pickUpLocation || data.driverArriveAtPickupLocation) &&
      (startRide || data?.startRide || route?.params?.startRide)
    ) {
      setArriveDropOffLocation(true);
    }

    getCurrentLocation()
      .then(res => {
        let { latitude, longitude, heading } = res;
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
    let interval = setInterval(() => {
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
    } else if (!selectedDriver && !loading) {
      const backAction = () => {
        Alert.alert('Hold on!', 'You can not go back from here...', [
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
  }, [selectedDriver, loading, route.params]);

  const sendDriverLocationToPassenger = () => {
    if (
      selectedDriver &&
      Object.keys(selectedDriver).length > 0 &&
      driverCurrentLocation &&
      driverCurrentLocation.latitude &&
      driverCurrentLocation.longitude
    ) {
      let driverData = { ...myDriverData };
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


  console.log(tipAmount, "tollAmount")

  // const checkRequestStatus = async () => {
  //   if (!selectedDriver) {
  //     if (passengerData && passengerData.bidFare) {
  //       await firestore()
  //         .collection('Request')
  //         .doc(passengerData.id)
  //         .onSnapshot(querySnapshot => {
  //           let data = querySnapshot.data();

  //           if (
  //             data &&
  //             data.myDriversData &&
  //             !Array.isArray(data.myDriversData) &&
  //             data.myDriversData.requestStatus == 'rejected'
  //           ) {
  //             setLoading(false);
  //             ToastAndroid.show(
  //               'Your Request has been rejected',
  //               ToastAndroid.SHORT,
  //             );
  //             navigation.navigate('DriverHomeScreen');
  //             return;
  //           }
  //           if (
  //             data &&
  //             data.myDriversData &&
  //             Array.isArray(data.myDriversData)
  //           ) {
  //             let flag = data.myDriversData.some(
  //               (e, i) => e.id == driverUid && e.requestStatus == 'rejected',
  //             );

  //             if (flag) {
  //               setLoading(false);
  //               ToastAndroid.show(
  //                 'Your Request has been rejected',
  //                 ToastAndroid.SHORT,
  //               );
  //               navigation.navigate('DriverHomeScreen');
  //               return;
  //             }
  //           }
  //           if (
  //             data &&
  //             data.myDriversData &&
  //             !Array.isArray(data.myDriversData) &&
  //             data.myDriversData.requestStatus
  //           ) {
  //             if (
  //               data.myDriversData.id == driverUid &&
  //               data.myDriversData.requestStatus == 'accepted' &&
  //               !selectedDriver
  //             ) {
  //               setLoading(false);
  //               ToastAndroid.show(
  //                 'Your request has been accepted',
  //                 ToastAndroid.SHORT,
  //               );
  //               firestore()
  //                 .collection('inlinedDriver')
  //                 .doc(driverUid)
  //                 .set({
  //                   inlined: true,
  //                   id: driverUid,
  //                 })
  //                 .then(() => {
  //                   console.log('Driver has been inlined');
  //                 })
  //                 .catch(error => {
  //                   console.log(error);
  //                 });

  //               setSelectedDriver(data.myDriversData);
  //               try {
  //                 let myData = JSON.stringify(data);
  //                 AsyncStorage.setItem('driverBooking', myData);
  //               } catch (error) {
  //                 console.log(error);
  //               }
  //             } else if (
  //               data.myDriversData.id == driverUid &&
  //               data.myDriversData.requestStatus == 'rejected'
  //             ) {
  //               ToastAndroid.show(
  //                 'Your request has been rejected',
  //                 ToastAndroid.SHORT,
  //               );
  //               setLoading(false);
  //               navigation.navigate('DriverHomeScreen');
  //             }
  //           }
  //           if (
  //             data &&
  //             data.myDriversData &&
  //             Array.isArray(data.myDriversData)
  //           ) {
  //             let flag = data.myDriversData.some(
  //               (e, i) => e.selected && e.id == driverUid,
  //             );

  //             let flag1 = data.myDriversData.some(
  //               (e, i) => e.id == driverUid && e.requestStatus == 'rejected',
  //             );
  //             if (flag && !flag1 & !selectedDriver) {
  //               ToastAndroid.show(
  //                 'Your request has been accepted',
  //                 ToastAndroid.SHORT,
  //               );

  //               firestore()
  //                 .collection('inlinedDriver')
  //                 .doc(driverUid)
  //                 .set({
  //                   inlined: true,
  //                   id: driverUid,
  //                 })
  //                 .then(() => {
  //                   console.log('Driver has been inlined');
  //                 })
  //                 .catch(error => {
  //                   console.log(error);
  //                 });

  //               try {
  //                 let myData = JSON.stringify(data);
  //                 AsyncStorage.setItem('driverBooking', myData);
  //               } catch (error) {
  //                 console.log(error);
  //               }

  //               setSelectedDriver(myDriverData);
  //               setLoading(false);
  //             } else if (!flag && flag1) {
  //               ToastAndroid.show(
  //                 'Your request has been rejected',
  //                 ToastAndroid.SHORT,
  //               );
  //               setLoading(false);
  //               navigation.navigate('DriverHomeScreen');
  //             }
  //           }
  //         });
  //     }
  //   }
  // };

  const sendArriveMessageToPassenger = async () => {
    setButtonLoader(true);

    firestore()
      .collection('token')
      .doc(passengerData.id)
      .get()
      .then(doc => {
        let token = doc.data();
        token = token?.token;

        if (token) {
          var data = JSON.stringify({
            notification: {
              body: 'click to open the app',
              title: 'Your driver has arrived',
            },
            to: token,
          });
          let config = {
            method: 'post',
            url: 'https://fcm.googleapis.com/fcm/send',
            headers: {
              Authorization:
                'key=AAAApuKg0tA:APA91bHOO2IbbnnFhrV5s-ZsGTQQR1ltgXcGtL74enNjBwgsC_LlqWXB-Zketf6Eg1uTqPOYF3O4er_XM3QA_RqCjU4uO-znlKzxhXmgSG_1ElMKYiXXh_wZNn5S6c9tkYzURIZIooxA',
              'Content-Type': 'application/json',
            },
            data: data,
          };
          axios(config)
            .then(res => {
              setButtonLoader(false);
            })
            .catch(error => {
              setButtonLoader(false);
              console.log(error);
            });
        }
      });
    firestore()
      .collection('Request')
      .doc(passengerData.id)
      .update({
        driverArriveAtPickupLocation: true,
      })
      .then(res => {
        setButtonLoader(false);
        setArrive({ ...arrive, pickUpLocation: true });
        setArrivePickupLocation(false);
        setArriveModal(false)
        console.log('You have arrived at pickup Location');
      })
      .catch(error => {
        setButtonLoader(false);
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
          visible={arriveModal}
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
                style={[
                  styles.button,
                  { marginBottom: 10, backgroundColor: Colors.primary },
                ]}
                onPress={() => !buttonLoader && sendArriveMessageToPassenger()}>
                <Text style={styles.textStyle}>
                  {buttonLoader ? (
                    <ActivityIndicator size={'large'} color={Colors.black} />
                  ) : (
                    'confirm'
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [arriveModal, buttonLoader]);

  const PassengerConfirmationModal = useCallback(() => {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={riderOnCabConfirmation}
          onRequestClose={() => {
            setRiderOnCabConfirmation(false);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View>
                <Icon size={80} color="white" name="hand-stop-o" />
              </View>
              <Text style={styles.modalText}>
                Please Confirm the passenger's name : {data?.passengerData ? data?.passengerData?.passengerPersonalDetails?.firstName : data?.passengerPersonalDetails?.firstName}
              </Text>
              <View style={{ flexDirection: "row", width: "100%", marginTop: 30, justifyContent: "space-between" }} >
                <TouchableOpacity
                  onPress={() => rideStartByDriver()}
                  style={[
                    styles.button,
                    { marginBottom: 10, backgroundColor: Colors.primary, width: "49%", position: "static" },
                  ]}
                >
                  <Text style={styles.textStyle}>
                    {buttonLoader && confirm ? (
                      <ActivityIndicator size={'large'} color={Colors.black} />
                    ) : (
                      'confirm'
                    )}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { marginBottom: 10, backgroundColor: Colors.primary, width: "49%", position: "static", backgroundColor: Colors.black },
                  ]}
                  onPress={() => cancelBookingByDriver()}
                >
                  <Text style={styles.textStyle}>
                    {buttonLoader ? (
                      <ActivityIndicator size={'large'} color={Colors.white} />
                    ) : (
                      'Wrong rider'
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [riderOnCabConfirmation, buttonLoader])



  const bookingComplete = (myTip, myToll) => {
    setButtonLoader(true);

    let uid = auth().currentUser.uid;
    let walletData = {
      fare: selectedDriver?.bidFare
        ? selectedDriver?.bidFare
        : data.bidFare
          ? data.bidFare
          : data.passengerData.fare,
      withdraw: 0,
      date: new Date(),
      remainingWallet:
        myTip ?? tipAmount ?? 0 +
        myToll ?? tollAmount ?? 0 +
        (data.bidFare ? Number(data.bidFare) : Number(data.fare)),
      tip: myTip ?? tipAmount ?? 0,
      toll: myToll ?? tollAmount ?? 0,
    };

    firestore()
      .collection('driverWallet')
      .doc(uid)
      .set(
        {
          driverWallet: firestore.FieldValue.arrayUnion(walletData),
        },
        { merge: true },
      )
      .then(() => {
        ToastAndroid.show(
          'Amount has been successfully added in your wallet',
          ToastAndroid.SHORT,
        );
      })
      .catch(error => {
        console.log(error);
        setButtonLoader(false);
      });

    firestore()
      .collection('Request')
      .doc(
        route.params?.data?.id
          ? route.params.data.id
          : route.params?.data?.passengerData.id,
      )
      .update({
        bookingStatus: 'complete',
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
        setButtonLoader(false);
        console.log(error);
      });
    firestore()
      .collection('Request')
      .doc(data.id ?? data.passengerData.id)
      .update({
        driverArriveAtDropoffLocation: true,
      })
      .then(async () => {
        let startRide = await AsyncStorage.getItem('onTheWayRideStart');

        if (startRide) {
          setButtonLoader(false);
          setArrivePickupLocation(false);
          setArriveDropOffLocation(false);
          setStartRide(false);
          setSelectedDriver([]);
          AsyncStorage.removeItem('driverBooking');
          AsyncStorage.removeItem('ArrivedAtpickUpLocation');
          AsyncStorage.removeItem('startRide');
          AsyncStorage.removeItem('EndRide');
          navigation.navigate('DriverRoutes', {
            screen: 'DriverOnTheWayScreen',
            params: {
              data: startRide,
            },
          });
          return;
        }
        setButtonLoader(false);
        AsyncStorage.removeItem('driverBooking');
        AsyncStorage.removeItem('ArrivedAtpickUpLocation');
        AsyncStorage.removeItem('startRide');
        AsyncStorage.removeItem('EndRide');
        setEndRide(false);
        setArrivePickupLocation(false);
        setArriveDropOffLocation(false);
        setStartRide(false);
        setSelectedDriver([]);
        navigation.navigate('DriverRoutes', {
          screen: 'DriverHomeScreen',
        });
      })
      .catch(error => {
        setButtonLoader(false);
        console.log(error);
      });
  };

  const DropOffModal = useCallback((tip, toll) => {
    let myFare = data.bidFare ?? data.passengerData.fare;
    let myTip = tip ? tip : tipAmount ?? 0;
    let myToll = toll ? toll : tollAmount ?? 0;
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={endRide || route.params.endRide}
          onRequestClose={() => {
            setInput(false);
          }}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { height: 370 }]}>
              <Text
                style={[
                  styles.modalText,
                  { fontSize: 26, fontWeight: '600', color: 'white' },
                ]}>
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
                ]}>
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
                ]}>
                Bill Amount:
                <Text style={{ fontSize: 16, color: 'yellow', width: '100%' }}>
                  $
                  {data?.passengerData
                    ? data?.passengerData?.fare
                    : data.bidFare}
                </Text>
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
                ]}>
                Tip Amount:
                <Text style={{ fontSize: 16, color: 'yellow', width: '100%' }}>
                  ${Number(myTip).toFixed(2) ?? 0}
                </Text>
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
                ]}>
                Toll Amount:
                <Text style={{ fontSize: 16, color: 'yellow', width: '100%' }}>
                  ${myToll ?? 0}
                </Text>
              </Text>
              <Text
                style={[
                  styles.modalText,
                  {
                    marginTop: 0,
                    paddingHorizontal: 2,
                    marginHorizontal: 5,
                    fontWeight: '500',
                    fontSize: 22,
                    alignSelf: 'flex-start',
                  },
                ]}>
                Total Earning:
                <Text style={{ fontSize: 20, color: 'yellow', width: '100%' }}>
                  ${(Number(myToll) + Number(myTip) + Number(myFare)).toFixed(2)}
                </Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.button,
                  { marginBottom: 10, backgroundColor: Colors.primary },
                ]}
                onPress={() => !buttonLoader && bookingComplete(myTip, myToll)}>
                <Text style={styles.textStyle}>
                  {buttonLoader ? (
                    <ActivityIndicator size={'large'} color={Colors.black} />
                  ) : (
                    'confirm'
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [endRide, buttonLoader, tipAmount, tollAmount]);

  const cancelBookingByDriver = () => {
    setButtonLoader(true);

    let cancelRide = {
      passengerData: passengerData,
      driverData: myDriverData,
      rideCancelByDriver: true,
      reasonForCancelRide: driverReasonForCancelRide,
      date: new Date(),
    };

    firestore()
      .collection('Request')
      .doc(route.params?.data?.id ? route.params?.data?.id : passengerData.id)
      .update({
        rideCancelByDriver: true,
        myDriversData: null,
      })
      .then(() => {
        firestore()
          .collection('RideCancel')
          .doc(myDriverData.id)
          .set(
            {
              cancelledRides: firestore.FieldValue.arrayUnion(cancelRide),
            },
            { merge: true },
          )
          .then(() => {
            firestore()
              .collection('inlinedDriver')
              .doc(myDriverData.id)
              .update({
                inlined: false,
              })
              .then(async () => {
                setButtonLoader(false);
                AsyncStorage.removeItem('driverBooking');
                AsyncStorage.removeItem('ArrivedAtpickUpLocation');
                AsyncStorage.removeItem('startRide');
                AsyncStorage.removeItem('EndRide');
                ToastAndroid.show(
                  'Your ride has been succesfully cancelled',
                  ToastAndroid.SHORT,
                );
                let startRide = await AsyncStorage.getItem('onTheWayRideStart');
                JSON.parse(startRide);
                if (startRide) {
                  navigation.navigate('DriverRoutes', {
                    screen: 'DriverOnTheWayScreen',
                    params: {
                      data: startRide
                    }
                  });
                } else {
                  navigation.navigate('DriverRoutes', {
                    screen: 'DriverHomeScreen',
                    params: {
                      data: startRide
                    }
                  });
                }
              })
              .catch(error => {
                console.log(error);
                setButtonLoader(false);
              });
          })
          .catch(error => {
            console.log(error, 'errorr');
            setButtonLoader(false);
          });
      })
      .catch(error => {
        console.log(error, 'error');
        setButtonLoader(false);
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
            }}>
            <View style={styles.centeredView}>
              <View
                style={[
                  styles.modalView,
                  {
                    height: input ? '65%' : reasonForCancelRide ? '40%' : '45%',
                    width: '90%',
                  },
                ]}>
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
                    ]}>
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
                    ]}>
                    Your Passenger is waiting for you!
                  </Text>
                )}

                {!reasonForCancelRide && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
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
                      onPress={() => setCancelRide(false)}>
                      <Text
                        style={[
                          styles.textStyle,
                          { backgroundColor: Colors.black },
                        ]}>
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
                      onPress={() => setReasonForCancelRide(true)}>
                      <Text
                        style={[
                          styles.textStyle,
                          { backgroundColor: Colors.primary },
                        ]}>
                        confirm
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {reasonForCancelRide && (
                  <View style={{ width: '100%' }}>
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
                      ]}>
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
                    <View style={{ alignItems: 'center' }}>
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
                        onPress={() => cancelBookingByDriver()}>
                        <Text
                          style={[
                            styles.textStyle,
                            { backgroundColor: Colors.primary },
                          ]}>
                          {buttonLoader ? (
                            <ActivityIndicator
                              size={'small'}
                              color={Colors.black}
                            />
                          ) : (
                            'Cancel Ride'
                          )}
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
  }, [
    cancelRide,
    reasonForCancelRide,
    input,
    driverReasonForCancelRide,
    buttonLoader,
  ]);

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
              let driverData = driverData ? driverData : myDriverData;
              let myData = data;
              myData.driverData = driverData;
              myData = JSON.stringify(myData);

              AsyncStorage.setItem('driverBooking', myData);
            } catch (error) { }

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
      .get()
      .then(doc => {
        let data = doc.data();
        if (data && data.rideCancelByPassenger) {
          firestore()
            .collection('inlinedDriver')
            .doc(myDriverData.id)
            .update({
              inlined: false,
            })
            .then(async () => {
              ToastAndroid.show(
                'Ride has been cancelled by passenger',
                ToastAndroid.SHORT,
              );
              AsyncStorage.removeItem('driverBooking');
              AsyncStorage.removeItem('startRide');
              AsyncStorage.removeItem('EndRide');
              AsyncStorage.removeItem("'ArrivedAtpickUpLocation'");

              let startRide = await AsyncStorage.getItem('onTheWayRideStart');
              JSON.parse(startRide);
              if (startRide) {
                navigation.navigate('DriverRoutes', {
                  screen: 'DriverOnTheWayScreen',
                  params: {
                    data: startRide
                  }

                });
              } else {
                navigation.navigate('DriverRoutes', {
                  screen: 'DriverHomeScreen',
                  params: {
                    data: startRide
                  }
                });
              }
            })
            .catch(error => {
              console.log(error);
            });
        }
      });
  };

  useEffect(() => {
    let inteval;
    if (selectedDriver) {
      interval = setInterval(() => {
        cancelRideByPassenger();
      }, 10000);
    }
    return () => clearInterval(interval);
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
        });
    }
  };

  // useEffect(() => {
  //   if (
  //     driverPersonalData &&
  //     Object.keys(driverPersonalData).length > 0 &&
  //     !selectedDriver
  //   ) {
  //     sendDriverRequestInFirebase();
  //   }
  // }, [driverPersonalData]);

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

  console.log(data?.startRide,"startRide")

  const getMinutesAndDistance = result => {
    setMinutesAndDistanceDifference({
      ...minutesAndDistanceDifference,
      minutes: result.duration,
      distance: result.distance,
      details: result.legs[0],
    });
  };

  const mapRef = useRef();

  const handleZoom = () => {
    const region = {
      latitude: driverCurrentLocation.latitude,
      longitude: driverCurrentLocation.longitude,
      latitudeDelta: 0.0001,
      longitudeDelta: 0.0001,
    };
    mapRef.current.animateToRegion(region, 1000);
  };

  const rideStartByDriver = async () => {
    setConfirm(true)
    firestore()
      .collection('Request')
      .doc(data.id ?? data.passengerData.id)
      .get()
      .then(async doc => {
        let data = doc.data();
        if (data && data.confirmByPassenger) {
          try {
            await AsyncStorage.setItem('startRide', 'Ride has been started');
            setStartRide(true);
            setConfirm(false)
            setRiderOnCabConfirmation(false)
            handleZoom();
          } catch (error) {
            console.log(error);
          }
        } else {
          ToastAndroid.show(
            'Your passenger has not confirm your arrival ask passenger to confirm arrival and then start your ride',
            ToastAndroid.SHORT,
          );
        }
      });
  };

  const getViewLocation = useCallback(() => {
    return (
      <MapViewDirections
        origin={
          driverCurrentLocation && Object.keys(driverCurrentLocation).length > 0
            ? driverCurrentLocation
            : myDriverData?.currentLocation
              ? myDriverData?.currentLocation
              : driverData?.currentLocation
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

    mileDistance = (dis / 1609.34)?.toFixed(2);

      console.log(mileDistance,"distance")


    if (data?.distance <= 3) {

      if (mileDistance < ((data?.distance * 75) / 100)) {
        setEndRide(true);
        setArriveDropOffLocation(false);
        await AsyncStorage.setItem('EndRide', 'Ride End by Driver');
      }
      else {
        ToastAndroid.show("You have met the minimum requirement to end ride kindly proceed to destination location", ToastAndroid.SHORT)
      }
      return
    }

    if (data?.distance > 3) {

      if (mileDistance < ((data?.distance * 50) / 100)) {
        setEndRide(true);
        setArriveDropOffLocation(false);
        await AsyncStorage.setItem('EndRide', 'Ride End by Driver');
      }
      else {
        ToastAndroid.show("You have met the minimum requirement to end ride kindly proceed to destination location", ToastAndroid.SHORT)
      }
    }

  };

  const openWaze = () => {
    if (
      data?.driverArriveAtPickupLocation ||
      arrive.pickUpLocation ||
      route.params.driverArrive
    ) {
      const url = `https://www.waze.com/ul?ll=${dropLocationCords.latitude},${dropLocationCords.longitude}&navigate=yes&zoom=17&from=${driverCurrentLocation.latitude},${driverCurrentLocation.longitude}`;
      Linking.openURL(url);
    } else {
      const url = `https://www.waze.com/ul?ll=${pickupCords.latitude},${pickupCords.longitude}&navigate=yes&zoom=17&from=${driverCurrentLocation.latitude},${driverCurrentLocation.longitude}`;
      Linking.openURL(url);
    }
  };

  console.log(arrivePickUpLocation, "arrivePickUp")

  const rejectRequest = async () => {
    setRejectLoader(true);
    if (data && data.bidFare) {
      let rejectedDrivers = [];
      await firestore()
        .collection('Request')
        .doc(data?.passengerData ? data.passengerData?.id : data.id)
        .get()
        .then(doc => {
          if (doc._exists) {
            let data = doc.data();

            if (data?.rejectedDrivers && !Array.isArray(data.rejectedDrivers)) {
              rejectedDrivers.push(data.rejectedDrivers);
            }
            if (data?.rejectedDrivers && Array.isArray(data.rejectedDrivers)) {
              rejectedDrivers = data.rejectedDrivers;
            }
          }
        });
      let id = auth().currentUser.uid;
      rejectedDrivers = [...rejectedDrivers, id];
      await firestore()
        .collection('Request')
        .doc(data?.passengerData ? data.passengerData?.id : data.id)
        .update({
          rejectedDrivers: rejectedDrivers,
        })
        .then(() => {
          setTimeout(() => {
            setRejectLoader(false);
            ToastAndroid.show(
              'You have successfully rejected the request',
              ToastAndroid.SHORT,
            );
            AsyncStorage.removeItem('driverBooking');
            AsyncStorage.removeItem('ArrivedAtpickUpLocation');
            AsyncStorage.removeItem('startRide');
            AsyncStorage.removeItem('EndRide');

            navigation.navigate('AskScreen');
          }, 2000);
        })
        .catch(error => {
          setRejectLoader(false);
          console.log(error);
        });
    } else {
      let id = auth().currentUser.uid;
      let rejectedDrivers = [];
      await firestore()
        .collection('Request')
        .doc(data?.passengerData ? data.passengerData?.id : data.id)
        .get()
        .then(doc => {
          if (doc._exists) {
            let data = doc.data();

            if (
              data?.rejectedDrivers &&
              !Array.isArray(data?.rejectedDrivers)
            ) {
              rejectedDrivers.push(data.rejectedDrivers);
            }
            if (data?.rejectedDrivers && Array.isArray(data.rejectedDrivers)) {
              rejectedDrivers = data.rejectedDrivers;
            }
          }
        });
      rejectedDrivers = [...rejectedDrivers, id];

      await firestore()
        .collection('Request')
        .doc(data?.passengerData ? data.passengerData?.id : data.id)
        .update({
          requestStatus: 'rejected',
          rejectedDriversId: rejectedDrivers,
        })
        .then(() => {
          setTimeout(() => {
            setRejectLoader(false);
            ToastAndroid.show(
              'Your have succesfully rejected the request',
              ToastAndroid.SHORT,
            );
          }, 1000);
          setTimeout(() => {
            navigation.navigate('AskScreen');
          }, 2000);
        });
    }
  };

console.log(route.params.startRide,"startRide")

  return loading ? (
    <View
      style={{ alignItems: 'center', justifyContent: 'center', height: '90%' }}>
      <ActivityIndicator size={100} color="black" />
      <Text style={{ color: 'black', marginTop: 20 }}>
        Processing Your request Please Wait!
      </Text>
    </View>
  ) : (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CustomHeader
          // iconname={'menu'}
          // color={Colors.white}
          // onPress={() => {
          //    navigation.toggleDrawer();
          // }}
          source={require('../../Assets/Images/URWhiteLogo.png')}
          rightButton={
            selectedDriver
              ? 'show'
              : ''
          }
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
                  pinColor="blue">
                  <Image
                    source={require('../../Assets/Images/mapCar.png')}
                    style={{
                      width: 40,
                      height: 40,
                      transform: [
                        { rotate: `${driverCurrentLocation.heading}deg` },
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



        {selectedDriver &&
          driverCurrentLocation.latitude &&
          driverCurrentLocation.longitude &&
          Object.keys(selectedDriver).length > 0 && (
            <View>
              <CustomButton
                text={'Open waze'}
                onPress={openWaze}
                styleContainer={{
                  width: 120,
                  padding: 3,
                  marginHorizontal: 8,
                  marginTop: 20,
                }}
                btnTextStyle={{ fontSize: 14 }}
              />
            </View>
          )}
        {arrivePickUpLocation && <CustomButton text={"Arrived"}
          styleContainer={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: Colors.secondary,
            width: 100,
            borderRadius: 0
          }}
          btnTextStyle={{ fontSize: 16, color: 'white', fontWeight: '600', borderRadius: 0 }}
          onPress={() => setArriveModal(true)}
        />

        }

        
        {((arrive.pickUpLocation && !startRide) ||
          (route.params?.driverArrive &&
            !route.params.startRide &&
            !startRide) ||
          (data?.driverArriveAtPickupLocation &&
            !route.params?.startRide &&
            !startRide)) && (
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
              onPress={() => setRiderOnCabConfirmation(true)}>
              <Text style={{ fontSize: 18, color: 'white', fontWeight: '600' }}>
                Rider On Cab
              </Text>
            </TouchableOpacity>
          )}
        {riderOnCabConfirmation && PassengerConfirmationModal()}
        {arriveDropOffLocation && !endRide && (
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
            onPress={() => rideEndByDriver()}>
            <Text style={{ fontSize: 16, color: 'white', fontWeight: '600' }}>
              End Ride
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ position: 'absolute', right: 10, top: 10 }}>
          <Text
            style={{
              color: 'black',
              fontSize: 18,
              fontWeight: '900',
              marginTop: 10,
            }}>
            Duration:{' '}
            {arrivePickUpLocation ||
              arrive.pickUpLocation ||
              route.params.driverArrive ||
              data?.driverArriveAtPickupLocation
              ? data?.passengerData?.minutes ?? data?.minutes
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
            {arrivePickUpLocation ||
              arrive.pickUpLocation ||
              route.params.driverArrive ||
              data?.driverArriveAtPickupLocation
              ? data?.passengerData?.distance ?? data?.distance
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
              {selectedDriver && (
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: Colors.secondary,
                    }}>
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
                      Linking.openURL(
                        `tel:${passengerData.mobileNumber ??
                        passengerData?.passengerPersonalDetails?.mobileNumber
                        }`,
                      );
                    }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: Colors.primary,
                      }}>
                      {passengerData.mobileNumber ??
                        passengerData?.passengerPersonalDetails?.mobileNumber}
                    </Text>
                    <View style={{ marginRight: 160 }}>
                      <Icon name="phone" size={30} color={Colors.secondary} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <TextInput
                placeholder="PickUp Location"
                placeholderTextColor={Colors.gray}
                value={
                  data?.passengerData?.pickupAddress ?? data?.pickupAddress
                }
                onChangeText={setpickUpLocation}
                selectionColor={Colors.black}
                activeUnderlineColor={Colors.gray}
                multiline={true}
                numberOfLines={2}
                style={[styles.textInputStyle]}
                editable={false}
              />
              <TextInput
                placeholder="Destination Location"
                placeholderTextColor={Colors.gray}
                value={
                  data?.passengerData?.dropOffAddress ?? data?.dropOffAddress
                }
                onChangeText={setdropOffLocation}
                selectionColor={Colors.black}
                multiline={true}
                numberOfLines={2}
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
                value={`${passengerData.bidFare > 0
                  ? 'Customer Bid:'
                  : 'Recomended Fare:'
                  } $${route.params?.bidFare
                    ? route.params?.data?.bidFare
                    : route?.params?.data?.bidFare > 0
                      ? route?.params?.data?.bidFare
                      : route?.params?.data?.bidFare
                        ? route?.params?.bidFare
                        : route?.params?.data?.passengerData?.fare
                  }`}
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
                  value={`Your Bid: $${driverBidFare
                    ? driverBidFare
                    : route.params?.selectedDriver?.bidFare
                    }`}
                />
              )}
              {/* {passengerData.bidFare > 0 && !selectedDriver && (
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
              )} */}
              {appearBiddingOption && (
                <AppModal
                  modalVisible={appearBiddingOption}
                  close={closeModal}
                  fare={passengerData.bidFare}
                  confirm={confirmBidFare}
                  state="driver"
                />
              )}
              {arriveModal && <ArriveModal />}

              {endRide && tipAmount && DropOffModal(tipAmount, tollAmount)}
              {cancelRide && cancelRideModal()}

              {/* </ScrollView> */}
              {/* {!selectedDriver && (
                <View
                  style={[
                    styles.btnContainer,
                    {flexDirection: 'row', justifyContent: 'space-between'},
                  ]}
                >
                  <CustomButton
                    text="Accept"
                    onPress={sendRequest}
                    styleContainer={{width: '49%'}}
                  />
                  <CustomButton
                    text={
                      rejectLoader ? (
                        <ActivityIndicator
                          size={'large'}
                          color={Colors.black}
                        />
                      ) : (
                        'Reject'
                      )
                    }
                    onPress={rejectRequest}
                    styleContainer={{width: '49%'}}
                  />
                </View>
              )} */}
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
