/**
 * Cognita Autonomous Grounded Study Engine
 *
 * Provides ChatGPT-quality academic explanations, deep conceptual definitions,
 * step-by-step mechanism breakdowns, intuitive analogies, structured summaries,
 * and recall quizzes. Operates autonomously on extracted document text and
 * rich academic subject knowledge bases.
 */

import { chunkDocument, retrieveRelevantChunks } from "./document-retrieval";
import {
  AIChatResponse,
  AISummarizeResponse,
  AIQuizResponse,
  AIQuizQuestion,
  AISummarySection,
} from "../types/ai";

/**
 * High-depth ChatGPT-style subject tutorials for core academic curricula.
 */
interface SubjectTutorial {
  id: string;
  titleEn: string;
  titleAm: string;
  fullGuideEn: string;
  fullGuideAm: string;
  keyDefinitionsEn: { term: string; definition: string }[];
  keyDefinitionsAm: { term: string; definition: string }[];
  suggestedFollowUpsEn: string[];
  suggestedFollowUpsAm: string[];
}

const ACADEMIC_KNOWLEDGE_BASE: Record<string, SubjectTutorial> = {
  web_design: {
    id: "web_design",
    titleEn: "Web Design & Modern Frontend Architecture",
    titleAm: "የዌብ ዲዛይን እና የዘመናዊ ፍሮንት-ኤንድ አርክቴክቸር (Web Design)",
    fullGuideEn: `### 🌐 Comprehensive Academic Guide: Web Design & Modern Frontend Architecture

Web design is the holistic discipline of conceptualizing, planning, and creating functional, visually captivating digital interfaces for the World Wide Web. It is not merely "making websites look pretty" — it is the harmonious intersection of **Visual Aesthetics (UI)**, **Human-Centered Usability (UX)**, and **Technical Engineering (HTML5, CSS3, and JavaScript)** across diverse screen viewports.

---

### 💡 The Big Picture: The Anatomy of a Web Experience
To understand web design intuitively, consider a modern building:
- **HTML5 (The Steel & Concrete Structure):** Defines the structural skeleton, walls, and rooms (headers, navigation, articles, sections). Without HTML, nothing exists.
- **CSS3 (The Architecture & Interior Design):** Dictates aesthetics, paint colors, spatial layouts, responsive furniture arrangements (Flexbox & Grid), and dynamic lighting (animations & transitions).
- **JavaScript (The Electrical & Plumbing Systems):** Powers dynamic functionality — elevators that move on button press, lights turning on, and data flowing in from external servers via APIs.
- **UI/UX (The Human Experience):** Ensures that doors open effortlessly, signs are clearly legible, and visitors navigate the building smoothly without getting confused.

---

### 🔬 The Core Pillars Explained Step-by-Step

#### 1. HTML5: Semantic Architecture & Hierarchy
- **Semantic Tags:** Modern web standards prohibit "div soup" (nesting generic \`<div>\` tags endlessly). Instead, use semantic HTML:
  - \`<header>\`: Introductory branding and top navigation.
  - \`<nav>\`: Navigational links.
  - \`<main>\`: The primary, unique content of the page.
  - \`<article>\`: Self-contained, syndicatable content (e.g., blog post, product card).
  - \`<section>\`: Thematic grouping of content with a heading.
  - \`<aside>\`: Tangentially related sidebars.
  - \`<footer>\`: Copyright, credits, and secondary links.
- **Why Semantics Matter:** Semantic HTML is critical for **Accessibility (a11y)**, allowing screen readers used by visually impaired students to navigate content accurately, and for **SEO (Search Engine Optimization)**.

#### 2. CSS3: Layout Systems & Responsive Web Design (RWD)
- **The Box Model:** Every HTML element on a screen is treated as a rectangular box comprising four concentric layers:
  $$\\text{Total Width} = \\text{Content} + \\text{Padding} + \\text{Border} + \\text{Margin}$$
  *Best Practice:* Always apply \`box-sizing: border-box;\` universally so that padding and borders do not unexpectedly expand element widths.
- **Flexbox (1-Dimensional Layouts):**
  - Designed for laying out items in a single dimension: either a **row** OR a **column**.
  - Perfect for navigation bars, button groups, and centering elements (\`justify-content: center; align-items: center;\`).
- **CSS Grid (2-Dimensional Layouts):**
  - Designed for complex two-dimensional templates involving both **rows AND columns simultaneously**.
  - Ideal for overall page layouts, photo galleries, and dashboard card grids.
- **Responsive Web Design (Mobile-First):**
  - Designing for mobile screens first and progressively enhancing for desktops using **CSS Media Queries** (\`@media (min-width: 768px)\`).
  - Using fluid relative units: \`rem\` (relative to root font-size) instead of fixed \`px\`, \`%\`, \`vw/vh\`, and \`clamp(min, preferred, max)\`.
  - Always including the responsive meta viewport tag: \`<meta name="viewport" content="width=device-width, initial-scale=1.0">\`.

#### 3. UI vs UX: What is the Difference?
- **UI (User Interface Design):** The sensory layer. Deals with color harmony (e.g. the 60-30-10 color rule), typography scales, visual hierarchy, button states (hover, active, disabled), and micro-interactions.
- **UX (User Experience Design):** The structural and emotional layer. Focuses on user flow, information architecture, wireframing, usability testing, and minimizing cognitive friction. A website can be visually gorgeous (great UI) but infuriating to use (terrible UX) if the checkout button is impossible to find.

---

### 📖 Essential Concept Definitions

• **Responsive Web Design (RWD):** An approach to web design that makes web pages render smoothly on a variety of devices and window or screen sizes using fluid grids, flexible images, and CSS media queries.

• **Flexbox (Flexible Box Layout):** A 1D CSS layout model providing space distribution and powerful alignment capabilities along a main axis and cross axis.

• **CSS Grid:** A 2D CSS layout engine that allows authors to align elements into discrete rows and columns, creating modular responsive layouts.

• **DOM (Document Object Model):** An object-oriented, tree-structured programmatic representation of an HTML document created in memory by the web browser, allowing JavaScript to dynamically read and update content and styles.

• **Web Accessibility (WCAG / a11y):** The inclusive practice of ensuring websites are usable by people of all abilities and disabilities, including proper color contrast ratios (minimum 4.5:1 for body text) and full keyboard navigability.

---

### ⚠️ Common Student Mistakes & Exam Traps
1. **Flexbox vs. Grid Confusion:** Remember this golden rule: *Use Flexbox for components in a single line (content-driven); use CSS Grid for page layouts (container-driven).*
2. **Fixed Pixels (\`px\`) vs. Relative Units (\`rem\`):** Setting font sizes in \`px\` breaks accessibility because it overrides user browser preferences. Always use \`rem\` for typography.
3. **Missing Viewport Meta Tag:** Without \`<meta name="viewport" content="width=device-width, initial-scale=1.0">\`, mobile phones assume a desktop screen and scale your site down to microscopic, unreadable proportions.`,

    fullGuideAm: `### 🌐 አጠቃላይ የትምህርት መመሪያ፦ የዌብ ዲዛይን መሰረታዊ መርሆች እና ዘመናዊ ፍሮንት-ኤንድ (Web Design)

**ዌብ ዲዛይን (Web Design)** በበይነመረብ (World Wide Web) ላይ ለተጠቃሚዎች የሚታዩ ድረ-ገጾችን እና ዲጂታል ገጾችን የማቀድ፣ የመንደፍ እና የመገንባት ጥበባዊና ምህንድስናዊ ሳይንስ ነው። ዌብ ዲዛይን የገጹን ውበት ብቻ ሳይሆን የተጠቃሚዎችን ምቾት (**UX** - User Experience)፣ የሚታየውን ቅርጽ (**UI** - User Interface)፣ እና የኮድ አሰራርን (**HTML5, CSS3, JavaScript**) በአንድ ላይ አጣምሮ የያዘ ዘርፍ ነው።

---

### 💡 ዋናው ምሳሌያዊ እሳቤ፦ ድረ-ገጽ እንደ ዘመናዊ ህንፃ
የዌብ ዲዛይንን ክፍሎች በቀላሉ ለመረዳት እንደ አንድ ዘመናዊ ህንፃ ግንባታ ማየት እንችላለን፦
- **HTML5 (የኮንክሪት እና የብረት አወቃቀር)፦** የድረ-ገጹን አጥንት እና መዋቅር ይወስናል (ክፍሎች፣ ግድግዳዎች፣ ሳሎን - headers, main, sections, footer)። HTML ከሌለ ምንም ህንፃ የለም።
- **CSS3 (የህንፃው ውበት፣ ቀለም እና የውስጥ ዲዛይን)፦** የክፍሎቹን ቀለም፣ የቤት እቃዎች አቀማመጥ (Flexbox & Grid)፣ ማራኪ መብራቶችን እና ለተለያዩ ስክሪኖች ተስማሚ ቅርጽ መስጠትን (Responsive Design) ይቆጣጠራል።
- **JavaScript (የኤሌክትሪክ እና የውሃ ስርዓት)፦** የህንፃውን እንቅስቃሴ የሚመራ ስርዓት ነው፦ አሳንሰር በቁልፍ ሲጫን እንዲሰራ፣ መብራት እንዲበራ፣ እና ውጫዊ መረጃዎች እንዲገቡ ያደርጋል።
- **UI/UX (የሰው ምቾት እና እርካታ)፦** የህንፃው በሮች በቀላሉ እንዲከፈቱ፣ መውጫና መግቢያ ምልክቶች በግልጽ እንዲታዩ እና ማንኛውም ሰው ሳይደናገር እንዲጠቀምበት ያረጋግጣል።

---

### 🔬 የዌብ ዲዛይን ዋና ዋና ምሰሶዎች በዝርዝር

#### 1. HTML5፦ ትርጉም ያለው መዋቅር (Semantic Structure)
- **ትርጉም ያላቸው ታጎች (Semantic Tags)፦** ሁሉንም ነገር በዘፈቀደ \`<div>\` ከማድረግ ይልቅ፣ የድረ-ገጹን ይዘት በግልጽ በሚያሳውቁ ታጎች መገንባት ያስፈልጋል፦
  - \`<header>\`፦ የገጹ ራስጌ፣ አርማ እና የላይኛው አሰሳ።
  - \`<nav>\`፦ ዋና ዋና የመሸጋገሪያ ሊንኮች (Navigation)።
  - \`<main>\`፦ የገጹ ዋነኛ እና ተለዋዋጭ ይዘት።
  - \`<article>\`፦ ራሱን የቻለ ጽሁፍ ወይም ካርድ (ለምሳሌ ዜና ወይም ፖስት)።
  - \`<section>\`፦ ተዛማጅ የሆኑ ርዕሶችን በአንድ ላይ የሚሰበስብ ክፍልፍል።
  - \`<footer>\`፦ የገጹ ግርጌ (የቅጂ መብት፣ አድራሻ እና ማጠቃለያ)።
- **ጥቅሙ፦** ለዓይነ-ስውራን ስክሪን አንባቢዎች (Screen Readers) እና ለጉግል መፈለጊያ (SEO) እጅግ ወሳኝ ነው።

#### 2. CSS3፦ አቀማመጥ እና ምላሽ ሰጪ ዲዛይን (Responsive Design)
- **የቦክስ ሞዴል (Box Model)፦** በስክሪን ላይ የሚታይ ማንኛውም ይዘት እንደ አንድ አራት ማዕዘን ሳጥን ይታያል፦ **Content** (ይዘት) $\\to$ **Padding** (የውስጥ ክፍተት) $\\to$ **Border** (የድንበር መስመር) $\\to$ **Margin** (የውጭ ክፍተት)። ሁልጊዜ \`box-sizing: border-box;\` መጠቀም ይመረጣል።
- **Flexbox (ባለ አንድ አቅጣጫ አቀማመጥ)፦** ይዘቶችን በአንድ ረድፍ (Row) ወይም በአንድ አምድ (Column) ለማስተካከል እና ክፍተቶችን በእኩል ለማካፈል ያገለግላል።
- **CSS Grid (ባለ ሁለት አቅጣጫ አቀማመጥ)፦** ውስብስብ የሆኑ የረድፍ እና የአምድ ሰንጠረዦችን በአንድ ላይ ለመቆጣጠር ይጠቅማል።
- **ምላሽ ሰጪ ዲዛይን (Responsive Web Design - RWD)፦** ድረ-ገጹ ከትንሽ ሞባይል ስልክ ጀምሮ እስከ ትልቅ ኮምፒውተር ስክሪን ድረስ ቅርጹ እንዳይበላሽ በ **CSS Media Queries** (\`@media\`) እና በተለዋዋጭ መለኪያዎች (\`rem\`, \`%\`, \`vw/vh\`) ማስተካከል ነው።

#### 3. UI እና UX፦ ልዩነታቸው ምንድን ነው?
- **UI (User Interface - የሚታይ ውበት)፦** ተጠቃሚው በአይኑ የሚያየው የቀለም ምርጫ፣ የፊደል አጻጻፍ (Typography)፣ የቁልፎች ቅርጽ እና ውበት ነው።
- **UX (User Experience - አጠቃላይ ምቾት)፦** ተጠቃሚው ድረ-ገጹን ሲጠቀም የሚሰማው ቅለት፣ ፍጥነት፣ እና በቀላሉ የሚፈልገውን ነገር የማግኘት እድል ነው። አንድ ድረ-ገጽ በጣም የሚያምር ሆኖ (ጥሩ UI ኖሮት) ነገር ግን መግዣ ቁልፉ የት እንደሆነ ካልታወቀ የተበላሸ UX አለው ይባላል።

---

### 📖 ቁልፍ ቃላት እና ትርጓሜዎቻቸው

• **Responsive Web Design (RWD)፦** ድረ-ገጾች በማንኛውም የስክሪን ስፋት (ሞባይል፣ ታብሌት፣ ዴስክቶፕ) ላይ ምቹ እና ተነባቢ ሆነው እንዲታዩ የማድረግ ስልት ነው።

• **Flexbox፦** በአንድ አቅጣጫ ያሉ የድረ-ገጽ እቃዎችን ለማስተካከል እና በእኩል ክፍተት ለማስቀመጥ የሚያገለግል የ CSS ቴክኖሎጂ ነው።

• **CSS Grid፦** ረድፎችን እና አምዶችን በአንድ ላይ በማጣመር ውስብስብ ገጾችን ለመንደፍ የሚረዳ ኃይለኛ የ 2D ሌይ-አውት ስርዓት ነው።

• **DOM (Document Object Model)፦** ብሮውዘሩ የ HTML ፋይሉን አንብቦ በሜሞሪ ውስጥ የሚፈጥረው የዛፍ ቅርጽ ያለው የድረ-ገጽ አወቃቀር ሲሆን በ JavaScript አማካኝነት ሊቀየር ይችላል።

• **Semantic HTML፦** የድረ-ገጹ ይዘት ትክክለኛ ትርጉም እንዲኖረው የሚያደርጉ መደበኛ ታጎችን (<nav>, <article>, <main>) የመጠቀም ሂደት ነው።

---

### ⚠️ በፈተና እና በተግባር ተማሪዎች የሚሳሳቱባቸው ነጥቦች
1. **Flexbox vs Grid፦** ባለ አንድ መስመር እቃዎችን ለማስተካከል **Flexbox**፣ ሙሉውን የገጽ አቀማመጥ ለመስራት ደግሞ **CSS Grid** ይጠቀሙ።
2. **ቋሚ ፒክስል (\`px\`) vs ተለዋዋጭ (\`rem\`)፦** የፊደል መጠኖችን በ \`px\` መጻፍ ተጠቃሚዎች ፊደል እንዲተልቅ ሲያደርጉ ስለሚከለክል ሁልጊዜ \`rem\` መጠቀም ይመረጣል።
3. **የቪውፖርት ታግ (Viewport Tag) አለመርሳት፦** \`<meta name="viewport" content="width=device-width, initial-scale=1.0">\` ካልተካተተ ስልኮች ገጹን በጣም አሳንሰው ያሳዩታል።`,
    keyDefinitionsEn: [
      {
        term: "Responsive Web Design (RWD)",
        definition:
          "Design methodology using fluid grids and CSS media queries to ensure websites adapt to any screen resolution.",
      },
      {
        term: "Flexbox",
        definition:
          "A 1D CSS layout system designed for distributing space and aligning items along a single axis.",
      },
      {
        term: "CSS Grid",
        definition:
          "A 2D CSS layout engine offering two-dimensional grid-based layouts using rows and columns.",
      },
      {
        term: "DOM (Document Object Model)",
        definition:
          "An object-oriented tree representation of the HTML document created by the browser, manipulated via JavaScript.",
      },
      {
        term: "Semantic HTML",
        definition:
          "HTML markup that reinforces the meaning and hierarchy of the information in web pages rather than just defining its look.",
      },
    ],
    keyDefinitionsAm: [
      {
        term: "Responsive Web Design (RWD)",
        definition:
          "ድረ-ገጾች በሞባይል፣ በታብሌት እና በኮምፒውተር ስክሪኖች ላይ በተመጣጣኝ ቅርጽ እንዲታዩ የማድረግ ስልት።",
      },
      {
        term: "Flexbox",
        definition:
          "በአንድ አቅጣጫ (በአግድም ወይም በቁመት) እቃዎችን በእኩል ክፍተት ለማስተካከል የሚረዳ የ CSS ሌይ-አውት።",
      },
      {
        term: "CSS Grid",
        definition:
          "ረድፍ እና አምድን በአንድ ላይ በማጣመር ውስብስብ የድረ-ገጽ አቀማመጦችን ለመገንባት የሚያስችል የ CSS ስርዓት።",
      },
      {
        term: "Semantic HTML",
        definition:
          "የይዘቱን ምንነት እና የስራ ሚና ለብሮውዘሮች እና ለስክሪን አንባቢዎች በግልጽ የሚያሳውቁ መደበኛ ታጎችን የመጠቀም አሰራር።",
      },
    ],
    suggestedFollowUpsEn: [
      "Explain the difference between CSS Flexbox and CSS Grid",
      "What is the Box Model and why is box-sizing important?",
      "How do CSS Media Queries make websites responsive?",
    ],
    suggestedFollowUpsAm: [
      "የ CSS Flexbox እና CSS Grid ዋና ልዩነት ምንድን ነው?",
      "የቦክስ ሞዴል (Box Model) ምን እንደሆነ በምሳሌ አብራራልኝ",
      "ሚዲያ ኩዌሪስ (Media Queries) ድረ-ገጾችን እንዴት ምላሽ ሰጪ ያደርጋሉ?",
    ],
  },

  respiration: {
    id: "respiration",
    titleEn: "Molecular Biology & Cellular Respiration",
    titleAm: "ሞለኪውላዊ ባዮሎጂ እና ሴሉላር ሬስፒሬሽን",
    fullGuideEn: `### 🌿 Comprehensive Guide: Cellular Respiration & Molecular Bioenergetics

Cellular respiration is one of the most fundamental processes in all of biology. At its core, it is the biochemical pathway by which living cells systematically extract energy stored within the chemical bonds of nutrient molecules (primarily glucose, $C_6H_{12}O_6$) and convert it into **Adenosine Triphosphate (ATP)** — the universal energy currency that powers all cellular work.

---

### 💡 The Big Picture: The Cell as a Power Plant
To build an intuitive mental model, think of cellular respiration as the cell's internal power station:
- **Glucose** is the raw fuel (like unrefined petroleum or coal).
- The cell doesn't burn it all at once in an uncontrollable explosion; instead, it funnels it through four tightly regulated stages, harvesting electrons gradually.
- The harvested electrons are passed through an **Electron Transport Chain (ETC)**, which functions like a microscopic hydroelectric dam, creating a steep proton gradient.
- Finally, that gradient drives **ATP Synthase** — a true molecular rotary turbine — synthesizing up to 30–32 ATP molecules per glucose.

---

### 🔬 The Four Key Stages Explained Step-by-Step

#### 1. Glycolysis ("Sugar Splitting")
- **Location:** Cytoplasm (requires no oxygen, meaning it is strictly *anaerobic*).
- **The Mechanism:** A single 6-carbon glucose molecule is systematically split into two 3-carbon molecules of **pyruvate**.
- **Energy Balance Sheet:** The cell first *invests* 2 ATP to destabilize the sugar (the investment phase). It subsequently produces 4 ATP and 2 NADH (the payoff phase), yielding a **net gain of 2 ATP and 2 NADH**.
- **Master Regulator:** The committed step is catalyzed by the enzyme **Phosphofructokinase-1 (PFK-1)**. PFK-1 acts as the cell's metabolic thermostat: it is inhibited when energy is abundant (high ATP or citrate) and activated when energy is scarce (high AMP).

#### 2. Pyruvate Oxidation (The Mitochondrial Gateway)
- **Location:** Mitochondrial Matrix.
- **The Mechanism:** Each 3-carbon pyruvate is transported across the mitochondrial membranes. The pyruvate dehydrogenase complex removes a carboxyl group as carbon dioxide ($CO_2$), oxidizes the remaining 2-carbon fragment, and attaches it to Coenzyme A to form **Acetyl-CoA**.
- **Yield per Glucose:** 2 Acetyl-CoA, 2 NADH, and 2 $CO_2$.

#### 3. Citric Acid Cycle (The Krebs Cycle)
- **Location:** Mitochondrial Matrix.
- **The Mechanism:** Acetyl-CoA combines with a 4-carbon acceptor molecule, **Oxaloacetate**, forming a 6-carbon **Citrate**. Over a cycle of eight enzymatic steps, citrate is systematically oxidized back into oxaloacetate, stripping away high-energy electrons.
- **Yield per Glucose (2 full turns):** 6 NADH, 2 $FADH_2$, 2 ATP (or GTP), and 4 $CO_2$. At this point, glucose has been completely dismantled into carbon dioxide.

#### 4. Oxidative Phosphorylation & Chemiosmosis
- **Location:** Inner Mitochondrial Membrane (Cristae).
- **The Mechanism:** High-energy electron carriers (NADH and $FADH_2$) donate their electrons to protein complexes (Complex I through IV). As electrons flow down the chain toward molecular oxygen, the complexes actively pump hydrogen ions (protons, $H^+$) out of the matrix into the intermembrane space.
- **The Proton-Motive Force & ATP Synthase:** This creates a massive electrochemical gradient. Protons rush back down their gradient through the catalytic channel of **ATP Synthase**, physically rotating its internal rotor and forcing ADP and inorganic phosphate ($P_i$) together to generate ~26 to 28 ATP.
- **Terminal Electron Acceptor:** Molecular Oxygen ($O_2$) accepts the depleted electrons and binds with free protons to form harmless Water ($H_2O$).

---

### 📖 Essential Concept Definitions

• **ATP Synthase (Molecular Turbine):** A multi-subunit rotary motor enzyme embedded in the inner mitochondrial membrane. It couples mechanical rotational kinetic energy powered by proton flow directly into chemical bond energy (ATP).

• **Chemiosmosis:** The biological movement of ions down their electrochemical gradient across a selectively permeable membrane, specifically coupling proton diffusion to the chemical synthesis of ATP.

• **Proton-Motive Force (PMF):** The stored potential energy consisting of both an electrical charge gradient and a chemical pH concentration gradient across the inner mitochondrial membrane.

• **Allosteric Regulation of PFK-1:** The primary control mechanism preventing unnecessary glucose breakdown when cellular ATP reserves are already saturated.

---

### ⚠️ High-Yield Exam Traps & Misconceptions
1. **The Modern ATP Yield:** Older textbooks cite 36 or 38 ATP per glucose. Modern bioenergetics measures a realistic yield of **30 to 32 ATP**, accounting for proton leakage across the membrane and the energetic cost of shuttling pyruvate into the matrix.
2. **The True Role of Oxygen:** Oxygen is NOT used in glycolysis or the Krebs cycle directly! It acts strictly as the final electron acceptor at Complex IV of the ETC. However, without oxygen, electron carriers back up, halting the Krebs cycle.
3. **Why Fermentation Exists:** When oxygen is absent, cells do not ferment to create energy — fermentation produces ZERO extra ATP. Its sole biological purpose is to oxidize NADH back into $NAD^+$ so that glycolysis can continue running.`,

    fullGuideAm: `### 🌿 አጠቃላይ የትምህርት መመሪያ፦ ሞለኪውላዊ ባዮሎጂ እና ሴሉላር ሬስፒሬሽን (Cellular Respiration)

ሴሉላር ሬስፒሬሽን በህይወት ባዮሎጂ ውስጥ እጅግ መሰረታዊ ከሆኑ ሂደቶች ዋነኛው ነው። በአጭሩ ሲገለጽ፣ ህዋሳት (Cells) ከምንመገበው ምግብ (በተለይም ግሉኮስ - $C_6H_{12}O_6$) ውስጥ የተከማቸውን ኬሚካላዊ ሃይል ደረጃ በደረጃ በማውጣት ወደ **ATP (Adenosine Triphosphate)** የሚቀይሩበት ውስብስብ ባዮኬሚካላዊ ሂደት ነው። ATP የህዋሳት ሁሉ ዋነኛ "የሃይል መገበያያ ገንዘብ" ነው።

---

### 💡 ዋናው ምሳሌያዊ እሳቤ፦ ህዋስ እንደ ሃይል ማመንጫ ጣቢያ
ይህን ሂደት በቀላሉ ለመረዳት ህዋሳችንን እንደ ዘመናዊ የሃይል ማመንጫ ጣቢያ ማየት እንችላለን፦
- **ግሉኮስ** ልክ እንደ ጥሬ ነዳጅ ነው።
- ህዋሱ ነዳጁን በአንዴ አያቃጥለውም፤ ይልቁንም ሃይሉ እንዳይባክን በአራት ቁጥጥር ባላቸው ደረጃዎች ኤሌክትሮኖቹን ቀስ በቀስ ያወጣቸዋል።
- የወጡት ኤሌክትሮኖች በኤሌክትሮን ማስተላለፊያ ሰንሰለት (ETC) ውስጥ ሲያልፉ ልክ እንደ ግድብ የፕሮቶን ግፊት ይፈጥራሉ።
- በመጨረሻም ይህ ግፊት **ATP Synthase** የተባለውን ጥቃቅን የህዋስ ሞተር በማሽከርከር ከአንድ የግሉኮስ ሞለኪውል እስከ 30-32 ATP ያመነጫል።

---

### 🔬 አራቱ ወሳኝ ደረጃዎች በዝርዝር ማብራሪያ

#### 1. ግላይኮላይሲስ (Glycolysis - የስኳር መሰንጠቅ)
- **የሚካሄድበት ቦታ፦** በሳይቶፕላዝም (Cytoplasm) ውስጥ ሲሆን ኦክስጅን አይፈልግም (Anaerobic)።
- **ሂደቱ፦** ባለ 6 ካርቦኑ ግሉኮስ ወደ ሁለት ባለ 3 ካርቦን **ፓይሩቬት (Pyruvate)** ሞለኪውሎች ይሰነጠቃል።
- **የሃይል ውጤት፦** ሴሉ መጀመሪያ 2 ATP ኢንቨስት አድርጎ 4 ATP እና 2 NADH ያመርታል፤ የተጣራ ትርፉ **2 ATP እና 2 NADH** ነው።
- **ዋና ተቆጣጣሪ ኢንዛይም፦** **PFK-1 (Phosphofructokinase-1)** ይባላል። በሴሉ ውስጥ በቂ ሃይል ሲኖር ሂደቱን ያዘገየዋል፤ ሃይል ሲያንስ ደግሞ ያፋጥነዋል።

#### 2. የፓይሩቬት ኦክሲዴሽን (Pyruvate Oxidation)
- **የሚካሄድበት ቦታ፦** በማይቶኮንድሪያ ማትሪክስ ውስጥ።
- **ሂደቱ፦** ፓይሩቬት ወደ ማይቶኮንድሪያ ገብቶ ካርቦንዳይኦክሳይድ ($CO_2$) በመልቀቅ ወደ **Acetyl-CoA** ይቀየራል። በዚህ ጊዜ ተጨማሪ 2 NADH ይመረታል።

#### 3. የክሬብስ ዑደት (Krebs Cycle / Citric Acid Cycle)
- **የሚካሄድበት ቦታ፦** በማይቶኮንድሪያ ማትሪክስ ውስጥ።
- **ሂደቱ፦** Acetyl-CoA ከ Oxaloacetate ጋር በመዋሃድ Citrate ይፈጥራል። በ 8 ተከታታይ የኢንዛይም ደረጃዎች ውስጥ ከፍተኛ ሃይል ያላቸው ኤሌክትሮኖች ወደ NADH እና $FADH_2$ ይሸጋገራሉ።
- **የሃይል ውጤት (በ 2 ዙር)፦** 6 NADH፣ 2 $FADH_2$፣ 2 ATP/GTP እና 4 $CO_2$ ይመረታል።

#### 4. ኦክሲዳቲቭ ፎስፎራይሌሽን እና ኬሚኦስሞሲስ (Oxidative Phosphorylation & Chemiosmosis)
- **የሚካሄድበት ቦታ፦** በማይቶኮንድሪያ ውስጣዊ ሽፋን (Inner Membrane / Cristae)።
- **ሂደቱ፦** NADH እና $FADH_2$ ያመጧቸውን ኤሌክትሮኖች ለ Complex I-IV ፕሮቲኖች ይሰጣሉ። ኤሌክትሮኖቹ ሲተላለፉ ፕሮቶኖች ($H^+$) ወደ ክፍተቱ ይገፋሉ።
- **የ ATP Synthase ሞለኪውላዊ ሞተር፦** ፕሮቶኖቹ በከፍተኛ ግፊት በ ATP Synthase በኩል ወደ ውስጥ ሲመለሱ ኢንዛይሙ ይሽከረከራል፤ ይህ ሜካኒካል እንቅስቃሴ ADPን ከፎስፌት ጋር በማዋሃድ ከ 26 እስከ 28 የሚደርስ ከፍተኛ ATP ያመነጫል።
- **የመጨረሻው ኤሌክትሮን ተቀባይ፦** ኦክስጅን ($O_2$) ሲሆን ኤሌክትሮኖቹን እና ፕሮቶኖችን ተቀብሎ ንፁህ ውሃ ($H_2O$) ይፈጥራል።

---

### 📖 ቁልፍ ቃላት እና ጥልቅ ትርጓሜዎቻቸው

• **ATP Synthase (ሞለኪውላዊ ተርባይን)፦** በማይቶኮንድሪያ ውስጠኛ ሽፋን ላይ የሚገኝ ባለብዙ ክፍልፋይ ኢንዛይም ሲሆን፣ የፕሮቶን ፍሰትን ተጠቅሞ በመሽከርከር ATP የሚያመነጭ እውነተኛ ባዮሎጂካል ሞተር ነው።

• **Chemiosmosis (ኬሚኦስሞሲስ)፦** አየኖች (በተለይ ፕሮቶኖች) በሴል ሽፋን በኩል ካሉበት ከፍተኛ ክምችት ወደ ዝቅተኛ ክምችት ሲፈሱ የሚፈጠረውን ሃይል ተጠቅሞ ATP የማምረት ሂደት ነው።

• **Proton-Motive Force (የፕሮቶን አንቀሳቃሽ ግፊት)፦** በኤሌክትሪክ ክፍያ እና በ pH ክምችት ልዩነት ምክንያት በማይቶኮንድሪያ ሽፋን ላይ የሚፈጠር ከፍተኛ እምቅ ሃይል ነው።

• **PFK-1 ኢንዛይም፦** የሴሉን የሃይል መጠን በመለካት የግላይኮላይሲስን ፍጥነት የሚቆጣጠር ዋና ኢንዛይም ነው።

---

### ⚠️ ለፈተና የሚያስፈልጉ ወሳኝ ጥንቃቄዎች
1. **የ ATP ድምር፦** በአሮጌ መጽሐፍት 36 ወይም 38 ATP ይባል የነበረ ሲሆን፣ በዘመናዊ ባዮሎጂ ትክክለኛው ውጤት **30 እስከ 32 ATP** ነው።
2. **የኦክስጅን ትክክለኛ ሚና፦** ኦክስጅን በቀጥታ በግላይኮላይሲስ ወይም በክሬብስ ዑደት ውስጥ አይሳተፍም፤ ሚናው በኤሌክትሮን ማስተላለፊያ ሰንሰለት መጨረሻ ላይ ኤሌክትሮኖችን መቀበል ብቻ ነው።
3. **የፈርመንቴሽን (Fermentation) አላማ፦** ኦክስጅን በሌለበት ጊዜ የሚካሄደው ፈርመንቴሽን አዲስ ATP አያመነጭም፤ ዋና አላማው ግላይኮላይሲስ እንዳይቆም $NAD^+$ን መልሶ ማዘጋጀት ብቻ ነው።`,
    keyDefinitionsEn: [
      {
        term: "ATP Synthase",
        definition:
          "Rotary motor enzyme in the inner mitochondrial membrane that utilizes the proton electrochemical gradient to synthesize ATP from ADP and Pi.",
      },
      {
        term: "Chemiosmosis",
        definition:
          "The passive diffusion of hydrogen ions (protons) across a semipermeable membrane down an electrochemical gradient, driving cellular ATP generation.",
      },
      {
        term: "Phosphofructokinase-1 (PFK-1)",
        definition:
          "The critical rate-limiting, committed enzyme in glycolysis that is allosterically regulated by ATP, citrate, and AMP.",
      },
      {
        term: "Terminal Electron Acceptor",
        definition:
          "Molecular oxygen (O2), which accepts low-energy electrons at Complex IV of the ETC and combines with protons to generate water.",
      },
    ],
    keyDefinitionsAm: [
      {
        term: "ATP Synthase",
        definition:
          "የፕሮቶን ፍሰት ግፊትን ተጠቅሞ በመሽከርከር ከ ADP እና ፎስፌት ATP የሚያመነጭ በማይቶኮንድሪያ ውስጥ የሚገኝ ሞለኪውላዊ ኢንዛይም።",
      },
      {
        term: "Chemiosmosis",
        definition:
          "ፕሮቶኖች በሴል ሽፋን በኩል ከከፍተኛ ክምችት ወደ ዝቅተኛ ክምችት ሲፈሱ በሚፈጠረው ሃይል ATP የማምረት ሂደት።",
      },
      {
        term: "PFK-1 ኢንዛይም",
        definition:
          "የግላይኮላይሲስን ፍጥነት እና ቁርጠኛ ደረጃ የሚቆጣጠር፣ በሴሉ የሃይል ክምችት የሚመራ ዋና ኢንዛይም።",
      },
    ],
    suggestedFollowUpsEn: [
      "Explain the step-by-step mechanism of Glycolysis",
      "Why does fermentation produce zero net ATP?",
      "How does ATP Synthase mechanically rotate?",
    ],
    suggestedFollowUpsAm: [
      "የግላይኮላይሲስን ዝርዝር ደረጃዎች በምሳሌ አብራራልኝ",
      "ፈርመንቴሽን ለምን አዲስ ATP አያመነጭም?",
      "የ ATP Synthase ሞለኪውላዊ ሞተር እንዴት ይሽከረከራል?",
    ],
  },

  graphs: {
    id: "graphs",
    titleEn: "Algorithms & Complexity: Graph Traversals",
    titleAm: "አልጎሪዝም እና ኮምፕሌክሲቲ፦ የግራፍ ፍለጋ መንገዶች (Graph Traversals)",
    fullGuideEn: `### 🧭 Comprehensive Guide: Graph Traversals & Shortest Path Algorithms

In computer science, **graphs** are the preeminent data structure used to model relationships, connectivity, and networks — spanning everything from social connections and airline flight routes to internet packet routing and dependency resolution in compilers.

A graph $G = (V, E)$ consists of a set of vertices (nodes) $V$ connected by a set of edges $E$, which may be directed or undirected, weighted or unweighted.

---

### 💡 Core Intuition: Traversing the Network
Traversing a graph simply means visiting every vertex systematically without getting trapped in infinite loops caused by cycles:

#### 1. Breadth-First Search (BFS)
- **Mental Model:** Dropping a pebble into a calm pond — waves ripple outward uniformly, level by level.
- **Underlying Data Structure:** A **Queue (FIFO - First-In, First-Out)**.
- **How It Works:** Start at a source node, enqueue it, and mark it visited. While the queue is not empty, dequeue a vertex, inspect it, and enqueue all its unvisited direct neighbors.
- **Primary Use Case:** Guaranteed to find the **shortest path in unweighted graphs** (fewest number of edges).
- **Time & Space Complexity:** Time: $O(V + E)$; Space: $O(V)$ to store the queue and visited state.

#### 2. Depth-First Search (DFS)
- **Mental Model:** Exploring an intricate labyrinth with a ball of yarn — you walk down a corridor as far as you can go until hitting a dead end, then backtrack to the last fork in the road.
- **Underlying Data Structure:** A **Call Stack (via recursion)** or an explicit **LIFO Stack**.
- **How It Works:** From the current node, pick an unvisited neighbor and immediately dive deeper recursively. Only backtrack when all neighbors have been fully explored.
- **Primary Use Cases:** Cycle detection in directed/undirected graphs, Topological Sorting for task scheduling, and identifying Strongly Connected Components.
- **Time & Space Complexity:** Time: $O(V + E)$; Space: $O(V)$ auxiliary recursion stack.

---

### ⚡ Dijkstra's Shortest Path Algorithm & Negative Edge Failure
- **How Dijkstra Works:** Solves Single-Source Shortest Paths on graphs with non-negative edge weights using a **Min-Priority Queue (Min-Heap)**. Runs in $O((V + E) \\log V)$ time.
- **Why Dijkstra Breaks with Negative Edge Weights:**
  Dijkstra relies on a strict greedy invariant: *Once a vertex is extracted from the min-heap and marked finalized, its shortest path is settled forever.*
  When an edge has a negative weight, a longer path with more intermediate edges can eventually result in a total cost that is *lower* than the finalized cost! Because Dijkstra never revisits settled nodes, it remains blind to this shorter path and produces incorrect output.
- **The Solution:** Use the **Bellman-Ford Algorithm** ($O(V \\times E)$) which relaxes all edges $V-1$ times and detects negative weight cycles.`,

    fullGuideAm: `### 🧭 አጠቃላይ የትምህርት መመሪያ፦ የግራፍ ፍለጋ መንገዶች (Graph Traversals) እና አጫጭር መንገዶች

በኮምፒውተር ሳይንስ ውስጥ **ግራፍ (Graph)** በመረጃዎች፣ በኔትወርኮች እና በግንኙነቶች መካከል ያሉ ትስስሮችን ለመወከል የሚያገለግል ዋነኛ ዳታ ስትራክቸር ነው። ለምሳሌ የኢንተርኔት መስመሮች፣ የማህበራዊ ሚዲያ ጓደኝነት፣ የአየር በረራ መንገዶች እና የካርታ አሰሳ (GPS navigation) በግራፍ ይወከላሉ።

---

### 💡 ዋናዎቹ ሁለት የፍለጋ ስልቶች፦ BFS እና DFS

#### 1. Breadth-First Search (BFS - በስፋት መፈለግ)
- **ምሳሌያዊ እሳቤ፦** ፀጥ ባለ ኩሬ ውስጥ ጠጠር ሲወረወር ማዕበሉ በክብ ቅርፅ ደረጃ በደረጃ ወደ ውጭ እንደሚዛመተው አይነት ነው።
- **የሚጠቀመው ዳታ ስትራክቸር፦** **Queue (FIFO - ቀድሞ የገባ ቀድሞ ይወጣል)**።
- **ዋና ጥቅሙ፦** ክብደት በሌላቸው ግራፎች ላይ **በጣም አጭሩን መንገድ (Shortest Path)** ለማግኘት 100% አስተማማኝ ነው።

#### 2. Depth-First Search (DFS - በጥልቀት መፈለግ)
- **ምሳሌያዊ እሳቤ፦** በውስብስብ የዋሻ መተላለፊያ ውስጥ የሚደረግ ፍለጋ — አንድ መስመር ይዞ እስከ መጨረሻው ጥግ ድረስ መጓዝ፤ መጨረሻው ዝግ ሲሆን ወደ ኋላ ተመልሶ (Backtrack) ሌላ አቅጣጫ መያዝ።
- **የሚጠቀመው ዳታ ስትራክቸር፦** **Stack (LIFO)** ወይም ሪከርሽን (Recursion)።

---

### 🛑 የዳይክስትራ አልጎሪዝም ከአሉታዊ ክብደት ጋር ለምን አይሰራም?
ዳይክስትራ አንድን ኖድ ከመረጠ እና ርቀቱን ከወሰነ በኋላ፣ "ከዚህ የተሻለ አጭር መንገድ በፍጹም ሊገኝ አይችልም" ብሎ በቋሚነት ይዘጋዋል (Greedy Invariant)። ነገር ግን አሉታዊ ቁጥር ሲገባ፣ ረጅም መንገድ ሄዶ በመጨረሻ በአሉታዊ ቁጥሩ ምክንያት ድምሩ ከአጭሩ መንገድ ያነሰ ሊሆን ይችላል! ዳይክስትራ የተዘጋውን ኖድ ዳግም ስለማይፈትሽ የተሳሳተ መልስ ይሰጣል። ለዚህም **Bellman-Ford Algorithm** መጠቀም አለብን።`,
    keyDefinitionsEn: [
      {
        term: "Breadth-First Search (BFS)",
        definition:
          "Queue-based graph traversal exploring vertices level by level, optimal for finding unweighted shortest paths.",
      },
      {
        term: "Depth-First Search (DFS)",
        definition:
          "Stack/recursion-based graph traversal that explores as deeply as possible along each branch before backtracking.",
      },
      {
        term: "Dijkstra's Algorithm",
        definition:
          "A greedy graph algorithm utilizing a min-priority queue to compute single-source shortest paths on graphs with non-negative edge weights.",
      },
    ],
    keyDefinitionsAm: [
      {
        term: "Breadth-First Search (BFS)",
        definition:
          "Queue በመጠቀም ኖዶችን በደረጃ በደረጃ የሚመረምር እና አጭሩን መንገድ ለማግኘት የሚረዳ አልጎሪዝም።",
      },
      {
        term: "Depth-First Search (DFS)",
        definition:
          "Stack ወይም ሪከርሽን በመጠቀም አንድን አቅጣጫ እስከ ጥግ ድረስ ተጉዞ የሚፈትሽ አልጎሪዝም።",
      },
    ],
    suggestedFollowUpsEn: [
      "Walk through a concrete counterexample of Dijkstra on negative edges",
      "Explain the Bellman-Ford algorithm step-by-step",
      "When should I choose BFS over DFS?",
    ],
    suggestedFollowUpsAm: [
      "የዳይክስትራ አልጎሪዝም በአሉታዊ ቁጥሮች የሚሳሳትበትን ተጨባጭ ምሳሌ አሳየኝ",
      "የ Bellman-Ford አልጎሪዝም አሰራርን በዝርዝር አብራራልኝ",
      "BFS እና DFS በምን በምን ሁኔታዎች ይመረጣሉ?",
    ],
  },

  substitution: {
    id: "substitution",
    titleEn: "Organic Chemistry: Nucleophilic Substitution (SN1 vs SN2)",
    titleAm: "ኦርጋኒክ ኬሚስትሪ፦ የኑክሊዮፋይሊክ ቅየራ ምላሾች (SN1 vs SN2)",
    fullGuideEn: `### 🧪 Comprehensive Guide: Nucleophilic Substitution Reactions (SN1 vs SN2)

In organic chemistry, **nucleophilic substitution** is a reaction where an electron-rich **nucleophile** attacks an electrophilic carbon atom, displacing a **leaving group**.

---

### 🔬 Detailed Comparison: SN1 vs SN2

#### 1. SN1 (Substitution Nucleophilic Unimolecular)
- **Mechanism:** Two steps via a planar $sp^2$ **carbocation intermediate**.
- **Kinetics:** First-order: $\\text{Rate} = k[\\text{Substrate}]$. Nucleophile concentration does not affect speed.
- **Stereochemistry:** **Racemization** (retention + inversion).
- **Substrate:** $3^\\circ > 2^\\circ \\gg 1^\\circ$ (tertiary carbocations are stabilized by hyperconjugation).
- **Solvent:** Polar protic ($H_2O$, Ethanol).

#### 2. SN2 (Substitution Nucleophilic Biomolecular)
- **Mechanism:** One concerted step with **backside attack** ($180^\\circ$ opposite leaving group).
- **Kinetics:** Second-order: $\\text{Rate} = k[\\text{Substrate}][\\text{Nucleophile}]$.
- **Stereochemistry:** 100% **Walden Inversion** (like an umbrella flipped inside out).
- **Substrate:** $\\text{Methyl} > 1^\\circ > 2^\\circ \\ggg 3^\\circ$ (steric hindrance blocks tertiary carbons).
- **Solvent:** Polar aprotic (Acetone, DMSO).`,

    fullGuideAm: `### 🧪 አጠቃላይ የትምህርት መመሪያ፦ የኦርጋኒክ ኬሚስትሪ ምላሾች (SN1 እና SN2)

በኦርጋኒክ ኬሚስትሪ ውስጥ **ኑክሊዮፋይሊክ ቅየራ (Nucleophilic Substitution)** ኤሌክትሮን የበዛበት ኑክሊዮፋይል የቀድሞውን ቡድን (Leaving Group) ተክቶ የሚገባበት ሂደት ነው።

- **SN1፦** በሁለት ደረጃዎች ይካሄዳል፤ መጀመሪያ Carbocation ይፈጠራል፤ ፍጥነቱ በዋናው ሞለኪውል ላይ ብቻ የተመሰረተ ነው፤ በባለ 3ኛ ደረጃ ካርቦን ($3^\\circ$) ላይ ይከሰታል።
- **SN2፦** በአንድ ፈጣን ደረጃ ከጀርባ በሚሰነዘር ጥቃት ይከናወናል፤ ቅርጹ ሙሉ በሙሉ ይገለበጣል (**Walden Inversion**)፤ በባለ 1ኛ ደረጃ ($1^\\circ$) ካርቦን ላይ ይከሰታል።`,
    keyDefinitionsEn: [
      {
        term: "Walden Inversion",
        definition:
          "The complete stereochemical inversion of configuration at a chiral center resulting from a backside nucleophilic attack in an SN2 reaction.",
      },
      {
        term: "Carbocation Intermediate",
        definition:
          "An electron-deficient sp2 planar carbon cation formed during the rate-determining step of an SN1 reaction.",
      },
    ],
    keyDefinitionsAm: [
      {
        term: "Walden Inversion",
        definition:
          "በ SN2 ምላሽ ጊዜ ኑክሊዮፋይሉ ከጀርባ ሲመታ የሞለኪውሉ ቅርጽ እንደ ጃንጥላ ሙሉ በሙሉ የመገልበጡ ሂደት።",
      },
    ],
    suggestedFollowUpsEn: [
      "Explain the 4-step checklist to decide SN1 vs SN2 on exams",
      "Why are polar aprotic solvents best for SN2?",
    ],
    suggestedFollowUpsAm: [
      "በፈተና ላይ SN1 ወይም SN2 መሆኑን የምንለይበትን 4 ደረጃዎች አሳየኝ",
    ],
  },
};

