import { useEffect } from "react";
import { Link } from "react-router-dom"; // ✅ Correct Import
import { useAuthStore } from "../store/useAuthStore";
import { useSubmissionStore } from "../store/useSubmissionStore";
import { Trophy, Target, Zap, Activity } from "lucide-react";

const ProfilePage = () => {
    const { authUser } = useAuthStore();
    const { submissions, getAllSubmissions } = useSubmissionStore(); // ✅ Get the function

    useEffect(() => {
        getAllSubmissions(); // ✅ Fetch the data when the page loads
    }, [getAllSubmissions]);

    const getDifficultyColor = (diff) => {
        const d = diff?.toLowerCase();
        if (d === 'easy') return 'badge-success';
        if (d === 'medium') return 'badge-warning';
        if (d === 'hard') return 'badge-error';
        return 'badge-ghost';
    };

    return (
        <div className="container mx-auto p-6">
            {/* Add your Stats Cards here (Trophy, Zap, etc.) */}

            {/* Motivational Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Solved Card */}
                <div className="stat bg-base-100 rounded-2xl shadow-xl border-b-4 border-primary">
                    <div className="stat-figure text-primary">
                        <Trophy className="w-10 h-10" />
                    </div>
                    <div className="stat-title font-semibold uppercase tracking-wider">Solved</div>
                    <div className="stat-value text-primary">
                        {/* Counts unique problem IDs where status was 'Accepted' */}
                        {[...new Set(submissions.filter(s => s.status === 'Accepted').map(s => s.problemId))].length}
                    </div>
                    <div className="stat-desc text-secondary font-medium">Keep climbing the ladder!</div>
                </div>

                {/* Success Rate Card */}
                <div className="stat bg-base-100 rounded-2xl shadow-xl border-b-4 border-secondary">
                    <div className="stat-figure text-secondary">
                        <Target className="w-10 h-10" />
                    </div>
                    <div className="stat-title font-semibold uppercase tracking-wider">Accuracy</div>
                    <div className="stat-value text-secondary">
                        {submissions.length > 0
                            ? ((submissions.filter(s => s.status === 'Accepted').length / submissions.length) * 100).toFixed(1)
                            : 0}%
                    </div>
                    <div className="stat-desc">Across {submissions.length} attempts</div>
                </div>

                {/* Best Language Card */}
                <div className="stat bg-base-100 rounded-2xl shadow-xl border-b-4 border-accent">
                    <div className="stat-figure text-accent">
                        <Zap className="w-10 h-10" />
                    </div>
                    <div className="stat-title font-semibold uppercase tracking-wider">Top Language</div>
                    <div className="stat-value text-accent uppercase text-2xl">
                        {/* Logic to find the most frequent language */}
                        {submissions.length > 0
                            ? Object.entries(submissions.reduce((acc, s) => ({ ...acc, [s.language]: (acc[s.language] || 0) + 1 }), {}))
                                .sort((a, b) => b[1] - a[1])[0][0]
                            : "N/A"}
                    </div>
                    <div className="stat-desc">Your strongest tool</div>
                </div>
            </div>

            <div className="bg-base-100 p-6 rounded-2xl shadow-xl mt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" /> Recent Activity
                </h3>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Problem</th>
                                <th>Difficulty</th>
                                <th>Status</th>
                                <th>Language</th>
                                <th>Submitted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub) => (
                                <tr key={sub.id} className="hover">
                                    <td className="font-semibold">
                                        <Link to={`/problem/${sub.problemId}`} className="text-primary hover:underline">
                                            {/* Note: Ensure backend uses 'include' or 'populate' */}
                                            {sub.problem?.title || `Problem #${sub.problemId.slice(0, 5)}`}
                                        </Link>
                                    </td>
                                    <td>
                                        <div className={`badge badge-outline ${getDifficultyColor(sub.problem?.difficulty)}`}>
                                            {sub.problem?.difficulty || "General"}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${sub.status === 'Accepted' ? 'badge-success' : 'badge-error'}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="font-mono text-xs uppercase">{sub.language}</td>
                                    <td className="text-xs opacity-70">
                                        {new Date(sub.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;