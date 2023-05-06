import React, {useState, useRef, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import Colors from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import CustomButton from '../../Components/CustomButton';
import auth from '@react-native-firebase/auth';
import {getCurrentLocation} from '../../Helper/HelperFunction';
import Geocoder from 'react-native-geocoding';
import firestore from '@react-native-firebase/firestore';
import {ActivityIndicator} from 'react-native-paper';
import {useCallback} from 'react';
import {useRoute} from '@react-navigation/native';
import AddressPickup from '../../Components/AddressPickup';

export default function DriverOnTheWay({navigation}) {
  const route = useRoute();

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
  const [location, setLocation] = useState({
    pickupCords: state,
    dropLocationCords: {
      latitude: null,
      longitude: null,
    },
  });
  const {pickupCords, dropLocationCords} = location;

  console.log(location);

  const [myDriverData, setMyDriverData] = useState([]);
  const [minutesAndDistanceDifference, setMinutesAndDistanceDifference] =
    useState({
      minutes: '',
      distance: '',
      details: '',
    });
  const [driverCurrentLocation, setDriverCurrentLocation] = useState({});

  const getLocation = () => {
    getCurrentLocation().then(res => {
      setState({
        latitude: res.latitude,
        longitude: res.longitude,
        heading: res.heading,
      });
    });
  };

  useEffect(() => {
    let interval = setInterval(() => {
      getLocation();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // gettingFormattedAddress();
    getDriverUid();
    getDriverData();
  }, []);

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
  const gettingFormattedAddress = () => {
    Geocoder.init(GoogleMapKey.GOOGLE_MAP_KEY);
    Geocoder.from(
      passengerState?.pickupCords?.latitude,
      passengerState?.pickupCords?.longitude,
    )
      .then(json => {
        var addressPickup = json.results[0].formatted_address;
        setpickUpLocation(addressPickup);
      })
      .catch(error => console.warn(error));
    Geocoder.from(
      passengerState?.dropLocationCords?.latitude,
      passengerState?.dropLocationCords?.longitude,
    )
      .then(json => {
        var addressDropOff = json.results[0].formatted_address;
        setdropOffLocation(addressDropOff);
      })
      .catch(error => console.warn(error));
  };

  console.log(state);

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

  const getViewLocation = useCallback(() => {
    return (
      <MapViewDirections
        origin={state && Object.keys(state).length > 0 && state}
        destination={location.dropLocationCords}
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

  const mapRef = useRef();

  return loading ? (
    <View
      style={{alignItems: 'center', justifyContent: 'center', height: '90%'}}>
      <ActivityIndicator size={100} color="black" />
      <Text style={{color: 'black', marginTop: 20}}>
        Processing Your request Please Wait!
      </Text>
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
            {Object.keys(dropLocationCords).length > 0 && (
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
              location.dropLocationCords.latitude &&
              location.dropLocationCords.longitude && (
                <Marker
                  coordinate={{
                    latitude: location.dropLocationCords.latitude,
                    longitude: location.dropLocationCords.longitude,
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
                  <CustomButton text="Request" />
                </View>
              )}
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
