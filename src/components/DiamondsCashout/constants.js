export const INITIAL_CREDIT_FORM = {
  usercode: '',
  diamonds: '',
  amount: '',
  status: 'CREDIT',
  transactionId: '',
  paymentMethod: 'MANUAL',
  notes: ''
};

export const CREDIT_STATUS_OPTIONS = [
  { value: 'CREDIT', label: 'Credit' },
  { value: 'DEBIT', label: 'Debit' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' }
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'MANUAL', label: 'Manual Entry' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CASH', label: 'Cash' },
  { value: 'OTHER', label: 'Other' }
];
