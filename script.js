// ---------- 1. Page elements ----------
const form = document.querySelector("#form");
const name1 = document.querySelector("#name1");
const name2 = document.querySelector("#name2");
const errorText = document.querySelector("#error");
const matchBtn = document.querySelector("#matchBtn");
const resetBtn = document.querySelector("#resetBtn");

const resultBox = document.querySelector("#result");
const pairText = document.querySelector("#pair");
const gauge = document.querySelector(".gauge");
const fillRect = document.querySelector("#fill");
const percentText = document.querySelector("#percent");
const verdict = document.querySelector("#verdict");
const verdictText = document.querySelector("#verdictText");
const srResult = document.querySelector("#srResult");
const heartsBox = document.querySelector("#hearts");

// ---------- 2. Result messages (the color changes with the score) ----------
const tiers = [
  { max: 24,  tone: "#6b84a8", title: "Different paths, for now", text: "Not every love story starts with fireworks. Sometimes it begins as a quiet friendship." },
  { max: 49,  tone: "#c28a2c", title: "A spark waiting to grow",  text: "There is something gentle between you. Give it time and let love find its own pace." },
  { max: 74,  tone: "#d63a62", title: "A sweet connection",       text: "Your hearts are in tune. Share a long walk and a warm coffee, and see where it leads." },
  { max: 89,  tone: "#c9184a", title: "A love worth chasing",     text: "Two hearts beating in harmony. What you share is rare and beautiful." },
  { max: 100, tone: "#a4133c", title: "Soulmates",                text: "A love written in the stars. Together, you make the whole world feel warmer." }
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- 3. Validation ----------
// Returns the two clean names, or null if something is wrong
function validate() {
  // trim spaces and collapse double spaces
  const a = name1.value.trim().replace(/\s+/g, " ");
  const b = name2.value.trim().replace(/\s+/g, " ");

  name1.classList.remove("invalid");
  name2.classList.remove("invalid");

  if (a === "" || b === "") {
    const empty = a === "" ? name1 : name2;
    empty.classList.add("invalid");
    empty.focus();
    errorText.textContent = a === "" && b === ""
      ? "Please enter both names."
      : "Please enter the " + (a === "" ? "first" : "second") + " name.";
    return null;
  }

  if (a.toLowerCase() === b.toLowerCase()) {   // "Sara" and "sara" are the same
    name2.classList.add("invalid");
    name2.focus();
    errorText.textContent = "You can't match the same person. Enter two different names.";
    return null;
  }

  errorText.textContent = "";
  return { a, b };
}

// ---------- 4. Random score + animation ----------
function getTier(score) {
  return tiers.find(function (t) { return score <= t.max; });
}

function showResult(a, b) {
  const score = Math.floor(Math.random() * 101);   // random 0 - 100
  const tier = getTier(score);

  // reset the result box and restart its entrance animation
  resultBox.hidden = true;
  void resultBox.offsetWidth;
  resultBox.hidden = false;
  gauge.classList.remove("beat");

  resultBox.style.setProperty("--tone", tier.tone);
  document.documentElement.style.setProperty("--tone", tier.tone);

  // build the line with a red heart between the names (textContent is safe: no HTML injection)
  pairText.textContent = "";
  const heart = document.createElement("span");
  heart.className = "pair-heart";
  heart.textContent = "\u2665";
  pairText.append(a, heart, b);
  verdict.textContent = "";
  verdictText.textContent = "";
  matchBtn.disabled = true;
  matchBtn.textContent = "Reading your hearts...";

  const duration = reduceMotion ? 0 : 1400;
  const start = performance.now();

  function frame(now) {
    const t = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);          // starts fast, ends slow
    const current = Math.round(score * eased);

    percentText.textContent = current;
    fillRect.setAttribute("y", 90 - (90 * current) / 100);   // heart fills up

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      finish(score, tier);
    }
  }
  requestAnimationFrame(frame);
}

function finish(score, tier) {
  verdict.textContent = tier.title;
  verdictText.textContent = tier.text;
  srResult.textContent = score + " percent. " + tier.title + ". " + tier.text;

  matchBtn.disabled = false;
  matchBtn.textContent = "Find match";

  if (score >= 90) gauge.classList.add("beat");     // heart beats
  if (score >= 70 && !reduceMotion) burstHearts(score >= 90 ? 26 : 14);
}

// ---------- 5. Floating hearts ----------
function burstHearts(count) {
  for (let i = 0; i < count; i++) {
    const h = document.createElement("span");
    h.className = "float";
    h.textContent = "\u2665";
    h.style.left = Math.random() * 100 + "%";
    h.style.fontSize = 16 + Math.random() * 28 + "px";
    h.style.setProperty("--d", 2.5 + Math.random() * 2 + "s");
    h.style.setProperty("--r", Math.random() * 60 - 30 + "deg");
    h.addEventListener("animationend", function () { h.remove(); });
    heartsBox.appendChild(h);
  }
}

// ---------- 6. Events ----------
// "submit" also works when the user presses Enter
form.addEventListener("submit", function (e) {
  e.preventDefault();                  // stop the page from reloading
  const names = validate();
  if (names) showResult(names.a, names.b);
});

// clear the error as soon as the user starts typing again
[name1, name2].forEach(function (input) {
  input.addEventListener("input", function () {
    input.classList.remove("invalid");
    errorText.textContent = "";
  });
});

resetBtn.addEventListener("click", function () {
  name1.value = "";
  name2.value = "";
  resultBox.hidden = true;
  errorText.textContent = "";
  name1.focus();
});
