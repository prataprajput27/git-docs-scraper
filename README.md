# GitDocsScraper

**GitDocsScraper** is a Node.js application that allows you to fetch and combine all `.md` (Markdown) files from a GitHub repository into one single file. You can then choose to save the content in different formats such as `Markdown`, `HTML`, or `PDF`. This tool is particularly useful for aggregating documentation or README files from large repositories and provides the option to preview or download combined content.

## Features

- Fetches `.md` files from a specified GitHub repository.
- Supports three output formats: `Markdown`, `HTML`, and `PDF`.
- Handles nested directories and submodules to fetch all `.md` files.
- Allows previewing individual `.md` files as HTML.
- Supports retrying failed requests to handle network or rate limit issues.
- Saves the combined content to a designated folder.
- Provides easy-to-use API endpoints for listing and downloading `.md` files, or previewing them.

### Prerequisites

- Node.js (version 12 or above)
- npm (Node Package Manager)
