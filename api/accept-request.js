import { db, admin } from './_utils/firebaseAdmin.js';
import { verifyUser } from './_utils/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await verifyUser(req);
        if (user.role !== 'CEO') {
            return res.status(403).json({ error: 'Only CEO can accept requests' });
        }

        const { requestId } = req.body;
        if (!requestId) {
            return res.status(400).json({ error: 'Request ID is required' });
        }

        const requestDoc = await db.collection("clientRequests").doc(requestId).get();
        if (!requestDoc.exists) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const requestData = requestDoc.data();

        // Create new project document
        const projectRef = await db.collection("projects").add({
            clientName: requestData.name,
            topic: requestData.topic,
            deadline: requestData.deadline,
            details: requestData.details,
            status: "active",
            assignedMembers: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            originalRequestId: requestId
        });

        // Update request status
        await db.collection("clientRequests").doc(requestId).update({
            status: "accepted"
        });

        return res.status(200).json({ projectId: projectRef.id, status: "success" });
    } catch (error) {
        console.error("Error accepting request:", error);
        return res.status(error.message === 'Unauthenticated' ? 401 : 500).json({ error: error.message });
    }
}
