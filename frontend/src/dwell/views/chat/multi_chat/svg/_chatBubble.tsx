import React, { FC } from 'react';

interface ChatBubbleProps {
  isActive?: boolean,
}

const ChatBubble: FC<ChatBubbleProps> = ({ isActive = false }) : JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="21"
    height="21"
  >
    <path fill="none" d="M0 0h24v24H0z" />
    <path
      fill={isActive ? '#fff' : '#4a5e8a'}
      d="M6.455 19L2 22.5V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.455zM7
          10v2h2v-2H7zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2z"
    />
  </svg>);

export default ChatBubble;
