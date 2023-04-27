import React, {useLayoutEffect, useEffect, useState, useCallback} from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  ToastAndroid,
  Modal,
  Settings,
} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import Colors from '../../Constants/Colors';
import firestore from '@react-native-firebase/firestore';
import {getPreciseDistance} from 'geolib';
import MapViewDirections from 'react-native-maps-directions';
import GoogleMapKey from '../../Constants/GoogleMapKey';
import Icon from 'react-native-vector-icons/AntDesign';
import {BackHandler} from 'react-native';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/MaterialIcons';
import {ScrollView} from 'react-native-gesture-handler';
import axios from 'axios';
import {BASE_URI} from '../../Constants/Base_uri';
import {setMaxListeners} from 'npm';

export default function PassengerFindRide({navigation, route}) {
  const passengerData = route.params;
  const [driverData, setDriverData] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [request, setRequest] = useState(false);
  const [minutes, setMinutes] = useState([]);
  const [distance, setDistance] = useState([]);
  const [inlineDriver, setInlineDriver] = useState([]);
  const [driverNotAvailable, setDriverNotAvailable] = useState([]);
  const [loader, setLoader] = useState(false);
  const [paymentDone, setPaymentDone] = useState(null);
  const [showAskPaymentModal, setShowAskPaymentModal] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [savedCards, setSavedCards] = React.useState(true);
  const [buttonLoader, setButtonLoader] = React.useState(false);
  const [noDriverData,setNoDriverData] = React.useState(false)

  const [cardDetail, setCardDetail] = useState({
    cardHolderName: '',
    cardNumber: null,
    expiryYear: null,
    expiryMonth: null,
    cvc: null,
  });

  const [
    showPaymentConfirmationModal,
    setShowPaymentConfirmationModal,
  ] = useState(false);

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
            !Array.isArray(data.myDriversData) &&
            data.myDriversData?.requestStatus !== 'rejected'
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
    if (passengerData.id && passengerData.bidFare  && !noDriverData) {
      setRequest(true);
    }

    checkAvailableDriverStatus();
  }, []);

  

  useEffect(() => {
    let interval = setInterval(() => {
      if (driverData.length == 0 && request && !noDriverData) {
        console.log("hello")
        setRequest(false);
        setNoDriverData(true)
        navigation.navigate('PassengerHomeScreen');
        clearInterval(interval)
        ToastAndroid.show(
          'Driver are not available rightnow request after sometime',
          ToastAndroid.SHORT,
        );
      }else{
        navigation.navigate('PassengerHomeScreen');
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (passengerData && !passengerData.bidFare && !request) {
      driverData && driverData.length == 0 ? setLoader(true) : '';
      let interval = setInterval(() => {
        let rejectedDriver = false;
        let id = auth().currentUser.uid;

        firestore()
          .collection('Request')
          .doc(id)
          .get()
          .then(doc => {
            if (doc._exists) {
              let data = doc?.data();
              rejectedDriver = data?.rejectedDriversId;
            }
          })
          .then(() => {
            setLoader(false);
            getDriverData(rejectedDriver);
          })
          .catch(error => {
            setLoader(false);
          });
      }, 10000);
      return () => clearInterval(interval);
    } else {
      setDriverData([]);
      setRequest(true);
    }
  }, [route.params]);

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
    if (
      request &&
      !passengerData.bidFare &&
      selectedDriver &&
      !passengerData?.rideCancelByPassenger
    ) {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .get()
        .then(querySnapshot => {
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
                  driverData: selectedDriver,
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
  }, [request, selectedDriver]);

  const getDriverData = async rejectedDriver => {
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
            myDriverData.distance = mileDistance;

            const speed = 10; // meters per second
            myDriverData.minutes = Math.round(dis / speed / 60);
          }

          let isInlined =
            inlineDriver &&
            inlineDriver.filter((e, i) => {
              if (e == myDriverData.id) {
                return 'true';
              }
            });
          isInlined = isInlined[0];

          let flag2 = false;
          flag2 =
            rejectedDriver &&
            rejectedDriver.length > 0 &&
            rejectedDriver?.some((e, i) => e == myDriverData?.id);
          if (!driverRequestedButNotRespond) {
            if (
              myDriverData.status == 'online' &&
              mileDistance <= 3 &&
              myDriversTemp.length < 6 &&
              flag &&
              !isInlined &&
              !driverRequestedButNotRespond &&
              !flag2
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriversTemp.length < 5 &&
              myDriverData.status == 'online' &&
              mileDistance > 3 &&
              mileDistance < 5 &&
              flag &&
              !flag2 &&
              !isInlined &&
              !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriversTemp.length < 5 &&
              myDriverData.status == 'online' &&
              mileDistance < 10 &&
              mileDistance > 5 &&
              flag &&
              !flag2 &&
              !isInlined &&
              !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriversTemp.length < 5 &&
              myDriverData.status == 'online' &&
              mileDistance < 15 &&
              mileDistance > 10 &&
              flag &&
              !isInlined &&
              !flag2 &&
              !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriversTemp.length < 5 &&
              myDriverData.status == 'online' &&
              mileDistance < 20 &&
              mileDistance > 15 &&
              flag &&
              !flag2 &&
              !isInlined &&
              !driverRequestedButNotRespond
            ) {
              myDriverData.fare = passengerData.fare;
              myDriversTemp.push(myDriverData);
            } else if (
              myDriversTemp.length < 5 &&
              myDriverData.status == 'online' &&
              mileDistance < 25 &&
              mileDistance > 20 &&
              !isInlined &&
              !flag2 &&
              !driverRequestedButNotRespond
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
    firestore()
      .collection('Request')
      .doc(passengerData.id)
      .delete()
      .then(() => {
        navigation.navigate('AskScreen');
      })
      .catch(error => {
        console.log(error, 'error');
      });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <TouchableOpacity
            style={styles.cancelTextContainer}
            onPress={() => {
              deleteBookingData();
            }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        );
      },
    });
  }, []);

  // const confirmToMakePayment = () => {
  //   setShowAskPaymentModal(false);
  //   setShowCardForm(true);
  // };

  // const PaymentAskModal = useCallback(() => {
  //   return (
  //     <View style={styles.centeredView}>
  //       <Modal
  //         animationType="slide"
  //         transparent={true}
  //         visible={showAskPaymentModal}
  //         onRequestClose={() => {
  //           setShowAskPaymentModal(false);
  //         }}
  //       >
  //         <View style={styles.centeredView}>
  //           <View style={styles.modalView}>
  //             <View>
  //               <Ionicons size={80} color="white" name="payment" />
  //             </View>
  //             <Text style={styles.modalText}>
  //               You need to make payment before request the ride!
  //             </Text>
  //             <Text
  //               style={[
  //                 styles.modalText,
  //                 {color: Colors.white, fontSize: 18, fontWeight: '600'},
  //               ]}
  //             >
  //               Do you want to make payment!
  //             </Text>
  //             <TouchableOpacity
  //               style={[
  //                 styles.button,
  //                 {marginBottom: 10, backgroundColor: Colors.primary},
  //               ]}
  //               onPress={() => confirmToMakePayment()}
  //             >
  //               <Text
  //                 style={[styles.textStyle, {backgroundColor: Colors.primary}]}
  //               >
  //                 Confirm
  //               </Text>
  //             </TouchableOpacity>
  //           </View>
  //         </View>
  //       </Modal>
  //     </View>
  //   );
  // }, [showAskPaymentModal]);

  // const confirmPayment = () => {
  //   setButtonLoader(true);

  //   let customerData = {
  //     cardNumber: cardDetail.cardNumber,
  //     expiryMonth: Number(cardDetail.expiryMonth),
  //     expiryYear: Number(cardDetail.expiryYear),
  //     cvc: cardDetail.cvc,
  //     amount: Number(passengerData.bidFare ?? passengerData.fare),
  //   };
  //   axios
  //     .post(`${BASE_URI}dopayment`, customerData)
  //     .then(res => {
  //       setButtonLoader(false);
  //       let data = res.data;
  //       console.log(typeof data.amount);
  //       let {result, status} = data;
  //       if (!status) {
  //         ToastAndroid.show(data.message, ToastAndroid.SHORT);
  //         return;
  //       }
  //       let walletData = {
  //         payment: result.amount / 100,
  //         fare: 0,
  //         wallet: result.amount / 100,
  //         date: new Date(),
  //         tip: 0,
  //       };
  //       let id = auth().currentUser.uid;
  //       firestore()
  //         .collection('wallet')
  //         .doc(id)
  //         .set(
  //           {
  //             wallet: firestore.FieldValue.arrayUnion(walletData),
  //           },
  //           {merge: true},
  //         )
  //         .then(() => {
  //           ToastAndroid.show(
  //             'Amount Successfully Deposit in your wallet and will be deducted after you complete your ride',
  //             ToastAndroid.SHORT,
  //           );
  //           setShowAskPaymentModal(false);
  //           setShowPaymentConfirmationModal(false);

  //           firestore()
  //             .collection('Request')
  //             .doc(passengerData.id)
  //             .set({
  //               passengerData: passengerData,
  //               driverData: selectedDriver,
  //             })
  //             .then(() => {
  //               setRequest(true);
  //               setShowCardForm(false);
  //             })
  //             .catch(error => {
  //               console.log(error);
  //             });
  //         })
  //         .catch(error => {
  //           console.log(error);
  //         });
  //     })
  //     .catch(error => {
  //       setButtonLoader(false);
  //       console.log(error, 'erro');
  //       ToastAndroid.show('error', ToastAndroid.SHORT);
  //     });
  // };

  // const PaymentConfirmationModal = useCallback(() => {
  //   return (
  //     <View style={styles.centeredView}>
  //       <Modal
  //         animationType="slide"
  //         transparent={true}
  //         visible={showPaymentConfirmationModal}
  //         onRequestClose={() => {
  //           setShowPaymentConfirmationModal(false);
  //           setShowCardForm(false);
  //           setSelectedDriver('');
  //         }}
  //       >
  //         <View style={styles.centeredView}>
  //           <View
  //             style={[
  //               styles.modalView,
  //               {alignItems: 'flex-start', justifyContent: 'flex-start'},
  //             ]}
  //           >
  //             <View style={{alignSelf: 'center'}}>
  //               <Ionicons size={80} color="white" name="payment" />
  //             </View>
  //             <Text
  //               style={[
  //                 styles.modalText,
  //                 {marginBottom: 0, textAlign: 'left', padding: 0},
  //               ]}
  //             >
  //               Fare : {passengerData.bidFare ?? passengerData.fare}
  //             </Text>
  //             <Text
  //               style={[
  //                 styles.modalText,
  //                 {marginTop: 0, textAlign: 'left', padding: 0, fontSize: 16},
  //               ]}
  //             >
  //               Total amount deducted :{' '}
  //               {passengerData.bidFare ?? passengerData.fare}
  //             </Text>
  //             <Text
  //               style={[
  //                 styles.modalText,
  //                 {
  //                   color: Colors.white,
  //                   fontSize: 16,
  //                   fontWeight: '600',
  //                   alignSelf: 'center',
  //                 },
  //               ]}
  //             >
  //               Are you sure to make payment!
  //             </Text>
  //             <TouchableOpacity
  //               style={[
  //                 styles.button,
  //                 {
  //                   marginBottom: 10,
  //                   backgroundColor: Colors.primary,
  //                   alignSelf: 'center',
  //                 },
  //               ]}
  //               onPress={() => confirmPayment()}
  //             >
  //               {buttonLoader ? (
  //                 <ActivityIndicator size={'large'} color={Colors.secondary} />
  //               ) : (
  //                 <Text
  //                   style={[
  //                     styles.textStyle,
  //                     {backgroundColor: Colors.primary},
  //                   ]}
  //                 >
  //                   Pay Amount
  //                 </Text>
  //               )}
  //             </TouchableOpacity>
  //           </View>
  //         </View>
  //       </Modal>
  //     </View>
  //   );
  // }, [showPaymentConfirmationModal, buttonLoader, selectedDriver]);

  // const makePayment = () => {
  //   let values = Object.values(cardDetail);
  //   console.log(values, 'bales');
  //   let flag = values.some(e => e == '');
  //   if (flag) {
  //     ToastAndroid.show('Required fields are missing', ToastAndroid.SHORT);
  //   } else {
  //     let id = auth().currentUser.uid;

  //     let savedCards = {
  //       ...cardDetail,
  //       date: new Date(),
  //     };

  //     firestore()
  //       .collection('passengerCards')
  //       .doc(id)
  //       .set(
  //         {
  //           savedCards: firestore.FieldValue.arrayUnion(savedCards),
  //         },
  //         {merge: true},
  //       )
  //       .then(() => {
  //         ToastAndroid.show(
  //           'Card has been successfully added',
  //           ToastAndroid.SHORT,
  //         );
  //         setSavedCards(true);
  //       })
  //       .catch(error => {
  //         console.log(error);
  //       });
  //   }
  // };

  // const makePayment = () => {
  //   let values = Object.values(cardDetail);
  //   console.log(values, 'bales');
  //   let flag = values.some(e => e == '');
  //   if (flag) {
  //     ToastAndroid.show('Required fields are missing', ToastAndroid.SHORT);
  //   } else {
  //     console.log(showPaymentConfirmationModal, 'payment');
  //     setShowPaymentConfirmationModal(true);
  //   }
  // };

  // const PaymentFormCard = () => {
  //   return (
  //     <View style={{width: '100%', paddingHorizontal: 20, marginTop: 30}}>
  //       <ScrollView>
  //         <View style={{width: '100%'}}>
  //           <Text
  //             style={[
  //               styles.text,
  //               {
  //                 textAlign: 'center',
  //                 fontSize: 20,
  //                 fontWeight: '600',
  //                 marginBottom: 20,
  //                 color: Colors.black,
  //               },
  //             ]}
  //           >
  //             Add Card details you want to make payment from
  //           </Text>

  //           <Text
  //             style={[
  //               styles.text,
  //               {textAlign: 'left', color: Colors.secondary},
  //             ]}
  //           >
  //             Card Holder Name
  //           </Text>
  //           <TextInput
  //             onChangeText={e =>
  //               setCardDetail({...cardDetail, cardHolderName: e})
  //             }
  //             placeholder="Enter name..."
  //             placeholderTextColor={Colors.black}
  //             style={{
  //               width: '100%',
  //               color: Colors.black,
  //               borderWidth: 1,
  //               borderColor: Colors.black,
  //               padding: 10,
  //               borderRadius: 10,
  //               marginTop: 5,
  //             }}
  //           />
  //         </View>
  //         <View style={{width: '100%', marginTop: 10}}>
  //           <Text
  //             style={[
  //               styles.text,
  //               {textAlign: 'left', color: Colors.secondary},
  //             ]}
  //           >
  //             Card Number
  //           </Text>
  //           <TextInput
  //             placeholder="Enter card number..."
  //             onChangeText={e => setCardDetail({...cardDetail, cardNumber: e})}
  //             placeholderTextColor={Colors.black}
  //             style={{
  //               width: '100%',
  //               borderWidth: 1,
  //               borderColor: Colors.black,
  //               padding: 10,
  //               color: 'black',
  //               borderRadius: 10,
  //               marginTop: 5,
  //             }}
  //           />
  //         </View>
  //         <View style={{width: '100%', marginTop: 10}}>
  //           <Text
  //             style={[
  //               styles.text,
  //               {textAlign: 'left', color: Colors.secondary},
  //             ]}
  //           >
  //             Expiry Month
  //           </Text>
  //           <TextInput
  //             keyboardType="numeric"
  //             onChangeText={e => setCardDetail({...cardDetail, expiryMonth: e})}
  //             placeholder="Enter expiry date..."
  //             placeholderTextColor={Colors.black}
  //             style={{
  //               width: '100%',
  //               borderWidth: 1,
  //               borderColor: Colors.black,
  //               padding: 10,
  //               color: 'black',
  //               borderRadius: 10,
  //               marginTop: 5,
  //             }}
  //           />
  //         </View>
  //         <View style={{width: '100%', marginTop: 10}}>
  //           <Text
  //             style={[
  //               styles.text,
  //               {textAlign: 'left', color: Colors.secondary},
  //             ]}
  //           >
  //             Expiry Year
  //           </Text>
  //           <TextInput
  //             keyboardType="numeric"
  //             onChangeText={e => setCardDetail({...cardDetail, expiryYear: e})}
  //             placeholder="Enter expiry date..."
  //             placeholderTextColor={Colors.black}
  //             style={{
  //               width: '100%',
  //               borderWidth: 1,
  //               borderColor: Colors.black,
  //               padding: 10,
  //               color: 'black',
  //               borderRadius: 10,
  //               marginTop: 5,
  //             }}
  //           />
  //         </View>
  //         <View style={{width: '100%', marginTop: 10}}>
  //           <Text
  //             style={[
  //               styles.text,
  //               {textAlign: 'left', color: Colors.secondary},
  //             ]}
  //           >
  //             CVC
  //           </Text>
  //           <TextInput
  //             placeholder="Enter cvc..."
  //             onChangeText={e => setCardDetail({...cardDetail, cvc: e})}
  //             placeholderTextColor={Colors.black}
  //             style={{
  //               width: '100%',
  //               borderWidth: 1,
  //               borderColor: Colors.black,
  //               padding: 10,
  //               color: 'black',
  //               borderRadius: 10,
  //               marginTop: 5,
  //             }}
  //           />
  //           <CustomButton
  //             styleContainer={{width: '100%', marginTop: 20}}
  //             text={'Make payment'}
  //             onPress={() => makePayment()}
  //           />
  //         </View>
  //       </ScrollView>
  //     </View>
  //   );
  // };

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
      // if (!paymentDone) {
      //   setShowAskPaymentModal(true);
      //   setSelectedDriver(acceptDriver);
      // } else {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .set({
          passengerData: passengerData,
          driverData: acceptDriver,
          requestDate: new Date(),
        })
        .then(() => {
          setRequest(true);
          setSelectedDriver(acceptDriver);
        })
        .catch(error => {
          console.log(error);
        });
      // }
    }
  };

  useEffect(() => {
    if (!passengerData.bidFare) {
    }
  }, [driverNotAvailable]);

  useEffect(() => {
    let interval;
    if (request && !passengerData.bidFare) {
      interval = setInterval(() => {
        setDriverNotAvailable([...driverNotAvailable, selectedDriver.id]);
        setRequest(false);
        ToastAndroid.show(
          'This driver is not available right now',
          ToastAndroid.SHORT,
        );
      }, 32000);

      return () => clearInterval(interval);
    }

    if (passengerData.bidFare) {
      setRequest(true);
      return () => clearInterval(interval);
    }
  }, [request, selectedDriver, route.params]);

  const rejectOffer = rejectedDriver => {
    if (rejectedDriver && !passengerData.bidFare) {
      setDriverData(
        driverData.filter((e, i) => {
          return e.id !== rejectedDriver.id;
        }),
      );
    } else if (rejectedDriver && passengerData.bidFare) {
      firestore()
        .collection('Request')
        .doc(passengerData.id)
        .onSnapshot(querySnapshot => {
          if (querySnapshot.exists) {
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
          item.bidFare = (Number(data.bidFare) + Number(totalCharges)).toFixed(
            2,
          );
        }
      });
    }

    let flag = driverNotAvailable.some((e, i) => e == item.id);

    return (
      !flag && (
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
                <Text style={styles.priceText}>
                  ${item.bidFare ? Number(item.bidFare) : item.fare}
                </Text>
                <Text style={{color: 'black', fontSize: 14, fontWeight: '600'}}>
                  {item.minutes} minutes away
                </Text>
                <Text style={{color: 'black', fontSize: 14, fontWeight: '600'}}>
                  {item.distance} miles away
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
      )
    );
  };

  return (
    <View>
      {(driverData && driverData.length > 0 && passengerData.bidFare) ||
      (!request && !loader) ? (
        <View>
          {showCardForm ? (
            PaymentFormCard()
          ) : (
            <FlatList
              data={driverData}
              renderItem={rideRequests}
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => `key-${item.id}`}
            />
          )}
          {showAskPaymentModal && PaymentAskModal()}
          {showPaymentConfirmationModal && PaymentConfirmationModal()}
        </View>
      ) : (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '90%',
          }}
        >
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.secondary,
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
    marginTop: 20,
    fontWeight: '800',
    color: 'white',
  },
});
