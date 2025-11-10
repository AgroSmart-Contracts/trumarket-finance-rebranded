'use client';

const Header: React.FC = () => {
    return (
        <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b-2 border-[#3CA638]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <a href="/" className="flex-shrink-0">
                            <img
                                src="/logo.svg"
                                alt="Trumarket Logo"
                                className="h-8 sm:h-10 lg:h-12 w-auto cursor-pointer"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            />
                        </a>
                        <div className="hidden sm:block border-l-2 border-gray-300 pl-3 sm:pl-4">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2D3E57] tracking-tight">
                                AgroTrade Finance
                            </h1>
                            <div className="flex gap-2 sm:gap-4 mt-0.5 sm:mt-1">
                                <a href="/" className="text-xs sm:text-sm font-medium text-[#3CA638] hover:text-[#2D8828] transition-colors">
                                    Deals
                                </a>
                            </div>
                        </div>
                        {/* Mobile: Show title without border */}
                        <div className="sm:hidden">
                            <h1 className="text-base font-bold text-[#2D3E57] tracking-tight">
                                AgroTrade Finance
                            </h1>
                            <a href="/" className="text-xs font-medium text-[#3CA638] hover:text-[#2D8828] transition-colors">
                                Deals
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

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
            <main className="flex-grow pt-16 sm:pt-20">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Scaffold;
