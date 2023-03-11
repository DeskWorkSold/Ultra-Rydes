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
import React, {useEffect, useState} from 'react';
import COLORS from '../../Constants/Colors';
import CustomButton from '../../Components/CustomButton';
import CustomHeader from '../../Components/CustomHeader';
import Icon from 'react-native-vector-icons/AntDesign';
import {set} from 'react-native-reanimated';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ToastAndroid } from 'react-native';
const CurrentBalanceScreen = ({navigation}) => {
  const [currentwallet, setCurrentWallet] = useState(null);
  const [allWalletData, setAllWalletData] = useState(true);
  const [monthlyWalletData, setMonthlyWalletData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [addAmount,setAddAmount] = useState("")
  const [deposit, setDeposit] = useState({
    monthly: null,
    total: null,
  });
  const [spent, setSpent] = useState({
    monthly: null,
    total: null,
  });

  const getWalletData = async () => {
    const userId = auth().currentUser.uid;

    const myWallet = await firestore()
      .collection('wallet')
      .doc(userId)
      .onSnapshot(querySnapshot => {
        let data = querySnapshot.data().wallet;
        setAllData(data);
        let date = new Date();
        let currentMonth = date.getMonth();
        let currentYear = date.getFullYear();
        let currentDate = date.getDate();

        setMonthlyWalletData(
          data &&
            data.length > 0 &&
            data.filter((e, i) => {
              let walletDate = e.date.toDate();
              let walletMonth = walletDate.getMonth();
              let walletYear = walletDate.getFullYear();
              if (walletMonth == currentMonth && walletYear == currentYear) {
                return e;
              }
            }),
        );
      });
  };

  useEffect(() => {
    getWalletData();
  }, []);

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

    myDeposits && setDeposit({...deposit, total: myDeposits});
  };
  const getAmountSpentFromWallet = () => {
    let mySpentData = [];

    allData &&
      allData.length > 0 &&
      allData.map((e, i) => {
        if (e && e.fare) {
          mySpentData.push(Number(e.fare));
        }
      });
    let mySpents =
      mySpentData &&
      mySpentData.length > 0 &&
      mySpentData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    mySpents && setSpent({...spent, total: mySpents});
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

    myDeposits && setDeposit({...deposit, monthly: myDeposits});
  };

  const getMonthlyAmountSpentFromWallet = () => {
    let mySpentData = [];

    monthlyWalletData &&
      monthlyWalletData.length > 0 &&
      monthlyWalletData.map((e, i) => {
        if (e && e.fare) {
          mySpentData.push(Number(e.fare));
        }
      });
    let mySpents =
      mySpentData &&
      mySpentData.length > 0 &&
      mySpentData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    mySpents && setSpent({...spent, monthly: mySpents});
  };

  useEffect(() => {
    if (deposit && deposit.total && spent.total) {
      let currentWalletAmount = deposit.total - spent.total;
      setCurrentWallet(currentWalletAmount.toFixed(2));
    }
  }, [deposit, spent]);

  

  useEffect(() => {
    if (allData && allData.length > 0) {
      getAmountDepositInWallet();
      getAmountSpentFromWallet();
    }
    if (monthlyWalletData && monthlyWalletData.length > 0) {
      getMonthlyAmountDepositInWallet();
      getMonthlyAmountSpentFromWallet();
    }
  }, [allData, monthlyWalletData]);


  console.log(addAmount,"addd")
const navigateToPaymentScreen = () => {

  if(!addAmount){
      ToastAndroid.show("Kindly Enter Deposit Amount",ToastAndroid.SHORT)
      
  }else{
    navigation.navigate('passengerPaymentMethod',addAmount)
  }

}

  return (
    <SafeAreaView>
      <StatusBar backgroundColor={COLORS.black} />
      <ScrollView
        style={{height: '100%', backgroundColor: COLORS.white}}
        vertical
        showsVerticalScrollIndicator={false}>
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
              }}>
              <View style={{width: '100%', alignItems: 'center'}}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: COLORS.secondary,
                  }}>
                  YOUR WALLET
                </Text>
              </View>

              <View
                style={{
                  width: '20%',
                  alignItems: 'flex-end',
                  paddingHorizontal: 20,
                }}></View>
            </View>
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 20,
                alignItems: 'center',
              }}>
              <View>
                <View style={{width: '20%'}}>
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
                }}>
                <Text style={{color: COLORS.black}}>Current Balance</Text>
              </View>
              <View>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: COLORS.black,
                  }}>
                  ${currentwallet}
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
              }}>
              <View>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: COLORS.black,
                  }}>
                  Details
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => setAllWalletData(allWalletData ? false : true)}>
                <Text
                  style={{
                    color: COLORS.black,
                    paddingRight: 5,
                  }}>
                  {allWalletData ? 'All Data' : 'This Month'}
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
              }}>
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
                onPress={()=>navigation.navigate("passengerDepositDataScreen",{data : {
                  allData: allData,
                  monthlyData : monthlyWalletData
                }})}
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
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      textAlign: 'center',
                      paddingRight: 5,
                      color: COLORS.black,
                    }}>
                    Deposit:
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: COLORS.black,
                      fontSize: 13,
                      textAlign: 'center',
                    }}>
                    ${allWalletData ? deposit.total : deposit.monthly}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={()=>navigation.navigate("passengerSpentDataScreen",{data : {
                  allData: allData,
                  monthlyData : monthlyWalletData
                }})}
                style={{
                  backgroundColor: COLORS.white,
                  elevation: 5,
                  borderRadius: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                  alignItems: 'center',
                  width: '49%',
                }}>
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
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      textAlign: 'center',
                      paddingRight: 5,
                      color: COLORS.black,
                    }}>
                    Spent:
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: COLORS.black,
                      fontSize: 13,
                      textAlign: 'center',
                    }}>
                    ${allWalletData ? spent.total : spent.monthly.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={{
                paddingHorizontal: 25,
                paddingVertical: 20,
              }}>
              <View
                style={{
                  paddingBottom: 5,
                }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: 'bold',
                    color: COLORS.black,
                  }}>
                  Add Balance
                </Text>
              </View>
            </View>
            <View style={{alignItems: 'center'}}>
              <View>
                <View>
                  <Text style={{color: COLORS.black}}>Amount</Text>
                </View>
                <View style={styles.NumberInput}>
                  <TextInput
                    style={[styles.TextInput, {color: COLORS.black}]}
                    placeholder="$200"
                    keyboardType="numeric"
                    onChangeText={setAddAmount}
                    placeholderTextColor={COLORS.black}
                  />
                </View>
              </View>
            </View>
          </View>

          <View
            style={{
              paddingTop: 20,
              alignItems: 'center',
            }}>
            <CustomButton
              onPress={navigateToPaymentScreen}
              text={'Add Amount'}
              btnTextStyle={{color: COLORS.white}}
            />
          </View>
        </View>
      </ScrollView>
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
