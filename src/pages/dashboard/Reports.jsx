import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { callApi } from '../../lib/api';
import { FileText, Send, Calendar, User, Search } from 'lucide-react';

const Reports = () => {
    const { user, role } = useOutletContext();
    const [reportText, setReportText] = useState('');
    const [reports, setReports] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // If CEO, get all projects first, then reports for the selected project
            // For now, let's just use the selected project id or a general list if the API supports it.
            // I'll update the API to support a general GET /api/reports for CEO.
            const url = selectedProjectId ? `/api/reports/${selectedProjectId}` : '/api/reports';
            const data = await callApi(url);
            setReports(data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
        setLoading(false);
    };

    const fetchProjectsList = async () => {
        try {
            const data = await callApi('/api/projects');
            setProjects(data);
            if (data.length > 0 && !selectedProjectId) {
                setSelectedProjectId(data[0].id);
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    useEffect(() => {
        if (user && role) {
            fetchProjectsList();
        }
    }, [user, role]);

    useEffect(() => {
        if (user && role && (selectedProjectId || role === 'CEO')) {
            fetchReports();
        }
    }, [user, role, selectedProjectId]);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportText.trim() || !selectedProjectId) {
            alert("Please select a project and enter report text.");
            return;
        }

        setIsSubmitting(true);
        try {
            await callApi('/api/reports', {
                method: 'POST',
                data: {
                    project_id: selectedProjectId,
                    work_done: reportText,
                    issues: "None",
                    next_task: "Continuing development"
                }
            });

            setReportText('');
            alert('Daily report submitted successfully!');
            fetchReports();
        } catch (error) {
            console.error("Error submitting report:", error);
            alert(`Failed to submit report: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Daily Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {role === 'CEO' ? 'Review all team updates and progress.' : 'Submit your daily progress update.'}
                    </p>
                </div>
                {role === 'CEO' && (
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-nex-purple text-black text-sm font-bold rounded-lg hover:shadow-[0_0_15px_#A855F7] transition-all">
                            Export PDF
                        </button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit Report Panel */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 rounded-2xl border border-white/10 sticky top-24">
                        <h3 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                            <Send size={18} className="text-nex-purple" />
                            Submit New Report
                        </h3>
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Project</label>
                                <select
                                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm text-black dark:text-white focus:outline-none"
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select a project...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.projectTitle || p.topic}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Today's Progress</label>
                                <textarea
                                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-4 text-black dark:text-white focus:border-nex-purple focus:ring-1 focus:ring-nex-purple focus:outline-none transition-all resize-none text-sm"
                                    rows="8"
                                    placeholder="What did you work on today? Any blockers?"
                                    value={reportText}
                                    onChange={(e) => setReportText(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-nex-purple text-black font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Reports List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-black dark:text-white">
                            {role === 'CEO' ? 'Recent Team Reports' : 'My Recent Reports'}
                        </h3>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading reports...</div>
                    ) : reports.length > 0 ? (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <div key={report.id} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-nex-purple/10 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-nex-purple/10 flex items-center justify-center text-nex-purple border border-nex-purple/20 font-bold uppercase">
                                                {report.userName?.substring(0, 2) || '??'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-black dark:text-white text-sm">{report.userName}</h4>
                                                <p className="text-[10px] text-gray-500">{report.timestamp?.toDate().toLocaleString() || 'Just now'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed border-l-2 border-nex-purple/20 pl-4 italic">
                                        "{report.content}"
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 glass-card rounded-2xl border border-dashed border-white/10">
                            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                            <p className="text-gray-500 italic">No reports found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
