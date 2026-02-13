import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from '../components/Sidebar';
import Logo from '../components/Logo';
import { Helmet } from 'react-helmet-async';
import { Menu } from 'lucide-react';
import { MOCK_USERS } from '../config/authConfig';

const DashboardLayout = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            // Mock auth logic removed to ensure real Firestore roles are used

            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                    console.log("Current User UID:", currentUser.uid);
                    try {
                        // Professional RBAC: Fetch role from Custom Claims instead of Firestore
                        const tokenResult = await currentUser.getIdTokenResult(true); // Force refresh to get latest claims
                        const roleClaim = tokenResult.claims.role;

                        if (roleClaim) {
                            console.log("User Role Found in Token Claims:", roleClaim);
                            setRole(roleClaim);
                        } else {
                            // Fallback to Firestore if claims aren't synced yet
                            console.warn("No role claim found, checking Firestore fallback...");
                            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                            if (userDoc.exists()) {
                                setRole(userDoc.data().role);
                            } else {
                                const mockUser = MOCK_USERS.find(u => u.email === currentUser.email);
                                setRole(mockUser ? mockUser.role : "Member");
                            }
                        }

                        // Sync display name if possible
                        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                        if (userDoc.exists() && userDoc.data().displayName) {
                            setUser(prev => ({ ...prev, displayName: userDoc.data().displayName }));
                        } else {
                            const mockUser = MOCK_USERS.find(u => u.email === currentUser.email);
                            if (mockUser) setUser(prev => ({ ...prev, displayName: mockUser.name }));
                        }
                    } catch (error) {
                        console.error("Error fetching identity/role:", error);
                        const mockUser = MOCK_USERS.find(u => u.email === currentUser.email);
                        setRole(mockUser ? mockUser.role : "Member");
                        if (mockUser) setUser(prev => ({ ...prev, displayName: mockUser.name }));
                    }
                } else {
                    navigate('/login');
                }
                setLoading(false);
            });

            return unsubscribe;
        };

        const unsubscribePromise = checkAuth();
        return () => {
            unsubscribePromise.then(unsub => unsub && unsub());
        };
    }, [navigate]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-white dark:bg-nex-black text-nex-purple transition-colors duration-300">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-nex-black flex transition-colors duration-300">
            <Helmet>
                <title>Dashboard | NexLayer</title>
            </Helmet>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white/80 dark:bg-nex-dark/80 backdrop-blur-md border-b border-black/10 dark:border-white/10 z-50 p-4 flex justify-between items-center transition-colors">
                <div className="flex items-center gap-2">
                    <Logo size={32} />
                    <h2 className="text-xl font-bold text-black dark:text-white uppercase tracking-tighter">Nex<span className="text-purple-500">Layer</span></h2>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-black dark:text-white p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                    <Menu />
                </button>
            </div>

            {/* Sidebar (Desktop + Mobile) */}
            <div className={`fixed inset-0 z-40 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 md:block`}>
                <Sidebar role={role} />
            </div>

            {/* Overlay for mobile menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-16 md:mt-0 bg-[#f8fafc] dark:bg-nex-black transition-colors duration-300">
                <div className="max-w-7xl mx-auto">
                    {/* Persistent Header for Name/Role */}
                    <div className="flex justify-between items-center mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                        <div>
                            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                {role || 'User'} Dashboard
                            </h2>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-black dark:text-white">
                                {user?.displayName || (role === 'CEO' ? 'Syed Abdul Kalam' : user?.email?.split('@')[0])}
                            </p>
                            <p className="text-xs text-nex-purple font-medium uppercase tracking-tighter">
                                {role === 'CEO' ? 'Chief Executive Officer' :
                                    role === 'CTO' ? 'Chief Technology Officer' :
                                        role === 'Admin Head' ? 'Administrative Head' :
                                            role === 'Operations' ? 'Operations Executor' :
                                                role === 'Marketing' ? 'Marketing Lead' :
                                                    role === 'Helper' ? 'Lead Helper' : role}
                            </p>
                        </div>
                    </div>
                    <Outlet context={{ user, role }} />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
