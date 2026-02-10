import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Info, Server, Code, Box } from 'lucide-react';
import ServiceModal from '../components/ServiceModal';

const webPackages = [
    {
        name: "Simple",
        price: "₹5,000 – ₹10,000",
        desc: "Best for Basic Websites",
        features: ["Static Pages", "Clean UI Design", "Basic Hosting Setup", "Mobile Responsive", "Contact Form"],
        color: "border-gray-500",
        glow: "shadow-gray-500/20"
    },
    {
        name: "Gold",
        price: "₹11,000 – ₹20,000",
        desc: "Business & Dynamic Sites",
        features: ["Dynamic Content", "Database Integration", "User Auth / Admin Panel", "Interactive UI Forms", "Basic SEO"],
        color: "border-nex-purple",
        glow: "shadow-nex-purple/20",
        popular: true
    },
    {
        name: "Premium",
        price: "₹21,000 – ₹40,000",
        desc: "Full Web Applications",
        features: ["Advanced Features", "Custom Dashboards", "Third-party Integrations", "Complex Database Schema", "Premium Animations"],
        color: "border-nex-cyber",
        glow: "shadow-nex-cyber/20"
    }
];

const miniProjects = [
    { name: "Basic Mini Project", price: "₹1,000" },
    { name: "Standard Mini Project", price: "₹4,000+" }
];

const prototypes = [
    { name: "Prototype / Model Build", price: "₹1,500" },
    { name: "Prototype + Deployment", price: "₹1,500 + cost" }
];

const Pricing = () => {
    const [selectedPackage, setSelectedPackage] = useState(null);

    return (
        <section id="pricing" className="py-20 bg-transparent relative overflow-hidden transition-colors duration-300">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-nex-purple/5 dark:bg-nex-purple/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[10%] left-[5%] w-96 h-96 bg-nex-cyber/5 dark:bg-nex-cyber/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-black dark:text-white">
                        Services & <span className="text-nex-purple neon-text">Pricing</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Transparent pricing for every stage of development. From mini projects to full-scale web applications.
                    </p>
                </div>

                {/* Web Packages */}
                <h3 className="text-2xl font-bold text-black dark:text-white mb-8 flex items-center gap-2">
                    <Code className="text-nex-purple" /> Web Development
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                    {webPackages.map((pkg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`glass-card p-8 rounded-2xl border ${pkg.popular ? 'border-nex-purple ring-1 ring-nex-purple' : 'border-white/10'} hover:border-nex-purple/50 transition-all relative flex flex-col h-full`}
                        >
                            {pkg.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-nex-purple text-black px-4 py-1 rounded-full text-sm font-bold shadow-[0_0_15px_#A855F7]">
                                    BEST VALUE
                                </div>
                            )}

                            <h3 className="text-2xl font-bold mb-2 text-black dark:text-white">{pkg.name}</h3>
                            <p className="text-2xl font-bold text-nex-purple mb-1">{pkg.price}</p>
                            <p className="text-gray-500 dark:text-gray-300 mb-6 text-sm">{pkg.desc}</p>

                            <ul className="space-y-3 mb-8 flex-1">
                                {pkg.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                        <Check className="w-5 h-5 text-nex-purple shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => setSelectedPackage(`Web Dev - ${pkg.name}`)}
                                className={`w-full py-3 rounded font-bold transition-all ${pkg.popular ? 'bg-nex-purple text-black hover:bg-nex-purple/90 hover:shadow-[0_0_20px_#A855F7]' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white hover:bg-black/20 dark:hover:bg-white/20'}`}
                            >
                                Select Plan
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                    {/* Custom Domain */}
                    <div className="glass-card p-6 rounded-xl border border-white/10 hover:border-nex-purple/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <Server className="text-nex-cyber" size={24} />
                            <h3 className="text-xl font-bold text-black dark:text-white">Custom Domain</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Get your own .com, .in, .org domain name.</p>
                        <p className="text-xl font-bold text-black dark:text-white mb-4">Extra ₹2,000 – ₹4,000</p>
                        <button onClick={() => setSelectedPackage("Custom Domain Add-on")} className="text-nex-purple text-sm hover:underline">Request Add-on &rarr;</button>
                    </div>

                    {/* Mini Projects */}
                    <div className="glass-card p-6 rounded-xl border border-white/10 hover:border-nex-purple/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <Box className="text-yellow-500" size={24} />
                            <h3 className="text-xl font-bold text-black dark:text-white">Mini Projects</h3>
                        </div>
                        <ul className="space-y-2 mb-4">
                            {miniProjects.map((mp, i) => (
                                <li key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">{mp.name}</span>
                                    <span className="text-nex-purple font-bold">{mp.price}</span>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setSelectedPackage("Mini Project Support")} className="text-nex-purple text-sm hover:underline">Get Support &rarr;</button>
                    </div>

                    {/* Prototyping */}
                    <div className="glass-card p-6 rounded-xl border border-black/10 dark:border-white/10 hover:border-nex-purple/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <Code className="text-purple-500" size={24} />
                            <h3 className="text-xl font-bold text-black dark:text-white">Prototyping</h3>
                        </div>
                        <ul className="space-y-2 mb-4">
                            {prototypes.map((p, i) => (
                                <li key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">{p.name.split(" +")[0]}</span>
                                    <span className="text-nex-purple font-bold">{p.price}</span>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setSelectedPackage("Prototype Development")} className="text-nex-purple text-sm hover:underline">Start Prototype &rarr;</button>
                    </div>
                </div>

                {/* Price Dependencies & Note */}
                <div className="max-w-4xl mx-auto glass-card p-8 rounded-2xl border border-black/10 dark:border-white/10">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                                <Info size={20} className="text-nex-purple" /> What Price Depends On
                            </h4>
                            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-nex-purple"></div> Features Required</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-nex-purple"></div> AI/ML Integration</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-nex-purple"></div> Project Complexity</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-nex-purple"></div> Deadline Urgency</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-nex-purple"></div> Hosting Needs</li>
                            </ul>
                        </div>
                        <div className="flex-1 flex items-center justify-center border-t md:border-t-0 md:border-l border-black/10 dark:border-white/10 pt-6 md:pt-0 md:pl-6">
                            <p className="text-center text-lg italic text-gray-600 dark:text-gray-300">
                                "Prices vary based on project requirements. <br /> <span className="text-nex-purple">Final quote given after discussion.</span>"
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <ServiceModal
                isOpen={!!selectedPackage}
                onClose={() => setSelectedPackage(null)}
                service={selectedPackage}
            />
        </section>
    );
};

export default Pricing;
