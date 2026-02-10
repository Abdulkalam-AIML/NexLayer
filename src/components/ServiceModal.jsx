import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ServiceModal = ({ isOpen, onClose, service }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        isStudent: true,
        college: '',
        topic: service || '',
        deadline: '',
        requirements: '',
        budget: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const docRef = await addDoc(collection(db, "requests"), {
                ...formData,
                topic: formData.topic || service,
                timestamp: serverTimestamp(),
                status: 'pending'
            });

            console.log('Document written with ID: ', docRef.id);
            alert("Request Sent! We will contact you shortly.");
            onClose();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error sending request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-black border border-black/10 dark:border-nex-purple/30 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                            <h3 className="text-xl font-bold text-black dark:text-white">
                                Request <span className="text-nex-purple">{service}</span>
                            </h3>
                            <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Are you a student?</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="isStudent"
                                                checked={formData.isStudent === true}
                                                onChange={() => setFormData({ ...formData, isStudent: true })}
                                                className="w-4 h-4 accent-nex-purple"
                                            />
                                            <span className="text-black dark:text-white group-hover:text-nex-purple transition-colors">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="isStudent"
                                                checked={formData.isStudent === false}
                                                onChange={() => setFormData({ ...formData, isStudent: false })}
                                                className="w-4 h-4 accent-nex-purple"
                                            />
                                            <span className="text-black dark:text-white group-hover:text-nex-purple transition-colors">No</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            className="w-full glass-input rounded h-10 px-3 transition-colors"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {formData.isStudent && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">College</label>
                                            <input
                                                type="text"
                                                name="college"
                                                required={formData.isStudent}
                                                className="w-full glass-input rounded h-10 px-3 transition-colors"
                                                onChange={handleChange}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Project Type / Service</label>
                                <input
                                    type="text"
                                    name="topic"
                                    defaultValue={service}
                                    placeholder="e.g. E-commerce Website, AI Project"
                                    className="w-full glass-input rounded h-10 px-3 transition-colors"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Deadline</label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        required
                                        className="w-full glass-input rounded h-10 px-3 transition-colors"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Budget (Approx)</label>
                                    <select
                                        name="budget"
                                        className="w-full glass-input rounded h-10 px-3 transition-colors appearance-none cursor-pointer"
                                        onChange={handleChange}
                                    >
                                        <option value="" className="bg-white dark:bg-black">Select Range</option>
                                        <option value="1k-5k" className="bg-white dark:bg-black">₹1,000 - ₹5,000 (Mini)</option>
                                        <option value="5k-10k" className="bg-white dark:bg-black">₹5,000 - ₹10,000 (Basic)</option>
                                        <option value="10k-20k" className="bg-white dark:bg-black">₹10,000 - ₹20,000 (Standard)</option>
                                        <option value="20k-40k" className="bg-white dark:bg-black">₹20,000 - ₹40,000 (Premium)</option>
                                        <option value="40k+" className="bg-white dark:bg-black">₹40,000+</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Features Needed / Requirements</label>
                                <textarea
                                    name="requirements"
                                    rows="3"
                                    placeholder="Describe the features you need..."
                                    className="w-full glass-input rounded px-3 py-2 transition-colors resize-none"
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-nex-purple text-black font-bold uppercase tracking-wider rounded hover:bg-nex-purple/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-nex-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>Processing... <Loader2 size={18} className="animate-spin" /></>
                                ) : (
                                    <>Submit Request <Check size={18} /></>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ServiceModal;
