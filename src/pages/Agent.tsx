import {
  StatusIndicator,
  StatusIndicatorProps,
} from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { GameStatus, MessageType } from "src/assets/ts/types";
import { WEBSOCKET_URL } from "src/assets/ts/utils";

const Agent: React.FC = () => {
  const { id } = useParams();
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [speakMessage, setSpeakMessage] = useState("");
  const { lastMessage, readyState } = useWebSocket(WEBSOCKET_URL);
  const [showChooseFact, setShowChooseFact] = useState(false);
  const [showReadyVote, setShowReadyVote] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [roundNumber, setRoundNumber] = useState(0);
  const [showSpeakMarker, setShowSpeakMarker] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [outAgentNumbers, setOutAgentNumbers] = useState<number[]>([]);
  const [showOutMarker, setShowOutMarker] = useState(false);
  const [showUnderCoverMarker, setShowUnderCoverMarker] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => {
    try {
      const message: MessageType = JSON.parse(lastMessage?.data || "");
      setCurrentStatus(message.content_type);

      // Start Game
      if (
        message.agent_id === 0 &&
        message.content_type === GameStatus.GameBegin
      ) {
        window.location.reload();
      }

      // Agent Thinking
      if (message.content_type === GameStatus.AgentSpeakThinking) {
        if (outAgentNumbers.includes(message.agent_id)) {
          return;
        } else {
          setShowMessage(false);
        }
        setGameStarted(true);
        setShowSpeakMarker(true);

        if (
          message.agent_id &&
          id?.toString() === message.agent_id.toString()
        ) {
          setShowSpeakMarker(false);
          setThinkingMessage(message.content);
        }
      }

      // Agent Speak
      if (message.content_type === GameStatus.AgentSpeak) {
        if (
          message.agent_id &&
          id?.toString() === message.agent_id.toString()
        ) {
          setSpeakMessage(message.content);
        }
      }

      // Agent Speak choose
      if (message.content_type === GameStatus.AgentSpeakChoose) {
        setShowSpeakMarker(true);
        if (
          message.agent_id &&
          id?.toString() === message.agent_id.toString()
        ) {
          setShowSpeakMarker(false);
          setShowChooseFact(true);
        }
      }

      // Agent Speak end
      if (
        message.agent_id &&
        message.content_type === GameStatus.AgentSpeakEnd
      ) {
        setShowSpeakMarker(false);
        setShowChooseFact(false);
        setShowReadyVote(true);
        setThinkingMessage("");
        setSpeakMessage("");
        setRoundNumber((prev) => prev + 1);
      }

      // Agent Vote Thinking
      if (message.content_type === GameStatus.AgentVoteThinking) {
        setShowSpeakMarker(true);
        if (
          message.agent_id &&
          id?.toString() === message.agent_id.toString()
        ) {
          setShowReadyVote(false);
          setShowSpeakMarker(false);
          setThinkingMessage(message.content);
        }
      }

      // Agent Vote
      if (
        message.agent_id &&
        id?.toString() === message.agent_id.toString() &&
        message.content_type === GameStatus.AgentVote
      ) {
        setSpeakMessage(message.content);
      }

      // Agent Vote End
      if (message.content_type === GameStatus.TurnVoteEnd) {
        setShowSpeakMarker(false);
        setShowMessage(true);
        setMessageContent(message.content);
        if (id?.toString() === message.agent_id.toString()) {
          setShowMessage(false);
          // setShowOutMarker(true);
          if (message.voteUnderCover === message.trueUnderCover) {
            setShowUnderCoverMarker(true);
          } else {
            setOutAgentNumbers((prev) => [...prev, message.agent_id]);
            setShowOutMarker(true);
          }
        }
      }
    } catch (error) {
      console.info(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage, id]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "loading",
    [ReadyState.OPEN]: "success",
    [ReadyState.CLOSING]: "closing",
    [ReadyState.CLOSED]: "error",
    [ReadyState.UNINSTANTIATED]: "pending",
  }[readyState];

  useEffect(() => {
    console.info("currentStatus:", currentStatus);
  }, [currentStatus]);

  return (
    <div
      className="agent-container"
      style={{ backgroundImage: "url('/agent" + id + ".webp')" }}
    >
      {showSpeakMarker && (
        <div className="dark-bg">
          <div className="game-thinking-header">
            {gameStarted ? "思考中..." : "已分配关键词，游戏即将开始"}
          </div>
        </div>
      )}
      {showMessage && (
        <div className="dark-bg">
          <div className="game-thinking-header">{messageContent}</div>
        </div>
      )}
      {showOutMarker && (
        <div className="dark-bg dark">
          <div className="out-marker">出局</div>
        </div>
      )}
      {showUnderCoverMarker && (
        <div className="dark-bg">
          <div className="under-cover-marker">卧底</div>
        </div>
      )}
      {showChooseFact && (
        <div className="dark-bg">
          <div className="game-thinking-header">请为 Agent 选择思考方向</div>
          <div className="flex gap-10">
            <div
              className="content-box"
              onClick={() => {
                setShowChooseFact(false);
              }}
            >
              <div className="choose-fact">材质</div>
            </div>
            <div
              className="content-box"
              onClick={() => {
                setShowChooseFact(false);
              }}
            >
              <div className="choose-fact">色彩</div>
            </div>
            <div
              className="content-box"
              onClick={() => {
                setShowChooseFact(false);
              }}
            >
              <div className="choose-fact">时间</div>
            </div>
          </div>
        </div>
      )}

      {showReadyVote && (
        <div className="dark-bg">
          <div className="game-thinking-header">
            第 {roundNumber} 发言轮结束， 准备投票
          </div>
        </div>
      )}
      <div className="game-content">
        <div className="game-header">
          <div>
            <StatusIndicator
              type={connectionStatus as StatusIndicatorProps.Type}
            >
              {connectionStatus}
            </StatusIndicator>
          </div>
          <div>Header</div>
          <div>Settings</div>
        </div>
        <div className="game-agent-thinking">
          <div className="game-thinking-header">Agent {id} Thinking...</div>
          <div className="content-box thinking">
            {thinkingMessage || "正在思考..."}
          </div>
        </div>
        <div className="game-agent-statement">
          <div className="game-statement-header">Agent {id} says:</div>
          <div className="content-box statement">
            {speakMessage || "等待发言..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agent;
