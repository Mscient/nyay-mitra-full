Γùê

__THE FRONTEND UI__

__ENGINEERING GUIDE__

*For AI Systems Building Production\-Grade UI*

__A complete mandatory reference covering design systems,__

component architecture, accessibility, performance,

responsive layout, UX states, and visual quality\.

# __PART 0 ΓÇö WHY AI FAILS AT FRONTEND UI__

Understanding the root causes is mandatory\. This is not a capability gap that extra prompting can fully fix ΓÇö it is a structural mismatch between how AI generates code and what great frontend engineering requires\.

### __The Core Problem__

AI generates code by predicting statistically likely tokens based on patterns in training data\. Frontend engineering requires visual spatial reasoning, aesthetic judgment, system\-level consistency, and user empathy ΓÇö none of which exist in a language model's native capability\. The AI has never seen a screen, never been frustrated by a broken mobile layout, never experienced a confusing button\. It mimics patterns it has seen without understanding why they exist\.

__ΓÜá∩╕Å  The Statistical Average Problem__

AI produces the statistical average of all frontend code it was trained on\.

The average frontend code on the internet is mediocre at best, inaccessible, non\-responsive, and visually generic\.

Without explicit instructions, AI will reproduce the majority pattern ΓÇö which is bad code\.

Every rule in this guide is a constraint that overrides the 'statistical average' behavior\.

### __The 8 Structural Failure Modes__

__1\. No visual perception  __AI cannot see\. It has no concept of what its output looks like on screen\. It does not know if text is too small, if contrast fails, if elements overlap, or if the layout breaks at 375px viewport\.

__2\. Pattern mimicry without understanding  __AI copies patterns from training examples\. It knows 'card' components have a shadow because it has seen them with shadows ΓÇö not because shadows communicate elevation in a design system\.

__3\. Happy path only  __AI generates for the documented use case\. It does not consider empty states, error states, loading states, edge\-case content lengths, or what happens when an API returns nothing\.

__4\. Accessibility is invisible to tokens  __ARIA labels, focus management, and screen reader semantics produce no visible output\. They don't appear in screenshots or UI descriptions, so they're absent from most training examples\.

__5\. No design system memory  __Each component is generated in isolation\. AI does not maintain a consistent token system ΓÇö a button here, a card there, a modal somewhere else, all with different color values, spacing, and typography\.

__6\. Ignores the 'why' of layout  __AI can reproduce a flexbox layout from an example without understanding that it exists to handle variable content length\. It will not adapt it when content overflows\.

__7\. No performance intuition  __AI does not experience a slow page\. It will not memoize a component, code\-split a route, or virtualize a list unless explicitly told ΓÇö and often won't even then\.

__8\. Treats CSS as text, not a system  __AI writes CSS that works for the case shown but creates specificity conflicts, leaks scope, and breaks adjacent components when assembled into a real application\.

# __PART 1 ΓÇö THE 12 GOLDEN RULES__

These rules apply to every line of frontend code generated\. They exist specifically to counteract the structural failure modes above\.

__1\.  __NEVER hardcode a color value\. Use design tokens \(CSS variables\)\. One color palette, one source of truth\.

__2\.  __NEVER build desktop\-first\. Start with 320px mobile viewport and expand up with min\-width breakpoints\.

__3\.  __NEVER generate only the happy path\. Every component must handle: default, loading, error, empty, and disabled states\.

__4\.  __NEVER omit accessibility\. Every interactive element needs keyboard support, ARIA, and WCAG AA contrast\.

__5\.  __NEVER use inline styles except for truly dynamic computed values\. Everything else belongs in a style system\.

__6\.  __ALWAYS define a design token system FIRST before building any component\.

__7\.  __ALWAYS separate concerns: UI components know nothing about data fetching or business logic\.

__8\.  __ALWAYS design for dynamic content ΓÇö variable\-length text, missing images, truncated data\.

__9\.  __ALWAYS include meaningful loading states ΓÇö not just spinners, but skeleton screens that match layout\.

