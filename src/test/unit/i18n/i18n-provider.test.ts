import { describe, expect, it } from 'vitest';
import { translateRussianText } from '@/i18n/i18n-provider';

describe('Russian UI translation', () => {
  it.each([
    ['Shackleton Medical Surge', 'Медицинский кризис у Шеклтона'],
    ['Medical oxygen', 'Медицинский кислород'],
    ['Payload exceeds capacity by 28 kg', 'Груз превышает грузоподъёмность на 28 кг'],
    ['ATLAS-1 departed with MED-017', 'ATLAS-1 отправился с заказом MED-017'],
    ['ATLAS-1 charged from 20% to 100%', 'ATLAS-1 заряжен с 20% до 100%'],
    ['Balance is now 2750 credits', 'Текущий баланс: 2750 кр.'],
    ['Target is below gross upper bound of 4100 credits', 'Цель ниже предельной выручки 4100 кр.'],
    ['Developer mode', 'Режим разработчика'],
    ['Cached tokens', 'Токены из кэша'],
    ['Request parameters', 'Параметры запроса'],
  ])('translates %s', (source, expected) => {
    expect(translateRussianText(source)).toBe(expected);
  });
});
