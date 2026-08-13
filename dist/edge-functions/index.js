// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = (arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
};

// node_modules/hono/dist/utils/body.js
var isRawRequest = (request) => "headers" in request;
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType = headers.get("Content-Type");
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) {
    return convertFormDataToBodyData(
      await request.bodyCache.formData,
      options
    );
  }
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var tryDecodeURIComponent = (str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str;
var _decodeURI = (value) => {
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return tryDecodeURIComponent(value);
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var HonoRequest = class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = tryDecodeURIComponent(value);
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    for (const anyCachedKey in bodyCache) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    ;
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) {
        if (key === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      if (!responseHeaders) {
        let count = 0;
        for (const k in headers) {
          if (++count > 1 || typeof headers[k] !== "string") {
            responseHeaders = new Headers();
            break;
          }
        }
      }
      if (responseHeaders) {
        for (const k in headers) {
          const v = headers[k];
          if (typeof v === "string") {
            responseHeaders.set(k, v);
          } else {
            responseHeaders.delete(k);
            for (const v2 of v) {
              responseHeaders.append(k, v2);
            }
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch", "query"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app11) {
    const subApp = this.basePath(path);
    app11.routes.map((r) => {
      let handler;
      if (app11.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app11.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} env - env Object
   * @param {ExecutionContext} executionCtx - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path);
}

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return b === TAIL_WILDCARD_REG_EXP_STR ? -1 : 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class _Node {
  // handler index of a dynamic path, or -1 for a static path terminal
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : null : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
        if (name && pattern[2]) {
          if (regexpStr === ".*") {
            throw PATH_ERROR;
          }
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) {
            throw PATH_ERROR;
          }
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) {
            throw PATH_ERROR;
          }
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ONLY_WILDCARD_REG_EXP_STR && regexpStr !== TAIL_WILDCARD_REG_EXP_STR) {
            for (const k in node.#children) {
              if (
                // a single-char pattern coexists with single-char literals as a literal does
                (regexpStr.length > 1 || k.length > 1) && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
              ) {
                throw PATH_ERROR;
              }
            }
          }
          nextNode = node.#children[regexpStr] = new _Node();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) {
            if (k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR) {
              throw PATH_ERROR;
            }
          }
          nextNode = node.#children[token] = new _Node();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) {
      throw PATH_ERROR;
    }
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  // dynamic path -> [handler index, param assoc]; static paths are not registered
  paths = /* @__PURE__ */ Object.create(null);
  insert(path, isStatic) {
    if (isStatic) {
      this.#root.insert(path.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#tries = { [METHOD_NAME_ALL]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
          this.#insertPath(method, p);
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      Object.keys(middleware).forEach((m) => {
        if ((method === METHOD_NAME_ALL || method === m) && !middleware[m][path]) {
          this.#insertPath(m, path);
          middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        }
      });
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          if (!routes[m][path2]) {
            this.#insertPath(m, path2);
            routes[m][path2] = [
              ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
            ];
          }
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = this.#tries = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = /* @__PURE__ */ Object.create(null);
    const handlerData = [];
    [middleware, routes].forEach((r) => {
      for (const path in r) {
        const handlers = r[path];
        const pathData = trie.paths[path];
        if (!pathData) {
          staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
          continue;
        }
        const paramAssoc = pathData[1];
        handlerData[pathData[0]] = handlers.map(([h, paramCount]) => {
          const paramIndexMap = /* @__PURE__ */ Object.create(null);
          paramCount -= 1;
          for (; paramCount >= 0; paramCount--) {
            const [key, value] = paramAssoc[paramCount];
            paramIndexMap[key] = value;
          }
          return [h, paramIndexMap];
        });
      }
    });
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (let i = 0, len = handlerData.length; i < len; i++) {
      for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
        const map = handlerData[i][j]?.[1];
        if (!map) {
          continue;
        }
        const keys = Object.keys(map);
        for (let k = 0, len3 = keys.length; k < len3; k++) {
          map[keys[k]] = paramReplacementMap[map[keys[k]]];
        }
      }
    }
    const handlerMap = [];
    for (const i in indexReplacementMap) {
      handlerMap[i] = handlerData[indexReplacementMap[i]];
    }
    return [regexp, handlerMap, staticMap];
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = (children) => {
  for (const _ in children) {
    return true;
  }
  return false;
};
var Node2 = class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
var cors = (options) => {
  const opts = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "QUERY"],
    allowHeaders: [],
    exposeHeaders: [],
    ...options
  };
  const exposeHeadersStr = opts.exposeHeaders?.length ? opts.exposeHeaders.join(",") : void 0;
  const allowHeadersStr = opts.allowHeaders?.length ? opts.allowHeaders.join(",") : void 0;
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return async (origin, c) => (await optsAllowMethods(origin, c)).join(",");
    } else if (Array.isArray(optsAllowMethods)) {
      const methodsStr = optsAllowMethods.join(",");
      return () => methodsStr;
    } else {
      return () => "";
    }
  })(opts.allowMethods);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (exposeHeadersStr) {
      set("Access-Control-Expose-Headers", exposeHeadersStr);
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods) {
        set("Access-Control-Allow-Methods", allowMethods);
      }
      let headersStr = allowHeadersStr;
      if (!headersStr) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headersStr = requestHeaders.split(",").map((h) => h.trim()).join(",");
        }
      }
      if (headersStr) {
        set("Access-Control-Allow-Headers", headersStr);
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  };
};

