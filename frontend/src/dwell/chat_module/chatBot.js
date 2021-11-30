const runChatBot = async (action, view) => {
  view.removeActionButtons();
  document.body.querySelector('.chat .back').style.display = 'flex';
  await action.addChat('PROSPECT', 'I have a Question', { action: 'QUESTION' });
  await action.askQuestionToBot('I have a Question');

  view.appendMessageBox(async (value) => {
    const convId = await action.addChat('PROSPECT', value);
    await action.askQuestionToBot(value, () => {}, convId);
  });
};

export default runChatBot;
