import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code, Cpu, Globe, Server, Bug, FileText, Layers } from 'lucide-react';
import ServiceModal from '../components/ServiceModal';

const services = [
    { icon: <Code className="w-8 h-8 text-nex-cyber" />, title: 'Mini Projects', desc: 'Java, Python, Web based mini projects for semesters.' },
    { icon: <Globe className="w-8 h-8 text-nex-cyber" />, title: 'Website Development', desc: 'Modern, responsive portfolios and landing pages.' },
    { icon: <Cpu className="w-8 h-8 text-nex-cyber" />, title: 'AI / ML Support', desc: 'Machine Learning models, AI integration, and chatbots.' },
    { icon: <Layers className="w-8 h-8 text-nex-cyber" />, title: 'Web App Development', desc: 'Full stack MERN/Firebase applications.' },
    { icon: <Server className="w-8 h-8 text-nex-cyber" />, title: 'Deployment Support', desc: 'Hosting on Vercel, Netlify, Firebase, AWS.' },
    { icon: <Bug className="w-8 h-8 text-nex-cyber" />, title: 'Code Debugging', desc: 'Fixing errors in your existing projects.' },
    { icon: <FileText className="w-8 h-8 text-nex-cyber" />, title: 'Documentation', desc: 'Project Reports, PPTs, and setup guides.' },
];

const Services = () => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [selectedService, setSelectedService] = useState(null);

    return (
        <section id="services" className="py-20 bg-transparent relative overflow-hidden transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 dark:text-white">
                        Our <span className="text-nex-cyber neon-text">Services</span>
                    </h2>
                    <p className="dark:text-gray-400 text-gray-500 max-w-2xl mx-auto">
                        We provide structured technical guidance, not project reselling.
                    </p>
                </div>

                <div
                    ref={ref}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, borderColor: '#A855F7', boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)' }}
                            className="glass-card p-6 rounded-xl cursor-pointer group transition-all"
                            onClick={() => setSelectedService(service.title)}
                        >
                            <div className="mb-4 bg-black/5 dark:bg-white/5 w-16 h-16 rounded-lg flex items-center justify-center group-hover:bg-nex-purple/10 transition-colors">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-black dark:text-white group-hover:text-nex-purple transition-colors">{service.title}</h3>
                            <p className="text-sm dark:text-gray-400 text-gray-500">{service.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <ServiceModal
                isOpen={!!selectedService}
                onClose={() => setSelectedService(null)}
                service={selectedService}
            />
        </section>
    );
};

export default Services;
