export function VoteButtons(props: {
  projectId: number;
  upvotes: number;
  downvotes: number;
}) {
  const { projectId, upvotes, downvotes } = props;

  return (
    <div className="vote-buttons" id={`votes-${projectId}`}>
      <div className="vote-section">
        <button
          className="vote-btn upvote-btn"
          hx-post={`/api/projects/${projectId}/upvote`}
          hx-target={`#votes-${projectId}`}
          hx-swap="outerHTML"
        >
          👍 <span className="vote-count">{upvotes}</span>
        </button>
      </div>

      <div className="vote-section">
        <button
          className="vote-btn downvote-btn"
          hx-post={`/api/projects/${projectId}/downvote`}
          hx-target={`#votes-${projectId}`}
          hx-swap="outerHTML"
        >
          👎 <span className="vote-count">{downvotes}</span>
        </button>
      </div>
    </div>
  );
}
