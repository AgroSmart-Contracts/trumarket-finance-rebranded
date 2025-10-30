'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface Props {
    vaultAddress: string;
    nftID: number;
    requestFundAmount: number;
    currentMilestone: number;
}

const CurrencyFormatter = (amount: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return formatter.format(amount);
};

const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 30)}...${address.slice(-4)}`;
};

const FinanceSection: React.FC<Props> = ({
    vaultAddress,
    nftID,
    requestFundAmount,
    currentMilestone,
}) => {
    const [shares, setShares] = useState(0);
    const [amountFunded, setAmountFunded] = useState(0);
    const [amountToReclaim, setAmountToReclaim] = useState(0);
    const [dealStatus, setDealStatus] = useState(0);
    const [redeeming, setRedeeming] = useState(false);
    const [redeemError, setRedeemError] = useState<string | null>(null);
    const [showDepositForm, setShowDepositForm] = useState(false);

    // Mock data for demonstration - in a real app, this would come from API calls
    useEffect(() => {
        setAmountFunded(requestFundAmount * 0.3); // 30% funded
        setShares(1000); // Mock shares
        setDealStatus(1); // Mock deal status
    }, [requestFundAmount]);

    const reclaim = useCallback(async () => {
        try {
            setRedeeming(true);
            // Mock reclaim logic
            await new Promise(resolve => setTimeout(resolve, 1000));
            setRedeemError(null);
        } catch (error) {
            console.error(error);
            setRedeemError('Failed to reclaim funds. Please try again.');
        }
        setRedeeming(false);
    }, []);

    const progressPercentage = requestFundAmount > 0 ? (amountFunded / requestFundAmount) * 100 : 100;

    const renderLiquidityPoolDeposit = () => {
        if (currentMilestone === 0) {
            return (
                <div className="space-y-4 border-b pb-4 mb-2">
                    <div className="text-gray-600 flex items-center gap-2">
                        <span className="text-sm">Total pool assets</span>
                    </div>
                    <div className="text-gray-900 text-3xl font-semibold">
                        {CurrencyFormatter(amountFunded)}
                    </div>
                    {/* Progress bar */}
                    <div>
                        <div className="text-gray-600 mb-1 flex justify-between text-sm">
                            <span>{progressPercentage.toFixed(1)}% filled</span>
                            <span>Target: {CurrencyFormatter(requestFundAmount)}</span>
                        </div>
                        <div className="bg-gray-200 h-2 w-full overflow-hidden rounded-full">
                            <div
                                className="h-full rounded-full bg-[#8aab3f] transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return <></>;
    };

    return (
        <div className="bg-white w-full p-6 border border-border rounded-lg shadow-sm">
            {/* Total Pool Assets */}
            {renderLiquidityPoolDeposit()}

            {/* Vault Address */}
            <div className="rounded-lg text-xs">
                <a
                    href={`https://etherscan.io/token/${vaultAddress}`}
                    target="_blank"
                    className="rounded font-mono flex items-center gap-2 text-gray-400 hover:text-primary transition-colors"
                >
                    Vault {truncateAddress(vaultAddress)}
                </a>
            </div>

            {/* Current Position Display */}
            {shares > 0 && (
                <div className="bg-gray-50 mt-2 flex items-center justify-between rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium">Your Position</span>
                    </div>
                    <div className="text-2xl font-semibold">
                        {(dealStatus === 8 ? amountToReclaim : shares).toFixed(2)} TRU3-USDC
                    </div>
                </div>
            )}

            {currentMilestone === 0 && requestFundAmount - amountFunded > 0 && (
                <div className="mt-8">
                    {!showDepositForm && (
                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowDepositForm(!showDepositForm)}
                                className="btn-invest-primary w-full"
                            >
                                Deposit
                            </button>
                        </div>
                    )}

                    {showDepositForm && (
                        <div className="w-50">
                            <div className="p-4 border border-border rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">
                                    Pool Capacity: {CurrencyFormatter(requestFundAmount - amountFunded)}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Mock deposit form - in a real app, this would connect to a wallet
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {dealStatus === 8 && amountToReclaim !== 0 && (
                <div>
                    <div className="flex justify-end">
                        <button
                            onClick={reclaim}
                            disabled={redeeming}
                            className="btn-invest-primary mb-4"
                        >
                            {redeeming ? 'Reclaiming...' : 'Reclaim'}
                        </button>
                    </div>
                    <div className="flex justify-end">
                        {redeemError && <div className="text-red-500 text-sm">{redeemError}</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceSection;
