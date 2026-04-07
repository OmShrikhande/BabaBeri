import { AlertTriangle, CheckCircle2, Clock, Info } from 'lucide-react';

const statusConfig = {
  active: {
    label: 'Active',
    icon: CheckCircle2,
    badgeClass: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  suspended: {
    label: 'Suspended',
    icon: AlertTriangle,
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  'pending-review': {
    label: 'Pending Review',
    icon: Clock,
    badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  }
};

export const getStatusConfig = (status) =>
  statusConfig[status] || {
    label: 'Unknown',
    icon: Info,
    badgeClass: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  };