
import React, {useState, useEffect} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  Collapse,
  CollapseBody,
  CollapseHeader,
} from 'accordion-collapse-react-native';
import Utils from '../../res/Utils';
import Header from '../../res/components/Header';
import Loader from '../../res/components/Loader';
import colors from '../../res/Colors';

const AccountRow = ({
  leftIconName,
  fieldText,
  secondaryText,
  secondaryTexts,
  hideRightBtn,
  editClick,
  iconColor,
  fieldColor,
}) => {
  return (
    <View>
      <View style={{ flexDirection: 'row', minHeight: 10 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Icon
            name={leftIconName}
            size={25}
            color={fieldColor ? fieldColor : !iconColor ? 'grey' : 'red'}
          />
        </View>
        <View style={{ flex: 5 }}>
          <TouchableOpacity
            onPress={editClick}
            style={{ flexDirection: 'row', flex: 1, marginVertical:12 }}>
            <View style={{ flex: 5, justifyContent: 'center' }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: fieldColor ? fieldColor : '#232323',
                }}>
                {fieldText}
              </Text>
              
            </View>
            <View
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {!hideRightBtn && (
                <TouchableOpacity>
                  <Icon name="pencil" size={20} color="lightgrey" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
          <View
            style={{
              height: 1,
              marginEnd: 20,
              backgroundColor: 'lightgrey',
            }}
          />
        </View>
      </View>
    </View>
  );
};

const Account = ({details, onGoBack, menuClick}) => {
  console.log(details, 'this is chat+++++++++++++++++++');
  const [isLoading, setIsLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState('');

  useEffect(() => {
    Utils.getData(
      'userData',
      (value = data => {
        var userData = JSON.parse(data.value);
        // You might want to set account info here
      }),
    );

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => menuClick('logout'),
        },
      ],
      {cancelable: false},
    );
  };


  getProfileDetails = (userId) => {
    if (!userId) return;
    Utils.ApiPost(`${R.constants.Api.basicInfo}${details.userId}`, (res) => {
      if (res.res === 200 && res.data.res_status === 'success') {
        // this.setState({ data: res.data, isLoading: false });
        setAccountInfo(res.data)
      }
    });
  };
  return (
    <View style={{flex: 1}}>
      {isLoading && (
        <View
          style={{
            zIndex: 1,
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
      {!isLoading && (
        <View style={{flex: 1}}>
          <Header backClick={() => onGoBack()} title={'My Account'} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                height: 160,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                style={{
                  height: 140,
                  width: 140,
                  resizeMode: 'cover',
                  borderRadius: 100,
                  borderWidth: 3,
                  borderColor: '#fff',
                }}
                source={{uri: details?.profile_pic}}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                  marginLeft: 100,
                }}>
                <TouchableOpacity
                  onPress={() => menuClick('profileImage')}
                  style={{
                    backgroundColor: '#fff',
                    padding: 5,
                    borderRadius: 50,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: 'grey',
                  }}>
                  <Icon name="camera" size={20} color="#232323" />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <Collapse>
                <CollapseHeader>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 16,
                      backgroundColor: 'white',
                      borderRadius: 12,
                      marginHorizontal: 16,
                      marginVertical: 8,
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOffset: {width: 0, height: 1},
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                    }}>
                    <View style={{flex: 1}}>

                       <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: '#333',
                        }}>
                        
                      {details.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: '#333',
                        }}>
                         ID: {details.mycode}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#666',
                          marginTop: 2,
                        }}>
                        {details.email_id}
                      </Text>
                      {/* <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: '#05adf6',
                          marginTop: 4,
                        }}>
                        My Points: {details.my_points}
                      </Text> */}
                    </View>

                    <TouchableOpacity
                      style={{
                        backgroundColor: '#FF9900',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        minWidth: 100,
                      }}
                      onPress={() => menuClick('points')}>
                      <Text
                        style={{
                          color: 'white',
                          fontWeight: '600',
                          fontSize: 14,
                            textAlign:"center"
                        }}>
                        Buy Points
                      </Text>
                    </TouchableOpacity>
                    
                  </View>
                  
                </CollapseHeader>
                <CollapseBody>
                  <View style={{marginLeft: 15}}>
                    <AccountRow
                      editClick={() => menuClick('about', details.about_us)}
                      leftIconName={'information-outline'}
                      fieldText={'About Me'}
                      secondaryText={details.about_us}
                    />
                    <AccountRow
                      editClick={() => menuClick('info')}
                      leftIconName={'information'}
                      fieldText={'Basic Info'}
                      secondaryText={''}
                    />
                    <AccountRow
                      editClick={() => menuClick('reffer')}
                      leftIconName={'share'}
                      fieldText={'Refer & Earn'}
                      secondaryText={''}
                    />
                    <AccountRow
                      editClick={() =>
                        menuClick('recordVoice', details.audio_file)
                      }
                      leftIconName={'microphone'}
                      fieldText={'Record Your Voice'}
                      secondaryText={''}
                    />
                  </View>
                </CollapseBody>
              </Collapse>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 24,
                  marginVertical: 10,
                  alignItems:"center",
                  borderWidth:1,
                  borderStyle:"dotted",
                  padding:10,
                  borderRadius:10
                }}>
                <Text style={{fontWeight: '600', color: colors.black}}>
                  Chat Validity
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                           {details.chat_expire_date !== "01-Jan-1970" && (
  <Text style={{fontWeight: '600', color: colors.black}}>
    {details.chat_expire_date}
  </Text>
)}
                  <TouchableOpacity    onPress={() => menuClick('buyChat')}  
                      style={{
                        backgroundColor: '#FF9900',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        minWidth: 100,
                      }}>
                    <Text
                       style={{
                          color: 'white',
                          fontWeight: '600',
                          fontSize: 14,
                          textAlign:"center"
                        }}>
                      Buy Chat
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            
              <AccountRow
                editClick={() => menuClick('myGift')}
                leftIconName={'gift-outline'}
                fieldText={'My Gifts'}
                secondaryText={''}
              />
              <AccountRow
                editClick={() => menuClick('giftShop')}
                leftIconName={'gift'}
                fieldText={'Buy Gift'}
                secondaryText={''}
              />
              <AccountRow
                editClick={() => menuClick('MostActiveUser')}
                leftIconName={'charity'}
                fieldText={'Most Active Users'}
                secondaryText={''}
                fieldColor={'#02adf5'}
              />
              <AccountRow
                editClick={() => menuClick('preferences')}
                leftIconName={'account-group'}
                fieldText={'My Search Preference'}
                secondaryText={''}
              />
              <AccountRow
                editClick={() => menuClick('search')}
                leftIconName={'magnify'}
                fieldText={'Search Users'}
                secondaryText={''}
              />
              <Collapse>
                <CollapseHeader>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      padding: 5,
                      minHeight: 50,
                      marginLeft: -5,
                    }}>
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Icon name="shield-account" size={25} color="grey" />
                    </View>

                    <View style={{flex: 5, justifyContent: 'center'}}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: '#232323',
                          padding: 10,
                          marginLeft: -8,
                        }}>
                        Privacy & Security{' '}
                      </Text>
                      <View
                        style={{
                          height: 1,
                          marginEnd: 20,
                          backgroundColor: 'lightgrey',
                        }}
                      />
                    </View>
                  </View>
                </CollapseHeader>
                <CollapseBody>
                  <View style={{marginLeft: 15}}>
                    <AccountRow
                      editClick={() => menuClick('privacy')}
                      leftIconName={'shield-half-full'}
                      fieldText={'Privacy Controls'}
                      secondaryText={''}
                    />
                    <AccountRow
                      editClick={() => menuClick('password')}
                      leftIconName={'key'}
                      fieldText={'Update Passwords'}
                      secondaryText={''}
                    />
                    <AccountRow
                      editClick={() => menuClick('delete')}
                      leftIconName={'delete-forever'}
                      fieldText={'Delete Account'}
                      secondaryText={''}
                    />
                  </View>
                </CollapseBody>
              </Collapse>

              <AccountRow
                editClick={() => menuClick('help')}
                leftIconName={'help-circle'}
                fieldText={'Need Help?'}
                secondaryText={''}
              />

              <AccountRow
                editClick={handleLogout}
                leftIconName={'power'}
                fieldText={'Log out'}
                secondaryText={''}
                iconColor={true}
              />
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default Account;