__10\.  __ALWAYS validate responsive behavior at 320px, 375px, 768px, 1024px, and 1440px\.

__11\.  __ALWAYS define component variants as a system ΓÇö not ad\-hoc one\-offs\.

__12\.  __ALWAYS document component APIs: props, variants, accessibility requirements, and usage examples\.

__RULE__

__1__

__DESIGN SYSTEM FIRST__

Never write a component before a token system exists\. A design system is the foundation ΓÇö everything else is built on it\.

### __What the AI must define before writing any component__

The AI must generate and commit to a complete design token system at the start of every project\. This is non\-negotiable\.

__≡ƒôï Minimum Token System Template__

/\* ΓöÇΓöÇ MANDATORY TOKEN SYSTEM STRUCTURE ΓöÇΓöÇ \*/

:root \{

  /\* Color primitives \*/

  \-\-color\-brand\-50: \#EEF2FF;

  \-\-color\-brand\-500: \#4338CA;

  \-\-color\-brand\-900: \#1E1B4B;

  \-\-color\-neutral\-0: \#FFFFFF;

  \-\-color\-neutral\-50: \#F8FAFC;

  \-\-color\-neutral\-900: \#0F172A;

  /\* Semantic tokens \(ONLY these used in components\) \*/

  \-\-color\-surface: var\(\-\-color\-neutral\-0\);

  \-\-color\-surface\-raised: var\(\-\-color\-neutral\-50\);

  \-\-color\-text\-primary: var\(\-\-color\-neutral\-900\);

  \-\-color\-text\-muted: \#64748B;

  \-\-color\-interactive: var\(\-\-color\-brand\-500\);

  \-\-color\-interactive\-hover: var\(\-\-color\-brand\-900\);

  \-\-color\-border: \#CBD5E1;

  \-\-color\-focus: \#7C3AED;

  /\* Spacing scale \*/

  \-\-space\-1: 4px;  \-\-space\-2: 8px;   \-\-space\-3: 12px;

  \-\-space\-4: 16px; \-\-space\-6: 24px;  \-\-space\-8: 32px;

  \-\-space\-12: 48px; \-\-space\-16: 64px;

  /\* Typography \*/

  \-\-font\-sans: 'Inter', system\-ui, sans\-serif;

  \-\-text\-sm: 0\.875rem; \-\-text\-base: 1rem; \-\-text\-lg: 1\.125rem; \-\-text\-xl: 1\.25rem;

  \-\-font\-normal: 400; \-\-font\-medium: 500; \-\-font\-semibold: 600;

  \-\-leading\-tight: 1\.25; \-\-leading\-normal: 1\.5; \-\-leading\-relaxed: 1\.75;

  /\* Radii \+ Shadows \*/

  \-\-radius\-sm: 4px; \-\-radius\-md: 8px; \-\-radius\-lg: 12px; \-\-radius\-full: 9999px;

  \-\-shadow\-sm: 0 1px 2px rgb\(0 0 0 / 0\.06\);

  \-\-shadow\-md: 0 4px 6px rgb\(0 0 0 / 0\.07\);

  /\* Transitions \*/

  \-\-transition\-fast: 120ms ease; \-\-transition\-base: 200ms ease;

\}

__Γ¢ö The Hard Token Rule__

RULE: Components NEVER reference color primitives directly \(never \-\-color\-brand\-500 in a component\)\.

RULE: Components ONLY reference semantic tokens \(\-\-color\-interactive, \-\-color\-surface, etc\.\)\.

This separation means you can retheme the entire application by changing semantic tokens only\.

Breaking this rule means every component must be manually updated when the theme changes\.

__RULE__

__2__

__COMPONENT ARCHITECTURE__

Structure determines maintainability\. Every component must have a clear contract, clear variants, and clear responsibility boundaries\.

### __The Component Contract__

Every component the AI generates must define and respect a contract:

- Purpose: what problem does this component solve?
- Props/API: what data does it accept? What are the types and defaults?
- Variants: what visual states does it support? \(size, intent, visual style\)
- States: which of the 5 states does it implement? \(default, hover, loading, error, empty\)
- Accessibility: what ARIA roles, labels, and keyboard interactions does it require?
- Events: what does it emit? What callbacks does it expect?

