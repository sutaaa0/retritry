// components/FeedbackDisplay.tsx
interface Props {
  feedback: string;
}

export const FeedbackDisplay = ({ feedback }: Props) =>
  feedback ? (
    <div className="text-center mb-4">
      <div className="text-2xl font-bold text-yellow-400 animate-pulse">
        {feedback}
      </div>
    </div>
  ) : null;
