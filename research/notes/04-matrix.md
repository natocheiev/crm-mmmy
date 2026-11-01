# 04 — Матриця конкурентів

Конкуренти взяті з `research/notes/03-competitors.md`, нового пошуку не було. Матеріал зібрано 2026-11-01 з публічних сторінок, App Store, відгуків і скрінів (Playwright, `research/screens/04-*.png`). Кабінети закриті логіном, туди не заходили.

Тека `research/screens/own/` відсутня, тому перевірку власних скрінів пропущено.

## Кого взяли і чому

| Компанія | Група | Чому саме вона |
|---|---|---|
| **Akiflow** | хард | Найближчий аналог ідеї: «universal inbox» з Trello, Slack, Gmail тощо на одному екрані |
| **Sunsama** | хард | Агрегатор з ритуалами «план дня» і «завершення дня», прототип нашого «Настрою дня» і «Підсумку дня» |
| **Trello** | софт | Наше основне джерело задач; єдиний з п'ятьох з українським інтерфейсом |
| **Linear** | аспіраційний | Triage — еталон розбору вхідних задач, модель для наших «Можливих задач» з Telegram |
| **Things 3** | аспіраційний | Еталон краси й спокою для особистих задач і екрана «Сьогодні» |

## Осі матриці (під наш продукт)

1. **Перший екран** — що бачить людина на першому екрані сайту.
2. **Ключова задача «не губити жодної задачі»** — як задача з будь-якого джерела потрапляє в систему.
3. **«Хто і звідки»** — чи видно одразу, від кого і з якого джерела задача. Формулювання з брифу: «Одне місце для всіх задач з видимістю того, **хто** і **звідки** їх поставив».
4. **Як задача завершується.**
5. **Мова інтерфейсу** — чи є українська.

## Матриця

