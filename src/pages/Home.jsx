import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../sections/Hero';
import Navbar from '../components/Navbar';
import About from '../sections/About';
import Services from '../sections/Services';
import Team from '../sections/Team';
import Pricing from '../sections/Pricing';
import Contact from '../sections/Contact';

const Home = () => {
    const [selectedService, setSelectedService] = useState(null);

    const handleServiceSelect = (serviceName) => {
        setSelectedService(serviceName);
        // Scroll to contact section
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-transparent transition-colors duration-300">
            <Helmet>
                <title>NexLayer Web | Student Minds. Professional Tech Solutions.</title>
                <meta name="description" content="NexLayer Web is a student-led tech team providing AI mini projects, website development, web applications, and technical project guidance with full documentation support." />
                <meta name="keywords" content="NexLayer Web, NexLayer, student project support, AI mini projects, website development team, student tech startup, ML project help, web application development" />
            </Helmet>

            <main className="relative z-10">
                <Navbar />
                <Hero />
                <About />
                <Services onSelectService={handleServiceSelect} />
                <Team />
                <Pricing onSelectService={handleServiceSelect} />
                <Contact prefilledService={selectedService} />
            </main>
        </div>
    );
};

export default Home;
