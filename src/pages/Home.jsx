import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../sections/Hero';
import Navbar from '../components/Navbar';
import About from '../sections/About';
import Services from '../sections/Services';
import Team from '../sections/Team';
import Pricing from '../sections/Pricing';
import Contact from '../sections/Contact';

const Home = () => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-transparent transition-colors duration-300">
            <Helmet>
                <title>NexLayer | Student Minds. Professional Tech Solutions.</title>
                <meta name="description" content="NexLayer is a student-led tech team providing AI mini projects, website development, web applications, and technical project guidance with full documentation support." />
                <meta name="keywords" content="NexLayer, student project support, AI mini projects, website development team, student tech startup, ML project help, web application development" />
            </Helmet>

            <main className="relative z-10">
                <Navbar />
                <Hero />
                <About />
                <Services />
                <Team />
                <Pricing />
                <Contact />
            </main>
        </div>
    );
};

export default Home;
