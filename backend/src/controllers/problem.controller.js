import { db } from "../libs/db.js";
import { getJudge0LanguageId, submitBatch, pollBatchResults } from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {

  console.log("Create problem hit");

  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  console.log("BODY:", req.body);
  console.log("referenceSolutions:", referenceSolutions);
  console.log("testcases:", testcases);

  if (!referenceSolutions || !testcases || testcases.length === 0) {
    return res.status(400).json({
      error: "Missing referenceSolutions or testcases",
    });
  }

  //Going to check the user role once again
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Unauthorized: Only admins can create problems",
    });
  }

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Language ${language} is not supported` });
      }

      //
      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((r) => r?.token).filter(Boolean);

      if (tokens.length === 0) {
        return res.status(500).json({
          error: "Failed to create submissions",
        });
      }

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (!result || !result.status) {
          return res.status(500).json({
            error: "Invalid Judge0 response",
          });
        }

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
            details: result.status.description,
          });
        }
      }
    }

    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Message Created Successfully",
      problem: newProblem,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Error While Creating Problem",
    });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany();

    if (problems.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No problems found",
        problems: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem fetched successfully.",
      problems
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Error while fetching the problems!"
    });
  }
};



export const getProblemById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: "Problem ID is required",
    });
  }

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        examples: true,
        constraints: true,
        tags: true,

        testcases: true,
        codeSnippets: true,
        referenceSolutions: true,
      },
    });

    if (!problem) {
      return res.status(404).json({
        error: "Problem not found!"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem fetched by id successfully.",
      problem,
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Error while fetching problem!"
    });
  }
}

export const updateProblemById = async (req, res) => {
  const { id } = req.params;
  const problemId = Number(id);

  try {
    const existingProblem = await db.problem.findUnique({ where: { id: problemId } });
    if (!existingProblem) return res.status(404).json({ error: "Not found" });

    const incoming = req.body;

    // The "Fill in the Blanks" Logic
    const updateData = {
      title: incoming.title || existingProblem.title,
      description: incoming.description || existingProblem.description,
      difficulty: incoming.difficulty || existingProblem.difficulty,
      constraints: incoming.constraints || existingProblem.constraints,
      // For arrays/objects, check length or keys
      tags: (incoming.tags && incoming.tags.length > 0) ? incoming.tags : existingProblem.tags,
      testcases: (incoming.testcases && incoming.testcases.length > 0) ? incoming.testcases : existingProblem.testcases,
      examples: incoming.examples || existingProblem.examples,
      codeSnippets: incoming.codeSnippets || existingProblem.codeSnippets,
      referenceSolutions: incoming.referenceSolutions || existingProblem.referenceSolutions,
    };

    // Only run Judge0 if NEW code was actually provided
    const hasNewCode = incoming.referenceSolutions &&
      Object.values(incoming.referenceSolutions).some(c => c.length > 50);

    if (hasNewCode) {
      // ... insert your existing Judge0 batch submission logic here ...
    }

    const updatedProblem = await db.problem.update({
      where: { id: problemId },
      data: updateData, // 🚀 Uses the merged data
    });

    return res.status(200).json({ success: true, message: "Updated successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Update failed" });
  }
};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Unauthorized: Only admins can delete problems",
    });
  }

  try {
    await db.problem.delete({
      where: {
        id: id
      }
    });

    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully"
    });

  } catch (error) {
    console.error("Prisma Error:", error);

    //Handle Prisma "Record Not Found" Error
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Problem not found in database",
      });
    }

    return res.status(500).json({
      error: "Internal server error during deletion"
    });
  }
};

export const getAllProblemsSolvedByUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const problems = await db.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userId: req.user.id,
          }
        }
      },
      select: {
        id: true,
        title: true,
        difficulty: true,
        tags: true,
      }
    })

    if (problems.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No solved problems found",
        problems: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      problems
    })
  } catch (error) {
    console.error("Error fetching problems :", error);
    return res.status(500).json({ error: "Failed to fetch problems" })
  }
};