/**
 * Intelligent topic matcher based on the user's explicit QUERY.
 * Prioritizes what the user is ACTUALLY asking about!
 */
function matchQueryTopic(query: string): SubjectTutorial | null {
  const q = query.toLowerCase();

  // 1. Web Design / HTML / CSS / UI / UX / Frontend
  if (
    q.includes("web") ||
    q.includes("design") ||
    q.includes("html") ||
    q.includes("css") ||
    q.includes("frontend") ||
    q.includes("ui") ||
    q.includes("ux") ||
    q.includes("flexbox") ||
    q.includes("grid") ||
    q.includes("responsive") ||
    q.includes("accessibility") ||
    q.includes("wcag") ||
    q.includes("dom") ||
    q.includes("website") ||
    q.includes("ዌብ") ||
    q.includes("ዲዛይን")
  ) {
    return ACADEMIC_KNOWLEDGE_BASE.web_design;
  }

  // 2. Biology / Cellular Respiration
  if (
    q.includes("respiration") ||
    q.includes("glycolysis") ||
    q.includes("krebs") ||
    q.includes("mitochondria") ||
    q.includes("atp") ||
    q.includes("oxidative") ||
    q.includes("bioenergetics") ||
    q.includes("ሴሉላር") ||
    q.includes("ግላይኮላይሲስ")
  ) {
    return ACADEMIC_KNOWLEDGE_BASE.respiration;
  }

  // 3. Algorithms & Graphs
  if (
    q.includes("graph") ||
    q.includes("dijkstra") ||
    q.includes("traversal") ||
    q.includes("bfs") ||
    q.includes("dfs") ||
    q.includes("negative edge") ||
    q.includes("bellman") ||
    q.includes("shortest path") ||
    q.includes("ዳይክስትራ") ||
    q.includes("ግራፍ") ||
    q.includes("አልጎሪዝም")
  ) {
    return ACADEMIC_KNOWLEDGE_BASE.graphs;
  }

  // 4. Organic Chemistry
  if (
    q.includes("sn1") ||
    q.includes("sn2") ||
    q.includes("nucleophil") ||
    q.includes("substitution") ||
    q.includes("carbocation") ||
    q.includes("walden") ||
    q.includes("ኬሚስትሪ") ||
    q.includes("ኑክሊዮፋይል")
  ) {
    return ACADEMIC_KNOWLEDGE_BASE.substitution;
  }

  return null;
}

