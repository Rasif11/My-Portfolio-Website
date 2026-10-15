"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/@netlify/blobs/dist/main.cjs
var require_main = __commonJS({
  "node_modules/@netlify/blobs/dist/main.cjs"(exports2, module2) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var main_exports = {};
    __export(main_exports, {
      connectLambda: () => connectLambda2,
      getDeployStore: () => getDeployStore,
      getStore: () => getStore2,
      listStores: () => listStores,
      setEnvironmentContext: () => setEnvironmentContext
    });
    module2.exports = __toCommonJS(main_exports);
    var NF_ERROR = "x-nf-error";
    var NF_REQUEST_ID = "x-nf-request-id";
    var BlobsInternalError = class extends Error {
      constructor(res) {
        let details = res.headers.get(NF_ERROR) || `${res.status} status code`;
        if (res.headers.has(NF_REQUEST_ID)) {
          details += `, ID: ${res.headers.get(NF_REQUEST_ID)}`;
        }
        super(`Netlify Blobs has generated an internal error (${details})`);
        this.name = "BlobsInternalError";
      }
    };
    var collectIterator = async (iterator) => {
      const result = [];
      for await (const item of iterator) {
        result.push(item);
      }
      return result;
    };
    var base64Decode = (input) => {
      const { Buffer: Buffer2 } = globalThis;
      if (Buffer2) {
        return Buffer2.from(input, "base64").toString();
      }
      return atob(input);
    };
    var base64Encode = (input) => {
      const { Buffer: Buffer2 } = globalThis;
      if (Buffer2) {
        return Buffer2.from(input).toString("base64");
      }
      return btoa(input);
    };
    var getEnvironment = () => {
      const { Deno, Netlify, process } = globalThis;
      return Netlify?.env ?? Deno?.env ?? {
        delete: (key) => delete process?.env[key],
        get: (key) => process?.env[key],
        has: (key) => Boolean(process?.env[key]),
        set: (key, value) => {
          if (process?.env) {
            process.env[key] = value;
          }
        },
        toObject: () => process?.env ?? {}
      };
    };
    var getEnvironmentContext = () => {
      const context = globalThis.netlifyBlobsContext || getEnvironment().get("NETLIFY_BLOBS_CONTEXT");
      if (typeof context !== "string" || !context) {
        return {};
      }
      const data = base64Decode(context);
      try {
        return JSON.parse(data);
      } catch {
      }
      return {};
    };
    var setEnvironmentContext = (context) => {
      const encodedContext = base64Encode(JSON.stringify(context));
      getEnvironment().set("NETLIFY_BLOBS_CONTEXT", encodedContext);
    };
    var MissingBlobsEnvironmentError = class extends Error {
      constructor(requiredProperties) {
        super(
          `The environment has not been configured to use Netlify Blobs. To use it manually, supply the following properties when creating a store: ${requiredProperties.join(
            ", "
          )}`
        );
        this.name = "MissingBlobsEnvironmentError";
      }
    };
    var connectLambda2 = (event) => {
      const rawData = base64Decode(event.blobs);
      const data = JSON.parse(rawData);
      const environmentContext = {
        deployID: event.headers["x-nf-deploy-id"],
        edgeURL: data.url,
        siteID: event.headers["x-nf-site-id"],
        token: data.token
      };
      setEnvironmentContext(environmentContext);
    };
    var BlobsConsistencyError = class extends Error {
      constructor() {
        super(
          `Netlify Blobs has failed to perform a read using strong consistency because the environment has not been configured with a 'uncachedEdgeURL' property`
        );
        this.name = "BlobsConsistencyError";
      }
    };
    var BASE64_PREFIX = "b64;";
    var METADATA_HEADER_INTERNAL = "x-amz-meta-user";
    var METADATA_HEADER_EXTERNAL = "netlify-blobs-metadata";
    var METADATA_MAX_SIZE = 2 * 1024;
    var encodeMetadata = (metadata) => {
      if (!metadata) {
        return null;
      }
      const encodedObject = base64Encode(JSON.stringify(metadata));
      const payload = `b64;${encodedObject}`;
      if (METADATA_HEADER_EXTERNAL.length + payload.length > METADATA_MAX_SIZE) {
        throw new Error("Metadata object exceeds the maximum size");
      }
      return payload;
    };
    var decodeMetadata = (header) => {
      if (!header || !header.startsWith(BASE64_PREFIX)) {
        return {};
      }
      const encodedData = header.slice(BASE64_PREFIX.length);
      const decodedData = base64Decode(encodedData);
      const metadata = JSON.parse(decodedData);
      return metadata;
    };
    var getMetadataFromResponse = (response) => {
      if (!response.headers) {
        return {};
      }
      const value = response.headers.get(METADATA_HEADER_EXTERNAL) || response.headers.get(METADATA_HEADER_INTERNAL);
      try {
        return decodeMetadata(value);
      } catch {
        throw new Error(
          "An internal error occurred while trying to retrieve the metadata for an entry. Please try updating to the latest version of the Netlify Blobs client."
        );
      }
    };
    var REGION_AUTO = "auto";
    var regions = {
      "us-east-1": true,
      "us-east-2": true,
      "eu-central-1": true,
      "ap-southeast-1": true,
      "ap-southeast-2": true
    };
    var isValidRegion = (input) => Object.keys(regions).includes(input);
    var InvalidBlobsRegionError = class extends Error {
      constructor(region) {
        super(
          `${region} is not a supported Netlify Blobs region. Supported values are: ${Object.keys(regions).join(", ")}.`
        );
        this.name = "InvalidBlobsRegionError";
      }
    };
    var DEFAULT_RETRY_DELAY = getEnvironment().get("NODE_ENV") === "test" ? 1 : 5e3;
    var MIN_RETRY_DELAY = 1e3;
    var MAX_RETRY = 5;
    var RATE_LIMIT_HEADER = "X-RateLimit-Reset";
    var fetchAndRetry = async (fetch, url, options, attemptsLeft = MAX_RETRY) => {
      try {
        const res = await fetch(url, options);
        if (attemptsLeft > 0 && (res.status === 429 || res.status >= 500)) {
          const delay = getDelay(res.headers.get(RATE_LIMIT_HEADER));
          await sleep(delay);
          return fetchAndRetry(fetch, url, options, attemptsLeft - 1);
        }
        return res;
      } catch (error) {
        if (attemptsLeft === 0) {
          throw error;
        }
        const delay = getDelay();
        await sleep(delay);
        return fetchAndRetry(fetch, url, options, attemptsLeft - 1);
      }
    };
    var getDelay = (rateLimitReset) => {
      if (!rateLimitReset) {
        return DEFAULT_RETRY_DELAY;
      }
      return Math.max(Number(rateLimitReset) * 1e3 - Date.now(), MIN_RETRY_DELAY);
    };
    var sleep = (ms) => new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
    var SIGNED_URL_ACCEPT_HEADER = "application/json;type=signed-url";
    var Client = class {
      constructor({ apiURL, consistency, edgeURL, fetch, region, siteID, token, uncachedEdgeURL }) {
        this.apiURL = apiURL;
        this.consistency = consistency ?? "eventual";
        this.edgeURL = edgeURL;
        this.fetch = fetch ?? globalThis.fetch;
        this.region = region;
        this.siteID = siteID;
        this.token = token;
        this.uncachedEdgeURL = uncachedEdgeURL;
        if (!this.fetch) {
          throw new Error(
            "Netlify Blobs could not find a `fetch` client in the global scope. You can either update your runtime to a version that includes `fetch` (like Node.js 18.0.0 or above), or you can supply your own implementation using the `fetch` property."
          );
        }
      }
      async getFinalRequest({
        consistency: opConsistency,
        key,
        metadata,
        method,
        parameters = {},
        storeName
      }) {
        const encodedMetadata = encodeMetadata(metadata);
        const consistency = opConsistency ?? this.consistency;
        let urlPath = `/${this.siteID}`;
        if (storeName) {
          urlPath += `/${storeName}`;
        }
        if (key) {
          urlPath += `/${key}`;
        }
        if (this.edgeURL) {
          if (consistency === "strong" && !this.uncachedEdgeURL) {
            throw new BlobsConsistencyError();
          }
          const headers = {
            authorization: `Bearer ${this.token}`
          };
          if (encodedMetadata) {
            headers[METADATA_HEADER_INTERNAL] = encodedMetadata;
          }
          if (this.region) {
            urlPath = `/region:${this.region}${urlPath}`;
          }
          const url2 = new URL(urlPath, consistency === "strong" ? this.uncachedEdgeURL : this.edgeURL);
          for (const key2 in parameters) {
            url2.searchParams.set(key2, parameters[key2]);
          }
          return {
            headers,
            url: url2.toString()
          };
        }
        const apiHeaders = { authorization: `Bearer ${this.token}` };
        const url = new URL(`/api/v1/blobs${urlPath}`, this.apiURL ?? "https://api.netlify.com");
        for (const key2 in parameters) {
          url.searchParams.set(key2, parameters[key2]);
        }
        if (this.region) {
          url.searchParams.set("region", this.region);
        }
        if (storeName === void 0 || key === void 0) {
          return {
            headers: apiHeaders,
            url: url.toString()
          };
        }
        if (encodedMetadata) {
          apiHeaders[METADATA_HEADER_EXTERNAL] = encodedMetadata;
        }
        if (method === "head" || method === "delete") {
          return {
            headers: apiHeaders,
            url: url.toString()
          };
        }
        const res = await this.fetch(url.toString(), {
          headers: { ...apiHeaders, accept: SIGNED_URL_ACCEPT_HEADER },
          method
        });
        if (res.status !== 200) {
          throw new BlobsInternalError(res);
        }
        const { url: signedURL } = await res.json();
        const userHeaders = encodedMetadata ? { [METADATA_HEADER_INTERNAL]: encodedMetadata } : void 0;
        return {
          headers: userHeaders,
          url: signedURL
        };
      }
      async makeRequest({
        body,
        consistency,
        headers: extraHeaders,
        key,
        metadata,
        method,
        parameters,
        storeName
      }) {
        const { headers: baseHeaders = {}, url } = await this.getFinalRequest({
          consistency,
          key,
          metadata,
          method,
          parameters,
          storeName
        });
        const headers = {
          ...baseHeaders,
          ...extraHeaders
        };
        if (method === "put") {
          headers["cache-control"] = "max-age=0, stale-while-revalidate=60";
        }
        const options = {
          body,
          headers,
          method
        };
        if (body instanceof ReadableStream) {
          options.duplex = "half";
        }
        return fetchAndRetry(this.fetch, url, options);
      }
    };
    var getClientOptions = (options, contextOverride) => {
      const context = contextOverride ?? getEnvironmentContext();
      const siteID = context.siteID ?? options.siteID;
      const token = context.token ?? options.token;
      if (!siteID || !token) {
        throw new MissingBlobsEnvironmentError(["siteID", "token"]);
      }
      if (options.region !== void 0 && !isValidRegion(options.region)) {
        throw new InvalidBlobsRegionError(options.region);
      }
      const clientOptions = {
        apiURL: context.apiURL ?? options.apiURL,
        consistency: options.consistency,
        edgeURL: context.edgeURL ?? options.edgeURL,
        fetch: options.fetch,
        region: options.region,
        siteID,
        token,
        uncachedEdgeURL: context.uncachedEdgeURL ?? options.uncachedEdgeURL
      };
      return clientOptions;
    };
    var DEPLOY_STORE_PREFIX = "deploy:";
    var LEGACY_STORE_INTERNAL_PREFIX = "netlify-internal/legacy-namespace/";
    var SITE_STORE_PREFIX = "site:";
    var Store = class _Store {
      constructor(options) {
        this.client = options.client;
        if ("deployID" in options) {
          _Store.validateDeployID(options.deployID);
          let name = DEPLOY_STORE_PREFIX + options.deployID;
          if (options.name) {
            name += `:${options.name}`;
          }
          this.name = name;
        } else if (options.name.startsWith(LEGACY_STORE_INTERNAL_PREFIX)) {
          const storeName = options.name.slice(LEGACY_STORE_INTERNAL_PREFIX.length);
          _Store.validateStoreName(storeName);
          this.name = storeName;
        } else {
          _Store.validateStoreName(options.name);
          this.name = SITE_STORE_PREFIX + options.name;
        }
      }
      async delete(key) {
        const res = await this.client.makeRequest({ key, method: "delete", storeName: this.name });
        if (![200, 204, 404].includes(res.status)) {
          throw new BlobsInternalError(res);
        }
      }
      async get(key, options) {
        const { consistency, type } = options ?? {};
        const res = await this.client.makeRequest({ consistency, key, method: "get", storeName: this.name });
        if (res.status === 404) {
          return null;
        }
        if (res.status !== 200) {
          throw new BlobsInternalError(res);
        }
        if (type === void 0 || type === "text") {
          return res.text();
        }
        if (type === "arrayBuffer") {
          return res.arrayBuffer();
        }
        if (type === "blob") {
          return res.blob();
        }
        if (type === "json") {
          return res.json();
        }
        if (type === "stream") {
          return res.body;
        }
        throw new BlobsInternalError(res);
      }
      async getMetadata(key, { consistency } = {}) {
        const res = await this.client.makeRequest({ consistency, key, method: "head", storeName: this.name });
        if (res.status === 404) {
          return null;
        }
        if (res.status !== 200 && res.status !== 304) {
          throw new BlobsInternalError(res);
        }
        const etag = res?.headers.get("etag") ?? void 0;
        const metadata = getMetadataFromResponse(res);
        const result = {
          etag,
          metadata
        };
        return result;
      }
      async getWithMetadata(key, options) {
        const { consistency, etag: requestETag, type } = options ?? {};
        const headers = requestETag ? { "if-none-match": requestETag } : void 0;
        const res = await this.client.makeRequest({
          consistency,
          headers,
          key,
          method: "get",
          storeName: this.name
        });
        if (res.status === 404) {
          return null;
        }
        if (res.status !== 200 && res.status !== 304) {
          throw new BlobsInternalError(res);
        }
        const responseETag = res?.headers.get("etag") ?? void 0;
        const metadata = getMetadataFromResponse(res);
        const result = {
          etag: responseETag,
          metadata
        };
        if (res.status === 304 && requestETag) {
          return { data: null, ...result };
        }
        if (type === void 0 || type === "text") {
          return { data: await res.text(), ...result };
        }
        if (type === "arrayBuffer") {
          return { data: await res.arrayBuffer(), ...result };
        }
        if (type === "blob") {
          return { data: await res.blob(), ...result };
        }
        if (type === "json") {
          return { data: await res.json(), ...result };
        }
        if (type === "stream") {
          return { data: res.body, ...result };
        }
        throw new Error(`Invalid 'type' property: ${type}. Expected: arrayBuffer, blob, json, stream, or text.`);
      }
      list(options = {}) {
        const iterator = this.getListIterator(options);
        if (options.paginate) {
          return iterator;
        }
        return collectIterator(iterator).then(
          (items) => items.reduce(
            (acc, item) => ({
              blobs: [...acc.blobs, ...item.blobs],
              directories: [...acc.directories, ...item.directories]
            }),
            { blobs: [], directories: [] }
          )
        );
      }
      async set(key, data, { metadata } = {}) {
        _Store.validateKey(key);
        const res = await this.client.makeRequest({
          body: data,
          key,
          metadata,
          method: "put",
          storeName: this.name
        });
        if (res.status !== 200) {
          throw new BlobsInternalError(res);
        }
      }
      async setJSON(key, data, { metadata } = {}) {
        _Store.validateKey(key);
        const payload = JSON.stringify(data);
        const headers = {
          "content-type": "application/json"
        };
        const res = await this.client.makeRequest({
          body: payload,
          headers,
          key,
          metadata,
          method: "put",
          storeName: this.name
        });
        if (res.status !== 200) {
          throw new BlobsInternalError(res);
        }
      }
      static formatListResultBlob(result) {
        if (!result.key) {
          return null;
        }
        return {
          etag: result.etag,
          key: result.key
        };
      }
      static validateKey(key) {
        if (key === "") {
          throw new Error("Blob key must not be empty.");
        }
        if (key.startsWith("/") || key.startsWith("%2F")) {
          throw new Error("Blob key must not start with forward slash (/).");
        }
        if (new TextEncoder().encode(key).length > 600) {
          throw new Error(
            "Blob key must be a sequence of Unicode characters whose UTF-8 encoding is at most 600 bytes long."
          );
        }
      }
      static validateDeployID(deployID) {
        if (!/^\w{1,24}$/.test(deployID)) {
          throw new Error(`'${deployID}' is not a valid Netlify deploy ID.`);
        }
      }
      static validateStoreName(name) {
        if (name.includes("/") || name.includes("%2F")) {
          throw new Error("Store name must not contain forward slashes (/).");
        }
        if (new TextEncoder().encode(name).length > 64) {
          throw new Error(
            "Store name must be a sequence of Unicode characters whose UTF-8 encoding is at most 64 bytes long."
          );
        }
      }
      getListIterator(options) {
        const { client, name: storeName } = this;
        const parameters = {};
        if (options?.prefix) {
          parameters.prefix = options.prefix;
        }
        if (options?.directories) {
          parameters.directories = "true";
        }
        return {
          [Symbol.asyncIterator]() {
            let currentCursor = null;
            let done = false;
            return {
              async next() {
                if (done) {
                  return { done: true, value: void 0 };
                }
                const nextParameters = { ...parameters };
                if (currentCursor !== null) {
                  nextParameters.cursor = currentCursor;
                }
                const res = await client.makeRequest({
                  method: "get",
                  parameters: nextParameters,
                  storeName
                });
                let blobs = [];
                let directories = [];
                if (![200, 204, 404].includes(res.status)) {
                  throw new BlobsInternalError(res);
                }
                if (res.status === 404) {
                  done = true;
                } else {
                  const page = await res.json();
                  if (page.next_cursor) {
                    currentCursor = page.next_cursor;
                  } else {
                    done = true;
                  }
                  blobs = (page.blobs ?? []).map(_Store.formatListResultBlob).filter(Boolean);
                  directories = page.directories ?? [];
                }
                return {
                  done: false,
                  value: {
                    blobs,
                    directories
                  }
                };
              }
            };
          }
        };
      }
    };
    var getDeployStore = (input = {}) => {
      const context = getEnvironmentContext();
      const options = typeof input === "string" ? { name: input } : input;
      const deployID = options.deployID ?? context.deployID;
      if (!deployID) {
        throw new MissingBlobsEnvironmentError(["deployID"]);
      }
      const clientOptions = getClientOptions(options, context);
      if (!clientOptions.region) {
        if (clientOptions.edgeURL || clientOptions.uncachedEdgeURL) {
          if (!context.primaryRegion) {
            throw new Error(
              "When accessing a deploy store, the Netlify Blobs client needs to be configured with a region, and one was not found in the environment. To manually set the region, set the `region` property in the `getDeployStore` options. If you are using the Netlify CLI, you may have an outdated version; run `npm install -g netlify-cli@latest` to update and try again."
            );
          }
          clientOptions.region = context.primaryRegion;
        } else {
          clientOptions.region = REGION_AUTO;
        }
      }
      const client = new Client(clientOptions);
      return new Store({ client, deployID, name: options.name });
    };
    var getStore2 = (input) => {
      if (typeof input === "string") {
        const clientOptions = getClientOptions({});
        const client = new Client(clientOptions);
        return new Store({ client, name: input });
      }
      if (typeof input?.name === "string" && typeof input?.siteID === "string" && typeof input?.token === "string") {
        const { name, siteID, token } = input;
        const clientOptions = getClientOptions(input, { siteID, token });
        if (!name || !siteID || !token) {
          throw new MissingBlobsEnvironmentError(["name", "siteID", "token"]);
        }
        const client = new Client(clientOptions);
        return new Store({ client, name });
      }
      if (typeof input?.name === "string") {
        const { name } = input;
        const clientOptions = getClientOptions(input);
        if (!name) {
          throw new MissingBlobsEnvironmentError(["name"]);
        }
        const client = new Client(clientOptions);
        return new Store({ client, name });
      }
      if (typeof input?.deployID === "string") {
        const clientOptions = getClientOptions(input);
        const { deployID } = input;
        if (!deployID) {
          throw new MissingBlobsEnvironmentError(["deployID"]);
        }
        const client = new Client(clientOptions);
        return new Store({ client, deployID });
      }
      throw new Error(
        "The `getStore` method requires the name of the store as a string or as the `name` property of an options object"
      );
    };
    function listStores(options = {}) {
      const context = getEnvironmentContext();
      const clientOptions = getClientOptions(options, context);
      const client = new Client(clientOptions);
      const iterator = getListIterator(client, SITE_STORE_PREFIX);
      if (options.paginate) {
        return iterator;
      }
      return collectIterator(iterator).then((results) => ({ stores: results.flatMap((page) => page.stores) }));
    }
    var formatListStoreResponse = (stores2) => stores2.filter((store) => !store.startsWith(DEPLOY_STORE_PREFIX)).map((store) => store.startsWith(SITE_STORE_PREFIX) ? store.slice(SITE_STORE_PREFIX.length) : store);
    var getListIterator = (client, prefix) => {
      const parameters = {
        prefix
      };
      return {
        [Symbol.asyncIterator]() {
          let currentCursor = null;
          let done = false;
          return {
            async next() {
              if (done) {
                return { done: true, value: void 0 };
              }
              const nextParameters = { ...parameters };
              if (currentCursor !== null) {
                nextParameters.cursor = currentCursor;
              }
              const res = await client.makeRequest({
                method: "get",
                parameters: nextParameters
              });
              if (res.status === 404) {
                return { done: true, value: void 0 };
              }
              const page = await res.json();
              if (page.next_cursor) {
                currentCursor = page.next_cursor;
              } else {
                done = true;
              }
              return {
                done: false,
                value: {
                  ...page,
                  stores: formatListStoreResponse(page.stores)
                }
              };
            }
          };
        }
      };
    };
  }
});

