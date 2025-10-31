# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class org.webrtc.** { *; }
-keep class com.dadio.app.** { *; }
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
  public void onPayment*(...);
# WebRTC
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**

# EnableX SDK
-keep class com.enx.** { *; }
-dontwarn com.enx.**

# InCallManager
-keep class io.wazo.** { *; }
-dontwarn io.wazo.**

# Foreground Service
-keep class com.supersami.foregroundservice.** { *; }
-dontwarn com.supersami.foregroundservice.**

# Firebase (if used)
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**