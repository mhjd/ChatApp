import Image from "next/image";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <TextField
          label="Enter your prompt"
          variant="outlined"
          multiline
			/>
        <Button variant="contained" endIcon={<SendIcon />}/>
      </main>
    </div>
  );
}
