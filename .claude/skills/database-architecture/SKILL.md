
I want you to act as a senior Database Architect and help me design the database schema for my project.

### Project context

I am building a full-stack application called **Learn English App**.

The application is an English-learning platform.

The current stack is:

* PostgreSQL
* Neon
* Drizzle ORM
* NestJS backend
* React + Vite frontend
* Turborepo monorepo

The application will contain different types of English-learning content and activities.

Potential concepts include:

* Users
* English lessons
* Courses / learning paths
* Vocabulary
* Words and phrases
* Exercises
* Questions
* Answers
* Learning activities / games
* User progress
* Scores
* Attempts
* Levels
* Categories / topics
* Audio
* Images
* Potentially AI-generated learning content in the future

The exact domain model is **not finalized yet**.

### Important: do NOT immediately write the final schema

I want this to be a **database architecture discussion**, not a schema-generation task.

Your job is to:

1. Understand the product and domain first.
2. Ask me questions about the requirements.
3. Challenge my assumptions.
4. Identify missing concepts.
5. Point out potential modeling problems.
6. Explain trade-offs between different approaches.
7. Help me decide what should actually exist in the database.
8. Only after the important decisions have been discussed, propose the final schema.

Do not assume that every concept listed above necessarily needs its own table.

### Important architectural questions

Discuss decisions such as:

* Should courses, lessons, and activities be separate entities?
* What is the difference between a lesson and an exercise in our domain?
* Should vocabulary words be global entities or belong to lessons?
* Should phrases/sentences be modeled separately from words?
* How should different exercise types be represented?
* Should exercises use a generic model or separate tables per exercise type?
* How should questions and answers be modeled?
* How should correct answers be represented?
* How should user attempts be stored?
* How should progress be calculated and persisted?
* Should progress be stored per course, lesson, activity, exercise, or multiple levels?
* Should scores be stored or calculated?
* How should levels (A1, A2, B1, etc.) be modeled?
* Should categories/topics be normalized?
* How should audio and images relate to learning content?
* Should media be stored directly on entities or through separate tables?
* Which content should be reusable across multiple lessons?
* How should content versioning work if lessons change?
* How should user-generated or AI-generated content be modeled?
* Which data belongs in relational columns versus JSONB?
* Which relationships should use foreign keys?
* Which constraints should PostgreSQL enforce?
* Which indexes are actually necessary?
* Which fields should be nullable?
* Which fields should have unique constraints?
* How should the schema evolve as the application grows?

### Avoid premature complexity

This is the foundation of the application.

Do NOT create an enterprise-level schema just because a feature might exist someday.

Prefer:

**simple → correct → extensible**

over:

**complex → theoretically scalable → difficult to maintain**

If a future feature does not justify a table today, explicitly tell me that we should probably NOT model it yet.

### Separate recommendations into

**Required now**

Things the current product genuinely needs.

**Useful soon**

Things that are likely to become useful as the application develops.

**Only if the product evolves**

Things that should not be introduced until there is an actual requirement.

### Discussion rules

Do not ask me 20 questions at once.

Start with a short assessment of the domain and ask me the **3–5 most important questions** needed to understand the product.

After I answer:

1. Analyze my answers.
2. Identify architectural consequences.
3. Challenge questionable decisions.
4. Ask the next small set of questions.
5. Gradually build the domain model.

Do not generate the final SQL or Drizzle schema until we have reached enough clarity.

### When we eventually have enough information

Produce:

1. Conceptual data model
2. Entities and their responsibilities
3. Relationships
4. Relationship cardinality
5. Important constraints
6. User-progress model
7. Exercise/question model
8. Content-reuse strategy
9. Media strategy
10. Indexing strategy
11. PostgreSQL schema
12. Drizzle ORM schema
13. Migration considerations
14. Explanation of the major architectural decisions
15. What we deliberately decided NOT to model yet

### Reviewer mindset

Do not simply agree with me.

Act as a senior architect reviewing my decisions.

If I propose something questionable, say clearly:

> "I would not recommend this, because..."

Then explain:

* Why it is problematic
* What alternatives exist
* What trade-offs they introduce
* Which option you recommend

Also distinguish between:

**Domain requirements**

and

**Implementation decisions**

Do not let implementation details such as Drizzle or NestJS prematurely dictate the domain model.

### Goal

By the end of this discussion, I want to understand not only **what tables we should create**, but **why each table exists, what responsibility it has, and why the relationships between the tables are designed that way**.

Let's begin.
