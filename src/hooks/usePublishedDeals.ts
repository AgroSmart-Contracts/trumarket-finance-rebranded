'use client';

import { useState, useEffect } from 'react';
import type { DealDetails, DealLog } from '@/types';

export function usePublishedDeals() {
  const [deals, setDeals] = useState<DealDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/deals');
        if (!response.ok) throw new Error('Failed to fetch deals');
        const data = await response.json();
        setDeals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  return {
    deals,
    loading,
    error,
    refetch: () => {
      void (async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetch('/api/deals');
          if (!response.ok) throw new Error('Failed to fetch deals');
          const data = await response.json();
          setDeals(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      })();
    },
  };
}

export function usePublishedDeal(id: string) {
  const [deal, setDeal] = useState<DealDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/deals/${id}`);
        if (!response.ok) throw new Error('Failed to fetch deal');
        const data = await response.json();
        setDeal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [id]);

  return { deal, loading, error };
}

export function useDealActivities(dealId: number) {
  const [activities, setActivities] = useState<DealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dealId) return;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/deals/${dealId}/activities`);
        if (!response.ok) throw new Error('Failed to fetch activities');
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [dealId]);

  return { activities, loading, error };
}
