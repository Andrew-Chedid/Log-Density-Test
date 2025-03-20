//const OllamaApiModel = require('./ollamaApiModelService');

//const OLLAMA_URL = "http://localhost";
//const OLLAMA_PORT = 11434;
//const MODEL = "llama3.2:3b"; // Change selon le modèle dispo
//const PROMPT_INTRO = "Analyse et explique les logs trouvés dans ces fichiers Java :\n\n";

const fs = require('fs');
const axios = require('axios');
const { execSync } = require("child_process");
const { Octokit } = await import("@octokit/rest");
const [owner, repo] = REPO.split("/");
const octokit = new Octokit({ auth: GITHUB_TOKEN });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;
const REPO = process.env.REPO;
const commitId = process.env.GITHUB_SHA;

async function getLatestCommitID() {
  try {
    const pr = await octokit.pulls.get({
      owner,
      repo,
      pull_number: PR_NUMBER,
    });
    return pr.data.head.sha; // Latest commit in the PR
  } catch (error) {
    console.error("Error fetching PR commit ID:", error);
    process.exit(1);
  }
}

async function commentOnPR(prNumber, filePath, lineNumber) {  

  try {
    const commitId = await getLatestCommitID();
    octokitModule.default; // Use the module
      octokit.pulls.createReviewComment({
        owner,
        repo,
        pull_number: prNumber,
        body: `HALLO :D`,
        commit_id: commitId,
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
    //console.log(`PR_NUMBER: ${PR_NUMBER}, REPO: ${REPO}, COMMIT_ID: ${commitId}`);
    
    
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
        const url_lama = 'http://127.0.0.1:8000/improve-logs';

        for (const filePath of fileList) {
          console.log(`Processing ${filePath}...`);
          // Get the diff for the specific file
          const diff = execSync(`git diff -U0 origin/main -- ${filePath}`).toString();
          const context = fs.readFileSync(filePath, 'utf8');

          
        // ================ call API here ====================
          let reponse = '';
          const data = {
            diff: diff,
            context: context
          }
          axios.post(url_lama, data).then(response => {
            reponse = response.data;
            console.log('Response:', reponse);
            
            octokit.pulls.createReviewComment({
              owner,
              repo,
              pull_number: prNumber,
              body: reponse['suggested'],
              commit_id: commitId,
              path: filePath,
              line: lineNumber
            });
          })
          .catch(error => {
            console.error('Error:', error.response ? error.response.data : error.message);
          });;        // ================ returns line number and changes ================

        }

        console.log("Comment posted successfully.");
      } catch (error) {
        console.error("Error posting comment:", error);
        process.exit(1);
      }
}



runQuery();