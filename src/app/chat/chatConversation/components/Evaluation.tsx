import type { ReactNode } from 'react';

import { type AIEvaluation, type Comment } from '@/lib/aiResponse';

import styles from './Evaluation.module.css';

export default function Evaluation({ evaluation }: { evaluation: AIEvaluation }) {
  return (
    <div className={styles.evaluation}>
      <h1>Evaluation</h1>
      <div className={styles.evaluationContent}>
        <ol className={styles.comments}>
          {evaluation.comments.map((comment, idx) => (
            <li key={idx}>{parseComment(comment)}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function parseComment(comment: Comment): ReactNode {
  const parts = comment.segments.map((segment) => {
    switch (segment.type) {
      case 'userInput':
        return <span className={styles.userInput}>{segment.text}</span>;
      case 'suggestion':
        return <span className={styles.suggestion}>{segment.text}</span>;
      default:
        return <>{segment.text}</>;
    }
  });
  const parts2 = comment.segments.map((segment, idx) => {
    // return <span key={idx}>{segment.text}</span>;
    return segment.text;
  });
  // console.log('parts2:', parts2);
  return <>{parts2.join(' ')} </>;
}
