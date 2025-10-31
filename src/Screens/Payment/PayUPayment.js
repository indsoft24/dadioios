// import { Alert, Button, NativeEventEmitter, TouchableOpacity, Image, StyleSheet, Text, View } from 'react-native'
// import React, { useEffect, useState, useRef, useCallback } from 'react'
// import PayUBizSdk from 'payu-non-seam-less-react';
// import { sha512 } from 'js-sha512';
// import { payUConfig } from "../../Config";
// import Toast from 'react-native-simple-toast';



// import R from '../../res/R';
// import Utils from '../../res/Utils';
// import Loader from '../../res/components/Loader';
// import { debounce } from 'lodash';

// const PayUPayment = ({ PurchaseType, PurchaseData, Prop, onPaymentComplete, onLoading }) => {

//   // const [key, setKey] = useState("5V8sOo");
//   // const [merchantSalt, setMerchantSalt] = useState("4eEoI60AFs5m62xfMWecVowYXXC06qp8");
//   // var amount="5";
//   // const [productInfo, setProductInfo] = useState(PurchaseType);

//   const [orderId, SetOrderId] = useState('');
//   const [firstName, setFirstName] = useState('');
//   const [amount, setAmount] = useState('')

//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("9999999999");

//   useEffect(() => {
//     getUserDetails()
//   }, [])

//   const getUserDetails = async () => {
//     Utils.getData(
//       'userData',
//       (value = data => {
//         var userData = JSON.parse(data.value);
//         if (userData.email_id != null && userData.email_id != "")
//           setEmail(userData.email_id);
//         setFirstName(userData.display_name);
//       }));
//   }

//   const [ios_surl, setIosSurl] = useState(
//     'https://www.dadio.in/apps/serverapi/server/success.php', //https://success-nine.vercel.app
//   );
//   const [ios_furl, setIosFurl] = useState(
//     'https://www.dadio.in/apps/serverapi/server/failed.php', //https://failure-kohl.vercel.app
//   );
//   const [environment, setEnvironment] = useState("0"); //"0" for Production and "1" for Test
//   const [android_surl, setAndroidSurl] = useState(
//     'https://www.dadio.in/apps/serverapi/server/success.php', //https://success-nine.vercel.app
//   );
//   const [android_furl, setAndroidFurl] = useState(
//     'https://www.dadio.in/apps/serverapi/server/failed.php', //https://failure-kohl.vercel.app
//   );

//   const [udf1, setUdf1] = useState('udf1s');
//   const [udf2, setUdf2] = useState('udf2');
//   const [udf3, setUdf3] = useState('udf3');
//   const [udf4, setUdf4] = useState('udf4');
//   const [udf5, setUdf5] = useState('udf5');

//   const [showCbToolbar, setShowCbToolbar] = useState(true);
//   const [userCredential, setUserCredential] = useState('');
//   const [primaryColor, setPrimaryColor] = useState('#4c31ae');

//   const [secondaryColor, setSecondaryColor] = useState('#022daf');
//   const [merchantName, setMerchantName] = useState('Dadio');
//   const [merchantLogo, setMerchantLogo] = useState("");

//   const [cartDetails, setCartDetails] = useState([]); // { Order: 'Food Order' },
//   //  { 'order Id': '123456' },
//   //{ 'Shop name': 'Food Shop' },

//   const [paymentModesOrder, setPaymentModesOrder] = useState([
//     { UPI: 'TEZ' },
//     { Wallets: 'PAYTM' },
//     { Wallets: 'PHONEPE' },

//   ]);
//   const [surePayCount, setSurePayCount] = useState(1);
//   const [merchantResponseTimeout, setMerchantResponseTimeout] = useState(10000);
//   const [autoApprove, setAutoApprove] = useState(false);
//   const [merchantSMSPermission, setMerchantSMSPermission] = useState(false);
//   const [
//     showExitConfirmationOnCheckoutScreen,
//     setShowExitConfirmationOnCheckoutScreen,
//   ] = useState(true);
//   const [
//     showExitConfirmationOnPaymentScreen,
//     setShowExitConfirmationOnPaymentScreen,
//   ] = useState(true);

//   const [autoSelectOtp, setAutoSelectOtp] = useState(true);

