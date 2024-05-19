export enum GameStatus {
  GameBegin = "GameBegin",
  TurnSpeakBegin = "TurnSpeakBegin",
  AgentSpeakBegin = "AgentSpeakBegin",
  AgentSpeakThinking = "AgentSpeakThinking", // single agent
  AgentSpeak = "AgentSpeak", // single agent
  AgentSpeakEnd = "AgentSpeakEnd",
  AgentSpeakChoose = "AgentSpeakChoose", // single agent for agent 2
  TurnSpeakEnd = "TurnSpeakEnd",
  TurnVoteBegin = "TurnVoteBegin",
  AgentVoteBegin = "AgentVoteBegin",
  AgentVoteThinking = "AgentVoteThinking", // single agent
  AgentVote = "AgentVote", // single agent
  AgentVoteEnd = "AgentVoteEnd",
  TurnVoteEnd = "TurnVoteEnd",
  GameEnd = "GameEnd",
}
export enum GameRole {
  Undercover = "Undercover",
  Civilian = "Civilian",
}

export interface MessageType {
  agent_id: number;
  content_type: string;
  content: string;
  voteUnderCover: number;
  trueUnderCover: number;
}

export interface GameWordsType {
  undercover_word: string;
  common_word: string;
  prefer_words: string[];
}
