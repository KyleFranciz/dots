-- Transparent.nvim plugin for transparent background
return {
  "xiyaowong/transparent.nvim",
  lazy = false, -- Don't lazy load to ensure highlight-clearing logic is triggered
  priority = 1000, -- Load early
  config = function()
    require("transparent").setup({
      -- Optional, you don't have to run setup.
      groups = { -- table: default groups
        "Normal",
        "NormalNC",
        "Comment",
        "Constant",
        "Special",
        "Identifier",
        "Statement",
        "PreProc",
        "Type",
        "Underlined",
        "Todo",
        "String",
        "Function",
        "Conditional",
        "Repeat",
        "Operator",
        "Structure",
        "LineNr",
        "Tree",
        "NonText",
        "SignColumn",
        "CursorLineNr",
        "EndOfBuffer",
      },
      extra_groups = {}, -- table: additional groups that should be cleared
      exclude_groups = {}, -- table: groups you don't want to clear
    })
    -- Disable transparency by default
    vim.cmd("TransparentDisable")
  end,
}
