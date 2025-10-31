
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import R from '../../res/R';
// import axios from "react-native-axios";
import {Enx, EnxPlayerView, EnxRoom, EnxStream} from 'enx-rtc-react-native';
import Toast from 'react-native-simple-toast';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {each} from 'underscore';
import Utils from '../../res/Utils';
import Loader from '../../res/components/Loader';

import InCallManager from 'react-native-incall-manager';
import PointsPopup from './pointPopup';
import colors from '../../res/Colors';

let callEnd = false;
let res_token = '';
let roomId;
let callId;
let user_id;
let timerIntervelId = 0;
let intervelId = 0;
let count = 0;
let tv = '00:00';
let timerStarted = false;
let callSec = 0;
let callMin = 0;
let callData = '';
let callType = '';
let callStatus = 'Connecting...';
let timer = false;
export default class Call extends React.Component {
  constructor() {
    super();
    this.state = {
      callDetails: '',
      isLoading: true,
      isConnected: false,
      mute: false,
      connect: false,
      localStreamId: '0',
      callStatus: 'Connecting...',
      activeTalkerStreams: [],
      permissionsError: true,
      speaker: false,
      showPointsPopup: false,
      showGiftPopup: false,
      giftsLoading: true,
      noGifts: false,
      gifts: [],
      profile_id: '',
      userData: null,
      timerValue: '00:00',
      localStreamInfo: {
        audio: true,
        video: false,
        audio_only: true,
        data: true,
        maxVideoBW: '400',
        minVideoBW: '300',
        audioMuted: false,
        videoMuted: false,
        name: 'React Native',
        minWidth: '720',
        minHeight: '480',
        maxWidth: '1280',
        maxHeight: '720',
      },
      enxRoomInfo: {
        allow_reconnect: true,
        number_of_attempts: '3',
        timeout_interval: '15',
        playerConfiguration: {
          audiomute: true,
          videomute: true,
          bandwidth: true,
          screenshot: true,
          avatar: true,
          iconHeight: 30,
          iconWidth: 30,
          avatarHeight: 50,
          avatarWidth: 50,
        },
      },
    };

    callEnd = true;
    Enx.initRoom();
    InCallManager.setForceSpeakerphoneOn(false);

    DeviceEventEmitter.addListener('receive_call', res => {
      InCallManager.stopRingback();
      callStatus = 'Connected';
    });

    DeviceEventEmitter.addListener('decline_call', res => {
      InCallManager.stopRingback();
      InCallManager.stop({busytone: '_DTMF_'});
      callStatus = 'Busy';
      timer = false;
      if (callEnd) {
        this.endCall();
      }
    });

    DeviceEventEmitter.addListener('callTimer', res => {
      try {
        this.setState({timerValue: res.data});
      } catch (error) {
        console.log('callTimer error');
      }
    });
  }

  

