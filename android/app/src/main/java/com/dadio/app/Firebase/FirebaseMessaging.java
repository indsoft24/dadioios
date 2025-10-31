package com.dadio.app.Firebase;

import android.app.ActivityManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;


import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.dadio.app.IncomingCall.IncomingCallScreenActivity;
import com.dadio.app.IncomingCall.RingtonePlayingService;
import com.dadio.app.MainActivity;
import com.dadio.app.R;

import java.util.Iterator;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

public class FirebaseMessaging extends FirebaseMessagingService {

    private static DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = null;
    private Ringtone ringtone;
    public static final String CHANNEL_ID = "incoming_call";
    private static final String TAG = "Firebase Messaging.java IncomingCall";
    LocalBroadcastManager localBroadcastManager;
    BroadcastReceiver mBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent.getAction().equals("com.incomingcall.action.reject") || intent.getAction().equals("com.incomingcall.action.answer")) {
                NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                mNotificationManager.cancel(100);
                Log.e(TAG, "Firebse messageing.java Call Attended !");
                if (ringtone != null && ringtone.isPlaying()) {
                    ringtone.stop();
                    ringtone = null;
                }

            } else if (intent.getAction().equals("com.incomingcall.action.stopringtone")) {
                NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                mNotificationManager.cancel(100);
                if (ringtone != null && ringtone.isPlaying()) {
                    ringtone.stop();
                    ringtone = null;
                }
                Log.e(TAG, "Firebse messageing.java RingtoneStopped");
            }
        }
    };


    @Override
    public void onNewToken(String token) {
        Log.e(TAG, token);
        //Add your token in your sharedpreferences.
        getSharedPreferences("_", MODE_PRIVATE).edit().putString("fcm_token", token).apply();
    }

    //Whenewer you need FCM token, just call this static method to get it.
    public static String getToken(Context context) {
        return context.getSharedPreferences("_", MODE_PRIVATE).getString("fcm_token", "empty");
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        IntentFilter mIntentFilter = new IntentFilter();
        mIntentFilter.addAction("com.incomingcall.action.reject");
        mIntentFilter.addAction("com.incomingcall.action.answer");
        mIntentFilter.addAction("com.incomingcall.action.stopringtone");

       

        try {
             if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                registerReceiver(mBroadcastReceiver, mIntentFilter, Context.RECEIVER_EXPORTED);
            }else {
                registerReceiver(mBroadcastReceiver, mIntentFilter);
            }
        } catch (RuntimeException e) {
            System.out.println(e);
        }

        ///registerReceiver(mBroadcastReceiver, mIntentFilter);
        localBroadcastManager = LocalBroadcastManager.getInstance(this);
        localBroadcastManager.registerReceiver(mBroadcastReceiver, mIntentFilter);

        try {
            if (remoteMessage.getNotification() != null) {
                Log.e(TAG, remoteMessage.getNotification().getBody().toString());
            }
            if (remoteMessage.getData() != null) {
                Log.e(TAG, remoteMessage.getData().toString());
                String notifDataType = remoteMessage.getData().get("notification_type");
                String startCallType = "incoming_call";
                String disconnectCallType = "calldisconnected";
                if (startCallType.equals(notifDataType) || disconnectCallType.equals(notifDataType)) {
                    showIncomingCallScreen(remoteMessage, !isAppRunning());
                    // LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(this);
                    // Intent customEvent= new Intent("incomingcall");
                    // customEvent.putExtra( "message",remoteMessage);
                    // localBroadcastManager.sendBroadcast(customEvent);
                    return;
                }
            }
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
    }

    private void showIncomingCallScreen(RemoteMessage remoteMessage, boolean isAppRunning) {
        String notifDataType = remoteMessage.getData().get("notification_type");
        String startCallType = "incoming_call";
        String disconnectCallType = "calldisconnected";
        if (startCallType.equals(notifDataType)) {
            Intent i = getIncomingCallActivity(remoteMessage, isAppRunning);
            //startActivity(i);
            buildNormal(remoteMessage, i);
        } else if (disconnectCallType.equals((notifDataType))) {
            LocalBroadcastManager localBroadcastManager = LocalBroadcastManager
                    .getInstance(FirebaseMessaging.this);
            localBroadcastManager.sendBroadcast(new Intent(
                    "com.incomingcallscreenactivity.action.close"));
        }
    }

    private void buildNormal(RemoteMessage remoteMessage, Intent intent) {

        createNotificationChannel();

        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.Q) {
            // Get the layouts to use in the custom notification
            //RemoteViews notificationLayout = new RemoteViews(getPackageName(), R.layout.layout_incoming_call);
            //RemoteViews notificationLayoutExpanded = new RemoteViews(getPackageName(), R.layout.notification_large);
            RemoteViews callLayout = new RemoteViews(getPackageName(), R.layout.layout_call_actions);
            setListenersToNotificationView(callLayout, remoteMessage);

            NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setSmallIcon(R.mipmap.icon)
//                .setContentTitle(remoteMessage.getData().get("title"))
//                .setContentText(remoteMessage.getData().get("callerName"))
                    .setAutoCancel(true)
                    .setOngoing(true)
                    .setTimeoutAfter(30000)
                    .setCustomHeadsUpContentView(callLayout)
//                .addAction(0, remoteMessage.getData().get("answerTitle"),answerCallIntent )
//                .addAction(0, remoteMessage.getData().get("declineTitle"), null)
                    .setFullScreenIntent(buildPendingIntent(getApplicationContext(), intent), true);

            NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);

            // notificationId is a unique int for each notification that you must define
            notificationManager.notify(100, mBuilder.build());

        } else {
            startActivity(intent);
        }

        // Log.e(TAG,"Ringtone Service Started...");
        // Uri ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        // Intent startIntent = new Intent(this, RingtonePlayingService.class);
        // startIntent.putExtra("ringtone-uri", ringtoneUri);
        // startService(startIntent);

        //ringtoneManager start
        Uri incoming_call_notif = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        this.ringtone = RingtoneManager.getRingtone(getApplicationContext(), incoming_call_notif);
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

    private Intent getMainActivityIntent(RemoteMessage remoteMessage, boolean isAppRunning) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        // Log.e(TAG,remoteMessage.getData().toString());
        intent.putExtra("message", remoteMessage);
        intent.putExtra("isAppRunning", isAppRunning);
        return intent;
    }

    private Intent getIncomingCallActivity(RemoteMessage remoteMessage, boolean isAppRunning) {
        Intent intent = new Intent(this, IncomingCallScreenActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_NO_HISTORY);
        intent.putExtra("message", remoteMessage);
        intent.putExtra("isAppRunning", isAppRunning);
        return intent;
    }

    private void setListenersToNotificationView(RemoteViews callLayout, RemoteMessage remoteMessage) {

        Intent intent = getMainActivityIntent(remoteMessage, isAppRunning());

        PendingIntent answerCallIntent = PendingIntent.getActivity(FirebaseMessaging.this,
                0, intent.setAction("com.incomingcall.action.answer"), PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        PendingIntent rejectCallIntent = PendingIntent.getActivity(FirebaseMessaging.this,
                0, intent.setAction("com.incomingcall.action.reject"), PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // remoteMessage.getData().get("answerTitle")
        // remoteMessage.getData().get("declineTitle")
        callLayout.setTextViewText(R.id.answerTitle, "Answer");
        callLayout.setOnClickPendingIntent(R.id.answerTitle, answerCallIntent);
        callLayout.setTextViewText(R.id.rejectTitle, "Decline");
        callLayout.setOnClickPendingIntent(R.id.rejectTitle, rejectCallIntent);
        callLayout.setTextViewText(R.id.callerName, remoteMessage.getData().get("incomingdisplay_name"));

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
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private boolean isAppRunning() {
        try {
            ActivityManager m = (ActivityManager) this.getSystemService(ACTIVITY_SERVICE);
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

    // private void sendEvent(ReactContext reactContext, String eventName, WritableMap params) {
    //     reactContext
    //             .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
    //             .emit(eventName, params);
    // }

    @Override
    public void onDestroy() {
        try {
            if(mBroadcastReceiver != null){
                unregisterReceiver(mBroadcastReceiver);
                mBroadcastReceiver = null;
            }
        } catch (RuntimeException e) {
            System.out.println(e);
        }
        super.onDestroy();
    }
}