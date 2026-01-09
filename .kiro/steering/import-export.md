# Import / Export (CSV)

## Goal
Make it easy for judges to install, run, and see value.
No integrations.
CSV only.

## CSV 1: actions.csv
Headers:
- title
- why
- owner_role (Owner|Ops|Sales|Finance)
- engine (Leadership|Operations|Marketing & Sales|Finance|Personnel)
- eta_days
- status (todo|doing|done)
- due_date (YYYY-MM-DD, optional)

Rules:
- title is required.
- why is one sentence.
- eta_days defaults to 7 if missing.
- due_date can be blank.

## CSV 2: goals.csv
Headers:
- level (north_star|department)
- department (Ops|Sales/Marketing|Finance, blank for north_star)
- title
- metric (optional)
- current (optional number)
- target (optional number)
- due_date (YYYY-MM-DD, optional)
- alignment_statement (required for department goals)

Rules:
- Exactly one row where level = north_star.
- Up to 3 rows where level = department.
- Every department goal must include alignment_statement.

## Export behavior
- Export always creates both CSVs.
- Export should work from the dashboard with one click.

## Import behavior
- Import validates headers first.
- If validation fails, show:
  - bad rows count
  - first 5 errors
  - a download link to the “fixed template” CSV

## Templates
Provide “Download template” buttons for both CSVs.
