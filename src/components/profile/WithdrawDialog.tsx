"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Building2 } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { useWalletContext } from "@/context/wallet-context";
import ERC20Abi from "@/lib/abis/ERC20.abi";
import { ethers, parseUnits } from "ethers";

interface WithdrawDialogProps {
  isOpen: boolean;
  onClose: () => void;
  maxAmount: string;
  onWithdrawComplete?: () => void;
}

const investmentTokenSymbol =
  process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_SYMBOL || "TOKEN";

const WithdrawDialog = ({
  isOpen,
  onClose,
  maxAmount,
  onWithdrawComplete,
}: WithdrawDialogProps) => {
  const [selectedMethod, setSelectedMethod] = useState<"wallet" | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { signer, wallet, connectMetaMask, ensureNetwork, refreshBalances } =
    useWalletContext();

  const handleStartWalletWithdraw = () => {
    setSelectedMethod("wallet");
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setAmount("");
    setToAddress("");
    setIsProcessing(false);
    onClose();
  };

  const handleWithdraw = async () => {
            try {
      setIsProcessing(true);

      if (!amount || Number(amount) <= 0) {
        toast.error("Please enter a valid amount to withdraw.");
          return;
        }

      if (!toAddress || !ethers.isAddress(toAddress)) {
        toast.error("Please enter a valid destination wallet address.");
          return;
        }

      const tokenAddress =
        process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS;
      const decimals = Number(
        process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || "6"
      );

      if (!tokenAddress) {
        toast.error("Investment token contract address is not configured.");
          return;
        }

      // Ensure wallet is connected
      if (!wallet?.address || !signer) {
        await connectMetaMask();
      }

      if (!wallet?.address || !signer) {
        toast.error("Unable to connect wallet. Please try again.");
        return;
      }

      await ensureNetwork();

      const contract = new ethers.Contract(tokenAddress, ERC20Abi, signer);
      const parsedAmount = parseUnits(amount, decimals);

      const tx = await contract.transfer(toAddress, parsedAmount);
      await tx.wait();

      toast.success(
        `Withdrawal of ${amount} ${investmentTokenSymbol} submitted.`
      );
      await refreshBalances();
      onWithdrawComplete?.();
      handleClose();
    } catch (error: any) {
      console.error("Withdraw error:", error);
      if (error?.code === 4001) {
        toast.error("Withdrawal cancelled in wallet.");
      } else {
        toast.error(error?.message || "Failed to initiate withdrawal.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

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
            Withdraw Funds
          </DialogTitle>
          <DialogDescription
            className="text-base"
            style={{
              color: COLORS.text.light,
              letterSpacing: TYPOGRAPHY.letterSpacing.tight,
            }}
          >
            Choose how you want to withdraw funds from your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!selectedMethod && (
            <>
            <button
                onClick={handleStartWalletWithdraw}
                className="w-full p-4 border-2 rounded-lg transition-all disabled:opacity-60"
              style={{
                  borderColor: COLORS.border.light,
                  backgroundColor: "white",
              }}
              onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border.medium;
              }}
              onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border.light;
                }}
                disabled={isProcessing}
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
                      Withdraw {investmentTokenSymbol} from your profile wallet to another address
                    </p>
                  </div>
              </div>
            </button>

            <button
                className="w-full p-4 border-2 rounded-lg transition-all opacity-60 cursor-not-allowed"
              style={{
                  borderColor: COLORS.border.light,
                  backgroundColor: "white",
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
                      Bank withdrawals via Circle will be available soon.
                    </p>
              </div>
          </div>
              </button>
            </>
          )}

          {selectedMethod === "wallet" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount to withdraw ({investmentTokenSymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E8C37] focus:border-[#4E8C37]"
                  placeholder={`0.0 ${investmentTokenSymbol}`}
                />
                <p className="text-xs text-gray-600">
                  Available: {maxAmount} {investmentTokenSymbol}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Destination wallet address
                </label>
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E8C37] focus:border-[#4E8C37]"
                  placeholder="0x..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedMethod(null)}
                  variant="outline"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button
                  onClick={handleWithdraw}
                  className="flex-1 bg-[#4E8C37] hover:bg-[#3A6A28] text-white"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Withdraw"}
                </Button>
            </div>
            </div>
          )}
          </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;

