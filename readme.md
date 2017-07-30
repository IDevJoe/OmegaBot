# Omega

The home of Omega's source code.

## New Developers Setup Guide

### Development

Obviously, clone the repository

**Create the config**

The configuration is essential to running hurricane. Without it, you will not be able to run it.

```json
{
  "token": "bot_token",
  "web_port": 8015,
  "test_bot": true,
  "version": "Staging",
  "discord_secret": "bot_secret",
  "googleKey": "google_key",
  "event_webhook": "event_webhook",
  "managers": ["your_id"],
  "developers": ["your_id"]
}
```

**Only change the `token`, `discord_secret`, `googleKey`, `event_webhook`, `developers`, and `managers` field. Leave everything else as-is.**
After completing that, run it to ensure that it starts.

### Managing Hurricane

Hurricane management is done through a tool named the `Hurricane Management Console`. It is done this way so that management commands don't clutter the help menu.

To download this, click here (Soon(TM)) and you will be given the latest version.