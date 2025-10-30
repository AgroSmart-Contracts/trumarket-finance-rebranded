'use client';

import React from 'react';

const Header: React.FC = () => (
    <header className="bg-white border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-6">
                    <img src="/logo.svg" alt="Trumarket Logo" className="h-8 cursor-pointer" />
                    <nav className="hidden md:flex space-x-6">
                        <a href="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
                            Deals
                        </a>
                    </nav>
                </div>
            </div>
        </div>
    </header>
);

const Footer: React.FC = () => (
    <footer className="bg-gray-50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                    <img src="/logo.svg" alt="Trumarket Logo" className="h-6" />
                    <span className="text-sm text-gray-600">©️ 2024 Trumarket</span>
                </div>
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <a
                                target="_blank"
                                href="https://trumarket.tech/privacy-policy"
                                className="text-sm text-gray-600 hover:text-primary transition-colors"
                            >
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a
                                target="_blank"
                                href="https://trumarket.tech/terms-and-conditions"
                                className="text-sm text-gray-600 hover:text-primary transition-colors"
                            >
                                Terms of Service
                            </a>
                        </li>
                        <li>
                            <a
                                target="_blank"
                                href="https://trumarket.tech/contactus"
                                className="text-sm text-gray-600 hover:text-primary transition-colors"
                            >
                                Contact Us
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </footer>
);

// Preview component
const Scaffold: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Scaffold;
