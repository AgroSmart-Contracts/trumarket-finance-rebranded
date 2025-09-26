'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DealDetails } from '@/types';
import { milestones } from '@/lib/static';
import { useICPShipments } from '@/hooks/useICPShipments';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
};

const ActiveShipmentCard: React.FC<{
    shipment: DealDetails;
    onClick: (id: string) => void;
}> = ({ shipment, onClick }) => (
    <div
        onClick={() => onClick(shipment.id)}
        className="bg-white shadow rounded-lg p-6 mb-6 flex flex-col transition-all duration-300 ease-in-out hover:bg-gray-100 cursor-pointer hover:shadow-lg"
    >
        <h3 className="text-lg font-semibold mb-2">{shipment.name}</h3>
        <p className="text-gray-600 mb-4 flex-grow">{shipment.description}</p>
        <div className="mt-2">
            <p className="text-sm">
                <strong>Origin:</strong> {shipment.origin}
            </p>
            <p className="text-sm">
                <strong>Start Date:</strong> {formatDate(shipment.shippingStartDate)}
            </p>
        </div>
        <div className="mt-2">
            <p className="text-sm">
                <strong>Destination:</strong> {shipment.destination}
            </p>
            <p className="text-sm">
                <strong>Expected End Date:</strong>{' '}
                {formatDate(shipment.expectedShippingEndDate)}
            </p>
        </div>
    </div>
);

const CustomStepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = milestones;

    return (
        <div className="flex justify-between w-full items-center">
            {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                    <div key={step.label} className="flex flex-col items-center">
                        <div
                            className={`rounded-full p-2 ${index <= currentStep
                                ? 'bg-[#8aab3f] text-white'
                                : 'bg-gray-200 text-gray-500'
                                }`}
                            title={step.label}
                        >
                            <Icon size={16} />
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 border-t-2 border-gray-300 mx-2"></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const InProgressShipmentRow: React.FC<{
    shipment: DealDetails;
    onClick: (id: string) => void;
}> = ({ shipment, onClick }) => (
    <div
        onClick={() => onClick(shipment.id)}
        className="py-6 px-4 border-b border-gray-200 transition-all duration-300 ease-in-out hover:bg-gray-100 cursor-pointer hover:shadow-lg"
    >
        <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-2">
                <h4 className="font-semibold">{shipment.name}</h4>
            </div>
            <div className="col-span-2">
                <p className="text-sm">
                    <strong>Origin:</strong> {shipment.origin}
                </p>
                <p className="text-sm">
                    <strong>Start:</strong> {formatDate(shipment.shippingStartDate)}
                </p>
            </div>
            <div className="col-span-6">
                <CustomStepper currentStep={shipment.currentMilestone} />
            </div>
            <div className="col-span-2">
                <p className="text-sm">
                    <strong>Destination:</strong> {shipment.destination}
                </p>
                <p className="text-sm">
                    <strong>Expected End:</strong>{' '}
                    {formatDate(shipment.expectedShippingEndDate)}
                </p>
            </div>
        </div>
    </div>
);

const CompletedShipmentRow: React.FC<{
    shipment: DealDetails;
    onClick: (id: string) => void;
}> = ({ shipment, onClick }) => (
    <div
        onClick={() => onClick(shipment.id)}
        className="py-6 px-4 border-b border-gray-200 transition-all duration-300 ease-in-out hover:bg-gray-100 cursor-pointer hover:shadow-lg"
    >
        <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4">
                <h4 className="font-semibold">{shipment.name}</h4>
            </div>
            <div className="col-span-4">
                <p className="text-sm">
                    <strong>Origin:</strong> {shipment.origin}
                </p>
                <p className="text-sm">
                    <strong>Start:</strong> {formatDate(shipment.shippingStartDate)}
                </p>
            </div>
            <div className="col-span-4">
                <p className="text-sm">
                    <strong>Destination:</strong> {shipment.destination}
                </p>
                <p className="text-sm">
                    <strong>End:</strong> {formatDate(shipment.expectedShippingEndDate)}
                </p>
            </div>
        </div>
    </div>
);

const ShipmentDashboard: React.FC<{
    activeShipments: DealDetails[];
    inProgressShipments: DealDetails[];
    completedShipments: DealDetails[];
    onClickShipment: (id: string) => void;
}> = ({
    activeShipments,
    inProgressShipments,
    completedShipments,
    onClickShipment,
}) => {
        // Distribute active shipments across three columns
        const activeShipmentColumns: DealDetails[][] = [[], [], []];
        activeShipments.forEach((shipment, index) => {
            activeShipmentColumns[index % 3].push(shipment);
        });

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold mb-8">Deals</h1>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Active</h2>
                {activeShipments.length > 0 ? (
                    <div className="flex flex-col md:flex-row md:space-x-6">
                        {activeShipmentColumns.map((column, columnIndex) => (
                            <div key={columnIndex} className="flex-1">
                                {column.map((shipment) => (
                                    <ActiveShipmentCard
                                        onClick={onClickShipment}
                                        key={shipment.id}
                                        shipment={shipment}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No active deals</p>
                )}

                <h2 className="text-2xl font-semibold mt-8 mb-4">In Progress</h2>
                {inProgressShipments.length > 0 ? (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        {inProgressShipments.map((shipment) => (
                            <InProgressShipmentRow
                                onClick={onClickShipment}
                                key={shipment.id}
                                shipment={shipment}
                            />
                        ))}
                    </div>
                ) : (
                    <p>No in-progress deals</p>
                )}

                <h2 className="text-2xl font-semibold mt-8 mb-4">Completed</h2>
                {completedShipments.length > 0 ? (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        {completedShipments.map((shipment) => (
                            <CompletedShipmentRow
                                onClick={onClickShipment}
                                key={shipment.id}
                                shipment={shipment}
                            />
                        ))}
                    </div>
                ) : (
                    <p>No completed deals</p>
                )}
            </div>
        );
    };


export default function ShipmentsList() {
    const [activeShipments, setActiveShipments] = useState<DealDetails[]>([]);
    const [inProgressShipments, setInProgressShipments] = useState<DealDetails[]>([]);
    const [completedShipments, setCompletedShipments] = useState<DealDetails[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    // Fetch data from MongoDB
    const { shipments: deals, loading: icpLoading } = useICPShipments();

    useEffect(() => {
        if (icpLoading) return;

        // Use deals directly without conversion
        const shipments = deals;

        setActiveShipments(
            shipments.filter(
                (shipment: DealDetails) =>
                    shipment.status === 'proposal' ||
                    (shipment.status === 'confirmed' && shipment.currentMilestone === 0)
            )
        );

        setInProgressShipments(
            shipments.filter(
                (shipment: DealDetails) =>
                    shipment.status === 'confirmed' && shipment.currentMilestone > 0
            )
        );

        setCompletedShipments(
            shipments.filter((shipment: DealDetails) => shipment.status === 'finished')
        );

        setLoading(false);
    }, [deals, icpLoading]);

    const redirectToShipmentDetails = (shipmentId: string) => {
        router.push(`/shipments/${shipmentId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <ShipmentDashboard
            onClickShipment={redirectToShipmentDetails}
            activeShipments={activeShipments}
            inProgressShipments={inProgressShipments}
            completedShipments={completedShipments}
        />
    );
}
