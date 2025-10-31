package com.dadio.app.IncomingCall;

import android.os.Parcel;
import android.os.Parcelable;

import androidx.annotation.NonNull;

public class MessageDao implements Parcelable {
    String notification_type;
    String incomingdisplay_name;


    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(@NonNull Parcel parcel, int i) {
        parcel.writeString(notification_type);
        parcel.writeString(incomingdisplay_name);
    }

    public String getNotification_type() {
        return notification_type;
    }

    public void setNotification_type(String notification_type) {
        this.notification_type = notification_type;
    }

    public String getIncomingdisplay_name() {
        return incomingdisplay_name;
    }

    public void setIncomingdisplay_name(String incomingdisplay_name) {
        this.incomingdisplay_name = incomingdisplay_name;
    }
}
