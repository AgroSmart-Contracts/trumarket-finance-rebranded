'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useWeb3AuthContext } from '@/context/web3-auth-context';
import { HEADER_HEIGHT, HEADER_PADDING_Y, COLORS, SHADOWS, TYPOGRAPHY } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header: React.FC = () => {
    const { isAuthenticated } = useAuth0();
    const { getUserInfo } = useWeb3AuthContext();

    const userInfo = getUserInfo();
    const isLoggedIn = isAuthenticated || !!userInfo;

    return (
        <header
            className="fixed top-0 w-full z-50 bg-white border-b border-[#E2E8F0]"
            style={{ boxShadow: SHADOWS.card }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    {/* Left Section: Logo and Branding */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <a href="/" className="flex-shrink-0">
                            <img
                                src="/logo.svg"
                                alt="TruMarket Logo"
                                className="h-8 sm:h-10 lg:h-12 w-auto cursor-pointer"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            />
                        </a>
                        <div className="flex flex-col">
                            <h1
                                className="text-base leading-6 font-medium text-[#0F172B]"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                TruMarket
                            </h1>
                            <p
                                className="text-sm leading-5 font-normal text-[#62748E] mt-0.5"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                            >
                                Liquidity Pool &amp; Programs
                            </p>
                        </div>
                    </div>

                    {/* Right Section: Navigation and User */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <nav className="hidden items-center gap-1 sm:flex mr-1">
                            <Link
                                href="/"
                                className="rounded-md px-3 py-2 text-sm font-medium text-[#62748E] hover:bg-[#F8FAFC] hover:text-[#0F172B]"
                            >
                                Home
                            </Link>
                            <Link
                                href="/pool"
                                className="rounded-md px-3 py-2 text-sm font-medium text-[#62748E] hover:bg-[#F8FAFC] hover:text-[#0F172B]"
                            >
                                Pool
                            </Link>
                        </nav>
                        <ConnectButton chainStatus="icon" showBalance={false} />
                        {isLoggedIn ? (
                            <Link href="/profile">
                                <Button
                                    variant="outline"
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-base font-normal text-[#0F172A] hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    style={{
                                        letterSpacing: TYPOGRAPHY.letterSpacing.tight,
                                        borderColor: COLORS.border.light
                                    }}
                                >
                                    <User className="w-4 h-4" />
                                    <span>Profile</span>
                                </Button>
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
};

export const Footer: React.FC = () => (
    <footer
        className="bg-white border-t border-[#E2E8F0] mt-auto"
        style={{
            boxShadow: SHADOWS.card,
            // height: `${HEADER_HEIGHT}px`,
            paddingTop: `${HEADER_PADDING_Y}px`,
            paddingBottom: `${HEADER_PADDING_Y}px`,
        }}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 w-full">
                {/* Logo and Copyright */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <img
                        src="/logo.svg"
                        alt="TruMarket Logo"
                        className="h-8 sm:h-10 lg:h-12 w-auto flex-shrink-0"
                    />
                    <div className="flex flex-col">
                        <h1
                            className="text-base leading-6 font-medium text-[#0F172B]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            TruMarket
                        </h1>
                        <span
                            className="text-sm leading-5 font-normal text-[#62748E] mt-0.5"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            ©️ 2026 Trumarket
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav>
                    <ul className="flex flex-wrap items-center gap-3 sm:gap-4">
                        {[
                            { href: 'https://trumarket.tech/contact-us', label: 'Contact us' },
                            { href: 'https://www.notion.so/Master-Platform-Terms-Conditions-3577e98b42c580a19749d628782643f7?source=copy_link', label: 'Terms of Service' },
                            { href: 'https://www.notion.so/Privacy-Policy-32e7e98b42c58042a848c43caa6385e3?source=copy_link', label: 'Privacy Policy' },
                        ].map((link) => (
                            <li key={link.href}>
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={link.href}
                                    className="text-base leading-6 font-normal text-[#62748E] hover:text-[#0F172B] transition-colors"
                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    </footer>
);

interface ScaffoldProps {
    children: React.ReactNode;
}

const Scaffold: React.FC<ScaffoldProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
            <Header />
            <main className="flex-grow" style={{ paddingTop: `${HEADER_HEIGHT}px` }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Scaffold;
