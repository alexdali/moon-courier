# Accessibility

## Реализуемые требования

- интерактивные элементы — button/link, не div;
- keyboard focus visible;
- semantic headings;
- labels for inputs;
- aria-label для icon-only controls;
- status не выражается только цветом;
- risk zones дополнительно имеют pattern/label;
- minimum text size 12–14 px;
- contrast for dark UI;
- reduced-motion path для map animation;
- screen-reader text for battery/progress.

## Проверка

- keyboard-only main flow;
- browser zoom 200%;
- 1280×720 no inaccessible overflow;
- Lighthouse/axe pass;
- color blindness simulation;
- `prefers-reduced-motion` disables decorative transitions.

## Известное ограничение

Стилизованная SVG-карта не является полноценной accessible graph representation. Orders/rovers и route summary должны быть доступны в списках независимо от карты.
