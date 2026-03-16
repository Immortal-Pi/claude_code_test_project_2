---
description: Generate a bar chart of workout entries per month for the past year from the database. Use when the user asks to visualize, chart, or plot workout frequency/history.
user_invocable: true
---

# Workout Chart Generator

Generate a bar chart showing the number of workouts per month for the past year.

## Steps

1. Run the Python script that queries the database and generates the chart:

```bash
py scripts/workout_chart.py
```

2. The chart will be saved as `workout_chart.png` in the project root.

3. Read the generated image file to show it to the user:

```
Read workout_chart.png
```

## Details

- Connects to the Neon PostgreSQL database using `DATABASE_URL` from `.env`
- Queries the `workouts` table, grouping by month using the `startedAt` field
- Includes months with zero workouts for completeness
- Exports a bar chart as `workout_chart.png` at 150 DPI
- Requires Python packages: `psycopg2-binary`, `matplotlib`, `python-dotenv`
