import React, {useLayoutEffect, useEffect, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import Colors from '../../Constants/Colors';
import firestore from '@react-native-firebase/firestore';

export default function PassengerFindRide({navigation, route}) {
  const passengerData = route.params;

  const [driverData, setDriverData] = useState([]);
  const [availableDriverId, setAvailableDriverId] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');

  const [data, setData] = useState([
    {
      id: '1',
      src: require('../../Assets/Images/dummyPic.png'),
      vehicleName: 'Civic',
      price: 900,
      driverName: 'Sameed',
    },
    {
      id: '2',
      src: require('../../Assets/Images/dummyPic.png'),
      vehicleName: 'Honda City',
      price: 800,
      driverName: 'Aziz',
    },
    {
      id: '3',
      src: require('../../Assets/Images/dummyPic.png'),
      vehicleName: 'Corolla',
      price: 700,
      driverName: 'Ali',
    },
    {
      id: '4',
      src: require('../../Assets/Images/dummyPic.png'),
      vehicleName: 'City',
      price: 600,
      driverName: 'Rayan',
    },
    {
      id: '5',
      src: require('../../Assets/Images/dummyPic.png'),
      vehicleName: 'Liana',
      price: 750,
      driverName: 'Hassan',
    },
    {
      id: '6',
      src: require('../../Assets/Images/dummyPic.png'),
      vehicleName: 'Changan',
      price: 850,
      driverName: 'Hamza',
    },
  ]);

  useEffect(() => {
    if (passengerData.id) {
      firestore()
        .collection('booking')
        .doc(passengerData.id)
        .onSnapshot(querySnapshot => {
          let data = querySnapshot.data();

          console.log(data, 'data');
          if (data && data.driverDetail) {
            setAvailableDriverId(data.driverDetail);
          }
        });
    }
  }, []);

  const getAvailableDriver = () => {
    if (
      availableDriverId &&
      availableDriverId.length > 0 &&
      Array.isArray(availableDriverId)
    ) {
      let myData = [];

      availableDriverId &&
        availableDriverId.length > 0 &&
        availableDriverId.map((e, i) => {
          firestore()
            .collection('Drivers')
            .doc(e.availableDriver)
            .onSnapshot(querySnapshot => {
              let data = querySnapshot.data();
              data.offerFare = e.offerFare;
              data.id = e.availableDriver;
              myData.push(data);
              setDriverData(myData);
            });
        });
    } else if (availableDriverId && !Array.isArray(availableDriverId)) {
      firestore()
        .collection('Drivers')
        .doc(availableDriverId.availableDriver)
        .onSnapshot(querySnapshot => {
          let data = querySnapshot.data();
          data.offerFare = availableDriverId.offerFare;
          data.id = availableDriverId.availableDriver;

          setDriverData([data]);
        });
    }
  };

  console.log(driverData, 'available');

  useEffect(() => {
    if (Array.isArray(availableDriverId)) {
      availableDriverId && availableDriverId.length > 0 && getAvailableDriver();
    } else {
      availableDriverId && getAvailableDriver();
    }
  }, [availableDriverId]);

  //   const getDriverData = async () => {
  //     /// GET ALL DRIVERS
  //     const Driver = await firestore()
  //       .collection('Drivers')
  //       .onSnapshot(querySnapshot => {
  //         // console.log('Total users: ', querySnapshot.size);
  //         let myDriversTemp = [];
  //         querySnapshot.forEach(documentSnapshot => {
  //           // console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
  //           const driverData = documentSnapshot.data();
  //           if (driverData.status == 'online') {
  //             myDriversTemp.push(driverData);
  //           }
  //         });
  //         setDriverData(myDriversTemp);
  //       });
  //   };

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
    firestore()
      .collection('booking')
      .doc(passengerData.id)
      .onSnapshot(querySnapshot => {
        let data = querySnapshot.data();

        driverDetail = data.driverDetail;
        console.log(driverDetail, 'driver');

        if (driverDetail && !Array.isArray(driverDetail)) {
          console.log('aaaaa');
          driverDetail.selected = true;
          setSelectedDriver(driverDetail);
        } else {
          setSelectedDriver(
            driverDetail &&
              driverDetail.length > 0 &&
              driverDetail.map((e, i) => {

                if (e.availableDriver == acceptDriver.id) {
                  return {
                    ...e,
                    selected: (e.selected = true),
                  };
                } else {
                  return {
                    ...e,
                    selected: (e.selected = false),
                  };
                }
              }),
          );
        }
      });
  };

  const sendAcceptedDriverInFb = () => {
    firestore()
      .collection('booking')
      .doc(passengerData.id)
      .update({
        driverDetail: driverDetail,
        bookingStatus : "done"
      })
      .then(() => {
        navigation.navigate('PassengerHomeScreen', {
          selectedDriver: selectedDriver,
          passenger: passengerData,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (
      selectedDriver &&
      Array.isArray(selectedDriver) &&
      selectedDriver.length > 0
    ) {
      sendAcceptedDriverInFb();
    } else if (
      selectedDriver &&
      !Array.isArray(selectedDriver) &&
      Object.keys(selectedDriver).length > 0
    ) {
      sendAcceptedDriverInFb();
    }
  }, [selectedDriver]);

  console.log(selectedDriver, 'selectedDriver');

  const rideRequests = ({item}) => {
    return (
      <View style={styles.card}>
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
            <Text style={styles.priceText}>{item.offerFare}$</Text>
          </View>
        </View>
        <View style={styles.btnContainer}>
          <CustomButton
            text="Reject"
            styleContainer={styles.btn}
            btnTextStyle={styles.btnTextStyle}
            bgColor
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

  return (
    <View>
      {Object.keys(driverData).length > 0 ? (
        <FlatList
          data={driverData}
          renderItem={rideRequests}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => `key-${item.cnic}`}
        />
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
