# Paidia Consulting site content, v2 (24 Oct 2026, after the design review). Edit here, then run build.py.
ZINC_SVG = '''<svg role="img" aria-label="ZINC RE" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 878.6 202.3" fill="#1d1d1b"><path d="M0 202.3v-2.6L91.3 47.4C96.1 35.7 113 3.9 91 .6h49.9l-120 201.7H0zm121.1-.9H110c-7 0-15.2-.1-24.7 0 56-3.7 60.8-34.4 66.6-48.3L141 201.5c.2 0-6.4-.1-19.9-.1zM12.8 0s6.6.1 20.1.1h11c7 0 15.3.1 24.7 0C12.6 3.8 7.8 34.5 2 48.4L12.8 0z"/><path d="M254.5 201.8c13.9-5.7 22.6-13.2 26.3-69.8 3.4 56.3 12.5 64.1 26.3 69.8h-52.6zM255.3.3h52.6c-13.9 5.8-22.8 10.3-26.3 67-3.7-56-12.5-61.2-26.3-67z"/><path d="M430.5 201.8c13.9-5.7 22.6-13.2 26.3-69.8 3.4 56.3 12.5 64.1 26.3 69.8h-52.6zm176.1-.8L453.8 15.8C445.6 6 437.7 2.9 423.5 0H466l143.2 174.1V201h-2.6zM569.3.3h52.6c-13.9 5.8-22.8 10.3-26.3 67-3.7-56-12.5-61.2-26.3-67z"/><path d="M740.9 165.1a102.1 102.1 0 0 1-20.4-62.1c0-22.3 7.1-44 20.1-62 13-17.9 31.3-31.2 52.4-38-29.7 15.5-49.8 55.8-49.8 98.9 0 43.8 20.7 84.8 51.2 99.7-21.4-5.9-40.2-18.8-53.5-36.5zM878.6 151v39.4c-12.9 4.9-24.5 9.5-38.1 10.6 15.7-7.5 29.1-27.6 38.1-50zM840.5.7c13.6 1.1 25.2 5.7 38.1 10.6v39.3c-9-22.3-22.4-42.4-38.1-49.9z"/></svg>'''

LOGOS = f'''<section class="logos" aria-labelledby="logos-cap"><div class="wrap">
  <p class="logos-cap" id="logos-cap">Some of the organisations we work with</p>
  <div class="track"><div class="trow">
    <img src="assets/clients/fcdo-ink.webp" alt="Foreign, Commonwealth and Development Office">
    <img src="assets/clients/nhs.png" alt="NHS">
    <img src="assets/clients/gosh-ink.webp" alt="Great Ormond Street Hospital Charity">
    <img src="assets/clients/homes-england-ink.webp" alt="Homes England">
    <span class="tmark tmark-wg"><span>Llywodraeth Cymru</span><span>Welsh Government</span></span>
    <img src="assets/clients/pearson-ink.webp" alt="Pearson">
    <img src="assets/clients/awin-ink.webp" alt="Awin">
    <img src="assets/clients/rimes.webp" alt="Rimes">
    <img src="assets/clients/merton.png" alt="London Borough of Merton">
    <span class="tmark tmark-psc">The PSC</span>
    <img src="assets/clients/keele-ink.webp" alt="Keele University">
    {ZINC_SVG}
    <img class="dup" aria-hidden="true" src="assets/clients/fcdo-ink.webp" alt="">
    <img class="dup" aria-hidden="true" src="assets/clients/nhs.png" alt="">
    <img class="dup" aria-hidden="true" src="assets/clients/gosh-ink.webp" alt="">
    <img class="dup" aria-hidden="true" src="assets/clients/homes-england-ink.webp" alt="">
    <span aria-hidden="true" class="dup tmark tmark-wg"><span>Llywodraeth Cymru</span><span>Welsh Government</span></span>
    <img class="dup" aria-hidden="true" src="assets/clients/pearson-ink.webp" alt="">
    <img class="dup" aria-hidden="true" src="assets/clients/awin-ink.webp" alt="">
    <img class="dup" aria-hidden="true" src="assets/clients/rimes.webp" alt="">
    <img class="dup" aria-hidden="true" src="assets/clients/merton.png" alt="">
    <span aria-hidden="true" class="dup tmark tmark-psc">The PSC</span>
    <img class="dup" aria-hidden="true" src="assets/clients/keele-ink.webp" alt="">
    <span class="dup" aria-hidden="true">{ZINC_SVG}</span>
  </div></div>
</div></section>'''

