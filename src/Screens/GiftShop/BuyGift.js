import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import RazorpayCheckout from 'react-native-razorpay';
import Toast from 'react-native-simple-toast';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import R from '../../res/R';
import Utils from '../../res/Utils';
import Header from '../../res/components/Header';
import Loader from '../../res/components/Loader';
import PayTm from '../Payment/PaymentViaPayTM';
import PayUPayment from '../Payment/PayUPayment';


export default class BuyGift extends React.Component {
  constructor() {
    super();
    this.state = {
      data: '',
      points: 10,
      isLoading: true,
      points: 0,
      RedeemedPoints: 0,
      paymentMode: 0,
      body: '',
    };
  }

  goBack() {
    this.props.navigation.goBack(null);
  }

  componentDidMount() {
    this.getGiftDetails();
    // this.call();
  }

  // call(){
  //   PackageManager  = getApplicationContext().getPackageManager();
  //   if (PackageManager.packageName.equals("com.whatsapp")) {
  //     console.log("package found");
  //     return true;
  //   }
  // }

  getGiftDetails() {
    Utils.ApiPost(
      `${R.constants.Api.giftDetails}${this.props.route.params.userId
      }&gift_id=${JSON.parse(this.props.route.params.data).gift_id}`,
      (response = data => {
        console.log('giftDetails====>', data);
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            this.setState({ data: data.data, isLoading: false });
          }
        }
      }),
    );
  }

  clickPay() {
    if (this.state.paymentMode == 0) {
      if (
        parseInt(this.state.data.gift_price) -
        parseInt(this.state.RedeemedPoints) ==
        0
      ) {
        this.giftPayment();
      } else {
        Toast.show('Please select a payment mode!', Toast.SHORT);
      }
    } else if (this.state.paymentMode == 1) {
      // try{
      //   AppInstalledChecker
      //   // .checkURLScheme('net.one97.paytm')
      //   .isAppInstalled('paytm')
      //   .then((isInstalled) => {
      //     if(isInstalled){
      //       console.log("App Installed");
      //       this.giftPayment();
      //     }else{
      //       console.log("App not Installed");
      //       Toast.show('Please Install Paytm App to make payment by Paytm ', Toast.SHORT);
      //     }
      //   });
      // }catch (e) {
      //   console.log('Error')
      // }
    } else {
      this.giftPayment();
    }
  }

  UpdatePayment(status, paymentId, orderId) {
    Utils.ApiPost(
      `${R.constants.Api.giftPaymentUpdate}${this.props.route.params.userId}
      &action=${status}&order_id=${orderId}`,
      (response = data => {
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            // this.paymentGateway(data.data.order_id)
            this.setState({ isLoading: false }, () =>
              this.props.navigation.goBack(),
            );
          }
        }
      }),
    );
  }

  applyPoints() {
    if (this.state.points.trim() == '') {
      Toast.show('Please enter Points!', Toast.SHORT);
    } else {
      if (parseInt(this.state.points) > parseInt(this.state.data.my_points)) {
        Toast.show('Not Enough Points!', Toast.SHORT);
      } else if (
        parseInt(this.state.points) > parseInt(this.state.data.gift_price)
      ) {
        Toast.show('Cannot redeem points more than the price!', Toast.SHORT);
      } else {
        this.setState({ RedeemedPoints: this.state.points });
      }
    }
  }

  paymentGateway(orderId) {
    if (
      parseInt(this.state.RedeemedPoints) ==
      parseInt(this.state.data.gift_price)
    ) {
      Toast.show('Payment Successful', Toast.SHORT);
      this.setState({ isLoading: false }, () => this.props.navigation.goBack());
    } else {
      if (this.state.paymentMode == 1) {
        // Payment Via PayTM
        amount =
          parseFloat(this.state.data.gift_price) -
          parseFloat(this.state.RedeemedPoints);
        console.log('amount :', amount);
        userId = this.props.route.params.userId;
        console.log('userId: ', userId);
        PayTm.startPayment(
          orderId,
          amount,
          userId,
          'gifts',
          paymentComplete => {
            if (paymentComplete) {
              this.setState({ isLoading: false }, () =>
                this.props.navigation.goBack(),
              );
            } else {
              this.setState({ isLoading: false });
            }
          },
        );
      } else if (this.state.paymentMode == 2) {
        // Payment Via RazorPay
        Utils.getData(
          'userData',
          (value = data => {
            var userData = JSON.parse(data.value);
            // console.log(userData);
            const amount =
              (parseInt(this.state.data.gift_price) -
                parseInt(this.state.RedeemedPoints)) *
              100;

            console.log('amount :', amount);

            var options = {
              description: 'Credits',
              currency: 'INR',
              key: 'rzp_live_TOJcBVkVESeFKa',
              amount,
              name: 'Dadio',
              // order_id: orderId,//Replace this with an order_id created using Orders API. Learn more at https://razorpay.com/docs/api/orders.
              prefill: {
                email: userData.email_id,
                contact: '',
                name: userData.display_name,
              },
            };
            RazorpayCheckout.open(options)
              .then(item => {
                // handle success
                Toast.show('Payment Successful', Toast.SHORT);
                // alert(`Success: ${data.razorpay_payment_id}`);
                console.log('data.data.order_id===>', item);
                this.UpdatePayment(
                  'success',
                  item.razorpay_payment_id,
                  orderId,
                );
              })
              .catch(error => {
                // handle failure
                let json = error.description;
                this.UpdatePayment('failure', '', orderId);
                console.log(error);
                Toast.show('Payment Failed', Toast.SHORT);
              });
            this.setState({ isLoading: false });
          }),
        );
      } else if (this.state.paymentMode == 3) {
        launchPayUPayment(this.state, orderId)
      }
    }
  }

  handlePayuPayment = (status, transactionId, orderId) => {
    console.log("orderId::::", orderId)
    this.UpdatePayment(status, transactionId, orderId);
  }

  giftPayment() {
    this.setState({ isLoading: true });

    const url = `${R.constants.Api.giftPayment}${this.props.route.params.userId}
      &gift_id=${JSON.parse(this.props.route.params.data).gift_id
      }&apply_points=${this.state.RedeemedPoints}`;

    console.log('giftPayment====>', url);

    Utils.ApiPost(
      url,
      (response = data => {
        console.log('giftPayment====>', data);
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            this.paymentGateway(data.data.order_id);
          }
        }
      }),
    );
  }

  payWithPoints() {
    if (
      parseInt(this.state.data.my_points) >=
      parseInt(this.state.data.gift_price)
    ) {
      this.setState({ RedeemedPoints: this.state.data.gift_price }, () => {
        this.giftPayment();
      });
    } else {
      Toast.show('Not Enough Points!', Toast.SHORT);
    }
  }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  render() {
    const isDisabled =
      parseInt(this.state.data.my_points) <
      parseInt(this.state.data.gift_price);


    return (
      <View style={{ flex: 1 }}>
        <Header
          backClick={() => this.props.navigation.goBack(null)}
          title={'Gift Details'}
        />

        <KeyboardAwareScrollView style={{ padding: 20 }}>
          {/* top logo and info */}
          <View style={{ flexDirection: 'row', marginVertical: 10 }}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                borderRadius: 5,
                paddingVertical: 10,
              }}>
              <Image
                style={{ height: 100, width: 100, resizeMode: 'contain' }}
                source={{ uri: this.state.data.gift_image }}
              />
            </View>

            <View
              style={{
                flex: 1.5,
                justifyContent: 'flex-start',
                marginHorizontal: 10,
              }}>
              <Text
                style={{ fontWeight: 'bold', color: '#232323', fontSize: 16 }}>
                {this.state.data.gift_name}
              </Text>
              <Text style={{ color: '#232323', fontSize: 16 }}>
                {this.state.data.gift_details}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 5,
              paddingHorizontal: 10,
              marginVertical: 10,
            }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}>
              <Text>Gift Price</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="currency-inr" size={15} color="#232323" />
                <Text>{this.state.data.gift_price}</Text>
              </View>
            </View>
            {/* {this.state.RedeemedPoints > 0 && (
              <View
                style={{width: '100%', height: 1, backgroundColor: '#d3d3d3'}}
              />
            )}
            {this.state.RedeemedPoints > 0 && (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                }}>
                <Text style={{fontWeight: 'bold', color: 'lightgreen'}}>
                  Points Redeemed
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon name="currency-inr" size={15} color="#232323" />
                  <Text style={{fontWeight: 'bold'}}>
                    {this.state.RedeemedPoints}
                  </Text>
                </View>
              </View>
            )} */}
            <View
              style={{ width: '100%', height: 1, backgroundColor: '#d3d3d3' }}
            />
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}>
              <Text style={{ fontWeight: 'bold' }}>Payable Amount</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="currency-inr" size={15} color="#232323" />
                <Text style={{ fontWeight: 'bold' }}>
                  {this.state.data.gift_price - this.state.RedeemedPoints}
                </Text>
              </View>
            </View>
          </View>

          {/* apply points */}
          {/* <View
            style={{
              backgroundColor: 'lightblue',
              borderRadius: 5,
              marginVertical: 10,
            }}>
            <Text
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                fontWeight: 'bold',
              }}>
              Apply Points
            </Text>
            <View
              style={{
                backgroundColor: '#fff',
                padding: 20,
                alignItems: 'center',
                borderBottomStartRadius: 5,
                borderBottomEndRadius: 5,
              }}>
              <Text style={{fontWeight: 'bold', marginBottom: 10}}>
                My points: {this.state.data.my_points}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex: 3, marginEnd: 10}}>
                  <TextInput
                    style={{
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: '#d3d3d3',
                      height: 40,
                    }}
                    onChangeText={text =>
                      this.setState({points: text.replace(/[^0-9]/g, '')})
                    }
                    placeholder={'Redeem your points here'}
                    value={'' + this.state.points}
                    keyboardType={'decimal-pad'}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => this.applyPoints()}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: R.colors.cyan,
                    marginStart: 10,
                    borderRadius: 5,
                  }}>
                  <Text style={{color: '#fff'}}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View> */}

          {/* pay using points */}
          <View style={{ marginTop: 30 }}>
            <TouchableOpacity
              onPress={() => {
                this.setState({ paymentMode: 0 });
                this.payWithPoints();
              }}
              disabled={isDisabled}
              style={{
                height: 50,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDisabled ? '#d3d3d3' : R.colors.cyan,
              }}>
              <Text
                style={{
                  fontSize: 15,
                  paddingHorizontal: 5,
                  color: '#fff',
                  fontWeight: '700',
                }}>
                Buy Using Points
              </Text>
            </TouchableOpacity>
          </View>
          {/* Buy with PayU */}
          {this.state.data ? (
            <PayUPayment PurchaseType="Gift" PurchaseData={this.state}
              Prop={this.props.route} onPaymentComplete={this.handlePayuPayment}
              onLoading={(isLoad) => {
                this.setState({ isLoading: isLoad });
              }}
            />
          ) : (<Text>PG not loaded</Text>)}


          {/* Buy */}
          <View style={{ paddingVertical: 0 }}>
            <TouchableOpacity
              onPress={async () => {
                await this.setState({ isLoading: true });
                await this.sleep(500)

                this.setState({ paymentMode: 2 }, () => {
                  // this.clickPay();
                  this.giftPayment();
                });
              }}
              style={{
                height: 50,
                borderRadius: 10,
                // borderBottomLeftRadius: 10,
                // borderBottomRightRadius: 10,
                // borderTopLeftRadius: 3,
                // borderTopRightRadius: 3,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#c1cdcd',
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
                source={require('../../res/Images/razor_pay.png')}
                style={{ width: 100, height: 50, resizeMode: 'center' }}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>

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
