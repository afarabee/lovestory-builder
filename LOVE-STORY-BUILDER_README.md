
# 📖 LOVE-STORY-BUILDER – Developer README (Draft)

This README provides a high-level overview of the **AI-Assisted User Story Generator** codebase and flow.  
⚠️ **Note:** Some functions are **incomplete or not validated**. This README is **not final** and will evolve.

---

## 🧭 End-to-End Flow Coverage

The following stages of the flow are represented in code and/or documentation within this repo:

1. **User Story Generation**
   - **File:** `generate_user_story.py`
   - **Refs:** `generate_user_story_flow.md`, `generate_user_story_Function_Roles.md`, `generate_user_story_reference_REORG.md`
   - **Purpose:** Generates initial structured story from `raw_input`, `context`, `custom_prompt`, `file_content`, and `kb_files_text`.
   - **Status:** ✅ Implemented, validated with Responses API (`gpt-5`, `temperature=0.0`).

2. **Early EVALS**
   - **File:** `early_evals.py`
   - **Ref:** `early_evals_reference.md`
   - **Purpose:** Runs validation (INVEST, AC formatting, required fields, compliance).
   - **Status:** ✅ Defined and documented.

3. **Refinement Loop**
   - **Files:** `refine_story.py`, `refine_field.py`
   - **Ref:** `refine_story_and_field_reference.md`
   - **Purpose:** Refine whole story or single field, always post-generation.
   - **Status:** ✅ Structured and documented.

   - **Recommendations**
     - **Files:** `generate_recommendations.py` (scaffold), `generate_recommendations_reference.md`
     - **Purpose:** Suggests 1–3 improvements, user applies selectively.
     - **Status:** ⚠️ Scaffold + docs exist, not yet validated.

   - **Suggestions (Diff + Apply)**
     - **File:** `story_suggestion.py`
     - **Ref:** `suggestion_handling_reference.md`
     - **Tests:** `test_story_suggestion.py`
     - **Purpose:** Build diff between story versions, apply selected suggestion, support undo/audit.
     - **Status:** ✅ Implemented, pytest scaffold included.

4. **Developer Notes**
   - **Ref:** `generate_dev_notes_reference.md`
   - **Purpose:** Adds developer-facing notes for implementation guidance.
   - **Status:** ⚠️ Doc exists, Python function not yet scaffolded.

5. **Final EVALS**
   - **Ref:** `final_evals_reference.md`
   - **Purpose:** Last gate before ADO export; validates schema, compliance, dev notes presence.
   - **Status:** ✅ Documented, no `.py` yet.

6. **Export to ADO**
   - **Purpose:** Push validated story to Azure DevOps.
   - **Status:** 🚧 Not yet scaffolded in code.

---

## 🧪 Testing

- **File:** `test_story_suggestion.py`
- **Purpose:** Pytest scaffold for suggestion handling (`build_suggestion`, `apply_suggestion`).
- **Coverage:** Full vs field scope, drift warnings, malformed suggestions.

---

## 🚧 Incomplete or Not Yet Validated

- `generate_recommendations.py` – scaffold exists, not validated.
- `generate_dev_notes.py` – only documentation exists.
- `final_evals.py` – reference doc exists, Python implementation TBD.
- `ADO export function` – missing.

---

## ⚠️ Notes

- Default model is standardized as **`gpt-5`**.
- All LLM calls use `temperature=0.0` for deterministic outputs.
- README is **not final** and will evolve as functions are validated and scaffolds are completed.

---


