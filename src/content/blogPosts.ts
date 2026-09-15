// ============================================================================
// Strail blog content
// ============================================================================
// To publish a new post: add one object to the `blogPosts` array below.
// That's it — the blog list page, the post page, and the sitemap
// (via scripts/generate-sitemap.ts) all read from this one list.
//
// Images: drop files under public/blog-images/<slug>/ and point `banner`
// and `midImage` at /blog-images/<slug>/whatever.jpg. Every post's banner
// renders in the same spot (full-width, above the title) and every post's
// midImage renders in the same spot (floated right, partway through the
// body) — so you never have to think about layout per post, only content.
// If an image path 404s, it's hidden gracefully rather than showing a
// broken-image icon.
// ============================================================================

export interface BlogImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface BlogPost {
  /** URL slug — becomes /blog/<slug>. Lowercase, hyphenated, no spaces. */
  slug: string;
  title: string;
  /** One or two sentences. Used on the card, in <meta description>, and in social previews. */
  excerpt: string;
  /** YYYY-MM-DD */
  date: string;
  author: string;
  tags: string[];
  /** Full-width image above the title. Same position on every post. */
  banner: BlogImage;
  /** Optional image that floats right, roughly halfway through the body. Same position on every post. */
  midImage?: BlogImage;
  /** Body copy, one paragraph per array entry. */
  paragraphs: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'why-i-built-strail',
    title: 'Why I Built Strail',
    excerpt:
      "I kept watching the same thing happen: a huge assignment would land, and instead of starting, I'd just stare at it. Strail is the tool I wish I'd had.",
    date: '2026-08-18',
    author: 'The Strail Team',
    tags: ['founder story'],
    banner: {
      src: '/blog-images/why-i-built-strail/banner.jpg',
      alt: 'A winding trail through a green forest, viewed from the trailhead',
    },
    midImage: {
      src: '/blog-images/why-i-built-strail/desk.jpg',
      alt: 'A cluttered desk with sticky notes and an open notebook',
      caption: 'The actual state of my desk during AP season, for reference.',
    },
    paragraphs: [
      "The idea for Strail didn't come from a productivity book. It came from a specific Tuesday night, staring at a research paper prompt that was due in ten days, feeling absolutely nothing except dread.",
      "The assignment wasn't even that hard. It was just big, and vague, and every time I opened the document I'd write a sentence, delete it, and close my laptop. I knew what \"break it down into smaller steps\" meant in theory. I just never actually did it, because doing it required energy I didn't have in the moment I needed it most.",
      "That's the part nobody talks about. Breaking a task down is itself a task — and it's often the exact task you're avoiding, because it forces you to look directly at the thing that's overwhelming you.",
      "So I started asking: what if the breakdown happened automatically? What if you could just type \"write a research paper on the Cold War\" and immediately get a sequence of small, concrete, 20-minute steps — not \"do research\" but \"find and skim three sources on the Cuban Missile Crisis\"?",
      "That's the whole premise of Strail. It's not a calendar app and it's not a to-do list. It's a way of turning a goal that feels like a wall into a path you can actually see yourself walking, one step at a time.",
      "I also wanted it to respect the rest of a student's life. Most planning tools assume your only job is schoolwork. Strail asks about your practice schedule, your rehearsal, your job — and builds around them instead of pretending they don't exist.",
      "It's still early, and it's still growing. But every feature in Strail traces back to that Tuesday night: what would have actually gotten me to open the document?",
    ],
  },
  {
    slug: 'what-is-task-paralysis',
    title: 'What Is Task Paralysis?',
    excerpt:
      "It isn't laziness, and it isn't a discipline problem. Task paralysis is a specific, recognizable pattern — and once you can name it, it's easier to work around.",
    date: '2026-08-25',
    author: 'The Strail Team',
    tags: ['task paralysis', 'study skills'],
    banner: {
      src: '/blog-images/what-is-task-paralysis/banner.jpg',
      alt: 'A student sitting at a desk, hands on head, looking at a blank page',
    },
    midImage: {
      src: '/blog-images/what-is-task-paralysis/checklist.jpg',
      alt: 'A short, simple checklist on a notepad',
      caption: 'Small, specific, and finishable — the opposite of a wall of a task.',
    },
    paragraphs: [
      "You sit down to start. You open the tab, the document, the textbook. And then — nothing happens. Not because you don't care, and not because you're being lazy. You just can't find the door in.",
      "That's task paralysis: the freeze that shows up when a task feels too large, too vague, or too high-stakes to approach directly. It's a mismatch between the size of the thing in front of you and the size of step your brain is willing to take on right now.",
      "It tends to show up most with tasks that have three things in common: they're open-ended (there's no obvious first move), they're consequential (a grade, an application, a performance), and they're framed as one big object instead of a sequence. \"Write the essay\" triggers it. \"Write one sentence about the topic sentence\" usually doesn't.",
      "This is why willpower advice often doesn't help. Telling someone stuck in task paralysis to \"just start\" is a bit like telling someone stuck at a locked door to \"just walk through it.\" The instruction is correct and also useless, because it skips the actual problem: there's no visible first step.",
      "What does work is shrinking the unit of decision. Instead of deciding whether to write the essay, you decide whether to write one paragraph outline for five minutes. That's a decision most people can actually make, because the cost of being wrong is tiny and the task is concrete enough to picture.",
      "This is also why breaking a task down yourself, in the moment, often fails — you're asking the paralyzed part of your brain to do a planning task, which is exactly the kind of open-ended thinking that triggers the freeze in the first place. Having the breakdown already done, before you sit down, removes that step entirely.",
      "None of this means the underlying task gets easier. The paper is still due, the material is still hard. What changes is the size of the decision standing between you and starting — and that's usually the whole battle.",
    ],
  },
  {
    slug: 'guide-to-breaking-down-your-tasks',
    title: 'A Guide to Breaking Down Your Tasks',
    excerpt:
      "A practical walkthrough of how to turn one big, vague goal into a sequence of steps you can actually start today — with a real example.",
    date: '2026-09-02',
    author: 'The Strail Team',
    tags: ['study skills', 'how-to'],
    banner: {
      src: '/blog-images/guide-to-breaking-down-your-tasks/banner.jpg',
      alt: 'A trail map pinned to a corkboard with a route marked in string',
    },
    midImage: {
      src: '/blog-images/guide-to-breaking-down-your-tasks/steps.jpg',
      alt: 'Numbered index cards laid out in a row on a table',
      caption: 'Each card should be small enough to finish in one sitting.',
    },
    paragraphs: [
      "\"Break it down into smaller steps\" is advice everyone gives and almost nobody explains. Here's an actual method, using a real example: \"study for the AP Chemistry exam,\" four weeks out.",
      "Step one: write down the real, final outcome — not the task, the outcome. Not \"study chemistry,\" but \"walk into the exam room able to answer free-response questions on equilibrium, kinetics, and thermodynamics without panicking.\" A specific outcome makes it obvious what actually needs to happen versus what's just busywork.",
      "Step two: list the milestones, not the minutes. Between now and the exam, what are the three to six major phases? For AP Chem that might be: review unit content, drill free-response questions by topic, take a full practice exam, review mistakes, do a final pass on weak spots. Notice none of these are one sitting — that's fine, they're the map, not the trail yet.",
      "Step three: turn each milestone into steps sized for a single sitting — 20 to 30 minutes is a good target. \"Review unit content\" becomes five or six specific sessions: \"redo the equilibrium ICE-table practice set,\" \"rewatch and take notes on the buffer solutions section,\" and so on. If a step doesn't have a concrete, checkable output, it's still too vague — break it further.",
      "Step four: put them in an order where each step only depends on what came before it. You shouldn't need to do the full practice exam before you've reviewed the content it's testing. This sounds obvious written down, but it's the part people skip when they're planning under stress, and it's usually what makes a plan feel unworkable a few days in.",
      "Step five: protect the time you've already committed elsewhere — practice, rehearsal, a job — before you schedule the rest. A plan that assumes you have unlimited free hours falls apart by Wednesday.",
      "The whole method is really one idea, applied five times: keep splitting until the next thing to do is small enough that starting it doesn't feel like a decision. That's the entire trick, and it's also, not coincidentally, exactly what Strail automates when you type in a goal.",
    ],
  },
];
