import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// JSONBIN CONFIGURATION
// 1. Go to https://jsonbin.io and create a free account
// 2. Click "Create a Bin", paste in: {} and save
// 3. Copy the Bin ID from the URL (looks like: 64f3a2b1e3...)
// 4. Go to Account > API Keys and copy your Master Key
// 5. Paste both values below
// ─────────────────────────────────────────────────────────────────────────────
const JSONBIN_BIN_ID  = "6997dbdc43b1c97be98d2886";
const JSONBIN_API_KEY = "$2a$10$IZxA4wP7qOr09qE8YQ0UWe9nmnDVFBykdddugK7ONz0YbMECP9r0u";
const JSONBIN_URL     = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = {
  black:       "#0a0a0a",
  mustard:     "#D4A017",
  mustardDark: "#A67C00",
  offWhite:    "#F8F7F4",
  lightGrey:   "#EFEFED",
  midGrey:     "#C8C6C1",
  darkGrey:    "#4A4845",
  white:       "#FFFFFF",
};

const CATEGORIES = {
  THREATS:   { label: "Space Threats & Incidents", color: "#C0392B", icon: "⚠" },
  INDUSTRY:  { label: "Industry & Competitors",    color: "#1A6B3C", icon: "🛸" },
  AUSTRALIA: { label: "Australian Space",          color: "#1B4F8A", icon: "🦘" },
  DEFENCE:   { label: "Defence & Policy",          color: "#5C3A7A", icon: "🛡" },
  MARKET:    { label: "Market & Investment",       color: "#B7550A", icon: "📈" },
  SMC:       { label: "SMC Mentions",              color: "#D4A017", icon: "★" },
};

