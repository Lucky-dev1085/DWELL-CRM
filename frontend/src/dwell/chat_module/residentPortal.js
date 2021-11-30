export const runResidentPortal = async (action, view) => {
  view.removeActionButtons();
  await action.addChat('PROSPECT', 'Resident Access', { action: 'RESIDENT_ACCESS' });
  await action.addChat('BOT', 'Sure thing, just a moment while I direct you to the resident portal.');
  setTimeout(() => {
    window.location.href = action.residentPortal;
    view.addActionButtons(action);
  }, 2000);
};
