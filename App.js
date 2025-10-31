import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  AppState,
  BackHandler,
  DeviceEventEmitter,
  NativeModules,
  Platform,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import messaging, {firebase} from '@react-native-firebase/messaging';
import R from './src/res/R';
import RootNavigator from './src/res/Routes';
import Utils from './src/res/Utils';
import RNNotificationCall from 'react-native-full-screen-notification-incoming-call';
// import IncomingCall from './src/native_modules/IncomingCall';
import notifee, {
  AndroidCategory,
  AndroidImportance,
  EventType,
} from '@notifee/react-native';
import appsFlyer from 'react-native-appsflyer';
import crashlytics from '@react-native-firebase/crashlytics';
import RNCallKeep from 'react-native-callkeep';
import {PERMISSIONS, RESULTS, requestMultiple} from 'react-native-permissions';
import InCallManager from 'react-native-incall-manager';
import VersionCheck from 'react-native-version-check';
import AppLink from 'react-native-app-link';
const {IncomingCall} = NativeModules;
const isAndroid = Platform.OS === 'android';

var isDashboardMountedGlobal = false;
var lastEndCallNotification = null;
var userDataTemp = null;

const App = () => {
  const appState = useRef(AppState.currentState);
  const [Call_Alert_Visibility, setCallAlertVisibility] = useState(false);
  const [callData, setCallData] = useState('');
  const [callId, setCallId] = useState('');
  const [isDashboardMounted, setDashboardMounted] = useState(false);
  const [appStateLocal, setAppState] = useState(appState);
  const [allOkPermission, setPermissionOk] = useState(false);
    const [currentVersion, setCurrentVersion] = useState('');
  const [latestVersion, setLatestVersion] = useState('');
  const [updateNeeded, setUpdateNeeded] = useState(false);
  console.log(latestVersion,"&&&&&&&&&&&&&&&")
  console.log(updateNeeded,"********************")
  const appsFlyerOptions = {
    devKey: 'kaCbhVJzxNE4iTJ67CFPmK',
    isDebug: true,
    // appId: Platform.OS === 'ios' ? 'id123456789' : undefined,
    onInstallConversionDataListener: true,
  };

  appsFlyer.initSdk(
    appsFlyerOptions,
    result => {
      console.log('AppsFlyer SDK initialized:', result);
    },
    error => {
      console.log('AppsFlyer SDK init error:', error);
    },
  );
//  useEffect(() => {
//   const checkVersion = async () => {
//     try {
//       const currentVersion =VersionCheck.getCurrentVersion(); 
//       const latestVersion = await VersionCheck.getLatestVersion();
//       const updateNeeded = await VersionCheck.needUpdate({
//         currentVersion,
//         latestVersion,
//       });

//       console.log({ currentVersion, latestVersion, updateNeeded });

//       if (updateNeeded?.isNeeded) {
//         Alert.alert(
//           'Update Available',
//           'Please update the app to continue.',
//           [
//             {
//               text: 'Update Now',
//               onPress: () => {
//                 AppLink.openInStore({
//                   appName: 'Dadio',
//                   playStoreId: 'com.dadio.app',
//                 });
//               },
//               style: 'default',
//             },
//           ],
//           { cancelable: false } // 👈 disables dismissing with back button/tap outside
//         );
//       }
//     } catch (error) {
//       console.error('Version Check Failed:', error);
//     }
//   };

//   checkVersion();
// }, []);
useEffect(() => {
  const checkVersion = async () => {
    try {
      const currentVersion = VersionCheck.getCurrentVersion(); 
      const latestVersion = await VersionCheck.getLatestVersion();
      const updateNeeded = await VersionCheck.needUpdate({
        currentVersion,
        latestVersion,
      });

      console.log({ currentVersion, latestVersion, updateNeeded });

      if (updateNeeded?.isNeeded) {
        Alert.alert(
          'Update Available',
          'Please update the app to continue.',
          [
            {
              text: 'Update Now',
              onPress: () => {
                AppLink.openInStore({
                  appName: 'Dadio',
                  playStoreId: 'com.dadio.app',
                });
                // फिर से चेक करें जब यूज़र स्टोर से वापस आए
                checkVersion();
              },
              style: 'default',
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Version Check Failed:', error);
    }
  };

  checkVersion();

  // ऐप state changes (background/foreground) के लिए लिसनर
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      checkVersion();
    }
  });

  return () => {
    subscription.remove();
  };
}, []);
  useEffect(() => {
    const subscribeAppState = AppState.addEventListener(
      'change',
      _handleAppStateChange,
    );
    checkPermission();

    _updateUserStatus(0);
    //new CallService().setup();

    const delay = ms => new Promise(res => setTimeout(res, ms));

    DeviceEventEmitter.addListener('call_listen', async data => {
      console.log('call_listen====================', data);
      await delay(4000); // wait 3 seconds

      if (data) {
        if (data.call_status === 'answer_call') {
          DeviceEventEmitter.emit('receive_call', {data: data.data});
          DeviceEventEmitter.emit('recieve', {data: data.data});
        } else if (data.call_status == 'end_call') {
          console.log('decline_call ======> in call_listen');
          DeviceEventEmitter.emit('decline_call', {data: data.data});
        }
        await AsyncStorage.removeItem('call_status');
        await AsyncStorage.removeItem('call_data');
      }
    });

    DeviceEventEmitter.addListener('decline_call', () => {
      setCallId('');
    });
    DeviceEventEmitter.addListener('end_call', () => {
      setCallId('');
    });
    DeviceEventEmitter.addListener('dashboardMounted', () => {
      IncomingCall?.dashboardMounted(); //added ?
      console.log('dashboard mounted');
      setDashboardMounted(true);
      isDashboardMountedGlobal = true;
      getDataFromStorage();
    });
    DeviceEventEmitter.addListener('dashboardUnmounted', () => {
      IncomingCall?.dashboardUnMounted(); //added ?
      setDashboardMounted(false);
      isDashboardMountedGlobal = false;
    });
    DeviceEventEmitter.addListener('incomingcall', res => {
      //Do something!
      if (callId != res.data.incomingcall_id) {
        setCallId(res.data.incomingcall_id);
        IncomingCall.stopRingtone();
        console.log('Stop Ringtone');
        console.log('incomingcall : ', res);
        if (res.action === 'answer') {
          //DeviceEventEmitter.emit('receive_call', {data: res.data});
          recieveCall(res.data);
        } else {
          console.log(
            'decline_call ======> in incomingcall listener in useeffect',
          );
          // DeviceEventEmitter.emit('decline_call', {data: res.data});
          declineCall(res.data);
        }
      }
    });

    return () => {
      subscribeAppState.remove();
    };
  }, []);

  async function toggleCrashlytics() {
    await crashlytics().setCrashlyticsCollectionEnabled(true);
  }

  useEffect(() => {
    toggleCrashlytics();
    setupCallKeep();
  }, []);

  async function getDataFromStorage() {
    await AsyncStorage.getItem('call_status').then(data => {
      //  console.log('call information ==============================', data);
      if (!data) {
        return;
      }
      setTimeout(async () => {
        let call_data = await AsyncStorage.getItem('call_data');

        if (call_data) {
          const callInfo = JSON.parse(call_data);
          // console.log(
          //   'call data======================== ',
          //   callInfo,
          //   callInfo.notification_type,
          // ); //kapoor
          if (data == 'end_call') {
            console.log('decline_call ======> in getDataFromStorage');
            DeviceEventEmitter.emit('decline_call', {data: callInfo});
          } else if (data == 'answer_call') {
            recieveCall(callInfo);
          }
          await AsyncStorage.removeItem('call_status');
          await AsyncStorage.removeItem('call_data');
        }
      }, 1000);
    });
  }

  useEffect(() => {
    // Register a listener for when a notification is received while the app is in the background
    const backgroundNotificationListener = notifee.onBackgroundEvent(
      async ({type, detail}) => {
        if (type === EventType.ACTION_PRESS) {
          const {notification, pressAction} = detail;
          // Handle the notification response here, such as navigation or data processing
          const data = notification.data;
          console.log('User responded to notification:', detail, type);
          if (pressAction.id === 'answer-call') {
            if (data.notification_type == 'incoming_call') {
              //console.log(data.notification_type)
              setCallId(data?.incomingcall_id);
              recieveCall(data);
              // DeviceEventEmitter.emit('incoming_call', { data: data });
              // firebase.notifications().removeAllDeliveredNotifications();
            }
          } else if (pressAction?.id === 'action2') {
            try {
              notifee.cancelAllNotifications();
            } catch (ex) {
              console.log(ex);
            }
            setCallId(data?.incomingcall_id);
            recieveCall(data);
          } else {
            setCallId(data.incomingcall_byid);
            console.log('CALL DECLINED !');
            console.log(
              'decline_call ======> in background notification listener',
            );
            DeviceEventEmitter.emit('decline_call', {data: data});
          }
        }
      },
    );

    // Clean up the listener when the component unmounts
    return () => {
      // backgroundNotificationListener
    };
  }, []);

  useEffect(() => {
    // setTimeout(() => {
    //checkInitialNotification()
    attendBackgroundCall();
    //  }, 4000)
    // attendBackgroundCall()
  }, []);

  async function checkInitialNotification() {
    Toast.show('checkInitialNotification====', Toast.SHORT);
    const initialNotification = await notifee.getInitialNotification();
    Toast.show(
      'checkInitialNotification====' + initialNotification,
      Toast.SHORT,
    );

    console.log(
      '============checkInitialNotification==============',
      initialNotification,
    );
    if (initialNotification) {
      // Access the notification object
      const notification = initialNotification.notification;
      const pressAction = initialNotification.pressAction;

      console.log(
        '=====notification==pressAction=',
        notification,
        '  ',
        pressAction,
      );

      if (data?.notification_type == 'incoming_call') {
        setCallId(callInfo?.incomingcall_id);
        recieveCall(data);
      }

      // For action buttons
      // if (pressAction?.id === 'action2' ) {
      //   const data = notification?.data;
      //   console.log('Action clicked:', pressAction.id, 'with data:', data);

      //   if (data?.notification_type == "incoming_call") {
      //     await AsyncStorage.setItem("call_status", "answer_call");
      //     DeviceEventEmitter.emit('call_listen', { call_status: 'answer_call', data: data });
      //   }
      // }
    } else {
      console.log('No initial notification on app start.');
    }
  }

  const attendBackgroundCall = async () => {
    try {
      console.log(
        '=============================111======================================================',
      );

      AsyncStorage.getItem('MyCallData').then(async myData => {
        console.log(
          '===============================22222====================================================',
        );

        console.log('==attendBackgroundCall=callInfo=>>', MyCallData);

        let data = JSON.parse(myData);
        if (
          (data != null && data != undefined && data != '',
          data?.notification_type == 'incoming_call')
        ) {
          const callInfo = JSON.parse(data);
          setCallId(callInfo?.incomingcall_id);
          recieveCall(data);
        }

        await AsyncStorage.setItem('MyCallData', '');
      });

      // let isBackgroundStep = null
      // for (let attempt = 0; attempt < 4; attempt++) {
      //   isBackgroundStep = await AsyncStorage.getItem('isBackground');
      //   console.log("====loop==========attendBackgroundCall====attempt======", attempt)
      //   Toast.show("isBackgroundStep" + isBackgroundStep, Toast.SHORT)
      //   if (isBackgroundStep == "1") break;
      //   await new Promise(resolve => setTimeout(resolve, 500));  // wait 500ms
      // }

      // if (isBackgroundStep == "1") {
      //   await AsyncStorage.setItem("isBackground", "0");
      //   await AsyncStorage.setItem("call_status", "answer_call");
      //   AsyncStorage.getItem("call_data").then(async data => {
      //     const callInfo = JSON.parse(data);
      //     console.log("=====attendBackgroundCall=callInfo=>>", callInfo)
      //     setCallId(callInfo?.incomingcall_id);
      //     recieveCall(data);
      //   });
      // } else {
      //   await AsyncStorage.setItem("isBackground", "0");
      // }
    } catch (ex) {
      await AsyncStorage.setItem('MyCallData', '');
      AsyncStorage.setItem('isBackground', '0');
      console.log('attendBackgroundCall=>>', ex);
    }
  };

  useEffect(() => {
    // console.log("IncomingCall", IncomingCall);
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      try {
        console.log(
          'foreground message' + userDataTemp?.email_id + ' :',
          JSON.stringify(remoteMessage),
        );

        const data = remoteMessage.data;
        console.log('On Notification ==>', data, isDashboardMountedGlobal);

        try {
          if (
            data.notification_type === 'end_call' ||
            data.notification_type === 'decline_call'
          ) {
            // await notifee.cancelNotification(data.incomingcall_id)
            await notifee.cancelAllNotifications();
          } else {
          }
        } catch (ex) {
          console.log(ex);
        }
        if (isDashboardMountedGlobal) {
          // console.log("inner");
          //setTimeout(()=>{},100);
          setCallId(data?.incomingcall_id);
          displayBanner(
            'foreground',
            remoteMessage?.notification?.title,
            remoteMessage?.notification?.body,
            data,
          );
        }
      } catch (ex) {
        console.log(ex);
      }
    }, []);

    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log('App to open from background state:', remoteMessage); // all comment kapoor

      // console.log('notificationOpen====background====>', remoteMessage);
      // if (remoteMessage.data != null && remoteMessage.data != undefined && Object.keys(remoteMessage.data).length > 0) {
      //   const { title, body } = remoteMessage.notification;
      //   const data = remoteMessage.data;
      //   // const {title, body, data} = notificationOpen.notification;

      //   //Incoming Call Handling with notification

      //   if (remoteMessage.data.notification_type && remoteMessage.data.notification_type === 'incoming_call') {
      //     recieveCall(data);
      //   } else if (
      //     remoteMessage.data.notification_type &&
      //     remoteMessage.data.notification_type === 'decline_call'
      //   ) {
      //     console.log('decline_call ======> in onNotificationOpenedApp');
      //     declineCall(data);
      //   } else if (title == undefined) {
      //     // console.log('data====>', data);
      //     displayBanner('background', data.notification_type, '', data);
      //   }
      // }
    });
    return () => {
      unsubscribe;
    };
  }, []);

  const answerCall = ({callUUID}) => {
    console.log('calluuid', callUUID);
  };

  async function setupCallKeep() {
    await new Promise(resolve => {
      // console.log('setup call keep done in promise');
      setupCallKeepFunc().then(resolve);
    });
  }

  async function setupCallKeepFunc() {
    const granted = await requestMultiple([
      PERMISSIONS.ANDROID.READ_PHONE_NUMBERS,
      PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
    ]);
    if (granted[PERMISSIONS.ANDROID.READ_PHONE_NUMBERS] !== RESULTS.GRANTED) {
      return;
    }

    if (Platform.Version >= 33) {
      if (granted[PERMISSIONS.ANDROID.POST_NOTIFICATIONS] !== RESULTS.GRANTED) {
        Alert.alert(
          'Permission',
          'Please allow the notification permission to make and manage phone calls.',
          [
            {
              text: 'Allow',
              onPress: () => {
                setupCallKeep();
              },
            },
            {
              text: 'Cancel',
              onPress: () => {
                BackHandler.exitApp();
              },
              style: 'cancel',
            },
          ],
          {
            cancelable: false,
          },
        );
        return;
      }
    }
    setPermissionOk(true);
    if (isAndroid) {
      RNCallKeep.setAvailable(true);
    }
    registerEvent();
  }
  function registerEvent() {
    isAndroid &&
      RNCallKeep.addEventListener('answerCall', onCallKeepAnswerCallAction);
    RNCallKeep.addEventListener('endCall', onCallKeepEndCallAction);
  }

  function onCallKeepAnswerCallAction(answerData) {}
  function onCallKeepEndCallAction(answerData) {}

  const checkPermission = async () => {
    // const enabled = await firebase.messaging().hasPermission();
    // If Premission granted proceed towards token fetch
    //  console.log('enabled====>', enabled);

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONA;

    console.log('enabled====>', enabled);

    if (enabled) {
      getToken();
    } else {
      // If permission hasn’t been granted to our app, request user in requestPermission method.
      requestPermission();
    }

    // Setting Up Channel for recieving notification messages.
    // let channel = new firebase.notifications.Android.Channel(
    //   'incoming_call',
    //   'Dadio',
    //   firebase.notifications.Android.Importance.Max,
    // ).setDescription('A Channel for Incoming Call');

    //Creating the above mentioned channel
    // firebase.notifications().android.createChannel(channel);
    await notifee.createChannel({
      id: 'incoming_call',
      name: 'Dadio',
      lights: false,
      vibration: true,
      importance: AndroidImportance.HIGH,
    });
    console.log('Channel Created');
  };

  const requestPermission = async () => {
    try {
      const authStatus = await firebase.messaging().requestPermission();

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        fcmToken = await getToken();
      }
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  };

  const getToken = async () => {
    Utils.getData(
      'fcmToken',
      (value = data => {
        console.log('hello vinod', data);
        if (data.value == null) {
          generateToken();
        } else {
          // console.log('0===fcmToken==  ' + data);
          // await AsyncStorage.setItem('fcmToken', fcmToken);
        }
      }),
    );
  };

  const generateToken = async () => {
    await messaging().registerDeviceForRemoteMessages();
    console.log('hello vinod generate');
    try {
      let fcmToken = await firebase.messaging().getToken();
      console.log('fcm token generating', fcmToken);
      if (fcmToken) {
        console.log('8===fcmToken==  ' + JSON.stringify(fcmToken));
        // await AsyncStorage.setItem('fcmToken', fcmToken);
        Utils.storeData('fcmToken', fcmToken);
      }
    } catch (ex) {
      console.log('===generate token error==', ex);
    }
  };

  const _handleAppStateChange = nextAppState => {
    console.log('nextAppState,,,,,,+>>>', nextAppState);
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      setAppState(nextAppState);
      console.log('App.js has come to the foreground!');
      _updateUserStatus(0);
    }
    if (
      appState.current.match(/active/) &&
      (nextAppState === 'background' || nextAppState === 'inactive')
    ) {
      setAppState(nextAppState);
      console.log('App has come to background');
      _updateUserStatus(1);
    }
    appState.current = nextAppState;
  };

  const _updateUserStatus = type => {
    Utils.getData(
      'userData',
      (value = data => {
        var userData = JSON.parse(data.value);
        userDataTemp = userData;
        // this.setState({user_id:userData.user_id})
        // console.log(userData);
        if (userData !== undefined) {
          // console.log(
          //   `${R.constants.Api.updateOnlineStatus}${userData.user_id}&type=${type == 0 ? 'online' : 'offline'
          //   }`,
          // );
          Utils.ApiPost(
            `${R.constants.Api.updateOnlineStatus}${userData.user_id}&type=${
              type == 0 ? 'online' : 'offline'
            }`,
            (response = data => {
              if (data.res == 200) {
                if (data.data.res_status == 'success') {
                  type == 0
                    ? null
                    : Utils.storeData('activeCall', false, 'appJS');
                  // console.log('updateOnlineStatus===>', data.data);
                }
              } else {
                // this.setState({ isLoading: false });
                // Toast.show("please check your internet.",Toast.SHORT)
              }
            }),
          );
        }
      }),
    );
  };

  const recieveCall = data => {
    setCallId(data.incomingcall_byid);
    DeviceEventEmitter.emit('receive_call', {data: data});
    DeviceEventEmitter.emit('recieve', {data: data});
    // console.log('CALL RECIEVE COMPLETE !');
    // firebase.notifications().removeAllDeliveredNotifications();
  };

  const declineCall = data => {
    setCallId(data.incomingcall_byid);
    // console.log('CALL DECLINED !');
    InCallManager?.stopRingtone();
    console.log('decline_call ======> in declineCall function');
    DeviceEventEmitter.emit('decline_call', {data: data});
    // firebase.notifications().removeAllDeliveredNotifications();
  };

  const displayBanner = (type, title, body, data) => {
    // console.log("testing");
    // console.log('type===>>', type);
    // console.log('title==>>', title);
    // console.log('body===>>', body);
    // console.log('data===>>', data);

    // if(title=="Incoming Call"){
    // 	DeviceEventEmitter.emit("incoming_call",{"data":data})
    // }
    if (data.notification_type == 'incoming_call') {
      //console.log(data.notification_type)
      DeviceEventEmitter.emit('incoming_call', {data: data});
      // firebase.notifications().removeAllDeliveredNotifications();
    }
    if (
      data.notification_type == 'like_unlike' ||
      data.notification_type == 'chat_message'
    ) {
      if (type == 'foreground') {
        // RNNotificationBanner.Show({
        //   type: 1,
        //   title: title,
        //   subTitle: body,
        //   duration: 5000,
        //   dismissable: true,
        // });
        // console.log("message in chat")

        // onDisplayNotification(
        //   { title: title, body: body },
        //   data.notification_type,
        // ); // kapoor

        // notifee.displayNotification({
        //   type: 1,
        //   title: title,
        //   subTitle: body,
        //   duration: 5000,
        //   dismissable: true,
        // });
        DeviceEventEmitter.emit('update_footer', {data: data});
      }
      if (type == 'background') {
        if (data.notification_type == 'like_unlike') {
          DeviceEventEmitter.emit('update_footer', {data: data, nav: 2});
        }
        if (data.notification_type == 'chat_message') {
          DeviceEventEmitter.emit('update_footer', {data: data, nav: 4});
        }
      }
    }
    if (data.notification_type == 'decline_call') {
      try {
        console.log(
          'decline_call ======> in displaybanner function' +
            lastEndCallNotification,
        );

        if (!lastEndCallNotification) {
          lastEndCallNotification = new Date().getMilliseconds();
          DeviceEventEmitter.emit('decline_call', {data: data});

          setTimeout(() => {
            lastEndCallNotification = null;
          }, 1200);
        }
      } catch (ex) {
        console.log(ex);
      }
      // else if (new Date().getMilliseconds() - lastEndCallNotification > 1000) {
      //   console.log("already decline_call done");
      //   lastEndCallNotification = null;
      // }
    }
    if (data.notification_type == 'receive_call') {
      DeviceEventEmitter.emit('receive_call', {data: data});
    }
    if (data.notification_type == 'end_call') {
      DeviceEventEmitter.emit('end_call', {data: data});
    }
  };

  async function onDisplayFullScreen(data, channel, notificationData) {
    // console.log("onDisplayFullScreen 1111");
    const channelId = await notifee.createChannel({
      id: channel,
      name: channel,
    });
    notifee.displayNotification({
      title: notificationData.title,
      body: notificationData.incomingdisplay_name + ' Calling you',
      data: notificationData,
      android: {
        channelId,
        smallIcon: 'ic_launcher_round',
        color: '#dedede',
        category: AndroidCategory.CALL,
        importance: AndroidImportance.HIGH,
        fullScreenAction: {
          id: 'default',
          launchActivity:
            'com.dadio.app.IncomingCall.IncomingCallScreenActivity',
        },
        actions: [
          {
            title: 'Decline',
            pressAction: {
              id: 'decline-call',
            },
          },
          {
            title: 'Answer',
            pressAction: {
              id: 'answer-call',
              launchActivity: 'com.dadio.app.MainActivity',
            },
          },
        ],
        lightUpScreen: true,
        // asForegroundService: true,
        colorized: true,
      },
    });

    console.log('onDisplayFullScreen 2222');
  }

  async function onDisplayNotification(data, channel) {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: channel,
      name: channel,
    });

    // Display a notification
    await notifee.displayNotification({
      title: data.title,
      body: data.body,
      android: {
        channelId,
      },
    });
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      {allOkPermission && <RootNavigator />}
    </SafeAreaView>
  );
};
export default App;
