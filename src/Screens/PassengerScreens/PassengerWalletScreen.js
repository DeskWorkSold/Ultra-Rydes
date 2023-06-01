import {
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import COLORS from '../../Constants/Colors';
import CustomButton from '../../Components/CustomButton';
import CustomHeader from '../../Components/CustomHeader';
import Icon from 'react-native-vector-icons/AntDesign';
import { set } from 'react-native-reanimated';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ToastAndroid } from 'react-native';
const CurrentBalanceScreen = ({ navigation, route }) => {
  const [currentwallet, setCurrentWallet] = useState(null);
  const [allWalletData, setAllWalletData] = useState(true);
  const [allMonthlyData, setAllMonthlyData] = useState(false)
  const [monthlyWalletData, setMonthlyWalletData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [todayData, setTodayData] = useState([])
  const [addAmount, setAddAmount] = useState('');
  const [deposit, setDeposit] = useState({
    monthly: null,
    total: null,
    daily: null
  });
  const [spent, setSpent] = useState({
    monthly: null,
    total: null,
    daily: null
  });

  let routeData = route.params;

  const getWalletData = async () => {
    const userId = auth().currentUser.uid;

    const myWallet = await firestore()
      .collection('wallet')
      .doc(userId)
      .onSnapshot(querySnapshot => {
        if (querySnapshot.exists) {
          let data = querySnapshot.data()
          walletData = data.wallet
          walletData = walletData.length > 0 && walletData.sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())
          walletData = walletData.reverse()

          setAllData(walletData);
          let date = new Date();
          let currentMonth = date.getMonth();
          let currentYear = date.getFullYear();
          let currentDate = date.getDate();

          setMonthlyWalletData(
            walletData &&
            walletData.length > 0 &&
            walletData.filter((e, i) => {
              let walletDate = e.date.toDate();
              let walletMonth = walletDate.getMonth();
              let walletYear = walletDate.getFullYear();
              if (walletMonth == currentMonth && walletYear == currentYear) {
                return e;
              }
            }),
          );

          setTodayData(
            walletData &&
            walletData.length > 0 &&
            walletData.filter((e, i) => {
              let walletDate = e.date.toDate();
              let walletMonth = walletDate.getMonth();
              let walletYear = walletDate.getFullYear();
              let Date = walletDate.getDate()
              if (walletMonth == currentMonth && walletYear == currentYear && Date == currentDate) {
                return e;
              }
            }),
          );
        }
      });
  };

  useEffect(() => {
    getWalletData();
  }, [routeData]);

  const getAmountDepositInWallet = () => {
    let myDepositData = [];

    allData &&
      allData.length > 0 &&
      allData.map((e, i) => {
        if (e && e.payment) {
          myDepositData.push(Number(e.payment));
        }
      });
    let myDeposits =
      myDepositData &&
      myDepositData.length > 0 &&
      myDepositData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    myDeposits && setDeposit({ ...deposit, total: myDeposits });
  };
  const getAmountSpentFromWallet = () => {
    let mySpentData = [];

    allData &&
      allData.length > 0 &&
      allData.map((e, i) => {
        if ((e && e.fare) || e.cancellationCharges) {
          mySpentData.push(
            Number(e?.fare ?? 0) +
            Number(e?.tip ?? 0) +
            Number(e.toll ?? 0) +
            Number(e?.cancellationCharges ? e.cancellationCharges : 0),
          );
        }
      });
    let mySpents =
      mySpentData &&
      mySpentData.length > 0 &&
      mySpentData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    mySpents && setSpent({ ...spent, total: mySpents });
  };

  const getMonthlyAmountDepositInWallet = () => {
    let myDepositData = [];

    monthlyWalletData &&
      monthlyWalletData.length > 0 &&
      monthlyWalletData.map((e, i) => {
        if (e && e.payment) {
          myDepositData.push(Number(e.payment));
        }
      });

    let myDeposits =
      myDepositData &&
      myDepositData.length > 0 &&
      myDepositData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    myDeposits && setDeposit({ ...deposit, monthly: myDeposits });
  };

  const getMonthlyAmountSpentFromWallet = () => {
    let mySpentData = [];

    monthlyWalletData &&
      monthlyWalletData.length > 0 &&
      monthlyWalletData.map((e, i) => {
        if ((e && e?.fare) || e?.cancellationCharges) {
          console.log(e.cancellationCharges, "cancel")

          let cancellationCharges = e?.cancellationCharges ? Number(e.cancellationCharges) : 0

          mySpentData.push(Number(e.fare ?? 0) + Number(e.tip ?? 0) + Number(e.toll ?? 0) + cancellationCharges);
        }
      });

    console.log(mySpentData, "SPENDTdATA")

    let mySpents =
      mySpentData &&
      mySpentData.length > 0 &&
      mySpentData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    mySpents && setSpent({ ...spent, monthly: mySpents });
  };

  const getDailyAmountSpentFromWallet = () => {
    let mySpentData = [];

    todayData &&
      todayData.length > 0 &&
      todayData.map((e, i) => {
        if (e && e.fare) {
          let tip = 0;
          let toll = 0;

          if (e?.tip) {
            tip = e.tip;
          }
          if (e?.toll) {
            toll = e.toll;
          }

          mySpentData.push(Number(e.fare) + Number(tip) + Number(toll));
        }
      });
    let mySpents =
      mySpentData &&
      mySpentData.length > 0 &&
      mySpentData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    mySpents && setSpent({ ...spent, daily: mySpents });
  };

  const getDailyAmountDepositInWallet = () => {
    let myDepositData = [];
    todayData &&
      todayData.length > 0 &&
      todayData.map((e, i) => {

        if (e && e.payment) {
          myDepositData.push(Number(e.payment));
        }
      });
    let myDeposits =
      myDepositData &&
      myDepositData.length > 0 &&
      myDepositData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    console.log(myDepositData, "deposit")


    myDeposits && setDeposit({ ...deposit, daily: myDeposits });
  };



  useEffect(() => {
    if ((deposit && deposit.total) || spent.total) {
      let currentWalletAmount = Number(deposit.total) - Number(spent.total);
      setCurrentWallet(currentWalletAmount.toFixed(2));
    }
  }, [deposit, spent, routeData, allWalletData]);

  useEffect(() => {
    if (allData && allData.length > 0) {
      getAmountDepositInWallet();
      getAmountSpentFromWallet();
    }
    if (monthlyWalletData && monthlyWalletData.length > 0) {
      getMonthlyAmountDepositInWallet();
      getMonthlyAmountSpentFromWallet();
    }

    if (todayData && todayData.length > 0) {
      getDailyAmountDepositInWallet();
      getDailyAmountSpentFromWallet();
    }

  }, [allData, monthlyWalletData, routeData, allWalletData, todayData]);

  const navigateToPaymentScreen = () => {
    navigation.navigate('passengerPaymentMethod', addAmount);
  };

  const getSortedDetails = () => {


    if (allWalletData) {
      setAllWalletData(false)
      setAllMonthlyData(true)
      return
    }

    if (allMonthlyData) {
      setAllMonthlyData(false)
      return
    }

    if (!allMonthlyData) {
      setAllWalletData(true)
    }



  }


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ height: '100%', backgroundColor: COLORS.white }}
        vertical
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <CustomHeader
              iconname={'menu'}
              color={COLORS.white}
              onPress={() => {
                navigation.toggleDrawer();
              }}
              source={require('../../Assets/Images/URWhiteLogo.png')}
            />
          </View>
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: COLORS.white,
                height: 80,
                paddingHorizontal: 20,
              }}
            >
              <View style={{ width: '100%', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: COLORS.secondary,
                  }}
                >
                  YOUR WALLET
                </Text>
              </View>

              <View
                style={{
                  width: '20%',
                  alignItems: 'flex-end',
                  paddingHorizontal: 20,
                }}
              ></View>
            </View>
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 20,
                alignItems: 'center',
              }}
            >
              <View>
                <View style={{ width: '20%' }}>
                  <TouchableOpacity>
                    <Image
                      source={require('../../Assets/Images/deposit.jpg')}
                      resizeMode="contain"
                      style={{
                        height: 45,
                        color: COLORS.black,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: COLORS.black }}>Current Balance</Text>
              </View>
              <View>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: COLORS.black,
                  }}
                >
                  ${currentwallet ?? 0}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 25,
                paddingVertical: 20,
                alignItems: 'center',
              }}
            >
              <View>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: COLORS.black,
                  }}
                >
                  Details
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => getSortedDetails()}
              >
                <Text
                  style={{
                    color: COLORS.black,
                    paddingRight: 5,
                  }}
                >
                  {allWalletData ? 'All Data' : allMonthlyData ? 'This Month' : "Today"}
                </Text>
                <TouchableOpacity>
                  <Icon name="down" color={COLORS.secondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.white,
                  elevation: 5,
                  borderRadius: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                  alignItems: 'center',
                  width: '49%',
                }}
                onPress={() =>
                  navigation.navigate('passengerDepositDataScreen', {
                    data: {
                      allData: allData,
                      monthlyData: monthlyWalletData,
                      todayData: todayData
                    },
                  })
                }
              >
                <View>
                  <Image
                    source={require('../../Assets/Images/walletDeposit.jpg')}
                    resizeMode="contain"
                    style={{
                      height: 50,
                      marginRight: 10,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingTop: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      textAlign: 'center',
                      paddingRight: 5,
                      color: COLORS.black,
                    }}
                  >
                    Deposit:
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: COLORS.black,
                      fontSize: 13,
                      textAlign: 'center',
                    }}
                  >

                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: COLORS.black,
                        fontSize: 13,
                        textAlign: 'center',
                      }}>
                      $
                      {allWalletData
                        ? (deposit.total ? deposit.total.toFixed(2) : 0) : allMonthlyData ? (deposit.monthly ? deposit.monthly.toFixed(2) : 0)
                          : deposit.daily ? (deposit.daily.toFixed(2)) : 0}
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('passengerSpentDataScreen', {
                    data: {
                      allData: allData,
                      monthlyData: monthlyWalletData,
                      todayData: todayData
                    },
                  })
                }
                style={{
                  backgroundColor: COLORS.white,
                  elevation: 5,
                  borderRadius: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                  alignItems: 'center',
                  width: '49%',
                }}
              >
                <View>
                  <Image
                    source={require('../../Assets/Images/walletSpent.png')}
                    resizeMode="contain"
                    style={{
                      height: 50,
                      marginRight: 10,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingTop: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      textAlign: 'center',
                      paddingRight: 5,
                      color: COLORS.black,
                    }}
                  >
                    Spent:
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: COLORS.black,
                      fontSize: 13,
                      textAlign: 'center',
                    }}>
                    $
                    {allWalletData
                      ? spent.total
                        ? (spent.total).toFixed(2)
                        : 0
                      : allMonthlyData ?
                        ((spent.monthly && spent.monthly.toFixed(2)) ?? 0) :
                        ((spent.daily && (spent.daily).toFixed(2)) ?? 0)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={{
                paddingHorizontal: 25,
                paddingVertical: 20,
              }}
            ></View>
          </View>
        </View>
      </ScrollView>
      <View
        style={{
          paddingTop: 20,
          alignItems: 'center',
          position: 'absolute',
          bottom: 60,
          width: '100%',
        }}
      >
        <CustomButton
          onPress={navigateToPaymentScreen}
          text={'Add Card'}
          btnTextStyle={{ color: COLORS.white }}
        />
      </View>
    </SafeAreaView>
  );
};

export default CurrentBalanceScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    height: '100%',
  },
  NumberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    height: 45,
    width: 340,
    backgroundColor: COLORS.white,
    elevation: 5,
    borderRadius: 5,
  },
  TextInput: {
    padding: 0,
    backgroundColor: COLORS.transparent,
  },
  headerContainer: {
    backgroundColor: COLORS.secondary,
    zIndex: 1,
  },
});
