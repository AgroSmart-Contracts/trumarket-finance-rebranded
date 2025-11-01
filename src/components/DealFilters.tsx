'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectSeparator,
} from '@/components/ui/select';
import { X, ChevronDown, ChevronUp, Filter } from 'lucide-react';

export interface FilterOptions {
    origins: string[];
    destinations: string[];
    statuses: string[];
    transports: string[];
    minInvestment: number | null;
    risks: string[];
    minAPY: number | null;
    maxAPY: number | null;
}

interface DealFiltersProps {
    onFilterChange: (filters: FilterOptions) => void;
}

export default function DealFilters({ onFilterChange }: DealFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedMinInvestment, setSelectedMinInvestment] = useState<string>('all');
    const [selectedRisk, setSelectedRisk] = useState<string>('all');
    const [selectedAPYRange, setSelectedAPYRange] = useState<string>('all');

    const updateFilters = () => {
        // Parse APY range
        let minAPY = null;
        let maxAPY = null;
        if (selectedAPYRange !== 'all') {
            const [min, max] = selectedAPYRange.split('-').map(Number);
            minAPY = min;
            maxAPY = max || null;
        }

        const filters: FilterOptions = {
            origins: [],
            destinations: [],
            statuses: [],
            transports: [],
            minInvestment: selectedMinInvestment === 'all' ? null : parseInt(selectedMinInvestment),
            risks: selectedRisk === 'all' ? [] : [selectedRisk],
            minAPY,
            maxAPY,
        };
        onFilterChange(filters);
    };

    const handleMinInvestmentChange = (value: string) => {
        setSelectedMinInvestment(value);
        setTimeout(updateFilters, 0);
    };

    const handleRiskChange = (value: string) => {
        setSelectedRisk(value);
        setTimeout(updateFilters, 0);
    };

    const handleAPYRangeChange = (value: string) => {
        setSelectedAPYRange(value);
        setTimeout(updateFilters, 0);
    };

    const clearAllFilters = () => {
        setSelectedMinInvestment('all');
        setSelectedRisk('all');
        setSelectedAPYRange('all');
        onFilterChange({
            origins: [],
            destinations: [],
            statuses: [],
            transports: [],
            minInvestment: null,
            risks: [],
            minAPY: null,
            maxAPY: null,
        });
    };

    const hasActiveFilters =
        selectedMinInvestment !== 'all' ||
        selectedRisk !== 'all' ||
        selectedAPYRange !== 'all';

    const getActiveFilterCount = () => {
        let count = 0;
        if (selectedMinInvestment !== 'all') count++;
        if (selectedRisk !== 'all') count++;
        if (selectedAPYRange !== 'all') count++;
        return count;
    };

    return (
        <Card className="mb-6 border-gray-300">
            <CardContent className="pt-6">
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Filter Preferences</h3>
                        {hasActiveFilters && (
                            <Badge className="bg-[#3CA63820] text-[#2D8828] border border-[#3CA638]">
                                {getActiveFilterCount()} active
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearAllFilters();
                                }}
                                className="text-red-600 hover:text-red-700"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Clear
                            </Button>
                        )}
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>

                {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                        {/* Minimum Investment Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Minimum Investment
                            </label>
                            <Select value={selectedMinInvestment} onValueChange={handleMinInvestmentChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select amount" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Amounts</SelectItem>
                                    <SelectSeparator />
                                    <SelectItem value="50000">💰 $50,000+</SelectItem>
                                    <SelectItem value="100000">💰 $100,000+</SelectItem>
                                    <SelectItem value="250000">💎 $250,000+</SelectItem>
                                    <SelectItem value="500000">💎 $500,000+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Risk Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Risk Category
                            </label>
                            <Select value={selectedRisk} onValueChange={handleRiskChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select risk" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Risk Levels</SelectItem>
                                    <SelectSeparator />
                                    <SelectItem value="low">🟢 Low Risk</SelectItem>
                                    <SelectItem value="medium">🟡 Medium Risk</SelectItem>
                                    <SelectItem value="high">🔴 High Risk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* APY Range Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                APY Range
                            </label>
                            <Select value={selectedAPYRange} onValueChange={handleAPYRangeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select APY" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All APY</SelectItem>
                                    <SelectSeparator />
                                    <SelectItem value="0-5">📊 0-5%</SelectItem>
                                    <SelectItem value="5-10">📊 5-10%</SelectItem>
                                    <SelectItem value="10-15">📈 10-15%</SelectItem>
                                    <SelectItem value="15-20">📈 15-20%</SelectItem>
                                    <SelectItem value="20">🚀 20%+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