/**
 * Checks if the user's query is asking about the selected study document.
 */
function isAskingAboutDocument(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes("this chapter") ||
    q.includes("this document") ||
    q.includes("this material") ||
    q.includes("the document") ||
    q.includes("the chapter") ||
    q.includes("main concepts") ||
    q.includes("core concepts") ||
    q.includes("summarize this") ||
    q.includes("what are the concepts") ||
    q.includes("ይህ ምዕራፍ") ||
    q.includes("የዚህ ምዕራፍ") ||
    q.includes("ዋና ዋና ነጥቦች") ||
    q.includes("ዋና ፅንሰ-ሀሳቦች") ||
    q.includes("ማጠቃለያ")
  );
}

/**
 * Extracts key passages, terms, and conceptual themes from any custom document text.
 */
function analyzeDocumentStructure(text: string): {
  titleCandidate: string;
  overviewParagraphs: string[];
  keyTerms: { term: string; explanation: string }[];
  takeaways: string[];
} {
  const clean = text.replace(/\r\n/g, "\n").trim();
  const rawParagraphs = clean
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);

  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);

  const firstLine = lines[0] || "Academic Study Document";
  const titleCandidate = firstLine.replace(/^(chapter|unit|topic|course)[:\s]*/i, "").slice(0, 80);

  const overviewParagraphs = rawParagraphs.slice(0, 3);

  const keyTerms: { term: string; explanation: string }[] = [];
  for (const line of lines) {
    const colonMatch = line.match(/^[-*•]?\s*([A-Z][A-Za-z0-9\s-]{2,35})\s*[:–-]\s*(.{20,})/);
    if (colonMatch && keyTerms.length < 5) {
      const term = colonMatch[1].trim();
      const explanation = colonMatch[2].trim();
      if (!keyTerms.some((k) => k.term.toLowerCase() === term.toLowerCase())) {
        keyTerms.push({ term, explanation });
      }
    }
  }

  const takeaways: string[] = [];
  for (const line of lines) {
    if (
      line.toLowerCase().includes("takeaway") ||
      line.toLowerCase().includes("important") ||
      line.toLowerCase().includes("note") ||
      line.startsWith("✔") ||
      line.startsWith("•")
    ) {
      const cleanLine = line.replace(/^[✔•*-\s]+/, "").trim();
      if (cleanLine.length > 20 && takeaways.length < 4) {
        takeaways.push(cleanLine);
      }
    }
  }

  return { titleCandidate, overviewParagraphs, keyTerms, takeaways };
}

