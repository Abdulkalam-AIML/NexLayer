import { db } from './_utils/firebaseAdmin.js';
import { verifyUser } from './_utils/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await verifyUser(req);
        if (user.role !== 'CEO') {
            return res.status(403).json({ error: 'Only CEO can assign members' });
        }

        const { projectId, memberEmails } = req.body;
        if (!projectId || !memberEmails) {
            return res.status(400).json({ error: 'Project ID and member emails are required' });
        }

        await db.collection("projects").doc(projectId).update({
            assignedMembers: memberEmails
        });

        return res.status(200).json({ status: "success" });
    } catch (error) {
        console.error("Error assigning members:", error);
        return res.status(error.message === 'Unauthenticated' ? 401 : 500).json({ error: error.message });
    }
}
