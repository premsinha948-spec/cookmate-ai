package app.vercel.cookmate_ai_xi.twa;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import com.google.android.gms.ads.MobileAds;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdPlugin.class);
        super.onCreate(savedInstanceState);
        MobileAds.initialize(this, initializationStatus -> {});
    }
}