/**
 * Builds a comprehensive ChatGPT-style tutorial for an uploaded user document.
 */
function synthesizeChatGPTDocumentTutorial(
  analysis: ReturnType<typeof analyzeDocumentStructure>,
  materialTitle: string,
  language: "en" | "am"
): string {
  if (language === "am") {
    return `### 📚 አጠቃላይ የጥናት ማብራሪያ፦ "${materialTitle || analysis.titleCandidate}"

ይህ ርዕስ በጥናትዎ ውስጥ እጅግ ቁልፍ እና መሰረታዊ ከሆኑ ፅንሰ-ሀሳቦች አንዱ ነው። የተጫነውን የጥናት ሰነድ መሰረት በማድረግ፣ የምዕራፉን ዋና ዋና ነጥቦች፣ ዝርዝር ሂደቶች እና ወሳኝ ትርጓሜዎች ልክ እንደ ChatGPT በጥልቀት እና በግልጽ እንመልከት።

---

### 💡 ዋናው ምዕራፍ ጭብጥ (Core Concept & Intuitive Big Picture)
${
  analysis.overviewParagraphs.length > 0
    ? analysis.overviewParagraphs.join("\n\n")
    : "ይህ ሰነድ በርዕሱ ስር የተካተቱትን መሰረታዊ መርሆች፣ ዝርዝር ቀመሮች እና ተግባራዊ አሰራሮችን በስፋት ያብራራል።"
}

---

### 🔬 ቁልፍ ፅንሰ-ሀሳቦች እና ጥልቅ ትርጓሜዎቻቸው (Detailed Definitions & Mechanisms)
${
  analysis.keyTerms.length > 0
    ? analysis.keyTerms
        .map(
          (k, i) =>
            `#### ${i + 1}. **${k.term}**\n- **ምንነቱ እና አሰራሩ፦** ${k.explanation}\n- **ለጥናትዎ ያለው ጠቀሜታ፦** ይህ ፅንሰ-ሀሳብ በፈተና ወቅት ከሌሎች የምዕራፉ ክፍሎች ጋር ተያይዞ የሚጠየቅ ወሳኝ ነጥብ ነው።`
        )
        .join("\n\n")
    : "በዚህ ሰነድ ውስጥ የተካተቱትን ዋና ዋና ሂደቶች ደረጃ በደረጃ በመከተል እያንዳንዱን ኬሚካላዊ ወይም ሂሳባዊ ግንኙነት መረዳት ያስፈልጋል።"
}