//   requestSMSPermission = async () => {
//     try {
//       // const granted = await PermissionsAndroid.request(
//       //   PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
//       //   {
//       //     title: 'PayU SMS Permission',
//       //     message:
//       //       'Pay  U Demo App needs access to your sms to autofill OTP on Bank Pages ',
//       //     buttonNeutral: 'Ask Me Later',
//       //     buttonNegative: 'Cancel',
//       //     buttonPositive: 'OK',
//       //   },
//       // );
//       // if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//       //   console.log('SMS Permission Granted!');
//       // } else {
//       //   console.log('SMS Permission Denied');
//       // }
//     } catch (err) {
//       console.warn(err);
//     }
//   };
//   displayAlert = (title, value) => {
//     Alert.alert(title, value);

//   };
//   onPaymentSuccess = e => {
//     // console.log("===payment success==>>>>", e);
//     var json = JSON.parse(e.payuResponse);

//     // console.log("===Object.keys(json.result)==", json.hasOwnProperty('result'))

//     if (json.hasOwnProperty('result')) {
//       //  console.log("===json.result=json=11111===>>>>>>>>>", json, json.result.txnid)
//       onPaymentComplete(json.status, json.result.txnid, json.result.txnid);

//     } else {
//       onPaymentComplete(json.status, json.txnid, json.txnid);
//       //  console.log("===json=json===22222=>>>>>>>>>", json, json.txnid)
//     }

//     // displayAlert('onPaymentSuccess', "Payment success");
//   };

//   onPaymentFailure = e => {
//     // console.log("===payment failure==>>>>", e.merchantResponse);
//     //  console.log(e.payuResponse);
//     //onPaymentComplete(json.status, json.txnid, json.txnid);

//     var json = JSON.parse(e.payuResponse);

//     // console.log("===Object.keys(json.result)==", json.hasOwnProperty('result'))

//     if (json.hasOwnProperty('result')) {
//       //  console.log("===json.result=json=11111===>>>>>>>>>", json, json.result.txnid)
//       onPaymentComplete(json.status, json.result.txnid, json.result.txnid);

//     } else {
//       onPaymentComplete(json.status, json.txnid, json.txnid);
//       //  console.log("===json=json===22222=>>>>>>>>>", json, json.txnid)
//     }

//     // displayAlert('onPaymentFailure', JSON.stringify(e));
//   }


//   onPaymentCancel = e => {
//     // console.log('onPaymentCancel isTxnInitiated -' + e);
//     displayAlert('onPaymentCancel', JSON.stringify(e));
//   }

//   onError = e => {
//     // console.log("==onError==>>", JSON.stringify(e))
//     displayAlert('onError', JSON.stringify(e));
//   };


//   calculateHash = async (data) => {
//     var result = await sha512(data);
//     //console.log("calculateHash==>>", result);
//     return result;
//   };

//   sendBackHash = async (hashName, hashData) => {
//     var hashValue = await calculateHash(hashData);
//     var result = { [hashName]: hashValue };
//     //console.log("Hash result==>>>", result);
//     await PayUBizSdk.hashGenerated(result);
//   };
//   generateHash = e => {
//     // console.log("===generateHash ==>>>>", e.hashName, "  hashString==>>>", e.hashString);
//     sendBackHash(e.hashName, e.hashString + payUConfig.payU_merchant_salt);
//   };

//   useEffect(() => {
//     switch (PurchaseType) {
//       case "Gift":
//         // giftPayment();

//         setAmount((parseInt(PurchaseData.data.gift_price) - parseInt(PurchaseData.RedeemedPoints)).toString());
//         break;
//       case "Points":
//         // getOrderId();
//         setAmount(PurchaseData.value.toString());
//         break;
//       case "Chat":
//         // chatPayment();
//         setAmount((parseFloat(Prop.params.packagePrice) - parseFloat(PurchaseData.RedeemedPoints)).toString());
//         break;
//     }
//   }, [PurchaseData])

