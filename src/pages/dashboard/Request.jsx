import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { callApi } from '../../lib/api';
import { Send, CheckCircle2, DollarSign, Calendar, FileText } from 'lucide-react';

const Request = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        deadline: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await callApi('/api/requests', {
                method: 'POST',
                data: {
                    name: user.displayName || user.email.split('@')[0],
                    phone: 'N/A', // Could be added to user profile later
                    topic: formData.title,
                    deadline: formData.deadline,
                    budget: formData.budget,
                    description: formData.description
                }
            });
            setStatus('success');
            setTimeout(() => navigate('/dashboard/projects'), 2000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
                <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
                <h2 className="text-3xl font-bold text-black mb-2">Request Submitted!</h2>
                <p className="text-gray-600">The CEO will review your request shortly. Redirecting to projects...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-black mb-2">Request <span className="text-nex-purple">New Project</span></h1>
            <p className="text-gray-600 mb-8">Tell us about your next big idea and we'll get our team on it.</p>

            <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl border border-white/10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={14} className="text-nex-purple" /> Project Title
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-black focus:border-nex-purple focus:outline-none transition-all"
                            placeholder="e.g. E-commerce App Development"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={14} className="text-nex-purple" /> Target Deadline
                        </label>
                        <input
                            required
                            type="date"
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-black focus:border-nex-purple focus:outline-none transition-all"
                            value={formData.deadline}
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <DollarSign size={14} className="text-nex-purple" /> Estimated Budget
                    </label>
                    <input
                        type="text"
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-black focus:border-nex-purple focus:outline-none transition-all"
                        placeholder="e.g. $1000 - $2000"
                        value={formData.budget}
                        onChange={e => setFormData({ ...formData, budget: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Project Description</label>
                    <textarea
                        required
                        rows="6"
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-black focus:border-nex-purple focus:outline-none transition-all resize-none"
                        placeholder="Please provide detailed requirements..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="w-full py-4 bg-nex-purple text-black font-bold uppercase tracking-widest rounded-lg hover:shadow-[0_0_20px_#A855F7] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {status === 'sending' ? 'Sending Request...' : 'Submit Project Request'}
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                    {status === 'error' && <p className="text-red-500 text-sm mt-2 text-center">Submission failed. Please try again.</p>}
                </div>
            </form>
        </div>
    );
};

export default Request;
