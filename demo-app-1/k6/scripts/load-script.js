import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '15s', target: 50 },  // Плавное увеличение нагрузки
    { duration: '20s', target: 300 }, // Пиковая нагрузка
    { duration: '25s', target: 0 },   // Снижение нагрузки
  ],
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function () {
  const randomChoice = Math.random();

  if (randomChoice < 0.6) {
    // 60% POST-запросы (создание заказов)
    const payload = JSON.stringify({ user_id: randomInt(1, 2), amount: Math.random() * 100, description: 'k6 load' });
    const res = http.post('http://localhost:8080/api/orders', payload, { headers: { 'Content-Type': 'application/json' } });
    check(res, { 'created': (r) => r.status === 200 || r.status === 201 });
  } else if (randomChoice < 0.9) {
    // 30% GET-запросы (просмотр заказов)
    const res = http.get('http://localhost:8080/api/orders');
    check(res, { 'list ok': (r) => r.status === 200 });
  } else {
    // 10% PUT-запросы (обновление заказов)
    const payload = JSON.stringify({ amount: Math.random() * 200, description: 'updated k6 load' });
    const res = http.put(`http://localhost:8080/api/orders/${randomInt(1, 10)}`, payload, { headers: { 'Content-Type': 'application/json' } });
    check(res, { 'updated': (r) => r.status === 200 });
  }

  sleep(0.1); // Увеличиваем паузу между запросами
}