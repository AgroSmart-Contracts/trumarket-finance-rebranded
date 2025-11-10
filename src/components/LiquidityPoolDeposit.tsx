'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
    walletBalance: number;
    poolCapacity: number;
    invest: (amount: number) => Promise<void>;
    refresh: () => Promise<void>;
}

const LiquidityPoolDeposit: React.FC<Props> = ({
    walletBalance,
    poolCapacity,
    invest,
    refresh,
}) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorInvesting, setErrorInvesting] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    const minDeposit = 1;

    const handleMaxClick = () => {
        const maxAmount = Math.min(walletBalance, poolCapacity);
        setAmount(maxAmount.toString());
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorInvesting(null);
        try {
            await invest(Number(amount));
            await refresh();
            setAmount('');
        } catch (err) {
            console.error(err);
            setErrorInvesting('Failed submitting deposit. Please try again.');
        }
        setLoading(false);
    };

    const getErrorMessage = () => {
        const numAmount = Number(amount);
        if (!amount) return null;
        if (isNaN(numAmount)) return 'Please enter a valid number';
        if (numAmount > walletBalance) return 'Insufficient wallet balance';
        if (numAmount > poolCapacity) return 'Exceeds pool capacity';
        if (numAmount < minDeposit) return `Minimum deposit is ${minDeposit} USDC`;
        return null;
    };

    useEffect(() => {
        setError(getErrorMessage());
    }, [amount, walletBalance, poolCapacity]);

    const isValid = amount && !error;

    return (
        <div className="w-full space-y-4">
            {/* Deposit Form */}
            <form onSubmit={handleDeposit} className="space-y-4">
                {/* Input Field */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Deposit Amount
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={amount}
                            disabled={loading}
                            onChange={(e) => setAmount(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`
                                w-full bg-white px-4 py-3 pr-20 rounded-lg border-2
                                text-lg font-medium text-gray-900
                                focus:outline-none transition-all
                                disabled:bg-gray-50 disabled:cursor-not-allowed
                                ${error
                                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : isFocused
                                        ? 'border-[#3CA638] focus:border-[#3CA638] focus:ring-2 focus:ring-[#3CA638]/20'
                                        : 'border-gray-200 hover:border-gray-300'
                                }
                            `}
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-semibold text-[#3CA638] hover:text-[#2D8828] bg-[#3CA638]/10 hover:bg-[#3CA638]/20 rounded-md transition-colors"
                            onClick={handleMaxClick}
                            disabled={loading}
                        >
                            MAX
                        </button>
                    </div>

                    {/* Error Message or Min Deposit Info */}
                    <div className="min-h-[20px]">
                        {error ? (
                            <div className="text-sm text-red-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        ) : (
                            <div className="text-xs text-gray-500">
                                Min. deposit: {minDeposit} USDC
                            </div>
                        )}
                    </div>
                </div>

                {/* Deposit Button */}
                <Button
                    type="submit"
                    className="w-full bg-[#3CA638] hover:bg-[#2D8828] text-white py-6 text-base font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isValid || loading}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        'Deposit'
                    )}
                </Button>

                {/* Investment Error */}
                {errorInvesting && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-sm text-red-800 flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {errorInvesting}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default LiquidityPoolDeposit;

