import React from 'react';

type Props = {
  message: string;
  formatMessage: (message: string) => React.ReactNode;
};

const AIMessage: React.FC<Props> = ({ message, formatMessage }) => {
  return (
    <li className="flex justify-start">
      <div className="relative max-w-xl rounded-xl px-4 py-2 bg-gray-50 text-gray-700 shadow-md">
        <span className="block" style={{ whiteSpace: 'pre-wrap' }}>{message}</span>
      </div>
    </li>
  );
}

export default AIMessage;
