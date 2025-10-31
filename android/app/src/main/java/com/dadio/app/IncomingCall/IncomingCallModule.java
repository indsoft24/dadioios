package com.dadio.app.IncomingCall;

import static android.content.Context.ACTIVITY_SERVICE;
import static androidx.core.content.ContextCompat.RECEIVER_EXPORTED;
import static androidx.core.content.ContextCompat.getSystemService;
import static androidx.core.content.ContextCompat.registerReceiver;

import android.Manifest;
import android.app.ActivityManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.RemoteViews;

import com.dadio.app.Firebase.FirebaseMessaging;
import com.dadio.app.Firebase.MessagingSerializer;

import com.dadio.app.MainActivity;
import com.dadio.app.R;
import com.google.firebase.messaging.RemoteMessage;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import java.net.SocketTimeoutException;
import java.util.Iterator;

public class IncomingCallModule extends ReactContextBaseJavaModule {

    private ReactContext reactContext;
    private WritableMap messageMap = null;
    private Boolean isDashboardMounted;
    private LocalBroadcastReceiver mLocalBroadcastReceiver;
    LocalBroadcastManager localBroadcastManager;
    LocalBroadcastManager incomingCallBroadCastManager;

    private Ringtone ringtone;
    public static final String CHANNEL_ID = "incoming_call";
    private static final String TAG = "IncomingCall";

    IncomingCallModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        this.mLocalBroadcastReceiver = new LocalBroadcastReceiver();
        localBroadcastManager = LocalBroadcastManager.getInstance(reactContext);
        localBroadcastManager.registerReceiver(mLocalBroadcastReceiver, new IntentFilter("com.incomingcall.data"));
    }

    //    Name of the React Module
    @Override
    public String getName() {
        return "IncomingCall";  // Name of the Native Modules.
    }


//React method to be extracted

    /**
     * @param message FCM Remote Message
     */
    @ReactMethod
    public void displayIncomingCall(ReadableMap message) {
        try {
            WritableNativeMap data = Arguments.makeNativeMap(Arguments.toBundle(message));
            WritableMap response = Arguments.createMap();
            response.putMap("data", data);
            // message.putString("message","Event Traveled From native -> React");
            sendEvent("gotcha", response);
        } catch (RuntimeException e) {
            System.out.println(e);
        }

    }

    BroadcastReceiver mBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent.getAction().equals("com.incomingcall.action.reject") || intent.getAction().equals("com.incomingcall.action.answer")) {
                NotificationManager mNotificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                mNotificationManager.cancel(100);
                Log.e(TAG, "Call Attended !");
                if (ringtone != null && ringtone.isPlaying()) {
                    ringtone.stop();
                    ringtone = null;
                }

            } else if (intent.getAction().equals("com.incomingcall.action.stopringtone")) {
                NotificationManager mNotificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                mNotificationManager.cancel(100);
                if (ringtone != null && ringtone.isPlaying()) {
                    ringtone.stop();
                    ringtone = null;
                }
                Log.e(TAG, "RingtoneStopped");
            }
        }
    };

    @ReactMethod
    public void displayIncomingCallV2(ReadableMap message) {
//        Log.d(TAG, "displayIncomingCallV2: "+message);
        MessageDao messageDao = new MessageDao();
        messageDao.setNotification_type(message.getString("notification_type"));
        messageDao.setIncomingdisplay_name(message.getString("incomingdisplay_name"));

//        Log.d(TAG, "displayIncomingCallV2: "+message);
        IntentFilter mIntentFilter = new IntentFilter();
        mIntentFilter.addAction("com.incomingcall.action.reject");
        mIntentFilter.addAction("com.incomingcall.action.answer");
        mIntentFilter.addAction("com.incomingcall.action.stopringtone");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactContext.registerReceiver(mBroadcastReceiver, mIntentFilter, Context.RECEIVER_EXPORTED);
        }else {
            reactContext.registerReceiver(mBroadcastReceiver, mIntentFilter);
        }
