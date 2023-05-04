import React, {useLayoutEffect, useEffect, useState, useCallback} from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  ToastAndroid,
  Modal,
  Settings,
} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import Colors from '../../Constants/Colors';
import firestore from '@react-native-firebase/firestore';
import {getPreciseDistance} from 'geolib';
import MapViewDirections from 'react-native-maps-directions';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import Icon from 'react-native-vector-icons/AntDesign';
import {BackHandler} from 'react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function PassengerFindRide({navigation, route}) {
  let passengerData = route.params;
  const [driverData, setDriverData] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [request, setRequest] = useState(false);
  const [minutes, setMinutes] = useState([]);
  const [distance, setDistance] = useState([]);
  const [inlineDriver, setInlineDriver] = useState([]);
  const [driverNotAvailable, setDriverNotAvailable] = useState([]);
  const [loader, setLoader] = useState(false);
  const [paymentDone, setPaymentDone] = useState(null);
  const [showAskPaymentModal, setShowAskPaymentModal] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [savedCards, setSavedCards] = React.useState(true);
  const [buttonLoader, setButtonLoader] = React.useState(false);
  const [noDriverData, setNoDriverData] = React.useState(false);
  const [driversRejected, setDriverRejected] = React.useState([]);

  const [cardDetail, setCardDetail] = useState({
    cardHolderName: '',
    cardNumber: null,
    expiryYear: null,
    expiryMonth: null,
    cvc: null,
  });

  const [showPaymentConfirmationModal, setShowPaymentConfirmationModal] =
    useState(false);

  const checkAvailableDriverStatus = () => {
    if (passengerData && passengerData.bidFare) {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .onSnapshot(querySnapshot => {
          let data = querySnapshot.data();
          if (
            data &&
            data?.bidFare &&
            data?.myDriversData &&
            !Array.isArray(data.myDriversData) &&
            data?.myDriversData?.requestStatus !== 'rejected'
          ) {
            let dis = getPreciseDistance(
              {
                latitude: passengerData?.pickupCords?.latitude,
                longitude: passengerData?.pickupCords?.longitude,
              },
              {
                latitude: data?.myDriversData?.currentLocation?.latitude,
                longitude: data?.myDriversData?.currentLocation?.longitude,
              },
            );

            mileDistance = (dis / 1609.34).toFixed(2);
            data.myDriversData.distance = mileDistance;

            const speed = 10; // meters per second
            data.myDriversData.minutes = Math.round(mileDistance / speed / 60);
            console.log('hello');
            setDriverData([data.myDriversData]);
          } else if (
            data &&
            data.myDriversData &&
            Array.isArray(data.myDriversData)
          ) {
            setDriverData(
              data.myDriversData.filter((e, i) => {
                return e.requestStatus !== 'rejected';
              }),
            );
          }
        });
    }
  };

  useEffect(() => {
    if (passengerData.id && passengerData.bidFare && !noDriverData) {
      setRequest(true);
    }
    checkAvailableDriverStatus();
  }, []);

  useEffect(() => {
    let interval = setInterval(() => {
      if (driverData.length == 0 && request && passengerData.bidFare) {
        setRequest(false);
        setNoDriverData(true);
        navigation.navigate('PassengerHomeScreen');
        clearInterval(interval);
        ToastAndroid.show(
          'Drivers are not available rightnow request after sometime',
          ToastAndroid.SHORT,
        );
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [request]);

  useEffect(() => {
    if (passengerData && !passengerData.bidFare && !request) {
      driverData && driverData.length == 0 ? setLoader(true) : '';
      let interval = setInterval(() => {
        let rejectedDriver = false;
        let id = auth().currentUser.uid;
        firestore()
          .collection('Request')
          .doc(id)
          .get()
          .then(doc => {
            if (doc._exists) {
              let data = doc?.data();
              rejectedDriver = data?.rejectedDriversId;
            }
          })
          .then(() => {
            getDriverData(rejectedDriver);
            setLoader(false);
          })
          .catch(error => {
            setLoader(false);
          });
      }, 10000);
      return () => clearInterval(interval);
    } else {
      setDriverData([]);
      setRequest(true);
    }
  }, [route.params]);

  useEffect(() => {
    let interval = setInterval(() => {
      if (!passengerData.bidFare && !request && driverData.length < 5) {
        getDriverData();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkRouteFromCancelRide = () => {
    let id = auth().currentUser.uid;

    firestore()
      .collection('Request')
      .doc(id)
      .get()
      .then(doc => {
        if (doc._exists) {
          let data = doc.data();

          console.log(data, 'dataa');

          if (data.rideCancelByDriver) {
            const backAction = () => {
              Alert.alert(
                'Hold on!',
                'You can not go back from here Cancel your request from top right cancel button ',
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
        }
      });
  };

  useEffect(() => {
    checkRouteFromCancelRide();
  }, [route.params]);

  useEffect(() => {
    if (request) {
      const backAction = () => {
        Alert.alert('Hold on!', 'Wait for the driver respond', [
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
    if (!request) {
      const backAction = () => {
        navigation.goBack();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      return () => backHandler.remove();
    }
  }, [request]);

  const checkRequestStatus = () => {
    if (
      request &&
      !passengerData.bidFare &&
      selectedDriver &&
      !passengerData?.rideCancelByPassenger
    ) {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .get()
        .then(querySnapshot => {
          let data = querySnapshot.data();
          if (
            data &&
            Object.keys(data).length > 0 &&
            data.driverData &&
            !data.bidFare &&
            request
          ) {
            if (data.requestStatus == 'accepted') {
              setRequest(false);
              ToastAndroid.show(
                'Your request has been accepted',
                ToastAndroid.SHORT,
              );
              navigation.navigate('PassengerRoutes', {
                screen: 'PassengerHomeScreen',
                params: {
                  passengerData: passengerData,
                  driverData: selectedDriver,
                },
              });
            } else if (
              data &&
              data.requestStatus == 'rejected' &&
              !data.bidFare
            ) {
              setTimeout(() => {
                setDriverData(
                  driverData.filter((e, i) => {
                    return e.id !== selectedDriver.id;
                  }),
                );
                setRequest(false);
                Alert.alert(
                  'MESSAGE',
                  'Your request has been rejected by driver',
                );
              }, 1000);
              setSelectedDriver([]);
            }
          }
        });
    }
  };
  const getInlineDriver = () => {
    firestore()
      .collection('inlinedDriver')
      .onSnapshot(querySnapshot => {
        let inlineDriver = [];
        querySnapshot.forEach(documentSnapshot => {
          let data = documentSnapshot.data();
          if (data && Object.keys(data).length > 0 && data.inlined) {
            inlineDriver.push(data.id);
          }
        });
        setInlineDriver(inlineDriver);
      });
  };

  useEffect(() => {
    getInlineDriver();
  }, []);

  useEffect(() => {
    if (request) {
      const interval = setInterval(() => {
        checkRequestStatus();
        checkAvailableDriverStatus();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [request, selectedDriver]);

  const getDriverData = async rejectedDriver => {
    /// GET ALL DRIVERS
    const Driver = await firestore()
      .collection('Drivers')
      .onSnapshot(querySnapshot => {
        // console.log('Total users: ', querySnapshot.size);
        let myDriversTemp = [];
        querySnapshot.forEach(documentSnapshot => {
          // console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
          const myDriverData = documentSnapshot.data();

          let driverRequestedButNotRespond =
            driverNotAvailable &&
            driverNotAvailable.length > 0 &&
            driverNotAvailable.some((e, i) => {
              return e == myDriverData.id;
            });

          let selectedVehicleName = passengerData.selectedCar.map((e, i) => {
            return e.carName;
          });

          let selectedCar = selectedVehicleName[0];
          let flag = '';
          if (myDriverData && myDriverData.vehicleDetails) {
            flag = selectedCar == myDriverData.vehicleDetails.vehicleCategory;
          }
          let mileDistance = '';
          if (
            myDriverData &&
            myDriverData.currentLocation &&
            myDriverData.status == 'online' &&
            flag
          ) {
            let dis = getPreciseDistance(
              {
                latitude: passengerData.pickupCords.latitude,
                longitude: passengerData.pickupCords.longitude,
              },
              {
                latitude: myDriverData.currentLocation.latitude,
                longitude: myDriverData.currentLocation.longitude,
              },
            );

            mileDistance = (dis / 1609.34).toFixed(2);
            myDriverData.distance = mileDistance;

            const speed = 10; // meters per second
            myDriverData.minutes = Math.round(dis / speed / 60);
          }

          let isInlined =
            inlineDriver &&
            inlineDriver.filter((e, i) => {
              if (e == myDriverData.id) {
                return 'true';
              }
            });
          isInlined = isInlined[0];

          let flag2 = false;
          flag2 =
            rejectedDriver &&
            rejectedDriver.length > 0 &&
            rejectedDriver?.some((e, i) => e == myDriverData?.id);

          let flag3 =
            driversRejected &&
            driversRejected.length > 0 &&
            driversRejected.some((e, i) => e.id == myDriverData?.id);
          if (!driverRequestedButNotRespond && !flag3) {
            if (
              myDriverData.status == 'online' &&
              mileDistance <= 3 &&
              flag &&
              !isInlined &&
              !driverRequestedButNotRespond &&
              !flag2
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriverData.status == 'online' &&
              mileDistance > 3 &&
              mileDistance < 5 &&
              flag &&
              !flag2 &&
              !isInlined &&
              !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriverData.status == 'online' &&
              mileDistance < 10 &&
              mileDistance > 5 &&
              flag &&
              !flag2 &&
              !isInlined &&
              !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriverData.status == 'online' &&
              mileDistance < 15 &&
              mileDistance > 10 &&
              flag &&
              !isInlined &&
              !flag2 &&
              !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriverData.status == 'online' &&
              mileDistance < 20 &&
              mileDistance > 15 &&
              flag &&
              !flag2 &&
              !isInlined &&
              !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriverData.status == 'online' &&
              mileDistance < 25 &&
              mileDistance > 20 &&
              !isInlined &&
              !flag2 &&
              !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            }
          }
        });
        myDriversTemp.sort((a, b) => a.distance - b.distance);
        let nearedDrivers = myDriversTemp.slice(0, 5);
        setDriverData(nearedDrivers);
      });
  };

  const backAction = () => {
    navigation.navigate('AskScreen');
    return true;
  };

  const deleteBookingData = () => {
    firestore()
      .collection('Request')
      .doc(passengerData.id)
      .delete()
      .then(() => {
        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          backAction,
        );
      })
      .catch(error => {
        console.log(error, 'error');
      });
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity
            style={styles.cancelTextContainer}
            onPress={() => {
              deleteBookingData();
            }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        );
      },
    });
  }, []);
  const AccecptOffer = acceptDriver => {
    if (passengerData && passengerData.bidFare) {
      if (
        driverData &&
        !Array.isArray(driverData) &&
        Object.keys(driverData).length > 0
      ) {
        acceptDriver.selected = true;
        acceptDriver.requestStatus = 'accepted';

        firestore()
          .collection('Request')
          .doc(passengerData.id)
          .update({
            myDriversData: acceptDriver,
            requestStatus: 'accepted',
          })
          .then(() => {
            navigation
              .navigate('PassengerHomeScreen', {
                passengerData: passengerData,
                driverData: acceptDriver,
              })
              .catch(error => {
                console.log(error, 'error');
              });
          });
      } else {
        mySelectedDriver =
          driverData &&
          driverData.map((e, i) => {
            if (e.id == acceptDriver.id) {
              return {
                ...e,
                selected: (e.selected = true),
                requestStatus: 'accepted',
              };
            } else {
              return {
                ...e,
                selected: (e.selected = false),
                requestStatus: 'rejected',
              };
            }
          });
        let selectedDriverData = mySelectedDriver.filter((e, i) => e.selected);
        firestore()
          .collection('Request')
          .doc(passengerData.id)
          .update({
            myDriversData: mySelectedDriver,
            requestStatus: 'accepted',
          })
          .then(res => {
            navigation.navigate('PassengerRoutes', {
              screen: 'PassengerHomeScreen',
              params: {
                passengerData: passengerData,
                driverData: acceptDriver,
              },
            });
          })
          .catch(error => {
            console.log(error, 'error');
          });
      }
    }
    if (passengerData && !passengerData.bidFare) {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .set({
          passengerData: passengerData,
          driverData: acceptDriver,
          requestDate: new Date(),
        })
        .then(() => {
          setRequest(true);
          setSelectedDriver(acceptDriver);
        })
        .catch(error => {
          console.log(error);
        });
    }
  };
  useEffect(() => {
    if (!passengerData.bidFare) {
    }
  }, [driverNotAvailable]);

  useEffect(() => {
    let interval;
    if (request && !passengerData.bidFare) {
      interval = setInterval(() => {
        setDriverNotAvailable([...driverNotAvailable, selectedDriver.id]);
        setRequest(false);
        ToastAndroid.show(
          'This driver is not available right now',
          ToastAndroid.SHORT,
        );
      }, 32000);

      return () => clearInterval(interval);
    }

    if (passengerData.bidFare) {
      setRequest(true);
      return () => clearInterval(interval);
    }
  }, [request, selectedDriver, route.params]);

  const rejectOffer = rejectedDriver => {
    if (rejectedDriver && !passengerData.bidFare) {
      setDriverData(
        driverData.filter((e, i) => {
          return e.id !== rejectedDriver.id;
        }),
        setDriverRejected([...driversRejected, rejectedDriver]),
      );
    } else if (rejectedDriver && passengerData.bidFare) {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .onSnapshot(querySnapshot => {
          if (querySnapshot.exists) {
            let data = querySnapshot.data();
            if (
              data &&
              data?.myDriversData &&
              !Array.isArray(data.myDriversData)
            ) {
              data.myDriversData.selected = false;
              data.myDriversData.requestStatus = 'rejected';

              firestore()
                .collection('Request')
                .doc(passengerData.id)
                .update({
                  myDriversData: data.myDriversData,
                })
                .then(() => {
                  setDriverData(
                    driverData.filter((e, i) => {
                      return e.id !== rejectedDriver.id;
                    }),
                  );
                })
                .catch(error => {
                  console.log(error);
                });
            } else if (
              data &&
              data.myDriversData &&
              Array.isArray(data.myDriversData)
            ) {
              myDriverData = data.myDriversData.map((e, i) => {
                if (e.id == rejectedDriver.id) {
                  return {
                    ...e,
                    selected: false,
                    requestStatus: (e.requestStatus = 'rejected'),
                  };
                } else {
                  return e;
                }
              });
              firestore()
                .collection('Request')
                .doc(passengerData.id)
                .update({
                  myDriversData: myDriverData,
                })
                .then(() => {
                  setRequest(true);
                  setDriverData(
                    driverData.filter((e, i) => {
                      return e.id !== rejectedDriver.id;
                    }),
                  );
                })
                .catch(error => {
                  console.log(error);
                });
            }
          }
        });
    }
  };
  const calculateMinutes = (result, item) => {
    let duration = Math.ceil(result.duration);
    setMinutes([...minutes, duration]);
    item.minutes = Math.ceil(result.duration);

    let myDistance = result.distance;
    myDistance = Math.ceil(myDistance * 0.621371);
    setDistance([...distance, myDistance]);
    item.distance = myDistance;
  };

  const rideRequests = ({item, index}) => {
    let data = route.params;
    if (data.bidFare) {
      data?.selectedCar[0]?.carMiles?.map((e, i) => {
        if (data.distance >= e.rangeMin && data.distance <= e.rangeMax) {
          let serviceCharges = e.serviceCharge;
          let creditCardFee = (Number(data.fare) * 5) / 100;
          let totalCharges = serviceCharges + creditCardFee;
          item.bidFare = (Number(data.bidFare) + Number(totalCharges)).toFixed(
            2,
          );
        }
      });
    }
    let flag =
      driverNotAvailable &&
      driverNotAvailable.length > 0 &&
      driverNotAvailable.some((e, i) => e == item.id);

    let mileDistance = '';
    let meterDistance = '';

    if (
      passengerData &&
      passengerData.pickupCords &&
      item &&
      item.currentLocation
    ) {
      let dis = getPreciseDistance(
        {
          latitude: passengerData?.pickupCords?.latitude,
          longitude: passengerData?.pickupCords?.longitude,
        },
        {
          latitude: item?.currentLocation?.latitude,
          longitude: item?.currentLocation?.longitude,
        },
      );
      mileDistance = (dis / 1609.34)?.toFixed(2);
      meterDistance = dis;
    }
    item.distance = mileDistance;

    const speed = 10; // meters per second
    item.minutes = Math.round(meterDistance / speed / 60);

    let flag3 =
      driversRejected &&
      driversRejected.length > 0 &&
      driversRejected.some((e, i) => e.id == item.id);

    return (
      !flag &&
      !flag3 && (
        <View style={styles.card}>
          <View style={styles.innerItemsUpper}>
            <View style={styles.imgContainer}>
              <Image
                source={{uri: item.url}}
                resizeMode="cover"
                style={styles.proPic}
              />
              <View>
                <Text style={styles.vehText}>
                  {item.vehicleDetails.vehicleName}
                </Text>
                <Text style={styles.driverNameText}>
                  {item.firstName + item.lastName}
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={[styles.driverNameText, {fontWeight: '800'}]}>
                    {item.rating}
                  </Text>
                  <Icon name="star" size={20} color="yellow" />
                </View>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.priceText}>
                  ${item.bidFare ? Number(item.bidFare) : item.fare}
                </Text>
                <Text style={{color: 'black', fontSize: 14, fontWeight: '600'}}>
                  {item.minutes} minutes away
                </Text>
                <Text style={{color: 'black', fontSize: 14, fontWeight: '600'}}>
                  {item.distance} miles away
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.btnContainer}>
            <CustomButton
              text="Reject"
              styleContainer={styles.btn}
              btnTextStyle={styles.btnTextStyle}
              bgColor
              onPress={() => rejectOffer(item)}
            />
            <CustomButton
              text="Accept"
              styleContainer={styles.btn}
              btnTextStyle={styles.btnTextStyle}
              onPress={() => AccecptOffer(item)}
            />
          </View>
        </View>
      )
    );
  };

  console.log(driverData, 'DRIVER');

  return (
    <View>
      {(driverData && driverData.length > 0 && passengerData.bidFare) ||
      (!request && !loader) ? (
        <View>
          {showCardForm ? (
            PaymentFormCard()
          ) : (
            <FlatList
              data={driverData}
              renderItem={rideRequests}
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => `key-${item.id}`}
            />
          )}
          {showAskPaymentModal && PaymentAskModal()}
          {showPaymentConfirmationModal && PaymentConfirmationModal()}
        </View>
      ) : (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '90%',
          }}>
          <ActivityIndicator color="black" size={100} />
          <Text style={{color: 'black', marginTop: 10}}>
            {' '}
            Finding Driver Please wait!{' '}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '45%',
  },
  btnTextStyle: {
    fontSize: 15,
    textAlign: 'center',
    margin: 5,
    color: '#ffffff',
    backgroundColor: 'transparent',
    fontFamily: 'Poppins-Medium',
  },
  btnContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    padding: 10,
  },
  container: {
    flex: 1,
  },
  cancelTextContainer: {
    marginRight: 5,
  },
  cancelText: {
    color: Colors.red,
    marginRight: 5,
  },
  card: {
    width: '95%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    margin: 5,
    // borderWidth: 1,
    padding: 5,
    borderRadius: 20,
    elevation: 5,
  },
  driverNameText: {
    fontSize: 15,
    color: Colors.black,
  },
  innerItemsUpper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imgContainer: {
    flexDirection: 'row',
  },
  proPic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'red',
    margin: 5,
  },
  priceContainer: {
    marginRight: 5,
  },
  priceText: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  vehText: {
    fontSize: 18,
    color: Colors.black,
    fontFamily: 'Poppins-Medium',
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
    marginTop: 20,
    fontWeight: '800',
    color: 'white',
  },
});
