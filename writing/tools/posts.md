# Writing: English translation drafts (for review)

Source: LinkedIn posts, Google Doc tabs 1–11 (oldest → newest). Dates are TBD.
Image files: `photos.zip` → `tab1.jpeg` … `tab11.jpeg` (same numbering).
Images with Hebrew text that need English versions: tab4, tab8, tab11 (translations at the bottom).

---

## 1. The future isn't designing faster. It's making better decisions.
Date:

Ever wondered what it would feel like to have a senior UX advisor sitting on your shoulder, mentoring you personally?

Not just a chat, but someone who knows the full set of considerations, has the complete picture of your strategy, and understands your goals, constraints, context, and design agenda. Real systems thinking.

As AI makes development cheaper, designers will have to move from the "mockup department" to strategic architects. Development is becoming a commodity, like buying sugar at the supermarket. Analyzing and planning what to build, and how, becomes the real premium, because putting a bad product in front of the market is still an expensive mistake. And one more point: the real bottleneck is the product ping-pong, especially in complex systems.

To bridge that gap, I built Doppler, an enterprise agentic UX infrastructure that runs as an agent.

I taught it to think and gave it an operating system. I connected the following knowledge layers:

**🧭 The strategic layer**

- **Domain mapping.** Domain-specific "guardrails" (finance, CRM, operations) with tailored strategy and focus.
- **Persona model.** A synthesis of 100 users into precise statistical archetypes, including plans, segments, and roles.
- **The organization's UX principles.** Think of them as the "Ten Commandments."
- **Product glossary.** Syncs organizational terminology so the right terms are used.
- **Global UX guidelines.** Categorization, navigation, taxonomy.

**🔬 The product "physics" layer**

*("Domain lenses": mapping different weights according to the specific domain of the product under review.)*

- **Principle prioritization.** Which UX principles are primary, and which are secondary?
- **"Blast radius."** How risky is it if the user makes a mistake?
- **Flow rate.** How dynamic is the data? How often do updates occur?
- **Read/write ratio.** User intent: is the user consuming information or entering it?

**📐 The engineering layer**

- **Component mapping.** Enforcing the design system (when to use a component, when not to).
- **Laws of UX.** An external source used as supporting fire only.
- **Constraints.** Inherent infrastructure limits that can't be flexed.
- **Witch hunt.** Active monitoring for logical gaps and missing edge cases.
- **Redundancy check.** Scanning for components that compete or collide with each other.

I identified where the gaps were and instructed the agent how to handle them. For example:

- **Solving "the missing middle."** The agent understood the high level and the tactical goal, but lacked context for the hierarchical structure of the product.
- **Difficulty understanding flows and states.** Figma files are two-dimensional canvases, but user flows are chronological timelines. I instructed it to follow frame numbers (if there are any) or, at minimum, to read left to right linearly, stay aware of the surrounding frames, ignore the graveyard, and build contextual memory.

So how does it work? The designer points it to Figma, or to any other document (a PRD works too), provides a bit of context, and waits for the report. From there, they can keep consulting it.

It's a Principal Designer in your pocket. It enables objective discussion, instantly raises the architectural level, makes deliverables more robust, and measurably reduces the company's business risk. It doesn't decide for you. It simply makes sure you're aware of the trade-offs.

**What's next?** Building a sub-agent that can reach the code and customer feedback:

- Access to the codebase via a git repo, to understand how the code is built and which states already exist there
- Access to customer feedback, for broader and tighter context between the problem space and the solution space

Interested? Comment, and I'll run a webinar on how it works.

---

## 2. Spoiler: this isn't a post about AI
Date:

Yesterday I drove into an underground parking garage using the parking app from work, and I forgot the spot number I'd been given.

I opened the app to check.
No internet.
No information.

The number wasn't saved locally.
Since then, I make sure to memorize it before every entry into the garage.

A parking app that doesn't work without internet inside an underground garage isn't a technical edge case.

It's the core use case.

Design for the real environment the product operates in.

(Or let your AI agent do it for you 😉)

---

## 3. What the agent doesn't know, it makes up
Date:

What the agent doesn't know, it invents, with its best guess. A wild plant (generic).

An agent isn't limited by the model. It's limited by how clearly you wrote down what is true about your product. Make sure the gaps are filled with the truth, not with guesses:

- Build an infrastructure of product truth.
- Instruct the agent to report what it relied on.
- Instruct the agent to surface whatever isn't covered.
- This isn't prompts, it's a system. Build a flow in which the agent teaches itself: it checks itself against the truth and records what it needs to remember so it doesn't repeat the same mistake.

And where does all of this lead? To a world where software is created on demand.
The company's role changes: it no longer just builds the feature, it builds the infrastructure that lets users produce the solution they need for themselves.

---

