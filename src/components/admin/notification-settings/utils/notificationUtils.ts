
export const getTypeColor = (type: string) => {
  switch (type) {
    case 'reminder': return 'bg-blue-100 text-blue-800';
    case 'alert': return 'bg-red-100 text-red-800';
    default: return 'bg-green-100 text-green-800';
  }
};

export const getChannelColor = (channel: string) => {
  return channel === 'email' 
    ? 'bg-purple-100 text-purple-800' 
    : 'bg-orange-100 text-orange-800';
};
