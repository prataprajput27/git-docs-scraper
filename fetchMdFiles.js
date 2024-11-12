require("dotenv").config(); // load environment variables
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const pdf = require("html-pdf");

const GITHUB_API_URL = "https://api.github.com";

// command-line argument setup using yargs for flexible input
const argv = yargs(hideBin(process.argv))
  .option("owner", {
    describe: "github owner name",
    type: "string",
    demandOption: true,
  })
  .option("repo", {
    describe: "github repository name",
    type: "string",
    demandOption: true,
  })
  .option("outputFormat", {
    describe: "output format (markdown, html, pdf)",
    type: "string",
    choices: ["markdown", "html", "pdf"],
    default: "markdown",
  }).argv;

// function to retry api requests in case of network errors or rate limits
async function retryRequest(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i < retries - 1) {
        console.warn(`retrying... (${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// function to fetch the content of a file using the github api
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
        mdFiles.push(file.path); // add markdown file to list
      } else if (file.type === "dir") {
        // if directory, recurse to find markdown files within it
        const subDirMdFiles = await findMdFiles(owner, repo, file.path);
        mdFiles = mdFiles.concat(subDirMdFiles);
      }
    }
    return mdFiles;
  });
}

// main function to fetch and save all .md files as one combined output
async function fetchAllMdFiles(owner, repo) {
  console.log(`fetching .md files from ${owner}/${repo}...`);

  // create "downloads" directory if it doesn't exist
  const downloadsDir = path.join(__dirname, "Downloads");
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
  }

  // find all .md files in the repository
  const mdFiles = await findMdFiles(owner, repo);
  if (mdFiles.length === 0) {
    console.log("no .md files found.");
    return;
  }

  console.log(`found ${mdFiles.length} .md file(s).`);

  // fetch the content of all .md files
  let allContent = "";
  for (const filePath of mdFiles) {
    console.log(`fetching content of ${filePath}...`);
    const content = await fetchFileContent(owner, repo, filePath);
    if (content) {
      allContent += `\n\n# ${filePath}\n\n${content}`;
    }
  }

  // save the combined content based on the selected output format
  const outputFileName = `${owner}-${repo}-combined.${argv.outputFormat}`;
  const outputFile = path.join(downloadsDir, outputFileName); // save in "Downloads" folder

  if (argv.outputFormat === "html") {
    // convert markdown to html
    const htmlContent = marked(allContent);
    fs.writeFileSync(outputFile, htmlContent, "utf-8");
    console.log(`html content saved to ${outputFile}`);
  } else if (argv.outputFormat === "pdf") {
    // convert markdown to html, then to pdf
    const htmlContent = marked(allContent);
    pdf.create(htmlContent).toFile(outputFile, (err, res) => {
      if (err) return console.log("error creating pdf:", err.message);
      console.log(`pdf saved to ${res.filename}`);
    });
  } else {
    // save as markdown
    fs.writeFileSync(outputFile, allContent, "utf-8");
    console.log(`markdown content saved to ${outputFile}`);
  }
}

fetchAllMdFiles(argv.owner, argv.repo);

/* usage example:
node fetchMdFiles.js --owner=username --repo=reponame --outputFormat=pdf      // for PDF output
node fetchMdFiles.js --owner=username --repo=reponame --outputFormat=html     // for HTML output
node fetchMdFiles.js --owner=username --repo=reponame --outputFormat=markdown // for Markdown output

node fetchMdFiles.js --owner=prataprajput27 --repo=Types-of-Tree-Traversal-Algorithms --outputFormat=pdf
node fetchMdFiles.js --owner=sukhpreet0607 --repo=slot-engine --outputFormat=pdf
*/
