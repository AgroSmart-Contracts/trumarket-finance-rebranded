import {
    Farm,
    Factory,
    Package,
    Truck,
    Anchor,
    Boat,
} from '@phosphor-icons/react';

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
    },
    {
        id: '',
        value: 'packaging_and_process',
        label: 'Packaging and Process',
        icon: Factory,
        milestone: 2,
    },
    {
        id: '',
        value: 'finished_product_and_storage',
        label: 'Finished Product and Storage',
        icon: Package,
        milestone: 3,
    },
    {
        id: '',
        value: 'transport_to_port_of_origin',
        label: 'Transportation to Port of Origin',
        icon: Truck,
        milestone: 4,
    },
    {
        id: '',
        value: 'port_of_origin',
        label: 'Port of Origin',
        icon: Anchor,
        milestone: 5,
    },
    {
        id: '',
        value: 'transit',
        label: 'Transit',
        icon: Boat,
        milestone: 6,
    },
    {
        id: '',
        value: 'port_of_destination',
        label: 'Port of Destination',
        icon: Anchor,
        milestone: 7,
    },
];