Q = {
 "grove": ("Paidia's coaching has been unique in helping us actually understand and use AI. David's experience as both a lecturer and an AI expert is the perfect blend: <mark>this isn't change management, it's EQ and IQ</mark>.", "Richard Grove", "CTO, Great Ormond Street Hospital Charity"),
 "grove_full": ("Paidia's coaching has been unique in helping us actually understand and use AI. David's experience as both a lecturer and an AI expert is the perfect blend. <mark>This isn't change management, it's EQ and IQ</mark>, giving people the confidence to try things and feel comfortable with AI, so the whole organisation gets the best from it.", "Richard Grove", "CTO, Great Ormond Street Hospital Charity"),
 "chu": ("David combines deep AI expertise with a rare ability to make the future feel practical. He <mark>moves effortlessly between board-level strategy and the technical detail</mark> of how things actually get built. His workshops and materials helped us understand not just what AI could do, but what it could change: in our processes, our platform strategy and the way we work.", "Michelle Chu", "Principal, Programme Management, Pearson"),
 "roberts": ("I brought Paidia Consulting in to get my team, a small senior team at a real estate investment firm, genuinely capable with AI, not just curious about it. Over four days they did exactly that. The training was practical, well-paced, and pitched perfectly for people who needed to apply this to real work the next morning. The team came away noticeably more confident and we're already using what they taught us. <mark>We've asked them back.</mark>", "Gary Roberts", "CEO, real estate asset management"),
 "todd": ("David and the team at Paidia gave us the governance to be confident in how we procure, build and use AI. For a local authority that matters enormously, and what they delivered was <mark>practical, not abstract policy</mark>: clear AI procurement clauses and a checklist our service owners can apply themselves.", "Roger Todd", "Head of Digital and Products, London Borough of Merton"),
 "weiss": ("David and team run engaging, innovative and high-impact hackathons. We could feel the enthusiasm in the room and <mark>confidence and capability being built</mark>.", "Antonio Weiss", "Senior Partner, The PSC, and author of AI Demystified"),
 "bentley": ("I worked alongside Paidia Consulting for the best part of a year embedding AI into a large enterprise. They were excellent partners at taking real-world problems and quickly building working prototypes that the team could actually try. Several of these prototypes grew into full AI workflows, and <mark>the tools they delivered are now in real use</mark>.", "James Bentley", "Founder, Numerical Partners"),
}
def quote(k, cls="quote"):
    t, n, r = Q[k]
    return f'<figure class="{cls} reveal"><blockquote>&ldquo;{t}&rdquo;</blockquote><figcaption><b>{n}</b>{r}</figcaption></figure>'

# Short lines for the home page, each pointing at the full quote on the work page
LINES = [
 ("We've asked them back.", "Gary Roberts, CEO, real estate asset management"),
 ("Practical, not abstract policy.", "Roger Todd, London Borough of Merton"),
 ("Makes the future feel practical.", "Michelle Chu, Pearson"),
 ("Now in real use.", "James Bentley, Numerical Partners"),
]
def lines():
    return '<ul class="lines">' + "".join(f'<li class="reveal"><a href="work.html#testimonials"><span class="l">&ldquo;{t}&rdquo;</span><span class="w">{w}</span></a></li>' for t, w in LINES) + '</ul>'

AWARDS = '''<div class="award-list">
  <div class="award"><span class="when win">Winner, 2025</span><div><b>Digital Leaders AI Excellence Award</b><span>Privacy and Security, for the FCDO service</span></div></div>
  <div class="award"><span class="when">Nominated, 2025</span><div><b>Computing Digital Technology Leaders</b><span>Best AI Project</span></div></div>
  <div class="award"><span class="when">Nominated, 2025</span><div><b>Government Innovator Award</b><span>Civil Service Awards</span></div></div>
  <div class="award"><span class="when">Featured</span><div><b>AI Demystified</b><span>Antonio Weiss, Pearson FT Press. The FCDO service appears as a case study.</span></div></div>
  <div class="award"><span class="when">Featured</span><div><b>UK Government AI Use Case Library</b><span>Case study on AI.gov.uk</span></div></div>
</div>'''

OFFERS = '''<ul class="cards">
  <li><span class="lab">For your team</span><b>The same workshop, run privately</b><p>On your team's own tasks and the AI tools you already pay for, online or at your office, for up to 12 people. Hackathon version if you want a room full of builds.</p><span class="p">From £3,000 + VAT</span><a href="contact.html">Ask about dates for your team</a></li>
  <li><span class="lab">When you want it built</span><b>Build sprint</b><p>Two weeks. One task. One chain of AI steps running on your own tools, with a named person on your team able to run it and change it.</p><span class="p">From £8,000 + VAT</span><a href="contact.html">Scope a build sprint</a></li>
  <li><span class="lab">For one leader</span><b>One-to-one coaching</b><p>Ten weeks working in your own inbox, documents and decisions, until AI is part of how you work.</p><span class="p">From £4,000 + VAT</span><a href="contact.html">Ask about coaching</a></li>
  <li><span class="lab">For your leadership team</span><b>Strategy, governance and engineering</b><p>Half a day on where AI fits, what to do first, and rules people will follow. Production engineering when you need it.</p><span class="p">By conversation</span><a href="services.html">See how we work with leaders</a></li>
</ul>'''

WORKSHOP_PANEL = '''<div class="panel-dark panel-ws on-dark">
  <div style="display:grid;gap:14px">
    <span class="label">Online workshop</span>
    <h3>Build your AI product factory</h3>
    <p class="next">Next cohort: Friday 20 November 2026</p>
    <p>Bring a task you do every week. Leave with AI doing it in stages, and a person checking it. Two short live sessions online, a few days apart, then a drop-in to fix what breaks. Twelve places.</p>
  </div>
  <div class="cta"><span class="price">£499 + VAT per person (£598.80 inc. VAT)</span><a class="btn btn-lime" href="book.html">Book your place</a></div>
</div>'''

