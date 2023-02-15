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
import {
  locationPermission,
  getCurrentLocation,
} from '../../Helper/HelperFunction';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import * as geolib from 'geolib';
import firestore from '@react-native-firebase/firestore';
import {set} from 'react-native-reanimated';
import {FABGroup} from 'react-native-paper/lib/typescript/components/FAB/FABGroup';
import Geocoder from 'react-native-geocoding';
import {Modal} from 'react-native-paper';
import AppModal from '../../Components/modal';

export default function PassengerHomeScreen({navigation, route}) {
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
  const [selectedDriver, setSelectedDriver] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [result, setResult] = useState();
  const [appearBiddingOption, setAppearBiddingOption] = useState(false);
  const [bidFare, setBidFare] = useState(null);

  useEffect(() => {
    getLiveLocation();
    fetchDrivers();
  }, []);

  const [routeData, setRouteData] = useState([]);

  let data = route.params;
  console.log(data, 'data');

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setRouteData(data);
      if (data && data.selectedDriver && Array.isArray(data.selectedDriver)) {
        data.selectedDriver.map((e, i) => {
          if (e.selected) {
            setSelectedDriver(e);
          }
        });
      } else if (
        data &&
        data.selectedDriver &&
        !Array.isArray(data.selectedDriver) &&
        data.selectedDriver.selected
      ) {
        setSelectedDriver(data.selectedDriver);
      }
    }
  }, [data]);

  console.log(selectedDriver, 'DRIVER');

  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;
  const LATITUDE_DELTA = 0.06;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
  const [location, setLocation] = useState({
    pickupCords: null,
    dropLocationCords: {},
  });
  const {pickupCords, dropLocationCords} = location;

  const [CurrentUserUid, setCurrentUserUid] = useState('');

  useEffect(() => {
    const currentUser = auth().currentUser;
    setCurrentUserUid(currentUser.uid);
  }, []);

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

  // const getRouteDataLocation = () => {
  //   // setLocation({
  //   //   ...location,
  //   //   pickupCords : routeData.passenger.pickupCords,
  //   //   dropLocationCords : routeData.passenger.dropLocationCords
  //   // })

  //   setSelectedDriver(routeData.selectedDriver[0]);
  // };

  // console.log(selectedDriver,"selected")

  // console.log(location, 'location');

  // useEffect(() => {
  //   if (
  //     routeData &&
  //     Object.keys(routeData).length > 0 &&
  //     routeData.passenger.pickupCords &&
  //     Object.keys(routeData.passenger.pickupCords).length > 0
  //   ) {
  //     getRouteDataLocation();
  //   }
  // }, [routeData]);

  const fetchData = async () => {
    firestore()
      .collection('Categories')
      .doc('8w6hVPveXKR6kTvYVWwy')
      .onSnapshot(documentSnapshot => {
        const GetUserData = documentSnapshot.data();
        console.log(GetUserData, 'getUser');
        setDummyDataCat(GetUserData.categories);
      });
  };
  const fetchDrivers = async () => {
    /// GET ALL DRIVERS
    const Driver = await firestore()
      .collection('Drivers')
      .onSnapshot(querySnapshot => {
        // console.log('Total users: ', querySnapshot.size);
        let myDriversTemp = [];
        querySnapshot.forEach(documentSnapshot => {
          // console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
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

  useEffect(() => {
    if (
      pickupCords &&
      dropLocationCords &&
      Object.keys(pickupCords).length > 0 &&
      Object.keys(dropLocationCords).length > 0
    ) {
      getPickUpAndDropOffAddress();
    }
  }, [pickupCords, dropLocationCords]);

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

    if(!bidFare){

      let data = {
        pickupCords: pickupCords,
        dropLocationCords: dropLocationCords,
        selectedCar: dummyDataCat.filter((e, i) => e.selected),
        distance: distance,
        minutes: minutes,
        fare: fare,
        bidFare : bidFare,
        pickupAddress: pickupAddress,
        dropOffAddress: dropOffAddress,
        additionalDetails: additionalDetails,
        id: CurrentUserUid,
      };

      navigation.navigate('PassengerFindRide', data);

    }
    
    else {
      firestore()
        .collection('booking')
        .onSnapshot(querySnapshot => {
          let myBookingData = [];

          querySnapshot.forEach(documentSnapshot => {
            let data = documentSnapshot.data();

            if (data && data.id == CurrentUserUid) {
              myBookingData.push(data);
            }
          });

          if (myBookingData && myBookingData.length > 0) {
            setBookingData(myBookingData);
          } else {
            setBookingData('noData');
          }
        });
    }
  };

  const sendBookingDataInFb = () => {
    let myFlag =
      bookingData &&
      bookingData.length > 0 &&
      bookingData.every((e, i) => e.bookingStatus == 'done');

    if (bookingData && bookingData.length > 0 && !myFlag) {
      bookingData &&
        bookingData.map((e, i) => {
          if (
            e.id == CurrentUserUid &&
            e.bookingStatus !== 'done' &&
            !e.driverDetail
          ) {
            let data = {
              pickupCords: pickupCords,
              dropLocationCords: dropLocationCords,
              selectedCar: dummyDataCat.filter((e, i) => e.selected),
              distance: distance,
              minutes: minutes,
              fare: fare,
              pickupAddress: pickupAddress,
              dropOffAddress: dropOffAddress,
              additionalDetails: additionalDetails,
              bookingStatus: 'inProcess',
              id: CurrentUserUid,
              bookingCount: e.bookingCount,
            };

            firestore()
              .collection('booking')
              .doc(`${CurrentUserUid}booking${data.bookingCount}`)
              .set(data)
              .then(() => {
                console.log('Data successfully send');
                navigation.navigate('PassengerFindRide', data);
              })
              .catch(error => {
                console.log(error);
              });
          }
        });
    } else if (myFlag && bookingData && bookingData.length > 0) {
      console.log(bookingData.length, 'length');
      console.log(bookingData, 'bookingData');

      let data = {
        pickupCords: pickupCords,
        dropLocationCords: dropLocationCords,
        selectedCar: dummyDataCat.filter((e, i) => e.selected),
        distance: distance,
        minutes: minutes,
        fare: fare,
        pickupAddress: pickupAddress,
        dropOffAddress: dropOffAddress,
        additionalDetails: additionalDetails,
        bookingStatus: 'inProcess',
        id: CurrentUserUid,
        bookingCount: bookingData.length + 1,
      };

      firestore()
        .collection('booking')
        .doc(`${CurrentUserUid}booking${data.bookingCount}`)
        .set(data)
        .then(res => {
          console.log('data successfully send');
          navigation.navigate('PassengerFindRide', data);
        })
        .catch(error => {
          console.log(error, 'error');
        });
    }
  };

  useEffect(() => {
    console.log(bookingData, 'boooking');

    if (bookingData && bookingData.length > 0 && Array.isArray(bookingData)) {
      sendBookingDataInFb();
    } else if (bookingData == 'noData') {
      let data = {
        pickupCords: pickupCords,
        dropLocationCords: dropLocationCords,
        selectedCar: dummyDataCat.filter((e, i) => e.selected),
        distance: distance,
        minutes: minutes,
        fare: fare,
        pickupAddress: pickupAddress,
        dropOffAddress: dropOffAddress,
        additionalDetails: additionalDetails,
        bookingStatus: 'inProcess',
        id: CurrentUserUid,
        bookingCount: 1,
      };
      firestore()
        .collection('booking')
        .doc(`${CurrentUserUid}booking${data.bookingCount}`)
        .set(data)
        .then(res => {
          console.log('data successfully send');
          navigation.navigate('PassengerFindRide', data);
        })
        .catch(error => {
          console.log(error, 'error');
        });
    }
  }, [bookingData]);

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
          onPress={() => onClickItem(item, index)}>
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
    console.log(result.distance, 'dis');

    let myDistance = (result.distance * 0.62137119).toFixed(2);
    let myDuration = Math.ceil(result.duration);
    setDistance(myDistance);
    setMinutes(myDuration);
    let myfare = '';
    let serviceCharges = '';
    let Tfare = '';
    let distanceMinus = '';
    dummyDataCat.map(cat => {
      console.log(cat.carName, 'carname');
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
            setFare(Tfare.toString());
          }
        });
      }
    });
  };

  useEffect(
    () => checkFare(result),

    [category, pickupCords, dropLocationCords],
  );

  const checkFare = result => {
    if (fare && pickupCords && dropLocationCords) {
      calculateDistance(result);
    }
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

  console.log(appearBiddingOption, 'appear');

  const closeModal = () => {
    setAppearBiddingOption(false);
  };

  const confirmBidFare = selectedBid => {
    console.log(selectedBid, 'selectedFare');

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

    // setBidFare(selectedFare)
    // setAppearBiddingOption(false)
  };

  console.log(bidFare, 'BIDfARE');

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
                }}>
                <Marker coordinate={pickupCords} title="pickup location" />
                {onlineDriversLocation &&
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
                            pinColor="blue">
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
                {Object.keys(dropLocationCords).length > 0 && (
                  <Marker
                    coordinate={{
                      latitude: dropLocationCords.latitude,
                      longitude: dropLocationCords.longitude,
                    }}
                    pinColor="black"
                    title="drop off location"
                    //   onDrag={() => console.log('onDrag', arguments)}
                    //   onDragStart={(e) => console.log('onDragStart', e)}
                    //   onDragEnd={(e)=>changeDropLocation(e.nativeEvent)}
                    draggable={true}
                  />
                )}
                {Object.keys(dropLocationCords).length > 0 && (
                  <MapViewDirections
                    origin={location.pickupCords}
                    destination={location.dropLocationCords}
                    apikey={GoogleMapKey.GOOGLE_MAP_KEY}
                    strokeColor={Colors.black}
                    strokeWidth={3}
                    optimizeWayPoints={true}
                    mode="DRIVING"
                    onReady={result => {
                      console.log(result, 'result');
                      setResult(result);
                      calculateDistance(result);
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
          </View>
          <View style={styles.bottomCard}>
            <KeyboardAvoidingView>
              <ScrollView
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled">
                <FlatList
                  data={dummyDataCat}
                  renderItem={Categories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item.id}
                />

                <KeyboardAvoidingView>
                  <AddressPickup
                    placeholderText="Enter Pickup Location"
                    fetchAddress={fetchPickupCords}
                  />
                  <AddressPickup
                    placeholderText="Enter Destination Location"
                    fetchAddress={fetchDestinationCords}
                  />

                  <TextInput
                    placeholder="Fare"
                    placeholderTextColor={Colors.gray}
                    value={
                      selectedDriver && Object.keys(selectedDriver).length > 0
                        ? selectedDriver.offeredFare
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
                        Object.keys(selectedDriver).length > 0
                          ? 'Offered Fare'
                          : bidFare
                          ? 'Bid Fare'
                          : 'Recommended Fare'}
                        <Text style={styles.valueStyle}>
                          {selectedDriver &&
                          Object.keys(selectedDriver).length > 0
                            ? selectedDriver.offeredFare
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

                  {fare && (
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
                      fare={fare}
                      confirm={confirmBidFare}
                    />
                  )}
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
});
