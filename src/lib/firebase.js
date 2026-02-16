import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
    apiKey: "AIzaSyDPsUX1ru9ksdwndy9T9M13sTZBzSohue4",
    authDomain: "nexlayer-f787f.firebaseapp.com",
    projectId: "nexlayer-f787f",
    storageBucket: "nexlayer-f787f.firebasestorage.app",
    messagingSenderId: "447147501129",
    appId: "1:447147501129:web:77760476a67c61486ec198",
    measurementId: "G-RCB7C9X3XH"
};

const app = initializeApp(firebaseConfig);

// Initialize App Check with reCAPTCHA v3
// Note: In development, you can use the debug provider: https://firebase.google.com/docs/app-check/web/debug-provider
if (import.meta.env.DEV) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Lfm-MoqAAAAAKn990v2uG_8lE2S6NXZVsh2K-4n'), // This is a public site key
    isTokenAutoRefreshEnabled: true
});

const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, analytics, auth, db, storage, functions, appCheck };