//        incomingCallBroadCastManager = LocalBroadcastManager.getInstance(reactContext);
//        incomingCallBroadCastManager.registerReceiver(mBroadcastReceiver, mIntentFilter);

        try {
//            if(message != null){
//                Log.e(TAG,message.getNotification().getBody().toString());
//            }
            if(message != null){
                Log.e(TAG,message.toString());
                String notifDataType = message.getString("notification_type");
                String startCallType="incoming_call";
                String disconnectCallType="calldisconnected";
                if(startCallType.equals(notifDataType)|| disconnectCallType.equals(notifDataType)) {
                    showIncomingCallScreen(messageDao,!isAppRunning());
                }
            }
        } catch (Exception e) {
            Log.e(TAG,e.getMessage());
        }
    }

    private void showIncomingCallScreen(MessageDao remoteMessage, boolean isAppRunning) {
        String notifDataType = remoteMessage.getNotification_type();
        String startCallType = "incoming_call";
        String disconnectCallType = "calldisconnected";
        if (startCallType.equals(notifDataType)) {
            Intent i = getIncomingCallActivity(remoteMessage, isAppRunning);
            //startActivity(i);
            buildNormal(remoteMessage, i);
        } else if (disconnectCallType.equals((notifDataType))) {
            LocalBroadcastManager localBroadcastManager = LocalBroadcastManager
                    .getInstance(reactContext);
            localBroadcastManager.sendBroadcast(new Intent(
                    "com.incomingcallscreenactivity.action.close"));
        }
    }

    private void buildNormal(MessageDao remoteMessage, Intent intent) {

        createNotificationChannel();

//        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.Q) {
//            // Get the layouts to use in the custom notification
//            //RemoteViews notificationLayout = new RemoteViews(getPackageName(), R.layout.layout_incoming_call);
//            //RemoteViews notificationLayoutExpanded = new RemoteViews(getPackageName(), R.layout.notification_large);
//            RemoteViews callLayout = new RemoteViews(reactContext.getPackageName(), R.layout.layout_call_actions);
//            setListenersToNotificationView(callLayout, remoteMessage);
//
//            NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(reactContext, CHANNEL_ID)
//                    .setPriority(NotificationCompat.PRIORITY_HIGH)
//                    .setSmallIcon(R.mipmap.icon)
////                .setContentTitle(remoteMessage.getData().get("title"))
////                .setContentText(remoteMessage.getData().get("callerName"))
//                    .setAutoCancel(true)
//                    .setOngoing(true)
//                    .setTimeoutAfter(30000)
//                    .setCustomHeadsUpContentView(callLayout)
////                .addAction(0, remoteMessage.getData().get("answerTitle"),answerCallIntent )
////                .addAction(0, remoteMessage.getData().get("declineTitle"), null)
//                    .setFullScreenIntent(buildPendingIntent(reactContext, intent), true);
//
//            NotificationManagerCompat notificationManager = NotificationManagerCompat.from(reactContext);
//
//            // notificationId is a unique int for each notification that you must define
//            if (ActivityCompat.checkSelfPermission(reactContext, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
//                return;
//            }
//            notificationManager.notify(100, mBuilder.build());
//
//        } else {
            reactContext.startActivity(intent);
//        }

        // Log.e(TAG,"Ringtone Service Started...");
        // Uri ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        // Intent startIntent = new Intent(this, RingtonePlayingService.class);
        // startIntent.putExtra("ringtone-uri", ringtoneUri);
        // startService(startIntent);

        //ringtoneManager start
        Uri incoming_call_notif = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        this.ringtone = RingtoneManager.getRingtone(reactContext, incoming_call_notif);
        //ringtoneManager end

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            ringtone.setLooping(true);
        }
        
        // Set audio attributes for proper audio focus
        try {
            ringtone.play();
        } catch (Exception e) {
            Log.e(TAG, "Error playing ringtone: " + e.getMessage());
        }
        
        final Handler handler = new Handler(Looper.getMainLooper());
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                //The code you want to run after the time is up
                if (ringtone != null && ringtone.isPlaying()) {
                    ringtone.stop();
                    ringtone = null;
                }
            }
        }, 30000); //the time you want to delay in milliseconds

    }

    private Intent getMainActivityIntent(MessageDao remoteMessage, boolean isAppRunning) {
        Intent intent = new Intent(reactContext, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        // Log.e(TAG,remoteMessage.getData().toString());
        intent.putExtra("message", remoteMessage);
        intent.putExtra("isAppRunning", isAppRunning);
        return intent;
    }

    private Intent getIncomingCallActivity(MessageDao remoteMessage, boolean isAppRunning) {
        Intent intent = new Intent(reactContext, IncomingCallScreenActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_NO_HISTORY);
        intent.putExtra("message", remoteMessage);
        intent.putExtra("isAppRunning", isAppRunning);
        return intent;
    }

    private void setListenersToNotificationView(RemoteViews callLayout, MessageDao remoteMessage) {

        Intent intent = getMainActivityIntent(remoteMessage, isAppRunning());

        PendingIntent answerCallIntent = PendingIntent.getActivity(reactContext,
                0, intent.setAction("com.incomingcall.action.answer"), PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        PendingIntent rejectCallIntent = PendingIntent.getActivity(reactContext,
                0, intent.setAction("com.incomingcall.action.reject"), PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // remoteMessage.getData().get("answerTitle")
        // remoteMessage.getData().get("declineTitle")
        callLayout.setTextViewText(R.id.answerTitle, "Answer");
        callLayout.setOnClickPendingIntent(R.id.answerTitle, answerCallIntent);
        callLayout.setTextViewText(R.id.rejectTitle, "Decline");
        callLayout.setOnClickPendingIntent(R.id.rejectTitle, rejectCallIntent);
        callLayout.setTextViewText(R.id.callerName, remoteMessage.getIncomingdisplay_name());

    }

    private PendingIntent buildPendingIntent(Context context, Intent intent) {

        return (PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT));
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            //ringtoneManager start
            Uri incoming_call_notif = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            AudioAttributes att = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build();
            int importance = NotificationManager.IMPORTANCE_HIGH;
            //using same string for both channelId and name. Ideally use different strings
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_ID, importance);
            channel.setSound(incoming_call_notif, att);
            // Register the channel with the system; you can't change the importance or other notification behaviors after this
            NotificationManager notificationManager = reactContext.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private boolean isAppRunning() {
        try {
            ActivityManager m = (ActivityManager) reactContext.getSystemService(ACTIVITY_SERVICE);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                // Use ActivityManager for newer APIs
                java.util.List<ActivityManager.RunningTaskInfo> runningTaskInfoList = null;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    // Android 10+ doesn't allow getRunningTasks without QUERY_ALL_PACKAGES permission
                    // Alternative approach
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            runningTaskInfoList = m.getRunningTasks(1);
                        } else {
                            return true; // Assume app is running
                        }
                    } catch (SecurityException e) {
                        Log.e(TAG, "Security exception checking running tasks: " + e.getMessage());
                        return true; // Assume app is running if we can't check
                    }
                } else {
                    runningTaskInfoList = m.getRunningTasks(10);
                }
                
                if (runningTaskInfoList != null) {
                    Iterator<ActivityManager.RunningTaskInfo> itr = runningTaskInfoList.iterator();
                    int n = 0;
                    while (itr.hasNext()) {
                        n++;
                        itr.next();
                    }
                    return n > 1; // If more than 1 task, app is running
                }
            }
            return true; // Default to app running if we can't determine
        } catch (Exception e) {
            Log.e(TAG, "Error checking if app is running: " + e.getMessage());
            return true; // Default to app running
        }
    }

    @ReactMethod
    public void stopRingtone() {
        localBroadcastManager.sendBroadcast(new Intent("com.incomingcall.action.stopringtone"));
        // Also stop ringtone directly
        if (ringtone != null && ringtone.isPlaying()) {
            ringtone.stop();
            ringtone = null;
        }
        // Intent stopIntent = new Intent(reactContext, RingtonePlayingService.class);
        // reactContext.stopService(stopIntent);
    }

    @ReactMethod
    public void dashboardMounted() {
        try{
            Log.e("MODULE" ,"dashboardMounted : "+ true);
            this.isDashboardMounted =true;
            sendIncomingCallData();
        } catch (RuntimeException e){
            Log.e("IncomingCallModule","dashboardMounted : "+e.toString());
            System.out.println(e);
        }
    }

    @ReactMethod
    public void dashboardUnMounted() {
        try{
            Log.e("MODULE" ,"dashboardMounted : "+false);
            this.isDashboardMounted =false;
     } catch (RuntimeException e){
        System.out.println(e);
    }

    }

    @ReactMethod
    public void sendIncomingCallData() {
        if(isDashboardMounted && getMessage() != null)
        {
            sendEvent("incomingcall", getMessage());
            Log.e("MODULE" , "Remote message data sent!");
        }
    }

    private void sendEvent(String eventName, WritableMap params) {
        try{

            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);

        } catch (RuntimeException e){
            System.out.println(e);
        }

    }

    private void setMessage(WritableMap messageMap) {
        try{
        this.messageMap=messageMap;
        }catch (RuntimeException e){
            System.out.println(e);
        }
    }

    private WritableMap getMessage() {
        
        return this.messageMap;
    }

    public class LocalBroadcastReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            try{
            if(intent.getAction().equals("com.incomingcall.data") && intent.hasExtra("message")){
                    Log.e("MODULE" , "Recieved");
                    RemoteMessage message = intent.getParcelableExtra("message");
                    Log.e("MODULE" , message.getData().toString());
                    WritableMap messageMap = MessagingSerializer.parseRemoteMessage(message);
                    messageMap.putString("action", intent.getStringExtra("action"));
                    messageMap.putBoolean("isAppRunning", intent.getBooleanExtra("isAppRunning",false));
                    setMessage(messageMap);
                    sendIncomingCallData();
                }
            } catch(RuntimeException e){
            System.out.println(e);

            }
        }
    }

    // MyNotificationReceiver.java
    public class MyNotificationReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            // Handle the notification event and launch the desired intent
            Intent launchIntent = new Intent(context, IncomingCallScreenActivity.class);
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(launchIntent);
        }
    }
}
