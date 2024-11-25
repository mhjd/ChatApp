'use client'
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import React from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import styles from "./page.module.css";
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function ListOfMessages({ messages }) {
    const messagesEndRef = React.useRef(null);
    const containerRef = React.useRef(null);

    const scrollToBottom = () => {
        // Check if user was already at bottom before adding new message
        const container = containerRef.current;
        const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
        
        if (isAtBottom) {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

function PromptInput({ onSendMessage }) {
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

function ModelsMenu() {
  const [model, setModel] = useState('mistral-large-latest');
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/mistral_api');
        const data = await response.json();
        setModels(data.models);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch models');
        setLoading(false);
      }
    };

    fetchModels();
  }, []); // Empty dependency array means this runs once on mount

  const handleChange = (event: any) => {
    setModel(event.target.value);
  };

  if (loading) return <div>Loading models...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <FormControl margin="dense" size="medium" sx={{ maxWidth: 200 }}>
      <InputLabel>Model</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={model}
        label="Model"
        onChange={handleChange}
      >
        {models.map((model) => (
          <MenuItem key={model.id} value={model.id}>
            {model.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}



export default function Home() {
	 const [messages, setMessages] = useState([]);
	 const [history, setHistory] = useState([]);
	 const [currentChatIndex, setCurrentChatIndex] = useState(null);
	 const [newChat, setNewChat] = useState(true);
	 const handleNewChat = () => {
		  if (messages.length > 0 && newChat) {
				const newChatTitle = `${history.length + 1} This is a generic name that's extremely long to see if, as intended, all the title isn't displayed`;
				setHistory([{ messages, title: newChatTitle }, ...history]);
		  }
		  setMessages([]);
		  setNewChat(true);
		  setCurrentChatIndex(null);
	 };

	 const handleChatSelect = (index) => {
		  setMessages(history[index].messages);
		  setNewChat(false);
		  setCurrentChatIndex(index);
	 };

	 const handleSendMessage = async (message) => {

		  setMessages([
				...messages, 
				{ text: message, isBot: false }
		  ]);
		  try {
				const response = await fetch('/api/mistral_api', {
					 method: 'POST',
					 headers: {
						  'Content-Type': 'application/json',
					 },
					 body: JSON.stringify({ messages: [{ role: 'user', content: message }] }),
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
				return 'An error occurred. Please try again later.';
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
