import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "../../components/custom/message";
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { useState, useRef } from "react";
import { message } from "../../interfaces/interfaces"
import { Overview } from "@/components/custom/overview";
import { Header } from "@/components/custom/header";
import {v4 as uuidv4} from 'uuid';

const socket = new WebSocket("ws://localhost:8090"); //change to your websocket endpoint

export function Chat() {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [messages, setMessages] = useState<message[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const cleanupMessageHandler = () => {
    if (messageHandlerRef.current && socket) {
      socket.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
  };

// async function handleSubmit(text?: string) {
//   if (!socket || socket.readyState !== WebSocket.OPEN || isLoading) return;

//   const messageText = text || question;
//   setIsLoading(true);
//   cleanupMessageHandler();
  
//   const traceId = uuidv4();
//   setMessages(prev => [...prev, { content: messageText, role: "user", id: traceId }]);
//   socket.send(messageText);
//   setQuestion("");

//   try {
//     const messageHandler = (event: MessageEvent) => {
//       setIsLoading(false);
//       if(event.data.includes("[END]")) {
//         return;
//       }
      
//       setMessages(prev => {
//         const lastMessage = prev[prev.length - 1];
//         const newContent = lastMessage?.role === "assistant" 
//           ? lastMessage.content + event.data 
//           : event.data;
        
//         const newMessage = { content: newContent, role: "assistant", id: traceId };
//         return lastMessage?.role === "assistant"
//           ? [...prev.slice(0, -1), newMessage]
//           : [...prev, newMessage];
//       });

//       if (event.data.includes("[END]")) {
//         cleanupMessageHandler();
//       }
//     };

//     messageHandlerRef.current = messageHandler;
//     socket.addEventListener("message", messageHandler);
//     setIsLoading(true);

//   } catch (error) {
//     console.error("WebSocket error:", error);
//     setIsLoading(false);
//   }
// }

async function handleSubmit(text?: string) {
  if (isLoading) return; // Prevent multiple submissions while loading

  const messageText = text || question;
  setIsLoading(true);

  const traceId = uuidv4();
  setMessages(prev => [...prev, { content: messageText, role: "user", id: traceId }]);
  setQuestion("");

  try {
    // Make an HTTP POST request to the API endpoint
    console.log("Sending message to server:", messageText);
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: messageText }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch response from the server");
    }

    const data = await response.json();
    console.log("Received response from server:", data);
    // Add the AI's response to the chat
    setMessages(prev => [
      ...prev,
      { content: JSON.stringify(data.rule), role: "assistant", id: uuidv4() },
    ]);
  } catch (error) {
    console.error("HTTP error:", error);
  } finally {
    setIsLoading(false); // Ensure loading state is reset
  }
}

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <Header/>
      <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4" ref={messagesContainerRef}>
        {messages.length == 0 && <Overview />}
        {messages.map((message, index) => (
          <PreviewMessage key={index} message={message} />
        ))}
        {isLoading && <ThinkingMessage />}
        <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]"/>
      </div>
      <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <ChatInput  
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};