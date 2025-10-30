import {
    Sprout as Farm,
    Building2 as Factory,
    Package as PackageIcon,
    Truck,
    Anchor,
    Ship as Boat,
} from 'lucide-react';

export const productQualityOptions = [
    { value: 'CAT1', label: 'CAT1' },
    { value: 'CAT2', label: 'CAT2' },
    { value: 'industrial', label: 'industrial' },
];

export const milestones = [
    {
        id: '',
        value: 'production_and_fields',
        label: 'Production and Fields',
        icon: Farm,
        milestone: 1,
        emoji: '🌱',
    },
    {
        id: '',
        value: 'packaging_and_process',
        label: 'Packaging and Process',
        icon: Factory,
        milestone: 2,
        emoji: '📦',
    },
    {
        id: '',
        value: 'finished_product_and_storage',
        label: 'Finished Product and Storage',
        icon: PackageIcon,
        milestone: 3,
        emoji: '🏪',
    },
    {
        id: '',
        value: 'transport_to_port_of_origin',
        label: 'Transportation to Port of Origin',
        icon: Truck,
        milestone: 4,
        emoji: '🚛',
    },
    {
        id: '',
        value: 'port_of_origin',
        label: 'Port of Origin',
        icon: Anchor,
        milestone: 5,
        emoji: '⚓',
    },
    {
        id: '',
        value: 'transit',
        label: 'Transit',
        icon: Boat,
        milestone: 6,
        emoji: '🚢',
    },
    {
        id: '',
        value: 'port_of_destination',
        label: 'Port of Destination',
        icon: Anchor,
        milestone: 7,
        emoji: '⚓',
    },
];
