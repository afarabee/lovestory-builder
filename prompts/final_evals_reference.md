
# 🛑 `final_evals()` – Function Reference

The `final_evals()` function is the **last validation gate** before pushing a user story to Azure DevOps (ADO). It ensures the story meets all technical and compliance requirements for export.

---

## ⚙️ How It Works

Triggered just before the push to ADO, this function performs strict validations on:

1. Required fields for ADO schema
2. Tag and field formatting
3. Compliance checks (e.g., no PII, secure phrasing)
4. Dev notes presence (if required)
5. Adherence to story formatting and structure expectations

If any validation fails, the export is blocked and the user is shown remediation guidance.

---

## 🔍 Inputs

| Field             | Purpose                                                       |
|-------------------|---------------------------------------------------------------|
| `story`           | The full story or export-ready payload                        |
| `ado_requirements`| Optional config for required fields and allowed values        |
| `context`         | Used for tone, style, and compliance logic                    |
| `kb_files_text`   | Used to check alignment with program constraints              |
| `schema`          | Optional deep schema for ADO-ready validation                 |

---

## 🧪 Validations Performed

| Check Type        | Description                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| ADO Schema Check  | Fields: Title, Description, ACs, Points, Tags, Area Path, Iteration Path     |
| Data Format       | Story points is a number, tags are strings, ACs are list of strings          |
| Dev Notes         | Required fields are present or acceptable defaults used                      |
| Compliance        | No banned terms, PII, or malformed input                                     |
| Optional Schema   | JSON schema enforcement if schema is provided                                |

---

## 📦 Sample Output – Failure

```json
{
  "status": "fail",
  "issues": [
    "Missing required field: Iteration Path",
    "Acceptance criteria must be a list of bullet strings",
    "Dev notes are missing"
  ]
}
```

---

## ✅ Sample Output – Pass

```json
{
  "status": "pass"
}
```

---

## 🔁 Flow Behavior

| Outcome | What Happens              |
|---------|---------------------------|
| Pass    | Story is exported to ADO  |
| Fail    | Submission is blocked     |
| Both    | Result is logged to audit system |

---

*Generated with assistance from ChatGPT and Edited by Me*
