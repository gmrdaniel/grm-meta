
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

export const getChannelColor = (channel: string) => {
  return channel === 'email' 
    ? 'bg-purple-100 text-purple-800' 
    : 'bg-orange-100 text-orange-800';
};
