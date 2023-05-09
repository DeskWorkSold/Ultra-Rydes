import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
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
import PassengerHistory from '../Screens/PassengerScreens/PassengerHistory';
import PassengerHistorySingleData from '../Screens/PassengerSingleDataScreen';
import DriverHistory from '../Screens/DriverScreens/DriverHistory';
import DriverHistorySingleDataScreen from '../Screens/DriverHistorySingleDataScreen';
import PassengerSafetyScreen from '../Screens/PassengerScreens/PassengerSafetyScreen';
import DriverSafetyScreen from '../Screens/DriverScreens/DriverSafetyScreen';
import PassengerWalletScreen from '../Screens/PassengerScreens/PassengerWalletScreen';
import depositDataScreen from '../Screens/PassengerScreens/passengerDepositDataScreen';
import SpentDataScreen from '../Screens/PassengerScreens/PassengerSpentDataScreen';
import DepositDataScreen from '../Screens/PassengerScreens/passengerDepositDataScreen';
import PaymentMethod from '../Screens/PassengerScreens/PassengerPaymentMethodScreen';
import PassengerCheckOutScreen from '../Screens/PassengerScreens/passengerCheckOutScreen';
import PassengerFAQ from '../Screens/PassengerScreens/PassengerFAQ';
import PassengerFaqDetail from '../Screens/PassengerScreens/PassengerFaqDetailScreen';
import PassengerPhoneNumberChangeScreen from '../Screens/PassengerScreens/PassengerPhoneNumberChangeScreen';
import PassengerLanguageScreen from '../Screens/PassengerScreens/PassengerLanguageScreen';
import PassengerRulesAndTerms from '../Screens/PassengerScreens/PassengerRulesAndTerm';
import PassengerRulesAndTermsDetail from '../Screens/PassengerScreens/PassengerRulesAndTermsDetail';
import DriverPhoneNumberChangeScreen from '../Screens/DriverScreens/DriverPhoneNumberChangeScreen';
import DriverRulesAndTerms from '../Screens/DriverScreens/DriverRulesAndTerms';
import DriverRulesAndTermsDetail from '../Screens/DriverScreens/DriverRulesAndTermsDetails';
import DriverFAQ from '../Screens/DriverScreens/DriverFAQ';
import DriverFaqDetail from '../Screens/DriverScreens/DriverFaqDetails';
import DriverWalletScreen from '../Screens/DriverScreens/DriverWalletScreen';
import DriverWithdrawScreen from '../Screens/DriverScreens/DriverWithdraw';
import DriverEarningScreen from '../Screens/DriverScreens/DriverEarning';
import PredefinedPlaces from '../Screens/PassengerScreens/addPlaces';
import PassengerDefinedPlaces from '../Screens/PassengerScreens/passengerDefinedPlacesScreen';
import AddCard from '../Screens/PassengerScreens/addCardScreen';
import DriverRideOption from '../Screens/DriverScreens/DriverRideOptionsScreen';
import DriverOnTheWay from '../Screens/DriverScreens/DriverOnTheWayScreen';
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
          unmountOnBlur:true
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
          title: 'Finding Ride',
          unmountOnBlur: true,
        }}
      />
      <Drawer.Screen
        name="PassengerDetailsEdit"
        component={PassengerDetailsEdit}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="PassengerHistory"
        component={PassengerHistory}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="PassengerSafetyScreen"
        component={PassengerSafetyScreen}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="PassengerWalletScreen"
        component={PassengerWalletScreen}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="PassengerFAQScreen"
        component={PassengerFAQ}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="PassengerDefinedPlacesScreen"
        component={PassengerDefinedPlaces}
        options={{
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
}
function DriverRoutes() {
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContentDriver {...props} />}
      screenOptions={{headerShown: false}}
    >
      <Drawer.Screen
        name="DriverHomeScreen"
        component={DriverHomeScreen}
        options={{headerShown: false, unmountOnBlur: true}}
      />
      <Drawer.Screen
        name="DriverOnTheWayScreen"
        component={DriverOnTheWay}
        options={{headerShown: false}}
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
          unmountOnBlur: true,
        }}
      />
      <Drawer.Screen
        name="DriverHistory"
        component={DriverHistory}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="DriverSafetyScreen"
        component={DriverSafetyScreen}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="DriverFAQScreen"
        component={DriverFAQ}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="DriverWalletScreen"
        component={DriverWalletScreen}
        options={{
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
}

export default function Navigation() {
  const [isAppFirstLaunched, setIsAppFirstLaunched] = useState(null);

  useEffect(() => {
    async function setData() {
      const appData = await AsyncStorage.getItem('isAppFirstLaunched');
      if (appData == null) {
        setIsAppFirstLaunched(true);
        AsyncStorage.setItem('isAppFirstLaunched', 'false');
      } else {
        setIsAppFirstLaunched(false);
      }
    }
    setData();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen
          name="MyScreen"
          component={isAppFirstLaunched ? OnBoardingScreen : GetStartedScreen}
        />
        <Stack.Screen name="OnBoardingScreen" component={OnBoardingScreen} />
        <Stack.Screen name="GetStartedScreen" component={GetStartedScreen} />
        <Stack.Screen name="EmailSignInScreen" component={EmailSignInScreen} />
        <Stack.Screen name="EmailSignUpScreen" component={EmailSignUpScreen} />
        <Stack.Screen name="AskScreen" component={AskScreen} options={{unmountOnBlur:true}} />
        <Stack.Screen
          name="PassengerDetailScreen"
          component={PassengerDetailScreen}
        />
        <Stack.Screen
          name="DriverRideOption"
          component={DriverRideOption}
        />
        <Stack.Screen name="AddCardScreen" component={AddCard} />
        <Stack.Screen
          name="DriverDetailScreen"
          component={DriverDetailScreen}
        />
        <Stack.Screen name="PhoneLoginScreen" component={PhoneLoginScreen} />
        <Stack.Screen name="OtpScreen" component={OtpScreen} />
        <Stack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
        />
        <Stack.Screen name="PassengerRoutes" component={PassengerRoutes} />
        <Stack.Screen name="DriverRoutes" component={DriverRoutes} />
        <Stack.Screen
          name="PassengerHistorySingleData"
          component={PassengerHistorySingleData}
        />
        <Stack.Screen
          name="DriverHistorySingleData"
          component={DriverHistorySingleDataScreen}
        />
        <Stack.Screen
          name="passengerDepositDataScreen"
          component={DepositDataScreen}
        />
        <Stack.Screen
          name="passengerSpentDataScreen"
          component={SpentDataScreen}
        />
        <Stack.Screen name="passengerPaymentMethod" component={PaymentMethod} />
        <Stack.Screen
          name="passengerCheckoutScreen"
          component={PassengerCheckOutScreen}
        />
        <Stack.Screen
          name="passengerFaqDetail"
          component={PassengerFaqDetail}
        />
        <Stack.Screen
          name="passengerPhoneNumberChangeScreen"
          component={PassengerPhoneNumberChangeScreen}
        />
        <Stack.Screen
          name="passengerLanguageScreen"
          component={PassengerLanguageScreen}
        />
        <Stack.Screen
          name="passengerRulesAndTermsScreen"
          component={PassengerRulesAndTerms}
        />
        <Stack.Screen
          name="passengerRulesAndTermsDetailScreen"
          component={PassengerRulesAndTermsDetail}
        />
        <Stack.Screen
          name="driverPhoneNumberChangeScreen"
          component={DriverPhoneNumberChangeScreen}
        />
        <Stack.Screen
          name="driverRulesAndTermsScreen"
          component={DriverRulesAndTerms}
        />
        <Stack.Screen
          name="driverRulesAndTermsDetailScreen"
          component={DriverRulesAndTermsDetail}
        />
        <Stack.Screen name="driverFaqDetail" component={DriverFaqDetail} />
        <Stack.Screen
          name="driverWithdrawScreen"
          component={DriverWithdrawScreen}
        />
        <Stack.Screen
          name="driverEarningScreen"
          component={DriverEarningScreen}
        />
        <Stack.Screen
          name="passengerAddPlacesScreen"
          component={PredefinedPlaces}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
