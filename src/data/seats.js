import { SEAT_PRICES } from '../utils/constants';

export const SEATS_PER_ROW = 10;

// Generates full auditorium seat objects using custom or default tier pricing
export function buildAuditoriumLayout(customPrices = SEAT_PRICES) {
  const silverPrice = Number(customPrices.Silver || SEAT_PRICES.Silver);
  const goldPrice = Number(customPrices.Gold || SEAT_PRICES.Gold);
  const platinumPrice = Number(customPrices.Platinum || SEAT_PRICES.Platinum);

  const rowDefinitions = [
    { row: 'A', tier: 'Platinum', price: platinumPrice },
    { row: 'B', tier: 'Platinum', price: platinumPrice },
    { row: 'C', tier: 'Gold', price: goldPrice },
    { row: 'D', tier: 'Gold', price: goldPrice },
    { row: 'E', tier: 'Gold', price: goldPrice },
    { row: 'F', tier: 'Gold', price: goldPrice },
    { row: 'G', tier: 'Silver', price: silverPrice },
    { row: 'H', tier: 'Silver', price: silverPrice },
    { row: 'I', tier: 'Silver', price: silverPrice },
  ];

  const layout = [];

  for (let i = 0; i < rowDefinitions.length; i += 1) {
    const rowInfo = rowDefinitions[i];
    const seats = [];

    for (let num = 1; num <= SEATS_PER_ROW; num += 1) {
      seats.push({
        id: `${rowInfo.row}${num}`,
        row: rowInfo.row,
        number: num,
        tier: rowInfo.tier,
        price: rowInfo.price,
      });
    }

    layout.push({
      row: rowInfo.row,
      tier: rowInfo.tier,
      price: rowInfo.price,
      seats,
    });
  }

  return layout;
}

// Deterministic baseline occupied seats so each movie/theatre/date/time has distinct availability
export function getBaselineOccupiedSeats(movieId, theatreId, date, showtime) {
  const seedText = `${movieId}-${theatreId}-${date}-${showtime}`;
  let hash = 0;

  for (let i = 0; i < seedText.length; i += 1) {
    hash = (hash * 31 + seedText.charCodeAt(i)) % 997;
  }

  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const allSeats = [];
  for (let r = 0; r < rowLetters.length; r += 1) {
    for (let n = 1; n <= SEATS_PER_ROW; n += 1) {
      allSeats.push(`${rowLetters[r]}${n}`);
    }
  }

  const occupied = [];
  const count = 12 + (hash % 10);

  for (let k = 0; k < count; k += 1) {
    const idx = (hash + k * 7) % allSeats.length;
    const seatId = allSeats[idx];
    if (!occupied.includes(seatId)) {
      occupied.push(seatId);
    }
  }

  return occupied;
}
