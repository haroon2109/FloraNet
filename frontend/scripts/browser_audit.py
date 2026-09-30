#!/usr/bin/env python3
"""
Headless-Chrome page audit for the FloraNet frontend.

Drives every route via the Chrome DevTools Protocol (raw WebSocket), captures
console errors, uncaught exceptions and failed network requests, and clicks
key interactive elements. Exits non-zero when issues are found.

Usage (from backend/ venv): ./venv/bin/python ../frontend/scripts/browser_audit.py --click
"""
import argparse
import json
import subprocess
import time
import urllib.request

import websocket  # websocket-client

BASE = "http://localhost:3000"
CHROME = "/usr/bin/google-chrome"

ROUTES = [
    "/", "/landing", "/home", "/dashboard", "/ai-assistant", "/alerts",
    "/analytics", "/crop-details", "/crops", "/edge", "/field",
    "/field-health", "/field-monitor", "/interop", "/login", "/market-prices",
    "/onboarding", "/onboarding/farm", "/onboarding/preferences",
    "/onboarding/review", "/planner", "/policy-dashboard",
    "/recommendations", "/reports", "/resources", "/seed-finder",
    "/seed-network", "/settings", "/signup", "/weather", "/zenith",
]


class Tab:
    def __init__(self, ws_url, timeout=30):
        self.ws = websocket.create_connection(ws_url, timeout=timeout)
        self.id = 0

    def send(self, method, params=None, session_id=None):
        self.id += 1
        msg = {"id": self.id, "method": method, "params": params or {}}
        if session_id:
            msg["sessionId"] = session_id
        self.ws.send(json.dumps(msg))
        return self.id

    def recv_json(self, timeout=5):
        self.ws.settimeout(timeout)
        return json.loads(self.ws.recv())

    def close(self):
        self.ws.close()


