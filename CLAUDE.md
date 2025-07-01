# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview
[To be defined with new project plan]

## Development Commands
[To be configured based on new tech stack]

## Architecture Overview  
[To be documented with new implementation]

## Directory Structure
[To be established with new project structure]

## Development Workflow Rules

### 🚨 **MANDATORY FIRST RESPONSE PROTOCOL** 🚨

**⚠️ NON-NEGOTIABLE ⚠️ - Follow for EVERY user request:**

1. **ALWAYS scan for direct questions** (?, "why", "how", "what", "you didn't", "you ignored")
   - If found → Answer the question BEFORE any other work

2. **MANDATORY OUTPUT**: "Checking CLAUDE.md rules for this task..."

3. **MANDATORY RULE LISTING** - Always list which specific rules apply:
   **Auto-trigger detection**:
   - Creating/modifying code → "Applying: MINIMAL COMPLEXITY PRINCIPLE"
   - Code deletion requested → "Applying: CRITICAL VERIFICATION RULE"  
   - External libraries mentioned → "Applying: MCP IMPLEMENTATION TOOLS"
   - Analysis requests ("verify", "check", "analyze") → "Applying: EVIDENCE ENUMERATION"
   - Ambiguous requests → "Applying: PRE-ACTION VERIFICATION"
   - Multi-step tasks → "Applying: SYSTEMATIC COMPLETION PROTOCOL"
   - Simple informational → "No specific rules apply to this informational request"

4. **MANDATORY COMPLIANCE CHECK**:
   ```bash
   echo "🔍 AUTOMATED COMPLIANCE CHECK: Protocol adherence verified"
   echo "✅ RULE TRIGGER: [Specific rule] activated"
   echo "📊 COMPLIANCE STATUS: Following required protocol steps"
   ```

5. **ONLY THEN proceed with the actual work**

---

## Phase-Based Workflow: Context → Search → Implement → Validate

### **PRE-ACTION VERIFICATION PROTOCOL** 🛡️ CRITICAL

**BEFORE taking ANY action, verify understanding:**

**Trigger verification when request contains:**
- Vague verbs: "fix", "improve", "optimize", "enhance", "update", "refactor"
- Undefined pronouns: "this", "that", "it" (without clear referent)
- Scope gaps: Missing what/where/which specifics
- Multi-step tasks (>2 distinct actions)

**Required verification:**
```
Understanding Check:
- Actions required: [list each specific action]
- Undefined terms: [list ambiguous items]
- Missing context: [what needs clarification]
Decision: [PROCEED/CLARIFY] because [specific reason]
```

**Decision criteria:**
- **PROCEED** if: All actions specific, no undefined terms, clear scope
- **CLARIFY** if: Vague actions, undefined terms, unclear scope

---

### **MINIMAL COMPLEXITY PRINCIPLE** 🔍 CRITICAL

**Before creating ANY new code, think hard about simplicity:**

**Apply core principles:**
- **YAGNI**: Implement ONLY what is immediately necessary
- **KISS**: Choose the most straightforward approach available  
- **DRY**: Use existing libraries rather than reimplementing functionality

**MANDATORY SEARCH PROTOCOL:**
```bash
# 1. Direct name search
rg "exact_function_name|exact_component_name" --type-add 'web:*.{ts,tsx,js,jsx}' -t web

# 2. Pattern/keyword search
rg "validate.*email|email.*validation" --type-add 'web:*.{ts,tsx,js,jsx}' -t web

# 3. Import/export search
rg "import.*{similar}|export.*{similar}" --type-add 'web:*.{ts,tsx,js,jsx}' -t web

# 4. If unclear, use Task tool for comprehensive search
```

**Decision Matrix:**
- **EXTEND existing code** when: ≤3 new parameters, ≤50 lines, maintains single responsibility
- **CREATE new code** when: Different domain/responsibility, would break existing contracts
- **REFACTOR FIRST** when: Existing code unclear, would violate SOLID principles

**ERROR RESOLUTION HIERARCHY** (when fixing build/type errors):
1. **Security & Safety** - Never compromise
2. **Code Correctness** - Proper structure and logic
3. **Type Safety** - Maintain proper TypeScript typing
4. **Code Quality** - Readable, maintainable code
5. **Test Passing** - Only after above are satisfied

**❌ Never use quick fixes:** Remove imports, add @ts-ignore, use any type, delete code
**✅ Always use proper fixes:** Import types correctly, fix type mismatches, maintain explicit typing

---

### **CRITICAL VERIFICATION RULE** 🛑 CRITICAL

**⚠️ WARNING: CODE DELETION CAN CAUSE DATA LOSS ⚠️**

**MANDATORY verification before ANY code deletion:**

```bash
# Search for exact usage
rg "ExactItemName" . --type ts --type tsx --type js --type jsx -n

# Search for import/export usage
rg "import.*ExactItemName|export.*ExactItemName" . -n

# Search for React component usage (JSX)
rg "<ExactItemName|ExactItemName>" . --type tsx --type jsx -n

# Search for type annotations
rg ": ExactItemName|extends ExactItemName" . -n
```

**Decision Matrix:**
- ✅ **SAFE TO REMOVE**: Zero usage found in verification searches
- ❌ **DO NOT REMOVE**: Any usage found, even in same file
- ⚠️ **INVESTIGATE**: Usage only in comments or documentation

---

