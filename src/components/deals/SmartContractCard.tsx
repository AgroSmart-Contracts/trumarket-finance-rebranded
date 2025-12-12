import React from 'react';
import { Shield, Copy, CheckCircle2 } from 'lucide-react';
import { InfoCard } from '@/components/ui/InfoCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { truncateAddress } from '@/lib/formatters';
import { TYPOGRAPHY } from '@/lib/constants';

interface SmartContractCardProps {
    vaultAddress?: string;
    copied: boolean;
    onCopy: () => void;
}

export const SmartContractCard: React.FC<SmartContractCardProps> = ({
    vaultAddress,
    copied,
    onCopy,
}) => {
    const displayAddress = vaultAddress
        ? truncateAddress(vaultAddress, 20, 4)
        : '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

    return (
        <InfoCard style={{ padding: '25px 25px 25px', gap: '12px' }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#4E8C37]" />
                    <SectionHeader>Smart Contract</SectionHeader>
                </div>
                <Badge variant="verified">Verified</Badge>
            </div>

            <div className="bg-[#F8FAFC] rounded px-4 py-3 flex items-center gap-3">
                <span
                    className="flex-1 text-sm leading-5 font-normal text-[#45556C] font-mono truncate"
                >
                    {displayAddress}
                </span>
                <Button variant="ghost" size="sm" onClick={onCopy} className="p-2 h-9 w-9">
                    {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-[#4E8C37]" />
                    ) : (
                        <Copy className="w-4 h-4 text-[#45556C]" />
                    )}
                </Button>
            </div>

            <p
                className="text-sm leading-5 font-normal text-[#62748E]"
                style={{ letterSpacing: TYPOGRAPHY.letterSpacing.tighter }}
            >
                All deal terms are encoded in a verified smart contract on the blockchain,
                ensuring transparency and automated execution.
            </p>
        </InfoCard>
    );
};


