# Linkget Widget

Легковесный JS-виджет с фиксированной кнопкой и модальным окном для быстрой связи с сайтом (мессенджеры и телефон вместо чата).

![ПК](https://i.ibb.co/q3bH7zjc/Screenshot-1.jpg)

![Моб](https://i.ibb.co/VWyDYhpy/Screenshot-2.jpg)

## Файлы

- `linkget.js` — основной код виджета
- `linkget.css` — стили
- `widget.js`, `widget.css` — алиасы для удобного CDN-подключения
- `icons/` — SVG-иконки (`telegram.svg`, `whatsapp.svg`, `viber.svg`, `max.svg`, `vk.svg`, `close.svg`)

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
  data-whatsapp-id="70000000001"
  data-telegram-id="support_group"
  data-max-id="your_max_profile_id"
  data-position="bottom-right"
  data-telegram="true"
  data-whatsapp="true"
  data-viber="true"
  data-max="true"
  data-vk="true"
  data-vk-id="your_vk_group"
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
| `data-phone-number` | Номер телефона (звонок + Viber, fallback для WhatsApp) |
| `data-whatsapp-id` | Номер для WhatsApp. Если заполнено — используется вместо `data-phone-number` |
| `data-telegram-id` | Username или группа Telegram (`support_group`, `joinchat/xxx`) |
| `data-max-id` | ID профиля Max из ссылки (длинная строка или username) |
| `data-vk-id` | Короткое имя группы VK (например `club123456` или `groupname`) |
| `data-telegram` / `data-whatsapp` / `data-viber` / `data-max` / `data-vk` | `true` — показать кнопку, иначе скрыта |

## Конфиг через JS

```html
<script>
  window.LinkgetWidgetConfig = {
    title: "Что-то понравилось или хотите уточнение?",
    description: "Напишите или позвоните нам.",
    messageText: "Здравствуйте! Интересует информация с сайта.",
    phoneNumber: "+70000000000",
    whatsappId: "70000000001",
    telegramId: "support_group",
    maxId: "your_max_profile_id",
    vkId: "your_vk_group"
  };
</script>
```

## Analytics

- Включается `data-analytics="true"`
- Отправляет `CustomEvent("linkget:action", { detail })` в `window`
- Опционально можно передать `data-analytics-callback="myFn"` и объявить `window.myFn = (payload) => {}`


