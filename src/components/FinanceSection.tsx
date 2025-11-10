'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download } from 'lucide-react';
import { DealDetails } from '@/types';
import useDealOwnership from '@/hooks/useDealOwnership';
import useWallet from '@/hooks/useWallet';
import { useConfig } from '@/hooks/useConfig';
import LiquidityPoolDeposit from './LiquidityPoolDeposit';

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
    const config = useConfig();
    const {
        invest,
        shares,
        amountFunded,
        refresh,
        amountToReclaim,
        redeem,
        dealStatus,
    } = useDealOwnership(vaultAddress, nftID);
    const { wallet, connectMetaMask, network, ensureNetwork } = useWallet();

    const [redeeming, setRedeeming] = useState(false);
    const [redeemError, setRedeemError] = useState<string | null>(null);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const reclaim = useCallback(async () => {
        try {
            setRedeeming(true);
            await redeem();
            await refresh();
            setRedeemError(null);
        } catch (error) {
            console.error(error);
            setRedeemError('Failed to reclaim funds. Please try again.');
        }
        setRedeeming(false);
    }, [redeem, refresh]);

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

    if (!config) return <></>;

    return (
        <div className="bg-white w-full p-6 border-2 border-gray-300 rounded-lg shadow-sm">
            {/* Total Pool Assets */}
            {renderLiquidityPoolDeposit()}

            {/* Vault Address */}
            <div className="rounded-lg text-xs">
                <a
                    href={`${config?.blockchainExplorer || 'https://etherscan.io'}/token/${vaultAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded font-mono flex items-center gap-2 text-gray-400 hover:text-primary transition-colors"
                >
                    Vault {truncateAddress(vaultAddress)}
                </a>
            </div>

            {/* Network Warning */}
            {network && config && network !== config.evmChainId && (
                <div className="text-red-500 mt-4 mb-2 text-sm">
                    Warning: Please switch to the correct network
                    <button
                        type="button"
                        className="ml-2 bg-red-500 text-white font-bold py-1 px-2 rounded hover:bg-red-700"
                        onClick={ensureNetwork}
                    >
                        Switch Network
                    </button>
                </div>
            )}

            {/* Current Position Display */}

            <div className="bg-gray-50 mt-2 flex items-center justify-between rounded-lg p-3">
                <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium">Your Position</span>
                </div>
                <div className="text-2xl font-semibold">
                    {(dealStatus === 8 ? amountToReclaim : shares).toFixed(2)} USDC
                </div>
            </div>


            {/* Deposit Button - Only show if milestone is 0 and there's capacity */}
            {currentMilestone === 0 && requestFundAmount - amountFunded > 0 && (
                <div className="mt-8">
                    {!isDepositOpen && (
                        <div className="flex justify-center">
                            <Button
                                onClick={() =>
                                    wallet
                                        ? setIsDepositOpen(true)
                                        : connectMetaMask && connectMetaMask()
                                }
                                className="w-full bg-[#3CA638] hover:bg-[#2D8828] text-white py-6 text-base font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                                disabled={!!(network && config && network !== config.evmChainId)}
                            >
                                {wallet ? 'Deposit' : 'Connect Wallet'}
                            </Button>
                        </div>
                    )}

                    {isDepositOpen && wallet && (
                        <LiquidityPoolDeposit
                            invest={invest}
                            poolCapacity={requestFundAmount - amountFunded}
                            walletBalance={wallet.balanceUnderlying || 0}
                            refresh={refresh}
                        />
                    )}
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
                        <DialogContent className="sm:max-w-[700px] bg-white max-h-[80vh] overflow-y-auto w-[calc(100%-3rem)] sm:w-full rounded-xl">
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
                        <Button
                            onClick={reclaim}
                            disabled={redeeming}
                            className="bg-[#3CA638] hover:bg-[#2D8828] text-white mb-4"
                        >
                            {redeeming ? 'Reclaiming...' : 'Reclaim'}
                        </Button>
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
