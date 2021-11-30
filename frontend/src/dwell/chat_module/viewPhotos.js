import storage from './propertyStorage';

export const runViewPhotos = async (action, view) => {
  view.removeActionButtons();
  await action.addChat('PROSPECT', 'View Photos', { action: 'VIEW_PHOTOS' });
  action.askQuestionToBot('View Photos');
};

export const visitPhotos = (action) => {
  const originalLocation = window.location.href;
  const redirectURL = window.location.host.includes(action.mtHost) ? `${action.mtBaseUrl}photos#community` : '/gallery?src=1&filter=false';
  window.location.href = redirectURL;
  if (originalLocation === '/gallery' || (window.location.host.includes(action.mtHost) && originalLocation === redirectURL)) window.location.reload();
  storage.setToStorage('should_show_return_button', 'true');
};
