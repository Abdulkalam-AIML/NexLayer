import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

function Stars(props) {
    const { theme } = useTheme();
    const ref = useRef();
    // Generate static positions for stars to avoid NaN issues
    const [sphere] = useState(() => {
        const positions = new Float32Array(5000 * 3);
        for (let i = 0; i < 5000 * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 3;
        }
        return positions;
    });

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial transparent color={theme === 'dark' ? '#ffffff' : '#000000'} size={0.005} sizeAttenuation={true} depthWrite={false} />
            </Points>
        </group>
    );
}

const Hero = () => {
    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 1] }}>
                    <Stars />
                </Canvas>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="flex justify-center mb-6"
                >
                    <Logo size={96} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight dark:text-white">
                        Student Minds. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-nex-purple to-nex-cyber neon-text">
                            Professional Tech Solutions.
                        </span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 font-light"
                >
                    We are a student-driven development team delivering modern websites, AI mini-projects, and technical project guidance.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col md:flex-row gap-4 justify-center items-center"
                >
                    <a href="#services" className="px-8 py-3 bg-nex-purple/10 border border-nex-purple text-nex-purple rounded hover:bg-nex-purple/20 transition-all flex items-center gap-2 group neon-border">
                        🚀 Get Project Support
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a href="#contact" className="px-8 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm">
                        📩 Contact Team
                        <Mail className="w-4 h-4" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