// ../lib/schema.js
var require_schema = __commonJS({
  "../lib/schema.js"(exports2, module2) {
    (function(r, f) {
      if (typeof module2 === "object" && module2.exports) module2.exports = f();
      else r.Schema = f();
    })(exports2, function() {
      var s = function(l, m, x) {
        return Object.assign({ t: "s", l, max: m || 200 }, x || {});
      }, T = function(l, m) {
        return s(l, m || 1200, { ml: 1 });
      }, U = function(l) {
        return { t: "u", l, max: 300 };
      }, I = function(l) {
        return { t: "i", l, max: 300 };
      }, C = function(l, q) {
        return { t: "c", l, req: q };
      }, N = function(l) {
        return { t: "n", l };
      }, D = function(l) {
        return { t: "d", l };
      }, E = function(l, o) {
        return { t: "e", l, o };
      }, M = function(l) {
        return { t: "m", l, max: 120 };
      }, Ph = function(l) {
        return { t: "p", l, max: 30 };
      }, H = { t: "h" }, L = function(l, i, m, x) {
        return Object.assign({ t: "l", l, item: i, max: m || 40 }, x || {});
      }, O = function(l, f) {
        return { t: "o", l, f };
      };
      var ICONS = ["target", "search", "share", "trend", "play", "users", "chart", "mail", "chat", "star"], SOC = ["facebook", "instagram", "linkedin", "tiktok", "youtube", "x"];
      var btn = function(l) {
        return O(l, { t: s("Button text", 40), u: U("Button link") });
      };
      var hdr = function() {
        return O("Page header", { eyebrow: s("Small label above heading", 40), l1: s("Heading line 1", 60), l2: s("Heading line 2 (gradient)", 60), intro: T("Intro paragraph", 500) });
      };
      var cta = function() {
        return O("Page call to action", { title: s("Heading", 80), text: T("Text", 300), btn: btn("Primary button"), b2: btn("Secondary button") });
      };
      var meta = { title: s("Browser tab title (page name)", 60), desc: T("Search engine description", 300) };
      var ROOT = O("", {
        site: O("Website", { name: s("Brand name", 80), short: s("Logo initials", 4), logo: I("Logo image"), favicon: I("Browser tab icon"), title: s("Browser title (Home page)", 120), desc: T("Search engine description", 300), footerDesc: T("Footer text", 300), email: M("Email address"), phone: Ph("Phone number"), phone2: Ph("Second phone number"), whatsapp: Ph("WhatsApp number"), cc: s("Country code for phone/WhatsApp links (digits only, e.g. 880)", 5) }),
        theme: O("Theme colours", { c1: C("Accent colour 1", 1), c2: C("Accent colour 2", 1), c3: C("Accent colour 3", 1), bg: C("Background colour", 1) }),
        socials: L("Social links", O("Link", { n: E("Platform", SOC), u: U("Profile URL") }), 8, { nm: "n" }),
        hero: O("Hero", { avail: s("Availability pill", 60), profession: s("Profession", 80), specialities: L("Rotating roles / specialities", s("Role", 80), 12), tagline: T("Tagline", 200), intro: T("Intro paragraph", 800), b1: btn("First button"), b2: btn("Second button"), portrait: I("Portrait photo"), cards: L("Floating cards", O("Card", { n: s("Headline number", 20), l: s("Label", 40) }), 2, { nm: "n" }) }),
        stats: L("Stats", O("Stat", { n: N("Number"), p: s("Prefix", 6), s: s("Suffix", 6), l: s("Label", 60) }), 4, { nm: "l" }),
        services: O("Services", { eyebrow: s("Section label", 40), title: s("Section heading", 80), items: L("Services", O("Service", { id: H, t: s("Service name", 80), tag: s("Category tag", 30), i: E("Icon", ICONS), d: T("Short description (Home page card)", 250), long: T("Description (Services page)", 600), inc: L("What's included", s("Item", 100), 8), note: s("Footer note", 60) }), 12, { nm: "t", idp: "svc-" }) }),
        work: O("My Work", { eyebrow: s("Section label", 40), title: s("Section heading", 80), items: L("Projects", O("Project", { id: H, t: s("Title", 80), d: T("Short description", 300), img: I("Screenshot"), date: D("Date (newest four appear on Home)") }), 60, { nm: "t", idp: "w-" }) }),
        about: O("About teaser", { eyebrow: s("Small label", 40), title: s("Heading", 80), img: I("Photo"), badge: O("Photo badge", { n: s("Number", 10), l: s("Two-word label", 30) }), p: L("Paragraphs", T("Paragraph", 600), 3), bullets: L("Ticked bullet points", s("Bullet", 80), 8), btn: btn("Button") }),
        tools: O("Tools & expertise", { eyebrow: s("Small label", 40), title: s("Heading", 80), chips: L("Tools used daily", s("Tool", 40), 24), marquee: L("Scrolling marquee keywords", s("Keyword", 60), 30) }),
        testi: O("Testimonials", { eyebrow: s("Home slider label", 40), title: s("Home slider heading", 80), btn: btn("Button below slider"), items: L("Reviews", O("Review", { q: T("Review text", 600), n: s("Name", 60), r: s("Role", 60), tag: s("Service tag", 60), ini: s("Avatar initials (blank = automatic)", 3), a1: C("Avatar colour 1 (blank = automatic)"), a2: C("Avatar colour 2 (blank = automatic)") }), 30, { nm: "n" }) }),
        cta: O("Home closing call to action", { title: s("Heading", 80), text: T("Text", 300), btn: btn("Primary button") }),
        servicesPage: O("Services page", { title: meta.title, desc: meta.desc, header: hdr(), cta: cta() }),
        workPage: O("My Work page", { title: meta.title, desc: meta.desc, header: hdr(), cta: cta() }),
        aboutPage: O("About Me page", { title: meta.title, desc: meta.desc, header: hdr(), story: O("Story", { eyebrow: s("Small label", 40), lead: T("Opening line", 300), paras: L("Story paragraphs", T("Paragraph", 900), 6), img: I("Photo"), sigName: s("Signature name", 80), sigTitle: s("Signature title", 80) }), cta: cta() }),
        testiPage: O("Testimonials page", { title: meta.title, desc: meta.desc, header: hdr(), cta: cta() }),
        contactPage: O("Contact page", { title: meta.title, desc: meta.desc, header: hdr(), form: O("Form wording", { title: s("Form heading", 60), sub: s("Sub-heading", 120), notSure: s('"Not sure" dropdown option', 40), placeholder: s("Message box hint", 160), note: s("Privacy note", 160) }), hints: O("Contact card hints", { email: s("Email card hint", 80), phone: s("Phone card hint", 80), wa: s("WhatsApp card hint", 80) }), online: s('"Find me online" heading', 40) })
      });
      function str(v, max, ml) {
        v = v == null ? "" : String(v);
        v = ml ? v.replace(/\r/g, "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "") : v.replace(/[\u0000-\u001f\u007f]+/g, " ");
        return v.trim().slice(0, max);
      }
      var slug = function(x) {
        return String(x || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "item";
      };
      function empty(x) {
        if (Array.isArray(x)) return !x.length;
        if (x && typeof x === "object") return Object.keys(x).every(function(k) {
          return empty(x[k]);
        });
        return x === "" || x === 0 || x == null;
      }
      function clean(n, v, d) {
        if (v === void 0 && d !== void 0) v = d;
        switch (n.t) {
          case "o": {
            var o = {}, k;
            for (k in n.f) o[k] = clean(n.f[k], v && typeof v === "object" && !Array.isArray(v) ? v[k] : void 0, d && typeof d === "object" ? d[k] : void 0);
            return o;
          }
          case "l": {
            var a = (Array.isArray(v) ? v : []).slice(0, n.max).map(function(x2) {
              return clean(n.item, x2);
            }).filter(function(x2) {
              return !empty(x2);
            }).filter(function(x2) {
              return !n.nm || typeof x2 !== "object" || x2[n.nm] !== "" && x2[n.nm] !== void 0;
            });
            if (n.item.t === "o" && n.item.f.id) {
              var seen = {};
              a.forEach(function(x2) {
                var b = x2.id;
                if (!b || seen[b]) b = (n.idp || "") + slug(x2.t);
                var i = 2, c = b;
                while (seen[c]) c = b + "-" + i++;
                x2.id = c;
                seen[c] = 1;
              });
            }
            return a;
          }
          case "u": {
            var x = str(v, 300);
            return /^(https?:\/\/[^\s"'<>]+|mailto:[^\s"'<>]+|tel:[^\s"'<>]+|\/(?!\/)[^\s"'<>]*|#[\w-]*|[\w.-]+\.html(#[\w-]*)?)$/i.test(x) ? x : "";
          }
          case "i": {
            var y = str(v, 300);
            return /^(assets\/img\/[\w.\-]+|\/api\/img\/[\w.\-]+|https:\/\/[^\s"'<>]+)$/.test(y) ? y : "";
          }
          case "c": {
            var z = str(v, 9);
            if (/^#[0-9a-f]{6}$/i.test(z)) return z.toLowerCase();
            return n.req ? /^#[0-9a-f]{6}$/i.test(d || "") ? d : "#7c5cff" : "";
          }
          case "n": {
            var q = Math.round(Number(v));
            return isFinite(q) ? Math.max(0, Math.min(1e9, q)) : 0;
          }
          case "d": {
            var w = str(v, 10);
            return /^\d{4}-\d{2}-\d{2}$/.test(w) ? w : "";
          }
          case "e":
            return n.o.indexOf(v) >= 0 ? v : n.o[0];
          case "m": {
            var m = str(v, 120);
            return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(m) ? m : "";
          }
          case "p":
            return str(v, 30).replace(/[^0-9+()\- ]/g, "");
          case "h": {
            var h = str(v, 40);
            return /^[a-z0-9-]{1,40}$/.test(h) ? h : "";
          }
          default:
            return str(v, n.max, n.ml);
        }
      }
      function canon(v) {
        if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
        if (v && typeof v === "object") return "{" + Object.keys(v).sort().map(function(k) {
          return JSON.stringify(k) + ":" + canon(v[k]);
        }).join(",") + "}";
        return JSON.stringify(v);
      }
      function blank(n) {
        switch (n.t) {
          case "o":
            var o = {};
            for (var k in n.f) o[k] = blank(n.f[k]);
            return o;
          case "l":
            return [];
          case "n":
            return 0;
          case "e":
            return n.o[0];
          case "d":
            return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          default:
            return "";
        }
      }
      return {
        ROOT,
        ICONS,
        SOC,
        clean,
        blank,
        sanitize: function(v, d) {
          return clean(ROOT, v, d);
        },
        hash: function(v) {
          return require("crypto").createHash("sha256").update(canon(v)).digest("hex").slice(0, 16);
        }
      };
    });
  }
});

// ../data/content.json
var require_content = __commonJS({
  "../data/content.json"(exports2, module2) {
    module2.exports = {
      site: {
        name: "Md Rasif Sharker",
        short: "MRS",
        title: "Md Rasif Sharker | Digital Marketing Specialist",
        desc: "Data-driven digital marketing for brands, startups and small businesses: social media, Facebook, Instagram, TikTok and Google Ads.",
        email: "digitalmarketerrasif@gmail.com",
        phone: "01709933988",
        logo: "",
        favicon: "",
        footerDesc: "Strategic, data-driven digital marketing that turns attention into customers and supports sustainable business growth.",
        phone2: "01788358751",
        whatsapp: "01709933988",
        cc: "880"
      },
      theme: {
        c1: "#7c5cff",
        c2: "#22d3ee",
        c3: "#ff5fa2",
        bg: "#07080f"
      },
      socials: [
        {
          n: "facebook",
          u: "https://facebook.com"
        },
        {
          n: "instagram",
          u: "https://instagram.com"
        },
        {
          n: "linkedin",
          u: "https://linkedin.com"
        },
        {
          n: "tiktok",
          u: "https://tiktok.com"
        }
      ],
      hero: {
        avail: "Available for new projects",
        profession: "Digital Marketing Specialist",
        specialities: [
          "Social Media Marketing",
          "Facebook Ads",
          "TikTok Ads",
          "Instagram Ads",
          "Google Ads",
          "Small Business Growth Strategy",
          "Organic Marketing",
          "Lead Generation"
        ],
        tagline: "Turning Clicks into Customers with Data-Driven Digital Marketing",
        intro: "I help brands, startups, and small businesses grow through strategic digital marketing that drives visibility, engagement, and conversions. From high-performing Facebook, Instagram, and Google Ads to strategic social media management, every campaign I build is data-driven, audience-focused, and designed to maximize ROI and support sustainable business growth.",
        b1: {
          t: "View My Work",
          u: "work.html"
        },
        b2: {
          t: "Hire Me",
          u: "contact.html"
        },
        portrait: "assets/img/portrait.svg",
        cards: [
          {
            n: "100%",
            l: "Data-Driven"
          },
          {
            n: "4",
            l: "Ad Platforms"
          }
        ]
      },
      stats: [
        {
          n: 4,
          p: "",
          s: "",
          l: "Ad Platforms"
        },
        {
          n: 6,
          p: "",
          s: "",
          l: "Core Services"
        },
        {
          n: 7,
          p: "",
          s: "",
          l: "Specialities"
        },
        {
          n: 100,
          p: "",
          s: "%",
          l: "Data-Driven Approach"
        }
      ],
      services: {
        eyebrow: "What I Do",
        title: "Services built to grow your business",
        items: [
          {
            id: "fb",
            i: "target",
            t: "Facebook & Instagram Ads",
            tag: "Paid Social",
            d: "Create targeted ad campaigns to reach the right audience, generate leads, and increase sales.",
            long: "Create targeted ad campaigns to reach the right audience, generate leads, and increase sales. Campaigns are built around your goals, tested with different audiences and creatives, and refined as results come in.",
            inc: [
              "Audience research and targeting",
              "Ad creative and copy direction",
              "Campaign setup and launch",
              "Lead generation campaigns",
              "A/B testing of ads",
              "Ongoing optimization"
            ],
            note: "Pricing on request"
          },
          {
            id: "google",
            i: "search",
            t: "Google Ads Management",
            tag: "Search Advertising",
            d: "Reach potential customers through strategic search advertising and performance-focused campaign optimization.",
            long: "Reach potential customers through strategic search advertising and performance-focused campaign optimization. Every campaign is structured around the searches that matter most to your business.",
            inc: [
              "Keyword research",
              "Search campaign setup",
              "Ad copy writing",
              "Bid and budget management",
              "Conversion tracking setup",
              "Regular performance reviews"
            ],
            note: "Pricing on request"
          },
          {
            id: "social",
            i: "share",
            t: "Social Media Management",
            tag: "Organic Social",
            d: "Manage social media accounts with consistent content planning, scheduling, and audience engagement.",
            long: "Manage social media accounts with consistent content planning, scheduling, and audience engagement. A steady, on-brand presence keeps your audience engaged and your accounts active.",
            inc: [
              "Content planning calendar",
              "Post creation direction",
              "Scheduling and publishing",
              "Community engagement",
              "Profile optimization",
              "Performance summaries"
            ],
            note: "Pricing on request"
          },
          {
            id: "growth",
            i: "trend",
            t: "Small Business Growth Strategy",
            tag: "Strategy",
            d: "Help small businesses attract customers and grow online with practical, goal-oriented marketing strategies.",
            long: "Help small businesses attract customers and grow online with practical, goal-oriented marketing strategies. Plans are kept simple and realistic, and shaped around your budget and goals.",
            inc: [
              "Business and market review",
              "Goal setting",
              "Channel recommendations",
              "Step-by-step action plan",
              "Organic marketing guidance",
              "Progress check-ins"
            ],
            note: "Pricing on request"
          },
          {
            id: "tiktok",
            i: "play",
            t: "TikTok Marketing",
            tag: "Short-Form Video",
            d: "Grow brand awareness and reach new audiences through TikTok content strategy and marketing campaigns.",
            long: "Grow brand awareness and reach new audiences through TikTok content strategy and marketing campaigns. Content and campaigns are shaped to suit how people actually use the platform.",
            inc: [
              "TikTok content strategy",
              "Video concept direction",
              "Campaign setup",
              "Audience targeting",
              "Trend-aware planning",
              "Performance tracking"
            ],
            note: "Pricing on request"
          },
          {
            id: "roi",
            i: "chart",
            t: "Campaign Optimization & ROI Tracking",
            tag: "Analytics",
            d: "Analyze campaign performance and optimize advertising spend to improve results and return on investment.",
            long: "Analyze campaign performance and optimize advertising spend to improve results and return on investment. Clear reporting shows where your budget is working hardest and what to improve next.",
            inc: [
              "Campaign performance analysis",
              "Conversion tracking review",
              "Budget allocation review",
              "Audience and creative insights",
              "Clear, readable reports",
              "Optimization recommendations"
            ],
            note: "Pricing on request"
          }
        ]
      },
      work: {
        eyebrow: "Featured Work",
        title: "Recent projects",
        items: [
          {
            id: "w1",
            t: "Social Media Campaign Overview",
            d: "A look at a social media campaign setup, covering content planning, scheduling and audience engagement.",
            img: "assets/img/work-1.svg",
            date: "2026-09-01"
          },
          {
            id: "w2",
            t: "Facebook Ads Campaign Setup",
            d: "Campaign structure, audience targeting and budget settings for a paid Facebook and Instagram campaign.",
            img: "assets/img/work-2.svg",
            date: "2026-08-01"
          },
          {
            id: "w3",
            t: "Google Search Campaign",
            d: "A search campaign layout with ad groups, keywords and ad copy organised around customer intent.",
            img: "assets/img/work-3.svg",
            date: "2026-07-01"
          },
          {
            id: "w4",
            t: "Instagram Content Plan",
            d: "A monthly content plan mapping out posts, formats and publishing dates for an Instagram account.",
            img: "assets/img/work-4.svg",
            date: "2026-06-01"
          },
          {
            id: "w5",
            t: "TikTok Campaign Overview",
            d: "A short-form video campaign view showing content ideas, targeting and performance tracking.",
            img: "assets/img/work-5.svg",
            date: "2026-05-01"
          },
          {
            id: "w6",
            t: "Audience Targeting Breakdown",
            d: "An audience breakdown used to choose who to reach, grouped by interests, location and behaviour.",
            img: "assets/img/work-6.svg",
            date: "2026-04-01"
          },
          {
            id: "w7",
            t: "Performance Report View",
            d: "A reporting dashboard that brings campaign data together in one clear, readable view.",
            img: "assets/img/work-7.svg",
            date: "2026-03-01"
          },
          {
            id: "w8",
            t: "Lead Generation Funnel",
            d: "A funnel plan showing how an ad leads visitors to a form and then to follow-up.",
            img: "assets/img/work-8.svg",
            date: "2026-02-01"
          },
          {
            id: "w9",
            t: "Small Business Growth Plan",
            d: "A step-by-step growth plan outlining priorities, channels and next actions for a small business.",
            img: "assets/img/work-9.svg",
            date: "2026-01-01"
          }
        ]
      },
      about: {
        eyebrow: "About Me",
        title: "Strategy first, results always",
        img: "assets/img/about.svg",
        badge: {
          n: "4",
          l: "Ad Platforms"
        },
        p: [
          "Great marketing happens where creativity meets measurement. I plan every campaign around your audience, your goals and the numbers that matter.",
          "Whether you are launching a new brand or scaling an existing business, I build clear, practical strategies you can understand and trust."
        ],
        bullets: [
          "Data-driven campaign planning",
          "Audience-focused creative",
          "Clear, transparent reporting",
          "Sustainable growth strategies"
        ],
        btn: {
          t: "Learn More About Me",
          u: "about.html"
        }
      },
      tools: {
        eyebrow: "Tools & Expertise",
        title: "The toolkit behind every campaign",
        chips: [
          "Meta Ads Manager",
          "Google Ads",
          "TikTok Ads Manager",
          "Google Analytics",
          "Canva",
          "Meta Business Suite"
        ],
        marquee: [
          "Social Media Marketing",
          "Facebook Ads",
          "TikTok Ads",
          "Instagram Ads",
          "Google Ads",
          "Small Business Growth Strategy",
          "Organic Marketing",
          "Lead Generation"
        ]
      },
      testi: {
        eyebrow: "Testimonials",
        title: "Kind words from clients",
        btn: {
          t: "Read All Testimonials",
          u: "testimonials.html"
        },
        items: [
          {
            q: "Working with Rasif was a refreshingly clear experience from the very first call. He took the time to understand my business before touching a single ad, explained every decision in plain language, and always answered my questions quickly. I never had to chase him for an update, and that kind of reliability is rare.",
            n: "Michael Carter",
            r: "Small Business Owner",
            tag: "Facebook & Instagram Ads"
          },
          {
            q: "Rasif took over my social media and made it feel effortless. The content calendar was organised, the posts matched my brand, and he handled comments and messages with real care. Even though we work in different time zones, communication was never a problem.",
            n: "Sarah Whitfield",
            r: "Boutique Owner",
            tag: "Social Media Management"
          },
          {
            q: "I came in knowing very little about search advertising. Rasif walked me through how everything worked without making me feel lost, and he was honest about what to expect. His reports were easy to read, and I always knew what was being done and why.",
            n: "Emily Harper",
            r: "Startup Founder",
            tag: "Google Ads Management"
          },
          {
            q: "What I valued most was the clarity. Rasif turned a vague idea of growing online into a simple, practical plan I could actually follow. He listened closely, asked sharp questions, and never pushed anything I didn't need.",
            n: "James Whitaker",
            r: "Business Consultant",
            tag: "Small Business Growth Strategy"
          },
          {
            q: "When something wasn't working, Rasif told me straight away and came back with a plan to fix it. That honesty built a lot of trust. He is organised, thoughtful and genuinely invested in doing the job properly.",
            n: "Daniel Brooks",
            r: "Online Store Owner",
            tag: "Campaign Optimization & ROI Tracking"
          },
          {
            q: "I was nervous about TikTok, but Rasif made it approachable. He suggested ideas that suited my business, kept me in the loop at every stage and was always open to my feedback. It felt like having a real partner.",
            n: "Olivia Bennett",
            r: "Restaurant Owner",
            tag: "TikTok Marketing"
          },
          {
            q: "Rasif is calm, professional and easy to talk to. Deadlines were met, messages were answered promptly, and when I changed my mind about something he adapted without any fuss. I would happily work with him again.",
            n: "Thomas Reynolds",
            r: "Fitness Studio Owner",
            tag: "Facebook & Instagram Ads"
          },
          {
            q: "He understood my voice and my audience quickly, and the content he planned always felt like me. I appreciated the care he put into the details, and how patiently he handled my many questions.",
            n: "Hannah Mitchell",
            r: "Online Coach",
            tag: "Social Media Management"
          },
          {
            q: "As someone who works in marketing myself, I'm picky about who I trust with campaigns. Rasif was methodical, transparent about his thinking and open to challenge. He documented his work clearly and made collaboration simple.",
            n: "Andrew Fletcher",
            r: "Marketing Manager",
            tag: "Google Ads Management"
          },
          {
            q: "Rasif made a complicated subject feel manageable. He broke the work into clear steps, checked in regularly and explained things without jargon. I felt supported the whole way through.",
            n: "Jessica Sullivan",
            r: "Small Business Owner",
            tag: "Small Business Growth Strategy"
          }
        ]
      },
      cta: {
        title: "Ready to grow your business?",
        text: "Tell me about your goals and let's build a marketing plan that turns attention into customers.",
        btn: {
          t: "Start a Project",
          u: "contact.html"
        }
      },
      servicesPage: {
        title: "Services",
        desc: "Facebook & Instagram Ads, Google Ads, social media management, TikTok marketing, small business growth strategy and ROI tracking.",
        header: {
          eyebrow: "My Services",
          l1: "Marketing Services",
          l2: "Built for Growth",
          intro: "Every project starts with understanding your business, your audience and your goals. From there I plan, launch and refine each campaign in clear steps, tracking performance along the way so you always know what is working. Choose a single service or combine several into one connected plan."
        },
        cta: {
          title: "Let's grow your business together",
          text: "Tell me what you want to achieve and I will recommend the services that fit your goals and budget.",
          btn: {
            t: "Get in Touch",
            u: "contact.html"
          }
        }
      },
      workPage: {
        title: "My Work",
        desc: "A selection of digital marketing projects by Md Rasif Sharker: social media, Facebook, Instagram, TikTok and Google Ads.",
        header: {
          eyebrow: "My Work",
          l1: "A Look at",
          l2: "My Recent Work",
          intro: "A selection of campaigns and projects I have worked on. Click any screenshot to see it larger, along with a short description of what it shows."
        },
        cta: {
          title: "Let's build your next campaign",
          text: "If you like what you see, tell me about your business and goals and I will suggest where to start.",
          btn: {
            t: "Start a Project",
            u: "contact.html"
          },
          b2: {
            t: "View My Services",
            u: "services.html"
          }
        }
      },
      aboutPage: {
        title: "About Me",
        desc: "About Md Rasif Sharker, a digital marketing specialist helping brands, startups and small businesses grow online.",
        header: {
          eyebrow: "About Me",
          l1: "Marketing with",
          l2: "a Human Touch",
          intro: "A little about who I am, how I think, and how I like to work with the people and businesses I help."
        },
        story: {
          eyebrow: "My Story",
          lead: "I believe good marketing starts with listening, long before the first ad goes live.",
          paras: [
            "I'm Md Rasif Sharker, a digital marketing specialist who helps brands, startups and small businesses grow online. My work covers social media, paid advertising on Facebook, Instagram, TikTok and Google, and the strategy that ties it all together.",
            "I like to begin with questions. Who are you trying to reach? What do they care about? What does success look like for your business? The answers shape everything that follows, from the message to the budget.",
            "I rely on data to guide my decisions, but I never forget that there are real people behind every click. I look at the numbers, test new ideas, keep what works and let go of what doesn't, so each campaign gets a little sharper over time.",
            "I explain things in plain language and keep you informed at every step. My goal is simple: to build marketing that you understand, trust and can see working for your business."
          ],
          img: "assets/img/portrait.svg",
          sigName: "Md Rasif Sharker",
          sigTitle: "Digital Marketing Specialist"
        },
        cta: {
          title: "Let's start a conversation",
          text: "Tell me about your business and your goals, and we can work out the best next step together.",
          btn: {
            t: "Get in Touch",
            u: "contact.html"
          },
          b2: {
            t: "See My Work",
            u: "work.html"
          }
        }
      },
      testiPage: {
        title: "Testimonials",
        desc: "Reviews from clients about working with Md Rasif Sharker on social media, Facebook, Instagram, TikTok and Google Ads.",
        header: {
          eyebrow: "Testimonials",
          l1: "Kind Words from",
          l2: "Valued Clients",
          intro: "Here is what clients say about working with me, from the first conversation to the final report. Tap any review to bring it to the top of the page."
        },
        cta: {
          title: "Ready to start working together",
          text: "Tell me about your business and goals, and let's talk about how I can help you grow.",
          btn: {
            t: "Get in Touch",
            u: "contact.html"
          },
          b2: {
            t: "See My Work",
            u: "work.html"
          }
        }
      },
      contactPage: {
        title: "Contact",
        desc: "Contact Md Rasif Sharker about Facebook & Instagram Ads, Google Ads, TikTok marketing, social media management and small business growth.",
        header: {
          eyebrow: "Contact",
          l1: "Let's Talk About",
          l2: "Your Next Project",
          intro: "Have a question or a project in mind? Send me a message using the form, or reach me directly by email, phone or WhatsApp. I look forward to hearing from you."
        },
        form: {
          title: "Send Me a Message",
          sub: "Share a few details and I'll get back to you personally.",
          notSure: "Not sure yet",
          placeholder: "Tell me about your business, goals, challenges, or project requirements",
          note: "Your details stay private and are only used to reply to your message."
        },
        hints: {
          email: "Send me a message any time",
          phone: "Call me to talk it through",
          wa: "Chat with me on WhatsApp"
        },
        online: "Find Me Online"
      }
    };
  }
});

// ../src/api.src.js
var crypto = require("crypto");
var { connectLambda, getStore } = require_main();
var Schema = require_schema();
var DEFAULTS_RAW = require_content();
var DEFAULTS = Schema.sanitize(DEFAULTS_RAW, DEFAULTS_RAW);
var DEF_USER = "admin";
var DEF_PASS = "ChangeMe123!";
var SESSION_MS = 7 * 864e5;
var MAX_IMG = 3 * 1024 * 1024;
var rand = (n) => crypto.randomBytes(n || 16).toString("hex");
var json = (code, body, h) => ({ statusCode: code, headers: Object.assign({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff" }, h || {}), body: JSON.stringify(body) });
var hashPw = (pw) => {
  const s = crypto.randomBytes(16);
  return "scrypt$" + s.toString("hex") + "$" + crypto.scryptSync(pw, s, 64).toString("hex");
};
var checkPw = (pw, st) => {
  const p = String(st || "").split("$");
  if (p.length !== 3 || p[0] !== "scrypt") return false;
  const h = crypto.scryptSync(String(pw), Buffer.from(p[1], "hex"), 64), t = Buffer.from(p[2], "hex");
  return t.length === h.length && crypto.timingSafeEqual(h, t);
};
var eq = (a, b) => {
  const x = crypto.createHash("sha256").update(String(a)).digest(), y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};
var sign = (a, p) => {
  const b = Buffer.from(JSON.stringify(p)).toString("base64url");
  return b + "." + crypto.createHmac("sha256", a.secret).update(b).digest("base64url");
};
function verify(a, tok) {
  if (!tok) return null;
  const i = tok.indexOf(".");
  if (i < 1) return null;
  const b = tok.slice(0, i), sig = Buffer.from(tok.slice(i + 1)), ex = Buffer.from(crypto.createHmac("sha256", a.secret).update(b).digest("base64url"));
  if (sig.length !== ex.length || !crypto.timingSafeEqual(sig, ex)) return null;
  let d;
  try {
    d = JSON.parse(Buffer.from(b, "base64url").toString());
  } catch (e) {
    return null;
  }
  return d && d.exp > Date.now() && d.v === a.v && d.u === a.user ? d : null;
}
var cookie = (t, age) => "rs_sid=" + t + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + age;
var newSession = (a) => cookie(sign(a, { u: a.user, v: a.v, exp: Date.now() + SESSION_MS }), SESSION_MS / 1e3);
var getCookie = (h, n) => {
  const m = (h.cookie || "").split(/;\s*/).find((x) => x.startsWith(n + "="));
  return m ? m.slice(n.length + 1) : "";
};
function strongOk(ev) {
  try {
    const d = JSON.parse(Buffer.from(ev.blobs || "", "base64").toString());
    return !!(d && (d.uncachedEdgeURL || d.uncached_edge_url));
  } catch (e) {
    return false;
  }
}
function stores(ev) {
  const o = strongOk(ev) ? { consistency: "strong" } : {};
  return { site: getStore(Object.assign({ name: "site" }, o)), media: getStore(Object.assign({ name: "media" }, o)), inbox: getStore(Object.assign({ name: "inbox" }, o)) };
}
async function getAuth(S) {
  let a = await S.site.get("auth.json", { type: "json" });
  if (!a) {
    a = { user: DEF_USER, hash: hashPw(DEF_PASS), v: rand(), secret: rand(32), def: true };
    await S.site.setJSON("auth.json", a);
  }
  return a;
}
var loadContent = async (S) => {
  const st = await S.site.get("content.json", { type: "json" });
  return st ? Schema.sanitize(st, DEFAULTS) : DEFAULTS;
};
var mem = /* @__PURE__ */ new Map();
var ipKey = (ev) => crypto.createHash("sha256").update(ev.headers["x-nf-client-connection-ip"] || String(ev.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown").digest("hex").slice(0, 16);
async function lockState(S, k) {
  const b = await S.site.get("lock/" + k, { type: "json" }) || { n: 0, until: 0 }, m = mem.get(k) || { n: 0, until: 0 };
  return { n: Math.max(b.n, m.n), until: Math.max(b.until, m.until) };
}
async function lockSave(S, k, r) {
  mem.set(k, r);
  await S.site.setJSON("lock/" + k, r);
}
async function lockFail(S, k) {
  const r = await lockState(S, k);
  if (r.until && r.until <= Date.now()) {
    r.n = 0;
    r.until = 0;
  }
  r.n++;
  if (r.n >= 5) {
    r.until = Date.now() + 3e5;
    r.n = 0;
  }
  await lockSave(S, k, r);
  return r;
}
var lockMsg = (u) => json(429, { ok: false, error: "Too many wrong attempts. Login is locked for " + Math.max(1, Math.ceil((u - Date.now()) / 6e4)) + " more minute(s).", locked: true });
var EXT = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml" };
function sigOk(ext, b) {
  const at = (o, h) => {
    const x = Buffer.from(h, "hex");
    return b.length >= o + x.length && b.slice(o, o + x.length).equals(x);
  };
  if (ext === "png") return at(0, "89504e470d0a1a0a");
  if (ext === "jpg" || ext === "jpeg") return at(0, "ffd8ff");
  if (ext === "gif") return at(0, "474946383761") || at(0, "474946383961");
  if (ext === "webp") return at(0, "52494646") && at(8, "57454250");
  if (ext === "svg") {
    const t = b.toString("utf8").replace(/^\uFEFF/, "");
    if (!/^\s*(<\?xml[^>]*\?>\s*)?(<!--[\s\S]*?-->\s*)?<svg[\s>]/i.test(t)) return false;
    return ![/<script/i, /\son[a-z]+\s*=/i, /javascript:/i, /<foreignObject/i, /<(iframe|embed|object|audio|video)/i, /<!(ENTITY|DOCTYPE)/i, /(xlink:)?href\s*=\s*["']\s*(?!#)/i, /@import/i, /url\(\s*["']?\s*(https?:|data:|javascript:)/i, /&#x?[0-9a-f]+;/i].some((r) => r.test(t));
  }
  return false;
}
var ab = (b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
exports.handler = async function(event) {
  try {
    connectLambda(event);
  } catch (e) {
  }
  try {
    const S = stores(event), H = event.headers || {}, M = event.httpMethod, path = (event.path || "").replace(/^\/(\.netlify\/functions\/api|api)/, "") || "/";
    let body = {};
    if (event.body) {
      const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body;
      if (raw.length > 5.5 * 1024 * 1024) return json(413, { ok: false, error: "Request too large" });
      try {
        body = JSON.parse(raw);
      } catch (e) {
        body = {};
      }
    }
    if (M === "GET" && path === "/hash") {
      return json(200, { hash: Schema.hash(await loadContent(S)) });
    }
    if (M === "GET" && path === "/content") {
      const c = await loadContent(S);
      return json(200, { content: c, hash: Schema.hash(c) });
    }
    let m = path.match(/^\/img\/([a-f0-9]{16}\.(png|jpg|gif|webp|svg))$/);
    if (M === "GET" && m) {
      const buf = await S.media.get("img/" + m[1], { type: "arrayBuffer" });
      if (!buf) return json(404, { ok: false, error: "Not found" });
      const h = { "Content-Type": EXT[m[2]], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex" };
      if (m[2] === "svg") h["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
      return { statusCode: 200, headers: h, body: Buffer.from(buf).toString("base64"), isBase64Encoded: true };
    }
    if (M === "POST" && path === "/contact") {
      if (body.website) return json(200, { ok: true });
      const n = String(body.name || "").trim(), e = String(body.email || "").trim(), sv = String(body.service || "").trim(), ms = String(body.message || "").trim();
      if (n.length < 2 || n.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) || e.length > 200 || !sv || sv.length > 120 || ms.length < 10 || ms.length > 3e3) return json(400, { ok: false, error: "Please check the form and try again." });
      const k = "rl/" + ipKey(event), r = await S.site.get(k, { type: "json" }) || { n: 0, s: Date.now() };
      if (Date.now() - r.s > 6e5) {
        r.n = 0;
        r.s = Date.now();
      }
      if (r.n >= 5) return json(429, { ok: false, error: "Too many messages sent. Please try again in a few minutes." });
      r.n++;
      await S.site.setJSON(k, r);
      const id = String(Date.now()).padStart(13, "0") + "-" + rand(3);
      await S.inbox.setJSON("m/" + id, { id, name: n, email: e, service: sv, message: ms, at: (/* @__PURE__ */ new Date()).toISOString() });
      return json(200, { ok: true });
    }
    const A = await getAuth(S);
    if (M === "POST" && path === "/login") {
      const k = ipKey(event), st = await lockState(S, k);
      if (st.until > Date.now()) return lockMsg(st.until);
      const okPw = checkPw(body.password || "", A.hash), okUser = eq(body.username || "", A.user);
      if (okPw && okUser) {
        mem.delete(k);
        await S.site.delete("lock/" + k);
        return json(200, { ok: true, defaultPw: !!A.def }, { "Set-Cookie": newSession(A) });
      }
      const r = await lockFail(S, k);
      if (r.until > Date.now()) return lockMsg(r.until);
      return json(401, { ok: false, error: "Incorrect username or password." });
    }
    if (M === "POST" && path === "/logout") return json(200, { ok: true }, { "Set-Cookie": cookie("", 0) });
    const ses = verify(A, getCookie(H, "rs_sid"));
    if (!ses) return json(401, { ok: false, error: "Not signed in" });
    if (M !== "GET" && H["x-requested-with"] !== "admin") return json(403, { ok: false, error: "Forbidden" });
    if (M === "GET" && path === "/me") return json(200, { ok: true, user: A.user, defaultPw: !!A.def });
    if (M === "PUT" && path === "/content") {
      if (!body.content || typeof body.content !== "object") return json(400, { ok: false, error: "No content" });
      const c = Schema.sanitize(body.content, DEFAULTS);
      await S.site.setJSON("content.json", c);
      return json(200, { ok: true, hash: Schema.hash(c), content: c });
    }
    if (M === "POST" && path === "/reset") {
      const cur = await loadContent(S), raw = Object.assign({}, DEFAULTS_RAW, { theme: cur.theme }), c = Schema.sanitize(raw, raw);
      await S.site.setJSON("content.json", c);
      return json(200, { ok: true, hash: Schema.hash(c), content: c });
    }
    if (M === "GET" && path === "/media") {
      const ix = await S.site.get("media-index.json", { type: "json" }) || [];
      return json(200, { ok: true, items: ix });
    }
    if (M === "POST" && path === "/media") {
      const name = String(body.name || "image").replace(/[^\w.\- ]/g, "").slice(0, 80) || "image", ext = (name.split(".").pop() || "").toLowerCase();
      if (!EXT[ext]) return json(400, { ok: false, error: "Only PNG, JPG, GIF, WEBP or SVG images are allowed." });
      const buf = Buffer.from(String(body.data || "").replace(/^data:[^,]*,/, ""), "base64");
      if (!buf.length) return json(400, { ok: false, error: "Empty file." });
      if (buf.length > MAX_IMG) return json(413, { ok: false, error: "Image is too large (maximum 3 MB)." });
      if (!sigOk(ext, buf)) return json(400, { ok: false, error: ext === "svg" ? "This SVG is not allowed (it must be a plain SVG without scripts or external links)." : "This file is not a real " + ext.toUpperCase() + " image." });
      const fe = ext === "jpeg" ? "jpg" : ext, file = rand(8) + "." + fe;
      await S.media.set("img/" + file, ab(buf));
      const ix = await S.site.get("media-index.json", { type: "json" }) || [];
      ix.unshift({ file, name, type: EXT[fe], size: buf.length, at: (/* @__PURE__ */ new Date()).toISOString() });
      await S.site.setJSON("media-index.json", ix);
      return json(200, { ok: true, file, path: "/api/img/" + file });
    }
    m = path.match(/^\/media\/([a-f0-9]{16}\.(png|jpg|gif|webp|svg))$/);
    if (M === "DELETE" && m) {
      await S.media.delete("img/" + m[1]);
      const ix = (await S.site.get("media-index.json", { type: "json" }) || []).filter((x) => x.file !== m[1]);
      await S.site.setJSON("media-index.json", ix);
      return json(200, { ok: true });
    }
    if (M === "GET" && path === "/inbox") {
      const l = await S.inbox.list({ prefix: "m/" }), ks = l.blobs.map((b) => b.key).sort().reverse().slice(0, 300), items = (await Promise.all(ks.map((k) => S.inbox.get(k, { type: "json" })))).filter(Boolean);
      return json(200, { ok: true, items });
    }
    m = path.match(/^\/inbox\/([\w-]+)$/);
    if (M === "DELETE" && m) {
      await S.inbox.delete("m/" + m[1]);
      return json(200, { ok: true });
    }
    if (M === "POST" && path === "/account") {
      const k = ipKey(event), st = await lockState(S, k);
      if (st.until > Date.now()) return lockMsg(st.until);
      if (!checkPw(body.current || "", A.hash)) {
        const r = await lockFail(S, k);
        return r.until > Date.now() ? lockMsg(r.until) : json(403, { ok: false, error: "Your current password is not correct." });
      }
      const nu = String(body.username || A.user).trim(), np = body.password ? String(body.password) : "";
      if (!/^[A-Za-z0-9_.-]{3,32}$/.test(nu)) return json(400, { ok: false, error: "Username must be 3-32 letters, numbers, dots, dashes or underscores." });
      if (np && (np.length < 10 || np.length > 200 || np === DEF_PASS || np.toLowerCase() === nu.toLowerCase())) return json(400, { ok: false, error: "New password must be at least 10 characters and different from the default password and your username." });
      if (nu === A.user && !np) return json(400, { ok: false, error: "Nothing to change." });
      const B = Object.assign({}, A, { user: nu, v: rand(), secret: rand(32) });
      if (np) {
        B.hash = hashPw(np);
        B.def = false;
      }
      await S.site.setJSON("auth.json", B);
      mem.delete(k);
      return json(200, { ok: true, user: B.user, defaultPw: !!B.def }, { "Set-Cookie": newSession(B) });
    }
    return json(404, { ok: false, error: "Not found" });
  } catch (err) {
    console.error(err);
    return json(500, { ok: false, error: "Server error" });
  }
};
