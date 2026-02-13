import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    FileText,
    Users,
    FolderOpen,
    Settings,
    LogOut,
    ShieldAlert
} from 'lucide-react';
import Logo from './Logo';

const Sidebar = ({ role }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        localStorage.removeItem('dev-mock-auth');
        await signOut(auth);
        navigate('/login');
    };

    let navItems = [];

    if (role === 'CEO') {
        navItems = [
            { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} />, end: true },
            { name: 'Projects', path: '/dashboard/projects', icon: <FolderKanban size={20} /> },
            { name: 'Member Tasks', path: '/dashboard/tasks', icon: <CheckSquare size={20} /> },
            { name: 'Reports', path: '/dashboard/reports', icon: <FileText size={20} /> },
            { name: 'Team', path: '/dashboard/team', icon: <Users size={20} /> },
            { name: 'Project Request', path: '/dashboard/request', icon: <FolderOpen size={20} /> },
            { name: 'Security', path: '/dashboard/security', icon: <ShieldAlert size={20} /> },
            { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
        ];
    } else if (role === 'Client') {
        navItems = [
            { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} />, end: true },
            { name: 'My Projects', path: '/dashboard/projects', icon: <FolderKanban size={20} /> },
            { name: 'Request Project', path: '/dashboard/request', icon: <FolderOpen size={20} /> },
        ];
    } else {
        // Team Member / Founders
        navItems = [
            { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} />, end: true },
            { name: 'Projects', path: '/dashboard/projects', icon: <FolderKanban size={20} /> },
            { name: 'Tasks', path: '/dashboard/tasks', icon: <CheckSquare size={20} /> },
            { name: 'Reports', path: '/dashboard/reports', icon: <FileText size={20} /> },
            { name: 'Project Request', path: '/dashboard/request', icon: <FolderOpen size={20} /> },
        ];
    }

    return (
        <aside className="w-64 bg-white dark:bg-nex-dark border-r border-black/10 dark:border-white/10 hidden md:flex flex-col h-screen sticky top-0 transition-colors duration-300">
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex flex-col items-center">
                <Logo size={64} className="mb-2" />
                <h2 className="text-xl font-bold text-black dark:text-white tracking-widest uppercase">
                    Nex<span className="text-purple-500">Layer</span>
                </h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">Team Portal</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    item.external ? (
                        <a
                            key={item.name}
                            href={item.path}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                        >
                            {item.icon} {item.name}
                        </a>
                    ) : (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${isActive
                                    ? 'bg-nex-purple/10 text-nex-purple border border-nex-purple/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                }`
                            }
                        >
                            {item.icon} {item.name}
                        </NavLink>
                    )
                ))}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors text-sm"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
