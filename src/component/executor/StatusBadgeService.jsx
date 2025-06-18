import { cn } from '../../lib/utils';
import { Clock, CheckCircle, XCircle, AlertCircle, PauseCircle, HelpCircle } from 'lucide-react';
import { statutLabels } from '../../Store/api';


const StatusBadge = ({ status, className }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'EN_COURS':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'TERMINEE':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'ACCEPTEE':
        return 'bg-teal-50 text-teal-600 border-teal-100';
      case 'AFFECTEE':
        return 'bg-green-100 text-green-600 border border-green-300 rounded-md';
      case 'ANNULEE':
      case 'REJECTEE':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'EN_ATTENTE_DE_CHEF':
      case 'EN_ATTENTE_DE_RESPONSABLE':
      case 'EN_ATTENTE_DE_DEPENDENCE':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'EN_COURS':
        return <Clock className="text-blue-600" size={14} />;
      case 'TERMINEE':
        return <CheckCircle className="text-green-600" size={14} />;
      case 'ACCEPTEE':
        return <CheckCircle className="text-teal-600" size={14} />;
      case 'AFFECTEE':
        return <AlertCircle className="text-green-600" size={14} />;
      case 'ANNULEE':
      case 'REJECTEE':
        return <XCircle className="text-red-600" size={14} />;
      case 'EN_ATTENTE_DE_CHEF':
      case 'EN_ATTENTE_DE_RESPONSABLE':
      case 'EN_ATTENTE_DE_DEPENDENCE':
        return <Clock className="text-amber-600" size={14} />;
      default:
        return <HelpCircle className="text-gray-600" size={14} />;
    }
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border",
        getStatusClass(),
        className
      )}
    >
      {getStatusIcon()}
      <span>{statutLabels[status] || status}</span>
    </div>
  );
};

export default StatusBadge;