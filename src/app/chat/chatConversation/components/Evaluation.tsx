import Loader from '@/components/Loader';
import { type AIEvaluation, type Segment } from '@/lib/aiResponse';

import styles from './Evaluation.module.css';

type EvaluationProps = {
  evaluation: AIEvaluation;
  languageTag: string;
};

export default function Evaluation({ evaluation, languageTag }: EvaluationProps) {
  return (
    <div className={styles.evaluation} lang="en">
      <h1>Evaluation</h1>
      <ol className={styles.comments}>
        {evaluation.comments.map((comment, commentIdx) => (
          <li key={commentIdx}>
            {comment.segments.map((segment, segmentIdx) => (
              <span
                key={segmentIdx}
                className={getClassName(segment)}
                lang={isPracticeLanguage(segment) ? languageTag : undefined}
              >
                {segment.text}{' '}
              </span>
            ))}
          </li>
        ))}
      </ol>
    </div>
  );

  function isPracticeLanguage(segment: Segment) {
    return segment.type === 'userInput' || segment.type === 'suggestion';
  }
}

export function EvaluationLoader() {
  return (
    <div className={styles.evaluationLoader}>
      <h1 className={styles.loaderHeading}>
        Evaluating chat <Loader ariaLabel="Loading evaluation" />
      </h1>
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
