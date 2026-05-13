import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProblemStore } from "../store/useProblemStore";
import toast from "react-hot-toast";
import { Code2, Beaker, Plus, Trash2, Save, X, Terminal } from "lucide-react";

const EditProblemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { problems, updateProblemById, isProblemLoading } = useProblemStore();

  const [activeTab, setActiveTab] = useState("javascript");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "EASY",
    tags: [],
    constraints: "",
    testcases: [{ input: "", output: "" }],
    referenceSolutions: { javascript: "", python: "", java: "" },
    codeSnippets: { javascript: "", python: "", java: "" },
  });

  useEffect(() => {
    const existingProblem = problems.find((p) => p.id === id || p._id === id);
    if (existingProblem) {
      setFormData({
        ...existingProblem,
        testcases: existingProblem.testcases?.length > 0 
          ? existingProblem.testcases 
          : [{ input: "", output: "" }],
        referenceSolutions: {
          javascript: existingProblem.referenceSolutions?.javascript || "",
          python: existingProblem.referenceSolutions?.python || "",
          java: existingProblem.referenceSolutions?.java || "",
        },
      });
    }
  }, [id, problems]);

  const handleSave = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Validating all languages with Judge0...");
    
    const success = await updateProblemById(id, formData);

    if (success) {
      toast.success("Problem updated successfully!", { id: toastId });
      navigate("/");
    } else {
      toast.error("Validation failed. Check your logic in all languages.", { id: toastId });
    }
  };

  const updateTestcase = (index, field, value) => {
    const newTestcases = [...formData.testcases];
    newTestcases[index][field] = value;
    setFormData({ ...formData, testcases: newTestcases });
  };

  const removeTestcase = (index) => {
    if (formData.testcases.length > 1) {
      const newTestcases = formData.testcases.filter((_, i) => i !== index);
      setFormData({ ...formData, testcases: newTestcases });
    }
  };

  const handleSolutionChange = (lang, value) => {
    setFormData((prev) => ({
      ...prev,
      referenceSolutions: { ...prev.referenceSolutions, [lang]: value },
      // Update snippets too if they are intended to be identical
      codeSnippets: { ...prev.codeSnippets, [lang]: value } 
    }));
  };

  if (isProblemLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 bg-base-100 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Code2 className="text-primary w-8 h-8" /> Edit Challenge
          </h1>
          <p className="text-base-content/60 text-sm mt-1">ID: {id}</p>
        </div>
        <button onClick={() => navigate("/")} className="btn btn-ghost border-base-300">
          <X className="w-5 h-5" /> Cancel
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: 5/12 width */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-base-200 p-6 rounded-2xl shadow-lg border border-base-300">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">General Details</h2>
            
            <div className="form-control mb-4">
              <label className="label font-semibold">Problem Title</label>
              <input 
                className="input input-bordered focus:input-primary" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required
              />
            </div>

            <div className="form-control mb-4">
              <label className="label font-semibold">Difficulty Level</label>
              <select 
                className="select select-bordered" 
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label font-semibold">Problem Description</label>
              <textarea 
                className="textarea textarea-bordered h-48 leading-relaxed" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </section>

          {/* TEST CASES */}
          <section className="bg-base-200 p-6 rounded-2xl shadow-lg border border-base-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Beaker className="text-success"/> Test Cases</h2>
              <button 
                type="button" 
                className="btn btn-sm btn-primary gap-1"
                onClick={() => setFormData({...formData, testcases: [...formData.testcases, {input: "", output: ""}]})}
              >
                <Plus size={16}/> Add New
              </button>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {formData.testcases.map((tc, idx) => (
                <div key={idx} className="flex gap-2 items-center group">
                  <div className="bg-base-300 p-3 rounded-xl flex-1 grid grid-cols-2 gap-2">
                    <input 
                      placeholder="Input" 
                      className="input input-xs input-bordered font-mono" 
                      value={tc.input} 
                      onChange={(e) => updateTestcase(idx, 'input', e.target.value)}
                    />
                    <input 
                      placeholder="Output" 
                      className="input input-xs input-bordered font-mono" 
                      value={tc.output} 
                      onChange={(e) => updateTestcase(idx, 'output', e.target.value)}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeTestcase(idx)}
                    className="btn btn-ghost btn-sm text-error opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: 7/12 width */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-base-200 p-6 rounded-2xl shadow-lg border border-base-300">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Terminal className="text-info" /> Reference Solutions
            </h2>
            <p className="text-xs text-base-content/50 mb-6 italic">
              * Backend validates your test cases against all three languages.
            </p>
            
            {/* TABS FOR LANGUAGES */}
            <div className="tabs tabs-lifted mb-4">
              <button 
                type="button"
                className={`tab font-bold ${activeTab === "javascript" ? "tab-active text-yellow-500" : ""}`}
                onClick={() => setActiveTab("javascript")}
              >
                JavaScript
              </button>
              <button 
                type="button"
                className={`tab font-bold ${activeTab === "python" ? "tab-active text-blue-500" : ""}`}
                onClick={() => setActiveTab("python")}
              >
                Python
              </button>
              <button 
                type="button"
                className={`tab font-bold ${activeTab === "java" ? "tab-active text-red-500" : ""}`}
                onClick={() => setActiveTab("java")}
              >
                Java
              </button>
            </div>

            {/* DYNAMIC EDITOR AREA */}
            <div className="form-control">
              <textarea 
                className="textarea textarea-bordered font-mono h-[550px] text-sm bg-neutral text-neutral-content p-4 focus:outline-none"
                placeholder={`Write the perfect ${activeTab} solution here...`}
                value={formData.referenceSolutions[activeTab]}
                onChange={(e) => handleSolutionChange(activeTab, e.target.value)}
              />
            </div>
          </section>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col gap-3">
            <button type="submit" className="btn btn-primary btn-lg shadow-xl gap-2 font-bold">
              <Save size={24}/> Update & Run Validation
            </button>
            <p className="text-center text-xs opacity-40 uppercase tracking-widest">
              Judge0 will test your code before saving
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProblemPage;