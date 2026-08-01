# GuestyciArc (@guestyci/arc@1.15.2)

This design system is the published @guestyci/arc React library, bundled as a single
browser global. All 62 components are the real upstream code.

## Where things are

- `_ds_bundle.js` — the whole-DS bundle at the project root; loads every component to `window.GuestyciArc`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` — the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` — CSS custom properties, names verbatim from upstream.
- `fonts/` — `@font-face` files + `fonts.css` (when the package ships fonts).

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.GuestyciArc.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { Accordion } = window.GuestyciArc;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<Accordion />);
```

This DS's storybook wraps every story in decorators from `.storybook/preview`
(bundled for the preview cards as `_vendor/preview-decorators.js`). Components
likely need equivalent context — theme/i18n providers — in your tree too. The
exact chain hasn't been distilled into config, so check the DS's documented
provider setup before composing.

## Tokens

112 CSS custom properties from @guestyci/arc. Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (9): `--tw-border-spacing-x`, `--tw-border-spacing-y`, `--tw-ring-offset-color`, …
- **spacing** (3): `--tw-ring-inset`, `--tw-space-x-reverse`, `--tw-space-y-reverse`
- **shadow** (4): `--tw-ring-offset-shadow`, `--tw-ring-shadow`, `--tw-shadow`, …
- **other** (96): `--tw-translate-x`, `--tw-translate-y`, `--tw-rotate`, …

## Components

### components
- `Accordion`
- `AddressInput`
- `Alert`
- `AlertDialog`
- `Avatar`
- `Badge`
- `Breadcrumb`
- `Button`
- `ButtonGroup`
- `Calendar`
- `Card`
- `Carousel`
- `ChartContainer`
- `Checkbox`
- `CheckboxCard`
- `Collapsible`
- `Combobox`
- `Dialog`
- `Drawer`
- `DropdownMenu`
- `Fade`
- `Form`
- `IconButton`
- `Input`
- `InputGroup`
- `Label`
- `Logo`
- `NavigationMenu`
- `NumberInput`
- `PageSpinner`
- `Pagination`
- `PhoneNumberInput`
- `Popover`
- `Progress`
- `RadioCard`
- `RadioGroup`
- `Select`
- `Separator`
- `Sheet`
- `SideMenu`
- `Skeleton`
- `Slider`
- `Spinner`
- `Status`
- `Stepper`
- `Switch`
- `Table`
- `Tabs`
- `Tag`
- `Textarea`
- `TimeInput`
- `Tip`
- `Toast`
- `ToggleGroup`
- `Tooltip`
- `Wizard`

### layout
- `Container`
- `Grid`
- `Stack`

### typography
- `Heading`
- `Text`

### arc-shell
- `PageHeader`