SIGNUP = '''<div class="wrap"><form class="signup" data-mail data-subject="Please send me the fortnightly note" aria-label="Sign up for the fortnightly note">
  <p class="signup-t">One practical AI idea, every other week.</p>
  <div class="field-row"><label class="vh" for="signup-email">Email</label><input id="signup-email" type="email" name="email" data-label="Email" required autocomplete="email" placeholder="you@organisation.org"><button class="btn" type="submit">Get the note</button></div>
  <p class="note form-msg" hidden>Your email app should open with a short message to us. Send it and you are on the list.</p>
</form></div>'''

CTA = '''<section class="section ink on-dark"><div class="wrap cta-band">
  <div><h2 class="display h-l">Tell us what you are trying to do.</h2><p class="muted">We will say whether we can help, and how.</p>
  <div class="actions"><a class="btn btn-lime" href="contact.html">Contact us</a><a href="workshop.html">Or start with the workshop</a></div></div>
  <div class="mark" aria-hidden="true"></div>
</div></section>'''

HOME = f'''<section class="hero-full on-dark">
  <img class="hero-bg" src="assets/paidia-loch-wide.webp" srcset="assets/paidia-loch-wide-900.webp 900w, assets/paidia-loch-wide.webp 1536w" sizes="100vw" alt="" width="1536" height="1024" fetchpriority="high">
  <div class="wrap hero-in">
    <div class="hero-copy">
      <h1>We teach organisations to use AI well.</h1>
      <p class="sub">Hands-on training and coaching on your own work, with the tools you already pay for. For the public sector, charities and mid-sized firms, from the team that built the UK Government's first public AI service.</p>
      <div class="row"><a class="btn btn-lime" href="course.html">Start the free email course</a><a class="tlink" href="workshop.html">Or see the 20 November workshop</a></div>
    </div>
  </div>
</section>

{LOGOS}

<section class="section sage"><div class="wrap split story">
  <div class="sec-head plain story-head">
    <p class="label">A note from David</p>
    <h2 class="display h-l">You have tried it. Nothing stuck.</h2>
    <div class="story-sign">
    <img src="assets/team/david-bio.webp" alt="" width="420" height="661" loading="lazy">
    <div><b>Dr David G&eacute;rouville-Farrell</b><span>Founder. Fifteen years a university lecturer. Built the UK Government&rsquo;s first public AI service, for the FCDO.</span></div>
    </div>
  </div>
  <div class="story-col">
  <div class="story-body">
    <p>You opened ChatGPT or Copilot, asked it something, got an answer that was fine and not much use, and closed the tab. Most of the people I meet have had a look and quietly left. <a class="ext" href="https://www.deloitte.com/uk/en/about/press-room/british-workers-spend-one-billion-pounds-of-their-own-money-on-gen-ai-for-work.html" target="_blank" rel="noopener">Deloitte asked 25,000 UK workers</a> this year: most have used it, the use is mostly searching and drafting, and about half have had no training at all.</p>
    <p>It is not because you are slow. It is because nobody has shown you how to use it on your own work.</p>
  </div>

  <div class="fork">
    <div><p class="fork-t">What you have probably been offered</p></div>
    <ul class="fork-list">
      <li><b>A licence and a webinar.</b><span>An hour for everyone at once. Six weeks later it is a tab you do not open.</span></li>
      <li><b>A clever thing someone built.</b><span>Handed over and walked away from. Six months later nobody can explain it, so nobody trusts it.</span></li>
    </ul>
  </div>

  <div class="story-body">
    <p>Neither makes you better at your job. BCG surveyed more than 10,000 workers in 2025 and found regular use is sharply higher among people who had five or more hours of training, and higher again when it was in person, with a coach. <a class="ext" href="https://www.bcg.com/publications/2025/ai-at-work-momentum-builds-but-gaps-remain" target="_blank" rel="noopener">Read&nbsp;BCG&rsquo;s&nbsp;findings</a></p>
  </div>

  <div class="story-body">
    <p><b>That is the part we do.</b> We build AI that runs in production, for the Foreign Office among others, and we teach people on their own tasks while we build. Our measure of success is that you no longer need us.</p>
  </div>
  <div class="story-sign">
    <img src="assets/team/david-bio.webp" alt="" width="420" height="661" loading="lazy">
    <div><b>Dr David G&eacute;rouville-Farrell</b><span>Founder. Fifteen years a university lecturer. Built the UK Government&rsquo;s first public AI service, for the FCDO.</span></div>
    </div>

  <ul class="story-doors">
    <li><span>If you want to understand it before you touch it</span><a href="course.html">Start the free email course</a></li>
    <li><span>If you want to leave with something working</span><a href="workshop.html">See the 20 November workshop</a></li>
    <li><span>If your team has the licences and the work has not changed</span><a href="contact.html">Talk to us about your team</a></li>
  </ul>
  </div>
</div></section>

<section class="section"><div class="wrap split">
  <div class="sec-head"><span class="num">1</span><h2 class="display h-l">Built, and in use</h2><p>The AI service we built for the Foreign Office is live on GOV.UK and on every British Embassy website. And the case we repeat: at Great Ormond Street Hospital Charity, one-off sessions had not stuck, so we worked beside people on their own tasks for twelve weeks, and the whole charity went to everyday use. <a href="work.html#gosh">If that sounds like you, read how it went</a>.</p></div>
  <dl class="stats">
    <div><dt><mark>500,000</mark></dt><dd>citizens a year answered by the FCDO service<span>A ten-day email queue became a five-second reply.</span></dd></div>
    <div><dt><mark>95%</mark></dt><dd>accuracy in production<span>Measured against the human agent baseline.</span></dd></div>
    <div><dt><mark>£3.6M</mark></dt><dd>estimated saving over five years<span>The FCDO's estimate of consular staff time saved.</span></dd></div>
    <div><dt><mark>70%</mark></dt><dd>of GOSH Charity staff using AI inside twelve weeks<span>Adoption across the whole charity, from a standing start.</span></dd></div>
  </dl>
</div></section>

<section class="section" id="book"><div class="wrap">
  <div class="sec-head"><span class="num">2</span><h2 class="display h-l">What you can book</h2><p>Every format runs on your own tasks and whichever tool your organisation already has: Copilot, ChatGPT, Claude or Gemini.</p></div>
  {WORKSHOP_PANEL}
  <p class="cards-lead">For your team, and what comes after</p>
  {OFFERS}
</div></section>

<section class="section sage"><div class="wrap">
  <div class="sec-head"><span class="num">3</span><h2 class="display h-l">In their words</h2></div>
  <div class="voices">
    {quote("grove", "quote lead")}
    <div>{lines()}<p class="more"><a class="tlink" href="work.html#testimonials">Read all six, and the work behind them</a></p></div>
  </div>
</div></section>

<section class="section tight"><div class="wrap">
  <div class="award-strip"><b>Winner, Digital Leaders AI Excellence Award 2025</b><span>for the FCDO service, with Caution Your Blast.</span><a href="about.html#awards">All awards and recognition</a></div>
</div></section>

<section class="section tight">{SIGNUP}</section>
{CTA}'''

