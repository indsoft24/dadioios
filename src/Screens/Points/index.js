import React from 'react';
import {View, Text, TouchableOpacity, Dimensions, Image} from 'react-native';
import Header from '../../res/components/Header';
import R from '../../res/R';
import Icon from 'react-native-vector-icons/FontAwesome';
import RadioButton from 'react-native-vector-icons/MaterialCommunityIcons';
import TextInputView from '../../res/components/TextInputView';
import Loader from '../../res/components/Loader';
import RazorpayCheckout from 'react-native-razorpay';
import Toast from 'react-native-simple-toast';
import Utils from '../../res/Utils';
import PayTm from '../Payment/PaymentViaPayTM';
import PayUPayment from '../Payment/PayUPayment';
// import { AppInstalledChecker, CheckPackageInstallation } from 'react-native-check-app-install';

let callOrderApi = false
export default class Points extends React.Component { 
  constructor() {
    super();
    this.state = {
      isLoading: false,
      data: '',
      value: '',
      paymentMode:2
    };
  }
  
  componentDidMount() {
    this.setState({data: this.props.route.params.details}, () =>
      this.getProfileDetails(),
    );
  }
  backFromPayout() {
    this.getProfileDetails();
  }
  navListing(type) {
    if (type == 'payout') {
      this.props.navigation.navigate('Payout', {
        backFromPayout: this.backFromPayout.bind(this),
      });
    } else {
      this.props.navigation.navigate('Listing', {type: type});
    }
  }

