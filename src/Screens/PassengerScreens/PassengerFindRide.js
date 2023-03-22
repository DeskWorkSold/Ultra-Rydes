import React, {useLayoutEffect, useEffect, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  ToastAndroid,
  Settings,
} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import Colors from '../../Constants/Colors';
import firestore from '@react-native-firebase/firestore';
import {getPreciseDistance} from 'geolib';
import MapViewDirections from 'react-native-maps-directions';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import Icon from 'react-native-vector-icons/AntDesign';
import { BackHandler } from 'react-native';


export default function PassengerFindRide({navigation, route}) {
  const passengerData = route.params;
  const [driverData, setDriverData] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [request, setRequest] = useState(false);
  const [minutes, setMinutes] = useState([]);
  const [distance, setDistance] = useState([]);
  const [inlineDriver, setInlineDriver] = useState([]);
  const [driverNotAvailable, setDriverNotAvailable] = useState([]);

  const checkAvailableDriverStatus = () => {
    if (passengerData && passengerData.bidFare) {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .onSnapshot(querySnapshot => {
          let data = querySnapshot.data();
          
          if (
            data &&
            data.bidFare &&
            data.myDriversData &&
            !Array.isArray(data.myDriversData)
          ) {
            setDriverData([data.myDriversData]);
          } else if (
            data &&
            data.myDriversData &&
            Array.isArray(data.myDriversData)
          ) {
            setDriverData(
              data.myDriversData.filter((e, i) => {
                return e.requestStatus !== 'rejected';
              }),
            );
          }
        });
    }
  };

  useEffect(() => {
    if (passengerData.id && passengerData.bidFare) {
      setRequest(true);
    }
    checkAvailableDriverStatus();
  }, []);

  useEffect(() => {
    if (passengerData && !passengerData.bidFare && !request) {
      let interval = setInterval(() => {
        getDriverData();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setDriverData([]);
      setRequest(true);
    }
  }, []);


  useEffect(() => {
    if (request) {
      const backAction = () => {
        Alert.alert('Hold on!', 'Wait for the driver respond', [
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
  }, [request]);


  const checkRequestStatus = () => {
    if (request && !passengerData.bidFare && selectedDriver && !passengerData?.rideCancelByPassenger) {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .get().then(querySnapshot => {
          let data = querySnapshot.data();
          if (
            data &&
            Object.keys(data).length > 0 &&
            data.driverData &&
            !data.bidFare &&
            request
          ) {
            if (data.requestStatus == 'accepted') {
              setRequest(false);
              ToastAndroid.show(
                'Your request has been accepted',
                ToastAndroid.SHORT,
              );
              navigation.navigate('PassengerRoutes', {
                screen: 'PassengerHomeScreen',
                params: {
                  passengerData: passengerData,
                  driverData : selectedDriver,
                },
              });
            } else if (
              data &&
              data.requestStatus == 'rejected' &&
              !data.bidFare
            ) {
              setTimeout(() => {
                setDriverData(
                  driverData.filter((e, i) => {
                    return e.id !== selectedDriver.id;
                  }),
                );
                setRequest(false);
                Alert.alert(
                  'MESSAGE',
                  'Your request has been rejected by driver',
                );
              }, 1000);
              setSelectedDriver([]);
            }
          }
        });
    }
  };

  const getInlineDriver = () => {
    firestore()
      .collection('inlinedDriver')
      .onSnapshot(querySnapshot => {
        let inlineDriver = [];
        querySnapshot.forEach(documentSnapshot => {
          let data = documentSnapshot.data();
          if (data && Object.keys(data).length > 0 && data.inlined) {
            inlineDriver.push(data.id);
          }
        });
        setInlineDriver(inlineDriver);
      });
  };

  useEffect(() => {
    getInlineDriver();
  }, []);

  useEffect(() => {
    if (request) {
      const interval = setInterval(() => {
        checkRequestStatus();
        checkAvailableDriverStatus();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [request,selectedDriver]);

  const getDriverData = async () => {
    /// GET ALL DRIVERS
    const Driver = await firestore()
      .collection('Drivers')
      .onSnapshot(querySnapshot => {
        // console.log('Total users: ', querySnapshot.size);
        let myDriversTemp = [];
        querySnapshot.forEach(documentSnapshot => {
          // console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
          const myDriverData = documentSnapshot.data();

          let driverRequestedButNotRespond =
            driverNotAvailable &&
            driverNotAvailable.length > 0 &&
            driverNotAvailable.some((e, i) => {
              return e == myDriverData.id;
            });
              console.log(driverRequestedButNotRespond,myDriverData.id,"idddddd")
              console.log(driverNotAvailable,"notAvailable")
          
            let selectedVehicleName = passengerData.selectedCar.map((e, i) => {
              return e.carName;
            });

            let selectedCar = selectedVehicleName[0];
            let flag = '';
            if (myDriverData && myDriverData.vehicleDetails) {
              flag = selectedCar == myDriverData.vehicleDetails.vehicleCategory;
            }
            let mileDistance = '';
            if (
              myDriverData &&
              myDriverData.currentLocation &&
              myDriverData.status == 'online' &&
              flag
            ) {
              let dis = getPreciseDistance(
                {
                  latitude: passengerData.pickupCords.latitude,
                  longitude: passengerData.pickupCords.longitude,
                },
                {
                  latitude: myDriverData.currentLocation.latitude,
                  longitude: myDriverData.currentLocation.longitude,
                },
              );
              mileDistance = (dis / 1609.34).toFixed(2);
            }

            let isInlined =
              inlineDriver &&
              inlineDriver.filter((e, i) => {
                console.log(e, 'eeee');
                if (e == myDriverData.id) {
                  return 'true';
                }
              });

            isInlined = isInlined[0];
            if (!driverRequestedButNotRespond) {
            if (
              myDriverData.status == 'online' &&
              mileDistance <= 3 &&
              flag &&
              !isInlined && !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriversTemp.length < 5 &&
              myDriverData.status == 'online' &&
              mileDistance > 3 &&
              mileDistance < 5 &&
              flag &&
              !isInlined && !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriversTemp.length < 5 &&
              myDriverData.status == 'online' &&
              mileDistance < 10 &&
              mileDistance > 5 &&
              flag &&
              !isInlined && !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriversTemp.length < 5 &&
              myDriverData.status == 'online' &&
              mileDistance < 15 &&
              mileDistance > 10 &&
              flag &&
              !isInlined && !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriversTemp.length < 5 &&
              myDriverData.status == 'online' &&
              mileDistance < 20 &&
              mileDistance > 15 &&
              flag &&
              !isInlined && !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriversTemp.length < 5 &&
              myDriverData.status == 'online' &&
              mileDistance < 25 &&
              mileDistance > 20 &&
              !isInlined && !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            }
          }
        });
        setDriverData(myDriversTemp);
      });
  };

const deleteBookingData = () => {
  firestore().collection("Request").doc(passengerData.id).delete().then(()=>{
    navigation.navigate('AskScreen');
  }).catch((error)=>{
    console.log(error,"error")
  })
}

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {

        
        return (
          <TouchableOpacity
            style={styles.cancelTextContainer}
            onPress={() => {
              deleteBookingData()
              
            }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        );
      },
    });
  }, []);
  const AccecptOffer = acceptDriver => {
    if (passengerData && passengerData.bidFare && acceptDriver.bidFare) {
      if (
        driverData &&
        !Array.isArray(driverData) &&
        Object.keys(driverData).length > 0
      ) {
        acceptDriver.selected = true;
        acceptDriver.requestStatus = 'accepted';

        firestore()
          .collection('Request')
          .doc(passengerData.id)
          .update({
            myDriversData: acceptDriver,
            requestStatus: 'accepted',
          })
          .then(() => {
            navigation
              .navigate('PassengerHomeScreen', {
                passengerData: passengerData,
                driverData: acceptDriver,
              })
              .catch(error => {
                console.log(error, 'error');
              });
          });
      } else {
        console.log('HELLO2');
        mySelectedDriver =
          driverData &&
          driverData.map((e, i) => {
            if (e.id == acceptDriver.id) {
              return {
                ...e,
                selected: (e.selected = true),
                requestStatus: 'accepted',
              };
            } else {
              return {
                ...e,
                selected: (e.selected = false),
                requestStatus: 'rejected',
              };
            }
          });

        let selectedDriverData = mySelectedDriver.filter((e, i) => e.selected);

        console.log(selectedDriverData, 'selected');

        firestore()
          .collection('Request')
          .doc(passengerData.id)
          .update({
            myDriversData: mySelectedDriver,
            requestStatus: 'accepted',
          })
          .then(res => {
            navigation.navigate('PassengerHomeScreen', {
              passengerData: passengerData,
              driverData: acceptDriver,
            });
          })
          .catch(error => {
            console.log(error, 'error');
          });
      }
    }

    if (passengerData && !passengerData.bidFare) {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .set({
          passengerData: passengerData,
          driverData: acceptDriver,
        })
        .then(() => {
          setRequest(true);
          setSelectedDriver(acceptDriver);
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  useEffect(()=>{
    if(!passengerData.bidFare){
    getDriverData()
  }
  },[driverNotAvailable])

  useEffect(() => {
    if (request && !passengerData.bidFare) {
      const interval = setInterval(() => {
        
          setDriverNotAvailable([...driverNotAvailable, selectedDriver.id]);
          
          setRequest(false);
          ToastAndroid.show(
            'This driver is not available right now',
            ToastAndroid.SHORT,
          );
        
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [request,selectedDriver]);

  const rejectOffer = rejectedDriver => {
    if (rejectedDriver && !passengerData.bidFare) {
      setDriverData(
        driverData.filter((e, i) => {
          return e.cnic !== rejectedDriver.cnic;
        }),
      );
    } else if (rejectedDriver && passengerData.bidFare) {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .onSnapshot(querySnapshot => {
            if(querySnapshot.exists){
          let data = querySnapshot.data();
          
          if (
            data &&
            data.myDriversData &&
            !Array.isArray(data.myDriversData)
          ) {
            data.myDriversData.selected = false;
            data.myDriversData.requestStatus = 'rejected';

            firestore()
              .collection('Request')
              .doc(passengerData.id)
              .update({
                myDriversData: data.myDriversData,
              })
              .then(() => {
                setDriverData(
                  driverData.filter((e, i) => {
                    return e.id !== rejectedDriver.id;
                  }),
                );
              })
              .catch(error => {
                console.log(error);
              });
          } else if (
            data &&
            data.myDriversData &&
            Array.isArray(data.myDriversData)
          ) {
            myDriverData = data.myDriversData.map((e, i) => {
              if (e.id == rejectedDriver.id) {
                return {
                  ...e,
                  selected: false,
                  requestStatus: (e.requestStatus = 'rejected'),
                };
              } else {
                return e;
              }
            });
            firestore()
              .collection('Request')
              .doc(passengerData.id)
              .update({
                myDriversData: myDriverData,
              })
              .then(() => {
                setRequest(true);
                setDriverData(
                  driverData.filter((e, i) => {
                    return e.id !== rejectedDriver.id;
                  }),
                );
              })
              .catch(error => {
                console.log(error);
              });
          }
        }
        });
    }
  };

  const calculateMinutes = (result, item) => {
    console.log(result, 'result');

    let duration = Math.ceil(result.duration);
    setMinutes([...minutes, duration]);
    item.minutes = Math.ceil(result.duration);

    let myDistance = result.distance;
    myDistance = Math.ceil(myDistance * 0.621371);
    setDistance([...distance, myDistance]);
    item.distance = myDistance;
  };

  const rideRequests = ({item, index}) => {
    let data = route.params;
    
    if (data.bidFare) {
      data.selectedCar[0].carMiles.map((e, i) => {
        if (data.distance >= e.rangeMin && data.distance <= e.rangeMax) {
          let serviceCharges = e.serviceCharge;
          let creditCardFee = (Number(data.fare) * 5) / 100;
          let totalCharges = serviceCharges + creditCardFee;
          item.bidFare = (Number(data.bidFare) +  Number(totalCharges)).toFixed(2);
          console.log(totalCharges, 'total');
          console.log(item.bidFare,"bidFare")
        }
      });
    }
    let distanceMinutes =
      minutes &&
      minutes.length > 0 &&
      minutes.map((e, i) => {
        if (index == i) {
          return e;
        }
      });

    let distanceDifference =
      distance &&
      distance.length > 0 &&
      distance.map((e, i) => {
        if (i == index) {
          return e;
        }
      });

      let flag = driverNotAvailable.some((e,i)=> e == item.id)

    return (
     !flag && <View style={styles.card}>
        <MapViewDirections
          origin={item.currentLocation}
          destination={passengerData.pickupCords}
          apikey={GoogleMapKey.GOOGLE_MAP_KEY}
          onReady={result => {
            calculateMinutes(result, item);
          }}
        />
        <View style={styles.innerItemsUpper}>
          <View style={styles.imgContainer}>
            <Image
              source={{uri: item.profilePicture}}
              resizeMode="cover"
              style={styles.proPic}
            />
            <View>
              <Text style={styles.vehText}>
                {item.vehicleDetails.vehicleName}
              </Text>
              <Text style={styles.driverNameText}>
                {item.firstName + item.lastName}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <Text style={[styles.driverNameText, {fontWeight: '800'}]}>
                  {item.rating}
                </Text>
                <Icon name="star" size={20} color="yellow" />
              </View>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.priceText}>{item.bidFare ? Number(item.bidFare) : item.fare}$</Text>
              <Text style={{color: 'black', fontSize: 14, fontWeight: '600'}}>
                {item.minutes ?? distanceMinutes} minutes away
              </Text>
              <Text style={{color: 'black', fontSize: 14, fontWeight: '600'}}>
                {item.distance ?? distanceDifference} miles away
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.btnContainer}>
          <CustomButton
            text="Reject"
            styleContainer={styles.btn}
            btnTextStyle={styles.btnTextStyle}
            bgColor
            onPress={() => rejectOffer(item)}
          />
          <CustomButton
            text="Accept"
            styleContainer={styles.btn}
            btnTextStyle={styles.btnTextStyle}
            onPress={() => AccecptOffer(item)}
          />
        </View>
      </View>
    );
  };

  console.log(driverData);

  return (
    <View>
      {(driverData && driverData.length > 0 && passengerData.bidFare) ||
      !request ? (
        <View>
          <FlatList
            data={driverData}
            renderItem={rideRequests}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => `key-${item.cnic}`}
          />
        </View>
      ) : (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '90%',
          }}>
          <ActivityIndicator color="black" size={100} />
          <Text style={{color: 'black', marginTop: 10}}>
            {' '}
            Finding Driver Please wait!{' '}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '45%',
  },
  btnTextStyle: {
    fontSize: 15,
    textAlign: 'center',
    margin: 5,
    color: '#ffffff',
    backgroundColor: 'transparent',
    fontFamily: 'Poppins-Medium',
  },
  btnContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    padding: 10,
  },
  container: {
    flex: 1,
  },
  cancelTextContainer: {
    marginRight: 5,
  },
  cancelText: {
    color: Colors.red,
    marginRight: 5,
  },
  card: {
    width: '95%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    margin: 5,
    // borderWidth: 1,
    padding: 5,
    borderRadius: 20,
    elevation: 5,
  },
  driverNameText: {
    fontSize: 15,
    color: Colors.black,
  },
  innerItemsUpper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imgContainer: {
    flexDirection: 'row',
  },
  proPic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'red',
    margin: 5,
  },
  priceContainer: {
    marginRight: 5,
  },
  priceText: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  vehText: {
    fontSize: 18,
    color: Colors.black,
    fontFamily: 'Poppins-Medium',
  },
});
