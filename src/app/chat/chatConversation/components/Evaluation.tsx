import { type AIEvaluation, type Segment } from '@/lib/aiResponse';

import styles from './Evaluation.module.css';

export default function Evaluation({ evaluation }: { evaluation: AIEvaluation }) {
  return (
    <div className={styles.evaluation}>
      <h1>Evaluation</h1>
      <div className={styles.evaluationContent}>
        <ol className={styles.comments}>
          {evaluation.comments.map((comment, commentIdx) => (
            <li key={commentIdx}>
              {comment.segments.map((segment, segmentIdx) => (
                <span key={segmentIdx} className={getClassName(segment)}>
                  {segment.text}{' '}
                </span>
              ))}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function getClassName(segment: Segment): string {
  switch (segment.type) {
    case 'suggestion':
      return styles.suggestion;
    case 'userInput':
      return styles.userInput;
    default:
      return '';
  }
}
