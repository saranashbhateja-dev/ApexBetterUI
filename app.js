/* Apex OS — local-first admissions & engineering workspace. */
(() => {
  'use strict';
  const STORE_KEY = 'apex-os-workspace-v1';
  const TARGET_DATE_DEFAULT = '2027-08-01';
  const cycleAssumption = 'Fall 2028';
  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => [...root.querySelectorAll(s)];
  const escapeHtml = (value='') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Safe Markdown subset for readable research output; raw HTML is escaped first.
  function renderResearchMarkdown(value=''){
    const safe=escapeHtml(String(value||'').replace(/\r/g,''));
    const inline=(line)=>line
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g,'<em>$1</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>');
    const lines=safe.split('\n'); let out='', list=null;
    const closeList=()=>{if(list){out+=`</${list}>`;list=null;}};
    const cells=(line)=>line.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(x=>x.trim());
    for(let i=0;i<lines.length;i++){
      const line=lines[i].trim(); if(!line){closeList();continue;}
      if(line.startsWith('|')&&line.endsWith('|')){
        closeList();const block=[];while(i<lines.length&&lines[i].trim().startsWith('|')&&lines[i].trim().endsWith('|'))block.push(lines[i++].trim());i--;
        const rows=block.map(cells);const isRule=(row)=>row.every(cell=>/^:?-{3,}:?$/.test(cell.replace(/\s/g,'')));
        const header=rows.shift()||[];if(rows.length&&isRule(rows[0]))rows.shift();
        out+=`<div class="ai-markdown-table-wrap"><table class="ai-markdown-table"><thead><tr>${header.map(cell=>`<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.filter(row=>!isRule(row)).map(row=>`<tr>${header.map((_,j)=>`<td>${inline(row[j]||'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;continue;
      }
      const h=line.match(/^(#{1,4})\s+(.+)$/);const ul=line.match(/^[-*]\s+(.+)$/);const ol=line.match(/^\d+[.)]\s+(.+)$/);
      if(h){closeList();const level=Math.min(h[1].length+1,5);out+=`<h${level}>${inline(h[2])}</h${level}>`;continue;}
      if(ul||ol){const type=ul?'ul':'ol';if(list!==type){closeList();list=type;out+=`<${type}>`;}out+=`<li>${inline((ul||ol)[1])}</li>`;continue;}
      closeList();if(/^&gt;\s?/.test(line)){out+=`<blockquote>${inline(line.replace(/^&gt;\s?/,''))}</blockquote>`;continue;}
      out+=`<p>${inline(line)}</p>`;
    }closeList();return out;
  }
  const dateOnly = (iso) => { if (!iso) return null; const d = new Date(`${iso}T12:00:00`); return Number.isNaN(d.getTime()) ? null : d; };
  const localISO = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const fmtDate = (iso, options={month:'short',day:'numeric',year:'numeric'}) => { const d=dateOnly(iso); return d ? d.toLocaleDateString('en-US', options) : 'Date to be announced'; };
  const today = new Date();
  const todayISO = localISO(today);

  const universities = [
    {id:'mit',name:'Massachusetts Institute of Technology',short:'MIT',country:'United States',region:'us',city:'Cambridge, Massachusetts',degree:'Computer Science / Electrical Engineering and Computer Science (confirm exact programme)',symbol:'M',colors:'green',route:'MyMIT first-year application',snapshot:"SAT or ACT is required for Fall 2028 entry. MIT uses its own application portal; prepare the Secondary School Report, three years of grades and external exam results, two teacher evaluations (ideally STEM and humanities), short-answer essays, activities, and any applicable English-test evidence. Need-based aid uses CSS Profile code 3514 and parent income documents through IDOC.",tests:["SAT or ACT — required for Fall 2028 entry; self-reporting is allowed initially under current guidance", "English proficiency test is strongly recommended in specified circumstances; verify whether it applies to your schooling", "Optional English proficiency tests listed by MIT include TOEFL, IELTS, DET, PTE Academic and Cambridge C1/C2"],documents:["MIT first-year application and short-answer essays", "Secondary School Report and transcript (include available Grades 9–12 records and board results)", "Two teacher recommendations: ideally one maths/science and one humanities/social science/language", "Activities and awards list", "CSS Profile (MIT code 3514) and parent income/tax documents via IDOC if requesting aid", "Midyear grades / February Updates & Notes form when applicable", "Optional SlideRoom portfolio and interview if offered"],focus:'Build an evidence-led systems portfolio while keeping school results and testing central. Optional maker/research materials should be considered only if your work fits the published guidance.',official:'https://mitadmissions.org/apply/firstyear/',requirements:'https://mitadmissions.org/apply/firstyear/deadlines-requirements/',snapshotDate:'Supplied Fall 2028 guide researched 24 Oct 2026; recheck official pages when the 2027–28 cycle opens.',note:'Do not turn the portfolio project count into a claim. MIT will assess the application in context; no score target guarantees admission.'},
    {id:'stanford',name:'Stanford University',short:'Stanford',country:'United States',region:'us',city:'Stanford, California',symbol:'S',route:'Common Application + Stanford supplement',snapshot:"SAT or ACT is required for Fall 2028 entry. Apply through the Common App or another currently accepted platform; prepare the School Report and counsellor recommendation, official transcript, two academic teacher recommendations, Stanford questions and midyear transcript. International applicants requesting aid must indicate this on the admission application; current guidance says Stanford is need-aware for international applicants.",tests:["SAT or ACT — required under current first-year policy", "English proficiency exam is not required under the guide’s current Stanford policy; fluency in English is expected", "Financial-aid request must be indicated on the admission application if aid is needed; current guide says this cannot be added later"],documents:["Common Application and Stanford-specific questions/essays", "Application fee or fee-waiver request", "School Report and counsellor recommendation", "Official transcript and midyear transcript", "Two academic teacher recommendations", "CSS Profile (Stanford code 4704), International Student Supplement and parent income documents if requesting aid", "Original academic documents plus school-provided English translations when needed", "Optional arts portfolio if relevant"],focus:'Prefer a few deeply understood technical contributions to a long list of shallow or unverified projects.',official:'https://admission.stanford.edu/apply/first-year/',requirements:'https://admission.stanford.edu/apply/first-year/testing.html',snapshotDate:'Supplied Fall 2028 guide researched 24 Oct 2026; recheck official pages when the 2027–28 cycle opens.',note:'Stanford’s published policy currently requires SAT/ACT for first-year applicants. No target score guarantees admission.'},
    {id:'harvard',name:'Harvard University',short:'Harvard',country:'United States',region:'us',city:'Cambridge, Massachusetts',symbol:'H',route:'Common Application + Harvard supplement',snapshot:"SAT or ACT is required for Fall 2028 entry except in exceptional access circumstances described by Harvard. Prepare the Common Application, Harvard supplement, School Report/transcript, midyear report when applicable, two teacher recommendations and final report if enrolling. International applicants can request need-based aid under the same need-blind policy described in the supplied guide.",tests:["SAT or ACT — required; exceptional alternatives apply only where test access is genuinely unavailable", "English proficiency exam is not required for first-year applicants and cannot replace SAT/ACT", "SAT code 3434 / ACT code 1840 are listed in the supplied guide; recheck before sending scores"],documents:["Common Application and Harvard supplement (including five short-answer prompts in the supplied current-cycle guide; prompts may change)", "Secondary School Report, transcript and counsellor/school materials", "Midyear School Report or predicted grades if applicable", "Two teacher recommendations from different academic subjects", "CSS Profile (Harvard code 3434) and IDOC financial documents if requesting aid", "Parent income/tax records or non-filer documentation; student income documents if applicable", "Translations plus original documents when required", "Final School Report and transcript if admitted and enrolling"],focus:'Make the project portfolio a coherent story, not a volume contest. Demonstrate what motivated the work, what failed, and what you learned.',official:'https://college.harvard.edu/admissions/apply/first-year-applicants',requirements:'https://college.harvard.edu/admissions/apply/international-applicants',snapshotDate:'Supplied Fall 2028 guide researched 24 Oct 2026; recheck official pages when the 2027–28 cycle opens.',note:'Harvard’s current application guidance lists a November 1 early deadline and January 1 regular deadline for the current cycle; do not reuse these as 2028-entry deadlines without checking.'},
    {id:'caltech',name:'California Institute of Technology',short:'Caltech',country:'United States',region:'us',city:'Pasadena, California',symbol:'C',route:'Common Application or QuestBridge + Caltech supplement',snapshot:"SAT or ACT is required for Fall 2028 entry under the supplied guide. Caltech has particularly specific course expectations: four years of mathematics including calculus, physics, chemistry, four years of English and history/social-science study. Prepare one STEM and one humanities/social-science teacher recommendation, official transcript, midyear report and Caltech supplements. International aid is need-aware and the guide describes aid as potentially including grants, work-study and loans.",tests:["SAT or ACT — required; do not rely on an access exception if testing is available", "English proficiency test is required unless the stated native-English or English-medium instruction exception applies; verify current accepted tests and thresholds", "Course preparation: mathematics including calculus, physics, chemistry, four years of English; biology recommended", "International aid: current guide describes need-aware admission and CSS Profile code 4034"],documents:["Common App or Coalition application and Caltech supplemental essays", "Official transcript sent by the school; include English translation and original if required", "Two teacher recommendations: one STEM and one humanities/social science", "Mid-Year Report", "SAT/ACT and AP/IB results if taken", "English proficiency evidence if applicable", "CSS Profile (Caltech code 4034) and any additional international aid forms if requesting aid", "Optional InitialView, research paper or portfolio"],focus:'Prioritise mathematical depth and rigorous verification; document exactly what your own implementation demonstrates.',official:'https://www.admissions.caltech.edu/apply/first-year-applicants',requirements:'https://www.admissions.caltech.edu/apply/first-year-applicants/application-requirements',snapshotDate:'Supplied Fall 2028 guide researched 24 Oct 2026; recheck official pages when the 2027–28 cycle opens.',note:'The currently displayed deadlines apply to an active cycle; recheck before relying on dates for Fall 2028.'},
    {id:'yale',name:'Yale University',short:'Yale',country:'United States',region:'us',city:'New Haven, Connecticut',symbol:'Y',route:'Common Application / other accepted first-year platform + Yale supplement',snapshot:"SAT or ACT is required for Fall 2028 entry under the supplied guide. Prepare the accepted application platform and Yale supplement, School Report/transcript, midyear report, two teacher recommendations and one counsellor recommendation. The guide describes Yale as need-blind for international applicants and meeting demonstrated need; Yale supplies a personalised aid checklist after the applicant indicates aid interest.",tests:["SAT or ACT — required; other exams do not substitute under the supplied guide", "English proficiency test required if a non-native English speaker has not completed at least two years of secondary education in an English-medium school", "Current guide lists CSS Profile code 3987 and IDOC; follow Yale’s individual checklist"],documents:["Common/Coalition/QuestBridge application and Yale supplement", "School Report and transcript", "Mid-Year Report when available", "Two teacher recommendations from core academic subjects", "One counsellor recommendation (or school administrator where appropriate)", "SAT/ACT score reporting", "English proficiency evidence if applicable; non-English academic documents need the required translation", "CSS Profile (Yale code 3987) and IDOC financial documents if requesting aid", "Optional STEM research or other supplementary material"],focus:'Explain the intellectual questions that drive the work; balance technical depth with personal context and community contribution.',official:'https://admissions.yale.edu/applying-yale',requirements:'https://admissions.yale.edu/standardized-testing',snapshotDate:'Supplied Fall 2028 guide researched 24 Oct 2026; recheck official pages when the 2027–28 cycle opens.',note:'Use Yale’s own standardised-testing guidance rather than generic test-score targets from the source blueprint.'},
    {id:'princeton',name:'Princeton University',short:'Princeton',country:'United States',region:'us',city:'Princeton, New Jersey',symbol:'P',route:'Common Application + Princeton supplements',snapshot:"SAT or ACT is required for Fall 2028 entry according to Princeton’s published policy described in the supplied guide. Prepare the Common Application, Princeton-specific questions, School Report/transcript, counsellor recommendation, two teacher evaluations and a graded written paper in English. Princeton uses its own Princeton Financial Aid Application (PFAA), not the CSS Profile, and the guide describes aid as need-blind and grant-based.",tests:["SAT or ACT — required for Fall 2028 entry; send scores according to Princeton’s current rules", "English proficiency test required only when the guide’s native-language / English-medium exemptions do not apply", "Princeton does not use CSS Profile; use the Princeton Financial Aid Application (PFAA) if requesting aid", "Current guide lists SAT code 2672 and ACT code 2588; verify before score sending"],documents:["Common Application and Princeton-specific questions", "Graded written paper in English, preferably English or history, with teacher grade/comments", "School Report and official transcript", "Counsellor recommendation", "Two teacher recommendations from different academic areas", "Midyear Report when available", "SAT/ACT score reporting", "PFAA and parents’ tax/income documentation if requesting aid", "Optional arts supplement and alumni interview"],focus:'Set an academic testing plan and keep a strong record of intellectual curiosity, contribution and work you can explain deeply.',official:'https://admission.princeton.edu/apply/first-year-application',requirements:'https://admission.princeton.edu/apply/standardized-testing',snapshotDate:'Supplied Fall 2028 guide researched 24 Oct 2026; recheck official pages when the 2027–28 cycle opens.',note:'The 2027–28 testing change is a cycle-specific rule. Review Princeton’s own page before score planning.'}
  ];

  const projects = [
    {
        "id": 1,
        "name": "Tiny Distributed Job Queue with Fault Injection",
        "track": "Core Systems & Low-Level Tooling",
        "lang": "C++ / Python",
        "tags": [
            "distributed-systems",
            "concurrency",
            "fault-injection"
        ],
        "depends": "Start with a deterministic local worker model; only add network processes after the state machine and retry semantics are testable.",
        "description": "A small asynchronous job scheduler with a worker pool, explicit job states, retry handling, thread-safe queue operations and controllable failure injection.",
        "target": "Specify submit, claim, acknowledge, retry, cancel and shutdown transitions. Inject worker crashes, timeouts, delayed messages and duplicate deliveries; document whether processing is at-least-once and how idempotency is handled.",
        "blueprint": "Producer → job state machine → worker pool → result journal → fault injector and replay harness",
        "invariant": "Every job transition is legal and observable; retries do not silently lose work, and duplicate execution/completion semantics are explicit.",
        "verification": "Compare concurrent runs with a serial/reference state model; run repeatable fault schedules and race diagnostics where supported.",
        "tests": "Fixed-seed fault schedules, duplicate delivery, worker crash/restart, timeout, cancellation, empty queue, shutdown races and ThreadSanitizer where supported.",
        "portfolioValue": "Shows concurrency reasoning, explicit failure semantics and distributed-work orchestration without pretending a local simulator proves production-scale reliability."
    },
    {
        "id": 2,
        "name": "SafeText Index: A Memory-Safe C Search Library",
        "track": "Core Systems & Low-Level Tooling",
        "lang": "C17",
        "tags": [
            "c",
            "memory-safety",
            "text-search"
        ],
        "depends": "Independent C library; establish a documented byte-span API and ownership rules before implementing index structures.",
        "description": "A defensive C library for tokenising and normalising text, maintaining an index, and supporting exact and prefix lookups over explicit input boundaries.",
        "target": "Define buffer ownership, allocation-failure behaviour, token boundary rules, normalisation, exact lookup and prefix lookup. Make byte lengths explicit rather than relying on unsafe assumptions about input termination.",
        "blueprint": "Byte spans → boundary-aware tokenizer → normalised terms → index → exact/prefix query results",
        "invariant": "All reads and writes stay within declared spans, ownership is unambiguous, and every allocation failure returns a documented error without leaks.",
        "verification": "Compile with strict warnings and applicable AddressSanitizer/UndefinedBehaviorSanitizer builds; fuzz parser boundaries and allocation/error paths.",
        "tests": "Empty input, very long tokens, delimiters, non-ASCII byte sequences under documented rules, embedded NUL policy, allocation failure, exact/prefix collisions and leak checks.",
        "portfolioValue": "Demonstrates careful C API design, pointer and allocation discipline, and raw-byte parsing backed by reproducible memory-safety evidence."
    },
    {
        "id": 3,
        "name": "Tiny Stack Machine: Bytecode VM & Reference Interpreter",
        "track": "Core Systems & Low-Level Tooling",
        "lang": "C++ / Python",
        "tags": [
            "virtual-machine",
            "bytecode",
            "interpreter"
        ],
        "depends": "Build a minimal instruction grammar and state model first; use the Python implementation as a small, independent reference oracle.",
        "description": "A compact stack-based virtual machine that parses a restricted bytecode format, executes defined instructions, and emits deterministic execution traces.",
        "target": "Specify the bytecode grammar, program counter, stack limits, arithmetic semantics, control flow and error codes. Implement a separate reference interpreter and compare both final outputs and intermediate traces.",
        "blueprint": "Bytecode input → decoder/validator → VM state transitions → trace log and reference comparison",
        "invariant": "Each instruction has defined preconditions and effects; invalid opcodes, stack underflow and invalid jumps fail deterministically.",
        "verification": "Differentially compare per-step machine states and final outcomes against the reference interpreter across generated valid and invalid programs.",
        "tests": "Instruction-level fixtures, malformed bytecode, underflow/overflow, invalid jump targets, termination bounds and deterministic trace snapshots.",
        "portfolioValue": "Connects language implementation to machine-state modelling and executable specifications, with clear evidence for correctness claims."
    },
    {
        "id": 4,
        "name": "PageStore: B+ Tree and Buffer-Pool Simulator",
        "track": "Core Systems & Low-Level Tooling",
        "lang": "C++",
        "tags": [
            "database-internals",
            "b-plus-tree",
            "storage"
        ],
        "depends": "Define a fixed page format and reference map first; implement the buffer pool before layering the B+ tree and recovery simulator.",
        "description": "A database-internals simulator for page serialization, B+ tree index pages, buffer-pool eviction and a write-ahead logging-style crash-consistency protocol.",
        "target": "Model fixed-size pages, binary encoding/decoding, pin/unpin rules, LRU eviction and recovery records. Inject interruption points to test which updates survive restart.",
        "blueprint": "Logical records → page serializer → B+ tree pages ↔ buffer pool → log/recovery simulator",
        "invariant": "Decoded pages respect bounds, B+ tree ordering is preserved, and recovery outcomes match the explicitly defined log protocol.",
        "verification": "Compare index operations with a reference ordered map; run page corruption and interruption/restart scenarios under applicable diagnostics.",
        "tests": "Split/merge boundaries, full/empty pages, eviction order, dirty-page handling, torn/corrupt records, crash-point matrix and recovery idempotence.",
        "portfolioValue": "Makes physical database structures, caching trade-offs and crash-recovery rules observable instead of treating a database as a black box."
    },
    {
        "id": 5,
        "name": "ReproBuild: A Reproducible Project Toolchain",
        "track": "Core Systems & Low-Level Tooling",
        "lang": "Python",
        "tags": [
            "build-tools",
            "reproducibility",
            "workspace-safety"
        ],
        "depends": "Start with a tiny manifest schema and a handful of local fixture projects; do not accept arbitrary shell command strings from untrusted manifests.",
        "description": "A manifest-driven workspace runner that selects allowlisted relative build/test commands, executes them in controlled project directories and records stable result categories.",
        "target": "Validate manifest structure, resolve relative paths safely, invoke approved executables with argument arrays, control the environment and capture exit code, stdout/stderr and elapsed time.",
        "blueprint": "Local manifest → schema/allowlist validation → isolated command runner → structured result ledger",
        "invariant": "Only declared commands run within the intended workspace; malformed paths or disallowed commands are rejected before execution.",
        "verification": "Test against malicious and malformed manifests, compare expected result categories and demonstrate that relative-path traversal is blocked.",
        "tests": "Unknown command, absolute path, ../ traversal, missing executable, nonzero exit, timeout, noisy output, environment differences and clean fixture builds.",
        "portfolioValue": "Shows build-tool engineering, configuration validation and safe orchestration of reproducible development commands."
    },
    {
        "id": 6,
        "name": "Dependency Graph Auditor: Proof-Carrying Prerequisite Checks",
        "track": "Discrete Mathematics & Algorithm Verification",
        "lang": "Python / C++",
        "tags": [
            "graph-theory",
            "topological-sort",
            "cycle-witness"
        ],
        "depends": "Start from a formal representation of directed prerequisite relations and define the output contract for both valid and invalid graphs.",
        "description": "A graph auditor that checks prerequisite relationships, returns a valid topological ordering when possible, and isolates cycles as human-readable witness paths.",
        "target": "Implement graph construction, topological ordering and cycle detection; produce a proof-like certificate containing either an ordering or a valid edge-by-edge cycle path.",
        "blueprint": "Prerequisite relations → directed graph → ordering/cycle analysis → certificate and explanation",
        "invariant": "Every emitted ordering respects each edge; every cycle report contains a sequence of real edges that closes the cycle.",
        "verification": "Validate certificates independently and compare results against a second implementation on small generated graphs.",
        "tests": "Self-loops, disconnected components, duplicate edges, empty graph, multiple cycles, long chains and randomized DAG/cyclic fixtures.",
        "portfolioValue": "Turns discrete mathematics and graph invariants into a tool whose claims can be checked independently."
    },
    {
        "id": 7,
        "name": "RouteForge: Graph Search and Priority-Queue Benchmark",
        "track": "Discrete Mathematics & Algorithm Verification",
        "lang": "C++ / Python",
        "tags": [
            "bfs",
            "dijkstra",
            "benchmarking"
        ],
        "depends": "Implement a correctness oracle on tiny graphs before running timing comparisons; keep operation counts separate from wall-clock time.",
        "description": "An algorithm laboratory comparing breadth-first search and Dijkstra's algorithm with a custom min-heap across varied graph families.",
        "target": "Generate sparse, dense, disconnected and adversarial graphs; record visited vertices, edge relaxations, heap operations, path validity, elapsed time and input parameters.",
        "blueprint": "Seeded graph generator → BFS / Dijkstra + custom min-heap → oracle → metrics report",
        "invariant": "Returned paths use valid edges and shortest distances follow each algorithm's weight assumptions; benchmark reports include reproducible inputs.",
        "verification": "Check outputs against a simple reference solver on small graphs, then run seeded size sweeps and repeated timing trials.",
        "tests": "Zero/positive weight policy, disconnected vertices, ties, stale heap entries, no-path queries, malformed graphs and repeatability checks.",
        "portfolioValue": "Demonstrates evidence-based algorithm analysis by separating theoretical complexity, operation counts and noisy timing measurements."
    },
    {
        "id": 8,
        "name": "Algorithm Arena: Parameterized Complexity Evidence Harness",
        "track": "Discrete Mathematics & Algorithm Verification",
        "lang": "Python / C++",
        "tags": [
            "dynamic-programming",
            "complexity",
            "algorithm-benchmarks"
        ],
        "depends": "Choose small problems with an exact brute-force oracle and one measurable parameter before adding algorithm variants.",
        "description": "A benchmarking and validation harness that compares dynamic-programming variants, matrix-operation crossovers and greedy strategies against small brute-force oracles.",
        "target": "Expose input parameters, operation counters, runtime measurements and correctness checks; record where a method is valid and where a crossover is only an empirical observation.",
        "blueprint": "Problem generator → algorithm variants → brute-force oracle → parameter sweep and evidence report",
        "invariant": "Every compared method solves the same declared problem and all performance claims include the tested inputs and measurement environment.",
        "verification": "Exhaustively compare tiny inputs to brute force, then sweep parameters and keep raw machine-readable results.",
        "tests": "Boundary values, tie cases, adversarial greedy counterexamples, matrix dimension regimes, seeded generation and result reproducibility.",
        "portfolioValue": "Shows algorithm design maturity by pairing optimisation ideas with counterexamples, baselines and documented complexity evidence."
    },
    {
        "id": 9,
        "name": "Proof Dossier: Counterexample Generator for Proposed Rules",
        "track": "Discrete Mathematics & Algorithm Verification",
        "lang": "Python",
        "tags": [
            "automated-reasoning",
            "counterexamples",
            "property-testing"
        ],
        "depends": "Require each proposed rule to declare its input domain, constraints and pass/fail predicate before search begins.",
        "description": "A constrained search engine that tests user-defined propositions and tries to find small inputs that violate them.",
        "target": "Enumerate or generate inputs under explicit constraints, record the first failing predicate, and minimise the counterexample while preserving the failure condition.",
        "blueprint": "Rule + domain constraints → candidate search → failing input → minimiser → counterexample dossier",
        "invariant": "Every reported counterexample satisfies the stated input constraints and actually falsifies the supplied predicate; minimisation never silently changes the rule.",
        "verification": "Replay each saved counterexample against the original predicate and compare minimised results with an unminimised search trace.",
        "tests": "Unsatisfiable searches, boundary domains, multiple violations, minimiser stability, time/size limits and reproducible seeds.",
        "portfolioValue": "Explores automated reasoning and property-based testing through concrete, inspectable counterexamples rather than opaque test failures."
    },
    {
        "id": 10,
        "name": "Algorithm Differential Tester: Brute-Force Oracles",
        "track": "Discrete Mathematics & Algorithm Verification",
        "lang": "Python / C++",
        "tags": [
            "differential-testing",
            "algorithms",
            "regression"
        ],
        "depends": "Build trusted simple reference versions for the selected sliding-window, array and sorting problems before testing faster variants.",
        "description": "A seeded regression harness that compares candidate algorithm implementations with intentionally simple brute-force/reference versions.",
        "target": "Generate random and boundary inputs, capture outputs and exit status, detect mismatches, save the seed and input, and replay every failure as a regression case.",
        "blueprint": "Seed/input generator → optimized candidate + brute-force oracle → comparator → regression corpus",
        "invariant": "Every mismatch is reproducible from its recorded input/seed, and reference implementations are independently checked on hand-worked fixtures.",
        "verification": "Run small exhaustive domains where feasible, fixed-seed randomized suites and regression replay after fixes.",
        "tests": "Empty/singleton arrays, duplicates, all-equal values, negative numbers, sorted/reverse-sorted input, overflow assumptions and malformed input.",
        "portfolioValue": "Makes disciplined debugging and independent correctness checks visible across a family of core algorithm patterns."
    },
    {
        "id": 11,
        "name": "TinyTorchLab: First-Principles Neural Network Trainer",
        "track": "ML Mechanics & Interpretability",
        "lang": "Python",
        "tags": [
            "neural-networks",
            "backpropagation",
            "gradient-checking"
        ],
        "depends": "Derive tensor shapes and derivatives for a tiny multilayer perceptron before implementing its forward and backward passes.",
        "description": "A compact neural-network trainer that implements forward propagation, loss computation, backpropagation and weight updates from first principles.",
        "target": "Build a small MLP on a toy dataset, implement a loss and optimiser, run finite-difference gradient checks, and compare controlled results with a trusted framework as a secondary reference.",
        "blueprint": "Tiny dataset → parameter initialisation → forward pass/loss → backpropagation → update and gradient report",
        "invariant": "Analytical gradients agree with finite-difference estimates within declared tolerances, and training behaviour is reproducible from a recorded seed.",
        "verification": "Gradient-check each parameter family, compare selected operations to a trusted reference and log loss/seed/hyperparameters.",
        "tests": "Shape mismatch, numerical extremes, gradient sign, zero learning rate, overfit tiny dataset, deterministic initialisation and finite-difference tolerance.",
        "portfolioValue": "Demonstrates understanding of derivatives and backpropagation beyond merely calling a high-level model API."
    },
    {
        "id": 12,
        "name": "ShiftCheck: Controlled Data-Shift Evaluation",
        "track": "ML Mechanics & Interpretability",
        "lang": "Python",
        "tags": [
            "distribution-shift",
            "calibration",
            "model-evaluation"
        ],
        "depends": "Start with a fixed training/evaluation split and synthetic shifts whose construction is known; preserve a non-shifted baseline.",
        "description": "An evaluation pipeline that compares model behaviour across controlled data slices and shifts, tracking calibration, confidence and training-serving skew indicators.",
        "target": "Create controlled covariate and label-slice changes; calculate calibration curves and slice metrics; flag input/feature differences without overstating causal conclusions.",
        "blueprint": "Baseline dataset/model → controlled shift generator → slice evaluation → calibration/skew report",
        "invariant": "Every reported metric is tied to a defined dataset version, split, model, slice and shift recipe; the baseline remains available for comparison.",
        "verification": "Recreate results from stored seeds/configuration and test the pipeline on known no-shift and known-shift fixtures.",
        "tests": "Class imbalance, missing/novel values, confidence extremes, calibration-bin edge cases, dataset-version mismatch and reproducible slices.",
        "portfolioValue": "Introduces measurable, controlled investigations into distribution shift, model calibration and monitoring limitations."
    },
    {
        "id": 13,
        "name": "SourceTrace QA: Evidence-Linked Document Assistant",
        "track": "ML Mechanics & Interpretability",
        "lang": "Python",
        "tags": [
            "retrieval",
            "citations",
            "evaluation"
        ],
        "depends": "Use a small, versioned document corpus and a deterministic baseline retriever before adding a generative-model adapter.",
        "description": "A document-question answering evaluation pipeline that tracks chunk boundaries, retrieval quality, token budgets and whether answer claims map to valid source spans.",
        "target": "Build document ingestion, chunking, retrieval and citation validation; measure retrieval recall/precision on authored queries and flag missing or out-of-range citations.",
        "blueprint": "Versioned documents → chunk/index layer → retrieval → answer/citation adapter → evidence and retrieval metrics",
        "invariant": "Every accepted citation resolves to a real source span in the selected corpus version; the system distinguishes unsupported answers from cited answers.",
        "verification": "Run a fixed question set with labelled supporting spans; evaluate retrieval separately from answer quality and citation validity.",
        "tests": "Missing evidence, overlapping chunks, duplicate documents, stale corpus version, invalid span offsets, token-budget overflow and unanswerable questions.",
        "portfolioValue": "Shows disciplined evaluation of retrieval and evidence-grounding, rather than treating plausible generated text as proof."
    },
    {
        "id": 14,
        "name": "Activation Atlas: Inspect a Tiny Transformer",
        "track": "ML Mechanics & Interpretability",
        "lang": "Python / PyTorch",
        "tags": [
            "transformers",
            "interpretability",
            "hypothesis-testing"
        ],
        "depends": "Train or load a small, understandable transformer on a controlled task; formulate specific hypotheses before inspecting activations.",
        "description": "An interpretability workbench for probing hidden representations, attention patterns and internal activations in a tiny transformer under controlled tests.",
        "target": "Capture activations and attention under declared inputs, run interventions or representation comparisons, and publish behavior cards describing the exact hypothesis, method and observed limits.",
        "blueprint": "Tiny transformer + controlled prompts → activation capture → hypothesis tests → plots and behavior card",
        "invariant": "Each interpretation claim is traceable to a documented experiment, baseline, input set and limitation; correlations are not presented as causal proof.",
        "verification": "Repeat probes across saved seeds/checkpoints and include negative controls or alternative explanations where possible.",
        "tests": "Shape/hook correctness, padding/masking cases, input perturbations, randomized controls and reproducibility of stored activation summaries.",
        "portfolioValue": "Explores model internals through transparent experiments and restrained evidence claims instead of unsupported mechanistic explanations."
    },
    {
        "id": 15,
        "name": "ML ContractKit: Data-to-Prediction Invariants",
        "track": "ML Mechanics & Interpretability",
        "lang": "Python",
        "tags": [
            "mlops",
            "data-contracts",
            "lineage"
        ],
        "depends": "Define contracts at each stage of a small inference pipeline before wiring the stages together.",
        "description": "A validation and monitoring layer that enforces input-shape, schema, range and lineage contracts from incoming data through prediction output.",
        "target": "Version data contracts, validate data types/shapes and required fields before inference, record pipeline lineage, and make violations explicit and testable.",
        "blueprint": "Input dataset → schema/contract validation → feature transform → inference adapter → validated output + lineage",
        "invariant": "Invalid inputs are rejected or quarantined under documented rules; valid inputs produce schema-conforming outputs tied to a specific contract/model version.",
        "verification": "Use fixture datasets with known violations and clean controls; compare contract reports and lineage records across repeated runs.",
        "tests": "Missing fields, unexpected categories, shape changes, NaN/infinite values, range violations, version mismatch and output-schema drift.",
        "portfolioValue": "Demonstrates reliable data-to-prediction pipeline design and testable MLOps-style safeguards."
    },
    {
        "id": 16,
        "name": "GuardRail Web: A Local AppSec Regression Lab",
        "track": "Security Engineering & Infrastructure",
        "lang": "Python / TypeScript",
        "tags": [
            "appsec",
            "authorization",
            "session-isolation"
        ],
        "depends": "Use a deliberately local test application with synthetic accounts and data; define a role/permission matrix before creating fuzz cases.",
        "description": "A local application-security regression lab that fuzzes role-based authorization and session boundaries across state-changing routes in a deliberately test-only web app.",
        "target": "Define user roles and allowed actions, generate valid/invalid session and state-transition sequences, and detect privilege escalation or cross-session data access.",
        "blueprint": "Synthetic users/roles → local web routes → authorization-state fuzzer → violation report and regression tests",
        "invariant": "Every tested route enforces the declared role/action matrix, and one session cannot read or mutate another session's protected test data.",
        "verification": "Run the test suite only against the local fixture application; replay each discovered authorization failure as a regression test.",
        "tests": "Horizontal/vertical access control, missing/expired session, role downgrade, object-ID substitution, CSRF-related state assumptions and session separation.",
        "portfolioValue": "Shows systematic application-security testing and clear threat-model reasoning in a controlled environment."
    },
    {
        "id": 17,
        "name": "SignalDesk: Alert Triage Metrics and Incident Timeline Replay",
        "track": "Security Engineering & Infrastructure",
        "lang": "Python",
        "tags": [
            "security-analytics",
            "incident-replay",
            "precision-recall"
        ],
        "depends": "Generate synthetic event logs with known injected incidents and ground-truth labels before defining detection rules.",
        "description": "A defensive security analytics dashboard that parses synthetic infrastructure logs, reconstructs event timelines and evaluates alerting-rule performance.",
        "target": "Normalise timestamps and event fields, correlate related events, replay an incident timeline, and report false positives/negatives plus precision and recall against labelled fixtures.",
        "blueprint": "Synthetic logs → parser/normaliser → correlation and replay engine → triage dashboard and metric report",
        "invariant": "Each alert is traceable to source events and a rule version; metric calculations use a declared labelled evaluation set.",
        "verification": "Re-run incident fixtures, compare event ordering to expected timelines and independently calculate confusion-matrix metrics.",
        "tests": "Out-of-order timestamps, duplicate logs, missing fields, time-zone assumptions, noisy benign events and known injected incidents.",
        "portfolioValue": "Demonstrates structured logging, incident reasoning and honest detection-quality measurement without implying access to real systems."
    },
    {
        "id": 18,
        "name": "LocalLineage: Idempotent Backfill and Schema Evolution Replay",
        "track": "Security Engineering & Infrastructure",
        "lang": "Python / SQL",
        "tags": [
            "data-engineering",
            "schema-evolution",
            "idempotency"
        ],
        "depends": "Create versioned sample tables and migration fixtures; specify rollback and duplicate-execution behaviour first.",
        "description": "A local data-engineering tool that replays schema changes and backfills across versioned datasets while validating idempotency and structural quality.",
        "target": "Track schema versions, apply migrations, run bounded backfills and record checkpoints; re-running a completed operation should not duplicate or corrupt state.",
        "blueprint": "Versioned dataset → migration/backfill plan → checkpointed replay → validation report and rollback path",
        "invariant": "An operation has explicit idempotency semantics, schema versions advance only on success, and interrupted runs can resume or recover according to the documented contract.",
        "verification": "Compare single-run, repeated-run and interrupted-run outcomes against expected table snapshots and constraints.",
        "tests": "Duplicate replay, partial batch, null/duplicate keys, schema rename/addition, invalid cast, rollback chain and interrupted checkpoint.",
        "portfolioValue": "Shows careful reasoning about data migration safety, repeatable backfills and schema compatibility."
    },
    {
        "id": 19,
        "name": "ReproBuild: Environment Drift Detector and Clean Room Bootstrap",
        "track": "Security Engineering & Infrastructure",
        "lang": "Python / Shell",
        "tags": [
            "environment-drift",
            "clean-room",
            "dependency-audit"
        ],
        "depends": "This is separate from Project 5: audit and rebuild the environment; do not duplicate the allowlisted command runner's core scope.",
        "description": "An environment-auditing tool that compares declared and observed project dependencies/configuration, reports drift and bootstraps a clean test workspace from an explicit manifest.",
        "target": "Inventory controlled directory trees, tool versions, environment variables and dependency locks; categorise mismatches and launch a clean-room bootstrap using allowlisted setup steps.",
        "blueprint": "Environment manifest → filesystem/toolchain inventory → drift report → clean-room bootstrap and comparison",
        "invariant": "Drift findings are deterministic and attributable to specific declarations or observed values; the bootstrap does not silently depend on undeclared machine state.",
        "verification": "Use fixture workspaces with seeded differences and compare clean-room outputs against documented expectations.",
        "tests": "Missing/extra files, changed hashes, version mismatch, environment-variable drift, symlinks under a documented policy, absent tools and clean bootstrap repeatability.",
        "portfolioValue": "Emphasises supply-chain hygiene, dependency visibility and repeatable clean environments. Project 5 runs approved commands; this project audits and reconstructs the environment.",
        "note": "Keep this distinct from Project 5: the shared ReproBuild name indicates a tool family, not duplicate implementation scope."
    },
    {
        "id": 20,
        "name": "CivicLedger: A Local SQLite Public-Data Warehouse",
        "track": "Security Engineering & Infrastructure",
        "lang": "Python / SQL",
        "tags": [
            "sqlite",
            "public-data",
            "data-quality"
        ],
        "depends": "Choose a stable, openly licensed public dataset and save a small reproducible fixture with its provenance and schema assumptions.",
        "description": "A local public-data pipeline that ingests civic source files into raw/staging tables and a normalised SQLite warehouse with integrity checks and query-plan analysis.",
        "target": "Track source provenance, handle malformed rows explicitly, normalise relationships, enforce transactional loading and compare indexed/unindexed query plans on documented queries.",
        "blueprint": "Public source files → raw import → validation/staging → normalised SQLite tables → integrity and query-plan reports",
        "invariant": "Each accepted row is traceable to its source input, rejected records are counted with reasons, and each load is atomic or safely restartable under the stated policy.",
        "verification": "Rebuild the warehouse from the saved fixture, compare row counts and constraints to expected results, and record EXPLAIN QUERY PLAN output for selected queries.",
        "tests": "Duplicate IDs, null keys, malformed encodings, inconsistent dates, interrupted import, transaction rollback, foreign-key violations and index plan comparison.",
        "portfolioValue": "Combines civic-data processing, schema design, transactional integrity and measured query optimisation using a reproducible local dataset."
    }
];
  const events = [
    {id:'ioitc-2026-history',date:'2026-06-01',dateLabel:'1–12 Jun 2026 · completed',name:'IOITC-2026 (historical)',type:'Completed',verified:true,source:'Official IARCS current-cycle page confirms IOITC-2026 was held in Chennai from 1–12 June 2026.',description:'Historical reference only. IOITC-2026 has already taken place; it selected India’s team for IOI-2026.',url:'https://www.iarcs.org.in/inoi/current.php',topics:['IOITC','history'],priority:'low',endDate:'2026-06-12'},
    {id:'zco-reg-open-plan',date:'2026-10-30',dateLabel:'By 30 Oct 2026 · expected',name:'ZCO-2027 registration expected to open',type:'Upcoming',verified:false,source:'IARCS says registration is expected to open by 30 October 2026; this is an expected opening, not a confirmed registration start. Check current IARCS updates and eligibility.',description:'Check eligibility and registration. Keep ZCO distinct from ZIO. Do not assume eligibility until IARCS rules for the current school year are confirmed.',url:'https://www.iarcs.org.in/inoi/current.php',topics:['ZCO','registration'],priority:'high'},
    {id:'zco-exam-plan',date:'2026-12-12',dateLabel:'12 Dec 2026 · exam time to confirm',name:'ZCO-2027 exam',type:'Upcoming',verified:true,source:'IARCS officially lists ZCO-2027 for Saturday, 12 December 2026. The 2–5 PM IST time in the supplied plan has not been independently confirmed here; check the official instructions/admit card.',description:'Take the exam only if eligible and registered. The date is confirmed by IARCS; verify the session time, venue/platform, and eligibility using official instructions.',url:'https://www.iarcs.org.in/inoi/current.php',topics:['ZCO','exam'],priority:'high'},
    {id:'inoi-tba',date:null,dateLabel:'Date TBA',name:'INOI-2027 (if qualified through ZCO)',type:'TBA',verified:false,source:'IARCS has not published an INOI-2027 date on the current-cycle page checked for this update. Follow official announcements and qualification rules.',description:'Conditional pathway milestone only if qualified. No placeholder date is assigned; update this item when IARCS publishes the official schedule.',url:'https://www.iarcs.org.in/inoi/current.php',topics:['INOI','qualification'],priority:'medium'},
    {id:'ioitc-tba',date:null,dateLabel:'Date TBA',name:'IOITC-2027 (if selected through INOI)',type:'TBA',verified:false,source:'IARCS has not published an IOITC-2027 date on the current-cycle page checked for this update. Follow official announcements and selection rules.',description:'Conditional pathway milestone only if selected through INOI. No placeholder date is assigned; update this item when IARCS publishes the official schedule.',url:'https://www.iarcs.org.in/inoi/current.php',topics:['IOITC','selection'],priority:'low'},
    {id:'sat-registration',date:'2027-04-16',dateLabel:'16 Apr 2027 · official regular deadline',name:'SAT registration deadline for 1 May sitting',type:'Deadline',verified:true,source:'College Board confirms 16 April 2027 as the regular registration deadline for the 1 May 2027 SAT. Deadlines expire at 11:59 PM US Eastern Time; centre availability may vary.',description:'Register by the regular deadline if taking the 1 May SAT. Check local test-centre seats and the official College Board page; late registration is listed separately and may cost extra.',url:'https://satsuite.collegeboard.org/dates/may-1-2027-sat-test-date',topics:['SAT','registration'],priority:'high'},
    {id:'sat-exam-plan',date:'2027-05-01',dateLabel:'1 May 2027 · official test date',name:'SAT',type:'Upcoming',verified:true,source:'College Board confirms Saturday, 1 May 2027 as an SAT weekend test date for US and international students.',description:'Take the SAT if registered at a confirmed test centre. Use Bluebook and Khan Academy for practice.',url:'https://satsuite.collegeboard.org/dates/may-1-2027-sat-test-date',topics:['SAT','exam'],priority:'high'},
    {id:'ioi-2027',date:'2027-09-12',dateLabel:'12–19 Sep 2027 · official dates',name:'IOI-2027 in Potsdam, Germany (if selected)',type:'Upcoming',verified:true,source:'The official IOI 2027 website confirms the event will take place 12–19 September 2027 at the Hasso Plattner Institute in Potsdam, Germany. Participation depends on selection for India’s team.',description:'International final only if selected for India’s team. The event dates are official; selection and travel details depend on the Indian pathway and organisers.',url:'https://ioi2027.de/',topics:['IOI','international final'],priority:'low',endDate:'2027-09-19'}
  ];
  const ongoing = [
    {id:'codeforces',name:'Codeforces',sub:'Competitive programming',frequency:'3–5 problems per week; regular contests',icon:'C',url:'https://codeforces.com/'},
    {id:'atcoder',name:'AtCoder',sub:'Algorithmic problem-solving',frequency:'Weekly practice or contests',icon:'A',url:'https://atcoder.jp/'},
    {id:'codechef',name:'CodeChef',sub:'Additional programming contests',frequency:'Occasionally',icon:'C',url:'https://www.codechef.com/'},
    {id:'cses',name:'CSES Problem Set',sub:'Algorithms and data structures',frequency:'3–5 problems per week',icon:'S',url:'https://cses.fi/problemset/'},
    {id:'usaco-guide',name:'USACO Guide',sub:'Structured algorithms curriculum',frequency:'Study alongside CSES',icon:'U',url:'https://usaco.guide/'},
    {id:'project-euler',name:'Project Euler',sub:'Mathematical and computational problem-solving',frequency:'1 problem per week',icon:'E',url:'https://projecteuler.net/'},
    {id:'leetcode',name:'LeetCode',sub:'Interview-style coding practice',frequency:'Optional, 1–3 problems per week',icon:'L',url:'https://leetcode.com/'},
    {id:'kaggle',name:'Kaggle',sub:'Machine learning and data science',frequency:'Weekly while developing personal ML projects',icon:'K',url:'https://www.kaggle.com/'},
    {id:'picoctf',name:'picoCTF',sub:'Cybersecurity challenges',frequency:'Optional',icon:'P',url:'https://picoctf.org/'},
    {id:'bluebook',name:'Bluebook',sub:'Official SAT practice tests',frequency:'Periodically; more often near the exam',icon:'B',url:'https://bluebook.collegeboard.org/'},
    {id:'khan-sat',name:'Khan Academy SAT',sub:'SAT Math and Reading/Writing',frequency:'3–5 sessions per week',icon:'K',url:'https://www.khanacademy.org/test-prep/sat'},
    {id:'khan-physics',name:'Khan Academy Physics',sub:'Physics concept revision',frequency:'As needed',icon:'K',url:'https://www.khanacademy.org/science/physics'},
    {id:'paul-math',name:"Paul's Online Math Notes",sub:'Calculus explanations and exercises',frequency:'As needed',icon:'∫',url:'https://tutorial.math.lamar.edu/'}
  ];
  const documentGroups = [
    {id:'academics',name:'01 / Academic records',desc:'School-issued records needed for undergraduate applications',items:[
      {id:'transcript-g9',title:'Class IX academic record',desc:'Keep a clear school-issued report card or transcript if available and follow each university’s exact record requirements.'},
      {id:'transcript-g10',title:'Class X board marksheet and certificate',desc:'Retain the official CBSE, ICSE or state-board result and certificate when issued.'},
      {id:'transcript-g11',title:'Class XI academic record',desc:'Keep the official report card and subject/course details.'},
      {id:'transcript-g12',title:'Class XII interim / midyear record',desc:'Request the first-term or midyear report when the school issues it.'},
      {id:'predicted-grades',title:'Predicted / expected Class XII results',desc:'Ask whether the school can provide an official predicted-grade letter if needed for the application.'},
      {id:'final-grades',title:'Final Class XII board results',desc:'Submit through the university’s specified process when released.'},
      {id:'school-profile',title:'School profile and grading-system explanation',desc:'Request a profile describing the board, curriculum, grading scale, class context and medium of instruction.'},
      {id:'english-medium-letter',title:'School confirmation of English as the language of instruction',desc:'Ask the school for a letter stating the years and level for which English was the primary language of instruction.'}
    ]},
    {id:'school-support',name:'02 / School reports and recommendations',desc:'Coordinate submission with authorised school staff',items:[
      {id:'school-report',title:'School Report / Secondary School Report',desc:'Confirm who at your school can complete and submit the official report for each university.'},
      {id:'counsellor-lor',title:'Counsellor recommendation or authorised school-official equivalent',desc:'Identify the appropriate counsellor, principal, vice-principal or other accepted school official.'},
      {id:'teacher-stem',title:'Teacher recommendation — STEM subject',desc:'Ask a teacher who can describe your actual academic work, curiosity and development.'},
      {id:'teacher-humanities',title:'Teacher recommendation — humanities / language / social science',desc:'Ask a second teacher from a different academic area where required.'},
      {id:'recommendation-context',title:'Recommendation context packet',desc:'Prepare a factual activity/project summary and give recommenders enough time; do not write or impersonate their recommendations.'}
    ]},
    {id:'writing',name:'03 / Application writing and required written work',desc:'Writing artifacts and university-specific supporting materials',items:[
      {id:'common-essay',title:'Common Application personal essay draft',desc:'Use authentic experiences and your own voice; the final prompt and word limit must be checked for the cycle.'},
      {id:'supplements',title:'University-specific supplemental essay tracker',desc:'Track each university’s prompts, word limits, draft status and reviewer feedback when prompts are released.'},
      {id:'mit-short-answers',title:'MIT short-answer responses',desc:'Prepare when the Fall 2028 application prompts are published; do not treat prior-cycle prompts as final.'},
      {id:'harvard-short-answers',title:'Harvard short-answer responses',desc:'Use the new-cycle prompts when released; the supplied guide’s prompt wording may change.'},
      {id:'graded-paper',title:'Princeton graded written paper in English',desc:'Preserve an English-language paper with the teacher’s grade and comments, following Princeton’s current instructions.'},
      {id:'activities-list',title:'Activities, projects, awards and responsibilities list',desc:'Record your real role, scope, time commitment, outcomes and evidence without inflating ownership or impact.'}
    ]},
    {id:'identity',name:'04 / Identity and translations',desc:'Identity records and accurate document handling',items:[
      {id:'passport',title:'Passport / identity details',desc:'Keep identity information available for application forms and later enrolment or visa steps; check each authority’s validity rules.'},
      {id:'translations',title:'Required translations plus original documents',desc:'If records are not in English, follow each university’s translation rules. Some prohibit self-translation; retain and submit the original as required.'},
      {id:'name-consistency',title:'Consistent name and biographical details',desc:'Check spelling, order and dates across school records, identity documents and application forms; resolve discrepancies through the issuing authority.'}
    ]},
    {id:'financial-documents',name:'05 / Financial-aid documentation',desc:'Private family records for need-based aid applications',items:[
      {id:'parent-tax',title:'Parents’ income-tax returns and income records',desc:'Collect the relevant Indian tax returns and supporting income documents; the required tax year changes by application cycle and institution.'},
      {id:'non-filer',title:'Non-filer / salary / employer documentation if applicable',desc:'If a parent does not file tax returns, prepare the institution’s accepted non-filer statement and evidence of income.'},
      {id:'assets',title:'Bank, savings, investment and asset records',desc:'Prepare accurate balances and statements requested by the relevant financial-aid forms.'},
      {id:'business-farm',title:'Business, farm, trust or estate documents if applicable',desc:'Gather relevant returns and supplementary records only when they apply to your family.'},
      {id:'parent-separation',title:'Separated-parent documentation or waiver request if applicable',desc:'Follow each university’s rules for noncustodial-parent information and waiver requests.'},
      {id:'aid-document-folder',title:'University-specific financial-aid document folders',desc:'Keep separate folders for CSS Profile / IDOC materials and Princeton’s PFAA process; Princeton does not use CSS Profile according to the supplied guide.'}
    ]},
    {id:'portfolio-evidence',name:'06 / Optional portfolio and evidence documents',desc:'Submit only relevant, authentic supporting material',items:[
      {id:'research-writeup',title:'Research or project write-ups',desc:'Document the question, your contribution, methods, evaluation, limitations and collaborators or mentor support.'},
      {id:'github-clean',title:'Public code / project repository review',desc:'Publish only work that exists, is understandable, and does not expose secrets or private information.'},
      {id:'project-results',title:'Project evidence log and results',desc:'Record actual commands, environment, outputs, measured limits, failures and reproducibility notes.'},
      {id:'optional-portfolio',title:'Optional portfolio / supplementary-material packet',desc:'Choose only material relevant to the university’s published submission rules; optional material is not automatically beneficial.'}
    ]}
  ];

  const academyPaths = [
    {id:'systems',title:'Systems foundations & low-level tooling',track:'Core systems',icon:'⌘',projects:'Projects 1–5',purpose:'Learn concurrency and fault modelling, memory ownership, parsing, bytecode execution, page layouts and safe build tooling. Use the project requirements as your syllabus; avoid cargo-culting code from a tutorial.',resources:[
      {id:'learncpp',title:'LearnCpp',sub:'Structured modern C++ fundamentals',url:'https://www.learncpp.com/'},
      {id:'cppref',title:'cppreference: containers, memory and language',sub:'Authoritative language/library reference',url:'https://en.cppreference.com/w/'},
      {id:'ostep',title:'Operating Systems: Three Easy Pieces',sub:'Free online book for OS concepts',url:'https://pages.cs.wisc.edu/~remzi/OSTEP/'},
      {id:'sqlite-arch',title:'SQLite architecture',sub:'File format, B-trees and pager concepts',url:'https://www.sqlite.org/arch.html'},
      {id:'crafting',title:'Crafting Interpreters',sub:'A free book on interpreters and virtual machines',url:'https://craftinginterpreters.com/'}
    ],tip:'Practice loop: implement a tiny parser → write tests → inspect failures under a debugger → document ownership and edge cases.'},
    {id:'math',title:'Discrete mathematics & algorithm verification',track:'Algorithms',icon:'∑',projects:'Projects 6–10',purpose:'Make each graph or algorithm rule explicit. Pair empirical performance with a brute-force oracle, search for counterexamples and preserve every discovered mismatch as a regression case.',resources:[
      {id:'cpalg',title:'CP-Algorithms',sub:'Graph algorithms, data structures and complexity',url:'https://cp-algorithms.com/'},
      {id:'opendsa',title:'OpenDSA',sub:'Open interactive material on data structures and algorithms',url:'https://opendsa-server.cs.vt.edu/'},
      {id:'mitlin',title:'MIT OpenCourseWare — Linear Algebra',sub:'Vectors, matrices and linear systems',url:'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'},
      {id:'3blue',title:'3Blue1Brown — neural networks / calculus intuition',sub:'Visual explanations to complement derivations',url:'https://www.3blue1brown.com/topics/neural-networks'},
      {id:'numpy',title:'NumPy quickstart',sub:'Reference for concepts; optional in your from-scratch implementation',url:'https://numpy.org/doc/stable/user/quickstart.html'}
    ],tip:'Keep a notebook of invariant, complexity, proof sketch, counterexamples and oracle logic for each algorithm.'},
    {id:'concurrency',title:'Reliability, fault injection & environments',track:'Cross-track infrastructure',icon:'⇋',projects:'Projects 1, 5, 16–19',purpose:'Design failure models and state transitions first. Practise deterministic fault schedules, safe local execution, environment manifests and repeatable clean-room runs.',resources:[
      {id:'cppthread',title:'cppreference: C++ threads and synchronisation',sub:'Threads, mutexes, condition variables and atomics',url:'https://en.cppreference.com/w/cpp/thread.html'},
      {id:'tsan',title:'Clang ThreadSanitizer',sub:'Race-detection instrumentation and limitations',url:'https://clang.llvm.org/docs/ThreadSanitizer.html'},
      {id:'mitdist',title:'MIT 6.5840 Distributed Systems',sub:'Distributed systems lectures and labs',url:'https://pdos.csail.mit.edu/6.824/'},
      {id:'raft',title:'The Raft consensus paper',sub:'Consensus reasoning and state replication',url:'https://raft.github.io/raft.pdf'},
      {id:'cmake',title:'CMake tutorial',sub:'Build configuration and reproducible setup',url:'https://cmake.org/cmake/help/latest/guide/tutorial/'}
    ],tip:'Use deterministic simulation and fixed seeds before testing real network timing. A local simulator is not proof of production consensus.'},
    {id:'ml',title:'ML mechanics, evaluation & interpretability',track:'Machine learning',icon:'◎',projects:'Projects 11–15',purpose:'Implement training mechanics from first principles, evaluate controlled shifts, measure retrieval/citation quality and run hypothesis-driven probes on a tiny transformer.',resources:[
      {id:'d2l',title:'Dive into Deep Learning',sub:'Open textbook with math and code',url:'https://d2l.ai/'},
      {id:'mlbook',title:'Google Machine Learning Crash Course',sub:'Free foundations and exercises',url:'https://developers.google.com/machine-learning/crash-course'},
      {id:'skleak',title:'Scikit-learn: common pitfalls and data leakage',sub:'Useful taxonomy of leakage failure modes',url:'https://scikit-learn.org/stable/common_pitfalls.html#data-leakage'},
      {id:'quant',title:'TensorFlow model quantization overview',sub:'Concepts and trade-offs for reduced precision',url:'https://www.tensorflow.org/model_optimization/guide/quantization'},
      {id:'pillow',title:'Pillow documentation',sub:'Image loading and image transformations',url:'https://pillow.readthedocs.io/en/stable/'}
    ],tip:'Every accuracy number needs the dataset, split, baseline, model and exact evaluation method alongside it.'},
    {id:'verification',title:'Testing, fuzzing & correctness evidence',track:'Cross-cutting',icon:'✓',projects:'Projects 1–20 · all release gates',purpose:'Make failures reproducible. Use references, constrained generators, fault schedules, regression fixtures and honest result logs across all four project tracks.',resources:[
      {id:'asan',title:'AddressSanitizer',sub:'Memory error detector for supported C/C++ builds',url:'https://clang.llvm.org/docs/AddressSanitizer.html'},
      {id:'ubsan',title:'UndefinedBehaviorSanitizer',sub:'Detect supported undefined-behaviour cases',url:'https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html'},
      {id:'valgrind',title:'Valgrind quick start',sub:'Memory debugging and profiling tools',url:'https://valgrind.org/docs/manual/quick-start.html'},
      {id:'libfuzzer',title:'LLVM libFuzzer',sub:'Coverage-guided in-process fuzzing',url:'https://llvm.org/docs/LibFuzzer.html'},
      {id:'ghactions',title:'GitHub Actions documentation',sub:'CI workflows and automation',url:'https://docs.github.com/en/actions'}
    ],tip:'Do not describe a finite test suite as proof of zero defects. Report what was tested, what passed, and what remains unknown.'},
    {id:'delivery',title:'Git, portfolio & deployment',track:'Delivery',icon:'↗',projects:'GitHub · website · CV · CI',purpose:'Build the public face after the underlying work is credible. Keep the portfolio fast, searchable, accessible and easy to reproduce.',resources:[
      {id:'gitbook',title:'Pro Git book',sub:'Free, comprehensive Git guide',url:'https://git-scm.com/book/en/v2'},
      {id:'ghpages',title:'GitHub Pages',sub:'Static site hosting and custom domains',url:'https://docs.github.com/en/pages'},
      {id:'vercel',title:'Vercel documentation',sub:'Deploying web projects and custom domains',url:'https://vercel.com/docs'},
      {id:'webdev',title:'web.dev Learn',sub:'HTML, CSS, accessibility and performance',url:'https://web.dev/learn/'},
      {id:'gitattributes',title:'GitHub: profile README',sub:'Profile README setup and presentation',url:'https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme'}
    ],tip:'Keep repository counts, performance claims and completion statements out of the public CV until the underlying artefacts and measurements can be audited.'}
  ];

  const sourceLibrary = [
    {id:'master-competition-exam-practice-calendar-2026-2027.md',title:'Master Competition, Exam & Practice Calendar (2026–2027)',type:'MD',subtitle:'Active competition milestones, exams and recurring practice resources.',file:'source-material/master-competition-exam-practice-calendar-2026-2027.md',note:'This is the sole active calendar. Dates and cadence are preserved as supplied; unverified dates remain labelled for confirmation.'},
    {id:'us-undergrad-6-universities-india-guide.md',title:'US Undergraduate Guide — MIT, Stanford, Harvard, Caltech, Yale & Princeton',type:'MD',subtitle:'Active source of truth for the six-university Fall 2028 shortlist: admissions, exams, documents, financial aid, costs, deadlines, risks and official links.',file:'source-material/us-undergrad-6-universities-india-guide.md',note:'User-supplied guide researched 24 Oct 2026. It contains current-cycle and uncertain claims; recheck official rules and dates for the 2027–28 application cycle.'},
    {id:'20-project-blueprint-source.txt',title:'Apex OS — Current 20-Project Programme',type:'TXT',subtitle:'Project specifications, invariants, dependencies and verification targets.',file:'source-material/20-project-blueprint-source.txt',note:'These are proposed project designs, not completed achievements.'},
    {id:'Application_Ready_Master_Protocol.md',title:'Application Ready Master Protocol',type:'MD',subtitle:'Personal website, project cards, GitHub architecture, résumé and deployment workflow.',file:'source-material/Application_Ready_Master_Protocol.md',note:'General portfolio protocol; university-specific requirements must come from the active six-university guide.'},
    {id:'source-project-details.json',title:'Project specification data',type:'JSON',subtitle:'Structured project details used by the engineering workspace.',file:'source-material/source-project-details.json',note:'Project source data, independent of the active university shortlist.'},
    {id:'supabase-setup.md',title:'Supabase automatic sync setup',type:'MD',subtitle:'Workspace sync setup and troubleshooting.',file:'supabase/SETUP.md',note:'Technical reference for optional sync.'}
  ];

  const defaultState = () => ({
    schema:2, targetCycle:cycleAssumption, applicationTarget:TARGET_DATE_DEFAULT, workspaceNotes:'',
    aiState:{messages:[],reports:{},dossiers:{},proposals:{},lastResearchId:null},
    universityState:Object.fromEntries(universities.map(u=>[u.id,{status:'Not started',notes:'',checks:[]}])) ,
    eventState:Object.fromEntries(events.map(e=>[e.id,{done:false,notes:''}])),
    docState:Object.fromEntries(documentGroups.flatMap(g=>g.items.map(i=>[i.id,{status:'todo',notes:''}]))),
    projectState:Object.fromEntries(projects.map(p=>[p.id,{status:'Not started',gates:[false,false,false,false],evidence:'',notes:'',sourceUrl:'',resultsUrl:''}])),
    academyState:Object.fromEntries(academyPaths.flatMap(p=>p.resources.map(r=>[r.id,false]))),
    profile:{name:'',headline:'',links:'',summary:''},lastSaved:null
  });
  let state = loadState();
  function restoreState(parsed){const base=defaultState();const priorSchema=Number(parsed?.schema||1);const merged=deepMerge(base,parsed||{});if(priorSchema<2){merged.projectState=base.projectState;}if(merged.eventState)delete merged.eventState.bebras;merged.schema=3;return merged;}
  function loadState(){
    try{const raw=localStorage.getItem(STORE_KEY);if(!raw)return defaultState();const parsed=JSON.parse(raw);const merged=restoreState(parsed);const supported=new Set(universities.map(u=>u.id));Object.keys(merged.universityState||{}).forEach(id=>{if(!supported.has(id))delete merged.universityState[id];});const activeEvents=new Set(events.map(e=>e.id));Object.keys(merged.eventState||{}).forEach(id=>{if(!activeEvents.has(id))delete merged.eventState[id];});const activeDocs=new Set(documentGroups.flatMap(g=>g.items.map(i=>i.id)));Object.keys(merged.docState||{}).forEach(id=>{if(!activeDocs.has(id))delete merged.docState[id];});['dossiers','proposals','reports'].forEach(k=>{if(merged.aiState?.[k]&&typeof merged.aiState[k]==='object')Object.keys(merged.aiState[k]).forEach(id=>{if(!supported.has(id))delete merged.aiState[k][id];});});return merged;}catch(e){return defaultState();}
  }
  function deepMerge(base, extra){
    if(!extra||typeof extra!=='object') return base;
    for(const [k,v] of Object.entries(extra)){
      if(v&&typeof v==='object'&&!Array.isArray(v)&&base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k])) base[k]=deepMerge(base[k],v);
      else if(k in base) base[k]=v;
    }
    return base;
  }
  function initializeSavedLabel(){
    const label=qs('#last-saved-label');if(!label)return;
    if(state.lastSaved){const parsed=new Date(state.lastSaved);label.textContent=Number.isNaN(parsed.getTime())?'Local copy ready':`Saved locally ${parsed.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;}
    else label.textContent='Local copy ready';
  }
  function saveState(message='Saved locally'){
    state.lastSaved=new Date().toISOString();
    try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(e){toast('Could not save in this browser. Export a backup and check available storage.',true);}
    updateGlobalMetrics();
    const label=qs('#last-saved-label');if(label)label.textContent=`Saved locally ${new Date(state.lastSaved).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
    if(window.ApexSync)window.ApexSync.queueSave(state);
    if(message)toast(message);
  }
  function toast(message,error=false){const region=qs('#toast-region');const node=document.createElement('div');node.className='toast'+(error?' error':'');node.textContent=message;region.append(node);setTimeout(()=>node.remove(),3500);}
  function statusDotClass(status){return status==='Verified'||status==='Published'?'verified':status==='In progress'||status==='Implemented'?'doing':'';}
  function projectVerified(p){const s=state.projectState[p.id];return s&&['Verified','Published'].includes(s.status)&&s.gates.every(Boolean)&&s.evidence.trim().length>=12;}
  function totalVerified(){return projects.filter(projectVerified).length;}
  function projectPercent(){return Math.round(totalVerified()/projects.length*100);}
  function documentsProgress(){const all=documentGroups.flatMap(g=>g.items);const done=all.filter(i=>state.docState[i.id]?.status==='done').length;return {done,total:all.length,pct:Math.round(done/all.length*100)};}
  function universityProgress(u){const s=state.universityState[u.id];const base=u.documents.length;return Math.round((s.checks.length/base)*100);}
  function readiness(){const docs=documentsProgress().pct;const projectsPct=projectPercent();const uniPct=Math.round(universities.reduce((a,u)=>a+universityProgress(u),0)/universities.length);const eventsDone=Math.round(events.filter(e=>state.eventState[e.id]?.done).length/Math.max(1,events.length)*100);return {docs,projects:projectsPct,universities:uniPct,events:eventsDone,overall:Math.round(docs*.25+projectsPct*.5+uniPct*.15+eventsDone*.1)};}
  function updateGlobalMetrics(){
    const progress=readiness();
    qs('#nav-doc-count').textContent=`${documentsProgress().done}/${documentsProgress().total}`;
    qs('#nav-event-count').textContent=events.filter(e=>e.date&&!state.eventState[e.id]?.done&&e.date>=todayISO).length;
    qs('#metric-projects').textContent=totalVerified();qs('#metric-documents').textContent=documentsProgress().pct;
    qs('#sidebar-progress-label').textContent=`${progress.overall}%`;qs('#sidebar-progress-bar').style.width=`${progress.overall}%`;
    qs('#project-progress-count').textContent=totalVerified();qs('#projects-release-bar').style.width=`${projectPercent()}%`;
    qs('#metric-events').textContent=events.filter(e=>!state.eventState[e.id]?.done).length;
    const next=events.filter(e=>e.date&&!state.eventState[e.id]?.done&&e.date>=todayISO).sort((a,b)=>a.date.localeCompare(b.date))[0];
    qs('#event-next-value').textContent=next?next.dateLabel:'Check date TBA';
    qs('#readiness-value').textContent=`${progress.overall}%`;qs('#readiness-ring').style.setProperty('--score',`${progress.overall}%`);
    qs('#readiness-title').textContent=progress.overall===0?'Establish your baseline':progress.overall<25?'Build the evidence habit':progress.overall<60?'Momentum is compounding':'Release readiness is taking shape';
    qs('#readiness-copy').textContent=progress.overall===0?'Progress will grow as you complete checklists and pass project verification gates.':'Your readiness is calculated from verified projects, document checklist completion, and tracked university/event actions. It is a planning indicator, not an admissions probability.';
    qs('#readiness-breakdown').innerHTML=[['Projects',progress.projects],['Documents',progress.docs],['Universities',progress.universities],['Timeline',progress.events]].map(([n,v])=>`<div class="breakdown-row"><span>${n}</span><div class="breakdown-bar"><span style="width:${v}%"></span></div><span class="breakdown-pct">${v}%</span></div>`).join('');
    qs('#portfolio-status').textContent=totalVerified()===20?'READY FOR FINAL REVIEW':'DRAFT WORKSPACE';
    const release=qs('#portfolio-lock-card');
    if(release){const count=totalVerified();release.classList.toggle('open',count===20);release.innerHTML=`<div class="portfolio-lock-icon">${count===20?'✓':'⌑'}</div><div class="portfolio-lock-main"><div class="eyebrow">${count===20?'RELEASE GATES PASSED':'PUBLICATION GATE'}</div><h2>${count===20?'All planned projects are verified. Review the final evidence before publishing.':'The public website and CV are in draft mode.'}</h2><p>${count===20?'Your project verification gates are complete. Review each claim and repository link, then decide when to publish.':'Finish the implementation, testing and evidence for each of the 20 projects. This space is being prepared now; public claims stay gated until the work is real.'}</p></div><div class="portfolio-lock-count">${count}<span style="color:#8796a6;font-size:12px"> / 20</span></div>`;}
  }

  function renderOverview(){
    const dateLine=qs('#today-label');if(dateLine)dateLine.textContent=today.toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).toUpperCase();
    const priorities=[
      {n:'01',title:'Confirm the Zonal Computing Olympiad pathway',sub:'ZCO-2027 date is not yet published; check the IARCS update and eligibility.',state:'CHECK NOW',urgent:true,view:'competitions'},
      {n:'02',title:'Close the Panini Linguistics Olympiad registration step',sub:'Round 1 registration closes on 31 October 2026 according to the official page.',state:state.eventState['plo-reg']?.done?'DONE':'31 OCT',urgent:!state.eventState['plo-reg']?.done,view:'competitions'},
      {n:'03',title:'Set the standardised-testing plan',sub:'SAT/ACT policies differ by target university; Fall 2028 is a working assumption.',state:'PLAN',view:'documents'},
      {n:'04',title:'Start Project 1 with a test-first specification',sub:'Tiny Distributed Job Queue · define job states, retry semantics, and deterministic fault schedules.',state:state.projectState[1]?.status==='Not started'?'NEXT':'IN PROGRESS',view:'projects'}
    ];
    qs('#priority-list').innerHTML=priorities.map((p,i)=>`<div class="priority-row"><div class="priority-n ${p.urgent?'hot':''}">${p.n}</div><div class="priority-text"><strong>${escapeHtml(p.title)}</strong><span>${escapeHtml(p.sub)}</span></div><span class="priority-state ${p.urgent?'urgent':''}">${escapeHtml(p.state)}</span><button class="priority-arrow" data-go="${p.view}" aria-label="Open ${p.view}">↗</button></div>`).join('');
    const timeline=events.filter(e=>e.date&&!state.eventState[e.id]?.done&&e.date>=todayISO).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
    qs('#timeline-list').innerHTML=timeline.length?timeline.map((e,i)=>`<div class="timeline-item"><div class="timeline-date">${e.date?new Date(`${e.date}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'TBA'}</div><div class="timeline-line"><div class="timeline-node ${e.priority==='high'?'amber':e.verified?'':'gray'}"></div></div><div class="timeline-copy"><strong>${escapeHtml(e.name)}</strong><span>${escapeHtml(e.type)}${e.verified?' · official date checked':' · confirm details'}</span></div></div>`).join(''):`<div class="timeline-empty">No open dated milestones. Review the TBA events for future updates.</div>`;
    qs('#track-overview').innerHTML=trackNames().map((t,i)=>{const ps=projects.filter(p=>p.track===t);const verified=ps.filter(projectVerified).length;const doing=ps.filter(p=>state.projectState[p.id]?.status==='In progress'||state.projectState[p.id]?.status==='Implemented').length;return `<div class="track-row"><div class="track-number">0${i+1}</div><div class="track-label"><strong>${escapeHtml(t)}</strong><span>${verified} verified · ${doing} in progress</span><div class="progress-track"><div class="progress-fill" style="width:${Math.round(verified/ps.length*100)}%"></div></div></div><div class="track-count">${ps.length} builds</div></div>`;}).join('');
    updateGlobalMetrics();
  }
  function trackNames(){return ['Core Systems & Low-Level Tooling','Discrete Mathematics & Algorithm Verification','ML Mechanics & Interpretability','Security Engineering & Infrastructure'];}

  let universityFilter='all';
  function renderUniversities(){
    const query=(qs('#university-search')?.value||'').toLowerCase();
    const regionEls={us:qs('#university-us')};
    for(const [reg,el] of Object.entries(regionEls))el.innerHTML='';
    universities.filter(u=>{
      const s=state.universityState[u.id];return (universityFilter==='all'||s.status===universityFilter)&&`${u.name} ${u.country} ${u.city} ${u.degree} ${u.snapshot}`.toLowerCase().includes(query);
    }).forEach(u=>{
      const s=state.universityState[u.id];const checked=s.checks.length;const pct=universityProgress(u);const card=document.createElement('article');card.className='uni-card';card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',`Open ${u.name} details`);
      card.innerHTML=`<div class="uni-card-head"><div class="uni-emblem">${escapeHtml(u.symbol)}</div><div class="uni-title-block"><h3>${escapeHtml(u.name)}</h3><p>${escapeHtml(u.city)}</p></div><span class="uni-status ${s.status==='Ready'?'ready':s.status==='Applied'?'applied':''}">${escapeHtml(s.status)}</span></div><p class="uni-summary">${escapeHtml(u.snapshot)}</p><div class="uni-pills"><span class="uni-pill">${escapeHtml(u.country)}</span><span class="uni-pill">${escapeHtml(u.route.split(' ')[0])}</span><span class="uni-pill">${u.tests.some(x=>/SAT|ACT/.test(x))?'Testing review':'Course review'}</span></div><div class="uni-card-foot"><span class="uni-progress-label"><span class="uni-progress-mini"><span style="width:${pct}%"></span></span>${checked}/${u.documents.length} requirements checked</span><span class="uni-open">Open →</span></div>`;
      card.addEventListener('click',()=>openUniversity(u.id));card.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();openUniversity(u.id);}});regionEls[u.region].append(card);
    });
    for(const [reg,el] of Object.entries(regionEls)){const head=el.previousElementSibling;const has=el.children.length>0;if(head){head.classList.toggle('hidden-row',!has);el.classList.toggle('hidden-row',!has);}}
  }
  function universitySourceDossierHtml(id){
    const dossier=window.ApexAdmissionsSourceDossiers?.[id];
    if(!dossier)return '';
    const fields=dossier.fields||{};
    const rows=[['exams','Entrance exams & English tests'],['documents','Documents'],['funding','Scholarships & financial aid'],['costs','Cost notes'],['deadlines','Deadlines'],['risks','Risks & caveats']];
    const body=rows.map(([key,label])=>`<tr><th scope="row">${escapeHtml(label)}</th><td>${renderResearchMarkdown(fields[key]||'Not separately specified in the supplied source. Verify the official page for the exact programme and 2028 entry cycle.')}</td></tr>`).join('');
    const sources=(dossier.officialSources||[]).map(src=>`<li><a href="${escapeHtml(src.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(src.title)} ↗</a></li>`).join('');
    const checks=(dossier.verificationChecklist||[]).map(item=>`<li>${escapeHtml(item)}</li>`).join('');
    return `<div class="drawer-section source-admissions-dossier"><div class="panel-head"><div><div class="eyebrow">SUPPLIED RESEARCH / FALL 2028</div><h3>Admissions dossier table</h3></div><span class="corner-mark">SOURCE</span></div><p class="source-archive-caption">This table transcribes the supplied Markdown dossier; it is not a claim that every rule has been verified for Fall 2028. Exact-cycle official pages take precedence. Prior-cycle dates, estimates and uncertain claims remain labelled as such.</p><div class="uni-dossier-table-wrap"><table class="uni-dossier-table source-admissions-table"><thead><tr><th>Topic</th><th>Supplied dossier summary</th></tr></thead><tbody>${body}</tbody></table></div><details class="source-admissions-details"><summary>Official source register (${(dossier.officialSources||[]).length} links)</summary><ul class="source-assembly-list">${sources||'<li>No official links were extracted for this institution.</li>'}</ul></details><details class="source-admissions-details"><summary>Fall 2028 verification checklist (${(dossier.verificationChecklist||[]).length} items)</summary><ul class="source-assembly-list">${checks||'<li>Recheck all rules on the official 2028-entry pages.</li>'}</ul></details><details class="source-admissions-details"><summary>Full university excerpt from the supplied Markdown</summary><div class="source-markdown-excerpt">${renderResearchMarkdown(dossier.summaryMarkdown||'')}</div></details></div>`;
  }

  function universityDossierComparisonHtml(id,u){
    const approved=state.aiState?.dossiers?.[id]?.sections||{};
    const proposal=state.aiState?.proposals?.[id];
    const items=proposal?.items||[];
    const source=window.ApexAdmissionsSourceDossiers?.[id]?.fields||{};
    const baseline={overview:u.snapshot,fit:'Prioritize STEM, Computer Science, Electrical Engineering, Artificial Intelligence and Machine Learning.',programme:u.degree||'Not specified in the current profile',language:'Only consider programmes taught in English that do not require fluency in another language. Verify the official programme and admission rules; if unclear, flag it as unresolved.',admissions:u.route,scholarships:source.funding||'Not yet recorded in the supplied source dossier',exams:source.exams||((u.tests||[]).join('\n')||'Not yet recorded'),documents:source.documents||((u.documents||[]).join('\n')||'Not yet recorded'),costs:source.costs||'Not separately recorded in the supplied source dossier',deadlines:source.deadlines||'Not yet confirmed for the target intake',portals:(window.ApexAdmissionsSourceDossiers?.[id]?.officialSources||[]).map(x=>`${x.title}: ${x.url}`).join('\n')||u.official||'Not recorded',visa:'See official immigration source register and verify rules for the applicant’s nationality and target year.',accommodation:'Confirm housing availability, cost and scholarship coverage on official university pages.',open_questions:source.risks||u.note||'Confirm programme-specific requirements and target-cycle rules'};
    const sections=[['overview','Overview'],['fit','STEM / CS / EE / AI-ML fit'],['programme','Programme'],['language','English-medium & language eligibility'],['admissions','Admissions'],['scholarships','Scholarships & funding'],['exams','Exams & language'],['documents','Documents'],['costs','Costs'],['deadlines','Deadlines'],['portals','Official portals'],['visa','Visa'],['accommodation','Accommodation'],['open_questions','Open questions']];
    const rows=sections.map(([key,label])=>{
      const current=approved[key]?.content||baseline[key]||'Not recorded';
      const index=items.findIndex(item=>item.section===key);
      const item=index>=0?items[index]:null;
      const proposed=item?.content||'No proposed change yet. Run research and prepare updates to compare this section.';
      const action=item?`<div class="uni-dossier-actions"><button class="button button-primary button-small" data-uni-proposal-approve="${index}">Approve</button><button class="button button-quiet button-small" data-uni-proposal-reject="${index}">Reject</button></div>`:'<span class="ai-muted">—</span>';
      return `<tr class="${item?'has-proposal-change':''}"><th scope="row">${escapeHtml(label)}${approved[key]?'<span class="uni-approved-tag">Approved</span>':''}${item?'<span class="uni-proposed-tag">Proposed change</span>':''}</th><td>${escapeHtml(current)}</td><td>${escapeHtml(proposed)}${item?.reason?`<div class="uni-proposal-reason"><strong>Why proposed:</strong> ${escapeHtml(item.reason)}</div>`:''}${item?.sources?.length?`<div class="ai-approved-sources">${item.sources.map(src=>`<a href="${escapeHtml(src.url)}" target="_blank" rel="noopener">${escapeHtml(src.title||src.url)} ↗</a>`).join('')}</div>`:''}</td><td>${action}</td></tr>`;
    }).join('');
    return `<div class="drawer-section"><h3>University dossier comparison</h3><p class="ai-muted">Your baseline / previously approved value is compared with the latest AI proposal. Approving a row rewrites only that section; rejecting removes only that proposal. Research reports and your personal notes remain unchanged.</p><div class="uni-dossier-table-wrap"><table class="uni-dossier-table"><thead><tr><th>Section</th><th>Current value</th><th>Proposed value</th><th>Decision</th></tr></thead><tbody>${rows}</tbody></table></div>${!items.length?`<div class="ai-job-status">${state.aiState?.reports?.[id]?'Research exists, but no comparison proposals are ready yet. Open AI Research Lab and choose “Prepare proposed updates”.':'No research report yet. Research this university to prepare a comparison.'}</div>`:''}</div>`;
  }
  function openUniversity(id){const u=universities.find(x=>x.id===id);if(!u)return;const s=state.universityState[id];const items=u.documents;
    const modal=document.createElement('div');modal.className='modal-backdrop';modal.innerHTML=`<aside class="drawer" role="dialog" aria-modal="true" aria-label="${escapeHtml(u.name)} details"><div class="drawer-head"><div class="uni-emblem">${escapeHtml(u.symbol)}</div><div class="drawer-head-copy"><div class="eyebrow">${escapeHtml(u.country.toUpperCase())} / UNIVERSITY PROFILE</div><h2>${escapeHtml(u.name)}</h2><p>${escapeHtml(u.city)} · ${escapeHtml(u.route)}</p></div><button class="drawer-close" data-close>×</button></div><div class="detail-grid"><div class="detail-tile"><span>Working intake</span><strong>${escapeHtml(state.targetCycle||cycleAssumption)}</strong></div><div class="detail-tile"><span>Your status</span><select class="text-field" id="uni-status-select">${['Not started','Researching','Ready','Applied','Decision received'].map(x=>`<option ${s.status===x?'selected':''}>${x}</option>`).join('')}</select></div></div><div class="drawer-section"><h3>Requirement snapshot</h3><p>${escapeHtml(u.snapshot)}</p><div class="source-callout"><span>!</span><div><strong>Cycle-aware note:</strong> ${escapeHtml(u.note)}<br><span>${escapeHtml(u.snapshotDate)}</span></div></div></div><div class="drawer-section"><h3>Testing to check</h3><div class="detail-checklist">${u.tests.map((t,i)=>`<div class="detail-check-row"><span style="color:var(--amber)">◈</span><label>${escapeHtml(t)}</label></div>`).join('')}</div></div><div class="drawer-section"><h3>University-specific checklist</h3><div class="detail-checklist" id="uni-check-list">${items.map((item,i)=>`<div class="detail-check-row"><input type="checkbox" data-uni-check="${i}" ${s.checks.includes(i)?'checked':''}><label>${escapeHtml(item)}</label></div>`).join('')}</div></div><div class="drawer-section"><h3>Application strategy</h3><p>${escapeHtml(u.focus)}</p></div><div class="drawer-section"><label class="field-label" for="uni-notes">Your notes / questions</label><textarea class="text-area" id="uni-notes" rows="4" placeholder="Course URL, qualification questions, deadlines, financial aid…">${escapeHtml(s.notes)}</textarea></div><div class="drawer-section"><h3>Official pages</h3><div class="official-links"><a class="official-link" href="${escapeHtml(u.official)}" target="_blank" rel="noopener"><span>↗</span> Official admissions / course page</a><a class="official-link" href="${escapeHtml(u.requirements)}" target="_blank" rel="noopener"><span>↗</span> Requirements / testing / international guidance</a></div></div><div class="drawer-section"><h3>Approved AI-maintained dossier</h3>${state.aiState?.dossiers?.[id]?.sections&&Object.keys(state.aiState.dossiers[id].sections).length?`<div class="ai-approved-dossier">${Object.entries(state.aiState.dossiers[id].sections).map(([key,item])=>`<section><strong>${escapeHtml(item.title||key)}</strong><p>${escapeHtml(item.content||'')}</p>${item.sources?.length?`<div class="ai-approved-sources">${item.sources.map(src=>`<a href="${escapeHtml(src.url)}" target="_blank" rel="noopener">${escapeHtml(src.title||src.url)} ↗</a>`).join('')}</div>`:''}</section>`).join('')}<div class="ai-approved-meta">Last approved ${escapeHtml(state.aiState.dossiers[id].updatedAt?new Date(state.aiState.dossiers[id].updatedAt).toLocaleString():'unknown')} · Only user-approved sections are stored here.</div></div>`:'<p class="ai-muted">No approved AI updates yet. Research first, review proposed changes, then approve the sections you want saved.</p>'}</div>${universitySourceDossierHtml(id)}${universityDossierComparisonHtml(id,u)}<div class="drawer-section"><h3>AI research dossier</h3><p>Run a source-grounded audit to build out scholarships, costs, exams, documents, deadlines, application portals and unresolved questions. Results are saved with the workspace.</p><div class="ai-mini-report">${state.aiState?.reports?.[id]?`<strong>${escapeHtml(state.aiState.reports[id].status||'Research saved')}</strong><p>${escapeHtml((state.aiState.reports[id].summary||state.aiState.reports[id].text||'').slice(0,420))}${(state.aiState.reports[id].summary||state.aiState.reports[id].text||'').length>420?'…':''}</p>`:'<span class="ai-muted">No AI dossier has been researched yet.</span>'}</div><button class="button button-primary" data-ai-research="${escapeHtml(id)}">Research this university ↗</button></div><div class="drawer-actions"><button class="button button-primary" id="save-uni">Save university notes</button><button class="button button-quiet" data-go="documents">Open master checklist ↗</button></div></aside>`;
    qs('#modal-root').append(modal);
    modal.addEventListener('click',ev=>{if(ev.target===modal||ev.target.closest('[data-close]'))modal.remove();});
    qs('#uni-status-select',modal).addEventListener('change',ev=>{state.universityState[id].status=ev.target.value;saveState('University status updated');renderUniversities();});
    qsa('[data-uni-check]',modal).forEach(inp=>inp.addEventListener('change',()=>{const idx=Number(inp.dataset.uniCheck);const checks=state.universityState[id].checks;if(inp.checked&&!checks.includes(idx))checks.push(idx);if(!inp.checked)state.universityState[id].checks=checks.filter(n=>n!==idx);saveState('Requirement checklist updated');renderUniversities();}));
    qs('#save-uni',modal).addEventListener('click',()=>{state.universityState[id].notes=qs('#uni-notes',modal).value;saveState('University notes saved');renderUniversities();});
    qsa('[data-go]',modal).forEach(btn=>btn.addEventListener('click',()=>{modal.remove();navigate(btn.dataset.go);}));
    qsa('[data-uni-proposal-approve]',modal).forEach(btn=>btn.addEventListener('click',()=>{const proposal=state.aiState?.proposals?.[id];const idx=Number(btn.dataset.uniProposalApprove);if(!proposal?.items?.[idx])return;proposal.items.forEach((item,i)=>item.selected=i===idx);applyApprovedDossierUpdates(id);modal.remove();openUniversity(id);}));
    qsa('[data-uni-proposal-reject]',modal).forEach(btn=>btn.addEventListener('click',()=>{const proposal=state.aiState?.proposals?.[id];const idx=Number(btn.dataset.uniProposalReject);if(!proposal?.items?.[idx])return;if(!confirm(`Reject the proposed ${proposal.items[idx].title||proposal.items[idx].section} update? No dossier content will be changed.`))return;proposal.items.splice(idx,1);proposal.items.forEach(item=>item.selected=true);saveState('University dossier proposal rejected');modal.remove();openUniversity(id);}));
    qsa('[data-ai-research]',modal).forEach(btn=>btn.addEventListener('click',()=>{modal.remove();navigate('ai-lab');qs('#ai-research-university').value=id;runUniversityResearch(id);}));
  }
  qs('#university-filters').addEventListener('click',ev=>{const b=ev.target.closest('[data-filter]');if(!b)return;universityFilter=b.dataset.filter;qsa('#university-filters .filter-tab').forEach(x=>x.classList.toggle('active',x===b));renderUniversities();});
  qs('#university-search').addEventListener('input',renderUniversities);

  let competitionFilter='all', showSourceNotes=false;
  function renderCompetitions(){
    const query=(qs('#competition-search').value||'').toLowerCase();
    if(competitionFilter==='Ongoing'){
      const filteredOngoing=ongoing.filter(x=>`${x.name} ${x.sub}`.toLowerCase().includes(query));
      qs('#event-timeline').innerHTML=filteredOngoing.length?`<div class="event-month-heading">ONGOING PRACTICE AREAS</div>`+filteredOngoing.map(x=>`<article class="event-card"><div class="event-date-box"><strong>${escapeHtml(x.icon)}</strong><span>ONGOING</span></div><div class="event-content"><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.sub)}. Choose a task, keep the work reproducible, and save your best attempts or rating history as evidence.</p><div class="event-tags"><span class="event-tag verified">${escapeHtml(x.frequency||'Practice throughout the year')}</span><span class="event-tag">Official platform</span></div></div><div class="event-action"><a class="official-link" href="${escapeHtml(x.url)}" target="_blank" rel="noopener">Open ↗</a></div></article>`).join(''):'<div class="empty-state">No ongoing practice areas match this search.</div>';
      qs('#season-stats').innerHTML=[['Ongoing platforms',ongoing.length],['Tracked dated milestones',events.length],['Practice log',Object.values(state.academyState).filter(Boolean).length+' resources']].map(([k,v])=>`<div class="season-stat"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join('');
      qs('#ongoing-links').innerHTML=filteredOngoing.map(x=>`<a class="ongoing-link" href="${x.url}" target="_blank" rel="noopener"><span>${x.icon}</span><div><strong>${escapeHtml(x.name)}</strong><em>${escapeHtml(x.sub)} · ${escapeHtml(x.frequency||'Ongoing')}</em></div></a>`).join('');
      return;
    }
    let filtered=events.filter(e=>{
      const status=state.eventState[e.id]?.done?'Done':e.type;
      const matchesFilter=competitionFilter==='all'||(competitionFilter==='Upcoming'&&e.date&&e.date>=todayISO&&!state.eventState[e.id]?.done)||competitionFilter==='Ongoing'&&ongoing.some(x=>x.id===e.id)||status===competitionFilter;
      return matchesFilter&&`${e.name} ${e.description} ${e.source} ${e.topics.join(' ')}`.toLowerCase().includes(query);
    });
    const ongoingFilter=competitionFilter==='all'||competitionFilter==='Ongoing';
    // Dated milestones are sorted chronologically; TBA items remain in a dedicated section near the beginning.
    const dated=filtered.filter(e=>e.date).sort((a,b)=>a.date.localeCompare(b.date));const tba=filtered.filter(e=>!e.date);
    const buckets=new Map();for(const e of dated){const d=dateOnly(e.date);const k=d.toLocaleDateString('en-US',{month:'long',year:'numeric'});if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(e);}
    let html='';
    if(tba.length){html+=`<div class="event-month-heading">DATE TO BE ANNOUNCED</div>`+tba.map(renderEventCard).join('');}
    if(dated.length){for(const [month,list] of buckets.entries()){html+=`<div class="event-month-heading">${escapeHtml(month.toUpperCase())}</div>`+list.map(renderEventCard).join('');}}
    if(!html)html='<div class="empty-state">No milestones match this filter. Try “All milestones” or clear your search.</div>';
    qs('#event-timeline').innerHTML=html;
    qs('#season-stats').innerHTML=[['All listed milestones',events.length],['Officially checked',events.filter(e=>e.verified).length],['Dates still to verify',events.filter(e=>!e.verified||e.type==='TBA').length],['Marked complete',events.filter(e=>state.eventState[e.id]?.done).length]].map(([k,v])=>`<div class="season-stat"><span>${escapeHtml(k)}</span><strong>${v}</strong></div>`).join('');
    qs('#ongoing-links').innerHTML=ongoing.filter(x=>ongoingFilter||competitionFilter==='Ongoing').map(x=>`<a class="ongoing-link" href="${x.url}" target="_blank" rel="noopener"><span>${x.icon}</span><div><strong>${escapeHtml(x.name)}</strong><em>${escapeHtml(x.sub)} · ${escapeHtml(x.frequency||'Ongoing')}</em></div></a>`).join('');
    qsa('[data-event-toggle]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.eventToggle;state.eventState[id].done=!state.eventState[id].done;saveState(state.eventState[id].done?'Milestone marked complete':'Milestone reopened');renderCompetitions();renderOverview();}));
    qsa('[data-event-detail]').forEach(b=>b.addEventListener('click',()=>openEvent(b.dataset.eventDetail)));
  }
  function renderEventCard(e){
    const done=state.eventState[e.id]?.done;const d=e.date?dateOnly(e.date):null;const month=d?d.toLocaleDateString('en-US',{month:'short'}).toUpperCase():'TBA';const day=d?d.toLocaleDateString('en-US',{day:'2-digit'}):'—';
    const current=e.date&&e.date<todayISO&&!done;const typeTag=e.verified?'<span class="event-tag verified">Official page checked</span>':'<span class="event-tag raw">Confirm date / details</span>';
    const sourceTag=showSourceNotes?`<span class="event-tag">${escapeHtml(e.source)}</span>`:'';
    return `<article class="event-card"><div class="event-date-box"><strong>${day}</strong><span>${month}</span></div><div class="event-content"><h3>${escapeHtml(e.name)}</h3><p>${escapeHtml(e.description)}</p><div class="event-tags"><span class="event-tag">${escapeHtml(e.type)}</span>${typeTag}${sourceTag}${e.topics.slice(0,2).map(t=>`<span class="event-tag">${escapeHtml(t)}</span>`).join('')}</div></div><div class="event-action"><button data-event-detail="${e.id}">Details ↗</button><button class="${done?'checked':''}" data-event-toggle="${e.id}">${done?'✓ Done':current?'Reopen?':'Mark done'}</button></div></article>`;
  }
  function openEvent(id){const e=events.find(x=>x.id===id);if(!e)return;const s=state.eventState[id];const modal=document.createElement('div');modal.className='modal-backdrop modal-center';modal.innerHTML=`<div class="drawer" role="dialog" aria-modal="true" aria-label="Event details"><div class="drawer-head"><div class="drawer-head-copy"><div class="eyebrow">COMPETITION / EXAM MILESTONE / ${escapeHtml(e.type.toUpperCase())}</div><h2>${escapeHtml(e.name)}</h2><p>${escapeHtml(e.dateLabel||'Date to be announced')}</p></div><button class="drawer-close" data-close>×</button></div><div class="drawer-section"><h3>What matters</h3><p>${escapeHtml(e.description)}</p></div><div class="drawer-section"><h3>Source status</h3><div class="source-callout"><span>${e.verified?'✓':'!'}</span><div><strong>${e.verified?'Official page checked':'Needs confirmation'}</strong><br>${escapeHtml(e.source)}</div></div></div>${e.url?`<div class="drawer-section"><h3>Official organiser link</h3><a class="official-link" href="${escapeHtml(e.url)}" target="_blank" rel="noopener">Open organiser page ↗</a></div>`:''}<div class="drawer-section"><label class="field-label" for="event-notes">Your notes</label><textarea class="text-area" id="event-notes" rows="4" placeholder="Registration status, team members, eligibility, task breakdown…">${escapeHtml(s.notes)}</textarea></div><div class="drawer-actions"><button class="button button-primary" id="save-event-notes">Save notes</button><button class="button button-quiet" id="toggle-event-done">${s.done?'Mark incomplete':'Mark complete'}</button></div></div>`;qs('#modal-root').append(modal);modal.addEventListener('click',ev=>{if(ev.target===modal||ev.target.closest('[data-close]'))modal.remove();});qs('#save-event-notes',modal).addEventListener('click',()=>{state.eventState[id].notes=qs('#event-notes',modal).value;saveState('Event notes saved');});qs('#toggle-event-done',modal).addEventListener('click',()=>{state.eventState[id].done=!state.eventState[id].done;saveState('Milestone status updated');modal.remove();renderCompetitions();renderOverview();});
  }
  qs('#competition-filters').addEventListener('click',ev=>{const b=ev.target.closest('[data-filter]');if(!b)return;competitionFilter=b.dataset.filter;qsa('#competition-filters .filter-tab').forEach(x=>x.classList.toggle('active',x===b));renderCompetitions();});
  qs('#competition-search').addEventListener('input',renderCompetitions);
  qs('#toggle-source-notes').addEventListener('click',()=>{showSourceNotes=!showSourceNotes;qs('#toggle-source-notes').textContent=showSourceNotes?'Hide source notes':'Show source notes';renderCompetitions();});

  let docFilter='all';
  function renderDocuments(){
    const query=(qs('#doc-search').value||'').toLowerCase();let all=documentGroups.flatMap(g=>g.items);const done=all.filter(i=>state.docState[i.id]?.status==='done').length;const doing=all.filter(i=>state.docState[i.id]?.status==='doing').length;const todo=all.length-done-doing;
    qs('#documents-summary').innerHTML=[['COMPLETE',done,'Items ready'],['IN PROGRESS',doing,'Being prepared'],['TO DO',todo,'Still need attention'],['TOTAL ASSETS',all.length,'Across 6 groups']].map(([k,v,s])=>`<div class="doc-summary-tile"><span>${k}</span><strong>${v}</strong><p>${s}</p></div>`).join('');
    qs('#doc-mini-progress').innerHTML=documentGroups.map(g=>{const n=g.items.filter(i=>state.docState[i.id]?.status==='done').length;const pct=Math.round(n/g.items.length*100);return `<div class="doc-mini-row"><span>${escapeHtml(g.name.replace(/^\d+ \/ /,''))}</span><strong>${n}/${g.items.length}</strong><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;}).join('');
    qs('#document-groups').innerHTML=documentGroups.map(g=>{const items=g.items.filter(i=>{const s=state.docState[i.id].status;return (docFilter==='all'||docFilter===s)&&`${i.title} ${i.desc} ${g.name}`.toLowerCase().includes(query);});if(!items.length)return '';const groupDone=g.items.filter(i=>state.docState[i.id]?.status==='done').length;return `<section class="document-group"><div class="document-group-head"><div><h3>${escapeHtml(g.name)}</h3><span>${escapeHtml(g.desc)}</span></div><span>${groupDone}/${g.items.length} complete</span></div>${items.map(i=>{const s=state.docState[i.id].status;return `<div class="document-row"><button class="doc-check ${s==='done'?'checked':''}" data-doc-toggle="${i.id}" aria-label="Toggle ${escapeHtml(i.title)}">${s==='done'?'✓':''}</button><div class="doc-content"><strong>${escapeHtml(i.title)}</strong><p>${escapeHtml(i.desc)}</p></div><select class="project-status-select" data-doc-status="${i.id}" aria-label="Status for ${escapeHtml(i.title)}"><option value="todo" ${s==='todo'?'selected':''}>To do</option><option value="doing" ${s==='doing'?'selected':''}>In progress</option><option value="done" ${s==='done'?'selected':''}>Complete</option></select></div>`;}).join('')}</section>`;}).join('')||'<div class="empty-state">No checklist items match this filter.</div>';
    qsa('[data-doc-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.docToggle;state.docState[id].status=state.docState[id].status==='done'?'todo':'done';saveState('Document checklist updated');renderDocuments();renderOverview();}));
    qsa('[data-doc-status]').forEach(sel=>sel.addEventListener('change',()=>{state.docState[sel.dataset.docStatus].status=sel.value;saveState('Document status updated');renderDocuments();renderOverview();}));
  }
  qs('#doc-filters').addEventListener('click',ev=>{const b=ev.target.closest('[data-filter]');if(!b)return;docFilter=b.dataset.filter;qsa('#doc-filters .filter-tab').forEach(x=>x.classList.toggle('active',x===b));renderDocuments();});
  qs('#doc-search').addEventListener('input',renderDocuments);
  qs('#reset-doc-filters').addEventListener('click',()=>{docFilter='all';qs('#doc-search').value='';qsa('#doc-filters .filter-tab').forEach(x=>x.classList.toggle('active',x.dataset.filter==='all'));renderDocuments();});
  qs('#export-doc-progress').addEventListener('click',()=>downloadFile('apex-os-document-checklist.csv',documentCSV(),'text/csv'));
  function documentCSV(){const rows=[['Group','Item','Status','Notes']];documentGroups.forEach(g=>g.items.forEach(i=>rows.push([g.name,i.title,state.docState[i.id].status,state.docState[i.id].notes||''])));return rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');}

  let projectFilter='all';
  function renderProjects(){
    const query=(qs('#project-search').value||'').toLowerCase();
    qs('#project-track-list').innerHTML=trackNames().map((track,idx)=>{const list=projects.filter(p=>p.track===track).filter(p=>{const s=state.projectState[p.id].status;return (projectFilter==='all'||projectFilter===s)&&`${p.name} ${p.description} ${p.track} ${p.tags.join(' ')} ${p.portfolioValue} ${p.depends}`.toLowerCase().includes(query);});if(!list.length)return '';const done=list.filter(projectVerified).length;return `<section class="project-track-block"><div class="project-track-header"><div class="track-marker">0${idx+1}</div><div><h3>${escapeHtml(track)}</h3><p>${escapeHtml(trackIntro(track))}</p></div><span class="track-header-count">${done}/${projects.filter(p=>p.track===track).length} verified</span></div>${list.map(p=>{const s=state.projectState[p.id];const status=s.status;const pDone=projectVerified(p);return `<article class="project-card"><div class="project-index">P${String(p.id).padStart(2,'0')}</div><div class="project-main"><div class="project-name-row"><h4>${escapeHtml(p.name)}</h4><span class="status-dot-label ${statusDotClass(status)}">${escapeHtml(status)}</span></div><div class="project-tags"><span class="project-tag">${escapeHtml(p.lang)}</span><span class="project-tag">${escapeHtml(p.track.split(' & ')[0])}</span>${p.tags.slice(0,2).map(t=>`<span class="project-tag">#${escapeHtml(t)}</span>`).join('')}</div><p class="project-desc">${escapeHtml(p.description)}</p><div class="project-target"><strong>Invariant:</strong> ${escapeHtml(p.invariant)}</div></div><div class="project-side"><select class="project-status-select" data-project-status="${p.id}" aria-label="Status for project ${p.id}">${['Not started','In progress','Implemented','Verified','Published'].map(x=>`<option value="${x}" ${status===x?'selected':''}>${x}</option>`).join('')}</select><button class="project-open-button" data-project-open="${p.id}">Open specification ↗</button></div></article>`;}).join('')}</section>`;}).join('')||'<div class="empty-state">No projects match this filter.</div>';
    qsa('[data-project-open]').forEach(b=>b.addEventListener('click',()=>openProject(Number(b.dataset.projectOpen))));
    qsa('[data-project-status]').forEach(sel=>sel.addEventListener('change',()=>changeProjectStatus(Number(sel.dataset.projectStatus),sel.value)));
    updateGlobalMetrics();
  }
  function trackIntro(track){return ({'Core Systems & Low-Level Tooling':'Concurrency, defensive C, runtime execution, storage internals and reproducible build tooling.','Discrete Mathematics & Algorithm Verification':'Graph certificates, empirical complexity, counterexample search and independent algorithm oracles.','ML Mechanics & Interpretability':'First-principles training, controlled shift evaluation, evidence-linked retrieval and model probes.','Security Engineering & Infrastructure':'Local application-security tests, incident replay, schema evolution, environment integrity and civic-data storage.'})[track]||'';}
  function changeProjectStatus(id,status){const p=projects.find(x=>x.id===id),s=state.projectState[id];if(!p||!s)return;if(['Verified','Published'].includes(status)&&(!s.gates.every(Boolean)||s.evidence.trim().length<12)){toast('Verification blocked: complete all four gates and add a meaningful evidence note first.',true);renderProjects();openProject(id);return;}if(status==='Published'&&(!s.sourceUrl.trim()||!s.resultsUrl.trim())){toast('Publication status requires real source and reproducible-results links.',true);renderProjects();openProject(id);return;}s.status=status;saveState(`Project ${String(id).padStart(2,'0')} status updated`);renderProjects();renderOverview();renderPortfolio();}
  function renderSourceProjectDetails(id){
    const item=window.APEX_SOURCE_PROJECT_DETAILS?.[String(id)];
    if(!item)return '';
    const steps=(item.assemblySteps||[]).map(step=>`<li>${escapeHtml(step)}</li>`).join('');
    return `<div class="drawer-section source-archive-section"><div class="eyebrow">SUPPLEMENTARY REFERENCE</div><h3>From the final source archive</h3><p class="source-archive-caption">This is a structured view of the supplied reference. The original file remains available in the Reference Library; current project names and order follow the newer 20-project plan.</p><div class="detail-tile source-detail-tile"><span>Source title</span><strong>${escapeHtml(item.sourceTitle||'Project source notes')}</strong></div><div class="source-detail-grid"><div><h4>Suggested repository layout</h4><pre class="source-code-block">${escapeHtml(item.directory||'Not specified in source archive')}</pre></div><div><h4>Source invariant</h4><p>${escapeHtml(item.invariant||'No source invariant recorded.')}</p><h4>Source data flow</h4><p>${escapeHtml(item.blueprint||'Not specified in source archive')}</p></div></div><h4>Assembly sequence from source</h4><ol class="source-assembly-list">${steps||'<li>No steps extracted.</li>'}</ol><div class="source-target-note"><strong>${escapeHtml(item.sourceTargetLabel||'Archive target — not a measured result')}</strong><p>${escapeHtml(item.verificationTarget||'No source verification target recorded.')}</p></div>${item.crossCheckNote?`<div class="source-crosscheck-note"><strong>Engineering cross-check</strong><p>${escapeHtml(item.crossCheckNote)}</p></div>`:''}</div>`;
  }

  function openProject(id){const p=projects.find(x=>x.id===id);if(!p)return;const s=state.projectState[id];const gates=[['Smoke test','One-command smoke check builds/runs a small fixture with a clean exit.','Document the exact command and result.'],['Relevant sanitizers / diagnostics','Run applicable memory, thread, undefined-behaviour, static-analysis or domain checks. Some gates may not apply to every language/project; explain your choice.','Do not claim “no defects” just because one tool is clean.'],['Differential / reference tests','Compare core behaviour to an independent simple oracle or trusted expected fixtures.','Store the fixtures and test method.'],['Honest RESULTS.md','Record environment, commands, outputs, limitations, complexity and known failure cases.','Use actual measurements; do not copy target metrics from the blueprint.']];
    const modal=document.createElement('div');modal.className='modal-backdrop';modal.innerHTML=`<aside class="drawer" role="dialog" aria-modal="true" aria-label="Project ${id} specification"><div class="drawer-head"><div class="track-marker">P${String(id).padStart(2,'0')}</div><div class="drawer-head-copy"><div class="eyebrow">${escapeHtml(p.track.toUpperCase())} / PROJECT ${String(id).padStart(2,'0')}</div><h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(p.lang)} · ${escapeHtml(p.depends)}</p></div><button class="drawer-close" data-close>×</button></div><div class="drawer-section"><h3>Blueprint from your source plan</h3><p>${escapeHtml(p.description)} ${escapeHtml(p.target)}</p><div class="detail-tile" style="margin-top:10px"><span>Data flow</span><strong>${escapeHtml(p.blueprint)}</strong></div></div><div class="drawer-section"><h3>Core invariant</h3><p>${escapeHtml(p.invariant)}</p></div><div class="drawer-section"><h3>Portfolio relevance</h3><p>${escapeHtml(p.portfolioValue)}</p></div><div class="drawer-section"><h3>Verification target (not a claim of completion)</h3><p>${escapeHtml(p.verification)}</p><p style="margin-top:7px;color:#7f91a5">Suggested tools: ${escapeHtml(p.tests)}</p></div>${renderSourceProjectDetails(id)}<div class="drawer-section"><h3>Release quality gates</h3><div class="gate-checklist">${gates.map((g,i)=>`<label class="gate-row"><input type="checkbox" data-gate="${i}" ${s.gates[i]?'checked':''}><span><strong>${g[0]}</strong><p>${g[1]}</p><p>${g[2]}</p></span></label>`).join('')}</div><div class="gate-note">To mark a project Verified, all gates above must be checked and the evidence note must contain meaningful details. “Published” additionally requires source and reproducible-results links. The app cannot inspect the repository for you.</div></div><div class="drawer-section"><label class="field-label" for="project-evidence">Evidence summary (what actually ran / passed / failed)</label><textarea class="text-area" id="project-evidence" rows="4" placeholder="Commands, environment, test cases, results, limits, failures fixed…">${escapeHtml(s.evidence)}</textarea><label class="field-label" for="project-notes">Engineering notes / next step</label><textarea class="text-area" id="project-notes" rows="3" placeholder="Decisions, open questions, design changes…">${escapeHtml(s.notes)}</textarea><label class="field-label" for="project-source-url">Source repository URL (only when it exists)</label><input id="project-source-url" class="text-field" type="url" placeholder="https://github.com/…" value="${escapeHtml(s.sourceUrl)}"><label class="field-label" for="project-results-url">Reproducible results URL (only when it exists)</label><input id="project-results-url" class="text-field" type="url" placeholder="https://…/RESULTS.md" value="${escapeHtml(s.resultsUrl)}"></div><div class="drawer-actions"><button class="button button-primary" id="save-project">Save project log</button><button class="button button-quiet" id="mark-implemented">Mark implemented</button></div></aside>`;qs('#modal-root').append(modal);
    modal.addEventListener('click',ev=>{if(ev.target===modal||ev.target.closest('[data-close]'))modal.remove();});
    qs('#save-project',modal).addEventListener('click',()=>{const st=state.projectState[id];st.gates=qsa('[data-gate]',modal).map(x=>x.checked);st.evidence=qs('#project-evidence',modal).value;st.notes=qs('#project-notes',modal).value;st.sourceUrl=qs('#project-source-url',modal).value.trim();st.resultsUrl=qs('#project-results-url',modal).value.trim();if(['Verified','Published'].includes(st.status)&&(!st.gates.every(Boolean)||st.evidence.trim().length<12)){st.status='Implemented';toast('Saved. Status returned to Implemented because verification evidence is incomplete.',true);}else if(st.status==='Published'&&(!st.sourceUrl||!st.resultsUrl)){st.status='Verified';toast('Saved. Status returned to Verified until both public links exist.',true);}else toast('Project evidence saved locally');saveState(null);renderProjects();renderOverview();renderPortfolio();modal.remove();});
    qs('#mark-implemented',modal).addEventListener('click',()=>{state.projectState[id].status='Implemented';saveState(`Project ${id} marked implemented`);renderProjects();renderOverview();modal.remove();});
  }
  qs('#project-filters').addEventListener('click',ev=>{const b=ev.target.closest('[data-filter]');if(!b)return;projectFilter=b.dataset.filter;qsa('#project-filters .filter-tab').forEach(x=>x.classList.toggle('active',x===b));renderProjects();});
  qs('#project-search').addEventListener('input',renderProjects);
  qs('#project-export').addEventListener('click',()=>downloadFile('apex-os-project-log.csv',projectCSV(),'text/csv'));
  function projectCSV(){const rows=[['Project ID','Project','Track','Language','Status','Gates Passed','Description','Implementation Target','Data Flow','Core Invariant','Verification Target','Portfolio Relevance','Evidence','Notes','Source URL','Results URL']];projects.forEach(p=>{const s=state.projectState[p.id];rows.push([p.id,p.name,p.track,p.lang,s.status,s.gates.filter(Boolean).length,p.description,p.target,p.blueprint,p.invariant,p.verification,p.portfolioValue,s.evidence,s.notes,s.sourceUrl,s.resultsUrl]);});return rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');}
  qs('#show-project-standards').addEventListener('click',()=>openStandards());
  function openStandards(){const modal=document.createElement('div');modal.className='modal-backdrop modal-center';modal.innerHTML=`<div class="drawer" role="dialog" aria-modal="true"><div class="drawer-head"><div class="drawer-head-copy"><div class="eyebrow">RELEASE STANDARD</div><h2>Four quality gates</h2><p>These gates make your portfolio reproducible and credible.</p></div><button class="drawer-close" data-close>×</button></div><div class="drawer-section"><div class="gate-checklist">${[['1. Smoke command','A fresh checkout builds and runs a small fixture with a single documented command and a clean exit.'],['2. Appropriate diagnostics','Use relevant sanitizers, static checks, race detectors or memory tools; explain when a tool does not apply.'],['3. Independent reference','Compare core outputs with an oracle, fixtures or an independent implementation.'],['4. Honest results log','Record exact commands, hardware/software environment, actual results, complexity, limitations and remaining failures.']].map(g=>`<div class="gate-row"><span class="gate-ico">✓</span><span><strong>${g[0]}</strong><p>${g[1]}</p></span></div>`).join('')}</div><div class="source-callout"><span>!</span><div><strong>Metrics in the source blueprint are target test specifications.</strong> A proposed dataset size, test count or performance target becomes a result only after you implement the test and record that it ran.</div></div></div><div class="drawer-actions"><button class="button button-primary" data-close>Understood</button></div></div>`;qs('#modal-root').append(modal);modal.addEventListener('click',ev=>{if(ev.target===modal||ev.target.closest('[data-close]'))modal.remove();});}

  let academyFilter='all';
  function renderAcademy(){const items=academyPaths.filter(p=>academyFilter==='all'||p.id===academyFilter);qs('#academy-grid').innerHTML=items.map(p=>`<article class="academy-card"><div class="academy-card-head"><div class="academy-icon">${p.icon}</div><div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.projects)} · ${escapeHtml(p.track)}</p></div></div><p class="academy-purpose">${escapeHtml(p.purpose)}</p><div class="resource-list">${p.resources.map(r=>`<div class="resource-row"><button class="resource-check ${state.academyState[r.id]?'checked':''}" data-resource-toggle="${r.id}" aria-label="Mark ${escapeHtml(r.title)} completed">${state.academyState[r.id]?'✓':''}</button><div class="resource-info"><strong>${escapeHtml(r.title)}</strong><small>${escapeHtml(r.sub)}</small></div><a class="resource-link" href="${escapeHtml(r.url)}" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(r.title)}">↗</a></div>`).join('')}</div><div class="academy-tip"><strong>Practice note:</strong> ${escapeHtml(p.tip)}</div></article>`).join('');qsa('[data-resource-toggle]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.resourceToggle;state.academyState[id]=!state.academyState[id];saveState('Learning log updated');renderAcademy();}));}
  qs('#academy-filters').addEventListener('click',ev=>{const b=ev.target.closest('[data-filter]');if(!b)return;academyFilter=b.dataset.filter;qsa('#academy-filters .filter-tab').forEach(x=>x.classList.toggle('active',x===b));renderAcademy();});

  function renderPortfolio(){
    qs('#site-map').innerHTML=[['01','Hero / profile','Short, factual introduction and current direction.'],['02','Projects matrix','Filterable project cards with invariant, data flow, tests and evidence.'],['03','Verification records','Reproducible results, limitations and source links.'],['04','Archive','Foundational modules, learning notes and smaller exercises.'],['05','CV / contact','A searchable one-page CV plus real links and contact route.']].map(r=>`<div class="site-map-row"><div class="site-map-num">${r[0]}</div><div><strong>${r[1]}</strong><small>${r[2]}</small></div></div>`).join('');
    qs('#repo-plan').innerHTML=[['portfolio-master-registry','Master profile, project index, personal site, CV draft and evidence links'],['tiny-distributed-job-queue','Project 1 · systems/concurrency flagship'],['core-systems-toolkit','Projects 2–5 · SafeText, VM, PageStore and ReproBuild toolchain'],['algorithm-verification-lab','Projects 6–10 · graph proofs, benchmarks and counterexample testing'],['ml-mechanics-lab','Projects 11–15 · training, shift checks, retrieval and interpretability'],['security-infrastructure-lab','Projects 16–20 · AppSec, incident replay, lineage, environment and CivicLedger'],['sandbox','Small experiments and disposable fixtures']].map((r,i)=>`<div class="repo-plan-row"><div class="repo-icon">${i===6?'▣':'⌘'}</div><div class="repo-plan-copy"><strong>${escapeHtml(r[0])}</strong><small>${escapeHtml(r[1])}</small></div><em>${i===0?'REGISTRY':i===6?'SANDBOX':'PROPOSED'}</em></div>`).join('');
    updateCvPreview();
  }
  function updateCvPreview(){const p=state.profile;const cv=qs('#cv-preview');if(!cv)return;const verified=projects.filter(projectVerified);cv.innerHTML=`<div class="cv-preview-note">DRAFT PREVIEW · GENERATED FROM SAVED WORKSPACE DATA</div><h2>${escapeHtml(p.name||'Your Name')}</h2><p><strong>${escapeHtml(p.headline||'Student engineer · Focus areas to be defined')}</strong></p>${p.links?`<p>${escapeHtml(p.links)}</p>`:''}<p>${escapeHtml(p.summary||'Add a factual summary of what you have learned, built and tested. This draft does not claim any project has been completed unless its verification gates and evidence have been recorded.')}</p><h3>Verified engineering projects (${verified.length})</h3><div class="cv-project-list">${verified.length?verified.map(pr=>`<div class="cv-project-item"><strong>${escapeHtml(pr.name)} — ${escapeHtml(pr.lang)}</strong><p>${escapeHtml(pr.invariant)}</p><p>${escapeHtml(state.projectState[pr.id].evidence.slice(0,250))}</p></div>`).join(''):'<p>No projects are currently eligible for the verified-project section. This is expected at the start; do not insert planned work as experience.</p>'}</div><h3>Additional sections</h3><p>Education, actual competitions/awards, skills you can demonstrate, and real links should be added only after you have the accurate details.</p>`;}
  ['profile-name','profile-headline','profile-links','profile-summary'].forEach(id=>{const key=id.replace('profile-','');qs('#'+id).value=state.profile[key]||'';qs('#'+id).addEventListener('input',()=>{state.profile[key]=qs('#'+id).value;updateCvPreview();});});
  qs('#save-profile').addEventListener('click',()=>{state.profile={name:qs('#profile-name').value,headline:qs('#profile-headline').value,links:qs('#profile-links').value,summary:qs('#profile-summary').value};saveState('CV draft profile saved');updateCvPreview();});
  qs('#refresh-cv').addEventListener('click',()=>{state.profile={name:qs('#profile-name').value,headline:qs('#profile-headline').value,links:qs('#profile-links').value,summary:qs('#profile-summary').value};updateCvPreview();toast('CV preview refreshed from verified workspace data');});

  function renderLibrary(){qs('#library-grid').innerHTML=sourceLibrary.map((x,i)=>`<article class="library-card"><div class="library-file-icon">${x.type==='TXT'?'¶':'▤'}</div><div class="library-card-main"><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.subtitle)}</p><p>${escapeHtml(x.note)}</p><div class="library-card-foot"><a href="${escapeHtml(x.file)}" target="_blank" rel="noopener">Open source file ↗</a><span>${x.type} · included with app</span></div></div></article>`).join('');}

  const aiUniversityById = id => universities.find(u=>u.id===id);
  function aiSafeContext(){
    const reports=state.aiState?.reports||{};
    return {
      targetCycle:state.targetCycle||cycleAssumption,
      applicationTarget:state.applicationTarget||TARGET_DATE_DEFAULT,
      universities:universities.map(u=>({id:u.id,name:u.name,country:u.country,city:u.city,degree:u.degree||'Computer Science / related programme to confirm',route:u.route,official:u.official,requirements:u.requirements,snapshot:u.snapshot,tests:u.tests,documents:u.documents,notes:state.universityState[u.id]?.notes||'',status:state.universityState[u.id]?.status||'Not started',savedResearch:reports[u.id]?.summary||reports[u.id]?.text||null})),
      competitions:events.map(e=>({name:e.name,date:e.date||null,type:e.type,verified:!!e.verified,notes:e.notes||''})).slice(0,80),
      projects:projects.map(p=>({name:p.name,track:p.track,status:state.projectState[p.id]?.status||'Not started',description:p.description||p.summary||''})).slice(0,24),
      workspaceNotes:state.workspaceNotes||''
    };
  }
  function renderAIChat(){
    const root=qs('#ai-chat-messages');if(!root)return;
    const msgs=state.aiState?.messages||[];
    root.innerHTML=msgs.length?msgs.slice(-30).map((m,i)=>`<article class="ai-message ${m.role==='user'?'user':'assistant'}"><div class="ai-message-label">${m.role==='user'?'YOU':'APEX · OPENROUTER'}${m.createdAt?` · ${escapeHtml(new Date(m.createdAt).toLocaleString())}`:''}</div><div class="ai-message-text">${escapeHtml(m.text||'')}</div>${m.sources?.length?`<div class="ai-source-list"><strong>Sources</strong>${m.sources.map(src=>`<a href="${escapeHtml(src.url)}" target="_blank" rel="noopener">${escapeHtml(src.title||src.url)} ↗</a>`).join('')}</div>`:''}</article>`).join(''):'<div class="ai-empty"><strong>What are we working on?</strong><p>Ask about your shortlist, scholarships, exams, competitions or projects. For current facts, ask Apex to research and cite sources.</p></div>';
    root.scrollTop=root.scrollHeight;
  }
  function renderAIReport(id){
    const report=id?(state.aiState?.reports||{})[id]:null;
    const title=qs('#ai-report-title'),status=qs('#ai-report-status'),content=qs('#ai-report-content');if(!title||!status||!content)return;
    if(!report){title.textContent='No research report yet';status.textContent='EVIDENCE PENDING';content.innerHTML='<div class="empty-state">Choose a university above and run a research job. Results and source links will appear here.</div>';return;}
    const u=aiUniversityById(id);title.textContent=`${u?.short||u?.name||id} · ${report.scopeLabel||'Research dossier'}`;status.textContent=String(report.status||'Research complete').toUpperCase();
    const proposal=state.aiState?.proposals?.[id];
    const proposalHtml=proposal?.items?.length?`<section class="ai-approval-box"><div class="panel-head"><div><div class="eyebrow">HUMAN APPROVAL REQUIRED</div><h3>Proposed dossier rewrites</h3></div><span class="corner-mark">${proposal.items.length} ITEMS</span></div><p class="settings-copy">Review each proposed replacement. Only checked sections will be saved to this university's approved AI-maintained dossier. The original research report and previous approved values remain available in history.</p><div class="ai-proposal-list">${proposal.items.map((item,i)=>`<label class="ai-proposal-item"><input type="checkbox" data-ai-proposal-check="${i}" ${item.selected!==false?'checked':''}><span class="ai-proposal-body"><strong>${escapeHtml(item.title||item.section)}</strong><span class="ai-proposal-section">${escapeHtml(item.section)} · ${escapeHtml(item.confidence||'Needs review')}</span><span class="ai-proposal-content">${escapeHtml(item.content||'')}</span>${item.sources?.length?`<span class="ai-proposal-sources">${item.sources.map(src=>`<a href="${escapeHtml(src.url)}" target="_blank" rel="noopener">${escapeHtml(src.title||src.url)} ↗</a>`).join('')}</span>`:''}<span class="ai-proposal-reason">${escapeHtml(item.reason||'')}</span></span></label>`).join('')}</div><div class="ai-approval-actions"><button class="button button-primary" id="ai-apply-approved">Approve checked & rewrite dossier</button><button class="button button-quiet" id="ai-reject-proposals">Reject proposals</button></div><div class="ai-job-status">Generated ${escapeHtml(proposal.createdAt?new Date(proposal.createdAt).toLocaleString():'recently')}. Nothing has been changed until you approve.</div></section>`:'';
    content.innerHTML=`<div class="ai-report-meta">Last researched ${escapeHtml(report.createdAt?new Date(report.createdAt).toLocaleString():'unknown')} · ${report.sources?.length||0} source links · ${report.status==='Needs review'?'Review needed':'Review all claims before acting'}</div><div class="ai-report-text ai-report-markdown">${renderResearchMarkdown(report.text||report.summary||'No report text returned.')}</div>${report.sources?.length?`<div class="ai-report-sources"><h3>Source links returned by OpenRouter</h3>${report.sources.map((src,i)=>`<a class="official-link" href="${escapeHtml(src.url)}" target="_blank" rel="noopener"><span>${i+1} ↗</span><span>${escapeHtml(src.title||src.url)}</span></a>`).join('')}</div>`:'<div class="ai-safety-note"><strong>No source URLs returned by OpenRouter</strong><p>This response should not be treated as source-verified. Re-run the job or verify the claims manually.</p></div>'}<div class="ai-approval-actions"><button class="button button-primary" id="ai-prepare-proposals">${proposal?'Regenerate proposed updates':'Prepare proposed updates'} ↗</button><span class="ai-muted">AI will draft changes; approval is required before writing.</span></div>${proposalHtml}`;
    qs('#ai-prepare-proposals',content)?.addEventListener('click',()=>prepareDossierProposals(id));
    qs('#ai-reject-proposals',content)?.addEventListener('click',()=>{if(!confirm('Reject and discard these proposed updates? No dossier changes will be made.'))return;delete state.aiState.proposals[id];saveState('AI proposals rejected');renderAIReport(id);});
    qsa('[data-ai-proposal-check]',content).forEach(input=>input.addEventListener('change',()=>{const items=state.aiState.proposals?.[id]?.items;if(items?.[Number(input.dataset.aiProposalCheck)])items[Number(input.dataset.aiProposalCheck)].selected=input.checked;saveState('Proposal selection saved');}));
    qs('#ai-apply-approved',content)?.addEventListener('click',()=>applyApprovedDossierUpdates(id));
  }
  function renderAILab(){
    const select=qs('#ai-research-university');if(select){const selected=select.value;select.innerHTML='<option value="">Choose a university…</option>'+universities.map(u=>`<option value="${u.id}">${escapeHtml(u.name)} · ${escapeHtml(u.country)}</option>`).join('');if(selected)select.value=selected;}
    const sync=window.ApexSync?.getStatus?.();const label=qs('#ai-connection-label');if(label)label.textContent=sync?.kind==='connected'?'Private workspace connected · OpenRouter runs server-side':'Waiting for private workspace pairing';
    renderAIChat();const last=state.aiState?.lastResearchId;renderAIReport(last||null);
    const status=qs('#ai-research-status');if(status&&last&&state.aiState?.reports?.[last])status.textContent=`Saved report: ${aiUniversityById(last)?.name||last}. You can reopen it from the university dossier.`;
  }
  async function sendAIChat(ev){
    ev?.preventDefault();const input=qs('#ai-chat-input');const text=input?.value?.trim();if(!text)return;
    if(!window.ApexSync?.callFunction){toast('Secure AI gateway is not available in this build.',true);return;}
    state.aiState=state.aiState||{messages:[],reports:{},lastResearchId:null};state.aiState.messages.push({role:'user',text,createdAt:new Date().toISOString()});input.value='';saveState('Question saved');renderAIChat();
    const button=qs('#ai-send');if(button){button.disabled=true;button.textContent='Thinking…';}
    try{
      const useContext=!!qs('#ai-use-context')?.checked;
      const response=await window.ApexSync.callFunction('apex-os-ai',{action:'chat',prompt:text,useContext,context:useContext?aiSafeContext():null});
      state.aiState.messages.push({role:'assistant',text:response.text||'The AI gateway returned no text.',sources:response.sources||[],createdAt:new Date().toISOString()});saveState('Apex response saved');renderAIChat();
    }catch(err){const detail=err.message||'Unknown error';const rate=/rate limit|tokens per minute|429|quota/i.test(detail);const advice=rate?' OpenRouter or its selected free model may be rate-limiting this request. Wait and retry; free-model availability varies.':' Confirm the apex-os-ai function is deployed and OPENROUTER_API_KEY is configured.';state.aiState.messages.push({role:'assistant',text:`AI request failed: ${detail}.${rate?'':' Your question remains saved locally;'}${advice}`,createdAt:new Date().toISOString()});saveState('AI error saved');renderAIChat();toast(rate?'OpenRouter rate limit reached. Wait and retry.':'Apex request failed. See the assistant message for next steps.',true);}
    finally{if(button){button.disabled=false;button.textContent='Ask Apex ↗';}}
  }
  async function runUniversityResearch(id){
    const u=aiUniversityById(id||qs('#ai-research-university')?.value);if(!u){toast('Choose a university first.',true);return;}
    const scope=qs('#ai-research-scope')?.value||'full';const labels={full:'Full dossier audit',scholarships:'Scholarships and full funding',admissions:'Admissions, exams and documents',deadlines:'Deadlines and application timeline'};
    const status=qs('#ai-research-status');if(status)status.textContent=`Researching ${u.name}. This may take a little while.`;
    const button=qs('#ai-run-research');if(button){button.disabled=true;button.textContent='Researching…';}
    try{
      const response=await window.ApexSync.callFunction('apex-os-ai',{action:'research',webSearch:true,universityId:u.id,scope,scopeLabel:labels[scope]||labels.full,targetCycle:state.targetCycle||cycleAssumption,context:aiSafeContext()});
      const report={universityId:u.id,scope,scopeLabel:labels[scope]||labels.full,text:response.text||'',summary:response.summary||'',sources:response.sources||[],status:response.needsReview?'Needs review':'Research complete · review claims',createdAt:new Date().toISOString(),jobId:response.jobId||null};
      state.aiState=state.aiState||{messages:[],reports:{},lastResearchId:null};state.aiState.reports=state.aiState.reports||{};state.aiState.reports[u.id]=report;state.aiState.lastResearchId=u.id;
      // Preserve report and source provenance in the workspace. Research never marks requirements complete automatically.
      saveState(`Research report saved for ${u.short||u.name}`);renderAIReport(u.id);if(status)status.textContent=`Research finished for ${u.name}. Preparing a section-by-section comparison…`;renderUniversities();await prepareDossierProposals(u.id,{silent:true});renderAIReport(u.id);renderUniversities();if(status)status.textContent=`Research finished for ${u.name}. ${report.sources.length} source links returned. Review the proposed comparison in the Universities tab and approve or reject each row.`;toast(state.aiState?.proposals?.[u.id]?.items?.length?'Research complete; comparison proposals are ready for review.':'Research report saved; comparison proposals could not be generated, so you can retry from AI Research Lab.');
    }catch(err){const detail=err.message||'Unknown error';const rate=/rate limit|tokens per minute|429|quota/i.test(detail);if(status)status.textContent=`Research failed: ${detail}.${rate?' OpenRouter or its selected free model may be rate-limiting this request; wait and retry.':' Confirm the apex-os-ai function is deployed and OPENROUTER_API_KEY is configured.'}`;toast(rate?'OpenRouter rate limit reached. Wait and retry.':'Research request failed.',true);}
    finally{if(button){button.disabled=false;button.textContent='Research and reconcile ↗';}}
  }
  async function prepareDossierProposals(id,options={}){
    const silent=!!options.silent;
    const report=state.aiState?.reports?.[id];const u=aiUniversityById(id);if(!report||!u){toast('Run research for this university first.',true);return;}
    const btn=qs('#ai-prepare-proposals');if(btn){btn.disabled=true;btn.textContent='Preparing proposals…';}
    try{
      const response=await window.ApexSync.callFunction('apex-os-ai',{action:'propose_updates',webSearch:false,universityId:id,targetCycle:state.targetCycle||cycleAssumption,context:aiSafeContext(),reportText:report.text||report.summary||'',sources:report.sources||[]});
      let parsed;try{const raw=String(response.text||'').replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');parsed=JSON.parse(raw);}catch{throw new Error('OpenRouter did not return valid structured proposals. Regenerate and retry.');}
      const allowed=new Set(['overview','fit','programme','language','admissions','scholarships','exams','documents','costs','deadlines','portals','visa','accommodation','open_questions']);
      const items=(Array.isArray(parsed.items)?parsed.items:[]).filter(x=>x&&allowed.has(String(x.section))&&typeof x.content==='string'&&x.content.trim()).map(x=>({section:String(x.section),title:String(x.title||x.section),content:String(x.content).slice(0,10000),reason:String(x.reason||'').slice(0,1200),confidence:String(x.confidence||'Needs review'),sources:Array.isArray(x.sources)?x.sources.filter(src=>src&&typeof src.url==='string'&&/^https?:\/\//i.test(src.url)).slice(0,8).map(src=>({url:src.url,title:String(src.title||src.url)})):[],selected:true}));
      if(!items.length)throw new Error('No safe, structured updates were proposed. Review the report manually.');
      state.aiState.proposals=state.aiState.proposals||{};state.aiState.proposals[id]={items,createdAt:new Date().toISOString(),reportJobId:report.jobId||null};saveState('Proposed dossier updates saved');renderAIReport(id);renderUniversities();if(!silent)toast(`${items.length} proposed sections ready for your review.`);
    }catch(err){if(!silent)toast(`Could not prepare updates: ${err.message||'Unknown error'}`,true);else console.warn('Could not prepare university comparison',err);}
    finally{const fresh=qs('#ai-prepare-proposals');if(fresh){fresh.disabled=false;fresh.textContent='Regenerate proposed updates ↗';}}
  }
  function applyApprovedDossierUpdates(id){
    const proposal=state.aiState?.proposals?.[id];if(!proposal?.items?.length)return;
    const selected=proposal.items.filter(item=>item.selected!==false);if(!selected.length){toast('Select at least one proposed section to approve.',true);return;}
    const u=aiUniversityById(id);const names=selected.map(x=>x.title).join(', ');
    if(!confirm(`Approve and save ${selected.length} dossier section(s) for ${u?.name||id}?\n\n${names}\n\nThis replaces only these sections in the AI-maintained dossier. Your original university notes and source research report will remain unchanged.`))return;
    state.aiState.dossiers=state.aiState.dossiers||{};const previous=state.aiState.dossiers[id]||{sections:{},history:[]};
    const history=[...(previous.history||[]),{approvedAt:new Date().toISOString(),sections:selected.map(item=>({section:item.section,title:item.title,previous:previous.sections?.[item.section]||null,next:{title:item.title,content:item.content,sources:item.sources||[],confidence:item.confidence,reason:item.reason}}))}].slice(-30);
    const sections={...(previous.sections||{})};for(const item of selected){sections[item.section]={title:item.title,content:item.content,sources:item.sources||[],confidence:item.confidence,reason:item.reason,approvedAt:new Date().toISOString()};}
    state.aiState.dossiers[id]={sections,history,updatedAt:new Date().toISOString()};
    state.aiState.proposals[id].items=proposal.items.filter(item=>item.selected===false);state.aiState.proposals[id].appliedAt=new Date().toISOString();
    saveState(`Approved AI dossier updates for ${u?.short||u?.name||id}`);renderAIReport(id);renderUniversities();toast(`Approved ${selected.length} section(s). The university dossier has been rewritten.`);
  }

  qs('#ai-chat-form')?.addEventListener('submit',sendAIChat);
  qs('#ai-clear-chat')?.addEventListener('click',()=>{if(!confirm('Clear the saved Apex AI chat history? This does not delete research dossiers.'))return;state.aiState=state.aiState||{messages:[],reports:{},lastResearchId:null};state.aiState.messages=[];saveState('AI chat cleared');renderAIChat();});
  qs('#ai-run-research')?.addEventListener('click',()=>runUniversityResearch());
  qs('#ai-research-university')?.addEventListener('change',ev=>{const id=ev.target.value;if(id&&state.aiState?.reports?.[id]){state.aiState.lastResearchId=id;renderAIReport(id);}});

  function renderSettings(){qs('#target-cycle').value=state.targetCycle||cycleAssumption;qs('#application-target').value=state.applicationTarget||TARGET_DATE_DEFAULT;qs('#workspace-notes').value=state.workspaceNotes||'';const sync=window.ApexSync?.getStatus?.();if(sync){const label=qs('#sync-status-label');const detail=qs('#sync-status-copy');const top=qs('#sync-top-status');if(label){label.textContent=sync.label;label.dataset.state=sync.kind;}if(detail)detail.textContent=sync.detail;if(top){top.textContent=sync.label;top.dataset.state=sync.kind;}}}
  qs('#save-settings').addEventListener('click',()=>{state.targetCycle=qs('#target-cycle').value;state.applicationTarget=qs('#application-target').value||TARGET_DATE_DEFAULT;state.workspaceNotes=qs('#workspace-notes').value;saveState('Workspace assumptions saved');renderUniversities();renderOverview();renderPortfolio();});
  qs('#export-pairing').addEventListener('click',()=>{try{window.ApexSync.exportPairingFile();toast('Private device-pairing file exported. Keep it confidential.');}catch(e){toast(e.message||'Pairing export failed.',true);}});
  qs('#import-pairing').addEventListener('change',async ev=>{const file=ev.target.files?.[0];if(!file)return;try{await window.ApexSync.importPairingFile(file);renderAll();toast('This device is paired. Automatic sync is enabled.');}catch(e){toast(e.message||'Could not import the pairing file.',true);}finally{ev.target.value='';}});
  qs('#retry-sync').addEventListener('click',async()=>{const b=qs('#retry-sync');b.disabled=true;try{await window.ApexSync.retry();}finally{b.disabled=false;renderSettings();}});
  qs('#export-backup').addEventListener('click',()=>{downloadFile('apex-os-backup-'+todayISO+'.json',JSON.stringify({...state,exportedAt:new Date().toISOString(),product:'Apex OS'},null,2),'application/json');qs('#backup-meta').textContent=`Exported on ${new Date().toLocaleString()}. Keep a copy somewhere private.`;});
  qs('#import-backup').addEventListener('change',async ev=>{const file=ev.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!parsed||typeof parsed!=='object'||!parsed.projectState||!parsed.docState)throw new Error('This does not look like an Apex OS workspace backup.');const base=defaultState();state=restoreState(parsed);saveState('Workspace backup imported');renderAll();qs('#backup-meta').textContent=`Imported ${file.name} successfully.`;}catch(e){toast(e.message||'Could not read backup file.',true);}finally{ev.target.value='';}});
  qs('#reset-workspace').addEventListener('click',()=>{if(!confirm('Reset all Apex OS progress in this browser? This removes all notes, checks and project evidence. Export a backup first if you might need it.'))return;state=defaultState();saveState('Workspace reset. You can start fresh.');renderAll();});
  function downloadFile(name,content,type){if(window.ApexAndroid&&typeof window.ApexAndroid.saveTextFile==='function'){window.ApexAndroid.saveTextFile(name,String(content),type);return;}const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),800);}

  const viewNames={overview:'OVERVIEW',universities:'UNIVERSITIES',competitions:'COMPETITIONS & EXAMS',documents:'DOCUMENTS',projects:'PROJECTS',academy:'LEARNING ACADEMY',portfolio:'PORTFOLIO & CV',library:'REFERENCE LIBRARY','ai-lab':'AI RESEARCH LAB',settings:'SETTINGS & BACKUPS'};
  function navigate(view){const node=qs('#view-'+view);if(!node)return;qsa('.view').forEach(v=>v.classList.remove('active'));node.classList.add('active');qsa('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));qs('#crumb-current').textContent=viewNames[view]||view.toUpperCase();qs('#sidebar').classList.remove('open');qs('#nav-backdrop')?.classList.remove('visible');if(view==='universities')renderUniversities();if(view==='competitions')renderCompetitions();if(view==='documents')renderDocuments();if(view==='projects')renderProjects();if(view==='academy')renderAcademy();if(view==='portfolio')renderPortfolio();if(view==='library')renderLibrary();if(view==='ai-lab')renderAILab();if(view==='settings')renderSettings();window.scrollTo({top:0,behavior:'smooth'});}
  qsa('[data-view]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.view)));
  qsa('[data-go]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.go)));
  function setNavOpen(open){qs('#sidebar').classList.toggle('open',open);qs('#nav-backdrop')?.classList.toggle('visible',open);qs('#mobile-menu')?.setAttribute('aria-expanded',String(open));}
  qs('#mobile-menu').addEventListener('click',()=>setNavOpen(!qs('#sidebar').classList.contains('open')));
  qs('#sidebar-close')?.addEventListener('click',()=>setNavOpen(false));
  qs('#nav-backdrop')?.addEventListener('click',()=>setNavOpen(false));
  qs('#quick-add').addEventListener('click',()=>{const modal=document.createElement('div');modal.className='modal-backdrop modal-center';modal.innerHTML=`<div class="drawer" role="dialog" aria-modal="true"><div class="drawer-head"><div class="drawer-head-copy"><div class="eyebrow">QUICK ACTIONS</div><h2>Choose the next workspace</h2><p>Jump to a planning or execution area.</p></div><button class="drawer-close" data-close>×</button></div><div class="quick-menu"><button data-quick-go="projects">Open project tracker<small>Implementation, gates and evidence logs</small></button><button data-quick-go="competitions">Check competition or exam<small>Combined chronological tracker and official links</small></button><button data-quick-go="documents">Update document checklist<small>School records, recommendations, financial documents and writing</small></button><button data-quick-go="universities">Review university requirements<small>Official links, notes and checklist per university</small></button><button data-quick-go="academy">Open learning resources<small>Curated free tutorials mapped to projects</small></button></div></div>`;qs('#modal-root').append(modal);modal.addEventListener('click',ev=>{if(ev.target===modal||ev.target.closest('[data-close]'))modal.remove();const b=ev.target.closest('[data-quick-go]');if(b){modal.remove();navigate(b.dataset.quickGo);}});});

  const search=qs('#global-search'),searchResults=qs('#search-results');
  function renderSearchResults(){const q=search.value.trim().toLowerCase();if(!q){searchResults.classList.add('hidden');searchResults.innerHTML='';return;}const res=[];
    universities.forEach(u=>{if(`${u.name} ${u.country} ${u.degree} ${u.snapshot}`.toLowerCase().includes(q))res.push({title:u.name,sub:`University · ${u.country}`,view:'universities',action:()=>openUniversity(u.id)});});
    projects.forEach(p=>{if(`${p.name} ${p.description} ${p.target} ${p.invariant} ${p.portfolioValue} ${p.track} ${p.tags.join(' ')}`.toLowerCase().includes(q))res.push({title:p.name,sub:`Project ${String(p.id).padStart(2,'0')} · ${p.track}`,view:'projects',action:()=>openProject(p.id)});});
    events.forEach(e=>{if(`${e.name} ${e.description} ${e.source}`.toLowerCase().includes(q))res.push({title:e.name,sub:`Competition · ${e.dateLabel||'Date TBA'}`,view:'competitions',action:()=>openEvent(e.id)});});
    documentGroups.forEach(g=>g.items.forEach(i=>{if(`${i.title} ${i.desc} ${g.name}`.toLowerCase().includes(q))res.push({title:i.title,sub:`Checklist · ${g.name.replace(/^\d+ \/ /,'')}`,view:'documents',action:()=>{qs('#doc-search').value=q;renderDocuments();}});}));
    academyPaths.forEach(p=>p.resources.forEach(r=>{if(`${r.title} ${r.sub} ${p.title}`.toLowerCase().includes(q))res.push({title:r.title,sub:`Learning resource · ${p.title}`,view:'academy',action:()=>{academyFilter='all';renderAcademy();}});}));
    searchResults.innerHTML=(res.slice(0,8).map((r,i)=>`<button class="search-result" data-search-result="${i}">${escapeHtml(r.title)}<small>${escapeHtml(r.sub)}</small></button>`).join(''))||'<div class="no-results">No matching records.</div>';searchResults.classList.remove('hidden');qsa('[data-search-result]',searchResults).forEach(btn=>btn.addEventListener('click',()=>{const r=res[Number(btn.dataset.searchResult)];searchResults.classList.add('hidden');search.value='';navigate(r.view);setTimeout(()=>r.action(),50);}));
  }
  search.addEventListener('input',renderSearchResults);document.addEventListener('click',ev=>{if(!ev.target.closest('.global-search-wrap'))searchResults.classList.add('hidden');});document.addEventListener('keydown',ev=>{if((ev.metaKey||ev.ctrlKey)&&ev.key.toLowerCase()==='k'){ev.preventDefault();search.focus();search.select();}if(ev.key==='Escape'){qsa('.modal-backdrop').forEach(m=>m.remove());searchResults.classList.add('hidden');qs('#sidebar')?.classList.remove('open');qs('#nav-backdrop')?.classList.remove('visible');}});

  function renderAll(){renderOverview();renderUniversities();renderCompetitions();renderDocuments();renderProjects();renderAcademy();renderPortfolio();renderLibrary();renderAILab();renderSettings();updateGlobalMetrics();}
  renderAll();
  initializeSavedLabel();
  if(window.ApexSync){window.ApexSync.start({getState:()=>state,getDefaultState:()=>defaultState(),hasLocalEdits:()=>{try{const raw=localStorage.getItem(STORE_KEY);return !!raw&&JSON.stringify(JSON.parse(raw))!==JSON.stringify(defaultState());}catch{return false;}},applyState:next=>{state=restoreState(next);try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch{}renderAll();}});}
})();