SERVICES_ITEMS = [
 ("AI strategy and advisory", "A clear direction. A useful next step.", "Find the places where AI can make a meaningful difference to your organisation. We connect board-level ambition to a focused, practical set of priorities.", ["Board-level guidance on where AI creates real value", "Focus on the few use cases that drive most of the impact", "A roadmap grounded in your organisation's needs"]),
 ("Coaching and mentoring", "Confidence that lasts beyond the session.", "Individual and team coaching on your own work. We sit with you, open the laptop and do it together, until it becomes how you work.", ["One-to-one coaching for leaders, over ten weeks", "Team coaching that changes how people think about the tools", "Understand where AI excels and where it fails"]),
 ("Transformation and training", "From first experiments to everyday capability.", "Capability from the boardroom to the frontline, taught by people who build with AI every day.", ["Workshops and hackathons on your team's real tasks", "A workforce taken from zero use to 70% adoption in 12 weeks", "Follow-through so new habits do not fade after the day"]),
 ("Architecture and engineering", "Production-grade, and built to be trusted.", "Systems built for accuracy, security and scale, from search over your own documents to AI that does multi-step work.", ["Designed so it cannot make things up when it matters", "The UK Government's first public AI service: 95% accuracy in production", "Built so your own team can run and extend it"]),
 ("Rapid prototyping", "Working demos in days, not quarters.", "Build fast to prove value on a real problem, then hand off or scale to production.", ["Prototypes your team can actually try", "Several have grown into full workflows now in daily use", "Clear go or no-go evidence before you invest more"]),
 ("AI governance", "Rules people can follow.", "Practical governance your people can use, not abstract policy.", ["Risk tiers, approvals and transparency aligned with UK Government practice", "AI procurement clauses and checklists service owners can apply themselves", "An AI policy people actually follow, with training on what it means for each role"]),
]
def services_acc():
    out = []
    for i, (h, lead, txt, bullets) in enumerate(SERVICES_ITEMS, 1):
        lis = "".join(f"<li>{b}</li>" for b in bullets)
        out.append(f'''<details{" open" if i == 1 else ""}><summary><span class="num">{i}</span><h2>{h}</h2><span class="pm" aria-hidden="true">+</span></summary>
<div class="body"><span></span><div class="b-l"><p class="lead">{lead}</p><p class="muted">{txt}</p></div><div class="b-r"><ul>{lis}</ul><p><a href="contact.html">Talk to us about this</a></p></div></div></details>''')
    return '<div class="acc">' + "\n".join(out) + '</div>'

SERVICES = f'''<div class="wrap page-hero"><h1>From the boardroom<br>to the codebase.</h1><p class="lede">The right blend of strategic thinking, hands-on engineering and teaching. Most firms do one. We were university lecturers before we built production AI, and we still do both.</p></div>
<section class="section tight"><div class="wrap">{services_acc()}</div></section>
<section class="section tight sage"><div class="wrap"><div class="read" style="display:grid;gap:12px">
  <h2 class="display h-m">Start small. Build what comes next.</h2>
  <p class="muted">Most engagements start with a workshop or a strategy session. Not ready for a project? <a href="workshop.html">Start with the public workshop</a>, or <a href="contact.html">tell us what you are trying to do</a>.</p>
</div></div></section>
{CTA}'''

