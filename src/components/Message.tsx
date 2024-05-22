import React, { useEffect, useRef } from "react";

interface MessageDisplayProps {
  message: string;
}
const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [message]);

  return (
    <div className="message-list">
      <div>{message}</div>
      <div ref={messageEndRef} />
    </div>
  );
};

export default MessageDisplay;
