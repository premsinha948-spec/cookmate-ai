package app.vercel.cookmate_ai_xi.twa;

import android.util.Log;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.LoadAdError;

@CapacitorPlugin(name = "AdPlugin")
public class AdPlugin extends Plugin {
    private InterstitialAd mInterstitialAd;

    @Override
    public void load() {
        Log.d("AdPlugin", "Plugin loaded");
        loadInterstitialAd();
    }

    private void loadInterstitialAd() {
        Log.d("AdPlugin", "Loading interstitial ad...");
        AdRequest adRequest = new AdRequest.Builder().build();
        InterstitialAd.load(getContext(), "ca-app-pub-3940256099942544/1033173712",
            adRequest, new InterstitialAdLoadCallback() {
                @Override
                public void onAdLoaded(InterstitialAd interstitialAd) {
                    Log.d("AdPlugin", "Ad loaded successfully!");
                    mInterstitialAd = interstitialAd;
                }
                @Override
                public void onAdFailedToLoad(LoadAdError loadAdError) {
                Log.e("AdPlugin",
    "Load Failed: code=" + loadAdError.getCode()
    + ", message=" + loadAdError.getMessage()
    + ", domain=" + loadAdError.getDomain());
                    mInterstitialAd = null;
                }
            });
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        Log.d("AdPlugin", "showInterstitial called");
        getActivity().runOnUiThread(() -> {
            if (mInterstitialAd != null) {
                Log.d("AdPlugin", "Showing ad...");
                mInterstitialAd.show(getActivity());
                mInterstitialAd = null;
                loadInterstitialAd();
                call.resolve();
            } else {
                Log.e("AdPlugin", "Ad not ready!");
                call.reject("Ad not ready");
            }
        });
    }
}