//   useEffect(() => {
//     const eventEmitter = new NativeEventEmitter(PayUBizSdk);
//     payUOnPaymentSuccess = eventEmitter.addListener(
//       'onPaymentSuccess',
//       onPaymentSuccess,
//     );
//     payUOnPaymentFailure = eventEmitter.addListener(
//       'onPaymentFailure',
//       onPaymentFailure,
//     );
//     payUOnPaymentCancel = eventEmitter.addListener(
//       'onPaymentCancel',
//       onPaymentCancel,
//     );
//     payUOnError = eventEmitter.addListener('onError', onError);
//     payUGenerateHash = eventEmitter.addListener('generateHash', generateHash);

//     //Unregister eventEmitters here
//     return () => {
//       console.log('Unsubscribed!!!!');
//       payUOnPaymentSuccess.remove();
//       payUOnPaymentFailure.remove();
//       payUOnPaymentCancel.remove();
//       payUOnError.remove();
//       payUGenerateHash.remove();
//     };
//   }, [payUConfig.payU_merchant_salt]);

//   const that = this;
//   const createPaymentParams = (order_id) => {
//     //var txnid = new Date().getTime().toString();
//     var payUPaymentParams = {
//       key: `${payUConfig.PayU_key}`,
//       transactionId: order_id,
//       amount: amount,
//       productInfo: PurchaseType.toString(),
//       firstName: firstName,
//       email: email,
//       phone: phone,
//       ios_surl: ios_surl,
//       ios_furl: ios_furl,
//       android_surl: android_surl,
//       android_furl: android_furl,
//       environment: environment,
//       userCredential: userCredential,

//     };
//     var payUCheckoutProConfig = {
//       primaryColor: primaryColor,
//       secondaryColor: secondaryColor,
//       merchantName: merchantName,
//       merchantLogo: merchantLogo,
//       showExitConfirmationOnCheckoutScreen:
//         showExitConfirmationOnCheckoutScreen,
//       showExitConfirmationOnPaymentScreen: showExitConfirmationOnPaymentScreen,
//       cartDetails: cartDetails,
//       paymentModesOrder: paymentModesOrder,
//       surePayCount: surePayCount,
//       merchantResponseTimeout: merchantResponseTimeout,
//       autoSelectOtp: autoSelectOtp,
//       autoApprove: autoApprove,
//       merchantSMSPermission: merchantSMSPermission,
//       showCbToolbar: showCbToolbar,

//     };
//     payUCheckoutProConfig["enforcePaymentList"] = [{ 'payment_type': "NB" }, { 'payment_type': "CARD" }, { 'payment_type': "UPI" }, { 'payment_type': "WALLET" }];
//     return {
//       payUPaymentParams: payUPaymentParams,
//       payUCheckoutProConfig: payUCheckoutProConfig,
//     };

//   }

//   const lunchPayUPayment = async (order_id) => {
//     //  SetOrderId(order_id);
//     let pParams = await createPaymentParams(order_id)
//     //console.log("==pParams==", pParams)
//     await PayUBizSdk.openCheckoutScreen(createPaymentParams(order_id));
//   }

//   const giftPayment = () => {

//     const url = `${R.constants.Api.giftPayment}${Prop.params.userId}
//       &gift_id=${JSON.parse(Prop.params.data).gift_id
//       }&apply_points=${PurchaseData.RedeemedPoints}`;

//     //console.log('giftPayment====>', url);


//     Utils.ApiPost(
//       url,
//       (response = data => {

//         if (data.res == 200) {
//           if (data.data.res_status == 'success') {
//             onLoading(false)
//             lunchPayUPayment(data.data.order_id);
//           } else {
//             onLoading(false)
//           }
//         } else {
//           onLoading(false)
//         }
//       }),
//     );


//   }

//   const getOrderId = () => {
//     // console.log(
//     //   '====>',
//     //   `${R.constants.Api.buyUserPoints}${PurchaseData.data.user_id}&enter_points=${PurchaseData.value}`,
//     // );

//     Utils.ApiPost(
//       `${R.constants.Api.buyUserPoints}${PurchaseData.data.user_id}&enter_points=${PurchaseData.value}`,
//       (response = (data) => {
//         // console.log('buyUserPoints======>', data);
//         if (data.res == 200) {
//           if (data.data.res_status == 'success') {
//             // this.setState({isLoading: true});
//             onLoading(false)
//             SetOrderId(data.data.order_id);
//             setTimeout(() => {
//               lunchPayUPayment(data.data.order_id);
//             }, 20)
//           } else {
//             onLoading(false)
//           }
//         } else {
//           onLoading(false)
//         }
//       }),
//     );
//   }