# Cases in "pull" shape (25 Oct 2026, after Rob Snyder): the job they were trying to do, why then, what they had tried,
# what we did, what happened. Rows we do not know are left out rather than invented; "why then" lines are flagged in
# site/README.md for David to confirm. GOSH is first because it is the case the whole site repeats.
CASES = [
 dict(id="gosh", cls="first", client="Great Ormond Street Hospital Charity", fig="70% adoption", h="From first experiments to everyday use in twelve weeks",
  job="Get a whole charity, not just the keen few, using AI in their everyday work.",
  why="The tools were already paid for and in people's hands, and the senior team wanted them used, not admired.",
  tried="One-off sessions and recordings. People liked them on the day and weeks later could not rebuild what they had learnt.",
  did="One-to-one coaching with the senior team, engineering on the priority workflows, and a weekly AI Lab where teams designed their own assistants on their own tasks.",
  happened="Adoption went from zero to 70% in twelve weeks. The CTO: \"this isn't change management, it's EQ and IQ.\"", partner=""),
 dict(id="fcdo", cls="", client="FCDO, with Caution Your Blast", fig="£3.6M saved", h="The UK Government's first public-facing AI service",
  job="Answer the consular enquiries of 500,000 citizens a year, reliably, in every embassy.",
  why="Replies were taking ten days through an email queue.",
  tried="Human agents working the queue.",
  did="Designed, built and deployed the AI service, with Caution Your Blast on service design and delivery. Live on GOV.UK and on every British Embassy website.",
  happened="A five-second reply at 95% accuracy in production, above the human agent baseline. The FCDO estimates £3.6M saved in staff time over five years. Winner of the Digital Leaders AI Excellence Award 2025 and a case study in the UK Government's AI Use Case Library.",
  partner="Architecture, build and deployment by Paidia; service design and delivery with Caution Your Blast."),
 dict(id="awin", cls="", client="Awin", fig="2 hours", h="Publisher matching in two hours, not ten days",
  job="Match 1,500 vendors to publishers, and check ad placements, without people losing days to it.",
  why="",
  tried="Doing it by hand: ten days per matching run.",
  did="A matching tool and automated ad-placement checks. We coached the engineers on building AI that does multi-step work, reviewed the security of connecting AI to their systems, and rolled out Claude Code safely.",
  happened="Matching runs in two hours. The placement checks gave people back full days of work.", partner=""),
 dict(id="nhs", cls="", client="NHS Midlands, with Hudson and Hayes", fig="11 boards", h="One diagnostics discovery across eleven Integrated Care Boards",
  job="Agree where AI could help with diagnostics across eleven boards, and get it funded.",
  why="",
  tried="Forty-one candidate opportunities and no shared way to choose between them.",
  did="Workshops that narrowed the forty-one to a prioritised shortlist, and a model showing how a 1% cut in missed appointments could free roughly 90,000 diagnostic appointments a year.",
  happened="The business case secured funding, and a working prototype followed within weeks.", partner="Discovery and business case with Hudson and Hayes."),
 dict(id="pearson", cls="", client="Pearson", fig="FTSE 100", h="A platform strategy and architecture for a FTSE 100 education company",
  job="Give learners a single front door, in support of Pearson's early-careers ambitions, including young people not in education, employment or training.",
  why="",
  tried="Separate delivery systems that AI assistants could not work across.",
  did="A platform strategy and an architecture that lets AI assistants work across those systems through a standard way of connecting them.",
  happened="", partner=""),
 dict(id="rimes", cls="", client="Rimes, with Hudson and Hayes", fig="50 engineers", h="A roadmap and the tooling to use it",
  job="Triple the business, with a fifty-strong engineering team and legacy systems AI could not reach.",
  why="",
  tried="",
  did="An AI transformation roadmap, a standard way to make legacy systems reachable by AI, and a developer-tooling programme with onboarding and process-design workshops.",
  happened="", partner="Roadmap with Hudson and Hayes."),
 dict(id="merton", cls="", client="London Borough of Merton", fig="1 checklist", h="AI governance a local authority can use",
  job="Adopt AI responsibly across the council.",
  why="",
  tried="A policy nobody reads.",
  did="Clear AI procurement clauses and a checklist service owners apply themselves.",
  happened="\"Practical, not abstract policy.\" Roger Todd, Head of Digital.", partner=""),
 dict(id="zinc", cls="", client="Real estate asset management", fig="4 days", h="A small senior team, from curious to capable",
  job="Get a senior team past scratching the surface of the AI licence they had bought.",
  why="",
  tried="Using it on their own: one person good, everyone else going down rabbit holes.",
  did="Four days of practical training on real work, pitched so people could use it at their desks the next morning.",
  happened="\"We've asked them back.\" Gary Roberts, CEO.", partner=""),
]
CASE_ROWS = [("job","The job"),("why","Why then"),("tried","What they had tried"),("did","What we did"),("happened","What happened")]
def cases():
    out = []
    for i, c in enumerate(CASES, 1):
        f = f'<div class="figure">{c["fig"]}</div>' if c["fig"] else ""
        rows = "".join(f'<div><dt>{lab}</dt><dd>{c[k]}</dd></div>' for k, lab in CASE_ROWS if k != "happened" and c[k])
        result = f'<p class="result">{c["happened"]}</p>' if c.get("happened") else ""
        p = f'<p class="partner">{c["partner"]}</p>' if c["partner"] else ""
        band = " sage" if i % 2 == 0 else ""
        out.append(f'''<section class="section case-sec{band}" id="{c["id"]}"><div class="wrap"><article class="case2">
  <div class="head"><span class="num" aria-hidden="true">{i}</span><div><span class="client">{c["client"]}</span>{f}<h3>{c["h"]}</h3></div></div>
  <div class="body">{result}<dl class="story">{rows}</dl>{p}</div>
</article></div></section>''')
    return "\n".join(out)