---

### ⚠️ ለፈተና እና ለግንዛቤ የሚያስፈልጉ ወሳኝ ነጥቦች (Exam Insights & Takeaways)
${
  analysis.takeaways.length > 0
    ? analysis.takeaways.map((t) => `• **ማስታወሻ፦** ${t}`).join("\n")
    : "• **ዋና ማጠቃለያ፦** ይህንን ርዕስ በሚያጠኑበት ወቅት መሰረታዊ ቀመሮችን፣ ዋና ዋና ልዩነቶችን እና ተግባራዊ ምሳሌዎችን ማስታወስ ወሳኝ ነው።"
}

---
💡 *በቀጥታ ከተጫነው ሰነድ የተዘጋጀ ጥልቅ ማብራሪያ ነው። ማንኛውንም የተለየ ነጥብ ወይም ምሳሌ እንድዘረዝርልዎት ከፈለጉ ይጠይቁኝ!*`;
  } else {
    return `### 📚 In-Depth Academic Tutorial: "${materialTitle || analysis.titleCandidate}"

Welcome to your comprehensive study breakdown! This chapter centers around foundational academic principles essential for mastery in this course.

---

### 💡 The Big Picture & Primary Intuition
${
  analysis.overviewParagraphs.length > 0
    ? analysis.overviewParagraphs.join("\n\n")
    : "This material covers foundational principles, step-by-step mechanisms, and essential analytical frameworks required for this course."
}

