# Linkget Widget

Легковесный JS-виджет с фиксированной кнопкой и модальным окном для шаринга текущей страницы.

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
  data-share-text="Напишите или позвоните нам."
  data-phone-number="+79292008033"
  data-position="bottom-right"
  data-telegram="true"
  data-whatsapp="true"
  data-viber="true"
  data-max="true"
  data-lazy-load="true"
  data-analytics="true"
></script>
```

## Конфиг через JS

Перед подключением `linkget.js` можно переопределить настройки:

```html
<script>
  window.LinkgetWidgetConfig = {
    title: "Что-то понравилось или хотите уточнение?",
    text: "Напишите или позвонте нам. ",
    phoneNumber: "+79292008033",
    max: "https://max.ru/?text={text}"
  };
</script>
```

## Analytics

- Включается `data-analytics="true"`
- Отправляет `CustomEvent("linkget:action", { detail })` в `window`
- Опционально можно передать `data-analytics-callback="myFn"` и объявить `window.myFn = (payload) => {}`


