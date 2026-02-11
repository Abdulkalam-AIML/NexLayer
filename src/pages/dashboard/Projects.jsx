import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { callApi } from '../../lib/api';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Search, Calendar, User, Trash2, Edit2, X, Send } from 'lucide-react';

const TEAM_MEMBERS_DEFAULT = [
    "akhilnadhdonka@gmail.com",
    "intidevaonyx@gmail.com",
    "aggalaaneeshram@gmail.com",
    "vinayrajchinnam@gmail.com",
    "syedfidaemohmmed@gmail.com"
];

const Projects = () => {
    const { user, role } = useOutletContext();
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingProject, setEditingProject] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('details'); // 'details' or 'messages'
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // New/Edit Project Form State
    const [formData, setFormData] = useState({
        title: '',
        client: '',
        description: '',
        deadline: '',
        progress: 0,
        assignedMembers: [],
        status: 'Active'
    });

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await callApi('/api/projects');
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const loadInitialData = async () => {
            if (user && role) {
                fetchProjects();

                // Fetch team members if CEO
                if (role === 'CEO') {
                    try {
                        const users = await callApi('/api/users');
                        const memberEmails = users.filter(u => u.role === 'Member').map(u => u.email);
                        setTeamMembers(memberEmails.length > 0 ? memberEmails : TEAM_MEMBERS_DEFAULT);
                    } catch (error) {
                        console.error("Error fetching team members:", error);
                        setTeamMembers(TEAM_MEMBERS_DEFAULT);
                    }
                }
            }
        };
        loadInitialData();
    }, [user, role]);

    const handleOpenModal = (project = null) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                title: project.projectTitle,
                client: project.clientName,
                description: project.description,
                deadline: project.deadline,
                progress: project.progress || 0,
                assignedMembers: project.assignedMembers || [],
                status: project.status || 'Active'
            });
        } else {
            setEditingProject(null);
            setFormData({ title: '', client: '', description: '', deadline: '', progress: 0, assignedMembers: [], status: 'Active' });
        }
        setActiveTab('details');
        setIsModalOpen(true);
    };
    const fetchMessages = async (projectId) => {
        try {
            const data = await callApi(`/api/projects/${projectId}/messages`);
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        if (isModalOpen && editingProject && activeTab === 'messages') {
            fetchMessages(editingProject.id);
        }
    }, [isModalOpen, editingProject, activeTab]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await callApi(`/api/projects/${editingProject.id}/messages`, {
                method: 'POST',
                data: {
                    project_id: editingProject.id,
                    content: newMessage
                }
            });
            setNewMessage('');
            fetchMessages(editingProject.id);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProject) {
                // Update existing project
                const projectRef = doc(db, "projects", editingProject.id);
                await updateDoc(projectRef, {
                    projectTitle: formData.title,
                    topic: formData.title, // Add topic for Overview compatibility
                    clientName: formData.client,
                    description: formData.description,
                    deadline: formData.deadline,
                    progress: formData.progress || 0,
                    assignedMembers: formData.assignedMembers,
                    status: formData.status
                });
            } else {
                // Create new project
                await addDoc(collection(db, "projects"), {
                    projectTitle: formData.title,
                    topic: formData.title, // Add topic for Overview compatibility
                    clientName: formData.client,
                    description: formData.description,
                    deadline: formData.deadline,
                    progress: formData.progress || 0,
                    assignedMembers: formData.assignedMembers,
                    status: formData.status,
                    createdAt: serverTimestamp()
                });
            }

            setIsModalOpen(false);
            setEditingProject(null);
            setFormData({ title: '', client: '', description: '', deadline: '', progress: 0, assignedMembers: [], status: 'Active' });
            fetchProjects();
        } catch (error) {
            console.error("Error saving project: ", error);
            alert("Error saving project. Please try again.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            await deleteDoc(doc(db, "projects", id));
            fetchProjects();
        }
    };

    const filteredProjects = projects.filter(p =>
        p.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div>
                <h1 className="text-3xl font-bold text-black">
                    {role === 'Client' ? 'My Projects' : role === 'Member' ? 'My Tasks' : 'Project Management'}
                </h1>
                <p className="text-gray-600">
                    {role === 'Client' ? 'Track your active requests and project progress.' :
                        role === 'Member' ? 'Manage your assigned work and update progress.' :
                            'Manage clients, deadlines, and team assignments.'}
                </p>
            </div>

            {role === 'CEO' ? (
                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-2 bg-nex-purple text-black font-bold rounded flex items-center gap-2 hover:bg-nex-purple/90 transition-colors"
                >
                    <Plus size={20} /> New Project
                </button>
            ) : role === 'Client' ? (
                <a
                    href="/contact"
                    className="px-6 py-2 bg-nex-purple text-black font-bold rounded flex items-center gap-2 hover:bg-nex-purple/90 transition-colors"
                >
                    <Plus size={20} /> Request New Project
                </a>
            ) : null}

            {/* Search & Filter */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-nex-dark border border-white/10 rounded-lg py-2 pl-10 pr-4 text-black focus:border-nex-purple focus:outline-none"
                />
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                    <div key={project.id} className="glass-card p-6 rounded-xl border border-white/10 hover:border-nex-purple/30 transition-all flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${project.status === 'Active' ? 'bg-nex-purple/10 text-nex-purple border border-nex-purple/20' :
                                project.status === 'Completed' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-gray-700 text-gray-600'
                                }`}>
                                {project.status}
                            </span>
                            {role === 'CEO' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(project)} className="text-gray-500 hover:text-nex-purple transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(project.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                            {role === 'Member' && (
                                <button onClick={() => handleOpenModal(project)} className="text-gray-500 hover:text-nex-purple transition-all flex items-center gap-1 text-xs font-bold uppercase">
                                    <Edit2 size={14} /> Update Progress
                                </button>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-black mb-1">{project.projectTitle}</h3>
                        <p className="text-sm text-gray-600 mb-4">{project.clientName}</p>
                        <p className="text-gray-700 text-sm mb-6 line-clamp-2 flex-grow">{project.description}</p>

                        <div className="space-y-4 mt-auto pt-4 border-t border-white/5">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Progress</span>
                                    <span className="text-[10px] font-bold text-nex-purple">{project.progress || 0}%</span>
                                </div>
                                <div className="h-1 w-full bg-black/20 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-nex-purple transition-all duration-500"
                                        style={{ width: `${project.progress || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar size={14} className="text-nex-purple" />
                                <span>Deadline: {project.deadline}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredProjects.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
                        No projects found.
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-nex-dark w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`text-2xl font-bold transition-all ${activeTab === 'details' ? 'text-nex-purple border-b-2 border-nex-purple' : 'text-gray-400 hover:text-black'}`}
                                >
                                    {editingProject ? 'Project Details' : 'Create Project'}
                                </button>
                                {editingProject && (
                                    <button
                                        onClick={() => setActiveTab('messages')}
                                        className={`text-2xl font-bold transition-all ${activeTab === 'messages' ? 'text-nex-purple border-b-2 border-nex-purple' : 'text-gray-400 hover:text-black'}`}
                                    >
                                        Collaboration
                                    </button>
                                )}
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-black">
                                <X size={24} />
                            </button>
                        </div>

                        {activeTab === 'details' ? (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {role === 'CEO' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Project Title</label>
                                            <input required type="text" className="w-full bg-black/40 border border-white/10 rounded p-2 text-black" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Client Name</label>
                                            <input required type="text" className="w-full bg-black/40 border border-white/10 rounded p-2 text-black" value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {(role === 'Member' || role === 'Client') && (
                                    <div className="p-4 bg-nex-purple/10 rounded-lg border border-nex-purple/20 mb-4">
                                        <h3 className="text-lg font-bold text-black">{formData.title}</h3>
                                        <p className="text-sm text-gray-600">Client: {formData.client}</p>
                                    </div>
                                )}

                                {role === 'CEO' && (
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Description</label>
                                        <textarea className="w-full bg-black/40 border border-white/10 rounded p-2 text-black h-24" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {role === 'CEO' && (
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Deadline</label>
                                            <input required type="date" className="w-full bg-black/40 border border-white/10 rounded p-2 text-black" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                                        </div>
                                    )}
                                    <div className={role === 'Member' ? 'md:col-span-2' : role === 'Client' ? 'md:col-span-3' : ''}>
                                        <label className="block text-sm text-gray-600 mb-1">Progress (%)</label>
                                        <input
                                            disabled={role === 'Client'}
                                            type="number" min="0" max="100" className="w-full bg-black/40 border border-white/10 rounded p-2 text-black disabled:opacity-50" value={formData.progress || 0} onChange={e => setFormData({ ...formData, progress: parseInt(e.target.value) })} />
                                    </div>
                                    {role !== 'Client' && (
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Status</label>
                                            <select
                                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-black appearance-none"
                                                value={formData.status}
                                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="On Hold">On Hold</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {role === 'CEO' && (
                                    <div className="space-y-4">
                                        <label className="block text-sm text-gray-600 mb-2">Assign Team Members</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-black/20 border border-white/5 rounded-lg">
                                            {teamMembers.map(email => (
                                                <label key={email} className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-white/10 bg-black/40 text-nex-purple focus:ring-nex-purple"
                                                        checked={formData.assignedMembers.includes(email)}
                                                        onChange={(e) => {
                                                            const updated = e.target.checked
                                                                ? [...formData.assignedMembers, email]
                                                                : formData.assignedMembers.filter(m => m !== email);
                                                            setFormData({ ...formData, assignedMembers: updated });
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors capitalize">
                                                        {email.split('@')[0].replace(/([a-z])([a-z]+)/g, (_, a, b) => a.toUpperCase() + b)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {role !== 'Client' && (
                                    <div className="pt-4 flex justify-end gap-3">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-700 hover:text-black transition-colors">Cancel</button>
                                        <button type="submit" className="px-6 py-2 bg-nex-purple text-black font-bold rounded hover:bg-nex-purple/90 hover:shadow-[0_0_15px_#A855F7] transition-all">
                                            {role === 'Member' ? 'Update Progress' : (editingProject ? 'Update Project' : 'Create Project')}
                                        </button>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="p-6 flex flex-col h-[500px]">
                                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                                    {messages.length > 0 ? messages.map((m) => (
                                        <div key={m.id} className={`flex flex-col ${m.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-xl ${m.senderId === user?.uid ? 'bg-nex-purple text-black rounded-tr-none' : 'bg-black/40 border border-white/10 text-white rounded-tl-none'}`}>
                                                <p className="text-sm font-bold opacity-60 mb-1">{m.senderName} ({m.senderRole})</p>
                                                <p>{m.content}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-500 mt-1">
                                                {m.timestamp?.seconds
                                                    ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString()
                                                    : m.timestamp instanceof Date
                                                        ? m.timestamp.toLocaleTimeString()
                                                        : 'Just now'}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 text-gray-500 italic">No messages yet. Start the conversation!</div>
                                    )}
                                </div>
                                <form onSubmit={handleSendMessage} className="flex gap-2 p-2 bg-black/20 rounded-xl">
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        className="flex-1 bg-transparent px-4 py-3 text-black focus:outline-none"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit" className="p-3 bg-nex-purple text-black rounded-lg hover:bg-opacity-80 transition-all">
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
