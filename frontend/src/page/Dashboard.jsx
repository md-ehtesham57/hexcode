import { useEffect } from "react";
import { Link } from "react-router-dom"; 
import { useAuthStore } from "../store/useAuthStore";
import { useSubmissionStore } from "../store/useSubmissionStore";
import { Trophy, Target, Zap, Activity, Loader } from "lucide-react";

const Dashboard = () => {
    const { authUser } = useAuthStore();
    //Make sure 'isFetching' or 'loading' is pulled from your store
    const { submissions, getAllSubmissions, isFetching } = useSubmissionStore(); 

    useEffect(() => {
        //The Guard: Only fetch if we have a user and data is missing
        if (authUser && submissions.length === 0) {
            getAllSubmissions();
        }
    }, [authUser, getAllSubmissions, submissions.length]);

    //Safety Check: If data is still loading, show a spinner instead of broken cards
    if (isFetching && submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-medium opacity-50">Loading your stats...</p>
            </div>
        );
    }

    const getDifficultyColor = (diff) => {
        const d = diff?.toLowerCase();
        if (d === 'easy') return 'badge-success';
        if (d === 'medium') return 'badge-warning';
        if (d === 'hard') return 'badge-error';
        return 'badge-ghost';
    };

    // Calculate Stats safely
    const solvedCount = [...new Set(submissions.filter(s => s.status === 'Accepted').map(s => s.problemId))].length;
    const accuracy = submissions.length > 0 
        ? ((submissions.filter(s => s.status === 'Accepted').length / submissions.length) * 100).toFixed(1) 
        : 0;

    return (
        <div className="container mx-auto p-6 animate-in fade-in duration-700">
            {/* 1. Motivational Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Solved Card */}
                <div className="relative flex flex-col justify-between bg-base-100 rounded-2xl p-5 shadow-xl border-b-4 border-primary transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-center z-10">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Solved</p>
                            <h2 className="text-2xl lg:text-3xl font-black text-primary tracking-tight leading-tight">{solvedCount}</h2>
                        </div>
                        <div className="text-primary p-2.5 bg-base-200 rounded-xl flex-shrink-0 ml-4 flex items-center justify-center">
                            <Trophy className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="mt-4 text-xs font-medium italic opacity-50">Keep climbing!</p>
                </div>

                {/* Accuracy Card */}
                <div className="relative flex flex-col justify-between bg-base-100 rounded-2xl p-5 shadow-xl border-b-4 border-secondary transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-center z-10">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Accuracy</p>
                            <h2 className="text-2xl lg:text-3xl font-black text-secondary tracking-tight leading-tight">{accuracy}%</h2>
                        </div>
                        <div className="text-secondary p-2.5 bg-base-200 rounded-xl flex-shrink-0 ml-4 flex items-center justify-center">
                            <Target className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="mt-4 text-xs font-medium italic opacity-50">{submissions.length} attempts</p>
                </div>

                {/* Language Card */}
                <div className="relative flex flex-col justify-between bg-base-100 rounded-2xl p-5 shadow-xl border-b-4 border-accent transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-center z-10">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Top Language</p>
                            <h2 className="text-2xl lg:text-3xl font-black text-accent tracking-tight leading-tight uppercase">
                                {submissions.length > 0
                                    ? Object.entries(submissions.reduce((acc, s) => ({ ...acc, [s.language]: (acc[s.language] || 0) + 1 }), {}))
                                        .sort((a, b) => b[1] - a[1])[0][0]
                                    : "N/A"}
                            </h2>
                        </div>
                        <div className="text-accent p-2.5 bg-base-200 rounded-xl flex-shrink-0 ml-4 flex items-center justify-center">
                            <Zap className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="mt-4 text-xs font-medium italic opacity-50">Main weapon</p>
                </div>
            </div>

            {/* 2. Recent Activity Table */}
            <div className="bg-base-100 p-6 rounded-2xl shadow-xl border border-base-content/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Recent Activity
                </h3>
                
                {submissions.length === 0 ? (
                    <div className="text-center py-12 opacity-40 italic">No submissions yet. Go solve some problems! 🚀</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="text-base-content/60">
                                    <th>Problem</th>
                                    <th>Difficulty</th>
                                    <th>Status</th>
                                    <th>Language</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-base-200/40 transition-colors">
                                        <td className="font-bold">
                                            <Link to={`/problem/${sub.problemId}`} className="text-primary hover:underline">
                                                {sub.problem?.title || "Unknown Problem"}
                                            </Link>
                                        </td>
                                        <td>
                                            <div className={`badge badge-sm font-semibold ${getDifficultyColor(sub.problem?.difficulty)}`}>
                                                {sub.problem?.difficulty || "Medium"}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-sm font-bold ${sub.status === 'Accepted' ? 'badge-success' : 'badge-error'}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="font-mono text-xs opacity-70 uppercase">{sub.language}</td>
                                        <td className="text-xs opacity-50">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;