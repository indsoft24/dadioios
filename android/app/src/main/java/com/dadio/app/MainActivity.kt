package com.dadio.app

import android.app.KeyguardManager
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PersistableBundle
import android.util.Log
import android.view.WindowManager
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.google.firebase.messaging.RemoteMessage
import io.wazo.callkeep.RNCallKeepModule


class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Dadio"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)


    override fun onCreate(savedInstanceState: Bundle?) {
       // super.onCreate(savedInstanceState)
        super.onCreate(null) // 🔑 prevents fragment restoration
        //super.onCreate(savedInstanceState);
        // SplashScreen.show(...) has to be called after super.onCreate(...)
        // Below line is handled by '@expo/configure-splash-screen' command and it's discouraged to modify it manually
        // SplashScreen.show(this, SplashScreenImageResizeMode.CONTAIN, ReactRootView.class, false);
        //if(!getIntent().getAction().equals("android.intent.action.MAIN"))
        //{
        //    handleIntent(getIntent());
        //}
    }

    // Permission results

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (grantResults.size > 0) {
            when (requestCode) {
                RNCallKeepModule.REQUEST_READ_PHONE_STATE -> RNCallKeepModule.onRequestPermissionsResult(
                    requestCode,
                    permissions,
                    grantResults
                )
            }
        }
    }

    // private fun handleIntent(intent: Intent) {
    //     val localBroadcastManager = LocalBroadcastManager.getInstance(this)
    //     val customEvent = Intent("com.incomingcall.data")
    //     if (intent.action == "com.incomingcall.action.answer" || intent.action == "com.incomingcall.action.reject") {
    //         val keyguardManager = getSystemService(KEYGUARD_SERVICE) as KeyguardManager
    //         if (keyguardManager.isKeyguardLocked) {
    //             if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
    //                 // For newer than Android Oreo: call setShowWhenLocked, setTurnScreenOn
    //                 setShowWhenLocked(true)
    //                 setTurnScreenOn(true)

    //                 // If you want to display the keyguard to prompt the user to unlock the phone:
    //                 keyguardManager.requestDismissKeyguard(this, null)
    //             }
    //             window.addFlags(
    //                 WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
    //                         WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
    //                         WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
    //                         WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
    //             )
    //         }
    //     }
    //     if (intent.hasExtra("message")) {
    //         val message = intent.getParcelableExtra<RemoteMessage>("message")
    //         Log.e("MAIN", message!!.data.toString())
    //         customEvent.putExtra("message", message)
    //     }
    //     var isAppRunning = false
    //     if (intent.hasExtra("isAppRunning")) {
    //         isAppRunning = intent.getBooleanExtra("isAppRunning", false)
    //         customEvent.putExtra("isAppRunning", isAppRunning)
    //     }
    //     intent.action?.let { Log.e("MAIN", it) }
    //     if (intent.action == "com.incomingcall.action.answer") {
    //         localBroadcastManager.sendBroadcast(Intent("com.incomingcall.action.answer"))
    //         customEvent.setAction("com.incomingcall.data")
    //         customEvent.putExtra("action", "answer")
    //     } else if (intent.action == "com.incomingcall.action.reject") {
    //         localBroadcastManager.sendBroadcast(Intent("com.incomingcall.action.reject"))
    //         customEvent.setAction("com.incomingcall.data")
    //         customEvent.putExtra("action", "reject")
    //     }
    //     Log.e("MAIN", "Start")
    //     localBroadcastManager.sendBroadcast(customEvent)
    //     Log.e("MAIN", "isAppRunning: $isAppRunning")
    //     val handler = Handler(Looper.getMainLooper())
    //     handler.postDelayed(Runnable { //The code you want to run after the time is up
    //         localBroadcastManager.sendBroadcast(customEvent)
    //         Log.e("MAIN", "Stop")
    //     }, 9000)
    // }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        // if (intent != null) {
        //     handleIntent(intent)
        // };
    }
}
