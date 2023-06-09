import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import CustomHeader from '../Components/CustomHeader';
import Colors from '../Constants/Colors';
import storage from '@react-native-firebase/storage';
import Icon from 'react-native-vector-icons/AntDesign';
import MapView, { Marker } from 'react-native-maps';
import GoogleMapKey from '../Constants/GoogleMapKey';
import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

function DriverHistorySingleDataScreen({ navigation, route }) {
  const [driverProfilePicUrl, setDriverProfilePicUrl] = useState('');
  const [passengerProfilePicUrl, setPassengerProfilePicUrl] = useState('');
  const [loader, setLoader] = useState(false);

  const ref = useRef();
  const mapRef = useRef();
  let data = route?.params?.item;



  let profilePic = data?.driverData?.profilePicture;
  let passengerprofilePic =
    data?.passengerData?.passengerPersonalDetails?.profilePicture;

  let { fare } = route.params;

  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;
  const LATITUDE_DELTA = 0.1;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const getDriverProfilePic = async () => {
    if (profilePic?.length) {
      const url = await storage().ref(profilePic).getDownloadURL();
      setDriverProfilePicUrl(url);
      setLoader(false)
    }
  };

  const getPassengerProfilePic = async () => {
    if (passengerprofilePic) {
      const url = await storage().ref(passengerprofilePic).getDownloadURL();
      setPassengerProfilePicUrl(url);
    }
  };

  useEffect(() => {
    driverProfilePicUrl && setLoader(false);
  }, [driverProfilePicUrl]);

  useEffect(() => {
    if (profilePic) {
      setLoader(true);
      getDriverProfilePic();
    }
    if (passengerprofilePic) {
      getPassengerProfilePic();
    }
  }, [profilePic, passengerprofilePic]);

  return loader ? (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size={200} color={Colors.secondary} />
    </View>
  ) : (
    data &&
    data.passengerData &&
    driverProfilePicUrl &&
    LATITUDE_DELTA &&
    LONGITUDE_DELTA && (
      <View style={{ flex: 1 }} >
        <ScrollView>

          <View style={styles.headerContainer}>
            <CustomHeader
              iconname={'chevron-back-outline'}
              color={Colors.white}
              onPress={() => {
                navigation.goBack();
              }}
              source={require('../Assets/Images/URWhiteLogo.png')}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              borderWidth: 3,
              borderColor: Colors.primary,
              margin: 20,
              borderRadius: 10,
              alignItems: 'center',
            }}>
            {loader ? (
              <ActivityIndicator size={'large'} color={Colors.secondary} />
            ) : (
              <Image
                source={{ uri: driverProfilePicUrl }}
                style={{ height: 60, width: 60 }}
              />
            )}
            <View style={{ marginLeft: 10 }}>
              <View
                style={{
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text style={styles.text}>
                  {data?.driverData?.firstName.toUpperCase()}
                  {data?.driverData?.lastName.toUpperCase()}
                </Text>
                <View
                  style={{
                    marginLeft: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text style={[styles.text, { fontSize: 20 }]}>
                    {data?.driverData?.rating}
                  </Text>
                  <Icon name={'star'} size={20} color="yellow" />
                </View>
              </View>
              <Text style={styles.text}>
                {data?.driverData?.vehicleDetails?.vehicleCategory}
                {data?.driverData?.vehicleDetails?.vehicleName}
              </Text>
              <Text style={styles.text}>
                {data?.driverData?.vehicleDetails?.vehicleNumPlate}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              borderWidth: 3,
              borderColor: Colors.primary,
              margin: 20,
              marginTop: 0,
              borderRadius: 10,
              alignItems: 'center',
            }}>
            {loader ? (
              <ActivityIndicator size={'large'} color={Colors.secondary} />
            ) : (
              <Image
                source={{ uri: passengerProfilePicUrl }}
                style={{ height: 60, width: 60 }}
              />
            )}
            <View style={{ marginLeft: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text style={styles.text}>
                  {data.passengerData.passengerPersonalDetails.firstName.toUpperCase()}
                  {data.passengerData.passengerPersonalDetails.lastName.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.text}>
                {data?.passengerData?.passengerPersonalDetails?.Email}
              </Text>
            </View>
          </View>
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 0,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: Colors.primary,
              height: '58%',
            }}>
            {data && data.passengerData && (
              <MapView
                ref={mapRef}
                style={{ width: '100%', height: 200 }}
                initialRegion={{
                  latitude: data.passengerData.pickupCords.latitude,
                  longitude: data.passengerData.pickupCords.longitude,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                }}
                apikey={GoogleMapKey.GOOGLE_MAP_KEY}>
                <Marker
                  coordinate={{
                    latitude: data.passengerData.pickupCords.latitude,
                    longitude: data.passengerData.pickupCords.longitude,
                  }}
                  title="pickupLocation"
                />
                <Marker
                  coordinate={{
                    latitude: data.passengerData.dropLocationCords.latitude,
                    longitude: data.passengerData.dropLocationCords.longitude,
                  }}
                  title={'drop Location'}
                />
              </MapView>
            )}
            <View
              style={{
                padding: 10,
                paddingRight: 0,
                backgroundColor: Colors.primary,
                justifyContent: 'center',
              }}>
              <View style={{ flexDirection: 'row' }}>
                <Icon name="calendar" size={20} color="black" />
                <Text style={[styles.text, { marginLeft: 10 }]}>
                  {data?.date && data?.date?.toDate().toString().slice(0, 15)}
                </Text>
                <Text
                  style={[
                    styles.text,
                    { marginLeft: 10, color: Colors.secondary },
                  ]}>
                  {`${data?.date?.toDate().getHours()}:${data?.date
                    .toDate()
                    .getMinutes()}`}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 3 }}>
                                <Text style={[styles.text, { fontSize: 16 }]}>
                                    Booking Id:
                                    <Text style={{ color: Colors.black, fontSize: 14 }}>

                                        {data?.bookingId}
                                    </Text>
                              </Text>
                            </View>
              <View style={{ flexDirection: 'row', marginTop: 3 }}>
                <Text style={[styles.text, { fontSize: 16 }]}>
                  pickup:
                  <Text style={{ color: Colors.secondary, fontSize: 14 }}>

                    {data?.passengerData?.pickupAddress}
                  </Text>
                </Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 3 }}>
                <Text style={[styles.text, { fontSize: 16 }]}>
                  Dropoff:
                  <Text style={{ color: Colors.secondary, fontSize: 14 }}>
                    {data?.passengerData?.dropOffAddress}
                  </Text>
                </Text>
              </View>
              {/* 
              <View style={{flexDirection: 'row', marginTop: 3}}>
                {data?.payment && (
                  <Text style={[styles.text, {fontSize: 16}]}>
                    payment:
                    <Text style={{color: Colors.secondary, fontSize: 16}}>
                      ${data?.payment}
                    </Text>
                  </Text>
                )}
              </View> */}
              <View style={{ flexDirection: 'row', marginTop: 3 }}>
                <Text style={[styles.text, { fontSize: 16 }]}>
                  Fare:
                  <Text style={{ color: Colors.secondary, fontSize: 16 }}>
                    ${data?.passengerData?.bidFare ? data?.passengerData?.bidFare : data?.passengerData?.fare}
                  </Text>
                </Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 3 }} >
                <Text style={[styles.text, { fontSize: 16 }]}>
                  Tip:
                  <Text style={{ color: Colors.secondary, fontSize: 16 }}>
                    ${data?.tip ? Number(data?.tip).toFixed(2) : 0}
                  </Text>
                </Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 3 }} >
                <Text style={[styles.text, { fontSize: 16 }]}>
                  Toll:
                  <Text style={{ color: Colors.secondary, fontSize: 16 }}>
                    ${data?.toll && data?.toll !== "no toll" ? Number(data?.toll).toFixed(2) : 0}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  );
}

export default DriverHistorySingleDataScreen;

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 1,
    backgroundColor: Colors.fontColor,
  },
  text: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '500',
  },
});
