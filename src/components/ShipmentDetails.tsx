'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DealDetails } from '@/types';
import { milestones } from '@/lib/static';
import RecentActivityList from './RecentActivity';
import FinanceSection from './FinanceSection';
import { useICPShipment, useICPActivities } from '@/hooks/useICPShipments';

const formatDate = (dateString: string) => {
    if (!dateString) {
        return '';
    }
    return new Date(dateString).toLocaleDateString();
};

const CustomStepper: React.FC<{
    stepsCompleted: number;
    currentStep: number;
    totalSteps: number;
    onStepClick: (step: number) => void;
}> = ({ currentStep, totalSteps, stepsCompleted, onStepClick }) => {
    const steps = milestones;

    return (
        <div className="flex justify-between w-full items-center">
            {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                    <React.Fragment key={step.label}>
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => onStepClick(index)}
                                disabled={index > stepsCompleted}
                                className={`rounded-full p-2 ${index <= currentStep
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    } ${index <= stepsCompleted
                                        ? 'cursor-pointer'
                                        : 'cursor-not-allowed'
                                    }`}
                                title={step.label}
                            >
                                <Icon size={24} />
                            </button>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-1 bg-gray-300 mx-2">
                                <div
                                    className={`h-full ${index < stepsCompleted ? 'bg-primary' : 'bg-gray-300'
                                        }`}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {children}
    </div>
);

const ShipmentDetailsPage: React.FC<{ shipment: DealDetails }> = ({
    shipment,
}) => {
    const [activeStep, setActiveStep] = useState(shipment.currentMilestone);

    const handleStep = (step: number) => {
        if (step <= shipment.currentMilestone) {
            setActiveStep(step);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="flex h-screen w-full">
                {/* Left Section - 40% */}
                <div className="w-2/5 p-6 overflow-auto mr-4">
                    <h1 className="text-2xl font-bold mb-4">{shipment.name}</h1>
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6 space-y-4">
                        <p className="text-gray-700">
                            <strong className="font-semibold">Origin:</strong>{' '}
                            {shipment.origin} ({shipment.portOfOrigin})
                        </p>
                        <p className="text-gray-700">
                            <strong className="font-semibold">Destination:</strong>{' '}
                            {shipment.destination} ({shipment.portOfDestination})
                        </p>
                        <p className="text-gray-700">
                            <strong className="font-semibold">Shipping Start Date:</strong>{' '}
                            {formatDate(shipment.shippingStartDate)}
                        </p>
                        <p className="text-gray-700">
                            <strong className="font-semibold">Expected End Date:</strong>{' '}
                            {formatDate(shipment.expectedShippingEndDate)}
                        </p>
                        <p className="text-gray-700">
                            <strong className="font-semibold">Quality:</strong>{' '}
                            {shipment.quality}
                        </p>
                        <p className="text-gray-700">
                            <strong className="font-semibold">Offer Unit Price:</strong> $
                            {shipment.offerUnitPrice}
                        </p>
                        <p className="text-gray-700">
                            <strong className="font-semibold">Quantity:</strong>{' '}
                            {shipment.quantity}
                        </p>
                        <p className="text-gray-700">
                            <strong className="font-semibold">Transport:</strong>{' '}
                            {shipment.transport}
                        </p>
                        <p className="text-gray-700">
                            <strong className="font-semibold">Description:</strong>{' '}
                            {shipment.description}
                        </p>
                        {shipment.createdAt && (
                            <p className="text-gray-700">
                                <strong className="font-semibold">Created At:</strong>{' '}
                                {formatDate(shipment.createdAt)}
                            </p>
                        )}
                        {shipment.updatedAt && (
                            <p className="text-gray-700">
                                <strong className="font-semibold">Updated At:</strong>{' '}
                                {formatDate(shipment.updatedAt)}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {shipment.docs.map((doc: any) => (
                            <Card key={doc._id}>
                                {doc.url.endsWith('.pdf') ? (
                                    <div className="p-4">
                                        <p className="text-sm">{doc.description}</p>
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            View PDF
                                        </a>
                                    </div>
                                ) : (
                                    <img
                                        src={doc.url}
                                        alt={doc.description}
                                        className="w-full h-32 object-cover"
                                    />
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Section - 60% */}
                <div className="w-3/5 p-6 overflow-auto ml-4">
                    <CustomStepper
                        stepsCompleted={shipment.currentMilestone}
                        currentStep={activeStep}
                        totalSteps={7}
                        onStepClick={handleStep}
                    />
                    <h2 className="text-xl font-semibold mt-4 mb-2">
                        {activeStep === 7
                            ? 'Shipment Completed'
                            : milestones[activeStep].label}
                    </h2>
                    <div className="mb-8 grid grid-cols-2 gap-4">
                        {shipment.milestones[activeStep]?.docs.map((doc: any) => (
                            <Card key={doc._id}>
                                {doc.url.endsWith('.pdf') ? (
                                    <div className="p-4">
                                        <p className="text-sm">{doc.description}</p>
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            View PDF
                                        </a>
                                    </div>
                                ) : (
                                    <img
                                        src={doc.url}
                                        alt={doc.description}
                                        className="w-full h-32 object-cover"
                                    />
                                )}
                            </Card>
                        ))}
                    </div>
                    {shipment.vaultAddress && (
                        <FinanceSection
                            vaultAddress={shipment.vaultAddress}
                            requestFundAmount={shipment.investmentAmount}
                            currentMilestone={shipment.currentMilestone}
                            nftID={shipment.nftID}
                        />
                    )}
                    {shipment.nftID >= 0 ? (
                        <RecentActivityList id={shipment.nftID} />
                    ) : (
                        <></>
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
            // Use deal directly without conversion
            setShipmentDetails(deal);
        }
    }, [deal]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!shipmentDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Shipment not found</div>
            </div>
        );
    }

    return <ShipmentDetailsPage shipment={shipmentDetails} />;
}