WORK = f'''<div class="wrap page-hero"><h1>What we have built<br>and taught.</h1><p class="lede">Eight engagements across government, health, charity, education and finance, each told the same way: what they were trying to do, what they had tried, what we did, and what happened. If one of them sounds like you, that is a good sign.</p></div>
<h2 class="skip">Case studies</h2>
{cases()}
<section class="section sage" id="testimonials"><div class="wrap">
  <div class="sec-head plain"><h2 class="display h-l">In their words</h2><p>Six clients, in their own words. More references on request: <a href="contact.html">ask us</a>.</p></div>
  <div class="quotes">{"".join(quote(k) for k in ["todd","grove_full","chu","roberts","weiss","bentley"])}</div>
</div></section>
<section class="section tight"><div class="wrap awards">
  <div style="display:grid;gap:12px"><h2 class="display h-l">Recognition</h2><p class="muted">For the FCDO service, built with Caution Your Blast.</p></div>
  {AWARDS}
</div></section>
{CTA}'''

PODCAST = f'''<div class="wrap page-hero"><h1>After the Rollout</h1><p class="lede">Everyone talks about buying AI. Almost nobody talks about the months after it is switched on. Each episode, someone who had to make AI work inside a real organisation tells us what actually happened.</p>
  <p><b>First episodes November 2026.</b> Leave your email and we will send the first one.</p>
  <form data-mail data-subject="Send me the first episode of After the Rollout" aria-label="Notify me about the podcast" style="max-width:520px"><div class="field-row"><label style="flex:1 1 220px"><span>Email</span><input type="email" name="email" data-label="Email" required autocomplete="email"></label><button class="btn" type="submit" style="align-self:end">Send me episode one</button></div><p class="note form-msg" hidden>Your email app should open with a short message to us. Send it and we will let you know.</p></form>
</div>
<section class="section tight"><div class="wrap"><div class="pod">
  <h2 class="display h-m">What you will hear</h2>
  <ul><li>The week after Copilot or ChatGPT went live, and who actually used it</li><li>What people did when the AI was close, but not right</li><li>How teams decided what was safe to put in, and who could say yes</li><li>What they would do differently next time</li></ul>
  <p><b>Fortnightly, about half an hour.</b> Guest episodes alternate with shorter ones where we talk through what we heard from clients, workshops and the London AI practitioners meetup that fortnight. No vendor pitches. Hosted by Dr David Gérouville-Farrell.</p>
</div></div></section>
<section class="section tight"><div class="wrap"><div class="band last">
  <div><b>Did you have to make AI work after it was rolled out?</b><p>Heads of operations, learning, transformation, digital, or "the AI person": we would like to hear your story, the good and the messy.</p></div>
  <a class="btn" href="contact.html">Tell us your story</a>
</div></div></section>'''

