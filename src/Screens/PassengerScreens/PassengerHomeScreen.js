import React, { useState, useRef, useEffect } from 'react';
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
import MapView, { Marker } from 'react-native-maps';
import moment from 'moment-timezone';
import MapViewDirections from 'react-native-maps-directions';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import AddressPickup from '../../Components/AddressPickup';
import CustomButton from '../../Components/CustomButton';
import Icon from 'react-native-vector-icons/AntDesign';
import { useIsFocused } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IdleTimerManager from 'react-native-idle-timer';
import storage from '@react-native-firebase/storage';
import { LogBox } from 'react-native';
import {
  locationPermission,
  getCurrentLocation,
  NotificationPermission,
} from '../../Helper/HelperFunction';
import auth from '@react-native-firebase/auth';
import * as geolib from 'geolib';
import firestore from '@react-native-firebase/firestore';
import Geocoder from 'react-native-geocoding';
import { Modal } from 'react-native';
import AppModal from '../../Components/modal';
import { BackHandler } from 'react-native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { Linking } from 'react-native';
import { BASE_URI } from '../../Constants/Base_uri';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
export default function PassengerHomeScreen({ navigation }) {
  let route = useRoute();
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
  const [input, setInput] = useState(false);
  const [bookingData, setBookingData] = useState([]);
  const [result, setResult] = useState();
  const [appearBiddingOption, setAppearBiddingOption] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [bidFare, setBidFare] = useState(null);
  const [toll, setToll] = useState(null);
  const [driverArrive, setDriverArrive] = useState({
    pickupLocation: false,
    dropoffLocation: false,
  });
  const [selectedDriverLocation, setSelectedLocation] = useState({
    pickupCords: '',
    dropLocationCords: '',
  });
  const [mytimeZone, setTimeZone] = useState('');
  const [routeData, setRouteData] = useState([]);
  const [reasonForCancelRide, setReasonForCancelRide] = useState(false);
  const [passengerReasonForCancelRide, setPassengerReasonForCancelRide] =
    useState('');
  const [driverArriveAtPickUpLocation, setDriverArriveAtPickUpLocation] =
    useState(false);

  const [driverArriveAtdropoffLocation, setDriverArriveAtdropoffLocation] =
    useState(false);
  const [driverRatingStar, setDriverRatingStar] = useState(0);
  const [carRatingStar, setCarRatingStar] = useState(0);
  const [tipAmount, setTipAmount] = useState('');
  const [feedBack, setFeedBack] = useState('');
  const [showFeedBackModal, setShowFeedBackModal] = useState(false);
  const [cancelRide, setCancelRide] = useState(false);
  const [selectedDriverCarPic,setSelectedDriverCarPic] = useState("")

  const [location, setLocation] = useState({
    pickupCords: route.params ? route.params?.passengerData?.pickupCords : null,
    dropLocationCords: route.params
      ? route.params?.passengerData?.dropLocationCords
      : {},
  });

  const focus = useIsFocused();

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


  // const getTimeZone = async () => {
  //   if (
  //     location &&
  //     location?.pickupCords?.latitude &&
  //     location?.pickupCords?.longitude
  //   ) {
  //     let {pickupCords, dropLocationCords} = location;

  //     if (Object.keys(pickupCords).length > 0) {
  //       let {latitude, longitude} = pickupCords;

  //       const timestamp = Math.floor(Date.now() / 1000);

  //       const response = await fetch(
  //         `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${GoogleMapKey.GOOGLE_MAP_KEY}`,
  //       );

  //       // parse the response as JSON
  //       const data = await response.json();
  //       // extract the state or province from the response
  //       const timeZone = data.timeZoneId;
  //       setTimeZone(timeZone);
  //     }
  //   }
  // };
  // useEffect(() => {
  //   getTimeZone();
  // }, [pickupCords, pickupAddress, location]);

  const [minutesAndDistanceDifference, setMinutesAndDistanceDifference] =
    useState({
      minutes: '',
      distance: '',
      details: '',
    });

  const [buttonLoader, setButtonLoader] = useState(false);

  useEffect(() => {
    if (!selectedDriver && !route.params) {
      getLiveLocation();
      fetchDrivers();
      getCurrentUserUid();
    }
  }, []);

  useEffect(() => {
    // Disable screen timeout when the component mounts
    IdleTimerManager.setIdleTimerDisabled(true);

    // Re-enable screen timeout when the component unmounts
    return () => {
      IdleTimerManager.setIdleTimerDisabled(false);
    };
  }, []);

  const getDriverLocationUpdates = () => {
    if (data && route.params) {
      firestore()
        .collection('Request')
        .doc(data.passengerData.id)
        .onSnapshot(querySnapshot => {
          let myData = querySnapshot?.data();
          if ((myData && myData?.myDriversData) || myData?.driverData) {
            let myDriversData = myData?.myDriversData
              ? myData?.myDriversData
              : myData?.driverData;

            if (
              !driverArrive.pickupLocation &&
              !driverArriveAtPickUpLocation &&
              !route.params.driverArriveAtPickupLocation &&
              myData &&
              myData.driverArriveAtPickupLocation
            ) {
              setDriverArrive({
                ...driverArrive,
                pickupLocation: true,
              });
            }

            if (
              !driverArrive.dropoffLocation &&
              !driverArriveAtdropoffLocation &&
              myData &&
              myData.driverArriveAtDropoffLocation &&
              myData?.confirmByPassenger
            ) {
              setDriverArriveAtdropoffLocation(true);
            }
            if (myData && !Array.isArray(myDriversData) && myData?.currentLocation) {
              myDriversData.currentLocation.latitude =
                myDriversData.currentLocation.latitude;
              myDriversData.currentLocation.longitude =
                myDriversData.currentLocation.longitude;
              myDriversData.currentLocation.heading = myDriversData
                .currentLocation.heading
                ? myDriversData?.currentLocation?.heading?.toString()
                : '180';
              setSelectedLocation(myDriversData?.currentLocation);
            } else if (myData && Array.isArray(myDriversData)) {
              let selectedDriver = myDriversData?.filter(
                (e, i) => (e.requestStatus = 'accepted'),
              );
              selectedDriver = selectedDriver[0];
              setSelectedLocation(selectedDriver?.currentLocation);
            }
          }
        });
    }
  };

  const getWalletAmount = () => {
    const id = auth().currentUser.uid;

    firestore()
      .collection('wallet')
      .doc(id)
      .get()
      .then(doc => {
        if (doc._exists) {
          let wallet = null;
          let data = doc._data.wallet;

          data &&
            data.length > 0 &&
            data.map((e, i) => {
              wallet = wallet + Number(e.wallet);
            });

          setWallet(wallet);
        }
      });
  };
  const getNotificationPermission = async () => {
    let id = auth().currentUser.uid;

    messaging()
      .hasPermission()
      .then(enabled => {
        if (enabled) {
          messaging()
            .getToken()
            .then(fcmToken => {
              if (fcmToken) {
                firestore()
                  .collection('token')
                  .doc(id)
                  .set({
                    token: fcmToken,
                    create_date: new Date(),
                  })
                  .then(() => {
                    console.log('token succssfully saved');
                  })
                  .catch(error => {
                    console.log(error);
                  });
              } else {
                console.log("user doesn't have a device token yet");
              }
            });
        } else {
          console.log('Permission Denied');
        }
      });
  };

  useEffect(() => {
    getWalletAmount();
    getNotificationPermission();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (focus) {
        getDriverLocationUpdates();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [focus]);

  const getCurrentUserUid = () => {
    const currentUser = auth().currentUser;
    setCurrentUserUid(currentUser.uid);
  };

  let data =
    route.params && route.params?.data ? route.params.data : route.params;

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
  }, [
    location,
    location?.dropLocationCords?.latitude,
    location?.dropLocationCords?.longitude,
    pickupCords,
    dropLocationCords,
  ]);

  useEffect(() => {
    if (data && data?.driverData) {
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
  }, [route.params, focus, data, data?.driverArriveAtPickUpLocation, data?.driverArriveAtDropoffLocation]);
  useEffect(() => {
    if (data && !data?.driverData) {
      const backAction = () => {
        return false;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      return () => backHandler.remove();
    }
  }, [focus]);





  useEffect(() => {
    data?.driverData ? setRouteData(data) : setRouteData('');
    data?.driverData
      ? setSelectedDriver(data.driverData)
      : setSelectedDriver('');
    if (!data?.driverData) {
      AsyncStorage.removeItem('passengerBooking');
      AsyncStorage.removeItem('driverArrive');
    }
  }, [data, focus]);

  useEffect(() => {
    if (data && routeData !== null && routeData !== '') {
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
    if (data && data.driverData) {
      let myData = JSON.stringify(data);
      AsyncStorage.setItem('passengerBooking', myData);
    }
  }, [data, routeData]);

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

  const { pickupCords, dropLocationCords } = location;

  const [CurrentUserUid, setCurrentUserUid] = useState('');

  const getLiveLocation = async () => {
    const locPermissionDenied = await locationPermission();

    if (locPermissionDenied) {
      setLoading(true);
      const { latitude, longitude } = await getCurrentLocation();

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
        let carsData = { ...GetUserData };
        carsData = carsData?.categories;
        let first3Data = carsData.slice(0, 3);
        let greenCar = carsData.slice(5);
        let other2Data = carsData.slice(3, 5);
        let categoriesToShow = [...first3Data, ...greenCar, ...other2Data];
        setDummyDataCat(categoriesToShow);
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
    if (!pickupAddress) {
      ToastAndroid.show(
        'Pickup address is empty kindly select pickup location',
        ToastAndroid.SHORT,
      );
      return false;
    }
    if (!dropOffAddress) {
      ToastAndroid.show(
        'destination address is empty kindly select destination location',
        ToastAndroid.SHORT,
      );
      return false;
    }
    let flag = dummyDataCat.some((e, i) => e.selected);

    if (!flag) {
      ToastAndroid.show('Kindly select Car type', ToastAndroid.SHORT);
      return;
    }


    if (!bidFare) {
      let id = auth().currentUser.uid;
      let passengerPersonalDetails = '';
      firestore()
        .collection('Passengers')
        .doc(id)
        .get()
        .then(doc => {
          let passengerPersonalData = doc.data();

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
            passengerPersonalDetails: passengerPersonalData,
            requestDate: new Date(),
          };
          navigation.navigate('PassengerFindRide', myData);
        });
    }
    if (bidFare || data?.bidFare) {
      const id = auth().currentUser.uid;

      // const deviceTime = moment(); // get current time in device's time zone

      // // or any other valid time zone identifier

      // const convertedTime = moment.tz(mytimeZone);

      // const dateTime = convertedTime.format('YYYY-MM-DD HH:mm:ss'); // get the date and time in the format you want
      // const dateObj = moment(dateTime, 'YYYY-MM-DD HH:mm:ss').toDate(); // convert to JavaScript Date object

      firestore()
        .collection('Passengers')
        .doc(id)
        .get()
        .then(doc => {
          let passengerPersonalData = doc.data();
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
            passengerPersonalDetails: passengerPersonalData,
            requestDate: new Date(),
          };
          firestore()
            .collection('Request')
            .doc(CurrentUserUid)
            .set(myData)
            .then(() => {
              ToastAndroid.show(
                'Your request has been sent',
                ToastAndroid.SHORT,
              );
              navigation.navigate('PassengerFindRide', myData);
            })
            .catch(error => {
              console.log(error);
            });
        });
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
  const Categories = ({ item, index }) => {
    return (
      <View style={styles.catList}>
        <TouchableOpacity
          style={
            item.selected
              ? [styles.cards, { borderColor: Colors.primary, borderWidth: 2 }]
              : [styles.cards]
          }
          onPress={() => !bidFare && !route.params && onClickItem(item, index)}>
          <Image
            style={styles.catImg}
            source={{ uri: item.carImage }}
            resizeMode="cover"
          />
          <Text numberOfLines={2} style={styles.labelTextStyle}>
            {item.carName}
          </Text>
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

    if (myDistance < 1) {
      myDistance = Math.ceil(myDistance);
    }

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

            Tfare && setFare(Tfare?.toString());
            setBidFare(null)
          }
        });
      }
    });
  };

  const changeDropLocation = async location => {
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
  const handlePayPress = () => {
    setButtonLoader(true);

    if (data?.passengerData?.pickupAddress.toLowerCase().includes('pakistan')) {
      let id = auth().currentUser.uid;
      let tip =
        data?.passengerData?.passengerPersonalDetails?.tipOffered ??
        data.passengerPersonalDetails?.tipOffered;
      let rideFare = data?.passengerData?.bidFare ?? data?.passengerData?.fare;
      if (tip && tip?.includes('%')) {
        let tipPercent = tip.length > 2 ? tip.slice(0, 2) : tip.slice(0, 1);
        tipPercent = Number(tipPercent);
        tip = (Number(rideFare) * tipPercent) / 100;
      } else {
        tip = Number(tip)?.toFixed(2);
      }
      let totalCharges = Number(rideFare) + Number(tip);
      totalCharges = totalCharges.toFixed(2);
      let myWallet = wallet;
      myWallet = Number(myWallet.toFixed(2));

      if (myWallet >= totalCharges) {
        firestore()
          .collection('Request')
          .doc(id)
          .update({
            confirmByPassenger: true,
            tipAmount: tip,
            tollAmount: 0,
          })
          .then(() => {
            setButtonLoader(false);
            setDriverArrive({
              ...driverArrive,
              pickupLocation: false,
            });
            AsyncStorage.setItem(
              'driverArrive',
              'driverArriveAtPickupLocation',
            );
            setDriverArriveAtPickUpLocation(true);
            ToastAndroid.show(
              'You have succesfully confirm driver request',
              ToastAndroid.SHORT,
            );
          })
          .catch(error => {
            setButtonLoader(false);
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
          });
        return;
      } else if (myWallet < totalCharges) {
        let differenceAmount = Number(totalCharges) - Number(myWallet);
        differenceAmount = Number(differenceAmount).toFixed(2);

        firestore()
          .collection('passengerCards')
          .doc(id)
          .get()
          .then(doc => {
            let myData = doc.data();
            let savedCards = myData?.savedCards;
            savedCards =
              savedCards &&
              savedCards.length > 0 &&
              savedCards.filter((e, i) => {
                return e.default;
              });

            let customerData = {
              cardNumber: savedCards[0].cardNumber,
              expiryMonth: Number(savedCards[0].expiryMonth),
              expiryYear: Number(savedCards[0].expiryYear),
              cvc: savedCards[0].cvc,
              amount: differenceAmount,
            };

            const timeout = 10000; // 5 seconds
            let timedOut = false;

            // Set a timeout for the API request
            const timeoutId = setTimeout(() => {
              timedOut = true;
              // Show an error message to the user
              setButtonLoader(false);
              ToastAndroid.show('Request timed out', ToastAndroid.SHORT);
            }, timeout);
            axios
              .post(`${BASE_URI}dopayment`, customerData)
              .then(res => {
                clearTimeout(timeoutId);
                let data = res.data;
                let { result, status } = data;
                if (!status && !timedOut) {
                  setButtonLoader(false);
                  ToastAndroid.show(data.message, ToastAndroid.SHORT);
                  return;
                }
                let walletData = {
                  payment: result.amount / 100,
                  fare: 0,
                  wallet: result.amount / 100,
                  date: new Date(),
                  tip: 0,
                  toll: 0,
                };
                let id = auth().currentUser.uid;
                firestore()
                  .collection('wallet')
                  .doc(id)
                  .set(
                    {
                      wallet: firestore.FieldValue.arrayUnion(walletData),
                    },
                    { merge: true },
                  )
                  .then(() => {
                    firestore()
                      .collection('Request')
                      .doc(id)
                      .update({
                        confirmByPassenger: true,
                        tipAmount: tip,
                        tollAmount: 0,
                      })
                      .then(() => {
                        setButtonLoader(false);
                        setDriverArrive({
                          ...driverArrive,
                          pickupLocation: false,
                        });
                        AsyncStorage.setItem(
                          'driverArrive',
                          'driverArriveAtPickupLocation',
                        );
                        setDriverArriveAtPickUpLocation(true);
                        ToastAndroid.show(
                          'You have succesfully confirm driver request',
                          ToastAndroid.SHORT,
                        );
                      })
                      .catch(error => {
                        if (!timedOut) {
                          setButtonLoader(false);
                          ToastAndroid.show(error.message, ToastAndroid.SHORT);
                        }
                      });
                  })
                  .catch(error => {
                    if (!timedOut) {
                      setButtonLoader(false);
                      console.log(error);
                      ToastAndroid.show(error.message, ToastAndroid.SHORT);
                    }
                  });
              })
              .catch(error => {
                if (!timedOut) {
                  setButtonLoader(false);
                  console.log(error, 'error');
                  ToastAndroid.show('error occurs', ToastAndroid.SHORT);
                }
              });
          });
      }
      return;
    }
    const apiKey = 'Tm3G6Mg6pqq2HQ6gb8rg4896GtGHpJJD';
    const origin = data?.passengerData?.pickupAddress;
    const destination = data?.passengerData?.dropOffAddress;
    const apiEndpoint =
      'https://apis.tollguru.com/toll/v2/origin-destination-waypoints';
    const vehicleType = '2AxlesAuto';
    const vehicleNumber = 1;
    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        from: {
          address: origin,
        },
        to: {
          address: destination,
        },
        vehicleType: vehicleType,
      }),
    })
      .then(response => response.json())
      .then(res => {
        let tolls = res?.routes[0];
        let totalToll =
          tolls && tolls.length > 0 && tolls.map((e, i) => e.cashCost);
        let totalTollChargeToPassenger =
          totalToll && totalToll.length > 0
            ? totalToll.reduce((previous, current) => {
              return previous + current;
            })
            : 0;
        let id = auth().currentUser.uid;
        let tip =
          data?.passengerData?.passengerPersonalDetails?.tipOffered ??
          data.passengerPersonalDetails?.tipOffered;
        let rideFare =
          data?.passengerData?.bidFare ?? data?.passengerData?.fare;
        if (tip && tip?.includes('%')) {
          let tipPercent = tip.slice(0, 2);
          tipPercent = Number(tipPercent);
          tip = (Number(rideFare) * tipPercent) / 100;
        } else {
          tip = Number(tip)?.toFixed(2);
        }

        let totalCharges =
          Number(rideFare) + Number(tip) + Number(totalTollChargeToPassenger);
        totalCharges = totalCharges.toFixed(2);

        let myWallet = wallet;
        myWallet = Number(myWallet.toFixed(2));

        if (myWallet >= totalCharges) {
          firestore()
            .collection('Request')
            .doc(id)
            .update({
              confirmByPassenger: true,
              tipAmount: tip,
              tollAmount: totalTollChargeToPassenger,
            })
            .then(() => {
              setButtonLoader(false);
              setDriverArrive({
                ...driverArrive,
                pickupLocation: false,
              });
              AsyncStorage.setItem(
                'driverArrive',
                'driverArriveAtPickupLocation',
              );
              setDriverArriveAtPickUpLocation(true);
              ToastAndroid.show(
                'You have succesfully confirm driver request',
                ToastAndroid.SHORT,
              );
            })
            .catch(error => {
              setButtonLoader(false);
              ToastAndroid.show(error.message, ToastAndroid.SHORT);
            });
          return;
        } else if (myWallet < totalCharges) {
          let differenceAmount = Number(totalCharges) - Number(myWallet);
          differenceAmount = Number(differenceAmount).toFixed(2);

          firestore()
            .collection('passengerCards')
            .doc(id)
            .get()
            .then(doc => {
              let myData = doc.data();
              let savedCards = myData?.savedCards;
              savedCards =
                savedCards &&
                savedCards.length > 0 &&
                savedCards.filter((e, i) => {
                  return e.default;
                });

              let customerData = {
                cardNumber: savedCards[0].cardNumber,
                expiryMonth: Number(savedCards[0].expiryMonth),
                expiryYear: Number(savedCards[0].expiryYear),
                cvc: savedCards[0].cvc,
                amount: differenceAmount,
              };

              const timeout = 10000; // 5 seconds
              let timedOut = false;

              // Set a timeout for the API request
              const timeoutId = setTimeout(() => {
                timedOut = true;
                // Show an error message to the user
                setButtonLoader(false);
                ToastAndroid.show('Request timed out', ToastAndroid.SHORT);
              }, timeout);
              axios
                .post(`${BASE_URI}dopayment`, customerData)
                .then(res => {
                  clearTimeout(timeoutId);
                  let data = res.data;
                  let { result, status } = data;
                  if (!status && !timedOut) {
                    setButtonLoader(false);
                    ToastAndroid.show(data.message, ToastAndroid.SHORT);
                    return;
                  }
                  let walletData = {
                    payment: result.amount / 100,
                    fare: 0,
                    wallet: result.amount / 100,
                    date: new Date(),
                    tip: 0,
                    toll: 0,
                  };
                  let id = auth().currentUser.uid;
                  firestore()
                    .collection('wallet')
                    .doc(id)
                    .set(
                      {
                        wallet: firestore.FieldValue.arrayUnion(walletData),
                      },
                      { merge: true },
                    )
                    .then(() => {
                      firestore()
                        .collection('Request')
                        .doc(id)
                        .update({
                          confirmByPassenger: true,
                          tipAmount: tip,
                          tollAmount: totalTollChargeToPassenger,
                        })
                        .then(() => {
                          setButtonLoader(false);
                          setDriverArrive({
                            ...driverArrive,
                            pickupLocation: false,
                          });
                          AsyncStorage.setItem(
                            'driverArrive',
                            'driverArriveAtPickupLocation',
                          );
                          setDriverArriveAtPickUpLocation(true);
                          ToastAndroid.show(
                            'You have succesfully confirm driver request',
                            ToastAndroid.SHORT,
                          );
                        })
                        .catch(error => {
                          if (!timedOut) {
                            setButtonLoader(false);
                            ToastAndroid.show(
                              error.message,
                              ToastAndroid.SHORT,
                            );
                          }
                        });
                    })
                    .catch(error => {
                      if (!timedOut) {
                        setButtonLoader(false);
                        console.log(error);
                        ToastAndroid.show(error.message, ToastAndroid.SHORT);
                      }
                    });
                })
                .catch(error => {
                  if (!timedOut) {
                    setButtonLoader(false);
                    console.log(error, 'error');
                    ToastAndroid.show('error occurs', ToastAndroid.SHORT);
                  }
                });
            });
        }
      })
      .catch(error => {
        setButtonLoader(false);
        ToastAndroid.show('Network Error', ToastAndroid.SHORT);
      });
  };

  const ArriveModal = useCallback(() => {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={
            driverArrive.pickupLocation && !driverArriveAtPickUpLocation
          }>
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
                  { marginBottom: 10, backgroundColor: Colors.primary },
                ]}
                onPress={() => !buttonLoader && handlePayPress()}>
                {buttonLoader ? (
                  <ActivityIndicator size={'large'} color={Colors.black} />
                ) : (
                  <Text
                    style={[
                      styles.textStyle,
                      { backgroundColor: Colors.primary },
                    ]}>
                    confirm
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [driverArrive, buttonLoader, driverArriveAtPickUpLocation]);

  const getDriverRating = ind => {
    setDriverRatingStar(ind + 1);
  };
  const getCarRating = ind => {
    setCarRatingStar(ind + 1);
  };

  const confirmationByPassenger = (rideFare, tip, myToll) => {
    if (carRatingStar && driverRatingStar) {
      setButtonLoader(true);

      let remainingWallet = Number(rideFare) + Number(tip) + Number(myToll);

      let walletData = {
        payment: 0,
        fare: rideFare,
        wallet: -remainingWallet,
        date: new Date(),
        tip: tip,
        toll: myToll,
      };
      let id = auth().currentUser.uid;
      firestore()
        .collection('wallet')
        .doc(id)
        .set(
          {
            wallet: firestore.FieldValue.arrayUnion(walletData),
          },
          { merge: true },
        )
        .then(() => {
          setButtonLoader(false);
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
        })
        .catch(error => {
          setButtonLoader(false);
          ToastAndroid.show(`${error.message}`, ToastAndroid.SHORT);
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
          { merge: true },
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
    let id = auth().currentUser.uid;

    setButtonLoader(true);

    let tip = data?.passengerData?.passengerPersonalDetails?.tipOffered;
    let rideFare = data?.passengerData?.bidFare ?? data?.passengerData?.fare;

    if (tip.includes('%')) {
      let tipPercent = tip.slice(0, 2);
      tipPercent = Number(tipPercent);
      tip = (rideFare * tipPercent) / 100;
    } else {
      tip = Number(tip);
    }

    firestore().collection('Request').doc(id).update({
      bookingStatus: 'complete',
    });

    let myData = {
      booking: 'complete',
      passengerData: route.params.passengerData,
      driverData: route.params.driverData,
      carRating: carRatingStar,
      driverRating: driverRatingStar,
      tip: tip,
      toll: toll,
      feedBack: feedBack,
      date: new Date(),
    };
    firestore()
      .collection('Booking')
      .doc(route.params.passengerData.id)
      .set(
        {
          bookingData: firestore.FieldValue.arrayUnion(myData),
        },
        { merge: true },
      )
      .then(() => {
        setButtonLoader(false);
        ToastAndroid.show('your ride has been completed', ToastAndroid.SHORT);
        navigation.navigate('AskScreen');
        AsyncStorage.removeItem('passengerBooking');
        AsyncStorage.removeItem('driverArrive');
      })
      .catch(error => {
        setButtonLoader(false);
      });
  };

  const dropOffModal = useCallback(() => {
    let id = auth().currentUser?.uid;
    let tip = data?.passengerData?.passengerPersonalDetails?.tipOffered;
    let rideFare = data?.passengerData?.bidFare ?? data?.passengerData?.fare;
    if (tip.includes('%')) {
      let tipPercent = tip.slice(0, 2);
      tipPercent = Number(tipPercent);
      tip = (rideFare * tipPercent) / 100;
    } else {
      tip = Number(tip);
    }

    let myToll = toll;

    if (myToll == 'no toll') {
      myToll = 0;
    }

    let totalCharges = (Number(rideFare) + tip + myToll).toFixed(2);
    return (
      <View style={styles.centeredView}>
        <ScrollView style={{ height: '100%' }}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={driverArriveAtdropoffLocation && !showFeedBackModal}>
            <View style={[styles.centeredView]}>
              <View style={[styles.modalView, { width: '90%', height: 550 }]}>
                <Text style={[styles.modalText, { fontSize: 26 }]}>
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
                  ]}>
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
                  ]}>
                  Your Fare Amount:{' '}
                  <Text style={{ fontSize: 16, color: 'yellow', width: '100%' }}>
                    $
                    {route.params.passengerData.bidFare ??
                      route.params.passengerData.fare}
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
                  Your Tip Amount:{' '}
                  <Text style={{ fontSize: 16, color: 'yellow', width: '100%' }}>
                    ${tip.toFixed(2)}
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
                  Your Toll Amount:{' '}
                  <Text style={{ fontSize: 16, color: 'yellow', width: '100%' }}>
                    ${myToll && myToll?.toFixed(2)}
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
                  Total Charges:
                  <Text style={{ fontSize: 16, color: 'yellow', width: '100%' }}>
                    ${totalCharges}
                  </Text>
                </Text>
                <Text
                  style={[styles.modalText, { fontWeight: '600', marginTop: 2 }]}>
                  Kindly give rating to driver
                </Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  {driverRating &&
                    driverRating.length > 0 &&
                    driverRating.map((e, i) => {
                      return (
                        <TouchableOpacity
                          key={i}
                          onPress={() => getDriverRating(i)}>
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
                <Text style={[styles.modalText, { fontWeight: '600' }]}>
                  Kindly give rating to Car
                </Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  {carRating &&
                    carRating.length > 0 &&
                    carRating.map((e, i) => {
                      return (
                        <TouchableOpacity
                          key={i}
                          onPress={() => getCarRating(i)}>
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
                    { marginBottom: 5, backgroundColor: Colors.primary },
                  ]}
                  onPress={() =>
                    !buttonLoader &&
                    confirmationByPassenger(rideFare, tip, myToll)
                  }>
                  <Text
                    style={[
                      styles.textStyle,
                      { backgroundColor: Colors.primary },
                    ]}>
                    {buttonLoader ? (
                      <ActivityIndicator size={'large'} color={'black'} />
                    ) : (
                      'Confirm'
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    );
  }, [
    driverArriveAtdropoffLocation,
    driverRatingStar,
    carRatingStar,
    buttonLoader,
    toll,
  ]);
  const FeedBackModal = useCallback(() => {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showFeedBackModal}>
          <View style={[styles.centeredView]}>
            <View style={[styles.modalView, { width: '90%', height: '65%' }]}>
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
                ]}>
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
                onPress={!buttonLoader && bookingComplete}>
                <Text
                  style={[styles.textStyle, { backgroundColor: Colors.primary }]}>
                  {buttonLoader ? (
                    <ActivityIndicator size={'large'} color={'black'} />
                  ) : (
                    'Confirm'
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [showFeedBackModal, feedBack, buttonLoader]);

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
        origin={
          selectedDriverLocation?.pickupCords &&
            selectedDriverLocation?.dropLocationCords
            ? selectedDriverLocation
            : selectedDriver?.currentLocation
        }
        destination={
          data && data?.passengerData
            ? data?.passengerData?.pickupCords
            : data?.pickupCords
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
  }, [selectedDriver, data]);
  // console.log(passengerData,"passenger")

  const cancelRideByPassenger = () => {
    setCancelRide(true);
  };

  const cancelBookingByPassenger = passengerReasonForCancelRide => {
    setButtonLoader(true);
    let fare = data.passengerData.bidFare ?? data.passengerData.fare;
    let deductedAmount = ((Number(fare) * 5) / 100).toFixed(2);

    let walletData = {
      payment: 0,
      fare: 0,
      wallet: -deductedAmount,
      date: new Date(),
      tip: 0,
      cancellationCharges: deductedAmount,
    };
    firestore()
      .collection('wallet')
      .doc(route.params.passengerData.id)
      .set(
        {
          wallet: firestore.FieldValue.arrayUnion(walletData),
        },
        { merge: true },
      )
      .then(() => {
        let cancelRide = {
          passengerData: route.params.passengerData,
          driverData: route.params.driverData,
          rideCancelByPassenger: true,
          reasonForCancelRide: passengerReasonForCancelRide,
          date: new Date()
        };
        firestore()
          .collection('Request')
          .doc(route?.params?.passengerData?.id)
          .update({
            rideCancelByPassenger: true,
            myDriversData: null,
            driverData: null,
            requestStatus: null,
            driverArriveAtPickUpLocation: null,
            requestDate: new Date()
          })
          .then(() => {
            firestore()
              .collection('RideCancel')
              .doc(route.params.passengerData.id)
              .set(
                {
                  cancelledRides: firestore.FieldValue.arrayUnion(cancelRide),
                },
                { merge: true },
              )
              .then(() => {
                setButtonLoader(false);
                AsyncStorage.removeItem('passengerBooking');
                AsyncStorage.removeItem('driverArrive');
                ToastAndroid.show(
                  'Your ride has been succesfully cancelled',
                  ToastAndroid.SHORT,
                );
                setSelectedDriver('');
                setSelectedLocation({
                  pickupCords: '',
                  dropLocationCords: '',
                });
                setDriverArrive({
                  pickupLocation: false,
                  dropoffLocation: false,
                });
                setRouteData('');
                setReasonForCancelRide(false);
                setPassengerReasonForCancelRide('');
                setDriverArriveAtPickUpLocation(false);
                setCancelRide(false);

                let routeToFindDriver =
                  route.params?.passengerData ??
                  route.params?.data?.passengerData;
                navigation.navigate('PassengerFindRide', routeToFindDriver);
              })
              .catch(error => {
                setButtonLoader(false);
                ToastAndroid.show(error.message, ToastAndroid.SHORT);
                console.log(error);
              });
          })
          .catch(error => {
            setButtonLoader(false);
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
            console.log(error, 'error');
          });
      })
      .catch(error => {
        setButtonLoader(false);
        ToastAndroid.show(error.message, ToastAndroid.SHORT);
      });
  };

  const cancelRideByDriver = () => {
    const id = auth().currentUser.uid;
    firestore()
      .collection('Request')
      .doc(id)
      .get()
      .then(doc => {
        let data = doc.data();

        if (data && data.rideCancelByDriver && selectedDriver && Object.keys(selectedDriver).length > 0) {
          ToastAndroid.show(
            'Ride has been cancelled by Driver',
            ToastAndroid.SHORT,
          );
          AsyncStorage.removeItem('passengerBooking');
          AsyncStorage.removeItem('driverArrive');
          setSelectedDriver('');
          setSelectedLocation({
            pickupCords: '',
            dropLocationCords: '',
          });
          setDriverArrive({
            pickupLocation: false,
            dropoffLocation: false,
          });
          setRouteData('');
          setReasonForCancelRide(false);
          setPassengerReasonForCancelRide('');
          setDriverArriveAtPickUpLocation(false);
          setCancelRide(false);
          let routeToFindDriver =
            route.params?.passengerData ?? route.params?.data?.passengerData;
          navigation.navigate('PassengerFindRide', routeToFindDriver);
        }
      });
  };


  useEffect(() => {
    let interval;
    if ((Object.keys(selectedDriver).length > 0, focus)) {
      interval = setInterval(() => {
        if (selectedDriver && Object.keys(selectedDriver).length > 0, focus) {
          cancelRideByDriver();
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [selectedDriver, focus]);

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
                        fontSize: 20,
                        alignSelf: 'flex-start',
                        marginTop: 0,
                        fontWeight: '400',
                      },
                    ]}>
                    Your driver is already on the way
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
                      onChange={setPassengerReasonForCancelRide}
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
                        onPress={() =>
                          cancelBookingByPassenger(passengerReasonForCancelRide)
                        }>
                        <Text
                          style={[
                            styles.textStyle,
                            { backgroundColor: Colors.primary },
                          ]}>
                          {buttonLoader ? (
                            <ActivityIndicator
                              size={'large'}
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
  }, [cancelRide, reasonForCancelRide, input, buttonLoader]);


  const getTollAmount = () => {
    let id = auth().currentUser?.uid;
    firestore()
      .collection('Request')
      .doc(id)
      .get()
      .then(res => {
        let myToll = res.data();
        myToll = myToll.tollAmount;
        if (myToll) {
          setToll(myToll);
        } else {
          setToll('no toll');
        }
      });
  };


const getDriverCarPic = () => {  
    let carPic = selectedDriver?.vehicleDetails?.vehiclePicFront

    console.log(carPic,"pick")

     storage().ref(carPic).getDownloadURL().then((res)=>{

        selectedDriver.carPic = res  
        setSelectedDriverCarPic(res)
     })
}

useEffect(()=>{
    if(selectedDriver && Object.keys(selectedDriver).length>0){
      getDriverCarPic()
    } 

},[selectedDriver,route.params,focus])


console.log(selectedDriverCarPic,"car pcik")


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
              rightButton={
                driverArrive?.pickupLocation || data?.driverArriveAtPickUpLocation ? "" :
                  selectedDriver
                    ? 'show'
                    : ''
              }
              onPress={() => {
                !selectedDriver && navigation.toggleDrawer();
              }}
              source={require('../../Assets/Images/URWhiteLogo.png')}
              cancelRideFunction={cancelRideByPassenger}
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
                }}>
                <Marker coordinate={pickupCords} title="pickup location" />

                {!selectedDriver &&
                  onlineDriversLocation &&
                  onlineDriversLocation.length > 0 &&
                  onlineDriversLocation.map((b, i) => {
                    if (
                      b &&
                      b?.currentLocation &&
                      b?.currentLocation?.latitude &&
                      b?.currentLocation?.longitude &&
                      b?.status == 'online' &&
                      pickupCords?.latitude &&
                      pickupCords?.longitude
                    ) {
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
                            pinColor="blue">
                            <Image
                              source={require('../../Assets/Images/mapCar.png')}
                              style={{ width: 40, height: 40 }}
                              resizeMode="contain"
                            />
                          </Marker>
                        );
                      }
                    }
                  })}

                {selectedDriver &&
                  Object.keys(selectedDriver).length > 0 &&
                  selectedDriverLocation?.latitude &&
                  selectedDriverLocation?.longitude && (
                    <Marker
                      coordinate={{
                        latitude: selectedDriverLocation?.latitude,
                        longitude: selectedDriverLocation?.longitude,
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
                              : [{ rotate: `180deg` }],
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
                      strokeWidth={5}
                      optimizeWayPoints={true}
                      mode="DRIVING"
                      onReady={result => {
                        setResult(result);
                        ((!route.params || !data?.driverData) && calculateDistance(result))
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

            {data && data.driverData && (
              <View style={{ position: 'absolute', right: 10, top: 10 }}>
                <Text
                  style={{
                    color: 'black',
                    fontSize: 18,
                    fontWeight: '900',
                    marginTop: 10,
                  }}>
                  Duration:{' '}
                  {driverArriveAtPickUpLocation || driverArrive.pickupLocation || !data?.driverArriveAtPickUpLocation
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
                  }}>
                  Distance:{' '}
                  {driverArriveAtPickUpLocation || driverArrive.pickUpLocation || !data?.driverArriveAtPickUpLocation
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
                keyboardShouldPersistTaps="handled">
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  {!selectedDriver  && Object.keys(selectedDriver).length == 0 && <FlatList
                    data={dummyDataCat}
                    renderItem={Categories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.id}
                  />}
                  {
                    selectedDriverCarPic && selectedDriver && Object.keys(selectedDriver).length > 0 && <View style={{padding:10,alignItems:"center"}} >

                      <Image source={{uri:selectedDriverCarPic}} style={{width:50,height:50,borderRadius:10}} />
                      <Text style={{color:Colors.black,fontSize:16,textAlign:"center",fontWeight:"600"}} > {selectedDriver.vehicleDetails.vehicleNumPlate} </Text>
                      <Text style={{color:Colors.red,fontSize:16,textAlign:"center",fontWeight:"600",marginTop:5}} > {selectedDriver.vehicleDetails.vehicleCategory} </Text>
                    </View>
                  }
                  {selectedDriver && (
                    <View style={{ justifyContent: 'center', width: '70%' }}>
                      <TouchableOpacity style={{ width: '90%' }}>
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
                          }}>
                          Contact Driver:{' '}
                          <Text
                            style={{
                              color: Colors.primary,
                              fontWeight: '700',
                              fontSize: 18,
                            }}>
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
                      <View>
                        <Text
                          style={{
                            color: Colors.black,
                            fontWeight: '400',
                            fontSize: 14,
                            marginRight: 5,
                          }}>
                          Vehicle Name:
                          <Text
                            style={{
                              color: Colors.black,
                              fontWeight: '500',
                              fontSize: 15,
                            }}>
                            {selectedDriver &&
                              selectedDriver?.vehicleDetails?.vehicleName}
                          </Text>
                        </Text>

                        <Text
                          style={{
                            color: Colors.black,
                            fontWeight: '400',
                            fontSize: 14,
                            marginRight: 5,
                          }}>
                          Vehicle Model:
                          <Text
                            style={{
                              color: Colors.black,
                              fontWeight: '500',
                              fontSize: 15,
                            }}>
                            {selectedDriver &&
                              selectedDriver?.vehicleDetails?.vehicleModel}
                          </Text>
                        </Text>
                        <Text
                          style={{
                            color: Colors.black,
                            fontWeight: '400',
                            fontSize: 14,
                            marginRight: 5,
                          }}>
                          Vehicle Color:
                          <Text
                            style={{
                              color: Colors.black,
                              fontWeight: '500',
                              fontSize: 15,
                            }}>
                            {selectedDriver &&
                              selectedDriver?.vehicleDetails?.vehicleColor}
                          </Text>
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                <KeyboardAvoidingView>
                  <AddressPickup
                    placeholderText={
                      data ? pickupAddress : 'Enter Pickup Location'
                    }
                    fetchAddress={fetchPickupCords}
                    type={data && data.driverData && 'route'}
                  />
                  <AddressPickup
                    placeholderText={
                      data ? dropOffAddress : 'Enter Destination Location'
                    }
                    fetchAddress={fetchDestinationCords}
                    type={data && data.driverData && 'route'}
                  />

                  <TextInput
                    placeholder="Fare"
                    placeholderTextColor={Colors.gray}
                    value={`${pickupAddress && dropOffAddress && "$"}${data && !data?.driverData && bidFare ? bidFare : data && !data?.driverData && fare ? fare : data?.passengerData.bidFare
                      ? data?.passengerData?.bidFare : data?.passengerData?.fare ? data?.passengerData?.fare 
                      : Object.keys(selectedDriver).length > 0 &&
                        selectedDriver.bidFare
                        ? selectedDriver.bidFare : selectedDriver &&
                          Object.keys(selectedDriver).length > 0 &&
                          !selectedDriver.bidFare
                          ? selectedDriver.fare
                          : bidFare
                            ? bidFare
                            : fare}`}
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
                          {pickupAddress&&dropOffAddress && "$"}
                          {data && !data?.driverData && bidFare ? bidFare : data && !data?.driverData && fare ? fare : data?.passengerData.bidFare
                            ? data?.passengerData?.bidFare : data?.passengerData?.fare ? data?.passengerData?.fare  
                            : Object.keys(selectedDriver).length > 0 &&
                              selectedDriver.bidFare
                              ? selectedDriver.bidFare : selectedDriver &&
                                Object.keys(selectedDriver).length > 0 &&
                                !selectedDriver.bidFare
                                ? selectedDriver.fare
                                : bidFare
                                  ? bidFare
                                  : fare}
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

                  {(fare || !data?.driverData) &&
                    !Object.keys(selectedDriver).length > 0 &&
                    distance > 3 && (
                      <TouchableOpacity
                        onPress={() => showBidFareModal()}
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
                      fare={fare}
                      confirm={confirmBidFare}
                    />
                  )}
                  {driverArrive &&
                    driverArrive.pickupLocation &&
                    focus &&
                    ArriveModal()}
                  {driverArriveAtdropoffLocation && getTollAmount()}
                  {toll && focus && dropOffModal()}
                  {showFeedBackModal && FeedBackModal()}
                  {cancelRide && cancelRideModal()}

                  <TextInput
                    placeholder="Additional Details"
                    placeholderTextColor={Colors.gray}
                    value={additionalDetails}
                    onChangeText={setAdditionalDetails}
                    selectionColor={Colors.black}
                    activeUnderlineColor={Colors.gray}
                    style={styles.textInputStyle}
                    editable={
                      selectedDriver && Object.keys(selectedDriver).length > 0
                        ? false
                        : true
                    }
                  // left={<TextInput.Icon name="email" color={emailError ? 'red' : Colors.fontColor} />}
                  />

                  {/* </ScrollView> */}
                  {selectedDriver && Object.keys(selectedDriver).length > 0 ? (
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
    maxWidth: 100,
    width: 70,
    height: 80,
    maxHeight: Dimensions.get('window').height / 5,
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
