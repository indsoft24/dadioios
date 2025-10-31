


import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  StyleSheet,
} from 'react-native';

import R from '../../res/R';
import Icon from 'react-native-vector-icons/FontAwesome';
import RadioButton from 'react-native-vector-icons/MaterialCommunityIcons';
import TextInputView from '../../res/components/TextInputView';
import Loader from '../../res/components/Loader';
import Toast from 'react-native-simple-toast';
import Utils from '../../res/Utils';
import PayUPayment from '../Payment/PayUPayment';

const { height } = Dimensions.get('window');

class PointsPopup extends Component {
 constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      data: props.details || {
        my_points: 0,
        user_id: '',
        email_id: '',
        display_name: '',
        mobile_number: '',
      },
      value: '',
      paymentMode: 3, 
      showPayU: true,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { details } = this.props;
    const { paymentMode, value, isOrderRequested, data } = this.state;

    // when new details come in
    if (details !== prevProps.details && details?.user_id) {
      this.setState({ data: details }, () => {
        this.getProfileDetails(details.user_id);
      });
    }

    // when value/paymentMode/data change, try to get orderId
    if (
      paymentMode === 3 &&
      parseInt(value) >= 1 &&
      !isOrderRequested &&
      data?.user_id &&
      (value !== prevState.value || paymentMode !== prevState.paymentMode)
    ) {
      this.setState({ isLoading: true, isOrderRequested: true }, this.getOrderId);
    }
  }

  getProfileDetails = (userId) => {
    if (!userId) return;
    Utils.ApiPost(`${R.constants.Api.basicInfo}${userId}`, (res) => {
      if (res.res === 200 && res.data.res_status === 'success') {
        this.setState({ data: res.data, isLoading: false });
      }
    });
  };

  getOrderId = () => {
    const { data, value } = this.state;
    Utils.ApiPost(`${R.constants.Api.buyUserPoints}${data.user_id}&enter_points=${value}`, (res) => {
      if (res.res === 200 && res.data.res_status === 'success') {
        this.setState({ orderId: res.data.order_id });
      } else {
        Toast.show(res.data?.res_msg || 'Error', Toast.SHORT);
      }
      this.setState({ isLoading: false });
    });
  };

handlePayuPayment = (status, transactionId, orderId) => {
  console.log('PayU payment status:', status);
  const { data } = this.state;
  
  if (status === 'success') {
    Toast.show('Payment Successful', Toast.SHORT);
    this.UpdatePayment('success', transactionId, orderId, () => {
      // Callback after payment is updated
      this.getProfileDetails(data.user_id);
    });
  } else {
    this.UpdatePayment('failure', '', orderId);
  }
};

UpdatePayment = (status, paymentId, orderId, callback) => {
  const { data } = this.state;
  
  Utils.ApiPost(
    `${R.constants.Api.UpdatePayment}${data.user_id}&action=${status}&order_id=${orderId}&payment_notes=${paymentId || ''}`,
    (response) => {
      console.log('UpdatePayment response:', response);
      this.setState({ isLoading: false, value: '' });
      
      if (this.props.onPointsPurchased) {
        this.props.onPointsPurchased();
      }
      
      // Execute callback if provided
      if (typeof callback === 'function') {
        callback();
      }
      
      // Only close the modal if payment failed
      if (status !== 'success' && this.props.onClose) {
        this.props.onClose();
      }
    }
  );
};
  navListing = (type) => {
    const { navigation } = this.props;
    const { data } = this.state;
    if (type === 'payout') {
      navigation?.navigate('Payout', {
        backFromPayout: () => this.getProfileDetails(data.user_id),
      });
    } else {
      navigation?.navigate('Listing', { type });
    }
  };

  handleClose = () => {
    this.setState({
      value: '',
      orderId: null,
      isOrderRequested: false,
    });
    this.props.onClose?.();
  };

   renderPayUComponent = () => {
    if (!this.state.showPayU || !this.state.value || parseInt(this.state.value) <= 0) {
      return null;
    }

    return (
      <View style={styles.payuContainer}>
      <PayUPayment PurchaseType="Points" PurchaseData={this.state} Prop={this.props.route} 
            onPaymentComplete={this.handlePayuPayment} 
            onLoading={(isLoad)=>{
              console.log("===isLoad==", isLoad)
              this.setState({isLoading: isLoad});
            }}
            />
      </View>
    );
  };

  render() {
    const { visible } = this.props;
    const { isLoading, value, data, paymentMode } = this.state;

    return (
      <Modal visible={visible} animationType="slide" onRequestClose={this.handleClose} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={this.handleClose}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>

            <View style={styles.pointsContainer}>
              <Icon name="diamond" size={20} color="#232323" />
              <Text style={styles.pointsText}>My Points: {data.my_points || 0}</Text>
            </View>

            <TextInputView
              title="Enter Points"
              length={6}
              placeholder="Enter Points"
              textValue={value}
              onChangeValue={(text) =>
                this.setState({ value: text.replace(/[^0-9]/g, '') })
              }
              keyboardType="decimal-pad"
            />

            <View style={styles.paymentOptions}>
              <TouchableOpacity style={styles.radioButton} onPress={() => this.setState({ paymentMode: 3 })}>
                <RadioButton
                  name={paymentMode === 3 ? 'radiobox-marked' : 'radiobox-blank'}
                  size={20}
                  color="#000"
                />
                <Text style={styles.optionText}>PayU</Text>
              </TouchableOpacity>
            </View>

            {this.renderPayUComponent()}

            {/* {data.payout_showhide === 'show' && (
              <View style={styles.listingButtons}>
                <TouchableOpacity onPress={() => this.navListing('payout')} style={styles.listButton}>
                  <Icon name="money" size={20} color="#232323" />
                  <Text style={styles.listButtonText}>Payout</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.navListing('log')} style={styles.listButton}>
                  <Icon name="money" size={20} color="#232323" />
                  <Text style={styles.listButtonText}>Payout Log</Text>
                </TouchableOpacity>
              </View>
            )} */}
          </View>

          {isLoading && (
            <View style={styles.loaderContainer}>
              <Loader />
            </View>
          )}
        </View>
      </Modal>
    );
  }
}

export default PointsPopup;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: height * 0.8,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  pointsText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentOptions: {
    marginVertical: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  listingButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  listButton: {
    flex: 1,
    backgroundColor: '#d3d3d3',
    height: 60,
    borderRadius: 10,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listButtonText: {
    marginTop: 5,
    fontSize: 16,
    color: '#232323',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payuContainer: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    padding: 10,
  },
});
