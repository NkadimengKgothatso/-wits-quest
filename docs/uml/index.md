# UML Diagrams

This section holds the system's UML documentation. None of these have been authored yet — each page below is a scaffold describing what should go in it and how to add the diagram.

| Diagram           | Page                                         | Status         |
| :---------------- | :------------------------------------------- | :------------- |
| Use Case          | [use-case.md](use-case.md)                   | 🔲 Not started |
| Class Diagram     | [class-diagram.md](class-diagram.md)         | 🔲 Not started |
| Sequence Diagrams | [sequence-diagrams.md](sequence-diagrams.md) | 🔲 Not started |
| Activity Diagrams | [activity-diagrams.md](activity-diagrams.md) | 🔲 Not started |

## How to add a diagram

MkDocs (with the default `mkdocs` theme) doesn't render Mermaid out of the box. Two options:

1. **Export as an image** (recommended for this theme) — draw the diagram in draw.io / Lucidchart / PlantUML, export as PNG/SVG, and drop it in `uml/images/`, then embed it:
   ```markdown
   ![Use case diagram](images/use-case-diagram.png)
   ```
2. **Switch to Mermaid rendering** — if you'd rather keep diagrams as editable text, swap the theme to `mkdocs-material` and enable the `pymdownx.superfences` Mermaid extension, or add the `mkdocs-mermaid2-plugin`. This is a bigger change to `mkdocs.yml` and affects the whole site's look, so worth deciding deliberately rather than per-page.

The database ERD in [Database Plan](../database/database-plan.md) is already written in Mermaid syntax as a placeholder for this — it will render as a fenced code block until one of the two options above is applied.
