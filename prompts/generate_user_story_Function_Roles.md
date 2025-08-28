
# 🧩 PO Toolkit – Function Role Summary

This reference outlines the major functions used across the story generation, refinement, validation, and export process.

---

## 🧭 Part 1: Story Generation & Refinement Flow

| Function                     | Role in Flow                                              | Trigger Type      | LLM Call? | Output Type                      | Applied Automatically? |
|------------------------------|-----------------------------------------------------------|-------------------|-----------|----------------------------------|-------------------------|
| `generate_user_story`        | Initial structured story generation from raw input        | System/User       | ✅         | Story JSON                       | ✅ Yes (first render)   |
| `refine_story`               | Regenerates entire story per user instruction             | User              | ✅         | Updated Story JSON               | ❌ No (requires Apply)  |
| `refine_field`               | Regenerates a specific field in the story                 | User              | ✅         | Partial JSON `{ field: value }`  | ❌ No (requires Apply)  |
| `generate_recommendations`   | Asks GPT for suggestions to improve story (non-destructive) | User              | ✅         | List of recommendations          | ❌ No (user chooses)    |
| `build_suggestion`           | Compares before/after and constructs UI diff              | System            | ❌         | `suggestion` object              | ❌ No (user applies)    |
| `apply_suggestion`           | Applies selected suggestion to story state                | System/User       | ❌         | Updated Story JSON               | ✅ Yes (via button)     |

---

## 🔒 Part 2: Validation & Export Preparation

| Function             | Role in Flow                                                                 | Trigger Type      | LLM Call? | Output Type                 | Blocks Progress? |
|----------------------|------------------------------------------------------------------------------|-------------------|-----------|-----------------------------|-------------------|
| `early_evals`        | Validates AI-generated story before first display. Checks quality, structure, compliance. | System (Step 5)   | ❌         | Pass/Fail + feedback        | ✅ Yes            |
| `generate_dev_notes` | Adds developer-facing implementation notes using the full story as context   | System/User       | ✅         | JSON block of dev notes     | ❌ No             |
| `final_evals`        | Full story payload validation before push to ADO: schema, fields, compliance | System (Step 10)  | ❌         | Pass/Fail + feedback        | ✅ Yes            |

---

## 📌 Notes

- `generate_user_story` is the only function that runs on initial story creation.
- `refine_*`, `generate_recommendations`, and `apply_suggestion` are all optional parts of the refinement loop.
- `early_evals` runs after generation and before the story is shown to the user.
- `final_evals` is the last gate before exporting to Azure DevOps.
- `generate_dev_notes` enriches the story with developer-facing insights but doesn’t block progress.

---

*Generated with assistance from ChatGPT and Edited by Me*
