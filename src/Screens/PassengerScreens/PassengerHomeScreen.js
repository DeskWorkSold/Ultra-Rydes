import React, {useState, useRef, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  ToastAndroid,
  ActivityIndicator,
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
import Icon from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {LogBox} from 'react-native';
import {
  locationPermission,
  getCurrentLocation,
} from '../../Helper/HelperFunction';
import auth from '@react-native-firebase/auth';
import * as geolib from 'geolib';
import firestore from '@react-native-firebase/firestore';
import Geocoder from 'react-native-geocoding';
import {Modal} from 'react-native';
import AppModal from '../../Components/modal';
import {BackHandler} from 'react-native';
import {useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRoute} from '@react-navigation/native';
import {Linking} from 'react-native';

export default function PassengerHomeScreen({navigation}) {
  let route = useRoute();

  console.log(route);

  console.log(route, 'routes');

  const [dummyDataCat, setDummyDataCat] = useState('');
  const [onlineDriversLocation, setOnlineDriversLocation] = useState([]);
  const [loading, setLoading] = useState('');
  const [fare, setFare] = useState('');
  const [category, setCategory] = useState('Ultra');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [distance, setDistance] = useState('');
  const [minutes, setMinutes] = useState('');
  const [pickupAddress, setPickUpAddress] = useState('');
  const [dropOffAddress, setDropOffAddress] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [bookingData, setBookingData] = useState([]);
  const [result, setResult] = useState();
  const [appearBiddingOption, setAppearBiddingOption] = useState(false);
  const [bidFare, setBidFare] = useState(null);
  const [driverArrive, setDriverArrive] = useState({
    pickupLocation: false,
    dropoffLocation: false,
  });
  const [selectedDriverLocation, setSelectedLocation] = useState({
    pickupCords: '',
    dropLocationCords: '',
  });
  const [routeData, setRouteData] = useState([]);
  const [
    driverArriveAtPickUpLocation,
    setDriverArriveAtPickUpLocation,
  ] = useState(false);

  const [
    driverArriveAtdropoffLocation,
    setDriverArriveAtdropoffLocation,
  ] = useState(false);
  const [driverRatingStar, setDriverRatingStar] = useState(0);
  const [carRatingStar, setCarRatingStar] = useState(0);
  const [paymentByPassenger, setPaymentByPassenger] = useState(0);
  const [feedBack, setFeedBack] = useState('');
  const [showFeedBackModal, setShowFeedBackModal] = useState(false);

  const [location, setLocation] = useState({
    pickupCords: route.params ? route.params.passengerData.pickupCords : null,
    dropLocationCords: route.params
      ? route.params.passengerData.dropLocationCords
      : {},
  });

  const [driverRating, setDriverRating] = useState([
    {
      star: 1,
      selected: false,
    },
    {
      star: 2,
      selected: false,
    },
    {
      star: 3,
      selected: false,
    },
    {
      star: 4,
      selected: false,
    },
    {
      star: 5,
      selected: false,
    },
  ]);

  const [carRating, setCarRating] = useState([
    {
      star: 1,
      selected: false,
    },
    {
      star: 2,
      selected: false,
    },
    {
      star: 3,
      selected: false,
    },
    {
      star: 4,
      selected: false,
    },
    {
      star: 5,
      selected: false,
    },
  ]);

  const [
    minutesAndDistanceDifference,
    setMinutesAndDistanceDifference,
  ] = useState({
    minutes: '',
    distance: '',
    details: '',
  });

  useEffect(() => {
    if (!selectedDriver && !route.params) {
      getLiveLocation();
      fetchDrivers();
      getCurrentUserUid();
    }
  }, []);

  const getDriverLocationUpdates = () => {
    if (data && route.params) {
      firestore()
        .collection('Request')
        .doc(data.passengerData.id)
        .onSnapshot(querySnapshot => {
          let data = querySnapshot.data();
          let myDriversData = data.myDriversData
            ? data.myDriversData
            : data.driverData;

          if (
            !driverArrive.pickupLocation &&
            !driverArriveAtPickUpLocation &&
            !route.params.driverArriveAtPickupLocation &&
            data &&
            data.driverArriveAtPickupLocation
          ) {
            setDriverArrive({
              ...driverArrive,
              pickupLocation: true,
            });
          }

          if (
            !driverArrive.dropoffLocation &&
            !driverArriveAtdropoffLocation &&
            data &&
            data.driverArriveAtDropoffLocation &&
            !paymentByPassenger
          ) {
            setPaymentByPassenger(data.payment);
            setDriverArriveAtdropoffLocation(true);
          }

          if (data && !Array.isArray(myDriversData)) {
            myDriversData.currentLocation.latitude =
              myDriversData.currentLocation.latitude;
            myDriversData.currentLocation.longitude =
              myDriversData.currentLocation.longitude;
            myDriversData.currentLocation.heading = myDriversData
              .currentLocation.heading
              ? myDriversData.currentLocation.heading.toString()
              : '180';
            setSelectedLocation(myDriversData.currentLocation);
          } else if (data && Array.isArray(myDriversData)) {
            let selectedDriver = myDriversData.filter(
              (e, i) => (e.requestStatus = 'accepted'),
            );
            selectedDriver = selectedDriver[0];
            setSelectedLocation(selectedDriver.currentLocation);
          }
        });
    }
  };

  console.log(selectedDriverLocation, 'selectedDriver');

  useEffect(() => {
    const interval = setInterval(() => {
      getDriverLocationUpdates();
    }, 5000);

    return () => clearInterval(interval);
  });

  const getCurrentUserUid = () => {
    const currentUser = auth().currentUser;
    setCurrentUserUid(currentUser.uid);
  };

  let data =
    route.params && route.params.data ? route.params.data : route.params;

  useEffect(() => {
    data &&
      setLocation({
        ...location,
        pickupCords: data.passengerData.pickupCords ?? data.pickupCords,
        dropLocationCords:
          data.passengerData.dropLocationCords ?? data.dropLocationCords,
      });

    data &&
      setPickUpAddress(
        data.passengerData
          ? data.passengerData.pickupAddress
          : data.pickupAddress,
      );
    data &&
      setDropOffAddress(
        data.passengerData
          ? data.passengerData.dropOffAddress
          : data.dropOffAddress,
      );
  }, [routeData]);

  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  useEffect(() => {
    if (
      pickupCords &&
      Object.keys(pickupCords).length > 0 &&
      dropLocationCords &&
      Object.keys(dropLocationCords).length > 0
    ) {
      getPickUpAndDropOffAddress();
    }
  }, [location, location.dropLocationCords, pickupCords, dropLocationCords]);

  useEffect(() => {
    if (data) {
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
  }, [route.params]);

  useEffect(() => {
    if (data) {
      setRouteData(data);
      if (data && data.passengerData) {
        setLocation({
          ...location,
          pickupCords: data.passengerData.pickupCords,
          dropLocationCords: data.passengerData.dropLocationCords,
        });
      }
      if (data && data.driverData) {
        setSelectedDriver(data.driverData);
        setSelectedLocation(data.driverData.currentLocation);
      }

      if (data && data.driverData && Array.isArray(data.driverData)) {
        data.driverData.map((e, i) => {
          if (e.selected) {
            setSelectedDriver(e);
            setSelectedLocation(e.currentLocation);
          }
        });
      } else if (
        data &&
        data.driverData &&
        !Array.isArray(data.driverData) &&
        data.driverData.selected
      ) {
        setSelectedDriver(data.driverData);
        setSelectedLocation(data.driverData.currentLocation);
      }
    }

    if (data) {
      let myData = JSON.stringify(data);
      AsyncStorage.setItem('passengerBooking', myData);
    }
  }, [data, routeData]);

  console.log(selectedDriver, 'selected');

  useEffect(() => {
    if (!selectedDriver) {
      checkFare(result);
    }
  }, [category, pickupCords, dropLocationCords]);

  const checkFare = result => {
    if (fare && pickupCords && dropLocationCords) {
      calculateDistance(result);
    }
  };

  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;
  const LATITUDE_DELTA = 0.06;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const {pickupCords, dropLocationCords} = location;

  const [CurrentUserUid, setCurrentUserUid] = useState('');

  const getLiveLocation = async () => {
    const locPermissionDenied = await locationPermission();

    if (locPermissionDenied) {
      setLoading(true);
      const {latitude, longitude} = await getCurrentLocation();

      setLocation({
        ...location,
        pickupCords: {
          latitude,
          longitude,
        },
      });

      fetchData();

      setLoading(false);
    }
  };

  const fetchData = async () => {
    firestore()
      .collection('Categories')
      .doc('8w6hVPveXKR6kTvYVWwy')
      .onSnapshot(documentSnapshot => {
        const GetUserData = documentSnapshot.data();
        setDummyDataCat(GetUserData.categories);
      });
  };
  const fetchDrivers = async () => {
    /// GET ALL DRIVERS
    const Driver = await firestore()
      .collection('Drivers')
      .onSnapshot(querySnapshot => {
        let myDriversTemp = [];
        querySnapshot.forEach(documentSnapshot => {
          const driverData = documentSnapshot.data();
          if (driverData.status == 'online') {
            myDriversTemp.push(driverData);
          }
        });
        setOnlineDriversLocation(myDriversTemp);
      });
  };

  const fetchPickupCords = (lat, lng, address) => {
    setLocation({
      ...location,
      pickupCords: {
        latitude: lat,
        longitude: lng,
      },
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

  const getPickUpAndDropOffAddress = () => {
    Geocoder.init(GoogleMapKey.GOOGLE_MAP_KEY);
    Geocoder.from(pickupCords.latitude, pickupCords.longitude)
      .then(json => {
        var addressPickup = json.results[0].formatted_address;
        setPickUpAddress(addressPickup);
      })
      .catch(error => console.warn(error));

    Geocoder.from(dropLocationCords.latitude, dropLocationCords.longitude)
      .then(json => {
        var addressDropOff = json.results[0].formatted_address;
        setDropOffAddress(addressDropOff);
      })
      .catch(error => console.warn(error));
  };

  const checkValidation = () => {
    if (Object.keys(pickupCords).length === 0) {
      ToastAndroid.show('Pickup Cords cannot be empty', ToastAndroid.SHORT);
      return false;
    }
    if (Object.keys(dropLocationCords).length === 0) {
      ToastAndroid.show(
        'Destination Cords cannot be empty',
        ToastAndroid.SHORT,
      );
      return false;
    }

    let flag = dummyDataCat.some((e, i) => e.selected);

    if (!flag) {
      ToastAndroid.show('Kindly select Car type', ToastAndroid.SHORT);
      return;
    }

    if (!bidFare && !data) {
      let data = {
        pickupCords: pickupCords,
        dropLocationCords: dropLocationCords,
        selectedCar: dummyDataCat.filter((e, i) => e.selected),
        distance: distance,
        minutes: minutes,
        fare: fare,
        bidFare: bidFare,
        pickupAddress: pickupAddress,
        dropOffAddress: dropOffAddress,
        additionalDetails: additionalDetails,
        id: CurrentUserUid,
      };

      navigation.navigate('PassengerFindRide', data);
    }

    if (bidFare) {
      let myData = {
        pickupCords: pickupCords,
        dropLocationCords: dropLocationCords,
        selectedCar: dummyDataCat.filter((e, i) => e.selected),
        distance: distance,
        minutes: minutes,
        fare: fare,
        bidFare: bidFare,
        pickupAddress: pickupAddress,
        dropOffAddress: dropOffAddress,
        additionalDetails: additionalDetails,
        id: CurrentUserUid,
      };

      firestore()
        .collection('Request')
        .doc(CurrentUserUid)
        .set(myData)
        .then(() => {
          ToastAndroid.show('Your request has been sent', ToastAndroid.SHORT);

          navigation.navigate('PassengerFindRide', myData);

        }).catch((error)=>{
          console.log(error)
        })

    }
  };

  const mapRef = useRef();
  const [selected, setSelected] = useState(false);
  const onClickItem = (item, index) => {
    const newArr = dummyDataCat.map((e, index) => {
      if (item.id == e.id) {
        return {
          ...e,
          selected: true,
        };
      }
      return {
        ...e,
        selected: false,
      };
    });
    setDummyDataCat(newArr);
    setCategory(item.carName);
    categoryHandler();
  };

  const categoryHandler = () => {
    if (pickupCords && dropLocationCords && result) {
      calculateDistance(result);
    }
  };
  const Categories = ({item, index}) => {
    return (
      <View style={styles.catList}>
        <TouchableOpacity
          style={
            item.selected
              ? [styles.cards, {borderColor: Colors.primary, borderWidth: 2}]
              : [styles.cards]
          }
          onPress={() => !bidFare && !route.params && onClickItem(item, index)}
        >
          <Image
            style={styles.catImg}
            source={{uri: item.carImage}}
            resizeMode="cover"
          />
          <Text style={styles.labelTextStyle}>{item.carName}</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const calculateDistance = result => {
    let myDistance = (result.distance * 0.62137119).toFixed(2);
    let myDuration = Math.ceil(result.duration);
    setDistance(myDistance);
    setMinutes(myDuration);
    let myfare = '';
    let serviceCharges = '';
    let Tfare = '';
    let distanceMinus = '';
    dummyDataCat.map(cat => {
      if (cat.carName == category) {
        cat.carMiles.map(miles => {
          let baseCharge = cat.carMiles[0].mileCharge;
          if (
            myDistance == miles.rangeMin ||
            (myDistance > miles.rangeMin && myDistance < miles.rangeMax)
          ) {
            distanceMinus = myDistance - 3;
            let addCharge = baseCharge;
            myfare = miles.mileCharge * distanceMinus + addCharge;
            serviceCharges =
              (myfare / 100) * miles.creditCardCharge + miles.serviceCharge;
            Tfare = myfare + serviceCharges;
            Tfare = Tfare.toFixed(2);
            if (Tfare < baseCharge) {
              myfare = miles.mileCharge;
              serviceCharges =
                (myfare / 100) * miles.creditCardCharge + miles.serviceCharge;
              Tfare = Math.round(myfare + serviceCharges);
            }

            Tfare && setFare(Tfare.toString());
          }
        });
      }
    });
  };

  const changeDropLocation = location => {
    setLocation({
      ...location,
      dropLocationCords: {
        latitude: location.coordinate.latitude,
        longitude: location.coordinate.longitude,
      },
    });
  };
  const closeModal = () => {
    setAppearBiddingOption(false);
  };

  const confirmBidFare = selectedBid => {
    let myFare = '';

    if (selectedBid.bidWithMinimumDeduction) {
      myFare = (fare * (97 / 100)).toFixed(2);
      setAppearBiddingOption(false);
    } else if (selectedBid.bidWithMidDeduction) {
      myFare = (fare * (94 / 100)).toFixed(2);
      setAppearBiddingOption(false);
    } else if (selectedBid.bidWithMaximumDeduction) {
      myFare = (fare * (90 / 100)).toFixed(2);
      setAppearBiddingOption(false);
    } else {
      Alert.alert('Error Alert', 'Kindly selected Bid Fare');
      return;
    }
    setBidFare(myFare);
  };

  const hideModal = async () => {
    setDriverArrive({
      ...driverArrive,
      pickupLocation: false,
    });
    setDriverArriveAtPickUpLocation(true);

    try {
      await AsyncStorage.setItem(
        'driverArrive',
        'driverArrivedAtPickupLocation',
      );
    } catch (error) {
      console.log(error);
    }
  };
  const showBidFareModal = () => {
    let flag =
      dummyDataCat &&
      dummyDataCat.length > 0 &&
      dummyDataCat.some((e, i) => e.selected);

    if (flag) {
      setAppearBiddingOption(true);
    } else {
      ToastAndroid.show('Kindly Select car first', ToastAndroid.SHORT);
    }
  };

  const ArriveModal = useCallback(() => {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={driverArrive.pickupLocation}
          onRequestClose={() => {
            setDriverArrive({
              ...driverArrive,
              pickupLocation: false,
            });
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View>
                <Ionicons size={80} color="white" name="car-outline" />
              </View>
              <Text style={styles.modalText}>
                Your driver has arrived at your pickup location!
              </Text>
              <TouchableOpacity
                style={[
                  styles.button,
                  {marginBottom: 10, backgroundColor: Colors.primary},
                ]}
                onPress={() => hideModal()}
              >
                <Text
                  style={[styles.textStyle, {backgroundColor: Colors.primary}]}
                >
                  confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [driverArrive]);

  const getDriverRating = ind => {
    setDriverRatingStar(ind + 1);
  };
  const getCarRating = ind => {
    setCarRatingStar(ind + 1);
  };

  const confirmationByPassenger = () => {
    if (carRatingStar && driverRatingStar) {
      setDriverArrive({
        ...driverArrive,
        dropoffLocation: true,
      });
      setDriverArriveAtdropoffLocation(false);
      setShowFeedBackModal(true);

      firestore()
        .collection('Request')
        .doc(route.params.passengerData.id)
        .onSnapshot(querySnapshot => {
          let data = querySnapshot.data();
          setBookingData(data);
        });
    }

    if (!driverRatingStar) {
      ToastAndroid.show('kindly give driver rating', ToastAndroid.SHORT);
      return;
    }
    if (!carRatingStar) {
      ToastAndroid.show('kindly give car rating', ToastAndroid.SHORT);
      return;
    }

    if (driverRating && carRating) {
      firestore()
        .collection('Request')
        .doc(route.params.passengerData.id)
        .update({
          driverRating: driverRatingStar,
          carRating: carRatingStar,
        });
    }

    if (carRatingStar == 1) {
      const uid = auth().currentUser.uid;

      let warning = {
        message: 'Kindly fix your car urgent',
        complaintId: uid,
        data: new Date(),
      };

      firestore()
        .collection('warning')
        .doc(route.params.driverData.id)
        .set(
          {
            warningToDriver: firestore.FieldValue.arrayUnion(warning),
          },
          {merge: true},
        )
        .then(() => {
          console.log('warning has been send');
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const bookingComplete = () => {
    console.log(feedBack, 'feedback');
    if (!feedBack) {
      ToastAndroid.show('Kindly give Feedback', ToastAndroid.SHORT);
    } else {
      let id = auth().currentUser.uid;
      firestore()
        .collection('Passengers')
        .doc(id)
        .get()
        .then(doc => {
          if (doc.exists) {
            let myData = doc.data();
            let wallet = myData.wallet;
            console.log(wallet, 'outside');
            if (wallet) {
              console.log(wallet, 'wallet');

              let totalFare =
                data.passengerData && data.passengerData.bidFare
                  ? data.passengerData.bidFare
                  : data.passengerData.fare;
              console.log(totalFare, 'totalFare');
              let mergePayment =
                Number(wallet) + Number(paymentByPassenger) - Number(totalFare);

              firestore()
                .collection('Passengers')
                .doc(id)
                .update({
                  wallet: mergePayment.toFixed(2),
                })
                .then(() => {
                  console.log('wallet successfully updated');
                })
                .catch(error => {
                  console.log(error);
                });
            } else {
              let totalFare =
                data.passengerData && data.passengerData.bidFare
                  ? data.passengerData.bidFare
                  : data.passengerData.fare;
              let remainingWallet =
                Number(paymentByPassenger) - Number(totalFare);
              firestore()
                .collection('Passengers')
                .doc(id)
                .update({
                  wallet: remainingWallet.toFixed(2),
                })
                .then(() => {
                  console.log('wallet successfully updated');
                })
                .catch(error => {
                  console.log(error);
                });
            }
          }
        })
        .catch(error => {
          console.log(error);
        });

      let myData = {
        booking: 'complete',
        passengerData: route.params.passengerData,
        driverData: route.params.driverData,
        carRating: carRatingStar,
        driverRating: driverRatingStar,
        feedBack: feedBack,
        payment: paymentByPassenger,
      };
      firestore()
        .collection('Booking')
        .doc(route.params.passengerData.id)
        .set(
          {
            bookingData: firestore.FieldValue.arrayUnion(myData),
          },
          {merge: true},
        )
        .then(() => {
          console.log('data successfully submit');
          ToastAndroid.show('Thanks for your feedBack', ToastAndroid.SHORT);
          navigation.navigate('AskScreen');
          AsyncStorage.removeItem('passengerBooking');
          AsyncStorage.removeItem('driverArrive');
        })
        .catch(error => {
          console.log(error, 'error');
        });
    }
  };

  const dropOffModal = useCallback(() => {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={driverArriveAtdropoffLocation && !showFeedBackModal}
        >
          <View style={[styles.centeredView]}>
            <View style={[styles.modalView, {width: '90%', height: '65%'}]}>
              <Text style={[styles.modalText, {fontSize: 26}]}>
                Congratulations!
              </Text>
              <Text
                style={[
                  styles.modalText,
                  {
                    marginTop: 0,
                    paddingHorizontal: 2,
                    marginHorizontal: 0,
                    fontWeight: '500',
                  },
                ]}
              >
                You have arrived at your destination
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
                Your Bill Amount:{' '}
                <Text style={{fontSize: 16, color: 'yellow', width: '100%'}}>
                  {route.params.passengerData.bidFare ??
                    route.params.passengerData.fare}
                  $
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
                ]}
              >
                Your Payment Amount:{' '}
                <Text style={{fontSize: 16, color: 'yellow', width: '100%'}}>
                  {paymentByPassenger}$
                </Text>
              </Text>

              <Text
                style={[styles.modalText, {fontWeight: '600', marginTop: 2}]}
              >
                Kindly give rating to driver
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                {driverRating &&
                  driverRating.length > 0 &&
                  driverRating.map((e, i) => {
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => getDriverRating(i)}
                      >
                        <Icon
                          size={30}
                          name="star"
                          color={
                            e.star <= driverRatingStar ? 'yellow' : 'white'
                          }
                        />
                      </TouchableOpacity>
                    );
                  })}
              </View>
              <Text style={[styles.modalText, {fontWeight: '600'}]}>
                Kindly give rating to Car
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                {carRating &&
                  carRating.length > 0 &&
                  carRating.map((e, i) => {
                    return (
                      <TouchableOpacity key={i} onPress={() => getCarRating(i)}>
                        <Icon
                          size={30}
                          name="star"
                          color={e.star <= carRatingStar ? 'yellow' : 'white'}
                        />
                      </TouchableOpacity>
                    );
                  })}
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  {marginBottom: 5, backgroundColor: Colors.primary},
                ]}
                onPress={() => confirmationByPassenger()}
              >
                <Text
                  style={[styles.textStyle, {backgroundColor: Colors.primary}]}
                >
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [
    driverArriveAtdropoffLocation,
    driverRatingStar,
    carRatingStar,
    paymentByPassenger,
  ]);

  console.log(bookingData, 'booking');

  const FeedBackModal = useCallback(() => {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showFeedBackModal}
        >
          <View style={[styles.centeredView]}>
            <View style={[styles.modalView, {width: '90%', height: '65%'}]}>
              <MaterialIcon size={80} color="white" name="feedback" />
              <Text
                style={[
                  styles.modalText,
                  {
                    marginTop: 0,
                    paddingHorizontal: 2,
                    marginHorizontal: 0,
                    fontWeight: '500',
                  },
                ]}
              >
                Kindly Give your feedback!
              </Text>

              <TextInput
                multiline={true}
                placeholder="Enter feedback here"
                placeholderTextColor={'black'}
                style={{
                  width: '95%',
                  borderWidth: 1,
                  borderColor: 'white',
                  padding: 5,
                  textAlign: 'left',
                  backgroundColor: 'white',
                  color: 'black',
                  borderRadius: 10,
                  marginTop: 10,
                }}
                maxLength={100}
                onChangeText={e => setFeedBack(e)}
              />
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    marginBottom: 5,
                    backgroundColor: Colors.primary,
                    marginTop: 10,
                  },
                ]}
                onPress={bookingComplete}
              >
                <Text
                  style={[styles.textStyle, {backgroundColor: Colors.primary}]}
                >
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [showFeedBackModal, feedBack]);

  console.log(driverRatingStar, 'rating');
  console.log(carRatingStar, 'carRating');

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
        origin={selectedDriverLocation}
        destination={
          data && data.passengerData
            ? data.passengerData.pickupCords
            : data.pickupCords
        }
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
  }, [selectedDriver, data, selectedDriverLocation]);

  return (
    <View style={styles.container}>
      {loading ? (
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
          </View>
          <View style={styles.mapContainer}>
            {location.pickupCords && (
              <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={{
                  ...pickupCords,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                }}
              >
                <Marker coordinate={pickupCords} title="pickup location" />

                {!selectedDriver &&
                  onlineDriversLocation &&
                  onlineDriversLocation.length > 0 &&
                  onlineDriversLocation.map((b, i) => {
                    if (b && b.currentLocation) {
                      const x = geolib.isPointWithinRadius(
                        {
                          latitude: pickupCords.latitude,
                          longitude: pickupCords.longitude,
                        },
                        {
                          latitude: b.currentLocation.latitude,
                          longitude: b.currentLocation.longitude,
                        },
                        5000,
                      );

                      {
                        /* WHEN CONDITIONS GET TRUE VALUES ITS SHOW DRIVERS */
                      }
                      if (x) {
                        return (
                          <Marker
                            key={i}
                            coordinate={{
                              latitude: b.currentLocation.latitude,
                              longitude: b.currentLocation.longitude,
                            }}
                            pinColor="blue"
                          >
                            <Image
                              source={require('../../Assets/Images/mapCar.png')}
                              style={{width: 40, height: 40}}
                              resizeMode="contain"
                            />
                          </Marker>
                        );
                      }
                    }
                  })}

                {selectedDriver &&
                  Object.keys(selectedDriver).length > 0 &&
                  selectedDriverLocation.latitude &&
                  selectedDriverLocation.longitude && (
                    <Marker
                      coordinate={{
                        latitude: selectedDriverLocation.latitude,
                        longitude: selectedDriverLocation.longitude,
                      }}
                      pinColor="black"
                      title="Driver Location"
                      //   onDrag={() => console.log('onDrag', arguments)}
                      //   onDragStart={(e) => console.log('onDragStart', e)}
                      //   onDragEnd={(e)=>changeDropLocation(e.nativeEvent)}
                    >
                      <Image
                        source={require('../../Assets/Images/mapCar.png')}
                        style={{
                          width: 40,
                          height: 40,
                          transform:
                            selectedDriverLocation &&
                            selectedDriverLocation.heading
                              ? [
                                  {
                                    rotate: `${selectedDriverLocation.heading}deg`,
                                  },
                                ]
                              : [{rotate: `180deg`}],
                        }}
                        resizeMode="contain"
                      />
                    </Marker>
                  )}

                {Object.keys(dropLocationCords).length > 0 && (
                  <Marker
                    coordinate={{
                      latitude: dropLocationCords.latitude,
                      longitude: dropLocationCords.longitude,
                    }}
                    pinColor="black"
                    title="drop off location"
                  />
                )}
                {selectedDriverLocation &&
                  selectedDriverLocation.latitude &&
                  selectedDriverLocation.longitude &&
                  getViewLocation()}

                {dropLocationCords &&
                  Object.keys(dropLocationCords).length > 0 && (
                    <MapViewDirections
                      origin={location.pickupCords}
                      destination={location.dropLocationCords}
                      apikey={GoogleMapKey.GOOGLE_MAP_KEY}
                      strokeColor={Colors.black}
                      strokeWidth={3}
                      optimizeWayPoints={true}
                      mode="DRIVING"
                      onReady={result => {
                        setResult(result);
                        !route.params && calculateDistance(result);
                        mapRef.current.fitToCoordinates(result.coordinates, {
                          edgePadding: {
                            right: 30,
                            bottom: 50,
                            left: 30,
                            top: 50,
                          },
                        });
                      }}
                    />
                  )}
              </MapView>
            )}

            {data && (
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
                  {driverArriveAtPickUpLocation || driverArrive.pickupLocation
                    ? data.passengerData.minutes
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
                  {driverArriveAtPickUpLocation || driverArrive.pickUpLocation
                    ? data.passengerData.distance
                    : (
                        minutesAndDistanceDifference.distance * 0.621371
                      ).toFixed(2)}{' '}
                  Miles{' '}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bottomCard}>
            <KeyboardAvoidingView>
              <ScrollView
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <FlatList
                    data={
                      data && data.passengerData.selectedCar
                        ? data.passengerData.selectedCar
                        : dummyDataCat
                    }
                    renderItem={Categories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.id}
                  />
                  {selectedDriver && (
                    <View style={{justifyContent: 'center', width: '70%'}}>
                      <TouchableOpacity style={{width: '90%'}}>
                        <Text
                          style={{
                            color: Colors.secondary,
                            fontWeight: '900',
                            fontSize: 22,
                          }}
                          onPress={() => {
                            Linking.openURL(
                              `tel:${selectedDriver.phoneNumber}`,
                            );
                          }}
                        >
                          Contact Driver:{' '}
                          <Text
                            style={{
                              color: Colors.primary,
                              fontWeight: '700',
                              fontSize: 18,
                            }}
                          >
                            {' '}
                            {selectedDriver.phoneNumber}
                          </Text>{' '}
                          <FontAwesome
                            name="phone"
                            size={25}
                            color={Colors.secondary}
                          />{' '}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <KeyboardAvoidingView>
                  <AddressPickup
                    placeholderText={
                      data ? pickupAddress : 'Enter Pickup Location'
                    }
                    fetchAddress={fetchPickupCords}
                    type={data && 'route'}
                  />
                  <AddressPickup
                    placeholderText={
                      data ? dropOffAddress : 'Enter Destination Location'
                    }
                    fetchAddress={fetchDestinationCords}
                    type={data && 'route'}
                  />

                  <TextInput
                    placeholder="Fare"
                    placeholderTextColor={Colors.gray}
                    value={
                      selectedDriver &&
                      Object.keys(selectedDriver).length > 0 &&
                      !selectedDriver.bidFare
                        ? `${selectedDriver.fare}$ `
                        : selectedDriver &&
                          Object.keys(selectedDriver).length > 0 &&
                          selectedDriver.bidFare
                        ? `${selectedDriver.bidFare}$`
                        : bidFare
                        ? bidFare
                        : fare
                    }
                    onChangeText={setFare}
                    selectionColor={Colors.black}
                    activeUnderlineColor={Colors.gray}
                    style={styles.textInputStyle}
                    editable={false}
                    // left={<TextInput.Icon name="email" color={emailError ? 'red' : Colors.fontColor} />}
                  />
                  {distance && minutes && fare ? (
                    <View style={styles.recommendedText}>
                      <Text style={styles.headingStyle}>
                        {selectedDriver &&
                        Object.keys(selectedDriver).length > 0 &&
                        !selectedDriver.bidFare
                          ? 'Recommended Fare'
                          : selectedDriver &&
                            Object.keys(selectedDriver).length > 0 &&
                            selectedDriver.bidFare
                          ? 'Bid Fare'
                          : bidFare
                          ? 'Bid Fare'
                          : 'Recommended Fare'}
                        <Text style={styles.valueStyle}>
                          {selectedDriver &&
                          Object.keys(selectedDriver).length > 0 &&
                          !selectedDriver.bidFare
                            ? selectedDriver.fare
                            : Object.keys(selectedDriver).length > 0 &&
                              selectedDriver.bidFare
                            ? selectedDriver.bidFare
                            : bidFare
                            ? bidFare
                            : fare}
                          ${' '}
                        </Text>
                        Distance:
                        <Text style={styles.valueStyle}>{distance} miles </Text>
                        <Text>
                          Minutes:
                          <Text style={styles.valueStyle}>{minutes} min</Text>
                        </Text>
                      </Text>
                    </View>
                  ) : null}

                  {fare && !data && (
                    <TouchableOpacity
                      onPress={() => showBidFareModal()}
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
                      fare={fare}
                      confirm={confirmBidFare}
                    />
                  )}
                  {driverArrive && driverArrive.pickupLocation && ArriveModal()}
                  {driverArriveAtdropoffLocation && dropOffModal()}

                  {showFeedBackModal && FeedBackModal()}

                  <TextInput
                    placeholder="Additional Details"
                    placeholderTextColor={Colors.gray}
                    value={additionalDetails}
                    onChangeText={setAdditionalDetails}
                    selectionColor={Colors.black}
                    activeUnderlineColor={Colors.gray}
                    style={styles.textInputStyle}
                    editable={
                      routeData && Object.keys(routeData).length > 0
                        ? false
                        : true
                    }
                    // left={<TextInput.Icon name="email" color={emailError ? 'red' : Colors.fontColor} />}
                  />

                  {/* </ScrollView> */}
                  {routeData && Object.keys(routeData).length > 0 ? (
                    ''
                  ) : (
                    <View style={styles.btnContainer}>
                      <CustomButton
                        text="Find Rider"
                        onPress={() => checkValidation()}
                        // onPress={() => navigation.navigate('PassengerFindRide')}
                      />
                    </View>
                  )}
                </KeyboardAvoidingView>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  activityIndicatorStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContainer: {
    marginTop: 5,
    width: '100%',
    alignItems: 'center',
  },
  bottomCard: {
    width: '100%',
    padding: 20,
    backgroundColor: Colors.white,
    elevation: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  cards: {
    maxWidth: 80,
    width: 70,
    height: 80,
    maxHeight: 90,
    borderWidth: 1,
    margin: 5,
    padding: 4,
    borderRadius: 10,
  },
  catList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catImg: {
    width: 60,
    height: 40,
    alignSelf: 'center',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    zIndex: 1,
    backgroundColor: Colors.fontColor,
  },
  headingStyle: {
    color: Colors.fontColor,
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    margin: 2,
  },
  labelTextStyle: {
    fontSize: 11,
    textAlign: 'center',
    color: Colors.black,
    fontFamily: 'Poppins-Medium',
  },
  mapContainer: {
    flex: 1,
  },
  recommendedText: {
    backgroundColor: Colors.primary,
    padding: 3,
    margin: 3,
    borderRadius: 10,
  },
  textInputStyle: {
    zIndex: 1,
    width: '100%',
    color: Colors.black,
    fontSize: 14,
    backgroundColor: 'white',
    borderColor: 'grey',
    borderBottomWidth: 1,
    paddingLeft: 10,
  },
  valueStyle: {
    color: Colors.black,
    fontSize: 11,
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
    marginTop: 20,
    fontWeight: '800',
    color: 'white',
  },
});
