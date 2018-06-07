# Fxt iOS App

This is Fxt iOS app, customer side app for home service bookings.

## Getting Started

Pull the code from the repository and follow the instructions to get the app running on local system.

### Get it up and running

To get any ionic app running on your system you need to install [node](https://nodejs.org/en/download/) on your system.

After installing node, run the following command on command prompt (windows) or in terminal (Mac). This will install ionic on your system.
```
npm install -g ionic
```
After installing ionic, change the current directory to your project folder (where 'www' folder resides) and run
```
npm install -g bower
bower install
```
This will install the required dependencies on the system

Run following command to install required plugins
```
ionic state restore
```
If the above command does not install all the plugins, install them one at a time using following command in the terminal
```
cordova plugin add {plugin id or url}
```
where, {plugin id or url} are as given below
* **cordova-plugin-device** - This plugin defines a global device object, which describes the device's hardware and software.
* **cordova-plugin-console** - This plugin is meant to ensure that console.log() is as useful as it can be. It adds additional function for iOS, Ubuntu, Windows Phone 8, and Windows.
* **ionic-plugin-keyboard** - It provides functions to make interacting with the keyboard easier, and fires events to indicate that the keyboard will hide/show.
* **cordova-plugin-inappbrowser** - Provides a web browser view. It could be used to open images, access web pages, and open PDF files.
* **com.phonegap.plugins.PushPlugin** - This plugin is for use with Cordova, and allows your application to receive push notifications on Amazon Fire OS, Android, iOS, Windows Phone and Windows8 devices (https://github.com/phonegap-build/PushPlugin.git).
* **de.appplant.cordova.plugin.email-composer@0.8.2** - The plugin provides access to the standard interface that manages the editing and sending an email message.
* **cordova-plugin-geolocation**, **org.apache.cordova.geolocation** - Grab the current location of the user, or grab continuous location changes
* **SocialSharing-PhoneGap-Plugin** - Share images, text, messages via Facebook, Twitter, Email, SMS, WhatsApp, etc using this plugin (https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git).
* **cordova-plugin-whitelist** - This plugin implements a whitelist policy for navigating the application webview on Cordova 4.0
* **cordova-plugin-transport-security** - Cordova / PhoneGap Plugin to allow 'Arbitrary Loads' by adding a declaration to the Info.plist file to bypass the iOS 9 App Transport Security
* **cordova-plugin-network-information** - This plugin provides an implementation of an old version of the Network Information API. It provides information about the device's cellular and wifi connection, and whether the device has an internet connection.
* **cordova-plugin-sim** - A cordova plugin to get data from the SIM card like the carrier name, mcc, mnc and country code and other system dependent additional info.

Example: 
```cordova plugin add cordova-plugin-device```


Run following command to install ios platform on the system
```
ionic platform add ios
```

You should have a resources folder in the root folder having an 'icon.png' and 'splash.png' for the app. Run following command to generate icons and splash screens for respective platforms
```
ionic resources
```
Run following command to run the app on device 
```
ionic run ios -device
```
OR
```
ionic run ios
```
to run it on default emulator. To run it on chrome browser use
```
ionic serve --lab
```
