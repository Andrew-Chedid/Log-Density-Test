//const OllamaApiModel = require('./ollamaApiModelService');
//const fs = require('fs');

//const OLLAMA_URL = "http://localhost";
//const OLLAMA_PORT = 11434;
//const MODEL = "llama3.2:3b"; // Change selon le modèle dispo
//const PROMPT_INTRO = "Analyse et explique les logs trouvés dans ces fichiers Java :\n\n";


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
      commit_id: '87112bbdbb70f34635dcf7c6812d3960f9167fa7',
      path: 'training_data/CreateOptions.java',
      line: 77,
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
        const diff = execSync("git diff origin/main *.java").toString();
        //console.log("GIT DIFF:"+diff);
        const regex = /diff --git a\/(.+?) b\/\1[\s\S]+?@@ -\d+,?\d* \+(\d+),?\d* @@/g;
        
        let match;
        let lineChanges = [];
        let filePath = '';
        let newLine = 0;
        commentOnPR(PR_NUMBER, filePath, newLine);
        while ((match = regex.exec(diff)) !== null) {
          const filePath = match[1]; // Extract the modified file path
          const newLine = parseInt(match[2]); // Ligne de la nouvelle version
      
          lineChanges.push({filePath, newLine}); // Stocker les lignes affectées
          commentOnPR(PR_NUMBER, filePath, newLine);
          //console.log(match);
        }

        console.log("Lignes changées :", lineChanges);

        if (!diff) {
          console.log("No changes detected.");
          process.exit(0);
        }
    
      
        console.log("Comment posted successfully.");
      } catch (error) {
        console.error("Error posting comment:", error);
        process.exit(1);
      }
}



runQuery();