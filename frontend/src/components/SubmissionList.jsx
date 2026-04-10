import {
  CheckCircle2,
  XCircle,
  Clock,
  MemoryStick as Memory,
  Calendar,
} from "lucide-react";

const SubmissionsList = ({ submissions, isLoading }) => {
  // 🛡️ Enhanced Helper: Safely parse JSON strings
  const safeParse = (data) => {
    if (!data) return []; // Guard against null/undefined
    if (Array.isArray(data)) return data; // Already an array
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Error parsing data:", error);
      return [];
    }
  };

  // 🛡️ Enhanced Helper: Calculate average memory usage
  const calculateAverageMemory = (memoryData) => {
    const parsed = safeParse(memoryData);
    if (!parsed || parsed.length === 0) return 0;

    const memoryArray = parsed
      .map((m) => {
        if (typeof m !== "string") return 0; // Guard against non-string elements
        return parseFloat(m.split(" ")[0]);
      })
      .filter((num) => !isNaN(num)); // Remove any NaNs

    return memoryArray.length === 0
      ? 0
      : memoryArray.reduce((acc, curr) => acc + curr, 0) / memoryArray.length;
  };

  // 🛡️ Enhanced Helper: Calculate average runtime
  const calculateAverageTime = (timeData) => {
    const parsed = safeParse(timeData);
    if (!parsed || parsed.length === 0) return 0;

    const timeArray = parsed
      .map((t) => {
        if (typeof t !== "string") return 0;
        return parseFloat(t.split(" ")[0]);
      })
      .filter((num) => !isNaN(num));

    return timeArray.length === 0
      ? 0
      : timeArray.reduce((acc, curr) => acc + curr, 0) / timeArray.length;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // No submissions state
  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-base-content/10 rounded-xl">
        <div className="text-base-content/50 italic">No submissions yet</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        // These are now guarded and won't crash the app
        const avgMemory = calculateAverageMemory(submission.memory);
        const avgTime = calculateAverageTime(submission.time);

        return (
          <div
            key={submission.id}
            className="card bg-base-200/50 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-content/5"
          >
            <div className="card-body p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Section: Status and Language */}
                <div className="flex items-center gap-4">
                  {submission.status === "Accepted" ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-bold tracking-tight">Accepted</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-error">
                      <XCircle className="w-5 h-5" />
                      <span className="font-bold tracking-tight">
                        {submission.status || "Error"}
                      </span>
                    </div>
                  )}
                  <div className="badge badge-neutral font-mono text-xs uppercase">
                    {submission.language}
                  </div>
                </div>

                {/* Right Section: Runtime, Memory, and Date */}
                <div className="flex items-center flex-wrap gap-4 text-xs font-medium opacity-70">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{avgTime.toFixed(3)} s</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Memory className="w-3.5 h-3.5 text-secondary" />
                    <span>{avgMemory.toFixed(0)} KB</span>
                  </div>
                  <div className="flex items-center gap-1.5 border-l border-base-content/10 pl-4">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(submission.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubmissionsList;