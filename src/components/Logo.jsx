import React from 'react';

const Logo = ({ size = 48, className = "", showText = false, textColor = "text-black" }) => {
    // Sizing style to ensure the logo doesn't explode in flex containers
    const sizeStyle = { width: size, height: size };

    return (
        <div className={`flex items-center gap-3 ${className}`} style={{ height: size }}>
            <div className="flex-shrink-0" style={sizeStyle}>
                <img
                    src="/logo.png"
                    alt="NexLayer Logo"
                    style={sizeStyle}
                    className="object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                />
            </div>
            {showText && (
                <span className={`text-2xl font-bold tracking-tight whitespace-nowrap ${textColor}`}>
                    Nex<span className="text-purple-500">Layer</span> Web
                </span>
            )}
        </div>
    );
};

export default Logo;
