# Linkget Widget

Легковесный JS-виджет с фиксированной кнопкой и модальным окном для быстрой связи с сайтом (мессенджеры и телефон вместо чата).

## Файлы

- `linkget.js` — основной код виджета
- `linkget.css` — стили
- `widget.js`, `widget.css` — алиасы для удобного CDN-подключения
- `icons/` — SVG-иконки (`telegram.svg`, `whatsapp.svg`, `viber.svg`, `max.svg`, `close.svg`)

## Подключение

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/<username>/<repo>/linkget.css">
<script
  defer
  src="https://cdn.jsdelivr.net/gh/<username>/<repo>/linkget.js"
  data-linkget-widget="true"
  data-title="Что-то понравилось или хотите уточнение?"
  data-description="Напишите или позвоните нам."
  data-message-text="Здравствуйте! Интересует информация с сайта."
  data-phone-number="+70000000000"
  data-telegram-id="support_group"
  data-max-id="your_max_profile_id"
  data-position="bottom-right"
  data-telegram="true"
  data-whatsapp="true"
  data-viber="true"
  data-max="true"
  data-lazy-load="true"
  data-analytics="true"
></script>
```

## Data-атрибуты

| Атрибут | Описание |
|--------|----------|
| `data-title` | Заголовок модалки |
| `data-description` | Подзаголовок (описание) |
| `data-message-text` | Предзаполненный текст (WhatsApp, Telegram; Viber и Max не поддерживают) |
| `data-phone-number` | Номер телефона (звонок + WhatsApp + Viber) |
| `data-telegram-id` | Username или группа Telegram (`support_group`, `joinchat/xxx`) |
| `data-max-id` | ID профиля Max из ссылки (длинная строка или username) |
| `data-telegram` / `data-whatsapp` / `data-viber` / `data-max` | `true` — показать кнопку, иначе скрыта |

## Конфиг через JS

```html
<script>
  window.LinkgetWidgetConfig = {
    title: "Что-то понравилось или хотите уточнение?",
    description: "Напишите или позвоните нам.",
    messageText: "Здравствуйте! Интересует информация с сайта.",
    phoneNumber: "+70000000000",
    telegramId: "support_group",
    maxId: "your_max_profile_id"
  };
</script>
```

## Analytics

- Включается `data-analytics="true"`
- Отправляет `CustomEvent("linkget:action", { detail })` в `window`
- Опционально можно передать `data-analytics-callback="myFn"` и объявить `window.myFn = (payload) => {}`


