import {
  SelectProps,
  StatusIndicator,
  StatusIndicatorProps,
} from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
  ContentEndType,
  GameStatus,
  GameWordsType,
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
import { GridLoader } from "react-spinners";
import { useTranslation } from "react-i18next";

const NOT_SHOW_MESSAGES: string[] = [
  "**Thinking:**",
  "**Speak:**",
  "**VoteThinking:**",
  "**Vote:**",
];

const VOICE_LIST = [
  "ruoxi",
  "xiaogang",
  "sicheng",
  "aida",
  "sitong",
  "aicheng",
];

const ORDER_NUM = ["A", "B", "C"];

const Agent: React.FC = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
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
  const [showSpeakMarker, setShowSpeakMarker] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [outPlayers, setOutPlayers] = useState<string[]>([]);
  const [showUnderCoverMarker, setShowUnderCoverMarker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [preferWords, setPreferWords] = useState<string[]>([]);
  const [loadingSetPrefer, setLoadingSetPrefer] = useState(false);
  const [commonWords, setCommonWords] = useState("");
  const [underCoverWords, setUnderCoverWords] = useState("");
  const [loadingWords, setLoadingWords] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [gameOptions, setGameOptions] = useState<SelectProps.Option[]>([]);
  const [currentSelect, setCurrentSelect] = useState(-1);
  const [showMyWord, setShowMyWord] = useState(false);
  const [myWord, setMyWord] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const [audioBlob, setAudioBlob] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [audioSrc, setAudioSrc] = useState<any>("");

  const controller = new AbortController();
  const signal = controller.signal;

  // Below is keyboard control
  const escapePressed = useKeyPress("Escape");
  const enterPressed = useKeyPress("Enter");
  const rPressed = useKeyPress("r");
  const pPressed = useKeyPress("p");
  const num1Pressed = useKeyPress("1");
  const num2Pressed = useKeyPress("2");
  const num3Pressed = useKeyPress("3");

  // Change Language Key
  const ePressed = useKeyPress("e");
  const cPressed = useKeyPress("c");

  // Change language
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Get China Game Words
  const getWords = () => {
    setLoadingWords(true);
    axios
      .get(`${API_URL}/game/china-ware-words`)
      .then((result) => {
        console.log(result);
        const wordList: GameWordsType[] = result.data;
        setGameOptions(
          wordList.map((word) => ({
            label: word.common_word,
            description: `卧底词:${word.undercover_word}`,
            value: word.common_word,
            tags: word.prefer_words,
          }))
        );
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast(error.message, {
            type: "error",
          });
        } else {
          toast(error, { type: "error" });
        }
      })
      .finally(() => {
        setLoadingWords(false);
      });
  };

  // Start Game
  const startGame = async (isFirst = false) => {
    setLoadingStart(true);
    if (gameOptions.length <= 0) {
      toast(t("waitKeyWords"), { type: "error" });
      return;
    }
    const randomNumber = Math.floor(Math.random() * gameOptions.length);
    const currentOption = JSON.parse(JSON.stringify(gameOptions[randomNumber]));
    setPreferWords(currentOption.tags ?? []);
    const payload = {
      common_word: currentOption.label?.trim(),
      undercover_word: currentOption?.description?.split(":")[1]?.trim(),
      is_about_chinaware: true,
      prefer_words: currentOption.tags,
    };
    axios
      .post(`${API_URL}/game/begin`, payload)
      .then((res) => {
        if (isFirst) {
          toast(t("gameStarted"), {
            type: "success",
          });
        }
        console.log(res);
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast(error.message, { type: "error" });
        } else {
          toast(error, { type: "error" });
        }
      })
      .finally(() => {
        setLoadingStart(false);
      });
  };

  // Reset Game
  const resetGame = async () => {
    axios
      .post(`${API_URL}/game/reset`)
      .then((res) => {
        toast(t("resetSuccess"), {
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
        toast(t("pause"), {
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
        toast(t("continue"), {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escapePressed]);

  useEffect(() => {
    console.info("enterPressed:", enterPressed);
    if (enterPressed) {
      startGame(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterPressed]);

  useEffect(() => {
    console.info("rPressed:", rPressed);
    if (rPressed) {
      continueGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rPressed]);

  useEffect(() => {
    console.info("pPressed:", pPressed);
    if (pPressed) {
      pauseGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pPressed]);

  useEffect(() => {
    console.info("num1Pressed:", num1Pressed);
    if (num1Pressed && currentStatus === GameStatus.AgentSpeakChoose) {
      setAgent2PreferWord(preferWords[0]);
      setCurrentSelect(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [num1Pressed]);

  useEffect(() => {
    console.info("num2Pressed:", num2Pressed);
    if (num2Pressed && currentStatus === GameStatus.AgentSpeakChoose) {
      setAgent2PreferWord(preferWords[1]);
      setCurrentSelect(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [num2Pressed]);

  useEffect(() => {
    console.info("num3Pressed:", num3Pressed);
    if (num3Pressed && currentStatus === GameStatus.AgentSpeakChoose) {
      setAgent2PreferWord(preferWords[2]);
      setCurrentSelect(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [num3Pressed]);

  // change to English
  useEffect(() => {
    console.info("ePressed:", ePressed);
    if (ePressed) {
      changeLanguage("en");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ePressed]);

  // change to Chinese
  useEffect(() => {
    console.info("cPressed:", cPressed);
    if (cPressed) {
      changeLanguage("zh");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cPressed]);

  const renderer = ({ seconds, completed }: CountdownRenderProps) => {
    if (completed) {
      setShowChooseFact(false);
      // Render a completed state
      return <></>;
    } else {
      // Render a countdown
      return (
        <div className="game-thinking-header">
          00:{seconds > 9 ? seconds : `0${seconds}`}
          {t("secondsAutoSelect")}
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

        if (NOT_SHOW_MESSAGES.includes(message.content)) {
          message.content = "";
        }

        console.info("message.content_type:", message);
        // Reset Game
        if (message.content_type === GameStatus.Custom) {
          const content: MessageType = JSON.parse(message.content);
          if (content.content === GameStatus.Refresh) {
            window.location.reload();
          }
          if (content.content === GameStatus.ChangeToZH) {
            changeLanguage("zh");
          }
          if (content.content === GameStatus.ChangeToEN) {
            changeLanguage("en");
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
          setOutPlayers([]);
          setShowMyWord(false);
          setMyWord("");
        }

        // Agent Thinking
        if (message.content_type === GameStatus.AgentSpeakThinking) {
          setShowChooseFact(false);
          setCurrentSelect(-1);
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

        // My Word
        if (message.content_type === GameStatus.MyWord) {
          setShowMyWord(true);
          setMyWord(message.content);
        }

        // Agent Speak
        if (message.content_type === GameStatus.AgentSpeak) {
          if (
            message.agent_id &&
            id?.toString() === message.agent_id.toString()
          ) {
            getTTSByTxt(message.content, () => {
              // setSpeakMessage(message.content);
              setSpeakMessage((prev) => {
                return prev + message.content;
              });
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

        // Agent Turn Vote Start
        if (
          message.agent_id &&
          id?.toString() === message.agent_id.toString() &&
          message.content_type === GameStatus.TurnVoteBegin
        ) {
          setSpeakMessage(t("voteTo"));
        }

        // Agent Vote
        if (
          message.agent_id &&
          id?.toString() === message.agent_id.toString() &&
          message.content_type === GameStatus.AgentVote
        ) {
          getTTSByTxt("投票给" + message.content, () => {
            // setSpeakMessage(message.content);
            setSpeakMessage((prev) => {
              return prev + message.content;
            });
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
          toast(t("gameEnd"), { type: "success" });
          // set show success message

          if (message.content) {
            const resultData: ContentEndType =
              message.content as unknown as ContentEndType;
            setShowResult(true);
            // set success content
            const resultTxt = resultData.Status.replace("Player", t("Player"));
            setMessageContent(resultTxt);
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

          // set time out to start game
          setTimeout(() => {
            startGame();
          }, 10000);
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

  useEffect(() => {
    getWords();
  }, []);

  const showResultComp = () => {
    if (showResult) {
      return (
        <>
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

  useEffect(() => {
    const playAudio = () => {
      if (audioSrc) {
        const audio = new Audio(audioSrc);
        audio.play();
      }
    };

    // 在页面加载后自动播放音频
    playAudio();
  }, [audioSrc]);

  const getTTSByTxt = async (text: string, callback: () => void) => {
    try {
      const postData = {
        appkey: process.env.TTS_APP_KEY,
        text: text.replace("_", ""),
        token: process.env.TTS_APP_TOKEN,
        format: "wav",
        voice: VOICE_LIST[parseInt(id ?? "") - 1],
      };
      const response = await fetch(`/tts`, {
        signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json", // 根据需要设置请求头
        },
        body: JSON.stringify(postData), // 将参数转换为 JSON 字符串
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const audioSrc = URL.createObjectURL(blob);
      setAudioSrc(audioSrc);
      if (callback) {
        callback();
      }
    } catch (error) {
      // handle error
      callback();
      console.info(error);
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
            {gameStarted ? (
              <GridLoader size={50} color="rgba(255,255,255,0.9)" />
            ) : (
              t("clickToStartGame")
            )}
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
          <div className="out-marker">{t("out")}</div>
          {showResultComp()}
        </div>
      )}
      {showUnderCoverMarker && (
        <div className="dark-bg dark">
          <div className="under-cover-marker">{t("underCover")}</div>
          {showResultComp()}
        </div>
      )}

      {showChooseFact && (
        <div className="dark-bg">
          <div className="game-thinking-header">{t("selectDirection")}</div>

          <div className="flex gap-20">
            {preferWords.map((word, index) => {
              return (
                <div
                  role="none"
                  key={index}
                  className={`${
                    index === currentSelect
                      ? "content-choose-box  active"
                      : "content-choose-box"
                  }`}
                  onClick={() => {
                    setAgent2PreferWord(word);
                  }}
                >
                  <div className="choose-order">{ORDER_NUM[index]}</div>
                  <div className="choose-fact">
                    {/* {loadingSetPrefer && <Spinner />} */}
                    {word}
                  </div>
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
            {t("the")} {roundNumber} {t("waitingVote")}
          </div>
        </div>
      )}
      <div className="game-content">
        <div className="game-header">
          <div className="fixed-status">
            <StatusIndicator
              type={connectionStatus as StatusIndicatorProps.Type}
            ></StatusIndicator>
          </div>
          <div className="flex">
            <div className="aws-logo"></div>
            <div className="ym-logo"></div>
          </div>
          <div className="flex gap-10">
            {loadingStart && (
              <StatusIndicator type="loading">开</StatusIndicator>
            )}
            {loadingWords && (
              <StatusIndicator type="loading">词</StatusIndicator>
            )}
            {loadingSetPrefer && (
              <StatusIndicator type="loading">方</StatusIndicator>
            )}
            <div>
              {t("round")} {roundNumber} / ({currentStatus})
            </div>
          </div>
        </div>
        <div className="content-inner">
          <div className="game-agent-thinking">
            <div className="game-thinking-header">
              {showMyWord && myWord && <span>[{myWord}]</span>}
              {t("agent")} {id} {t("think")}
            </div>
            <div className="content-box thinking">
              {thinkingMessage ? (
                <MessageDisplay message={thinkingMessage} />
              ) : (
                t("thinking")
              )}
            </div>
          </div>
          <div className="game-agent-statement">
            <div className="game-statement-header">
              {t("agent")} {id} {t("say")}
            </div>
            <div className="content-box statement">
              {speakMessage || t("waitSaying")}
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
      <div style={{ position: "fixed", left: -99990, top: -999999 }}>
        <audio controls autoPlay>
          <source src={audioSrc} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default Agent;
