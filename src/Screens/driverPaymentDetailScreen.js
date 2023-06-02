import React, { useState, useEffect } from "react"
import { View, Text, ToastAndroid, Linking, ActivityIndicator } from "react-native"
import CustomHeader from "../Components/CustomHeader";
import Colors from "../Constants/Colors";
import CustomButton from "../Components/CustomButton";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import axios from "axios";
import { BASE_URI } from "../Constants/Base_uri";
import { useIsFocused } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { acc } from "react-native-reanimated";
import SettingsPassenger from "./PassengerScreens/SettingsPassenger";


function DriverPaymentDetail() {


    const focus = useIsFocused()
    const navigation = useNavigation()
    const [accountId, setAccountId] = useState("")
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(false)
    const [driverData, setDriverData] = useState(false)
    const [verifiedAccount, setVerifiedAccount] = useState(false)

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

    const getAccountId = async () => {
        let id = auth().currentUser.uid;
        setLoading(true);
        await firestore()
            .collection('DriverstripeAccount')
            .doc(id)
            .onSnapshot(querySnapshot => {
                if (querySnapshot._exists) {
                    let data = querySnapshot.data().id;
                    if (data) {
                        setAccountId(data)

                        data = JSON.stringify(data)

                        AsyncStorage.setItem("accountId", data)

                        setLoading(false)
                    }
                } else {
                    setLoading(false);
                }
            });
    };



    useEffect(() => {
        getDriverData();
        getAccountId()
    }, []);

    const handleCreateAccount = () => {

        let id = auth().currentUser.uid;
        setLoading(true);
        axios.post(`${BASE_URI}createAccount`, driverData).then(res => {
            firestore()
                .collection('DriverstripeAccount')
                .doc(id)
                .set(res.data)
                .then(() => {
                    setLoading(false);
                    setAccountId(res.data)
                    ToastAndroid.show("Your id has been created successfully", ToastAndroid.SHORT)
                })
                .catch(error => {
                    setLoading(false);
                })
                .catch(error => {
                    setLoading(false);
                    ToastAndroid.show(error.message, ToastAndroid.SHORT);
                });
        });

    }

    const checkDriverDetailsSubmitted = async () => {

        try {



            const id = auth().currentUser?.uid

            let account = await AsyncStorage.getItem("accountId")
            account = JSON.parse(account)

            if (account && !verifiedAccount) {
                axios
                    .post(`${BASE_URI}retrieveAccount`, {
                        id: account,
                    })
                    .then(res => {
                        if (res?.data?.accountStatus.details_submitted) {

                            if (res.status) {
                                setPageLoading(true)
                            }



                            let { capabilities } = res.data.accountStatus;

                            let { transfers, card_payments } = capabilities;


                            if (transfers == 'active' && card_payments == 'active') {

                                firestore().collection("Drivers").doc(id).update({
                                    submitPaymentDetails: true
                                }).then(() => {
                                    setVerifiedAccount(true)
                                    setPageLoading(false)
                                }).catch((error) => {
                                    ToastAndroid.show(error.message, ToastAndroid.SHORT)
                                })


                            }
                        }
                    })
                    .catch(error => {
                        setLoading(false);
                        console.log(error);
                    });
            }

        } catch (error) {

        }

    }

    useEffect(() => {

        let interval = setInterval(() => {
            if (accountId && focus) {
                checkDriverDetailsSubmitted()
            }
        }, 5000);
        return () => clearInterval(interval)
    })


    const getDetail = () => {

        let id = auth().currentUser.uid;
        setLoading(true)

        firestore()
            .collection('DriverstripeAccount')
            .doc(id)
            .onSnapshot(querySnapshot => {

                let accountId = querySnapshot.data()
                accountId = accountId?.id

                axios
                    .post(`${BASE_URI}accountLink`, { id: accountId })
                    .then(res => {
                        let data = res.data;
                        setLoading(false)
                        Linking.openURL(data.data.url);
                    })
                    .catch(error => {
                        setLoading(false)
                        console.log(error);
                    });
            });
    }


    const goToMainPage = () => {

        navigation.replace("DriverRideOption")

    }

    return (
        pageLoading ? <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} >
            <ActivityIndicator size={"large"} color={Colors.secondary} />
            <Text style={{ fontSize: 16, textAlign: "center", color: Colors.black }} >Your details are being verified Kindly wait some minutes</Text>
        </View> : <View style={{ flex: 1, backgroundColor: Colors.white }} >

            <View style={{ backgroundColor: Colors.secondary }} >
                <CustomHeader

                    onPress={() => {
                        navigation.goBack();
                    }}
                    source={require("../Assets/Images/URWhiteLogo.png")}
                />
            </View>
            <View style={{ padding: 20 }} >
                <Text style={{ color: "black", fontSize: 18, fontWeight: "500" }} >
                    Connect yourself in stripe account of ultra rydes to get your earning in your bank account.
                </Text>

                {verifiedAccount && <Text style={{ color: "black", fontSize: 18, fontWeight: "500", marginTop: 30 }} >
                    Your Account has been successfully made and verified.
                </Text>}


                {!verifiedAccount && (accountId ? <CustomButton text={loading ? <ActivityIndicator size={"small"} color={Colors.black} /> : "Submit Details"} styleContainer={{ width: "100%", marginTop: 30 }} onPress={() => getDetail()} /> : <CustomButton text={loading ? <ActivityIndicator size={"small"} color={Colors.black} /> : "Create Your Account Id"} styleContainer={{ width: "100%", marginTop: 30 }} onPress={() => handleCreateAccount()} />)}

            </View>

            {verifiedAccount && <View style={{ position: "absolute", bottom: 20, width: "100%", alignItems: "center" }} >
                <CustomButton text={loading ? <ActivityIndicator size={"small"} color={Colors.black} /> : "Next"} styleContainer={{ width: "90%", marginTop: 30 }} onPress={() => goToMainPage()} />
            </View>}


        </View>
    )
}

export default DriverPaymentDetail