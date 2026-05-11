"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Wallet, Building2, Copy, Check } from 'lucide-react';
import { toast } from '@/lib/toast';
import { useCopyToClipboard } from '@/lib/clipboard';
import { COLORS, TYPOGRAPHY } from '@/lib/constants';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseUnits, isAddress } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWalletContext } from '@/context/wallet-context';

interface DepositDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositComplete?: () => void;
}

const investmentTokenSymbol =
  process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_SYMBOL || 'TOKEN';

const DepositDialog = ({
  isOpen,
  onClose,
  onDepositComplete,
}: DepositDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'metamask' | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>('');

  // Wagmi hooks for external wallet connection
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: hash, isPending: isWriting, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get profile wallet address from Web3Auth context
  const { wallet: profileWallet } = useWalletContext();

  const copyToClipboard = useCopyToClipboard(setCopiedAddress);

  const baseNetworkName = useMemo(
    () => process.env.NEXT_PUBLIC_BLOCKCHAIN_NAME || 'Base',
    []
  );

  const targetChainId = useMemo(
    () => parseInt(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || '8453', 10),
    []
  );

  const tokenAddress = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS as `0x${string}`;
  const decimals = Number(process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || '6');

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && hash) {
      toast.success(`Deposit of ${depositAmount} ${investmentTokenSymbol} confirmed!`);
      onDepositComplete?.();
      handleClose();
        }
  }, [isConfirmed, hash, depositAmount, onDepositComplete]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error('Deposit error:', writeError);
      if (writeError.message?.includes('User rejected') || writeError.message?.includes('User denied')) {
        toast.error('Deposit cancelled in wallet.');
      } else {
        toast.error(writeError.message || 'Failed to initiate deposit.');
      }
      setIsProcessing(false);
    }
  }, [writeError]);

  const handleStartBlockchainDeposit = async () => {
    // If not connected, trigger wallet connection
    if (!isConnected) {
      // Find MetaMask connector or first available connector
      const metamaskConnector = connectors.find((c: any) => c.id === 'metaMask' || c.name.toLowerCase().includes('metamask'));
      const connector = metamaskConnector || connectors[0];

      if (connector) {
        try {
          connect({ connector });
          // Wait a bit for connection, then show the form
          setTimeout(() => {
            if (isConnected) {
              setSelectedMethod('metamask');
            }
          }, 1000);
        } catch (error) {
          console.error('Failed to connect:', error);
          toast.error('Failed to connect wallet. Please try again.');
        }
      } else {
        toast.error('No wallet connector available. Please install MetaMask or another Web3 wallet.');
      }
    } else {
      // Already connected, just show the form
      setSelectedMethod('metamask');
    }
  };

  const handleDeposit = async () => {
    try {
      setIsProcessing(true);

      if (!depositAmount || Number(depositAmount) <= 0) {
        toast.error('Please enter a valid deposit amount.');
        setIsProcessing(false);
        return;
      }

      // Ensure wallet is connected
      if (!isConnected || !address) {
        toast.error('Please connect your wallet first.');
      setIsProcessing(false);
        return;
      }

      // Ensure correct chain
      if (chain?.id !== targetChainId) {
    try {
          await switchChain({ chainId: targetChainId });
          // Wait for chain switch
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
          console.error('Failed to switch chain:', error);
          toast.error('Please switch to the correct network in your wallet.');
          setIsProcessing(false);
          return;
        }
      }

      // Validate token address
      if (!tokenAddress || !isAddress(tokenAddress)) {
        toast.error('Investment token contract address is not configured.');
        setIsProcessing(false);
        return;
      }

      // Get profile wallet address (from Web3Auth context)
      const profileAddress = profileWallet?.address as `0x${string}`;

      if (!profileAddress || !isAddress(profileAddress)) {
        toast.error('Profile wallet address not found. Please ensure you are logged in.');
        setIsProcessing(false);
        return;
      }

      // Parse amount with correct decimals
      const parsedAmount = parseUnits(depositAmount, decimals);

      // Write contract: transfer from connected wallet to profile wallet
      writeContract({
        address: tokenAddress,
        abi: [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'transfer',
        args: [profileAddress, parsedAmount],
      });

      // Note: isProcessing will be set to false in useEffect when transaction confirms or errors
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error?.message || 'Failed to initiate deposit.');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setDepositAmount('');
    setCopiedAddress(false);
    onClose();
  };

  // Use connected address or show connection prompt
  const displayedAddress = address || '';
  const isProcessingTransaction = isProcessing || isWriting || isConfirming;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-semibold"
            style={{
              color: COLORS.text.dark,
              letterSpacing: TYPOGRAPHY.letterSpacing.tight,
            }}
          >
            Deposit Funds
          </DialogTitle>
          <DialogDescription
            className="text-base"
            style={{
              color: COLORS.text.light,
              letterSpacing: TYPOGRAPHY.letterSpacing.tight,
            }}
          >
            Choose how you want to deposit funds into your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!selectedMethod && (
            <>
              <button
                onClick={handleStartBlockchainDeposit}
                className="w-full p-4 border-2 rounded-lg transition-all disabled:opacity-60"
                style={{
                  borderColor: COLORS.border.light,
                  backgroundColor: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border.medium;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border.light;
                }}
                disabled={isProcessingTransaction || isConnecting}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: COLORS.background.cardGray }}
                  >
                    <Wallet
                      className="w-6 h-6"
                      style={{ color: COLORS.text.light }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <h3
                      className="font-semibold text-base"
                      style={{
                        color: COLORS.text.dark,
                        letterSpacing: TYPOGRAPHY.letterSpacing.tight,
                      }}
                    >
                      Blockchain Wallet
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: COLORS.text.light,
                        letterSpacing: TYPOGRAPHY.letterSpacing.tight,
                      }}
                    >
                      Deposit {investmentTokenSymbol} from your Web3 wallet
                    </p>
                  </div>
                </div>
              </button>

              <button
                className="w-full p-4 border-2 rounded-lg transition-all opacity-60 cursor-not-allowed"
                style={{
                  borderColor: COLORS.border.light,
                  backgroundColor: 'white',
                }}
                disabled
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: COLORS.background.cardGray }}
                  >
                    <Building2
                      className="w-6 h-6"
                      style={{ color: COLORS.text.light }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <h3
                      className="font-semibold text-base"
                      style={{
                        color: COLORS.text.dark,
                        letterSpacing: TYPOGRAPHY.letterSpacing.tight,
                      }}
                    >
                      Bank Account (Coming soon)
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: COLORS.text.light,
                        letterSpacing: TYPOGRAPHY.letterSpacing.tight,
                      }}
                    >
                      Bank deposits via Circle will be available soon.
                    </p>
                  </div>
                </div>
              </button>
            </>
          )}

          {selectedMethod === 'metamask' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Blockchain Network
                </label>
                <Select
                  value="BASE"
                  onChange={() => { }}
                  className="w-full"
                  disabled
                >
                  <option value="BASE">{baseNetworkName}</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Deposit Address (ETH)
                    </label>
                      <div className="p-4 bg-[#4E8C3710] border border-[#4E8C3720] rounded-lg">
                  {displayedAddress ? (
                    <>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm font-mono bg-white p-2 rounded border break-all">
                          {displayedAddress}
                          </code>
                          <Button
                          onClick={() =>
                            copyToClipboard(
                              displayedAddress,
                              'Address copied to clipboard',
                              'Failed to copy address'
                            )
                          }
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0"
                          >
                            {copiedAddress ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-gray-600">
                        Connect your Web3 wallet to view your deposit address.
                      </p>
                      <ConnectButton />
                    </div>
                  )}
                </div>
                  </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount to deposit ({investmentTokenSymbol})
                      </label>
                      <input
                  type="number"
                  min="0"
                  step="any"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E8C37] focus:border-[#4E8C37]"
                  placeholder={`0.0 ${investmentTokenSymbol}`}
                        />
                {isConnected && address && (
                  <p className="text-xs text-gray-600">
                    Connected: {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                  onClick={() => setSelectedMethod(null)}
                      variant="outline"
                      className="flex-1"
                  disabled={isProcessingTransaction}
                    >
                      Back
                    </Button>
                {!isConnected ? (
                  <div className="flex-1">
                    <ConnectButton />
                </div>
              ) : (
                  <Button
                    onClick={handleDeposit}
                    className="flex-1 bg-[#4E8C37] hover:bg-[#3A6A28] text-white"
                    disabled={isProcessingTransaction || !displayedAddress || !depositAmount}
                  >
                    {isProcessingTransaction
                      ? (isConfirming ? 'Confirming...' : 'Processing...')
                      : 'Deposit'}
                  </Button>
                )}
                </div>
            </div>
          )}

          {/* Bank account deposits via Circle are disabled and coming soon.
              The Bank Account option above is rendered as a non-interactive,
              disabled card to reflect this state. */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
