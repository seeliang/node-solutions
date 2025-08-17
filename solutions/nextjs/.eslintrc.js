module.exports = {
  "env": {
    "node": true,
    "browser": true,
    "es6": true
  },
  "extends": [
    "plugin:react/recommended"
  ],
  "overrides": [
    {
      "files": [ "*.js"],
      "rules": {
        "react/prop-types": 0
      }
    }
  ]
}