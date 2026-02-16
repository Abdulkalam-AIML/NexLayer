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

// Initialize App Check ONLY in production
// In development, App Check is skipped entirely to avoid reCAPTCHA 403 errors
let appCheck = null;
if (!import.meta.env.DEV) {
    appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6Lfm-MoqAAAAAKn990v2uG_8lE2S6NXZVsh2K-4n'),
        isTokenAutoRefreshEnabled: true
    });
}

const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, analytics, auth, db, storage, functions, appCheck };
