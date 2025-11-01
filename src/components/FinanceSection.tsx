'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, FileText, Download } from 'lucide-react';
import { DealDetails } from '@/types';

interface Props {
    vaultAddress: string;
    nftID: number;
    requestFundAmount: number;
    currentMilestone: number;
    deal: DealDetails;
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
    deal,
}) => {
    const [shares, setShares] = useState(0);
    const [amountFunded, setAmountFunded] = useState(0);
    const [amountToReclaim, setAmountToReclaim] = useState(0);
    const [dealStatus, setDealStatus] = useState(0);
    const [redeeming, setRedeeming] = useState(false);
    const [redeemError, setRedeemError] = useState<string | null>(null);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
    const [amount, setAmount] = useState<string>('0');
    const [selectedToken, setSelectedToken] = useState<string>('USDC');

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

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    // Calculate APY for deposit dialog
    const calculateAPY = (deal: DealDetails): number => {
        const baseAPY = 8;
        const variance = (Math.abs(deal.contractId) % 11);
        return Number((baseAPY + variance).toFixed(2));
    };

    const apy = calculateAPY(deal);
    const depositAmount = parseFloat(amount) || 0;
    const expectedDripsPerMonth = depositAmount > 0 ? (depositAmount * (apy / 100) / 12) : 0;
    const estimatedAnnualYield = depositAmount > 0 ? (depositAmount * (apy / 100)) : 0;

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
        <div className="bg-white w-full p-6 border-2 border-gray-300 rounded-lg shadow-sm">
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

            {/* Current Position Display with Buttons */}
            {shares > 0 && (
                <div className="mt-2 space-y-3">
                    <div className="bg-gray-50 flex items-center justify-between rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-medium">Your Position</span>
                        </div>
                        <div className="text-2xl font-semibold">
                            {(dealStatus === 8 ? amountToReclaim : shares).toFixed(2)} TRU3-USDC
                        </div>
                    </div>

                    {/* Deposit Button - Only show if milestone is 0 and there's capacity */}
                    {currentMilestone === 0 && requestFundAmount - amountFunded > 0 && (
                        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-[#3CA638] hover:bg-[#2D8828] text-white py-6 text-base font-semibold rounded-lg transition-all shadow-md hover:shadow-lg">
                                    Deposit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] bg-white">
                                <DialogHeader>
                                    <div className="flex items-center justify-between pr-8">
                                        <DialogTitle className="text-xl font-bold text-gray-900">Deposit</DialogTitle>
                                        <div className="flex items-center gap-1 bg-[#4EA4D920] px-3 py-1.5 rounded-full">
                                            <span className="text-sm font-medium text-[#4EA4D9]">USDC</span>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="space-y-4 pt-4">
                                    {/* Amount Input */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Amount</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={amount}
                                                onChange={handleAmountChange}
                                                placeholder="0"
                                                className="w-full px-4 py-3 text-2xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CA638] focus:border-transparent"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Select value={selectedToken} onValueChange={setSelectedToken}>
                                                    <SelectTrigger className="border-none bg-transparent font-semibold text-base px-0 focus:ring-0 w-[100px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USDC">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[#4EA4D9]">●</span>
                                                                <span>USDC</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="USDT">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[#26a17b]">●</span>
                                                                <span>USDT</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="DAI">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[#f5ac37]">●</span>
                                                                <span>DAI</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expected Metrics */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">Expected Drips per Month</span>
                                                <Info className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {expectedDripsPerMonth > 0 ? `$${expectedDripsPerMonth.toFixed(2)}` : '$0'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">Estimated Annual Yield</span>
                                                <Info className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-[#3CA638]">
                                                {estimatedAnnualYield > 0 ? `$${estimatedAnnualYield.toFixed(2)}` : '$0'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-2 border-t border-gray-200 pt-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">APY</span>
                                                <Info className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <span className="text-lg font-bold text-[#3CA638]">
                                                {apy.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Connect Wallet Button */}
                                    <Button
                                        className="w-full bg-[#2D3E57] hover:bg-[#1E2A3A] text-white py-6 text-base font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                                    >
                                        Connect Wallet
                                    </Button>

                                    {/* Info Note */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-xs text-blue-800">
                                            <strong>Note:</strong> Connect your wallet to deposit funds into this deal. Your deposit will earn {apy.toFixed(2)}% APY.
                                        </p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* View Documents Button and Dialog */}
                    <Dialog open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={!deal.milestones[currentMilestone]?.docs || deal.milestones[currentMilestone].docs.length === 0}
                                className="w-full border-2 border-gray-300 hover:border-[#3CA638] hover:bg-gray-50 text-gray-700 py-6 text-base font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                {(!deal.milestones[currentMilestone]?.docs || deal.milestones[currentMilestone].docs.length === 0)
                                    ? 'No Documents Available'
                                    : 'View Documents'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] bg-white max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-900">Documents</DialogTitle>
                            </DialogHeader>

                            <div className="pt-4">
                                {/* Documents Grid */}
                                <div className="grid grid-cols-1 gap-4">
                                    {deal.milestones[currentMilestone]?.docs && deal.milestones[currentMilestone].docs.length > 0 ? (
                                        deal.milestones[currentMilestone].docs.map((doc: any) => {
                                            const isPDF = doc.url?.toLowerCase().endsWith('.pdf');
                                            const fileName = doc.description || doc.url?.split('/').pop() || 'Document';

                                            return (
                                                <div
                                                    key={doc._id}
                                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#3CA638] hover:bg-gray-50 transition-all"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-red-600 font-bold text-xs">
                                                                {isPDF ? 'PDF' : 'DOC'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {fileName}
                                                            </p>
                                                            {doc.createdAt && (
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-shrink-0 px-4 py-2 bg-[#3CA638] hover:bg-[#2D8828] text-white text-sm font-medium rounded-lg transition-all"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No documents available for this milestone</p>
                                        </div>
                                    )}
                                </div>

                                {/* Download All Button */}
                                {deal.milestones[currentMilestone]?.docs && deal.milestones[currentMilestone].docs.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <Button
                                            className="w-full bg-[#4EA4D9] hover:bg-[#3B8BC4] text-white py-6 text-base font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                            onClick={() => {
                                                // Download all documents logic
                                                deal.milestones[currentMilestone].docs.forEach((doc: any) => {
                                                    window.open(doc.url, '_blank');
                                                });
                                            }}
                                        >
                                            <Download className="w-5 h-5" />
                                            Download All Documents
                                            <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                                                {deal.milestones[currentMilestone].docs.length}
                                            </span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {/* View Documents Button - Also available when no position */}
            {shares === 0 && (
                <div className="mt-4">
                    <Dialog open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={!deal.milestones[currentMilestone]?.docs || deal.milestones[currentMilestone].docs.length === 0}
                                className="w-full border-2 border-gray-300 hover:border-[#3CA638] hover:bg-gray-50 text-gray-700 py-6 text-base font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                {(!deal.milestones[currentMilestone]?.docs || deal.milestones[currentMilestone].docs.length === 0)
                                    ? 'No Documents Available'
                                    : 'View Documents'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] bg-white max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-900">Documents</DialogTitle>
                            </DialogHeader>

                            <div className="pt-4">
                                {/* Documents Grid */}
                                <div className="grid grid-cols-1 gap-4">
                                    {deal.milestones[currentMilestone]?.docs && deal.milestones[currentMilestone].docs.length > 0 ? (
                                        deal.milestones[currentMilestone].docs.map((doc: any) => {
                                            const isPDF = doc.url?.toLowerCase().endsWith('.pdf');
                                            const fileName = doc.description || doc.url?.split('/').pop() || 'Document';

                                            return (
                                                <div
                                                    key={doc._id}
                                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#3CA638] hover:bg-gray-50 transition-all"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-red-600 font-bold text-xs">
                                                                {isPDF ? 'PDF' : 'DOC'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {fileName}
                                                            </p>
                                                            {doc.createdAt && (
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-shrink-0 px-4 py-2 bg-[#3CA638] hover:bg-[#2D8828] text-white text-sm font-medium rounded-lg transition-all"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        View Document
                                                    </a>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No documents available for this milestone</p>
                                        </div>
                                    )}
                                </div>

                                {/* Download All Button */}
                                {deal.milestones[currentMilestone]?.docs && deal.milestones[currentMilestone].docs.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <Button
                                            className="w-full bg-[#4EA4D9] hover:bg-[#3B8BC4] text-white py-6 text-base font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                            onClick={() => {
                                                // Download all documents logic
                                                deal.milestones[currentMilestone].docs.forEach((doc: any) => {
                                                    window.open(doc.url, '_blank');
                                                });
                                            }}
                                        >
                                            <Download className="w-5 h-5" />
                                            Download All Documents
                                            <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                                                {deal.milestones[currentMilestone].docs.length}
                                            </span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
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
