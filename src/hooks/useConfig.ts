'use client';

import { useEffect, useState } from 'react';
import { BlockchainConfig } from '@/config/types';

export const useConfig = (): BlockchainConfig | null => {
    const [config, setConfig] = useState<BlockchainConfig | null>(null);

    useEffect(() => {
        // Try localStorage first (fastest)
        const storedConfig = localStorage.getItem('config');
        if (storedConfig) {
            try {
                const parsed = JSON.parse(storedConfig);
                // Validate that essential fields are present
                if (parsed.evmChainId && parsed.blockchainExplorer) {
                    setConfig(parsed);
                    return;
                }
            } catch (e) {
                console.error('Failed to parse stored config', e);
            }
        }

        // Fetch from API endpoint (reads from .env)
        fetch('/api/config')
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch config');
                }
                return res.json();
            })
            .then((data) => {
                // Accept config if essential fields are present (addresses can be empty)
                if (data.evmChainId && data.blockchainExplorer) {
                    setConfig(data);
                    localStorage.setItem('config', JSON.stringify(data));
                } else {
                    console.warn('Config from API is missing required fields:', data);
                }
            })
            .catch((error) => {
                console.error('Error fetching config from API:', error);
            });
    }, []);

    return config;
};

