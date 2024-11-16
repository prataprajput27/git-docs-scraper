const axios = require("axios");
const { GITHUB_API_URL } = require("../config/config");
const retryRequest = require("../utils/retry");

// function to fetch the content of a file using the GitHub API
async function fetchFileContent(owner, repo, filePath) {
  return await retryRequest(async () => {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${filePath}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });
    return Buffer.from(response.data.content, "base64").toString("utf-8");
  });
}

// function to recursively search for .md files in the repository
async function findMdFiles(owner, repo, dirPath = "") {
  return await retryRequest(async () => {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${dirPath}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    let mdFiles = [];
    for (const file of response.data) {
      if (file.type === "file" && file.name.endsWith(".md")) {
        mdFiles.push(file.path);
      } else if (file.type === "dir") {
        const subDirMdFiles = await findMdFiles(owner, repo, file.path);
        mdFiles = mdFiles.concat(subDirMdFiles);
      }
    }
    return mdFiles;
  });
}

module.exports = { fetchFileContent, findMdFiles };
