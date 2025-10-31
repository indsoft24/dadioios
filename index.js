import { AppRegistry, DeviceEventEmitter, AppState } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import RNNotificationCall from 'react-native-full-screen-notification-incoming-call';
import messaging from '@react-native-firebase/messaging';
import uuid from 'react-native-uuid';
import InCallManager from 'react-native-incall-manager';
import AsyncStorage from '@react-native-community/async-storage';
import notifee, { AndroidImportance, EventType, AndroidCategory } from '@notifee/react-native';
import Utils from './src/res/Utils';
import R from './src/res/R';

let isNotifeeListenersRegistered = false;

notifee.onBackgroundEvent(async ({ type, detail }) => {

  //  console.log("==index.js=call onForegroundEvent===")

  AsyncStorage.getItem("call_data").then(async data => {
    console.log("===call onBackgroundEvent===", JSON.parse(data))
    if (data != null && data != "" && data != undefined) {
      await handleNotifeeEvent(true, type, detail.pressAction, JSON.parse(data));
    }
  });
});

notifee.onForegroundEvent(async ({ type, detail }) => {
  //console.log("==index.js=call onForegroundEvent===")

  AsyncStorage.getItem("call_data").then(async data => {
    // console.log("==index.js=call onForegroundEvent===", JSON.parse(data))
    if (data != null && data != "" && data != undefined) {
      await handleNotifeeEvent(false, type, detail.pressAction, JSON.parse(data));
    }
  });
});

const disconnetCall = async (remoteData) => {
  try {

    globalThis.preventDismissLoop = false;
    InCallManager?.stopRingtone();

    let user_id = ''
    await Utils.getData(
      'userData',
      (value = data => {
        user_id = JSON.parse(data.value).user_id;
      }),
    );
    console.log("==index.js===disconnetCall()=============", "userId>>", user_id, "incomingcall_id>>", remoteData.incomingcall_id)

    await Utils.ApiPost(
      `${R.constants.Api.endCall}${remoteData.incomingcall_id}&user_id=${user_id}`,
      (response = data => {
        try {
          console.log('endCall====>', data);
        } catch (ex) {
          console.log(ex)
        }
      }),
    );
    await notifee.cancelAllNotifications();
  } catch (ex) {
    await notifee.cancelAllNotifications();
    console.log('disconnectCall error', ex);
  }
};

const endCallNotificaiton = async (data) => {
  try {
    console.log("===index.js==endCallNotificaiton()=============", data.notification_type)
    globalThis.preventDismissLoop = false;
    InCallManager?.stopRingtone();

    await AsyncStorage.setItem("call_status", data.notification_type);
    await DeviceEventEmitter.emit('call_listen', { call_status: 'end_call', data });

    await notifee.cancelAllNotifications();
  } catch (ex) {
    console.log('disconnectCall error', ex);
  }
};

const handleNotifeeEvent = async (isBackground, type, pressAction, remoteMessage) => {
  try {

    console.log("===index.js=handleNotifeeEvent===->", pressAction)

    if (type === EventType.DISMISSED) {
      globalThis.preventDismissLoop = true;
      await displayLocalNotification(remoteMessage); // Re-show
    } else if (type === EventType.PRESS) {
      console.log('Notification pressed');
    }

    if (pressAction?.id === 'action1') { // Decline
      globalThis.cancelNotification = false
      disconnetCall(remoteMessage)

      console.log("===index.js=handleNotifeeEvent===action1->", type, pressAction)
    } else if (pressAction?.id === 'action2') { // Receive
      console.log("===index.js=handleNotifeeEvent===action2->", pressAction)

      //      await AsyncStorage.setItem("MyCallData", JSON.stringify(remoteMessage));

      globalThis.cancelNotification = false
      try {
        InCallManager?.stopRingtone();

        await AsyncStorage.setItem("call_status", "answer_call");
        AsyncStorage.getItem("call_data").then(async data => {
          const callInfo = JSON.parse(data);
          if (callInfo.notification_type == 'incoming_call') {
            DeviceEventEmitter.emit('call_listen', { call_status: 'answer_call', data: callInfo });
            console.log('CALL RECIEVE COMPLETE !');
          }
        });

        notifee.cancelAllNotifications();
      } catch (ex) {
        console.log(ex)
      }
    }
  } catch (ex) {
    console.log('handleNotifeeEvent error', ex);
  }
};

const displayLocalNotification = async (remoteMessage) => {
  try {

    await AsyncStorage.setItem("call_data", JSON.stringify(remoteMessage));
    const channelId = await notifee.createChannel({
      id: 'incoming_call_channel',
      name: 'Incoming Call',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: remoteMessage.title,
      body: remoteMessage.body,
      data: remoteMessage,
      android: {
        channelId,
        ongoing: true,
        autoCancel: false,
        smallIcon: 'ic_launcher',
        importance: AndroidImportance.HIGH,
        alarmManager: { allowWhileIdle: true },
        allowWhileIdle: true,
        category: AndroidCategory.CALL,
        fullScreenAction: { id: 'default' },
        actions: [
          { title: 'Decline', pressAction: { id: 'action1' } },
          { title: 'Receive', pressAction: { id: 'action2', launchActivity: 'default' } },
        ],
      },
    });

  } catch (ex) {
    console.log('displayLocalNotification error', ex);
  }
};

messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    const { data } = remoteMessage;
    console.log("===setBackgroundMessageHandler===", data)
    if (data.notification_type === 'incoming_call') {
      displayLocalNotification(data);
      InCallManager.startRingtone('_BUNDLE_');
    } else if (data.notification_type === 'end_call') {
      endCallNotificaiton(data)
    } else if (data.notification_type === 'decline_call') {
      endCallNotificaiton(data)
    }
  } catch (ex) {
    console.log('backgroundMessageHandler error', ex);
  }
});

AppRegistry.registerComponent(appName, () => App);