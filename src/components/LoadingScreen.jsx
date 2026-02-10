import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const LoadingScreen = ({ onComplete }) => {
    useEffect(() => {
        // Call onComplete after a short delay
        const timeout = setTimeout(() => {
            if (onComplete) onComplete();
        }, 2200); // Slightly longer delay to allow logo animation to be seen
        return () => clearTimeout(timeout);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-black text-nex-purple transition-colors duration-500">
            <div className="absolute inset-0 matrix-bg opacity-10 dark:opacity-20"></div>

            {/* Logo Animation */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2 }}
                className="mb-12 relative flex flex-col items-center"
            >
                <Logo size={128} />
                <div className="mt-4 text-4xl font-bold text-black dark:text-white tracking-widest uppercase">
                    Nex<span className="text-nex-purple">Layer</span>
                </div>
            </motion.div>
        </div>
    );
};

export default LoadingScreen;
