'use client'
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import React from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import styles from "./page.module.css";

function ListOfMessages({ messages }) {
   const messagesEndRef = React.useRef(null);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   };

   React.useEffect(() => {
      scrollToBottom();
   }, [messages]);

   return (
      <div style={{ width: '100%' }}>
         {messages.map((message, index) => (
            <div key={index} className={styles.message}>
               {message}
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
export default function Home() {
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (message) => {
    setMessages([...messages, message]);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ListOfMessages messages={messages} />
      </main>
      <PromptInput onSendMessage={handleSendMessage} />
    </div>
  );
}
