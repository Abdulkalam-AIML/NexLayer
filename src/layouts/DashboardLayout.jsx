import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from '../components/Sidebar';
import Logo from '../components/Logo';
import { Helmet } from 'react-helmet-async';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            // Check for Dev Mock Auth first
            const mockAuthData = localStorage.getItem('dev-mock-auth');
            if (mockAuthData) {
                try {
                    const mockUser = JSON.parse(mockAuthData);
                    setUser(mockUser);
                    setRole(mockUser.role || 'Member');
                    setLoading(false);
                    return;
                } catch (e) {
                    console.error("Invalid mock auth data", e);
                    localStorage.removeItem('dev-mock-auth');
                }
            }

            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                    try {
                        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                        if (userDoc.exists()) {
                            setRole(userDoc.data().role);
                        } else {
                            setRole("Member");
                        }
                    } catch (error) {
                        console.error("Error fetching role:", error);
                        setRole("Member");
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
            <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-16 md:mt-0">
                <Outlet context={{ user, role }} />
            </main>
        </div>
    );
};

export default DashboardLayout;
