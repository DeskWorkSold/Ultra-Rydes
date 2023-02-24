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

export default function PassengerFindRide({navigation, route}) {
  const passengerData = route.params;

  const [driverData, setDriverData] = useState([]);
  const [availableDriver, setAvailableDriver] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [request, setRequest] = useState(false);
  const [minutes, setMinutes] = useState([]);

  // const [data, setData] = useState([
  //   {
  //     id: '1',
  //     src: require('../../Assets/Images/dummyPic.png'),
  //     vehicleName: 'Civic',
  //     price: 900,
  //     driverName: 'Sameed',
  //   },
  //   {
  //     id: '2',
  //     src: require('../../Assets/Images/dummyPic.png'),
  //     vehicleName: 'Honda City',
  //     price: 800,
  //     driverName: 'Aziz',
  //   },
  //   {
  //     id: '3',
  //     src: require('../../Assets/Images/dummyPic.png'),
  //     vehicleName: 'Corolla',
  //     price: 700,
  //     driverName: 'Ali',
  //   },
  //   {
  //     id: '4',
  //     src: require('../../Assets/Images/dummyPic.png'),
  //     vehicleName: 'City',
  //     price: 600,
  //     driverName: 'Rayan',
  //   },
  //   {
  //     id: '5',
  //     src: require('../../Assets/Images/dummyPic.png'),
  //     vehicleName: 'Liana',
  //     price: 750,
  //     driverName: 'Hassan',
  //   },
  //   {
  //     id: '6',
  //     src: require('../../Assets/Images/dummyPic.png'),
  //     vehicleName: 'Changan',
  //     price: 850,
  //     driverName: 'Hamza',
  //   },
  // ]);

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
            setDriverData(data.myDriversData);
          }
        });
    }
  };

  useEffect(() => {
    if (passengerData.id && passengerData.bidFare) {
      setRequest(true);

      // firestore()
      //   .collection('booking')
      //   .onSnapshot(querySnapshot => {
      //     let bookingData = [];
      //     querySnapshot.forEach(documentSnapshot => {
      //       let data = documentSnapshot.data();
      //       if (
      //         data &&
      //         data.bookingStatus !== 'done' &&
      //         data.id == passengerData.id
      //       ) {
      //         bookingData.push(data);
      //       }

      //       if (
      //         bookingData &&
      //         bookingData.length > 0 &&
      //         bookingData[0].driverDetail
      //       ) {
      //         setAvailableDriverId(bookingData[0].driverDetail);
      //       }
      //     });
      //   });
    }

    

    checkAvailableDriverStatus();
  }, []);



  useEffect(()=>{

    if (passengerData && !passengerData.bidFare) {
      getDriverData();
    }else{
      setDriverData([])
    }

  },[passengerData,passengerData.minutes,passengerData.selectedCar.carName])


  const checkRequestStatus = () => {
    if (request && !passengerData.bidFare) {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .onSnapshot(querySnapshot => {
          let data = querySnapshot.data();
          if (
            data &&
            Object.keys(data).length > 0 &&
            data.driverData &&
            !data.bidFare
          ) {
            if (data.requestStatus == 'accepted') {
              ToastAndroid.show(
                'Your request has been accepted',
                ToastAndroid.SHORT,
              );
              setTimeout(() => {
                navigation.navigate('PassengerHomeScreen', {
                  passengerData: passengerData,
                  driverData: selectedDriver,
                });
                setRequest(false);
              }, 1000);
            } else if (
              data &&
              data.requestStatus == 'rejected' &&
              !data.bidFare
            ) {
              setTimeout(() => {
                setDriverData(
                  driverData.filter((e, i) => {
                    return e.cnic !== selectedDriver.cnic;
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

  useEffect(() => {
    checkRequestStatus();
  }, []);

  const getDriverData = async () => {
    /// GET ALL DRIVERS
    const Driver = await firestore()
      .collection('Drivers')
      .onSnapshot(querySnapshot => {
        // console.log('Total users: ', querySnapshot.size);
        let myDriversTemp = [];
        querySnapshot.forEach(documentSnapshot => {
          // console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
          const driverData = documentSnapshot.data();

          let selectedVehicleName = passengerData.selectedCar.map((e, i) => {
            return e.carName;
          });

          let selectedCar = selectedVehicleName[0];
          let flag = '';
          if (driverData && driverData.vehicleDetails) {
            flag = selectedCar == driverData.vehicleDetails.vehicleCategory;
          }
          let mileDistance = '';
          if (
            driverData &&
            driverData.currentLocation &&
            driverData.status == 'online' &&
            flag
          ) {
            let dis = getPreciseDistance(
              {
                latitude: passengerData.pickupCords.latitude,
                longitude: passengerData.pickupCords.longitude,
              },
              {
                latitude: driverData.currentLocation.latitude,
                longitude: driverData.currentLocation.longitude,
              },
            );
            mileDistance = (dis / 1609.34).toFixed(2);
          }

          if (driverData.status == 'online' && mileDistance <= 3 && flag) {
            driverData.fare = passengerData.fare;
            myDriversTemp.push(driverData);
          } else if (
            myDriversTemp.length < 5 &&
            driverData.status == 'online' &&
            mileDistance > 3 &&
            mileDistance < 5 &&
            flag
          ) {
            driverData.fare = passengerData.fare;
            myDriversTemp.push(driverData);
          } else if (
            myDriversTemp.length < 5 &&
            driverData.status == 'online' &&
            mileDistance < 10 &&
            mileDistance > 5 &&
            flag
          ) {
            driverData.fare = passengerData.fare;
            myDriversTemp.push(driverData);
          } else if (
            myDriversTemp.length < 5 &&
            driverData.status == 'online' &&
            mileDistance < 15 &&
            mileDistance > 10 &&
            flag
          ) {
            driverData.fare = passengerData.fare;
            myDriversTemp.push(driverData);
          } else if (
            myDriversTemp.length < 5 &&
            driverData.status == 'online' &&
            mileDistance < 20 &&
            mileDistance > 15 &&
            flag
          ) {
            driverData.fare = passengerData.fare;
            myDriversTemp.push(driverData);
          } else if (
            myDriversTemp.length < 5 &&
            driverData.status == 'online' &&
            mileDistance < 25 &&
            mileDistance > 20
          ) {
            driverData.fare = passengerData.fare;
            myDriversTemp.push(driverData);
          }
        });
        setDriverData(myDriversTemp);
      });
  };


  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity
            style={styles.cancelTextContainer}
            onPress={() => {
              navigation.navigate('PassengerHomeScreen');
            }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        );
      },
    });
  }, []);

  const AccecptOffer = acceptDriver => {
    if (passengerData && passengerData.bidFare && acceptDriver.bidFare) {
      
      if (driverData && !Array.isArray(driverData) && Object.keys(driverData).length>0 ) {
        console.log("HELLO1")
        acceptDriver.selected = true;
        acceptDriver.requestStatus = "accepted"

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
        console.log("HELLO2")
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

        firestore()
          .collection('Request')
          .doc(passengerData.id)
          .update({
            
            myDriversData: mySelectedDriver,
            requestStatus: 'accepted',
          })
          .then(() => {
            navigation
              .navigate('PassengerHomeScreen', {
                passengerData: passengerData,
                driverData: selectedDriverData,
              })
              .catch(() => {
                console.log(error, 'error');
              });
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

  // useEffect(() => {

  //   if (request) {
  //     setTimeout(() => {
  //       setDriverData(
  //         driverData.filter((e, i) => {
  //           return e.cnic !== selectedDriver.cnic;
  //         }),
  //       );
  //       setRequest(false);

  //       Alert.alert('Error Alert', 'This Driver is not available Yet');
  //     }, 20000);
  //   }
  // }, [request]);

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
                    return e.cnic !== rejectedDriver.cnic;
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
                  requestStatus: e.requestStatus = 'rejected',
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
        });
    }
  };

  // const sendAcceptedDriverInFb = () => {
  //   firestore()
  //     .collection('booking')
  //     .doc(`${passengerData.id}booking${passengerData.bookingCount}`)
  //     .update({
  //       driverDetail: selectedDriver,
  //       bookingStatus: 'done',
  //       destination: 'start',
  //     })
  //     .then(() => {
  //       navigation.navigate('PassengerHomeScreen', {
  //         selectedDriver: selectedDriver,
  //         passenger: passengerData,
  //       });
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // };

  // useEffect(() => {
  //   if (
  //     selectedDriver &&
  //     Array.isArray(selectedDriver) &&
  //     selectedDriver.length > 0
  //   ) {
  //     sendAcceptedDriverInFb();
  //   } else if (
  //     selectedDriver &&
  //     !Array.isArray(selectedDriver) &&
  //     Object.keys(selectedDriver).length > 0
  //   ) {
  //     sendAcceptedDriverInFb();
  //   }
  // }, [selectedDriver]);

  const calculateMinutes = (result, item) => {
    let duration = Math.ceil(result.duration);
    setMinutes([...minutes, duration]);
    item.minutes = Math.ceil(result.duration);
  };

  const rideRequests = ({item, index}) => {
    let distanceMinutes =
      minutes &&
      minutes.length > 0 &&
      minutes.map((e, i) => {
        if (index == i) {
          return e;
        }
      });

    return (
      <View style={styles.card}>
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
            </View>
          </View>
          <View style={styles.priceContainer}>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.priceText}>{item.bidFare ?? item.fare}$</Text>
              <Text style={{color: 'black', fontSize: 14, fontWeight: '600'}}>
                {item.minutes ?? distanceMinutes} minutes away
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
