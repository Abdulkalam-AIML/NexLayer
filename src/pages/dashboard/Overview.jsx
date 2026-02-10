import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { callApi } from '../../lib/api';
import {
    Users,
    FolderKanban,
    CheckSquare,
    TrendingUp,
    Clock,
    Phone,
    Mail,
    ExternalLink,
    Briefcase,
    X,
    UserPlus
} from 'lucide-react';
import { MOCK_USERS } from '../../config/authConfig';

const StatCard = ({ icon, label, value, trend }) => (
    <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-nex-purple/30 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-[10px] uppercase tracking-widest text-gray-400">{trend}</span>
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-1">{label}</h3>
        <p className="text-3xl font-bold dark:text-white">{value}</p>
    </div>
);

const Overview = () => {
    const { user, role } = useOutletContext();
    const [ongoingProjects, setOngoingProjects] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (role === 'CEO') {
                    // CEO fetches pending requests and global stats
                    const requests = await callApi('/api/admin/requests');
                    setPendingRequests(requests);
                }

                // Everyone (except maybe generic Clients) fetches their assigned projects
                const projects = await callApi('/api/projects');
                setOngoingProjects(projects);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
            setLoading(false);
        };

        if (user && role) {
            fetchData();
        }
    }, [user, role]);

    const handleApprove = async (requestId) => {
        try {
            await callApi(`/api/requests/${requestId}/approve`, { method: 'PATCH' });
            // Refresh data
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
            const projects = await callApi('/api/projects');
            setOngoingProjects(projects);
        } catch (error) {
            alert("Approval failed: " + error.message);
        }
    };

    const stats = [
        { name: 'Active Projects', value: ongoingProjects.length.toString(), icon: <FolderKanban className="text-blue-500" />, trend: 'Live' },
        { name: 'Pending Requests', value: pendingRequests.length.toString(), icon: <Mail className="text-nex-purple" />, trend: 'Action Required' },
        { name: 'Reports Today', value: '0', icon: <CheckSquare className="text-green-500" />, trend: '+0' },
        { name: 'Avg. Progress', value: '0%', icon: <TrendingUp className="text-nex-cyber" />, trend: 'Steady' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold dark:text-white capitalize">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
                <p className="dark:text-gray-400 text-gray-500">Operations System | Role: <span className="text-nex-purple font-bold">{role}</span></p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.name}
                        icon={stat.icon}
                        label={stat.name}
                        value={stat.value}
                        trend={stat.trend}
                    />
                ))}
            </div>

            <div className={`grid grid-cols-1 ${role === 'CEO' ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
                {/* CEO: Pending Requests Section */}
                {role === 'CEO' && (
                    <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                <Mail className="w-5 h-5 text-nex-purple" />
                                New Project Requests
                            </h2>
                            <span className="text-xs text-nex-purple bg-nex-purple/10 px-2 py-1 rounded">{pendingRequests.length} Pending</span>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading requests...</div>
                            ) : pendingRequests.length > 0 ? (
                                pendingRequests.map((req) => (
                                    <div key={req.id} className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5 hover:border-nex-purple/10 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-black dark:text-white">{req.topic}</h4>
                                                <p className="text-xs text-gray-500">From: {req.name} ({req.phone})</p>
                                                <p className="text-xs text-nex-purple font-medium uppercase mt-1">Deadline: {req.deadline}</p>
                                            </div>
                                            <button
                                                onClick={() => handleApprove(req.id)}
                                                className="px-3 py-1 bg-nex-purple text-black text-xs font-bold rounded-lg hover:bg-opacity-80 transition-all"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">{req.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500 italic border border-dashed border-white/10 rounded-xl">
                                    No new requests.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Team Sidebar / Assigned Projects View */}
                <div className={`${role === 'CEO' ? 'lg:col-span-1' : 'w-full'} space-y-8`}>
                    <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-bold dark:text-white mb-6">
                            {role === 'CEO' ? 'Global Progress' : 'My Active Projects'}
                        </h2>
                        <div className="space-y-6">
                            {ongoingProjects.length > 0 ? (
                                ongoingProjects.map(proj => (
                                    <div key={proj.id} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium dark:text-gray-300">{proj.topic}</span>
                                            <span className="text-nex-purple font-bold">{proj.progress || 0}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-nex-purple"
                                                style={{ width: `${proj.progress || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No active projects found.</p>
                            )}
                        </div>
                    </div>

                    {role === 'CEO' && (
                        <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10">
                            <h2 className="text-xl font-bold dark:text-white mb-6">Core Team</h2>
                            <div className="space-y-4">
                                {[
                                    { name: 'Syed Abdul Kalam', role: 'CEO', status: 'online' },
                                    { name: 'D Akhil', role: 'Member', status: 'online' },
                                ].map((member) => (
                                    <div key={member.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                            <div>
                                                <p className="text-sm font-medium dark:text-white">{member.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">{member.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Overview;
