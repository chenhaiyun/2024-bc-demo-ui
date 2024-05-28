import {
  Button,
  Form,
  FormField,
  Select,
  SelectProps,
  SpaceBetween,
  StatusIndicator,
  StatusIndicatorProps,
} from "@cloudscape-design/components";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  API_URL,
  CURRENT_GAME_WORDS,
  WEBSOCKET_URL,
} from "src/assets/ts/utils";
import { ToastContainer, toast } from "react-toastify";
import { GameStatus, GameWordsType } from "src/assets/ts/types";
import useWebSocket, { ReadyState } from "react-use-websocket";

const Settings: React.FC = () => {
  const [loadingWords, setLoadingWords] = useState(false);
  // const [loadingStart, setLoadingStart] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingPause, setLoadingPause] = useState(false);
  const [loadingContinue, setLoadingContinue] = useState(false);
  const [currentOption, setCurrentOption] = useState<SelectProps.Option | null>(
    JSON.parse(localStorage.getItem(CURRENT_GAME_WORDS) ?? "null")
  );
  const [gameOptions, setGameOptions] = useState<SelectProps.Option[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const { lastMessage, readyState, sendMessage } = useWebSocket(
    `${WEBSOCKET_URL}/game/ws/controller`,
    {
      onOpen: () => console.log("opened"),
      //Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: () => true,
    }
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "loading",
    [ReadyState.OPEN]: "success",
    [ReadyState.CLOSING]: "closing",
    [ReadyState.CLOSED]: "error",
    [ReadyState.UNINSTANTIATED]: "pending",
  }[readyState];

  useEffect(() => {
    console.info("lastMessage:", lastMessage);
  }, [lastMessage]);

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startGame = async () => {
    if (!currentOption) {
      setErrorMessage("请选择游戏关键词");
      return;
    }
    // setLoadingStart(true);
    const payload = {
      common_word: currentOption.label?.trim(),
      undercover_word: currentOption?.description?.split(":")[1]?.trim(),
      is_about_chinaware: true,
      prefer_words: currentOption.tags,
    };
    axios
      .post(`${API_URL}/game/begin`, payload)
      .then((res) => {
        toast("执行成功", {
          type: "success",
        });
        setPreferWords((currentOption?.tags as string[]) ?? []);
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
        // setLoadingStart(false);
      });
  };

  // Reset Game
  const resetGame = async () => {
    setLoadingReset(true);

    axios
      .post(`${API_URL}/game/reset`)
      .then((res) => {
        toast("执行成功", {
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
      })
      .finally(() => {
        setLoadingReset(false);
      });
  };

  // Pause Game
  const pauseGame = async () => {
    setLoadingPause(false);
    axios
      .post(`${API_URL}/game/pause`)
      .then((res) => {
        toast("暂停成功", {
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
      })
      .finally(() => {
        setLoadingPause(false);
      });
  };

  // Continue Game
  const continueGame = async () => {
    setLoadingContinue(true);
    axios
      .post(`${API_URL}/game/continue`)
      .then((res) => {
        toast("继续成功", {
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
      })
      .finally(() => {
        setLoadingContinue(false);
      });
  };

  const refreshPage = () => {
    sendMessage(
      JSON.stringify({
        agent_id: 0,
        content_type: GameStatus.Custom,
        content: GameStatus.Refresh,
      })
    );
  };

  const changeToZH = () => {
    sendMessage(
      JSON.stringify({
        agent_id: 0,
        content_type: GameStatus.Custom,
        content: GameStatus.ChangeToZH,
      })
    );
  };

  const changeToEN = () => {
    sendMessage(
      JSON.stringify({
        agent_id: 0,
        content_type: GameStatus.Custom,
        content: GameStatus.ChangeToEN,
      })
    );
  };

  const setPreferWords = (words: string[]) => {
    sendMessage(
      JSON.stringify({
        agent_id: 0,
        content_type: GameStatus.SetPreferWords,
        content: words.toString(),
      })
    );
  };

  useEffect(() => {
    getWords();
  }, []);

  return (
    <div
      style={{
        width: "50%",
        padding: "30px",
        margin: "20px auto",
        backgroundColor: "#fff",
      }}
    >
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              onClick={() => {
                changeToZH();
              }}
            >
              中文
            </Button>
            <Button
              onClick={() => {
                changeToEN();
              }}
            >
              英文
            </Button>
            <Button
              disabled={loadingWords}
              loading={loadingPause}
              onClick={() => {
                pauseGame();
              }}
            >
              暂停
            </Button>
            <Button
              disabled={loadingWords}
              loading={loadingContinue}
              onClick={() => {
                continueGame();
              }}
            >
              继续
            </Button>
            <Button
              iconName="refresh"
              disabled={loadingWords}
              onClick={() => {
                refreshPage();
              }}
            >
              刷新
            </Button>
            <Button
              disabled={loadingWords}
              loading={loadingReset}
              onClick={() => {
                resetGame();
              }}
            >
              重置
            </Button>
            {/* <Button
              disabled={loadingWords}
              loading={loadingStart}
              onClick={() => {
                startGame();
              }}
            >
              开始游戏
            </Button> */}
          </SpaceBetween>
        }
      >
        <StatusIndicator type={connectionStatus as StatusIndicatorProps.Type}>
          {connectionStatus}
        </StatusIndicator>
        <FormField
          label="游戏关键词"
          description="请选择游戏关键词"
          errorText={errorMessage}
        >
          <div className="flex gap-10">
            <div className="flex-1">
              <Select
                statusType={loadingWords ? "loading" : "finished"}
                placeholder="请选择游戏关键词"
                options={gameOptions}
                selectedOption={currentOption}
                onChange={({ detail }) => {
                  setErrorMessage("");
                  setCurrentOption(detail.selectedOption);
                  localStorage.setItem(
                    CURRENT_GAME_WORDS,
                    JSON.stringify(detail.selectedOption)
                  );
                }}
              />
            </div>
            <Button
              onClick={getWords}
              loading={loadingWords}
              iconName="refresh"
            />
          </div>
        </FormField>
      </Form>
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

export default Settings;
