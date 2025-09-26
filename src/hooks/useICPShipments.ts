'use client';

import { useState, useEffect } from 'react';
import { DealDetails, Activity } from '@/types';

export function useICPShipments() {
    const [shipments, setShipments] = useState<DealDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShipments = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/icp/shipments');

                if (!response.ok) {
                    throw new Error('Failed to fetch shipments');
                }

                const data = await response.json();
                setShipments(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchShipments();
    }, []);

    return {
        shipments,
        loading,
        error,
        refetch: () => {
            const fetchShipments = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const response = await fetch('/api/icp/shipments');

                    if (!response.ok) {
                        throw new Error('Failed to fetch shipments');
                    }

                    const data = await response.json();
                    setShipments(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'An error occurred');
                } finally {
                    setLoading(false);
                }
            };
            fetchShipments();
        }
    };
}

export function useICPShipment(id: string) {
    const [shipment, setShipment] = useState<DealDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchShipment = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/icp/shipments/${id}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch shipment');
                }

                const data = await response.json();
                setShipment(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchShipment();
    }, [id]);

    return { shipment, loading, error };
}

export function useICPActivities(id: number) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchActivities = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/icp/shipments/${id}/activities`);

                if (!response.ok) {
                    throw new Error('Failed to fetch activities');
                }

                const data = await response.json();
                setActivities(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [id]);

    return { activities, loading, error };
}