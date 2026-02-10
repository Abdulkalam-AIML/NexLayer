import { db, admin } from './_utils/firebaseAdmin.js';
import { verifyUser } from './_utils/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await verifyUser(req);
        const { projectId, workDone, issues, nextTask } = req.body;

        if (!projectId || !workDone) {
            return res.status(400).json({ error: 'Project ID and work description are required' });
        }

        // Check if member is assigned or is CEO
        const projectDoc = await db.collection("projects").doc(projectId).get();
        if (!projectDoc.exists) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const projectData = projectDoc.data();
        const isCeo = user.role === 'CEO';
        const isAssigned = projectData.assignedMembers.includes(user.email);

        if (!isCeo && !isAssigned) {
            return res.status(403).json({ error: 'You are not assigned to this project' });
        }

        const reportRef = await db.collection("reports").add({
            projectId,
            userId: user.uid,
            userName: user.name || user.email,
            workDone,
            issues: issues || "None",
            nextTask: nextTask || "Continued development",
            date: new Date().toISOString().split('T')[0],
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(200).json({ reportId: reportRef.id, status: "success" });
    } catch (error) {
        console.error("Error submitting report:", error);
        return res.status(error.message === 'Unauthenticated' ? 401 : 500).json({ error: error.message });
    }
}
