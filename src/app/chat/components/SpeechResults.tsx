import styles from './SpeechResults.module.css';

export default function SpeechResults({
  speechResults,
}: {
  speechResults: SpeechRecognitionAlternative[];
}) {
  return (
    <div className={styles.results}>
      {speechResults.map((result, idx) => (
        <div key={idx}>{result.transcript}</div>
      ))}
    </div>
  );
}
