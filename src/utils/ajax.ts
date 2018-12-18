import { Message } from 'element-ui';

export const request = function(url: string, config?: object) {
  return fetch(url, config).then(res => {
    if (res.status === 200) {
      if (res.headers.get('Content-type') === 'application/json') {
        return res.json();
      } else {
        return res.text();
      }
    } else {
      Message(res.statusText);
      return Promise.reject(res);
    }
  }, err => {
    Message(err);
    return Promise.reject(err);
  });
};

interface Params {
  [prop: string]: string|number|boolean|string[]|URLSearchParams;
}

interface ParamsInterface {
  params: Params;
}

export const get = (url: string, data: ParamsInterface = {params: {}}) => {
  const {params} = data;
  return request(buildURL(url, params));
};

export const post = (url: string, data: object = {}) => {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });
};

export const del = (url: string) => {
  return request(url, {
    method: 'DELETE'
  });
};

function buildURL(url: string, params: Params, paramsSerializer?: (params: Params) => string) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  let serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (params instanceof URLSearchParams) {
    serializedParams = params.toString();
  } else {
    const parts: string[] = [];

    forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (Array.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      forEach(val, function parseValue(v) {
        // if (utils.isDate(v)) {
        //   v = v.toISOString();
        // } else if (utils.isObject(v)) {
        //   v = JSON.stringify(v);
        // }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    const hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
}

function encode(val: string|number) {
  return encodeURIComponent(val.toString()).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

function forEach(obj: any, fn: (val: any, key: string|number, obj: any) => void) {
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  if (typeof obj !== 'object') {
    obj = [obj];
  }

  if (Array.isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}
