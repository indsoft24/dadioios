import React from 'react'
import { View, Text, Image, TouchableOpacity, BackHandler, Alert, Modal, Platform, Linking } from 'react-native'
import Button from '../../../src/res/components/Button'
import TextView from '../../../src/res/components/TextView'
import R from '../../res/R'
import Icon from 'react-native-vector-icons/FontAwesome';
import CIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes
} from "react-native-google-signin";
import Toast from "react-native-simple-toast";
import notifee, { AndroidImportance, EventType, AndroidCategory } from '@notifee/react-native';

// import {
//     GraphRequest,
//     GraphRequestManager,
//     AccessToken,
//     LoginButton,
//     LoginManager
// } from "react-native-fbsdk";

import { LoginButton, AccessToken, LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk-next';

import Loader from '../../../src/res/components/Loader'
import Utils from '../../res/Utils'
import AsyncStorage from '@react-native-community/async-storage'

const WEB_CLIENT_ID = '857646870229-uf53r829hg7u1niophi5ls409l6s4tha.apps.googleusercontent.com'
const facebook_app_id = "317828375938376"
const fb_login_protocol_scheme = "fb317828375938376"
export default class Landing extends React.Component {

    constructor() {
        super()
        this.state = ({
            userIcon: "",
            gettingLoginStatus: false,
            userInfo: "",
            isLoading: false,
            agreed: false
        })
    }

    _navEmailLogin() {
        if (!this.state.agreed) {
            Toast.show("Please accept the Terms & Conditions and Privacy Policy", Toast.SHORT)
            return;
        }
        this.props.navigation.replace("Login")
    }

    batteryPermission = async () => {
        try {
            console.log("===batteryOptimizationEnabled===")
            const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled();
            console.log("===batteryOptimizationEnabled===", batteryOptimizationEnabled)
            if (batteryOptimizationEnabled) {

                //await notifee.openBatteryOptimizationSettings()
                // 2. ask your users to disable the feature
                Alert.alert(
                    'Battery Optimization Restrictions Detected',
                    'Please disable/unrestricted battery optimizations for this app to ensure smooth functionality in the background.\n\n'
                    + 'Battery usages/Battery -> Background restriction/Allow bacground activity',
                    [
                        // 3. launch intent to navigate the user to the appropriate screen
                        {
                            text: 'OK, open settings',
                            onPress: async () => {
                                //  await notifee.openBatteryOptimizationSettings()
                                if (Platform.OS === 'android') {
                                    Linking.openSettings('package:' + 'com.dadio.app');
                                }
                            },
                        },
                        {
                            text: "Cancel",
                            onPress: () => console.log("Cancel Pressed"),
                            style: "cancel"
                        },
                    ],
                    { cancelable: false }
                );
            };
        } catch (ex) {
            console.log(ex)
        }
    }

    componentDidMount() {
        //  this.batteryPermission() // kapoor 
        GoogleSignin.configure({
            webClientId: WEB_CLIENT_ID,
            offlineAccess: true,
            hostedDomain: "",
            loginHint: "",
            forceConsentPrompt: true
        });
        // this._isSignedIn();
        // if(this.props.navigation.getParam('from')=="logOut")
        if (this.props?.route?.params?.from == "logOut") {
            AsyncStorage.removeItem("login_type");
            // if(this.props.navigation.getParam("type")=="google")
            if (this.props?.route?.params?.type == "google") {
                // console.log("comBack===>",this.props.navigation.getParam("type"))
                console.log("comBack===>", this.props?.route?.params?.type)
                this.signOut()
            }
            // if(this.props.navigation.getParam("type")=="facebook")
            if (this.props?.route?.params?.type == "facebook") {
                console.log("comBack===>", this.props?.route?.params?.type)
                // LoginManager.logOut()
            }
        }
    }

    _isSignedIn = async () => {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
            this._getCurrentUserInfo();
        } else {
            console.log("Please Login");
        }
        this.setState({ gettingLoginStatus: false });
    };

    _getCurrentUserInfo = async () => {
        try {
            const userInfo = await GoogleSignin.signInSilently();
           // console.log("User Info --> ", userInfo);
            this.SocialSignUp("google", userInfo)
            // socialData = userInfo;
            // this.signOut();
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_REQUIRED) {
                // alert("User has not signed in yet");
                console.log("User has not signed in yet");
            } else {
                // alert("Something went wrong. Unable to get user's info");
                console.log("Something went wrong. Unable to get user's info");
            }
            this.setState({ isLoading: false })
        }
    };

    comeBack(data, type) {
        this.setState({ isLoading: true })
        console.log("comBack", data, "===>", type)
        if (data == "signUp") {
            if (type == "google") {
                console.log("comBack", data, "===>", type)
                this._signIn()
            }
            if (type == "facebook") {
                console.log("comBack", data, "===>", type)
                this._fbAuth()
            }
        }
    }

    signOut = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
        } catch (error) {
            console.error(error);
        }
    };

    _signIn = async () => {
        if (!this.state.agreed) {
            Toast.show("Please accept the Terms & Conditions and Privacy Policy", Toast.SHORT)
            return;
        }
        try {
            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true
            });
            const userInfo = await GoogleSignin.signIn();
           // console.log("User Info  --> ", JSON.stringify(userInfo));
            this.SocialSignUp("google", userInfo)
        } catch (error) {
            console.log("Message", error.message);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log("User Cancelled the Login Flow");
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log("Signing In");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log("Play Services Not Available or Outdated");
            } else {
                console.log("Some Other Error Happened");
            }
        }
    };

    _fbAuth() {
        if (!this.state.agreed) {
            Toast.show("Please accept the Terms & Conditions and Privacy Policy", Toast.SHORT)
            return;
        }
        console.log("fbAuth+++++++>")
        if (LoginManager !== null) {
            LoginManager.logOut()
        }
        LoginManager.logInWithPermissions(["email", "public_profile"]).then(
            (result) => {
                console.warn("result==", result)
                if (result.isCancelled) {
                    console.log("loging cancelled");
                } else {
                    AccessToken.getCurrentAccessToken().then(data => {
                        let accessToken = data.accessToken;
                        const responseInfoCallback = (error, result) => {
                            console.log("fbAuth++++++++++++>>>>>>" + JSON.stringify(result))

                            if (error) {
                                console.log(error);
                                alert(
                                    "Error fetching data: " + error.toString()
                                );
                            } else {
                                console.log("123456jhbacj" + JSON.stringify(result));
                                this.SocialSignUp("facebook", result)
                            }
                        };
                        const infoRequest = new GraphRequest(
                            "/me", {
                            accessToken: data.accessToken,
                            parameters: {
                                fields: {
                                    string: "email,name,first_name,middle_name,last_name"
                                }
                            }
                        },
                            responseInfoCallback
                        );
                        new GraphRequestManager()
                            .addRequest(infoRequest)
                            .start();
                    });
                }
            },
            function (error) {
                console.log("An error occured: " + error);
            }
        );

    };

    SocialSignUp(type, userInfo) {
        AsyncStorage.setItem("login_type", type);
        this.setState({ isLoading: true }, () => {
            Utils.ApiPost(`${R.constants.Api.SocialSignup}${type}&name=${type == 'google' ? userInfo.user.givenName + userInfo.user.familyName : userInfo.first_name + userInfo.last_name}&email=${type == 'google' ? userInfo.user.email : userInfo.email}`, response = (data) => {
                console.log('SocialSignup data==response= ' + type + '===>', JSON.stringify(data))
                if (data.res == 200) {
                    if (data.data.res_status == "success") {
                        this.saveDeviceId(data.data.user_id, type)
                    }
                    else if (data.data.res_status == "inactive") {
                        this.setState({ isLoading: false })
                        this.signOut()
                        Toast.show("Your account is inactive, please contact customer care by visiting dadio.in", Toast.SHORT)
                    }
                }
            })
        })
    }

    saveDeviceId = (user_id, type) => {
        try {
            console.log("==user_id==", user_id)
            Utils.getData(
                'fcmToken',
                (value = data => {
                    console.log("Landing index.js FCM: ",data.value)
                    if (data != null && data != "" && data != undefined) {
                        Utils.ApiPost(
                            `${R.constants.Api.sendDeviceId}${user_id}&device_token=${data.value}`,
                            (response = data => {
                                if (data.res == 200) {
                                    console.log("firebase save res>>>", data.res )
                                    this.getProfileDetails(type, user_id)
                                    if (data.data.res_status == 'success') {
                                        console.log('save-deviceId', data);
                                    }
                                } else {
                                    this.getProfileDetails(type, user_id)
                                }
                            }),
                        );
                    } else {
                        this.getProfileDetails(type, user_id)
                    }
                }),
            );
        } catch (ex) {
            this.getProfileDetails(type, user_id)
            console.log(ex)
        }
    }

    getProfileDetails(type, id) {
        console.log("===getProfile==>>")
        Utils.ApiPost(`${R.constants.Api.basicInfo}${id}`, response = (data) => {
            console.log("basicInfo service landing===>", data.data)

            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    //  console.log("basicInfo service===>", data.data.profile_pic)
                    this.setState({ isLoading: false }, () => {
                        if (data.data.profile_pic == "") {
                            this.props.navigation.navigate("AfterSignUp", { "from": type, "data": data.data, "screen": 1, "comeBack": this.comeBack.bind(this) })
                        }
                        else if (data.data.audio_file == "https://dadio.in/apps/uploads/") {
                            this.props.navigation.navigate("AfterSignUp", { "from": type, "data": data.data, "screen": 2, "comeBack": this.comeBack.bind(this) })
                        }
                        else if (data.data.gender == "" || data.data.age == "01/01/1995") {
                            this.props.navigation.navigate("AfterSignUp", { "from": type, "data": data.data, "screen": 3, "comeBack": this.comeBack.bind(this) })
                        }
                        else {
                            Utils.storeData("userData", JSON.stringify(data.data))
                            Toast.show("Login Sucessful!", Toast.SHORT)
                            this.props.navigation.replace("Dashboard", { "from": type })
                        }
                    })
                }

            }
        })
    }



    render() {

        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <Image
                        source={R.images.t1}
                        style={{ position: 'absolute', top: 0, left: 0, height: 120, width: 180, zIndex: 5 }}
                    />
                    <Image
                        source={R.images.t2}
                        style={{ position: 'absolute', bottom: 0, right: 0, height: 120, width: 180 }}
                    />
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                            source={R.images.logo}
                            style={{ height: 120, width: 190 }}
                        />
                    </View>
                    <View style={{ flex: 2, padding: 20 }}>
                        <Button btnPress={() => this._navEmailLogin()} iconName={"user"} btnStyle={{ backgroundColor: R.colors.lightBlue }} btnText={"User Login"} />
                        <Button btnPress={() => this._signIn()} iconName={"google"} btnStyle={{ backgroundColor: R.colors.red }} btnText={"Login with Google"} />
                        <Button btnPress={() => this._fbAuth()} iconName={"facebook"} btnStyle={{ backgroundColor: R.colors.blue }} btnText={"Login with Facebook"} />
                        <View style={{ flexDirection: 'row', marginHorizontal: 20, marginVertical: 10 }}>
                            <TouchableOpacity onPress={() => this.setState({ agreed: !this.state.agreed })}>
                                <CIcon name={this.state.agreed ? "checkbox-marked" : "checkbox-blank-outline"} size={25} color="#232323" />
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingLeft: 5, }}>
                                <TextView textStyle={{ fontSize: 14, color: '#232323' }} textValue={"I accept the "} />
                                <TouchableOpacity onPress={() => {
                                    this.props.navigation.navigate("WebViewScreen", { url: 'https://dadio.in/terms-of-use.html' })
                                }}>
                                    <TextView textStyle={{ fontSize: 14, color: R.colors.cyan }} textValue={"Terms & Conditions"} />
                                </TouchableOpacity>
                                <TextView textStyle={{ fontSize: 14, paddingHorizontal: 5, color: '#232323' }} textValue={" and "} />
                                <TouchableOpacity onPress={() => {
                                    this.props.navigation.navigate("WebViewScreen", { url: 'https://dadio.in/privacy-policy.html' })
                                }}>
                                    <TextView textStyle={{ fontSize: 14, color: R.colors.cyan }} textValue={"Privacy Policy"} />
                                </TouchableOpacity>
                            </View>
                            {/* <Text style={{ fontSize: 16, paddingHorizontal: 5, color: '#232323' }}>
                                I accept the Terms & Conditions and Privacy Policy
                            </Text> */}
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            {/* <TextView textStyle={{ fontSize: 12 }} textValue={"Register or Login means you agree with the following"} /> */}
                            <TextView textStyle={{ fontSize: 12 }} textValue={"Accepting the Terms & Conditions & Privacy Policy is mandatory to register, login & using the app."} />
                            {/* <TouchableOpacity>
                                <TextView textStyle={{ fontSize: 12, color: R.colors.cyan }} textValue={"Terms & Conditions"} />
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </View>
                {this.state.isLoading &&
                    <View style={{ zindex: 1, backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader />
                    </View>
                }
            </View>
        )
    }
}