//   chatPayment = () => {
//     const url = `${R.constants.Api.chatPayment}${Prop.params.userId}&package_id=${Prop.params.packageid}&apply_points=${PurchaseData.RedeemedPoints}`;

//     // console.log(url);

//     Utils.ApiPost(
//       url,
//       (response = data => {
//         //  console.log('current data========>', JSON.stringify(data));
//         if (data.res == 200) {
//           if (data.data.res_status == 'success') {
//             // order_id : data.data.order_id;
//             // this.setState({
//             //   orderId:data.data.order_id
//             // })
//             //  console.log('this is the oder id', data.data.order_id);
//             onLoading(false)
//             lunchPayUPayment(data.data.order_id);
//             // this.paymentGateway(this.state.orderId);
//           } else {
//             onLoading(false)
//           }
//         } else {
//           onLoading(false)
//         }
//       }),
//     );
//   }

//   const isDisabledRef = useRef(false);


//   const handlePurchase = () => {

//     if (isDisabledRef.current) return;
//     isDisabledRef.current = true;

//     setTimeout(() => {
//       console.log('Button tapped!');
//       isDisabledRef.current = false;
//     }, 4000);

//     console.log("===PurchaseData.value==", PurchaseData)
//     switch (PurchaseType) {
//       case "Gift":
//         if ((parseInt(PurchaseData.data.gift_price) - parseInt(PurchaseData.RedeemedPoints)) < 1 || isNaN(parseInt(PurchaseData.data.gift_price) - parseInt(PurchaseData.RedeemedPoints))) {
//           Toast.show('Please enter a Valid Amount', Toast.SHORT);
//         } else {
//           giftPayment();
//           setAmount((parseInt(PurchaseData.data.gift_price) - parseInt(PurchaseData.RedeemedPoints)).toString());
//         }
//         break;
//       case "Points":
//         if ((parseInt(PurchaseData.value)) < 1 || isNaN(parseInt(PurchaseData.value))) {
//           Toast.show('Please enter a Valid Amount', Toast.SHORT);
//         } else {
//           getOrderId();
//           setAmount(PurchaseData.value.toString());
//         }

//         break;
//       case "Chat":
//         if ((parseFloat(Prop.params.packagePrice) - parseFloat(PurchaseData.RedeemedPoints)) < 1 || isNaN(parseFloat(Prop.params.packagePrice) - parseFloat(PurchaseData.RedeemedPoints))) {
//           Toast.show('Please enter a Valid Amount', Toast.SHORT);
//         } else {
//           chatPayment();
//           setAmount((parseFloat(Prop.params.packagePrice) - parseFloat(PurchaseData.RedeemedPoints)).toString());
//         }

//         break;

//     }

//     Utils.getData(
//       'userData',
//       (value = data => {
//         var userData = JSON.parse(data.value);
//         //  console.log("===userData===", userData)
//         setEmail(userData.email_id);

//         setFirstName(userData.display_name);
//       }));
//   }

//   const handlePress = debounce(() => {
//     console.log('===Button tapped!===');
//     handlePurchase()
//   }, 3000, { leading: true, trailing: false });

//   // const handlePress = useCallback(
//   //   debounce(() => {
//   //     console.log('===Button tapped!===');
//   //     handlePurchase()
//   //   }, 3000, { leading: true, trailing: false }),
//   //   [PurchaseType, PurchaseData, Prop, onPaymentComplete, onLoading ]
//   // );

//   return (
//     <View style={{ paddingVertical: 30 }}>
//       <TouchableOpacity
//         onPress={async () => {
//           handlePress()
//         }}
//         style={{
//           height: 50,
//           borderRadius: 10,
//           // borderBottomLeftRadius: 10,
//           // borderBottomRightRadius: 10,
//           // borderTopLeftRadius: 3,
//           // borderTopRightRadius: 3,
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: '#FF9934',
//         }}>
//         <Text
//           style={{
//             fontSize: 16,
//             paddingHorizontal: 5,
//             color: '#fff',
//             fontWeight: '700',
//           }}>
//           BUY
//         </Text>
//       </TouchableOpacity>
//       <View style={{ marginHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
//         <Text>Powered by </Text>
//         <Image
//           source={require('../../res/Images/PayU_logo.png')}
//           style={{ width: 100, height: 50, resizeMode: 'center' }}
//         />
//       </View>
//     </View>