// src/data/initialData.ts
var INITIAL_BOOKS = [
  // 文学诗词
  {
    id: "poetry-1",
    title: "\u8BD7\u753B\u4EBA\u95F4",
    category: "\u6587\u5B66\u8BD7\u8BCD",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-emerald-800 to-teal-900",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    backCoverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    description: "\u878D\u6C47\u56DB\u5B63\u98CE\u7269\u4E0E\u4EBA\u95F4\u70DF\u706B\u7684\u6292\u60C5\u8BD7\u96C6\u3002\u753B\u4E2D\u6709\u8BD7\uFF0C\u8BD7\u4E2D\u6709\u753B\uFF0C\u8BB0\u5F55\u7EA2\u5C18\u70DF\u706B\u91CC\u6700\u89E6\u52A8\u4EBA\u5FC3\u7684\u5C0F\u7F8E\u597D\u3002",
    tags: ["\u6292\u60C5\u8BD7", "\u56DB\u5B63\u98CE\u7269", "\u53E4\u5178\u610F\u5883", "\u539F\u521B\u8BD7\u6B4C"],
    wordCount: "1.2\u4E07\u5B57",
    likes: 128,
    views: 1450,
    createdAt: "2026-03-15",
    isOriginal: true,
    chapters: [
      {
        id: "p1-c1",
        title: "\u5377\u4E00\uFF1A\u6708\u4E0B\u758F\u5F71",
        content: `\u3010\u758F\u5F71\u3011
\u758F\u5F71\u6A2A\u659C\u6C34\u6E05\u6D45\uFF0C\u6697\u9999\u6D6E\u52A8\u6708\u9EC4\u660F\u3002
\u884C\u5C3D\u6C5F\u5357\u6570\u5341\u7A0B\uFF0C\u98CE\u5149\u4E0D\u4E0E\u56DB\u65F6\u540C\u3002
\u591C\u9759\u6C60\u5E73\u82B1\u6C14\u52A8\uFF0C\u4E00\u5E18\u5FAE\u98CE\u7167\u5B64\u660E\u3002
\u83AB\u9053\u7EA2\u5C18\u65E0\u5BC4\u5904\uFF0C\u5FC3\u5B89\u4F55\u5904\u4E0D\u5F52\u7A0B\u3002

\u3010\u665A\u6625\u5BC4\u6000\u3011
\u98CE\u8FC7\u6797\u68A2\u7AF9\u5F71\u659C\uFF0C\u5C0F\u7A97\u72EC\u5750\u8BD5\u65B0\u8336\u3002
\u6D41\u5E74\u6E10\u89C9\u97F6\u5149\u6D45\uFF0C\u7559\u5F97\u5E7D\u9999\u5728\u5BA2\u5BB6\u3002
\u95F2\u770B\u5EAD\u524D\u82B1\u843D\u5C3D\uFF0C\u4E91\u5377\u4E91\u8212\u4EFB\u897F\u659C\u3002`
      },
      {
        id: "p1-c2",
        title: "\u5377\u4E8C\uFF1A\u6625\u6C34\u714E\u8336",
        content: `\u3010\u6625\u6C34\u714E\u8336\u3011
\u6C72\u4E00\u74E2\u6E05\u51BD\u6625\u6CC9\uFF0C\u5C0F\u706B\u6162\u714E\u4E00\u58F6\u65B0\u91C7\u7684\u7EFF\u8336\u3002
\u6C34\u6C7D\u7F2D\u7ED5\u95F4\uFF0C\u4EFF\u4F5B\u770B\u89C1\u8FDC\u5C71\u7684\u4E91\u96FE\u4E0E\u9752\u82D4\u3002
\u751F\u6D3B\u4E0D\u5FC5\u603B\u662F\u98CE\u6025\u6D6A\u9AD8\uFF0C
\u9759\u5750\u7247\u523B\uFF0C\u542C\u6C34\u6CB8\u8336\u8212\uFF0C\u4FBF\u662F\u4EBA\u95F4\u6781\u597D\u7684\u65F6\u5149\u3002

\u3010\u542C\u96E8\u3011
\u6A90\u4E0B\u6C34\u6EF4\u4E32\u6210\u7EBF\uFF0C\u7838\u5728\u9752\u77F3\u677F\u4E0A\u8106\u54CD\u3002
\u7EB8\u4F1E\u4E0B\u6536\u62E2\u7684\u662F\u6574\u4E2A\u6C5F\u5357\u7684\u70DF\u96E8\uFF0C
\u653E\u4E0B\u7684\uFF0C\u662F\u4E00\u6574\u5929\u6C89\u95F7\u7684\u51E1\u4FD7\u5FC3\u4E8B\u3002`
      },
      {
        id: "p1-c3",
        title: "\u5377\u4E09\uFF1A\u4EBA\u95F4\u5BA2",
        content: `\u3010\u4EBA\u95F4\u5BA2\u3011
\u6211\u4EEC\u90FD\u662F\u8FD9\u82CD\u832B\u5B87\u5B99\u91CC\u7684\u5306\u5306\u8FC7\u5BA2\uFF0C
\u501F\u4E00\u56CA\u661F\u5149\u884C\u8DEF\uFF0C\u8E0F\u6EE1\u811A\u971C\u96EA\u957F\u6B4C\u3002
\u82E5\u662F\u8DEF\u8FC7\u4F60\u7684\u7A97\u524D\uFF0C
\u8BF7\u4E0D\u5FC5\u95EE\u6211\u6765\u8DEF\uFF0C\u53EA\u9001\u6211\u4E00\u7F15\u6708\u8272\u5373\u53EF\u3002

\u3010\u5F52\u821F\u3011
\u6E2F\u6E7E\u505C\u6CCA\u7740\u8FDC\u822A\u7684\u821F\uFF0C
\u98CE\u505C\u96E8\u6B47\u540E\uFF0C\u6EE1\u8239\u90FD\u662F\u7480\u74A8\u7684\u661F\u8F89\u3002`
      }
    ]
  },
  {
    id: "poetry-2",
    title: "\u5C0F\u8BF4\u884D\u751F\u539F\u521B\u8BD7\u5408\u96C6",
    category: "\u6587\u5B66\u8BD7\u8BCD",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-amber-700 to-stone-900",
    description: "\u4E3A\u81EA\u5BB6\u521B\u4F5C\u7684\u5C0F\u8BF4\u300A\u4E88\u68A6\u6C89\u6CA6\u300B\u3001\u300A\u5047\u5BD0\u300B\u7B49\u89D2\u8272\u4E0E\u540D\u573A\u9762\u6240\u64B0\u5199\u7684\u884D\u751F\u65E7\u4F53\u8BD7\u4E0E\u73B0\u4EE3\u8BD7\u6B4C\u5408\u8F91\u3002",
    tags: ["\u5C0F\u8BF4\u884D\u751F", "\u53E4\u98CE\u8BD7\u8BCD", "\u89D2\u8272\u6B4C\u8BCD", "\u60C5\u611F\u5BC4\u6258"],
    wordCount: "8,500\u5B57",
    likes: 95,
    views: 980,
    createdAt: "2026-04-10",
    isOriginal: true,
    chapters: [
      {
        id: "p2-c1",
        title: "\u7B2C\u4E00\u7BC7\uFF1A\u9898\u300A\u4E88\u68A6\u6C89\u6CA6\u300B\xB7\u591C\u706F",
        content: `\u3010\u591C\u706F\u3011
\u55A7\u56A3\u9000\u53BB\u7684\u90FD\u5E02\u89D2\u843D\uFF0C
\u6709\u4E00\u76CF\u6C89\u5BC2\u7684\u591C\u706F\u4F2B\u7ACB\u3002
\u5B83\u770B\u900F\u4E86\u8C0E\u8A00\u4E0E\u8FF7\u832B\uFF0C
\u5374\u4F9D\u7136\u4E3A\u8FF7\u9014\u7684\u7075\u9B42\u4FDD\u7559\u4E00\u4E1D\u5FAE\u5F31\u7684\u6E29\u5B58\u3002

\u3010\u6C89\u6CA6\u4E0E\u5FAE\u5149\u3011
\u65E0\u58F0\u5904\u542C\u96F7\u9706\u9690\uFF0C
\u6697\u591C\u884C\u81F3\u5FAE\u5149\u751F\u3002
\u83AB\u8A00\u4EBA\u5FC3\u5982\u6DF1\u6D77\uFF0C
\u4E14\u4EE5\u6B64\u8EAB\u7834\u957F\u591C\u3002`
      },
      {
        id: "p2-c2",
        title: "\u7B2C\u4E8C\u7BC7\uFF1A\u9898\u300A\u5047\u5BD0\u300B\xB7\u68A6\u9192\u65F6\u5206",
        content: `\u3010\u68A6\u9192\u65F6\u5206\u3011
\u5982\u679C\u5348\u591C\u5341\u4E8C\u70B9\u7684\u949F\u58F0\u6572\u54CD\uFF0C
\u4F60\u7684\u68A6\u5883\u4E0E\u6211\u7684\u68A6\u5883\u610F\u5916\u76F8\u649E\u3002
\u7A76\u7ADF\u662F\u6211\u8D70\u8FDB\u4E86\u4F60\u7684\u56DE\u5FC6\uFF0C
\u8FD8\u662F\u4F60\u5728\u6211\u7684\u8352\u539F\u91CC\u79CD\u4E0B\u4E86\u4E00\u6735\u82B1\uFF1F

\u3010\u5047\u5BD0\u6B4C\u3011
\u5B50\u591C\u949F\u58F0\u9519\u91CD\u8F6E\uFF0C
\u68A6\u4E2D\u6B22\u7B11\u9192\u65F6\u771F\u3002
\u4F55\u5FC5\u6DF1\u7A76\u8C01\u662F\u5BA2\uFF0C
\u76F8\u9022\u4E00\u5239\u5DF2\u6210\u6625\u3002`
      },
      {
        id: "p2-c3",
        title: "\u7B2C\u4E09\u7BC7\uFF1A\u9898\u300A\u7F18\u7EED\u6D41\u5E74\u300B\xB7\u524D\u5C18",
        content: `\u3010\u524D\u5C18\u3011
\u5C81\u6708\u5982\u540C\u4E00\u628A\u949D\u5200\uFF0C
\u78E8\u5E73\u4E86\u5E74\u5C11\u65F6\u7684\u68F1\u89D2\u4E0E\u8F7B\u72C2\u3002
\u53EF\u6BCF\u5F53\u98CE\u8D77\u65F6\uFF0C
\u4F9D\u7136\u80FD\u542C\u89C1\u5F53\u5E74\u5DF7\u5B50\u91CC\u6E05\u8106\u7684\u81EA\u884C\u8F66\u94C3\u58F0\uFF0C
\u548C\u90A3\u4E2A\u672A\u66FE\u8BF4\u51FA\u53E3\u7684\u7EA6\u5B9A\u3002`
      }
    ]
  },
  // 小说
  {
    id: "novel-1",
    title: "\u4E88\u68A6\u6C89\u6CA6",
    category: "\u5C0F\u8BF4",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-slate-800 to-indigo-950",
    description: "\u90FD\u5E02\u6C89\u6CA6\u4E0E\u5FC3\u7075\u6551\u8D4E\u5C0F\u8BF4\u3002\u5728\u9ED1\u591C\u4E0E\u9ECE\u660E\u7684\u4EA4\u754C\u5904\uFF0C\u5BFB\u627E\u4EBA\u5FC3\u6700\u6DF1\u5904\u7684\u6E29\u5B58\u4E0E\u5B88\u62A4\u3002",
    tags: ["\u60AC\u7591\u6551\u8D4E", "\u90FD\u5E02\u5FC3\u7406", "\u539F\u521B\u957F\u7BC7", "\u63A8\u7406\u60C5\u611F"],
    wordCount: "6.8\u4E07\u5B57",
    likes: 240,
    views: 3200,
    createdAt: "2026-01-20",
    isOriginal: true,
    chapters: [
      {
        id: "n1-c1",
        title: "\u7B2C\u4E00\u7AE0\uFF1A\u96E8\u591C\u7684\u4FE1\u7B3A",
        content: `\u57CE\u5E02\u5728\u66B4\u96E8\u4E2D\u6C89\u7761\uFF0C\u9713\u8679\u706F\u5149\u5728\u79EF\u6C34\u7684\u6C34\u5751\u91CC\u6298\u5C04\u51FA\u79BB\u5947\u6591\u6593\u7684\u5149\u6655\u3002

\u6797\u6C89\u5750\u5728\u5DE5\u4F5C\u5BA4\u7684\u4E66\u684C\u524D\uFF0C\u624B\u8FB9\u7684\u9ED1\u5496\u5561\u65E9\u5DF2\u51B7\u5374\u3002\u684C\u4E0A\u9759\u9759\u8EBA\u7740\u4E00\u5C01\u6CA1\u6709\u90AE\u6233\u7684\u4FE1\u7B3A\uFF0C\u4FE1\u5C01\u4E0A\u53EA\u6709\u4E00\u884C\u7528\u659C\u4F53\u5B57\u4E66\u5199\u7684\u5B57\u8FF9\uFF1A\u201C\u6709\u4E9B\u7075\u9B42\u5728\u6DF1\u6E0A\u91CC\u6C89\u6CA6\uFF0C\u53EA\u6709\u5728\u6781\u5EA6\u5B89\u9759\u7684\u65F6\u5019\uFF0C\u624D\u80FD\u542C\u89C1\u68A6\u7684\u58F0\u97F3\u3002\u201D

\u5916\u9762\u4E00\u9053\u95EA\u7535\u5212\u7834\u591C\u7A7A\uFF0C\u7D27\u63A5\u7740\u662F\u9686\u9686\u7684\u96F7\u58F0\u3002\u6797\u6C89\u4F38\u624B\u62FF\u8D77\u90A3\u5C01\u4FE1\uFF0C\u7528\u5F00\u4FE1\u5200\u5C0F\u5FC3\u5207\u5F00\u5C01\u53E3\u3002\u4FE1\u7EB8\u6563\u53D1\u7740\u4E00\u80A1\u8001\u65E7\u6728\u8D28\u4E66\u9999\u4E0E\u5FAE\u6E7F\u7684\u96E8\u6C34\u6C14\u606F\u3002

\u201C\u81F4\u6BCF\u4E00\u4E2A\u5728\u957F\u591C\u4E0E\u68A6\u5883\u4E2D\u72EC\u884C\u7684\u4EBA\u2026\u2026\u201D\u4FE1\u7684\u5F00\u5934\u8FD9\u6837\u5199\u9053\u3002

\u6797\u6C89\u5FAE\u5FAE\u8E59\u7709\u3002\u4ED6\u4F5C\u4E3A\u4E00\u540D\u5FC3\u7406\u54A8\u8BE2\u5E08\uFF0C\u89C1\u8FC7\u4E86\u592A\u591A\u4EBA\u5185\u5FC3\u7684\u9634\u6697\u4E0E\u6323\u624E\u3002\u4F46\u8FD9\u5C01\u4FE1\u7ED9\u4ED6\u7684\u611F\u89C9\u5B8C\u5168\u4E0D\u540C\u2014\u2014\u8FD9\u4E0D\u4EC5\u662F\u4E00\u5C01\u6C42\u52A9\u4FE1\uFF0C\u66F4\u50CF\u662F\u4E00\u4EFD\u6765\u81EA\u4E8E\u6DF1\u6C89\u68A6\u5883\u91CC\u7684\u9080\u7EA6\u3002`
      },
      {
        id: "n1-c2",
        title: "\u7B2C\u4E8C\u7AE0\uFF1A\u9759\u9ED8\u7684\u75D5\u8FF9",
        content: `\u7B2C\u4E8C\u5929\u6E05\u6668\uFF0C\u96E8\u8FC7\u5929\u6674\u3002

\u6797\u6C89\u6309\u7167\u4FE1\u4E2D\u63D0\u53CA\u7684\u5730\u5740\uFF0C\u6765\u5230\u4E86\u8001\u57CE\u533A\u4E00\u6761\u72ED\u7A84\u7684\u5DF7\u5B50\u91CC\u3002\u8FD9\u91CC\u7684\u5EFA\u7B51\u5927\u90FD\u6709\u7740\u4E09\u5341\u5E74\u4EE5\u4E0A\u7684\u5386\u53F2\uFF0C\u5899\u76AE\u5265\u843D\uFF0C\u722C\u5C71\u864E\u5728\u6591\u9A73\u7684\u7EA2\u7816\u4E0A\u873F\u8712\u3002

\u5728\u5DF7\u5B50\u5C3D\u5934\u7684\u4E00\u5BB6\u53E4\u65E7\u4E66\u5E97\u524D\uFF0C\u6797\u6C89\u505C\u4E0B\u4E86\u811A\u6B65\u3002\u6728\u5236\u62DB\u724C\u4E0A\u7528\u6977\u4E66\u5199\u7740\u201C\u758F\u5F71\u201D\u4E24\u4E2A\u5B57\u3002

\u63A8\u5F00\u95E8\uFF0C\u95E8\u4E0A\u7684\u94DC\u94C3\u53D1\u51FA\u6E05\u8106\u7684\u54CD\u58F0\u3002\u5C4B\u91CC\u98D8\u7740\u6C89\u9999\u4E0E\u65E7\u4E66\u7279\u6709\u7684\u6C14\u606F\u3002\u9AD8\u8038\u81F3\u5929\u82B1\u677F\u7684\u4E66\u67B6\u4E4B\u95F4\uFF0C\u7AD9\u7740\u4E00\u4E2A\u7A7F\u7740\u6DF1\u7070\u8272\u9488\u7EC7\u886B\u7684\u9752\u5E74\uFF0C\u6B63\u4F4E\u5934\u6574\u7406\u4E00\u53E0\u624B\u7A3F\u3002

\u201C\u4F60\u6765\u4E86\uFF0C\u6797\u533B\u751F\u3002\u201D\u9752\u5E74\u6CA1\u6709\u62AC\u5934\uFF0C\u58F0\u97F3\u6E29\u548C\u5374\u5E26\u6709\u67D0\u79CD\u6D1E\u5BDF\u4EBA\u5FC3\u7684\u529B\u91CF\u3002

\u201C\u4F60\u662F\u5199\u90A3\u5C01\u4FE1\u7684\u4EBA\uFF1F\u201D\u6797\u6C89\u8B66\u60D5\u5730\u95EE\u9053\u3002

\u9752\u5E74\u5FAE\u7B11\u62AC\u5934\uFF1A\u201C\u6211\u53EB\u821F\u6E21\uFF0C\u8FD9\u91CC\u662F\u6211\u7684\u5C0F\u4E66\u5C40\u3002\u4F60\u770B\u5230\u7684\u90A3\u4E9B\u4FE1\uFF0C\u4E0D\u8FC7\u662F\u6BCF\u4E2A\u5728\u73B0\u5B9E\u4E0E\u68A6\u5883\u4E2D\u6C89\u6CA6\u4E4B\u4EBA\u65E0\u6CD5\u8BC9\u8BF4\u7684\u79C1\u8BED\u3002\u201D`
      },
      {
        id: "n1-c3",
        title: "\u7B2C\u4E09\u7AE0\uFF1A\u5FAE\u5149\u4E0B\u7684\u6551\u8D4E",
        content: `\u7ECF\u8FC7\u957F\u8FBE\u6570\u5468\u7684\u7834\u8BD1\u4E0E\u8C03\u67E5\uFF0C\u6797\u6C89\u7EC8\u4E8E\u660E\u767D\u4E86\u6574\u8D77\u795E\u79D8\u4E8B\u4EF6\u7684\u771F\u76F8\u3002

\u539F\u6765\u5E76\u6CA1\u6709\u4EC0\u4E48\u60CA\u5929\u52A8\u5730\u7684\u9634\u8C0B\uFF0C\u6709\u7684\u53EA\u662F\u4E00\u7FA4\u5728\u57CE\u5E02\u89D2\u843D\u91CC\u9ED8\u9ED8\u575A\u6301\u81EA\u6211\u3001\u4E92\u76F8\u6276\u6301\u7684\u666E\u901A\u4EBA\u3002\u9752\u5E74\u821F\u6E21\u7528\u6587\u5B57\u642D\u5EFA\u8D77\u4E00\u5EA7\u7CBE\u795E\u7684\u907F\u98CE\u6E2F\uFF0C\u8BA9\u90A3\u4E9B\u5728\u751F\u6D3B\u4E2D\u53D7\u521B\u4E0E\u6C89\u6CA6\u7684\u7075\u9B42\u5F97\u4EE5\u5728\u6B64\u5598\u606F\u3002

\u201C\u4EBA\u5FC3\u867D\u7136\u590D\u6742\u5982\u8FF7\u5BAB\uFF0C\u201D\u6797\u6C89\u7AD9\u5728\u4E66\u5C40\u7684\u7A97\u524D\uFF0C\u770B\u7740\u5916\u9762\u9633\u5149\u6D12\u6EE1\u8857\u9053\uFF0C\u201C\u4F46\u53EA\u8981\u6709\u4EBA\u613F\u610F\u503E\u542C\uFF0C\u8FF7\u5BAB\u91CC\u5C31\u4F1A\u4EAE\u8D77\u706F\u706B\u3002\u201D

\u821F\u6E21\u5408\u4E0A\u624B\u4E2D\u7684\u7B14\u8BB0\u672C\uFF0C\u9012\u7ED9\u6797\u6C89\u4E00\u676F\u521A\u51B2\u597D\u7684\u70ED\u8336\uFF1A\u201C\u8FD9\u5C31\u662F\u2018\u4E88\u68A6\u6C89\u6CA6\u2019\u7684\u542B\u4E49\u3002\u4E88\u4EBA\u4EE5\u68A6\uFF0C\u4EA6\u80FD\u6551\u4EBA\u4E8E\u6C89\u6CA6\u3002\u4E0D\u5FC5\u5927\u58F0\u75BE\u547C\uFF0C\u61C2\u5F97\u7684\u4EBA\uFF0C\u81EA\u4F1A\u5728\u6587\u5B57\u91CC\u76F8\u9022\u3002\u201D`
      }
    ]
  },
  {
    id: "novel-2",
    title: "\u5047\u5BD0",
    category: "\u5C0F\u8BF4",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-purple-900 to-slate-900",
    description: "\u5947\u5E7B\u4E0E\u68A6\u5883\u91CD\u53E0\u7684\u6CBB\u6108\u4E4B\u4F5C\u3002\u5F53\u4E24\u4E2A\u539F\u672C\u6BEB\u65E0\u4EA4\u96C6\u7684\u4EBA\uFF0C\u5728\u6DF1\u591C\u7684\u68A6\u5883\u4E2D\u610F\u5916\u91CD\u53E0\u2026\u2026",
    tags: ["\u5947\u5E7B\u68A6\u5883", "\u53CC\u5411\u6CBB\u6108", "\u6D6A\u6F2B\u5947\u9047", "\u4E2D\u7BC7\u5C0F\u8BF4"],
    wordCount: "4.8\u4E07\u5B57",
    likes: 185,
    views: 2450,
    createdAt: "2026-02-14",
    isOriginal: true,
    chapters: [
      {
        id: "n2-c1",
        title: "\u7B2C\u4E00\u7AE0\uFF1A\u91CD\u53E0\u7684\u5B50\u591C",
        content: `\u5348\u591C12\u70B900\u5206\u3002

\u8BB8\u7720\u5173\u6389\u7535\u8111\uFF0C\u7CBE\u75B2\u529B\u5C3D\u5730\u762B\u5012\u5728\u5E8A\u4E0A\u3002\u4F5C\u4E3A\u4E00\u540D\u4E92\u8054\u7F51\u516C\u53F8\u7684\u52A0\u66F4\u7A0B\u5E8F\u5458\uFF0C\u4ED6\u7684\u8111\u6D77\u91CC\u8FD8\u5728\u98DE\u5FEB\u8DD1\u7740\u5404\u79CD\u62A5\u9519\u65E5\u5FD7\u548C\u9700\u6C42\u4EE3\u7801\u3002

\u7136\u800C\uFF0C\u5F53\u4ED6\u5408\u4E0A\u53CC\u773C\u8DCC\u5165\u68A6\u4E61\u7684\u77AC\u95F4\uFF0C\u8033\u8FB9\u5374\u6CA1\u6709\u5F80\u5E38\u7684\u6C89\u5BC2\uFF0C\u800C\u662F\u4F20\u6765\u4E86\u4E00\u9635\u60A0\u626C\u7684\u94A2\u7434\u58F0\u3002

\u4ED6\u7741\u5F00\u773C\uFF0C\u53D1\u73B0\u81EA\u5DF1\u7ADF\u7136\u7AD9\u5728\u4E00\u5EA7\u60AC\u6D6E\u4E8E\u4E91\u7AEF\u4E4B\u4E0A\u7684\u9732\u5929\u56FE\u4E66\u9986\u91CC\u3002\u7E41\u661F\u5982\u7011\u5E03\u822C\u4ECE\u5934\u9876\u6D41\u6DCC\u800C\u4E0B\uFF0C\u811A\u4E0B\u662F\u53D1\u5149\u7684\u6C49\u767D\u7389\u8D70\u5ECA\u3002

\u800C\u5728\u8D70\u5ECA\u5C3D\u5934\u7684\u4E09\u89D2\u94A2\u7434\u524D\uFF0C\u5750\u7740\u4E00\u4F4D\u8EAB\u7A7F\u767D\u88D9\u7684\u5973\u5B69\u3002

\u201C\u4F60\u2026\u2026\u662F\u8C01\uFF1F\u4E3A\u4EC0\u4E48\u4F1A\u5728\u6211\u7684\u68A6\u91CC\uFF1F\u201D\u8BB8\u7720\u9519\u6115\u5730\u95EE\u3002

\u5973\u5B69\u505C\u4E0B\u624B\u6307\uFF0C\u60CA\u8BB6\u5730\u8F6C\u8FC7\u8EAB\uFF1A\u201C\u8FD9\u662F\u6211\u7684\u68A6\u554A\uFF01\u4F60\u53C8\u662F\u4ECE\u54EA\u5192\u51FA\u6765\u7684\uFF1F\u201D`
      },
      {
        id: "n2-c2",
        title: "\u7B2C\u4E8C\u7AE0\uFF1A\u68A6\u5883\u4EA4\u6613\u6240",
        content: `\u63A5\u4E0B\u6765\u7684\u4E00\u6574\u5468\uFF0C\u6BCF\u5F53\u5B50\u591C\u949F\u58F0\u6572\u54CD\uFF0C\u8BB8\u7720\u90FD\u4F1A\u51C6\u65F6\u51FA\u73B0\u5728\u8FD9\u4E2A\u68A6\u5883\u7A7A\u95F4\u3002

\u4ED6\u4EEC\u53D1\u73B0\uFF0C\u4E24\u4EBA\u7684\u610F\u8BC6\u4F3C\u4E4E\u56E0\u4E3A\u67D0\u79CD\u7F55\u89C1\u7684\u5730\u78C1\u98CE\u66B4\u548C\u8111\u7535\u6CE2\u5171\u632F\uFF0C\u88AB\u6B7B\u6B7B\u7CFB\u5728\u4E86\u4E00\u8D77\u3002\u5728\u8FD9\u4E2A\u5171\u540C\u7684\u68A6\u5883\u91CC\uFF0C\u4ED6\u4EEC\u53EF\u4EE5\u968F\u5FC3\u6240\u6B32\u5730\u5EFA\u9020\u57CE\u5821\u3001\u6F2B\u6B65\u6D77\u5E95\u68EE\u6797\uFF0C\u6216\u8005\u53EA\u662F\u5E76\u80A9\u5750\u5728\u661F\u7A7A\u4E0B\u804A\u5929\u3002

\u5973\u5B69\u53EB\u9646\u661F\u665A\uFF0C\u662F\u4E00\u540D\u5E38\u5E74\u5F85\u5728\u533B\u9662\u91CC\u7684\u63D2\u753B\u5E08\u3002

\u201C\u73B0\u5B9E\u91CC\u6211\u54EA\u513F\u4E5F\u53BB\u4E0D\u4E86\uFF0C\u201D\u9646\u661F\u665A\u6307\u7740\u68A6\u91CC\u7FF1\u7FD4\u7684\u91D1\u5149\u5DE8\u9CB8\u7B11\u9053\uFF0C\u201C\u4F46\u5728\u68A6\u91CC\uFF0C\u4F60\u5E26\u6211\u770B\u904D\u4E86\u6574\u4E2A\u4E16\u754C\u3002\u201D

\u8BB8\u7720\u770B\u7740\u5973\u5B69\u773C\u91CC\u7684\u5149\u8292\uFF0C\u5FFD\u7136\u89C9\u5F97\u6BCF\u5929\u7E41\u91CD\u7684\u52A0\u73ED\u4F3C\u4E4E\u4E5F\u4E0D\u518D\u90A3\u4E48\u96BE\u71AC\u4E86\u3002`
      },
      {
        id: "n2-c3",
        title: "\u7B2C\u4E09\u7AE0\uFF1A\u6795\u8FB9\u7684\u98CE\u58F0",
        content: `\u68A6\u5883\u91CD\u53E0\u7684\u7B2C30\u5929\uFF0C\u5730\u78C1\u98CE\u66B4\u9010\u6E10\u5E73\u606F\uFF0C\u79D1\u5B66\u5BB6\u9884\u6D4B\u68A6\u5883\u5171\u632F\u5373\u5C06\u7ED3\u675F\u3002

\u201C\u6211\u4EEC\u8FD8\u80FD\u5728\u73B0\u5B9E\u91CC\u76F8\u89C1\u5417\uFF1F\u201D\u8BB8\u7720\u5728\u79BB\u522B\u7684\u68A6\u5883\u96EA\u539F\u4E0A\u63E1\u7D27\u4E86\u9646\u661F\u665A\u7684\u624B\u3002

\u9646\u661F\u665A\u5FAE\u7B11\u7740\u9012\u7ED9\u4ED6\u4E00\u5F20\u68A6\u91CC\u753B\u7684\u63D2\u56FE\uFF0C\u4E0A\u9762\u8D6B\u7136\u5199\u7740\u73B0\u5B9E\u4E2D\u5979\u6240\u5728\u7684\u533B\u9662\u4E0E\u75C5\u623F\u53F7\uFF1A\u201C\u5982\u679C\u4F60\u80FD\u5728\u73B0\u5B9E\u91CC\u627E\u5230\u6211\uFF0C\u8BB0\u5F97\u5E26\u4E00\u675F\u521A\u5F00\u7684\u767D\u8272\u5C0F\u82CD\u5170\u3002\u201D

\u6B21\u65E5\u6E05\u6668\uFF0C\u8BB8\u7720\u98DE\u5954\u5728\u6668\u5149\u71B9\u5FAE\u7684\u8857\u9053\u4E0A\uFF0C\u6000\u91CC\u7D27\u7D27\u62B1\u7740\u7528\u725B\u76AE\u7EB8\u5305\u597D\u7684\u82B1\u675F\u3002\u5F53\u4ED6\u63A8\u5F00\u90A3\u6247\u719F\u6089\u7684\u75C5\u623F\u95E8\u65F6\uFF0C\u7A97\u8FB9\u7684\u5973\u5B69\u8F6C\u8FC7\u5934\uFF0C\u9732\u51FA\u4E86\u4E0E\u68A6\u4E2D\u4E00\u6A21\u4E00\u6837\u7684\u7B11\u5BB9\u3002`
      }
    ]
  },
  {
    id: "novel-3",
    title: "\u7F18\u7EED\u6D41\u5E74",
    category: "\u5C0F\u8BF4",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-amber-800 to-orange-950",
    description: "\u8DE8\u8D8A\u591A\u5E74\u7684\u6DF1\u60C5\u6E29\u60C5\u957F\u7BC7\u3002\u5C81\u6708\u867D\u901D\uFF0C\u65E7\u65E5\u76F8\u5B88\u7684\u7F81\u7ECA\u5728\u65F6\u5149\u6CB3\u6D41\u91CC\u6C38\u4E0D\u6CEF\u706D\u3002",
    tags: ["\u6E29\u60C5\u6000\u65E7", "\u9752\u6625\u7F81\u7ECA", "\u6DF1\u60C5\u957F\u7BC7", "\u70DF\u706B\u4EBA\u95F4"],
    wordCount: "8.2\u4E07\u5B57",
    likes: 310,
    views: 4100,
    createdAt: "2025-11-08",
    isOriginal: true,
    chapters: [
      {
        id: "n3-c1",
        title: "\u7B2C\u4E00\u7AE0\uFF1A\u65E7\u4E66\u7B7E\u91CC\u7684\u5E74\u534E",
        content: `\u642C\u5BB6\u6574\u7406\u65E7\u7269\u65F6\uFF0C\u6C5F\u5BFB\u5728\u4E00\u672C\u5C18\u5C01\u7684\u300A\u5510\u8BD7\u4E09\u767E\u9996\u300B\u91CC\uFF0C\u610F\u5916\u6389\u843D\u51FA\u4E00\u679A\u5DF2\u7ECF\u6CDB\u9EC4\u7684\u538B\u82B1\u4E66\u7B7E\u3002

\u4E66\u7B7E\u4E0A\u7528\u6E05\u79C0\u7684\u5B57\u4F53\u5199\u7740\u4E00\u884C\u5B57\uFF1A\u201C\u65F6\u5149\u4F1A\u8D70\u8FDC\uFF0C\u4F46\u613F\u7F18\u5206\u672A\u7EDD\u3002\u201D

\u90A3\u662F\u5341\u4E94\u5E74\u524D\uFF0C\u4F4F\u5728\u8001\u8857\u9694\u58C1\u7684\u5973\u5B69\u6797\u6D45\u9001\u7ED9\u4ED6\u7684\u6BD5\u4E1A\u793C\u7269\u3002

\u6C5F\u5BFB\u629A\u6478\u7740\u90A3\u5E72\u67AF\u7684\u94F6\u674F\u53F6\u6807\u672C\uFF0C\u601D\u7EEA\u77AC\u95F4\u62C9\u56DE\u5230\u4E86\u90A3\u4E2A\u76DB\u590F\u3002\u68A7\u6850\u6811\u4E0A\u7684\u8749\u9E23\u58F0\u58F0\u58F0\u4F5C\u54CD\uFF0C\u51B0\u9547\u6C7D\u6C34\u74F6\u5192\u7740\u6C14\u6CE1\uFF0C\u8FD8\u6709\u4E24\u4E2A\u5C11\u5E74\u8E72\u5728\u5F04\u5802\u53E3\u8BA8\u8BBA\u672A\u6765\u7684\u6D69\u701A\u661F\u7A7A\u3002`
      },
      {
        id: "n3-c2",
        title: "\u7B2C\u4E8C\u7AE0\uFF1A\u5DF7\u53E3\u7684\u8001\u94F6\u674F",
        content: `\u6C5F\u5BFB\u4E58\u9AD8\u94C1\u56DE\u5230\u4E86\u9614\u522B\u591A\u5E74\u7684\u6545\u4E61\u5C0F\u9547\u3002

\u8001\u8857\u5DF2\u7ECF\u88AB\u6539\u9020\u6210\u4E86\u5145\u6EE1\u6587\u827A\u6C14\u606F\u7684\u8857\u533A\uFF0C\u552F\u6709\u5DF7\u53E3\u90A3\u68F5\u6709\u7740\u4E09\u767E\u5E74\u5386\u53F2\u7684\u8001\u94F6\u674F\u6811\u4F9D\u7136\u679D\u7E41\u53F6\u8302\u3002

\u79CB\u98CE\u5439\u8FC7\uFF0C\u6EE1\u6811\u91D1\u9EC4\u7684\u94F6\u674F\u53F6\u50CF\u98DE\u821E\u7684\u8774\u8776\u822C\u98D8\u843D\u3002

\u6C5F\u5BFB\u7AD9\u5728\u6811\u4E0B\u4EF0\u671B\uFF0C\u7A81\u7136\u542C\u89C1\u8EAB\u540E\u4F20\u6765\u4E00\u9053\u6709\u4E9B\u72B9\u8C6B\u7684\u58F0\u97F3\uFF1A

\u201C\u6C5F\u5BFB\u2026\u2026\u662F\u4F60\u5417\uFF1F\u201D

\u4ED6\u8F6C\u8FC7\u8EAB\uFF0C\u53EA\u89C1\u4E00\u4F4D\u8EAB\u7A7F\u7C73\u8272\u98CE\u8863\u7684\u5973\u5B50\u6B63\u6367\u7740\u76F8\u673A\u7AD9\u5728\u4E0D\u8FDC\u5904\uFF0C\u773C\u7736\u6CDB\u7EA2\uFF0C\u5634\u89D2\u5374\u5E26\u7740\u6E29\u6696\u7684\u5FAE\u7B11\u3002`
      },
      {
        id: "n3-c3",
        title: "\u7B2C\u4E09\u7AE0\uFF1A\u518D\u9022\u5FAE\u96E8\u65F6",
        content: `\u5FAE\u96E8\u6253\u6E7F\u4E86\u957F\u5ECA\u7684\u77F3\u677F\u8DEF\u3002

\u4E24\u4EBA\u5750\u5728\u8001\u8857\u8336\u9986\u7684\u6A90\u4E0B\uFF0C\u6CE1\u4E86\u4E00\u58F6\u70ED\u817E\u817E\u7684\u83CA\u82B1\u8336\u3002

\u8BB2\u8FF0\u7740\u5404\u81EA\u79BB\u522B\u8FD9\u4E9B\u5E74\u7684\u9645\u9047\uFF0C\u6709\u6B22\u7B11\uFF0C\u6709\u6CEA\u6C34\uFF0C\u4E5F\u6709\u72EC\u81EA\u5728\u5F02\u4E61\u6253\u62FC\u7684\u8F9B\u9178\u3002

\u201C\u539F\u4EE5\u4E3A\u65F6\u5149\u65E9\u628A\u6211\u4EEC\u51B2\u6563\u5230\u4E86\u5929\u6DAF\u6D77\u89D2\uFF0C\u201D\u6797\u6D45\u8F7B\u629A\u8336\u676F\uFF0C\u201C\u6CA1\u60F3\u9053\u7ED5\u4E86\u4E00\u5927\u5708\uFF0C\u5927\u5BB6\u53C8\u56DE\u5230\u4E86\u8FD9\u91CC\u3002\u201D

\u6C5F\u5BFB\u4ECE\u53E3\u888B\u91CC\u638F\u51FA\u90A3\u679A\u4FDD\u5B58\u5B8C\u597D\u7684\u94F6\u674F\u4E66\u7B7E\uFF0C\u8F7B\u8F7B\u653E\u5728\u684C\u4E0A\uFF1A\u201C\u56E0\u4E3A\u6709\u4E9B\u4EBA\uFF0C\u6709\u4E9B\u7F18\u5206\uFF0C\u4E00\u8F88\u5B50\u90FD\u4E0D\u4F1A\u771F\u6B63\u7EDD\u65AD\u3002\u201D`
      }
    ]
  },
  {
    id: "novel-4",
    title: "\u4E00\u4E2A\u5C0F\u6BB5\u5B50",
    category: "\u5C0F\u8BF4",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-rose-800 to-amber-900",
    description: "\u8F7B\u677E\u641E\u7B11\u3001\u793E\u755C\u65E5\u5E38\u3001\u8111\u6D1E\u5927\u5F00\u4E0E\u6CBB\u6108\u7CFB\u77ED\u7BC7\u6545\u4E8B\u5408\u96C6\uFF0C\u9002\u5408\u8336\u4F59\u996D\u540E\u8F7B\u677E\u9605\u8BFB\u3002",
    tags: ["\u8F7B\u677E\u641E\u7B11", "\u793E\u755C\u65E5\u5E38", "\u6CBB\u6108\u8111\u6D1E", "\u77ED\u7BC7\u5408\u96C6"],
    wordCount: "1.5\u4E07\u5B57",
    likes: 420,
    views: 5600,
    createdAt: "2026-05-01",
    isOriginal: true,
    chapters: [
      {
        id: "n4-c1",
        title: "\u6BB5\u5B50\u4E00\uFF1A\u793E\u755C\u7684\u5468\u4E00\u89C9\u9192",
        content: `\u5468\u4E00\u65E9\u66687:00\uFF0C\u95F9\u949F\u51C6\u65F6\u54CD\u8D77\u3002

\u4F5C\u4E3A\u6253\u5DE5\u4EBA\u7684\u6211\uFF0C\u719F\u7EC3\u5730\u6267\u884C\u4E86\u4EE5\u4E0B\u6807\u51C6\u52A8\u4F5C\uFF1A
1. \u7741\u773C\uFF0C\u5BF9\u7740\u5929\u82B1\u677F\u53F9\u6C14\u4E09\u79D2\u3002
2. \u6478\u5230\u624B\u673A\uFF0C\u5173\u6389\u95F9\u949F\uFF0C\u6253\u5F00\u4F59\u989D\u67E5\u770B\uFF0C\u77AC\u95F4\u83B7\u5F97\u7EE7\u7EED\u4E0A\u73ED\u7684\u52A8\u529B\u3002
3. \u5FC3\u7406\u5EFA\u8BBE\uFF1A\u201C\u4ECA\u5929\u6211\u662F\u53BB\u62EF\u6551\u4E16\u754C\u7684\uFF0C\u987A\u4FBF\u62FF\u4E2A\u5168\u52E4\u5956\u3002\u201D

\u8D70\u5230\u5730\u94C1\u7AD9\uFF0C\u524D\u9762\u4E00\u4F4D\u5144\u5F1F\u5305\u4E0A\u6302\u7740\u4E2A\u724C\u5B50\uFF1A\u201C\u53EA\u8981\u6211\u4E0D\u5C34\u5C2C\uFF0CPPT\u5C31\u96BE\u5012\u4E0D\u4E86\u6211\u3002\u201D
\u90A3\u4E00\u523B\uFF0C\u6211\u611F\u89C9\u627E\u5230\u4E86\u7EC4\u7EC7\uFF01`
      },
      {
        id: "n4-c2",
        title: "\u6BB5\u5B50\u4E8C\uFF1A\u6211\u5BB6\u732B\u4E3B\u5B50\u4F1A\u5199\u4EE3\u7801",
        content: `\u4ECA\u5929\u5728\u5BB6\u91CC\u52A0\u73ED\u5199BUG\uFF0C\u53BB\u6D17\u624B\u95F4\u63A5\u4E86\u4E2A\u7535\u8BDD\u3002

\u56DE\u6765\u4E00\u770B\uFF0C\u6211\u5BB6\u6A58\u732B\u201C\u8089\u4E38\u201D\u6B63\u5A01\u98CE\u51DB\u51DB\u5730\u8E29\u5728\u952E\u76D8\u4E0A\uFF0C\u5C4F\u5E55\u7EC8\u7AEF\u91CC\u5C45\u7136\u8DD1\u51FA\u4E86\u4E00\u4E32\u795E\u79D8\u6307\u4EE4\uFF1A
git commit -m "meow meow meow"

\u6700\u795E\u5947\u7684\u662F\uFF0C\u5C45\u7136\u81EA\u52A8 pass \u4E86\u5355\u6D4B\uFF01
\u6211\u9677\u5165\u4E86\u6DF1\u6DF1\u7684\u81EA\u6211\u6000\u7591\uFF1A\u96BE\u9053\u6211\u7684\u4EE3\u7801\u6C34\u5E73\uFF0C\u5DF2\u7ECF\u88AB\u4E00\u53EA\u732B\u8D85\u8D8A\u4E86\u5417\uFF1F\uFF01`
      },
      {
        id: "n4-c3",
        title: "\u6BB5\u5B50\u4E09\uFF1A\u5173\u4E8E\u6478\u9C7C\u7684\u6700\u9AD8\u5883\u754C",
        content: `\u540C\u4E8B\u5C0F\u738B\u5411\u6211\u4F20\u6388\u6478\u9C7C\u79D8\u7C4D\uFF1A
\u201C\u7B2C\u4E00\uFF0C\u7535\u8111\u5C4F\u5E55\u8981\u6C38\u8FDC\u4FDD\u7559\u4E00\u4E2A\u5BC6\u5BC6\u9EBB\u9EBB\u7684Excel\u8868\u683C\uFF1B
\u7B2C\u4E8C\uFF0C\u624B\u91CC\u4E00\u5B9A\u8981\u62FF\u4E00\u628A\u5C3A\u5B50\u548C\u4E00\u652F\u7B14\uFF0C\u7709\u5934\u6DF1\u9501\uFF1B
\u7B2C\u4E09\uFF0C\u522B\u4EBA\u95EE\u4F60\u5728\u5E72\u561B\uFF0C\u4F60\u8981\u957F\u53F9\u4E00\u58F0\uFF1A\u2018\u8FD9\u4E2A\u6570\u636E\u6A21\u578B\u600E\u4E48\u5BF9\u4E0D\u4E0A\u5462\u2026\u2026\u2019
\u4FDD\u8BC1\u9886\u5BFC\u8DEF\u8FC7\u90FD\u4F1A\u62CD\u62CD\u4F60\u7684\u80A9\u8180\uFF1A\u2018\u5C0F\u738B\uFF0C\u6CE8\u610F\u4F11\u606F\uFF0C\u522B\u592A\u62FC\u4E86\uFF01\u2019\u201D

\u6211\u5927\u53D7\u9707\u64BC\uFF0C\u9ED8\u9ED8\u638F\u51FA\u5C0F\u672C\u672C\u8BB0\u4E86\u4E0B\u6765\u3002`
      }
    ]
  }
];
var INITIAL_REVIEWS = [
  {
    id: "rev-1",
    bookId: "novel-1",
    bookTitle: "\u4E88\u68A6\u6C89\u6CA6",
    userName: "\u4E66\u8352\u6551\u661F\u5C0F\u660E",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    content: "\u300A\u4E88\u68A6\u6C89\u6CA6\u300B\u771F\u7684\u592A\u89E6\u52A8\u4EBA\u4E86\uFF01\u821F\u6E21\u8001\u5E08\u5BF9\u6587\u5B57\u7684\u628A\u63A7\u529B\u975E\u5E38\u5F3A\uFF0C\u5728\u9ED1\u591C\u4E0E\u9ECE\u660E\u4EA4\u754C\u5904\u7684\u6551\u8D4E\u611F\u5199\u5F97\u975E\u5E38\u7EC6\u817B\uFF0C\u671F\u5F85\u540E\u7EED\u66F4\u65B0\uFF01",
    createdAt: "2026-07-28 14:30",
    likes: 42,
    replies: [
      {
        id: "rep-1",
        userName: "\u821F\u6E21\u661F\u6E2F",
        content: "\u611F\u8C22\u652F\u6301\uFF01\u4E00\u5B9A\u7EE7\u7EED\u52A0\u6CB9\uFF0C\u4E0D\u8F9C\u8D1F\u5927\u5BB6\u7684\u671F\u5F85\uFF01",
        createdAt: "2026-07-28 16:10"
      }
    ]
  },
  {
    id: "rev-2",
    bookId: "poetry-1",
    bookTitle: "\u8BD7\u753B\u4EBA\u95F4",
    userName: "\u6E05\u98CE\u660E\u6708",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    content: "\u610F\u5883\u6781\u4E3A\u60A0\u8FDC\uFF0C\u5C24\u5176\u662F\u201C\u758F\u5F71\u6A2A\u659C\u6C34\u6E05\u6D45\u201D\u90A3\u4E00\u9996\uFF0C\u8BFB\u6765\u5507\u9F7F\u7559\u9999\uFF0C\u5F88\u6709\u8001\u8BD7\u4EBA\u7684\u610F\u8574\u3002",
    createdAt: "2026-07-30 09:15",
    likes: 29
  },
  {
    id: "rev-3",
    bookId: "novel-4",
    bookTitle: "\u4E00\u4E2A\u5C0F\u6BB5\u5B50",
    userName: "\u6478\u9C7C\u4E13\u4E1A\u6237",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    content: "\u54C8\u54C8\u54C8\u54C8\u300A\u793E\u755C\u7684\u5468\u4E00\u89C9\u9192\u300B\u7B80\u76F4\u662F\u5728\u6211\u623F\u95F4\u88C5\u4E86\u76D1\u63A7\uFF01\u7B11\u6B7B\u6211\u4E86\uFF0C\u5468\u4E00\u4E0A\u73ED\u5FC5\u5907\u89E3\u538B\u795E\u5668\uFF01",
    createdAt: "2026-08-02 20:45",
    likes: 56
  },
  {
    id: "rev-4",
    userName: "\u58A8\u9999\u5BA2",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    content: "\u5728\u5982\u4ECA\u6EE1\u662F\u5546\u4E1A\u5316\u5FEB\u9910\u6587\u7684\u65F6\u4EE3\uFF0C\u80FD\u770B\u5230\u8FD9\u6837\u4E00\u4E2A\u7EAF\u7CB9\u3001\u5E72\u51C0\u7684\u516C\u76CA\u5199\u624B\u5C0F\u4E66\u5C4B\uFF0C\u771F\u7684\u50CF\u662F\u4E00\u7247\u4E16\u5916\u6843\u6E90\u3002\u652F\u6301\u821F\u6E21\u661F\u6E2F\u8001\u5E08\uFF01",
    createdAt: "2026-08-04 11:20",
    likes: 68
  }
];
var INITIAL_GUESTBOOK = [
  {
    id: "g-1",
    userName: "\u98CE\u8FC7\u7684\u590F\u5929",
    content: "\u4F5C\u8005\u5927\u5927\uFF0C\u4F60\u5E73\u5E38\u5199\u6B4C\u5531\u6B4C\u662F\u5728\u54EA\u91CC\u53D1\u5E03\u7684\u5440\uFF1F\u597D\u60F3\u542C\u4F60\u5F39\u5531\uFF01",
    createdAt: "2026-07-20 18:22",
    authorReply: "\u54C8\u54C8\u4E1A\u4F59\u5174\u8DA3\u800C\u5DF2\uFF01\u6709\u65F6\u4F1A\u5728\u793E\u7FA4\u6216\u8005\u4E2A\u4EBA\u4E3B\u9875\u5206\u4EAB\u968F\u624B\u5F55\u7684\u97F3\u8F68\uFF0C\u8C22\u8C22\u5173\u5FC3\uFF5E",
    likes: 18
  },
  {
    id: "g-2",
    userName: "\u665A\u5B89\u6708\u4EAE",
    content: "\u975E\u5E38\u559C\u6B22\u300A\u5047\u5BD0\u300B\u7684\u8BBE\u5B9A\uFF0C\u8BF7\u95EE\u7B2C\u4E8C\u90E8\u4EC0\u4E48\u65F6\u5019\u80FD\u5B89\u6392\u4E0A\uFF1F",
    createdAt: "2026-07-25 22:40",
    authorReply: "\u793E\u755C\u6700\u8FD1\u52A0\u73ED\u7565\u591A\uFF0C\u6B63\u5728\u6784\u601D\u4E2D\uFF01\u5927\u7EB2\u5199\u5B8C\u5C31\u4F1A\u66F4\u65B0\u7684\uFF5E",
    likes: 24
  }
];
var INITIAL_COMMENTS = [
  {
    id: "c-101",
    bookId: "novel-1",
    userName: "\u4E91\u6E38\u8BD7\u4EBA",
    content: "\u7B2C\u4E00\u7AE0\u7684\u96E8\u591C\u6C14\u6C1B\u6E32\u67D3\u592A\u5230\u4F4D\u4E86\uFF0C\u8BFB\u8D77\u6765\u975E\u5E38\u6709\u4EE3\u5165\u611F\uFF01",
    createdAt: "2026-08-01 14:20",
    likes: 12
  },
  {
    id: "c-102",
    bookId: "poetry-1",
    userName: "\u7AF9\u6797\u6E05\u98CE",
    content: "\u201C\u758F\u5F71\u6A2A\u659C\u6C34\u6E05\u6D45\u201D\u5199\u5F97\u5F88\u7075\u52A8\uFF0C\u6709\u53E4\u98CE\u96C5\u97F5\u3002",
    createdAt: "2026-08-03 10:15",
    likes: 8
  }
];

