package com.farfetch.reactnative;

import android.app.Activity;
import android.app.Application;
import android.app.Application.ActivityLifecycleCallbacks;
import android.os.Bundle;

import com.android.riskifiedbeacon.RiskifiedBeaconMain;
import com.android.riskifiedbeacon.RiskifiedBeaconMainInterface;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class RiskifiedIntegrationModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private final RiskifiedBeaconMainInterface RXBeacon = new RiskifiedBeaconMain();

    public RiskifiedIntegrationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RiskifiedIntegration";
    }

    @ReactMethod
    public void startBeacon(String shopName, String sessionToken, boolean debugInfo) {
        RXBeacon.startBeacon(shopName, sessionToken, debugInfo, this.reactContext);


        Application app  = this.getCurrentActivity().getApplication();

        app.registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {
            @Override
            public void onActivityCreated(Activity activity, Bundle bundle) {

            }

            @Override
            public void onActivityStarted(Activity activity) {

            }

            @Override
            public void onActivityResumed(Activity activity) {

            }

            @Override
            public void onActivityPaused(Activity activity) {

            }

            @Override
            public void onActivityStopped(Activity activity) {
                RXBeacon.removeLocationUpdates();
            }

            @Override
            public void onActivitySaveInstanceState(Activity activity, Bundle bundle) {

            }

            @Override
            public void onActivityDestroyed(Activity activity) {

            }
        });
    }

    @ReactMethod
    public void updateSessionToken(String sessionToken) {
        RXBeacon.updateSessionToken(sessionToken);
    }

    @ReactMethod
    public void logRequest(String requestUrl) {
        RXBeacon.logRequest(requestUrl);
    }

    @ReactMethod
    public void logSensitiveDeviceInfo() {
        RXBeacon.logSensitiveDeviceInfo();
    }
}
