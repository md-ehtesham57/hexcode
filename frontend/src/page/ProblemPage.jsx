import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { axiosInstance } from "../lib/axios";
import {
  Play,
  FileText,
  MessageSquare,
  Lightbulb,
  Bookmark,
  Share2,
  Clock,
  ChevronRight,
  BookOpen,
  Terminal,
  Code2,
  Users,
  ThumbsUp,
  Home,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useProblemStore } from "../store/useProblemStore";
import { getLanguageId } from "../lib/lang";
import { useExecutionStore } from "../store/useExecutionStore";
import { useSubmissionStore } from "../store/useSubmissionStore";
import Submission from "../components/Submission";
import SubmissionsList from "../components/SubmissionList";

const ProblemPage = () => {
  const { id } = useParams();
  const { getProblemById, problem, isProblemLoading } = useProblemStore();

  const {
    submission,
    submissions,
    isLoading: isSubmissionsLoading,
    getSubmissionForProblem,
    getSubmissionCountForProblem,
    submissionCount,
  } = useSubmissionStore();

  //console.log("problemSubmission:" , problemSubmission);
  console.log("submission", submissions)
  console.log("submissions (array):", submissions);

  const [code, setCode] = useState("");
  const [fontSize, setFontSize] = useState(18);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [testcases, setTestCases] = useState([]);

  const { executeCode, executionResult, isExecuting } = useExecutionStore();

  const handleSubmit = async () => {
    try {
      await getSubmissionForProblem(id);

      setActiveTab("submissions");
    } catch (error) {
      console.log("Submit error:", error);
    }
  };

  const handleZoomIn = () => setFontSize((prev) => Math.min(prev + 2, 40));
  const handleZoomOut = () => setFontSize((prev) => Math.max(prev - 2, 10));

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        await Promise.all([
          getProblemById(id),
          getSubmissionCountForProblem(id)
        ]);
      } catch (error) {
        console.error("Problem not found, redirecting...");
        toast.error("This problem no longer exists.");
        navigate("/playlists");
      }
    };

    loadData();
  }, [id]);

  // Editor & Testcase Initialization
  useEffect(() => {
    if (!problem || (problem.id !== id && problem._id !== id)) return;

    const initialCode = submission?.sourceCode || problem.codeSnippets?.[selectedLanguage] || "";
    setCode(initialCode);

    // Set testcases
    const formattedTestCases = problem.testcases?.map((tc) => ({
      input: tc.input,
      output: tc.output,
    })) || [];

    setTestCases(formattedTestCases);

  }, [problem, selectedLanguage, id]);

  // Tab-based Fetching (On-Demand)
  useEffect(() => {
    if (activeTab === "submissions" && id) {
      getSubmissionForProblem(id);
    }
  }, [activeTab, id]);

  if (isProblemLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <div className="card bg-base-100 p-8 shadow-xl">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Verifying problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6 text-center">
        <div className="opacity-20">
          <h1 className="text-9xl font-black tracking-tighter">404</h1>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-widest text-error">Problem Missing</h2>
          <p className="text-base-content/50 max-w-xs">
            This challenge appears to have been removed or the link is broken.
          </p>
        </div>
        <Link to="/playlists" className="btn btn-outline btn-primary rounded-xl px-8">
          Back to Collections
        </Link>
      </div>
    );
  }

  console.log("submission", submissions);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    setCode(problem.codeSnippets?.[lang] || "");
  };

  const handleRunCode = (e) => {
    e.preventDefault();
    try {
      const language_id = getLanguageId(selectedLanguage);
      const stdin = problem?.testcases?.map((tc) => tc.input);
      const expected_outputs = problem?.testcases?.map((tc) => tc.output);
      executeCode(code, language_id, stdin, expected_outputs, id);
    } catch (error) {
      console.log("Error executing code", error);
    }
  };

  if (isProblemLoading || !problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <div className="card bg-base-100 p-8 shadow-xl">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading problem...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="prose max-w-none">
            <p className="text-lg mb-6">{problem.description}</p>

            {problem.examples && (
              <>
                <h3 className="text-xl font-bold mb-4">Examples:</h3>
                {Object.entries(problem.examples).map(
                  ([lang, example], idx) => (
                    <div
                      key={lang}
                      className="bg-base-200 p-6 rounded-xl mb-6 font-mono"
                    >
                      <div className="mb-4">
                        <div className="text-indigo-300 mb-2 text-base font-semibold">
                          Input:
                        </div>
                        <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white">
                          {example.input}
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="text-indigo-300 mb-2 text-base font-semibold">
                          Output:
                        </div>
                        <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white">
                          {example.output}
                        </span>
                      </div>
                      {example.explanation && (
                        <div>
                          <div className="text-emerald-300 mb-2 text-base font-semibold">
                            Explanation:
                          </div>
                          <p className="text-base-content/70 text-lg font-sem">
                            {example.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </>
            )}

            {problem.constraints && (
              <>
                <h3 className="text-xl font-bold mb-4">Constraints:</h3>
                <div className="bg-base-200 p-6 rounded-xl mb-6">
                  <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white text-lg">
                    {problem.constraints}
                  </span>
                </div>
              </>
            )}
          </div>
        );
      case "submissions":
        // --- ADD THIS LOADING CHECK ---
        if (isSubmissionsLoading) {
          return (
            <div className="flex justify-center p-10">
              <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
          );
        }
        return (
          <SubmissionsList
            submissions={submissions}
            isLoading={isSubmissionsLoading}
          />
        );
      case "discussion":
        return (
          <div className="p-4 text-center text-base-content/70">
            No discussions yet
          </div>
        );
      case "hints":
        return (
          <div className="p-4">
            {problem?.hints ? (
              <div className="bg-base-200 p-6 rounded-xl">
                <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white text-lg">
                  {problem.hints}
                </span>
              </div>
            ) : (
              <div className="text-center text-base-content/70">
                No hints available
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 to-base-200 max-w-7xl w-full">
      <nav className="navbar bg-base-100 shadow-lg px-4">
        <div className="flex-1 gap-2">
          <Link to={"/"} className="flex items-center gap-2 text-primary">
            <Home className="w-6 h-6" />
            <ChevronRight className="w-4 h-4" />
          </Link>
          <div className="mt-2">
            <h1 className="text-xl font-bold">{problem.title}</h1>
            <div className="flex items-center gap-2 text-sm text-base-content/70 mt-5">
              <Clock className="w-4 h-4" />
              <span>
                Updated{" "}
                {new Date(problem.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="text-base-content/30">•</span>
              <Users className="w-4 h-4" />
              <span>{submissionCount} Submissions</span>
              <span className="text-base-content/30">•</span>
              <ThumbsUp className="w-4 h-4" />
              <span>95% Success Rate</span>
            </div>
          </div>
        </div>
        <div className="flex-none gap-4">
          <button
            className={`btn btn-ghost btn-circle ${isBookmarked ? "text-primary" : ""
              }`}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="btn btn-ghost btn-circle">
            <Share2 className="w-5 h-5" />
          </button>
          <select
            className="select select-bordered select-primary w-40"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            {Object.keys(problem.codeSnippets || {}).map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT SIDE: Problem Info */}
          <div className="card bg-base-100 shadow-xl overflow-hidden h-fit">
            <div className="card-body p-0">
              <div className="tabs tabs-bordered bg-base-200/30">
                <button className={`tab gap-2 ${activeTab === "description" ? "tab-active" : ""}`} onClick={() => setActiveTab("description")}>
                  <FileText className="w-4 h-4" /> Description
                </button>
                <button className={`tab gap-2 ${activeTab === "submissions" ? "tab-active" : ""}`} onClick={() => setActiveTab("submissions")}>
                  <Code2 className="w-4 h-4" /> Submissions
                </button>
                <button className={`tab gap-2 ${activeTab === "discussion" ? "tab-active" : ""}`} onClick={() => setActiveTab("discussion")}>
                  <MessageSquare className="w-4 h-4" /> Discussion
                </button>
                <button className={`tab gap-2 ${activeTab === "hints" ? "tab-active" : ""}`} onClick={() => setActiveTab("hints")}>
                  <Lightbulb className="w-4 h-4" /> Hints
                </button>
              </div>
              <div className="p-6">{renderTabContent()}</div>
            </div>
          </div>

          {/* RIGHT SIDE: Editor Area */}
          <div className="card bg-base-100 shadow-xl overflow-hidden flex flex-col h-fit">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between px-4 py-2 bg-base-200/50 border-b border-base-300">
              <div className="flex items-center gap-2 text-sm font-bold opacity-80">
                <Terminal className="w-4 h-4 text-primary" />
                <span>Code Editor</span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-mono font-bold opacity-40">Size: {fontSize}px</span>
                <div className="join bg-base-100 border border-base-300 rounded-md">
                  <button onClick={handleZoomOut} className="btn btn-ghost btn-xs join-item h-7 w-8">−</button>
                  <button onClick={handleZoomIn} className="btn btn-ghost btn-xs join-item h-7 w-8">+</button>
                </div>
              </div>
            </div>

            {/* --- ACTUAL EDITOR --- */}
            <div className="h-[500px] w-full bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={selectedLanguage.toLowerCase()}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: fontSize,
                  mouseWheelZoom: true,
                  lineNumbers: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 10 },
                }}
              />
            </div>

            {/* --- FOOTER BUTTONS (Outside the Editor height) --- */}
            <div className="p-4 border-t border-base-300 bg-base-200">
              <div className="flex justify-between items-center">
                <button
                  className={`btn btn-primary btn-sm md:btn-md gap-2 ${isExecuting ? "loading" : ""}`}
                  onClick={handleRunCode}
                  disabled={isExecuting}
                >
                  {!isExecuting && <Play className="w-4 h-4" />}
                  Run Code
                </button>
                <button onClick={handleSubmit} className="btn btn-success btn-sm md:btn-md gap-2">
                  Submit Solution
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TEST CASES TABLE (Separate Card) */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            {executionResult ? (
              <Submission submission={executionResult} />
            ) : (
              <>
                <h3 className="text-xl font-bold mb-6">Test Cases</h3>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Input</th>
                        <th>Expected Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testcases.map((testCase, index) => (
                        <tr key={index}>
                          <td className="font-mono text-sm">{testCase.input}</td>
                          <td className="font-mono text-sm text-success">{testCase.output}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default ProblemPage;