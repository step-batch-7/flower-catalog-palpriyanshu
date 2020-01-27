const pickupParams = (query, keyValue) => {
  const [key, value] = keyValue.split('=');
  query[key] = value;
  return query;
};
const readParams = keyValueTextPairs =>
  keyValueTextPairs.split('&').reduce(pickupParams, {});

const collectHeadersAndContent = (result, line) => {
  if (line === '') {
    result.body = '';
    return result;
  }
  if ('body' in result) {
    result.body += line;
    return result;
  }
  const [key, value] = line.split(': ');
  result.headers[key] = value;
  return result;
};

class Request {
  constructor(method, url, headers, body) {
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.body = body;
  }

  static parse(requestText) {
    const [request, ...headersAndBody] = requestText.split('\r\n');
    const [method, url, protocol] = request.split(' ');
    let {headers, body} = headersAndBody.reduce(collectHeadersAndContent, {
      headers: {}
    });

    if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      body = readParams(body);
    }

    const req = new Request(method, url, headers, body);
    console.warn(req);
    return req;
  }
}

module.exports = Request;
