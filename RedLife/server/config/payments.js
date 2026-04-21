// Payment Methods Configuration
// Configure which payment methods are available on your website

const PAYMENT_METHODS = {
  stripe: {
    name: 'Credit/Debit Card',
    description: 'Pay with your credit or debit card via Stripe',
    icon: '💳',
    enabled: true,
    testMode: true,  // Use test keys
    currencies: ['RON', 'EUR', 'USD'],
    fees: {
      percentage: 2.9,  // 2.9% + 0.30 RON
      fixed: 0.30,
      description: 'Processing fee included'
    }
  },
  
  paysafe: {
    name: 'PaySafe Card',
    description: 'Prepaid gaming cards from PaySafe',
    icon: '🎮',
    enabled: true,
    testMode: true,
    currencies: ['RON', 'EUR', 'USD'],
    fees: {
      percentage: 3.5,
      fixed: 0.50,
      description: 'Processing fee included'
    }
  },
  
  paypal: {
    name: 'PayPal',
    description: 'Fast and secure payments with PayPal',
    icon: '🛒',
    enabled: true,
    testMode: true,
    currencies: ['RON', 'EUR', 'USD'],
    fees: {
      percentage: 3.49,
      fixed: 0.49,
      description: 'PayPal standard processing'
    }
  },
  
  bankTransfer: {
    name: 'Bank Transfer',
    description: 'Direct bank transfer (Romania)',
    icon: '🏦',
    enabled: false,  // Disable for now
    testMode: false,
    currencies: ['RON'],
    fees: {
      percentage: 0,
      fixed: 0,
      description: 'No fees for bank transfers'
    }
  }
};

// Currency Configuration
const CURRENCY_CONFIG = {
  RON: {
    code: 'RON',
    name: 'Romanian Leu',
    symbol: 'Lei',
    exchangeRate: 1.0,  // Base currency
    displayFormat: '{amount} Lei'
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    exchangeRate: 4.97,  // Example: 1 EUR = 4.97 RON
    displayFormat: '€{amount}'
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    exchangeRate: 4.60,  // Example: 1 USD = 4.60 RON
    displayFormat: '${amount}'
  }
};

// Shop Pricing Guidelines
const SHOP_PRICING = {
  cars: {
    min: 5,
    max: 30,      // You specified max 30 Lei for cars
    recommended: 'Lei',
    categories: {
      budget: { min: 5, max: 10, description: 'Entry level vehicles' },
      standard: { min: 10, max: 20, description: 'Mid-range vehicles' },
      premium: { min: 20, max: 30, description: 'High-tier vehicles' }
    }
  },
  items: {
    min: 1,
    max: 50,
    recommended: 'Lei',
    categories: {
      ammo: { min: 1, max: 5, description: 'Ammunition packs' },
      weapons: { min: 5, max: 20, description: 'Weapons' },
      upgrades: { min: 5, max: 30, description: 'Character upgrades' },
      tools: { min: 3, max: 15, description: 'Job tools' }
    }
  },
  factions: {
    min: 5,
    max: 50,
    recommended: 'Lei',
    categories: {
      emergency: { min: 10, max: 20, description: 'Police, Fire, EMS' },
      civilian: { min: 5, max: 15, description: 'Jobs and services' },
      business: { min: 15, max: 50, description: 'Business opportunities' }
    }
  }
};

// Example Shop Inventory
const SAMPLE_INVENTORY = {
  cars: [
    { name: 'Terzo', price: 29, category: 'premium' },
    { name: 'RModJesko', price: 25, category: 'premium' },
    { name: 'Gemera', price: 22, category: 'premium' },
    { name: 'GT63 AMG', price: 20, category: 'standard' },
    { name: 'AMG One', price: 18, category: 'standard' },
    { name: 'Adder', price: 10, category: 'budget' },
    { name: 'Zentorno', price: 12, category: 'budget' }
  ],
  
  items: [
    { name: 'Ammo Pack', price: 3, category: 'ammo' },
    { name: 'Pistol', price: 8, category: 'weapons' },
    { name: 'Armor', price: 5, category: 'upgrades' },
    { name: 'Health Kit', price: 4, category: 'upgrades' },
    { name: 'Phone Upgrade', price: 10, category: 'upgrades' }
  ],
  
  factions: [
    { name: 'Police Officer', price: 15, category: 'emergency' },
    { name: 'Firefighter', price: 12, category: 'emergency' },
    { name: 'Medic', price: 15, category: 'emergency' },
    { name: 'Mechanic', price: 8, category: 'civilian' },
    { name: 'Taxi Driver', price: 5, category: 'civilian' },
    { name: 'Drug Dealer', price: 25, category: 'business' }
  ]
};

// Fraud Prevention
const FRAUD_PREVENTION = {
  maxTransactionAmount: 1000,  // Lei
  minTransactionAmount: 1,     // Lei
  dailyLimitPerUser: 5000,     // Lei
  maxTransactionsPerHour: 10,
  
  // Blacklist patterns
  suspiciousEmails: [
    'test@', 'demo@', 'fake@'
  ],
  
  // VPN/Proxy Detection (optional)
  checkVPN: false,
  
  // Geographic restrictions (optional)
  allowedCountries: ['RO', 'EU'],  // Romania and EU
  blockedCountries: []
};

// Email Templates
const EMAIL_TEMPLATES = {
  purchaseConfirmation: {
    subject: 'Your RedLife Romania Purchase Confirmation',
    template: 'purchase_confirmation.html',
    send: true
  },
  
  itemDelivered: {
    subject: 'Your Items Have Been Delivered!',
    template: 'item_delivered.html',
    send: true
  },
  
  accountVerification: {
    subject: 'Verify Your RedLife Account',
    template: 'verification.html',
    send: true
  }
};

module.exports = {
  PAYMENT_METHODS,
  CURRENCY_CONFIG,
  SHOP_PRICING,
  SAMPLE_INVENTORY,
  FRAUD_PREVENTION,
  EMAIL_TEMPLATES
};