ABOUT = f'''<div class="wrap page-hero"><h1>Teachers who build.</h1><p class="lede">Fifteen years of university teaching, then the UK Government's first public AI service. We build AI that goes into production, and we teach your people to run it without us.</p></div>
<section class="section tight"><div class="wrap">
  <div class="founder">
    <img src="assets/team/david-bio.webp" alt="Dr David Gérouville-Farrell" width="420" height="661">
    <div class="bio">
      <div><span class="label">Founder</span><h2 class="display h-l" style="margin-top:6px">Dr David Gérouville-Farrell</h2><p class="muted" style="margin-top:6px">AI strategy, architecture and coaching. London.</p></div>
      <p>I spent fifteen years in academia as a university lecturer in computer science, with thirty published papers and a background that runs from web and game development through to service design, delivery and product management. AI was my hobby long before ChatGPT: I spent my spare time training computer vision models and fine-tuning image models. When ChatGPT arrived I could not stop thinking about the change about to hit the world, so I built Paidia to help bring AI to the public and private sector.</p>
      <p>I had the privilege of designing and building the UK Government's first public-facing AI service, for the FCDO. Since then I have led Paidia's work with clients ranging from national institutions like the NHS and Great Ormond Street Hospital Charity to SMEs and large enterprises. I work across the whole stack, from boardroom strategy to hands-on architecture to one-to-one coaching, and I co-host the London AI practitioners meetup.</p>
      <div class="row"><a class="btn" href="contact.html">Contact us</a></div>
    </div>
  </div>
  <figure class="pull"><blockquote>&ldquo;I spent fifteen years teaching computer science. I still think the job is to make people capable, not dependent.&rdquo;</blockquote><figcaption>David, on why Paidia teaches as well as builds</figcaption></figure>
</div></section>
<section class="section sage"><div class="wrap">
  <div class="sec-head plain"><h2 class="display h-l">Who else you will work with</h2></div>
  <div class="team">
    <div class="person"><img src="assets/team/jon-sykes.webp" alt="Dr Jonathan Sykes" loading="lazy" width="480" height="720"><b>Dr Jonathan Sykes</b><span class="r">Delivery and transformation</span><p>Leads delivery on our public-sector engagements, most recently the AI governance frameworks for a London borough. Years across central and local government, and a research background in human behaviour, which is what turns AI policy into something teams can use.</p></div>
    <div class="person"><img src="assets/team/gus-laios.webp" alt="Gus Laios" loading="lazy" width="480" height="720"><b>Gus Laios</b><span class="r">Product and delivery</span><p>Product manager with fifteen years running large technology programmes in government and industry. Gus turns a board's AI ambition into a plan a delivery team can actually run.</p></div>
    <div class="person"><img src="assets/team/ross-anderson.webp" alt="Ross Anderson" loading="lazy" width="480" height="720"><b>Ross Anderson</b><span class="r">AI engineering</span><p>Engineer. Builds the AI systems we hand over: search over your documents, multi-step automations, the web front end and the database behind them.</p></div>
  </div>
  <div class="cats-row">
    <span class="label">The office cats</span>
    <div class="cat"><img src="assets/team/apollonia.webp" alt="Apollonia the cat" loading="lazy" width="480" height="720"><div><b>Apollonia</b><span>Chief Charisma Officer. In charge of good vibes, no matter how much work is on.</span></div></div>
    <div class="cat"><img src="assets/team/bowie.webp" alt="Bowie the cat" loading="lazy" width="480" height="720"><div><b>Bowie</b><span>Chief Operating Officer. Ensures we are awake at 5am and that meals are served at exactly the same time, every day.</span></div></div>
  </div>
</div></section>
<section class="section tight ruled" id="awards"><div class="wrap awards">
  <div style="display:grid;gap:12px"><h2 class="display h-l">Recognition</h2><p class="muted">For the FCDO service, built with Caution Your Blast.</p></div>
  {AWARDS}
</div></section>
{CTA}'''

CONTACT = '''<div class="wrap contact">
  <div style="display:grid;gap:18px;align-content:start">
    <h1 class="display" style="font-size:clamp(2.6rem,5.6vw,4.5rem);line-height:1.04">A good place<br>to begin.</h1>
    <p class="lede">Based in London, working across sectors. Tell us what you are trying to do and we will say whether we can help, and how.</p>
    <p>Or email <a href="mailto:info@paidiaconsulting.com">info@paidiaconsulting.com</a></p>
  </div>
  <form id="form" data-mail data-subject="Enquiry from the Paidia website" aria-label="Contact form">
    <h2 class="skip">Send us a message</h2>
    <div class="two">
      <label>First name<input name="first" data-label="First name" required autocomplete="given-name"></label>
      <label>Last name<input name="last" data-label="Last name" required autocomplete="family-name"></label>
    </div>
    <label>Email<input type="email" name="email" data-label="Email" required autocomplete="email"></label>
    <label><span>Phone <span class="opt">(optional)</span></span><input type="tel" name="phone" data-label="Phone" autocomplete="tel"></label>
    <label><span>Tell us more <span class="opt">(optional)</span></span><textarea name="message" data-label="Message" rows="3"></textarea></label>
    <button class="btn" type="submit" style="justify-self:start">Submit</button>
    <p class="note">This opens a draft in your email app for you to review and send. Nothing is submitted or stored by this website.</p>
    <p class="note form-msg" hidden>Your email app should now be open with your message ready to send.</p>
  </form>
</div>'''

# Free email course page. Rebuilt 25 Oct 2026 (Nikki): layout after Allie K. Miller's course page (structure only, not her
# words or colours); lessons drawn from David's PSC talk "Introduction to Generative AI" (13 Mar 2026, copy in Resources/).
# Course plan: Market Research/2026_10_25 - Free email course - seven lessons from the PSC deck.md
# The lessons are not written yet. The form opens an email draft until an email tool (Kit, SendFox or Mailchimp) is chosen.
COURSE_LESSONS = [
 ("Behind the curtain", "What AI actually does: it learns patterns from past data and uses them to predict. Long before ChatGPT it was already forecasting numbers, sorting things into piles and learning how work gets done."),
 ("Every AI has edges", "A system can only give the answers it was built to give, and only make things like what it has seen. Why an image tool struggles to draw a single grape, and why bias arrives with the data."),
 ("What your prompt really does", "A language model predicts the next word. What you type steers where it goes, so context is everything. The same steering is how people trick it."),
 ("Rewrite anything for anyone", "Change the tone, the audience, the length or the language: for your boss, for a beginner, in German. The effort of tailoring a message goes, and you check what matters."),
 ("Read less, understand more", "Summarise a long document, then ask it questions until you understand it, at your own pace and on your own terms."),
 ("From inbox to system", "Pull the facts out of emails and into the place they belong. Checking the AI's work is quicker than doing the job yourself, so a person stays in the loop."),
 ("The limits of trust", "Why AI makes things up, why it has a knowledge cut-off, and how to decide what needs checking. Treat it as a language tool, not a database."),
]
def course_lessons():
    return '<ol class="cp-days">' + "".join(f'<li><span class="d">Day {i}</span><div><b>{t}</b><span>{d}</span></div></li>' for i,(t,d) in enumerate(COURSE_LESSONS,1)) + '</ol>'

