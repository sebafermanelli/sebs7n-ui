export { cn, TYPE_SCALE, type DistributiveOmit, type WithClassName } from "./lib/utils.js"
export {
  composite,
  contrastRatio,
  flattenAlpha,
  hexOfOklch,
  luminanceOfHex,
  luminanceOfOklch,
  type Oklch,
} from "./lib/contrast.js"
export { cssOfOklch, isSameColor, oklchOfHex } from "./lib/color.js"
export {
  addDays,
  addMonths,
  clampDay,
  compareDays,
  fromISODate,
  isSameDay,
  isSameMonth,
  isWithin,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toISODate,
  weeksOfMonth,
  type DateRange,
  type WeekStart,
} from "./lib/dates.js"
export { paginationRange, type PaginationRangeOptions, type PaginationSlot } from "./lib/pagination.js"
export { defaultLabels, LabelsProvider, useLabels, type Labels, type PartialLabels } from "./lib/labels.js"
export { renderElement, type RenderElement } from "./lib/render.js"
export {
  fieldValidator,
  validate,
  type FormErrors,
  type InferOutput,
  type StandardSchemaV1,
  type ValidationResult,
} from "./lib/schema.js"

export { badgeDotColor, badgeVariants, BADGE_COLORS, type BadgeColor } from "./variants/badge.js"
export { buttonVariants, type ButtonIconSize, type ButtonSize, type ButtonTextSize, type ButtonVariantProps } from "./variants/button.js"
export { cardVariants } from "./variants/card.js"
export {
  commandDialogPopupClassName,
  commandFilterClassName,
  commandInputClassName,
  commandItemClassName,
  commandItemIconClassName,
} from "./variants/command.js"
export { linkVariants } from "./variants/link.js"
export { navbarLinkClassName } from "./variants/navbar-link.js"
export { segmentedGroupClassName, segmentedItemClassName, segmentedThumbClassName, segmentedTrackClassName } from "./variants/segmented.js"
export { sliderThumbClassName, sliderThumbDraggingClassName, sliderThumbPeerActiveClassName } from "./variants/slider.js"
export {
  inputControlClassName,
  inputDisabledClassName,
  inputInvalidClassName,
  inputMultilineRadiusClassName,
  inputPaddingClassName,
  inputShellButtonClassName,
  inputShellClassName,
  inputShellInputClassName,
  inputSizeClassName,
  inputStartIconClassName,
} from "./variants/input.js"
export {
  menuCheckClassName,
  menuGutterClassName,
  menuIndicatorClassName,
  menuInsetClassName,
  menuItemClassName,
  menuItemDestructiveClassName,
  menuItemExternalClassName,
  menuItemContentClassName,
  menuItemExternalIconClassName,
  menuItemSecondaryClassName,
  menuLabelClassName,
  menuPopupClassName,
  menuSeparatorClassName,
  type MenuInsetProps,
} from "./variants/menu.js"
export { selectionSecondaryClassName } from "./variants/selection.js"
export {
  alertFooterClassName,
  alertWidthClassName,
  backdropClassName,
  closeButtonClassName,
  dialogCloseClassName,
  floatingPopupClassName,
  modalFooterClassName,
  modalPopupClassName,
  overlayCloseClassName,
  tooltipSurfaceClassName,
} from "./variants/overlay.js"
export { sidebarItemVariants } from "./variants/sidebar.js"
export { tagRemoveClassName, tagVariants, TAG_COLORS, type TagColor, type TagSize, type TagVariantProps } from "./variants/tag.js"
export { toggleVariants } from "./variants/toggle.js"

