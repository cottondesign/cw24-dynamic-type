# Creative Week 2024 Dynamic Type

This library creates dynamic generative headers throughout the Creative Week website.

[VIEW DEMO →](https://cw24-library.netlify.app/demo)

##### Dependencies
This code requires linking to [p5.js](https://p5js.org/). At the time of publication this library uses version `1.9.0`.

---
### `generative` attribute

Simply add the attribute `generative` to any html header tag to give it the Creative Week 2024 generative style.

```html
<h1 generative>An exciting week of events</h1>
```

---
### `black` attribute

For display headers on color backgrounds, also add the attribute `black` to make the header black.
```html
<h2 generative black>An exciting week of events</h2>
```

---
### Other attributes

You can continue to add other attributes as necessary.

```html
<h1 class="special" generative>An exciting week of events</h1>
```


---
### Stylesheet

Use the corresponding stylesheets for canvas-related and typographic styles.
