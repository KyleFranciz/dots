local jdtls = require('jdtls')

-- Determine the workspace directory
local project_name = vim.fn.fnamemodify(vim.fn.getcwd(), ':p:h:t')
local workspace_dir = vim.fn.stdpath('data') .. '/site/java-workspace/' .. project_name

-- Find the root directory of your Java project
local root_markers = { 'gradlew', 'mvnw', '.git', 'pom.xml', 'build.gradle' }
local root_dir = require('jdtls.setup').find_root(root_markers)

-- jdtls configuration
local config = {
  cmd = {
    'jdtls',
    '-data', workspace_dir,
  },
  
  root_dir = root_dir,
  
  settings = {
    java = {
      signatureHelp = { enabled = true },
      completion = {
        favoriteStaticMembers = {
          "org.junit.jupiter.api.Assertions.*",
          "org.junit.Assert.*",
          "org.mockito.Mockito.*",
        },
      },
      sources = {
        organizeImports = {
          starThreshold = 9999,
          staticStarThreshold = 9999,
        },
      },
    },
  },
  
  init_options = {
    bundles = {}
  },
}

-- Start or attach to jdtls
jdtls.start_or_attach(config)
