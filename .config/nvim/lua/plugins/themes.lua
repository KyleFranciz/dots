return {
  {
    "craftzdog/solarized-osaka.nvim",
    lazy = true,
    priority = 1000,
    opts = function()
      return {
        transparent = true,
      }
    end,
  },
  -- Batman theme
  {
    "shmerl/neogotham",
    lazy = false, -- Loads immediately (not deferred)
    priority = 0, -- Loads before other themes/plugins
    config = function()
      vim.cmd.colorscheme("neogotham")
    end,
  },
  {
    "Mofiqul/dracula.nvim",
    lazy = false,
    priority = 0,
    config = function()
      -- Dracula theme configuration
      require("dracula").setup({
        -- Customize dracula color palette
        colors = {
          bg = "#282A36",
          fg = "#F8F8F2",
          selection = "#44475A",
          comment = "#6272A4",
          red = "#FF5555",
          orange = "#FFB86C",
          yellow = "#F1FA8C",
          green = "#50fa7b",
          purple = "#BD93F9",
          cyan = "#8BE9FD",
          pink = "#FF79C6",
          bright_red = "#FF6E6E",
          bright_green = "#69FF94",
          bright_yellow = "#FFFFA5",
          bright_blue = "#D6ACFF",
          bright_magenta = "#FF92DF",
          bright_cyan = "#A4FFFF",
          bright_white = "#FFFFFF",
          menu = "#21222C",
          visual = "#3E4452",
          gutter_fg = "#4B5263",
          nontext = "#3B4048",
          white = "#ABB2BF",
          black = "#191A21",
        },
        -- Show the '~' characters after the end of buffers
        show_end_of_buffer = true,
        -- Use transparent background
        transparent_bg = true,
        -- Set custom lualine background color
        lualine_bg_color = "#44475a",
        -- Set italic comment
        italic_comment = true,
      })
      vim.cmd("colorscheme dracula")
    end,
  },

  -- tokyonight theme
  {
    "folke/tokyonight.nvim",
    lazy = false,
    priority = 0,
    opts = {
      transparent = true,
      styles = {
        sidebars = "transparent",
        floats = "transparent",
      },
    },
    config = function()
      -- vim.cmd("colorscheme tokyonight")
    end,
  },
  {
    "xero/miasma.nvim",
    lazy = false,
    priority = 1000,
    config = function()
      vim.cmd("colorscheme miasma")
    end,
  },
  {
    "datsfilipe/vesper.nvim",
    lazy = false,
    priority = 0,
    config = function()
      require("vesper").setup({
        transparent = true, -- Boolean: Sets the background to transparent
        italics = {
          comments = true, -- Boolean: Italicizes comments
          keywords = true, -- Boolean: Italicizes keywords
          functions = true, -- Boolean: Italicizes functions
          strings = true, -- Boolean: Italicizes strings
          variables = true, -- Boolean: Italicizes variables
        },
        overrides = {}, -- A dictionary of group names, can be a function returning a dictionary or a table.
        palette_overrides = {},
      })
      -- Uncomment the line below to use Vesper theme
      -- vim.cmd("colorscheme vesper")
    end,
  },
  {
    "martinsione/darkplus.nvim",
    lazy = false,
    priority = 0,
    config = function()
      -- Uncomment the line below to use Darkplus theme
      -- vim.cmd("colorscheme darkplus")
    end,
  },
  -- everforest theme
  {
    "sainnhe/everforest",
    lazy = false,
    priority = 1000,
    config = function()
      -- Optionally configure and load the colorscheme
      -- directly inside the plugin declaration.
      vim.g.everforest_enable_italic = true
      vim.cmd.colorscheme("everforest")
    end,
  },
  { "ellisonleao/gruvbox.nvim", priority = 1000, config = true, opts = ... },
  --
  -- everviolet theme config
  {
    "everviolet/nvim",
    name = "evergarden",
    priority = 1000, -- Colorscheme plugin is loaded first before any other plugins
    opts = {
      theme = {
        variant = "fall", -- 'winter'|'fall'|'spring'|'summer'
        accent = "green",
      },
      editor = {
        transparent_background = true,
        sign = { color = "none" },
        float = {
          color = "mantle",
          solid_border = false,
        },
        completion = {
          color = "surface0",
        },
      },
    },
  },
}
