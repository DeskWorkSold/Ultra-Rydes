import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Dimensions,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import Colors from '../../Constants/Colors';
import CustomHeader from '../../Components/CustomHeader';
import AddressPickup from '../../Components/AddressPickup';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import CustomButton from '../../Components/CustomButton';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useEffect} from 'react';
import {useRef} from 'react';

function PredefinedPlaces({navigation, route}) {
  const initialData = {
    description: '',
    geometry: {location: {lat: null, lng: null}},
  };

  const [addPlaceData, setAddPlaceData] = React.useState(initialData);
  const [placeAddress, setPlaceAddress] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  let data = route.params;

  const placeRef = useRef();

  const getSelectedLocation = details => {
    let placeName = details.address_components[0].short_name;
    let lat = details.geometry.location.lat;
    let lng = details.geometry.location.lng;

    setPlaceAddress(placeName);

    let placeLocation = {
      latitude: lat,
      longitude: lng,
      description: placeName,
    };

    let geometry = {
      location: {
        lng: lng,
        lat: lat,
      },
    };

    setAddPlaceData({...addPlaceData, geometry: geometry});
  };

  const sendAddPlaceDataInFirebase = () => {
    setLoading(true);

    if (data && Object.keys(data).length > 0) {
      let id = auth().currentUser.uid;

      let firebaseDataToSend = {...addPlaceData};

      console.log(firebaseDataToSend, 'firebase');

      if (!firebaseDataToSend.description) {
        firebaseDataToSend.description = data.data.description;
      }

      firestore()
        .collection('AddPlaces')
        .doc(id)
        .get()
        .then(doc => {
          let myFirebaseData = doc?.data();
          if (myFirebaseData && Object.keys(myFirebaseData).length > 0) {
            myFirebaseData = myFirebaseData.places;
          }
          myFirebaseData =
            myFirebaseData &&
            myFirebaseData.length > 0 &&
            myFirebaseData.filter((e, i) => {
              return data.index !== i;
            });
          myFirebaseData = [...myFirebaseData, firebaseDataToSend];

          let dataToSend = {
            places: myFirebaseData,
          };
          firestore()
            .collection('AddPlaces')
            .doc(id)
            .set(dataToSend)
            .then(() => {
              ToastAndroid.show('Data Successfully Edit', ToastAndroid.SHORT);
              setLoading(false);
              navigation.goBack();
            })
            .catch(error => {
              setLoading(false);
              ToastAndroid.show('Internal Server Error', ToastAndroid.SHORT);
            });
        });
    } else {
      if (!addPlaceData.description) {
        ToastAndroid.show('Write Place Name', ToastAndroid.SHORT);
        return;
      }

      let {geometry} = addPlaceData;
      let {location} = geometry;

      if ((location && !location.lat) || !location.lng) {
        ToastAndroid.show('Choose Location to add', ToastAndroid.SHORT);
        return;
      }
      let id = auth().currentUser.uid;
      setLoading(true);
      firestore()
        .collection('AddPlaces')
        .doc(id)
        .set(
          {
            places: firestore.FieldValue.arrayUnion(addPlaceData),
          },
          {merge: true},
        )
        .then(res => {
          setLoading(false);
          ToastAndroid.show(
            'Your defined place has been successfully updated',
            ToastAndroid.SHORT,
          );
          setAddPlaceData(initialData);
          placeRef.current.clear();
        })
        .catch(error => {
          setLoading(false);
          console.log(error);
        });
    }
  };

  let {geometry} = addPlaceData;

  let {location} = geometry;

  navigator.geolocation = require('react-native-geolocation-service');

  return (
    <View style={{flex: 1, backgroundColor: Colors.white}}>
      <View style={styles.headerContainer}>
        <CustomHeader
          iconname={'arrow-back'}
          color={Colors.white}
          onPress={() => {
            navigation.goBack();
          }}
          source={require('../../Assets/Images/URWhiteLogo.png')}
        />
      </View>
      <Text style={[styles.Heading, {alignSelf: 'flex-start'}]}>
        ADD PLACES
      </Text>

      {data && Object.keys(data).length > 0 && (
        <View style={{padding: 20}}>
          <Text
            style={[
              styles.text,
              {color: Colors.black, textAlign: 'left', fontSize: 18},
            ]}
          >
            {data.data.description}
          </Text>
          <Text
            style={[
              styles.text,
              {color: Colors.black, textAlign: 'left', marginTop: 5},
            ]}
          >
            {data.data.address}
          </Text>
        </View>
      )}

      <GooglePlacesAutocomplete
        placeholder="Search"
        ref={placeRef}
        textInputProps={{
          placeholderTextColor: Colors.black,
        }}
        location={true}
        currentLocationLabel={`Your Location`}
        fetchDetails={true}
        styles={{
          container: styles.containerStyle,
          textInput: styles.textInputStyle,
          description: {color: 'black'},
        }}
        onPress={(data, details = null) => {
          getSelectedLocation(details);
        }}
        query={{
          key: GoogleMapKey.GOOGLE_MAP_KEY,
          language: 'en',
        }}
      />
      {location.lat && location.lng && (
        <View
          style={{
            justifyContent: 'center',
            height: Dimensions.get('window').height - 100,
          }}
        >
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginVertical: 20,
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: Colors.secondary,
              margin: 10,
              paddingVertical: 20,
              borderRadius: 10,
            }}
          >
            <View style={{width: '90%'}}>
              <TextInput
                placeholder={
                  data && Object.keys(data).length > 0
                    ? data.data.description
                    : 'Place Type'
                }
                placeholderTextColor={Colors.gray}
                onChangeText={e =>
                  setAddPlaceData({...addPlaceData, description: e})
                }
                style={{
                  borderColor: Colors.black,
                  borderBottomWidth: 1.2,
                  marginVertical: 5,
                  borderColor: Colors.black,
                  padding: 5,
                  fontSize: 14,
                  color: Colors.black,
                  backgroundColor: Colors.white,
                }}
              />
              <TextInput
                placeholder={placeAddress}
                placeholderTextColor={Colors.black}
                editable={false}
                style={{
                  borderColor: Colors.black,
                  borderBottomWidth: 1.2,
                  marginVertical: 5,
                  borderColor: Colors.black,
                  padding: 5,
                  fontSize: 14,
                  color: Colors.black,
                  backgroundColor: Colors.white,
                }}
              />

              <CustomButton
                text={
                  loading ? (
                    <ActivityIndicator
                      size={'large'}
                      color={Colors.secondary}
                    />
                  ) : (
                    'Add Place'
                  )
                }
                styleContainer={{marginTop: 80, width: '100%'}}
                onPress={() => sendAddPlaceDataInFirebase()}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 1,
    backgroundColor: Colors.fontColor,
  },
  Heading: {
    color: Colors.secondary,
    fontSize: 28,
    fontWeight: '900',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  text: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  textInputStyle: {
    width: '100%',
    padding: 5,
    color: Colors.black,
    fontSize: 14,
    borderColor: 'grey',
    borderBottomWidth: 1.2,
    marginVertical: 5,
    numberOfLines: 1,
  },
  containerStyle: {
    backgroundColor: 'white',
    zIndex: 1,
  },
});

export default PredefinedPlaces;
