import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SplashScreen from '../Screens/SplashScreen';
import OnBoardingScreen from '../Screens/OnBoardingScreen';
import GetStartedScreen from '../Screens/GetStartedScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmailSignInScreen from '../Screens/EmailSignInScreen';
import EmailSignUpScreen from '../Screens/EmailSignUpScreen';
import AskScreen from '../Screens/AskScreen';
import PhoneLoginScreen from '../Screens/PhoneLoginScreen';
import OtpScreen from '../Screens/OtpScreen';
import PassengerHomeScreen from '../Screens/PassengerScreens/PassengerHomeScreen';
import DrawerContentPassenger from '../Screens/PassengerScreens/DrawerContentPassenger';
import DrawerContentDriver from '../Screens/DriverScreens/DrawerContentDriver';
import DriverHomeScreen from '../Screens/DriverScreens/DriverHomeScreen';
import SettingsPassenger from '../Screens/PassengerScreens/SettingsPassenger';
import ForgotPasswordScreen from '../Screens/ForgotPasswordScreen';
import PassengerFindRide from '../Screens/PassengerScreens/PassengerFindRide';
import PassengerDetailScreen from '../Screens/PassengerDetailScreen';
import PassengerDetailsEdit from '../Screens/PassengerScreens/PassengerDetailsEdit';
import DriverDetailScreen from '../Screens/DriverDetailScreen';
import SettingsDriver from '../Screens/DriverScreens/SettingsDriver';
import DriverDetailsEdit from '../Screens/DriverScreens/DriverDetailsEdit';
import DriverVehicleAdd from '../Screens/DriverScreens/DriverVehicleAdd';
import DriverVehicleEdit from '../Screens/DriverScreens/DriverVehicleEdit';
import DriverBiddingScreen from '../Screens/DriverScreens/DriverBiddingScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function PassengerRoutes() {
    return (
        <Drawer.Navigator
            drawerContent={props => <DrawerContentPassenger {...props} />}
        // screenOptions={{
        //     headerShown: false,
        // }}
        >
            <Drawer.Screen
                name="PassengerHomeScreen"
                component={PassengerHomeScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="SettingsPassenger"
                component={SettingsPassenger}
                options={{
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="PassengerFindRide"
                component={PassengerFindRide}
                options={{
                    title: 'Finding Ride'
                }}
            />
            <Drawer.Screen
                name="PassengerDetailsEdit"
                component={PassengerDetailsEdit}
                options={{
                    headerShown: false
                }}
            />
        </Drawer.Navigator>
    )
}
function DriverRoutes() {
    return (
        <Drawer.Navigator
            drawerContent={props => <DrawerContentDriver {...props} />}
            screenOptions={{ headerShown: false }}>
            <Drawer.Screen
                name="DriverHomeScreen"
                component={DriverHomeScreen}
                options={{ headerShown: false }}
            />
            <Drawer.Screen
                name="SettingsDriver"
                component={SettingsDriver}
                options={{
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="DriverDetailsEdit"
                component={DriverDetailsEdit}
                options={{
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="DriverVehicleAdd"
                component={DriverVehicleAdd}
                options={{
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="DriverVehicleEdit"
                component={DriverVehicleEdit}
                options={{
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="DriverBiddingScreen"
                component={DriverBiddingScreen}
                options={{
                    headerShown: false,
                }}
            />
        </Drawer.Navigator>
    )
}

export default function Navigation() {
    const [isAppFirstLaunched, setIsAppFirstLaunched] = useState(null);



    


    useEffect(() => {
        async function setData() {
            const appData = await AsyncStorage.getItem("isAppFirstLaunched");
            if (appData == null) {
                setIsAppFirstLaunched(true);
                AsyncStorage.setItem("isAppFirstLaunched", "false");
            } else {
                setIsAppFirstLaunched(false);
            }
        }
        setData();

    }, []);
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
                <Stack.Screen name="MyScreen" component={isAppFirstLaunched ? (OnBoardingScreen) : (GetStartedScreen)} />
                <Stack.Screen name="OnBoardingScreen" component={OnBoardingScreen} />
                <Stack.Screen name="GetStartedScreen" component={GetStartedScreen} />
                <Stack.Screen name="EmailSignInScreen" component={EmailSignInScreen} />
                <Stack.Screen name="EmailSignUpScreen" component={EmailSignUpScreen} />
                <Stack.Screen name="AskScreen" component={AskScreen} />
                <Stack.Screen name="PassengerDetailScreen" component={PassengerDetailScreen} />
                <Stack.Screen name="DriverDetailScreen" component={DriverDetailScreen} />
                <Stack.Screen name="PhoneLoginScreen" component={PhoneLoginScreen} />
                <Stack.Screen name="OtpScreen" component={OtpScreen} />
                <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
                <Stack.Screen name="PassengerRoutes" component={PassengerRoutes} />
                <Stack.Screen name="DriverRoutes" component={DriverRoutes} />
            </Stack.Navigator>
        </NavigationContainer>)

}
