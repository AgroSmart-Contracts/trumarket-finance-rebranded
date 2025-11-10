'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DealDetails } from '@/types';
import { milestones } from '@/lib/static';
import RecentActivityList from './RecentActivity';
import FinanceSection from './FinanceSection';
import { useICPShipment } from '@/hooks/useICPShipments';
import { formatDate } from '@/lib/dateUtils';
import {
    DollarSign,
    TrendingUp,
    Calendar,
    Timer,
    Flag,
    Play
} from 'lucide-react';

interface MilestoneItemProps {
    milestone: typeof milestones[0];
    index: number;
    isCompleted: boolean;
    isActive: boolean;
    docCount?: number;
    onClick: () => void;
    location?: string;
    date?: string;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({
    milestone,
    isCompleted,
    isActive,
    docCount,
    onClick,
    location,
    date
}) => {
    return (
        <div
            className={`flex items-start justify-between p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer w-full max-w-full box-border min-w-0 overflow-hidden ${isCompleted
                ? 'bg-[#dcfce7] border-[#3CA638] hover:bg-[#bbf7d0]'
                : 'bg-white border-gray-200 opacity-60'
                }`}
            onClick={onClick}
        >
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 mr-2 sm:mr-3 ${isCompleted
                ? 'bg-[#3CA638] text-white'
                : 'bg-gray-400 text-gray-50'
                }`}>
                {isCompleted ? '✓' : '⏳'}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="font-semibold text-xs sm:text-sm text-[#2D3E57] mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {milestone.label}
                </div>
                {location && (
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                        {location}
                    </div>
                )}
                {date && (
                    <div className="text-[10px] sm:text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                        {date}
                    </div>
                )}
            </div>
            {docCount !== undefined && docCount > 0 && (
                <div className="bg-[#3CA638] text-white px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 whitespace-nowrap ml-2">
                    {docCount} Document{docCount !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

const ShipmentDetailsPage: React.FC<{ shipment: DealDetails }> = ({
    shipment,
}) => {
    const [activeStep, setActiveStep] = useState(shipment.currentMilestone);

    const handleStepClick = (step: number) => {
        if (step <= shipment.currentMilestone) {
            setActiveStep(step);
        }
    };

    const getMilestoneStatus = (index: number) => {
        return index <= shipment.currentMilestone;
    };

    const activeMilestone = milestones[activeStep];

    // Calculate deal metrics
    const dealValue = shipment.offerUnitPrice * shipment.quantity;
    const progress = shipment.currentMilestone > 0 ? Math.round((shipment.currentMilestone / milestones.length) * 100) : 0;
    const daysSinceStart = shipment.shippingStartDate ? Math.floor((Date.now() - new Date(shipment.shippingStartDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const daysUntilEnd = shipment.expectedShippingEndDate ? Math.ceil((new Date(shipment.expectedShippingEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-gray-50">
            {/* Deal Progress Overview Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-300">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#2D3E57]">Deal Progress Overview</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <span className="text-xs sm:text-sm text-gray-500">Last Updated: 2 hours ago</span>
                        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#3CA63815] rounded-lg border border-[#3CA638]">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#3CA638] rounded-full flex items-center justify-center">
                                <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white fill-current" />
                            </div>
                            <span className="text-[#2D8828] font-semibold text-xs sm:text-sm">Active Deal</span>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-[#4EA4D915] rounded-xl p-2 sm:p-4 border border-[#4EA4D9]">
                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                            <span className="text-xs sm:text-sm font-medium text-[#4EA4D9]">Deal Value</span>
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#4EA4D9]" />
                        </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2D3E57]">
                            ${(dealValue / 1000).toFixed(0)}K
                        </div>
                    </div>
                    <div className="bg-[#3CA63815] rounded-xl p-2 sm:p-4 border border-[#3CA638]">
                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                            <span className="text-xs sm:text-sm font-medium text-[#3CA638]">Progress</span>
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#3CA638]" />
                        </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2D3E57]">{progress}%</div>
                    </div>
                    <div className="bg-[#F2A00715] rounded-xl p-2 sm:p-4 border border-[#F2A007]">
                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                            <span className="text-xs sm:text-sm font-medium text-[#F2A007]">Days Elapsed</span>
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2A007]" />
                        </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2D3E57]">{daysSinceStart}</div>
                    </div>
                    <div className="bg-[#4EA4D915] rounded-xl p-2 sm:p-4 border border-[#4EA4D9]">
                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                            <span className="text-xs sm:text-sm font-medium text-[#4EA4D9]">ETA</span>
                            <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-[#4EA4D9]" />
                        </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2D3E57]">{daysUntilEnd} days</div>
                    </div>
                </div>

                {/* Deal Information Card */}
                <div className="bg-gradient-to-r from-[#4EA4D910] to-[#3CA63810] rounded-xl p-4 sm:p-6 border border-gray-300 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 w-full">
                            <h3 className="text-lg sm:text-xl font-bold text-[#2D3E57] mb-3">{shipment.name}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Flag className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{shipment.origin}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 break-words">{shipment.portOfOrigin} • {formatDate(shipment.shippingStartDate)} ETD</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Flag className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{shipment.destination}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600">ETA {formatDate(shipment.expectedShippingEndDate)}</p>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                <div className="flex items-start sm:items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900 flex-shrink-0">Supplier:</strong>
                                    <span className="break-all">rony@villaventurapro.com</span>
                                </div>
                                <div className="flex items-start sm:items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900 flex-shrink-0">Quality:</strong>
                                    <span className="break-words">{shipment.quality}</span>
                                </div>
                                <div className="flex items-start sm:items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900 flex-shrink-0">Value:</strong>
                                    <span>${dealValue.toFixed(2)}</span>
                                </div>
                                <div className="flex items-start sm:items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900 flex-shrink-0">Offer Unit Price:</strong>
                                    <span>${shipment.offerUnitPrice}</span>
                                </div>
                                <div className="flex items-start sm:items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900 flex-shrink-0">Quantity:</strong>
                                    <span>{shipment.quantity.toLocaleString()}</span>
                                </div>
                                <div className="flex items-start sm:items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900 flex-shrink-0">Transport:</strong>
                                    <span className="break-words">{shipment.transport}</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 break-all">Identifier: #{shipment.id.slice(0, 24)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracking Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-4 lg:gap-8 bg-white rounded-lg shadow-sm">
                {/* Left Sidebar - Milestone Timeline */}
                <div className="bg-white lg:border-r lg:border-gray-200 p-4 lg:p-6 w-full max-w-full lg:max-w-[350px] box-border min-w-0 overflow-hidden">
                    <h3 className="text-base sm:text-xl font-bold text-[#2D3E57] mb-4 sm:mb-6">Milestone Timeline</h3>

                    {/* Origin Location */}
                    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg mb-4 sm:mb-6 box-border overflow-hidden">
                        <span className="text-2xl sm:text-3xl flex-shrink-0">📍</span>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-xs sm:text-sm font-semibold text-[#2D3E57] overflow-hidden text-ellipsis whitespace-nowrap">
                                {shipment.origin}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                                {formatDate(shipment.shippingStartDate)}
                            </div>
                        </div>
                    </div>

                    {/* Milestone List */}
                    <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-full box-border min-w-0">
                        {milestones.map((milestone, index) => {
                            const isCompleted = index <= shipment.currentMilestone;
                            const isActive = index === activeStep;

                            return (
                                <MilestoneItem
                                    key={milestone.label}
                                    milestone={milestone}
                                    index={index}
                                    isCompleted={isCompleted}
                                    isActive={isActive}
                                    docCount={shipment.milestones[index]?.docs?.length || 0}
                                    onClick={() => handleStepClick(index)}
                                    location={shipment.origin}
                                    date={index === 0 ? formatDate(shipment.shippingStartDate) : undefined}
                                />
                            );
                        })}
                    </div>

                    {/* Destination Location */}
                    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg mt-4 sm:mt-6 box-border overflow-hidden">
                        <span className="text-2xl sm:text-3xl flex-shrink-0">📍</span>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-xs sm:text-sm font-semibold text-[#2D3E57] overflow-hidden text-ellipsis whitespace-nowrap">
                                {shipment.destination}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                                ETA: {formatDate(shipment.expectedShippingEndDate)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Main Content */}
                <div className="bg-white p-4 sm:p-6 lg:p-8">
                    {/* Milestone Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-gray-200">
                        <div className="flex gap-3 sm:gap-4 items-start">
                            <div className="text-3xl sm:text-4xl bg-[#dcfce7] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0">
                                {activeMilestone?.emoji || '🌱'}
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-2xl font-bold text-[#2D3E57] mb-1 sm:mb-2">
                                    {activeStep === 7 ? 'Shipment Completed' : activeMilestone?.label || 'Milestone'}
                                </h2>
                                <div className="text-xs sm:text-sm text-gray-500">
                                    {shipment.origin} • {formatDate(shipment.shippingStartDate)}
                                </div>
                            </div>
                        </div>
                        {shipment.currentMilestone >= activeStep && activeStep < 7 && (
                            <div className="flex gap-4 items-center">
                                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 rounded-md text-xs sm:text-sm font-semibold text-[#2D3E57]">
                                    Status: In Progress
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Finance Section with Deposit */}
                    {shipment.vaultAddress && (
                        <div className="mt-6">
                            <FinanceSection
                                vaultAddress={shipment.vaultAddress}
                                requestFundAmount={shipment.investmentAmount}
                                currentMilestone={shipment.currentMilestone}
                                nftID={shipment.nftID}
                                deal={shipment}
                            />
                        </div>
                    )}

                    {/* Recent Activity */}
                    {shipment.nftID >= 0 && (
                        <div className="mt-6">
                            <RecentActivityList id={shipment.nftID} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function ShipmentDetails() {
    const [shipmentDetails, setShipmentDetails] = useState<DealDetails | null>(null);
    const params = useParams();
    const id = params?.id as string;

    const { shipment: deal, loading, error } = useICPShipment(id);

    useEffect(() => {
        if (deal) {
            setShipmentDetails(deal);
        }
    }, [deal]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error || !shipmentDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Shipment not found</div>
            </div>
        );
    }

    return <ShipmentDetailsPage shipment={shipmentDetails} />;
}