// server/db.ts
var DEFAULT_MUSIC_TRACKS = [
  {
    id: "default_1",
    title: "\u300A\u5FAE\u5149\u300B\u2014\u2014 \u5C0F\u8BF4\u300A\u4E88\u68A6\u6C89\u6CA6\u300B\u884D\u751F\u5409\u4ED6\u5F39\u5531 Demo",
    duration: "03:45",
    durationSec: 225,
    mood: "\u6E29\u6696\u6C89\u9759"
  },
  {
    id: "default_2",
    title: "\u300A\u6708\u4E0B\u758F\u5F71\u300B\u2014\u2014 \u8BD7\u6B4C\u6717\u8BF5\u4E0E\u53E4\u98CE\u8F7B\u97F3\u4E50",
    duration: "02:30",
    durationSec: 150,
    mood: "\u53E4\u5178\u610F\u5883"
  },
  {
    id: "default_3",
    title: "\u300A\u793E\u755C\u7684\u5468\u672B\u6E05\u6668\u300B\u2014\u2014 \u968F\u6027\u5F39\u5531\u788E\u788E\u5FF5",
    duration: "04:12",
    durationSec: 252,
    mood: "\u8F7B\u677E\u6CBB\u6108"
  }
];
var DEFAULT_STATUS_LOGS = [
  {
    id: "log-1",
    tag: "\u{1F4D6} \u8FD1\u671F\u66F4\u65B0\u52A8\u6001",
    tagColor: "amber",
    date: "2026-08-05",
    content: "\u300A\u4E88\u68A6\u6C89\u6CA6\u300B\u540E\u7EED\u5927\u7EB2\u5DF2\u5B8C\u6210\u590D\u5BA1\uFF0C\u5468\u672B\u6253\u7B97\u62BD\u7A7A\u6574\u7406\u300A\u8BD7\u753B\u4EBA\u95F4\u300B\u65B0\u589E\u7684\u51E0\u9996\u590F\u672B\u6292\u60C5\u8BD7\u3002"
  },
  {
    id: "log-2",
    tag: "\u2615 \u6253\u5DE5\u4EBA\u65E5\u5E38",
    tagColor: "emerald",
    date: "2026-08-01",
    content: "\u4ECA\u5929\u4E0B\u73ED\u540E\u559D\u5230\u4E86\u6781\u4E3A\u6E05\u751C\u7684\u51BB\u9876\u4E4C\u9F99\uFF0C\u7075\u611F\u7206\u53D1\u5199\u4E0B\u4E86\u300A\u4E00\u4E2A\u5C0F\u6BB5\u5B50\u300B\u91CC\u7684\u6478\u9C7C\u5FC3\u5F97\uFF01"
  },
  {
    id: "log-3",
    tag: "\u{1F48C} \u521B\u4F5C\u5BC4\u8BED",
    tagColor: "rose",
    date: "\u81F4\u6240\u6709\u8BFB\u8005",
    content: "\u6587\u5B57\u662F\u7A7F\u900F\u51B7\u6F20\u90FD\u5E02\u7684\u5FAE\u5149\u3002\u65E0\u8BBA\u751F\u6D3B\u591A\u5FD9\u788C\uFF0C\u5E0C\u671B\u758F\u5F71\u4E66\u5C4B\u80FD\u4E3A\u60A8\u5E26\u6765\u4E00\u4E1D\u6170\u85C9\u3002"
  }
];
var DEFAULT_STATUS_QUOTE = "\u201C\u751F\u6D3B\u4E07\u822C\u7686\u82E6\uFF0C\u552F\u6709\u6587\u5B57\u4E0E\u7231\u6C38\u6052\u3002\u201D";
var currentStore = null;
function initStore() {
  if (currentStore) {
    return currentStore;
  }
  currentStore = {
    books: INITIAL_BOOKS,
    comments: INITIAL_COMMENTS,
    reviews: INITIAL_REVIEWS,
    guestbook: INITIAL_GUESTBOOK,
    musicTracks: DEFAULT_MUSIC_TRACKS,
    statusLogs: DEFAULT_STATUS_LOGS,
    statusQuote: DEFAULT_STATUS_QUOTE,
    totalViews: 2e3,
    uploadedFiles: []
    // 新增：初始化上传文件数组
  };
  console.log("\u{1F7E2} \u6570\u636E\u5E93\u5DF2\u521D\u59CB\u5316 (\u5185\u5B58\u6A21\u5F0F)");
  return currentStore;
}
if (!currentStore) {
  initStore();
}
var db = currentStore;

