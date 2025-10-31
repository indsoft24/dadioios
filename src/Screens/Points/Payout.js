import React from 'react';
import { View, Text, BackHandler, Dimensions, TouchableOpacity } from 'react-native';
import Header from '../../res/components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import R from '../../res/R';
import Button from '../../res/components/Button';
import Utils from '../../res/Utils';
import TextInputView from '../../res/components/TextInputView';
import Toast from 'react-native-simple-toast';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { Picker } from '@react-native-picker/picker'

export default class Payout extends React.Component {
  constructor() {
    super();
    this.state = {
      user_id: '',
      pointsValue: '',
      payoutValue: '',
      payoutMode: '',
      payTmNumber: '',
      bankName: '',
      ifsc: '',
      holderName: '',
      accountNumber: '',
      fullName:'',
      mobile_number:'',
      upi_id:''
    };

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    this.goBack();
    return true;
  }

  componentDidMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    this.getUserId();
  }

  getUserId() {
    Utils.getData(
      'userData',
      (value = (data) => {
        var userData = JSON.parse(data.value);
        this.setState({ user_id: userData.user_id }, () => {
          this.getProfileDetails();
        });
      }),
    );
  }

  getProfileDetails() {
    this.setState({ isLoading: true });
    Utils.ApiPost(
      `${R.constants.Api.basicInfo}${this.state.user_id}`,
      (response = (data) => {
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            // console.log("basicInfo service===>",data.data)
            this.setState({ pointsValue: data.data }, () => {
              this.clearform('all');
            });
          }
        }
      }),
    );
  }

  goBack() {
    this.props.route.params.backFromPayout();
    this.props.navigation.goBack();
  }

  renderPaytm() {
    return (
      <View>
        <TextInputView
          title={'Paytm Mobile Number'}
          placeholder={'Enter Paytm Mobile Number'}
          textValue={this.state.payTmNumber}
          onChangeValue={(text) =>
            this.setState({ payTmNumber: text.replace(/[^0-9]/g, '') })
          }
          keyboardType={'decimal-pad'}
          length={10}
        />
      </View>
    );
  }
  renderBank() {
    return (
      <View>
        <TextInputView
          title={'Bank Name'}
          placeholder={'Enter Bank Name'}
          textValue={this.state.bankName}
          onChangeValue={(text) => this.setState({ bankName: text })}
          keyboardType={'default'}
        />
        <TextInputView
          title={'IFSC Code'}
          placeholder={'Enter IFSC Code'}
          textValue={this.state.ifsc}
          onChangeValue={(text) => this.setState({ ifsc: text })}
          keyboardType={'default'}
          length={10}
        />
        <TextInputView
          title={'Account Holder Name'}
          placeholder={'Enter Account Holder Name'}
          textValue={this.state.holderName}
          onChangeValue={(text) => this.setState({ holderName: text })}
          keyboardType={'default'}
        />
        <TextInputView
          title={'Account Number'}
          placeholder={'Enter Account Number'}
          textValue={this.state.accountNumber}
          onChangeValue={(text) =>
            this.setState({ accountNumber: text.replace(/[^0-9]/g, '') })
          }
          keyboardType={'decimal-pad'}
          length={16}
        />
      </View>
    );
  }

  renderPaymentDetailsInputFields() {
    return (
      <View style={{flex:1}}>
        <TextInputView
          title={'Full Name'}
          placeholder={'Enter Full Name'}
          textValue={this.state.fullName}
          onChangeValue={(text) => this.setState({ fullName: text })}
          keyboardType={'default'}
        />
        <TextInputView
          title={'Mobile Number'}
          placeholder={'Enter Mobile Number'}
          textValue={this.state.mobile_number}
          onChangeValue={(text) => this.setState({ mobile_number: text.replace(/[^0-9]/g, '') })}
          keyboardType={'decimal-pad'}
          length={10}
        />
        <TextInputView
          title={'UPI ID'}
          placeholder={'Enter UPI ID'}
          textValue={this.state.upi_id}
          onChangeValue={(text) => this.setState({ upi_id: text })}
          keyboardType={'default'}
        />

      </View>
    );
  }

  _ValidateInput() {
    let error = true;
    if (parseInt(this.state.payoutValue) < 100) {
      Toast.show('minimum payout value is 100', Toast.SHORT);
    } else if (this.state.payoutValue.trim() == '') {
      Toast.show('Please enter Amount', Toast.SHORT);
    } else {
      // if (this.state.payoutMode == 'paytm') {
      //   if (this.state.payTmNumber.trim() == '') {
      //     Toast.show('please Enter Number', Toast.SHORT);
      //   } else if (this.state.payTmNumber.length !== 10) {
      //     Toast.show('Phone number should be 10 digits', Toast.SHORT);
      //   } else {
      //     error = false;
      //   }
      // }
      // if (this.state.payoutMode == 'bank') {
      //   if (this.state.bankName.trim() == '') {
      //     Toast.show('please Enter Bank Name', Toast.SHORT);
      //   } else if (this.state.ifsc.trim() == '') {
      //     Toast.show('please Enter ifsc code', Toast.SHORT);
      //   } else if (this.state.holderName.trim() == '') {
      //     Toast.show('please Enter Account holder name', Toast.SHORT);
      //   } else if (this.state.accountNumber.trim() == '') {
      //     Toast.show('please Enter Account Number', Toast.SHORT);
      //   } else {
      //     error = false;
      //   }
      // }

      let upiRegex = new RegExp(/^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z._]{2,49}$/);
      let mobileRegex = /(6|7|8|9)\d{9}/
      if (this.state.fullName.trim() == '') {
        Toast.show('please Enter Full Name', Toast.SHORT);
      } else if (this.state.mobile_number.trim() == '') {
        Toast.show('please Enter Mobile Number', Toast.SHORT);
      }else if(!mobileRegex.test(this.state.mobile_number.trim())){
        Toast.show('please Enter Valid Mobile Number', Toast.SHORT);
      } else if (this.state.upi_id.trim() == '') {
        Toast.show('please Enter UPI ID', Toast.SHORT);
      } else if (!upiRegex.test(this.state.upi_id.trim())) {
        Toast.show('please Enter Valid UPI ID', Toast.SHORT);
      } else {
        error = false;
      }
      if (!error) {
        this.ApplyPayout();
      }
    }
  }

  ApplyPayout() {
    // console.log(
    //   `${R.constants.Api.applyPayout}${this.state.pointsValue.user_id
    //   }&payout_mode=${this.state.payoutMode == 'paytm' ? '10' : '20'}${this.state.payoutMode == 'paytm'
    //     ? `&paytm_number=${this.state.payTmNumber}`
    //     : `&bank_name=${this.state.bankName}&ifsc_code=${this.state.ifsc}&account_holdername=${this.state.holderName}&account_number=${this.state.accountNumber}`
    //   }`,
    // );
    let mode = "30";
    console.log(
      `${R.constants.Api.applyPayout}${this.state.pointsValue.user_id
      }&enter_points=${this.state.payoutValue}&payout_mode=${mode}${
        `&account_holdername=${this.state.fullName}&mobile_number=${this.state.mobile_number}&upi_address=${this.state.upi_id}`
      }`,
    );
    
    // Utils.ApiPost(
    //   `${R.constants.Api.applyPayout}${this.state.pointsValue.user_id
    //   }&enter_points=${this.state.payoutValue}&payout_mode=${this.state.payoutMode == 'paytm' ? '10' : '20'
    //   }${this.state.payoutMode == 'paytm'
    //     ? `&paytm_number=${this.state.payTmNumber}`
    //     : `&bank_name=${this.state.bankName}&ifsc_code=${this.state.ifsc}&account_holdername=${this.state.holderName}&account_number=${this.state.accountNumber}`
    //   }`,
    //   (response = (data) => {
    //     console.log('payout response===', this.state.payoutMode, '===>', data);
    //     this.getProfileDetails();
    //     Toast.show('Payout Applied Sucessfully.');
    //   }),
    // );

    Utils.ApiPost(
      `${R.constants.Api.applyPayout}${this.state.pointsValue.user_id
      }&enter_points=${this.state.payoutValue}&payout_mode=${mode}${
        `&account_holdername=${this.state.fullName}&mobile_number=${this.state.mobile_number}&upi_address=${this.state.upi_id}`
      }`,
      (response = (data) => {
        console.log('payout response===', this.state.payoutMode, '===>', data);
        this.getProfileDetails();
        Toast.show('Payout Applied Sucessfully.');
      }),
    );
  }

  clearform(type) {
    if (type == 'all') {
      this.setState({ payoutValue: '' });
    }
    this.setState({
      payTmNumber: '',
      bankName: '',
      ifsc: '',
      holderName: '',
      accountNumber: '',
      mobile_number:'',
      upi_id:'',
      fullName:''
    });
  }

  render() {
    return (
      <View
        style={{
          flex:1,
          height: Dimensions.get('screen').height - 50,
          backgroundColor: '#fff',
        }}>
        <Header backClick={() => this.goBack()} title={'Payout'} />
        <KeyboardAwareScrollView
          style={{flex:1}}>
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
            <Text style={{ fontSize: 16, paddingHorizontal: 5 }}>
              My Points: {this.state.pointsValue.my_points}
            </Text>
          </View>
          <TextInputView
            title={'Enter Points To Redeem'}
            placeholder={'Enter Points'}
            textValue={this.state.payoutValue}
            onChangeValue={(text) =>
              this.setState({ payoutValue: text.replace(/[^0-9]/g, '') })
            }
            keyboardType={'decimal-pad'}
            length={6}
          />
          <View style={{ marginVertical: 10, paddingHorizontal: 20 }}>
            {/* <Text
              style={{paddingHorizontal: 4, fontSize: 16, fontWeight: 'bold'}}>
              Your Preferred Payout Mode
            </Text> */}
            <Text
              style={{ paddingHorizontal: 4, fontSize: 16, fontWeight: 'bold' }}>
              Enter Payment Details
            </Text>
            {/* <Picker
              selectedValue={this.state.payoutMode}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: R.colors.placeHolderColor,
              }}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({payoutMode: itemValue}, () => this.clearform(''))
              }>
              <Picker.Item label="Select Mode" value="" />
              <Picker.Item label="PayTm" value="paytm" />
              <Picker.Item label="Bank Account" value="bank" />
            </Picker> */}
          </View>
          {/* {this.state.payoutMode == 'paytm' && this.renderPaytm()} */}
          {/* {this.state.payoutMode == 'bank' && this.renderBank()} */}
          {this.renderPaymentDetailsInputFields()}
          <TouchableOpacity
            onPress={() => this._ValidateInput()}
            style={{
              height: 50,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 15,
              backgroundColor: R.colors.cyan,
              marginVertical: 20
            }}>
            <Text style={{ fontSize: 15, paddingHorizontal: 5, color: '#000', fontWeight: '700' }}>
              Claim Payout
            </Text>
          </TouchableOpacity>
          <View style={{ marginTop: 15,marginBottom:30,marginHorizontal:15 }}>
            <Text style={{ fontSize: 10, color: 'black', fontWeight: '700',marginVertical:5 }}><Text style={{fontWeight:'normal',fontSize:8}}>{'\u2B24'}</Text>  Minimum 100 points can be claimed for Payout</Text>
            <Text style={{ fontSize: 10, color: 'black', fontWeight: '700' }}><Text style={{fontWeight:'normal',fontSize:8}}>{'\u2B24'}</Text>  Payout will be credited every Sunday</Text>
          </View>

        </KeyboardAwareScrollView>
        {/* {this.state.payoutMode !== '' && (
          <View style={{position: 'absolute', bottom: 20, width: '100%'}}>
            <Button
              btnPress={() => this._ValidateInput()}
              btnStyle={{backgroundColor: R.colors.submit, flex: 1}}
              btnText={'PAYOUT'}
            />
          </View>
        )} */}

      </View>
    );
  }
}
