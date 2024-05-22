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
  GameReset = 'GameReset',
  Custom = 'Custom',
}
export enum GameRole {
  Undercover = "Undercover",
  Civilian = "Civilian",
}

// for game end
export interface ContentEndType {
  Status: string;
  CommonWord: string;
  UndercoverWord: string;
  UndercoverPlayerId: string;
  UndercoverActive: string;
}

// for Turn Vote End
export interface VoteType {
  TurnNumber: number;
  OutAgentId: number;
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
