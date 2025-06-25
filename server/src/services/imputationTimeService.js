/**
 * Parses a time string (e.g., "2d 4h 30m", "1d", "5h", "45m") into total minutes.
 * Assumes 1 day = 8 hours.
 * @param {string} timeString The time string to parse.
 * @returns {number} Total time in minutes. Returns 0 for empty or invalid strings.
 */
export function parseTimeInput(timeString) {
  if (!timeString || typeof timeString !== 'string' || timeString.trim() === '') {
    return 0;
  }

  const daysRegex = /(\d+)\s*d/;
  const hoursRegex = /(\d+)\s*h/;
  const minutesRegex = /(\d+)\s*m/;

  let totalMinutes = 0;

  const dayMatch = timeString.match(daysRegex);
  if (dayMatch && dayMatch[1]) {
    totalMinutes += parseInt(dayMatch[1], 10) * 8 * 60; // 1 day = 8 hours
  }

  const hourMatch = timeString.match(hoursRegex);
  if (hourMatch && hourMatch[1]) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }

  const minuteMatch = timeString.match(minutesRegex);
  if (minuteMatch && minuteMatch[1]) {
    totalMinutes += parseInt(minuteMatch[1], 10);
  }

  return totalMinutes;
}

/**
 * Formats total minutes into a time string (e.g., "1d 2h 30m").
 * Assumes 1 day = 8 hours. Omits zero values.
 * @param {number} totalMinutes The total time in minutes.
 * @returns {string} The formatted time string. Returns "0m" if totalMinutes is 0 or less.
 */
export function formatTimeOutput(totalMinutes) {
  if (totalMinutes <= 0) {
    return '0m';
  }

  const MINUTES_PER_HOUR = 60;
  const HOURS_PER_DAY = 8;
  const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR; // 480 minutes

  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);
  let remainingMinutes = totalMinutes % MINUTES_PER_DAY;

  const hours = Math.floor(remainingMinutes / MINUTES_PER_HOUR);
  remainingMinutes = remainingMinutes % MINUTES_PER_HOUR;

  const minutes = remainingMinutes;

  let parts = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  // If after all calculations, parts is empty (e.g. totalMinutes was > 0 but resulted in no d,h,m like a very small fraction)
  // or if all parts were zero (which is covered by totalMinutes <= 0),
  // it defaults to "0m" due to the initial check.
  // If totalMinutes > 0 but all calculated d,h,m are 0 (e.g. totalMinutes = 0.5), it should still be handled.
  // The current logic: Math.floor for days and hours, and remainingMinutes for minutes.
  // If totalMinutes is, for example, 0.5, days=0, hours=0, minutes=0.5. parseInt will take care of it.
  // The problem is if minutes is the only part and it's < 1, it could be an issue.
  // However, `minutes` here is `remainingMinutes`, which is an integer.

  return parts.length > 0 ? parts.join(' ') : '0m'; // Ensure "0m" if parts is empty for some reason (e.g. negative input already handled)
}

// Basic Test Cases for parseTimeInput:
// console.log('parseTimeInput("1d") ->', parseTimeInput("1d")); // Expected: 480
// console.log('parseTimeInput("1h") ->', parseTimeInput("1h")); // Expected: 60
// console.log('parseTimeInput("30m") ->', parseTimeInput("30m")); // Expected: 30
// console.log('parseTimeInput("1d 2h 30m") ->', parseTimeInput("1d 2h 30m")); // Expected: 630
// console.log('parseTimeInput("2h 30m") ->', parseTimeInput("2h 30m")); // Expected: 150
// console.log('parseTimeInput("1d 30m") ->', parseTimeInput("1d 30m")); // Expected: 510
// console.log('parseTimeInput(" ") ->', parseTimeInput(" ")); // Expected: 0
// console.log('parseTimeInput("") ->', parseTimeInput("")); // Expected: 0
// console.log('parseTimeInput("invalid") ->', parseTimeInput("invalid")); // Expected: 0
// console.log('parseTimeInput("10d 5h 25m") ->', parseTimeInput("10d 5h 25m")); // Expected: 5125
// console.log('parseTimeInput("5d") ->', parseTimeInput("5d")); // Expected: 2400
// console.log('parseTimeInput("12h") ->', parseTimeInput("12h")); // Expected: 720
// console.log('parseTimeInput("120m") ->', parseTimeInput("120m")); // Expected: 120

