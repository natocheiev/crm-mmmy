// Дерево сторінок репо — єдине джерело для навігатора.
// Шляхи — від кореня репо. Елемент верхнього рівня — або сторінка
// { title, href, children? }, або гілка { branch, items: [сторінки] }.
// Розділ у гілці — { title, children: [сторінки] } без href (напр. група екранів зі sitemap.md).
// Додавай лише сторінки, які вже існують; гілка з'являється разом зі своєю першою сторінкою.
window.NAV_TREE = [
  { title: "Головна", href: "index.html" },
  {
    branch: "Ресерч",
    items: [
      { title: "Дослідження", href: "research/research.html" },
    ],
  },
  {
    branch: "Структура",
    items: [
      { title: "Інформаційна архітектура", href: "ia.html" },
    ],
  },
  {
    branch: "Екрани",
    items: [
      {
        title: "Задачі",
        children: [
          {
            title: "Дошка",
            href: "wireframes/board.html",
            children: [
              { title: "Порожній", href: "wireframes/board-empty.html" },
              { title: "Помилка", href: "wireframes/board-error.html" },
              { title: "Завантаження", href: "wireframes/board-loading.html" },
              { title: "Успіх", href: "wireframes/board-success.html" },
            ],
          },
          {
            title: "Задача",
            href: "wireframes/task.html",
            children: [
              { title: "Помилка", href: "wireframes/task-error.html" },
              { title: "Завантаження", href: "wireframes/task-loading.html" },
            ],
          },
          {
            title: "Швидке додавання",
            href: "wireframes/capture.html",
            children: [
              { title: "Помилка", href: "wireframes/capture-error.html" },
              { title: "Завантаження", href: "wireframes/capture-loading.html" },
              { title: "Успіх", href: "wireframes/capture-success.html" },
            ],
          },
        ],
      },
      {
        title: "Вхідні",
        children: [
          {
            title: "Можливі задачі",
            href: "wireframes/inbox.html",
            children: [
              { title: "Порожній", href: "wireframes/inbox-empty.html" },
              { title: "Помилка", href: "wireframes/inbox-error.html" },
              { title: "Завантаження", href: "wireframes/inbox-loading.html" },
              { title: "Успіх", href: "wireframes/inbox-success.html" },
            ],
          },
        ],
      },
      {
        title: "День",
        children: [
          {
            title: "Підсумок дня",
            href: "wireframes/day.html",
            children: [
              { title: "Порожній", href: "wireframes/day-empty.html" },
              { title: "Помилка", href: "wireframes/day-error.html" },
              { title: "Завантаження", href: "wireframes/day-loading.html" },
              { title: "Успіх", href: "wireframes/day-success.html" },
            ],
          },
        ],
      },
      {
        title: "Мотивація",
        children: [
          {
            title: "Нагороди і цілі",
            href: "wireframes/rewards.html",
            children: [
              { title: "Порожній", href: "wireframes/rewards-empty.html" },
              { title: "Помилка", href: "wireframes/rewards-error.html" },
              { title: "Завантаження", href: "wireframes/rewards-loading.html" },
              { title: "Успіх", href: "wireframes/rewards-success.html" },
            ],
          },
          {
            title: "Ачівки і Стіна пошани",
            href: "wireframes/trophies.html",
            children: [
              { title: "Порожній", href: "wireframes/trophies-empty.html" },
              { title: "Помилка", href: "wireframes/trophies-error.html" },
              { title: "Завантаження", href: "wireframes/trophies-loading.html" },
            ],
          },
          {
            title: "Похвали",
            href: "wireframes/praise.html",
            children: [
              { title: "Порожній", href: "wireframes/praise-empty.html" },
              { title: "Помилка", href: "wireframes/praise-error.html" },
              { title: "Завантаження", href: "wireframes/praise-loading.html" },
              { title: "Успіх", href: "wireframes/praise-success.html" },
            ],
          },
        ],
      },
      {
        title: "Групи і джерела",
        children: [
          {
            title: "Групи і джерела",
            href: "wireframes/sources.html",
            children: [
              { title: "Порожній", href: "wireframes/sources-empty.html" },
              { title: "Помилка", href: "wireframes/sources-error.html" },
              { title: "Завантаження", href: "wireframes/sources-loading.html" },
              { title: "Успіх", href: "wireframes/sources-success.html" },
            ],
          },
        ],
      },
      {
        title: "Вигляд",
        children: [
          {
            title: "Кольори і теми",
            href: "wireframes/theme.html",
            children: [
              { title: "Помилка", href: "wireframes/theme-error.html" },
              { title: "Успіх", href: "wireframes/theme-success.html" },
            ],
          },
        ],
      },
    ],
  },
];
