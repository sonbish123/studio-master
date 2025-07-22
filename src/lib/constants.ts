export const REGIONAL_OFFICES_DATA: { [key: string]: string[] } = {
  'Phuentsholing Regional Office': [
    'Phuentsholing',
    'Gedu',
    'Samtse',
    'Lhamoizingkha',
  ],
  'Paro Regional Office': ['Paro', 'Thimphu', 'Wangdue'],
  'Gelephu': ['Gelephu', 'Tsirang', 'Dagana', 'Trongsa', 'Zhemgang'],
  'Mongar Regional Office': ['Mongar', 'Trashigang', 'Bumthang'],
  'Samdrup Jongkhar Regional Office': [
    'Samdrup Jongkhar',
    'Pema Gatshel',
    'Nganglam',
    'Samdrup Choling',
  ],
};

export const REGIONAL_OFFICES = Object.keys(REGIONAL_OFFICES_DATA);

export const SERVICE_TYPES = [
  'Phytosanitary Certificate',
  'Import Permit',
  'In-Country Movement Permit',
  'Import Inspection',
  'Export Certification',
  'Regulatory Inspection/Illegal',
  'PSC for Re-export',
];

export const PURPOSE_TYPES = ['Commercial', 'Personal'];

export const QUANTITY_UNITS = [
  'Kgs',
  'MT',
  'Grams',
  'CFT',
  'SqFT',
  'CBM',
  'Nos.',
  'Bags',
  'Bundles',
  'Boxes',
  'NA',
];

export const CURRENCIES = ['Nu.', '$', 'INR', 'NA'];

export const MOVEMENT_LABELS: { [key: string]: { from: string; to: string } } = {
  'Phytosanitary Certificate': { from: 'Movement from', to: 'Export to' },
  'Import Permit': { from: 'Import from', to: 'Movement to' },
  'In-Country Movement Permit': { from: 'Movement from', to: 'Movement to' },
  'Import Inspection': { from: 'Import from', to: 'Movement to' },
  'Export Certification': { from: 'Movement from', to: 'Export to' },
  'Regulatory Inspection/Illegal': { from: 'N/A', to: 'N/A' },
  'PSC for Re-export': { from: 'Movement from', to: 'Export to' },
};
