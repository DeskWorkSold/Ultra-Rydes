import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import React, { useCallback } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
function PassengerHistory({ navigation }) {
  const [bookingData, setBookingData] = useState([]);
  const [cancelledBookingData, setCancelledBookingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState([
    {
      index: 0,
      name: 'completed',
      selected: true,
    },
    {
      index: 1,
      name: 'cancelled',
      selected: false,
    },
  ]);

  const getBookingData = () => {
    setLoading(true);
    const id = auth().currentUser.uid;

    firestore()
      .collection('Booking')
      .doc(id)
      .get()
      .then(doc => {
        if (doc.exists) {
          let data = doc.data();
          setBookingData(data.bookingData);
          setLoading(false);
        }
      });
  };

  const getCancelRidesData = () => {
    setLoading(true);
    firestore()
      .collection('RideCancel')
      .get()
      .then(doc => {
        const id = auth().currentUser.uid;
        let data = doc._docs;
        console.log(data, 'data');
        let myNames = [];
        data = data.forEach((e, i) => {
          let myData = e._data.cancelledRides;
          myData &&
            myData.length > 0 &&
            myData.map((j, ind) => {
              if (j.passengerData.id == id) {
                myNames.push(j);
              }
            });
        });
        setCancelledBookingData(myNames);
        setLoading(false);
      });
  };

  useEffect(() => {
    getBookingData();
    getCancelRidesData();
  }, []);

  const activateTab = index => {
    setCurrentTab(
      currentTab &&
      currentTab.length > 0 &&
      currentTab.map((e, i) => {
        if (e.index == index) {
          return {
            ...e,
            selected: true,
          };
        } else {
          return {
            ...e,
            selected: false,
          };
        }
      }),
    );
  };

  const renderBookingData = ({ item, index }) => {
    let date = item.date.toDate();
    let stringDate = date.toString();
    stringDate = stringDate.slice(0, 15);

    let fare = null;
    if (
      item.driverData &&
      item.driverData.bidFare &&
      item.driverData.bidFare > 0
    ) {
      console.log(item.driverData.bidFare, 'bidFare');
      item.passengerData.selectedCar[0].carMiles.map((e, i) => {
        if (
          item.passengerData.distance >= e.rangeMin &&
          item.passengerData.distance <= e.rangeMax
        ) {
          let serviceCharges = e.serviceCharge;
          let creditCardFee = (Number(item.passengerData.fare) * 5) / 100;
          let totalCharges = Number(serviceCharges) + Number(creditCardFee);
          fare = (Number(item.driverData.bidFare) + totalCharges).toFixed(2);
        }
      });
    }

    return (
      <View>
        <TouchableOpacity
          style={{
            alignItems: 'flex-start',
            width: '100%',
            paddingHorizontal: 30,
            borderBottomWidth: 1,
            borderColor: Colors.primary,
          }}
          onPress={() =>
            navigation.navigate('PassengerHistorySingleData', {
              item,
              fare: fare,
            })
          }
        >
          {/* Date is mentioned Here */}
          <Text style={[styles.text, { marginTop: 5 }]}>{stringDate}</Text>
          <Text
            style={[styles.text, { paddingTop: 5, fontSize: 14 }]}
            numberOfLines={1}
          >
            {item.passengerData.pickupAddress}
          </Text>
          <Text
            style={[styles.text, { paddingTop: 5, fontSize: 14 }]}
            numberOfLines={1}
          >
            {item.passengerData.dropOffAddress}
          </Text>
          <Text style={[styles.text, { paddingTop: 5, fontSize: 14 }]}>
            Fare:{' '}
            ${item?.passengerData?.bidFare ?? item?.passengerData?.fare}
          </Text>
          <Text style={[styles.text, { paddingTop: 5, fontSize: 14 }]}>
            Tip:{' '}
            ${item?.tip ? (item.tip).toFixed(2) : 0}
          </Text>
          <Text style={[styles.text, { paddingTop: 5, fontSize: 14 }]}>
            Toll:{' '}
            ${item?.toll && item?.toll !== "no toll" ? item?.toll : 0}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCancelBookingData = ({ item, index }) => {
    let fare = null;
    let date = item?.date?.toDate();
    let stringDate = date?.toString().slice(0, 15);
    if (
      item.driverData &&
      item.driverData.bidFare &&
      item.driverData.bidFare > 0
    ) {
      console.log(item.driverData.bidFare, 'bidFare');
      item.passengerData.selectedCar[0].carMiles.map((e, i) => {
        if (
          item.passengerData.distance >= e.rangeMin &&
          item.passengerData.distance <= e.rangeMax
        ) {
          let serviceCharges = e.serviceCharge;
          let creditCardFee = (Number(item.passengerData.fare) * 5) / 100;
          let totalCharges = Number(serviceCharges) + Number(creditCardFee);
          fare = (Number(item.driverData.bidFare) + totalCharges).toFixed(2);
        }
      });
    }

    return (
      <View>
        <TouchableOpacity
          style={{
            alignItems: 'flex-start',
            width: '100%',
            paddingHorizontal: 30,
            borderBottomWidth: 1,
            borderColor: Colors.primary,
          }}
          onPress={() =>
            navigation.navigate('PassengerHistorySingleData', {
              item,
              fare: fare,
            })
          }
        >
          {/* Date is mentioned Here */}
          <Text style={[styles.text, { marginTop: 5 }]}>{stringDate}</Text>
          <Text
            style={[styles.text, { paddingTop: 5, fontSize: 14 }]}
            numberOfLines={1}
          >
            {item.passengerData.pickupAddress}
          </Text>
          <Text
            style={[styles.text, { paddingTop: 5, fontSize: 14 }]}
            numberOfLines={1}
          >
            {item.passengerData.dropOffAddress}
          </Text>
          <Text
            style={[
              styles.text,
              { paddingTop: 5, fontSize: 14, marginBottom: 10 },
            ]}
          >
            Fare:{' '}
            ${
              item.passengerData.bidFare
                ? item.passengerData.bidFare
                : item.passengerData.fare}

          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const firstRoute = useCallback(() => {
    return (
      <View style={{ marginVertical: 20 }}>
        {bookingData && bookingData.length == 0 ? (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: Dimensions.get('window').height / 2,
              width: Dimensions.get('window').width,
            }}
          >
            <Text
              style={{
                color: 'black',
                fontSize: 24,
                textAlign: 'center',
                width: '100%',
                fontWeight: '800',
              }}
            >
              There is no booking Data Yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookingData}
            renderItem={renderBookingData}
            keyExtractor={(items, index) => index}
          />
        )}
      </View>
    );
  }, [currentTab, bookingData]);

  const secondeRoute = useCallback(() => {
    return (
      <View style={{ marginVertical: 20, flex: 1 }}>
        {cancelledBookingData && cancelledBookingData.length == 0 ? (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: Dimensions.get('window').height / 2,
              width: Dimensions.get('window').width,
            }}
          >
            <Text
              style={{
                color: 'black',
                fontSize: 24,
                textAlign: 'center',
                width: '100%',
                fontWeight: '800',
              }}
            >
              There is no cancel bookings
            </Text>
          </View>
        ) : (
          <FlatList
            data={cancelledBookingData}
            renderItem={renderCancelBookingData}
            keyExtractor={(items, index) => index}
          />
        )}
      </View>
    );
  }, [currentTab, cancelledBookingData]);

  return (
    <View>
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
      <ScrollView style={{ marginBottom: 40 }}>
        <Text style={styles.Heading}>Bookings History</Text>
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => activateTab(0)}
            style={{
              width: '45%',
              borderRadius: 10,
              borderWidth: 1,
              marginLeft: 10,
              padding: 10,
              borderColor: Colors.primary,
              backgroundColor: currentTab.some(
                (e, i) => e.index == 0 && e.selected,
              )
                ? Colors.black
                : 'white',
            }}
          >
            <Text
              style={[
                styles.text,
                {
                  color: currentTab.some((e, i) => e.index == 0 && e.selected)
                    ? Colors.primary
                    : Colors.secondary,
                },
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => activateTab(1)}
            style={{
              width: '45%',
              borderRadius: 10,
              borderWidth: 1,
              marginLeft: 10,
              padding: 10,
              borderColor: Colors.primary,
              backgroundColor: currentTab.some(
                (e, i) => e.index == 1 && e.selected,
              )
                ? Colors.black
                : 'white',
            }}
          >
            <Text
              style={[
                styles.text,
                {
                  color: currentTab.some((e, i) => e.index == 1 && e.selected)
                    ? Colors.primary
                    : Colors.secondary,
                },
              ]}
            >
              Cancelled
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {loading ? (
            <View
              style={{
                height: Dimensions.get('window').height / 2 + 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator size="large" color={Colors.secondary} />
            </View>
          ) : currentTab &&
            currentTab.length > 0 &&
            currentTab.some((e, i) => e.index == 0 && e.selected) ? (
            firstRoute()
          ) : (
            secondeRoute()
          )}
        </View>
      </ScrollView>
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
});

export default PassengerHistory;
