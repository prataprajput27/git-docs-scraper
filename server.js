require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const pdf = require("html-pdf");

const app = express();
const PORT = 3000;
const GITHUB_API_URL = "https://api.github.com";

// function to retry API requests in case of network errors or rate limits
async function retryRequest(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i < retries - 1) {
        console.warn(`Retrying... (${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

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

// API to list all .md files
app.get("/listMdFiles", async (req, res) => {
  const { owner, repo } = req.query;

  if (!owner || !repo) {
    return res.status(400).send("Missing required parameters: owner, repo.");
  }

  try {
    console.log(`Listing .md files from ${owner}/${repo}...`);
    const mdFiles = await findMdFiles(owner, repo);

    if (mdFiles.length === 0) {
      return res.status(404).send("No .md files found in the repository.");
    }

    return res.json({ message: "Markdown files found", files: mdFiles });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .send("An error occurred while processing your request.");
  }
});

// API to download combined .md, HTML, or PDF file
app.get("/downloadCombined", async (req, res) => {
  const { owner, repo, outputFormat = "markdown" } = req.query;

  if (!owner || !repo) {
    return res.status(400).send("Missing required parameters: owner, repo.");
  }

  try {
    console.log(`Fetching .md files from ${owner}/${repo}...`);

    const downloadsDir = path.join(__dirname, "Downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    const mdFiles = await findMdFiles(owner, repo);
    if (mdFiles.length === 0) {
      return res.status(404).send("No .md files found in the repository.");
    }

    let allContent = "";
    for (const filePath of mdFiles) {
      console.log(`Fetching content of ${filePath}...`);
      const content = await fetchFileContent(owner, repo, filePath);
      if (content) {
        allContent += `\n\n# ${filePath}\n\n${content}`;
      }
    }

    const outputFileName = `${owner}-${repo}-combined.${outputFormat}`;
    const outputFile = path.join(downloadsDir, outputFileName);

    if (outputFormat === "html") {
      const htmlContent = marked(allContent);
      fs.writeFileSync(outputFile, htmlContent, "utf-8");
      console.log(`HTML content saved to ${outputFile}`);
      return res.download(outputFile);
    } else if (outputFormat === "pdf") {
      const htmlContent = marked(allContent);
      pdf.create(htmlContent).toFile(outputFile, (err, response) => {
        if (err) {
          console.error("Error creating PDF:", err.message);
          return res.status(500).send("Failed to generate PDF.");
        }
        console.log(`PDF saved to ${response.filename}`);
        return res.download(response.filename);
      });
    } else {
      fs.writeFileSync(outputFile, allContent, "utf-8");
      console.log(`Markdown content saved to ${outputFile}`);
      return res.download(outputFile);
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .send("An error occurred while processing your request.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
