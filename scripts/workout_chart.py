"""
Query workout entries for the past year from the database and plot a bar chart
showing the number of workouts per month. Exports the chart as an image.
"""

import os
import sys
from datetime import datetime, timedelta
from collections import defaultdict

import psycopg2
from dotenv import load_dotenv
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker

# Load .env from project root
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in .env file")
    sys.exit(1)

# Calculate date range: past 12 months
now = datetime.now()
one_year_ago = now - timedelta(days=365)

# Query workouts
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
cur.execute(
    """
    SELECT date_trunc('month', started_at) AS month, COUNT(*) AS count
    FROM workouts
    WHERE started_at >= %s
    GROUP BY month
    ORDER BY month
    """,
    (one_year_ago,)
)
rows = cur.fetchall()
cur.close()
conn.close()

# Build a complete list of months (even those with 0 workouts)
months = []
counts_map = {row[0].strftime('%Y-%m'): row[1] for row in rows}

current = one_year_ago.replace(day=1)
end = now.replace(day=1)
while current <= end:
    key = current.strftime('%Y-%m')
    months.append(key)
    current = (current.replace(day=28) + timedelta(days=4)).replace(day=1)

labels = [datetime.strptime(m, '%Y-%m').strftime('%b %Y') for m in months]
counts = [counts_map.get(m, 0) for m in months]

# Plot
fig, ax = plt.subplots(figsize=(12, 6))
bars = ax.bar(labels, counts, color='#6366f1', edgecolor='#4f46e5', linewidth=0.5)

ax.set_xlabel('Month', fontsize=12)
ax.set_ylabel('Number of Workouts', fontsize=12)
ax.set_title('Workouts Per Month (Past Year)', fontsize=14, fontweight='bold')
ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True))
plt.xticks(rotation=45, ha='right')
plt.tight_layout()

# Add count labels on bars
for bar, count in zip(bars, counts):
    if count > 0:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.2,
                str(count), ha='center', va='bottom', fontsize=10, fontweight='bold')

# Export
output_path = os.path.join(os.path.dirname(__file__), '..', 'workout_chart.png')
fig.savefig(output_path, dpi=150, bbox_inches='tight')
print(f"Chart saved to: {os.path.abspath(output_path)}")
