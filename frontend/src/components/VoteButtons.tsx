type VoteButtonsProps = {
  section: string;
  value: number | undefined;
  onVote: (section: string, value: number) => void;
};

export default function VoteButtons({
  section,
  value,
  onVote,
}: VoteButtonsProps) {
  return (
    <div className="votes">
      <button
        className={`vote-btn vote-btn--up ${value === 1 ? 'vote-btn--active' : ''}`}
        onClick={() => onVote(section, 1)}
      >
        👍
      </button>
      <button
        className={`vote-btn vote-btn--down ${value === -1 ? 'vote-btn--active' : ''}`}
        onClick={() => onVote(section, -1)}
      >
        👎
      </button>
    </div>
  );
}
