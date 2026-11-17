// Будує бокове меню з window.NAV_TREE (_nav/tree.js).
// Сторінка вказує шлях до кореня репо атрибутом data-root на <html>, напр. data-root="../".
(function () {
  var root = document.documentElement.getAttribute("data-root") || "";
  var tree = window.NAV_TREE || [];

  function normalize(path) {
    return decodeURIComponent(path).replace(/\/index\.html$/, "/");
  }

  var here = normalize(location.pathname);

  function pageItem(page) {
    var li = document.createElement("li");
    if (!page.href) {
      var label = document.createElement("span");
      label.className = "nav-section";
      label.textContent = page.title;
      li.appendChild(label);
      if (page.children && page.children.length) li.appendChild(list(page.children));
      return li;
    }
    var a = document.createElement("a");
    var url = new URL(root + page.href, location.href);
    a.href = root + page.href;
    a.textContent = page.title;
    if (normalize(url.pathname) === here) {
      a.className = "nav-current";
      a.setAttribute("aria-current", "page");
    }
    li.appendChild(a);
    if (page.children && page.children.length) {
      // Діти сторінки — стани того самого екрана: показуємо їх як підфільтр під екраном, а не як окремі пункти.
      var states = document.createElement("ul");
      states.className = "nav-states";
      states.setAttribute("aria-label", "Стани: " + page.title);
      page.children.forEach(function (c) {
        var sli = document.createElement("li");
        var sa = document.createElement("a");
        var su = new URL(root + c.href, location.href);
        sa.href = root + c.href;
        sa.textContent = c.title;
        if (normalize(su.pathname) === here) {
          sa.className = "nav-current";
          sa.setAttribute("aria-current", "page");
          a.classList.add("nav-current-parent");
        }
        sli.appendChild(sa);
        states.appendChild(sli);
      });
      li.className = "nav-has-states";
      li.appendChild(states);
    }
    return li;
  }

  function list(pages) {
    var ul = document.createElement("ul");
    pages.forEach(function (p) { ul.appendChild(pageItem(p)); });
    return ul;
  }

  function build() {
    var nav = document.createElement("nav");
    nav.className = "repo-nav";
    nav.setAttribute("aria-label", "Навігатор репо");

    var ul = document.createElement("ul");
    tree.forEach(function (node) {
      if (node.branch) {
        var li = document.createElement("li");
        var label = document.createElement("span");
        label.className = "nav-branch";
        label.textContent = node.branch;
        li.appendChild(label);
        li.appendChild(list(node.items || []));
        ul.appendChild(li);
      } else {
        ul.appendChild(pageItem(node));
      }
    });
    nav.appendChild(ul);

    document.body.classList.add("has-repo-nav");
    document.body.insertBefore(nav, document.body.firstChild);

    // Кнопка, що ховає і показує навігатор; вибір памʼятається між сторінками.
    var KEY = "repoNavHidden";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "repo-nav-toggle";
    btn.setAttribute("aria-controls", "repo-nav");
    nav.id = "repo-nav";
    function apply(hidden) {
      document.body.classList.toggle("repo-nav-hidden", hidden);
      btn.setAttribute("aria-expanded", String(!hidden));
      btn.textContent = hidden ? "Навігатор »" : "«";
      btn.setAttribute("aria-label", hidden ? "Показати навігатор" : "Сховати навігатор");
      btn.title = btn.getAttribute("aria-label");
    }
    var hidden = false;
    try { hidden = localStorage.getItem(KEY) === "1"; } catch (e) {}
    apply(hidden);
    btn.addEventListener("click", function () {
      hidden = !document.body.classList.contains("repo-nav-hidden");
      apply(hidden);
      try { localStorage.setItem(KEY, hidden ? "1" : "0"); } catch (e) {}
    });
    document.body.insertBefore(btn, nav.nextSibling);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
