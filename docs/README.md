# Wits Quest Documentation

This directory contains all technical and project documentation for **Wits Quest**, designed to be deployed as a static site using MkDocs.

## Directory Structure
- **`project/`**: Game concept, functional requirements, and project scope.
- **`uml/`**: Use case, class, sequence, and activity diagrams detailing the system design.
- **`database/`**: Entity-relationship design and full table schema for Wits Quest.
- **`meetings/`**: Team meeting records and decisions log.
- **`development/`**: System architecture, Git workflows, and technical decisions.

## Deploying Documentation
This folder is configured for MkDocs (see `mkdocs.yml` in the root). To build or serve the documentation locally:

```bash
# Install MkDocs with the Material theme (if not already installed)
pip install mkdocs-material

# Run a local live-reloading server
mkdocs serve

# Build static files for deployment
mkdocs build
```

For the full documentation homepage used by MkDocs, please refer to [index.md](index.md).
