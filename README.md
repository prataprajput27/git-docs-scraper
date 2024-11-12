# GitDocsScraper

**GitDocsScraper** is a Node.js application that allows you to fetch and combine all `.md` (Markdown) files from a GitHub repository into one single file. You can then choose to save the content in different formats such as `Markdown`, `HTML`, or `PDF`. This is especially useful for aggregating documentation or README files from large repositories.

## Features

- Fetches `.md` files from a specified GitHub repository.
- Supports three output formats: `Markdown`, `HTML`, and `PDF`.
- Handles nested directories and submodules.
- Supports retrying failed requests to handle network or rate limit issues.
- Saves the output in a designated folder.

## Installation

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (version 12 or above)
- npm (Node Package Manager)

### Steps

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/your-repository.git
   ```
