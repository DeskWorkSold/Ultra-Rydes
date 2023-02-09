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

export default function PassengerHomeScreen({navigation}) {
  useEffect(() => {
    getLiveLocation();
    fetchDrivers();
  }, []);

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

  const [result, setResult] = useState();
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

  console.log(onlineDriversLocation, 'online DRIVER');

  const fetchPickupCords = (lat, lng, address) => {
    console.log(lng, lat, address, 'address');

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
    Geocoder.from(
    dropLocationCords.latitude,
    dropLocationCords.longitude,
    )
      .then(json => {
        var addressDropOff = json.results[0].formatted_address;
        setDropOffAddress(addressDropOff);
      })
      .catch(error => console.warn(error));
  };

  useEffect(() => {
    pickupCords && dropLocationCords && Object.keys(pickupCords).length > 0 &&
      Object.keys(dropLocationCords).length > 0 &&
      getPickUpAndDropOffAddress();
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
    } else {
      let data = {
        pickupCords: pickupCords,
        dropLocationCords: dropLocationCords,
        selectedCar: dummyDataCat.filter((e, i) => e.selected),
        distance: distance,
        minutes: minutes,
        fare: fare,
        pickupAddress: pickupAddress,
        dropOffAddress: dropOffAddress,
      };

      firestore()
        .collection('booking')
        .doc(CurrentUserUid)
        .set(data)
        .then(res => {
          console.log('data successfully send');
        })
        .catch(error => {
          console.log(error, 'error');
        });

      navigation.navigate('PassengerFindRide', data);
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
            Tfare = Math.round(myfare + serviceCharges);
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
    console.log(fare, 'fare');
    console.log(pickupCords, 'pickup');
    console.log(dropLocationCords, 'drop');

    if (fare && pickupCords && dropLocationCords) {
      calculateDistance(result);
    }
  };

  console.log(result, 'result');

  console.log(distance, minutes, 'distace minutes');

  console.log(dropLocationCords, 'droplocation');

  const changeDropLocation = location => {
    console.log(location, 'location');

    setLocation({
      ...location,
      dropLocationCords: {
        latitude: location.coordinate.latitude,
        longitude: location.coordinate.longitude,
      },
    });
  };

  
  console.log(onlineDriversLocation,"online")
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
                {onlineDriversLocation.map((b, i) => {
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

                  console.log(x,"xx")
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
                        title="pickup location"
                        pinColor="blue">
                        <Image
                          source={require('../../Assets/Images/mapCar.png')}
                          style={{width: 40, height: 40}}
                          resizeMode="contain"
                        />
                      </Marker>
                    );
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
                    origin={pickupCords}
                    destination={dropLocationCords}
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
                    value={fare}
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
                        Recommended Fare:
                        <Text style={styles.valueStyle}>{fare}$ </Text>
                        Distance:
                        <Text style={styles.valueStyle}>{distance} miles </Text>
                        <Text>
                          Minutes:
                          <Text style={styles.valueStyle}>{minutes} min</Text>
                        </Text>
                      </Text>
                    </View>
                  ) : null}

                  <TextInput
                    placeholder="Additional Details"
                    placeholderTextColor={Colors.gray}
                    value={additionalDetails}
                    onChangeText={setAdditionalDetails}
                    selectionColor={Colors.black}
                    activeUnderlineColor={Colors.gray}
                    style={styles.textInputStyle}
                    // left={<TextInput.Icon name="email" color={emailError ? 'red' : Colors.fontColor} />}
                  />

                  {/* </ScrollView> */}
                  <View style={styles.btnContainer}>
                    <CustomButton
                      text="Find Rider"
                      onPress={checkValidation}
                      // onPress={() => navigation.navigate('PassengerFindRide')}
                    />
                  </View>
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
