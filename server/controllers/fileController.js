const path = require("path");
const fs = require("fs");
const { marked } = require("marked");
const pdf = require("html-pdf");
const githubService = require("../services/githubService");
const { DOWNLOADS_DIR } = require("../config/config");

// API to list all .md files
const listMdFiles = async (req, res) => {
  const { owner, repo } = req.query;

  if (!owner || !repo) {
    return res.status(400).send("Missing required parameters: owner, repo.");
  }

  try {
    const mdFiles = await githubService.findMdFiles(owner, repo);

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
};

// API to download combined .md, HTML, or PDF file
const downloadCombined = async (req, res) => {
  const { owner, repo, outputFormat = "markdown" } = req.query;

  if (!owner || !repo) {
    return res.status(400).send("Missing required parameters: owner, repo.");
  }

  try {
    const downloadsDir = path.join(__dirname, "../", DOWNLOADS_DIR);
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    const mdFiles = await githubService.findMdFiles(owner, repo);
    if (mdFiles.length === 0) {
      return res.status(404).send("No .md files found in the repository.");
    }

    let allContent = "";
    for (const filePath of mdFiles) {
      const content = await githubService.fetchFileContent(
        owner,
        repo,
        filePath
      );
      if (content) {
        allContent += `\n\n# ${filePath}\n\n${content}`;
      }
    }

    const outputFileName = `${owner}-${repo}-combined.${outputFormat}`;
    const outputFile = path.join(downloadsDir, outputFileName);

    if (outputFormat === "html") {
      const htmlContent = marked(allContent);
      fs.writeFileSync(outputFile, htmlContent, "utf-8");
      return res.download(outputFile);
    } else if (outputFormat === "pdf") {
      const htmlContent = marked(allContent);
      pdf.create(htmlContent).toFile(outputFile, (err, response) => {
        if (err) {
          return res.status(500).send("Failed to generate PDF.");
        }
        return res.download(response.filename);
      });
    } else {
      fs.writeFileSync(outputFile, allContent, "utf-8");
      return res.download(outputFile);
    }
  } catch (error) {
    return res
      .status(500)
      .send("An error occurred while processing your request.");
  }
};

// API to preview a specific markdown file
const preview = async (req, res) => {
  const { owner, repo, filePath } = req.query;

  if (!owner || !repo || !filePath) {
    return res
      .status(400)
      .send("Missing required parameters: owner, repo, filePath.");
  }

  try {
    const content = await githubService.fetchFileContent(owner, repo, filePath);

    if (!content) {
      return res.status(404).send("File not found or empty content.");
    }

    const htmlContent = marked(content);

    return res.send(htmlContent);
  } catch (error) {
    return res
      .status(500)
      .send("An error occurred while processing your request.");
  }
};

module.exports = { listMdFiles, downloadCombined, preview };
