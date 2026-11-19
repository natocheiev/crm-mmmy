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
