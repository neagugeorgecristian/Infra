// Defines which extra cities appear at which point in the 360s run
// timeLeft counts DOWN from 360, so 360 - appearAt = seconds elapsed

export const SPAWNABLE_CITIES = {
  moldova: [
    // appears at 30s elapsed (timeLeft = 330)
    { appearAtTimeLeft: 330, city: { x: 30, y: 65, cityName: 'Cahul', region: "south" } },
    // appears at 90s elapsed (timeLeft = 270)
    { appearAtTimeLeft: 270, city: { x: 70, y: 20, cityName: 'Soroca', region: "east" } },
  ],
  romania: [
    { appearAtTimeLeft: 330, city: { x: 60, y: 35, cityName: 'Bacău', region: "east" } },
    { appearAtTimeLeft: 270, city: { x: 25, y: 55, cityName: 'Târgu Jiu', region: "southwest" } },
  ],
  bulgaria: [
    { appearAtTimeLeft: 330, city: { x: 50, y: 70, cityName: 'Stara Zagora', region: "center" } },
    { appearAtTimeLeft: 270, city: { x: 15, y: 20, cityName: 'Vidin', region: "northwest" } },
  ]
};