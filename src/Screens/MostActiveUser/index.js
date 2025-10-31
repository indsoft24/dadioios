import React from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import R from '../../res/R';
import Utils from '../../res/Utils';
import Header from '../../res/components/Header';
import Loader from '../../res/components/Loader';

export default class MostActiveUser extends React.Component {
  constructor() {
    super();
    this.state = {
      entries: [],
      user_id: '',
      pageid: 0,
      isLoading: true,
      flatListMoredata: [],
      activeCall: 'false',
      timerValue: '',
      profileEntries: '',
      profileID: '',
    };

    DeviceEventEmitter.addListener('activecalldetails', res => {
      this.getCallingStatus();
    });
  }

  componentDidMount() {
    Utils.getData(
      'userData',
      (value = data => {
        this.getCallingStatus();
        // alert(JSON.stringify(data))
        var userData = JSON.parse(data.value);
        // alert(JSON.stringify(userData.mycode))
        this.setState({user_id: userData.user_id}, () => this.getDetails());
      }),
    );
    console.log(
      'this is testing call Most activeuser ======>',
      this.state.activeCall,
    );
  }

  getProfileDetails = pro => {
    console.log('-----', this.state.user_id);
    console.log('-----', pro);
    Utils.ApiPost(
      `${R.constants.Api.profile}${this.state.user_id}&profile_id=${pro}`,
      (response = data => {
        console.log('profile Most activeUser====>', data);
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            this.setState({profileEntries: data.data, isLoading: false}),
              this.createCall(this.state.profileEntries, 'outgoing');
          }
        }
      }),
    );
  };

  getCallingStatus() {
    Utils.getData(
      'activeCall',
      (value = data => {
        if (data.value == null) {
          // activeCall="false"
          this.setState({activeCall: 'false'});
        } else {
          // activeCall=data.value
          this.setState({activeCall: data.value});
          console.log('activeCall===>', this.state.activeCall, data.value);
        }
        console.log('activeCall===>', this.state.activeCall, data);
      }),
    );
  }

  createCall = (data, value) => {
    console.log('Create call to :===>', data, '====>', value);
    this.props.navigation.navigate('Call', {
      type: value,
      callDetails: data,
      backFromCall: this.backFromCall.bind(this),
    });
  };
  backFromCall() {
    this.getCallingStatus();
  }
  getDetails() {
    Utils.ApiPost(
      `${R.constants.Api.OnlineUser}${this.state.user_id}&pageid=${this.state.pageid}`,
      (response = data => {
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            console.log('OnlineUser===>', data.data);

            // console.log(this.state.pageid);
            const filterArray = this.state.flatListMoredata;

            const uniqueUsers = data.data.online_userlist.filter(
              (user, index, self) =>
                index ===
                self.findIndex(t => t.profile_code === user.profile_code),
            );

            filterArray.push(...uniqueUsers);

            this.setState({
              entries: uniqueUsers,
              flatListMoredata: filterArray,
            });
            // alert(flatListMoredata)

            this.setState({isLoading: false});
          }
        }
      }),
    );
    console.log('Entries', this.state.entries);
  }
  activityIndicator = () => {
    return (
      <View style={{alignItems: 'center', padding: 5}}>
        <ActivityIndicator animating={true} color="#111112" size="large" />
      </View>
    );
  };

  FlatListItemSeparator = () => {
    return <View style={styles.flatlistSeprater} />;
  };
  renderfooter = () => {
    {
      this.state.isLoading ? this.activityIndicator : this.call;
    }
    return (
      <View style={{alignItems: 'center', padding: 5}}>
        <TouchableOpacity
          style={{
            backgroundColor: '#09e63d',
            paddingHorizontal: 20,
            borderRadius: 10,
          }}
          onPress={() => this.getDetails()}>
          <Text style={{fontSize: 17, fontWeight: '700', padding: 6}}>
            Load More
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  goBack() {
    this.props.navigation.goBack();
  }

  handleLoadMore = () => {
    if (this.state.flatListMoredata.length < 20) {
      this.setState(
        {
          pageid: this.state.pageid + 1,
        },
        () => {
          this.getDetails();
        },
      );
    }
  };

  render() {
    // alert(JSON.stringify(this.state.entries.display_name));
    return (
      <View style={{flex: 1}}>
        <View
          style={{flexDirection: 'row', elevation: 5, backgroundColor: '#fff'}}>
          <Header
            style={{flex: 1, elevation: 0}}
            title="Most Active User"
            // style={{flex:1,elevation:0}}
            backClick={() => this.goBack()}
          />
          {/* <Menu
                        button={
                            <TouchableOpacity
                                style={{
                                    backgroundColor: "#fff",
                                    height: 55,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 10
                                }}
                                onPress={() => this.goBack()}>
                                <Icon name="cancel" size={30} color="#232323" />
                            </TouchableOpacity>
                        } /> */}
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
        <FlatList
          ItemSeparatorComponent={this.FlatListItemSeparator}
          data={this.state.flatListMoredata}
          keyExtractor={(item, index) => String(index)}
          onEndReached={this.handleLoadMore}
          onEndReachedThreshold={0.5}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('ProfileDetails', {
                    profile_id: item.profile_id,
                    OnlineUser: 'OnlineUser',
                  })
                }
                style={{
                  padding: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate('ProfileDetails', {
                        profile_id: item.profile_id,
                        OnlineUser: 'OnlineUser',
                      })
                    }>
                    <View>
                      <Image
                        source={{uri: item.profile_pic}}
                        style={{
                          height: 50,
                          width: 50,
                          borderRadius: 50,
                          borderWidth: 2,
                          borderColor: '#ffffff',
                          resizeMode: 'cover',
                        }}
                      />
                      <View
                        style={{
                          backgroundColor: '#24ff02',
                          height: 15,
                          width: 15,
                          borderRadius: 10,
                          borderWidth: 1,
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          borderColor: '#ffffff',
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate('ProfileDetails', {
                        profile_id: item.profile_id,
                        OnlineUser: 'OnlineUser',
                      })
                    }>
                    <View style={{flex: 1, marginHorizontal: 10}}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{flex: 1, fontSize: 16, fontWeight: 'bold'}}>
                        {item.display_name}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', marginHorizontal: 5}}>
                      <Text
                        style={{
                          fontSize: 12,
                          marginHorizontal: 5,
                          color: 'grey',
                        }}>
                        ID:{item.profile_code}
                      </Text>
                      <Text style={{fontSize: 12, color: 'grey'}}>
                        {item.gender}, {item.current_age} Yrs.
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    style={{
                      marginRight: 10,
                      alignItems: 'center',
                      padding: 2,
                      justifyContent: 'center',
                    }}
                    onPress={() => {
                      this.getProfileDetails(item.profile_id);
                    }}>
                    <Icon name="call" size={30} color="#00FF00" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      padding: 2,
                      justifyContent: 'center',
                    }}
                    onPress={() =>
                      this.props.navigation.navigate('ChatScreen', {
                        profileId: item.profile_id,
                      })
                    }>
                    <Icon name="sms" size={30} color="#808080" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
        {this.state.activeCall == 'true' && (
          <TouchableOpacity
            onPress={() => this.createCall(this.state.entries, 'outgoing')}
            style={{
              zIndex: 100,
              position: 'absolute',
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
              height: 30,
              top: 55,
              backgroundColor: '#05adf6',
            }}>
            <Text style={{color: '#fff'}}>On Going call, Tap to expand</Text>
            <View
              style={{
                position: 'absolute',
                right: 5,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
              }}>
              <Text style={{color: '#fff'}}>{this.state.timerValue}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  flatlistSeprater: {
    height: 1,
    marginHorizontal: 20,
    backgroundColor: 'lightgrey',
  },
});