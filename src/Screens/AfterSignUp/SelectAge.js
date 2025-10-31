import React, { useState } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import R from '../../res/R'
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../../res/components/Button';
// import Toast from "react-native-simple-toast";
// import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

const SelectAge = (props) => {

    const [age, setAge] = useState(moment().subtract(18, 'year')._d);
    const [showPicker, setShowPicker] = useState(false);
    const [maxDate, setMaxDate] = useState(moment().subtract(18, 'year')._d);
    const [minDate, setMinDate] = useState(moment().subtract(70, 'year')._d);

    return (
        <View style={{ flex: 1 }}>
            <Image
                source={R.images.t1}
                style={{ position: 'absolute', top: 0, left: 0, height: 120, width: 180 }}
            />
            <Image
                source={R.images.t2}
                style={{ position: 'absolute', bottom: 0, right: 0, height: 120, width: 180 }}
            />
            <ScrollView>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', margin: 40 }}>
                    <Image
                        source={R.images.logo}
                        style={{ height: 120, width: 190, marginVertical: 10 }}
                    />

                    <View style={{ width: '85%', padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                            Age
                        </Text>
                        <TouchableOpacity
                            style={{ height: 40 }}
                            onPress={() => {
                                console.log("showpicker", showPicker);
                                setShowPicker(!showPicker)
                            }}
                        >
                            <Text style={{
                                marginVertical: 10,
                                width: "100%", borderBottomColor: 'black',
                                borderBottomWidth: StyleSheet.hairlineWidth, height: 40
                            }}>
                                {/* {moment(this.state.age,"").format("DD/MM/YYYY")} */}
                                {moment(age,"").format('DD/MM/YYYY')}
                            </Text>
                        </TouchableOpacity>

                    </View>
                    <Button btnPress={() => {
                        console.log("age is: ",age);
                        // return;
                        props.UploadClick("age", moment(age,"").format('DD/MM/YYYY'))
                    }}
                        btnStyle={{ backgroundColor: "#232323", paddingHorizontal: 15, }} btnText={"Finish!"} />
                </View>
            </ScrollView>
            {/* {showPicker && (<DateTimePicker
                maximumDate={new Date(maxDate)}
                minimumDate={new Date(minDate)}
                testID="dateTimePicker"
                value={new Date(age)}
                mode={'date'}
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => {
                    setAge(moment(selectedDate, "").format("DD/MM/YYYY"));
                    setShowPicker(false);
                }}
            />)} */}

            {showPicker && (
                <DateTimePicker
                testID="dateTimePicker"
                maximumDate={new Date(maxDate)}
                minimumDate={new Date(minDate)}
                value={new Date(age)}
                mode={'date'}
                is24Hour
                display={'default'}
                onChange={(event,selectedDate)=>{
                    setAge(selectedDate);
                    setShowPicker(false);
                }}
              />
            )

            }

        </View>
    )
}
export default SelectAge;