def course_form(fid):
    return f'''<form class="cp-form" data-mail data-subject="Start the free email course" aria-label="Start the free email course">
      <div class="cp-row"><label class="vh" for="{fid}">Email</label><input id="{fid}" type="email" name="email" data-label="Email" required autocomplete="email" placeholder="you@organisation.org"><button class="btn btn-lime" type="submit">Send me day one</button></div>
      <p class="note form-msg" hidden>Your email app should open with a short message to us. Send it and you are on the list.</p>
    </form>'''

COURSE_ARROW = '<svg viewBox="0 0 90 70" width="90" height="70" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M78 6c4 22-10 44-50 50"/><path d="M36 46l-9 10 12 4"/></svg>'

COURSE = f'''<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap">
<div class="cp-frame"><div class="cp on-dark">
  <section class="cp-hero">
    <h1 class="display">AI, from zero to <span class="hl">&ldquo;I get it&rdquo;</span></h1>
    <p class="cp-sub">A free <b>seven-day email course</b> on how AI actually works, what it is good at, and when not to trust it. No technical background needed.</p>
    <p class="cp-by">From <b>Dr David G&eacute;rouville-Farrell</b>, who built the UK Government&rsquo;s first public AI service</p>
    {course_form("cp-email-1")}
  </section>

  <div class="cp-visual" aria-hidden="true">
    <div class="stack">
      <div class="mail m3"></div><div class="mail m2"></div>
      <div class="mail m1">
        <div class="mh"><span class="dot"></span><b>Paidia</b><small>Day 1 of 7</small></div>
        <p class="ms">Behind the curtain</p>
        <span class="ml"></span><span class="ml"></span><span class="ml short"></span>
        <span class="try">Try this on your own work</span>
      </div>
    </div>
    <div class="hand">Free, and only <br>seven emails{COURSE_ARROW}</div>
  </div>

  <p class="cp-promise">Seven short emails that take you behind the curtain, so you can use AI on your own work with confidence, and know when to check it.</p>

  <section class="cp-for">
    <h2 class="display">Made for people who don&rsquo;t write code</h2>
    <p>Most AI courses are written for engineers or sold as hype. This one comes from a talk we give to teams in government, charities and consultancies: how AI works, what it is good at and where it goes wrong, in plain English. Each email is one idea, one real example and one thing to try on your own work, in about ten minutes.</p>
  </section>

  <ul class="cp-cards">
    <li><span class="n">1</span><h3>For leaders</h3><p>Know enough to ask good questions of vendors, your teams and your own plans, without the jargon.</p></li>
    <li><span class="n">2</span><h3>For teams with the licences</h3><p>You have Copilot or ChatGPT and not much has changed. Practical uses you can try on real work the same day.</p></li>
    <li><span class="n">3</span><h3>For anyone starting out</h3><p>Plain English, real examples, and the limits explained honestly, so you can use it safely from day one.</p></li>
  </ul>

  <section class="cp-plan">
    <h2 class="display">What arrives, day by day</h2>
    {course_lessons()}
  </section>

  <section class="cp-end">
    <h2 class="display">Ready for day one?</h2>
    <p>Day one arrives as soon as the course opens. After day seven you get our fortnightly note. Unsubscribe any time.</p>
    {course_form("cp-email-2")}
    <p class="cp-next">Want to build with it, live? <a href="workshop.html">The online workshop on 20 November</a> picks up where day seven ends.</p>
  </section>
</div></div>
'''

from workshop import WORKSHOP, BOOK
WORKSHOP = WORKSHOP.replace("{{QUOTE}}", quote("weiss"))

PAGES = {
 "index.html": ("Paidia Consulting", "Hands-on AI training, coaching and engineering. We teach organisations to use AI well, and we build it too.", HOME),
 "services.html": ("Services | Paidia Consulting", "AI strategy, coaching, training, engineering, prototyping and governance, from the boardroom to the codebase.", SERVICES),
 "work.html": ("Our work | Paidia Consulting", "Case studies and testimonials: FCDO, GOSH Charity, Awin, NHS, Pearson, Rimes, Merton.", WORK),
 "workshop.html": ("Build your AI product factory | Paidia Consulting", "A live online workshop in two 90-minute sessions from Friday 20 November 2026: leave with AI doing one real task of yours in stages, checked by you.", WORKSHOP),
 "book.html": ("Book your place | Paidia Consulting", "Book a place on Build your AI product factory, live online from Friday 20 November 2026. £499 + VAT.", BOOK),
 "podcast.html": ("After the Rollout, a podcast | Paidia Consulting", "What happens after AI is switched on inside real organisations. First episodes November 2026.", PODCAST),
 "about.html": ("About | Paidia Consulting", "Teachers who build: Dr David Gérouville-Farrell and associates.", ABOUT),
 "course.html": ("Free email course | Paidia Consulting", "AI, from zero to \"I get it\": a free seven-day email course on how AI works, what it is good at, and when not to trust it.", COURSE),
 "contact.html": ("Contact | Paidia Consulting", "Send us a message or email info@paidiaconsulting.com.", CONTACT),
}
