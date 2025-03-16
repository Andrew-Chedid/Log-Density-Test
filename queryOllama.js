//const OllamaApiModel = require('./ollamaApiModelService');
//const fs = require('fs');

//const OLLAMA_URL = "http://localhost";
//const OLLAMA_PORT = 11434;
//const MODEL = "llama3.2:3b"; // Change selon le modèle dispo
//const PROMPT_INTRO = "Analyse et explique les logs trouvés dans ces fichiers Java :\n\n";

const { execSync } = require("child_process");
const { Octokit } = require("@octokit/rest");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;
const REPO = process.env.REPO;


async function runQuery() {
    //const ollama = new OllamaApiModel(OLLAMA_URL, OLLAMA_PORT, MODEL, null);

    try {
        // Get the git diff
        const diff = execSync("git diff HEAD^ HEAD").toString();
        
        if (!diff) {
          console.log("No changes detected.");
          process.exit(0);
        }
      
        // Post a comment on the PR
        octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: PR_NUMBER,
          body: "Here is the git diff:\n```diff\n" + diff + "\n```",
        });
      
        console.log("Comment posted successfully.");
      } catch (error) {
        console.error("Error posting comment:", error);
        process.exit(1);
      }
}

runQuery();