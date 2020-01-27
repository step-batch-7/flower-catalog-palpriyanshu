class Response {
  constructor() {
    this.protocol = 'HTTP/1.0';
    this.statusCode = 404;
    this.msg = 'not found';
    this.headers = [
      {key: 'content-length', value: 0},
      {key: 'content-type', value: 'text/plain'}
    ];
  }

  setHeader(key, value) {
    const header = this.headers.find(header => header.key === key);
    if (header) {
      header.value = value;
    } else {
      this.headers.push({key, value});
    }
  }

  generateHeaderText() {
    const lines = this.headers.map(header => `${header.key}: ${header.value}`);
    return lines.join('\r\n');
  }

  writeTo(writable) {
    writable.write(`${this.protocol} ${this.statusCode} ${this.msg}\n`);
    writable.write(this.generateHeaderText());
    writable.write('\r\n\r\n');
    this.body && writable.write(this.body);
  }
}

module.exports = Response;
