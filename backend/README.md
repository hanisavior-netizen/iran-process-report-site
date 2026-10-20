# Assistant page context

`assistant-page-context.js` sends page, visible section/question and selected chart controls with each chat request. It does not collect form inputs or page text. The assistant drawer itself is excluded from viewport selection.

`assistant_context.py` resolves these identifiers against the server's own site snapshot and chart data. Explicit topics and years in the user's question take precedence. Context is navigation metadata, never factual evidence. Exact chart sources retain their release embargo and citations.

Deployment: copy `assistant_context.py` next to the active `assistant_backend.py`, then run `python3 tools/enable-assistant-context.py assistant_backend.py`. The patch preserves provider configuration and adds the module to the existing Dockerfile. Rebuild the knowledge index after changing frontend resources, then rebuild the web container. No VPN configuration or credentials belong in this repository.

Tests: `python -m unittest discover -s backend -p 'test_*.py'`.
