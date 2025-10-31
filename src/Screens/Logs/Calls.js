import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { debounce } from 'lodash';
// import Utils from 'res/Utils'

export default class Calls extends React.Component {
  constructor() {
    super();
    this.state = {
      entries: [],
    };
    this.isCallClickDisabled = false;
    
    // Create stable debounced handler
    this.handlePress = debounce((item) => {
      try {
        console.log('===Button tapped!===', item);
        if (item && this.props.callClickHere) {
          this.props.callClickHere(item);
        }
      } catch (error) {
        console.error('Error in handlePress:', error);
      }
    }, 2000, { leading: true, trailing: false });
  }

  componentDidMount() {
    //console.log('callData====this is call log>', this.props.data);
    this.setState({ entries: this.props.data });

    // //
    // Utils.getData("userData",value=(data)=>{
    //     var userData = JSON.parse(data.value)
    // })
    // //
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.updateAndNotify();
    }
  }

  updateAndNotify() {
    this.setState({ entries: this.props.data });
  }

  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          marginHorizontal: 20,
          backgroundColor: 'lightgrey',
        }}
      />
    );
  };

  handleCallClick = (item) => {
    if (this.isCallClickDisabled) {
      return;
    }

    this.isCallClickDisabled = true;
    this.props.callClickHere(item);
    setTimeout(() => {
      this.isCallClickDisabled = false;
    }, 3000);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          ItemSeparatorComponent={this.FlatListItemSeparator}
          data={this.state.entries}
          keyExtractor={(item, index) => String(index)}
          renderItem={({ item }) => {
            return (
              <View
                style={{
                  padding: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    onPress={() => {
                      if (item && item.profile_id) {
                        this.props.profileNavigate(item.profile_id);
                      }
                    }}>
                    <Image
                      style={{
                        height: 45,
                        width: 45,
                        borderRadius: 50,
                        borderWidth: 2,
                        borderColor: '#fff',
                      }}
                      source={{ uri: item && item.profile_pic ? item.profile_pic : '' }}
                    />
                  </TouchableOpacity>
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                      {item.display_name || 'Unknown'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon
                        name={
                          item.call_activity == '10'
                            ? 'call-made'
                            : item.call_activity == '30'
                              ? 'call-missed'
                              : 'call-received'
                        }
                        size={14}
                        color={
                          item.call_activity == '10'
                            ? 'lightgreen'
                            : item.call_activity == '30'
                              ? 'red'
                              : 'lightgreen'
                        }
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          marginHorizontal: 5,
                          color: 'grey',
                        }}>
                        {item.call_time || ''}
                      </Text>
                    </View>
                  </View>
                </View>
                {item && item.block_call == 10 && (
                  <TouchableOpacity
                    style={{ width: 35 }}
                    onPress={() => {
                      if (item) {
                        this.handlePress(item);
                      }
                    }}>
                    <Icon name="call" size={20} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      </View>
    );
  }
}
