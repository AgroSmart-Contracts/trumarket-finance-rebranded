import React from 'react';
import { DollarSign } from 'lucide-react';
import { InfoCard } from '@/components/ui/InfoCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { QuickAmountButtons } from '@/components/ui/QuickAmountButtons';
import { formatCurrency } from '@/lib/formatters';
import { INVESTMENT, TYPOGRAPHY } from '@/lib/constants';

interface InvestmentAmountCardProps {
    investmentAmount: string;
    setInvestmentAmount: (value: string) => void;
    onQuickAmount: (amount: number) => void;
}

export const InvestmentAmountCard: React.FC<InvestmentAmountCardProps> = ({
    investmentAmount,
    setInvestmentAmount,
    onQuickAmount,
}) => {
    return (
        <InfoCard style={{ padding: '33px 33px 33px', gap: '24px' }}>
            <SectionHeader>Investment Amount</SectionHeader>

            <div className="flex flex-col gap-3">
                <div>
                    <label
                        className="text-base leading-6 font-normal text-[#314158] mb-3 block"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                    >
                        Enter Amount (USD)
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#90A1B9]" />
                        <input
                            type="text"
                            value={investmentAmount === '0' ? '' : investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                            placeholder="0"
                            className="w-full pl-12 pr-4 py-4 bg-[#FAFAFA] border border-[#CAD5E2] rounded-md text-2xl leading-7 font-normal text-[#64748B] focus:outline-none focus:border-[#4E8C37]"
                            style={{ height: '64px', letterSpacing: TYPOGRAPHY.letterSpacing.normal }}
                        />
                    </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-lg p-4 flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <span
                            className="text-sm leading-5 font-normal text-[#45556C]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            Minimum Investment
                        </span>
                        <span
                            className="text-base leading-6 font-normal text-[#0F172B]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            {formatCurrency(INVESTMENT.MIN_INVESTMENT)}
                        </span>
                    </div>
                    <span
                        className="text-base leading-6 font-normal text-[#CAD5E2]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                    >
                        |
                    </span>
                    <div className="flex flex-col gap-1">
                        <span
                            className="text-sm leading-5 font-normal text-[#45556C]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            Maximum Investment
                        </span>
                        <span
                            className="text-base leading-6 font-normal text-[#0F172B]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            {formatCurrency(INVESTMENT.MAX_INVESTMENT)}
                        </span>
                    </div>
                    <span
                        className="text-base leading-6 font-normal text-[#CAD5E2]"
                        style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                    >
                        |
                    </span>
                    <div className="flex flex-col gap-1">
                        <span
                            className="text-sm leading-5 font-normal text-[#45556C]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
                        >
                            Available Balance
                        </span>
                        <span
                            className="text-base leading-6 font-normal text-[#4E8C37]"
                            style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tight }}
                        >
                            {formatCurrency(INVESTMENT.DEFAULT_AVAILABLE_BALANCE)}
                        </span>
                    </div>
                </div>

                <QuickAmountButtons onSelect={onQuickAmount} />
            </div>
        </InfoCard>
    );
};


