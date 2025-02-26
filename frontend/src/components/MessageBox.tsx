import React from 'react';
import AIMessage from './_AIMessage';
import UserMessage from './_UserMessage';
import SystemMessage from './_SystemMessage';
import ServerMessage from './_ServerMessage';
import SourcesMessage from './_SourcesMessage';
import type { History } from '../types';

type Props = {
  history: History;
};

const MessageBox: React.FC<Props> = ({ history }) => {
  const formatMessage = (message: string): React.ReactNode => {
    return message.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="relative h-[40rem] w-full overflow-y-auto p-6">
      <ul className="space-y-2">
        {history.map((message, ind) => {
          const msg = message.message;
          const keyVal = msg + ind.toString();
          if (message.sender === 'system') {
            return (
              <SystemMessage message={msg} formatMessage={formatMessage} key={keyVal} />
            );
          } else if (message.sender === 'ai') {
            return (
              <AIMessage message={msg} formatMessage={formatMessage} key={keyVal} />
            );
          } else if (message.sender === 'user') {
            return (
              <UserMessage message={msg} formatMessage={formatMessage} key={keyVal} />
            );
          } else if (message.sender === 'server') {
            return (
              <ServerMessage message={msg} formatMessage={formatMessage} key={keyVal} />
            );
          } else if (message.sender === 'sources') {
            return (
              <SourcesMessage message={msg} formatMessage={formatMessage} key={keyVal} />
            );
          }
        })}
      </ul>
    </div>
  );
};

export default MessageBox;
