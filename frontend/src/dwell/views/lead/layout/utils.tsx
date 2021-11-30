export const getLeadId = (pathname: string): number => {
  // todo, we should parse it from the route param
  const splitStrings = pathname.split('/');
  return splitStrings.length > 4 ? parseInt(splitStrings[splitStrings.length - 2], 10) : parseInt(splitStrings.pop(), 10);
};
