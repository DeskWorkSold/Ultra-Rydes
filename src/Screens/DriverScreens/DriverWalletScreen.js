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
import React, {useEffect, useState, useCallback} from 'react';
import COLORS from '../../Constants/Colors';
import CustomButton from '../../Components/CustomButton';
import CustomHeader from '../../Components/CustomHeader';
import Icon from 'react-native-vector-icons/AntDesign';
import {set, withSpring} from 'react-native-reanimated';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Colors from '../../Constants/Colors';
import {ToastAndroid} from 'react-native';
import {Modal} from 'react-native';
import Ionicons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {Linking} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {BASE_URI} from '../../Constants/Base_uri';

const CurrentBalanceScreen = ({navigation}) => {
  const [currentwallet, setCurrentWallet] = useState(null);
  const [allWalletData, setAllWalletData] = useState(true);
  const [monthlyWalletData, setMonthlyWalletData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [addAmount, setAddAmount] = useState('');
  const [openCreateAccountModal, setOpenCreateAccountModal] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState(false);
  const [stripeVerifiedAccount, setStripeVerifiedAccount] = useState(false);
  const [stripeId, setStripeId] = useState('');
  const [driverData, setDriverData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [amountWithdrawn, setAmountWithdrawn] = useState(false);
  const [earn, setEarn] = useState({
    monthly: null,
    total: null,
  });
  const [withdraw, setWithdraw] = useState({
    monthly: null,
    total: null,
  });

  const getAccountId = () => {
    let id = auth().currentUser.uid;

    firestore()
      .collection('DriverstripeAccount')
      .doc(id)
      .onSnapshot(querySnapshot => {
        if (querySnapshot._exists) {
          let data = querySnapshot.data().id;
          if (data) {
            setStripeAccountId(true);
            setStripeId(data);
            axios
              .post(`${BASE_URI}retrieveAccount`, {
                id: data,
              })
              .then(res => {
                let {capabilities} = res.data.accountStatus;

                let {transfers, card_payments} = capabilities;

                if (transfers == 'active' && card_payments == 'active') {
                  setStripeVerifiedAccount(true);
                }
              })
              .catch(error => {
                console.log(error);
              });

          }
        }
      });
  };

  useEffect(() => {
    getAccountId();
  }, []);

  const getWalletData = async () => {
    const userId = auth().currentUser.uid;

    const myWallet = await firestore()
      .collection('driverWallet')
      .doc(userId)
      .onSnapshot(querySnapshot => {
        if(querySnapshot._exists){
        let data = querySnapshot.data().driverWallet;
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
      }
      });
  };

  useEffect(() => {
    getWalletData();
  }, []);

  const getAmountWithdrawFromWallet = () => {
    let myDepositData = [];
    allData &&
      allData.length > 0 &&
      allData.map((e, i) => {
        if (e && e.withdraw) {
          myDepositData.push(Number(e.withdraw));
        }
      });
    let myDeposits =
      myDepositData &&
      myDepositData.length > 0 &&
      myDepositData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    myDeposits && setWithdraw({...withdraw, total: myDeposits});
  };
  const getAmountEarnFromWallet = () => {
    let mySpentData = [];

    allData &&
      allData.length > 0 &&
      allData.map((e, i) => {
        console.log(e, 'eee');
        if ((e && e.fare) || (e && e.tip)) {
          let tip = 0;
          if (e?.tip) {
            tip = e.tip;
          }

          mySpentData.push(Number(e.fare) + Number(tip));
        }
      });
    let mySpents =
      mySpentData &&
      mySpentData.length > 0 &&
      mySpentData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    mySpents && setEarn({...earn, total: mySpents});
  };

  const getMonthlyAmountWithdrawFromWallet = () => {
    let myDepositData = [];
    monthlyWalletData &&
      monthlyWalletData.length > 0 &&
      monthlyWalletData.map((e, i) => {
        if (e && e.withdraw) {
          myDepositData.push(Number(e.withdraw));
        }
      });
    let myDeposits =
      myDepositData &&
      myDepositData.length > 0 &&
      myDepositData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    myDeposits && setWithdraw({...withdraw, monthly: myDeposits});
  };
  const getDriverData = () => {
    let id = auth().currentUser.uid;
    firestore()
      .collection('Drivers')
      .doc(id)
      .onSnapshot(querySnapshot => {
        let data = querySnapshot.data();
        setDriverData(data);
      });
  };
  useEffect(() => {
    getDriverData();
  }, []);

  const getMonthlyAmountEarnFromWallet = () => {
    let mySpentData = [];

    monthlyWalletData &&
      monthlyWalletData.length > 0 &&
      monthlyWalletData.map((e, i) => {
        if (e && e.fare) {
          let tip = 0;

          if (e?.tip) {
            tip = e.tip;
          }

          mySpentData.push(Number(e.fare) + Number(tip));
        }
      });
    let mySpents =
      mySpentData &&
      mySpentData.length > 0 &&
      mySpentData.reduce((previous, current) => {
        return previous + current;
      }, 0);

    mySpents && setEarn({...earn, monthly: mySpents});
  };

  useEffect(() => {
    if ((earn && earn.total) || withdraw.total) {
      let currentWalletAmount = earn.total - withdraw.total;
      currentWalletAmount && setCurrentWallet(currentWalletAmount.toFixed(2));
    }
  }, [earn, withdraw, amountWithdrawn, allWalletData, allData]);

  useEffect(() => {
    if (allData && allData.length > 0) {
      getAmountEarnFromWallet();
      getAmountWithdrawFromWallet();
    }
    if (monthlyWalletData && monthlyWalletData.length > 0) {
      getMonthlyAmountEarnFromWallet();
      getMonthlyAmountWithdrawFromWallet();
    }
  }, [allData, monthlyWalletData]);

  const checkStripeAccount = () => {
    if (!stripeId) {
      let id = auth().currentUser.uid;
      axios.post(`${BASE_URI}createAccount`, driverData).then(res => {
        console.log(res.data, 'res');
        firestore()
          .collection('DriverstripeAccount')
          .doc(id)
          .set(res.data)
          .then(() => {
            ToastAndroid.show(
              'Your account has been created',
              ToastAndroid.SHORT,
            );
            setOpenCreateAccountModal(true);
          })
          .catch(error => {
            console.log(error);
          });
      });
      return;
    }

    if (stripeId && !stripeVerifiedAccount) {
      setOpenCreateAccountModal(true);
      return;
    }
    if (!addAmount) {
      ToastAndroid.show('Kindly Enter Deposit Amount', ToastAndroid.SHORT);
      return;
    }
    if (
      stripeAccountId &&
      stripeVerifiedAccount &&
      currentwallet < Number(addAmount)
    ) {
      ToastAndroid.show(
        "You don't have enought amount in your wallet",
        ToastAndroid.SHORT,
      );
      return;
    }
    if (stripeAccountId && stripeVerifiedAccount) {
      setLoading(true);
      let data = {
        amount: addAmount,
        accountId: stripeId,
      };
      axios
        .post(`${BASE_URI}tranferPayment`, data)
        .then(res => {
          setLoading(false);
          let data = res.data;
          let id = auth().currentUser.uid;
          ToastAndroid.show(
            'Amount Successfully withdrawn This amount will be deposit in your given account within 1 week',
            ToastAndroid.SHORT,
          );

          let walletDataToUpdate = {
            date: new Date(),
            fare: 0,
            withdraw: data.data.amount / 100,
            remainingWallet: 0 - data.data.amount / 100,
          };
          firestore()
            .collection('driverWallet')
            .doc(id)
            .set(
              {
                driverWallet: firestore.FieldValue.arrayUnion(
                  walletDataToUpdate,
                ),
              },
              {merge: true},
            );
        })
        .then(res => {
          ToastAndroid.show(
            'Amount successfully deducted from your wallet',
            ToastAndroid.SHORT,
          );
          setAddAmount('');
          navigation.navigate("AskScreen")
        })
        .catch(error => {
          console.log(error);
        })
        .catch(error => {
          setLoading(false);
          console.log(error);
        });
    }
  };

  const getStripeAccountDetailsFromDriver = () => {
    if (stripeAccountId && stripeVerifiedAccount) {
      axios.post();
    }

    let id = auth().currentUser.uid;
    firestore()
      .collection('DriverstripeAccount')
      .doc(id)
      .onSnapshot(querySnapshot => {
        let accountId = querySnapshot.data().id;
        axios
          .post(`${BASE_URI}accountLink`, {id: accountId})
          .then(res => {
            let data = res.data;
            Linking.openURL(data.data.url);
            setOpenCreateAccountModal(false)
          })
          .catch(error => {
            console.log(error);
          });
      });
  };

  const CreateAccountModal = useCallback(() => {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={openCreateAccountModal}
          onRequestClose={() => {
            setOpenCreateAccountModal(false);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View>
                <Ionicons size={80} color="white" name="account-alert" />
              </View>
              <Text style={styles.modalText}>
                You have to give some naccessary information to withdraw from
                your wallet.
              </Text>
              <TouchableOpacity
                style={[
                  styles.button,
                  {marginBottom: 10, backgroundColor: Colors.primary},
                ]}
                onPress={() => getStripeAccountDetailsFromDriver()}
              >
                <Text
                  style={[styles.textStyle, {backgroundColor: Colors.primary}]}
                >
                  Get my Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }, [openCreateAccountModal]);

  return (
    <SafeAreaView>
      <StatusBar backgroundColor={COLORS.black} />
      <ScrollView
        style={{height: '100%', backgroundColor: COLORS.white}}
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
              <View style={{width: '100%', alignItems: 'center'}}>
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
                }}
              >
                <Text style={{color: COLORS.black}}>Current Balance</Text>
              </View>
              <View>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: COLORS.black,
                  }}
                >
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
                onPress={() => setAllWalletData(allWalletData ? false : true)}
              >
                <Text
                  style={{
                    color: COLORS.black,
                    paddingRight: 5,
                  }}
                >
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
                  navigation.navigate('driverEarningScreen', {
                    data: {
                      allData: allData,
                      monthlyData: monthlyWalletData,
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
                    Earnings:
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: COLORS.black,
                      fontSize: 13,
                      textAlign: 'center',
                    }}
                  >
                    $
                    {allWalletData
                      ? earn.total && earn.total.toFixed(2)
                      : earn.monthly && earn.monthly.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('driverWithdrawScreen', {
                    data: {
                      allData: allData,
                      monthlyData: monthlyWalletData,
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
                    Withdrawal:
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: COLORS.black,
                      fontSize: 13,
                      textAlign: 'center',
                    }}
                  >
                    $
                    {allWalletData
                      ? withdraw.total
                      : withdraw.monthly && withdraw.monthly.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={{
                paddingHorizontal: 25,
                paddingVertical: 20,
              }}
            >
              <View
                style={{
                  paddingBottom: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: 'bold',
                    color: COLORS.black,
                  }}
                >
                  Withdraw Balance
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
                    placeholder="Enter Amount"
                    value={addAmount}
                    keyboardType="numeric"
                    onChangeText={setAddAmount}
                    placeholderTextColor={COLORS.black}
                  />
                </View>
              </View>
            </View>
          </View>
          {openCreateAccountModal && CreateAccountModal()}
          <View
            style={{
              paddingTop: 20,
              alignItems: 'center',
            }}
          >
            <CustomButton
              onPress={checkStripeAccount}
              text={
                loading ? (
                  <ActivityIndicator size="large" color={Colors.secondary} />
                ) : !stripeAccountId ? (
                  'Create Account'
                ) : !stripeVerifiedAccount ? (
                  'Need naccessary details'
                ) : (
                  'Withdraw Amount'
                )
              }
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