## 4. Babysitting agents: an agentic workflow with no Figma in the loop
Date:

Lately I've been working with a team on an agentic workflow.

No Figma in the loop. What is there? A babysitter for agents 👣🍼

**1. It starts with documentation:** Brief, PRD, UX spec. We use BMAD to turn the thinking stage into context that agents can work with.

The documentation isn't a record of the product work. It is part of the product work itself.

This is the stage where we try to make intent, taste, strategy, UX, and product decisions more deterministic. Less amorphous. Less dependent on interpretation. Clearer to an agent that has to act from this context without guessing.

Instead of designing on a canvas, the role moves to that of a director: together with BMAD, we pour the thinking, the decisions, and the problems to be solved into a context layer that agents can run.

This is documentation for agents, not for developers.

Its goal isn't to explain to a human what to do, but to narrow the agent's guessing space.

**2. From there we move to Claude Design** to produce a first version of the prototype: not just a sketch, but a working machine. The reason for this step is mainly that Claude Design currently appears to be the strongest on the market at this, after a lot of testing. The design system is connected, but it's still a "simulacrum." The goal is to generate discussion around the prototype, which is much faster and more effective than the traditional method (see: prototype-driven development).

It's a de-risking process.

**3. The interesting part is the connection between Claude Design and Claude Code**, which recently got a boost from Anthropic.

The prototype moves to a stage where it's rebuilt with the real code: with tokens, components, rules, and local execution. With the right skills, we end up with a prototype that becomes an artifact developers can use. Not close. Exact.

**4. But the loop that intrigues me most is what happens after the build.**

Over time, the system collects signals from building prototypes: where there was a deviation from the design system, where context was missing, and where the agent had to guess.

**5. From there, an agent runs autonomously**, analyzes recurring patterns, and proposes improvements to the process itself or to the system, all the way to a draft PR that can be reviewed and approved.

It's still experimental, but it's already proving itself:
The prototype isn't just built faster.
It also feeds back into the system that builds the next prototype.

**The next step:** stop being the agents' babysitter and build the agentic loop end to end.

---

## 5. Yes Figma, no Figma. Let's set the record straight.
Date:

Figma is a tool with a vector engine. What does vector mean? A mathematical description of shapes. "Draw a rectangle from point X,Y, 200 wide and 100 high, with a blue fill and rounded corners."

But here's the reality: vector isn't really relevant to product design. The final product lives in code, and vector design is, as of today, a mediation layer. Especially now, when the world is moving toward designing for agents (A2A), and beyond that toward ontology systems that define logic, relationships, and meaning.

Still, if you look at Figma's latest releases, you'll see their strategy refocusing on craft, the deep essence of being a designer.

On one hand, that's great. On the other, it narrows Figma's role. It no longer needs to be a critical link in product development, and certainly not the source of truth. It can be, but it doesn't have to be. Figma's natural place is a sophisticated whiteboard and a place to refine craft.

