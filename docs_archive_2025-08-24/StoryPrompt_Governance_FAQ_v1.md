
# StoryPrompt Governance FAQ  
Version: 1.0  
Purpose: Provide quick-reference answers for prompt maintainers and reviewers.  
Domain: agnostic  

---

## 1. What is StoryPrompt?
StoryPrompt provides a structure-only instruction set for user-story generation. All domain logic and patterns live in separate artefacts.  

## 2. Which artefacts govern StoryPrompt?
- **StoryPrompt_StructureRules_v1.0** – defines field order and formatting.  
- **StoryPrompt_QA_Checklist_v1.0** – supplies validation rules.  
- **AEGScale_v1** – lists effort point definitions.  

## 3. How is Fluency Bias controlled?
Fluency Bias suppression appears in:  
- StoryPrompt enforcement list (`FluencyBiasSuppression`).  
- Style sections of Structure Rules and QA Checklist.  
Maintain a direct, assertive tone without filler or commentary.  

## 4. How does token monitoring work?
- Soft alert triggers at **10 000 tokens**.  
- Hard ceiling exists at **12 000 tokens**.  
- When approaching either threshold, split or archive context to maintain performance.  

## 5. What happens when the token ceiling is breached?
Archive the active context and relaunch with essential chunks only (`StoryPrompt_v1`, governance artefacts, and critical history).  

### ➕ Chunk Prioritisation on Reset
When restarting due to token pressure or ceiling breach, prioritise loading the following chunks first:
- `Chunk_StoryPrompt_v1`
- `Chunk_AEGScale_v1`
- `Chunk_StoryPrompt_QA_Checklist_v1.0` and `Chunk_StoryPrompt_StructureRules_v1.0` if QA enforcement is immediately required

## 6. How do I detect artefact bleed?
Watch for domain-specific phrases (e.g., “APIM-EXT”) in outputs where they are not relevant. Use the QA Checklist failure conditions to flag bleed.  

## 7. How do I reset a drifted prompt?
1. Reload `StoryPrompt_v1` and all governance chunks.  
2. Flush session memory that introduced drift.  
3. Re-run a smoke test using a simple input.  

## 8. Where are examples stored?
Examples live only in separate artefacts (e.g., `StoryPattern_Examples_v1`). StoryPrompt and its governance artefacts remain example-free.  

## 9. How do I update governance artefacts?
Create a new minor version (e.g., `v1.1`). Reference the new version in `StoryPrompt_v1` after validation. Preserve older versions for traceability.  

## 10. Who owns StoryPrompt governance?
Prompt maintainers listed in the project README own updates, reviews, and version bumps. Use pull-request workflow for changes.  

## 11. How can a user check current token usage?
A user may ask:
> **“How many tokens have been used in this conversation so far? Am I approaching the model’s token limit?”**
GPT should reply with:
- A real-time token estimate (e.g., “~7 050 tokens used”).  
- The soft limit (10 000) and hard limit (12 000).  
- Guidance that responses may split or shorten when limits approach.  
StoryPrompt remains valid even when GPT splits output for token management.

**Shortcut Prompt**:  
> **“Check context token load.”**  
GPT should respond with:
> *“You’ve used ~X tokens. Soft limit is 10,000. You have ~Y remaining.”*

## 12. What is a chunk?
A chunk is a named, versioned artefact block used in retrieval-based prompt systems. Each chunk contains one governance unit (e.g., prompt, ruleset, checklist). Chunks are loaded individually to reduce token load and enforce modular structure. The StoryPrompt system relies on chunks to separate structure enforcement from domain logic, making the prompt portable and scalable.