const PRIORITY_COLOURS = {
  "MUST READ": { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
  "MONITOR":   { bg: "#EFF6FF", text: "#1E40AF", border: "#93C5FD" },
  "LOW":       { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
};

const ACTION_OPTIONS = [
  { value: "THOUGHT LEADERSHIP", label: "Thought Leadership", desc: "Draft an article or post" },
  { value: "REPOST",             label: "Repost",             desc: "Share with SMC comment" },
  { value: "MONITOR",            label: "Monitor",            desc: "Track for future use" },
  { value: "IGNORE",             label: "Ignore",             desc: "Not relevant right now" },
];

// ─── Article Data ─────────────────────────────────────────────────────────────
// When refreshing each week, this is the only section that changes.
// New articles are merged in by ID; existing articles are preserved.
const ARTICLES = [
  {
    id: 1001,
    category: "THREATS",
    priority: "MUST READ",
    title: "Pentagon's GHOST-R Programme Seeks Commercial Satellites for GEO Inspection",
    source: "Defense News",
    date: "18 Feb 2026",
    url: "https://www.defensenews.com",
    summary: "The Defense Innovation Unit has launched GHOST-R (Geosynchronous Hybrid Operations and Space Threat — Rapid), seeking commercially built satellites capable of close-range inspection of other spacecraft in GEO. The programme targets a 24-month delivery timeline and prioritises cost-effective rapid response over traditional defence procurement cycles. Operators must demonstrate rendezvous and proximity operations capability and work within existing US Space Command architecture.",
    angles: [
      "Direct market match for Optimus Viper's value proposition — RPO capability in GEO at commercial cost points",
      "GHOST-R's 24-month timeline aligns with SMC's Missions 2-3 development roadmap",
      "Allied interoperability requirement mirrors Solstice OS 1.2's US systems integration objective",
      "Strong thought leadership peg: 'Why distributed, affordable RPO fleets are the answer to GHOST-R's requirements'",
    ],
  },
  {
    id: 1002,
    category: "THREATS",
    priority: "MUST READ",
    title: "Pentagon Wants Commercially Built Satellites to Spy on Other Satellites in GEO",
    source: "SpaceNews",
    date: "17 Feb 2026",
    url: "https://spacenews.com",
    summary: "SpaceNews coverage of the DIU GHOST-R solicitation, noting it explicitly targets commercial providers for co-orbital inspection of geostationary satellites. The programme reflects a broader Pentagon shift toward commercially derived space capabilities following the success of projects like Starshield. Officials cited cost concerns with legacy government-only approaches and the need for faster fielding.",
    angles: [
      "Second major outlet covering GHOST-R — confirms story significance for SMC positioning",
      "Pentagon's explicit turn to commercial for RPO validates SMC's commercial-first approach",
      "Repost opportunity with SMC comment on orbitside assist as the model for this requirement",
    ],
  },
  {
    id: 1003,
    category: "THREATS",
    priority: "MUST READ",
    title: "DIU GHOST-R: Inside the Pentagon's Rush to Inspect Rival Satellites",
    source: "Breaking Defense",
    date: "17 Feb 2026",
    url: "https://breakingdefense.com",
    summary: "Breaking Defense deep-dive into GHOST-R. The programme distinguishes itself from prior inspection efforts by requiring persistent presence capability — not just a single flyby — and multi-target servicing. The solicitation also asks for human-on-the-loop command and control, compatible with existing space operations centres. Funding is drawn from the FY26 Space Domain Awareness budget line.",
    angles: [
      "Persistent presence + multi-target = exactly Optimus Viper's distributed network model",
      "Human-on-the-loop requirement is a direct match for Solstice OS's core architecture principle",
      "Thought leadership: 'The case for proliferated inspection networks over single-vehicle GEO platforms'",
    ],
  },
  {
    id: 1004,
    category: "INDUSTRY",
    priority: "MUST READ",
    title: "Demonstrators Are No Longer Optional",
    source: "Payload Space",
    date: "14 Feb 2026",
    url: "https://payloadspace.com",
    summary: "Payload Space analysis arguing that the era of paper proposals for on-orbit servicing is over — defence and commercial customers now require demonstrated capability before committing to programmes. The piece cites Astroscale's ADRAS-J and Starfish Space's Otter Pup as setting new norms. Programmes without on-orbit heritage are increasingly passed over in procurement.",
    angles: [
      "Strong validation of Space MAITRI's strategic purpose — it exists precisely to build this on-orbit heritage",
      "Useful framing for award submissions: MAITRI as a prerequisite demonstration, not just a science mission",
      "Thought leadership opportunity around 'learning through revenue' — SMC's explicit Mission 1 philosophy",
    ],
  },
  {
    id: 1005,
    category: "MARKET",
    priority: "MUST READ",
    title: "US Chamber Fighting for Licensing and ITAR Reform in 2026",
    source: "Payload Space",
    date: "11 Feb 2026",
    url: "https://payloadspace.com",
    summary: "The US Chamber of Commerce Space Initiative has identified export licensing and ITAR reform as its top 2026 legislative priority. The campaign focuses on reducing barriers for allied commercial space companies seeking to access US systems, data, and joint programmes. Multiple allied space companies cited delays of 12–18 months for routine technology transfer approvals.",
    angles: [
      "Directly affects SMC's US interoperability work and Solstice OS 1.2 integration with US systems",
      "Useful context for any communications around SMC's allied-by-design architecture",
      "Monitor for updates — any reform would accelerate SMC's US market timeline",
    ],
  },
  {
    id: 1006,
    category: "THREATS",
    priority: "MONITOR",
    title: "Golden Dome: Software-Defined Warfare and the New Space Layer",
    source: "Breaking Defense",
    date: "15 Feb 2026",
    url: "https://breakingdefense.com",
    summary: "Analysis of the proposed Golden Dome missile defence architecture and its implications for space-based sensor and interceptor networks. The piece notes that any functional Golden Dome would require a dense mesh of orbital assets with sub-second data exchange — well beyond current Space Force inventory. Commercial operators are being evaluated as potential contributors to the sensor layer.",
    angles: [
      "Backdrop context for Solstice OS's network-centric architecture and sub-second synchronisation capability",
      "SMC's distributed constellation model is architecturally aligned with what Golden Dome requires",
    ],
  },
  {
    id: 1007,
    category: "DEFENCE",
    priority: "MONITOR",
    title: "Golden Dome: Why Software Will Define the Next Space Race",
    source: "SpaceNews",
    date: "12 Feb 2026",
    url: "https://spacenews.com",
    summary: "SpaceNews piece on the software-defined warfare doctrine underpinning Golden Dome, arguing the real competition is not in hardware but in the command and control layer. Authors cite Solstice-like systems (not by name) as models for how commercial operators could feed into national defence architectures through open APIs.",
    angles: [
      "Validates Solstice OS's positioning as the command and control layer — not just another spacecraft bus",
      "API-first architecture is a commercial differentiator SMC can reference in defence customer conversations",
    ],
  },
  {
    id: 1008,
    category: "MARKET",
    priority: "MONITOR",
    title: "Pentagon Reviews Slow LEO Constellation Procurement",
    source: "SpaceNews",
    date: "10 Feb 2026",
    url: "https://spacenews.com",
    summary: "The Pentagon's Director of Space Acquisition has flagged concerns over the pace of LEO constellation procurement, noting that requirements cycles are still taking 3–5 years for capability that commercial operators can field in 18 months. A working group has been established to recommend acquisition reform, with a report due to Congress in Q3 2026.",
    angles: [
      "Watch for outcomes — any procurement reform could open faster pathways for SMC's US defence market entry",
      "Useful context for investor messaging: SMC's rapid deployment model addresses exactly this gap",
    ],
  },
  {
    id: 1009,
    category: "INDUSTRY",
    priority: "MONITOR",
    title: "Agile Space Industries Closes $17M Series A for In-Space Propulsion",
    source: "SpaceNews",
    date: "9 Feb 2026",
    url: "https://spacenews.com",
    summary: "Agile Space Industries has raised $17 million in Series A funding to scale production of its hypergolic in-space propulsion systems. The company targets satellite operators seeking higher-performance alternatives to cold-gas thrusters for LEO manoeuvring. Investors cited growing demand for propulsion in responsive space applications.",
    angles: [
      "Competitive intelligence for Scintilla/Ignis — validates the propulsion market but uses different chemistry",
      "SMC's ethane/N2O approach offers green propellant advantages Agile's hypergolic systems do not",
    ],
  },
  {
    id: 1010,
    category: "MARKET",
    priority: "MONITOR",
    title: "NATO Innovation Fund Backs SatVu with Strategic Investment",
    source: "SpaceNews",
    date: "8 Feb 2026",
    url: "https://spacenews.com",
    summary: "The NATO Innovation Fund has made a strategic investment in SatVu, a UK-based thermal imaging satellite operator, marking the Fund's first direct investment in a commercial Earth observation company. NATO officials cited dual-use intelligence value and the need to build allied commercial space industrial capacity.",
    angles: [
      "Allied nations are actively investing in commercial space capabilities — SMC's allied-by-design positioning is well-timed",
      "NATO Innovation Fund is a potential future investor/partner avenue worth tracking",
    ],
  },
  {
    id: 1011,
    category: "THREATS",
    priority: "MONITOR",
    title: "Russia's Satellite Dependency Exposed as Starlink Dominates Battlefield",
    source: "The War Zone",
    date: "7 Feb 2026",
    url: "https://www.thedrive.com/the-war-zone",
    summary: "Analysis of Russia's increasing reliance on commercial satellite communications as its own constellation degrades, and the implications for satellite vulnerability as a strategic target. The piece notes that commercial satellites are now legitimate military infrastructure, making them targets — and making their protection a defence priority.",
    angles: [
      "Reinforces the threat narrative underpinning STARS and SMC's protection services",
      "Satellite-as-critical-infrastructure framing is useful context for defence customer conversations",
    ],
  },
  {
    id: 1012,
    category: "INDUSTRY",
    priority: "MONITOR",
    title: "Orbex Collapses: What It Means for the UK Small Launch Market",
    source: "NASASpaceFlight",
    date: "5 Feb 2026",
    url: "https://www.nasaspaceflight.com",
    summary: "UK small launch company Orbex has entered administration following the failure to close a Series C funding round. The collapse leaves a gap in European small launch capacity and raises questions about the viability of the UK's sovereign launch ambitions. Existing customers are seeking alternative launch providers.",
    angles: [
      "Relevant to SMC's UK Space Bridge partnerships — ARGUS and SLOSH-CAT partners may need to reassess launch options",
      "Monitor for impact on Lúnasa Space, SMC's ARGUS partner, which may have had Orbex dependencies",
    ],
  },
  {
    id: 1013,
    category: "INDUSTRY",
    priority: "LOW",
    title: "Astroscale Secures ESA Contract for Multi-Client Debris Removal",
    source: "SpaceNews",
    date: "16 Feb 2026",
    url: "https://spacenews.com",
    summary: "Astroscale has been awarded an ESA contract for a multi-client active debris removal demonstration mission targeting multiple defunct satellites in SSO. The mission builds on ADRAS-J and is expected to launch in 2027. The contract includes provisions for data sharing with member state space agencies.",
    angles: [
      "Competitor intelligence: Astroscale moving into multi-client model aligns with SMC's network servicing approach",
      "2027 timeline puts Astroscale and SMC's Mission 2-3 proximity timelines in direct comparison",
    ],
  },
  {
    id: 1014,
    category: "THREATS",
    priority: "LOW",
    title: "China's Shijian Satellite Programme Expanding Rendezvous Capabilities",
    source: "Breaking Defense",
    date: "13 Feb 2026",
    url: "https://breakingdefense.com",
    summary: "New analysis of China's Shijian satellite programme indicates a systematic expansion of rendezvous and proximity operations capability, with at least three satellites now conducting active RPO in GEO. Chinese state media framing remains focused on debris management and technology demonstration.",
    angles: [
      "Threat context for STARS messaging — exactly the adversary RPO pattern STARS is designed to detect",
      "Useful background for any defence customer briefing on the threat environment",
    ],
  },
  {
    id: 1015,
    category: "DEFENCE",
    priority: "LOW",
    title: "US Space Force Publishes New Space Warfighting Framework",
    source: "Air & Space Forces Magazine",
    date: "10 Feb 2026",
    url: "https://www.airandspaceforces.com",
    summary: "The US Space Force has released an updated Space Warfighting Framework, formally designating space as a contested warfighting domain and outlining doctrine for offensive and defensive space operations. The document explicitly calls for commercially derived capabilities in rapid response and space domain awareness roles.",
    angles: [
      "Policy tailwind for SMC's defence positioning — commercial RPO is now doctrine, not an experiment",
      "Quote-worthy for any thought leadership on allied commercial space defence",
    ],
  },
  {
    id: 1016,
    category: "AUSTRALIA",
    priority: "LOW",
    title: "Australian Space Agency Releases 2026 Civil Space Strategy",
    source: "Space Connect",
    date: "6 Feb 2026",
    url: "https://spaceconnectonline.com.au",
    summary: "The Australian Space Agency has published its 2026 Civil Space Strategy, prioritising sovereign manufacturing capability, international collaboration, and in-space services. The strategy names on-orbit servicing as a priority capability area and references Australia's growing commercial space sector as a national strategic asset.",
    angles: [
      "SMC is a direct beneficiary of this policy direction — worth amplifying with comment",
      "Strategy language around 'sovereign manufacturing' aligns with RAPID facility messaging",
      "Repost opportunity with comment connecting SMC's work to these stated national priorities",
    ],
  },
  {
    id: 1017,
    category: "MARKET",
    priority: "LOW",
    title: "In-Space Servicing Market Forecast: $5.23B by 2030",
    source: "SpaceNews",
    date: "4 Feb 2026",
    url: "https://spacenews.com",
    summary: "New market research from Quilty Space projects the in-space servicing, assembly and manufacturing market will reach $5.23 billion by 2030, up from $2.18 billion in 2025. The analysis identifies rapid response inspection and space domain awareness as the fastest-growing sub-segments, driven by defence procurement.",
    angles: [
      "Market validation data for investor decks and award submissions",
      "Rapid response inspection as the fastest-growing segment is direct SMC market validation",
    ],
  },
  {
    id: 1018,
    category: "INDUSTRY",
    priority: "LOW",
    title: "Starfish Space Raises $50M Series B Following Otter Pup Success",
    source: "Payload Space",
    date: "3 Feb 2026",
    url: "https://payloadspace.com",
    summary: "Starfish Space has closed a $50M Series B round following the successful autonomous docking demonstration of Otter Pup in May 2025. The funding will be used to develop the full Otter service vehicle for commercial satellite life extension. Investors cited Otter Pup's demonstration of non-cooperative docking as a market-defining capability.",
    angles: [
      "Competitor funding intelligence — Starfish moving toward commercial scale post-demonstration",
      "Non-cooperative docking is a capability area SMC will need to address in future roadmap messaging",
    ],
  },
  {
    id: 1019,
    category: "DEFENCE",
    priority: "LOW",
    title: "AUKUS Pillar II Space Cooperation Framework Taking Shape",
    source: "Australian Defence Magazine",
    date: "2 Feb 2026",
    url: "https://www.australiandefencemagazine.com.au",
    summary: "Defence officials from Australia, UK, and US have outlined an emerging AUKUS Pillar II framework for space cooperation, focused on data sharing, interoperable command and control, and jointly developed orbital capabilities. The framework explicitly includes commercial industry participation and aims to publish procurement pathways by mid-2026.",
    angles: [
      "Directly relevant to SMC's allied-by-design positioning and Solstice OS interoperability roadmap",
      "Commercial procurement pathways due mid-2026 — important milestone to track for BD pipeline",
    ],
  },
  {
    id: 1020,
    category: "AUSTRALIA",
    priority: "LOW",
    title: "Investment NSW Backs Western Sydney Space Manufacturing Cluster",
    source: "Space Connect",
    date: "1 Feb 2026",
    url: "https://spaceconnectonline.com.au",
    summary: "Investment NSW has announced funding for a Western Sydney space manufacturing cluster, citing SMC's RAPID facility agreement and UTS partnership as anchor tenants. The cluster aims to attract supply chain companies and create 500 space industry jobs by 2030. The NSW Government has committed $12 million in co-investment.",
    angles: [
      "SMC is named — strong repost and amplification opportunity",
      "Jobs and investment angle is well-suited to LinkedIn posts and media pitching",
      "Good peg for a post on Australia building genuine sovereign manufacturing capability",
    ],
  },
  {
    id: 1021,
    category: "SMC",
    priority: "LOW",
    title: "Space MAITRI Mission Passes Preliminary Design Review",
    source: "Space Connect",
    date: "28 Jan 2026",
    url: "https://spaceconnectonline.com.au",
    summary: "Space Machines Company's Space MAITRI mission has successfully passed its Preliminary Design Review, with a Standing Review Board comprising representatives from the Australian Space Agency and industry leaders declaring the PDR a pass. The mission is on track for launch on India's SSLV in late 2026.",
    angles: [
      "Direct SMC news — amplify with note about what PDR means for mission maturity",
      "Good reminder to include the required grant attribution statement in any social posts",
    ],
  },
  {
    id: 1022,
    category: "THREATS",
    priority: "LOW",
    title: "Space Force Eyes Rapid Response Constellation for GEO Awareness",
    source: "Defense News",
    date: "27 Jan 2026",
    url: "https://www.defensenews.com",
    summary: "The US Space Force is evaluating a rapid-response inspection constellation concept for persistent GEO awareness, separate from GHOST-R. The concept envisions 12–15 vehicles in highly elliptical orbits capable of reaching any GEO slot within 48 hours. Industry engagement is expected Q2 2026.",
    angles: [
      "Second US programme validating rapid response as the architecture of choice",
      "48-hour response requirement is achievable with Optimus Viper network at scale — worth noting in capability messaging",
    ],
  },
  {
    id: 1023,
    category: "MARKET",
    priority: "LOW",
    title: "Space Insurance Market Hardening as On-Orbit Threats Increase",
    source: "Payload Space",
    date: "25 Jan 2026",
    url: "https://payloadspace.com",
    summary: "Space insurers are tightening policy terms and increasing premiums for GEO operators in the wake of confirmed co-orbital activity from multiple state actors. Several underwriters have introduced proximity operations exclusion clauses, creating demand for active protection services as a risk mitigation alternative.",
    angles: [
      "Insurance market hardening is a commercial demand signal for SMC's protection services",
      "Proximity operations exclusions create an opening to pitch Optimus Viper as a risk mitigation asset",
      "Thought leadership: 'Why satellite operators can't rely on insurance alone in the new space security environment'",
    ],
  },
  {
    id: 1024,
    category: "INDUSTRY",
    priority: "LOW",
    title: "Orbit Fab Completes First Commercial On-Orbit Refuelling Transfer",
    source: "SpaceNews",
    date: "22 Jan 2026",
    url: "https://spacenews.com",
    summary: "Orbit Fab has completed its first commercial propellant transfer in LEO, delivering hydrazine to a commercial satellite using its Tanker-001 vehicle in partnership with DIU. The milestone marks the first time a commercial company has refuelled a satellite in orbit on a commercial basis rather than under a government-funded demonstration.",
    angles: [
      "Market milestone — commercial on-orbit servicing is now real, not theoretical",
      "Validates the broader servicing market SMC is entering; useful context for any market sizing narrative",
    ],
  },
  {
    id: 1025,
    category: "AUSTRALIA",
    priority: "LOW",
    title: "Gilmour Space Targets Mid-2026 for Second Eris Launch Attempt",
    source: "Space Connect",
    date: "20 Jan 2026",
    url: "https://spaceconnectonline.com.au",
    summary: "Gilmour Space has confirmed a mid-2026 target for the second launch attempt of its Eris rocket following the July 2025 failure. The company has completed a fault review and redesigned the first-stage propulsion system. If successful, Eris would become the first orbital launch from Australian soil in over 50 years.",
    angles: [
      "Australian sovereign launch context — monitor for progress relevant to SMC's domestic launch options",
      "Comment opportunity if launch succeeds: ecosystem post on Australia's growing independent launch capability",
    ],
  },
  {
    id: 1026,
    category: "DEFENCE",
    priority: "LOW",
    title: "UK Space Command Expanding Commercial Partnership Programme",
    source: "Breaking Defense",
    date: "18 Jan 2026",
    url: "https://breakingdefense.com",
    summary: "UK Space Command has announced an expanded commercial partnership programme seeking industry engagement for space domain awareness, rapid response, and on-orbit servicing. The programme is explicitly open to allied nation companies and includes a fast-track procurement route for companies with existing US or Australian government contracts.",
    angles: [
      "Fast-track route for allied nation companies with existing government contracts directly benefits SMC (ASCA)",
      "Strong BD pipeline lead — UK Space Command commercial partnerships to follow up on",
      "Relevant to ARGUS and SLOSH-CAT UK Space Bridge positioning",
    ],
  },
  {
    id: 1027,
    category: "MARKET",
    priority: "LOW",
    title: "Venture Capital Flows Into Space Defence at Record Pace",
    source: "Payload Space",
    date: "15 Jan 2026",
    url: "https://payloadspace.com",
    summary: "Space defence technology companies attracted $4.1 billion in venture capital in 2025, more than double 2023 levels. The surge is driven by growing government procurement of dual-use capabilities and the entrance of traditional defence VCs into the commercial space sector. Analysts predict continued growth through 2027 as AUKUS Pillar II procurement pathways open.",
    angles: [
      "Investment climate data for SMC fundraising narrative and investor materials",
      "AUKUS Pillar II procurement pathways opening aligns with SMC's BD timeline",
    ],
  },
  {
    id: 1028,
    category: "INDUSTRY",
    priority: "LOW",
    title: "Impulse Space Raises $150M for Orbital Mira Transfer Vehicle Programme",
    source: "SpaceNews",
    date: "12 Jan 2026",
    url: "https://spacenews.com",
    summary: "Impulse Space has raised $150 million in Series B funding to develop its Mira 2 orbital transfer vehicle for commercial and defence customers. The vehicle targets GEO and MEO transfer missions requiring greater delta-V than existing vehicles. Impulse has announced agreements with three government customers for 2027 delivery.",
    angles: [
      "Competitor intelligence: Mira 2 targets GEO/MEO — higher cost, different market segment to SMC's LEO-focused Vipers",
      "SMC's dollar-per-delta-V differentiation is directly relevant when comparing approaches",
    ],
  },
  {
    id: 1029,
    category: "AUSTRALIA",
    priority: "LOW",
    title: "SmartSat CRC Announces New Cohort Including Space Sustainability Projects",
    source: "Space Connect",
    date: "10 Jan 2026",
    url: "https://spaceconnectonline.com.au",
    summary: "SmartSat CRC has announced its latest project cohort, including several space sustainability and on-orbit servicing research projects in partnership with Australian universities. The cohort includes projects at UNSW, University of Adelaide, and UTS aligned with the MAITRI mission.",
    angles: [
      "UTS and University of Adelaide projects reinforce SMC's academic partnership ecosystem",
      "Monitor for publications or milestones that could provide SMC thought leadership pegs",
    ],
  },
  {
    id: 1030,
    category: "THREATS",
    priority: "LOW",
    title: "SWF 2025 Global Counterspace Capabilities Report Released",
    source: "Secure World Foundation",
    date: "Apr 2025",
    url: "https://swfound.org",
    summary: "Secure World Foundation's annual assessment of global counterspace capabilities finds significant R&D acceleration across China, Russia, and India. Australia is noted as building indigenous SSA capabilities and exploring non-destructive interference methods. The report finds that non-destructive co-orbital operations are the fastest-growing threat vector, with commercial satellites now explicitly in scope.",
    angles: [
      "Foundational threat intelligence report — useful for any defence customer briefing or thought leadership",
      "Australia's non-destructive interference interest is exactly the STARS capability SMC is developing",
      "Third-party validation of the threat environment SMC is building solutions for",
    ],
  },
  {
    id: 1031,
    category: "MARKET",
    priority: "LOW",
    title: "Commercial Space Investment 2026: Defence Contracts and Servicing Dominate",
    source: "Payload Space",
    date: "Feb 2026",
    url: "https://payloadspace.com",
    summary: "2026 investment is flowing heavily into defence, SDA, and orbital services. Slingshot Aerospace secured $27M from the US Space Force for AI-driven space warfare simulations. Astroscale France and Exotrail partnered on deorbit tech. Stoke Space expanded its Series D to $860M for reusable rockets. The article notes satellite maintenance and mobility are becoming 'essential services' as orbital traffic increases.",
    angles: [
      "Investment landscape context for SMC's fundraising narrative",
      "Competitive intelligence: electric propulsion investment validates Scintilla's market positioning",
    ],
  },
  {
    id: 1032,
    category: "INDUSTRY",
    priority: "LOW",
    title: "The State of ISAM 2025: Where the Sector Actually Stands",
    source: "Payload Space",
    date: "15 Oct 2025",
    url: "https://payloadspace.com",
    summary: "A comprehensive assessment of in-space servicing, assembly and manufacturing. Commercial RPO is now proven technology but demand has been slow to fully materialise. Orbit Fab has sold 50+ fuelling ports. Starfish Space's Otter Pup 2 set a precedent for autonomous docking with satellites not designed for it. Industry commentators warn that lumping servicing, assembly and manufacturing under one acronym misrepresents their very different maturity timelines.",
    angles: [
      "Validates SMC's thesis: RPO is proven, now it's about cost and speed",
      "Thought leadership opportunity: SMC's dollar-per-delta-V metric addresses the demand-maturity gap",
    ],
  },
  {
    id: 1033,
    category: "SMC",
    priority: "LOW",
    title: "SMC & UTS to Manufacture Optimus Viper in Western Sydney",
    source: "KWM / King & Wood Mallesons",
    date: "Mid-2025",
    url: "https://www.kwm.com/au/en/insights/latest-thinking/australia-in-space-2025-trendlines.html",
    summary: "A new collaboration between Space Machines Company and the University of Technology Sydney will establish a satellite manufacturing facility focused on the Optimus Viper, with hopes of producing up to 20 spacecraft per year. Described as the latest evidence that Australia is now competing across the full spectrum of space activities — from component fabrication to sovereign launch and orbital servicing.",
    angles: [
      "Third-party validation of SMC's manufacturing scale-up story — worth resharing with comment",
      "Good peg for a post about the Western Sydney RAPID facility progress",
    ],
  },
  {
    id: 1034,
    category: "AUSTRALIA",
    priority: "LOW",
    title: "SMC Secures Federal Funding for Space Domain Awareness Robotics Testbed",
    source: "Orbital Today",
    date: "3 Mar 2025",
    url: "https://orbitaltoday.com/2025/03/03/space-machines-company-secures-federal-funding-for-space-domain-awareness-technology/",
    summary: "Space Machines Company has secured Defence Trailblazer funding to develop a space-borne robotics testbed for SDA, proximity operations, and co-orbital space control. Partners include the Sentient Satellites Laboratory at the University of Adelaide, Scarlet Lab (SmartSat CRC), and Space Control STC at DSTG.",
    angles: [
      "Third-party coverage of SMC's SDA work — worth amplifying",
      "Good for establishing SMC's academic partnership credentials ahead of CDR milestones",
    ],
  },
  {
    id: 1035,
    category: "DEFENCE",
    priority: "LOW",
    title: "Australia Builds Military Space Organisation and SSA Capabilities",
    source: "Secure World Foundation",
    date: "Apr 2025",
    url: "https://swfound.org",
    summary: "SWF's 2025 Global Counterspace Capabilities assessment describes Australia as a relative newcomer in space that has recently started a military space organisation, is building indigenous SSA capabilities, is examining EW options for its Department of Defence, and is looking into non-destructive ways to interfere with enemy satellites.",
    angles: [
      "The policy climate that underpins STARS and SMC's Australian defence customer pipeline",
      "Thought leadership: 'What Australia needs to move from SSA consumer to SSA contributor'",
      "Useful context for media or investor briefings on the defence addressable market",
    ],
  },
];

// ─── JSONBin helpers ──────────────────────────────────────────────────────────
async function fetchActions() {
  try {
    const res = await fetch(`${JSONBIN_URL}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY },
    });
    if (!res.ok) throw new Error(`JSONBin fetch failed: ${res.status}`);
    const data = await res.json();
    return data.record || {};
  } catch (err) {
    console.error("Could not load actions from JSONBin:", err);
    return {};
  }
}

async function pushActions(actionsMap) {
  try {
    const res = await fetch(JSONBIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
      },
      body: JSON.stringify(actionsMap),
    });
    if (!res.ok) throw new Error(`JSONBin save failed: ${res.status}`);
  } catch (err) {
    console.error("Could not save actions to JSONBin:", err);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SMCDashboard() {
  const [actions, setActions]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [catFilter, setCatFilter] = useState("ALL");
  const [actFilter, setActFilter] = useState("ALL");
  const [selected, setSelected]   = useState(null);

  // Load shared actions on mount
  useEffect(() => {
    fetchActions().then(saved => {
      setActions(saved);
      setLoading(false);
    });
  }, []);

  const setAction = useCallback(async (id, value) => {
    const next = { ...actions };
    if (next[id] === value) {
      delete next[id];
    } else {
      next[id] = value;
    }
    setActions(next);
    setSaving(true);
    setSaveError(false);
    try {
      await pushActions(next);
    } catch (_) {
      setSaveError(true);
    }
    setSaving(false);
  }, [actions]);

  // Derived counts
  const catCounts = Object.keys(CATEGORIES).reduce((acc, k) => {
    acc[k] = ARTICLES.filter(a => a.category === k).length;
    return acc;
  }, {});

  const actionCounts = ACTION_OPTIONS.reduce((acc, o) => {
    acc[o.value] = Object.values(actions).filter(v => v === o.value).length;
    return acc;
  }, {});

  const unreviewed = ARTICLES.filter(a => !actions[a.id]).length;

  const filtered = ARTICLES.filter(a => {
    const catMatch = catFilter === "ALL" || a.category === catFilter;
    const actMatch = actFilter === "ALL" || actions[a.id] === actFilter;
    return catMatch && actMatch;
  });

  const catKeys = ["ALL", ...Object.keys(CATEGORIES)];

  // ── Render ──
  return (
    <div style={{ minHeight: "100vh", backgroundColor: B.offWhite, fontFamily: "'Georgia', 'Times New Roman', serif", color: B.black }}>

      {/* Header */}
      <div style={{ backgroundColor: B.black, borderBottom: `3px solid ${B.mustard}` }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 44, height: 44, backgroundColor: B.mustard, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: "bold", color: B.black, fontFamily: "'Arial', sans-serif" }}>
              SM
            </div>
            <div>
              <div style={{ color: B.white, fontSize: 18, fontWeight: "bold", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Arial', sans-serif" }}>
                Space Machines Company
              </div>
              <div style={{ color: B.mustard, fontSize: 11, letterSpacing: 4, textTransform: "uppercase", fontFamily: "'Arial', sans-serif", marginTop: 2 }}>
                Media Intelligence Dashboard
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: B.midGrey, fontSize: 11, fontFamily: "'Arial', sans-serif", letterSpacing: 1 }}>
              {new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <div style={{ color: B.mustard, fontSize: 11, fontFamily: "'Arial', sans-serif", letterSpacing: 1, marginTop: 3, display: "flex", gap: 12, justifyContent: "flex-end", alignItems: "center" }}>
              <span>{unreviewed} articles awaiting review</span>
              {loading && <span style={{ color: B.midGrey }}>· loading…</span>}
              {saving && !loading && <span style={{ color: B.midGrey }}>· saving…</span>}
              {saveError && <span style={{ color: "#C0392B" }}>· save failed</span>}
              {!loading && !saving && !saveError && <span style={{ color: B.midGrey }}>· synced</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px 48px" }}>

        {/* Loading overlay */}
        {loading && (
          <div style={{ padding: "64px 0", textAlign: "center", color: B.darkGrey, fontFamily: "'Arial', sans-serif", fontSize: 13 }}>
            Loading shared actions…
          </div>
        )}

        {!loading && (
          <>
            {/* Stats bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, backgroundColor: B.midGrey, border: `1px solid ${B.midGrey}`, marginBottom: 32 }}>
              {[
                { label: "Thought Leadership", value: "THOUGHT LEADERSHIP" },
                { label: "Repost",             value: "REPOST" },
                { label: "Monitor",            value: "MONITOR" },
                { label: "Ignore",             value: "IGNORE" },
                { label: "Unreviewed",         value: null },
              ].map(({ label, value }) => {
                const count    = value ? (actionCounts[value] ?? 0) : unreviewed;
                const isActive = actFilter === value;
                return (
                  <div
                    key={label}
                    onClick={() => value && setActFilter(actFilter === value ? "ALL" : value)}
                    style={{ backgroundColor: isActive ? "#F5EDD0" : B.white, padding: "14px 20px", textAlign: "center", cursor: value ? "pointer" : "default" }}
                  >
                    <div style={{ fontSize: 28, fontWeight: "bold", color: value ? B.mustardDark : B.darkGrey, fontFamily: "'Arial', sans-serif" }}>{count}</div>
                    <div style={{ fontSize: 10, color: B.darkGrey, textTransform: "uppercase", letterSpacing: 1, marginTop: 4, fontFamily: "'Arial', sans-serif" }}>{label}</div>
                  </div>
                );
              })}
            </div>

            {/* Main layout */}
            <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 440px" : "1fr", gap: 24, alignItems: "start" }}>

              {/* Article list */}
              <div>
                {/* Category filter */}
                <div style={{ marginBottom: 16, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flex: 1 }}>
                    {catKeys.map(k => (
                      <button key={k} onClick={() => setCatFilter(k)} style={{
                        padding: "6px 13px", fontSize: 11, fontFamily: "'Arial', sans-serif",
                        letterSpacing: 1, textTransform: "uppercase",
                        border: `2px solid ${catFilter === k ? B.mustard : B.midGrey}`,
                        backgroundColor: catFilter === k ? B.mustard : B.white,
                        color: catFilter === k ? B.black : B.darkGrey,
                        cursor: "pointer", fontWeight: catFilter === k ? "bold" : "normal",
                      }}>
                        {k === "ALL"
                          ? `All (${ARTICLES.length})`
                          : `${CATEGORIES[k].icon} ${k.charAt(0) + k.slice(1).toLowerCase()} (${catCounts[k]})`}
                      </button>
                    ))}
                  </div>
                  {actFilter !== "ALL" && (
                    <button onClick={() => setActFilter("ALL")} style={{
                      padding: "6px 12px", fontSize: 10, fontFamily: "'Arial', sans-serif",
                      border: `2px solid ${B.black}`, backgroundColor: B.black, color: B.mustard, cursor: "pointer",
                    }}>
                      Clear filter ×
                    </button>
                  )}
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {filtered.map(article => {
                    const cat    = CATEGORIES[article.category];
                    const priCfg = PRIORITY_COLOURS[article.priority] || PRIORITY_COLOURS["LOW"];
                    const action = actions[article.id];
                    const isSel  = selected?.id === article.id;

                    return (
                      <div
                        key={article.id}
                        onClick={() => setSelected(isSel ? null : article)}
                        style={{
                          backgroundColor: isSel ? B.black : B.white,
                          border: `2px solid ${isSel ? B.mustard : B.lightGrey}`,
                          borderLeft: `5px solid ${cat.color}`,
                          padding: "16px 20px",
                          cursor: "pointer",
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto",
                          gap: "0 14px",
                          alignItems: "start",
                          opacity: action === "IGNORE" ? 0.45 : 1,
                          transition: "opacity 0.15s",
                        }}
                      >
                        <div style={{ fontSize: 20, lineHeight: 1, paddingTop: 3, color: isSel ? B.mustard : cat.color }}>
                          {cat.icon}
                        </div>
                        <div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10, fontFamily: "'Arial', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", color: isSel ? B.mustard : cat.color, fontWeight: "bold" }}>
                              {cat.label}
                            </span>
                            <span style={{ color: B.midGrey, fontSize: 10 }}>·</span>
                            <span style={{ fontSize: 10, fontFamily: "'Arial', sans-serif", color: isSel ? B.midGrey : B.darkGrey }}>{article.source}</span>
                            <span style={{ color: B.midGrey, fontSize: 10 }}>·</span>
                            <span style={{ fontSize: 10, fontFamily: "'Arial', sans-serif", color: isSel ? B.midGrey : B.darkGrey }}>{article.date}</span>
                          </div>
                          <div style={{ fontSize: 14.5, fontWeight: "bold", lineHeight: 1.4, color: isSel ? B.white : B.black, marginBottom: 5 }}>
                            {article.title}
                          </div>
                          <div style={{ fontSize: 12, lineHeight: 1.6, color: isSel ? B.midGrey : B.darkGrey, fontFamily: "'Arial', sans-serif" }}>
                            {article.summary.slice(0, 150)}…
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", minWidth: 100 }}>
                          <span style={{
                            fontSize: 9, fontFamily: "'Arial', sans-serif", letterSpacing: 1,
                            textTransform: "uppercase", padding: "3px 7px", fontWeight: "bold",
                            backgroundColor: priCfg.bg, color: priCfg.text, border: `1px solid ${priCfg.border}`,
                          }}>
                            {article.priority}
                          </span>
                          {action && (
                            <span style={{
                              fontSize: 9, fontFamily: "'Arial', sans-serif", letterSpacing: 0.5,
                              textTransform: "uppercase", padding: "3px 7px", fontWeight: "bold",
                              backgroundColor: B.black, color: B.mustard,
                            }}>
                              {action}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filtered.length === 0 && (
                    <div style={{ padding: "48px 0", textAlign: "center", color: B.darkGrey, fontFamily: "'Arial', sans-serif" }}>
                      No articles match the current filters.
                    </div>
                  )}
                </div>
              </div>

              {/* Detail panel */}
              {selected && (() => {
                const cat    = CATEGORIES[selected.category];
                const action = actions[selected.id];
                return (
                  <div style={{
                    backgroundColor: B.white,
                    border: `2px solid ${B.mustard}`,
                    position: "sticky", top: 24,
                    maxHeight: "90vh", overflowY: "auto",
                  }}>
                    {/* Panel header */}
                    <div style={{ backgroundColor: B.black, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1, paddingRight: 12 }}>
                        <div style={{ color: B.mustard, fontSize: 10, fontFamily: "'Arial', sans-serif", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
                          {cat.icon} {cat.label}
                        </div>
                        <div style={{ color: B.white, fontSize: 14, fontWeight: "bold", lineHeight: 1.4 }}>
                          {selected.title}
                        </div>
                      </div>
                      <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: B.midGrey, fontSize: 22, cursor: "pointer", flexShrink: 0 }}>
                        ×
                      </button>
                    </div>

                    <div style={{ padding: "20px" }}>
                      {/* Meta */}
                      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontFamily: "'Arial', sans-serif", color: B.darkGrey }}>{selected.source}</span>
                        <span style={{ color: B.midGrey }}>·</span>
                        <span style={{ fontSize: 11, fontFamily: "'Arial', sans-serif", color: B.darkGrey }}>{selected.date}</span>
                        <a href={selected.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontFamily: "'Arial', sans-serif", color: B.mustardDark, textDecoration: "none", marginLeft: "auto" }}>
                          View source →
                        </a>
                      </div>

                      {/* Summary */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 10, fontFamily: "'Arial', sans-serif", letterSpacing: 2, textTransform: "uppercase", color: B.darkGrey, marginBottom: 10, fontWeight: "bold" }}>
                          Summary
                        </div>
                        <p style={{ fontSize: 13, lineHeight: 1.75, color: B.black, fontFamily: "'Georgia', serif", margin: 0 }}>
                          {selected.summary}
                        </p>
                      </div>

                      {/* SMC Angles */}
                      {selected.angles?.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <div style={{ fontSize: 10, fontFamily: "'Arial', sans-serif", letterSpacing: 2, textTransform: "uppercase", color: B.darkGrey, marginBottom: 12, fontWeight: "bold" }}>
                            SMC Angles & Opportunities
                          </div>
                          {selected.angles.map((angle, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                              <div style={{ width: 7, height: 7, backgroundColor: B.mustard, flexShrink: 0, marginTop: 5 }} />
                              <div style={{ fontSize: 12.5, lineHeight: 1.6, color: B.black, fontFamily: "'Arial', sans-serif" }}>
                                {angle}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div>
                        <div style={{ fontSize: 10, fontFamily: "'Arial', sans-serif", letterSpacing: 2, textTransform: "uppercase", color: B.darkGrey, marginBottom: 12, fontWeight: "bold" }}>
                          Mark as
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {ACTION_OPTIONS.map(opt => {
                            const isActive = action === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => setAction(selected.id, opt.value)}
                                style={{
                                  padding: "10px 12px",
                                  backgroundColor: isActive ? B.black : B.offWhite,
                                  color: isActive ? B.mustard : B.black,
                                  border: `2px solid ${isActive ? B.mustard : B.lightGrey}`,
                                  cursor: "pointer", textAlign: "left",
                                  transition: "all 0.12s",
                                }}
                              >
                                <div style={{ fontSize: 11, fontWeight: "bold", fontFamily: "'Arial', sans-serif", marginBottom: 2 }}>
                                  {opt.label}
                                </div>
                                <div style={{ fontSize: 10, fontFamily: "'Arial', sans-serif", color: isActive ? B.midGrey : B.darkGrey }}>
                                  {opt.desc}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 40, padding: "18px 24px", backgroundColor: B.lightGrey, borderLeft: `4px solid ${B.mustard}` }}>
              <div style={{ fontSize: 11, fontFamily: "'Arial', sans-serif", fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", color: B.darkGrey, marginBottom: 8 }}>
                How to update this dashboard
              </div>
              <div style={{ fontSize: 12, fontFamily: "'Arial', sans-serif", color: B.darkGrey, lineHeight: 1.8 }}>
                Run <strong>smc_scraper.py</strong> weekly to pull fresh articles. Upload <strong>articles.json</strong> and this file to the SMC Claude Project and ask for a refresh — new articles will be merged, summarised, and given SMC angles. Push the updated file to Vercel. Action labels (Thought Leadership, Repost, Monitor, Ignore) are shared across all viewers and stored in JSONBin.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
