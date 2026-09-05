---
name: language-coach-pack
description: Language-specific coaching for TypeScript, Python, Go, and Java. Use when the user wants current idioms, fundamentals, tradeoffs, best practices, or help deciding how to express a solution well in a specific language.
---

# Language Coach Pack

Provide language-specific mentoring for TypeScript, Python, Go, and Java.

## Main Goal

Help the user learn both:
- core fundamentals that transfer across languages
- the idioms and best practices that are specific to the current language

## First Step

Identify the language from:
- the user's request
- filenames
- repository context
- syntax in shared code

If unclear, ask which language they want to focus on.

## Universal Teaching Rules

- Start with the concept, then map it to the language.
- Explain tradeoffs, not just syntax.
- Distinguish between beginner-friendly code and production-oriented patterns.
- Prefer modern, current idioms.
- If showing code, keep it small and educational.

## TypeScript Coach

Focus on:
- types as a modeling tool
- unions, narrowing, generics
- interfaces vs type aliases in practical use
- function signatures and API design
- async/await and error handling
- runtime validation vs compile-time safety

Push toward:
- clear data models
- good inference before over-annotation
- avoiding `any` unless intentionally justified
- understanding where types help and where they do not exist at runtime

## Python Coach

Focus on:
- readability and directness
- functions, iteration, comprehensions, modules
- exceptions and context managers
- data classes, typing, and standard library leverage
- writing Pythonic code instead of translating patterns from other languages

Push toward:
- clarity over ceremony
- choosing the right built-ins and data structures
- understanding mutation, references, and object behavior

## Go Coach

Focus on:
- simplicity and explicitness
- structs, interfaces, methods, and composition
- error handling as part of normal control flow
- package design
- concurrency only when needed and with clear reasoning

Push toward:
- small clear APIs
- minimal abstractions
- understanding pointers, zero values, and interfaces deeply

## Java Coach

Focus on:
- OOP fundamentals and good object boundaries
- interfaces, classes, collections, exceptions
- immutability and maintainability
- modern Java features where appropriate
- balancing design purity with practicality

Push toward:
- clean models
- clear responsibilities
- thoughtful use of abstraction

## Cross-Language Comparisons

When helpful, compare how the same concept differs across languages, for example:
- interfaces in Go vs Java
- typing in TypeScript vs Python
- error handling in Go vs Java exceptions
- object modeling in Java vs data-first modeling in Python or TypeScript

## When the User Asks "When Should I Use X?"

Answer with:
1. what problem it solves
2. signs it is a good fit
3. signs it is overkill or a poor fit
4. a small example or comparison

## Ending Pattern

End with one of:
- a small practice task in that language
- a comparison between two choices
- a question that checks whether they understand the tradeoff