### __Separation of Concerns ΓÇö Mandatory Layer Split__

__Layer__

__Responsibility__

__What it contains__

__What it NEVER contains__

Presentation

Render only

JSX/HTML \+ CSS classes\. Zero logic\.

API calls, state, business rules

Container

Wire data to UI

Passes props to presentation, calls hooks\.

CSS, layout, styling

Hook/Logic

State & side effects

useState, useEffect, data fetching, transforms\.

JSX, CSS, DOM refs

Service/API

External communication

Fetch calls, error handling, data mapping\.

Component logic, state

Types/Schema

Data contracts

TypeScript types, Zod schemas, constants\.

Logic, rendering

### __Component Variants Must Be Systematic__

The AI must define all variants upfront as a closed system ΓÇö not add them ad\-hoc:

__≡ƒôï Variant System Pattern__

// CORRECT: Systematic variant definition

const BUTTON\_VARIANTS = \{

  intent:  \['primary', 'secondary', 'destructive', 'ghost', 'link'\],

  size:    \['sm', 'md', 'lg'\],

  state:   \['default', 'hover', 'active', 'disabled', 'loading'\],

\};

// The component handles ALL combinations of the above\.

// Adding a new intent means adding it to the map ΓÇö NOT adding new CSS classes scattered through the codebase\.

// WRONG: Ad\-hoc variant sprawl \(what AI produces by default\)

// \.btn\-blue \{ \.\.\. \}  \.btn\-blue\-large \{ \.\.\. \}  \.btn\-blue\-large\-loading \{ \.\.\. \}

// This creates O\(n┬│\) CSS classes that no human can maintain\.

__RULE__

__3__

__MOBILE\-FIRST RESPONSIVE DESIGN__

The majority of web traffic is mobile\. Desktop\-first is not a valid approach for any public\-facing UI\.

### __The Mobile\-First Imperative__

Mobile\-first means base CSS targets the smallest viewport\. Breakpoints only add styles, never override them\. This produces significantly less CSS and fewer specificity conflicts\.

__≡ƒôï Mobile\-First CSS Pattern__

/\* CORRECT: Mobile\-first \*/

\.card \{ padding: var\(\-\-space\-4\); \}                       /\* default: mobile \*/

@media \(min\-width: 768px\)  \{ \.card \{ padding: var\(\-\-space\-6\); \} \} /\* tablet\+ \*/

@media \(min\-width: 1024px\) \{ \.card \{ padding: var\(\-\-space\-8\); \} \} /\* desktop\+ \*/

/\* WRONG: Desktop\-first \(what AI produces by default\) \*/

\.card \{ padding: 32px; \}

@media \(max\-width: 768px\) \{ \.card \{ padding: 16px; \} \} /\* fighting overrides \*/

### __Mandatory Breakpoint System__

__Breakpoint__

__Viewport__

__Target__

__Layout rule__

xs

< 480px

Small phone

Single column\. 16px minimum font\. 44px minimum tap target\.

sm

480ΓÇô767px

Large phone

Single column\. Slightly more density allowed\.

md

768ΓÇô1023px

Tablet

2\-column grid starts\. Navigation may shift\.

lg

1024ΓÇô1279px

Laptop

Full multi\-column\. Sidebar patterns enabled\.

xl

1280px\+

Desktop

Max content width capped \(usually 1280px or 1440px\)\.

### __Responsive Anti\-Patterns ΓÇö Hard Prohibitions__

- Never use fixed pixel widths on layout containers\. Use max\-width \+ width: 100%\.
- Never use vw units for font sizes without clamp\(\)\. They scale uncontrollably\.
- Never use overflow: hidden to 'fix' a layout ΓÇö find and fix the actual overflow cause\.
- Never test only at your development screen size\. Test 320px, 375px, 768px minimum\.
- Never use absolute positioning for layout ΓÇö it breaks when content changes\.
- Touch targets must be minimum 44├ù44px on mobile\. Small text links are not touch targets\.
- Images must have max\-width: 100% and height: auto\. Uncontained images break layouts\.

