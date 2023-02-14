import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import SwitchSelector from 'react-native-switch-selector';
import {
  locationPermission,
  getCurrentLocation,
} from '../../Helper/HelperFunction';
import {TextInput, TouchableOpacity} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import {add} from 'react-native-reanimated';
import {getPreciseDistance} from 'geolib';
import EmailSignInScreen from '../EmailSignInScreen';

export default function DriverHomeScreen({navigation, route}) {
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

  //   useEffect(()=>{
  //         setPassengerState({
  //             ...passengerState,
  //             pickupCords:route.params,pickupCords,
  //             dropLocationCords:route.params.dropLocationCords
  //         })
  //   },[])

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
  //   const data = [
  //     {
  //       id: 0,
  //       pickUpCords: 'Steel town',
  //       destinationCords: 'Gulshan-e-hadeed',
  //       price: 100,
  //     },
  //     {
  //       id: 1,
  //       pickUpCords: 'Gulistan-e-johar',
  //       destinationCords: 'Defence ph3',
  //       price: 200,
  //     },
  //     {
  //       id: 2,
  //       pickUpCords: 'Gulistan-e-johar',
  //       destinationCords: 'Defence ph3',
  //       price: 500,
  //     },
  //     {
  //       id: 3,
  //       pickUpCords: 'Gulistan-e-johar',
  //       destinationCords: 'Defence ph3',
  //       price: 1000,
  //     },
  //     {
  //       id: 4,
  //       pickUpCords: 'Gulistan-e-johar',
  //       destinationCords: 'Defence ph3',
  //       price: 100,
  //     },
  //     {
  //       id: 5,
  //       pickUpCords: 'Gulistan-e-johar',
  //       destinationCords: 'Defence ph3',
  //       price: 101,
  //     },
  //     {
  //       id: 6,
  //       pickUpCords: 'Gulistan-e-johar',
  //       destinationCords: 'Defence ph3',
  //       price: 101,
  //     },
  //     {
  //       id: 7,
  //       pickUpCords: 'Gulistan-e-johar',
  //       destinationCords: 'Defence ph3',
  //       price: 101,
  //     },
  //     {
  //       id: 8,
  //       pickUpCords: 'Gulistan-e-johar',
  //       destinationCords: 'Defence ph3',
  //       price: 105,
  //     },
  //   ];
  const [watchState, setWatchState] = useState(null);

  var watchId;
  const getLocationUpdates = async () => {
    const hasLocationPermission = await locationPermission();

    console.log(hasLocationPermission, 'location');

    if (!hasLocationPermission) return;
    watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        console.log('My Function', latitude, longitude);
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
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 50,
        interval: 5000,
        fastestInterval: 2000,
      },
    );
  };

  const getBookingData = async () => {
    setLoading(true);

    const booking = await firestore()
      .collection('booking')
      .onSnapshot(querySnapshot => {
        // console.log('Total users: ', querySnapshot.size);

        let bookingData = [];

        querySnapshot.forEach(documentSnapshot => {
          // console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
          if (
            documentSnapshot.data() &&
            driverStatus === 'online' &&
            driverData.currentLocation
          ) {
        
            let flag =
              driverData.vehicleDetails.vehicleCategory &&
              documentSnapshot
                .data()
                .selectedCar.some(
                  (e, i) =>
                    e.carName == driverData.vehicleDetails.vehicleCategory,
                );

            let dis = getPreciseDistance(
              {
                latitude: documentSnapshot.data().pickupCords.latitude,
                longitude: documentSnapshot.data().pickupCords.longitude,
              },
              {
                latitude: driverData.currentLocation.latitude,
                longitude: driverData.currentLocation.longitude,
              },
            );
            if (
              flag &&
              driverStatus == 'online' &&
              dis < 10000 &&
              documentSnapshot.data().bookingStatus !== 'done'
            ) {
              bookingData.push(documentSnapshot.data());
            }
          }
        });

        setPassengerBookingData(bookingData);
        setLoading(false);
      });
  };

  

  const getDriverData = () => {
    const currentUserUid = auth().currentUser.uid;

    firestore()
      .collection('Drivers')
      .doc(currentUserUid)
      .onSnapshot(querySnapshot => {
        setDriverData(querySnapshot.data());
      });
  };

  useEffect(() => {
    !driverData && driverStatus == 'online' && getDriverData();
  }, [driverStatus]);

  useEffect(() => {
    driverData &&
      driverData.vehicleDetails &&
      driverStatus == 'online' &&
      getBookingData();
  }, [driverData]);

  const updateOnlineOnFirebase = () => {
    try {
      const CurrentUser = auth().currentUser;
      firestore().collection('Drivers').doc(CurrentUser.uid).update({
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
      // .then(() => {
      //     console.log('status',s);
      // });
    } catch (err) {
      console.log(err);
    }
  };

  const removeLocationUpdates = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      Geolocation.stopObserving();
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

  const rideList = ({item, index}) => {
    console.log(item, 'items');

    return (
      <TouchableOpacity
        style={styles.listItemContainer}
        key={item.id}
        onPress={() => {
          navigation.navigate('DriverBiddingScreen', {
            data: item,
            passengerState: {
              pickupCords: item.pickupCords,
              dropLocationCords: item.dropLocationCords,
            },
          });
        }}>
        <Text style={styles.itemTextStyle}>
          Pickup Cords:
          <Text style={styles.itemLocStyle}>{item.pickupAddress}</Text>
        </Text>
        <Text style={styles.itemTextStyle}>
          Destination Cords:
          <Text style={styles.itemLocStyle}>{item.dropOffAddress}</Text>
        </Text>
        <Text style={styles.itemTextStyle}>
          Fare:<Text style={styles.itemLocStyle}>{item.fare}$</Text>
        </Text>
        {/* <View style={{flexDirection:row}} >
        <Text style={styles.itemTextStyle} >Edit Fare</Text>
        <TextInput/>
        </View> */}
      </TouchableOpacity>
    );
  };
  return (
    <>
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
          {driverStatus == 'online' ? (
            <View style={styles.listContainer}>
              <FlatList
                data={passengerBookingData}
                renderItem={rideList}
                keyExtractor={item => item.id}
              />
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
