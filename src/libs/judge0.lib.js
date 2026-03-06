import axios from "axios";

export const getJudge0LanguageId = (Language) => {
    const languageMap = {
        "PYTHON": 71,
        "JAVA": 62,
        "JAVASCRIPT": 63,
    };
    return languageMap[Language.toUpperCase()];
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
    while(true){
        const { data } = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
            params: {
                tokens: tokens.join(","),
                base64_encoded: false,
            }
        });

        const results = data.submissions;

        // Moved the log here AFTER results is defined
        console.log("Current statuses:", results.map(r => r.status.id));

        const isAllDone = results.every((result) => 
            result.status.id !== 1 && result.status.id !== 2
        );

        if(isAllDone) return results;
        await sleep(1000);
    }
};

export const submitBatch = async (submissions) => {
    const { data } = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`, {
        submissions
    });

    console.log("Submission Results: ", data);
    // You were missing the return statement here!
    return data; 
};