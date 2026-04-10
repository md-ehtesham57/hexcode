import { CheckCircle2, XCircle, Clock, MemoryStick as Memory } from 'lucide-react';

const SubmissionResults = ({ submission }) => {
  //GUARD 1: If an array was accidentally passed, take the first item
  const data = Array.isArray(submission) ? submission[0] : submission;

  if (!data) return null;

  const ensureArray = (val) => {
    if (Array.isArray(val)) return val;
    try {
      return JSON.parse(val || '[]');
    } catch (e) {
      return [];
    }
  };

  const memoryArr = ensureArray(data?.memory);
  const timeArr = ensureArray(data?.time);

  const avgMemory = memoryArr.length > 0
    ? memoryArr.map(m => parseFloat(m)).reduce((a, b) => a + b, 0) / memoryArr.length
    : 0;

  const avgTime = timeArr.length > 0
    ? timeArr.map(t => parseFloat(t)).reduce((a, b) => a + b, 0) / timeArr.length
    : 0;

  //GUARD 2: Test Case Logic
  const rawTestCases = data?.results || data?.testCases || [];
  const testCases = Array.isArray(rawTestCases) ? rawTestCases : [];

  const passedTests = testCases.filter(tc =>
    tc.passed === true || tc.status === 'Accepted'
  ).length;

  const totalTests = testCases.length;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-base-200/50 border border-base-content/5 shadow-md">
          <div className="card-body p-4 text-center md:text-left">
            <h3 className="text-xs uppercase font-bold opacity-50">Status</h3>
            <div className={`text-xl font-black ${data?.status === 'Accepted' ? 'text-success' : 'text-error'}`}>
              {data?.status || "Pending"}
            </div>
          </div>
        </div>

        <div className="card bg-base-200/50 border border-base-content/5 shadow-md">
          <div className="card-body p-4 text-center md:text-left">
            <h3 className="text-xs uppercase font-bold opacity-50">Success Rate</h3>
            <div className="text-xl font-black">{successRate.toFixed(1)}%</div>
          </div>
        </div>

        <div className="card bg-base-200/50 border border-base-content/5 shadow-md">
          <div className="card-body p-4 text-center md:text-left">
            <h3 className="text-xs uppercase font-bold opacity-50 flex items-center justify-center md:justify-start gap-2">
              <Clock className="w-3.5 h-3.5 text-primary" /> Runtime
            </h3>
            <div className="text-xl font-black">{avgTime.toFixed(3)}s</div>
          </div>
        </div>

        <div className="card bg-base-200/50 border border-base-content/5 shadow-md">
          <div className="card-body p-4 text-center md:text-left">
            <h3 className="text-xs uppercase font-bold opacity-50 flex items-center justify-center md:justify-start gap-2">
              <Memory className="w-3.5 h-3.5 text-secondary" /> Memory
            </h3>
            <div className="text-xl font-black">{avgMemory.toFixed(0)} KB</div>
          </div>
        </div>
      </div>

      {/* Detailed Test Cases */}
      <div className="card bg-base-100 shadow-xl border border-base-content/5">
        <div className="card-body p-6">
          <h2 className="card-title text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" /> Test Case Details
          </h2>
          <div className="overflow-x-auto rounded-xl">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200/50">
                  <th className="rounded-tl-xl">Result</th>
                  <th>Expected</th>
                  <th>Actual</th>
                  <th>RAM</th>
                  <th className="rounded-tr-xl">Time</th>
                </tr>
              </thead>
              <tbody>
                {testCases.length > 0 ? (
                  testCases.map((testCase, index) => (
                    <tr key={index} className="hover:bg-base-200/30 transition-colors">
                      <td className="font-bold">
                        {testCase.passed ? (
                          <span className="text-success flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Passed
                          </span>
                        ) : (
                          <span className="text-error flex items-center gap-1.5">
                            <XCircle className="w-4 h-4" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-xs opacity-80">{testCase.expected}</td>
                      <td className="font-mono text-xs text-primary">{testCase.stdout?.trim() || 'null'}</td>
                      <td className="text-xs opacity-70">{testCase.memory || '0 KB'}</td>
                      <td className="text-xs opacity-70">{testCase.time || '0.000s'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 italic opacity-50">
                      No test case data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionResults;