# 42 MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) server designed by [Mateo LBS](https://github.com/MatLBS) to interact with the [42 API](https://api.intra.42.fr). It lets AI assistants look up 42 students' profiles, progression, teams, and coalition standing, and browse campus life — locations, events, and exams.

[![Security Scan](https://mcpampel.com/badge/MatLBS/42-mcp-server.svg)](https://mcpampel.com/repo/MatLBS/42-mcp-server)

## Features

- **Profiles & progression:** Look up any 42 student's profile, cursus progression, project statuses, earned achievements, quests, and titles by login or ID
- **Search:** Search/list users with filters (campus, login, piscine year/month), paginated
- **Teams:** Get the teams a user has been part of, or the full detail of a team (members, status, final mark, repo url)
- **Coalitions:** Get a user's coalition membership/score, or a coalition's score history
- **Campus life:** List campuses, see who's currently logged in and where, browse upcoming events and exam dates

## How to Install

Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "42-mcp": {
      "command": "npx",
      "args": ["-y", "42-mcp-server@latest"],
      "env": {
        "FORTY_TWO_TOKEN": "<FORTY_TWO_TOKEN>",
        "FORTY_TWO_URL": "https://api.intra.42.fr"
      }
    }
  }
}
```

## Configuration

| Variable          | Description                                          |
| ------------------ | ------------------------------------------------------ |
| `FORTY_TWO_TOKEN`  | A 42 API access token (OAuth2 Bearer token)            |
| `FORTY_TWO_URL`    | Base URL of the 42 API (`https://api.intra.42.fr`)     |

`FORTY_TWO_TOKEN` is used as-is and is not refreshed automatically by the server. Get one via the
Client Credentials grant, using the UID/secret of a 42 OAuth app created at
[profile.intra.42.fr/oauth/applications](https://profile.intra.42.fr/oauth/applications) (the
"public" scope is enough):

```bash
curl -X POST "https://api.intra.42.fr/oauth/token" \
  -d "grant_type=client_credentials" \
  -d "client_id=<uid>" \
  -d "client_secret=<secret>"
```

Copy the `access_token` field from the response into `FORTY_TWO_TOKEN`. It expires after a couple
of hours (see `expires_in` in the response), so you'll need to repeat this and update it when it
does.

### Output format

The server returns **JSON** output.

## Available Tools

### Profiles & progression

| Tool                        | Description                                                                |
| --------------------------- | --------------------------------------------------------------------------- |
| `42-get-user`               | Get a 42 user's full profile by numeric ID or login                        |
| `42-search-users`           | List/search users with optional filters (campus, login, piscine year/month), paginated |
| `42-get-user-cursus`        | Get a user's progression across cursus (level, skills, blackholed_at)      |
| `42-get-user-projects`      | Get a user's project statuses (validated/failed, mark, team)               |
| `42-get-user-achievements`  | Get the achievements (badges) a user has earned                            |
| `42-get-user-quests`        | Get a user's quest progress (in-progress and validated quests)             |
| `42-get-user-titles`        | Get the titles a user has unlocked                                         |

### Teams

| Tool                        | Description                                                                |
| --------------------------- | --------------------------------------------------------------------------- |
| `42-get-user-teams`         | Get the teams a user has been part of for project defenses                 |
| `42-get-team`                | Get full details of a team by ID (members, status, final mark, repo url)   |

### Coalitions

| Tool                        | Description                                                  |
| --------------------------- | -------------------------------------------------------------- |
| `42-get-user-coalition`     | Get a user's coalition membership and current score             |
| `42-get-coalition-scores`   | Get the score history (points gained/lost) of a coalition       |

### Campus life

| Tool                        | Description                                                  |
| --------------------------- | -------------------------------------------------------------- |
| `42-list-campus`            | List all 42 campuses, paginated                               |
| `42-get-campus-locations`   | Get workstation locations for a campus (who's logged in where) |
| `42-list-events`            | List upcoming events for a campus, paginated                  |
| `42-get-event`              | Get details of a specific event by ID                          |
| `42-list-exams`             | List exam dates for a campus, paginated                       |
