# Tickets to create

Follow-ups that came out of the exploratory-testing / bugfix pass but were
deliberately not implemented in it. Each notes why it was deferred.

## JUPYTER-OFFLINE — vendor Pyodide and the grading wheels

**Priority:** medium. **Decided:** deferred by Pierluca (acceptable for now, 2026-07-26).

Grading a Jupyter submission needs the Pyodide runtime and the nbconvert /
otter-grader wheels, which are fetched at runtime from jsDelivr and PyPI:
- `apps/jupyter/dist/app/extensions/@jupyterlite/pyodide-kernel-extension/static/*`
  falls back to `https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js`
- the wheels are pulled via micropip / piplite from PyPI

Consequence: **Jupyter grading cannot work behind a school firewall** that
blocks those hosts. The submit-hang fix (branch `test/jupyter-student-flow`)
makes that failure *graceful* — the student gets a translated
"could not prepare the Python environment" message and their work is saved —
but it does not make grading *work* offline.

Fix (not verifiable without a full JupyterLite build, hence deferred):
- `jupyter lite build --pyodide <pyodide-0.29.0 tarball>` in
  `apps/jupyter/Taskfile.yml`
- add `pyodideUrl` + `disablePyPIFallback` under `litePluginSettings` in
  `apps/jupyter/jupyter-lite.json`
- mirror the nbconvert wheels next to the otter wheel already vendored under
  `apps/jupyter/dist/app/pypi/`

Also open, and worth folding into the same ticket: grading is confirmed to
**terminate** under headless Chromium but has never been observed to
**complete** there. Whether it completes in a real browser is untested. See
`SESSION-LOG-2.md` (B5) for the full trace.
