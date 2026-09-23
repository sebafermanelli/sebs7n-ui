// Ítems y panel de menú: los comparten DropdownMenu y Select.
export const menuItemClassName =
  "relative flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-copy-14 text-gray-1000 outline-none select-none transition-control data-highlighted:bg-gray-200 active:bg-gray-300 data-disabled:cursor-not-allowed data-disabled:text-gray-700 data-disabled:data-highlighted:bg-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const menuPopupClassName =
  "max-h-(--available-height) min-w-40 origin-(--transform-origin) overflow-y-auto rounded-xl bg-background-100 p-1 text-gray-1000 shadow-menu outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"
