import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { callApi } from '../../lib/api';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { Plus, Search, Calendar, User, Trash2, Edit2, X } from 'lucide-react';

const TEAM_MEMBERS = [
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

    // New Project Form State
    const [newProject, setNewProject] = useState({
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
        if (user && role) {
            fetchProjects();
        }
    }, [user, role]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            // Using existing client-side firestore for quick creation, 
            // but we could also use the FastAPI endpoint if preferred.
            // Requirement says "Only CEO can create projects"
            await addDoc(collection(db, "projects"), {
                projectTitle: newProject.title,
                clientName: newProject.client,
                description: newProject.description,
                deadline: newProject.deadline,
                progress: newProject.progress || 0,
                assignedMembers: newProject.assignedMembers,
                status: newProject.status,
                createdAt: serverTimestamp()
            });

            setIsModalOpen(false);
            setNewProject({ title: '', client: '', description: '', deadline: '', progress: 0, assignedMembers: [], status: 'Active' });
            fetchProjects();
        } catch (error) {
            console.error("Error adding project: ", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            await deleteDoc(doc(db, "projects", id));
        }
    };

    const filteredProjects = projects.filter(p =>
        p.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-black">Project <span className="text-nex-purple">Management</span></h1>
                    <p className="text-gray-600">Manage clients, deadlines, and team assignments.</p>
                </div>

                {role === 'CEO' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2 bg-nex-purple text-black font-bold rounded flex items-center gap-2 hover:bg-nex-purple/90 transition-colors"
                    >
                        <Plus size={20} /> New Project
                    </button>
                )}
            </div>

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
                                <button onClick={() => handleDelete(project.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
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

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-nex-dark w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-black">Create New Project</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-black">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Project Title</label>
                                    <input required type="text" className="w-full bg-black/40 border border-white/10 rounded p-2 text-black" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Client Name</label>
                                    <input required type="text" className="w-full bg-black/40 border border-white/10 rounded p-2 text-black" value={newProject.client} onChange={e => setNewProject({ ...newProject, client: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Description</label>
                                <textarea className="w-full bg-black/40 border border-white/10 rounded p-2 text-black h-24" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })}></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Deadline</label>
                                    <input required type="date" className="w-full bg-black/40 border border-white/10 rounded p-2 text-black" value={newProject.deadline} onChange={e => setNewProject({ ...newProject, deadline: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Progress (%)</label>
                                    <input type="number" min="0" max="100" className="w-full bg-black/40 border border-white/10 rounded p-2 text-black" value={newProject.progress || 0} onChange={e => setNewProject({ ...newProject, progress: parseInt(e.target.value) })} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm text-gray-600 mb-2">Assign Team Members (Select 5 Core Members)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-black/20 border border-white/5 rounded-lg">
                                    {TEAM_MEMBERS.map(email => (
                                        <label key={email} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-white/10 bg-black/40 text-nex-purple focus:ring-nex-purple"
                                                checked={newProject.assignedMembers.includes(email)}
                                                onChange={(e) => {
                                                    const updated = e.target.checked
                                                        ? [...newProject.assignedMembers, email]
                                                        : newProject.assignedMembers.filter(m => m !== email);
                                                    setNewProject({ ...newProject, assignedMembers: updated });
                                                }}
                                            />
                                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors capitalize">
                                                {email.split('@')[0].replace(/([a-z])([a-z]+)/g, (_, a, b) => a.toUpperCase() + b)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-700 hover:text-black transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-nex-purple text-black font-bold rounded hover:bg-nex-purple/90 hover:shadow-[0_0_15px_#A855F7] transition-all">Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
