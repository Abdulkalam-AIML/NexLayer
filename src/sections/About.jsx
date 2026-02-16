import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';

const About = () => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

    const features = [
        "Complete Documentation Support",
        "Code Explanation Help",
        "AI + Web Specialists",
        "Student-Friendly Approach",
        "Professional Workflow"
    ];

    return (
        <section id="about" className="py-20 bg-transparent relative overflow-hidden transition-colors duration-300">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-nex-purple/5 dark:bg-nex-purple/10 blur-[100px] -z-10"></div>

            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">

                {/* Text Content */}
                <div ref={ref} className="flex-1">
                    <motion.h2
                        initial={{ opacity: 0, x: -50 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-5xl font-bold mb-6 dark:text-white"
                    >
                        About <span className="text-nex-purple neon-text">NexLayer Web</span>
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6 text-gray-600 dark:text-gray-300 text-lg"
                    >
                        <p>
                            NexLayer Web is a structured technical team built by students to support students and startups.
                            We specialize in modern website development, AI/ML mini-projects, and web applications.
                        </p>
                        <p className="border-l-4 border-nex-purple pl-4 italic text-black dark:text-white/90">
                            "We don’t sell copied projects — we help you understand and build."
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-10"
                    >
                        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Why We Are Different</h3>
                        <ul className="space-y-3">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <CheckCircle className="text-nex-purple w-5 h-5" />
                                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Visual/Image Placeholder */}
                <div className="flex-1 w-full flex justify-center">
                    <div className="relative w-full max-w-sm aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-tr from-nex-purple/20 to-transparent rounded-full animate-pulse"></div>
                        <div className="absolute inset-4 border border-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                            <Logo size={128} />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default About;