  getProfileDetails() {
    // this.setState({isLoading:true})
    Utils.ApiPost(
      `${R.constants.Api.basicInfo}${this.state.data.user_id}`,
      (response = (data) => {
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
           // console.log('basicInfo service===>', data.data);
            this.setState({data: data.data, isLoading: false});
          }
        }
      }),
    );
  }

  getOrderId() {
    // console.log(
    //   '====>',
    //   `${R.constants.Api.buyUserPoints}${this.state.data.user_id}&enter_points=${this.state.value}`,
    // );

    console.log("==callOrderApi==", callOrderApi)

    if(!callOrderApi)
      return
  
    Utils.ApiPost(
      `${R.constants.Api.buyUserPoints}${this.state.data.user_id}&enter_points=${this.state.value}`,
      (response = (data) => {
        console.log('buyUserPoints======>', data);
        if (data.res == 200) {
          if (data.data.res_status == 'success') {           
            setTimeout(()=>{
              callOrderApi = false
            }, 20)
            this.paymentGateway(data.data.order_id);            
          } else {
            callOrderApi = false
            this.setState({isLoading: false});
          } 
        }  else {
          callOrderApi = false
          this.setState({isLoading: false});
        }
      }),
    );
  }

  paymentGateway(orderId) {
    if (this.state.paymentMode == 1) {
      // try{
      //   AppInstalledChecker
      //   // .checkURLScheme('net.one97.paytm') 
      //   .isAppInstalled('paytm') 
      //   .then((isInstalled) => {
      //     if(isInstalled){
      //       console.log("App Installed");
      //                       // Payment Via PayTM
      //       amount = parseFloat(this.state.value);
      //       console.log('amount :', amount);
      //       userId = this.state.data.user_id;
      //       console.log('userId: ', userId);
      //       PayTm.startPayment(
      //         orderId,
      //         amount,
      //         userId,
      //         'points',
      //         (paymentComplete) => {
      //           this.getProfileDetails();
      //           if (paymentComplete) {
      //             this.setState({isLoading: false}, () =>
      //               this.props.navigation.goBack(),
      //             );
      //           } else {
      //             this.setState({isLoading: false});
      //           }
      //         },
      //       );
            
      //     }else{
      //       console.log("App not Installed");
      //       Toast.show('Please Install Paytm App to make payment by Paytm', Toast.SHORT);
      //     }
      //   });
      // }catch(e){
      //   console.log("Error");

      // }
      // // Payment Via PayTM
      // amount = parseFloat(this.state.value);
      // console.log('amount :', amount);
      // userId = this.state.data.user_id;
      // console.log('userId: ', userId);
      // PayTm.startPayment(
      //   orderId,
      //   amount,
      //   userId,
      //   'points',
      //   (paymentComplete) => {
      //     this.getProfileDetails();
      //     if (paymentComplete) {
      //       this.setState({isLoading: false}, () =>
      //         this.props.navigation.goBack(),
      //       );
      //     } else {
      //       this.setState({isLoading: false});
      //     }
      //   },
      // );
    } else if (this.state.paymentMode == 2) {
      // Payment Via RazorPay
      this.setState({isLoading: false});
      var options = {
        description: 'Credits',
        currency: 'INR',
        key: 'rzp_live_TOJcBVkVESeFKa',
        amount: String(this.state.value * 100),
        name: 'Dadio',
        // order_id: orderId,//Replace this with an orderId created using Orders API. Learn more at https://razorpay.com/docs/api/orders.
        prefill: {
          email: this.state.data.email_id,
          contact: '',
          name: this.state.data.display_name,
        },
      };
      RazorpayCheckout.open(options)
        .then((item) => {
          // handle success
          Toast.show('Payment Successful', Toast.SHORT);
          // alert(`Success: ${data.razorpay_payment_id}`);
          // console.log("order_id===>",order_id)
          this.UpdatePayment('success', item.razorpay_payment_id, orderId);
        })
        .catch((error) => {
          // handle failure
          let json = JSON.parse(error.description);
          this.UpdatePayment('failure', '', orderId);
         // console.log(error);
          Toast.show(json.error.description, Toast.LONG);
        });
    }else if (this.state.paymentMode == 2) {
      this.launchPayUPayment(this.state,orderId);
    } else {
      Toast.show('Please select a payment mode!', Toast.SHORT);
    }
  }

  handlePayuPayment=(status,transactionId,orderId)=>{
   // console.log(orderId);
    this.UpdatePayment(status,transactionId,orderId);
  }
  

  UpdatePayment(status, razId, ordId) {
    console.log(
      `${R.constants.Api.UpdatePayment}${this.state.data.user_id}&action=${status}&order_id=${ordId}&payment_notes=${razId}`,
    );

    Utils.ApiPost(
      `${R.constants.Api.UpdatePayment}${
        this.state.data.user_id
      }&action=${status}&order_id=${ordId}&payment_notes=${JSON.stringify(
        razId,
      )}`,
      (response = (data) => {
        console.log('UpdatePayment==points=>', data);
        this.getProfileDetails();
      }),
    );
  }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Header
          backClick={() => this.props.navigation.goBack(null)}
          title={'My Points'}
        />
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              margin: 20,
              height: 50,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: R.colors.cyan,
            }}>
            <Icon name="diamond" size={20} color="#232323" />
            <Text style={{fontSize: 16, paddingHorizontal: 5}}>
              My Points: {this.state.data.my_points}
            </Text>
          </View>
          <View style={{marginVertical: 10}}>
            <TextInputView
              title={'Enter Points'}
              length={6}
              placeholder={'Enter Points'}
              textValue={this.state.value}
              onChangeValue={(text) =>
                this.setState({value: text.replace(/[^0-9]/g, '')})
              }
              // onKeyPress={(text)=> console}
              keyboardType={'decimal-pad'}
            />
          </View>
          <View>
            {/* <View style={{height: 45, marginHorizontal: 20,marginVertical:10}}>
              <TouchableOpacity
                onPress={() => this.setState({paymentMode: 1})}
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <RadioButton
                  name={
                    this.state.paymentMode == 1
                      ? 'radiobox-marked'
                      : 'radiobox-blank'
                  }
                  size={20}
                  color="#000"
                />
                <Text style={{marginHorizontal: 10}}>Paytm</Text>
              </TouchableOpacity>
            </View> */}
            {/* <View style={{height: 45, marginHorizontal: 20,marginVertical:10}}>
              <TouchableOpacity
                onPress={() => this.setState({paymentMode: 2})}
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <RadioButton
                  name={
                    this.state.paymentMode == 2
                      ? 'radiobox-marked'
                      : 'radiobox-blank'
                  }
                  size={20}
                  color="#000"
                />
                <Text style={{marginHorizontal: 10}}>Other Options</Text>
              </TouchableOpacity>
            </View> */}
          {/*pay with payU */}
          {/* <View style={{ paddingHorizontal: 20, marginVertical: 10 }}>
            <TouchableOpacity
              onPress={()=>createPaymentParams()}
              style={{
                height: 50,
                borderRadius: 10,
                // borderBottomLeftRadius: 10,
                // borderBottomRightRadius: 10,
                // borderTopLeftRadius: 3,
                // borderTopRightRadius: 3,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FF9934',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  paddingHorizontal: 5,
                  color: '#fff',
                  fontWeight: '700',
                }}>
                BUY
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>Powered by </Text>
              <Image
                source={require('../../res/Images/PayU_logo.png')}
                style={{ width: 100, height: 50, resizeMode: 'center' }}
              />
            </View>
          </View> */}
          <View style={{marginHorizontal: 16}}>
          {(
            <PayUPayment PurchaseType="Points" PurchaseData={this.state} Prop={this.props.route} 
            onPaymentComplete={this.handlePayuPayment} 
            onLoading={(isLoad)=>{
              console.log("===isLoad==", isLoad)
              this.setState({isLoading: isLoad});
            }}
            />
          )}
          </View>

          
          </View>
          <View style={{paddingHorizontal: 20, marginVertical: 10}}>
            <TouchableOpacity
              style={{
                height: 50,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#c1cdcd',
              }}
              onPress={async() => {
                if (parseInt(this.state.value.trim()) >= 1) {

                  await this.setState({isLoading: true});
                  await this.sleep(500)

                  if(!callOrderApi) {
                    callOrderApi = true
                    this.getOrderId();
                  }

                //   try{
                //   AppInstalledChecker
                //   // .checkURLScheme('net.one97.paytm') 
                //   .isAppInstalled('paytm') 
                //   .then((isInstalled) => {
                //     if(isInstalled){
                //       console.log("App Installed");
                //       this.getOrderId();
                //     }else{
                //       console.log("App not Installed");
                //       Toast.show('Please Install Paytm App to make payment by Paytm', Toast.SHORT);
                //     }
                //   });
                // }catch(e){
                //   console.log("Error");

                // }
                  
                } else {
                  Toast.show('Please Enter Valid Amount.', Toast.SHORT);
                }
              }}>
              <Text style={{fontSize: 16, paddingHorizontal: 5, color: '#fff'}}>
                BUY
              </Text>
            </TouchableOpacity>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <Text>Powered by </Text>
              <Image source={require('../../res/Images/razor_pay.png')} style={{width:100,height:50,resizeMode:'center'}}/>
            </View>
          </View>
          <View
            style={{
              paddingHorizontal: 20,
              marginVertical: 20,
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              onPress={() => this.navListing('earned')}
              style={{
                marginEnd: 15,
                flex: 1,
                height: 60,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#d3d3d3',
              }}>
              <Icon name="diamond" size={20} color="#232323" />
              <Text
                style={{fontSize: 16, paddingHorizontal: 5, color: '#232323'}}>
                Earned Points
                
              </Text>
              
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.navListing('spent')}
              style={{
                marginStart: 15,
                flex: 1,
                height: 60,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#d3d3d3',
              }}>
              <Icon name="diamond" size={20} color="#232323" />
              <Text
                style={{fontSize: 16, paddingHorizontal: 5, color: '#232323'}}>
                Spend Points
              </Text>
            </TouchableOpacity>
          </View>
          {this.state.data.payout_showhide == 'show' && (
            <View
              style={{
                paddingHorizontal: 20,
                marginVertical: 10,
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                onPress={() => this.navListing('payout')}
                style={{
                  marginEnd: 15,
                  flex: 1,
                  height: 60,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#d3d3d3',
                }}>
                <Icon name="money" size={20} color="#232323" />
                <Text
                  style={{
                    fontSize: 16,
                    paddingHorizontal: 5,
                    color: '#232323',
                  }}>
                  Payout
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.navListing('log')}
                style={{
                  marginStart: 15,
                  flex: 1,
                  height: 60,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#d3d3d3',
                }}>
                <Icon name="money" size={20} color="#232323" />
                <Text
                  style={{
                    fontSize: 16,
                    paddingHorizontal: 5,
                    color: '#232323',
                  }}>
                  Payout Log
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
      </View>
    );
  }
}
