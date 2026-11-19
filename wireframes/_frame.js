// Перемикач навігації продукту у вайрфреймах: вузька рейка (тільки іконки) ↔ широка (іконка з назвою).
// Вибір памʼятається між сторінками; без нього (приватне вікно) — вузька рейка.
(function () {
  var KEY = "wfNavWide";
  function apply(wide) {
    document.documentElement.classList.toggle("nav-wide", wide);
    var b = document.querySelector(".nav-toggle");
    if (!b) return;
    b.setAttribute("aria-expanded", String(wide));
    b.title = wide ? "Згорнути навігацію до іконок" : "Розгорнути навігацію з назвами";
  }
  var wide = false;
  try { wide = localStorage.getItem(KEY) === "1"; } catch (e) {}
  document.documentElement.classList.toggle("nav-wide", wide);
  document.addEventListener("DOMContentLoaded", function () {
    apply(wide);
    var b = document.querySelector(".nav-toggle");
    if (b) b.addEventListener("click", function () {
      wide = !document.documentElement.classList.contains("nav-wide");
      apply(wide);
      try { localStorage.setItem(KEY, wide ? "1" : "0"); } catch (e) {}
    });
  });
})();

// Таймер-віджет на Дошці: ▶ запускає відлік на цій же сторінці, ще раз — пауза. Лише для вайрфрейму.
(function () {
  function fmt(s) { var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h + ":" + String(m).padStart(2, "0") + ":" + String(x).padStart(2, "0"); }
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".timer-widget").forEach(function (w) {
      var btn = w.querySelector(".tw-play"), clock = w.querySelector(".tw-clock"), status = w.querySelector(".tw-status");
      if (!btn || btn.disabled || !clock) return;
      var sec = 0, id = null;
      btn.addEventListener("click", function () {
        var run = btn.getAttribute("aria-pressed") !== "true";
        btn.setAttribute("aria-pressed", String(run));
        btn.setAttribute("aria-label", run ? "Пауза" : "Продовжити таймер");
        btn.title = btn.getAttribute("aria-label");
        w.classList.toggle("is-running", run);
        status.textContent = run ? "іде" : "на паузі";
        if (run) id = setInterval(function () { sec++; clock.textContent = fmt(sec); }, 1000);
        else { clearInterval(id); id = null; }
      });
    });
  });
})();
