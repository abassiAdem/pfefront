import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-orange-500",
  ];

  return colors[Math.abs(hash) % colors.length];
}


export function getInitials(name) {
  if (!name) return "U";
  
  return name
    .split(/[\s-]+/)
    .filter(part => part.length > 0)
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2); 
}
export function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
}


// Function to truncate text
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

/*
// Fonction pour formater les durées en jours/heures
export function formatDuration(hours) {
  if (hours === null || hours === undefined) return "-";
  
  if (hours === 0) return "0 jour";
  
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  
  let result = "";
  
  if (days > 0) {
    result += `${days} jour${days > 1 ? 's' : ''}`;
  }
  
  if (remainingHours > 0) {
    if (result) result += " et ";
    result += `${remainingHours} heure${remainingHours > 1 ? 's' : ''}`;
  }
  
  return result;
}*/
 
export function getFormattedId(id) {
  if (!id) return "-";
  return `REQ-${id.toString().padStart(3, "0")}`;
}