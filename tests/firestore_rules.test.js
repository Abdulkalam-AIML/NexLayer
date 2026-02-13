import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * NexLayer Security Rules Unit Tests
 * 
 * Verifies that the firestore.rules properly protect user data,
 * enforce roles, and require email verification.
 */

let testEnv;

describe("NexLayer Security Rules", () => {
    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
            projectId: "nexlayer-f787f-test",
            firestore: {
                host: "localhost",
                port: 8080,
            },
        });
    });

    afterAll(async () => {
        await testEnv.cleanup();
    });

    test("Unauthorized user cannot read user profiles", async () => {
        const unauthedDb = testEnv.unauthenticatedContext().firestore();
        await assertFails(getDoc(doc(unauthedDb, "users/some_user")));
    });

    test("Verified user can read their own profile", async () => {
        const alice = testEnv.authenticatedContext("alice", { email_verified: true });
        const db = alice.firestore();
        await assertSucceeds(getDoc(doc(db, "users/alice")));
    });

    test("Unverified user is blocked from sensitive data", async () => {
        const bob = testEnv.authenticatedContext("bob", { email_verified: false });
        const db = bob.firestore();
        await assertFails(getDoc(doc(db, "users/bob")));
    });

    test("Only CEO can access specialized project controls", async () => {
        const ceo = testEnv.authenticatedContext("ceo_uid", {
            email_verified: true,
            role: "CEO"
        });
        const db = ceo.firestore();
        await assertSucceeds(getDoc(doc(db, "projects/any_project")));

        const member = testEnv.authenticatedContext("member_uid", {
            email_verified: true,
            role: "Member"
        });
        const memberDb = member.firestore();
        // Should fail if not assigned (resource-based check handled in rules)
        await assertFails(getDoc(doc(memberDb, "projects/any_project")));
    });
});
