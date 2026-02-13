import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { callApi } from '../../lib/api';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Tasks = () => {
    const { user, role } = useOutletContext();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]); // Needed for task assignment
    const [isTaskId, setIsTaskId] = useState(null); // For editing/modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Task Form
    const [newTask, setNewTask] = useState({
        title: '',
        projectId: '',
        assignedTo: '',
        deadline: '',
        priority: 'Medium',
        status: 'Pending'
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Tasks via API
                const taskData = await callApi("/api/tasks");
                setTasks(taskData);

                // Fetch Projects for dropdown via API
                const projData = await callApi("/api/projects");
                setProjects(projData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await callApi("/api/tasks", {
                method: 'POST',
                data: newTask
            });
            setIsModalOpen(false);
            setNewTask({ title: '', projectId: '', assignedTo: '', deadline: '', priority: 'Medium', status: 'Pending' });

            // Refresh
            const taskData = await callApi("/api/tasks");
            setTasks(taskData);
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await callApi(`/api/tasks/${id}`, {
                method: 'PATCH',
                data: { status: newStatus }
            });
            setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'Low': return 'text-green-500 bg-green-500/10 border-green-500/20';
            default: return 'text-gray-500';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-black">Task <span className="text-nex-purple">Board</span></h1>
                    <p className="text-gray-600">Track and manage project tasks.</p>
                </div>
                {role === 'CEO' && (
                    <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 bg-nex-purple text-black font-bold rounded flex items-center gap-2 hover:bg-nex-purple/90 transition-colors">
                        <Plus size={20} /> New Task
                    </button>
                )}
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Pending', 'In Progress', 'Done'].map(status => (
                    <div key={status} className="bg-nex-dark/50 p-4 rounded-xl border border-white/5 h-full min-h-[500px]">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            {status === 'Pending' && <AlertCircle className="text-yellow-500" size={20} />}
                            {status === 'In Progress' && <Clock className="text-blue-500" size={20} />}
                            {status === 'Done' && <CheckCircle className="text-nex-purple" size={20} />}
                            {status}
                            <span className="ml-auto text-xs bg-white/5 px-2 py-1 rounded-full text-gray-600">
                                {tasks.filter(t => t.status === status).length}
                            </span>
                        </h3>

                        <div className="space-y-3">
                            {tasks.filter(t => t.status === status).map(task => (
                                <div key={task.id} className="glass-card p-4 rounded-lg border border-white/5 hover:border-white/20 transition-all cursor-pointer group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                        {/* Quick Actions */}
                                        <select
                                            value={task.status}
                                            onChange={(e) => updateStatus(task.id, e.target.value)}
                                            className="bg-black/40 text-xs border border-white/10 rounded ml-2 px-1 py-0.5 outline-none focus:border-nex-purple"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </div>
                                    <h4 className="font-bold text-black mb-1">{task.title}</h4>
                                    <p className="text-xs text-gray-600 mb-2">
                                        {projects.find(p => p.id === task.projectId)?.projectTitle || 'Unknown Project'}
                                    </p>
                                    <div className="flex justify-between items-end mt-3 border-t border-white/5 pt-3">
                                        <p className="text-xs text-gray-500">To: {task.assignedTo}</p>
                                        <p className="text-xs text-nex-cyber">{task.deadline}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-nex-dark p-6 rounded-xl border border-white/10 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-white">Add New Task</h3>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <input required type="text" placeholder="Task Title" className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-nex-purple outline-none" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />

                            <select className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-nex-purple outline-none" value={newTask.projectId} onChange={e => setNewTask({ ...newTask, projectId: e.target.value })}>
                                <option value="" className="bg-nex-dark">Select Project</option>
                                {projects.map(p => <option key={p.id} value={p.id} className="bg-nex-dark">{p.projectTitle}</option>)}
                            </select>

                            <input required type="text" placeholder="Assign To (Email)" className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-nex-purple outline-none" value={newTask.assignedTo} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })} />

                            <div className="grid grid-cols-2 gap-4">
                                <input required type="date" className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-nex-purple outline-none color-scheme-dark" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
                                <select className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-nex-purple outline-none" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                    <option value="Low" className="bg-nex-dark">Low</option>
                                    <option value="Medium" className="bg-nex-dark">Medium</option>
                                    <option value="High" className="bg-nex-dark">High</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-nex-purple text-black font-bold rounded">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