// server/routes/books.ts
var app = new Hono2();
app.get("/", (c) => {
  return c.json({
    success: true,
    data: db.books,
    total: db.books.length
  });
});
app.get("/:id", (c) => {
  const id = c.req.param("id");
  const book = db.books.find((b) => b.id === id);
  if (!book) {
    return c.json({ success: false, message: "\u4E66\u7C4D\u672A\u627E\u5230" }, 404);
  }
  return c.json({
    success: true,
    data: book
  });
});
app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.title || !body.author) {
      return c.json({ success: false, message: "\u6807\u9898\u548C\u4F5C\u8005\u4E0D\u80FD\u4E3A\u7A7A" }, 400);
    }
    const newId = Date.now().toString();
    const newBook = {
      ...body,
      id: newId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
      // 添加创建时间
    };
    db.books.unshift(newBook);
    return c.json({
      success: true,
      message: "\u6DFB\u52A0\u6210\u529F",
      data: newBook
    }, 201);
  } catch (error) {
    console.error("\u6DFB\u52A0\u4E66\u7C4D\u5931\u8D25:", error);
    return c.json({ success: false, message: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF" }, 500);
  }
});
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const index = db.books.findIndex((b) => b.id === id);
  if (index === -1) {
    return c.json({ success: false, message: "\u4E66\u7C4D\u672A\u627E\u5230" }, 404);
  }
  try {
    const body = await c.req.json();
    db.books[index] = { ...db.books[index], ...body };
    return c.json({
      success: true,
      message: "\u66F4\u65B0\u6210\u529F",
      data: db.books[index]
    });
  } catch (error) {
    return c.json({ success: false, message: "\u66F4\u65B0\u5931\u8D25" }, 500);
  }
});
app.delete("/:id", (c) => {
  const id = c.req.param("id");
  const index = db.books.findIndex((b) => b.id === id);
  if (index === -1) {
    return c.json({ success: false, message: "\u4E66\u7C4D\u672A\u627E\u5230" }, 404);
  }
  db.books.splice(index, 1);
  return c.json({
    success: true,
    message: "\u5220\u9664\u6210\u529F"
  });
});
var books_default = app;

