import {
  SelectProps,
  Spinner,
  StatusIndicator,
  StatusIndicatorProps,
} from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { GameStatus, MessageType } from "src/assets/ts/types";
import {
  API_URL,
  CURRENT_GAME_WORDS,
  WEBSOCKET_URL,
} from "src/assets/ts/utils";
import QR_CODE from "src/assets/qrcode.png";
import Countdown, { CountdownRenderProps } from "react-countdown";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const Agent: React.FC = () => {
  const { id } = useParams();
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [speakMessage, setSpeakMessage] = useState("");
  const { lastMessage, readyState } = useWebSocket(
    `${WEBSOCKET_URL}/game/ws/${id}`
  );
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
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [preferWords, setPreferWords] = useState<string[]>([]);
  const [loadingSetPrefer, setLoadingSetPrefer] = useState(false);

  const renderer = ({ seconds, completed }: CountdownRenderProps) => {
    if (completed) {
      setShowChooseFact(false);
      // Render a completed state
      return <></>;
    } else {
      // Render a countdown
      return (
        <div className="game-thinking-header">
          00:{seconds > 9 ? seconds : `0${seconds}`} 秒后将随机选择
        </div>
      );
    }
  };

  // Start Game
  const setAgent2PreferWord = (word: string) => {
    setLoadingSetPrefer(true);
    const payload = {
      prefer_words_in: word,
    };
    axios
      .post(`${API_URL}/game/second-agent-prefer-words`, payload)
      .then((res) => {
        console.log(res);
        setShowChooseFact(false);
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast(error.message, { type: "error" });
        } else {
          toast(error, { type: "error" });
        }
      })
      .finally(() => {
        setLoadingSetPrefer(false);
      });
  };

  useEffect(() => {
    const words = localStorage.getItem(CURRENT_GAME_WORDS);
    if (words) {
      const data: SelectProps.Option = JSON.parse(words);
      setPreferWords((data.tags as string[]) ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorage.getItem(CURRENT_GAME_WORDS)]);

  useEffect(() => {
    try {
      const message: MessageType = JSON.parse(lastMessage?.data ?? "");
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
        if (
          message.agent_id &&
          id?.toString() === message.agent_id.toString()
        ) {
          setShowSpeakMarker(false);
          setThinkingMessage((prev) => {
            return prev + message.content;
          });
        }
      }

      // Agent Speak
      if (message.content_type === GameStatus.AgentSpeak) {
        if (
          message.agent_id &&
          id?.toString() === message.agent_id.toString()
        ) {
          setSpeakMessage((prev) => {
            return prev + message.content;
          });
        }
      }

      // Agent Speak choose
      if (message.content_type === GameStatus.AgentSpeakChoose) {
        if (
          message.agent_id &&
          id?.toString() === message.agent_id.toString()
        ) {
          setShowSpeakMarker(false);
          setShowChooseFact(true);
        }
      }

      // Agent Turn Speak end
      if (message.content_type === GameStatus.TurnSpeakEnd) {
        setShowSpeakMarker(false);
        setShowChooseFact(false);
        setShowReadyVote(true);
        setThinkingMessage("");
        setSpeakMessage("");
        setRoundNumber((prev) => prev + 1);
      }

      // Agent Vote Thinking
      if (message.content_type === GameStatus.AgentVoteThinking) {
        if (
          message.agent_id &&
          id?.toString() === message.agent_id.toString()
        ) {
          setShowReadyVote(false);
          setShowSpeakMarker(false);
          setThinkingMessage((prev) => {
            return prev + message.content;
          });
        }
      }

      // Agent Vote
      if (
        message.agent_id &&
        id?.toString() === message.agent_id.toString() &&
        message.content_type === GameStatus.AgentVote
      ) {
        setSpeakMessage((prev) => {
          return prev + message.content;
        });
      }

      // Agent Vote End
      if (message.content_type === GameStatus.TurnVoteEnd) {
        // setShowSpeakMarker(false);
        // setShowMessage(true);
        // setMessageContent(message.content);
        // if (id?.toString() === message.agent_id.toString()) {
        //   setShowMessage(false);
        //   if (message.voteUnderCover === message.trueUnderCover) {
        //     setShowUnderCoverMarker(true);
        //   } else {
        //     setOutAgentNumbers((prev) => [...prev, message.agent_id]);
        //     setShowOutMarker(true);
        //   }
        // }
      }

      // Undercover Found
      if (message.content_type === GameStatus.GameEnd) {
        // setShowResult(true);
        // if (id?.toString() === message.trueUnderCover.toString()) {
        //   setResultMessage("青花瓷");
        // } else {
        //   setResultMessage("白瓷");
        // }
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
          {showResult && (
            <>
              <div className="game-thinking-header">{resultMessage}</div>
              <img alt="scan code" width="40%" src={QR_CODE} />
            </>
          )}
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
          {showResult && (
            <>
              <div className="game-thinking-header">{resultMessage}</div>
              <img alt="scan code" width="40%" src={QR_CODE} />
            </>
          )}
        </div>
      )}
      {showUnderCoverMarker && (
        <div className="dark-bg">
          <div className="under-cover-marker">卧底</div>
          {showResult && (
            <>
              <div className="game-thinking-header">{resultMessage}</div>
              <img alt="scan code" width="40%" src={QR_CODE} />
            </>
          )}
        </div>
      )}

      {showChooseFact && (
        <div className="dark-bg">
          <div className="game-thinking-header">请为 Agent 选择思考方向</div>

          <div className="flex gap-10">
            {preferWords.map((word, index) => {
              return (
                <div
                  role="none"
                  key={index}
                  className="content-box"
                  onClick={() => {
                    setAgent2PreferWord(word);
                  }}
                >
                  {loadingSetPrefer && <Spinner />}
                  <div className="choose-fact">{word}</div>
                </div>
              );
            })}
          </div>
          <Countdown date={Date.now() + 15000} renderer={renderer} />
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
          <div
            style={{ position: "fixed", zIndex: 99, left: "10px", top: "10px" }}
          >
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
      <ToastContainer
        position="top-center"
        hideProgressBar={true}
        newestOnTop={true}
        autoClose={2000}
        theme="colored"
      />
    </div>
  );
};

export default Agent;