export * from "./components/accordion.js"
export * from "./components/ai-button.js"
export * from "./components/alert-dialog.js"
export * from "./components/alert.js"
export * from "./components/app-shell-content.js"
export * from "./components/app-shell.js"
export * from "./components/autocomplete.js"
export * from "./components/avatar.js"
export * from "./components/badge.js"
export * from "./components/breadcrumb.js"
export * from "./components/button.js"
export * from "./components/calendar.js"
export * from "./components/card.js"
// `chart` NO va en el barrel: importa `recharts`, que es un peer opcional. Con el
// `export *` acá, toda app que hiciera `from "sebs7n-ui"` sin tener recharts
// instalado dejaba de compilar («Module not found: Can't resolve 'recharts'»),
// aunque no usara ningún gráfico. Pasó en 0.7.0. Solo por subpath: `sebs7n-ui/chart`.
export * from "./components/checkbox-group.js"
export * from "./components/chat.js"
export * from "./components/checkbox.js"
export * from "./components/collapsible.js"
export * from "./components/color-picker.js"
export * from "./components/combobox.js"
export * from "./components/command.js"
export * from "./components/context-menu.js"
export * from "./components/date-picker.js"
export * from "./components/dialog.js"
export * from "./components/drawer.js"
export * from "./components/dropdown-menu.js"
export * from "./components/empty-state.js"
export * from "./components/field.js"
export * from "./components/fieldset.js"
export * from "./components/form.js"
export * from "./components/hover-card.js"
export * from "./components/icon.js"
export * from "./components/input.js"
export * from "./components/kbd.js"
export * from "./components/label.js"
export * from "./components/list-row.js"
export * from "./components/menubar.js"
export * from "./components/meter.js"
export * from "./components/navbar.js"
export * from "./components/navigation-menu.js"
export * from "./components/number-field.js"
export * from "./components/otp-field.js"
export * from "./components/page-header.js"
export * from "./components/pagination.js"
export * from "./components/popover.js"
export * from "./components/progress.js"
export * from "./components/radio-group.js"
export * from "./components/scroll-area.js"
export * from "./components/select.js"
export * from "./components/separator.js"
export * from "./components/sheet.js"
export * from "./components/sidebar.js"
export * from "./components/skeleton.js"
export * from "./components/slider.js"
export * from "./components/sonner.js"
export * from "./components/spinner.js"
export * from "./components/stat.js"
export * from "./components/switch.js"
export * from "./components/table.js"
export * from "./components/tabs.js"
export * from "./components/tag.js"
export * from "./components/text-link.js"
export * from "./components/textarea.js"
export * from "./components/theme-switcher.js"
export * from "./components/toggle-group.js"
export * from "./components/toggle.js"
export * from "./components/toolbar.js"
export * from "./components/tooltip.js"
export * from "./components/user-menu.js"
export * from "./components/widget-card.js"

// Solo por subpath, por peso (R5b): el barrel tiene un tope de 58 kB gzip (`.size-limit.js`) que
// no se sube sin que lo pida Sebastián, y estos componentes grandes lo pasaban. No son peers
// opcionales como `chart`: andan igual, pero se importan por su ruta. La tabla del README los nombra (la genera
// scripts/subpaths.mjs leyendo este archivo).
//   `tree`            sebs7n-ui/tree (+1,95 kB al barrel, medido de a uno)
//   `split-view`      sebs7n-ui/split-view (+0,70 kB)
//   `file-grid`       sebs7n-ui/file-grid (+1,16 kB)
//   `calendar-view`   sebs7n-ui/calendar-view (+2,84 kB)
// Y los de R6, que nacieron afuera (el barrel ya estaba en 54,38 de 55): solo sus textos de
// `labels` entran al barrel.
//   `stepper`         sebs7n-ui/stepper
//   `data-table`      sebs7n-ui/data-table
//   `input-group`     sebs7n-ui/input-group
//   `multi-select`    sebs7n-ui/multi-select
//   `timeline`        sebs7n-ui/timeline
//   `resizable`       sebs7n-ui/resizable
// Y los de R7 (campos), también nacidos afuera:
//   `copy-button`       sebs7n-ui/copy-button
//   `password-input`    sebs7n-ui/password-input
//   `time-picker`       sebs7n-ui/time-picker
//   `date-time-picker`  sebs7n-ui/date-time-picker
//   `country-picker`    sebs7n-ui/country-picker
//   `phone-input`       sebs7n-ui/phone-input
// Y los de R8 (archivos y arrastre). `sortable-list`, `sortable-grid` y `carousel` importan peers
// opcionales (`@dnd-kit/*`, `embla-carousel-react`), así que tampoco podrían estar: ver `chart`.
// Sus textos no entran al barrel: viven en cada componente (ver el tipo `Labels`).
//   `sortable-list`     sebs7n-ui/sortable-list
//   `sortable-grid`     sebs7n-ui/sortable-grid
//   `drop-zone`         sebs7n-ui/drop-zone
//   `carousel`          sebs7n-ui/carousel
// Y el de R9, `ListIndex`, con su texto fuera del barrel como los de R8.
//   `list-index`        sebs7n-ui/list-index
// Y los links de la barra (2.6), para no sumarle al barrel:
//   `navbar-link`       sebs7n-ui/navbar-link
// `lib/countries` y `lib/phone` tampoco entran: son los únicos de `lib/` solo por subpath (ver
// `test/api-publica.test.ts`).
