import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Instagram, Mail, Phone, Code, Database, Globe, Server, User } from 'lucide-react';

const teamMembers = [
    {
        name: "Syed Abdul Kalam",
        role: "CEO & Founder",
        specialty: "Full Stack + AI/ML Specialist",
        skills: ["Backend", "Frontend", "AI", "ML", "Deep Learning", "Databases"],
        contact: {
            phone: "9392995620",
            email: "abdulkalamro20@gmail.com",
            linkedin: "https://www.linkedin.com/in/syed-abdul-kalam-15007a289",
            instagram: "https://www.instagram.com/btwits_abdul_x7"
        },
        icon: <Code size={24} className="text-nex-purple" />
    },
    {
        name: "D Akhil",
        role: "Backend & Frontend Support",
        specialty: "AI, ML, DSA, DL, Python",
        skills: ["AI", "ML", "Python", "DSA"],
        contact: {
            phone: "9989566724",
            email: "akhilnadhdonka@gmail.com",
            instagram: "https://www.instagram.com/akhilllll.d"
        },
        icon: <Database size={24} className="text-purple-500" />
    },
    {
        name: "ID Onyx",
        role: "Frontend, APIs & Database",
        specialty: "Online Marketing",
        skills: ["Frontend", "APIs", "Database", "Marketing"],
        contact: {
            phone: "6302199519",
            email: "intidevaonyx@gmail.com",
            instagram: "https://www.instagram.com/i.nikky_10"
        },
        icon: <Globe size={24} className="text-blue-500" />
    },
    {
        name: "A Aneesh Ram",
        role: "Frontend, Backend, APIs",
        specialty: "Hosting & Support",
        skills: ["Full Stack", "Hosting", "Support"],
        contact: {
            phone: "+91 99597 22955",
            instagram: "https://www.instagram.com/aneesh_ramm"
        },
        icon: <Server size={24} className="text-yellow-500" />
    },
    {
        name: "Ch. Vinay",
        role: "Hosting, Frontend",
        specialty: "Offline Marketing",
        skills: ["Hosting", "Frontend", "Marketing"],
        contact: {
            phone: "+91 95539 81511",
            instagram: "https://www.instagram.com/___vinayraj___official"
        },
        icon: <User size={24} className="text-red-500" />
    }
];

const Team = () => {
    const [selectedId, setSelectedId] = useState(null);

    return (
        <section id="team" className="py-20 bg-transparent relative overflow-hidden transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 dark:text-white">
                        Core <span className="text-nex-purple neon-text">Team</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">The minds behind NexLayer.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            layoutId={index.toString()}
                            onClick={() => setSelectedId(index)}
                            className="glass-card p-6 rounded-xl cursor-pointer hover:border-nex-purple/50 transition-colors group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                {member.icon}
                            </div>

                            <h3 className="text-xl font-bold text-black dark:text-white mb-1 group-hover:text-nex-purple transition-colors">{member.name}</h3>
                            <p className="text-sm text-nex-cyber mb-2">{member.role}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{member.specialty}</p>

                            <div className="flex flex-wrap gap-2">
                                {member.skills.slice(0, 3).map((skill, i) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300">{skill}</span>
                                ))}
                                {member.skills.length > 3 && <span className="text-xs px-2 py-1 text-gray-500">+{member.skills.length - 3}</span>}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {selectedId !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                            onClick={() => setSelectedId(null)}
                        >
                            <motion.div
                                layoutId={selectedId.toString()}
                                className="bg-nex-dark border border-nex-purple/30 w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-black">{teamMembers[selectedId].name}</h3>
                                            <p className="text-nex-purple font-mono">{teamMembers[selectedId].role}</p>
                                        </div>
                                        {teamMembers[selectedId].icon}
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <h4 className="text-sm text-gray-600 uppercase tracking-widest mb-2">Specialty</h4>
                                            <p className="text-black">{teamMembers[selectedId].specialty}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm text-gray-600 uppercase tracking-widest mb-2">Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {teamMembers[selectedId].skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1 rounded bg-nex-purple/10 text-nex-purple text-sm border border-nex-purple/20">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-white/10">
                                        {teamMembers[selectedId].contact.phone && (
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <Phone size={16} /> <span>{teamMembers[selectedId].contact.phone}</span>
                                            </div>
                                        )}
                                        {teamMembers[selectedId].contact.email && (
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <Mail size={16} /> <span>{teamMembers[selectedId].contact.email}</span>
                                            </div>
                                        )}
                                        <div className="flex gap-4 mt-4">
                                            {teamMembers[selectedId].contact.linkedin && (
                                                <a href={teamMembers[selectedId].contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors">
                                                    <Linkedin size={24} />
                                                </a>
                                            )}
                                            {teamMembers[selectedId].contact.instagram && (
                                                <a href={teamMembers[selectedId].contact.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors">
                                                    <Instagram size={24} />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="mt-8 w-full py-2 bg-white/5 hover:bg-white/10 rounded text-center transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default Team;
