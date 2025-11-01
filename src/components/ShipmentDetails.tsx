'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DealDetails } from '@/types';
import { milestones } from '@/lib/static';
import RecentActivityList from './RecentActivity';
import FinanceSection from './FinanceSection';
import { useICPShipment, useICPActivities } from '@/hooks/useICPShipments';
import { formatDate } from '@/lib/dateUtils';
import {
    CheckCircle,
    Clock,
    Circle,
    DollarSign,
    TrendingUp,
    Calendar,
    Timer,
    X,
    Plane,
    Ship,
    Package,
    Truck,
    Anchor,
    Flag,
    Leaf,
    PackageCheck,
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
            className={`milestone-item ${isCompleted ? 'completed' : 'pending'} ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="milestone-icon">
                {isCompleted ? '✓' : '⏳'}
            </div>
            <div className="milestone-content">
                <div className="milestone-name">{milestone.label}</div>
                {location && <div className="milestone-location-text">{location}</div>}
                {date && <div className="milestone-date">{date}</div>}
            </div>
            {docCount !== undefined && docCount > 0 && (
                <div className="milestone-badge active">
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
        <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-gray-50">
            {/* Deal Progress Overview Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-300">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-[#2D3E57]">Deal Progress Overview</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Last Updated: 2 hours ago</span>
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#3CA63815] rounded-lg border border-[#3CA638]">
                            <div className="w-5 h-5 bg-[#3CA638] rounded-full flex items-center justify-center">
                                <Play className="w-3 h-3 text-white fill-current" />
                            </div>
                            <span className="text-[#2D8828] font-semibold text-sm">Active Deal</span>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#4EA4D915] rounded-xl p-4 border border-[#4EA4D9]">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-[#4EA4D9]">Deal Value</span>
                            <DollarSign className="w-5 h-5 text-[#4EA4D9]" />
                        </div>
                        <div className="text-2xl font-bold text-[#2D3E57]">
                            ${(dealValue / 1000).toFixed(0)}K
                        </div>
                    </div>
                    <div className="bg-[#3CA63815] rounded-xl p-4 border border-[#3CA638]">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-[#3CA638]">Progress</span>
                            <TrendingUp className="w-5 h-5 text-[#3CA638]" />
                        </div>
                        <div className="text-2xl font-bold text-[#2D3E57]">{progress}%</div>
                    </div>
                    <div className="bg-[#F2A00715] rounded-xl p-4 border border-[#F2A007]">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-[#F2A007]">Days Elapsed</span>
                            <Calendar className="w-5 h-5 text-[#F2A007]" />
                        </div>
                        <div className="text-2xl font-bold text-[#2D3E57]">{daysSinceStart}</div>
                    </div>
                    <div className="bg-[#4EA4D915] rounded-xl p-4 border border-[#4EA4D9]">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-[#4EA4D9]">ETA</span>
                            <Timer className="w-5 h-5 text-[#4EA4D9]" />
                        </div>
                        <div className="text-2xl font-bold text-[#2D3E57]">{daysUntilEnd} days</div>
                    </div>
                </div>

                {/* Deal Information Card */}
                <div className="bg-gradient-to-r from-[#4EA4D910] to-[#3CA63810] rounded-xl p-6 border border-gray-300 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#2D3E57] mb-3">{shipment.name}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Flag className="w-4 h-4 text-red-600" />
                                        <span className="text-sm font-semibold text-gray-900">{shipment.origin}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{shipment.portOfOrigin} • {formatDate(shipment.shippingStartDate)} ETD</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Flag className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-900">{shipment.destination}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">ETA {formatDate(shipment.expectedShippingEndDate)}</p>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900">Supplier:</strong>
                                    <span>rony@villaventurapro.com</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900">Quality:</strong>
                                    <span>{shipment.quality}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900">Value:</strong>
                                    <span>${dealValue.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900">Offer Unit Price:</strong>
                                    <span>${shipment.offerUnitPrice}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900">Quantity:</strong>
                                    <span>{shipment.quantity.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <strong className="text-gray-900">Transport:</strong>
                                    <span>{shipment.transport}</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Identifier: #{shipment.id.slice(0, 24)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracking Layout */}
            <div className="platform-sidebar-layout bg-white rounded-lg shadow-sm">
                {/* Left Sidebar - Milestone Timeline */}
                <div className="platform-sidebar">
                    <h3 className="sidebar-title">Milestone Timeline</h3>

                    {/* Origin Location */}
                    <div className="milestone-location">
                        <span className="flag">📍</span>
                        <div>
                            <div className="location-name">{shipment.origin}</div>
                            <div className="location-date">{formatDate(shipment.shippingStartDate)}</div>
                        </div>
                    </div>

                    {/* Milestone List */}
                    <div className="milestone-list">
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
                    <div className="milestone-location">
                        <span className="flag">📍</span>
                        <div>
                            <div className="location-name">{shipment.destination}</div>
                            <div className="location-date">ETA: {formatDate(shipment.expectedShippingEndDate)}</div>
                        </div>
                    </div>
                </div>

                {/* Right Main Content */}
                <div className="platform-main-content">
                    {/* Milestone Header */}
                    <div className="milestone-header">
                        <div className="milestone-header-left">
                            <div className="milestone-icon-large">
                                {activeMilestone?.emoji || '🌱'}
                            </div>
                            <div>
                                <h2 className="milestone-title">
                                    {activeStep === 7 ? 'Shipment Completed' : activeMilestone?.label || 'Milestone'}
                                </h2>
                                <div className="milestone-subtitle">
                                    {shipment.origin} • {formatDate(shipment.shippingStartDate)}
                                </div>
                            </div>
                        </div>
                        {shipment.currentMilestone >= activeStep && activeStep < 7 && (
                            <div className="milestone-header-right">
                                <div className="milestone-approval-badge">Status: In Progress</div>
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
