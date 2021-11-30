export const isLeadPage = (): boolean => {
  const pathArray = window.location.pathname.split('/');
  return pathArray.length > 2 && pathArray[2] === 'leads';
};

export const isLeadsObject = (id: string): boolean => {
  const pathArray = window.location.pathname.split('/');
  if (!id || !isLeadPage()) return false;
  return pathArray[3] === id.toString();
};
