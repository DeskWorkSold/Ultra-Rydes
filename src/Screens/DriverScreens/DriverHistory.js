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
} from 'react-native';
import CustomHeader from '../../Components/CustomHeader';
import Colors from '../../Constants/Colors';
import { Dimensions } from 'react-native';
import { ActivityIndicator } from 'react-native';

function DriverHistory({ navigation }) {
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

  const getBookingData = async () => {
    setLoading(true);
    const id = auth().currentUser.uid;

    await firestore()
      .collection('Booking')
      .onSnapshot(querySnapshot => {
        let driverBookingData = [];
        querySnapshot.forEach(documentSnapshot => {
          if (documentSnapshot._exists) {
            let data = documentSnapshot.data();
            data = data.bookingData;
            data &&
              data.length > 0 &&
              data.map((e, i) => {
                if (e.driverData && e.driverData.id == id) {
                  driverBookingData.push(e);
                }
              });
          } else {
            setLoading(false);
          }
        });
        setBookingData(driverBookingData);
        setLoading(false);
      });
  };

  const getCancelRidesData = async () => {
    setLoading(true);
    await firestore()
      .collection('RideCancel')
      .get()
      .then(doc => {
        const id = auth().currentUser.uid;
        let data = doc._docs;
        let myNames = [];
        data = data.forEach((e, i) => {
          let myData = e._data.cancelledRides;
          myData &&
            myData.length > 0 &&
            myData.map((j, ind) => {
              if (j.driverData.id == id) {
                myNames.push(j);
              }
            });
        });
        setCancelledBookingData(myNames);
        setLoading(false);
      });
    setLoading(false);
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
    let myFare = null;

    let items = item.passengerData ?? item;

    items.selectedCar[0].carMiles.map((e, i) => {
      if (
        Number(items.distance) >= e.rangeMin &&
        items.distance <= e.rangeMax
      ) {
        let percentageBid = Math.round(
          (Number(items?.bidFare) / Number(items?.fare)) * 100,
        );

        let baseCharge = items?.selectedCar[0]?.carMiles[0]?.mileCharge;
        let myDistance = 0;
        if (items.distance > 3) {
          myDistance = items.distance - 3;
        }
        let milesCharge = myDistance * e.mileCharge;
        let totalCharges = baseCharge + milesCharge;
        items.fare = Number(totalCharges).toFixed(2);
        if (items.bidFare) {
          items.bidFare = (
            (Number(items.fare) * Number(percentageBid)) /
            100
          ).toFixed(2);
        }
      }
    });

    item.passengerData = items

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
            navigation.navigate('DriverHistorySingleData', {
              item,
            })
          }>
          {/* Date is mentioned Here */}
          <Text style={[styles.text, { marginTop: 5 }]}>
            {item.date.toDate().toString().slice(0, 15)}
          </Text>
          <Text
            style={[styles.text, { paddingTop: 5, fontSize: 14 }]}
            numberOfLines={1}>
            {item.passengerData.pickupAddress}
          </Text>
          <Text
            style={[styles.text, { paddingTop: 5, fontSize: 14 }]}
            numberOfLines={1}>
            {item.passengerData.dropOffAddress}
          </Text>
          <Text style={[styles.text, { paddingTop: 5, fontSize: 14 }]}>
            Fare: $
            {items.bidFare
              ? items.bidFare
              : items.fare
                ? items.fare
                : item.passengerData.fare}
          </Text>
          <Text style={[styles.text, { paddingTop: 5, fontSize: 14 }]}>
            Tip: $
            {item?.tip ? (item.tip).toFixed(2) : 0}
          </Text>
          <Text style={[styles.text, { paddingTop: 5, fontSize: 14 }]}>
            Toll: $
            {item?.toll && item.toll !== "no toll" ? (item.toll).toFixed(2) : 0}
          </Text>
          {/* <Text
            style={[
              styles.text,
              {paddingTop: 5, marginBottom: 5, fontSize: 14},
            ]}>
            Payment: ${item.payment}
          </Text> */}
        </TouchableOpacity>
      </View>
    );
  };

  const renderCancelBookingData = ({ item, index }) => {
    let myFare = null;

    let items = item.passengerData ?? item;

    items.selectedCar[0].carMiles.map((e, i) => {
      if (
        Number(items.distance) >= e.rangeMin &&
        items.distance <= e.rangeMax
      ) {
        let percentageBid = Math.round(
          (Number(items?.bidFare) / Number(items?.fare)) * 100,
        );

        let baseCharge = items?.selectedCar[0]?.carMiles[0]?.mileCharge;
        let myDistance = 0;
        if (items.distance > 3) {
          myDistance = items.distance - 3;
        }
        let milesCharge = myDistance * e.mileCharge;
        let totalCharges = baseCharge + milesCharge;
        items.fare = Number(totalCharges).toFixed(2);
        if (items?.bidFare) {
          items.bidFare = (
            (Number(totalCharges) * Number(percentageBid)) /
            100
          ).toFixed(2);
        }
      }
    });

    // let fare = null;
    // if (
    //   item.passengerData &&
    //   item.passengerData.bidFare &&
    //   item.passengerData.bidFare > 0
    // ) {
    //   item.passengerData.selectedCar[0].carMiles.map((e, i) => {
    //     if (
    //       item.passengerData.distance >= e.rangeMin &&
    //       item.passengerData.distance <= e.rangeMax
    //     ) {
    //       let serviceCharges = e.serviceCharge;
    //       let creditCardFee = (Number(item?.passengerData?.fare) * 5) / 100;
    //       let totalCharges = Number(serviceCharges) + Number(creditCardFee);
    //       fare = (Number(item.passengerData.bidFare) - totalCharges).toFixed(2);
    //     }
    //   });
    // }

    item.passengerData = items

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
            navigation.navigate('DriverHistorySingleData', {
              item,
            })
          }>
          {/* Date is mentioned Here */}
          <Text style={[styles.text, { marginTop: 5 }]}>{item.date.toDate().toString().slice(0, 15)}</Text>
          <Text
            style={[styles.text, { paddingTop: 5, fontSize: 14 }]}
            numberOfLines={1}>
            {item.passengerData.pickupAddress}
          </Text>
          <Text
            style={[styles.text, { paddingTop: 5, fontSize: 14 }]}
            numberOfLines={1}>
            {item.passengerData.dropOffAddress}
          </Text>
          <Text
            style={[
              styles.text,
              { paddingTop: 5, fontSize: 14, marginBottom: 10 },
            ]}>
            Fare: $
            {
              items?.bidFare
                ? items?.bidFare
                : items?.fare}
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
            }}>
            <Text
              style={{
                color: 'black',
                fontSize: 24,
                textAlign: 'center',
                width: '100%',
                fontWeight: '800',
              }}>
              There is no booking data yet
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
      <View style={{ marginVertical: 20 }}>
        {cancelledBookingData && cancelledBookingData.length == 0 ? (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: Dimensions.get('window').height / 2,
              width: Dimensions.get('window').width,
            }}>
            <Text
              style={{
                color: 'black',
                fontSize: 24,
                textAlign: 'center',
                width: '100%',
                fontWeight: '800',
              }}>
              There is no cancel booking data
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
          }}>
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
            }}>
            <Text
              style={[
                styles.text,
                {
                  color: currentTab.some((e, i) => e.index == 0 && e.selected)
                    ? Colors.primary
                    : Colors.secondary,
                },
              ]}>
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
            }}>
            <Text
              style={[
                styles.text,
                {
                  color: currentTab.some((e, i) => e.index == 1 && e.selected)
                    ? Colors.primary
                    : Colors.secondary,
                },
              ]}>
              Cancelled
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View
            style={{
              height: Dimensions.get('window').height / 2 + 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ActivityIndicator size="large" color={Colors.secondary} />
          </View>
        ) : currentTab &&
          currentTab.length > 0 &&
          currentTab.some((e, i) => e.index == 0 && e.selected) ? (
          firstRoute()
        ) : (
          secondeRoute()
        )}
      </ScrollView>
    </View>
  );
}

export default DriverHistory;

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
