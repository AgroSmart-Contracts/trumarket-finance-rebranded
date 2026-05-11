"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import { useWeb3AuthContext } from '@/context/web3-auth-context';
import EthereumRpc from '@/lib/web3/evm.web3';
import { CircleMintService } from '@/services/circleMint';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { InfoCard } from '@/components/ui/InfoCard';
import { InfoRow } from '@/components/ui/InfoRow';
import DepositDialog from '@/components/profile/DepositDialog';
import WithdrawDialog from '@/components/profile/WithdrawDialog';
import { Wallet, Building2, LogOut, User, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast';
import { useCopyToClipboard } from '@/lib/clipboard';
import { COLORS, TYPOGRAPHY } from '@/lib/constants';
import { truncateAddress, formatNumber } from '@/lib/formatters';
import { useWeb3Connection } from '@/hooks/useWeb3Connection';
import { useWalletContext } from '@/context/wallet-context';

const ProfilePage = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth0();
  const { web3authPnPInstance, web3authSfa, isPnPInitialized, getUserInfo, logout: web3Logout } = useWeb3AuthContext();
  const { isConnected: isWeb3Connected, isInitializing: isWeb3Initializing, checkConnection } = useWeb3Connection();
  const { wallet, connectMetaMask } = useWalletContext();
  const [balance, setBalance] = useState<string>('0');
  const [circleBalance, setCircleBalance] = useState<string>('0');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);
  const connectionCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRestorationWaitTime = 3000; // 3 seconds max wait for session restoration

  // Monitor Web3Auth connection status with event-driven approach
  useEffect(() => {
    // Skip if still initializing
    if (isWeb3Initializing) {
      return;
    }

    // Clear any existing timeout
    if (connectionCheckTimeoutRef.current) {
      clearTimeout(connectionCheckTimeoutRef.current);
      connectionCheckTimeoutRef.current = null;
    }

    const userInfo = getUserInfo();
    const isUserAuthenticated = isAuthenticated || userInfo;

    // If user is authenticated but Web3Auth is not connected
    if (!isWeb3Connected && isUserAuthenticated && !hasCheckedConnection) {
      setIsReconnecting(true);

      // Give Web3Auth time to restore session (max 3 seconds)
      const startTime = Date.now();

      const checkConnectionPeriodically = () => {
        const elapsed = Date.now() - startTime;
        const currentConnected = checkConnection();

        if (currentConnected) {
          // Connected! Clear reconnecting state
          setIsReconnecting(false);
          setHasCheckedConnection(true);
          if (connectionCheckTimeoutRef.current) {
            clearTimeout(connectionCheckTimeoutRef.current);
            connectionCheckTimeoutRef.current = null;
          }
          return;
        }

        // If max wait time exceeded, sign out
        if (elapsed >= maxRestorationWaitTime) {
          console.log('Web3Auth not connected after restoration period. Signing out...');
          setIsReconnecting(false);
          setHasCheckedConnection(true);

          // Show user-friendly message before signing out
          // toast.error('Web3Auth session expired. Please log in again.');

          // Sign out after a brief delay to allow toast to show
          setTimeout(async () => {
            await web3Logout();
            // Temporary fix: Remove returnTo to avoid Auth0 error page
            // Auth0 will redirect to login page, then we'll redirect client-side
            logout({ logoutParams: {} });
            // Manually redirect after logout completes
            setTimeout(() => {
              window.location.href = '/';
            }, 500);
          }, 1000);

          if (connectionCheckTimeoutRef.current) {
            clearTimeout(connectionCheckTimeoutRef.current);
            connectionCheckTimeoutRef.current = null;
          }
          return;
        }

        // Check again after 200ms
        connectionCheckTimeoutRef.current = setTimeout(checkConnectionPeriodically, 200);
      };

      // Start checking after initial delay
      connectionCheckTimeoutRef.current = setTimeout(checkConnectionPeriodically, 200);
    } else if (isWeb3Connected && isUserAuthenticated) {
      // Connected and authenticated - clear any reconnecting state
      setIsReconnecting(false);
      setHasCheckedConnection(true);
    }

    // Cleanup on unmount
    return () => {
      if (connectionCheckTimeoutRef.current) {
        clearTimeout(connectionCheckTimeoutRef.current);
        connectionCheckTimeoutRef.current = null;
      }
    };
  }, [isWeb3Connected, isWeb3Initializing, isAuthenticated, getUserInfo, checkConnection, web3Logout, logout, hasCheckedConnection]);

  const fetchBalances = useCallback(async () => {
    try {
      setIsLoading(true);

      // Wait for Web3Auth to initialize if still initializing
      if (isWeb3Initializing) {
        // Wait a bit for initialization
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Check current connection status
      const isConnected = checkConnection();

      // Only proceed if connected
      if (!isConnected) {
        setCircleBalance('0.00');
        setIsLoading(false);
        return;
      }

      // Get Circle Mint balance
      try {
        const circleBalanceData = await CircleMintService.getBalance();
        if (circleBalanceData.data) {
          const available = circleBalanceData.data.available || [];
          const usdcBalance = available.find((b: any) => b.currency === 'USD');
          if (usdcBalance) {
            setCircleBalance(formatNumber(Math.round(parseFloat(usdcBalance.amount))));
          } else {
            setCircleBalance('0');
          }
        }
      } catch (error) {
        console.error('Failed to fetch Circle balance:', error);
        setCircleBalance('0');
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isWeb3Initializing, checkConnection, web3authSfa, web3authPnPInstance]);

  useEffect(() => {
    // Only fetch balances when Web3Auth is connected and initialized
    if (!isWeb3Initializing && isWeb3Connected) {
      fetchBalances();
    }
  }, [isWeb3Initializing, isWeb3Connected, fetchBalances]);

  const handleLogout = async () => {
    await web3Logout();
    // Temporary fix: Remove returnTo to avoid Auth0 error page
    // Auth0 will redirect to login page, then we'll redirect client-side
    logout({ logoutParams: {} });
    // Manually redirect after logout completes
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  const copyAddress = useCopyToClipboard(setCopiedAddress);

  const userInfo = getUserInfo();
  const displayUser = user || userInfo?.user;

  // Hydrate wallet context with an address once Web3Auth reports a connection
  useEffect(() => {
    if (isWeb3Connected && !wallet?.address) {
      // Fire-and-forget; internal hook handles network and balances
      connectMetaMask().catch((err) => {
        console.warn('Failed to hydrate wallet after Web3Auth connect:', err);
      });
    }
  }, [isWeb3Connected, wallet?.address, connectMetaMask]);

  useEffect(() => {
    if (!isAuthenticated && !userInfo) {
      router.push('/login');
    }
  }, [isAuthenticated, userInfo, router]);

  // Use client-side only check to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return consistent structure during SSR
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: COLORS.background.lightGray }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <InfoCard className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <h1
                className="text-2xl font-semibold"
                style={{
                  color: COLORS.text.dark,
                  letterSpacing: TYPOGRAPHY.letterSpacing.tight
                }}
              >
                Account Details
              </h1>
            </div>
            <div className="text-center py-8">
              <p style={{ color: COLORS.text.light }}>Loading...</p>
            </div>
          </InfoCard>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !userInfo) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: COLORS.background.lightGray }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <InfoCard className="p-6 sm:p-8">
            <div className="text-center space-y-4">
              <User className="w-16 h-16 mx-auto" style={{ color: COLORS.text.light }} />
              <h2
                className="text-2xl font-semibold"
                style={{
                  color: COLORS.text.dark,
                  letterSpacing: TYPOGRAPHY.letterSpacing.tight
                }}
              >
                Welcome to TruMarket
              </h2>
              <p style={{ color: COLORS.text.light }}>Redirecting to login...</p>
            </div>
          </InfoCard>
        </div>
      </div>
    );
  }

  const investmentTokenSymbol =
    process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_SYMBOL || 'TOKEN';

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: COLORS.background.lightGray }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <InfoCard className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1
              className="text-2xl font-semibold"
              style={{
                color: COLORS.text.dark,
                letterSpacing: TYPOGRAPHY.letterSpacing.tight
              }}
            >
              Account Details
            </h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}>Sign Out</span>
            </Button>
          </div>

          <div className="space-y-6">
            {/* User Information */}
            <div className="border-b pb-6" style={{ borderColor: COLORS.border.light }}>
              <h2
                className="text-xl font-semibold mb-4"
                style={{
                  color: COLORS.text.dark,
                  letterSpacing: TYPOGRAPHY.letterSpacing.tight
                }}
              >
                Account Information
              </h2>
              <div className="space-y-3">
                {displayUser?.email && (
                  <div className="flex items-center justify-between py-2">
                    <span
                      className="text-base font-normal"
                      style={{
                        color: COLORS.text.muted,
                        letterSpacing: TYPOGRAPHY.letterSpacing.tight
                      }}
                    >
                      E-mail address
                    </span>
                    <span
                      className="text-base font-semibold"
                      style={{
                        color: COLORS.text.dark,
                        letterSpacing: TYPOGRAPHY.letterSpacing.tight
                      }}
                    >
                      {displayUser.email}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span
                    className="text-base font-normal"
                    style={{
                      color: COLORS.text.muted,
                      letterSpacing: TYPOGRAPHY.letterSpacing.tight
                    }}
                  >
                    Web3 wallet address
                  </span>
                  <div className="flex items-center gap-2">
                    {isReconnecting ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 animate-pulse" style={{ color: COLORS.text.light }} />
                        <span
                          className="text-base font-normal italic"
                          style={{
                            color: COLORS.text.light,
                            letterSpacing: TYPOGRAPHY.letterSpacing.tight
                          }}
                        >
                          Reconnecting...
                        </span>
                      </div>
                    ) : wallet?.address ? (
                      <>
                        <span
                          className="text-base font-semibold font-mono"
                          style={{
                            color: COLORS.text.dark,
                            letterSpacing: TYPOGRAPHY.letterSpacing.tight
                          }}
                        >
                          {truncateAddress(wallet?.address) || `${wallet?.address.slice(0, 6)}...${wallet?.address.slice(-4)}`}
                        </span>
                        <button
                          onClick={() => wallet?.address && copyAddress(wallet.address, 'Address copied to clipboard', 'Failed to copy address')}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Copy address"
                        >
                          {copiedAddress ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" style={{ color: COLORS.text.light }} />
                          )}
                        </button>
                      </>
                    ) : isWeb3Connected ? (
                      <span
                        className="text-base font-normal"
                        style={{
                          color: COLORS.primary.green,
                          letterSpacing: TYPOGRAPHY.letterSpacing.tight
                        }}
                      >
                        Connected (address loading...)
                      </span>
                    ) : (
                      <span
                        className="text-base font-normal italic"
                        style={{
                          color: COLORS.text.light,
                          letterSpacing: TYPOGRAPHY.letterSpacing.tight
                        }}
                      >
                        Not connected
                      </span>
                    )}
                  </div>
                </div>
                {isWeb3Connected && !isReconnecting && (
                  <div className="flex items-center gap-2 py-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: COLORS.primary.green }} />
                    <span
                      className="text-sm font-normal"
                      style={{
                        color: COLORS.primary.green,
                        letterSpacing: TYPOGRAPHY.letterSpacing.tight
                      }}
                    >
                      Wallet connected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Balances */}
            <div className="border-b pb-6" style={{ borderColor: COLORS.border.light }}>
              <h2
                className="text-xl font-semibold mb-4"
                style={{
                  color: COLORS.text.dark,
                  letterSpacing: TYPOGRAPHY.letterSpacing.tight
                }}
              >
                Balances
              </h2>
              <div className="space-y-4">
                {wallet?.address && (
                  <InfoRow
                    label="Balance"
                    value={`${wallet?.balanceUnderlying ?? 0} ${investmentTokenSymbol}`}
                    icon={Wallet}
                    iconColor={COLORS.primary.green}
                    backgroundColor={COLORS.background.cardGray}
                  />
                )}
                <InfoRow
                  label="Circle (Coming soon)"
                  value=""
                  icon={Building2}
                  iconColor={COLORS.primary.green}
                  backgroundColor={`${COLORS.primary.green}10`}
                  valueColor={COLORS.primary.green}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h2
                className="text-xl font-semibold"
                style={{
                  color: COLORS.text.dark,
                  letterSpacing: TYPOGRAPHY.letterSpacing.tight
                }}
              >
                Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => setIsDepositDialogOpen(true)}
                  className="w-full h-12 text-base"
                  style={{
                    backgroundColor: COLORS.primary.green,
                    color: 'white',
                    letterSpacing: TYPOGRAPHY.letterSpacing.tight
                  }}
                >
                  Deposit
                </Button>
                <Button
                  onClick={() => setIsWithdrawDialogOpen(true)}
                  variant="outline"
                  className="w-full h-12 text-base border-2"
                  style={{
                    borderColor: COLORS.primary.green,
                    color: COLORS.primary.green,
                    letterSpacing: TYPOGRAPHY.letterSpacing.tight
                  }}
                  disabled={parseFloat(circleBalance) <= 0}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        </InfoCard>
      </div>

      <DepositDialog
        isOpen={isDepositDialogOpen}
        onClose={() => setIsDepositDialogOpen(false)}
        onDepositComplete={fetchBalances}
      />
      <WithdrawDialog
        isOpen={isWithdrawDialogOpen}
        onClose={() => setIsWithdrawDialogOpen(false)}
        maxAmount={circleBalance}
        onWithdrawComplete={fetchBalances}
      />
    </div>
  );
};

export default ProfilePage;
