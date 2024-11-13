'use client'
import Image from "next/image";
import { useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import styles from "./page.module.css";

function PromptInput(){
   const [listOfmessages, setListOfmessages] = useState([]);
   const [inputText, setInputText] = useState("");

   const handleSubmit = () => {
      if (inputText.trim()) {
         setListOfmessages([...listOfmessages, inputText]);
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
  return (
    <div className={styles.page}>
      <main className={styles.main}>
      </main>
      <PromptInput />
    </div>
  );
}
