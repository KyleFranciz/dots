return {
  -- Codeium AI coding assistant
  {
    "Exafunction/codeium.vim",
    event = "BufEnter",
    config = function()
      -- Disable Codeium change to 0 or 1
      vim.g.codeium_enabled = 0
      -- Codeium keybindings (disabled when codeium_enabled = 0)
      vim.keymap.set("i", "<C-g>", function()
        return vim.fn["codeium#Accept"]()
      end, { expr = true, silent = true })
      vim.keymap.set("i", "<C-Right>", function()
        return vim.fn["codeium#CycleCompletions"](1)
      end, { expr = true, silent = true })
      vim.keymap.set("i", "<C-Left>", function()
        return vim.fn["codeium#CycleCompletions"](-1)
      end, { expr = true, silent = true })
      vim.keymap.set("i", "<C-x>", function()
        return vim.fn["codeium#Clear"]()
      end, { expr = true, silent = true })
    end,
  },
}
