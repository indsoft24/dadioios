import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const GiftPopup = ({ visible, onClose, onSendGift, gifts, isLoading }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={"fade"}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Gift</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close-thick" size={25} color="#fff" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <FlatList
              data={gifts}
              numColumns={2}
              keyExtractor={(item) => item.gift_id}
              renderItem={({ item }) => (
                <View style={styles.giftItem}>
                  <View style={styles.giftImageContainer}>
               <Image 
  source={{ uri: item.gift_image || 'https://example.com/fallback.png' }}
  style={styles.giftImage}
  onError={(e) => console.log("Image failed to load:", e.nativeEvent.error)}
/>
                  </View>
                  <Text style={styles.giftName}>{item.gift_name}</Text>
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => onSendGift(item.gift_id, item.payment_id)}
                  >
                    <Text style={styles.sendButtonText}>Send</Text>
                    <Icon name="send" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No Gifts Available</Text>
                </View>
              }
            />
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.buyMoreButton}
              onPress={() => {
                onClose();
                // Navigate to GiftShop if needed
              }}
            >
              <Icon name="gift" size={25} color="red" />
              <Text style={styles.buyMoreText}>Buy More Gifts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 10,
    height:400
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#232323',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftItem: {
    alignItems: 'center',
    width: (Dimensions.get('window').width - 60) / 2,
    margin: 10,
  },
  giftImageContainer: {
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    borderColor: '#d3d3d3',
    marginVertical: 10,
  },
  giftImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  giftName: {
    color: '#232323',
    marginBottom: 5,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#232323',
  },
  sendButtonText: {
    color: '#fff',
    marginRight: 5,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
  },
  modalFooter: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  buyMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyMoreText: {
    color: 'red',
    fontSize: 18,
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
});

export default GiftPopup;