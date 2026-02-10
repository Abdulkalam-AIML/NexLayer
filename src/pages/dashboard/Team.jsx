import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Users, Mail, Phone, Shield } from 'lucide-react';

const Team = () => {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            const querySnapshot = await getDocs(collection(db, "users"));
            setMembers(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchMembers();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-black mb-2">Team <span className="text-nex-purple">Directory</span></h1>
            <p className="text-gray-600 mb-8">View all active team members and their roles.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map(member => (
                    <div key={member.id} className="glass-card p-6 rounded-xl border border-white/10 hover:border-nex-purple/30 transition-all flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-nex-dark flex items-center justify-center text-xl font-bold text-nex-purple border border-white/10">
                            {member.name ? member.name[0] : member.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-black text-lg">{member.name || 'Team Member'}</h3>
                            <div className="flex items-center gap-2 text-nex-cyber text-sm mb-2">
                                <Shield size={14} /> {member.role || 'Member'}
                            </div>

                            <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} /> <span className="truncate w-full">{member.email}</span>
                                </div>
                                {member.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} /> <span>{member.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {members.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No team members found in the directory.
                </div>
            )}
        </div>
    );
};

export default Team;