__RULE__

__4__

__ACCESSIBILITY \(WCAG AA MANDATORY\)__

Accessibility is not a feature\. It is a baseline quality standard\. Any UI that fails accessibility fails quality\.

### __The 4 Pillars of Accessibility the AI Must Implement__

__1\. Color & Contrast__

ΓÇó 4\.5:1 minimum contrast ratio for text \(7:1 for AAA\)

ΓÇó 3:1 minimum for UI components and graphics

ΓÇó Never convey information by color alone ΓÇö add icon or text

ΓÇó Test with Chrome DevTools accessibility panel

ΓÇó Focus indicators must be visible \(2px solid outline\)

__2\. Keyboard Navigation__

ΓÇó All interactive elements reachable by Tab key

ΓÇó Logical tab order follows visual flow

ΓÇó Arrow keys navigate within widgets \(menus, tabs, radio\)

ΓÇó Escape key closes modals and dropdowns

ΓÇó Focus returns to trigger element when dialog closes

__3\. Semantic HTML__

ΓÇó Semantic HTML first ΓÇö <button> not <div onclick>

ΓÇó Headings in logical order h1 ΓåÆ h2 ΓåÆ h3 \(no skipping\)

ΓÇó Lists use <ul>/<ol>, not CSS\-styled divs

ΓÇó Forms: every input has a <label> \(not just placeholder\)

ΓÇó Tables: scope, headers, caption for data tables

__4\. ARIA \(when HTML insufficient\)__

ΓÇó aria\-label for icon\-only buttons

ΓÇó aria\-expanded for accordion/dropdown state

ΓÇó aria\-live for dynamic content announcements

ΓÇó role='alert' for error messages

ΓÇó aria\-describedby links inputs to error messages

__Γ¢ö The Focus State Rule ΓÇö Never Violate This__

FOCUS STATES: Never write outline: none or outline: 0 without providing an alternative focus indicator\.

This is the single most common accessibility violation in AI\-generated code\.

Use: outline: 2px solid var\(\-\-color\-focus\); outline\-offset: 2px; on :focus\-visible

The :focus\-visible pseudo\-class shows focus only for keyboard users ΓÇö not mouse clicks\. Always use it\.

### __ARIA Patterns the AI Must Know__

__Component__

__Required ARIA__

__Keyboard behavior__

__Common AI mistake__

Button

No ARIA needed if <button>

Enter/Space activates

Using <div> or <span> with onClick

Modal/Dialog

role='dialog', aria\-modal='true', aria\-labelledby

Tab trapped inside\. Escape closes\.

No focus trap\. Focus doesn't return to trigger\.

Dropdown Menu

role='menu', role='menuitem', aria\-expanded

Arrow keys navigate\. Enter selects\. Escape closes\.

Div with click handlers\. No keyboard nav\.

Tabs

role='tablist', 'tab', 'tabpanel', aria\-selected

Arrow keys switch tabs\. Tab goes to panel\.

No roles\. No keyboard\. Just CSS hiding\.

Form Input

aria\-required, aria\-invalid, aria\-describedby

Standard tab \+ enter

Placeholder used as label\. No error association\.

Toast/Alert

role='alert' or aria\-live='polite'

N/A ΓÇö auto\-announced

Div that appears visually but silent to screen readers\.

__RULE__

__5__

__THE 5 UX STATES ΓÇö ALL ARE MANDATORY__

Every component that interacts with data must implement all 5 states\. A component without all 5 states is an unfinished component\.

AI by default generates only State 1\. The other 4 must be explicitly required\. Here is the framework:

__State__

__When__

__What to show__

__Critical requirements__

__1\. Default / Populated__

Data loaded successfully

The actual content\. The primary UI\.

Visual hierarchy is clear\. Information is scannable\.

__2\. Loading__

Awaiting data from any source

Skeleton screen matching the content layout, not a spinner\.

Skeleton must match the populated layout exactly ΓÇö same dimensions, same grid\.

