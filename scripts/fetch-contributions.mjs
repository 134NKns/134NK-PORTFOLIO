import { writeFileSync } from 'node:fs';

const USERNAME = '134NKns';
const TOKEN = process.env.GITHUB_TOKEN;

async function fetchFromGraphQL() {
  if (!TOKEN) throw new Error('No GITHUB_TOKEN provided, falling back to public API');
  const query = `
    query($login: String!, $from: DateTime, $to: DateTime) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': '134NK-Portfolio-Updater',
    },
    body: JSON.stringify({
      query,
      variables: {
        login: USERNAME,
        from: '2026-01-01T00:00:00Z',
        to: '2026-12-31T23:59:59Z',
      },
    }),
  });

  if (!res.ok) throw new Error(`GraphQL HTTP error: ${res.status}`);
  const result = await res.json();
  if (result.errors) throw new Error(JSON.stringify(result.errors));

  const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error('Invalid calendar data from GraphQL');

  const contributions = [];
  calendar.weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      const count = day.contributionCount || 0;
      const level = count === 0 ? 0 : count <= 3 ? 1 : count <= 9 ? 2 : count <= 19 ? 3 : 4;
      contributions.push({
        date: day.date,
        count,
        level,
      });
    });
  });

  return {
    total: { '2026': calendar.totalContributions },
    contributions,
  };
}

async function fetchFromPublicAPI() {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=2026`);
  if (!res.ok) throw new Error(`Public API HTTP error: ${res.status}`);
  return await res.json();
}

async function run() {
  let data;
  try {
    console.log(`Fetching GitHub contributions for @${USERNAME} via GraphQL...`);
    data = await fetchFromGraphQL();
    console.log('Successfully fetched from GitHub GraphQL API!');
  } catch (err) {
    console.warn(`GraphQL fetch failed (${err.message}). Trying public API fallback...`);
    data = await fetchFromPublicAPI();
    console.log('Successfully fetched from fallback API!');
  }

  const json = JSON.stringify(data, null, 2);
  writeFileSync('src/data/contributions.json', json, 'utf8');
  writeFileSync('public/contributions.json', json, 'utf8');
  console.log(`Saved contributions data. Total: ${data.total?.lastYear || data.contributions?.length} items.`);
}

run().catch(err => {
  console.error('Fatal error updating contributions:', err);
  process.exit(1);
});
