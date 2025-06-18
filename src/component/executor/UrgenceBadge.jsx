import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, Shield } from 'lucide-react';

const UrgenceBadge = ({ urgence, className }) => { 
  const normalizedUrgence = () => {
    if (!urgence) return 'Pas urgent';
    const lowerCase = urgence.toLowerCase();
    if (lowerCase.includes('urgent') && !lowerCase.includes('pas')) return 'Urgent';
    if (lowerCase.includes('moyen')) return 'Moyen';
    return 'Pas urgent';
  };

  const currentUrgence = normalizedUrgence();

  const getUrgenceClass = () => {
    switch (currentUrgence) {
      case 'Urgent':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'Moyen':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Pas urgent':
      default:
        return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  const getUrgenceIcon = () => {
    switch (currentUrgence) {
      case 'Urgent':
        return <AlertTriangle className="text-red-600" size={12} />;
      case 'Moyen':
        return <Clock className="text-amber-600" size={12} />;
      case 'Pas urgent':
      default:
        return <Shield className="text-green-600" size={12} />;
    }
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border",
        getUrgenceClass(),
        className
      )}
    >
      {getUrgenceIcon()}
      <span>{currentUrgence}</span>
    </div>
  );
};

export default UrgenceBadge;