__3\. Error__

Request failed / validation failed

Specific, actionable error message \+ recovery action\.

Never 'Something went wrong\.' State what failed and how to fix it\.

__4\. Empty__

Request succeeded, zero results

Friendly empty state with icon, message, and action\.

Empty Γëá error\. Distinct visual treatment\. Always include a CTA to fill the empty state\.

__5\. Disabled/Partial__

Action unavailable / partial data

Visually distinct disabled state with reason tooltip\.

disabled attribute on form elements\. cursor: not\-allowed\. Reduced opacity \(not invisible\)\.

### __Skeleton Screen Requirements__

__≡ƒôï Skeleton Screen Standards__

Skeleton screens must match the layout of the content they represent\.

Use CSS animation \(shimmer effect\) to indicate active loading ΓÇö not static gray blocks\.

Every text block gets a skeleton line with approximate width matching real content\.

Skeletons must respect the same responsive breakpoints as the real content\.

Set aria\-hidden='true' on skeleton components ΓÇö they are not real content\.

Remove skeletons immediately when data is available ΓÇö no flash of both states\.

### __Error Message Standards__

__Γ¥î Bad AI\-generated errors__

ΓÇó 'Failed to load posts'

ΓÇó 'Network request failed'

ΓÇó 'Something went wrong'

ΓÇó 'Error: 500'

ΓÇó 'Please try again later'

__Γ£à Good production errors__

ΓÇó 'Could not load your posts\. Check your connection and retry\.'

ΓÇó 'Login failed ΓÇö wrong email or password\. Forgot password?'

ΓÇó 'Your session expired\. Sign in again to continue\.'

ΓÇó 'File too large\. Maximum size is 5MB\. Compress the file and retry\.'

__RULE__

__6__

__PERFORMANCE ENGINEERING__

Slow UI is broken UI\. Performance is a first\-class quality metric, not an optimization pass\.

### __Core Web Vitals ΓÇö The Target__

__Metric__

__What it measures__

__Good target__

__Common AI violation__

LCP

Largest Contentful Paint ΓÇö loading

< 2\.5 seconds

Unoptimized hero images\. No preloading\.

FID / INP

Input responsiveness

< 100ms

Heavy JavaScript blocking main thread\.

CLS

Cumulative Layout Shift

< 0\.1

Images without dimensions\. Dynamic content without reserved space\.

FCP

First Contentful Paint

< 1\.8 seconds

No code splitting\. Entire bundle loaded upfront\.

TTI

Time to Interactive

< 3\.8 seconds

Too much JavaScript\. No progressive enhancement\.

### __Performance Checklist ΓÇö Required Before Shipping__

- Images: explicit width and height attributes\. loading='lazy' on below\-fold images\. srcset for responsive sizes\. WebP/AVIF formats\.
- JavaScript: Code splitting at route level\. Dynamic import\(\) for large components\. No synchronous heavy computation on render\.
- Lists: Virtualize any list > 100 items\. Use react\-window, Tanstack Virtual, or equivalent\.
- State: Memoize expensive computations with useMemo\. Prevent unnecessary rerenders with React\.memo and useCallback\.
- Fonts: font\-display: swap\. Preload critical fonts\. Limit to 2 custom font families\.
- CSS: Remove unused CSS\. Avoid CSS\-in\-JS in render\-hot paths\. Prefer static class\-based styling\.
- Data fetching: Implement request deduplication, caching \(React Query, SWR, RTK Query\)\. Show stale data while revalidating\.
- Bundle: Analyze bundle size before every significant release\. Set bundle size budgets\. Flag regressions in CI\.

__RULE__

__7__

__VISUAL QUALITY & DESIGN PRINCIPLES__

The AI must understand design principles at a theoretical level since it cannot see\. These rules operationalize visual judgment into code constraints\.

### __Typography System__

Typography carries 90% of the information on most UIs\. It must be treated as a system, not individual decisions\.

