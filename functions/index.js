const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

/**
 * 1. createRequest → Save client request
 */
exports.createRequest = functions.https.onCall(async (data, context) => {
    try {
        const { name, phone, topic, deadline, details } = data;

        if (!name || !topic || !details) {
            throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
        }

        const requestRef = await db.collection("clientRequests").add({
            name,
            phone,
            topic,
            deadline,
            details,
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { id: requestRef.id, status: "success" };
    } catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});

/**
 * 2. acceptRequest → CEO creates project
 */
exports.acceptRequest = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }

    const { requestId } = data;
    const uid = context.auth.uid;

    // CEO Check
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists || userDoc.data().role !== "CEO") {
        throw new functions.https.HttpsError("permission-denied", "Only CEO can accept requests");
    }

    const requestDoc = await db.collection("clientRequests").doc(requestId).get();
    if (!requestDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Request not found");
    }

    const requestData = requestDoc.data();

    // Create project
    const projectRef = await db.collection("projects").add({
        clientName: requestData.name,
        topic: requestData.topic,
        deadline: requestData.deadline,
        status: "active",
        assignedMembers: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        originalRequestId: requestId
    });

    // Update request status
    await db.collection("clientRequests").doc(requestId).update({ status: "accepted" });

    return { projectId: projectRef.id, status: "success" };
});

/**
 * 3. assignMembers → CEO assigns team
 */
exports.assignMembers = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }

    const { projectId, memberEmails } = data;
    const uid = context.auth.uid;

    // CEO Check
    const ceoDoc = await db.collection("users").doc(uid).get();
    if (!ceoDoc.exists || ceoDoc.data().role !== "CEO") {
        throw new functions.https.HttpsError("permission-denied", "Only CEO can assign members");
    }

    // Update Project
    await db.collection("projects").doc(projectId).update({
        assignedMembers: memberEmails
    });

    // Sync to Users Collection (as requested: assignedProjects [])
    const batch = db.batch();
    for (const email of memberEmails) {
        const userQuery = await db.collection("users").where("email", "==", email).limit(1).get();
        if (!userQuery.empty) {
            const userRef = userQuery.docs[0].ref;
            batch.update(userRef, {
                assignedProjects: admin.firestore.FieldValue.arrayUnion(projectId)
            });
        }
    }
    await batch.commit();

    return { status: "success" };
});

/**
 * 4. submitReport → Member submits daily work
 */
exports.submitReport = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }

    const { projectId, workDone, issues, nextTask } = data;
    const uid = context.auth.uid;
    const email = context.auth.token.email;

    // Verify assignment
    const projectDoc = await db.collection("projects").doc(projectId).get();
    if (!projectDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Project not found");
    }

    const projectData = projectDoc.data();
    const isCeo = (await db.collection("users").doc(uid).get()).data()?.role === "CEO";

    if (!isCeo && !projectData.assignedMembers.includes(email)) {
        throw new functions.https.HttpsError("permission-denied", "You are not assigned to this project");
    }

    const reportRef = await db.collection("reports").add({
        projectId,
        userId: uid,
        workDone,
        issues: issues || "None",
        nextTask: nextTask || "Development",
        date: new Date().toISOString().split('T')[0],
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { reportId: reportRef.id, status: "success" };
});

/**
 * 5. getUserProjects → Return assigned projects
 */
exports.getUserProjects = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }

    const uid = context.auth.uid;
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User document not found");
    }

    const userData = userDoc.data();

    if (userData.role === "CEO") {
        const allProjects = await db.collection("projects").orderBy("createdAt", "desc").get();
        return allProjects.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    const projectIds = userData.assignedProjects || [];
    if (projectIds.length === 0) return [];

    const projectsQuery = await db.collection("projects")
        .where(admin.firestore.FieldPath.documentId(), 'in', projectIds.slice(0, 10)) // Firestore limit 10 for 'in'
        .get();

    return projectsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
