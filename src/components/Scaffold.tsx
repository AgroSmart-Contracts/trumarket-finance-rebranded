'use client';

import { useState, useCallback } from 'react';
import useWallet from '@/hooks/useWallet';
import { truncateAddress } from '@/lib/formatters';
import { HEADER_HEIGHT, HEADER_PADDING_Y, COLORS, SHADOWS, TYPOGRAPHY } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Wallet, LogOut } from 'lucide-react';

interface WalletInfoDisplayProps {
    wallet: {
        address: string;
        balanceUnderlying?: number;
    };
}

const WalletInfoDisplay: React.FC<WalletInfoDisplayProps> = ({ wallet }) => (
    <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
            <Wallet className="w-4 h-4 text-[#4E8C37] flex-shrink-0" />
            <p className="text-xs text-gray-700 font-mono break-all">{wallet.address}</p>
        </div>
        {wallet.balanceUnderlying !== undefined && (
            <div className="flex items-center justify-between p-3 bg-[#4E8C3710] rounded-md border border-[#4E8C3720]">
                <span className="text-xs font-medium text-gray-600">Balance</span>
                <span className="text-sm font-bold text-[#4E8C37]">
                    {wallet.balanceUnderlying.toFixed(2)} USDC
                </span>
            </div>
        )}
    </div>
);

const Header: React.FC = () => {
    const { wallet, connectMetaMask, disconnect } = useWallet();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDisconnect = useCallback(() => {
        if (disconnect) {
            disconnect();
        }
        setIsDialogOpen(false);
    }, [disconnect]);

    const getAvatarInitials = useCallback((address?: string): string => {
        if (!address) return 'JD';
        return address.slice(2, 4).toUpperCase();
    }, []);

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
                                Institutional Deal Dashboard
                            </p>
                        </div>
                    </div>

                    {/* Right Section: Navigation and User */}
                    <div className="flex items-center gap-3">
                        {/* Navigation Links */}
                        {/* <div className="hidden md:flex items-center gap-3">
                            <button
                                className="px-3 py-2 bg-[#FAFAFA] rounded-md text-base font-normal text-[#0F172A] hover:bg-gray-100 transition-colors"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                Reports
                            </button>
                            <button
                                className="px-3 py-2 bg-[#FAFAFA] rounded-md text-base font-normal text-[#0F172A] hover:bg-gray-100 transition-colors"
                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                            >
                                Settings
                            </button>
                        </div> */}

                        {wallet ? (
                            <>
                                {/* Desktop: User Avatar with Dropdown */}
                                <div className="hidden md:block">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="flex items-center justify-center p-0 rounded-full hover:bg-transparent transition-all w-10 h-10"
                                                style={{
                                                    background: 'linear-gradient(180deg, #4E8C37 0%, #3B7A2A 100%)',
                                                }}
                                            >
                                                <span
                                                    className="text-white text-base leading-6 font-normal"
                                                    style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                                                >
                                                    {getAvatarInitials(wallet.address)}
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-72 rounded-lg shadow-lg border border-gray-200"
                                        >
                                            <DropdownMenuLabel className="px-4 py-3">
                                                <p className="text-sm font-semibold text-gray-900 mb-3">
                                                    Connected Wallet
                                                </p>
                                                <WalletInfoDisplay wallet={wallet} />
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={handleDisconnect}
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer px-4 py-2.5 mx-1 my-1 rounded-md"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                <span className="font-medium">Disconnect</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Mobile: Dialog */}
                                <div className="md:hidden">
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsDialogOpen(true)}
                                            className="flex items-center justify-center p-0 rounded-full w-10 h-10"
                                            style={{
                                                background: 'linear-gradient(180deg, #4E8C37 0%, #3B7A2A 100%)',
                                            }}
                                        >
                                            <span
                                                className="text-white text-base leading-6 font-normal"
                                                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                                            >
                                                {getAvatarInitials(wallet.address)}
                                            </span>
                                        </Button>
                                        <DialogContent className="sm:max-w-[400px] bg-white rounded-xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-bold text-gray-900">
                                                    Connected Wallet
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div>
                                                <WalletInfoDisplay wallet={wallet} />
                                                <div className="border-t border-gray-200 pt-4 mt-4">
                                                    <Button
                                                        onClick={handleDisconnect}
                                                        variant="outline"
                                                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center justify-center gap-2"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        <span className="font-medium">Disconnect</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </>
                        ) : (
                            <Button
                                onClick={connectMetaMask}
                                className="bg-[#4E8C37] hover:bg-[#3A6A28] text-white flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <Wallet className="w-4 h-4" />
                                <span className="hidden sm:inline font-medium">Connect Wallet</span>
                                <span className="sm:hidden font-medium">Connect</span>
                            </Button>
                        )}
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
                            ©️ 2024 Trumarket
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav>
                    <ul className="flex flex-wrap items-center gap-3 sm:gap-4">
                        {[
                            { href: 'https://trumarket.tech/contactus', label: 'Contact us' },
                            { href: 'https://trumarket.tech/terms-and-conditions', label: 'Terms of Service' },
                            { href: 'https://trumarket.tech/privacy-policy', label: 'Privacy Policy' },
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