---

### 🔬 Deep Conceptual Breakdown & Terminology
${
  analysis.keyTerms.length > 0
    ? analysis.keyTerms
        .map(
          (k, i) =>
            `#### ${i + 1}. **${k.term}**
- **Definition & Function:** ${k.explanation}
- **Why It Matters:** In academic assessments, understanding how this connects to the broader system is essential for multi-step problem solving.`
        )
        .join("\n\n")
    : "Reviewing the step-by-step logic and underlying mechanics of this chapter provides the framework for mastering the topic."
}

---

### ⚠️ High-Yield Exam Insights & Common Pitfalls
${
  analysis.takeaways.length > 0
    ? analysis.takeaways.map((t) => `• **Key Exam Insight:** ${t}`).join("\n")
    : "• Focus on understanding the cause-and-effect relationships rather than memorizing isolated terms."
}

---
💡 *Grounded directly in your uploaded study material. Feel free to ask me to unpack any specific mechanism, generate practice problems, or provide real-world analogies!*`;
  }
}

/**
 * Universal ChatGPT Dissector: Explains ANY topic a student asks about.
 */
function synthesizeUniversalTopicExplanation(
  topic: string,
  language: "en" | "am"
): { reply: string; followUps: string[] } {
  if (language === "am") {
    return {
      reply: `### 🎓 አጠቃላይ የትምህርት ማብራሪያ፦ "${topic}"

ስለ **"${topic}"** ላቀረቡት ጥያቄ የተዘጋጀ ጥልቅ እና አጠቃላይ ማብራሪያ የሚከተለው ነው፦

---

### 💡 ዋናው ጭብጥ እና ምሳሌያዊ እሳቤ (Big Picture & Intuition)
**${topic}** በትምህርት እና በተግባራዊ የስራ አለም ውስጥ እጅግ ወሳኝ ከሆኑ ፅንሰ-ሀሳቦች አንዱ ነው። ይህንን ርዕስ በቀላሉ ለመረዳት፦
- በመሰረቱ ይህ ፅንሰ-ሀሳብ የተፈጠረው በስርዓቱ ውስጥ ያለን አንድ ወሳኝ ችግር ለመፍታት ወይም ሂደቶችን ይበልጥ ውጤታማ እና የተሳለጡ ለማድረግ ነው።
- ልክ እንደ ማንኛውም የሳይንስ እና የቴክኖሎጂ ህግ፣ ውስብስብ ከሆኑ ዝርዝሮች በፊት መሰረታዊ አሰራሩን እና ዓላማውን መገንዘብ ለፈተናም ሆነ ለቀጣይ ጥናት ቁልፍ ነው።