//   )
// }

// export default PayUPayment

// const styles = StyleSheet.create({})
import { Alert, Button, NativeEventEmitter, TouchableOpacity, Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import PayUBizSdk from 'payu-non-seam-less-react';
import { sha512 } from 'js-sha512';
import { payUConfig } from "../../Config";
import Toast from 'react-native-simple-toast';

import R from '../../res/R';
import Utils from '../../res/Utils';
import Loader from '../../res/components/Loader';
import { debounce } from 'lodash';

const PayUPayment = ({ PurchaseType, PurchaseData, Prop, onPaymentComplete, onLoading }) => {
  const [orderId, SetOrderId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [amount, setAmount] = useState('')
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("9999999999");

  // Payment URLs and configuration
  const [ios_surl, setIosSurl] = useState('https://www.dadio.in/apps/serverapi/server/success.php');
  const [ios_furl, setIosFurl] = useState('https://www.dadio.in/apps/serverapi/server/failed.php');
  const [environment, setEnvironment] = useState("0"); // "0" for Production, "1" for Test
  const [android_surl, setAndroidSurl] = useState('https://www.dadio.in/apps/serverapi/server/success.php');
  const [android_furl, setAndroidFurl] = useState('https://www.dadio.in/apps/serverapi/server/failed.php');

  // Other payment parameters
  const [udf1, setUdf1] = useState('udf1');
  const [udf2, setUdf2] = useState('udf2');
  const [udf3, setUdf3] = useState('udf3');
  const [udf4, setUdf4] = useState('udf4');
  const [udf5, setUdf5] = useState('udf5');
  const [showCbToolbar, setShowCbToolbar] = useState(true);
  const [userCredential, setUserCredential] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4c31ae');
  const [secondaryColor, setSecondaryColor] = useState('#022daf');
  const [merchantName, setMerchantName] = useState('Dadio');
  const [merchantLogo, setMerchantLogo] = useState("");
  const [cartDetails, setCartDetails] = useState([]);
  const [paymentModesOrder, setPaymentModesOrder] = useState([
    { UPI: 'TEZ' },
    { Wallets: 'PAYTM' },
    { Wallets: 'PHONEPE' },
  ]);
  const [surePayCount, setSurePayCount] = useState(1);
  const [merchantResponseTimeout, setMerchantResponseTimeout] = useState(10000);
  const [autoApprove, setAutoApprove] = useState(false);
  const [merchantSMSPermission, setMerchantSMSPermission] = useState(false);
  const [showExitConfirmationOnCheckoutScreen, setShowExitConfirmationOnCheckoutScreen] = useState(true);
  const [showExitConfirmationOnPaymentScreen, setShowExitConfirmationOnPaymentScreen] = useState(true);
  const [autoSelectOtp, setAutoSelectOtp] = useState(true);

  useEffect(() => {
    getUserDetails()
  }, [])

  const getUserDetails = async () => {
    Utils.getData('userData', (value = data => {
      var userData = JSON.parse(data.value);
      if (userData.email_id != null && userData.email_id != "")
        setEmail(userData.email_id);
      setFirstName(userData.display_name);
    }));
  }

  useEffect(() => {
    switch (PurchaseType) {
      case "Gift":
        setAmount((parseInt(PurchaseData.data.gift_price) - parseInt(PurchaseData.RedeemedPoints)).toString());
        break;
      case "Points":
        setAmount(PurchaseData.value.toString());
        break;
      case "Chat":
        setAmount((parseFloat(Prop.params.packagePrice) - parseFloat(PurchaseData.RedeemedPoints)).toString());
        break;
    }
  }, [PurchaseData])

  // Payment status handlers
  onPaymentSuccess = e => {
    try {
      const json = JSON.parse(e.payuResponse);
      
      // Verify the payment status properly
      if (json.status === "success" || (json.result && json.result.status === "success")) {
        const txnid = json.result?.txnid || json.txnid;
        onPaymentComplete("success", txnid, txnid);
      } else {
        // This handles cases where the SDK incorrectly calls success callback
        onPaymentComplete("failed", json.txnid || "unknown", "Payment not completed");
      }
    } catch (error) {
      console.error("Error processing payment success:", error);
      onPaymentComplete("error", "unknown", "Error processing payment");
    }
  };

  onPaymentFailure = e => {
    try {
      const json = JSON.parse(e.payuResponse);
      const txnid = json.result?.txnid || json.txnid || "unknown";
      onPaymentComplete("failed", txnid, txnid);
    } catch (error) {
      console.error("Error processing payment failure:", error);
      onPaymentComplete("error", "unknown", "Error processing payment");
    }
  };

  onPaymentCancel = e => {
    // Explicitly handle cancellation
    onPaymentComplete("cancelled", "unknown", "Payment cancelled by user");
  };

  onError = e => {
    console.error("Payment error:", e);
    onPaymentComplete("error", "unknown", "Payment error occurred");
  };

  // Hash generation functions
  calculateHash = async (data) => {
    return await sha512(data);
  };

  sendBackHash = async (hashName, hashData) => {
    const hashValue = await calculateHash(hashData);
    await PayUBizSdk.hashGenerated({ [hashName]: hashValue });
  };

  generateHash = e => {
    sendBackHash(e.hashName, e.hashString + payUConfig.payU_merchant_salt);
  };

  // Payment initialization
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(PayUBizSdk);
    const payUOnPaymentSuccess = eventEmitter.addListener('onPaymentSuccess', onPaymentSuccess);
    const payUOnPaymentFailure = eventEmitter.addListener('onPaymentFailure', onPaymentFailure);
    const payUOnPaymentCancel = eventEmitter.addListener('onPaymentCancel', onPaymentCancel);
    const payUOnError = eventEmitter.addListener('onError', onError);
    const payUGenerateHash = eventEmitter.addListener('generateHash', generateHash);

    return () => {
      payUOnPaymentSuccess.remove();
      payUOnPaymentFailure.remove();
      payUOnPaymentCancel.remove();
      payUOnError.remove();
      payUGenerateHash.remove();
    };
  }, [payUConfig.payU_merchant_salt]);

  const createPaymentParams = (order_id) => {
    const payUPaymentParams = {
      key: `${payUConfig.PayU_key}`,
      transactionId: order_id,
      amount: amount,
      productInfo: PurchaseType.toString(),
      firstName: firstName,
      email: email,
      phone: phone,
      ios_surl: ios_surl,
      ios_furl: ios_furl,
      android_surl: android_surl,
      android_furl: android_furl,
      environment: environment,
      userCredential: userCredential,
      udf1: udf1,
      udf2: udf2,
      udf3: udf3,
      udf4: udf4,
      udf5: udf5,
    };

    const payUCheckoutProConfig = {
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      merchantName: merchantName,
      merchantLogo: merchantLogo,
      showExitConfirmationOnCheckoutScreen: showExitConfirmationOnCheckoutScreen,
      showExitConfirmationOnPaymentScreen: showExitConfirmationOnPaymentScreen,
      cartDetails: cartDetails,
      paymentModesOrder: paymentModesOrder,
      surePayCount: surePayCount,
      merchantResponseTimeout: merchantResponseTimeout,
      autoSelectOtp: autoSelectOtp,
      autoApprove: autoApprove,
      merchantSMSPermission: merchantSMSPermission,
      showCbToolbar: showCbToolbar,
      enforcePaymentList: [
        { 'payment_type': "NB" },
        { 'payment_type': "CARD" },
        { 'payment_type': "UPI" },
        { 'payment_type': "WALLET" }
      ]
    };

    return {
      payUPaymentParams: payUPaymentParams,
      payUCheckoutProConfig: payUCheckoutProConfig,
    };
  }

  const lunchPayUPayment = async (order_id) => {
    try {
      const pParams = createPaymentParams(order_id);
      await PayUBizSdk.openCheckoutScreen(pParams);
    } catch (error) {
      console.error("Error launching PayU payment:", error);
      onPaymentComplete("error", order_id, "Error launching payment");
      onLoading(false);
    }
  }

  // Payment type specific functions
  const giftPayment = () => {
    const url = `${R.constants.Api.giftPayment}${Prop.params.userId}&gift_id=${JSON.parse(Prop.params.data).gift_id}&apply_points=${PurchaseData.RedeemedPoints}`;

    Utils.ApiPost(url, (response = data => {
      if (data.res == 200 && data.data.res_status == 'success') {
        onLoading(false);
        lunchPayUPayment(data.data.order_id);
      } else {
        onLoading(false);
        Toast.show('Failed to create payment order', Toast.SHORT);
      }
    }));
  }

  const getOrderId = () => {
    Utils.ApiPost(
      `${R.constants.Api.buyUserPoints}${PurchaseData.data.user_id}&enter_points=${PurchaseData.value}`,
      (response = (data) => {
        if (data.res == 200 && data.data.res_status == 'success') {
          onLoading(false);
          SetOrderId(data.data.order_id);
          setTimeout(() => {
            lunchPayUPayment(data.data.order_id);
          }, 20);
        } else {
          onLoading(false);
          Toast.show('Failed to create payment order', Toast.SHORT);
        }
      }),
    );
  }

  const chatPayment = () => {
    const url = `${R.constants.Api.chatPayment}${Prop.params.userId}&package_id=${Prop.params.packageid}&apply_points=${PurchaseData.RedeemedPoints}`;

    Utils.ApiPost(url, (response = data => {
      if (data.res == 200 && data.data.res_status == 'success') {
        onLoading(false);
        lunchPayUPayment(data.data.order_id);
      } else {
        onLoading(false);
        Toast.show('Failed to create payment order', Toast.SHORT);
      }
    }));
  }

  const isDisabledRef = useRef(false);

  const handlePurchase = () => {
    if (isDisabledRef.current) return;
    isDisabledRef.current = true;

    setTimeout(() => {
      isDisabledRef.current = false;
    }, 4000);

    // Validate amount
    let validAmount = false;
    let actualAmount = 0;

    switch (PurchaseType) {
      case "Gift":
        actualAmount = parseInt(PurchaseData.data.gift_price) - parseInt(PurchaseData.RedeemedPoints);
        validAmount = !isNaN(actualAmount) && actualAmount >= 1;
        break;
      case "Points":
        actualAmount = parseInt(PurchaseData.value);
        validAmount = !isNaN(actualAmount) && actualAmount >= 1;
        break;
      case "Chat":
        actualAmount = parseFloat(Prop.params.packagePrice) - parseFloat(PurchaseData.RedeemedPoints);
        validAmount = !isNaN(actualAmount) && actualAmount >= 1;
        break;
    }

    if (!validAmount) {
      Toast.show('Please enter a Valid Amount', Toast.SHORT);
      isDisabledRef.current = false;
      return;
    }

    setAmount(actualAmount.toString());
    
    // Get fresh user data before payment
    Utils.getData('userData', (value = data => {
      var userData = JSON.parse(data.value);
      setEmail(userData.email_id || "");
      setFirstName(userData.display_name || "");
      
      // Initiate payment based on type
      switch (PurchaseType) {
        case "Gift":
          giftPayment();
          break;
        case "Points":
          getOrderId();
          break;
        case "Chat":
          chatPayment();
          break;
      }
    }));
  }

  const handlePress = debounce(() => {
    handlePurchase();
  }, 3000, { leading: true, trailing: false });

  return (
    <View style={{ paddingVertical: 30 }}>
      <TouchableOpacity
        onPress={handlePress}
        style={{
          height: 50,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FF9934',
        }}>
        <Text style={{
          fontSize: 16,
          paddingHorizontal: 5,
          color: '#fff',
          fontWeight: '700',
        }}>
          BUY
        </Text>
      </TouchableOpacity>
      <View style={{ marginHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
        <Text>Powered by </Text>
        <Image
          source={require('../../res/Images/PayU_logo.png')}
          style={{ width: 100, height: 50, resizeMode: 'center' }}
        />
      </View>
    </View>
  )
}

export default PayUPayment;

const styles = StyleSheet.create({});