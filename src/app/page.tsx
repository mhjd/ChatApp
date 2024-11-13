import Image from "next/image";
import TextField from '@mui/material/TextField';
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
      </main>
    </div>
  );
}