- Use a type scale: a limited set of sizes \(text\-sm, text\-base, text\-lg, text\-xl, text\-2xl, text\-4xl\)\. No arbitrary font sizes\.
- Maximum 2 font families per product\. One for display/headings, one for body/UI\. More than 2 is noise\.
- Line length \(measure\): 45ΓÇô75 characters per line for body text\. Constrain container width to enforce this\.
- Line height: 1\.5ΓÇô1\.6 for body text\. 1\.2ΓÇô1\.3 for headings\. Never set line\-height to 1 on multiline text\.
- Never set font size below 14px for any readable text\. 16px is the minimum for body text\.
- Letter spacing: slightly negative \(\-0\.01em to \-0\.02em\) for large headings\. Slightly positive for small caps\.
- Hierarchy: establish clear visual hierarchy ΓÇö one dominant heading, distinct subheadings, readable body, muted captions\.

### __Spacing as a System__

Every spacing value must come from the spacing scale\. No arbitrary values\.

__≡ƒôÉ The Spacing System Rules__

RULE: Every margin, padding, and gap must use a spacing token ΓÇö never arbitrary pixel values\.

Use the 4px or 8px base grid\. All spacing values are multiples of 4 \(4, 8, 12, 16, 24, 32, 48, 64, 96\)\.

Related elements have less space between them than unrelated elements \(proximity principle\)\.

Breathing room matters: generous whitespace between sections communicates structure\.

Tight spacing inside a component, generous spacing between components\.

Consistent internal padding within component types \(all cards have the same padding\)\.

### __Color Usage Rules__

- Interactive blue: interactive elements only\. Never use the primary interactive color for decorative purposes\.
- Red: errors and destructive actions only\. Never use red for non\-error states\.
- Green: success states and positive indicators only\.
- Amber/orange: warnings and caution states only\.
- Neutral palette: the majority of the UI surface\. Only semantic colors break the neutral background\.
- Maximum 3 colors visible in any single component\. Visual noise increases with color count\.
- Never communicate information through color alone ΓÇö always pair with text, icon, or pattern\.

### __Visual Hierarchy Rules__

- The primary action on every screen must be visually dominant ΓÇö one CTA per primary action\.
- Content hierarchy: title > metadata > body > labels > captions\. Each level clearly subordinate to the previous\.
- Grouping: elements that belong together must be visually grouped \(proximity \+ shared background\)\.
- Whitespace is structure: use it to separate sections as effectively as borders or dividers\.
- Alignment: text should align to a grid\. Avoid ragged mixed alignments within a section\.

__RULE__

__8__

__STATE MANAGEMENT ARCHITECTURE__

Uncontrolled state growth is the most common cause of frontend complexity collapse\. Define state architecture before writing components\.

### __The State Hierarchy__

__State type__

__Where it lives__

__Examples__

__Rule__

Local UI state

Component useState

isOpen, inputValue, activeTab

Keep it local\. Lift only when 2\+ components need it\.

Shared UI state

Context or Zustand

Modal queue, toast notifications, sidebar

Use for cross\-cutting UI concerns only ΓÇö not data\.

Server state

React Query / SWR

User data, API responses, lists

Never replicate server state in local state\. Let the cache own it\.

URL state

Router params / query

Active filter, current page, selected ID

Shareable/bookmarkable UI state belongs in the URL\.

Form state

React Hook Form / Formik

Input values, validation errors, submission state

Never manage form state with useState per\-field\. Use a form library\.

__ΓÜá∩╕Å State Colocation Rule__

The most common AI mistake: putting everything in a single global state \(or Context\)\.

This creates a state blob where unrelated components re\-render when unrelated state changes\.

Rule: a piece of state should live as close to where it is used as possible\.

Only lift state to a parent or global store when multiple unrelated components must share it\.

Server state \(API data\) belongs in React Query / SWR cache ΓÇö NOT in useContext or useState\.

__RULE__

__9__

__FORM ENGINEERING__

Forms are the most interaction\-dense part of any UI\. They require specific patterns that AI routinely gets wrong\.

### __Form Quality Checklist__

