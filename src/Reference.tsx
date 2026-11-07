import {
  useEffect,
  useState,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { set, get, del } from "idb-keyval";
import { ArrowLeft, Check, Trophy, FileText, Camera } from "lucide-react";
import copy from "./copy.json";
import "./wire.css";

type FileRec = { name: string; key?: string; checks: string[] };
type Workspace = {
  city: string;
  uni: string;
  country: string;
  lang: string;
  started: boolean;
  docs: (FileRec | null)[];
  practice: boolean;
  outcome: string;
  note: string;
  actions: {
    title: string;
    date: string;
    time: string;
    remind: boolean;
    done: boolean;
  }[];
};
const initial: Workspace = {
  city: "",
  uni: "",
  country: "",
  lang: "English",
  started: false,
  docs: [null, null, null],
  practice: false,
  outcome: "",
  note: "",
  actions: [],
};
const key = "passopasso.pdf.v2",
  names = [
    "Identity Document",
    "Appointment Confirmation",
    "Student Details Form",
  ],
  langs = ["English", "Italiano", "Español", "中文", "Français"];
const samples = [
  ["Passport_v1.pdf", "My_Passport.jpg", "Photo_1.jpg"],
  ["Booking.pdf", "Confirmation.jpg", "Email.pdf"],
  ["Student_Form.pdf", "Details.jpg", "Form_v2.pdf"],
];
const screenNames = [
  "",
  "Welcome",
  "Language",
  "About You",
  "Profile validation",
  "Starting point",
  "Procedure Map",
  "Edit Profile",
  "Recommendation",
  "Step details",
  "Source details",
  "Checklist",
  "Add Item",
  "Picker",
  "Preview",
  "File added",
  "Self-Check Intro",
  "Comparison",
  "Zoom Example",
  "Confirm details",
  "Readiness",
  "Issue Details",
  "Tips",
  "Recovery",
  "Add Reminder",
  "My Plan",
  "Practice Intro",
  "Practice Q1",
  "Feedback",
  "Success",
  "Record Outcome",
];
const labels: Record<string, string> = {
  "23b": "Contact Office",
  "28b": "Incorrect Feedback",
  "30b": "Incomplete Visit",
  "12b": "Upload Error",
  "27b": "Practice Q2",
  "28c": "Feedback",
  help: "Help",
  steps: "Understand Requirements",
};
const route = () => {
  let id = location.hash.slice(1);
  return (/^([1-9]|[12][0-9]|30)$/.test(id) || Object.hasOwn(labels,id) || id === "sheets") ? id : "1";
};
const pos = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: (x / 213) * 100 + "%",
  top: (y / 380) * 100 + "%",
  width: (w / 213) * 100 + "%",
  height: (h / 380) * 100 + "%",
});
export default function Reference() {
  const [s, S] = useState<Workspace>(() => {
      try {
        return (
          JSON.parse(localStorage.getItem(key) || "null") ||
          structuredClone(initial)
        );
      } catch {
        return structuredClone(initial);
      }
    }),
    [page, G] = useState(route);
  const [draft, D] = useState({ city: s.city, uni: s.uni, country: s.country }),
    [langFrom, L] = useState("1"),
    [doc, I] = useState(() =>
      Math.min(2, Math.max(0, Number(sessionStorage.getItem("pp.doc")) || 0)),
    ),
    [file, F] = useState<File | null>(null),
    [pick, P] = useState(1),
    [sel, A] = useState(1),
    [q, Q] = useState(() => sessionStorage.getItem("pp.quiz")==="2"?2:1),
    [checks, C] = useState(["Present", "Present", "Missing"]),
    [action, T] = useState(() => Number(sessionStorage.getItem("pp.action")==="1")),
    [date, Dt] = useState(""),
    [time, Tm] = useState("09:00"),
    [rem, R] = useState(true),
    [modal, M] = useState(""),
    [undo, U] = useState<Workspace | null>(null),
    [sheet, Sh] = useState(1),
    [out, O] = useState(s.outcome || "Completed successfully"),
    [note, N] = useState(s.note),
    [tempUrl, Url] = useState(""),
    [why, Why] = useState(""),
    [busy, B] = useState(false),
    [fresh, Fr] = useState(false);
  const chooser = useRef<HTMLInputElement>(null),
    camera = useRef<HTMLInputElement>(null);
  const d = s.docs[doc],
    current = samples[doc],
    fileName = file?.name || current[pick],
    missing = checks
      .map((v, i) =>
        v === "Present"
          ? ""
          : ["Student Full Name", "Appointment Date", "Office Location"][i],
      )
      .filter(Boolean),
    actionTitle = action ? "Contact Student Office" : "Check original email";
  const set = (p: Partial<Workspace>) => S((old) => ({ ...old, ...p }));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(s));
    } catch {
      M("storage");
    }
  }, [s]);
  useEffect(() => {
    const h = () => {
      G(route());
      M("");
    };
    window.addEventListener("hashchange", h);window.addEventListener("popstate",h);
    return () => {window.removeEventListener("hashchange", h);window.removeEventListener("popstate",h)};
  }, []);
  useEffect(() => {
    let alive = true,
      u = "";
    Url("");
    (async () => {
      const f = page === "14" ? file : d?.key ? await get<File>(d.key) : null;
      if (f && alive) {
        u = URL.createObjectURL(f);
        Url(u);
      }
    })().catch(() => {});
    return () => {
      alive = false;
      if (u) URL.revokeObjectURL(u);
    };
  }, [file, page, d?.key]);
  useEffect(()=>{sessionStorage.setItem("pp.quiz",String(q));sessionStorage.setItem("pp.action",String(action));sessionStorage.setItem("pp.doc",String(doc));},[q,action,doc]);
  useEffect(()=>{if(route()==="14"){history.replaceState(history.state,"","#12");G("12")} },[]);
  function go(v: string) {
    if (v !== page) {
      history.pushState({ppNav:true}, "", "#"+v);
      G(v);
    }
    M("");
  }
  function back(fallback = "6") {
    if(history.state?.ppNav){history.back();return}
    const p=s.started?fallback:"1";
    history.replaceState(null,"","#"+p);G(p);
    M("");
  }
  const putDoc = (v: FileRec | null) =>
    set({ docs: s.docs.map((r, j) => (j === doc ? v : r)) });
  function openDoc(i: number) {
    sessionStorage.setItem("pp.doc", String(i));
    I(i);
    F(null);
    P(1);
    Fr(false);
    C(
      s.docs[i]?.checks.length
        ? s.docs[i]!.checks.slice()
        : ["Present", "Present", "Missing"],
    );
    go(s.docs[i] ? "15" : "12");
  }
  function accept(f: File | undefined) {
    if (!f) return;
    if (
      f.size > 5 * 1024 * 1024 ||
      !["application/pdf", "image/jpeg", "image/png"].includes(f.type)
    ) {
      Why(f.name);
      go("12b");
      return;
    }
    F(f);
    go("14");
  }
  async function persist() {
    B(true);
    try {
      let id: string | undefined;
      if (file) {
        id = crypto.randomUUID();
        await setBlob(id, file);
      }
      putDoc({ name: fileName, key: id, checks: [] });
      Fr(true);
      go("15");
      if (d?.key) await del(d.key);
    } catch {
      M("storage");
    } finally {
      B(false);
    }
  }
  const startPractice = () => {
    Q(1);
    A(1);
    go("26");
  };
  const profile = () => {
    D({ city: s.city, uni: s.uni, country: s.country });
    go("3");
  };
  function saveProfile() {
    if (!draft.city || !draft.uni || !draft.country.trim()) {
      go("4");
      setTimeout(() => M("required"), 50);
      return;
    }
    U(s);
    set({ ...draft, started: true });
    go(s.started ? "7" : "5");
    if (s.started) setTimeout(() => M("saved"), 80);
  }
  function saveAction(withDate = true) {
    U(s);
    set({
      actions: [
        ...s.actions,
        {
          title: actionTitle,
          date: withDate ? date : "",
          time: withDate ? time : "",
          remind: withDate && rem,
          done: false,
        },
      ],
    });
    go("25");
  }
  const speak = () => {
    try {
      if (!window.speechSynthesis) throw Error();
      const v = new SpeechSynthesisUtterance(
        "Mi scusi, ho una domanda sul luogo del mio appuntamento.",
      );
      v.lang = "it-IT";
      speechSynthesis.speak(v);
    } catch {
      M("audio");
    }
  };
  const hit = (
    name: string,
    x: number,
    y: number,
    w: number,
    h: number,
    fn: () => void,
    cl = "",
  ) => (
    <button
      key={name}
      className={"hit " + cl}
      style={pos(x, y, w, h)}
      aria-label={name}
      title={name}
      onClick={fn}
    />
  );
  const live = (
    x: number,
    y: number,
    w: number,
    h: number,
    child: ReactNode,
    cl = "",
  ) => (
    <div className={"live " + cl} style={pos(x, y, w, h)}>
      {child}
    </div>
  );
  const btn = (t: string, fn: () => void, white = false) => (
    <button className={white ? "out" : "blk"} onClick={fn}>
      {t}
    </button>
  );
  const bar = (t: string) => (
    <header className="bar">
      <button aria-label="Back" onClick={() => back()}>
        <ArrowLeft size={17} />
      </button>
      {t}
      <span className="w-8" />
    </header>
  );
  const native = (title: string, body: ReactNode) => (
    <section className="native">
      {bar(title)}
      <div className="body">{body}</div>
    </section>
  );
  const backHot = () => hit("Back", 0, 0, 31, 32, () => back());
  const xHot = (fn = () => back()) => hit("Close", 181, 0, 32, 32, fn);
  const opt = (t: string, selected: boolean, fn: () => void) => (
    <button
      key={t}
      className={"opt " + (selected ? "on" : "")}
      aria-pressed={selected}
      onClick={fn}
    >
      {t}
    </button>
  );
  const field = (k: "city" | "uni" | "country", val: string) =>
    D({ ...draft, [k]: val });
  const cities = ["Bologna", "Turin", "Padua", "Milan", "Other"],
    unis = [
      "University of Bologna",
      "Politecnico di Torino",
      "University of Turin",
      "University of Padua",
      "Other university",
    ];
  const select = (
    name: string,
    values: string[],
    value: string,
    fn: (v: string) => void,
  ) => (
    <select
      aria-label={name}
      value={value}
      onChange={(e) => fn(e.target.value)}
      className="w-full h-full bg-white border border-black px-2"
    >
      <option value="">Select {name}</option>
      {values.map((v) => (
        <option key={v}>{v}</option>
      ))}
    </select>
  );
  const paper = Object.hasOwn(copy, page);
  let ui: ReactNode = null;
  switch (page) {
    case "1":
      ui = (
        <>
          {hit("Create my plan", 14, 137, 185, 35, () => {
            D({ city: "", uni: "", country: "" });
            go("3");
          })}
          {hit("Continue saved plan", 14, 180, 185, 35, () =>
            s.started ? go("6") : M("noPlan"),
          )}
          {hit("Select language", 48, 337, 117, 41, () => {
            L("1");
            go("2");
          })}
          {s.lang !== "English" && live(84, 352, 45, 15, s.lang)}
        </>
      );
      break;
    case "2":
      ui = (
        <>
          {hit("Close", 0, 0, 35, 32, () => go(langFrom))}
          {langs.map((l, i) =>
            s.lang === "English"
              ? hit(l, 10, 43 + i * 37, 193, 34, () => {
                  set({ lang: l });
                  go(langFrom);
                })
              : live(
                  10,
                  43 + i * 37,
                  193,
                  34,
                  <button
                    className={
                      "w-full h-full text-left px-4 " +
                      (s.lang === l ? "font-bold chosen" : "line")
                    }
                    onClick={() => {
                      set({ lang: l });
                      go(langFrom);
                    }}
                  >
                    {l}
                    {s.lang === l ? " ✓" : ""}
                  </button>,
                ),
          )}
        </>
      );
      break;
    case "3":
      ui = (
        <>
          {hit("Back", 0, 0, 34, 32, () => M("cancel"))}
          {live(
            15,
            104,
            184,
            26,
            select("City", cities, draft.city, (v) => field("city", v)),
          )}
          {live(
            15,
            151,
            184,
            26,
            select("University", unis, draft.uni, (v) => field("uni", v)),
          )}
          {live(
            15,
            197,
            184,
            27,
            <input
              aria-label="Passport Country"
              placeholder="Type here..."
              value={draft.country}
              onChange={(e) => field("country", e.target.value)}
              className="w-full h-full border border-black px-2"
            />,
          )}
          {hit("Next", 14, 241, 186, 30, saveProfile)}
        </>
      );
      break;
    case "4":
      ui = native(
        "Personalise",
        <>
          <label>
            City{select("City", cities, draft.city, (v) => field("city", v))}
          </label>
          <label>
            University
            {select("University", unis, draft.uni, (v) => field("uni", v))}
          </label>
          <label>
            Passport Country
            <input
              value={draft.country}
              onChange={(e) => field("country", e.target.value)}
            />
          </label>
          <p className="label">Please complete the required fields.</p>
          {btn("Next", saveProfile)}
        </>,
      );
      break;
    case "5":
      ui = native(
        "Your plan",
        <>
          <h2>Prepare for a document-check visit</h2>
          <div className="notice">
            {s.uni}
            <br />
            {s.city} · {s.lang}
          </div>
          <p>
            Review the requirements, prepare your documents and practise your
            visit.
          </p>
          {btn("View my steps", () => go("6"))}
        </>,
      );
      break;
    case "6":
      ui = (
        <>
          {s.uni &&
            s.uni !== unis[0] &&
            live(19, 6, 159, 20, s.uni, "left font-bold")}
          {hit("Menu", 176, 0, 37, 31, () => M("menu"))}
          {hit("Understand Requirements", 10, 66, 188, 37, () => go("steps"))}
          {hit("Prepare Documents", 10, 104, 193, 43, () => go("8"))}
          {hit("Practise the Visit", 10, 149, 190, 47, startPractice)}
          {s.practice &&
            live(41, 172, 110, 13, "COMPLETED BY YOU", "mini left")}
          {s.outcome &&
            live(
              41,
              213,
              150,
              30,
              <button onClick={() => go("30")}>Visit: {s.outcome}</button>,
              "left",
            )}
          {hit("My Steps", 0, 341, 70, 38, () => go("6"))}
          {hit("My Plan", 70, 341, 71, 38, () => go("25"))}
          {hit("Help", 141, 341, 71, 38, () => go("help"))}
        </>
      );
      break;
    case "7":
      ui = (
        <>
          {backHot()}
          {s.city &&
            s.city !== "Bologna" &&
            live(15, 111, 150, 17, s.city, "left font-bold")}
          {s.uni &&
            s.uni !== unis[0] &&
            live(15, 148, 155, 17, s.uni, "left font-bold")}
          {s.lang !== "English" && live(15, 184, 150, 17, s.lang, "left")}
          {hit("Edit city", 12, 95, 188, 34, profile)}
          {hit("Edit university", 12, 132, 188, 35, profile)}
          {hit("Edit language", 12, 170, 188, 33, () => {
            L("7");
            go("2");
          })}
          {hit("Update Details", 12, 224, 188, 32, profile)}
        </>
      );
      break;
    case "8":
      ui = (
        <>
          {backHot()}
          {hit("Open Step 2", 14, 253, 185, 35, () => go("9"))}
        </>
      );
      break;
    case "9":
      ui = native(
        "Step 2: Prepare Documents",
        <>
          <div>
            <b className="label">Purpose</b>
            <p>
              To ensure all required documents are correct for university
              submission.
            </p>
          </div>
          <div>
            <b className="label">What you need</b>
            <ul className="list-disc pl-4">
              {names.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          <div>
            <b className="label">What you will do</b>
            <p>
              Add photos of your documents and compare them to official
              examples.
            </p>
          </div>
          <button
            className="opt underline italic fine"
            onClick={() => go("10")}
          >
            Official Guideline: Document Check
          </button>
          {btn("Go to Checklist", () => go("11"))}
        </>,
      );
      break;
    case "10":
    case "steps":
      ui = native(
        "Understand Requirements",
        <>
          <h2>Document-check visit</h2>
          <p className="notice">
            Read your booking email before preparing the three documents.
          </p>
          <p>
            Bring your identity document, appointment confirmation and student
            details form.
          </p>
          <small>
            University guidance in this prototype is a classroom example.
          </small>
          {btn("Prepare Documents", () => go("9"))}
          {btn("My Steps", () => go("6"), true)}
        </>,
      );
      break;
    case "11":
      ui = (
        <>
          {backHot()}
          {hit("Help", 182, 0, 30, 32, () => go("help"))}
          {names.map((n, i) => (
            <span key={n}>
              {s.docs[i] &&
                live(
                  24,
                  89 + i * 49,
                  145,
                  14,
                  s.docs[i]!.checks.length
                    ? s.docs[i]!.checks.every((x) => x === "Present")
                      ? "SELF-CHECKED"
                      : "NEEDS YOUR REVIEW"
                    : "FILE ADDED",
                  "mini left",
                )}
              {hit(n, 14, 68 + i * 49, 185, 41, () => openDoc(i))}
            </span>
          ))}
          {s.docs.some(Boolean) &&
            live(
              15,
              285,
              184,
              34,
              btn("Check readiness", () => go("20"), true),
            )}
        </>
      );
      break;
    case "12":
      ui = (
        <>
          {xHot(() => go("11"))}
          {doc !== 0 && live(8, 6, 165, 22, names[doc], "left font-bold")}
          {hit("Upload or drop", 14, 46, 184, 92, () =>
            chooser.current?.click(),
          )}
          {hit("Take Photo", 14, 155, 184, 35, () => camera.current?.click())}
          {hit("Choose from Files", 14, 199, 184, 35, () => go("13"))}
        </>
      );
      break;
    case "13":
      ui = (
        <>
          {xHot(() => go("12"))}
          {current.map((n, i) => (
            <span key={n}>
              {(doc !== 0 || pick !== 1) &&
                live(
                  i === 1 ? 112 : 9,
                  i === 2 ? 99 : 42,
                  92,
                  47,
                  <>
                    <FileText size={20} />
                    <small>{n}</small>
                  </>,
                  "flex-col mini " + (pick === i ? "chosen" : "line"),
                )}
              {hit(n, i === 1 ? 111 : 9, i === 2 ? 99 : 42, 93, 47, () => {
                F(null);
                P(i);
              })}
            </span>
          ))}
          {hit("Attach Selected", 9, 342, 194, 28, () => go("14"))}
        </>
      );
      break;
    case "14":
      ui = native(
        "Preview File",
        <>
          <div className="h-[91cqw] bg-gray-50 border border-black grid place-content-center justify-items-center">
            {tempUrl && file?.type.startsWith("image/") ? (
              <img className="fileview" src={tempUrl} alt="Selected document" />
            ) : (
              <FileText size={48} />
            )}
            <b>{fileName}</b>
            {tempUrl && (
              <a
                href={tempUrl}
                target="_blank"
                rel="noreferrer"
                className="under"
              >
                Open full preview
              </a>
            )}
          </div>
          <div className="notice label">{names[doc]}</div>
          <button className="blk" disabled={busy} onClick={persist}>
            {busy ? "Saving…" : "CONFIRM FILE"}
          </button>
          <button className="under" onClick={() => go("12")}>
            Replace
          </button>
        </>,
      );
      break;
    case "15":
      ui = native(
        "File added",
        <>
          <h2>{fresh ? "Saved to your checklist" : names[doc]}</h2>
          <div className="notice">{d?.name || "No file yet"}</div>
          <p className="fine">
            Saved to your checklist. Not submitted to the university.
          </p>
          {btn("Start self-check", () => go("16"))}
          {btn(
            "Replace file",
            () => {
              F(null);
              go("12");
            },
            true,
          )}
          <button className="under" onClick={() => M("remove")}>
            Remove file
          </button>
        </>,
      );
      break;
    case "16":
      ui = <>{hit("Start comparison", 14, 208, 185, 34, () => go("17"))}</>;
      break;
    case "17":
      ui = (
        <>
          {tempUrl &&
            live(
              111,
              100,
              94,
              130,
              <a href={tempUrl} target="_blank" rel="noreferrer">
                Open my document
              </a>,
            )}
          {d?.name &&
            d.name !== "My_Passport.jpg" &&
            live(112, 231, 95, 17, d.name, "mini")}
          {hit("Zoom official example", 0, 18, 106, 304, () => go("18"))}
          {["Present", "Missing", "Not sure"].map((t, i) =>
            hit(t, 9 + i * 66, 347, 62, 25, () => {
              C([t, "Present", "Missing"]);
              go("19");
            }),
          )}
        </>
      );
      break;
    case "18":
      ui = (
        <>
          {backHot()}
          {hit("Zoom example detail", 177, 0, 34, 31, () => M("zoom"))}
          {hit("Back to Compare", 14, 210, 185, 34, () => go("17"))}
        </>
      );
      break;
    case "19":
      ui = native(
        "Confirm Self-Check",
        <>
          <b>Checklist items:</b>
          {["Student Full Name", "Appointment Date", "Office Location"].map(
            (t, i) => (
              <div key={t} className="border-b pb-3">
                <b className="fine">{t}</b>
                <div className="flex gap-2 mt-2">
                  {["Present", "Missing", "Not sure"].map((v) => (
                    <button
                      key={v}
                      onClick={() => C(checks.map((c, j) => (i === j ? v : c)))}
                      className={
                        "border p-2 label " +
                        (checks[i] === v ? "bg-black text-white" : "")
                      }
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ),
          )}
          {btn(
            "Save Self-Check",
            () => {
              if (d) putDoc({ ...d, checks });
              go("20");
            },
            true,
          )}
        </>,
      );
      break;
    case "20":
      ui = native(
        "Readiness Check",
        <>
          <h2>Document readiness</h2>
          {names.map((n, i) => (
            <button className="opt" key={n} onClick={() => openDoc(i)}>
              <b>{n}</b>
              <br />
              {!s.docs[i]
                ? "Missing"
                : s.docs[i]?.checks.length
                  ? s.docs[i]?.checks.every((x) => x === "Present")
                    ? "Self-checked"
                    : "Needs your review"
                  : "File added"}
            </button>
          ))}
          {s.docs.some((v) => v?.checks.some((c) => c !== "Present")) &&
            btn("Resolve Issue", () => {
              const i = s.docs.findIndex((v) =>
                v?.checks.some((c) => c !== "Present"),
              );
              I(i);
              C(s.docs[i]!.checks);
              go("21");
            })}
          {btn("Practise the Visit", startPractice, true)}
        </>,
      );
      break;
    case "21":
      ui = (
        <>
          {backHot()}
          {hit("Help", 180, 0, 32, 32, () => go("help"))}
          {(doc !== 1 || !missing.includes("Office Location")) &&
            live(
              14,
              44,
              184,
              50,
              <div>
                <b>Details missing</b>
                <p className="fine">
                  {names[doc]}: {missing.join(", ") || "check your file"}.
                </p>
              </div>,
              "left",
            )}
          {hit("Find Location", 14, 210, 184, 33, () => go("22"))}
        </>
      );
      break;
    case "22":
      ui = (
        <>
          {backHot()}
          {hit("More options", 179, 0, 33, 32, () => M("menu"))}
          {hit("Official guidance", 14, 45, 184, 58, () => go("10"))}
          {hit("Ask for Help", 13, 242, 186, 34, () => go("23"))}
          {hit("Peer tip", 14, 111, 184, 56, () => go("23"))}
        </>
      );
      break;
    case "23":
      ui = (
        <>
          {backHot()}
          {xHot(() => go("6"))}
          {hit("Check original email", 14, 72, 184, 43, () => {
            T(0);
            go("24");
          })}
          {hit("Contact Student Office", 14, 120, 184, 43, () => {
            T(1);
            go("23b");
          })}
          {hit("Save to My Plan", 14, 183, 184, 34, () => go("24"))}
        </>
      );
      break;
    case "23b":
      ui = (
        <>
          {backHot()}
          {hit("Record call in My Plan", 14, 217, 185, 35, () => {
            T(1);
            go("24");
          })}
          {hit("Check email instead", 14, 262, 185, 27, () => {
            T(0);
            go("24");
          })}
        </>
      );
      break;
    case "24":
      ui = native(
        "Add Reminder",
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveAction();
          }}
          className="grid gap-5"
        >
          <p>When will you do this?</p>
          <label>
            DATE
            <input
              type="date"
              required
              value={date}
              onChange={(e) => Dt(e.target.value)}
            />
          </label>
          <label>
            TIME
            <input
              type="time"
              required
              value={time}
              onChange={(e) => Tm(e.target.value)}
            />
          </label>
          <label className="!flex items-center">
            <input
              type="checkbox"
              checked={rem}
              onChange={(e) => R(e.target.checked)}
            />
            Enable Notifications (in app)
          </label>
          <button className="blk">Confirm Reminder</button>
          <button
            type="button"
            className="under"
            onClick={() => saveAction(false)}
          >
            Skip reminder
          </button>
        </form>,
      );
      break;
    case "25":
      ui = native(
        "My Plan",
        <>
          <h2>Saved actions</h2>
          {!s.actions.length && <p>No actions saved yet.</p>}
          {s.actions.map((a, i) => (
            <button
              key={i}
              className="opt"
              onClick={() =>
                set({
                  actions: s.actions.map((v, j) =>
                    j === i ? { ...v, done: !v.done } : v,
                  ),
                })
              }
            >
              {a.done ? "☑" : "☐"} {a.title}
              <small className="block">
                {a.date} {a.time} {a.remind ? "· In-app reminder" : ""}
              </small>
            </button>
          ))}
          {btn("Return to Checklist", () => go("11"))}
          {btn("Practise the Visit", startPractice, true)}
          {btn("Record Visit Outcome", () => go("30"), true)}
          <button className="under" onClick={() => go("6")}>
            My Steps
          </button>
          {undo && (
            <button
              className="under"
              onClick={() => {
                S(undo);
                U(null);
                M("undone");
              }}
            >
              Undo last save
            </button>
          )}
        </>,
      );
      break;
    case "26":
      ui = (
        <>
          {backHot()}
          {hit("Help", 180, 0, 32, 32, () => go("help"))}
          {hit("Hear pronunciation", 14, 174, 185, 51, speak)}
          {hit("Begin Practice", 14, 245, 185, 34, () => {
            Q(1);
            A(1);
            go("27");
          })}
        </>
      );
      break;
    case "27":
      ui = (
        <>
          {xHot(() => go("6"))}
          {[
            "Where is the office? Tell me now.",
            "Excuse me, I have a question about my appointment location.",
            "I am here for my check. Where do I go?",
          ].map((t, i) =>
            sel === 1
              ? hit(t, 14, [71, 110, 156][i], 185, [30, 40, 31][i], () => A(i))
              : live(
                  14,
                  [71, 110, 156][i],
                  185,
                  [30, 40, 31][i],
                  <button
                    className="w-full h-full text-left px-3"
                    onClick={() => A(i)}
                  >
                    {t}
                  </button>,
                  "mini line " + (sel === i ? "chosen font-bold" : ""),
                ),
          )}
          {hit("Check Answer", 14, 208, 185, 34, () =>
            go(sel === 1 ? "28" : "28b"),
          )}
        </>
      );
      break;
    case "28":
      ui = (
        <>
          {xHot(() => go("6"))}
          {hit("Next Question", 14, 208, 185, 34, () => {
            Q(2);
            A(-1);
            go("27b");
          })}
        </>
      );
      break;
    case "27b":
      ui = native(
        "Question 2/2",
        <>
          <b>How would you confirm the room number?</b>
          {[
            "Excuse me, could you please confirm the office room number?",
            "Just tell me where to go.",
            "I am leaving.",
          ].map((v, i) => opt(v, i === sel, () => A(i)))}
          <button
            className="blk"
            disabled={sel < 0}
            onClick={() => go(sel === 0 ? "28c" : "28b")}
          >
            Check Answer
          </button>
        </>,
      );
      break;
    case "28b":
      ui = (
        <>
          {xHot(() => go("6"))}
          {hit("Try Again", 14, 205, 185, 35, () => go(q === 2 ? "27b" : "27"))}
        </>
      );
      break;
    case "28c":
      ui = native(
        "Question 2/2",
        <>
          <div className="notice">
            <b>Great choice!</b>
          </div>
          <p>
            Asking for the room number makes it clear which detail you need.
          </p>
          <p className="fine italic">
            “Mi scusi, potrebbe confermarmi il numero della stanza?”
          </p>
          {btn("Finish questions", () => {
            set({ practice: true });
            go("29");
          })}
        </>,
      );
      break;
    case "29":
      ui = (
        <section className="native flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 border-4 border-black rounded-full grid place-items-center mb-6">
            <Trophy size={34} />
          </div>
          <h2 className="text-xl font-bold mb-2">Practice Complete!</h2>
          <p className="italic mb-8">“You are ready for your visit.”</p>
          <div className="bg-gray-50 border-2 border-black p-4 mb-8">
            <b className="label">Useful phrase for your visit:</b>
            <p className="fine italic mt-2">
              “Excuse me, could you please confirm the office room number?”
            </p>
          </div>
          {btn("Finish Practice", () => go("30"))}
        </section>
      );
      break;
    case "30":
      ui = native(
        "Post-Visit Record",
        <>
          <b className="uppercase mb-2">How did the visit go?</b>
          {[
            "Completed successfully",
            "More documents requested",
            "Visit postponed",
          ].map((v) => opt(v, out === v, () => O(v)))}
          <label className="label mt-3">
            What did you learn for next time?
            <textarea
              placeholder="Type your reflection here..."
              value={note}
              onChange={(e) => N(e.target.value)}
            />
          </label>
          {btn("Save Final Outcome", () => {
            set({ outcome: out, note });
            go(
              out === "Completed successfully"
                ? "6"
                : out === "Visit postponed"
                  ? "25"
                  : "30b",
            );
          })}
        </>,
      );
      break;
    case "30b":
      ui = (
        <>
          {backHot()}
          {hit("Update Checklist", 14, 188, 185, 38, () => go("11"))}
          {hit("See Recovery Plan", 14, 229, 185, 27, () => go("25"))}
        </>
      );
      break;
    case "12b":
      ui = native(
        "Upload Error",
        <div className="pt-28 text-center space-y-5">
          <h2>Unsupported file</h2>
          <p>“{why}” cannot be added. Use JPG, PNG or PDF, maximum 5 MB.</p>
          {btn("Try Again", () => go("12"))}
          <button className="under" onClick={() => M("file")}>
            Why?
          </button>
        </div>,
      );
      break;
    case "help":
      ui = native(
        "Help",
        <>
          <h2>What do you need?</h2>
          {btn("View guidance and peer tips", () => go("22"), true)}
          {btn(
            "Contact Student Office",
            () => {
              T(1);
              go("23b");
            },
            true,
          )}
          {btn("Return to My Steps", () => go("6"))}
        </>,
      );
      break;
  }
  const dialogs: Record<string, [string, string]> = {
    saved: ["Changes Saved", "Your profile and plan have been updated."],
    required: [
      "MISSING INFO",
      "Please fill in all required fields marked with an asterisk (*) to continue.",
    ],
    noPlan: ["No saved plan", "Create your plan to get started."],
    file: [
      "FILE ERROR",
      "This file type is not supported. Please use JPG, PNG, or PDF.",
    ],
    remove: [
      "Remove this file?",
      (d?.name || "This file") + " will be deleted from your checklist.",
    ],
    cancel: [
      "Unsaved Changes",
      "Are you sure you want to exit? Your progress will not be saved.",
    ],
    undone: ["Action undone.", ""],
    zoom: [
      "Office Location",
      "The office location is usually listed at the top right of your appointment confirmation.",
    ],
    menu: ["My workspace", ""],
    audio: [
      "Pronunciation",
      "Mi scusi, ho una domanda sul luogo del mio appuntamento.",
    ],
    storage: [
      "Device storage unavailable",
      "Please check browser storage and try again.",
    ],
  };
  if (page === "sheets")
    return (
      <main className="sheet">
        <nav className="sheetnav">
          <button onClick={() => go("1")}>Open app</button>
          <select
            aria-label="Reference sheet"
            value={sheet}
            onChange={(e) => Sh(Number(e.target.value))}
          >
            {Array.from({ length: 9 }, (_, i) => (
              <option key={i} value={i + 1}>
                Sheet {i + 1} / 9
              </option>
            ))}
          </select>
          <select
            value=""
            aria-label="Open prototype screen"
            onChange={(e) => go(e.target.value)}
          >
            <option value="">Open screen…</option>
            {screenNames.slice(1).map((n, i) => (
              <option value={i + 1} key={i}>
                S{i + 1} — {n}
              </option>
            ))}
          </select>
        </nav>
        <img
          src={"/sheets/" + sheet + ".webp"}
          alt={"Original UX Pilot sheet " + sheet}
        />
      </main>
    );
  return (
    <main className="stage">
      <div
        className="phone"
        onDragOver={(e) => {
          if (page === "12") e.preventDefault();
        }}
        onDrop={(e) => {
          if (page === "12") {
            e.preventDefault();
            accept(e.dataTransfer.files[0]);
          }
        }}
      >
        <h1 className="sr">{screenNames[Number(page)] || labels[page]}</h1>
        {paper && (
          <img
            className="plate"
            src={"/screens/" + page + ".webp"}
            alt={(copy as Record<string, string>)[page]}
          />
        )}{" "}
        {ui}
        <input
          ref={chooser}
          hidden
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <input
          ref={camera}
          hidden
          type="file"
          capture="environment"
          accept="image/*"
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {modal && (
          <div className="scrim">
            <section
              role="dialog"
              aria-modal="true"
              aria-label={dialogs[modal]?.[0]}
              className="dialog"
            >
              <h2>{dialogs[modal]?.[0]}</h2>
              <p>{dialogs[modal]?.[1]}</p>
              {modal === "saved" ? (
                <>
                  {btn(
                    "Undo",
                    () => {
                      if (undo) S(undo);
                      U(null);
                      M("undone");
                    },
                    true,
                  )}
                  {btn("OK", () => M(""))}
                </>
              ) : modal === "menu" ? (
                <>
                  {btn("My Profile", () => go("7"), true)}
                  {btn("My Plan", () => go("25"), true)}
                  {btn("Record Outcome", () => go("30"), true)}
                  {btn("Close", () => M(""))}
                </>
              ) : modal === "cancel" ? (
                <>
                  {btn("Save and exit", saveProfile)}
                  {btn(
                    "Exit without saving",
                    () => go(s.started ? "6" : "1"),
                    true,
                  )}
                  {btn("Back to edit", () => M(""), true)}
                </>
              ) : modal === "remove" ? (
                <>
                  {btn("Keep", () => M(""), true)}
                  {btn("Remove", async () => {
                    try {
                      if (d?.key) await del(d.key);
                      putDoc(null);
                      go("11");
                    } catch {
                      M("storage");
                    }
                  })}
                </>
              ) : (
                btn("OK", () => M(""))
              )}
            </section>
          </div>
        )}
      </div>
      {["16","17"].includes(page) && <button className="sheetlink" onClick={()=>go("11")}>Return to checklist</button>}
      <button className="sheetlink" onClick={() => go("sheets")}>
        View design sheets
      </button>
    </main>
  );
}
const setBlob = set;
