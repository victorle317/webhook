module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node:true,
  },
//   extends:["eslint:recommended"],
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  globals: {
    __dirname: true
  },
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
  }
}
