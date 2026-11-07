const { JSDOM } = require("jsdom"),
  fs = require("node:fs"),
  assert = require("node:assert/strict");
const dir = process.argv[2] || "dist",
  file = fs.readdirSync(dir + "/assets").find((x) => x.endsWith(".js"));
const dom = new JSDOM('<div id="root"></div>', {
  url: "https://demo.example/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
});
const w = dom.window;
w.structuredClone = structuredClone;
w.scrollTo = () => {};
w.eval(fs.readFileSync(dir + "/assets/" + file, "utf8"));
const sleep = () => new Promise((r) => setTimeout(r, 45)),
  el = (q) => w.document.querySelector(q);
async function click(t, prefix = false) {
  const b = [...w.document.querySelectorAll("button")].find((b) =>
    prefix
      ? b.textContent.includes(t)
      : (b.getAttribute("aria-label") || b.textContent) === t,
  );
  assert(b && !b.disabled, t);
  b.click();
  await sleep();
}
async function route(p) {
  w.location.hash = p;
  await sleep();
}
function sel(i, val) {
  const e = w.document.querySelectorAll("select")[i];
  e.value = val;
  e.dispatchEvent(new w.Event("change", { bubbles: true }));
}
(async () => {
  await sleep();
  assert.equal(el("h1").textContent, "Welcome");
  await click("Continue saved plan");
  await click("OK");
  await click("Create my plan");
  await click("Next");
  await sleep();
  await click("OK");
  sel(0, "Bologna");
  sel(1, "University of Bologna");
  const country = el(".body input");
  Object.getOwnPropertyDescriptor(
    w.HTMLInputElement.prototype,
    "value",
  ).set.call(country, "Iran");
  country.dispatchEvent(new w.Event("input", { bubbles: true }));
  await sleep();
  await click("Next");
  await click("View my steps");
  await click("Prepare Documents");
  await click("Open Step 2");
  await click("Go to Checklist");
  await click("Appointment Confirmation");
  await click("Choose from Files");
  await click("Attach Selected");
  await click("CONFIRM FILE");
  await click("Start self-check");
  await click("Start comparison");
  await click("Zoom official example");
  await click("Back to Compare");
  await click("Present");
  await click("Save Self-Check");
  await click("Resolve Issue");
  await click("Find Location");
  await click("Ask for Help");
  await click("Contact Student Office");
  await click("Record call in My Plan");
  await click("Skip reminder");
  await click("Practise the Visit");
  await click("Begin Practice");
  await click("Where is the office? Tell me now.");
  await click("Check Answer");
  await click("Try Again");
  await click("Excuse me, I have a question about my appointment location.");
  await click("Check Answer");
  await click("Next Question");
  await click("Excuse me, could you please confirm the office room number?");
  await click("Check Answer");
  await click("Finish questions");
  await click("Finish Practice");
  await click("More documents requested");
  await click("Save Final Outcome");
  await click("Update Checklist");
  let data = JSON.parse(w.localStorage.getItem("passopasso.pdf.v2"));
  assert(
    data.practice &&
      data.actions.length === 1 &&
      data.docs[1].checks.includes("Missing") &&
      data.outcome === "More documents requested",
  );
  for (let n = 1; n <= 30; n++) {
    await route(String(n));
    assert(el("h1").textContent);
    const img = el(".plate");
    if (img) assert(fs.existsSync(dir + img.getAttribute("src")));
  }
  await route("01"); assert.equal(el("h1").textContent,"Welcome");
  await route("__proto__"); assert.equal(el("h1").textContent,"Welcome");
  await route("17"); await click("Return to checklist"); assert.equal(w.location.hash,"#11");
  await click("Back"); assert.equal(w.location.hash,"#17");
  w.history.forward(); await sleep(); assert.equal(w.location.hash,"#11");
  const reloaded=new JSDOM('<div id="root"></div>',{url:"https://demo.example/#14",runScripts:"outside-only"});
  reloaded.window.structuredClone=structuredClone;
  reloaded.window.eval(fs.readFileSync(dir+"/assets/"+file,"utf8"));await sleep();
  assert.equal(reloaded.window.location.hash,"#12","Reloaded preview must ask for the file again"); reloaded.window.close();
  await click("View design sheets");
  assert(el(".sheet img"));
  for (let i = 1; i <= 9; i++)
    assert(fs.existsSync(dir + "/sheets/" + i + ".webp"));
  console.log(
    "PASS: 30 screens, 9 reference sheets, profile validation, file selection, comparison, recovery, practice branches and outcome.",
  );
  dom.window.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
