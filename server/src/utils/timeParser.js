export class TimeParser {
  /**
   * Formats a duration in minutes into a string "Xh Ym".
   * @param {number} totalMinutes - The total duration in minutes.
   * @returns {string} The formatted time string.
   */
  formatMinutesToTimeString(totalMinutes) {
    if (totalMinutes === null || typeof totalMinutes === 'undefined' || totalMinutes < 0) {
      return 'N/A';
    }
    if (totalMinutes === 0) {
      return '0m';
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let timeString = '';
    if (hours > 0) {
      timeString += `${hours}h`;
    }
    if (minutes > 0) {
      if (hours > 0) {
        timeString += ' ';
      }
      timeString += `${minutes}m`;
    }
    return timeString;
  }
}
