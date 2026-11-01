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
    var a = document.createElement("a");
    var url = new URL(root + page.href, location.href);
    a.href = root + page.href;
    a.textContent = page.title;
    if (normalize(url.pathname) === here) {
      a.className = "nav-current";
      a.setAttribute("aria-current", "page");
    }
    li.appendChild(a);
    if (page.children && page.children.length) li.appendChild(list(page.children));
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
