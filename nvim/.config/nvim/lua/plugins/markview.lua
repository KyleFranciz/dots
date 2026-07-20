return {
  "OXY2DEV/markview.nvim",
  lazy = false,
  priority = 100, -- Lower priority than treesitter to ensure it loads after
  dependencies = {
    "nvim-treesitter/nvim-treesitter",
    "nvim-tree/nvim-web-devicons",
  },
  opts = {
    preview = {
      filetypes = { "markdown", "codecompanion" },
      ignore_buftypes = {},
    },
    experimental = {
      check_rtp = false, -- Disable the runtime path check since we're handling priority
    },
  },
}
