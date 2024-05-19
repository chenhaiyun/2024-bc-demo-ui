export const WEBSOCKET_URL = "ws://localhost:8000";
export const API_URL = "http://localhost:8000";
export const CURRENT_GAME_WORDS = "summit-2024-current_game_words";

const commonChineseCharacters = ["我", "是", "谁"];
export const generateRandomChineseSentence = (length: number) => {
  let sentence = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(
      Math.random() * commonChineseCharacters.length
    );
    sentence += commonChineseCharacters[randomIndex];
  }
  return sentence;
};

export const randomNum = () => {
  return Math.floor(Math.random() * 6) + 1;
};
