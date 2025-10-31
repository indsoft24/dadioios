import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import Header from '../../res/components/Header';
import { ActivityIndicator } from 'react-native-paper';
import R from '../../res/R';

const WebViewScreen = (props) => {
    const [isLoading,setIsLoading] = useState(false);
    const goBack=()=> {
        props.navigation.goBack();
    }
    
    return (
        <View style={{flex:1}}>
            <Header backClick={goBack} title={''}/>
            <WebView source={{ uri: props.route.params.url }} style={{ flex: 1 }}
            onLoadStart={()=>{
                setIsLoading(true)
            }}
            onLoadEnd={(event)=>{
                setIsLoading(false)
            }}  
            injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
            scalesPageToFit={false} />
             {isLoading && <ActivityIndicator size={'large'} color={R.colors.cyan} style={{position:'absolute',top:0,bottom:0,left:0,right:0}}/>}
        </View>
        
    )
}

export default WebViewScreen;