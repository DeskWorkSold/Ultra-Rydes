import React, {useLayoutEffect, useEffect, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  Image,
} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import Colors from '../../Constants/Colors';
import firestore from '@react-native-firebase/firestore';

export default function PassengerFindRide({navigation, route}) {
  const passengerData = route.params;

  console.log(passengerData, 'passenger');

  const [driverData, setDriverData] = useState([]);
  const [availableDriverId, setAvailableDriverId] = useState([]);

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

          if (data && data.availableDriver) {
            setAvailableDriverId(data.availableDriver);
          }
        });
    }
  }, []);

  const getAvailableDriver = () => {
    console.log(availableDriverId, 'id');
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
            .doc(e)
            .onSnapshot(querySnapshot => {
              let data = querySnapshot.data();

              myData.push(data);

              setDriverData(myData);
            });
        });
    } else if (availableDriverId && !Array.isArray(availableDriverId)) {
      firestore()
        .collection('Drivers')
        .doc(availableDriverId)
        .onSnapshot(querySnapshot => {
          let data = querySnapshot.data();
          setDriverData([data]);
        });
    }
  };

  console.log(driverData, 'driver');

  useEffect(() => {
    availableDriverId && availableDriverId.length > 0 && getAvailableDriver();
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

  useEffect(() => {
    // getDriverData();
  }, []);

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
            <Text style={styles.priceText}>0</Text>
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
        ''
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
