import React, { useState } from 'react';
import { callApi } from '../lib/api';
import { Mail, Instagram, Phone, Send, CheckCircle2 } from 'lucide-react';

const Contact = ({ prefilledService }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        projectType: '',
        deadline: '',
        budget: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    React.useEffect(() => {
        if (prefilledService) {
            setFormData(prev => ({ ...prev, projectType: prefilledService }));
        }
    }, [prefilledService]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        try {
            // 1. Save to database via FastAPI
            await callApi('/api/requests', {
                method: 'POST',
                noAuth: false, // Now requires auth to link clientId
                data: {
                    name: formData.name,
                    phone: formData.phone,
                    topic: formData.projectType,
                    deadline: formData.deadline,
                    budget: formData.budget,
                    description: formData.message
                }
            });

            // 2. Secondary WhatsApp Redirection
            const phoneNumber = "919392995620";
            const message = `Hello NexLayer! 🚀\n\nI'm *${formData.name}*.\n\n*Project:* ${formData.projectType}\n*Deadline:* ${formData.deadline}\n*Email:* ${formData.email}\n*Phone:* ${formData.phone}\n\n*Details:* ${formData.message}`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');

            setStatus('success');
            setFormData({ name: '', email: '', phone: '', projectType: 'Website Development', deadline: '', message: '' });
        } catch (error) {
            console.error("Submission error:", error);
            setStatus('error');
        }

        setTimeout(() => setStatus('idle'), 5000);
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <footer id="contact" className="py-20 bg-transparent border-t border-black/5 dark:border-white/10 relative overflow-hidden transition-colors duration-300">
            {/* Background glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-nex-purple/5 dark:bg-nex-purple/10 blur-[100px] -z-10"></div>

            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 dark:text-white">Contact <span className="text-nex-purple neon-text">NexLayer</span></h2>
                    <p className="text-gray-500 dark:text-gray-400">Let's build something extraordinary together.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto mb-16">
                    {/* Left Side: Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 dark:text-white">Get in Touch</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Have a project in mind or need technical support? Drop us a message and our team will get back to you within 24 hours.</p>
                        </div>

                        <div className="space-y-4">
                            <a href="mailto:nexlayer4578@gmail.com" className="flex items-center gap-4 p-4 glass-card rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group">
                                <div className="p-3 bg-nex-purple/10 rounded-lg">
                                    <Mail className="w-6 h-6 text-nex-purple" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                                    <p className="text-black dark:text-white font-medium">nexlayer4578@gmail.com</p>
                                </div>
                            </a>

                            <a href="https://www.instagram.com/nexlayer5" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 glass-card rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group">
                                <div className="p-3 bg-pink-500/10 rounded-lg">
                                    <Instagram className="w-6 h-6 text-pink-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Instagram</p>
                                    <p className="text-black dark:text-white font-medium">@nexlayer5</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Right Side: Contact Form */}
                    <div className="glass-card p-8 rounded-2xl border border-white/10 relative">
                        {status === 'success' ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                                <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Request Submitted!</h3>
                                <p className="text-gray-500 dark:text-gray-400">Thank you for reaching out. Our team will contact you soon.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-black dark:text-white focus:border-nex-purple focus:ring-1 focus:ring-nex-purple focus:outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-3 text-black dark:text-white focus:border-nex-purple focus:ring-1 focus:ring-nex-purple focus:outline-none transition-all"
                                                placeholder="+91 12345 67890"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-black dark:text-white focus:border-nex-purple focus:ring-1 focus:ring-nex-purple focus:outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Category</label>
                                        <input
                                            type="text"
                                            name="projectType"
                                            value={formData.projectType}
                                            onChange={handleChange}
                                            placeholder="e.g. Website Development, AI Project"
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-black dark:text-white focus:border-nex-purple focus:ring-1 focus:ring-nex-purple focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected Deadline</label>
                                        <input
                                            type="date"
                                            name="deadline"
                                            required
                                            value={formData.deadline}
                                            onChange={handleChange}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-black dark:text-white focus:border-nex-purple focus:ring-1 focus:ring-nex-purple focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Budget</label>
                                        <input
                                            type="text"
                                            name="budget"
                                            placeholder="e.g. $500, Custom"
                                            value={formData.budget}
                                            onChange={handleChange}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-black dark:text-white focus:border-nex-purple focus:ring-1 focus:ring-nex-purple focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Description</label>
                                    <textarea
                                        name="message"
                                        rows="4"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-black dark:text-white focus:border-nex-purple focus:ring-1 focus:ring-nex-purple focus:outline-none transition-all resize-none"
                                        placeholder="Tell us about your project..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full py-4 bg-nex-purple text-black font-bold uppercase tracking-widest rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {status === 'sending' ? 'Sending...' : 'Submit Request'}
                                    <Send className={`w-4 h-4 ${status === 'sending' ? '' : 'group-hover:translate-x-1 group-hover:-translate-y-1'} transition-transform`} />
                                </button>
                                {status === 'error' && <p className="text-red-500 text-xs text-center">Something went wrong. Please try again.</p>}
                            </form>
                        )}
                    </div>
                </div>

                <div className="text-gray-500 dark:text-gray-400 text-sm text-center">
                    <p>&copy; {new Date().getFullYear()} NexLayer. All rights reserved.</p>
                    <p>Student Minds. Professional Tech Solutions.</p>
                </div>
            </div>
        </footer>
    );
};

export default Contact;
