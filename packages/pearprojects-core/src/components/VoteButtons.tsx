export function VoteButtons({
  projectId,
  upvotes,
  downvotes,
}: {
  projectId: string;
  upvotes: number;
  downvotes: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2" id={`votes-${projectId}`}>
      {/* Upvote Button */}
      <div className="flex items-center bg-slate-600 hover:bg-slate-500 rounded-lg transition-all duration-200 hover:shadow-md border border-slate-500 hover:cursor-pointer ">
        <button
          className="flex items-center space-x-2 px-3 py-2 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-mint-green focus:ring-opacity-50 hover:scale-105"
          hx-post={`/api/projects/${projectId}/upvote`}
          hx-target={`#votes-${projectId}`}
          hx-swap="outerHTML"
        >
          <svg
            className="w-5 h-5 text-mint-green"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold text-white">{upvotes}</span>
        </button>
      </div>

      {/* Downvote Button */}
      <div className="flex items-center bg-slate-600 hover:bg-slate-500 rounded-lg transition-all duration-200 hover:shadow-md border border-slate-500 hover:cursor-pointer">
        <button
          className="flex items-center space-x-2 px-3 py-2 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 hover:scale-105"
          hx-post={`/api/projects/${projectId}/downvote`}
          hx-target={`#votes-${projectId}`}
          hx-swap="outerHTML"
        >
          <svg
            className="w-5 h-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold text-white">{downvotes}</span>
        </button>
      </div>
    </div>
  );
}