// server/routes/comments.ts
var app2 = new Hono2();
app2.get("/", (c) => {
  return c.json(db.comments);
});
app2.post("/", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.content || !body.bookId) {
      return c.json({ error: "BookId and content are required" }, 400);
    }
    const newComment = {
      ...body,
      id: body.id || "comment-" + Date.now(),
      createdAt: body.createdAt || (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
      likes: body.likes || 0
    };
    db.comments.unshift(newComment);
    return c.json({
      success: true,
      comment: newComment
    }, 201);
  } catch (error) {
    console.error("\u6DFB\u52A0\u8BC4\u8BBA\u5931\u8D25:", error);
    return c.json({ error: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF" }, 500);
  }
});
app2.delete("/:id", (c) => {
  const id = c.req.param("id");
  db.comments = db.comments.filter((comment) => comment.id !== id);
  return c.json({
    success: true
  });
});
app2.post("/:id/like", (c) => {
  const id = c.req.param("id");
  const commentIndex = db.comments.findIndex((comment) => comment.id === id);
  if (commentIndex !== -1) {
    db.comments[commentIndex] = {
      ...db.comments[commentIndex],
      likes: (db.comments[commentIndex].likes || 0) + 1
    };
  }
  return c.json({
    success: true
  });
});
var comments_default = app2;