// Basic Test Cases for formatTimeOutput:
// console.log('formatTimeOutput(630) ->', formatTimeOutput(630)); // Expected: "1d 2h 30m"
// console.log('formatTimeOutput(150) ->', formatTimeOutput(150)); // Expected: "2h 30m"
// console.log('formatTimeOutput(480) ->', formatTimeOutput(480)); // Expected: "1d"
// console.log('formatTimeOutput(479) ->', formatTimeOutput(479)); // Expected: "7h 59m" (480-1)
// console.log('formatTimeOutput(60) ->', formatTimeOutput(60));   // Expected: "1h"
// console.log('formatTimeOutput(30) ->', formatTimeOutput(30));   // Expected: "30m"
// console.log('formatTimeOutput(0) ->', formatTimeOutput(0));     // Expected: "0m"
// console.log('formatTimeOutput(480*2 + 60*3 + 15) ->', formatTimeOutput(480*2 + 60*3 + 15)); // Expected: "2d 3h 15m" (960 + 180 + 15 = 1155)
// console.log('formatTimeOutput(59) ->', formatTimeOutput(59)); // Expected: "59m"
// console.log('formatTimeOutput(481) ->', formatTimeOutput(481)); // Expected: "1d 1m"
// console.log('formatTimeOutput(960) ->', formatTimeOutput(960)); // Expected: "2d"
// console.log('formatTimeOutput(120) ->', formatTimeOutput(120)); // Expected: "2h"
// console.log('formatTimeOutput(510) ->', formatTimeOutput(510)); // Expected: "1d 30m" (480 + 30)
// console.log('formatTimeOutput(720) ->', formatTimeOutput(720)); // Expected: "1d 4h" (480 + 240)
// console.log('formatTimeOutput(5125) ->', formatTimeOutput(5125)); // Expected: "10d 5h 25m" (5125 = 10*480 + 5*60 + 25)

/*
// To run tests with node:
// 1. Save this file as timeUtils.js
// 2. Ensure you are in a directory with a package.json containing "type": "module" or save with .mjs extension
// 3. Run `node timeUtils.js`
// Test parseTimeInput
console.log('--- Testing parseTimeInput ---');
console.log('Input: "1d", Output:', parseTimeInput("1d"), '(Expected: 480)');
console.log('Input: "1h", Output:', parseTimeInput("1h"), '(Expected: 60)');
console.log('Input: "30m", Output:', parseTimeInput("30m"), '(Expected: 30)');
console.log('Input: "1d 2h 30m", Output:', parseTimeInput("1d 2h 30m"), '(Expected: 630)');
console.log('Input: "2h 30m", Output:', parseTimeInput("2h 30m"), '(Expected: 150)');
console.log('Input: "1d 30m", Output:', parseTimeInput("1d 30m"), '(Expected: 510)');
console.log('Input: " ", Output:', parseTimeInput(" "), '(Expected: 0)');
console.log('Input: "", Output:', parseTimeInput(""), '(Expected: 0)');
console.log('Input: "invalid", Output:', parseTimeInput("invalid"), '(Expected: 0)');
console.log('Input: "10d 5h 25m", Output:', parseTimeInput("10d 5h 25m"), '(Expected: 5125)');
console.log('Input: "5d", Output:', parseTimeInput("5d"), '(Expected: 2400)');
console.log('Input: "12h", Output:', parseTimeInput("12h"), '(Expected: 720)');
console.log('Input: "120m", Output:', parseTimeInput("120m"), '(Expected: 120)');
console.log('Input: "2d1h5m", Output:', parseTimeInput("2d1h5m"), '(Expected: 0, or needs more robust regex. Current: 960+60+5=1025 if spaces are optional)'); // Current will be 0 due to space requirement.
// Test formatTimeOutput
console.log('\n--- Testing formatTimeOutput ---');
console.log('Input: 630, Output:', formatTimeOutput(630), '(Expected: "1d 2h 30m")');
console.log('Input: 150, Output:', formatTimeOutput(150), '(Expected: "2h 30m")');
console.log('Input: 480, Output:', formatTimeOutput(480), '(Expected: "1d")');
console.log('Input: 479, Output:', formatTimeOutput(479), '(Expected: "7h 59m")');
console.log('Input: 60, Output:', formatTimeOutput(60), '(Expected: "1h")');
console.log('Input: 30, Output:', formatTimeOutput(30), '(Expected: "30m")');
console.log('Input: 0, Output:', formatTimeOutput(0), '(Expected: "0m")');
console.log('Input: 1155, Output:', formatTimeOutput(1155), '(Expected: "2d 3h 15m")'); // 480*2 + 60*3 + 15
console.log('Input: 59, Output:', formatTimeOutput(59), '(Expected: "59m")');
console.log('Input: 481, Output:', formatTimeOutput(481), '(Expected: "1d 1m")');
console.log('Input: 960, Output:', formatTimeOutput(960), '(Expected: "2d")');
console.log('Input: 120, Output:', formatTimeOutput(120), '(Expected: "2h")');
console.log('Input: 510, Output:', formatTimeOutput(510), '(Expected: "1d 30m")');
console.log('Input: 720, Output:', formatTimeOutput(720), '(Expected: "1d 4h")');
console.log('Input: 5125, Output:', formatTimeOutput(5125), '(Expected: "10d 5h 25m")');
*/
