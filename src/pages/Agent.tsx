import {
  SelectProps,
  Spinner,
  StatusIndicator,
  StatusIndicatorProps,
} from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
  ContentEndType,
  GameStatus,
  MessageType,
  VoteType,
} from "src/assets/ts/types";
import {
  API_URL,
  CURRENT_GAME_WORDS,
  WEBSOCKET_URL,
} from "src/assets/ts/utils";
import QR_CODE from "src/assets/qrcode.png";
import Countdown, { CountdownRenderProps } from "react-countdown";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import useKeyPress from "src/hooks/useKeypress";
import MessageDisplay from "src/components/Message";

const Agent: React.FC = () => {
  const { id } = useParams();
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [speakMessage, setSpeakMessage] = useState("");
  const { lastMessage, readyState } = useWebSocket(
    `${WEBSOCKET_URL}/game/ws/${id}`,
    {
      onOpen: () => console.log("opened"),
      //Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: () => true,
    }
  );
  const [showChooseFact, setShowChooseFact] = useState(false);
  const [showReadyVote, setShowReadyVote] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [roundNumber, setRoundNumber] = useState(1);
  const [showSpeakMarker, setShowSpeakMarker] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [outPlayers, setOutPlayers] = useState<string[]>([]);
  const [showUnderCoverMarker, setShowUnderCoverMarker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [preferWords, setPreferWords] = useState<string[]>([]);
  const [loadingSetPrefer, setLoadingSetPrefer] = useState(false);
  const [commonWords, setCommonWords] = useState("");
  const [underCoverWords, setUnderCoverWords] = useState("");

  // Below is keyboard control
  const escapePressed = useKeyPress("Escape");
  const enterPressed = useKeyPress("Enter");
  const rPressed = useKeyPress("r");
  const pPressed = useKeyPress("p");
  const num1Pressed = useKeyPress("1");
  const num2Pressed = useKeyPress("2");
  const num3Pressed = useKeyPress("3");

  // Reset Game
  const resetGame = async () => {
    axios
      .post(`${API_URL}/game/reset`)
      .then((res) => {
        toast("重置成功", {
          type: "success",
        });
        console.log(res);
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast(error.message, { type: "error" });
        } else {
          toast(error, { type: "error" });
        }
      });
  };

  // Pause Game
  const pauseGame = async () => {
    axios
      .post(`${API_URL}/game/pause`)
      .then((res) => {
        toast("暂停", {
          type: "success",
        });
        console.log(res);
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast(error.message, { type: "error" });
        } else {
          toast(error, { type: "error" });
        }
      });
  };

  // Continue Game
  const continueGame = async () => {
    axios
      .post(`${API_URL}/game/continue`)
      .then((res) => {
        toast("继续", {
          type: "success",
        });
        console.log(res);
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast(error.message, { type: "error" });
        } else {
          toast(error, { type: "error" });
        }
      });
  };

  useEffect(() => {
    console.info("escapePressed:", escapePressed);
    if (escapePressed) {
      resetGame();
    }
  }, [escapePressed]);

  useEffect(() => {
    console.info("enterPressed:", enterPressed);
  }, [enterPressed]);

  useEffect(() => {
    console.info("rPressed:", rPressed);
    if (rPressed) {
      continueGame();
    }
  }, [rPressed]);

  useEffect(() => {
    console.info("pPressed:", pPressed);
    if (pPressed) {
      pauseGame();
    }
  }, [pPressed]);

  useEffect(() => {
    console.info("num1Pressed:", num1Pressed);
    if (num1Pressed && currentStatus === GameStatus.AgentSpeakChoose) {
      setAgent2PreferWord(preferWords[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [num1Pressed]);

  useEffect(() => {
    console.info("num2Pressed:", num2Pressed);
    if (num2Pressed && currentStatus === GameStatus.AgentSpeakChoose) {
      setAgent2PreferWord(preferWords[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [num2Pressed]);

  useEffect(() => {
    console.info("num3Pressed:", num3Pressed);
    if (num3Pressed && currentStatus === GameStatus.AgentSpeakChoose) {
      setAgent2PreferWord(preferWords[2]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [num3Pressed]);

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
    axios
      .post(`${API_URL}/game/second-agent-prefer-words?prefer_words_in=${word}`)
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
    if (lastMessage) {
      try {
        const message: MessageType = JSON.parse(lastMessage?.data ?? "");
        setCurrentStatus(message.content_type);

        console.info("message.content_type:", message);
        // Reset Game
        if (message.content_type === GameStatus.Custom) {
          const content: MessageType = JSON.parse(message.content);
          if (content.content === GameStatus.Refresh) {
            window.location.reload();
          }
        }

        // Reset Game
        if (message.content_type === GameStatus.GameReset) {
          window.location.reload();
        }

        // Game Begin
        if (message.content_type === GameStatus.GameBegin) {
          setThinkingMessage("");
          setSpeakMessage("");
          setShowChooseFact(false);
          setShowReadyVote(false);
          setCurrentStatus(GameStatus.GameBegin);
          setShowSpeakMarker(true);
          setGameStarted(true);
          setShowSuccess(false);
          setShowUnderCoverMarker(false);
          setRoundNumber(1);
          setMessageContent("");
          setShowResult(false);
          setResultMessage("");
          setOutPlayers([]);
        }

        // Agent Thinking
        if (message.content_type === GameStatus.AgentSpeakThinking) {
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
            message.agent_id?.toString() === "2" &&
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
          setThinkingMessage("");
          setSpeakMessage("");
          setRoundNumber((prev) => prev + 1);
          if (message.content) {
            const voteData: VoteType = message.content as unknown as VoteType;
            // setIsOut(voteData.OutAgentId.toString() === id?.toString());
            setOutPlayers((prev) => {
              return [...prev, voteData.OutAgentId.toString()];
            });
          }
        }

        // Game End / Undercover Found
        if (message.content_type === GameStatus.GameEnd) {
          toast("游戏结束", { type: "success" });
          // set show success message

          if (message.content) {
            const resultData: ContentEndType =
              message.content as unknown as ContentEndType;
            setShowResult(true);
            // set result message
            setResultMessage(resultData.Status);
            // set success content
            setMessageContent(resultData.Status);
            setCommonWords(resultData.CommonWord);
            setUnderCoverWords(resultData.UndercoverWord);
            if (!outPlayers.includes((id ?? 0).toString())) {
              setShowSuccess(true);
            }
            if (resultData.UndercoverPlayerId.toString() === id?.toString()) {
              setShowUnderCoverMarker(true);
            } else {
              setShowUnderCoverMarker(false);
            }
          }
        }
      } catch (error) {
        console.info(error);
      }
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

  const showResultComp = () => {
    if (showResult) {
      return (
        <>
          <div style={{ fontSize: 24 }}>{resultMessage}</div>
          <div className="game-thinking-header">
            {showUnderCoverMarker ? underCoverWords : commonWords}
          </div>
          <img alt="scan code" width="150" src={QR_CODE} />
        </>
      );
    } else {
      return <></>;
    }
  };

  return (
    <div
      className={`agent-container agent-${id}`}
      style={{ backgroundImage: "url('/agent" + id + ".webp')" }}
    >
      {showSpeakMarker && (
        <div className="dark-bg">
          <div className="game-thinking-header">
            {gameStarted ? "思考中..." : "已分配关键词，游戏即将开始"}
          </div>
          {showResultComp()}
        </div>
      )}
      {showSuccess && (
        <div className="dark-bg">
          <div className="game-thinking-header">{messageContent}</div>
          {showResultComp()}
        </div>
      )}
      {outPlayers.includes((id ?? 0)?.toString()) && !showUnderCoverMarker && (
        <div className="dark-bg dark">
          <div className="out-marker">出局</div>
          {showResultComp()}
        </div>
      )}
      {showUnderCoverMarker && (
        <div className="dark-bg dark">
          <div className="under-cover-marker">卧底</div>
          {showResultComp()}
        </div>
      )}

      {showChooseFact && (
        <div className="dark-bg">
          <div className="game-thinking-header">请为智能体选择思考方向</div>

          <div className="flex gap-20">
            {preferWords.map((word, index) => {
              return (
                <div
                  role="none"
                  key={index}
                  className="content-choose-box"
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

      {!outPlayers.includes((id ?? 0).toString()) && showReadyVote && (
        <div className="dark-bg">
          <div className="game-thinking-header">
            第 {roundNumber} 发言轮结束， 准备投票
          </div>
        </div>
      )}
      <div className="game-content">
        <div className="game-header">
          <div className="flex">
            <div className="aws-logo"></div>
            <div className="ym-logo"></div>
          </div>
          <div>
            <StatusIndicator
              type={connectionStatus as StatusIndicatorProps.Type}
            >
              {connectionStatus} / 轮次: {roundNumber} / ({currentStatus})
            </StatusIndicator>
          </div>
        </div>
        <div className="content-inner">
          <div className="game-agent-thinking">
            <div className="game-thinking-header">智能体 {id} 思考...</div>
            <div className="content-box thinking">
              {thinkingMessage ? (
                <MessageDisplay message={thinkingMessage} />
              ) : (
                "正在思考..."
              )}
            </div>
          </div>
          <div className="game-agent-statement">
            <div className="game-statement-header">智能体 {id} 说:</div>
            <div className="content-box statement">
              {speakMessage || "等待发言..."}
            </div>
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
