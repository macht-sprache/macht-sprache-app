const env = Object.entries(process.env)
    .filter(([key]) => /^REACT_APP_/i.test(key))
    .map(([key, val]) => `${key}=${val}`)
    .join('\n');

console.log(env);
