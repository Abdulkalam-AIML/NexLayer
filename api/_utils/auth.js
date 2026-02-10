import { auth, db } from './firebaseAdmin.js';

export const verifyUser = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Unauthenticated');
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Get user role from Firestore if it exists
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    return {
        ...decodedToken,
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: userDoc.exists ? userDoc.data().role : 'Member'
    };
};
