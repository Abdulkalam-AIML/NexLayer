import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
    ShieldAlert,
    ShieldCheck,
    Zap,
    AlertTriangle,
    Globe,
    Terminal,
    Search
} from 'lucide-react';

const SecurityLogCard = ({ log }) => {
    const isFirewall = log.type === 'FIREWALL_BLOCK';
    const date = new Date(log.timestamp).toLocaleString();

    return (
        <div className="glass-card p-4 rounded-xl border border-white/10 hover:border-nex-purple/20 transition-all bg-black/5 dark:bg-white/5">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {isFirewall ? (
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                    ) : (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                    <span className={`text-xs font-bold uppercase tracking-wider ${isFirewall ? 'text-red-500' : 'text-orange-500'}`}>
                        {log.type}
                    </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{date}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-sm font-medium dark:text-gray-200 flex items-center gap-2">
                        <Globe className="w-3 h-3 text-gray-400" /> {log.ip}
                    </p>
                    <p className="text-xs text-gray-500 font-mono truncate">{log.path} [{log.method}]</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-xs text-nex-purple font-medium">
                        Pattern: <span className="text-gray-400 font-mono">{log.details?.pattern || log.details?.status_code || 'N/A'}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{log.userAgent}</p>
                </div>
            </div>
        </div>
    );
};

const Security = () => {
    const { role } = useOutletContext();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, firewall: 0, auth: 0 });

    useEffect(() => {
        if (role !== 'CEO') return;

        const q = query(
            collection(db, 'security_logs'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLogs(logsData);

            const newStats = logsData.reduce((acc, log) => {
                acc.total++;
                if (log.type === 'FIREWALL_BLOCK') acc.firewall++;
                if (log.type === 'AUTH_FAILURE') acc.auth++;
                return acc;
            }, { total: 0, firewall: 0, auth: 0 });

            setStats(newStats);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [role]);

    if (role !== 'CEO') {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <ShieldAlert className="w-16 h-16 text-red-500 opacity-20" />
                <h1 className="text-2xl font-bold dark:text-white">Access Denied</h1>
                <p className="text-gray-500 max-w-sm">
                    Only the Chief Executive Officer has access to the security infrastructure and real-time threat monitoring.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                        <Terminal className="text-nex-purple" />
                        Firewall <span className="text-nex-purple neon-text">Shield</span>
                    </h1>
                    <p className="dark:text-gray-400 text-gray-500">Elite Threat Monitoring & Security Infrastructure</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 text-[10px] text-green-500 font-bold uppercase tracking-widest animate-pulse">
                    <ShieldCheck className="w-3 h-3" /> Live Monitor
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-white/10 group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-nex-purple/10 blur-3xl rounded-full"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Blocked Requests</p>
                    <h3 className="text-4xl font-bold dark:text-white group-hover:text-nex-purple transition-colors">{stats.total}</h3>
                    <div className="mt-4 flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                        <Zap className="w-3 h-3" /> Last 24 Hours
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/10 group">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-bold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500" /> Firewall Hits
                    </p>
                    <h3 className="text-4xl font-bold dark:text-white group-hover:text-red-500 transition-colors">{stats.firewall}</h3>
                    <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-widest">Malicious Patterns Detected</p>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/10 group">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" /> Auth Failures
                    </p>
                    <h3 className="text-4xl font-bold dark:text-white group-hover:text-orange-500 transition-colors">{stats.auth}</h3>
                    <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-widest">Suspicious Login Attempts</p>
                </div>
            </div>

            <div className="glass-card rounded-2xl border border-white/10 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-nex-purple" />
                        Real-time Security Logs
                    </h2>
                    <div className="text-xs text-gray-500 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        Displaying last {logs.length} events
                    </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-nex-purple border-t-transparent rounded-full animate-spin"></div>
                            <p className="animate-pulse">Fetching security data...</p>
                        </div>
                    ) : logs.length > 0 ? (
                        logs.map((log) => (
                            <SecurityLogCard key={log.id} log={log} />
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-500 italic border border-dashed border-white/10 rounded-2xl">
                            <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            No suspicious activity detected. System is secure.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Security;
