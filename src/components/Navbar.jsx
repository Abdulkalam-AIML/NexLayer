import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'About', href: '#about' },
        { name: 'Services', href: '#services' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Team', href: '#team' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-nex-black/80 backdrop-blur-lg border-b border-black/10 dark:border-white/10 py-3' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo & Name */}
                <a href="#" className="flex items-center gap-2 group">
                    <Logo size={40} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold text-black dark:text-white tracking-widest uppercase">
                        Nex<span className="text-purple-500">Layer</span>
                    </span>
                </a>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-nex-purple transition-colors uppercase tracking-wider"
                        >
                            {link.name}
                        </a>
                    ))}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black dark:text-white"
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <a
                        href="/login"
                        className="px-6 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-bold hover:bg-purple-500/20 transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                    >
                        Login
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden text-black dark:text-white p-2"
                >
                    <div className={`w-6 h-0.5 mb-1.5 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2 bg-nex-purple' : 'bg-black dark:bg-white'}`}></div>
                    <div className={`w-6 h-0.5 mb-1.5 transition-all ${mobileMenuOpen ? 'opacity-0' : 'bg-black dark:bg-white'}`}></div>
                    <div className={`w-6 h-0.5 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2 bg-nex-purple' : 'bg-black dark:bg-white'}`}></div>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-white dark:bg-black border-b border-black/10 dark:border-white/10 p-6 flex flex-col gap-4 md:hidden shadow-xl"
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-nex-purple transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                        <a
                            href="/login"
                            className="w-full py-3 bg-nex-purple text-black rounded font-bold text-center hover:bg-nex-purple/90 transition-all"
                        >
                            Login
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
