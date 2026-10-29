import { useEffect, useState } from "react";
import "./index.css";

const EVENT = {
  title: "Build Your First AI Project in 60 Minutes",
  date: "Sunday, 8 November 2026",
  time: "7:00 PM IST",
};

const STORAGE_KEY = "nxtwave-growth-hub-registrations";

const initialRegistrations = [
  {
    id: "demo-1",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    college: "ABC Engineering College",
    code: "AARAV101",
    referredBy: "",
    createdAt: "2026-10-28T10:00:00.000Z",
    demo: true,
  },
  {
    id: "demo-2",
    name: "Priya Patel",
    email: "priya@example.com",
    college: "XYZ Institute of Technology",
    code: "PRIYA202",
    referredBy: "AARAV101",
    createdAt: "2026-10-28T11:00:00.000Z",
    demo: true,
  },
  {
    id: "demo-3",
    name: "Rahul Verma",
    email: "rahul@example.com",
    college: "ABC Engineering College",
    code: "RAHUL303",
    referredBy: "AARAV101",
    createdAt: "2026-10-29T08:00:00.000Z",
    demo: true,
  },
];

function loadRegistrations() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialRegistrations;
  } catch {
    return initialRegistrations;
  }
}

function makeCode(name) {
  const prefix =
    name
      .trim()
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, 5) || "STUDENT";

  return `${prefix}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function App() {
  const [activeTab, setActiveTab] = useState("student");
  const [registrations, setRegistrations] = useState(loadRegistrations);
  const [notice, setNotice] = useState("");
  const [myCode, setMyCode] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
    referral: new URLSearchParams(window.location.search).get("ref") || "",
  });
  const [captain, setCaptain] = useState({
    name: "",
    college: "",
    code: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  }, [registrations]);

  const realRegistrations = registrations.filter((r) => !r.demo);
  const referredCount = registrations.filter((r) => r.referredBy).length;
  const target = 500;
  const progress = Math.min((registrations.length / target) * 100, 100);

  const referralStats = registrations.reduce((stats, r) => {
    if (r.referredBy) {
      stats[r.referredBy] = (stats[r.referredBy] || 0) + 1;
    }
    return stats;
  }, {});

  const leaderboard = registrations
    .map((r) => ({
      ...r,
      referrals: referralStats[r.code] || 0,
    }))
    .sort((a, b) => b.referrals - a.referrals)
    .slice(0, 5);

  const collegeStats = registrations.reduce((stats, r) => {
    const college = r.college.trim() || "Other";
    stats[college] = (stats[college] || 0) + 1;
    return stats;
  }, {});

  const colleges = Object.entries(collegeStats).sort((a, b) => b[1] - a[1]);

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function registerStudent(event) {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();
    const name = form.name.trim();
    const college = form.college.trim();

    if (registrations.some((r) => r.email.toLowerCase() === email)) {
      setNotice("This email is already registered in this browser demo.");
      return;
    }

    const code = makeCode(name);
    const referral = form.referral.trim().toUpperCase();
    const validReferral = registrations.some((r) => r.code === referral);

    const newRegistration = {
      id: crypto.randomUUID(),
      name,
      email,
      college,
      code,
      referredBy: validReferral ? referral : "",
      createdAt: new Date().toISOString(),
      demo: false,
    };

    setRegistrations((previous) => [...previous, newRegistration]);
    setMyCode(code);
    setNotice("You're registered in this demo! Your referral code is ready.");
    setForm({
      name: "",
      email: "",
      college: "",
      referral: "",
    });
  }

  function copyText(text) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => setNotice("Copied to clipboard!"))
        .catch(() => setNotice(text));
    } else {
      setNotice(text);
    }
  }

  function shareWhatsApp(text) {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function getReferralLink(code) {
    return `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(code)}`;
  }

  function createCaptainKit(event) {
    event.preventDefault();
    const name = captain.name.trim();
    const college = captain.college.trim();

    if (!name || !college) return;

    const code = captain.code.trim().toUpperCase() || makeCode(name);
    setCaptain({ name, college, code });
    setNotice(`Your campus captain messages are ready, ${name}!`);
  }

  const captainMessages = [
    `Hey everyone! 👋 I'm sharing a free AI workshop: "${EVENT.title}". Build a practical AI project in just 60 minutes. Join us on ${EVENT.date} at ${EVENT.time}. Register here: ${getReferralLink(captain.code)} Use my referral code: ${captain.code}`,
    `Final-year engineers 🚀 Want to build your first AI project? Join this FREE beginner-friendly 60-minute online workshop. No advanced AI experience needed. Date: ${EVENT.date}, ${EVENT.time}. Sign up: ${getReferralLink(captain.code)} Referral code: ${captain.code}`,
    `Quick opportunity for our ${captain.college} community! 🎓 A free online AI project workshop is coming up. Learn by building, not just watching. Invite a friend and register here: ${getReferralLink(captain.code)} My code: ${captain.code}`,
  ];

  const navigation = [
    { id: "student", label: "Student page", icon: "✦" },
    { id: "captain", label: "Campus captain kit", icon: "↗" },
    { id: "tracker", label: "Growth tracker", icon: "▥" },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#home"
          onClick={() => setActiveTab("student")}
        >
          <span className="brand-mark">N</span>
          <span>
            <strong>NxtWave</strong>
            <small>GROWTH HUB</small>
          </span>
        </a>
        <div className="topbar-right">
          <span className="status-dot" />
          Campaign prototype
          <span className="avatar">G</span>
        </div>
      </header>

      <main className="main-container">
        <section className="intro-row">
          <div>
            <div className="eyebrow">
              <span className="sparkle">✳</span> GROWTH CHALLENGE · ROUND 1
            </div>
            <h1>
              Turn curiosity into <span>registrations.</span>
            </h1>
            <p className="intro-copy">
              One workshop. One campus community. 500 future AI builders.
            </p>
          </div>
          <div className="campaign-pill">
            <span className="live-dot" />
            7-DAY CAMPAIGN
          </div>
        </section>

        <nav className="tabbar" aria-label="Main navigation">
          {navigation.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setNotice("");
              }}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {notice && (
          <div className="notice" role="status">
            <span>✓</span> {notice}
            <button onClick={() => setNotice("")} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        {activeTab === "student" && (
          <section className="student-view">
            <div className="hero-card">
              <div className="hero-content">
                <span className="hero-label">FREE ONLINE WORKSHOP</span>
                <h2>
                  Build Your First
                  <br />
                  <span>AI Project</span> in 60 Minutes.
                </h2>
                <p>
                  Stop just reading about AI. Start building something you can
                  share, demonstrate and talk about in your next interview.
                </p>
                <div className="hero-details">
                  <span>◷ 60 minutes</span>
                  <span>▣ Online</span>
                  <span>✦ Beginner-friendly</span>
                </div>
                <div className="hero-date">
                  <span className="date-icon">▦</span>
                  <span>
                    <strong>{EVENT.date}</strong>
                    <small>{EVENT.time}</small>
                  </span>
                </div>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="code-window">
                  <div className="window-dots">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="code-line">
                    <b>01</b> <span>build</span>(<em>"your idea"</em>)
                  </div>
                  <div className="code-line">
                    <b>02</b> <span>connect</span>(<em>AI</em>)
                  </div>
                  <div className="code-line">
                    <b>03</b> <span>ship</span>(<em>project</em>)
                  </div>
                  <div className="code-result">✓ Project ready</div>
                </div>
                <div className="floating-chip chip-top">AI ✳</div>
                <div className="floating-chip chip-bottom">60 MIN</div>
              </div>
            </div>

            <div className="student-grid">
              <div className="benefits-panel">
                <div className="section-kicker">YOUR NEXT STEP STARTS HERE</div>
                <h3>One hour. A real project. A new skill.</h3>
                <div className="benefit-item">
                  <span className="benefit-icon purple">⌘</span>
                  <div>
                    <strong>Build by doing</strong>
                    <p>Follow along and create a small AI project.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon green">↗</span>
                  <div>
                    <strong>Show what you made</strong>
                    <p>Leave with a practical outcome to discuss.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon orange">♧</span>
                  <div>
                    <strong>Start as a beginner</strong>
                    <p>Explore AI without needing advanced experience.</p>
                  </div>
                </div>
                <div className="social-proof">
                  <div className="mini-avatars">
                    <i>A</i>
                    <i>P</i>
                    <i>R</i>
                    <i>+</i>
                  </div>
                  <span>
                    <strong>{registrations.length} demo registrations</strong>
                    <small>Local prototype data</small>
                  </span>
                </div>
              </div>

              <div className="form-card">
                <div className="form-heading">
                  <span className="form-step">YOUR SPOT STARTS HERE</span>
                  <h3>Register for free</h3>
                  <p>Just a few details. No payment needed.</p>
                </div>
                <form onSubmit={registerStudent}>
                  <label htmlFor="student-name">Full name</label>
                  <input
                    id="student-name"
                    name="name"
                    value={form.name}
                    onChange={updateForm}
                    placeholder="e.g. Atharva Lohakare"
                    required
                    minLength={2}
                  />

                  <label htmlFor="student-email">Email address</label>
                  <input
                    id="student-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateForm}
                    placeholder="you@example.com"
                    required
                  />

                  <label htmlFor="student-college">College / university</label>
                  <input
                    id="student-college"
                    name="college"
                    value={form.college}
                    onChange={updateForm}
                    placeholder="Your engineering college"
                    required
                  />

                  <label htmlFor="student-referral">
                    Referral code <span className="optional">(optional)</span>
                  </label>
                  <input
                    id="student-referral"
                    name="referral"
                    value={form.referral}
                    onChange={updateForm}
                    placeholder="Enter your friend's code"
                  />

                  <button className="primary-button full-button" type="submit">
                    Register for the workshop <span>→</span>
                  </button>
                  <p className="privacy-note">
                    ♧ Demo only · Details stay in this browser
                  </p>
                </form>

                {myCode && (
                  <div className="success-card">
                    <div className="success-icon">✓</div>
                    <div>
                      <strong>You're on the demo list!</strong>
                      <p>
                        Your referral code: <b>{myCode}</b>
                      </p>
                      <button
                        className="text-button"
                        onClick={() => copyText(getReferralLink(myCode))}
                      >
                        Copy your referral link →
                      </button>
                      <button
                        className="text-button"
                        onClick={() =>
                          shareWhatsApp(
                            `Join me at ${EVENT.title}! It's free. Register: ${getReferralLink(myCode)}`,
                          )
                        }
                      >
                        Share on WhatsApp ↗
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "captain" && (
          <section className="page-section">
            <div className="section-header">
              <div>
                <div className="section-kicker">CAMPUS AMBASSADOR TOOLKIT</div>
                <h2>
                  Make sharing <span>effortless.</span>
                </h2>
                <p>Generate ready-to-send messages for your college groups.</p>
              </div>
              <div className="section-illustration">↗</div>
            </div>

            <div className="captain-layout">
              <div className="form-card captain-form-card">
                <h3>Set up your captain kit</h3>
                <p>Personalise your messages in seconds.</p>
                <form onSubmit={createCaptainKit}>
                  <label htmlFor="captain-name">Your name</label>
                  <input
                    id="captain-name"
                    value={captain.name}
                    onChange={(e) =>
                      setCaptain({ ...captain, name: e.target.value })
                    }
                    placeholder="Enter your name"
                    required
                  />
                  <label htmlFor="captain-college">Your college</label>
                  <input
                    id="captain-college"
                    value={captain.college}
                    onChange={(e) =>
                      setCaptain({ ...captain, college: e.target.value })
                    }
                    placeholder="Enter your college"
                    required
                  />
                  <label htmlFor="captain-code">
                    Referral code <span className="optional">(optional)</span>
                  </label>
                  <input
                    id="captain-code"
                    value={captain.code}
                    onChange={(e) =>
                      setCaptain({ ...captain, code: e.target.value })
                    }
                    placeholder="e.g. ATHARVA01"
                  />
                  <button className="primary-button full-button" type="submit">
                    Generate my messages →
                  </button>
                </form>
                <div className="captain-tip">
                  <span>✦</span> Tip: Share in groups you already belong to, and
                  follow each group's rules.
                </div>
              </div>

              <div className="message-list">
                <div className="messages-title">
                  <div>
                    <h3>Your message kit</h3>
                    <p>Three styles. One simple goal.</p>
                  </div>
                  <span className="count-badge">03 MESSAGES</span>
                </div>
                {captainMessages.map((message, index) => (
                  <article className="message-card" key={index}>
                    <div className="message-top">
                      <span className="message-number">0{index + 1}</span>
                      <strong>
                        {
                          [
                            "Friendly invite",
                            "Project-first pitch",
                            "Campus community",
                          ][index]
                        }
                      </strong>
                    </div>
                    <p>{message}</p>
                    <div className="message-actions">
                      <button
                        className="secondary-button"
                        onClick={() => copyText(message)}
                      >
                        ▣ Copy message
                      </button>
                      <button
                        className="whatsapp-button"
                        onClick={() => shareWhatsApp(message)}
                      >
                        ↗ WhatsApp
                      </button>
                    </div>
                  </article>
                ))}
                <p className="helper-note">
                  Messages are generated locally. No messages are sent
                  automatically.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "tracker" && (
          <section className="page-section">
            <div className="section-header tracker-header">
              <div>
                <div className="section-kicker">CAMPAIGN ANALYTICS</div>
                <h2>
                  Every registration <span>counts.</span>
                </h2>
                <p>Track demo sign-ups, referrals and college reach.</p>
              </div>
              <button
                className="secondary-button"
                onClick={() => {
                  const rows = [
                    [
                      "Name",
                      "Email",
                      "College",
                      "Referral code",
                      "Referred by",
                      "Demo",
                    ],
                  ];
                  registrations.forEach((r) =>
                    rows.push([
                      r.name,
                      r.email,
                      r.college,
                      r.code,
                      r.referredBy,
                      r.demo ? "Yes" : "No",
                    ]),
                  );
                  const csv = rows
                    .map((row) =>
                      row
                        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                        .join(","),
                    )
                    .join("\n");
                  const url = URL.createObjectURL(
                    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "nxtwave-demo-registrations.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                ↓ Export CSV
              </button>
            </div>

            <div className="demo-banner">
              <span>ⓘ</span>
              <div>
                <strong>Prototype data, not live campaign results</strong>
                <p>
                  Counts are stored in this browser only. Demo seed records are
                  included to demonstrate the tracker. Real campaign use needs a
                  shared backend or Google Sheet.
                </p>
              </div>
            </div>

            <div className="metric-grid">
              <div className="metric-card">
                <div className="metric-label">
                  Total demo registrations <span>↗</span>
                </div>
                <div className="metric-value">
                  {registrations.length}
                  <small> / {target}</small>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="metric-foot">
                  {progress.toFixed(1)}% of target shown
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">
                  Referral registrations <span>♧</span>
                </div>
                <div className="metric-value">{referredCount}</div>
                <div className="metric-foot">
                  Registrations with a valid code
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">
                  Colleges reached <span>▦</span>
                </div>
                <div className="metric-value">{colleges.length}</div>
                <div className="metric-foot">
                  Unique colleges in this browser
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">
                  New demo sign-ups <span>✦</span>
                </div>
                <div className="metric-value">{realRegistrations.length}</div>
                <div className="metric-foot">Added through the form</div>
              </div>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="analytics-heading">
                  <div>
                    <h3>Referral leaderboard</h3>
                    <p>Students bringing friends</p>
                  </div>
                  <span className="tiny-icon">♧</span>
                </div>
                {leaderboard.length ? (
                  leaderboard.map((r, index) => (
                    <div className="leader-row" key={r.id}>
                      <span className={`rank rank-${index + 1}`}>
                        {index + 1}
                      </span>
                      <span className="leader-avatar">
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="leader-info">
                        <strong>{r.name}</strong>
                        <small>{r.code}</small>
                      </div>
                      <span className="leader-score">
                        {r.referrals} <small>referrals</small>
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No registrations yet.</p>
                )}
              </div>

              <div className="analytics-card">
                <div className="analytics-heading">
                  <div>
                    <h3>College-wise reach</h3>
                    <p>Registrations by institution</p>
                  </div>
                  <span className="tiny-icon">▦</span>
                </div>
                {colleges.length ? (
                  colleges.map(([college, count]) => (
                    <div className="college-row" key={college}>
                      <div className="college-meta">
                        <strong>{college}</strong>
                        <span>{count}</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="college-fill"
                          style={{
                            width: `${Math.min((count / Math.max(...colleges.map((c) => c[1]))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">
                    College counts will appear here.
                  </p>
                )}
              </div>
            </div>

            <div className="table-card">
              <div className="analytics-heading">
                <div>
                  <h3>Recent registrations</h3>
                  <p>Local browser demo records</p>
                </div>
                <span className="count-badge">
                  {registrations.length} TOTAL
                </span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>STUDENT</th>
                      <th>COLLEGE</th>
                      <th>REFERRAL CODE</th>
                      <th>REFERRED BY</th>
                      <th>TYPE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...registrations].reverse().map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.name}</strong>
                          <small>{r.email}</small>
                        </td>
                        <td>{r.college}</td>
                        <td>
                          <span className="code-pill">{r.code}</span>
                        </td>
                        <td>{r.referredBy || "—"}</td>
                        <td>
                          <span
                            className={`type-pill ${r.demo ? "seed" : "new"}`}
                          >
                            {r.demo ? "Sample" : "Demo signup"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                className="reset-button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Reset all demo data and remove registrations saved in this browser?",
                    )
                  ) {
                    setRegistrations(initialRegistrations);
                    setMyCode("");
                    setNotice("Demo data has been reset.");
                  }
                }}
              >
                Reset browser demo data
              </button>
            </div>
          </section>
        )}

        <footer className="footer">
          <div className="footer-brand">
            <span className="brand-mark">N</span>
            <span>
              <strong>NxtWave Growth Hub</strong>
              <small>Build. Share. Grow.</small>
            </span>
          </div>
          <span>Student growth campaign prototype · 2026</span>
          <span className="footer-note">
            Demo only — not an official NxtWave registration service.
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
