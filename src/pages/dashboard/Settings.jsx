import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Shield, Bell, Globe, Moon, CreditCard, ChevronRight } from 'lucide-react';

const Settings = () => {
    const { user, role } = useOutletContext();

    const sections = [
        {
            title: 'Profile Settings',
            icon: <User className="text-blue-500" />,
            items: [
                { name: 'Personal Information', desc: 'Update your name, email, and avatar.' },
                { name: 'Security & Password', desc: 'Change your password and enable 2FA.' }
            ]
        },
        {
            title: 'Preferences',
            icon: <Bell className="text-nex-purple" />,
            items: [
                { name: 'Notifications', desc: 'Manage mobile and email alerts.' },
                { name: 'Appearance', desc: 'Switch between light and dark themes.' }
            ]
        }
    ];

    if (role === 'CEO') {
        sections.push({
            title: 'Administrative',
            icon: <Shield className="text-red-500" />,
            items: [
                { name: 'Team Management', desc: 'Add, remove, or change roles of members.' },
                { name: 'Billing & Subscriptions', desc: 'Manage workspace plan and invoices.' },
                { name: 'API Configuration', desc: 'Manage external integrations and keys.' }
            ]
        });
    }

    return (
        <div className="max-w-4xl animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold dark:text-white mb-2">Settings</h1>
                <p className="dark:text-gray-400 text-gray-500">Manage your account and system configuration.</p>
            </header>

            <div className="space-y-6">
                {sections.map((section) => (
                    <div key={section.title} className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                        <div className="p-4 bg-black/5 dark:bg-white/5 border-b border-white/5 flex items-center gap-3">
                            {section.icon}
                            <h2 className="font-bold dark:text-white">{section.title}</h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {section.items.map((item) => (
                                <button key={item.name} className="w-full text-left p-6 hover:bg-black/5 dark:hover:bg-white/5 transition-all flex justify-between items-center group">
                                    <div>
                                        <h3 className="font-medium text-black dark:text-white group-hover:text-nex-purple transition-colors">{item.name}</h3>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 rounded-2xl border border-dashed border-white/10 text-center">
                <p className="text-gray-500 text-sm italic">"Precision in configuration drives excellence in execution."</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-2">{role} Access Level</p>
            </div>
        </div>
    );
};

export default Settings;
