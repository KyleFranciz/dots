return {
  "sphamba/smear-cursor.nvim",
  opts = {
    -- Cursor color. Defaults to Cursor gui color if not set.
    -- Set to "none" to match the character color at the cursor position.
    cursor_color = "#d3cdc3",

    -- Background color. Defaults to Normal gui background color if not set.
    normal_bg = "#282828",

    -- Smear cursor when switching buffers or windows.
    smear_between_buffers = false,

    -- Smear cursor when moving within line or to neighbor lines.
    smear_between_neighbor_lines = true,

    -- Draw the smear in buffer space instead of screen space when scrolling
    scroll_buffer_space = false,

    -- Set to `true` if your font supports legacy computing symbols (block unicode symbols).
    -- Smears will blend better on all backgrounds.
    legacy_computing_symbols_support = false,
  },
}
