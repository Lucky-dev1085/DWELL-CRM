import { chatAvatarColorClasses } from 'dwell/constants';

export const getInitials = (name: string): string => {
  let initials = 'U';
  if (name) {
    const matches = name.match(/\b(\w)/g);
    initials = matches.join('');
  }
  return initials.substr(0, 2);
};

export const getColor = (email: string): string => {
  const totalAscii = [...Array(email.length)].reduce((i, j, ind) => email.charCodeAt(ind) + i, 0);
  return chatAvatarColorClasses.concat(['bg-dark', 'bg-success'])[totalAscii % 7];
};
