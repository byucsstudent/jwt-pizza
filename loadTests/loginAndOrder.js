import { sleep, check, group, fail } from 'k6';
import http from 'k6/http';
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js';

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 5, duration: '10s' },
        { target: 15, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
};

export function scenario_1() {
  let response;

  const vars = {};

  group('Login and order - https://pizza.cs329.click/', function () {
    // Homepage
    response = http.get('https://pizza.cs329.click/', {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,sq;q=0.8',
        'cache-control': 'max-age=0',
        dnt: '1',
        'if-modified-since': 'Mon, 17 Jun 2024 23:40:44 GMT',
        priority: 'u=0, i',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
      },
    });
    sleep(13.5);

    // Login
    response = http.put('https://pizza-service.cs329.click/api/auth', '{"email":"d@jwt.com","password":"a"}', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,sq;q=0.8',
        'content-type': 'application/json',
        dnt: '1',
        origin: 'https://pizza.cs329.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    });

    if (!check(response, { 'status equals 200': (response) => response.status.toString() === '200' })) {
      console.log(response.body);
      fail('Login was *not* 200');
    }

    vars['token1'] = jsonpath.query(response.json(), '$.token')[0];

    sleep(4.7);

    // Get menu
    response = http.get('https://pizza-service.cs329.click/api/order/menu', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,sq;q=0.8',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        dnt: '1',
        'if-none-match': 'W/"259-3DLvwOvkUeaO5VMf/r8H6buJ/IU"',
        origin: 'https://pizza.cs329.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    });

    // Get franchise
    response = http.get('https://pizza-service.cs329.click/api/franchise', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,sq;q=0.8',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        dnt: '1',
        'if-none-match': 'W/"175-oYdTgcdsMnzMzwHY6ZxlcDkvmJ8"',
        origin: 'https://pizza.cs329.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    });
    sleep(8.4);

    // Purchase pizza
    response = http.post('https://pizza-service.cs329.click/api/order', '{"items":[{"menuId":1,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,sq;q=0.8',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        dnt: '1',
        origin: 'https://pizza.cs329.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    });
    sleep(3);

    vars['jwt'] = jsonpath.query(response.json(), '$.jwt')[0];

    // Verify pizza
    response = http.post('https://pizza-factory.cs329.click/api/order/verify', `{"jwt":"${vars['jwt']}"}`, {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9,sq;q=0.8',
        authorization: `Bearer ${vars['token1']}`,
        'content-type': 'application/json',
        dnt: '1',
        origin: 'https://pizza.cs329.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    });
  });
}