Designing in code matters because it forces designers to reckon with the medium itself and become experts in the real raw material of the software they create. It opens up an incredible world (and it's insanely fast and scalable). Not code for production. That designers work in code doesn't mean it goes straight to the production line. Code has many uses. It's a raw material.

Instead of drawing "dead fish" in Figma, we build a machine (a prototype).

Note this figure: two thirds of Figma's active users aren't designers at all. Figma has long been an organizational workspace, which is why it's so hard to unravel from the process.

On one thing they're certainly right: Design is everyone's business.

---

## 6. Two myths to break for the weekend
Date:

Let's break two myths this weekend 🌞:

**1️⃣ Designing in code ≠ production code. Not the same thing.**

- Code is a raw material with many uses. If I built a prototype of a bicycle in a bicycle factory, that doesn't mean it goes straight to the production line, right? The code can be thrown in the trash at the end of the process, but it serves a purpose, and it matters for designers to learn to "sculpt" in code. To understand how a machine is built.
- A prototype, as its name says, is a version meant to test an idea before building the final product. Designing in code has more advantages than disadvantages at this point in time. We design products, not screens.
- Designing in code isn't just vibe coding. It's mostly documentation, infrastructure, agentic systems, and machine maintenance. Which brings me to the next myth:

**2️⃣ Not a programmer ≠ not technical. Not the same thing.**

- Anyone who is good at breaking down complex problems, systems thinking, understanding architecture, and analysis can be a good builder.
- You can be very technical without writing code by hand, just as you can be a professional photographer without knowing how to build a camera.
- You can be very technical and an excellent designer (any other thought encourages stigma).

---

👩🏼‍💻 The corporate world forced us into a divide-and-conquer approach to roles. But it's an artificial separation, a paradigm. And it's not me saying so, but people smarter and more talented than me:

- **The CEO of Vercel (a product I'm in love with):**
  "Everyone is a programmer now, because the programming language of the present and future is your natural language. If you can write or speak, you can build. It's the most important development in our field since its inception. And it's a tsunami that has only just begun."

- **Boris Cherny, creator of Claude Code:**
  "I started to think that this idea of engineering versus design versus product versus research versus data science, I think that's the old way of thinking about it. My sense now is that because everyone can write code, the roles are changing."

---

## 7. Meet Brad
Date:

Meet Brad 👨‍💻. Hand on heart: how many of you run autonomous agents end to end, for real? Don't you feel that depending on yourself as an operational go-between is unnecessary?

Brad has an email, he has Slack, he knows the CEO and the VP Product, and he even has a soul, bless him (soul.md). I wanted to buy him a Mac mini to run 24/7, but we're on a trial period and we're still building mutual trust. I want to feel I can rely on him.

Here's what happened.

As part of a routine feedback loop with stakeholders on a redesign of one of our products, I found myself exchanging 88 Slack messages and building 24 fix patches in Claude for the agent that would update the prototype. Then I realized I had become the bottleneck myself.

He's a wonderful designer, but there are complex trade-offs at the product level that need agreement, and I was skeptical it was too big for him. I asked myself: could he carry a real product decision from beginning to end, without me standing over him and guiding every step?

On his first real task, Brad came back with 38 decisions, 8 of which he honestly flagged as contentious, and 5 precise questions that truly required human judgment.

He's not a chatbot with a role. He's a soul-driven actor inside a script. He's our first attempt at building an AI employee: one that takes responsibility for commitments, remembers why decisions were made, and stays accountable as the work evolves.

To make that happen, I wanted to close a single workflow loop, measure it under lab conditions, and over time give him more freedom to act.
He has a deterministic governance layer that defines the boundaries of authority within which he exercises autonomous judgment before I step in.

He has his own verification mechanisms: tests, evals, and linting that run on their own. He also analyzes telemetry and proposes improvements to himself. The ongoing loop: Brad isn't triggered by a one-off prompt. He wakes up from an event in Slack, loads context, works, updates the iteration state, and goes back to waiting.

Feedback becomes evidence, evidence becomes decisions, decisions become an execution request, and the execution returns for verification before the revised version is handed back to the stakeholder. Once you have a loop you trust, you stop watching and start orchestrating.

Stop being the organization's infrastructure, and focus on authority at the points where it's truly needed.

---

## 8. Designing the machine that produces the product
Date:

The designer's challenge has shifted from designing a product to designing the machine that produces it 🤖⚙️ But how do you build a design machine?

Vibe coding is just telling a computer what to do. To design a real system that learns and improves, you need to build a closed loop:

✅ Measurement (Telemetry)
✅ Evaluation (Eval)
✅ Correction (Adaptation)

That way, run number 7 benefits from what the system learned in the previous six. Every run is also a new case study. It exposes another gap or opportunity the system hadn't encountered before. Like a radar that maps a bit more of the terrain with every sweep, the system gradually builds a richer picture of the world it operates in.

But how does the system know what "good" is? Design is the realization of intent, and that calls for clear anchors. The system measures the gap against what actually happened, and keeps the lesson.

It's a hybrid system: the agent exercises judgment and draws lessons, while the deterministic system checks rules and enforces boundaries.

For me, that also means routing everything through yair.md, my soul.md file. Why do I do this? That's a subject for the next post.

Have you implemented a design machine that reflects on itself?

---

## 9. Did you notice? The bottleneck moved to design.
Date:

Did you notice? The bottleneck in product companies is no longer development. It has moved to design.

At our company, developers haven't been writing code for more than half a year. The result is that development output has grown asymmetrically relative to designers.

In design, most of the AI usage I see is still personal and ad hoc. It isn't real scale. Quite a few companies don't allocate resources to building an ontological design infrastructure. I'm also not sure why.

A new Anthropic job posting is an interesting signal:
Product Designer, Evals & Prompts.
One of the designers explicitly posted that this is a role for designers, not developers.

https://lnkd.in/dGms88gJ

It's not apples to apples with an ordinary product company: Anthropic builds the model itself. But the direction is clear:

A growing part of design will be determined by model behavior. Through rubrics and evals. That means defining what counts as good design and being able to measure and improve it, instead of designing. Training models.

---

## 10. Don't just build products with Claude. Build a Decision Schema.
Date:

1. Designers won't be the only ones who produce product design with AI. 👾👾👾
2. At the same time, we've gone through shadcn-ization: years of investment in visual primitives turning into commodity infrastructure with no IP. And that's, for the most part, a good thing. 🙈

We're getting "slop grenades" thrown in every direction in the midst of a democratization of product:
I'm a bit of a developer, and the developers clean up my slop. They're a bit of designers, and I clean up after them. 🧽

In design, the barrier to entry is collapsing faster, and we need to build a Decision Schema (the new DS, if you will), because making product design decisions doesn't scale and has to be infrastructure. 🚀

The designer defines the decision space. 👩‍💻
Jev routes probabilistic decisions within the deterministic option space that was defined. 🎮
The LLM builds within the chosen path instead of open-ended. 🤖

Don't just build products with Claude. Create a Decision Schema.
Note this quote from Boris Cherny, head of Claude Code:

"People overfocus on using AI for product code, but using it to build infrastructure and guardrails is where the most power lies."

---

## 11. Developers work 10x faster. Designers, 3x to 5x.
Date:

Developers work 10x faster, designers 3x to 5x.

What happens when everyone on the team can build a prototype while heating a frozen egg roll in the microwave?

One so convincing it might confuse the team between Done and Good.
A prototype should expose questions, not just illustrate a final solution.

Design is a bottleneck. The design agenda has to become something that can be run and tested. Period. Something where every use can improve the next one.
The design object is no longer the screen. It's the system.
The system is no longer at the scale of consistency. It's now at the scale of intent.

We can reduce the dependency on us. Not everything requires our personal involvement.
That way, designers can focus on understanding customers' problems while encoding their standards.

In the workshop, we'll work with a flow that has worked successfully at several companies with different systems:

**1. Exploration and convergence in Claude Design:** exhausting solution alternatives and running product iterations within the team. This is the stage where I found remarkable elasticity and agility, with a great designer's eye and hand.

**2. Moving to Claude Code:** setting up the scaffolding and wiring to the codebase. The move to code is an opportunity to keep designing and to test the solution against reality.

**3. Testing and correction:** defining rules for evaluating the outputs. The ability to recognize a good result, and to teach a model to take feedback and correct, when it already has the project's memory.

**4. Continuous improvement of the method (the highlight):**
Every time someone runs the method, the model identifies a recurring problem.
It documents it and proposes a change. The task-agnostic change is reviewed and approved.
On the next task, we check whether the problem actually decreased.
So the next use starts from a better point.

One more thing I'm sharpening: designing the work environment becomes part of the designer's job, asking why each step exists and what it contributes. The principles are the same; the implementation details can change. In the previous workshop we used the BMAD framework. Since then, the models have gotten stronger and it's become unnecessary.

---

# Image text, Hebrew → English

### tab4 (Post 4, loop diagram). Clockwise from top
| Hebrew | English |
|---|---|
| מיסגור | Framing |
| פרוטוטייפ | Prototype |
| קוד אמיתי שמיש | Real, usable code |
| למידה מהלוגים | Learning from the logs |
| שיפור והתייעלות | Improvement and optimization |

### tab8 (Design Machine)
Title and English labels stay as they are. Hebrew lines to replace:

| Stage | Hebrew | English |
|---|---|---|
| 01 Knowledge + Success Criteria | מה נכון ומה נחשב טוב | What is true, and what counts as good |
| 02 Agent + Skills | יוצר פתרון | Produces a solution |
| 03 Output + Telemetry | מה נוצר ומה קרה בדרך | What was produced, and what happened along the way |
| 04 Eval | מה הפער מול הגדרת ההצלחה | What's the gap against the definition of success |
| 05 Adaptation | מה במערכת צריך להשתנות | What in the system needs to change |
| Bottom label | מעדכן ידע, Skills, חוקים או Evals | Updates knowledge, skills, rules, or evals |

### tab11 (dotted "process" page)
Header, top right: "גם התהליך בתהליך." → **"The process is also in process."** *(a wordplay in Hebrew; alternatively "The process, too, is a work in progress.")*

Dots (top to bottom):
| Hebrew | English |
|---|---|
| לבחון חלופות | Explore alternatives |
| להבין ולספק קונטקסט | Understand and provide context |
| להגדיר ולבדוק איכות | Define and check quality |
| לממש בקוד | Implement in code |
| ללמוד ולשפר | Learn and improve |

---

## Image mapping (`photos.zip`)

Image `tabN.jpeg` belongs to post N. Hebrew-text images that need English versions: **tab4, tab8, tab11**.

| File | Content | Matches post |
|---|---|---|
| tab1 | doppler.ai halftone | 1 |
| tab2 | parking illustration | 2 |
| tab3 | glass flowers/plants | 3 |
| tab4 | Hebrew loop diagram (Framing → Prototype → …) | 4 |
| tab5 | Figma at NYSE | 5 |
| tab6 | bike mechanic | 6 |
| tab7 | "Brad." portrait | 7 |
| tab8 | The Design Machine | 8 |
| tab9 | design services food truck | 9 |
| tab10 | AI-slop grenades | 10 |
| tab11 | dotted Hebrew "process" page | 11 |