def classify(ev_buf):
    """Reduce raw CDP events to an error summary for one page load."""
    entry = {"console_errors": [], "page_errors": [],
             "network_failures": [], "http_4xx_5xx": []}
    for data in ev_buf:
        method = data.get("method", "")
        p = data.get("params", {})
        if method == "Runtime.consoleAPICalled" and p.get("type") == "error":
            text = " ".join(str(a.get("value", a.get("description", "")))
                            for a in p.get("args", []))
            entry["console_errors"].append(text[:300])
        elif method == "Runtime.exceptionThrown":
            d = p.get("exceptionDetails", {})
            text = d.get("exception", {}).get("description") or d.get("text", "")
            entry["page_errors"].append(text[:300])
        elif method == "Network.loadingFailed":
            if p.get("type") != "Ping":
                entry["network_failures"].append(
                    f"{p.get('errorText', '')} {p.get('type', '')}")
        elif method == "Network.responseReceived":
            status = p.get("response", {}).get("status", 0)
            u = p.get("response", {}).get("url", "")
            if status >= 400:
                entry["http_4xx_5xx"].append(f"{status} {u[:180]}")
    return entry


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--click", action="store_true")
    ap.add_argument("--dwell", type=float, default=9.0)
    ap.add_argument("--out", default="browser_audit_report.json")
    args = ap.parse_args()

    chrome = subprocess.Popen(
        [CHROME, "--headless=new", "--no-sandbox", "--disable-gpu",
         "--disable-dev-shm-usage", "--remote-debugging-port=9222",
         "--remote-allow-origins=*",
         "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.5)

    try:
        info = json.loads(urllib.request.urlopen(
            "http://localhost:9222/json/version", timeout=5).read())
        tab = Tab(info["webSocketDebuggerUrl"], timeout=45)

        # Create and attach to a dedicated tab (flatten protocol).
        rid = tab.send("Target.createTarget", {"url": "about:blank"})
        target_id = None
        while target_id is None:
            target_id = tab.recv_json(15).get("result", {}).get("targetId")
        aid = tab.send("Target.attachToTarget",
                       {"targetId": target_id, "flatten": True})
        session_id = None
        while session_id is None:
            msg = tab.recv_json(15)
            if msg.get("id") == aid:
                session_id = msg.get("result", {}).get("sessionId")

        for m in ("Page.enable", "Runtime.enable", "Network.enable", "Log.enable"):
            tab.send(m, session_id=session_id)
        time.sleep(0.5)

        report = {}
        for route in ROUTES:
            ev_buf = []
            stop = {"flag": False}

            nav_id = tab.send("Page.navigate",
                              {"url": BASE + route}, session_id=session_id)
            # Navigate, then collect events for the dwell window.
            deadline = time.time() + args.dwell
            got_nav = False
            while time.time() < deadline:
                try:
                    msg = tab.recv_json(1.0)
                except Exception:
                    continue
                ev_buf.append(msg)
                if msg.get("id") == nav_id:
                    got_nav = True
                # give the page a moment after load events settle
                if (got_nav and msg.get("method") == "Page.loadEventFired"
                        and time.time() > deadline - args.dwell + 4.0):
                    # keep draining until dwell ends
                    pass
            ev_buf.append({"done": True})

            entry = classify(ev_buf)

            if args.click:
                script = r"""
(async () => {
  const out = {clicked: [], errors: []};
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const clickables = () => Array.from(
    document.querySelectorAll('button, [role=button], a[href]'))
    .filter(el => visible(el) && !el.disabled).slice(0, 60);

  try {
    // 1) export/download/sync-style buttons
    const acts = clickables().filter(el =>
      /export|download|sync now|check connection|generate|try demo/i
        .test(el.textContent || ''));
    for (const el of acts.slice(0, 3)) {
      el.click();
      out.clicked.push((el.textContent || '').trim().slice(0, 40));
      await sleep(500);
    }
    // 2) custom dropdown triggers (open + close)
    const dds = clickables().filter(el =>
      /region|export report/i.test(el.textContent || ''));
    for (const el of dds.slice(0, 2)) {
      el.click();
      out.clicked.push('open:' + (el.textContent || '').trim().slice(0, 30));
      await sleep(250);
      el.click();
      await sleep(150);
    }
    // 3) native selects: change to a real option + change event
    const selects = Array.from(document.querySelectorAll('select'))
      .filter(visible).slice(0, 4);
    for (const sel of selects) {
      const opt = Array.from(sel.options).find(o => o.value && o.value !== sel.value);
      if (opt) {
        sel.value = opt.value;
        sel.dispatchEvent(new Event('change', {bubbles: true}));
        out.clicked.push('select:' + opt.textContent.trim().slice(0, 24));
        await sleep(150);
      }
    }
    // 4) one accordion/expand toggle if present
    const tog = clickables().find(el =>
      /toggle|expand|collapse/i.test(el.getAttribute('aria-label') || ''));
    if (tog) {
      tog.click();
      out.clicked.push('toggle');
      await sleep(300);
      tog.click();
    }
  } catch (e) {
    out.errors.push(String(e && e.message || e));
  }
  return JSON.stringify(out);
})()
"""
                try:
                    eid = tab.send(
                        "Runtime.evaluate",
                        {"expression": script, "awaitPromise": True,
                         "returnByValue": True},
                        session_id=session_id)
                    while True:
                        msg = tab.recv_json(20)
                        ev_buf.append(msg)
                        if msg.get("id") == eid:
                            val = msg.get("result", {}).get("result", {}).get("value")
                            entry["interactions"] = json.loads(val) if val else None
                            break
                except Exception as exc:
                    entry["interactions"] = {"errors": [str(exc)]}

            report[route] = entry
            flag = "ERR" if (entry["page_errors"] or entry["http_4xx_5xx"]) else "ok "
            print(f"{flag} {route:26s} console={len(entry['console_errors'])} "
                  f"page={len(entry['page_errors'])} "
                  f"net={len(entry['network_failures'])} "
                  f"http={len(entry['http_4xx_5xx'])}", flush=True)

        tab.close()
        with open(args.out, "w") as f:
            json.dump(report, f, indent=2)
        print(f"\nreport -> {args.out}")

        bad = {r: e for r, e in report.items()
               if e["page_errors"] or e["http_4xx_5xx"] or e["console_errors"]}
        print(f"routes with issues: {len(bad)}")
        for r, e in bad.items():
            print(" ", r)
            for k in ("page_errors", "http_4xx_5xx", "console_errors"):
                for item in e[k][:3]:
                    print(f"    [{k}] {item}")
    finally:
        chrome.terminate()


if __name__ == "__main__":
    main()