### **MCP IMPLEMENTATION TOOLS** 🔧 CRITICAL

**MANDATORY for external dependencies and complex implementations:**

**Complete MCP Workflow:**

**0. Context7 Research (MANDATORY for new implementations)**
```bash
# REQUIRED: Always research before writing code if not done in current planning
mcp__context7__resolve-library-id("[library/framework/tool-name]")
mcp__context7__get-library-docs("[resolved-id]" topic="[specific-implementation]")
```
**Required when:** Any new code, libraries, frameworks, or implementation patterns not researched in current session

**1. Memory Search (Always start here after Context7)**
```bash
mcp__memory__search_nodes("[implementation-type] patterns")
mcp__memory__search_nodes("[current-task-type] solutions")
```

**2. Additional Context7 Research (If needed for external dependencies)**
```bash
mcp__context7__resolve-library-id("[library-name]")
mcp__context7__get-library-docs("[resolved-id]", topic="[specific-topic]")
```

**3. Sequential Planning (For multi-step tasks)**
```bash
mcp__sequential-thinking__sequentialthinking("Plan [implementation] using [approach]")
```

**4. Memory Storage (Always finish with this)**
```bash
mcp__memory__create_entities({
  name: "[Decision/Pattern name]",
  entityType: "architecture|solution|pattern|decision",
  observations: ["Key learning", "Why this approach", "Trade-offs considered"]
})
```

**Required Documentation Format:**
```
Context7 Research: [library/topic] → [3-5 key insights applied to implementation]
Memory Search: "[keywords]" - Found: [results or none]
Implementation: [brief description of approach using research]
Memory Storage: "[what-stored]" - [entity-type] - [key-observations]
```

---

### **EVIDENCE ENUMERATION REQUIREMENT** 📊

**For analysis requests (verify, check, analyze, review):**

**Required format for ALL claims:**
[Finding]: [Evidence] ([Scope])

**Examples:**
❌ "Services have duplications"
✅ "Found 3 duplicate functions: validateEmail() in src/utils/validation.ts:15, src/auth/helper.ts:42, src/forms/validator.ts:28 (searched 15 TypeScript files)"

**Verification commands:**
```bash
# For finding examples
rg "pattern" . --type ts -n | head -5

# For counting scope  
find src -name "*.ts" | wc -l
rg "pattern" . --type ts --files-with-matches | wc -l
```

---

### **SYSTEMATIC COMPLETION PROTOCOL** 📋

**For comprehensive analysis tasks:**

**Progress tracking format:**
```
Scope: [X areas defined] ([verification command used])
Progress: [Y/X areas analyzed] ([files per area])
Evidence: [Z findings documented] ([example locations])
Verification: [Implementation matches specification] ([specific checks performed])
Status: [CONTINUE/COMPLETE] because [objective reason + verification results]
```

**Enhanced Decision Criteria:**
- **CONTINUE**: Any area shows 0 files analyzed OR missing evidence OR verification gaps
- **COMPLETE**: All areas have evidence AND verification confirms specification compliance OR objective reason for exclusion

---

## Unified Enforcement Framework

### **Risk Levels & Responses**

**🔴 CRITICAL RISK** (Data Safety, Security):
- MANDATORY enforcement - STOP if violated
- Zero tolerance for non-compliance

**🟡 HIGH RISK** (Workflow Integrity, Quality):
- REQUIRED enforcement - Flag warning if violated
- Extra verification steps applied

**🟢 MEDIUM RISK** (Best Practices, Optimization):
- RECOMMENDED enforcement - Note for improvement

### **Auto-Triggers**

**Context Detection:**
- File creation/modification → MINIMAL COMPLEXITY PRINCIPLE
- External dependencies → MCP IMPLEMENTATION TOOLS  
- Analysis language ("verify", "check") → EVIDENCE ENUMERATION
- Deletion requests → CRITICAL VERIFICATION RULE
- Ambiguous requests → PRE-ACTION VERIFICATION

### **Monthly Review Protocol**

**Key Metrics to Track:**
- Rule compliance rate per session
- Critical violations (should be zero)
- MCP tool usage for external dependencies
- Evidence provision for analysis claims
- Code reuse vs new creation ratio

**Simple Tracking Command:**
```bash
echo "📊 MONTHLY REVIEW: [Rule compliance %] - [Critical violations: X] - [Improvements needed]"
```

---

## Rule Integration Notes

**Workflow Triggers:**
- PRE-ACTION VERIFICATION → clarifies scope before other rules apply
- MINIMAL COMPLEXITY → search existing before MCP IMPLEMENTATION  
- MCP IMPLEMENTATION → use memory/context7 for informed decisions
- EVIDENCE ENUMERATION → support analysis claims with file evidence
- CRITICAL VERIFICATION → prevent data loss through systematic verification

**Cross-Rule Dependencies:**
- Memory search informs complexity decisions
- Context7 research guides implementation approach
- Evidence requirements apply to all analytical claims
- Verification protocols apply to all deletion actions

---

## Compliance Verification

**Before claiming task complete:**
□ Applied mandatory first response protocol
□ Followed phase-based workflow (Context → Search → Implement → Validate)  
□ Used appropriate verification for code changes
□ Applied MCP tools for external dependencies
□ Provided evidence for analytical claims
□ Stored institutional knowledge in memory
□ Maintained simplicity principles (YAGNI/KISS/DRY)