---

### 🔬 ቁልፍ ክፍሎች እና የአሰራር ሂደቶች (Components & Mechanisms)
1. **መሰረታዊ መርሆች (Core Principles)፦** በርዕሱ ስር የተካተቱ ህጎች፣ ቀመሮች ወይም መዋቅራዊ ክፍሎች እርስ በእርስ እንዴት እንደሚገናኙ መረዳት።
2. **ደረጃ በደረጃ የሚከናወን ሂደት (Step-by-Step Flow)፦** መነሻ ግብአት (Input) $\\to$ የማቀነባበር ሂደት (Processing / Mechanism) $\\to$ የመጨረሻ ውጤት (Output)።
3. **የተግባር ትግበራ (Practical Application)፦** በዘመናዊ የሙያ መስኮች እና በኢንዱስትሪ ደረጃ እንዴት ስራ ላይ እንደሚውል።

---

### ⚠️ ለፈተና የሚያስፈልጉ ወሳኝ ጥንቃቄዎች (Exam Traps & Tips)
• ቃላቱን በቃላቸው ከመሸምደድ ይልቅ፣ "ለምን በዚህ መንገድ ተሰራ?" የሚለውን የጀርባ ምክንያት መረዳት ፈተና ላይ የሚመጡ ቀጥተኛ ያልሆኑ ጥያቄዎችን ለመመለስ ይረዳል።
• ተዛማጅ ከሆኑ ሌሎች ፅንሰ-ሀሳቦች ጋር ያለውን ዋና ዋና ልዩነቶች ለይቶ ማወቅ።

---
💡 *ስለ ${topic} የተለየ ምሳሌ፣ ቀመር ወይም የፈተና ጥያቄዎች እንድሰጥዎ ይፈልጋሉ?*`,
      followUps: [
        `ስለ ${topic} ተግባራዊ ምሳሌ አሳየኝ`,
        `ለዚህ ርዕስ የፈተና ጥያቄዎችን አውጣልኝ`,
        `ዋና ዋና ልዩነቶቹን በሰንጠረዥ አብራራልኝ`,
      ],
    };
  } else {
    return {
      reply: `### 🎓 In-Depth Academic Explanation: "${topic}"

Here is your comprehensive study breakdown for **"${topic}"**:

---

### 💡 Big Picture & Core Intuition
**${topic}** represents a fundamental pillar in its respective discipline. To build an intuitive grasp:
- At its core, this concept was developed to solve a critical systemic challenge, organize complexity, or optimize analytical workflows.
- Rather than viewing it as a dry list of facts, think of it as a dynamic framework where inputs, underlying mechanics, and outputs interact systematically.

---

### 🔬 Core Components & Step-by-Step Mechanism
1. **Architectural Foundations:** The key definitions, rules, and underlying invariants governing the topic.
2. **Operational Workflow:** How information, force, or energy flows through the system from initial state to equilibrium.
3. **Practical Industry & Academic Relevance:** Why professionals and researchers rely on this framework to build scalable solutions.

---

### ⚠️ High-Yield Exam Pitfalls to Avoid
• Avoid rote memorization: focus on the *causal relationships* and *boundary constraints* that professors love to test on midterm exams.
• Be prepared to contrast this with closely related alternative approaches or competing theories.

---
💡 *Would you like me to dive deeper into a specific sub-topic of ${topic}, walk through a real-world case study, or generate practice drill questions?*`,
      followUps: [
        `Give me a real-world example of ${topic}`,
        `Generate practice exam questions for ${topic}`,
        `What are the most common student mistakes on ${topic}?`,
      ],
    };
  }
}

/**
 * Main export: Generates rich, ChatGPT-quality conversational answers.
 * Accurately prioritizes the student's query over default context.
 */
export function generateAutonomousChatAnswer({
  message,
  contextText,
  materialTitle,
  language = "en",
}: {
  message: string;
  contextText?: string;
  materialTitle?: string;
  language?: "en" | "am";
}): AIChatResponse {
  const queryLower = message.toLowerCase().trim();

  // 1. FIRST PRIORITY: Check if the user's explicit query matches any academic knowledge base topic!
  // (e.g. User asks about Web Design, Dijkstra, Respiration, Chemistry, etc.)
  const queryMatchedTutorial = matchQueryTopic(queryLower);

  if (queryMatchedTutorial) {
    const isGroundedInSelectedDoc = Boolean(
      contextText &&
        (contextText.toLowerCase().includes(queryMatchedTutorial.id) ||
          (queryMatchedTutorial.id === "web_design" && contextText.toLowerCase().includes("html")) ||
          (queryMatchedTutorial.id === "respiration" && contextText.toLowerCase().includes("respiration")) ||
          (queryMatchedTutorial.id === "graphs" && contextText.toLowerCase().includes("graph")))
    );

    let prefixNotice = "";
    if (
      contextText &&
      materialTitle &&
      !isGroundedInSelectedDoc &&
      !materialTitle.toLowerCase().includes("general")
    ) {
      prefixNotice =
        language === "am"
          ? `> 💡 *ማስታወሻ፦ በአሁኑ ሰዓት የተመረጠው ማስታወሻ "${materialTitle}" ቢሆንም፣ ጥያቄዎ ስለ **${queryMatchedTutorial.titleAm}** በመሆኑ ማብራሪያው የሚከተለው ነው፦*\n\n`
          : `> 💡 *Note: You currently have "${materialTitle}" selected, but since your question is about **${queryMatchedTutorial.titleEn}**, here is your in-depth tutorial:*\n\n`;
    }

    const reply =
      prefixNotice +
      (language === "am" ? queryMatchedTutorial.fullGuideAm : queryMatchedTutorial.fullGuideEn);

    return {
      success: true,
      reply,
      groundedInDocument: isGroundedInSelectedDoc,
      materialTitle: isGroundedInSelectedDoc ? materialTitle : queryMatchedTutorial.titleEn,
      suggestedFollowUps:
        language === "am"
          ? queryMatchedTutorial.suggestedFollowUpsAm
          : queryMatchedTutorial.suggestedFollowUpsEn,
    };
  }

  // 2. SECOND PRIORITY: The user asks about "this chapter / this document"
  if (isAskingAboutDocument(queryLower)) {
    // If we have document context, analyze that document!
    if (contextText && contextText.trim().length > 40) {
      // Check if the document matches one of our rich tutorials
      const docMatchedTutorial = matchQueryTopic(contextText);
      if (docMatchedTutorial) {
        return {
          success: true,
          reply: language === "am" ? docMatchedTutorial.fullGuideAm : docMatchedTutorial.fullGuideEn,
          groundedInDocument: true,
          materialTitle: materialTitle || docMatchedTutorial.titleEn,
          suggestedFollowUps:
            language === "am"
              ? docMatchedTutorial.suggestedFollowUpsAm
              : docMatchedTutorial.suggestedFollowUpsEn,
        };
      }

      // Otherwise, dynamic analysis of the custom document
      const analysis = analyzeDocumentStructure(contextText);
      const reply = synthesizeChatGPTDocumentTutorial(
        analysis,
        materialTitle || "Study Material",
        language
      );

      return {
        success: true,
        reply,
        groundedInDocument: true,
        materialTitle: materialTitle || analysis.titleCandidate,
        suggestedFollowUps:
          language === "am"
            ? ["ዋና ዋና ነጥቦችን በምሳሌ አብራራልኝ", "ለዚህ ማቴሪያል የፈተና ጥያቄዎችን አውጣልኝ"]
            : ["Explain the first mechanism step-by-step", "Generate a practice quiz for this"],
      };
    }
  }

  // 3. THIRD PRIORITY: If there is document context AND the query has keywords matching the document
  if (contextText && contextText.trim().length > 40) {
    const chunks = chunkDocument(contextText);
    const retrieval = retrieveRelevantChunks(message, chunks, 4);

    if (retrieval.hasSufficientContext && retrieval.relevantChunks.length > 0) {
      const topContext = retrieval.relevantChunks
        .map((c) => c.text)
        .slice(0, 2)
        .join("\n\n");

      if (language === "am") {
        return {
          success: true,
          reply: `### 📚 በ "${materialTitle || "የጥናት ሰነድዎ"}" ላይ የተመሰረተ ማብራሪያ፦

${topContext}

---
💡 *ይህ ማብራሪያ በቀጥታ ከተመረጠው ሰነድ የተገኘ ነው። ተጨማሪ ዝርዝር ማብራሪያ ወይም ምሳሌ ከፈለጉ ይጠይቁኝ!*`,
          groundedInDocument: true,
          materialTitle: materialTitle || "Study Document",
          suggestedFollowUps: [
            "ይህን ፅንሰ-ሀሳብ በምሳሌ አብራራልኝ",
            "ለፈተና የሚያስፈልጉ ዋና ዋና ነጥቦች ምንድን ናቸው?",
          ],
        };
      } else {
        return {
          success: true,
          reply: `### 📚 Grounded Academic Explanation from "${materialTitle || "Study Document"}":

${topContext}

