import axios from "axios";

export const getJudge0LanguageId = (Language) => {
    const languageMap = {
        "PYTHON": 71,
        "JAVA": 62,
        "JAVASCRIPT": 63,
        "C++": 54,
        "C": 50,
    };
    if (!Language) return null;
    return languageMap[Language.toUpperCase()];
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
    let attempts = 0;
    const MAX_ATTEMPTS = 10;
    while (attempts < MAX_ATTEMPTS) {
        let data;
        try {
            const response = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
                params: {
                    tokens: tokens.join(","),
                    base64_encoded: false,
                }
            });
            data = response.data;
        } catch (error) {
            throw new Error("Failed to fetch Judge0 results");
        }

        const results = data.submissions;

        if (!results || !Array.isArray(results)) {
            throw new Error("Invalid Judge0 response format");
        }

        console.log("Current statuses:", results.map(r => r?.status?.id));

        const isAllDone = results.every((result) =>
            result?.status?.id !== 1 && result?.status?.id !== 2
        );

        if (isAllDone) return results;
        await sleep(1000);
        attempts++;
    }
    throw new Error("Judge0 polling timeout");
};

export const submitBatch = async (submissions) => {
    let data;

    try {
        const response = await axios.post(
            `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
            { submissions }
        );
        data = response.data;
    } catch (error) {
        throw new Error("Failed to submit batch to Judge0");
    }

    console.log("Submission Results: ", data);
    if(!data.tokens || !Array.isArray(data.tokens)){
        throw new Error("Invalid judge0 submission response.");
    }
    return data.tokens;
};

export function getLanguageName(languageId) {
    const LANGUAGE_NAMES = {
        74: "TypeScript",
        63: "JavaScript",
        71: "Python",
        62: "Java",
    }

    return LANGUAGE_NAMES[languageId] || "Unknown"
}