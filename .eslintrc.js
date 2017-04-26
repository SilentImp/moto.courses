module.exports = {
  "extends": "standard",
  "plugins": [
    "standard",
    "promise"
  ],
  "env": {
        "browser": true,
        "es6": true
  },
  "rules": {
    "one-var": 0,
    "no-new": 0,
    "semi": ["error", "always"],
    "comma-style": ["error", "first"],
    "padded-blocks": ["error", "never"]
  }
};