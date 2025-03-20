//const OllamaApiModel = require('./ollamaApiModelService');

//const OLLAMA_URL = "http://localhost";
//const OLLAMA_PORT = 11434;
//const MODEL = "llama3.2:3b"; // Change selon le modèle dispo
//const PROMPT_INTRO = "Analyse et explique les logs trouvés dans ces fichiers Java :\n\n";

const fs = require('fs');
const axios = require('axios');
const { execSync } = require("child_process");

const url_lama = 'http://127.0.0.1:8000/improve-logs';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const { Octokit } = await import("@octokit/rest");
const octokit = new Octokit({ auth: GITHUB_TOKEN });
const PR_NUMBER = process.env.PR_NUMBER;
const REPO = process.env.REPO;
const [owner, repo] = REPO.split("/");

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

async function runQuery() {
    const commitId = await getLatestCommitID();

    if (!GITHUB_TOKEN || !PR_NUMBER || !REPO) {
        console.error("Missing required environment variables");
        process.exit(1);
    }
    
    try {
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
          const diff = execSync(`git diff -U0 origin/main -- ${filePath}`).toString();
          const context = fs.readFileSync(filePath, 'utf8');

          
        // ================ call API here ====================
          let reponse = '';
          const data = { diff, context }
          axios.post(url_lama, data).then(response => {
            reponse = response.data;
            console.log('Response:', reponse);
            
            octokit.pulls.createReviewComment({
              owner,
              repo,
              pull_number: PR_NUMBER,
              body: reponse['suggested'],
              commit_id: commitId,
              path: filePath,
              line: reponse['line']
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