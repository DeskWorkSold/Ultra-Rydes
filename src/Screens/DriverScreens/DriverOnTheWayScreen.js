import React, {useState, useRef, useEffect, useLayoutEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  TouchableOpacityBase,
  BackHandler,
  AppState,
  Alert,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import moment from 'moment-timezone';
import MapViewDirections from 'react-native-maps-directions';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import Colors from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import CustomButton from '../../Components/CustomButton';
import {useIsFocused} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {
  getCurrentLocation,
  locationPermission,
} from '../../Helper/HelperFunction';
import Geocoder from 'react-native-geocoding';
import firestore from '@react-native-firebase/firestore';
import {ActivityIndicator} from 'react-native-paper';
import {useCallback} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import AddressPickup from '../../Components/AddressPickup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getPreciseDistance} from 'geolib';
import Sound from 'react-native-sound';
import mytone from '../../Assets/my_sound.mp3';
import IdleTimerManager from 'react-native-idle-timer';

export default function DriverOnTheWay() {
  const route = useRoute();
  const focus = useIsFocused();
  let data = route?.params?.data;
  let navigation = useNavigation();

  const [pickUpLocation, setpickUpLocation] = useState('');
  const [dropOffLocation, setdropOffLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [driverUid, setDriverUid] = useState('');
  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;
  const LATITUDE_DELTA = 0.04;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
  const [state, setState] = useState({});
  const [myTimeZone, setTimeZone] = useState('');
  const [passengersData, setPassengersData] = useState([]);
  const [rejectLoader, setRejectLoader] = useState(false);
  const [ding, setDing] = useState({});
  const [requestLoader, setRequestLoader] = useState(false);
  const [requestIds, setRequestIds] = useState([]);
  const [acceptRequest, setAcceptRequest] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [location, setLocation] = useState({
    pickupCords: state,
    dropLocationCords: {
      latitude: null,
      longitude: null,
    },
  });
  const [startRide, setStartRide] = useState(false);
  const {pickupCords, dropLocationCords} = location;

  const [myDriverData, setMyDriverData] = useState({});
  const [minutesAndDistanceDifference, setMinutesAndDistanceDifference] =
    useState({
      minutes: '',
      distance: '',
      details: '',
    });
  const [driverCurrentLocation, setDriverCurrentLocation] = useState({});

  Sound.setCategory('Playback');

  console.log(focus, 'focus');

  AppState.addEventListener('change', nextAppState => {
    const currentUser = auth().currentUser;
    if (!currentUser && !focus) {
      return;
    }

    const driverId = currentUser?.uid;
    if (nextAppState === 'background' || nextAppState == 'inactive' || focus) {
      console.log(nextAppState, 'appstate');

      firestore()
        .collection('Drivers')
        .doc(driverId)
        .get()
        .then(driverDoc => {
          if (!driverDoc._exists) {
            return;
          }
          const driverData = driverDoc.data();

          if (driverData?.status === 'online' && driverData?.onTheWay) {
            firestore()
              .collection('inlinedDriver')
              .doc(driverId)
              .get()
              .then(inlinedDoc => {
                console.log(inlinedDoc, 'docccc');
                const inlinedData = inlinedDoc.data();
                if (!inlinedData?.inlined || !inlinedDoc._exists) {
                  firestore().collection('Drivers').doc(driverId).update({
                    currentLocation: null,
                    status: 'offline',
                  });
                }
              })
              .catch(error => {
                console.error('Error getting inlined driver document:', error);
              });
          }
        })
        .catch(error => {
          console.error('Error getting driver document:', error);
        });
    } else if (nextAppState === 'active') {
      firestore()
        .collection('Drivers')
        .doc(driverId)
        .get()
        .then(driverDoc => {
          if (!driverDoc?._exists || !focus) {
            return;
          }
          const driverData = driverDoc.data();
          if (driverData.status === 'offline') {
            firestore()
              .collection('inlinedDriver')
              .doc(driverId)
              .get()
              .then(inlinedDoc => {
                const inlinedData = inlinedDoc.data();
                if (!inlinedData?.inlined || !inlinedDoc?._exists) {
                  firestore().collection('Drivers').doc(driverId).update({
                    currentLocation: state,
                    status: 'online',
                  });
                }
              })
              .catch(error => {
                console.error('Error getting inlined driver document:', error);
              });
          }
        })
        .catch(error => {
          console.error('Error getting driver document:', error);
        });
    }
  });

  // const getTimeZone = async () => {
  //   if (state.latitude && state.longitude) {
  //     let {latitude, longitude} = state;
  //     const timestamp = Math.floor(Date.now() / 1000);
  //     const response = await fetch(
  //       `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${GoogleMapKey.GOOGLE_MAP_KEY}`,
  //     );
  //     // parse the response as JSON
  //     const data = await response.json();
  //     // extract the state or province from the response
  //     const timeZone = data.timeZoneId;
  //     setTimeZone(timeZone);
  //   }
  // };

  // useEffect(() => {
  //   getTimeZone();
  // }, [state]);

  useEffect(() => {
    // Disable screen timeout when the component mounts
    IdleTimerManager.setIdleTimerDisabled(true);

    // Re-enable screen timeout when the component unmounts
    return () => {
      IdleTimerManager.setIdleTimerDisabled(false);
    };
  }, []);

  const checkRequestStatus = () => {
    if (requestData && requestData?.bidFare) {
      firestore()
        .collection('Request')
        .doc(requestData.id)
        .get()
        .then(doc => {
          let data = doc.data();

          if (
            data &&
            data.myDriversData &&
            !Array.isArray(data.myDriversData) &&
            data.myDriversData.requestStatus == 'rejected'
          ) {
            ToastAndroid.show(
              'Your Request has been rejected',
              ToastAndroid.SHORT,
            );
            setRequestLoader(false);
            return;
          }

          if (
            data &&
            data?.myDriversData &&
            Array.isArray(data?.myDriversData)
          ) {
            let flag = data?.myDriversData.some(
              (e, i) =>
                e.id == myDriverData?.id && e.requestStatus == 'rejected',
            );

            if (flag) {
              ToastAndroid.show(
                'Your Request has been rejected',
                ToastAndroid.SHORT,
              );
              setRequestLoader(false);
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
              data.myDriversData.id == myDriverData.id &&
              data.myDriversData.requestStatus == 'accepted'
            ) {
              ToastAndroid.show(
                'Your request has been accepted',
                ToastAndroid.SHORT,
              );
              setAcceptRequest(true);

              try {
                requestData.driverData = myDriverData;
                let myData = JSON.stringify(requestData ?? data);

                AsyncStorage.setItem('driverBooking', myData);
              } catch (error) {}

              firestore()
                .collection('inlinedDriver')
                .doc(myDriverData.id)
                .set({
                  inlined: true,
                  id: myDriverData.id,
                })
                .then(() => {
                  navigation.navigate('DriverRoutes', {
                    screen: 'DriverBiddingScreen',
                    params: {
                      data: requestData ?? data,
                      passengerState: {
                        pickupCords: data?.pickupCords,
                        dropLocationCords: data?.dropLocationCords,
                      },
                      selectedDriver: myDriverData,
                    },
                  });
                  setRequestLoader(false);
                })
                .catch(error => {
                  setRequestLoader(false);
                  console.log(error);
                });
            }
            return;
          }

          if (data && data.myDriversData && Array.isArray(data.myDriversData)) {
            let flag = data.myDriversData.some(
              (e, i) => e.selected && e.id == myDriverData.id,
            );

            let flag1 = data.myDriversData.some(
              (e, i) =>
                e.id == myDriverData.id && e.requestStatus == 'rejected',
            );
            if (flag && !flag1) {
              ToastAndroid.show(
                'Your request has been accepted',
                ToastAndroid.SHORT,
              );
              setAcceptRequest(true);

              try {
                requestData.driverData = myDriverData;
                let myData = JSON.stringify(requestData ?? data);
                AsyncStorage.setItem('driverBooking', myData);
              } catch (error) {}

              firestore()
                .collection('inlinedDriver')
                .doc(myDriverData.id)
                .set({
                  inlined: true,
                  id: myDriverData.id,
                })
                .then(() => {
                  navigation.navigate('DriverRoutes', {
                    screen: 'DriverBiddingScreen',
                    params: {
                      data: requestData ?? data,
                      passengerState: {
                        pickupCords: data?.pickupCords,
                        dropLocationCords: data?.dropLocationCords,
                      },
                      selectedDriver: myDriverData,
                    },
                  });
                  setRequestLoader(false);
                })
                .catch(error => {
                  setRequestLoader(false);
                  console.log(error);
                });
            } else if (!flag && flag1) {
              ToastAndroid.show(
                'Your request has been rejected',
                ToastAndroid.SHORT,
              );
            }
          }
        });
    }
  };

  useEffect(() => {
    if (requestLoader && myDriverData && !acceptRequest) {
      let interval = setInterval(() => {
        checkRequestStatus();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [requestLoader]);

  useEffect(() => {
    if (requestLoader) {
      setDing('');
      return;
    }

    if (acceptRequest) {
      setDing('');
      return;
    }

    let createSound = new Sound(mytone, error => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      // if loaded successfully
      // console.log(
      //   'duration in seconds: ' +
      //     createSound.getDuration() +
      //     'number of channels: ' +
      //     createSound.getNumberOfChannels(),
      //   setDing(createSound),
      //   // playPause()
      // );
      setDing(createSound);

      //   console.log(passengerBookingData.length, "" , requestIds.length)
      //   if(passengerBookingData.length>requestIds.length){
      // }
    });
  }, [passengersData, requestLoader]);

  const checkRouteData = () => {
    data = JSON.parse(data);

    if (data?.pickupCords && data.dropLocationCords && data?.startRide) {
      setState(data.pickupCords);
      setLocation({
        ...location,
        pickupCords: data?.pickupCords,
        dropLocationCords: data?.dropLocationCords,
      });
      setStartRide(true);
    }
  };
  useEffect(() => {
    data && Object.keys(data).length > 0 && checkRouteData();
  }, [data]);

  const getLocation = async () => {
    const hasLocationPermission = await locationPermission();

    if (!hasLocationPermission) {
      return;
    }

    let id = auth().currentUser.uid;
    getCurrentLocation().then(res => {
      if (startRide) {
        firestore()
          .collection('Drivers')
          .doc(id)
          .update({
            currentLocation: {
              latitude: res.latitude,
              longitude: res.longitude,
              heading: res.heading,
            },
            status: 'online',
          })
          .then(response => {
            setState({
              latitude: res.latitude,
              longitude: res.longitude,
              heading: res.heading,
            });
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        setState({
          latitude: res.latitude,
          longitude: res.longitude,
          heading: res.heading,
        });
      }
    });
  };
  useEffect(() => {
    getLocation();
    let interval = setInterval(() => {
      getLocation();
    }, 15000);
    return () => clearInterval(interval);
  }, [startRide]);

  useEffect(() => {
    // gettingFormattedAddress();
    getDriverUid();
    getDriverData();
  }, [startRide, data]);

  useEffect(() => {
    if (passengersData.length < requestIds.length) {
      setRequestIds(
        passengersData &&
          passengersData.length > 0 &&
          passengersData.map((e, i) => {
            if (e?.passengerData) {
              return e.passengerData.id;
            } else {
              return e?.id;
            }
          }),
      );
    }

    if (ding && Object.keys(ding).length > 0) {
      ding.setVolume(5);
      playPause();
      return () => {
        ding.release();
      };
    }
  }, [passengersData, ding]);

  const playPause = () => {
    let passengersDataId =
      passengersData.length > 0 &&
      passengersData.map((e, i) => {
        return e?.passengerData ? e.passengerData.id : e.id;
      });

    let newRequest = [];

    if (requestIds && requestIds.length > 0) {
      passengersDataId &&
        passengersDataId.length > 0 &&
        passengersDataId.forEach((e, i) => {
          let newId =
            requestIds &&
            requestIds.length > 0 &&
            requestIds.every((j, ind) => {
              if (e !== j) {
                return e;
              }
            });
          newId && newRequest.push(newId);
        });
    }

    if (
      passengersData &&
      passengersData.length > 0 &&
      requestIds.length > 0 &&
      newRequest &&
      newRequest.length > 0
    ) {
      // ding.setNumberOfLoops(1);

      ding.play(success => {
        if (success) {
          // console.log('successfully finished playing');
          let interval = setTimeout(() => {
            setRequestIds(
              passengersData &&
                passengersData.length > 0 &&
                passengersData.map((e, i) => {
                  if (e?.passengerData) {
                    return e.passengerData.id;
                  } else {
                    return e.id;
                  }
                }),
            );
          }, 30000);
        } else {
          // console.log('playback failed due to audio decoding errors');
        }
      });
    }
    if (requestIds.length == 0 && passengersData.length > 0) {
      ding.play(success => {
        if (success) {
          // console.log('successfully finished playing');

          setTimeout(() => {
            setRequestIds(
              passengersData &&
                passengersData.length > 0 &&
                passengersData.map((e, i) => {
                  if (e?.passengerData) {
                    return e.passengerData.id;
                  } else {
                    return e.id;
                  }
                }),
            );
          }, 30000);
        }
      });
    }
  };

  const getPassengersRequests = () => {
    //get request data from firebase

    firestore()
      .collection('Request')
      .get()
      .then(querySnapshot => {
        let requestData = [];

        querySnapshot?.forEach(documentSnapshot => {
          let data = documentSnapshot?.data();
          // const deviceTime = moment(); // get current time in device's time zone
          // const convertedTime = myTimeZone && moment.tz(myTimeZone);
          // const dateTime = convertedTime.format('YYYY-MM-DD HH:mm:ss'); // get the date and time in the format you want
          // const dateObj = moment(dateTime, 'YYYY-MM-DD HH:mm:ss').toDate(); // convert to JavaScript Date object
          let date = data?.requestDate?.toDate();
          let dateObj = new Date()
          let time = date?.getTime();
          let nowTime = dateObj.getTime();
          let requestSeconds = time / 1000;
          let nowSeconds = nowTime / 1000;
          let requestRespondSeconds = requestSeconds + 32;
          let differenceSeconds = requestRespondSeconds - nowSeconds;
          data.timeLimit = differenceSeconds;

          if (
            data &&
            !data?.requestStatus &&
            differenceSeconds > 0 &&
            startRide
          ) {
            let pickupLocationDistance = getPreciseDistance(
              {
                latitude:
                  data && data?.passengerData
                    ? data?.passengerData?.pickupCords?.latitude
                    : data?.pickupCords?.latitude,
                longitude:
                  data && data?.passengerData
                    ? data?.passengerData?.pickupCords?.longitude
                    : data?.pickupCords?.longitude,
              },
              {
                latitude:
                  myDriverData && myDriverData?.currentLocation?.latitude,
                longitude: myDriverData?.currentLocation?.longitude,
              },
            );
            let pickupMileDistance = (pickupLocationDistance / 1609.34).toFixed(
              2,
            );

            let passengerPickupAndDriverDropDis = getPreciseDistance(
              {
                latitude:
                  data && data?.passengerData
                    ? data?.passengerData?.pickupCords?.latitude
                    : data?.pickupCords?.latitude,
                longitude:
                  data && data?.passengerData
                    ? data?.passengerData?.pickupCords?.longitude
                    : data?.pickupCords?.longitude,
              },
              {
                latitude: dropLocationCords && dropLocationCords?.latitude,
                longitude: dropLocationCords?.longitude,
              },
            );

            let passengerpickAndDriverDropMileDis = (
              passengerPickupAndDriverDropDis / 1609.34
            ).toFixed(2);

            let passengerDropAndDriverDropDis = getPreciseDistance(
              {
                latitude:
                  data && data?.passengerData
                    ? data?.passengerData?.dropLocationCords?.latitude
                    : data?.dropLocationCords?.latitude,
                longitude:
                  data && data?.passengerData
                    ? data?.passengerData?.dropLocationCords?.longitude
                    : data?.dropLocationCords?.longitude,
              },
              {
                latitude: dropLocationCords && dropLocationCords?.latitude,
                longitude: dropLocationCords?.longitude,
              },
            );

            let passengerDropAndDriverDropMileDis = (
              passengerDropAndDriverDropDis / 1609.34
            ).toFixed(2);
            let passengerPickupAndPassengerDropDis = getPreciseDistance(
              {
                latitude:
                  data && data?.passengerData
                    ? data?.passengerData?.pickupCords?.latitude
                    : data?.pickupCords?.latitude,
                longitude:
                  data && data?.passengerData
                    ? data?.passengerData?.pickupCords?.longitude
                    : data?.pickupCords?.longitude,
              },
              {
                latitude:
                  data && data?.passengerData
                    ? data?.passengerData?.dropLocationCords?.latitude
                    : data?.dropLocationCords?.latitude,
                longitude:
                  data && data?.passengerData
                    ? data?.passengerData?.dropLocationCords?.longitude
                    : data?.dropLocationCords?.longitude,
              },
            );

            let passengerPickAndPassengerDropMileDis = (
              passengerPickupAndPassengerDropDis / 1609.34
            ).toFixed(2);
            let driverPickAndDriverDropDis = getPreciseDistance(
              {
                latitude:
                  data && data?.passengerData
                    ? data?.passengerData?.pickupCords?.latitude
                    : data?.pickupCords?.latitude,
                longitude:
                  data && data?.passengerData
                    ? data?.passengerData?.pickupCords?.longitude
                    : data?.pickupCords?.longitude,
              },
              {
                latitude: dropLocationCords && dropLocationCords?.latitude,
                longitude: dropLocationCords?.longitude,
              },
            );

            let DriverPickAndDriveDropMileDis = (
              driverPickAndDriverDropDis / 1609.34
            ).toFixed(2);

            let remainingDis =
              DriverPickAndDriveDropMileDis -
              passengerPickAndPassengerDropMileDis;
            remainingDis = remainingDis + 2;

            if (
              Number(pickupMileDistance) <= 5 &&
              Number(passengerDropAndDriverDropMileDis) <
                Number(passengerpickAndDriverDropMileDis) &&
              Number(DriverPickAndDriveDropMileDis) >=
                Number(passengerPickAndPassengerDropMileDis) &&
              Number(passengerDropAndDriverDropMileDis) < remainingDis
            ) {
              if (data) {
                let matchUid = false;
                let uid = auth().currentUser.uid;

                if (
                  data &&
                  data.myDriversData &&
                  !Array.isArray(data.myDriversData)
                ) {
                  matchUid =
                    data.myDriversData.id == uid &&
                    data.myDriversData.requestStatus;
                } else if (
                  data &&
                  data.myDriversData &&
                  Array.isArray(data.myDriversData)
                ) {
                  matchUid = data.myDriversData.some(
                    (e, i) => e.id == uid && e.requestStatus,
                  );
                }

                let checkRejectStatus = false;
                if (
                  data &&
                  data.myDriversData &&
                  Array.isArray(data.myDriversData)
                ) {
                  checkRejectStatus = data.myDriversData.some(
                    (e, i) => e.id == uid && e.requestStatus == 'rejected',
                  );
                }
                if (
                  data &&
                  data.myDriversData &&
                  !Array.isArray(data.myDriversData) &&
                  data.myDriversData.requestStatus
                ) {
                  checkRejectStatus =
                    data.myDriversData.id == uid &&
                    data.myDriversData.requestStatus == 'rejected';
                }
                let flag = '';
                if (
                  data &&
                  !data.passengerData &&
                  data.selectedCar &&
                  myDriverData &&
                  myDriverData.vehicleDetails
                ) {
                  let selectedVehicle = data?.selectedCar.map(
                    (e, i) => e.carName,
                  );

                  flag =
                    selectedVehicle ==
                    myDriverData?.vehicleDetails?.vehicleCategory;
                }

                let id = auth().currentUser.uid;
                let flag2 = data?.rejectedDrivers?.some((e, i) => e == id);

                let rejectStatus = false;

                if (
                  data &&
                  data.passengerData &&
                  myDriverData.id == data.driverData.id &&
                  !data.requestStatus &&
                  !checkRejectStatus &&
                  !flag2 &&
                  !rejectStatus &&
                  requestData.length == 0
                ) {
                  requestData.push(data);
                } else {
                  if (
                    data &&
                    data.bidFare &&
                    !data.requestStatus &&
                    flag &&
                    !matchUid &&
                    !checkRejectStatus &&
                    !flag2 &&
                    requestData.length == 0
                  ) {
                    requestData.push(data);
                  }
                }
              }
            }
          }
        });
        setPassengersData(requestData);
      });
  };

  useEffect(() => {
    if (startRide && Object.keys(myDriverData).length > 0) {
      let interval = setInterval(() => {
        getPassengersRequests();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [startRide, passengersData, data, myDriverData]);

  const getDriverData = () => {
    const driverId = auth().currentUser.uid;

    firestore()
      .collection('Drivers')
      .doc(driverId)
      .onSnapshot(querySnapshot => {
        let data = querySnapshot.data();
        data.id = driverId;
        setMyDriverData(data);
      });
  };

  const getDriverUid = () => {
    let uid = auth().currentUser.uid;
    setDriverUid(uid);
  };

  const getMinutesAndDistance = result => {
    setMinutesAndDistanceDifference({
      ...minutesAndDistanceDifference,
      minutes: result.duration,
      distance: result.distance,
      details: result.legs[0],
    });
  };

  const fetchDestinationCords = (lat, lng) => {
    setLocation({
      ...location,
      dropLocationCords: {
        latitude: lat,
        longitude: lng,
      },
    });
  };

  const handleRideStart = async () => {
    try {
      if (!dropLocationCords.latitude && !dropLocationCords.longitude) {
        ToastAndroid.show('Kindly Enter DropLocation', ToastAndroid.SHORT);
        return;
      }
      let id = auth()?.currentUser?.uid;
      firestore()
        .collection('Drivers')
        .doc(id)
        .update({
          currentLocation: state,
          status: 'online',
          onTheWay: true,
          dropLocationCords: dropLocationCords,
        })
        .then(res => {
          let dataToSave = {
            pickupCords: state,
            dropLocationCords: dropLocationCords,
            startRide: true,
          };
          dataToSave = JSON.stringify(dataToSave);
          AsyncStorage.setItem('onTheWayRideStart', dataToSave);
          setStartRide(true);
          ToastAndroid.show('Your ride has been started', ToastAndroid.SHORT);
        })
        .catch(error => {
          ToastAndroid.show('Error', ToastAndroid.SHORT);
        });
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const AcceptRequest = item => {
    const Userid = item?.id ?? item?.passengerData?.id;

    firestore()
      .collection('Request')
      .doc(Userid)
      .get()
      .then(doc => {
        let data = doc.data();
        if (data && !data?.bidFare) {
          let passengerData = data?.passengerData;
          firestore()
            .collection('Request')
            .doc(passengerData.id)
            .update({
              requestStatus: 'accepted',
            })
            .then(() => {
              ToastAndroid.show(
                'You have successfully accepted customer Request',
                ToastAndroid.SHORT,
              );
              try {
                data.passengerData = item.passengerData;
                data.driverData = item.driverData;
                let myData = JSON.stringify(data);
                AsyncStorage.setItem('driverBooking', myData);
              } catch (error) {}
              firestore()
                .collection('inlinedDriver')
                .doc(myDriverData.id)
                .set({
                  inlined: true,
                  id: myDriverData.id,
                })
                .then(() => {
                  item.driverData = myDriverData;
                  navigation.navigate('DriverRoutes', {
                    screen: 'DriverBiddingScreen',
                    params: {
                      data: item,
                      passengerState: {
                        pickupCords: item?.passengerData
                          ? item?.passengerData?.pickupCords
                          : item?.pickupCords,
                        dropLocationCords: item?.passengerData
                          ? item?.passengerData?.dropLocationCords
                          : item?.dropLocationCords,
                      },
                      selectedDriver: myDriverData,
                    },
                  });
                })
                .catch(error => {
                  console.log(error);
                  ToastAndroid.show(error.message, ToastAndroid.SHORT);
                });
            })
            .catch(error => {
              ToastAndroid.show(error.message, ToastAndroid.SHORT);
              console.log(error);
            });
        }

        if (data && data?.bidFare) {
          if (data?.requestStatus == 'accepted') {
            ToastAndroid.show(
              'Another driver has accepted this request',
              ToastAndroid.SHORT,
            );
            return;
          }
          if (
            data.myDriversData &&
            !Array.isArray(data.myDriversData) &&
            data.myDriversData.id == myDriverData.id
          ) {
            ToastAndroid.show(
              'You have already accepted this request',
              ToastAndroid.SHORT,
            );
            return;
          }
          if (
            data.myDriversData &&
            Array.isArray(data.myDriversData) &&
            data.myDriversData.some((e, i) => e.id == myDriverData.id)
          ) {
            ToastAndroid.show(
              'You have already accepted this request',
              ToastAndroid.SHORT,
            );
            return;
          }
        }

        if (data && !data.myDriversData) {
          firestore()
            .collection('Request')
            .doc(data.id)
            .update({
              myDriversData: myDriverData,
            })
            .then(() => {
              ToastAndroid.show(
                'Your request has been send to passenger',
                ToastAndroid.SHORT,
              );
              setRequestData(item);
              setRequestLoader(true);
            })
            .catch(error => {
              console.log(error);
            });
          return;
        }

        if (data && Array.isArray(data.myDriversData) && !data.requestStatus) {
          let flag = data.myDriversData.some((e, i) => e.id == myDriverData.id);

          if (flag) {
            ToastAndroid.show('You have already requested', ToastAndroid.SHORT);
            return;
          } else {
            let driverDataArray = [...data.myDriversData, myDriverData];
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
                setRequestData(item);
                setRequestLoader(true);
              })
              .catch(error => {
                console.log(error);
              });
            return;
          }
        }

        if (
          data &&
          data.myDriversData &&
          !Array.isArray(data.myDriversData) &&
          myDriverData.id !== data.myDriversData.id
        ) {
          let myData = [data.myDriversData];
          let driverDataArray = [...myData, myDriverData];
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
              setRequestData(item);
              setRequestLoader(true);
            });
        }
      });
  };

  const rejectRequest = async data => {
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
          setRejectLoader(false);
          setPassengersData([]);
          ToastAndroid.show(
            'You have successfully rejected the request',
            ToastAndroid.SHORT,
          );
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
            let data = doc?.data();

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
          rejectedDrivers: rejectedDrivers,
          requestStatus: 'rejected',
        })
        .then(() => {
          setTimeout(() => {
            setRejectLoader(false);
            setPassengersData([]);
            ToastAndroid.show(
              'Your have succesfully rejected the request',
              ToastAndroid.SHORT,
            );
          }, 1000);
        });
    }
  };

  useEffect(() => {
    if (requestLoader || startRide) {
      const backAction = () => {
        Alert.alert('Hold on!', 'Stop your ride and then go back', [
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
  }, [requestLoader, startRide, data]);

  const stopRide = async () => {
    try {
      firestore()
        .collection('Drivers')
        .doc(myDriverData?.id)
        .update({
          currentLocation: null,
          status: 'offline',
          onTheWay: false,
          dropLocationCords: null,
        })
        .then(async () => {
          await AsyncStorage.removeItem('onTheWayRideStart');
          data = [];
          route.params = [];
          setStartRide(false);
          setPassengersData([]);
          ToastAndroid.show('Your ride has been stopped', ToastAndroid.SHORT);
        })
        .catch(error => {
          ToastAndroid.show(error.message, ToastAndroid.SHORT);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const mapRef = useRef();

  return loading || requestLoader ? (
    <View style={styles.activityIndicatorStyles}>
      <ActivityIndicator size="large" color={Colors.fontColor} />
    </View>
  ) : (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CustomHeader
          iconname={'menu'}
          color={Colors.white}
          onPress={() => {
            !startRide && navigation.toggleDrawer();
          }}
          source={require('../../Assets/Images/URWhiteLogo.png')}
        />
        {startRide && (
          <TouchableOpacity
            style={{
              width: 100,
              padding: 10,
              position: 'absolute',
              top: 2,
              right: 10,
            }}
            onPress={() => {
              stopRide();
            }}>
            <Text
              style={{
                color: Colors.red,
                fontSize: 18,
                textAlign: 'center',
                fontWeight: '800',
              }}>
              Stop Ride
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.mapContainer}>
        {state.latitude && state.longitude && (
          <MapView
            ref={mapRef}
            zoomEnabled={true}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              ...state,
              latitudeDelta: 0.9,
              longitudeDelta: 0.09,
            }}>
            {state && state.latitude && state.longitude && (
              <Marker
                coordinate={{
                  latitude: state && state.latitude,
                  longitude: state && state.longitude,
                }}
                title="Your Location"
                description={minutesAndDistanceDifference.details.start_address}
                pinColor="blue">
                <Image
                  source={require('../../Assets/Images/mapCar.png')}
                  style={{
                    width: 40,
                    height: 40,
                    transform: [{rotate: `${state.heading}deg`}],
                  }}
                  resizeMode="contain"
                />
              </Marker>
            )}
            {/* {state && getViewLocation()} */}
            {dropLocationCords.latitude && dropLocationCords.longitude && (
              <MapViewDirections
                origin={state}
                destination={location.dropLocationCords}
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

            {location &&
              location?.dropLocationCords?.latitude &&
              location?.dropLocationCords?.longitude && (
                <Marker
                  coordinate={{
                    latitude: location?.dropLocationCords?.latitude,
                    longitude: location?.dropLocationCords?.longitude,
                  }}
                  title="Destination Location"
                  description={
                    minutesAndDistanceDifference.details.start_address
                  }
                  pinColor="blue"
                />
              )}
          </MapView>
        )}

        {/* <View style={{position: 'absolute', right: 10, top: 10}}>
          <Text
            style={{
              color: 'black',
              fontSize: 18,
              fontWeight: '900',
              marginTop: 10,
            }}>
            Duration: {Math.ceil(minutesAndDistanceDifference.minutes)} Minutes
          </Text>
          <Text
            style={{
              color: 'black',
              fontSize: 18,
              fontWeight: '900',
              marginTop: 5,
            }}>
            Distance:{' '}
            {(minutesAndDistanceDifference.distance * 0.621371).toFixed(2)}{' '}
            Miles{' '}
          </Text>
        </View> */}
      </View>
      {!startRide && (
        <View style={styles.bottomCard}>
          <KeyboardAvoidingView>
            <ScrollView
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled">
              <KeyboardAvoidingView>
                <AddressPickup
                  placeholderText={'Enter Destination Location'}
                  fetchAddress={fetchDestinationCords}
                />

                {!selectedDriver && (
                  <View style={styles.btnContainer}>
                    <CustomButton
                      text="Start Ride"
                      onPress={() => handleRideStart()}
                    />
                  </View>
                )}
              </KeyboardAvoidingView>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

      {passengersData && passengersData.length > 0 && (
        <View style={{width: '100%', marginTop: 20}}>
          {passengersData &&
            passengersData.length > 0 &&
            passengersData.map((item, index) => {
              let items = item.passengerData ?? item;
              items.selectedCar[0].carMiles.map((e, i) => {
                if (
                  Number(items.distance) >= e.rangeMin &&
                  items.distance <= e.rangeMax
                ) {
                  let percentageBid = Math.round(
                    (Number(items.bidFare) / Number(items.fare)) * 100,
                  );
                  let baseCharge = items.selectedCar[0].carMiles[0].mileCharge;
                  let myDistance = 0;
                  if (items?.distance > 3) {
                    myDistance = items.distance - 3;
                  }
                  let milesCharge = myDistance * e.mileCharge;
                  let totalCharges = baseCharge + milesCharge;
                  items.fare = totalCharges.toFixed(2);
                  if (item && !item.passengerData) {
                    items.bidFare = (
                      (Number(items.fare) * percentageBid) /
                      100
                    ).toFixed(2);
                  }
                }
              });

              item.timeLimit = item.timeLimit - 2;

              return (
                <View
                  style={styles.listItemContainer}
                  key={item.passengerData ? item.passengerData.id : item.id}
                  // onPress={() => {
                  //   navigation.navigate('DriverRoutes', {
                  //     screen: 'DriverBiddingScreen',
                  //     params: {
                  //       data: items,
                  //       passengerState: {
                  //         pickupCords: item.passengerData
                  //           ? item.passengerData.pickupCords
                  //           : item.pickupCords,
                  //         dropLocationCords: item.passengerData
                  //           ? item.passengerData.dropLocationCords
                  //           : item.dropLocationCords,
                  //       },
                  //     },
                  //   });
                  // }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginHorizontal: 10,
                      paddingBottom: 10,
                      borderBottomWidth: 2,
                      borderBottomColor: Colors.secondary,
                      alignItems: 'center',
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        fontSize: 22,
                        color: Colors.black,
                        fontWeight: '400',
                        width: '54%',
                      }}>
                      Time Remaining:
                    </Text>
                    <Text
                      style={{
                        fontSize: 22,
                        color: Colors.secondary,
                        fontWeight: '400',
                        width: '46%',
                      }}>
                      {item?.timeLimit?.toFixed(0)} Seconds
                    </Text>
                  </View>
                  <Text style={styles.itemTextStyle}>
                    Pickup Cords:
                    <Text style={styles.itemLocStyle}>
                      {item.passengerData
                        ? item.passengerData.pickupAddress
                        : item.pickupAddress}
                    </Text>
                  </Text>
                  <Text style={styles.itemTextStyle}>
                    Destination Cords:
                    <Text style={styles.itemLocStyle}>
                      {item.passengerData
                        ? item.passengerData.dropOffAddress
                        : item.dropOffAddress}
                    </Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                      alignItems: 'center',
                      padding: 10,
                    }}>
                    <Text
                      style={[
                        styles.itemTextStyle,
                        {width: '50%', textAlign: 'center'},
                      ]}>
                      Fare:
                      <Text style={styles.itemLocStyle}>
                        $
                        {item.passengerData
                          ? item.passengerData.fare
                          : item.fare}
                      </Text>
                    </Text>
                    <Text
                      style={[
                        styles.itemTextStyle,
                        {width: '50%', textAlign: 'center'},
                      ]}>
                      Distance:
                      <Text style={[styles.itemLocStyle, {fontSize: 18}]}>
                        {item.passengerData
                          ? item.passengerData.distance
                          : item.distance}{' '}
                        miles away
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: 10,
                    }}>
                    {items && items.bidFare > 0 && (
                      <Text
                        style={[
                          styles.itemTextStyle,
                          {width: '50%', textAlign: 'center'},
                        ]}>
                        Bid Fare:
                        <Text style={styles.itemLocStyle}>
                          ${items.bidFare}
                        </Text>
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.itemTextStyle,
                        {width: '50%', textAlign: 'center'},
                      ]}>
                      Minutes:
                      <Text style={styles.itemLocStyle}>
                        {items?.passengerData
                          ? items?.passengerData?.minutes
                          : items.minutes}
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      justifyContent: 'space-around',
                      padding: 5,
                    }}>
                    <CustomButton
                      onPress={() => AcceptRequest(item)}
                      text={'Accept'}
                      styleContainer={{width: '45%'}}
                    />
                    <CustomButton
                      text={
                        rejectLoader ? (
                          <ActivityIndicator size={40} color={Colors.black} />
                        ) : (
                          'Reject'
                        )
                      }
                      onPress={() => rejectRequest(item)}
                      styleContainer={{width: '45%'}}
                    />
                  </View>
                </View>
              );
            })}
        </View>
      )}
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
  activityIndicatorStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    zIndex: 1,
    backgroundColor: Colors.fontColor,
  },
  innerContainerOffline: {
    margin: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextStyle: {
    color: Colors.fontColor,
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
  },
  itemLocStyle: {
    color: Colors.black,
    fontFamily: 'Poppins-Medium',
    marginLeft: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  itemTextStyleHeading: {
    margin: 4,
    color: Colors.black,
  },
  listContainer: {
    flex: 1,
  },
  listItemContainer: {
    margin: 5,
    padding: 5,
    paddingLeft: 8,
    borderBottomWidth: 1,
  },
  statusContainer: {
    margin: 10,
  },
  textStyleOffline: {
    color: Colors.black,
  },
});
