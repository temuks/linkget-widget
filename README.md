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
  data-phone-number="+79292008033"
  data-telegram-id="username"
  data-whatsapp-id="79292008033"
  data-viber-id="79292008033"
  data-max-url="https://max.ru/?text={text}"
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
| `data-message-text` | Текст для начала диалога в мессенджерах (подставляется при клике) |
| `data-phone-number` | Номер телефона для звонка (и fallback для мессенджеров) |
| `data-telegram-id` | Username или группа (например `username` или `joinchat/xxx`) |
| `data-whatsapp-id` | Номер для WhatsApp (без +). Если пусто — берётся из `data-phone-number` |
| `data-viber-id` | Номер для Viber. Если пусто — из `data-phone-number` |
| `data-max-url` | URL для Max, плейсхолдер `{text}` подставляется |

## Конфиг через JS

```html
<script>
  window.LinkgetWidgetConfig = {
    title: "Что-то понравилось или хотите уточнение?",
    description: "Напишите или позвоните нам.",
    messageText: "Здравствуйте! Интересует информация с сайта.",
    phoneNumber: "+79292008033",
    telegramId: "username",
    whatsappId: "79292008033",
    viberId: "79292008033",
    maxUrl: "https://max.ru/?text={text}"
  };
</script>
```

## Analytics

- Включается `data-analytics="true"`
- Отправляет `CustomEvent("linkget:action", { detail })` в `window`
- Опционально можно передать `data-analytics-callback="myFn"` и объявить `window.myFn = (payload) => {}`


