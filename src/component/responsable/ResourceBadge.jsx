import { cn } from "@/lib/utils";

const ResourceBadge = ({ skill, className }) => {
  const getSkillStyles = () => {
    switch (skill.toLowerCase()) {
      case 'installation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'support':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'conseil':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'formation':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'analyse':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'dépannage':
      case 'depannage':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center justify-center rounded-md text-xs font-medium px-2 py-1 border", 
      getSkillStyles(), 
      className
    )}>
      {skill}
    </span>
  );
};

export default ResourceBadge;