  componentDidMount() {
    try {
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        this.backAction,
      );

      // Check if params exist before accessing
      if (!this.props.route || !this.props.route.params || !this.props.route.params.callDetails) {
        console.log('Missing route params in Call component');
        this.goBack();
        return;
      }

      Utils.getData(
        'userData',
        (value = data => {
          const userData = JSON.parse(data.value);
          this.setState(
            {
              userData,
              user_id: userData.user_id,
              profile_id: this.props.route.params.callDetails.profile_id,
            },
            () => {
              Utils.getData(
                'activeCall',
                (value = data => {
                  callEnd = true;
                  if (data.value == null || data.value == 'false') {
                    callStatus = 'Connecting...';
                    this.check();
                  } else {
                    clearInterval(timerIntervelId);
                    timerIntervelId = 0;
                    timerStarted = false;
                    callStatus = 'Connected';
                    this.callStatus('from component did mount');
                  }
                }),
              );
            },
          );
        }),
      );

      this.getGifts();
    } catch (error) {
      console.log('Component Did Mount error', error);
      // Fallback navigation if error occurs
      try {
        this.goBack();
      } catch (e) {
        console.log('Error going back', e);
      }
    }
  }
  componentWillUnmount() {
    // callMin=0
    // callSec=0
    timer = false;
    this.backHandler.remove();
    // Enx.disconnect();
  }
  getGifts = () => {
    Utils.ApiPost(
      `${R.constants.Api.giftsForSend}${this.state.user_id}`,
      (response = data => {
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            this.setState({
              noGifts: false,
              gifts: data.data.gift_list,
              giftsLoading: false,
            });
          }
          if (data.data.res_status == 'no_gift') {
            this.setState({noGifts: true, gifts: [], giftsLoading: false});
          }
        }
      }),
    );
  };
  backAction = () => {
    try {
      if (this.props.route && this.props.route.params && this.props.route.params.backFromCall) {
        this.props.route.params.backFromCall();
      }
      console.log('call back press');
      return true; // Prevent default back action
    } catch (error) {
      console.log('Error in backAction', error);
      return false;
    }
  };
  goBack() {
    // clearInterval(intervelId)

    // timerIntervelId=0
    count = 0;
    (res_token = ''), (callId = ''), (roomId = ''), (user_id = '');
    try {
      if (this.props.route && this.props.route.params && this.props.route.params.backFromCall) {
        this.props.route.params.backFromCall();
      }
      if (this.props.navigation) {
        this.props.navigation.goBack();
      }
    } catch (error) {
      console.log('Error in goBack', error);
    }
  }

  endCall = async () => {
    console.log(
      'endCall in call screen: ' + timerIntervelId + ' : ' + intervelId,
    );
    clearInterval(timerIntervelId);
    clearInterval(intervelId);
    callStatus = 'Ended';

    if (callStatus !== 'Connected') {
      console.log('stopRingback');
      InCallManager.stopRingback();
    } else {
      InCallManager.stop();
    }

    try {
      this.setState({timerValue: '00:00'});
      // DeviceEventEmitter.removeAllListeners("decline_call");
      // DeviceEventEmitter.removeAllListeners('callTimer')
    } catch (error) {
      console.log(error);
    }

    console.log(`${R.constants.Api.endCall},"callid=====>",${callId}`);
    callEnd = false;
    try {
      await Utils.ApiPost(
        `${R.constants.Api.endCall}${callId}&user_id=${user_id}`,
        (response = data => {
          try {
            console.log('endCall====>', data);

            // clearInterval(intervelId)
            Utils.storeData('activeCall', false, 'endcall');
            timerStarted = false;
            (callSec = 0), (callMin = 0);
            timerIntervelId = 0;
            intervelId = 0;

            Enx.disconnect();
            this.goBack();
            Toast.show('Call Ended', Toast.SHORT);
          } catch (ex) {
            console.log(ex);
          }
        }),
      );
    } catch (ex) {
      Enx.disconnect();
      this.goBack();
      Toast.show('Call Ended', Toast.SHORT);
      console.log(ex);
    }
    // clearInterval(intervelId)
  };

  getId = async () => {
    await Utils.getData(
      'userData',
      (value = data => {
        // user_id = JSON.parse(data.value.user_id)
        // this.setState({user_id:userData.user_id},()=>{
        // })
        user_id = JSON.parse(data.value).user_id;
        console.log('data.value.user_id====>', JSON.parse(data.value).user_id);
        this.callAction();
        // this.setState({isLoading:false})
      }),
    );
  };

  check = () => {
    console.log('check');
    // Utils.storeData("activeCall",true)
    if (Platform.OS === 'android') {
      this.checkAndroidPermissions()
        .then(() => {
          this.setState({permissionsError: false}, () => {
            this.getId();
          });
        })
        .catch(error => {
          this.setState({permissionsError: true, isLoading: false});
          console.log('checkAndroidPermissions', error);
          Alert.alert(
            'Please allow the reqiured permissions',
            '',
            [{text: 'OK', onPress: () => this.goBack(), style: 'cancel'}],
            {
              cancelable: false,
            },
          );
          return;
        });
    }
  };

  checkAndroidPermissions = () =>
    new Promise((resolve, reject) => {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ])
        .then(result => {
          const permissionsError = {};
          permissionsError.permissionsDenied = [];
          each(result, (permissionValue, permissionType) => {
            if (permissionValue === 'denied') {
              console.log('denied Permission');
              permissionsError.permissionsDenied.push(permissionType);
              permissionsError.type = 'Permissions error';
            }
          });
          if (permissionsError.permissionsDenied.length > 0) {
            console.log('denied Permission');
            reject(permissionsError);
          } else {
            console.log('granted Permission');
            resolve();
          }
        })
        .catch(error => {
          reject(error);
        });
    });

  callAction = async () => {
    callType = this.props.route.params.type;
    callData = this.props.route.params.callDetails;
    this.setState(
      {
        isLoading: false,
      },
      () => {
        // console.log("this.state.callDetails====>",this.props.route.params.callDetails)
        console.log(this.props.route.params.type);
        if (this.props.route.params.type == 'incoming') {
          console.log(
            'this.state.callDetails.incomingtoken====>',
            this.props.route.params.callDetails.incomingtoken,
          );
          // this.setState({isLoading:false},()=>{
          res_token = this.props.route.params.callDetails.incomingtoken;
          roomId = this.props.route.params.callDetails.incomingroom_id;
          callId = this.props.route.params.callDetails.incomingcall_id;
          this.setState({connect: true}, () =>
            Utils.storeData('activeCall', true, 'incoming'),
          );
          // this.callAcceptAction(this.props.route.params.callDetails.incomingcall_id)
          // })
          // this.setState({roomId:,connect:true})
        }
        if (this.props.route.params.type == 'outgoing') {
          this.getRoomID();
          Utils.storeData('activeCall', true, 'outgoing');
        }
      },
    );
  };

  callAcceptAction() {
    try {
      Utils.ApiPost(
        `${R.constants.Api.answerCall}${callId}`,
        (response = data => {
          if (data.data.res_status == 'success') {
            console.log('answerCall=====>', data);
            this.callStatus('from callAcceptAction');
            callStatus = 'Connected';
            timer = true;
            this.isReceivedCallId = true;
            // this.setState({callStatus:'Connected',timer:true},()=>
            this.startTimer();
            // )
          } else if (data.data.res_status == 'error') {
            callType == '';
            Toast.show('Call ended', Toast.SHORT);
            callStatus = 'Ended';
            timer = false;
            clearInterval(timerIntervelId);
            this.endCall();
          }
        }),
      );
    } catch (error) {
      console.log('CallAcception');
    }
  }

  callStatus(message) {
    console.log('callstatus: ' + message);
    try {
      if (intervelId == 0) {
        intervelId = setInterval(() => {
          console.log('intervelId', intervelId);
          console.log(
            '===callId======',
            `${R.constants.Api.callStatus}${callId}`,
          );

          Utils.ApiPost(
            `${R.constants.Api.callStatus}${callId}`,
            (response = data => {
              console.log(
                `callStatus=call/index.js===callId=${callId}=>` +
                  message +
                  '  :',
                data,
              );
              if (data.res == 200) {
                if (data.data.call_status == '50') {
                  console.log('==Call ended ====50 status====>>>>>>>>>>>>>==');
                  Toast.show('Low Points', Toast.SHORT);
                  callStatus = 'Ended';
                  timer = false;
                  clearInterval(timerIntervelId);
                  this.endCall();
                }

                if (data.data.call_status == '10') {
                  Toast.show('Call ended', Toast.SHORT);
                  callStatus = 'Ended';
                  timer = false;
                  clearInterval(timerIntervelId);
                  this.endCall();
                }

                if (data.data.call_status == '20') {
                  // this.ringing(data.data.call_status)
                  callStatus = 'Connecting...';
                  count = count + 2;
                  console.log(count);
                  if (count > 58) {
                    this.endCall();
                  }
                }
                if (data.data.call_status == '30') {
                  console.log(
                    'callStatus 30',
                    this.state.callStatus,
                    '======',
                    this.state.timer,
                  );
                  // InCallManager.stopRingback();
                  callStatus = 'Connected';
                  timer = true;
                  // this.setState({callStatus:'Connected',timer:true},()=>
                  this.startTimer();
                  // )
                }
                if (data.data.call_status == '40') {
                  InCallManager.stopRingback();
                  InCallManager.stop({busytone: '_DTMF_'});
                  // this.setState({callStatus:"Busy."})
                  callStatus = 'Busy';

                  timer = false;
                  // setTimeout(()=>{
                  // InCallManager.stop();
                  //     this.goBack()
                  // },2000)
                }
              }
            }),
          );
        }, 2000);
      }
    } catch (error) {
      console.log('CallStaus');
    }
  }

  getRoomID = async () => {
    try {
      Utils.ApiPost(
        'https://dadio.in/apps/videotest/api/create-room/approomid.php?action=create_room',
        (response = data => {
          console.log('create room local server=========>', data.data.room_id);
          this.createCall(data.data.room_id);
        }),
      );
    } catch (error) {
      console.log('getRoom Id');
    }
  };

  startTimer() {
    try {
      console.log('timer start', timerStarted);
      if (!timerStarted) {
        timerStarted = true;
        if (timerIntervelId == 0) {
          timerIntervelId = setInterval(() => {
            callSec = callSec + 1;
            // this.setState({callSec:this.state.callSec+1},()=>{
            if (callSec >= 59) {
              // this.setState({
              (callMin = callMin + 1), (callSec = 0);
              // })
            }
            tv = `${callMin < 10 ? `0${callMin}` : callMin}:${
              callSec < 10 ? `0${callSec}` : callSec
            }`;
            // this.setState({timerValue:`${this.state.callMin<10?`0${this.state.callMin}`:this.state.callMin}:${this.state.callSec<10?`0${this.state.callSec}`:this.state.callSec}`},()=>{
            DeviceEventEmitter.emit('callTimer', {data: tv});
            this.setState({timerValue: tv});
            // })
            // })
          }, 1000);
        }
      }
    } catch (error) {
      console.log('startTimer');
    }
  }

  roomEventHandlers = {
    roomConnected: event => {
      //console.log('roomConnected', event);
      this.setState({
        isConnected: true,
      });
      Enx.getLocalStreamId(status => {
        //  console.log('local stream id: ', status);
        this.setState({
          localStreamId: status,
        });
      });
      if (this.props.route.params.type == 'incoming') {
        // this.setState({callID:this.state.callDetails.call_id},()=>{
        this.callAcceptAction();
        // })
        console.log('callDetails======>', this.state.callDetails);
      }
      // if(this.props.route.params.type=="outgoing"){
      //     console.log('callDetails======>',this.state.callDetails)
      //     this.ringing()
      // }
      Enx.publish();
    },
    notifyDeviceUpdate: event => {
      console.log('notifyDeviceUpdate', event);
      // InCallManager.stopRingback();
      // this.ringing()
    },
    roomError: event => {
      console.log('roomError', event);
      Toast.show('please check you internet connection', Toast.SHORT);
      this.endCall();
    },
    streamPublished: event => {
      if (this.props.route.params.type == 'outgoing') {
        console.log('streamPublished', event);
        console.log(this.props.route.params.type);
      }
    },
    eventError: event => {
      console.log('eventErrorrr', event);
    },
    streamAdded: event => {
      console.log('streamAdded1', event);
      Enx.subscribe(event.streamId, error => {
        console.log('streamAdded', error);
      });
    },
    activeTalkerList: event => {
      console.log('activeTalkerList: ', event);
      var tempArray = [];
      tempArray = event;
      console.log('activeTalkerListtempArray: ', tempArray);
      try {
        if (tempArray.length == 0) {
          this.setState({
            activeTalkerStreams: tempArray,
          });
          console.log('tempArray', tempArray);
        }
      } catch (e) {
        console.log('tempArray', e);
      }
      try {
        if (tempArray.length > 0) {
          this.setState(
            {
              activeTalkerStreams: tempArray,
            },
            () => {
              // if(callType=="outgoing"){
              //     console.log("1234567890")
              //     InCallManager.stopRingback();
              //     callStatus="Connected"
              //     timer=true
              //     // this.setState({callStatus:'Connected',timer:true},()=>
              //     this.startTimer()
              // }
            },
          );
          console.log('tempArray', tempArray);
        }
      } catch (e) {
        console.log('tempArray', tempArray);
        console.log('tempArray', e);
      }
    },
    streamSubscribed: event => {
      // console.log('streamSubscribed', event);
      if (callType == 'incoming') {
        console.log('1234567890');
        callStatus = 'Connected';
        timer = true;
        // this.setState({callStatus:'Connected',timer:true},()=>
        this.startTimer();
      }
    },
    roomDisconnected: event => {
      console.log('disconnecteddddd', event);
      // this.props.navigation.goBack(null)
      // this.endCall()
    },
    userConnected: event => {
      console.log('userJoined', event);
      if (callType == 'outgoing') {
        console.log('1234567890');
        InCallManager.stopRingback();
        callStatus = 'Connected';
        timer = true;
        // this.setState({callStatus:'Connected',timer:true},()=>
        this.startTimer();
      }
    },
    userDisconnected: event => {
      console.log('userDisconnected', event);
      timerStarted = false;
      console.log(callStatus);
      if (callEnd) {
        console.log('ended');
        this.endCall();
      } else {
        console.log('notENDED');
      }
    },
  };
  streamEventHandlers = {
    audioEvent: event => {
      try {
        console.log('audioEvent', event);
        if (event.result == '0') {
          if (this.state.audioMuteUnmuteCheck) {
            this.setState({audioMuteUnmuteCheck: false});
            this.setState({
              audioMuteUnmuteImage: R.images.call_mute,
            });
          } else {
            this.setState({audioMuteUnmuteCheck: true});
            this.setState({
              audioMuteUnmuteImage: R.images.call_unmute,
            });
          }
          console.log('NoError Audioo');
        } else {
          console.log('Error Audioo');
        }
      } catch (error) {
        console.log('audioEvent');
      }
    },
  };

  createActiveTalkerPlayers() {
    console.log(
      'this.state.activeTalkerStreams: ',
      this.state.activeTalkerStreams.length,
    );
    return (
      <View>
        {this.state.activeTalkerStreams.map(function (element, index) {
          try {
            if (index == 0) {
              const {height, width} = Dimensions.get('window');
              //return (
              //  <EnxPlayerView
              //    key={String(element.streamId)}
              //    streamId={String(element.streamId)}
              //    style={{width: 0, height: 0}}
              //  />
              //);
            }
          } catch (error) {
            console.log('CreateActiveTalkerPlayers');
          }
        })}
      </View>
    );
  }

  createCall = async roomId => {
    console.log(
      '=====create Call===>>>',
      `${R.constants.Api.createCall}${user_id}&room_id=${roomId}&profile_id=${this.props.route.params.callDetails.profile_id}`,
    );
    await Utils.ApiPost(
      `${R.constants.Api.createCall}${user_id}&room_id=${roomId}&profile_id=${this.props.route.params.callDetails.profile_id}`,
      (response = data => {
        console.log('========createCall====>', data);
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            // this.setState({callID:data.data.call_id},()=>{
            console.log('joining======>');
            res_token = data.data.token;
            callId = data.data.call_id;
            this.isReceivedCallId = true;
            // })
          }
          if (data.data.res_status == 'low_points') {
            Toast.show(
              'Your points are low for voice calling, Please add points from my account page.',
              Toast.SHORT,
            );
            Utils.storeData('activeCall', false, 'lowPoints');
            InCallManager.stopRingback();
            this.goBack();
          }
          if (data.data.res_status == 'inactive_user') {
            Toast.show(
              'Your account is inactive, please contact customer care by visiting dadio.in',
              Toast.SHORT,
            );
            Utils.storeData('activeCall', false, 'inactive_user');
            InCallManager.stopRingback();
            this.goBack();
          }
          if (data.data.res_status == 'busy') {
            Toast.show('User Busy', Toast.SHORT);
            Utils.storeData('activeCall', false, 'busy');
            InCallManager.stopRingback();
            this.goBack();
          }
        }

        console.log('resTOken====>', res_token);
        if (res_token !== null && res_token !== '') {
          console.log('res_token=====>', res_token);
          this.setState({connect: true}, () => {
            this.ringing();
            callEnd = true;
            Utils.storeData('activeCall', true, 'resToken');
            this.callStatus('create call');
          });
        }
      }),
    );
  };

  ringing = async () => {
    console.log('ringing');
    InCallManager.stopRingback();
    if (this.state.ringType == 'SPEAKER_PHONE') {
      console.log('if');
      InCallManager.setForceSpeakerphoneOn(true);
      InCallManager.startRingback({media: 'audio', ringback: '_DTMF_'});
    } else {
      console.log('else');
      InCallManager.setForceSpeakerphoneOn(false);
      InCallManager.startRingback({media: 'audio', ringback: '_DTMF_'});
    }
  };

  muteAudio() {
    Enx.muteSelfAudio(this.state.localStreamId, this.state.mute);
  }

  switchSpeaker() {
    Enx.getDevices(status => {
      console.log('devices: ' + status);
      if (!this.state.speaker) {
        console.log(status);
        this.setState({ringType: ''}, () => {
          let filteredData = status.filter(x =>
            String(x).includes('WIRED_HEADSET'),
          );
          let bluetooth = status.filter(x => String(x).includes('Bluetooth'));
          if (bluetooth.length > 0) {
            Enx.switchMediaDevice('Bluetooth');
          } else if (filteredData.length > 0) {
            Enx.switchMediaDevice('WIRED_HEADSET');
          } else {
            Enx.switchMediaDevice('EARPIECE');
          }

          // if (filteredData.length > 0) {
          //     Enx.switchMediaDevice("WIRED_HEADSET");
          // }
          // else {
          //     Enx.switchMediaDevice("EARPIECE");
          // }
        });
      } else {
        this.setState({ringType: 'Speakerphone'}, () => {
          Enx.switchMediaDevice('Speakerphone');
        });
      }
    });
  }
  togglePointsPopup = () => {
    this.setState(prevState => ({
      showPointsPopup: !prevState.showPointsPopup,
      showGiftPopup: false,
    }));
  };

  toggleGiftPopup = () => {
    this.setState(prevState => ({
      showGiftPopup: !prevState.showGiftPopup,
      showPointsPopup: false,
    }));

    if (!this.state.showGiftPopup) {
      this.getGifts();
    }
  };
  handleSendGift = (giftId, paymentId) => {
    Utils.ApiPost(
      `${R.constants.Api.sendGift}${this.state.user_id}&profile_id=${this.state.profile_id}&gift_id=${giftId}&payment_id=${paymentId}`,
      response => {
        if (response.res === 200) {
          Toast.show('Gift sent successfully!');
          this.setState({showGiftPopup: false});
        } else {
          Toast.show('Failed to send gift');
        }
      },
    );
  };
  renderGiftPopup() {
    return (
      <Modal
        visible={this.state.showGiftPopup}
        transparent={true}
        animationType={'fade'}
        onRequestClose={() => this.toggleGiftPopup()}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: Dimensions.get('window').height * 0.6,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 15,
                textAlign: 'center',
                color: '#05adf6',
              }}>
              Send Gift
            </Text>

            {this.state.giftsLoading ? (
              <View style={{height: 200, justifyContent: 'center'}}>
                <ActivityIndicator size="large" color={R.colors.cyan} />
              </View>
            ) : this.state.noGifts ? (
              <View
                style={{
                  height: 200,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: '#d3d3d3'}}>No Gifts Available</Text>
              </View>
            ) : (
              <FlatList
                data={this.state.gifts}
                numColumns={2}
                style={{maxHeight: Dimensions.get('window').height * 0.4}}
                keyExtractor={item => item.gift_id}
                renderItem={({item}) => (
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: (Dimensions.get('window').width - 60) / 2,
                      margin: 10,
                      backgroundColor: '#fff',
                    }}>
                    <TouchableOpacity   onPress={() =>
                        this.handleSendGift(item.gift_id, item.payment_id)
                      }
                      style={{
                        padding: 10,
                        borderWidth: colors.hairlineWidth,
                        borderRadius: 5,
                        borderColor: '#d3d3d3',
                        marginVertical: 10,
                      }}>
                      <Image
                        style={{
                          height: 100,
                          width: 100,
                          borderRadius: 10,
                          resizeMode: 'contain',
                        }}
                        source={{uri: item.gift_image}}
                      />
                    </TouchableOpacity>
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 40,
                      }}>
                      <Text style={{color: '#232323'}}>{item.gift_name}</Text>
                    </View>
               
                  </View>
                )}
              />
            )}

            <View
              style={{
                marginTop: 15,
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.toggleGiftPopup();
                  this.props.navigation.navigate('GiftShop');
                }}
                style={{
                  padding: 10,
                  backgroundColor: '#05adf6',
                  borderRadius: 5,
                  alignItems: 'center',
                  marginBottom: 10,
                }}>
                <Text style={{color: 'white'}}>Buy More Gifts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.toggleGiftPopup()}
                style={{
                  padding: 10,
                  backgroundColor: '#ff0000',
                  borderRadius: 5,
                  alignItems: 'center',
                }}>
                <Text style={{color: 'white'}}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  render() {
    return (
      <View style={{flex: 1}}>
        {this.state.isLoading && (
          <View
            style={{
              zindex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              position: 'absolute',
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Loader />
          </View>
        )}
        {
          <View style={{flex: 1}}>
            {this.state.connect && (
              <EnxRoom
                token={res_token}
                eventHandlers={this.roomEventHandlers}
                localInfo={this.state.localStreamInfo}
                roomInfo={this.state.enxRoomInfo}>
                {this.state.isConnected ? (
                  <EnxStream
                    style={{
                      // position: "absolute",
                      right: 1,
                      width: 100,
                      height: 100,
                    }}
                    eventHandlers={this.streamEventHandlers}
                  />
                ) : (
                  <View />
                )}
              </EnxRoom>
            )}
            <View>{this.createActiveTalkerPlayers()}</View>
            <View
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  height: 140,
                  backgroundColor: '#05adf6',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: 20,
                }}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  Dadio Voice Call
                </Text>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    marginVertical: 5,
                    fontWeight: 'bold',
                  }}>
                  {callType == 'incoming'
                    ? callData.incomingdisplay_name
                    : callData.display_name}
                </Text>
                <Text style={{color: '#fff', fontSize: 14}}>{callStatus}</Text>
                {timer && (
                  <Text style={{color: '#fff', fontSize: 14}}>
                    {this.state.timerValue}
                  </Text>
                )}
              </View>
              <Image
                style={{flex: 1}}
                source={{
                  uri:
                    callType == 'incoming'
                      ? callData.incomingprofile_img
                      : callData.profile_images == undefined
                      ? callData.profile_pic
                      : callData.profile_images[0].profile_img,
                }}
              />

              {/* <View
                style={{
                  position: 'absolute',
                  bottom: 105,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}> */}
              {/* <TouchableOpacity
                  onPress={() => {
                    console.log("===this.isReceivedCallId>>", this.isReceivedCallId)
                    //  if (this.isReceivedCallId) {
                    //  this.isReceivedCallId = false
                    this.endCall()
                    // }
                  }}
                  style={{
                    backgroundColor: 'red',
                    padding: 10,
                    borderRadius: 50,
                  }}>
                  <Icon name={'phone-hangup'} size={35} color="#fff" />
                </TouchableOpacity> */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 105,
                  left: 0,
                  right: 0,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={this.toggleGiftPopup}
                    style={{
                      backgroundColor: '#05adf6',
                      padding: 10,
                      borderRadius: 50,
                    }}>
                                       <Text style={{color: 'white'}}>Send Gifts</Text>

                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.endCall()}
                    style={{
                      backgroundColor: 'red',
                      padding: 10,
                      borderRadius: 50,
                    }}>
                    <Icon name={'phone-hangup'} size={35} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={this.togglePointsPopup}
                    style={{
                      backgroundColor: '#FF9900',
                      padding: 10,
                      borderRadius: 50,
                    }}>
                    <Text style={{color: 'white'}}>Buy Points</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* </View> */}
              <View
                style={{
                  flexDirection: 'row',
                  height: 90,
                  backgroundColor: '#05adf6',
                  alignItems: 'flex-start',
                  justifyContent: 'space-evenly',
                  padding: 20,
                  paddingHorizontal: 40,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({mute: !this.state.mute}, () =>
                      this.muteAudio(),
                    )
                  }
                  style={{
                    backgroundColor: this.state.mute
                      ? 'rgba(255,255,255,1)'
                      : 'rgba(255,255,255,0.5)',
                    padding: 10,
                    borderRadius: 50,
                  }}>
                  <Icon
                    name={this.state.mute ? 'microphone-off' : 'microphone'}
                    size={25}
                    color="#05adf6"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    this.setState({speaker: !this.state.speaker}, () =>
                      this.switchSpeaker(),
                    )
                  }
                  style={{
                    backgroundColor: this.state.speaker
                      ? 'rgba(255,255,255,1)'
                      : 'rgba(255,255,255,0.5)',
                    padding: 10,
                    borderRadius: 50,
                  }}>
                  <Icon
                    name={this.state.speaker ? 'volume-high' : 'volume-off'}
                    size={25}
                    color="#05adf6"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        <TouchableOpacity
          onPress={() => {
            this.props.route.params.backFromCall();
            this.props.navigation.goBack();
          }}
          style={{position: 'absolute', top: 10, left: 10, height: 30}}>
          <Icon
            name="apple-keyboard-control"
            size={20}
            color="#fff"
            style={{transform: [{rotateZ: '-180deg'}]}}
          />
        </TouchableOpacity>
        {/* <PointsPopup
          visible={this.state.showPointsPopup}
          onClose={this.togglePointsPopup}
          data={this.state.userData}
        /> */}
<PointsPopup
  visible={this.state.showPointsPopup}
  onClose={this.togglePointsPopup}
  details={this.state.userData}
  navigation={this.props.navigation}
/>

        {this.renderGiftPopup()}
      </View>
    );
  }
}