// server/routes/reviews.ts
var app3 = new Hono2();
app3.get("/", (c) => {
  return c.json(db.reviews);
});
app3.post("/", async (c) => {
  try {
    const review = await c.req.json();
    if (!review || !review.content) {
      return c.json({ error: "Review content is required" }, 400);
    }
    const newReview = {
      ...review,
      id: review.id || "rev-" + Date.now(),
      createdAt: review.createdAt || (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
      likes: review.likes || 0,
      replies: review.replies || []
    };
    db.reviews.unshift(newReview);
    return c.json({
      success: true,
      review: newReview
    }, 201);
  } catch (error) {
    console.error("\u6DFB\u52A0\u8BC4\u8BBA\u5931\u8D25:", error);
    return c.json({ error: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF" }, 500);
  }
});
app3.delete("/:id", (c) => {
  const id = c.req.param("id");
  db.reviews = db.reviews.filter((r) => r.id !== id);
  return c.json({
    success: true
  });
});
app3.post("/:id/reply", async (c) => {
  const id = c.req.param("id");
  const { userName, content } = await c.req.json();
  if (!content) {
    return c.json({ error: "Reply content is required" }, 400);
  }
  const reply = {
    id: "rep-" + Date.now(),
    userName: userName || "\u70ED\u5FC3\u8BFB\u8005",
    content,
    createdAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16)
  };
  const reviewIndex = db.reviews.findIndex((r) => r.id === id);
  if (reviewIndex !== -1) {
    db.reviews[reviewIndex] = {
      ...db.reviews[reviewIndex],
      replies: [...db.reviews[reviewIndex].replies || [], reply]
    };
  }
  return c.json({
    success: true,
    reply
  });
});
app3.post("/:id/like", (c) => {
  const id = c.req.param("id");
  const reviewIndex = db.reviews.findIndex((r) => r.id === id);
  if (reviewIndex !== -1) {
    db.reviews[reviewIndex] = {
      ...db.reviews[reviewIndex],
      likes: (db.reviews[reviewIndex].likes || 0) + 1
    };
  }
  return c.json({
    success: true
  });
});
var reviews_default = app3;

// server/routes/guestbook.ts
var app4 = new Hono2();
app4.get("/", (c) => {
  return c.json(db.guestbook);
});
app4.post("/", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.content) {
      return c.json({ error: "Message content is required" }, 400);
    }
    const newMsg = {
      ...body,
      id: body.id || "gb-" + Date.now(),
      createdAt: body.createdAt || (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
      likes: body.likes || 0
    };
    db.guestbook.unshift(newMsg);
    return c.json({
      success: true,
      message: newMsg
    }, 201);
  } catch (error) {
    console.error("\u6DFB\u52A0\u7559\u8A00\u5931\u8D25:", error);
    return c.json({ error: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF" }, 500);
  }
});
app4.delete("/:id", (c) => {
  const id = c.req.param("id");
  db.guestbook = db.guestbook.filter((m) => m.id !== id);
  return c.json({
    success: true
  });
});
app4.post("/:id/reply", async (c) => {
  const id = c.req.param("id");
  const { authorReply } = await c.req.json();
  const msgIndex = db.guestbook.findIndex((m) => m.id === id);
  if (msgIndex !== -1) {
    db.guestbook[msgIndex] = {
      ...db.guestbook[msgIndex],
      authorReply
    };
  }
  return c.json({
    success: true
  });
});
app4.post("/:id/like", (c) => {
  const id = c.req.param("id");
  const msgIndex = db.guestbook.findIndex((m) => m.id === id);
  if (msgIndex !== -1) {
    db.guestbook[msgIndex] = {
      ...db.guestbook[msgIndex],
      likes: (db.guestbook[msgIndex].likes || 0) + 1
    };
  }
  return c.json({
    success: true
  });
});
var guestbook_default = app4;

// server/routes/logs.ts
var app5 = new Hono2();
app5.get("/", (c) => {
  return c.json({
    logs: db.statusLogs,
    quote: db.statusQuote
  });
});
app5.post("/", async (c) => {
  try {
    const log = await c.req.json();
    if (!log || !log.content) {
      return c.json({ error: "Log content is required" }, 400);
    }
    const newLog = {
      ...log,
      id: log.id || "log-" + Date.now(),
      date: log.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    db.statusLogs.unshift(newLog);
    return c.json({
      success: true,
      log: newLog
    }, 201);
  } catch (error) {
    console.error("\u6DFB\u52A0\u65E5\u5FD7\u5931\u8D25:", error);
    return c.json({ error: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF" }, 500);
  }
});
app5.put("/:id", async (c) => {
  const id = c.req.param("id");
  const logData = await c.req.json();
  const logIndex = db.statusLogs.findIndex((l) => l.id === id);
  if (logIndex !== -1) {
    db.statusLogs[logIndex] = { ...db.statusLogs[logIndex], ...logData };
  }
  return c.json({
    success: true
  });
});
app5.delete("/:id", (c) => {
  const id = c.req.param("id");
  db.statusLogs = db.statusLogs.filter((l) => l.id !== id);
  return c.json({
    success: true
  });
});
app5.put("/quote/update", async (c) => {
  const { quote } = await c.req.json();
  if (!quote) {
    return c.json({ error: "Quote is required" }, 400);
  }
  db.statusQuote = quote;
  return c.json({
    success: true,
    quote
  });
});
var logs_default = app5;

// server/routes/music.ts
var app6 = new Hono2();
app6.get("/", (c) => {
  return c.json(db.musicTracks);
});
app6.post("/", async (c) => {
  try {
    const body = await c.req.json();
    if (!body || !body.title) {
      return c.json({ error: "Track title is required" }, 400);
    }
    const newTrack = {
      ...body,
      id: body.id || "track-" + Date.now()
    };
    db.musicTracks.push(newTrack);
    return c.json({
      success: true,
      track: newTrack
    }, 201);
  } catch (error) {
    console.error("\u6DFB\u52A0\u97F3\u4E50\u5931\u8D25:", error);
    return c.json({ error: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF" }, 500);
  }
});
app6.delete("/:id", (c) => {
  const id = c.req.param("id");
  db.musicTracks = db.musicTracks.filter((t) => t.id !== id);
  return c.json({
    success: true
  });
});
var music_default = app6;

// server/routes/stats.ts
var app7 = new Hono2();
app7.get("/", (c) => {
  const totalCommentsCount = db.comments.length + db.reviews.length + db.guestbook.length;
  const totalLikesCount = db.books.reduce((acc, b) => acc + (b.likes || 0), 0);
  return c.json({
    views: db.totalViews,
    booksCount: db.books.length,
    commentsCount: totalCommentsCount,
    likesCount: totalLikesCount
  });
});
app7.post("/view", (c) => {
  db.totalViews += 1;
  return c.json({
    success: true,
    views: db.totalViews
  });
});
var stats_default = app7;

// server/routes/upload.ts
var app8 = new Hono2();
var getExt = (filename) => {
  const parts = filename.split(".");
  return parts.length > 1 ? "." + parts.pop() : "";
};
var sanitizeFilename = (name) => {
  return name.replace(/[^a-zA-Z0-9_\-]/g, "_");
};
app8.post("/file", async (c) => {
  try {
    let formData = null;
    try {
      const rawReq = c.req.raw || c.req;
      if (rawReq && typeof rawReq.formData === "function") {
        formData = await rawReq.formData();
      } else if (typeof c.req.parseBody === "function") {
        formData = await c.req.parseBody();
      }
    } catch (e) {
      console.warn("formData parse warning", e);
    }
    const file = formData ? formData.get ? formData.get("file") : formData["file"] : null;
    if (!file || typeof file.arrayBuffer !== "function") {
      return c.json({ error: "No file uploaded" }, 400);
    }
    const arrayBuffer = await file.arrayBuffer();
    let base64Data;
    if (typeof btoa === "function") {
      base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    } else if (typeof Buffer !== "undefined") {
      base64Data = Buffer.from(arrayBuffer).toString("base64");
    } else {
      const u8 = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
      base64Data = typeof btoa === "function" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
    }
    const name = file.name || "upload.bin";
    const type = file.type || "application/octet-stream";
    const size = file.size || arrayBuffer.byteLength;
    const ext = getExt(name);
    const basename = sanitizeFilename(name.replace(ext, ""));
    const uniqueName = `${Date.now()}-${basename}${ext}`;
    const uploadedFile = {
      id: "file-" + Date.now(),
      filename: uniqueName,
      originalName: name,
      mimeType: type,
      size,
      data: `data:${type};base64,${base64Data}`,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.uploadedFiles.push(uploadedFile);
    const fileUrl = `/api/upload/file/${uploadedFile.id}`;
    return c.json({
      success: true,
      url: fileUrl,
      filename: uniqueName,
      originalName: name,
      size
    });
  } catch (error) {
    console.error("\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25:", error);
    return c.json({ error: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF" }, 500);
  }
});
app8.get("/file/:id", (c) => {
  const id = c.req.param("id");
  const file = db.uploadedFiles.find((f) => f.id === id);
  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }
  const [header, base64Data] = file.data.split(",");
  const mimeType = header.match(/:(.*?);/)?.[1] || "application/octet-stream";
  const buffer = Buffer.from(base64Data, "base64");
  return c.body(buffer, 200, {
    "Content-Type": mimeType,
    "Content-Disposition": `inline; filename="${file.originalName}"`
  });
});
app8.post("/base64", async (c) => {
  try {
    const { data, filename, type } = await c.req.json();
    if (!data) {
      return c.json({ error: "No base64 data provided" }, 400);
    }
    const base64Data = data.replace(/^data:[^;]+;base64,/, "");
    const mimeType = data.match(/^data:([^;]+);base64,/)?.[1] || type || "application/octet-stream";
    const ext = filename ? getExt(filename) : type === "audio" ? ".mp3" : ".jpg";
    const nameWithoutExt = filename ? sanitizeFilename(filename.replace(ext, "")) : "upload";
    const safeFilename = `${Date.now()}-${nameWithoutExt}${ext}`;
    const uploadedFile = {
      id: "file-" + Date.now(),
      filename: safeFilename,
      originalName: filename || "upload" + ext,
      mimeType,
      size: Buffer.from(base64Data, "base64").length,
      data: `data:${mimeType};base64,${base64Data}`,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.uploadedFiles.push(uploadedFile);
    const fileUrl = `/api/upload/file/${uploadedFile.id}`;
    return c.json({
      success: true,
      url: fileUrl,
      filename: safeFilename
    });
  } catch (error) {
    console.error("Base64 \u4E0A\u4F20\u5931\u8D25:", error);
    return c.json({ error: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF" }, 500);
  }
});
var upload_default = app8;

// server/routes/index.ts
var app9 = new Hono2();
app9.route("/books", books_default);
app9.route("/comments", comments_default);
app9.route("/reviews", reviews_default);
app9.route("/guestbook", guestbook_default);
app9.route("/logs", logs_default);
app9.route("/music", music_default);
app9.route("/stats", stats_default);
app9.route("/upload", upload_default);
var routes_default = app9;

// edge-functions/index.ts
var app10 = new Hono2();
app10.use("/*", cors());
app10.route("/api", routes_default);
app10.notFound(async (c) => {
  const url = new URL(c.req.url);
  if (url.pathname.startsWith("/api")) {
    return c.json({ message: "API Not Found" }, 404);
  }
  try {
    const response = await fetch(new URL("/index.html", url.origin));
    return new Response(response.body, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  } catch (e) {
    return c.text("Page Not Found", 404);
  }
});
var index_default = app10;
var fetch = app10.fetch.bind(app10);
export {
  index_default as default,
  fetch
};
