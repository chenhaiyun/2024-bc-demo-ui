import {
  Box,
  Button,
  Form,
  FormField,
  Input,
  SpaceBetween,
  StatusIndicator,
  StatusIndicatorProps,
} from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";

// import { socket } from "../assets/ts/socket";
import { ReadyState, useSocketIO } from "react-use-websocket";
import { GameStatus } from "src/assets/ts/types";
import {
  generateRandomChineseSentence,
  randomNum,
  WEBSOCKET_URL,
} from "src/assets/ts/utils";

const TestSend: React.FC = () => {
  const { lastMessage, sendMessage, readyState } = useSocketIO(WEBSOCKET_URL, {
    onOpen: () => console.log("opened"),
    shouldReconnect: () => true,
  });

  const [underCoverNum, setUnderCoverNum] = useState(1);
  const [voteUnderCover, setVoteUnderCover] = useState(0);

  useEffect(() => {
    console.info("lastMessage:", lastMessage);
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "loading",
    [ReadyState.OPEN]: "success",
    [ReadyState.CLOSING]: "closing",
    [ReadyState.CLOSED]: "error",
    [ReadyState.UNINSTANTIATED]: "pending",
  }[readyState];

  // Start Game
  const startGame = () => {
    sendMessage(
      JSON.stringify({
        agent_id: 0,
        content_type: GameStatus.GameBegin,
        content: generateRandomChineseSentence(300),
      })
    );
  };

  // Agent Thinking
  const agentThinking = (agentId: number) => {
    sendMessage(
      JSON.stringify({
        agent_id: agentId,
        content_type: GameStatus.AgentSpeakThinking,
        content: generateRandomChineseSentence(300),
      })
    );
  };

  // Agent Speaking
  const agentSpeaking = (agentId: number) => {
    sendMessage(
      JSON.stringify({
        agent_id: agentId,
        content_type: GameStatus.AgentSpeak,
        content: generateRandomChineseSentence(200),
      })
    );
  };

  // Send Second choose face
  const agentChooseFace = () => {
    sendMessage(
      JSON.stringify({
        agent_id: 2,
        content_type: GameStatus.AgentSpeakChoose,
        content: "请 2 号选择方向，15秒后超时将自动选择",
      })
    );
  };

  // Send Agent Speaking End
  const agentSpeakingEnd = (agentId: number) => {
    sendMessage(
      JSON.stringify({
        agent_id: agentId,
        content_type: GameStatus.AgentSpeakEnd,
        content: "发言结束",
      })
    );
  };

  // Agent Vote Thinking
  const agentVoteThinking = (agentId: number) => {
    sendMessage(
      JSON.stringify({
        agent_id: agentId,
        content_type: GameStatus.AgentVoteThinking,
        content: generateRandomChineseSentence(200),
      })
    );
  };

  // Agent Vote
  const agentVote = (agentId: number) => {
    sendMessage(
      JSON.stringify({
        agent_id: agentId,
        content_type: GameStatus.AgentVote,
        content: `经过思考：${generateRandomChineseSentence(
          10
        )}， 我决定投票给 ${randomNum()} 号 Agent`,
      })
    );
  };

  // Agent Vote End
  const agentVoteEnd = () => {
    const underCover = randomNum();
    setVoteUnderCover(underCover);
    sendMessage(
      JSON.stringify({
        agent_id: underCover,
        content_type: GameStatus.TurnVoteEnd,
        content: `经过投票，${underCover} 号 Agent 是卧底`,
        voteUnderCover: underCover,
        trueUnderCover: underCoverNum,
      })
    );
  };

  // Find the agent who is undercover
  const findUndercover = () => {
    sendMessage(
      JSON.stringify({
        agent_id: 0,
        content_type: GameStatus.GameEnd,
        content: `卧底是 ${underCoverNum} 号 Agent`,
        voteUnderCover: voteUnderCover,
        trueUnderCover: underCoverNum,
      })
    );
  };

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
                startGame();
              }}
            >
              开始游戏
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween direction="vertical" size="s">
          <FormField label="卧底号码">
            <Input
              type="number"
              value={underCoverNum.toString()}
              onChange={(e) => setUnderCoverNum(Number(e.detail.value))}
            />
          </FormField>
          <Box variant="h2">思考过程</Box>
          {[1, 2, 3, 4, 5, 6].map((item) => {
            return (
              <FormField key={item} label={`${item} 号 Agent`}>
                <SpaceBetween direction="horizontal" size="xs">
                  {item === 2 && (
                    <Button
                      onClick={() => {
                        agentChooseFace();
                      }}
                    >
                      2 号选择方向
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      agentThinking(item);
                    }}
                  >
                    {item} 号思考
                  </Button>
                  <Button
                    onClick={() => {
                      agentSpeaking(item);
                    }}
                  >
                    {item} 号发言
                  </Button>
                </SpaceBetween>
              </FormField>
            );
          })}
          <Button
            onClick={() => {
              agentSpeakingEnd(6);
            }}
          >
            Agent 发言结束
          </Button>

          <hr />
          <Box variant="h2">投票过程</Box>
          {[1, 2, 3, 4, 5, 6].map((item) => {
            return (
              <FormField key={item} label={`${item} 号 Agent`}>
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    onClick={() => {
                      agentVoteThinking(item);
                    }}
                  >
                    {item} 号投票思考
                  </Button>
                  <Button
                    onClick={() => {
                      agentVote(item);
                    }}
                  >
                    {item} 号投票
                  </Button>
                </SpaceBetween>
              </FormField>
            );
          })}

          <Button
            onClick={() => {
              agentVoteEnd();
            }}
          >
            Agent 投票结束
          </Button>

          <Button
            onClick={() => {
              findUndercover();
            }}
          >
            找出卧底
          </Button>

          <FormField label="Status">
            <StatusIndicator
              type={connectionStatus as StatusIndicatorProps.Type}
            >
              {connectionStatus}
            </StatusIndicator>
          </FormField>
        </SpaceBetween>
      </Form>
    </div>
  );
};

export default TestSend;
