import fs from "fs";
import axios from "axios";
import { execSync } from "child_process";
import { Octokit } from "@octokit/rest";

const url_lama = 'http://127.0.0.1:8000/improve-logs';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

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
            const data = { diff, context }

            axios.post(url_lama, data).then(response => {
              const reponse = response.data;  // Ensure response is assigned properly
              console.log('Response:', reponse);
          
              reponse.forEach((comment, index) => {
                  octokit.rest.pulls.createReviewComment({
                      owner,
                      repo,
                      pull_number: PR_NUMBER,
                      body: `${comment['reason']}\n\`\`\`suggestion\n${comment['suggested']}\n\`\`\``,
                      commit_id: commitId,
                      path: filePath,
                      position: 1,
                      line: comment['line']
                  }).catch(error => {
                      console.error(`Error creating review comment for index ${index}:`, error.response?.data || error.message);
                  });
              });
          }).catch(error => {
              console.error("Error sending data to Lama:", error.response?.data || error.message);
          });
          

        }

        console.log("Comment posted successfully.");
      } catch (error) {
        console.error("Error posting comment:", error);
        process.exit(1);
      }
}



runQuery();