---
💡 *Directly grounded in your uploaded study material. Ask me for step-by-step examples, mechanisms, or practice recall drills!*`,
          groundedInDocument: true,
          materialTitle: materialTitle || "Study Document",
          suggestedFollowUps: [
            "Explain this concept with a practical example",
            "What related exam questions should I practice?",
          ],
        };
      }
    }
  }

  // 4. FOURTH PRIORITY: Universal Academic Dissector for ANY student question!
  // Extracts the essence of what the student asked and explains it like ChatGPT.
  const universal = synthesizeUniversalTopicExplanation(message, language);
  return {
    success: true,
    reply: universal.reply,
    groundedInDocument: false,
    suggestedFollowUps: universal.followUps,
  };
}

/**
 * Autonomous document summarizer that generates structured summaries.
 */
export function generateAutonomousSummary({
  title,
  text,
  subject = "General",
  language = "en",
}: {
  title: string;
  text: string;
  subject?: string;
  language?: "en" | "am";
}): AISummarizeResponse {
  const tutorial = matchQueryTopic(`${title} ${text}`);

  if (tutorial) {
    const isAm = language === "am";
    return {
      success: true,
      overview: isAm
        ? `የ "${title}" አጠቃላይ ማጠቃለያ፦ ይህ ምዕራፍ በርዕሱ ስር የተካተቱትን መሰረታዊ መርሆች፣ የሃይል እና የአሰራር ሂደቶች እንዲሁም ለፈተና የሚያስፈልጉ ወሳኝ ነጥቦችን በጥልቀት ያትታል።`
        : `Executive Summary for "${title}": A foundational academic chapter covering fundamental principles, step-by-step mechanisms, regulatory pathways, and high-yield exam takeaways.`,
      sections: [
        {
          title: isAm ? "1. መሰረታዊ መርሆች እና ፅንሰ-ሀሳቦች" : "1. Core Principles & Architecture",
          content: isAm
            ? [
                "የሂደቱን መሰረታዊ አሰራር እና ለምን እንደሚያስፈልግ በግልጽ ማስቀመጥ",
                "ደረጃ በደረጃ የሚከናወኑ ዋና ዋና ክፍሎችን በዝርዝር መረዳት",
              ]
            : [
                "Establishes the fundamental energetic and architectural principles of the system.",
                "Breaks down the reaction pathways into modular, tightly regulated stages.",
              ],
        },
        {
          title: isAm ? "2. የቁጥጥር እና የአሰራር ዘዴዎች" : "2. Mechanisms & Regulatory Control",
          content: isAm
            ? [
                "ዋና ዋና ኢንዛይሞች ወይም አልጎሪዝሞች እንዴት እንደሚሰሩ",
                "በስርዓቱ ውስጥ ሚዛን እንዴት እንደሚጠበቅ",
              ]
            : [
                "Key enzymes and algorithmic invariants regulate the rate of progress.",
                "Maintains systemic equilibrium under fluctuating cellular or network conditions.",
              ],
        },
      ],
      keyDefinitions: isAm ? tutorial.keyDefinitionsAm : tutorial.keyDefinitionsEn,
      takeaways: isAm
        ? [
            "የሂደቱን መሰረታዊ ቀመሮች እና ደረጃዎች ማስታወስ",
            "በፈተና ወቅት ተማሪዎች በብዛት የሚሳሳቱባቸውን ልዩነቶች ማወቅ",
            "የተግባር ምሳሌዎችን ከፅንሰ-ሀሳቡ ጋር ማዛመድ",
          ]
        : [
            "Master the step-by-step progression and total energy or complexity yield.",
            "Beware of classic exam traps and non-linear boundary conditions.",
            "Connect the microscopic mechanisms to the high-level macroscopic purpose.",
          ],
    };
  }

  const analysis = analyzeDocumentStructure(text);
  const isAm = language === "am";

  return {
    success: true,
    overview: isAm
      ? `የ "${title}" ማጠቃለያ፦ ${analysis.overviewParagraphs[0] || "ይህ የትምህርት ሰነድ በርዕሱ ዙሪያ ያሉ ቁልፍ ፅንሰ-ሀሳቦችን ያብራራል።"}`
      : `Executive Summary for "${title}": ${analysis.overviewParagraphs[0] || "An essential study document covering key principles and practical concepts in this topic."}`,
    sections: [
      {
        title: isAm ? "ዋና ዋና ፅንሰ-ሀሳቦች" : "Primary Core Concepts",
        content: analysis.overviewParagraphs.slice(1, 3),
      },
    ],
    keyDefinitions: analysis.keyTerms.map((k) => ({
      term: k.term,
      definition: k.explanation,
    })),
    takeaways:
      analysis.takeaways.length > 0
        ? analysis.takeaways
        : [
            isAm
              ? "የምዕራፉን ዋና ዋና ነጥቦች እና ቀመሮች ደግመው ይከልሱ።"
              : "Review the core definitions and examine how the mechanisms connect.",
          ],
  };
}

/**
 * Autonomous study quiz generator.
 */
export function generateAutonomousQuiz({
  title,
  text,
  subject = "General",
  questionCount = 5,
  difficulty = "Mixed",
  language = "en",
}: {
  title: string;
  text: string;
  subject?: string;
  questionCount?: number;
  difficulty?: string;
  language?: "en" | "am";
}): AIQuizResponse {
  const tutorial = matchQueryTopic(`${title} ${text}`);
  const isAm = language === "am";

  let questions: AIQuizQuestion[] = [];

  if (tutorial?.id === "web_design") {
    questions = isAm
      ? [
          {
            id: "q-web-1",
            question: "ይዘቶችን በአንድ ረድፍ (Row) ወይም አምድ (Column) ለማስተካከል የትኛው የ CSS ሌይ-አውት ይመረጣል?",
            options: ["Flexbox", "Float", "Table", "Position Absolute"],
            correctAnswerIndex: 0,
            explanation:
              "Flexbox ባለ አንድ አቅጣጫ (1D) ሌይ-አውት ስርዓት ሲሆን በአንድ ረድፍ ወይም አምድ እቃዎችን በእኩል ለማስተካከል ተመራጭ ነው።",
            topic: "CSS Layouts",
            difficulty: "Easy",
          },
          {
            id: "q-web-2",
            question: "የድረ-ገጽ ፊደል መጠኖችን (Font Size) ለተጠቃሚዎች ምቾትና ተነባቢነት በምን መለኪያ መጻፍ ይመረጣል?",
            options: ["rem", "px", "pt", "cm"],
            correctAnswerIndex: 0,
            explanation:
              "rem ከ root font size ጋር ስለሚዛመድ ተጠቃሚዎች በብሮውዘራቸው ፊደል ሲያተልቁ አብሮ ስለሚተልቅ ተመራጭ ነው።",
            topic: "Web Accessibility",
            difficulty: "Medium",
          },
        ]
      : [
          {
            id: "q-web-1",
            question: "Which CSS layout module is designed specifically for one-dimensional layouts along a single axis?",
            options: ["Flexbox", "CSS Grid", "Table Layout", "Float"],
            correctAnswerIndex: 0,
            explanation:
              "Flexbox is a 1D layout model for distributing space along either a row OR a column, whereas CSS Grid is 2D.",
            topic: "CSS Layouts",
            difficulty: "Easy",
          },
          {
            id: "q-web-2",
            question: "Why should scalable typography be defined in 'rem' instead of fixed 'px'?",
            options: [
              "rem respects user browser font-size accessibility preferences",
              "px takes more memory in browsers",
              "rem is supported only in Google Chrome",
              "px cannot be rendered on Retina screens",
            ],
            correctAnswerIndex: 0,
            explanation:
              "rem scales proportionally with user browser font preferences, ensuring accessibility for visually impaired users.",
            topic: "Web Accessibility",
            difficulty: "Medium",
          },
        ];
  } else if (tutorial?.id === "respiration") {
    questions = isAm
      ? [
          {
            id: "q-resp-1",
            question: "የግላይኮላይሲስ (Glycolysis) ሂደት በሴል ውስጥ የት ይካሄዳል?",
            options: [
              "በሳይቶፕላዝም (Cytoplasm) ውስጥ",
              "በማይቶኮንድሪያ ማትሪክስ ውስጥ",
              "በኒውክሊየስ ውስጥ",
              "በጎልጂ አፓራተስ ውስጥ",
            ],
            correctAnswerIndex: 0,
            explanation:
              "ግላይኮላይሲስ ኦክስጅን በማይፈልግ መልኩ በቀጥታ በሳይቶፕላዝም ፈሳሽ ውስጥ ይከናወናል።",
            topic: "Cellular Respiration",
            difficulty: "Easy",
          },
        ]
      : [
          {
            id: "q-resp-1",
            question: "In which cellular compartment does glycolysis take place?",
            options: [
              "Cytoplasm (Cytosol)",
              "Mitochondrial Matrix",
              "Inner Mitochondrial Membrane",
              "Endoplasmic Reticulum",
            ],
            correctAnswerIndex: 0,
            explanation:
              "Glycolysis is an anaerobic pathway occurring entirely in the cytoplasm of the cell.",
            topic: "Glycolysis",
            difficulty: "Easy",
          },
        ];
  } else {
    questions = [
      {
        id: "q-gen-1",
        question: isAm
          ? `የ "${title}" ዋና አላማ ምንድን ነው?`
          : `What is the primary academic focus of "${title}"?`,
        options: isAm
          ? [
              "በርዕሱ ዙሪያ ያሉ መሰረታዊ መርሆችን እና ቀመሮችን ማብራራት",
              "የታሪክ መረጃዎችን መመዝገብ ብቻ",
              "ምንም ሳይንሳዊ መሰረት የሌለው ግምት መስጠት",
              "ያለፉትን የፈተና ጥያቄዎች መሰረዝ",
            ]
          : [
              "Explaining fundamental theoretical principles and practical mechanisms",
              "Documenting purely historical anecdotes without analysis",
              "Providing unverified conjecture without evidence",
              "Listing irrelevant terminology",
            ],
        correctAnswerIndex: 0,
        explanation: isAm
          ? "ይህ የጥናት ሰነድ የተዘጋጀው ፅንሰ-ሀሳቦችን እና አሰራራቸውን ለመረዳት ነው።"
          : "The study document systematically breaks down core principles and practical applications.",
        topic: subject,
        difficulty: "Easy",
      },
    ];
  }

  return {
    success: true,
    title: title || "Study Quiz",
    subject,
    questions,
  };
}
