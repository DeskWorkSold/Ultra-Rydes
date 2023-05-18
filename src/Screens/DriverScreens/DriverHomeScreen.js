import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
  Alert,
} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import {StackActions} from '@react-navigation/native';
import {AppState} from 'react-native';
import Colors from '../../Constants/Colors';
import SwitchSelector from 'react-native-switch-selector';
import {locationPermission} from '../../Helper/HelperFunction';
import auth from '@react-native-firebase/auth';
import firestore, {firebase} from '@react-native-firebase/firestore';
import Geolocation from 'react-native-geolocation-service';
import {getPreciseDistance} from 'geolib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback} from 'react';
import Sound from 'react-native-sound';
import mytone from '../../Assets/my_sound.mp3';
import CustomButton from '../../Components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import {BackHandler} from 'react-native';
import IdleTimerManager from 'react-native-idle-timer';
import {useIsFocused} from '@react-navigation/native';

export default function DriverHomeScreen({route}) {
  let navigation = useNavigation();
  const [passengerState, setPassengerState] = useState({
    pickupCords: {
      latitude: 24.863,
      longitude: 67.3365,
    },
    dropLocationCords: {
      latitude: 24.9204,
      longitude: 67.1344,
    },
  });

  const [driverData, setDriverData] = useState('');
  const [state, setState] = useState({
    pickupCords: null,
    dropLocationCords: {},
  });
  const {pickupCords, dropLocationCords} = state;
  const [status, setStatus] = useState(1);
  const [driverStatus, setDriverStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [passengerBookingData, setPassengerBookingData] = useState([]);
  const [requestIds, setRequestIds] = useState([]);
  const [inlinedDrivers, setInlinedDrivers] = useState(false);
  const [watchState, setWatchState] = useState(null);
  const [ding, setDing] = useState('');
  const [rejectLoader, setRejectLoader] = useState(false);
  const [requestLoader, setRequestLoader] = useState(false);
  const [requestData, setRequestData] = useState({});
  const [acceptRequest, setAcceptRequest] = useState(false);
  const [loader, setLoader] = useState(false);

  Sound.setCategory('Playback');

  const focus = useIsFocused();

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
  }, [passengerBookingData, requestLoader]);

  AppState.addEventListener('change', nextAppState => {
    const currentUser = auth().currentUser;
    if (!currentUser || !focus) {
      return;
    }

    const driverId = currentUser?.uid;
    if (nextAppState === 'background' || nextAppState == 'inactive') {
      firestore()
        .collection('Drivers')
        .doc(driverId)
        .get()
        .then(driverDoc => {
          if (!driverDoc._exists) {
            return;
          }

          const driverData = driverDoc.data();
          if (driverData.status === 'online') {
            firestore()
              .collection('inlinedDriver')
              .doc(driverId)
              .get()
              .then(inlinedDoc => {
                const inlinedData = inlinedDoc.data();
                if (!inlinedData?.inlined) {
                  // Update the driver's status to offline and clear their location
                  removeLocationUpdates();
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
          if (!driverDoc._exists || !focus) {
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
                  // Update the driver's status to offline and clear their location
                  getLocationUpdates();
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

  useEffect(() => {
    setStatus(1);
    setDriverStatus('offline');
  }, [focus]);

  useEffect(() => {
    const backAction = () => {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        return true;
      } else {
        firestore()
          .collection('Drivers')
          .doc(currentUser.uid)
          .update({
            status: 'offline',
            currentLocation: null,
          })
          .then(() => {
            return true;
          });
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [focus]);

  useEffect(() => {
    if (requestLoader) {
      const backAction = () => {
        Alert.alert(
          'Hold on!',
          'Your request is in process wait for passenger response',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
          ],
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }
  }, [requestLoader]);

  useEffect(() => {
    if (passengerBookingData.length < requestIds.length) {
      setRequestIds(
        passengerBookingData &&
          passengerBookingData.length > 0 &&
          passengerBookingData.map((e, i) => {
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
  }, [passengerBookingData, ding]);

  const playPause = () => {
    let passengerBookingDataId =
      passengerBookingData.length > 0 &&
      passengerBookingData.map((e, i) => {
        return e?.passengerData ? e.passengerData.id : e.id;
      });

    let newRequest = [];

    if (requestIds && requestIds.length > 0) {
      passengerBookingDataId &&
        passengerBookingDataId.length > 0 &&
        passengerBookingDataId.forEach((e, i) => {
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
      passengerBookingData &&
      passengerBookingData.length > 0 &&
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
              passengerBookingData &&
                passengerBookingData.length > 0 &&
                passengerBookingData.map((e, i) => {
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
    if (requestIds.length == 0 && passengerBookingData.length > 0) {
      ding.play(success => {
        if (success) {
          // console.log('successfully finished playing');

          setTimeout(() => {
            setRequestIds(
              passengerBookingData &&
                passengerBookingData.length > 0 &&
                passengerBookingData.map((e, i) => {
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
  };

  var watchId;
  const getLocationUpdates = async () => {
    const hasLocationPermission = await locationPermission();

    if (!hasLocationPermission) return;
    watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;

        setState({
          ...state,
          pickupCords: {
            latitude: latitude,
            longitude: longitude,
          },
        });
        updateOnlineOnFirebase();
      },
      error => {
        console.log(error, 'erorr');
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 50,
        interval: 10000,
        fastestInterval: 5000,
      },
    );
    return () => Geolocation.clearWatch(watchId);
  };

  const getDriverBookingData = async () => {
    try {
      let data = await AsyncStorage.getItem('driverBooking');
      let checkDriverArrive = await AsyncStorage.getItem(
        'ArrivedAtpickUpLocation',
      );
      let startRide = await AsyncStorage.getItem('startRide');
      let endRide = await AsyncStorage.getItem('EndRide');

      data = JSON.parse(data);
      if (data && Object.keys(data).length > 0) {
        navigation.navigate('DriverRoutes', {
          screen: 'DriverBiddingScreen',
          params: {
            data: data,
            passengerState: {
              pickupCords: data.passengerData
                ? data.passengerData.pickupCords
                : data.pickupCords,
              dropLocationCords: data.passengerData
                ? data.passengerData.dropLocationCords
                : data.dropLocationCords,
            },
            selectedDriver: data.myDriversData
              ? data.myDriversData
              : data.driverData,
            driverArrive: checkDriverArrive ? true : false,
            startRide: startRide ? true : false,
            endRide: endRide ? true : false,
          },
        });
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };
  useEffect(() => {
    getDriverBookingData();
  }, []);
  const getRequestFromPassengers = () => {
    if (!inlinedDrivers) {
      if (driverStatus == 'online' && driverData.currentLocation) {
        let requestData = [];
        firestore()
          .collection('Request')
          .get()
          .then(querySnapshot => {
            querySnapshot.forEach(documentSnapshot => {
              let data = documentSnapshot.data();
              let date = data?.requestDate?.toDate();
              let time = date?.getTime();
              let nowTime = new Date().getTime();
              let requestSeconds = time / 1000;
              let nowSeconds = nowTime / 1000;
              let requestRespondSeconds = requestSeconds + 32;
              let differenceSeconds = requestRespondSeconds - nowSeconds;
              data.timeLimit = differenceSeconds;
              if (!data?.requestStatus && differenceSeconds > 0) {
                let dis = getPreciseDistance(
                  {
                    latitude:
                      data && data.passengerData
                        ? data.passengerData.pickupCords.latitude
                        : data && data.pickupCords.latitude,
                    longitude:
                      data && data.passengerData
                        ? data.passengerData.pickupCords.longitude
                        : data.pickupCords.longitude,
                  },
                  {
                    latitude:
                      data && data.driverData
                        ? data.driverData.currentLocation.latitude
                        : driverData && driverData.currentLocation.latitude,
                    longitude:
                      data && data.driverData
                        ? data.driverData.currentLocation.longitude
                        : driverData && driverData.currentLocation.longitude,
                  },
                );

                mileDistance = (dis / 1609.34).toFixed(2);

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
                    driverData &&
                    driverData.vehicleDetails
                  ) {
                    let selectedVehicle = data.selectedCar.map(
                      (e, i) => e.carName,
                    );

                    flag =
                      selectedVehicle ==
                      driverData.vehicleDetails.vehicleCategory;
                  }

                  let id = auth().currentUser.uid;
                  let flag2 = data?.rejectedDrivers?.some((e, i) => e == id);

                  let rejectStatus = false;

                  if (
                    data &&
                    data.passengerData &&
                    driverData.id == data.driverData.id &&
                    !data.requestStatus &&
                    !checkRejectStatus &&
                    !flag2 &&
                    !rejectStatus
                  ) {
                    requestData.push(data);
                  } else {
                    if (
                      data &&
                      data.bidFare &&
                      !data.requestStatus &&
                      mileDistance < 25 &&
                      flag &&
                      !matchUid &&
                      !checkRejectStatus &&
                      !flag2
                    ) {
                      requestData.push(data);
                    }
                  }
                }
              }
            });

            setPassengerBookingData(requestData);

            setLoading(false);
          });
      }
    }
  };

  useEffect(() => {
    if (
      driverStatus == 'online' &&
      driverData &&
      Object.keys(driverData.length > 0)
    ) {
      let interval = setInterval(() => {
        if (focus) {
          getRequestFromPassengers();
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [driverStatus, driverData]);

  const getDriverData = () => {
    const currentUserUid = auth().currentUser.uid;

    firestore()
      .collection('Drivers')
      .doc(currentUserUid)
      .onSnapshot(querySnapshot => {
        setDriverData(querySnapshot.data());
      });

    firestore()
      .collection('inlinedDriver')
      .doc(currentUserUid)
      .get()
      .then(doc => {
        let data = doc.data();
        if (data?.inlined) {
          setInlinedDrivers(true);
        }
      });
  };

  useEffect(() => {
    getDriverData();
  }, [driverStatus, focus]);

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
              (e, i) => e.id == driverData?.id && e.requestStatus == 'rejected',
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
              data.myDriversData.id == driverData.id &&
              data.myDriversData.requestStatus == 'accepted'
            ) {
              ToastAndroid.show(
                'Your request has been accepted',
                ToastAndroid.SHORT,
              );
              setAcceptRequest(true);

              try {
                requestData.driverData = driverData;
                let myData = JSON.stringify(requestData ?? data);

                AsyncStorage.setItem('driverBooking', myData);
              } catch (error) {}

              firestore()
                .collection('inlinedDriver')
                .doc(driverData.id)
                .set({
                  inlined: true,
                  id: driverData.id,
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
                      selectedDriver: driverData,
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
              (e, i) => e.selected && e.id == driverData.id,
            );

            let flag1 = data.myDriversData.some(
              (e, i) => e.id == driverData.id && e.requestStatus == 'rejected',
            );
            if (flag && !flag1) {
              ToastAndroid.show(
                'Your request has been accepted',
                ToastAndroid.SHORT,
              );
              setAcceptRequest(true);

              try {
                requestData.driverData = driverData;
                let myData = JSON.stringify(requestData ?? data);
                AsyncStorage.setItem('driverBooking', myData);
              } catch (error) {}

              firestore()
                .collection('inlinedDriver')
                .doc(driverData.id)
                .set({
                  inlined: true,
                  id: driverData.id,
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
                      selectedDriver: driverData,
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
    if (requestLoader && driverData && !acceptRequest && focus) {
      let interval = setInterval(() => {
        checkRequestStatus();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [requestLoader]);

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
            ToastAndroid.show(
              'Your have succesfully rejected the request',
              ToastAndroid.SHORT,
            );
          }, 1000);
        });
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
                .doc(driverData.id)
                .set({
                  inlined: true,
                  id: driverData.id,
                })
                .then(() => {
                  item.driverData = driverData;
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
                      selectedDriver: driverData,
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
            data.myDriversData.id == driverData.id
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
            data.myDriversData.some((e, i) => e.id == driverData.id)
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
              myDriversData: driverData,
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
          let flag = data.myDriversData.some((e, i) => e.id == driverData.id);

          if (flag) {
            ToastAndroid.show('You have already requested', ToastAndroid.SHORT);
            return;
          } else {
            let driverDataArray = [...data.myDriversData, driverData];
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
          driverData.id !== data.myDriversData.id
        ) {
          let myData = [data.myDriversData];
          let driverDataArray = [...myData, driverData];
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

  const updateOnlineOnFirebase = async () => {
    try {
      const CurrentUser = auth().currentUser;

      firestore().collection('Drivers').doc(CurrentUser?.uid).update({
        status: 'online',
        currentLocation: pickupCords,
      });
    } catch (err) {
      console.log('MyError', err);
    }
  };
  const updateOfflineOnFirebase = () => {
    try {
      const CurrentUser = auth().currentUser;
      firestore().collection('Drivers').doc(CurrentUser.uid).update({
        status: 'offline',
        currentLocation: null,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // Disable screen timeout when the component mounts
    IdleTimerManager.setIdleTimerDisabled(true);

    // Re-enable screen timeout when the component unmounts
    return () => {
      IdleTimerManager.setIdleTimerDisabled(false);
    };
  }, [focus]);

  const removeLocationUpdates = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      Geolocation.stopObserving(watchId);
      updateOfflineOnFirebase();
    }
  };
  const driverStatusHandler = value => {
    setDriverStatus(value);
    if (value == 'online') {
      getLocationUpdates();
    } else {
      removeLocationUpdates();
    }
  };

  useEffect(() => {
    if (driverStatus == 'online') {
      updateOnlineOnFirebase();
    } else {
      removeLocationUpdates();
    }
  }, [driverStatus, state]);

  const rideList = useCallback(
    ({item, index}) => {
      // console.log(item?.timeLimit, 'timelimit');

      let items = item.passengerData ?? item;
      items.selectedCar[0].carMiles.map((e, i) => {
        if (
          Number(items.distance) >= e.rangeMin &&
          items.distance <= e.rangeMax
        ) {
          let percentageBid = Math.round(
            (Number(items?.bidFare) / Number(items?.fare)) * 100,
          );
          let baseCharge = items?.selectedCar[0]?.carMiles[0]?.mileCharge;
          let myDistance = 0;
          if (items.distance > 3) {
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
                ${item.passengerData ? item.passengerData.fare : item.fare}
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
                <Text style={styles.itemLocStyle}>${items.bidFare}</Text>
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
                  <ActivityIndicator size={'large'} color={Colors.black} />
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
    },
    [passengerBookingData],
  );

  const signOutHandler = async () => {
    setLoader(true);
    let currentUser = auth().currentUser;

    if (!currentUser) {
      navigation.navigate('GetStartedScreen');
      ToastAndroid.show('Logout Successfull', ToastAndroid.SHORT);
      return;
    }

    await auth()
      .signOut()
      .then(() => {
        firestore()
          .collection('Drivers')
          .doc(currentUser?.uid)
          .update({
            currentLocation: null,
            status: 'offline',
          })
          .then(() => {
            setLoader(false);
            ToastAndroid.show('Logout Successfully', ToastAndroid.SHORT);
            navigation.dispatch(StackActions.replace('GetStartedScreen'));
          })
          .catch(error => {
            setLoader(false);
            ToastAndroid.show('Logout unSuccessfull', ToastAndroid.SHORT);
          });
      })
      .catch(() => {
        navigation.navigate('GetStartedScreen');
      });
  };

  return (
    <>
      {loading || requestLoader ? (
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
                navigation.toggleDrawer();
              }}
              source={require('../../Assets/Images/URWhiteLogo.png')}
            />
            <TouchableOpacity
              style={{
                width: 100,
                padding: 10,
                position: 'absolute',
                top: 2,
                right: 5,
              }}
              onPress={() => {
                signOutHandler();
              }}>
              <Text
                style={{
                  color: Colors.white,
                  fontSize: 18,
                  textAlign: 'center',
                }}>
                {loader ? (
                  <ActivityIndicator size={'large'} color={Colors.white} />
                ) : (
                  'Logout'
                )}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statusContainer}>
            <SwitchSelector
              initial={status}
              onPress={value => {
                driverStatusHandler(value);
              }}
              textColor={Colors.black} //'#7a44cf'
              selectedColor={Colors.white}
              // textStyle={{ fontFamily: 'Poppins-Medium', }}
              selectedTextStyle={{fontFamily: 'Poppins-Medium'}}
              buttonColor={
                driverStatus === 'online' ? Colors.fontColor : Colors.gray
              }
              borderColor={Colors.fontColor}
              buttonMargin={3}
              hasPadding
              options={[
                {label: 'Online', value: 'online'},
                {label: 'Offline', value: 'offline'},
              ]}
            />
          </View>
          {driverStatus == 'online' &&
          passengerBookingData &&
          passengerBookingData.length > 0 ? (
            <View style={styles.listContainer}>
              <FlatList
                data={passengerBookingData}
                renderItem={rideList}
                keyExtractor={item => item.id}
              />
            </View>
          ) : passengerBookingData &&
            passengerBookingData.length == 0 &&
            driverStatus == 'online' ? (
            <View
              style={{
                height: '70%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 24,
                  fontWeight: '700',
                  width: '95%',
                  textAlign: 'center',
                }}>
                No Request Wait for passenger Request
              </Text>
            </View>
          ) : (
            <View style={styles.innerContainerOffline}>
              <Text style={styles.textStyleOffline}>
                Press online to get Rides
              </Text>
            </View>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
