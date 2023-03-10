import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import CustomHeader from '../Components/CustomHeader';
import Colors from '../Constants/Colors';
import CustomButton from '../Components/CustomButton';
import firestore from '@react-native-firebase/firestore';
import auth, {firebase} from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Modal} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

export default function AskScreen({navigation}) {
  const [loading, setLoading] = useState();
  const {height} = useWindowDimensions();
  const [warningData, setWarningData] = useState([]);

  const getDriverBookingData = async () => {
    try {
      let data = await AsyncStorage.getItem('driverBooking');
      let checkDriverArrive = await AsyncStorage.getItem(
        'ArrivedAtpickUpLocation',
      );
      let startRide = await AsyncStorage.getItem('startRide');
      let endRide = await AsyncStorage.getItem('EndRide');

      data = JSON.parse(data);
      if (data && Object.keys(data).length > 0) {
        navigation.navigate('DriverRoutes', {
          screen: 'DriverBiddingScreen',
          params: {
            data: data,
            passengerState: {
              pickupCords: data.passengerData
                ? data.passengerData.pickupCords
                : data.pickupCords,
              dropLocationCords: data.passengerData
                ? data.passengerData.dropLocationCords
                : data.dropLocationCords,
            },
            selectedDriver: data.myDriversData
              ? data.myDriversData
              : data.driverData,

            driverArrive: checkDriverArrive ? true : false,
            startRide: startRide ? true : false,
            endRide: endRide ? true : false,
          },
        });
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  useEffect(() => {
    const uid = auth().currentUser.uid;
    firestore()
      .collection('warning')
      .doc(uid)
      .onSnapshot(querySnapshot => {
        console.log(querySnapshot, 'query');
        let data = querySnapshot.data();
        if (data) {
          data = data.warningToDriver;
        }
        data =
          data &&
          data.length > 0 &&
          data.filter((e, i) => {
            return !e.acknowledged;
          });

        if (data && data.length > 0) {
          setWarningData(data);
        }
      });
  }, []);

  const hideModal = () => {
    let uid = auth().currentUser.uid;

    firestore()
      .collection('warning')
      .doc(uid)
      .get()
      .then(doc => {
        console.log(doc, 'doc');
        if (doc.exists) {
          let data = doc.data().warningToDriver;
          console.log(data, 'dataaaaa');
          if (data && data.length > 0) {
            data = data.filter((e, i) => {
              return e.acknowledged;
            });

            let myData = warningData[0];
            myData.acknowledged = true;

            let mergeData = [...data, myData];

            console.log(mergeData, 'dataaa ');

            firestore()
              .collection('warning')
              .doc(uid)
              .set({warningToDriver: mergeData})
              .then(() => {
                setWarningData([]);
                ToastAndroid.show(
                  'You have successfully acknowledge this warning',
                  ToastAndroid.SHORT,
                );
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
  };

  let warningModal = useCallback(() => {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={warningData && warningData.length > 0}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, {height: '60%'}]}>
              <View>
                <Icon size={80} color="white" name="warning" />
              </View>
              <Text
                style={[styles.modalText, {fontSize: 24, fontWeight: '900'}]}>
                Warning!
              </Text>
              <Text
                style={[styles.modalText, {fontSize: 16, fontWeight: '900'}]}>
                Your car has been recently given the lowest rating either your
                car is dirty or it has got some mechanical issues you are
                directed to fix it before taking another ride..
              </Text>
              <TouchableOpacity
                style={[
                  styles.button,
                  {marginBottom: 10, backgroundColor: Colors.primary},
                ]}
                onPress={() => hideModal()}>
                <Text
                  style={[
                    styles.textStyle1,
                    {backgroundColor: Colors.primary},
                  ]}>
                  confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [warningData]);

  const getPassengerBookingData = async () => {
    try {
      let data = await AsyncStorage.getItem('passengerBooking');
      data = JSON.parse(data);
      console.log(data, 'datasss');
      let checkDriverArrive = await AsyncStorage.getItem('driverArrive');

      if (data && Object.keys(data).length > 0) {
        navigation.navigate('PassengerRoutes', {
          screen: 'PassengerHomeScreen',
          params: {
            passengerData: data.passengerData ? data.passengerData : data,
            driverData: data.driverData ? data.driverData : data.myDriversData,
            driverArriveAtPickupLocation: checkDriverArrive ? true : false,
          },
        });
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  useEffect(() => {
    getDriverBookingData();
    getPassengerBookingData();
  }, []);

  const passengerModeHandler = async () => {
    try {
      const CurrentUser = auth().currentUser;
      const checkData = firestore()
        .collection('Passengers')
        .doc(CurrentUser.uid)
        .onSnapshot(documentSnapshot => {
          const checkEmpty = documentSnapshot.data();
          if (checkEmpty == null) {
            setLoading(false);
            navigation.navigate('PassengerDetailScreen', {
              uid: CurrentUser.uid,
            });
          } else {
            setLoading(false);
            navigation.navigate('PassengerRoutes', {
              screen: 'PassengerHomeScreen',
            });
          }
        });
    } catch (err) {
      console.log(err);
    }
  };
  const driverModeHandler = () => {
    try {
      const CurrentUser = auth().currentUser;
      const checkData = firestore()
        .collection('Drivers')
        .doc(CurrentUser.uid)
        .onSnapshot(documentSnapshot => {
          const checkEmpty = documentSnapshot.data();
          if (checkEmpty == null) {
            setLoading(false);
            navigation.navigate('DriverDetailScreen', {uid: CurrentUser.uid});
          } else if (!checkEmpty.vehicleDetails) {
            setLoading(false);
            navigation.navigate('DriverRoutes', {screen: 'DriverVehicleAdd'});
          } else {
            setLoading(false);
            navigation.navigate('DriverRoutes', {screen: 'DriverHomeScreen'});
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        iconname={navigation.canGoBack() ? 'chevron-back-circle' : null}
        color={Colors.fontColor}
        onPress={() => {
          navigation.canGoBack() ? navigation.goBack() : null;
        }}
        source={require('../Assets/Images/URWhiteLogo.png')}
      />
      <View style={styles.topContainer}>
        <Text style={[styles.textStyle]}>Are You a Driver or a Passenger</Text>
      </View>
      <View style={styles.midContainer}>
        <Image
          style={[styles.img, {height: height * 0.2}]}
          resizeMode="contain"
          source={require('../Assets/Images/askImg.png')}
        />
      </View>
      <View style={styles.bottomContainer}>
        <Text style={styles.textStyle}>Who are You</Text>
        <CustomButton text="Driver" onPress={driverModeHandler} />
        <View style={{marginVertical: 10}}></View>
        <CustomButton text="Passenger" onPress={passengerModeHandler} bgColor />
      </View>
      {warningData && warningData.length > 0 && warningModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  img: {
    width: '100%',
  },
  midContainer: {
    flex: 1,
    alignItems: 'center',
  },
  topContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    fontSize: 20,
    margin: 10,
    color: Colors.fontColor,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    maxWidth: '50%',
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

  textStyle1: {
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
