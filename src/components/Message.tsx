import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message}</ReactMarkdown>
      <div ref={messageEndRef} />
    </div>
  );
};

export default MessageDisplay;
