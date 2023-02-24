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

  const getRequestFromPassengers = () => {
    let requestData = [];

    if (driverData && driverData.status == 'offline') {
      setLoading(true);
    }

    if (driverStatus == 'online' && driverData.currentLocation)
      firestore()
        .collection('Request')
        .onSnapshot(querySnapshot => {
          querySnapshot.forEach(documentSnapshot => {
            let data = documentSnapshot.data();

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
            if (data && !data.requestStatus) {
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

              let flag = '';
              if (
                data &&
                !data.passengerData &&
                data.selectedCar &&
                driverData &&
                driverData.vehicleDetails
              ) {
                let selectedVehicle = data.selectedCar.map((e, i) => e.carName);

                flag =
                  selectedVehicle == driverData.vehicleDetails.vehicleCategory;
              }

              if (
                data &&
                data.passengerData &&
                driverData.cnic == data.driverData.cnic &&
                !data.requestStatus
              ) {
                requestData.push(data);
              } else {
                if (
                  data &&
                  data.bidFare &&
                  !data.requestStatus &&
                  mileDistance < 25 &&
                  flag &&
                  !matchUid
                ) {
                  requestData.push(data);
                }

                requestData &&
                  requestData.length > 0 &&
                  setPassengerBookingData(requestData);
              }
            }
          });
        });
    setLoading(false);
  };

  useEffect(() => {
    getRequestFromPassengers();
  }, [driverStatus, driverData]);

  useEffect(() => {
    if (driverStatus == 'online') {
      getRequestFromPassengers();
    }
  }, []);

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
    getDriverData();
  }, [driverStatus]);

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
    return (
      <TouchableOpacity
        style={styles.listItemContainer}
        key={item.passengerData ? item.passengerData.id : item.id}
        onPress={() => {
          navigation.navigate('DriverBiddingScreen', {
            data: item,
            passengerState: {
              pickupCords: item.passengerData
                ? item.passengerData.pickupCords
                : item.pickupCords,
              dropLocationCords: item.passengerData
                ? item.passengerData.dropLocationCords
                : item.dropLocationCords,
            },
          });
        }}>
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
        <Text style={styles.itemTextStyle}>
          Fare:
          <Text style={styles.itemLocStyle}>
            {item.passengerData ? item.passengerData.fare : item.fare}$
          </Text>
        </Text>
        {item.bidFare && (
          <Text style={styles.itemTextStyle}>
            Bid Fare:<Text style={styles.itemLocStyle}>{item.bidFare}$</Text>
          </Text>
        )}
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