- Every input has a visible, persistent label ΓÇö not just a placeholder \(placeholders disappear on focus\)\.
- Validation fires on blur \(not on every keystroke, not only on submit\)\.
- Error messages appear adjacent to the field that caused them ΓÇö not in a banner at the top\.
- Error messages are specific and actionable ΓÇö 'Email must be a valid email address' not 'Invalid input'\.
- Submit button is disabled during submission\. Shows loading state during submission\.
- Successful submission gives clear confirmation ΓÇö don't just clear the form silently\.
- Focus moves to the first error field after failed submission\.
- Required fields are indicated ΓÇö asterisk \(\*\) with a key explaining the symbol\.
- Input types are correct: type='email', type='tel', type='number', type='password' ΓÇö enables mobile keyboards\.
- Autocomplete attributes are set: autocomplete='email', 'current\-password', 'given\-name', etc\.

__RULE__

__10__

__MICRO\-INTERACTIONS & MOTION__

Motion communicates state changes\. It must be purposeful, fast, and respect user preferences\.

### __Motion Principles__

- Duration: UI transitions 100ΓÇô200ms\. Feedback animations 200ΓÇô300ms\. Entrances/exits 200ΓÇô350ms\. Never over 500ms\.
- Easing: use ease\-out for elements entering the screen, ease\-in for exits, ease\-in\-out for state changes\.
- Purpose: every animation must communicate something ΓÇö state change, spatial relationship, or cause\-effect\.
- Restraint: animate one property at a time\. Animating opacity \+ scale together is fine\. Avoid animating layout properties \(width, height, margin\) ΓÇö they trigger reflow\.
- Respect: always implement prefers\-reduced\-motion media query\. Users who configure it have medical reasons\.

__Γ¢ö prefers\-reduced\-motion ΓÇö Always Required__

@media \(prefers\-reduced\-motion: reduce\) \{

  \*, \*::before, \*::after \{

    animation\-duration: 0\.01ms \!important;

    animation\-iteration\-count: 1 \!important;

    transition\-duration: 0\.01ms \!important;

  \}

\}

This is mandatory in every project\. Vestibular disorders and motion sensitivity are real medical conditions\.

__RULE__

__11__

__FRONTEND TESTING STRATEGY__

Untested UI is not production\-ready\. The AI must write tests for every component it generates\.

### __The Testing Pyramid for Frontend__

__Test type__

__What to test__

__Tooling__

__Coverage target__

Unit tests

Pure functions, hooks, utility logic

Vitest / Jest

All pure functions\. 100% of business logic functions\.

Component tests

Component renders, interactions, state changes

Testing Library \+ Vitest

All states: default, loading, error, empty, disabled\.

Accessibility tests

ARIA, keyboard nav, contrast

jest\-axe, Playwright accessibility

Every component passes axe audit automatically\.

Integration tests

User flows across multiple components

Testing Library \+ MSW

Critical paths: sign\-in, checkout, core user journey\.

Visual regression

UI has not visually changed unexpectedly

Storybook Chromatic / Percy

Every component story\. Run on every PR\.

E2E tests

Full browser user flows

Playwright / Cypress

Critical flows only \(top 3\-5 user journeys\)\.

__≡ƒôï Minimum Component Test Requirement__

The AI must write tests alongside components ΓÇö not as an afterthought\.

Minimum test coverage for any generated component:

  1\. Renders without errors in all 5 states \(default, loading, error, empty, disabled\)\.

  2\. All interactive elements are accessible \(axe audit passes\)\.

  3\. Keyboard navigation works correctly\.

  4\. Props update the UI as documented\.

  5\. Error boundaries handle component failures gracefully\.

__RULE__

__12__

__COMPONENT DOCUMENTATION__

A component without documentation is a component that will be misused\. Docs are part of the definition of done\.

### __Storybook Story Requirements__

- Every component must have a Storybook story for every documented variant and state\.
- Story names follow the convention: ComponentName/State \(e\.g\. Button/Loading, Card/Empty\)\.
- Stories include controls for all props ΓÇö stakeholders can explore variants without code changes\.
- Accessibility story: every component has a story specifically for testing keyboard and screen reader behavior\.
- Documentation tab: usage guidelines, prop descriptions, accessibility notes, and dos/don'ts\.

