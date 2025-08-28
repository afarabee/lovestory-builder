
# ✅ `early_evals()` – Function Reference

The `early_evals` function acts as a **quality gate immediately after story generation**, before the story is rendered in the UI. Its goal is to ensure the generated content meets internal quality, structure, and safety standards.

---

## ⚙️ How It Works

Triggered after the `generate_user_story()` function completes, `early_evals()` performs automated validation checks on the story JSON, including:

1. INVEST compliance
2. Proper formatting of Acceptance Criteria
3. Presence of required fields (Title, Description, AC, Points, Tags)
4. Content safety (PII, hallucinations, length)
5. Adherence to organizational style rules (e.g., no Gherkin, no DoD)

If any check fails, the story is not shown in the UI. Instead, remediation suggestions or fallback options are surfaced.

---

## 🔍 Inputs

| Field      | Purpose                                |
|------------|----------------------------------------|
| `story`    | The full JSON output from generation   |
| `context`  | Used for tone, field expectations, etc |
| `schema`   | Optional: JSON schema to validate against |
| `kb_files_text` | Optional: for advanced compliance checks |

---

## 🛑 Checks Performed

| Check Type         | Description                                                           |
|--------------------|-----------------------------------------------------------------------|
| Structural          | Title, Description, AC, Points, Tags are all present and well-formed |
| Format              | AC must be bullet points (no Gherkin or numbered list)               |
| Content safety      | Flags for PII, banned keywords, or hallucinated phrases              |
| Business alignment  | Matches tone/format in context; fits INVEST                         |
| Optional: JSON schema | Deep validation if schema is provided                               |

---

## 🧪 Sample Return (Fail)

```json
{
  "status": "fail",
  "issues": [
    "Acceptance criteria are missing.",
    "Story points field is not a number.",
    "Do not include 'Definition of Done'."
  ]
}
```

## ✅ Sample Return (Pass)

```json
{
  "status": "pass"
}
```

---

## 🔁 Follow-up Actions

| Outcome | What Happens |
|---------|--------------|
| Pass    | Story is rendered in the UI                  |
| Fail    | User sees GPT-generated or rule-based feedback |
| Optional | Auto-correct can be offered in some cases    |

---

*Generated with assistance from ChatGPT and Edited by Me*
