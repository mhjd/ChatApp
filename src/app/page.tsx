'use client'
import { useState, useEffect } from "react";
import React from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import styles from "./page.module.css";
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';

type ChatMessage = {
  text: string;
  isBot: boolean;
}
interface ListOfMessagesProps {
    messages: ChatMessage[];
}
function ListOfMessages({ messages }: ListOfMessagesProps) {
    const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        // Check if user was already at bottom before adding new message
		  const container = containerRef.current;
		  if (container != null){
				const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
				if (isAtBottom) {
					 messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
				}
		  }
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div ref={containerRef} >
				{messages.map((message, index) => (
					 <div 
                key={index} 
                className={`${styles.message} ${message.isBot ? styles.botMessage : styles.userMessage}`}
						  >
						  {message.text}
					 </div>
				))}
				<div ref={messagesEndRef} />
				</div>
    )
}

function PromptInput({ onSendMessage } : { onSendMessage: (message: string) => void }) {
    const [inputText, setInputText] = useState("");

    const handleSubmit = () => {
        if (inputText.trim()) {
				onSendMessage(inputText);
				setInputText("");
        }
    };

    return (
        <div className={styles.promptInput}>
				<TextField
        label="Enter your prompt"
        variant="outlined"
        multiline
        fullWidth
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
					 e.preventDefault();
					 handleSubmit();
            }
        }}
				/>
				<Button 
        variant="contained" 
        endIcon={<SendIcon />}
        onClick={handleSubmit}
				/>
				</div>
    )
}

type Model = {
  id: string;
  name: string;
};


function ModelsMenu() {
  const defaultModel = { id: 'mistral-large-latest', name: 'Mistral Large' };
  const [model, setModel] = useState(defaultModel.id);
  const [models, setModels] = useState<Model[]>([defaultModel]);

  useEffect(() => {
    let mounted = true;

    const fetchModels = async () => {
      try {
        const response = await fetch('/api/mistral_api');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch models');
        }
        const data = await response.json();
        
        if (mounted && data?.models && Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);
        }
      } catch (err) {
        console.error('Error fetching models:', err);
        // Fallback to default model on error
        if (mounted) {
          setModels([defaultModel]);
        }
      }
    };

    fetchModels();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setModel(event.target.value);
  };

  return (
    <FormControl margin="dense" size="medium" sx={{ maxWidth: 200 }}>
      <InputLabel>Model</InputLabel>
      <Select
        labelId="model-select-label"
        id="model-select"
        value={model}
        label="Model"
        onChange={handleChange}
      >
        {models.map((m) => (
          <MenuItem key={m.id} value={m.id}>
            {m.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}



export default function Home() {
	 const [messages, setMessages] = useState<ChatMessage[]>([]);
	 const [history, setHistory] = useState<{messages: ChatMessage[], title: string}[]>([]);
	 const [currentChatIndex, setCurrentChatIndex] = useState<number | null>(null);
	 const [newChat, setNewChat] = useState(true);
	 const handleNewChat = () => {
		  if (messages.length > 0 && newChat) {
				const newChatTitle = `Chat n°${history.length + 1}`;
				setHistory([{ messages, title: newChatTitle }, ...history]);
		  }
		  setMessages([]);
		  setNewChat(true);
		  setCurrentChatIndex(null);
	 };

	 const handleChatSelect = (index: number) => {
		  setMessages(history[index].messages);
		  setNewChat(false);
		  setCurrentChatIndex(index);
	 };

	 const handleSendMessage = async (message: string) => {

		  const all_messages = [
				...messages, 
				{ text: message, isBot: false }
		  ];
		  const string_with_all_messages = all_messages.map(message => {
				return message.isBot ? `Chatbot: ${message.text}` : `User: ${message.text}`;
		  }).join("\n");
		  
		  setMessages(all_messages);



		  try {
				const response = await fetch('/api/mistral_api', {
					 method: 'POST',
					 headers: {
						  'Content-Type': 'application/json',
					 },
					 body: JSON.stringify({ messages: [{ role: 'user', content: string_with_all_messages }] }),
				});

				if (!response.ok) {
					 throw new Error('Failed to fetch response');
				}
				const data = await response.json();
				setMessages([
					 ...messages, 
					 { text: message, isBot: false },
					 { text: data.reply, isBot: true }
				]);
		  } catch (error) {
				console.error('Error:', error);
		  }
	 };

	 return (
		  <div className={styles.page}>
				<div className={styles.chatMenu}>
				<Button 
        variant="contained" 
        fullWidth 
        onClick={handleNewChat}
				>
				New Chat
        </Button>
				<div className={styles.chatList}>
				{history.map((chat, index) => (
					 <div
					 key={index}
					 className={`${styles.chatItem} ${index === currentChatIndex ? styles.selectedChat : ''}`}
					 onClick={() => handleChatSelect(index)}
						  >
						  {chat.title}
					 </div>
				))}
        </div>
				</div>
				<div className={styles.chatContent}>
				<ModelsMenu />
				<main className={styles.main}>
				<ListOfMessages messages={messages} />
				</main>
				<PromptInput onSendMessage={handleSendMessage} />
				</div>
				</div>
	 );
}