| Вісь | Akiflow (хард) | Sunsama (хард) | Trello (софт) | Linear (аспір.) | Things 3 (аспір.) |
|---|---|---|---|---|---|
| **1. Перший екран** | «One app for tasks & calendars powered by AI», CTA «Try Akiflow for free» (7-денний trial). Нижче — макет продукту: Inbox зліва, тижневий календар, асистент Aki. Банер для 🇺🇦 зі знижкою за PPP. [A1, скрін `04-akiflow-home`] | «Start Calm. Stay Focused. End Confident.», CTA «Try for free» (14 днів, без картки), бейдж Wirecutter. Справа — скрін продукту: колонки днів з картками задач і календар. Тон — спокій і баланс, а не продуктивність. [S6, скрін `04-sunsama-home`] | «Capture, organize, and tackle your to-dos from anywhere», поле email + «Sign up – it's free!». Справа — телефон з Inbox і іконками Teams, Slack, Gmail. [T1, скрін `04-trello-home`] | «The product development system for teams and agents», темна тема, одразу великий скрін робочого продукту (Inbox, issue, активність). [скрін `04-linear-home`] | Іконка, назва, один рядок «award-winning personal task manager…», «Watch Introduction Video». Мінімум, багато повітря. [Th1, скрін `04-things-home`] |
| **2. «Не губити жодної задачі»** | Universal Inbox збирає задачі з 19 featured-інтеграцій (Trello, Slack, Gmail, Notion, Asana, Jira…), решта через Zapier/IFTTT. Telegram немає. Gmail: позначити лист зірочкою, і він стане задачею. [A1, A2, A3, скрін `04-akiflow-integrations`] | Ранковий план у 4 кроки: «Dump» (задачі з Trello, Notion, ClickUp, Gmail, Slack, календаря) → оцінка часу і мітка Work/Personal → «Defer» з попередженням про перевантаження дня → розклад у календар. Trello-картки перетягуються з бічної панелі «Things to do» в потрібний день. Slack/Teams-повідомлення можна перетворити на задачу, «so follow-ups don't slip through the cracks». Офіційно ритуал зветься «five Ps»: Process → Plan → Prioritize → Prepare → Publish. [S1, S5, S6, S7, скріни `04-sunsama-trello`, `04-sunsama-planning-shutdown`] | Inbox: задачі з email, Slack/Teams, фото, віджета телефона потрапляють картками в Inbox, звідти розкладаються по дошках. [T1, T2] | Triage — окремий inbox команди, куди задачі падають з Slack, Sentry, Intercom, Front, Zendesk, від людей поза командою, і переглядаються до того, як потрапити в роботу. [L1, скрін `04-linear-triage-docs`] | Захоплення через Magic Plus, Share extension, Siri, Apple Watch і «Mail to Things»: лист стає задачею в Inbox (тема → назва, тіло → нотатка). [Th2, Th3] |
| **3. «Хто і звідки»** | **Звідки — так, одразу**: біля кожної задачі в Inbox іконка джерела (Slack, Notion, Gmail). **Хто** — тільки в тексті задачі («Reply to Luke»). Як це виглядає в кабінеті — доступ обмежений. [скрін `04-akiflow-home`] | **Звідки — так, одразу**: внизу кожної картки іконка джерела (Trello, Jira, Notion, Google Calendar), поруч канал-тег (#product, #growth) і оцінка часу. **Хто** — не видно. Плюс мітка Work/Personal. Кабінет — доступ обмежений. [S1, скріни `04-sunsama-home`, `04-sunsama-trello`] | **Звідки — так**: на картках Inbox маленькі іконки джерела (Gmail, Slack). Хто поставив — на першому екрані не видно. [скрін `04-trello-home`, T1] | **Обидва, але не одразу**: в активності задачі «Linear created the issue via Slack on behalf of Karri», тобто видно і джерело, і людину. Потрібно відкрити задачу. [скрін `04-linear-home`, L1] | **Ні**: особистий менеджер, джерела і людей не показує; лист з «Mail to Things» стає звичайною задачею. [Th3, Th4] |
| **4. Як задача завершується** | Галочка в Inbox/календарі; для Gmail зняття зірочки = done. Чи синхронізується завершення назад у Trello тощо, у відкритих джерелах не описано. Згадано «Daily Rituals» без деталей. [A1, A3, скрін `04-akiflow-home`] | Ритуал «Daily shutdown»: о заданій годині сповіщення → огляд дня (робочі й особисті години, виконані задачі) → незакриті задачі перенести або прибрати → «Done for the day». Галочка на задачі синхронізується назад у Trello. Сайт обіцяє «track your daily wins» і «End work on time, without guilt». [S1, S2, S3, S5, S6] | Вручну: перенести картку в колонку «Done» або заархівувати; відгуки скаржаться, що це ручна робота. [T2] | Рішення в Triage: Accept (1) → у робочий статус, Decline (2) → Canceled, Duplicate (3) → злиття, Snooze (H) → повернеться пізніше. Далі статуси до Done. [L1] | Чекбокс → задача йде в Logbook, архів «completed or cancelled to-dos», який зберігається безстроково. Щоранку — огляд списку Today. [Th5, Th2] |
| **5. Мова інтерфейсу** | Сайт англійською, вибору мови немає. Мова застосунку у відкритих джерелах не вказана. [A1, скрін `04-akiflow-home`] | Застосунок iOS: тільки English. [S4] | **21 мова, зокрема українська** (сайт і застосунок). [T1, T2] | Мобільний застосунок: тільки English. [L2] | 9 мов (EN, FR, DE, IT, JA, RU, ZH ×2, ES), **української немає**. [Th2, скрін `04-things-appstore`] |

## Спільні патерни ринку

1. **Inbox-воронка.** Усі п'ятеро спершу складають вхідне в окреме місце (Universal Inbox, Dump, Trello Inbox, Triage, Things Inbox) і тільки потім розподіляють у роботу. Наші «Можливі задачі» — правильний патерн, і його варто розширити на всі джерела.
2. **Захоплення з будь-якого місця.** Email, Slack, share-меню, віджет, голос: задача створюється там, де виникла, без перемикання в застосунок.
3. **Джерело — це іконка.** Akiflow, Sunsama і Trello показують джерело маленькою іконкою сервісу прямо на картці. Колір чи текст для цього не використовують.

## Три відмінності

1. **«Хто» майже ніхто не показує.** Джерело видно в Akiflow, Sunsama і Trello, а людину — тільки в Linear, і то всередині задачі. Наша вісь «хто і звідки» на першому екрані — реальна прогалина ринку.
2. **Завершення по-різному відчувається.** Від сухого (колонка Done у Trello, чекбокс у Things) до ритуалу (shutdown у Sunsama з оглядом дня і «daily wins»). Емоцію завершення обіцяє тільки Sunsama, але спокійну, без нагород: ніхто з п'яти не святкує і не дає ачівок.
3. **Мова і джерела.** Українську має тільки Trello. Telegram як джерело задач не підтримує жоден.

## Відкриті питання до PM

1. **Inbox для всіх джерел чи тільки для Telegram?** Ринок пропускає все через inbox. Чи мають картки з Trello теж проходити розбір, чи одразу падати на дошку в «Tasks»?
2. **Де показувати «хто»?** На картці на дошці (аватар людини поруч з іконкою джерела) чи тільки всередині задачі, як у Linear? Від цього залежить щільність картки.
3. **Що вважаємо «завершенням» для XP і синхронізації?** Approved у CRM — це переміщення картки в Trello-колонку чи її архів? І чи потрібен ритуал завершення дня (як у Sunsama) вже в MVP, чи «Підсумок дня» лишається в другій черзі?

---

## Джерела

**Akiflow**
- [A1] https://akiflow.com/ — лендинг
- [A2] https://akiflow.com/integrations — список інтеграцій
- [A3] https://www.usecarly.com/blog/akiflow-review/ — огляд і відгуки (опублікований конкурентом Carly)

**Sunsama**
- [S1] https://thesweetsetup.com/how-to-startup-and-shutdown-your-day-with-sunsama/ — опис планування і shutdown
- [S2] https://roadmap.sunsama.com/changelog/daily-shutdown — changelog функції
- [S3] https://sunsama.com/blog/the-shutdown-ritual — блог (за результатом пошуку)
- [S4] https://apps.apple.com/us/app/sunsama/id1475755747 — App Store
- [S5] https://www.sunsama.com/integrations/trello — інтеграція з Trello
- [S6] https://www.sunsama.com/ — лендинг
- [S7] https://www.sunsama.com/features/daily-planning-and-shutdown — сторінка планування і shutdown

**Trello**
- [T1] https://trello.com/home — лендинг, футер з мовами
- [T2] https://apps.apple.com/us/app/trello-organize-anything/id461504587 — App Store, опис і відгуки

**Linear**
- [L1] https://linear.app/docs/triage — документація Triage
- [L2] https://apps.apple.com/us/app/linear-mobile/id1645587184 — App Store

**Things 3**
- [Th1] https://culturedcode.com/things/ — лендинг
- [Th2] https://apps.apple.com/us/app/things-3/id904237743 — App Store
- [Th3] https://culturedcode.com/things/blog/2017/12/mail-to-things/ — Mail to Things (за результатом пошуку)
- [Th4] https://culturedcode.com/things/features/ — сторінка фіч
- [Th5] https://culturedcode.com/things/support/articles/4001304/ — списки Today, Inbox, Logbook

**Скріни** (`research/screens/`, 1440×900, перший екран): `04-akiflow-home`, `04-akiflow-integrations`, `04-trello-home`, `04-trello-templates`, `04-linear-home`, `04-linear-triage-docs`, `04-things-home`, `04-things-appstore`, `04-sunsama-home`, `04-sunsama-planning-shutdown`, `04-sunsama-trello`. Sunsama знято через VPN: без нього сайт з нашої мережі не відкривався. На скрінах Sunsama видно cookie-банер; його не приймали.
