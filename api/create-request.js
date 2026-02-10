import { db, admin } from './_utils/firebaseAdmin.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, phone, topic, deadline, details, email } = req.body;

        if (!name || !topic || !details) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const requestRef = await db.collection("clientRequests").add({
            name,
            phone,
            topic,
            deadline,
            details,
            email: email || "unknown@example.com", // Ensure email is stored for client dashboard
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(200).json({ id: requestRef.id, status: "success" });
    } catch (error) {
        console.error("Error creating request:", error);
        return res.status(500).json({ error: error.message });
    }
}
