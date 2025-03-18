//const OllamaApiModel = require('./ollamaApiModelService');

//const OLLAMA_URL = "http://localhost";
//const OLLAMA_PORT = 11434;
//const MODEL = "llama3.2:3b"; // Change selon le modèle dispo
//const PROMPT_INTRO = "Analyse et explique les logs trouvés dans ces fichiers Java :\n\n";

const fs = require('fs');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;
const REPO = process.env.REPO;
const commitId = process.env.GITHUB_SHA;

const { execSync } = require("child_process");

async function commentOnPR(prNumber, filePath, lineNumber) {
  try {
    const { Octokit } = await import("@octokit/rest");

    const [owner, repo] = REPO.split("/");
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
  
    await octokit.pulls.createReviewComment({
      owner,
      repo,
      pull_number: prNumber,
      body: `Changement détecté sur la ligne 77 de CreatOption`,
      commit_id: '82c449b2c20938e154131f037dc9b84151b86971',
      path: filePath,
      line: lineNumber,
    });
    console.log(`Commentaire ajouté sur 77 de CreatOption`);
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire :", error);
  }
}

async function runQuery() {
    //const ollama = new OllamaApiModel(OLLAMA_URL, OLLAMA_PORT, MODEL, null);
    
    if (!GITHUB_TOKEN || !PR_NUMBER || !REPO) {
        console.error("Missing required environment variables");
        process.exit(1);
    }
    console.log(`PR_NUMBER: ${PR_NUMBER}, REPO: ${REPO}, COMMIT_ID: ${commitId}`);
    
    
    try {


        // Get the git diff
        const fileList = execSync("git diff --name-only origin/main -- *.java")
            .toString()
            .trim()
            .split("\n")
            .filter(file => file);

        if (fileList.length === 0) {
          console.log("No Java files changed.");
          process.exit(0);
        }

        for (const filePath of fileList) {
          console.log(`Processing ${filePath}...`);
    
          // Get the diff for the specific file
          const diff = execSync(`git diff origin/main -- ${filePath}`).toString();
          const context = fs.readFileSync(filePath, 'utf8');
          // Extract changed line numbers using regex

          console.log(`${filePath} changes: `+ diff);
          console.log("full context: "+context);

        }

        console.log("Comment posted successfully.");
      } catch (error) {
        console.error("Error posting comment:", error);
        process.exit(1);
      }
}



runQuery();