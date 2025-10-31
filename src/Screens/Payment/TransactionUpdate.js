import { React, useState } from 'react'
import R from '../../res/R';
import Utils from '../../res/Utils';
const TransactionUpdate = (productInfo) => {

  if (productInfo == 'gift') {

    const UpdatePayment = (status, orderId) => {
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

  }

  if (productInfo == 'chat') {
    const UpdatePayment = (status, orderId) => {
      Utils.ApiPost(
        `${R.constants.Api.chatPaymentUpdate}${this.props.route.params.userId}&action=${status}&order_id=${orderId}`,
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
  }

  if (productInfo == 'point') {
    const UpdatePayment = (status, orderId) => {

    }
  }
}

export default TransactionUpdate