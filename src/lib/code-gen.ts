import type { HttpMethod } from "@/apis/types";

export interface RequestShape {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

export function toCurl(req: RequestShape): string {
  const parts = [`curl -X ${req.method.toUpperCase()} '${req.url}'`];
  for (const [k, v] of Object.entries(req.headers)) {
    if (v) parts.push(`  -H '${k}: ${v}'`);
  }
  if (req.body !== undefined && req.body !== null && req.body !== "") {
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    parts.push(`  -d '${body.replace(/'/g, "'\\''")}'`);
  }
  return parts.join(" \\\n");
}

export function toFetch(req: RequestShape): string {
  const init: Record<string, unknown> = { method: req.method.toUpperCase() };
  if (Object.keys(req.headers).length) init.headers = req.headers;
  if (req.body !== undefined && req.body !== null && req.body !== "") {
    init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  }
  return `const res = await fetch(${JSON.stringify(req.url)}, ${JSON.stringify(init, null, 2)});
const data = await res.json();
console.log(data);`;
}

export function toPython(req: RequestShape): string {
  const fn = req.method === "get" ? "get" : req.method;
  const lines = [
    "import requests",
    "",
    `url = ${JSON.stringify(req.url)}`,
    `headers = ${JSON.stringify(req.headers, null, 2)}`,
  ];
  if (req.body !== undefined && req.body !== null && req.body !== "") {
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body, null, 2);
    lines.push(`json_body = ${body}`);
    lines.push(`r = requests.${fn}(url, headers=headers, json=json_body)`);
  } else {
    lines.push(`r = requests.${fn}(url, headers=headers)`);
  }
  lines.push("print(r.status_code, r.json())");
  return lines.join("\n");
}
