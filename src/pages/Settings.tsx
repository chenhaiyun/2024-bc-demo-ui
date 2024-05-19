import {
  Button,
  Form,
  FormField,
  Select,
  SelectProps,
  SpaceBetween,
} from "@cloudscape-design/components";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL, CURRENT_GAME_WORDS } from "src/assets/ts/utils";
import { ToastContainer, toast } from "react-toastify";
import { GameWordsType } from "src/assets/ts/types";

const Settings: React.FC = () => {
  const [loadingWords, setLoadingWords] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [currentOption, setCurrentOption] = useState<SelectProps.Option | null>(
    JSON.parse(localStorage.getItem(CURRENT_GAME_WORDS) ?? "null")
  );
  const [gameOptions, setGameOptions] = useState<SelectProps.Option[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

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
            description: `卧底词: ${word.undercover_word}`,
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
  const startGame = () => {
    if (!currentOption) {
      setErrorMessage("请选择游戏关键词");
      return;
    }
    setLoadingStart(true);
    const payload = {
      common_word: currentOption.label,
      undercover_word: currentOption?.description?.split(":")[1],
      is_about_chinaware: true,
      prefer_words: currentOption.tags,
    };
    axios
      .post(`${API_URL}/game/begin`, payload)
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
        setLoadingStart(false);
      });
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
              disabled={loadingWords}
              loading={loadingStart}
              onClick={() => {
                startGame();
              }}
            >
              开始游戏
            </Button>
          </SpaceBetween>
        }
      >
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
