export class TimeParser {
  constructor() {
    this.timeUnits = [
      { symbol: 'w', minutes: 5 * 8 * 60, regex: /(\d+)\s*w/ }, // 1 week = 5 days, 1 day = 8 hours
      { symbol: 'd', minutes: 8 * 60, regex: /(\d+)\s*d/ }, // 1 day = 8 hours
      { symbol: 'h', minutes: 60, regex: /(\d+)\s*h/ }, // 1 hour
      { symbol: 'm', minutes: 1, regex: /(\d+)\s*m/ } // 1 minute
    ];
  }

  /**
   * Validates the format of a time input string.
   * @param {string} timeString The time string to validate.
   * @returns {boolean} True if valid, false otherwise.
   */
  validateTimeInput(timeString) {
    if (!timeString || typeof timeString !== 'string' || timeString.trim() === '') {
      return false;
    }

    const regexPattern = `^${this.timeUnits.map(unit => `(?:(\\d+)${unit.symbol}\\s*)?`).join('')}$`;
    const regex = new RegExp(regexPattern);
    const containsAtLeastOnePart = new RegExp(`\\d+[${this.timeUnits.map(unit => unit.symbol).join('')}]`);

    const trimmedString = timeString.trim();
    if (!containsAtLeastOnePart.test(trimmedString)) {
      return false;
    }

    return regex.test(trimmedString) && trimmedString !== "";
  }

  /**
   * Parses a time string into total minutes.
   * @param {string} timeString The time string to parse.
   * @returns {number} Total time in minutes. Returns 0 if the string is invalid or empty.
   */
  parseTimeInputToMinutes(timeString) {
    if (!this.validateTimeInput(timeString)) {
      return 0;
    }

    let totalMinutes = 0;
    const trimmedString = timeString.trim();

    this.timeUnits.forEach(unit => {
      const match = trimmedString.match(unit.regex);
      if (match && match[1]) {
        totalMinutes += parseInt(match[1], 10) * unit.minutes;
      }
    });

    return totalMinutes;
  }

  /**
   * Formats total minutes into a time string.
   * @param {number} totalMinutes The total time in minutes.
   * @returns {string} The formatted time string. Returns "0m" if totalMinutes is 0 or less.
   */
  formatMinutesToTimeString(totalMinutes) {
    if (isNaN(totalMinutes) || totalMinutes <= 0) {
      return "0m";
    }

    let remainingMinutes = totalMinutes;
    const parts = [];

    this.timeUnits.forEach(unit => {
      if (remainingMinutes >= unit.minutes) {
        const value = Math.floor(remainingMinutes / unit.minutes);
        parts.push(`${value}${unit.symbol}`);
        remainingMinutes %= unit.minutes;
      }
    });

    return parts.length > 0 ? parts.join(" ") : "0m";
  }

  /**
   * Formats total minutes into an H:MM string.
   * @param {number} totalMinutes The total time in minutes.
   * @returns {string} The formatted time string e.g., "1:30" or "0:45". Returns "0:00" if invalid.
   */
  formatMinutesToHourMinuteString(totalMinutes) {
    if (isNaN(totalMinutes) || totalMinutes < 0) {
      return "0:00";
    }
    if (totalMinutes === 0) {
      return "0:00"; // Or simply "0" or "-" as preferred, but H:MM format implies this.
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${paddedMinutes}`;
  }
}