### __Component README Requirements__

- Description: one sentence explaining what the component does and when to use it\.
- Props table: name, type, default, required, description for every prop\.
- Variants: visual examples of every variant with code snippets\.
- States: examples of all 5 states with code\.
- Accessibility: what keyboard interactions are supported, what ARIA attributes are applied\.
- Do/Don't: at least 2 examples of correct usage and 2 examples of what NOT to do\.

# __PART 2 ΓÇö FRONTEND ANTI\-PATTERN REGISTRY__

The following patterns are the most common AI\-generated frontend failures\. Each is a hard prohibition\.

__Severity__

__Anti\-pattern__

__Why it fails__

__Correct pattern__

__Γ¥î NEVER__

__Hardcode hex colors in components__

*Unthemeable\. One brand change = rewrite every file\.*

Use CSS custom property tokens exclusively\.

__Γ¥î NEVER__

__Remove :focus outline styles without replacement__

*Destroys keyboard accessibility\. Legal liability\.*

Use :focus\-visible with custom styled outline\.

__Γ¥î NEVER__

__Use <div onClick> instead of <button>__

*Not keyboard accessible, not semantic, no ARIA roles\.*

Native <button> element\. Always\.

__Γ¥î NEVER__

__Use placeholder as the only label__

*Disappears on focus\. Screen readers skip empty inputs\.*

Visible <label> element always\. Placeholder is a hint\.

__Γ¥î NEVER__

__Generate only the happy path state__

*Crashes on empty/error data\. Unusable in production\.*

All 5 states: default, loading, error, empty, disabled\.

__Γ¥î NEVER__

__Set fixed heights on text containers__

*Text overflows on zoom, long content, CJK characters\.*

Use min\-height\. Let content define height\.

__Γ¥î NEVER__

__Skip image dimensions \(width/height\)__

*Causes layout shift \(CLS\)\. Hurts Core Web Vitals\.*

Always set explicit width and height on <img>\.

__ΓÜá∩╕Å AVOID__

__Using a single global Context for all state__

*Unrelated re\-renders everywhere\. Performance collapse\.*

Co\-locate state\. Server state in React Query\. Local UI state locally\.

__ΓÜá∩╕Å AVOID__

__Validate forms only on submit__

*User gets no feedback during input\. Frustrating UX\.*

Validate on blur\. Show inline errors per field\.

__ΓÜá∩╕Å AVOID__

__Using spinners instead of skeleton screens__

*Disorienting\. No spatial expectation for the user\.*

Skeleton screens matching the populated layout\.

__ΓÜá∩╕Å AVOID__

__Ignoring mobile viewports until 'the end'__

*Layout refactors at the end cost 3x building mobile\-first\.*

Mobile\-first CSS from the first component\.

__ΓÜá∩╕Å AVOID__

__Using CSS absolute/fixed positioning for layout__

*Breaks at different content lengths and screen sizes\.*

Use flexbox, grid, and flow layout\.

__≡ƒæü WATCH__

__Growing component size past 300 lines__

*Hard to test\. Hard to reason about\. Signals SRP violation\.*

Split into sub\-components\. Extract hooks\.

__≡ƒæü WATCH__

__Fetching data inside components directly__

*No deduplication, caching, or error handling strategy\.*

Use React Query or SWR for all data fetching\.

__≡ƒæü WATCH__

__Props drilling more than 2 levels deep__

*Signals missing abstraction or state architecture\.*

Lift to Context, Zustand, or a Container component\.

__THE QUALITY MANDATE__

__A frontend component is not finished when it renders correctly on your screen\.__

It is finished when it works on a 320px phone, a 4K monitor, and in Safari on iOS\. When it passes axe accessibility audit\. When it handles empty data, API errors, and slow networks\. When it can be understood by a screen reader and navigated by keyboard only\. When it performs within Core Web Vitals budgets\.

__That is the standard\. This guide makes that standard explicit\. Follow it without exception\.__

