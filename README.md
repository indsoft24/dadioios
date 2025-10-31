# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding. The latest release build, apk file and project setup docs for windows dated 04/09/2024 is available in the releases section of the repository.  

## Step 1: Installing node modules

Next you have to install the node modules. The currently updated branch is the "dev" branch, so make sure you have the respective branch code on your local setup. Execute the below commands in order.

```bash
# using npm
npm cache clean --force
npm i --legacy-peer-deps
npm config set legacy-peer-deps true
npm i
```
Then there are certain changes you have to make to your node modules and existing files for the app to run on your emulator -:
1. Node module -> index.js (node_modules\react-native-scrollable-tab-view\index.js) = comment the getNode() in 2 places.
   ![image](https://github.com/user-attachments/assets/58784538-426d-49f1-9265-b6f0d9923bf8)


3. EnXStream.js (node_modules\enx-rtc-react-native\src\EnxStream.js)
 = add import 'react-native-get-random-values'; above the v4 import.
![image](https://github.com/user-attachments/assets/7abb4711-614d-4ae3-8240-46b2221ac081)


5. Node Module -> Changes in (payu-non-seamless-react/android/build.gradle) (change "classifier" to "archiveClassifier")
   ![image](https://github.com/user-attachments/assets/da3cebb5-41d8-4e6e-be1b-6f57d2d91a7f)


7. Add the following code in android/app/src/debug/AndroidManifest.xml(android:theme="@style/AppTheme"  tools:replace="android:theme")
8.    It should look like below in the file
      ```bash
        <application
        android:usesCleartextTraffic="true"
        tools:targetApi="28"
        tools:ignore="GoogleAppIndexingWarning"
        android:theme="@style/AppTheme" tools:replace="android:theme"
        />
      ```
 Special Note: For Release build: Two more changes required @ android\app\src\main\AndroidManifest.xml
    8.a) xml header need the namespace for the tools
    ![image](https://github.com/user-attachments/assets/a732c466-bb95-4cbd-a6cc-0035afbea318)
    8.b) theme changes
    ![image](https://github.com/user-attachments/assets/5334e6d6-cb4f-43b0-ade8-4aaf78f496c5)


9. Ensure , right Jdk path is set @\android\gradle.properties
10. Once done head to the PayUPayments.js file in Screens/Payment/PayUPayment.js file. Change the email & phone no. to your own.
   
## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm start and then press 'a'
or
npm run android
```

### For iOS

```bash
# using npm
npm start and then press 'i'
or
npm run ios
```
