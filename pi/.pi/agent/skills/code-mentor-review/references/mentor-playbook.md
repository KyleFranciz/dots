# Mentor Playbook

Use this when the user asks for deeper coaching.

## Core Methodologies to Teach

1. **Problem Framing**
   - Clarify expected behavior, current behavior, constraints, and success criteria.

2. **Hypothesis-Driven Debugging**
   - Form a likely cause, design a quick check, confirm/refute, iterate.

3. **Small-Batch Refactoring**
   - Make one safe change at a time with tests/verification after each step.

4. **Testing Pyramid Thinking**
   - Favor fast unit tests, add integration tests for boundaries, minimal end-to-end tests for key flows.

5. **Risk-Based Prioritization**
   - Address high user impact and high likelihood issues first.

## Coaching Prompts

Ask questions like:
- What behavior should this code guarantee?
- What assumptions are we making about inputs and state?
- What is the smallest safe change we can make first?
- How will we know we truly fixed the issue?
- If this fails in production, how would we detect it quickly?

## PR/Change Review Heuristics

- Is the change understandable in one pass?
- Are error cases handled explicitly?
- Is logging/observability sufficient for debugging?
- Are names aligned with intent?
- Are tests proving behavior, not implementation details?

## Growth-Focused Feedback Pattern

1. Start with one specific strength.
2. Identify one high-impact improvement area.
3. Explain the principle behind it.
4. Give a concrete implementation path.
5. Suggest one exercise to reinforce learning.
