// import {  createAppContainer } from "react-navigation";
// import { createStackNavigator } from 'react-navigation-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

import Splash from "../../Screens/Splash";
import Landing from "../../Screens/Landing";
import Login from "../../Screens/Login";
import Dashboard from '../../Screens/Dashboard'
import ProfileDetails from '../../Screens/ProfileDetails'
import Account from '../../Screens/Account'
import GiftShop from '../../Screens/GiftShop'
import MyGift from '../../Screens/MyGift'
import PrivacyControls from '../../Screens/PrivacyControls'
import BasicInfo from '../..//Screens/BasicInfo'
import MyPreference from '../../Screens/MyPreference'
import ChatScreen from '../../Screens/Logs/ChatScreen'
import Points from '../../Screens/Points'
import BuyGift from '../../Screens/GiftShop/BuyGift'
import UpdatePassword from '../../Screens/UpdatePassword'
import Call from '../../Screens/Call'
import EditProfile from '../../Screens/EditProfile'
import AfterSignUp from '../../Screens/AfterSignUp'
import Listing from '../../Screens/Points/Listing'
import Payout from '../../Screens/Points/Payout'
import Static from '../../Screens/Static'
import Reffer from '../../Screens/Reffer'
import BuyChat from '../../Screens/ChatPaid/BuyChat'
import ChatPaid from '../../Screens/ChatPaid/ChatPaid'
import OnlineUser from '../../Screens/OnlineUser'
import PlanValidity from "../../Screens/PlanValidity";
import MostActiveUser from "../../Screens/MostActiveUser";
import WebViewScreen from '../../Screens/web/WebViewScreen';
// const Navigations = createNativeStackNavigator({
//   Splash: Splash,
//   Landing: Landing,
//   Login: Login,
//   Dashboard: Dashboard,
//   ProfileDetails: ProfileDetails,
//   Account: Account,
//   GiftShop: GiftShop,
//   MyGift: MyGift,
//   PrivacyControls: PrivacyControls,
//   BasicInfo: BasicInfo,
//   MyPreference: MyPreference,
//   ChatScreen: ChatScreen,
//   Points: Points,
//   BuyGift: BuyGift,
//   UpdatePassword: UpdatePassword,
//   Call: Call,
//   EditProfile: EditProfile,
//   AfterSignUp: AfterSignUp,
//   Listing: Listing,
//   Payout: Payout,
//   Static: Static,
//   Reffer: Reffer,
//   BuyChat: BuyChat,
//   ChatPaid: ChatPaid,
//   OnlineUser: OnlineUser,
//   PlanValidity: PlanValidity,
//   MostActiveUser: MostActiveUser,
// }, {
//   initialRouteName: 'Splash',
//   headerMode: 'none',
//   navigationOptions: {
//     headerVisible: false,
//   }
// });

const AppStack = createNativeStackNavigator();
const AppNavigator = () => {
  return (
    <AppStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="splash" component={Splash} />
      <AppStack.Screen name="Landing" component={Landing} />
      <AppStack.Screen name="Login" component={Login} />
      <AppStack.Screen name="Dashboard" component={Dashboard} />
      <AppStack.Screen name="ProfileDetails" component={ProfileDetails} />
      <AppStack.Screen name="Account" component={Account} />
      <AppStack.Screen name="GiftShop" component={GiftShop} />
      <AppStack.Screen name="MyGift" component={MyGift} />
      <AppStack.Screen name="PrivacyControls" component={PrivacyControls} />
      <AppStack.Screen name="BasicInfo" component={BasicInfo} />
      <AppStack.Screen name="MyPreference" component={MyPreference} />
      <AppStack.Screen name="ChatScreen" component={ChatScreen} />
      <AppStack.Screen name="Points" component={Points} />
      <AppStack.Screen name="BuyGift" component={BuyGift} />
      <AppStack.Screen name="UpdatePassword" component={UpdatePassword} />
      <AppStack.Screen name="Call" component={Call} />
      <AppStack.Screen name="EditProfile" component={EditProfile} />
      <AppStack.Screen name="AfterSignUp" component={AfterSignUp} />
      <AppStack.Screen name="Listing" component={Listing} />
      <AppStack.Screen name="Payout" component={Payout} />
      <AppStack.Screen name="Static" component={Static} />
      <AppStack.Screen name="Reffer" component={Reffer} />
      <AppStack.Screen name="BuyChat" component={BuyChat} />
      <AppStack.Screen name="ChatPaid" component={ChatPaid} />
      <AppStack.Screen name="OnlineUser" component={OnlineUser} />
      <AppStack.Screen name="PlanValidity" component={PlanValidity} />
      <AppStack.Screen name="MostActiveUser" component={MostActiveUser} />
      <AppStack.Screen name="WebViewScreen" component={WebViewScreen} />
    </AppStack.Navigator>
  )
}

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default RootNavigator;