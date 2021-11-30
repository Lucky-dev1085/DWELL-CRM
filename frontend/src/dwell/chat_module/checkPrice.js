import storage from './propertyStorage';

export const runCheckPrice = async (action, view) => {
  view.removeActionButtons();
  await action.addChat('PROSPECT', 'Check Prices / Availability', { action: 'CHECK_PRICES' });
  await action.askQuestionToBot('Check Prices');
};

export const navigatePricePage = (action) => {
  window.location.reload();
  const originalLocation = window.location.href;
  const redirectURL = window.location.host.includes(action.mtHost) ? `${action.mtBaseUrl}floor-plans#/#floorplans` : '/floor-plans#anchor-scroll';
  window.location.href = redirectURL;
  if (originalLocation === redirectURL) window.location.reload();
  storage.setToStorage('should_show_return_button', 'true');
};
