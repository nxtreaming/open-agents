import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { Chat } from "@ai-sdk/react";
import { createAgentTransport } from "./transport.js";
import type {
  TUIAgent,
  TUIAgentCallOptions,
  TUIAgentUIMessage,
  AutoAcceptMode,
} from "./types.js";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";

type ChatState = {
  model?: string;
  autoAcceptMode: AutoAcceptMode;
  workingDirectory?: string;
};

type ChatContextValue = {
  chat: Chat<TUIAgentUIMessage>;
  state: ChatState;
  setAutoAcceptMode: (mode: AutoAcceptMode) => void;
  cycleAutoAcceptMode: () => void;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const AUTO_ACCEPT_MODES: AutoAcceptMode[] = ["off", "edits", "all"];

type ChatProviderProps = {
  children: ReactNode;
  agent: TUIAgent;
  agentOptions: TUIAgentCallOptions;
  model?: string;
  workingDirectory?: string;
};

export function ChatProvider({
  children,
  agent,
  agentOptions,
  model,
  workingDirectory,
}: ChatProviderProps) {
  const [autoAcceptMode, setAutoAcceptMode] = useState<AutoAcceptMode>("edits");

  const transport = useMemo(
    () => createAgentTransport({ agent, agentOptions }),
    [agent, agentOptions],
  );

  const chat = useMemo(
    () =>
      new Chat<TUIAgentUIMessage>({
        transport,
        sendAutomaticallyWhen:
          lastAssistantMessageIsCompleteWithApprovalResponses,
      }),
    [transport],
  );

  const state: ChatState = useMemo(
    () => ({
      model,
      autoAcceptMode,
      workingDirectory,
    }),
    [model, autoAcceptMode, workingDirectory],
  );

  const cycleAutoAcceptMode = () => {
    setAutoAcceptMode((prev) => {
      const currentIndex = AUTO_ACCEPT_MODES.indexOf(prev);
      const nextIndex = (currentIndex + 1) % AUTO_ACCEPT_MODES.length;
      return AUTO_ACCEPT_MODES[nextIndex] ?? "off";
    });
  };

  return (
    <ChatContext.Provider
      value={{
        chat,
        state,
        setAutoAcceptMode,
        cycleAutoAcceptMode,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
