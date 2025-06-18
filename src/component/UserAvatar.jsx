import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { stringToColor, getInitials } from "@/lib/utils"

export function UserAvatar({ user, className ,role}) {
  const displayRole = role || "Utilisateur";
  
  const cleanRole = displayRole
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  const initials = getInitials(cleanRole);
  const backgroundColor = stringToColor(displayRole);

  return (
    <Avatar className={className}>
      <AvatarFallback className={`${backgroundColor} text-white`}>{initials}</AvatarFallback>
    </Avatar>
  )
}
export function UserNameAvatar({ user, className }) {
 
  const getNameInitials = (firstName, lastName) => {
    const first = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
     
    if (first && last) {
      return `${first}${last}`;
    }
     
    if (first) {
      return first;
    }
     
    if (last) {
      return last;
    }
     
    return 'U';
  };
 
  const generateColorFromName = (firstName, lastName) => {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    
    if (!fullName) return 'bg-gray-500';
    
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-amber-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
      'bg-violet-500',
      'bg-emerald-500'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getNameInitials(user.firstName, user.lastName);
  const backgroundColor = generateColorFromName(user.firstName, user.lastName);
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  return (
    <Avatar className={className}>
      <AvatarFallback 
        className={`${backgroundColor} text-white font-semibold text-sm`}
        title={fullName || 'Utilisateur'}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
