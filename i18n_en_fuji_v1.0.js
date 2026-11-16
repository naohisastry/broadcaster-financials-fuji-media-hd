/* 英語化 v1.0 — フジ財務ダッシュボード（broadcaster-financials-fuji-media-hd）v1.97用
   ・Plotly.react の引数を英語化し、金額（億円）を¥bn（÷10）に、年度を FY3/（年度＋1）に換算してから描く
   ・表の数値セル（億円）を¥bnに換算
   用語集：ITV放送スタジオ分離_調査_Claude/用語集_ダッシュボード英語版_v1.0.csv */
(function () {
  if (window.__LANG !== "en") return;
  var JP = /[぀-ヿ一-鿿]/;
  function n(x) { return parseFloat(String(x).replace(/,/g, "").replace("−", "-")); }
  function f(x, d) { return Math.abs(x).toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: 0 }); }
  function decs(s) { var m = String(s).match(/\.(\d+)/); return m ? m[1].length : 0; }
  // 億円の数値文字列 → ¥bn（÷10、桁は1つ増やす＝丸めなし）
  function jpy(s) { var v = n(s); return (v < 0 ? "-" : "") + "¥" + f(v / 10, decs(s) + 1) + "bn"; }
  // 符号付きの億円数値（"+434" "−40" "±0" "1,234"）→ 同じ符号で÷10（"¥"なし）
  function bnNum(s) {
    var m = String(s).match(/^([+\-−±]?)([\d,]+(?:\.\d+)?)$/); if (!m) return s;
    return m[1] + f(n(m[2]) / 10, decs(m[2]) + 1);
  }
  function bnSigned(s) {
    var m = String(s).match(/^([+\-−±]?)([\d,]+(?:\.\d+)?)$/); if (!m) return s;
    return m[1] + "¥" + f(n(m[2]) / 10, decs(m[2]) + 1) + "bn";
  }
  function fy(y) { return "FY3/" + (+y + 1); }
  window.I18N_FY = fy;

  window.I18N_TITLE = "Fuji Media Holdings: Segment Earnings and Cash Flow — Actuals and Projections (FY3/2018–FY3/2037) Ver 1.97";

  window.I18N_RULES_PRE = [
    // 年度 → FY3/（年度＋1）
    [/(\d{4})年度（(\d{4})年3月期）/g, function (m, a, b) { return "FY3/" + b; }],
    [/(\d{4})\s*[〜～]\s*(\d{4})年度/g, function (m, a, b) { return fy(a) + "–" + fy(b); }],
    [/(\d{4})→(\d{4})年度/g, function (m, a, b) { return fy(a) + "→" + fy(b); }],
    [/(\d{4})・(\d{4})年度/g, function (m, a, b) { return fy(a) + " and " + fy(b); }],
    [/(\d{4})年度/g, function (m, a) { return fy(a); }],
    // 金額
    [/([\d,]+(?:\.\d+)?)億円／年/g, function (m, a) { return jpy(a) + "/yr"; }],
    [/(?<![\d,.])(\d[\d,]*)円/g, function (m, a) { return "¥" + a; }],
    [/([\d,]+)株/g, "$1 shares"]
  ];

  // ---------- Plotly の引数を英語化・換算 ----------
  var TR = function (s) { return typeof s === "string" ? window.I18N_TR(s) : s; };
  function trArr(a) { return Array.isArray(a) ? a.map(TR) : TR(a); }
  function sc10(a) { return Array.isArray(a) ? a.map(function (v) { return typeof v === "number" ? v / 10 : v; }) : (typeof a === "number" ? a / 10 : a); }
  function lastNum(t) { // 末尾の数値（億円）を÷10
    return String(t).replace(/([+\-−±]?)([\d,]+(?:\.\d+)?)(<\/b>)?$/, function (m, sg, num, b) { return bnNum(sg + num) + (b || ""); });
  }
  var SPEC = {
    mk: { x: true }, sr: { y: true, last: true }, sp: { y: true, last: true },
    tl: { y: true, text: true, years: "tl" }, skb: { y: true, years: "bar", cd: true }, skc: { y: true, years: "bar", cd: true }, sk: { sankey: true }
  };
  function axTitle(ax) { if (ax && ax.title && typeof ax.title.text === "string") ax.title.text = TR(ax.title.text); }
  function transform(id, data, layout) {
    var sp = SPEC[id] || {};
    (data || []).forEach(function (t) {
      if (t.name) t.name = TR(t.name);
      if (sp.x) { t.x = sc10(t.x); if (t.width) t.width = sc10(t.width); }
      if (sp.y) t.y = sc10(t.y);
      if (t.text !== undefined) {
        t.text = Array.isArray(t.text) ? t.text.map(function (v) { return sp.text && /^[+\-−±]?[\d,]+$/.test(v) ? bnNum(v) : (sp.text ? lastNum(TR(v)) : TR(v)); }) : TR(t.text);
      }
      if (sp.cd && Array.isArray(t.customdata)) {
        var xs = t.x;
        t.customdata = t.customdata.map(function (v, i) { return bnSigned(v) + "  ·  " + fy(xs[i]); });
        t.hovertemplate = TR(String(t.hovertemplate).replace("%{customdata}億円<extra>%{x}年度</extra>", "%{customdata}<extra></extra>"));
      } else if (t.hovertemplate) t.hovertemplate = TR(t.hovertemplate);
      if (t.type === "sankey") {
        t.valuesuffix = "";
        if (t.node) { t.node.label = trArr(t.node.label); t.node.customdata = trArr(t.node.customdata); }
        if (t.link) { t.link.customdata = trArr(t.link.customdata); t.link.hovertemplate = TR(t.link.hovertemplate); }
      }
    });
    if (!layout) return;
    axTitle(layout.xaxis); axTitle(layout.yaxis);
    if (sp.x && layout.xaxis && layout.xaxis.range) layout.xaxis.range = sc10(layout.xaxis.range);
    if (sp.y && layout.yaxis && layout.yaxis.range) layout.yaxis.range = sc10(layout.yaxis.range);
    (layout.annotations || []).forEach(function (a) {
      if (sp.x && a.xref === "x") a.x = a.x / 10;
      if (sp.y && a.yref !== "paper" && typeof a.y === "number") a.y = a.y / 10;
      a.text = TR(a.text);
      if (sp.last) a.text = lastNum(a.text);
    });
    (layout.shapes || []).forEach(function (s) {
      if (sp.y && s.yref !== "paper") { if (typeof s.y0 === "number") s.y0 /= 10; if (typeof s.y1 === "number") s.y1 /= 10; }
    });
    if (sp.years === "tl" && layout.xaxis) {
      var ys = []; for (var y = 2017; y <= 2036; y++) ys.push(y);
      layout.xaxis.tickmode = "array"; layout.xaxis.tickvals = ys; layout.xaxis.ticktext = ys.map(function (y) { return String(y + 1).slice(2); });
      layout.xaxis.title = { text: "Fiscal year ending March (FY3/2018–FY3/2037)", font: { size: 11 } };
    }
    if (sp.years === "bar" && layout.xaxis && layout.xaxis.tickvals) layout.xaxis.ticktext = layout.xaxis.tickvals.map(function (y) { return String(y + 1).slice(2); });
  }
  if (window.Plotly) {
    var orig = window.Plotly.react;
    window.Plotly.react = function (gd, data, layout, config) {
      var id = typeof gd === "string" ? gd : gd.id;
      try { transform(id, data, layout); } catch (e) { console.error("i18n transform", e); }
      return orig.call(this, gd, data, layout, config);
    };
  }

  // ---------- 表の数値セルを¥bnに ----------
  function convCells(table, cols) {
    table.querySelectorAll("tbody tr").forEach(function (tr) {
      if (tr.dataset.i18nNum) return; tr.dataset.i18nNum = "1";
      cols.forEach(function (c) { var td = tr.children[c]; if (td) td.textContent = bnNum(td.textContent.trim()); });
    });
  }
  window.I18N_HOOKS.push(function (root) {
    if (root.nodeType !== 1) return;
    var t1 = (root.id === "tbl" ? root : root.querySelector && root.querySelector("#tbl table")) ;
    var tb = document.querySelector("#tbl table"); if (tb && (root === tb || root.contains(tb) || tb.contains(root))) convCells(tb, [1, 2]);
    var sk = document.querySelector("#sktbl table"); if (sk && (root === sk || root.contains(sk) || sk.contains(root))) convCells(sk, [2]);
    var asm = document.querySelector("#asm table");
    if (asm && (root === asm || root.contains(asm) || asm.contains(root))) {
      asm.querySelectorAll("tbody tr").forEach(function (tr) {
        if (tr.dataset.i18nNum) return; tr.dataset.i18nNum = "1";
        var v = tr.children[2], u = tr.children[3]; if (!v || !u) return;
        var unit = u.textContent.trim();
        if (unit === "億円" || unit === "億円／年") {
          var t = v.textContent.trim();
          if (/^[\d,.／\-−]+$/.test(t)) v.textContent = t.split("／").map(bnNum).join(" / ");
          u.textContent = unit === "億円" ? "¥bn" : "¥bn/yr";
          u.dataset.i18nDone = "1";
        }
      });
    }
  });

  // ---------- 年度チップ ----------
  window.I18N_BEFORE_RUN = function () {
    document.querySelectorAll(".chip").forEach(function (c) {
      var y = +c.dataset.y; c.textContent = String(y + 1).slice(2); c.title = fy(y); c.setAttribute("aria-label", fy(y));
    });
  };

  // ---------- 生成文字列のパターン（年度規則より先に） ----------
  var TRX = function (s) { return window.I18N_TR(s); };
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var PRE_FIRST = [
    [/^(.+?)の連結キャッシュフロー（実績、事業別内訳：(.+)）$/, function (m, a, b) { return "Consolidated cash flow, " + TRX(a) + " (actual; segment split: " + TRX(b) + ")"; }],
    [/^(.+?)の連結キャッシュフロー（(.+?)・粗利率改善(.+?)・売却(.+?)・2028年度以降配当(.+)）$/, function (m, a, b, c, d, e) {
      return "Consolidated cash flow, " + TRX(a) + " (broadcasting: " + TRX(b) + "; gross margin improvement: " + TRX(c) + "; sale " + TRX(d) + "; dividend from FY3/2029: " + TRX(e) + ")"; }],
    [/^(.+?)の事業構成（(.+)）$/, function (m, a, b) { return "Business mix, " + TRX(a) + " (" + TRX(b) + ")"; }],
    [/^(\d{4})年度に動くお金 ([\d,.]+)億円$/, function (m, y, v) { return "Cash moving in " + fy(y) + ": " + jpy(v); }],
    [/^期間に動くお金 ([\d,.]+)億円$/, function (m, v) { return "Cash moving in the period: " + jpy(v); }],
    [/^(\d{4})年度に動くお金（入り＝出）$/, function (m, y) { return "Cash moving in " + fy(y) + " (in = out)"; }],
    [/^目標350億円に対し (.+)$/, function (m, a) { return "vs. target ¥35bn: " + TRX(a); }],
    [/^既存メディアの売上の (\d+)%$/, "$1% of existing media revenue"],
    [/^設備投資 ([\d,]+)・成長投資 ([\d,]+)・株主還元 ([\d,]+)(?:・税と全社費用 ([\d,]+))?億円$/, function (m, a, b, c, d) {
      return "Capex " + jpy(a) + " · Growth investment " + jpy(b) + " · Shareholder returns " + jpy(c) + (d ? " · Taxes & corporate expenses " + jpy(d) : ""); }],
    [/^最低手元資金(\d+)を下回る：(.+?)／尽きる：(.+)$/, function (m, a, b, c) { return "Below minimum cash " + jpy(a) + ": " + TRX(b) + " / Runs out: " + TRX(c); }],
    [/^連結営業CF (-?[\d,]+)億円をEBITDA＋棚卸資産の増減([+\-]?)([\d,]+)は不動産へ＋残りを売上比で配分$/, function (m, a, s, b) {
      return "Consolidated operating CF " + jpy(a) + ": EBITDA + change in inventories (" + s + jpy(b) + ") to real estate + remainder by revenue share"; }],
    [/^連結営業CF (-?[\d,]+)億円をEBITDA＋残差×売上比で配分$/, function (m, a) { return "Consolidated operating CF " + jpy(a) + ": EBITDA + residual × revenue share"; }],
    [/^有形・無形固定資産の取得 ([\d,]+)億円をセグメントの設備投資額の比で配分$/, function (m, a) { return "Purchase of PP&E and intangibles " + jpy(a) + ", allocated by segment capex ratio"; }],
    [/（有価証券報告書_フジ・メディア・ホールディングス_(\d{4})(\d{2})期_Csv_\d+\.zip \/ [^）]+）/g, function (m, y) { return " (Annual Securities Report FY3/" + y + ", XBRL CSV)"; }],
    [/^放送収入 ([\d,]+)億円$/, function (m, a) { return "Broadcasting revenue " + jpy(a); }],
    // 「名前 数値」（積み上げグラフのラベル等）
    [/^([^\d<>]+?) ([+\-−±]?[\d,.]+)$/, function (m, a, b) { return TRX(a) + " " + b; }]
  ];
  var FRAG = [
    ["連結の現金及び現金同等物の期首残高", "Consolidated cash and cash equivalents at beginning of year"],
    ["連結の現金及び現金同等物の期末残高", "Consolidated cash and cash equivalents at end of year"],
    ["短期借入の純増（純額）・長期借入・社債の発行（総額）", "Net increase in short-term borrowings (net), long-term borrowings and bond issuance (gross)"],
    ["連結CF計算書（為替・連結範囲の変更・その他・端数）", "Consolidated CF statement (FX, changes in scope, other, rounding)"],
    ["連結CF計算書", "Consolidated CF statement"],
    ["長期借入の返済・社債の償還・短期借入の純減", "Repayment of long-term borrowings, bond redemption, net decrease in short-term borrowings"],
    ["配当金の支払額（非支配株主への配当を含む）", "Dividends paid (incl. to non-controlling interests)"],
    ["自己株式の取得による支出", "Payments for share buybacks"]
  ];
  window.I18N_RULES_PRE = PRE_FIRST.concat(FRAG.map(function (p) { return [new RegExp(esc(p[0]), "g"), p[1]]; }), window.I18N_RULES_PRE);

  // ---------- 語句の部分置換（規則のあとに適用。長い順） ----------
  window.I18N_PHRASES = [
    ["営業利益合計", "Total operating profit"], ["営業利益率", "Op. margin"], ["営業利益", "Op. profit"],
    ["売上", "Revenue"], ["利益", "Profit"], ["合計", "Total"], ["メディア計", "Media total"]
  ];

  window.I18N_ADD({
    // ヘッダー
    "BROADCASTER FINANCIALS ・ フジ・メディアHD": "BROADCASTER FINANCIALS · Fuji Media HD",
    "フジ・メディアHD　事業別の収益とキャッシュフロー": "Fuji Media Holdings: Segment Earnings and Cash Flow",
    "――実績と試算（2017〜2036年度）": "— Actuals and Projections (FY3/2018–FY3/2037)",
    "フジ・メディアHDの事業別の売上・営業利益と、キャッシュフロー（現金の入りと出）を、開示された実績（2017〜2025年度）、会社予想（2026年度）、2027年度以降の試算でつないで見られるダッシュボードです。今回の試算では、不動産事業（都市開発・観光）をすべて切り離したと仮定しています。放送収入の減り方、新しい事業の伸び、売却で受け取る対価、配当をプルダウンで選ぶと、2036年度までの数字が変わります。会社の目標（2030年度にメディア・コンテンツの営業利益350億円）との差も確かめられます。2027年度以降は筆者の試算です。タブ①で事業構成と利益を、タブ②でお金の入りと出を、タブ③で前提と出典を確認できます。":
      "This dashboard links Fuji Media Holdings' revenue and operating profit by segment, and its cash flow (cash in and out), across disclosed actuals (FY3/2018–FY3/2026), the company forecast (FY3/2027) and estimates from FY3/2028 onward. The estimates assume the real estate business (Urban Development, Hotels & Resorts) is fully separated. Choosing how fast broadcasting revenue falls, how new businesses grow, the sale proceeds and the dividend in the drop-downs changes the figures through FY3/2037. You can also check the gap to the company's target (Media & Content operating profit of ¥35bn in FY3/2031). Figures from FY3/2028 onward are the author's estimates. Tab ① shows the business mix and profit, tab ② cash in and out, and tab ③ the assumptions and sources.",
    "① 事業構成と利益": "① Business Mix & Profit",
    "② お金の入りと出": "② Cash In & Out",
    "③ 前提・出典": "③ Assumptions & Sources",
    "使い方：すぐ下のプルダウンで未来の前提（本業・新しい柱）を選び、年度（クリックまたは ▶ 再生）で2017〜2036年度を動かすと、このタブのグラフがすべて連動します。マリメッコは横幅＝売上、縦＝売上に占めるコストと営業利益で、濃い帯の面積が営業利益の額です。初期の設定は連載の記事と同じです（「連載の設定に戻す」で戻せます）。":
      "How to use: choose the future assumptions (core business, new pillars) in the drop-downs just below, then move through FY3/2018–FY3/2037 by year (click, or ▶ Play); every chart in this tab updates together. In the Marimekko chart, width = revenue and height = cost and operating profit as a share of revenue, so the area of the dark band is the operating profit. The default settings match the article series (\"Reset to series settings\" restores them).",
    "使い方：左から順に選びます。まず「表示（対象期間）」で年度ごとか期間の合計かを決め、次に過去の見方（実績の事業別内訳）、未来の前提（本業→新しい柱→お金）を選びます。本業・新しい柱のプルダウンと年度はタブ①と共通です。実績の期間を表示しているあいだは、未来の前提は効かないため薄く表示します。▶ 再生で、2026年度の売却を境にお金の流れがどう変わるかを追えます。「連載の設定に戻す」で記事と同じ数字に戻ります。":
      "How to use: choose from left to right. First pick \"View (period)\" — by year or a period total — then how to read the past (segment split of actuals), then the future assumptions (core business → new pillars → cash). The core-business and new-pillar drop-downs and the year are shared with tab ①. While an actual period is shown, future assumptions have no effect and are greyed out. ▶ Play shows how the cash flow changes around the sale in FY3/2027. \"Reset to series settings\" restores the figures used in the articles.",
    "このタブでは、試算に使った前提の一覧と出典を確認できます。": "This tab lists the assumptions used in the estimates and their sources.",

    // 操作パネル
    "何を見るか": "What to view",
    "表示（対象期間）": "View (period)",
    "年度ごと（スライダー連動）": "By year (linked to year selector)",
    "2017〜2025年度の合計（実績）": "Total FY3/2018–FY3/2026 (actual)",
    "2026〜2030年度の合計": "Total FY3/2027–FY3/2031",
    "2031〜2036年度の合計": "Total FY3/2032–FY3/2037",
    "過去の見方": "Reading the past",
    "実績の事業別内訳（推定）": "Segment split of actuals (inferred)",
    "不動産に寄せる": "Allocate to real estate",
    "売上比": "By revenue share",
    "未来の前提：本業": "Future assumptions: core business",
    "放送シナリオ": "Broadcasting scenario",
    "現状維持": "Status quo",
    "トレンド": "Trend",
    "悲観": "Pessimistic",
    "放送の粗利率改善": "Broadcast gross margin improvement",
    "なし": "None",
    "あり：目標の内訳": "Yes: within target",
    "あり：上振れ": "Yes: on top of target",
    "未来の前提：新しい柱": "Future assumptions: new pillars",
    "上積みの利益率": "Growth add-on margins",
    "保守": "Conservative",
    "標準": "Standard",
    "楽観": "Optimistic",
    "上積み 2031年度以降": "Growth add-ons from FY3/2032",
    "横ばい": "Flat",
    "年+5%": "+5%/yr",
    "年−5%": "−5%/yr",
    "未来の前提：お金": "Future assumptions: cash",
    "売却で受け取る対価（税引前・仮定）": "Sale proceeds (pre-tax, assumed)",
    "2000億円": "¥200bn",
    "3500億円": "¥350bn",
    "5000億円": "¥500bn",
    "配当（2028年度以降）": "Dividend (from FY3/2029)",
    "100円": "¥100",
    "50円": "¥50",
    "連載の設定に戻す": "Reset to series settings",
    "放送トレンド／粗利率改善 あり：上振れ／上積み 標準・横ばい／売却3,500億円／配当50円／内訳 不動産に寄せる":
      "Broadcasting: Trend / Gross margin improvement: Yes, on top of target / Growth add-ons: Standard, Flat / Sale ¥350bn / Dividend ¥50 / Split: Allocate to real estate",
    "▶ 再生": "▶ Play",
    "■ 停止": "■ Stop",
    "再生": "Play",
    "年度をクリック（← → キーで1年ずつ）": "Click a year (← → keys move one year)",
    "実績 2017〜2025": "Actual FY3/2018–2026",
    "予想": "Fcst",
    "試算 2027〜2036": "Estimate FY3/2028–2037",
    "年度": "Fiscal year",
    "年度を選ぶ": "Choose a fiscal year",
    "前の年度": "Previous year",
    "次の年度": "Next year",

    // 期間・ラベル
    "実績": "Actual",
    "会社予想": "Company forecast",
    "試算": "Estimate",
    "会社予想＋試算": "Company forecast + estimate",
    "確定": "Confirmed",
    "対象外": "N/A",
    "仮定": "Assumption",
    "推定": "Inferred",
    "仮置き": "Placeholder",
    "会社計画": "Company plan",
    "会社見込み": "Company outlook",
    "計算値": "Calculated",
    "確定（合計）＋推定（内訳）": "Confirmed (total) + inferred (breakdown)",
    "確定（残差を含む）": "Confirmed (incl. residual)",
    "会社予想＋仮定": "Company forecast + assumption",
    "確定（会社目標）＋仮定": "Confirmed (company target) + assumption",
    "会社計画＋仮定": "Company plan + assumption",
    "確定（会社目標）": "Confirmed (company target)",
    "確定（会社目標からの差引き）": "Confirmed (derived from company target)",
    "確定（原本確認）": "Confirmed (checked against source)",
    "確定（会社想定）": "Confirmed (company assumption)",
    "確定＋仮定": "Confirmed + assumption",
    "会社見込み＋仮定": "Company outlook + assumption",
    "入り": "In",
    "出": "Out",
    "ラベル": "Label",

    // 事業名
    "既存メディア・コンテンツ": "Existing Media & Content",
    "上積み：IP開発・獲得": "Growth add-on: IP development & acquisition",
    "上積み：制作・ディストリビューション": "Growth add-on: Production & distribution",
    "上積み：IP多角展開": "Growth add-on: IP multi-use",
    "都市開発・観光": "Urban Development, Hotels & Resorts",
    "その他": "Other",
    "既存メディア": "Existing media",
    "+IP開発": "+IP dev.",
    "+制作・配給": "+Prod.",
    "+IP多角": "+Multi-use",
    "都市開発": "Urban dev.",
    "メディア・コンテンツ": "Media & Content",

    // タブ①
    "売上合計（調整前）": "Total revenue (before adjustments)",
    "営業利益合計（調整前）": "Total operating profit (before adjustments)",
    "メディア・コンテンツ計（既存＋新規）": "Media & Content total (existing + new)",
    "上積み3区分の売上（2026年度比）": "Revenue of the 3 growth add-ons (vs FY3/2027)",
    "Group Vision目標：2030年度 350億円": "Group Vision target: ¥35bn in FY3/2031",
    "2027年度から": "From FY3/2028",
    "左：横軸の長さは全年度で固定。不動産が抜けると全体の幅が縮み、上積みが育つと右側の列が広がります。0より下の帯は赤字の額。":
      "Left: the horizontal axis is fixed across all years. When real estate drops out the total width shrinks, and as the growth add-ons grow the columns on the right widen. Bands below 0 show losses.",
    "右：同じ年度の合計。上段＝売上（薄い色）、下段＝営業利益（濃い色）。縮尺が違うため、上下は別々の目盛りで描いています。":
      "Right: totals for the same year. Top = revenue (light), bottom = operating profit (dark), on separate scales because their sizes differ.",
    "用語と設定の説明（「既存」「上積み」の意味と、放送シナリオ・粗利率改善・利益率の切り替えで何が変わるか）":
      "Terms and settings (what \"existing\" and \"growth add-ons\" mean, and what the broadcasting scenario, gross margin improvement and margin settings change)",
    "2026年度時点のメディア・コンテンツ事業の全体です。テレビ放送に加え、配信、アニメ、映画、グッズ、イベントなど、いま手がけているコンテンツ事業もすべてここに含みます（2026年度の会社予想：売上4,067億円・営業利益200億円）。2027年度以降は、放送収入の減少に合わせて売上と利益が減っていきます（減り方は下の「放送シナリオ」で選択）。":
      "The whole Media & Content business as of FY3/2027. Besides TV broadcasting, it includes all current content businesses such as streaming, anime, film, merchandise and events (company forecast for FY3/2027: revenue ¥406.7bn, operating profit ¥20bn). From FY3/2028, revenue and profit fall in line with the decline in broadcasting revenue (choose the rate under \"Broadcasting scenario\" below).",
    "上積み（+IP開発・+制作・配給・+IP多角）": "Growth add-ons (+IP dev. · +Prod. & dist. · +IP multi-use)",
    "会社が2030年度に目指すメディア・コンテンツの営業利益350億円（Group Vision 2026-2030）と、2026年度予想200億円との":
      "The gap between the company's Media & Content operating profit target of ¥35bn for FY3/2031 (Group Vision 2026-2030) and the FY3/2027 forecast of ¥20bn —",
    "差の150億円": "¥15bn",
    "を、本試算で「上積み」として置いたものです。会社は2030年度の目標値だけを示しており、途中の年度の計画や、この150億円の内訳は開示していません。会社はこの成長を「IP開発・獲得」「制作・ディストリビューション」「IP多角展開」の3つで生むとしているため、150億円を会社の区分別目標の比率（50：100：70）で3つに分け、2027〜2030年度に毎年同じ額ずつ積み上がると仮定しました（放送の収益改善は2026年度までに実現済みとみなした配分です。ただし今期上期の放送の粗利益率は26.2%で、会社の出発点26%とほぼ同じため、この見方は確かではありません）。売上は「利益÷想定利益率」で逆算しています。":
      "— is set as the \"growth add-ons\" in these estimates. The company has given only the FY3/2031 target, not plans for the years in between or a breakdown of this ¥15bn. Because it says the growth will come from \"IP development & acquisition\", \"production & distribution\" and \"IP multi-use\", the ¥15bn is split three ways in the ratio of the company's category targets (50:100:70) and assumed to build up by equal amounts each year over FY3/2028–FY3/2031 (this treats the improvement in broadcasting earnings as already achieved by FY3/2027; however, this half's broadcast gross margin of 26.2% is almost the same as the company's starting point of 26%, so this reading is uncertain). Revenue is worked back as profit ÷ assumed margin.",
    "プルダウンの選択肢": "Drop-down options",
    "設定": "Setting",
    "選択肢": "Options",
    "何が変わるか": "What changes",
    "現状維持／トレンド／悲観": "Status quo / Trend / Pessimistic",
    "放送収入（2026年度1,300億円）の毎年の変化率と、減った売上のうち利益を削る割合。現状維持＝0%・0%、トレンド＝年−4.9%・50%（過去9年の平均）、悲観＝年−7.4%・100%（直近2年の平均）。":
      "The annual rate of change in broadcasting revenue (¥130bn in FY3/2027) and the share of lost revenue that cuts profit. Status quo = 0%, 0%; Trend = −4.9%/yr, 50% (average of the past 9 years); Pessimistic = −7.4%/yr, 100% (average of the latest 2 years).",
    "なし／あり：目標の内訳／あり：上振れ": "None / Yes: within target / Yes: on top of target",
    "ありでは、放送の粗利益率が26.2%（2026年度上期）から2030年度35%（Group Visionの想定）まで上がり、その年の放送収入×上がり幅を既存の利益に足す。":
      "With improvement, the broadcast gross margin rises from 26.2% (first half of FY3/2027) to 35% in FY3/2031 (Group Vision's assumption), and that year's broadcasting revenue × the rise is added to existing profit.",
    "目標の内訳": "Within target",
    "＝改善は会社目標350億円に含まれるとみなし、改善した分だけ上積みを減らす。全体の利益は粗利率が改善しない場合と同じで、変わるのは既存と上積みの内訳（上積みに必要な売上が小さくなる）。":
      "= the improvement is treated as part of the company's ¥35bn target, so the growth add-ons shrink by the same amount. Total profit is the same as without improvement; only the split between existing and add-ons changes (the add-ons need less revenue).",
    "上振れ": "On top of target",
    "＝上積みとは別に足す（350億円を超えうる）。": "= added on top of the growth add-ons (can exceed ¥35bn).",
    "横ばい／年+5%／年−5%": "Flat / +5%/yr / −5%/yr",
    "2030年度に積み上がった上積みの利益が、2031年度以降に毎年どう動くか。追加の投資は見込んでいない。": "How the growth add-on profit built up by FY3/2031 moves each year from FY3/2032. No additional investment is assumed.",
    "保守／標準／楽観": "Conservative / Standard / Optimistic",
    "上積みの利益を稼ぐのに必要な売上を逆算するときの利益率。IP開発・獲得40／50／60%、制作・配給12／15／18%、IP多角展開8／10／15%。":
      "The margin used to work back the revenue needed to earn the growth add-on profit: IP development & acquisition 40/50/60%, production & distribution 12/15/18%, IP multi-use 8/10/15%.",
    "変わるのは売上（マリメッコの横幅）だけ": "Only revenue (the Marimekko width) changes",
    "で、利益とタブ②のお金の流れは変わらない。": "; profit and the cash flows in tab ② do not.",
    "※ 粗利率の26.2%・35%は「放送・メディア」全体（配信などを含む）の値で、本試算では放送収入に当てはめています。": "* The 26.2% and 35% gross margins are for \"broadcasting & media\" as a whole (including streaming etc.); these estimates apply them to broadcasting revenue.",
    "※ 2026年度までにすでに稼いでいる分は「既存」に入っており、「上積み」には含めません（二重に数えないため）。上積みの3列は「新しく始める事業」ではなく、いまある事業も含めた":
      "* What is already earned by FY3/2027 is in \"existing\" and not in the growth add-ons (to avoid double counting). The three add-on columns are not \"new businesses\" but",
    "2026年度からの伸びしろ": "the room to grow from FY3/2027",
    "を表します。": ", including today's businesses.",
    "売上の積み上げ（億円）": "Revenue stack (¥bn)",
    "営業利益の積み上げ（億円）": "Operating profit stack (¥bn)",
    "事業別 営業利益の推移（選んだシナリオ）": "Operating profit by segment over time (selected scenario)",
    "事業別の営業利益を年度ごとに積み上げ（赤字は0より下）。◆と数字は全体の合計（調整前、その他を含む）、濃く表示した棒が表示中の年度。2030年度の破線は Group Vision のメディア・コンテンツ目標350億円で、比べる値は赤い横線の「メディア・コンテンツ計」（既存＋上積み3区分。2030年度は325億円）です。Group Visionは2030年度の目標値だけを示し、途中の年度の計画や放送収入の前提は開示していません（数値目標の全体像は外部資本導入の確定後に公表予定）。本試算で350億円に届くのは、既存の利益が2026年度の水準を保つ場合です。「粗利率改善あり：上振れ」で350億円に届くのに必要な2030年度の放送の粗利益率は、トレンド（年−4.9%、減収の50%が利益を削る）で約37%、悲観（年−7.4%、減収の全額が利益を削る）で約62%です（会社の想定は35%）。":
      "Operating profit by segment, stacked by year (losses below 0). ◆ and its figure are the overall total (before adjustments, including Other); darker bars are the selected year. The dashed line in FY3/2031 is Group Vision's Media & Content target of ¥35bn; compare it with the red bar \"Media & Content total\" (existing + 3 growth add-ons; ¥32.5bn in FY3/2031). Group Vision gives only the FY3/2031 target, with no plans for the years in between or assumptions for broadcasting revenue (the full set of numerical targets is to be published once the outside capital deal is settled). In these estimates, ¥35bn is reached only if existing profit holds at its FY3/2027 level. With \"Gross margin improvement: Yes, on top of target\", reaching ¥35bn requires a FY3/2031 broadcast gross margin of about 37% under Trend (−4.9%/yr, 50% of lost revenue cuts profit) and about 62% under Pessimistic (−7.4%/yr, all lost revenue cuts profit); the company assumes 35%.",
    "表で見る（表示中の年度・シナリオ）": "View as table (selected year and scenario)",
    "事業": "Segment",
    "売上（億円）": "Revenue (¥bn)",
    "営業利益（億円）": "Operating profit (¥bn)",
    "利益率": "Margin",
    "根拠": "Basis",
    "うちメディア・コンテンツ計": "of which Media & Content total",
    "Group Vision目標（メディア・コンテンツ計）": "Group Vision target (Media & Content total)",
    "売上：横軸の長さ": "Revenue: width",
    "売上（億円）・列の幅": "Revenue (¥bn) = column width",
    "売上に占める割合": "Share of revenue",
    "メディア・コンテンツ計（目標と比べる値）": "Media & Content total (compare with target)",
    "Group Vision目標（メディア・コンテンツ計 350）": "Group Vision target (Media & Content total ¥35bn)",
    "営業利益（億円）": "Operating profit (¥bn)",
    "会社予想 ": "Company forecast",
    "試算（2027年度〜 都市開発・観光は売却で0）": "Estimate (from FY3/2028; Urban Development, Hotels & Resorts = 0 after sale)",
    "目標350": "Target 35",
    "新規事業の区分は2027年度から": "New business categories start in FY3/2028",
    "2026/11/6 決算説明資料 p.36（会社予想。2026-11-13 原本照合済み、修正な": "Earnings presentation Nov 6, 2026, p.36 (company forecast; checked against source Nov 13, 2026, no correc",
    "2026年度の新規事業は既存メディアの列に含める": "New businesses in FY3/2027 are included in the existing media column",
    "2026→2030年度の残り150億円を50:100:70で配分、直線で立ち上げ、以降は年変化率": "Remaining ¥15bn from FY3/2027→FY3/2031 split 50:100:70, built up linearly, then annual rate of change",
    "2026年度末に売却完了の仮定": "Sale assumed completed at end of FY3/2027",
    "2026年度予想で横ばい": "Flat at the FY3/2027 forecast",

    // タブ②
    "期首の現金": "Opening cash",
    "期首の現金（期間の最初）": "Opening cash (start of period)",
    "前年までの累計不足": "Cumulative shortfall to prior year",
    "前年からの繰越": "Carried from prior year",
    "最初の年度の期首": "Start of first year",
    "この年の営業CF": "Operating CF this year",
    "営業CF（期間合計）": "Operating CF (period total)",
    "営業CF−投資−株主還元−税等": "Operating CF − investment − shareholder returns − taxes etc.",
    "足りない分を借入・資産売却・手元資金で補う": "Shortfall covered by borrowing, asset sales or cash on hand",
    "営業CFで賄えている": "Covered by operating CF",
    "期末の累計不足": "Cumulative shortfall at year-end",
    "期末の現金": "Closing cash",
    "期末の現金（期間の最後）": "Closing cash (end of period)",
    "前年からの繰越・営業CF・借入の調達・資産の売却・売却代金・不足（累計）": "Carried from prior year · operating CF · borrowing · asset sales · sale proceeds · shortfall (cumulative)",
    "期間に動くお金（入り＝出）": "Cash moving in the period (in = out)",
    "設備投資・成長投資・借入の返済・株主還元・税金・翌年への繰越": "Capex · growth investment · loan repayment · shareholder returns · taxes · carried to next year",
    "入り／出": "In / Out",
    "項目": "Item",
    "金額（億円）": "Amount (¥bn)",
    "内容": "Details",
    "フジ・メディアHD連結の現金の入りと出です（2017〜2025年度は有価証券報告書の連結キャッシュ・フロー計算書の実績、2026年度以降は試算）。左が入ってくるお金、右が出ていくお金で、帯の太さが金額です。左上に前年から持ち越した現金、右下に翌年へ持ち越す現金が出ます。▶ 再生で2017年度から進めると、不動産（都市開発・観光）の営業CFと設備投資が2026年度末の売却で消え、売却代金で一度ふくらんだ現金が、配当・成長投資・税金で減っていく様子を追えます。2026年度以降の営業CFは税引前で、法人税等と全社費用を別に出しています。現金が尽きた年からは左に「不足（累計）」が現れます。帯の太さの縮尺は、選んだシナリオ・売却額・配当の中で全年度共通です。":
      "Cash in and out for Fuji Media HD on a consolidated basis (FY3/2018–FY3/2026: actuals from the consolidated cash flow statements in the Annual Securities Reports; from FY3/2027: estimates). Cash coming in is on the left and cash going out on the right; band thickness shows the amount. Cash carried from the prior year appears top left, and cash carried to the next year bottom right. Press ▶ Play from FY3/2018 to see real estate's (Urban Development, Hotels & Resorts) operating CF and capex disappear with the sale at the end of FY3/2027, and the cash that swells with the sale proceeds shrink through dividends, growth investment and taxes. From FY3/2027, operating CF is pre-tax, with income taxes and corporate expenses shown separately. From the year cash runs out, \"Shortfall (cumulative)\" appears on the left. Band thickness uses one scale for all years within the selected scenario, sale proceeds and dividend.",
    "このグラフの前提と注意（プルダウンの選択肢、実績の内訳の推定、売却時の扱い、営業キャッシュフローの近似、含めていないもの）":
      "Assumptions and caveats for this chart (drop-down options, how actuals are split, treatment of the sale, the operating cash flow approximation, and what is excluded)",
    "表示": "View",
    "年度ごと／期間の合計（実績9年・2026〜2030年度・2031〜2036年度）": "By year / period total (9 actual years, FY3/2027–FY3/2031, FY3/2032–FY3/2037)",
    "年度ごとは上の年度ボタンと連動する1年分の流れ。期間の合計は、その期間の流れを足し上げ、最初の年の期首と最後の年の期末の現金だけを残す。":
      "By year shows one year's flows, linked to the year buttons above. A period total adds up the flows over the period, keeping only opening cash of the first year and closing cash of the last.",
    "2,000／3,500／5,000億円": "¥200bn / ¥350bn / ¥500bn",
    "2026年度末に親会社が受け取る株式の売却代金（税引前。連結のキャッシュフローの純額ではない）。売却額・手法・時期は未定のため3通りで示す【仮定】。3,500億円は、比べるための目安として置いた3つの値の真ん中の値で、報道された提案額をそのまま当てはめたものではない。売却にかかる税は167億円の仮置きで、どの額でも同じ額を差し引く（実際は売却額が大きいほど税も増えるのが普通）。2026年度以降の現金がこの額の分だけ上下する。":
      "Proceeds from the share sale received by the parent at the end of FY3/2027 (pre-tax; not the net consolidated cash flow). The amount, method and timing are undecided, so three cases are shown [assumption]. ¥350bn is simply the middle of three reference values, not a reported offer applied as is. Tax on the sale is a placeholder of ¥16.7bn, deducted equally in every case (in practice a larger sale usually means more tax). Cash from FY3/2027 onward moves up or down by this amount.",
    "100円／50円": "¥100 / ¥50",
    "1株あたりの年間配当（年145.4億円／72.7億円）。2026・2027年度は会社見込みの200円（年290.8億円）で固定【仮定】。中間・期末を半分ずつ払うとし、前年度の期末配当は翌年度に払うため、2028年度の支払いは移行の途中の額になる（100円なら218.1億円）。":
      "Annual dividend per share (¥14.54bn / ¥7.27bn a year). FY3/2027 and FY3/2028 are fixed at the company outlook of ¥200 (¥29.08bn a year) [assumption]. Interim and year-end are each paid as half, and the prior year's year-end dividend is paid the following year, so FY3/2029 payments are a transition amount (¥21.81bn at ¥100).",
    "不動産に寄せる／売上比": "Allocate to real estate / By revenue share",
    "2017〜2025年度の営業CFを事業別に分ける方法。": "How operating CF for FY3/2018–FY3/2026 is split by segment.",
    "＝営業CFの「棚卸資産の増減」を全額、都市開発・観光に配る。": "= all of the \"change in inventories\" in operating CF goes to Urban Development, Hotels & Resorts.",
    "＝残りをすべて売上比で配る。連結の合計と2026年度以降の試算は変わらない。2026年度以降の年度では選べない。": "= the whole remainder is split by revenue share. The consolidated total and the estimates from FY3/2027 do not change. Not selectable for FY3/2027 onward.",
    "※ 上段の放送シナリオ・粗利率改善・上積み2031年度以降はタブ①と共通です（2026年度以降の営業CFが変わります）。「粗利率改善あり：目標の内訳」は全体の利益が粗利率の改善しない場合と同じため、このタブのお金の流れも同じになります。上積みの利益率は、このタブには影響しません。":
      "* The broadcasting scenario, gross margin improvement and growth add-ons from FY3/2032 above are shared with tab ① (they change operating CF from FY3/2027). \"Gross margin improvement: Yes, within target\" gives the same total profit as no improvement, so the cash flows in this tab are also the same. Growth add-on margins do not affect this tab.",
    "実績（2017〜2025年度）": "Actuals (FY3/2018–FY3/2026)",
    "有価証券報告書（2018年3月期〜2026年3月期）のXBRLから連結キャッシュ・フロー計算書を読み、期首現金＋営業・投資・財務CF＋換算差額等＝期末現金を全年度で確認しています（確定。訂正版の有報でCFの数字は変わりません）。有価証券・定期預金・投資有価証券は取得と売却を相殺した純額（期間合計でも相殺）、長期借入・社債は調達と返済を分けた総額、短期借入は開示どおりの純増減です。為替換算差額・連結範囲の変更・その他は「その他」にまとめています（確定、残差を含む）。":
      "The consolidated cash flow statements are read from the XBRL of the Annual Securities Reports (FY3/2018–FY3/2026), checking for every year that opening cash + operating, investing and financing CF + translation differences etc. = closing cash (confirmed; the amended reports do not change the CF figures). Securities, time deposits and investment securities are shown net of purchases and sales (also netted in period totals); long-term borrowings and bonds are shown gross, with borrowing and repayment separate; short-term borrowings are the net change as disclosed. FX translation differences, changes in scope and other items are grouped as \"Other\" (confirmed, incl. residual).",
    "営業CFと設備投資の事業別の内訳は推定です": "The segment split of operating CF and capex is inferred",
    "会社は連結の合計しか開示していません。営業CFは、事業ごとのEBITDA（セグメント利益＋減価償却費）に、残り（税金・運転資金・調整額など）を配分して分けました。「不動産に寄せる」（既定）は、残りのうち営業CFの「棚卸資産の増減額」（9年で+1,289億円。仕入や販売の純額で、番組勘定なども含む）を全額、都市開発・観光に配り、その他を売上の比で配分します。不動産は、固定資産として取得した物件を販売用に振り替えて売るため、設備投資の一部が営業CFで回収されます。ただし棚卸資産には番組勘定なども含まれるため、全額を不動産に配るのは一つの置き方にすぎず、2つの方法が真の値をはさむわけでもありません。「売上比」は残り全額を売上比で配分します。設備投資は、連結の固定資産の取得額をセグメント情報の設備投資額の比で分けました（その他事業はメディアに合算）【推定】。":
      "The company discloses only consolidated totals. Operating CF is split into each segment's EBITDA (segment profit + depreciation) plus an allocation of the remainder (taxes, working capital, adjustments etc.). \"Allocate to real estate\" (default) gives all of the remainder's \"change in inventories\" in operating CF (+¥128.9bn over 9 years; the net of purchases and sales, also including programme inventory) to Urban Development, Hotels & Resorts, and splits the rest by revenue. Real estate reclassifies properties acquired as fixed assets to inventory for sale, so part of its capex is recovered through operating CF. But since inventories also include programme inventory, giving all of it to real estate is just one way to allocate, and the two methods do not bracket the true value. \"By revenue share\" splits the whole remainder by revenue. Capex is consolidated purchases of fixed assets split by the segment capex ratio in the segment information (Other is combined with Media) [inferred].",
    "2026年度（売却の年）": "FY3/2027 (year of the sale)",
    "会社の表現は「都市開発・観光事業への外部資本の導入（オフバランス）」で、手法・時期・規模は未定です。本試算では全株売却・2026年度末完了と置いています【仮定】。期首の現金は2026年3月末の実績1,289億円です（確定。運転資金として必要な分も含みます）。都市開発・観光の設備投資1,010億円（会社計画、2026/11/6 決算説明資料 p.37）は同事業の借入で賄い、その借入は売却で連結から外れるとしました【仮定】。売却代金は、親会社が受け取る株式の売却代金（税引前）です。連結の現金はこの代金から、対象会社が持っていた現金を引いた分だけ増えます。売却で外れる不動産側の現金は、子会社の現金預金377億円×都市開発・観光の資産比58.3%≒219億円に、不動産が2026年度に稼いだ営業CF（税引後243億円）を加えた額としました【推定】。会社別の現金は開示がないため根拠は弱く、この額の誤差はそのまま期末の現金の誤差になります。親会社がグループ会社から預かっている資金（1,023億円）の精算は含めていません。売却にかかる税は、会社が2026年3月期に計上した繰延税金負債167億円で仮に置きました【仮置き】。売却額による税額ではありません。2026年3月末の未払法人税等194億円（確定）は、2026年度に払うとしました【仮定】。":
      "The company describes this as \"bringing outside capital into the Urban Development, Hotels & Resorts business (off-balance sheet)\"; the method, timing and size are undecided. These estimates assume a sale of all shares completed at the end of FY3/2027 [assumption]. Opening cash is the actual ¥128.9bn at end-March 2026 (confirmed; includes cash needed as working capital). Urban Development, Hotels & Resorts capex of ¥101bn (company plan, earnings presentation Nov 6, 2026, p.37) is funded by that business's borrowing, which leaves the consolidation with the sale [assumption]. Sale proceeds are the proceeds from the share sale received by the parent (pre-tax). Consolidated cash rises by those proceeds less the cash held by the company sold. Real-estate-side cash leaving with the sale is taken as subsidiaries' cash and deposits of ¥37.7bn × Urban Development, Hotels & Resorts' share of assets of 58.3% ≈ ¥21.9bn, plus operating CF earned by real estate in FY3/2027 (¥24.3bn after tax) [inferred]. Company-level cash is not disclosed, so the basis is weak, and any error here carries straight into closing cash. Settlement of funds the parent holds for group companies (¥102.3bn) is not included. Tax on the sale is set at the ¥16.7bn deferred tax liability the company booked in FY3/2026 [placeholder]; it is not a tax calculated from the sale amount. Unpaid income taxes of ¥19.4bn at end-March 2026 (confirmed) are assumed paid in FY3/2027 [assumption].",
    "借入の扱い": "Borrowings",
    "親会社の借入は、自社株買いのための短期借入2,300億円（2026/2/9実行、1年以内に返済）と社債200億円（2028年12月償還）です（有価証券報告書2026年3月期 p.127・130）。連結の社債220億円のうち20億円、短期借入2,451億円のうち151億円、長期借入3,481億円は子会社（主に不動産事業とみられる）の借入で、売却で連結から外れるとしています【推定】。短期借入2,300億円の返済期限（2027年2月ごろ）は年度末の売却より先に来るため、実際には借り換えなどのつなぎが必要になる可能性があります。":
      "The parent's borrowings are a ¥230bn short-term loan for share buybacks (drawn Feb 9, 2026, repayable within one year) and ¥20bn of bonds (redeemed Dec 2028) (Annual Securities Report FY3/2026, pp.127, 130). Of consolidated bonds of ¥22bn, ¥2bn; of short-term borrowings of ¥245.1bn, ¥15.1bn; and long-term borrowings of ¥348.1bn are borrowings of subsidiaries (apparently mainly the real estate business) and are assumed to leave the consolidation with the sale [inferred]. The ¥230bn short-term loan falls due (around Feb 2027) before the sale at year-end, so bridging such as refinancing may in practice be needed.",
    "2026年度以降の営業キャッシュフロー": "Operating cash flow from FY3/2027",
    "事業ごとに税引前の営業CF＝営業利益＋減価償却費（メディア・その他90億円／年）とし、別に全社費用33億円／年（2026年度会社予想の調整額）と法人税等＝（事業の営業利益の合計−全社費用）×30.6%を差し引きます。赤字の年は税の戻りを見込みません（繰越欠損金による将来の税の減少も見込みません）。新しく発生した税（事業の税、政策保有株の売却益の税、売却にかかる税）は、半分をその年度、残り半分を翌年度に払うとしました【仮定】。不動産の2026年度の営業CFだけは税引後です（不動産の税は対象会社が払うため）。メディアの設備投資（維持更新）は90億円／年（2026年度会社計画）としました。":
      "Pre-tax operating CF for each segment = operating profit + depreciation (Media & Other ¥9bn/yr); corporate expenses of ¥3.3bn/yr (the adjustment in the FY3/2027 company forecast) and income taxes = (total segment operating profit − corporate expenses) × 30.6% are deducted separately. No tax refund is assumed in loss years (nor future tax savings from loss carryforwards). Newly arising taxes (segment taxes, tax on gains from selling cross-shareholdings, tax on the sale) are paid half in the year and half the following year [assumption]. Only real estate's FY3/2027 operating CF is after tax (its taxes are paid by the company sold). Media capex (maintenance) is ¥9bn/yr (FY3/2027 company plan).",
    "使い道": "Uses of cash",
    "配当は年間1株200円×145,386,849株＝290.8億円（2026・2027年度、会社見込み）、2028年度以降は100円（145.4億円）か50円（72.7億円）【仮定】。中間・期末を半分ずつ払い、前年度の期末配当は翌年度に払うとしました（2028年度の支払いは、2027年度期末100円＋2028年度中間の額）【仮定】。株式数は2026年3月末の発行済株式数−自己株式数で、2026年6月の配当総額（1株100円で14,538百万円）と一致します。成長投資はGroup Visionの5年間1,500億円を2026〜2030年度に均等に支出【仮定】（設備投資計画との重なりは未確認）。政策保有株の売却（残り506億円を2026・2027年度に半分ずつ）には、売却益の割合83%（2025年度実績）×30.6%の税をかけています【推定】。2031年度以降の成長投資は会社の計画がないため含めていません。":
      "Dividends are ¥200 per share a year × 145,386,849 shares = ¥29.08bn (FY3/2027 and FY3/2028, company outlook), then ¥100 (¥14.54bn) or ¥50 (¥7.27bn) from FY3/2029 [assumption]. Interim and year-end are each paid as half, and the prior year's year-end dividend is paid the following year (FY3/2029 payments = FY3/2028 year-end ¥100 + the FY3/2029 interim) [assumption]. Shares are shares issued less treasury shares at end-March 2026, consistent with the total dividend paid in June 2026 (¥14,538m at ¥100 per share). Growth investment is Group Vision's ¥150bn over five years, spent evenly over FY3/2027–FY3/2031 [assumption] (overlap with the capex plan not confirmed). Sales of cross-shareholdings (the remaining ¥50.6bn, half each in FY3/2027 and FY3/2028) are taxed at a gain ratio of 83% (FY3/2026 actual) × 30.6% [inferred]. Growth investment from FY3/2032 is not included, as the company has no plan for it.",
    "※ 含めていないもの：2026年度以降の支払利息・受取利息配当、運転資金の増減、SBIとの合弁会社の損益、追加の自社株買い、成長投資による減価償却や利益の増加（上積み利益とは別に足さない）。現金には日々の運転に必要な分も含まれるため、最低手元資金300億円【仮定】を下回る年度をKPIと下のグラフに示しています。":
      "* Not included: interest paid and interest/dividends received from FY3/2027, changes in working capital, profit or loss of the joint venture with SBI, additional share buybacks, and depreciation or profit increases from growth investment (not added beyond the growth add-on profit). Cash also includes what is needed for day-to-day operations, so years falling below minimum cash of ¥30bn [assumption] are flagged in the KPIs and the chart below.",
    "入ってくるお金（どこから） →": "Cash coming in (from where) →",
    "合計": "Total",
    "（中央の柱・マウスを乗せると金額）": "(centre column; hover for amounts)",
    "→ 出ていくお金（何に使うか）": "→ Cash going out (what for)",
    "表で見る（表示中の期間・シナリオ）": "View as table (selected period and scenario)",
    "事業が生む現金と、投資・株主還元（年度ごと、2017〜2036年度）": "Cash generated by the businesses vs investment and shareholder returns (by year, FY3/2018–FY3/2037)",
    "0より上が営業CF（事業別。2026年度以降は税引前）、下が設備投資・成長投資・株主還元（配当＋自己株式の取得）・税金と全社費用（2026年度以降）。◆は差し引き（＝借入・資産売却・手元資金に頼らずに賄えたかどうか）。濃く表示した棒が表示中の年度です。2017〜2025年度は実績（事業別の内訳は推定）、2026年度以降は試算です。売却代金・借入・有価証券の出し入れは含めていません。":
      "Above 0: operating CF (by segment; pre-tax from FY3/2027). Below: capex, growth investment, shareholder returns (dividends + share buybacks), and taxes & corporate expenses (from FY3/2027). ◆ is the net (whether it was covered without relying on borrowing, asset sales or cash on hand). Darker bars are the selected year. FY3/2018–FY3/2026 are actuals (segment split inferred); from FY3/2027 are estimates. Sale proceeds, borrowing and securities flows are excluded.",
    "年度末の現金（2017〜2036年度）": "Year-end cash (FY3/2018–FY3/2037)",
    "連結の現金及び現金同等物の年度末残高です（2017〜2025年度は実績、2026年度以降は試算）。破線は最低手元資金300億円【仮定】。0を下回った分は、追加の借入や資本が必要な額です。":
      "Consolidated cash and cash equivalents at year-end (FY3/2018–FY3/2026 actual, from FY3/2027 estimated). The dashed line is minimum cash of ¥30bn [assumption]. Any amount below 0 is what would need additional borrowing or capital.",
    "営業CF：メディア・コンテンツ": "Operating CF: Media & Content",
    "営業CF：上積み3区分": "Operating CF: growth add-ons (3)",
    "営業CF：都市開発・観光": "Operating CF: Urban Development, Hotels & Resorts",
    "営業CF：その他": "Operating CF: Other",
    "設備投資：メディア・その他": "Capex: Media & Other",
    "設備投資：都市開発・観光": "Capex: Urban Development, Hotels & Resorts",
    "成長投資": "Growth investment",
    "株主還元（配当＋自己株式）": "Shareholder returns (dividends + buybacks)",
    "税金・全社費用（2026年度以降）": "Taxes & corporate expenses (from FY3/2027)",
    "差し引き（◆）": "Net (◆)",
    "差し引き": "Net",
    "年度末の現金": "Year-end cash",
    "年度（2017〜2036）": "Fiscal year ending March (FY3/2018–FY3/2037)",
    "億円": "¥bn",
    "← 実績｜試算 →": "← Actual | Estimate →",
    "最低手元資金 300": "Minimum cash ¥30bn",
    "期首の現金（前年からの繰越）": "Opening cash (carried from prior year)",
    "借入・社債の調達": "Borrowing & bond issuance",
    "有価証券・定期預金の取り崩し（純額）": "Drawdown of securities & time deposits (net)",
    "その他（入り）": "Other (in)",
    "借入の返済・社債の償還": "Loan repayment & bond redemption",
    "配当": "Dividends",
    "投資有価証券の取得（純額）": "Purchase of investment securities (net)",
    "子会社株式の売却に伴う支出": "Outflow on sale of subsidiary shares",
    "期末の現金（翌年へ繰越）": "Closing cash (carried to next year)",
    "有価証券・定期預金への預け入れ（純額）": "Placement in securities & time deposits (net)",
    "その他（出）": "Other (out)",
    "投資有価証券の売却（政策保有株など、純額）": "Sale of investment securities (cross-shareholdings etc., net)",
    "子会社株式の売却": "Sale of subsidiary shares",
    "自己株式の取得": "Share buybacks",
    "子会社・事業の取得": "Acquisition of subsidiaries & businesses",
    "営業CF：メディア・コンテンツ（現金の持ち出し）": "Operating CF: Media & Content (cash outflow)",
    "営業CF：都市開発・観光（税引後）": "Operating CF: Urban Development, Hotels & Resorts (after tax)",
    "売却代金（税引前・仮定）": "Sale proceeds (pre-tax, assumed)",
    "全社費用（本社費など）": "Corporate expenses (HQ costs etc.)",
    "法人税等の支払い（前年度分の残り）": "Income taxes paid (rest of prior year)",
    "法人税等（当年度分の半分）": "Income taxes (half of current year)",
    "政策保有株の売却益にかかる税金（半分）": "Tax on gains from selling cross-shareholdings (half)",
    "売却にかかる税金（半分）": "Tax on the sale (half)",
    "売却で連結から外れる不動産側の現金": "Real-estate-side cash leaving the consolidation with the sale",
    "成長投資：IP開発・獲得": "Growth investment: IP development & acquisition",
    "成長投資：制作・ディストリビューション": "Growth investment: Production & distribution",
    "成長投資：IP多角展開": "Growth investment: IP multi-use",
    "不足（追加の借入・資本、累計）": "Shortfall (additional borrowing/capital, cumulative)",
    "前年までの不足（累計）": "Shortfall to prior year (cumulative)",
    "使えるお金": "Cash available",
    "なし ": "none",
    "有価証券報告書2026年3月期 連結CF計算書（現金及び現金同等物の期末残高）": "Annual Securities Report FY3/2026, consolidated CF statement (cash and cash equivalents at year-end)",
    "税引前：営業利益＋減価償却費（メディア・その他90）": "Pre-tax: operating profit + depreciation (Media & Other ¥9bn)",
    "224×(1−30.6%)＋87。不動産の税は対象会社が払う。対象会社に残り、売却で連結から外れる": "¥22.4bn × (1−30.6%) + ¥8.7bn. Real estate's taxes are paid by the company sold. Stays with that company and leaves the consolidation with the sale",
    "2027年度までに累計1,000億円超の売却計画のうち未実施分": "Unexecuted part of the plan to sell over ¥100bn cumulatively by FY3/2028",
    "都市開発・観光の設備投資1,010億円を同事業の借入で賄う（2026年9月末までに連結の借入が約756億円増）。借入は売却で連結から外れる": "Urban Development, Hotels & Resorts capex of ¥101bn funded by that business's borrowing (consolidated borrowings up about ¥75.6bn by end-Sep 2026). The borrowing leaves the consolidation with the sale",
    "外部資本の導入（全株売却・2026年度末完了は試算上の仮定）。株式の売却代金で、買い手が引き継ぐ借入と対象会社の現金は精算済み。税は別に差し引く": "Outside capital (sale of all shares completed at end of FY3/2027 is an assumption of these estimates). Share sale proceeds, after settling the borrowing taken over by the buyer and the company's cash. Tax deducted separately",
    "2026年度会社予想の調整額33億円（セグメント計434−連結401）が続くと仮定": "Assumes the ¥3.3bn adjustment in the FY3/2027 company forecast (segment total ¥43.4bn − consolidated ¥40.1bn) continues",
    "2026年3月末の未払法人税等（連結）193.6億円。主に政策保有株の売却益への課税。対象会社の分を含む": "Unpaid income taxes (consolidated) of ¥19.36bn at end-March 2026, mainly tax on gains from selling cross-shareholdings; includes the company sold",
    "（事業の営業利益の合計−全社費用）×30.6%の半分。赤字の年は0（税の戻り・繰越欠損金は見込まない）。残り半分は翌年度": "Half of (total segment operating profit − corporate expenses) × 30.6%. Zero in loss years (no refunds or loss carryforwards assumed). The other half is paid the following year",
    "売却額×売却益の割合83%（2025年度実績）×30.6%の半分。残り半分は翌年度": "Half of sale amount × gain ratio 83% (FY3/2026 actual) × 30.6%. The other half is paid the following year",
    "繰延税金負債16,706百万円（有報2026年3月期）で仮に置いた額の半分。売却額による税額ではない。残り半分は翌年度": "Half of a placeholder set at the deferred tax liability of ¥16,706m (Annual Securities Report FY3/2026). Not a tax calculated from the sale amount. The other half is paid the following year",
    "2026/11/6 決算説明資料 p.37 設備投資計画 101,000百万円": "Earnings presentation Nov 6, 2026, p.37: capex plan ¥101,000m",
    "短期借入2,300億円（自社株買い分、2026/2/9実行、1年以内に返済。期限は売却より先に来る可能性）": "Short-term loan of ¥230bn (for buybacks, drawn Feb 9, 2026, repayable within one year; may fall due before the sale)",
    "子会社の現金預金377億円×都市開発・観光の資産比58.3%＝219億円＋2026年度に稼いだ242億円。会社別の現金は開示がなく根拠は弱い（この額の誤差はそのまま期末現金の誤差になる）。親会社がグループ会社から預かる資金1,023億円の精算は含めない":
      "Subsidiaries' cash and deposits of ¥37.7bn × Urban Development, Hotels & Resorts' share of assets of 58.3% = ¥21.9bn, + ¥24.2bn earned in FY3/2027. Company-level cash is not disclosed, so the basis is weak (any error carries straight into closing cash). Settlement of ¥102.3bn of funds the parent holds for group companies is not included",
    "前年度の期末配当100円＋当年度の中間配当100円（年間200円を中間・期末で半分ずつと仮定）×145,386,849株": "(Prior year-end dividend ¥100 + current interim ¥100; ¥200 a year assumed paid half at interim, half at year-end) × 145,386,849 shares",
    "前年度の期末配当100円＋当年度の中間配当50円（年間100円を中間・期末で半分ずつと仮定）×145,386,849株": "(Prior year-end dividend ¥100 + current interim ¥50; ¥100 a year assumed paid half at interim, half at year-end) × 145,386,849 shares",
    "前年度の期末配当50円＋当年度の中間配当50円（年間100円を中間・期末で半分ずつと仮定）×145,386,849株": "(Prior year-end dividend ¥50 + current interim ¥50; ¥100 a year assumed paid half at interim, half at year-end) × 145,386,849 shares",
    "前年度の期末配当100円＋当年度の中間配当25円（年間50円を中間・期末で半分ずつと仮定）×145,386,849株": "(Prior year-end dividend ¥100 + current interim ¥25; ¥50 a year assumed paid half at interim, half at year-end) × 145,386,849 shares",
    "前年度の期末配当25円＋当年度の中間配当25円（年間50円を中間・期末で半分ずつと仮定）×145,386,849株": "(Prior year-end dividend ¥25 + current interim ¥25; ¥50 a year assumed paid half at interim, half at year-end) × 145,386,849 shares",
    "Group Vision 5年間1,500億円以上を均等に支出（設備投資計画との重なりは未確認）": "Group Vision: ¥150bn or more over five years, spent evenly (overlap with the capex plan not confirmed)",
    "維持更新投資90億円（2026年度会社計画 設備投資1,100−不動産1,010）が続くと仮定": "Assumes maintenance capex of ¥9bn continues (FY3/2027 company plan: capex ¥110bn − real estate ¥101bn)",
    "期首＋入り−出": "Opening + in − out",
    "前年度末の現金": "Cash at end of prior year",
    "期末時点の累計不足": "Cumulative shortfall at year-end",
    "前年度に発生した税の残り半分": "Remaining half of tax arising in the prior year",
    "前年度末までに不足した額": "Shortfall up to end of prior year",
    "第7回無担保社債 2028年12月償還": "7th unsecured bonds, redeemed Dec 2028",
    "税引前の営業CFがマイナス": "Pre-tax operating CF is negative",

    // タブ③
    "試算の前提（fuji_assumptions_v1.9.csv）": "Assumptions used in the estimates (fuji_assumptions_v1.9.csv)",
    "ラベルの意味：確定＝開示資料の値、会社予想・会社目標＝会社が公表した計画値、仮定＝本試算で置いた値、推定＝開示から推し量った値。": "Labels: Confirmed = figure from disclosures; Company forecast / target = figures the company has published; Assumption = values set for these estimates; Inferred = values inferred from disclosures.",
    "区分": "Category",
    "値": "Value",
    "単位": "Unit",
    "根拠・出典": "Basis / source",
    "出典と注記": "Sources and notes",
    "出典：実績＝フジ・メディアHD 有価証券報告書（セグメント情報。売上はセグメント間取引を含む。2017年度は新区分の遡及値）、民放5局_開示値DB_Codex（facts_long_v1.8／segment_profit_assets_v1.961）。2026年度＝2026/11/6 決算説明資料の会社予想。":
      "Sources: Actuals = Fuji Media HD Annual Securities Reports (segment information; revenue includes inter-segment transactions; FY3/2018 restated to the new segments), and the five-broadcaster disclosure database (facts_long_v1.8 / segment_profit_assets_v1.961). FY3/2027 = company forecast in the earnings presentation of Nov 6, 2026.",
    "試算の主な仮定：都市開発・観光は2026年度末に外部資本の導入で全株を売却し連結から外れる（会社は手法・時期・規模を未定としており、全株売却・2026年度末完了は試算上の仮定）／既存メディアは放送収入1,300億円が年0%・−4.9%・−7.4%で変化し、減収の0%・50%・100%が利益を削る。粗利率改善ありでは、これに放送収入×（粗利率−26.2%）を足す（目標の内訳では上積みをその分減らす）／上積みは2030年度目標350億円−2026年度予想200億円＝150億円を、Group Visionの区分別増分（IP開発50・制作100〈放送を除く〉・多角70）の比で配分して直線で立ち上げ、売上＝利益÷利益率。Group Visionの3区分は放送を含むメディア・コンテンツ全体の区分で、増分は2025年度起点（スライド05・06）／その他は2026年度予想で横ばい。調整額は含めない。":
      "Main assumptions: Urban Development, Hotels & Resorts sells all its shares through outside capital at the end of FY3/2027 and leaves the consolidation (the company has not decided the method, timing or size; a full sale completed at the end of FY3/2027 is an assumption of these estimates) / For existing media, broadcasting revenue of ¥130bn changes by 0%, −4.9% or −7.4% a year, and 0%, 50% or 100% of lost revenue cuts profit. With gross margin improvement, broadcasting revenue × (gross margin − 26.2%) is added (\"within target\" reduces the growth add-ons by that amount) / The growth add-ons: FY3/2031 target ¥35bn − FY3/2027 forecast ¥20bn = ¥15bn, split by Group Vision's category increments (IP development 50, production 100 [excl. broadcasting], multi-use 70) and built up linearly; revenue = profit ÷ margin. Group Vision's three categories cover all of Media & Content including broadcasting, with increments starting from FY3/2026 (slides 05, 06) / Other is flat at the FY3/2027 forecast. Adjustments are not included.",
    "データ：fuji_marimekko_db_v1.9.csv（タブ①）、fuji_sankey_db_v1.9.csv（タブ②）、前提：fuji_assumptions_v1.9.csv。放送の粗利益率：2026年度上期26.2%（2026/11/6 決算説明資料 p.23）、2030年度35%（Group Vision p.19「2030年度（想定）」）。2026年度の会社予想は原本照合済み（2026-11-13、修正なし）。作成：Claude（Anthropic Claude Opus 5.5 / Claude Cowork）2026-11-13":
      "Data: fuji_marimekko_db_v1.9.csv (tab ①), fuji_sankey_db_v1.9.csv (tab ②); assumptions: fuji_assumptions_v1.9.csv. Broadcast gross margin: 26.2% in the first half of FY3/2027 (earnings presentation Nov 6, 2026, p.23), 35% in FY3/2031 (Group Vision p.19, \"FY2030 (assumed)\" [= FY3/2031]). The FY3/2027 company forecast has been checked against the source (Nov 13, 2026, no corrections). Prepared by: Claude (Anthropic Claude Opus 5.5 / Claude Cowork) Nov 13, 2026",
    "BROADCASTER FINANCIALS「フジ・メディアHD 事業別の収益とキャッシュフロー――実績と試算（2017〜2036年度）」": "BROADCASTER FINANCIALS \"Fuji Media Holdings: Segment Earnings and Cash Flow — Actuals and Projections (FY3/2018–FY3/2037)\"",
    "企画・分析・データ設計：Naohisa Hashimoto（Media Architect）": "Concept, analysis and data design: Naohisa Hashimoto (Media Architect)",
    "事業別の売上と営業利益率のマリメッコ": "Marimekko of revenue and operating margin by segment",
    "事業別の売上の積み上げ": "Revenue stack by segment",
    "事業別の営業利益の積み上げ": "Operating profit stack by segment",
    "営業利益の推移": "Operating profit over time",
    "お金の入りと出のサンキーダイアグラム": "Sankey diagram of cash in and out",
    "営業CFと投資・株主還元の推移": "Operating CF vs investment and shareholder returns over time",
    "年度末の現金の推移": "Year-end cash over time",

    // ASSUME（区分・項目・根拠）
    "共通": "General",
    "年度の定義": "Fiscal year definition",
    "2026年度＝2027年3月期": "FY2026 = FY3/2027 (year ending March 2027)",
    "引き継ぎメモ3章": "Handover memo, ch. 3",
    "対象": "Scope",
    "メディア・コンテンツ／都市開発・観光／その他の各セグメント（セグメント間取引を含む売上・セグメント利益）。調整額は含めない": "Media & Content / Urban Development, Hotels & Resorts / Other segments (revenue incl. inter-segment transactions, and segment profit). Adjustments not included",
    "有報セグメント情報": "Annual Securities Report, segment information",
    "実績年度": "Actual years",
    "2017〜2025年度（2018年3月期〜2026年3月期）": "FY3/2018–FY3/2026",
    "現行セグメント区分の初年度が2018年3月期（遡及修正値）": "The first year of the current segments is FY3/2018 (restated)",
    "メディア・コンテンツ 売上 2026年度": "Media & Content revenue FY3/2027",
    "2026/11/6 決算説明資料 p.36（2026-11-13 原本照合済み。修正なし）": "Earnings presentation Nov 6, 2026, p.36 (checked against source Nov 13, 2026; no corrections)",
    "メディア・コンテンツ 営業利益 2026年度": "Media & Content operating profit FY3/2027",
    "同上（上期実績126億円 p.10。試算の起点に採用）": "Same as above (first-half actual ¥12.6bn, p.10; used as the starting point)",
    "都市開発・観光 売上 2026年度": "Urban Development, Hotels & Resorts revenue FY3/2027",
    "同上": "Same as above",
    "都市開発・観光 営業利益 2026年度": "Urban Development, Hotels & Resorts operating profit FY3/2027",
    "その他 売上 2026年度": "Other revenue FY3/2027",
    "その他 営業利益 2026年度": "Other operating profit FY3/2027",
    "放送": "Broadcasting",
    "フジテレビ放送収入 2026年度": "Fuji TV broadcasting revenue FY3/2027",
    "2026/11/6 決算説明資料 p.35": "Earnings presentation Nov 6, 2026, p.35",
    "放送収入の年変化率（現状維持）": "Annual change in broadcasting revenue (status quo)",
    "放送収入の年変化率（トレンド）": "Annual change in broadcasting revenue (trend)",
    "事件前9年（15/3→24/3）の年平均": "Annual average over the 9 years before the incident (FY3/2015→FY3/2024)",
    "放送収入の年変化率（悲観）": "Annual change in broadcasting revenue (pessimistic)",
    "直近2年（22/3→24/3）の年平均": "Annual average over the latest 2 years (FY3/2022→FY3/2024)",
    "減収が利益を削る割合（現状維持）": "Share of lost revenue that cuts profit (status quo)",
    "減収が利益を削る割合（トレンド）": "Share of lost revenue that cuts profit (trend)",
    "減収が利益を削る割合（悲観）": "Share of lost revenue that cuts profit (pessimistic)",
    "既存メディアの売上": "Existing media revenue",
    "2026年度予想4067億円から放送収入の減少額をそのまま差し引く。放送以外は横ばい": "Deduct the fall in broadcasting revenue directly from the FY3/2027 forecast of ¥406.7bn. Non-broadcasting is flat",
    "本試算で設定": "Set for these estimates",
    "上積み": "Growth add-ons",
    "IP開発・獲得 2025→2030年度の利益増分": "IP development & acquisition: profit increase FY3/2026→FY3/2031",
    "Group Vision スライド06（2025年度−308億円起点の増分）": "Group Vision slide 06 (increase from FY3/2026 −¥30.8bn)",
    "制作・ディストリビューション 2025→2030年度の利益増分（放送を除く）": "Production & distribution: profit increase FY3/2026→FY3/2031 (excl. broadcasting)",
    "スライド06の+540億円（テレビ放送の収益改善+440億円を含む）−440": "Slide 06's +¥54bn (incl. +¥44bn improvement in TV broadcasting earnings) − ¥44bn",
    "IP多角展開 2025→2030年度の利益増分": "IP multi-use: profit increase FY3/2026→FY3/2031",
    "Group Vision スライド06": "Group Vision slide 06",
    "2027〜2030年度の上積み": "Growth add-ons FY3/2028–FY3/2031",
    "2030年度目標350億円−2026年度予想200億円＝150億円を50:100:70で配分（IP 34.1／制作 68.2／多角 47.7億円）。2026年度の0から直線で立ち上げ": "FY3/2031 target ¥35bn − FY3/2027 forecast ¥20bn = ¥15bn split 50:100:70 (IP ¥3.41bn / production ¥6.82bn / multi-use ¥4.77bn). Built up linearly from 0 in FY3/2027",
    "放送の改善（+440億円）は2026年度予想までに実現済みと仮定（引き継ぎメモ結論2）。ただし上期の放送・メディア粗利益率26.2%は出発点26%とほぼ同じで、この仮定は不確か。区分別の実現状況・途中年度の計画は非開示": "The broadcasting improvement (+¥44bn) is assumed achieved by the FY3/2027 forecast (handover memo, conclusion 2). However, the first-half broadcasting & media gross margin of 26.2% is almost the same as the 26% starting point, so this assumption is uncertain. Progress by category and plans for the years in between are not disclosed",
    "2031年度以降の利益の年変化率（横ばい）": "Annual change in profit from FY3/2032 (flat)",
    "2031年度以降の利益の年変化率（年+5%）": "Annual change in profit from FY3/2032 (+5%/yr)",
    "2031年度以降の利益の年変化率（年−5%）": "Annual change in profit from FY3/2032 (−5%/yr)",
    "営業利益率 IP開発・獲得（保守／標準／楽観）": "Operating margin, IP development & acquisition (conservative / standard / optimistic)",
    "東映アニメ版権54.6%、テレ東ライツ40.5%": "Toei Animation licensing 54.6%, TV Tokyo rights 40.5%",
    "営業利益率 制作・ディストリビューション（保守／標準／楽観）": "Operating margin, production & distribution (conservative / standard / optimistic)",
    "ITV Studios 13.9%、テレ東アニメ・配信12.6%、東映アニメ映像28.1%": "ITV Studios 13.9%, TV Tokyo anime & streaming 12.6%, Toei Animation film/TV 28.1%",
    "営業利益率 IP多角展開（保守／標準／楽観）": "Operating margin, IP multi-use (conservative / standard / optimistic)",
    "東映アニメ商品販売9.3%、その他5.6%": "Toei Animation merchandise 9.3%, other 5.6%",
    "上積み分の売上": "Revenue of the growth add-ons",
    "営業利益÷営業利益率": "Operating profit ÷ operating margin",
    "3区分の位置づけ": "What the three categories cover",
    "3区分はメディア・コンテンツ全体（放送を含む）の区分。2026年度の200億円は3区分すべての合計で、内訳は非開示。グラフの上積み列は2026年度以降の増分のみ": "The three categories cover all of Media & Content (incl. broadcasting). The FY3/2027 ¥20bn is the total of all three, with no breakdown disclosed. The add-on columns in the chart show only the increase from FY3/2027",
    "Group Vision スライド05・06（2026-11-13 目視）": "Group Vision slides 05, 06 (checked visually Nov 13, 2026)",
    "不動産": "Real estate",
    "都市開発・観光の外部資本の導入": "Outside capital for Urban Development, Hotels & Resorts",
    "2026年度末に全株売却で完了。2027年度以降は売上・利益とも0": "Completed by a sale of all shares at the end of FY3/2027. Revenue and profit are 0 from FY3/2028",
    "会社は手法・時期・規模を未定としている（有報2026年3月期 経営方針、11/6資料）": "The company has not decided the method, timing or size (Annual Securities Report FY3/2026 management policy; Nov 6 materials)",
    "その他事業": "Other businesses",
    "2027年度以降も2026年度予想（255億円・10億円）で横ばい": "Flat at the FY3/2027 forecast (¥25.5bn, ¥1bn) from FY3/2028",
    "放送粗利率": "Broadcast gross margin",
    "放送・メディアの粗利益率 2026年度上期実績": "Broadcasting & media gross margin, first half FY3/2027 actual",
    "2026/11/6 決算説明資料 p.23（前年同期は赤字）": "Earnings presentation Nov 6, 2026, p.23 (loss in the same period a year earlier)",
    "テレビ放送の粗利益率 2030年度": "TV broadcasting gross margin FY3/2031",
    "Group Vision p.19「2030年度（想定）」35%。比較の26%は2023年度": "Group Vision p.19 \"FY2030 (assumed)\" [= FY3/2031] 35%. The 26% comparison is FY3/2024",
    "粗利率改善ありの場合の計算": "Calculation with gross margin improvement",
    "既存の利益＝200−減収額×削る割合＋放送収入×（粗利率−26.2%）。粗利率は26.2%から2030年度35%へ直線で上昇し以降横ばい": "Existing profit = ¥20bn − lost revenue × share cutting profit + broadcasting revenue × (gross margin − 26.2%). Gross margin rises linearly from 26.2% to 35% in FY3/2031, then flat",
    "目標の内訳＝上積みを改善分だけ減らす（合計は「なし」と同じ）／上振れ＝上積みとは別に足す。26.2%・35%は「放送・メディア」全体の粗利率で、放送収入1,300億円に当てはめている（代理変数）": "Within target = reduce the growth add-ons by the improvement (total same as \"None\") / On top of target = add separately from the growth add-ons. 26.2% and 35% are gross margins for \"broadcasting & media\" as a whole, applied to broadcasting revenue of ¥130bn (a proxy)",
    "参考": "Reference",
    "Group Visionの開示範囲": "What Group Vision discloses",
    "2025年度実績−308億円と2030年度目標350億円のみ。途中年度の計画、放送収入の前提、+440億円の内訳は記載なし。全体像は外部資本導入の確定後に公表予定": "Only the FY3/2026 actual of −¥30.8bn and the FY3/2031 target of ¥35bn. No plans for the years in between, broadcasting revenue assumptions or breakdown of the +¥44bn. The full picture is to be published once the outside capital deal is settled",
    "Group Vision p.06・p.07（2026-11-13 確認）": "Group Vision pp.06, 07 (checked Nov 13, 2026)",
    "資金（タブ②）": "Cash (tab ②)",
    "買い手が引き継ぐ借入と対象会社の現金を精算した後の株式の売却代金（税引前）。売却にかかる税は別に差し引く（sk_saletax）。会社の表現は「外部資本の導入」で、全株売却・2026年度末完了は試算上の仮定": "Share sale proceeds (pre-tax) after settling the borrowing taken over by the buyer and the company's cash. Tax on the sale is deducted separately (sk_saletax). The company calls it \"bringing in outside capital\"; a full sale completed at the end of FY3/2027 is an assumption of these estimates",
    "短期借入の返済（親会社）": "Repayment of short-term loan (parent)",
    "みずほ銀行から借入、2026/2/9実行、1年以内に返済（有報2026年3月期 p.130 短期借入金230,000百万円）": "Borrowed from Mizuho Bank, drawn Feb 9, 2026, repayable within one year (Annual Securities Report FY3/2026 p.130, short-term borrowings ¥230,000m)",
    "社債の償還（親会社）": "Bond redemption (parent)",
    "第7回無担保社債 2028年12月8日償還（有報 p.127）": "7th unsecured bonds, redeemed Dec 8, 2028 (Annual Securities Report p.127)",
    "既存の長期借入（連結3,481億円）": "Existing long-term borrowings (consolidated ¥348.1bn)",
    "使い道に含めない": "Not included in uses of cash",
    "親会社単体の長期借入は0で、子会社への貸付も49億円のみ（有報 p.129・130・135）。不動産側は借入で資金調達（p.37）。売却で連結から外れるとみなす。2026年9月末までの借入の増加（約756億円）も同じ扱い。会社別・債務別の照合はしていない（残る借入・保証・グループ内の資金の精算があれば現金は減る）": "The parent alone has no long-term borrowings and lends only ¥4.9bn to subsidiaries (Annual Securities Report pp.129, 130, 135). The real estate side funds itself with borrowing (p.37). Treated as leaving the consolidation with the sale; the increase in borrowings to end-Sep 2026 (about ¥75.6bn) is treated the same way. Not reconciled by company or by debt (remaining borrowings, guarantees or intra-group fund settlements would reduce cash)",
    "政策保有株の売却": "Sale of cross-shareholdings",
    "2027年度までに累計1,000億円超の計画のうち2025年度494億円売却済み。残りを2026・2027年度に半分ずつ": "Of the plan to sell over ¥100bn cumulatively by FY3/2028, ¥49.4bn was sold in FY3/2026. The rest is split evenly over FY3/2027 and FY3/2028",
    "営業キャッシュフロー（2026年度以降）": "Operating cash flow (from FY3/2027)",
    "税引前＝営業利益＋減価償却費。別に全社費用と法人税等を差し引く": "Pre-tax = operating profit + depreciation. Corporate expenses and income taxes deducted separately",
    "減価償却費：メディア・その他90億円／年（2026年度会社計画 連結190−不動産100）。法人税等＝（事業の営業利益の合計−全社費用）×30.6%、赤字の年は0（税の戻り・繰越欠損金は見込まない）。新しく発生した税は半分を当年度、半分を翌年度に払う（sk_taxtiming）": "Depreciation: Media & Other ¥9bn/yr (FY3/2027 company plan: consolidated ¥19bn − real estate ¥10bn). Income taxes = (total segment operating profit − corporate expenses) × 30.6%, zero in loss years (no refunds or loss carryforwards). Newly arising tax is paid half in the year and half the following year (sk_taxtiming)",
    "維持更新投資": "Maintenance capex",
    "2026年度会社計画 設備投資 連結1,100−不動産1,010（11/6資料 p.37）が続くと仮定": "Assumes the FY3/2027 company plan continues: capex consolidated ¥110bn − real estate ¥101bn (Nov 6 materials, p.37)",
    "年間：2026・2027年度200円（290.8億円）、2028年度以降100円（145.4億円）または50円（72.7億円）": "Annual: FY3/2027 and FY3/2028 ¥200 (¥29.08bn); from FY3/2029 ¥100 (¥14.54bn) or ¥50 (¥7.27bn)",
    "株式数145,386,849株（2026年3月末 発行済169,123,000−自己株式23,736,151。2026年6月の配当総額14,538百万円＝1株100円と一致）。支払いは中間・期末を半分ずつとし、前年度の期末配当を当年度に払う（2026年度＝2025年度期末100円＋2026年度中間100円。2028年度＝2027年度期末100円＋2028年度中間）":
      "145,386,849 shares (end-March 2026: 169,123,000 issued − 23,736,151 treasury; consistent with the June 2026 total dividend of ¥14,538m = ¥100 per share). Paid half at interim and half at year-end, with the prior year's year-end dividend paid in the current year (FY3/2027 = FY3/2026 year-end ¥100 + FY3/2027 interim ¥100; FY3/2029 = FY3/2028 year-end ¥100 + FY3/2029 interim)",
    "1500（IP開発200・制作500・多角800）": "150 (IP development 20, production 50, multi-use 80)",
    "Group Vision 5年間1,500億円以上。2026〜2030年度に均等に支出（仮定）。2031年度以降は計画なし": "Group Vision: ¥150bn or more over five years. Spent evenly over FY3/2027–FY3/2031 (assumption). No plan from FY3/2032",
    "含めないもの": "Excluded",
    "2026年度以降の支払利息・受取利息配当、運転資金、SBI合弁の損益、追加の自社株買い、成長投資による減価償却・利益の増加": "From FY3/2027: interest paid, interest and dividends received, working capital, the SBI joint venture's profit or loss, additional buybacks, depreciation and profit increases from growth investment",
    "年度ごと表示の出発点（2026年度期首）の現金": "Starting cash for the by-year view (beginning of FY3/2027)",
    "有価証券報告書2026年3月期 連結CF計算書の現金及び現金同等物の期末残高（128,936百万円）。運転資金として必要な分も含む": "Cash and cash equivalents at year-end in the consolidated CF statement, Annual Securities Report FY3/2026 (¥128,936m). Includes cash needed as working capital",
    "年度ごと表示の時期": "Timing in the by-year view",
    "売却代金・短期借入返済＝2026年度／社債償還＝2028年度／成長投資＝2026〜2030年度に毎年300億円／政策保有株＝2026・2027年度": "Sale proceeds and short-term loan repayment = FY3/2027 / bond redemption = FY3/2029 / growth investment = ¥30bn a year over FY3/2027–FY3/2031 / cross-shareholdings = FY3/2027 and FY3/2028",
    "2017〜2025年度の連結キャッシュフロー": "Consolidated cash flow FY3/2018–FY3/2026",
    "有価証券報告書（2018年3月期〜2026年3月期）XBRL CSV版の連結キャッシュ・フロー計算書。期首＋営業＋投資＋財務＋換算差額等＝期末を検算": "Consolidated cash flow statements from the XBRL CSV versions of the Annual Securities Reports (FY3/2018–FY3/2026). Checked that opening + operating + investing + financing + translation differences etc. = closing",
    "営業CFのセグメント別内訳（実績年度）": "Segment split of operating CF (actual years)",
    "EBITDA＋残りの配分": "EBITDA + allocation of the remainder",
    "EBITDA＝セグメント利益＋減価償却費（有報セグメント情報）。残り（税・運転資金・調整額など）の配り方は2通り（sk_alloc）。合計は連結営業CFと一致。どちらも仮定で、真の値の上限・下限を示すものではない": "EBITDA = segment profit + depreciation (segment information). The remainder (taxes, working capital, adjustments etc.) is allocated in two ways (sk_alloc). The total matches consolidated operating CF. Both are assumptions and do not give upper or lower bounds of the true value",
    "設備投資のセグメント別内訳（実績年度）": "Segment split of capex (actual years)",
    "セグメント設備投資額の比で配分": "Allocated by segment capex ratio",
    "連結CFの有形・無形固定資産の取得による支出を、セグメント情報の設備投資額の比で按分。その他事業はメディアに合算": "Consolidated payments for PP&E and intangibles split by the segment capex ratio in the segment information. Other is combined with Media",
    "有価証券・定期預金・投資有価証券": "Securities, time deposits and investment securities",
    "純額で表示": "Shown net",
    "取得と売却・償還を相殺して純額で表示（期間合計でも相殺）。長期借入・社債は調達と返済を分けた総額、短期借入は開示どおりの純増減": "Purchases are netted against sales and redemptions (also in period totals). Long-term borrowings and bonds are gross, with borrowing and repayment separate; short-term borrowings are the net change as disclosed",
    "2026年度 都市開発・観光の設備投資": "FY3/2027 capex of Urban Development, Hotels & Resorts",
    "2026/11/6 決算説明資料 p.37 設備投資計画 101,000百万円（上期実績63,131百万円）。同額を同事業の借入で賄い、借入は売却で連結から外れると仮定": "Earnings presentation Nov 6, 2026, p.37: capex plan ¥101,000m (first-half actual ¥63,131m). Assumed funded in full by that business's borrowing, which leaves the consolidation with the sale",
    "子会社の現金預金376.6×都市開発・観光の資産比58.3%（219億円）＋2026年度に稼いだ営業CF（税引後243億円）": "Subsidiaries' cash and deposits ¥37.66bn × Urban Development, Hotels & Resorts' share of assets 58.3% (¥21.9bn) + operating CF earned in FY3/2027 (¥24.3bn after tax)",
    "連結の現金預金842.6−親会社466.1（2026年3月末）。資産比はセグメント資産（2026年3月期）。会社別の現金同等物は開示がなく根拠は弱い（誤差はそのまま期末現金の誤差になる）。親会社がグループ会社から預かる資金1,022.9億円の精算は含めない": "Consolidated cash and deposits ¥84.26bn − parent ¥46.61bn (end-March 2026). Asset share from segment assets (FY3/2026). Company-level cash equivalents are not disclosed, so the basis is weak (any error carries straight into closing cash). Settlement of ¥102.29bn of funds the parent holds for group companies is not included",
    "期間合計の表示": "Period totals",
    "年度の流れの足し上げ": "Sum of the annual flows",
    "最初の年の期首現金と最後の年の期末現金（または累計不足）だけを残し、途中の繰越は相殺": "Keeps only opening cash of the first year and closing cash (or cumulative shortfall) of the last; carry-overs in between cancel out",
    "2026年度会社予想 セグメント計434−連結401（11/6資料 p.36）が続くと仮定。2025年度実績は調整額45.4（うち全社費用71.6）": "Assumes the FY3/2027 company forecast continues: segment total ¥43.4bn − consolidated ¥40.1bn (Nov 6 materials, p.36). FY3/2026 actual adjustment ¥4.54bn (of which corporate expenses ¥7.16bn)",
    "前年度分の法人税等の支払い（2026年度）": "Payment of prior-year income taxes (FY3/2027)",
    "2026年3月末の未払法人税等（連結、XBRL）は確定。2026年度に全額払うこと、対象会社の分も残る側が払うことは仮定": "Unpaid income taxes at end-March 2026 (consolidated, XBRL) are confirmed. Paying all of it in FY3/2027, including the sold company's share, by the remaining group is an assumption",
    "売却にかかる税金": "Tax on the sale",
    "167.1（半分を2026年度、半分を2027年度）": "16.71 (half in FY3/2027, half in FY3/2028)",
    "都市開発・観光の子会社への投資に係る繰延税金負債16,706百万円（有報2026年3月期）で仮に置いた額。税務上の簿価・売却方法が分からないため、売却額による税額ではない（売却額が大きいほど税は増えるのが普通）": "A placeholder set at the ¥16,706m deferred tax liability on the investment in the Urban Development, Hotels & Resorts subsidiaries (Annual Securities Report FY3/2026). The tax book value and sale method are unknown, so it is not a tax calculated from the sale amount (a larger sale usually means more tax)",
    "政策保有株の売却益にかかる税金": "Tax on gains from selling cross-shareholdings",
    "売却額×83%×30.6%（年約64億円。半分を当年度、半分を翌年度）": "Sale amount × 83% × 30.6% (about ¥6.4bn a year; half in the year, half the following year)",
    "2025年度実績：投資有価証券売却益500÷売却収入601≒83%": "FY3/2026 actual: gain on sale of investment securities ¥50bn ÷ proceeds ¥60.1bn ≈ 83%",
    "最低手元資金": "Minimum cash",
    "日々の運転に必要な現金の目安。下回る年度をKPIとグラフで示す": "A guide to the cash needed for day-to-day operations. Years falling below it are flagged in the KPIs and chart",
    "実績の事業別営業CFの推定方法": "How segment operating CF is inferred for actual years",
    "不動産に寄せる（既定）／売上比": "Allocate to real estate (default) / By revenue share",
    "不動産に寄せる：営業CFの棚卸資産の増減額（9年で+1,288.8億円、主に販売用不動産の回収）を都市開発・観光へ入れ、残りを売上比で配分。棚卸資産には番組勘定等も含むため上限寄り。売上比：残り全額を売上比で配分": "Allocate to real estate: the change in inventories in operating CF (+¥128.88bn over 9 years, mainly recovery of real estate for sale) goes to Urban Development, Hotels & Resorts, and the rest is split by revenue. Inventories also include programme inventory, so this leans to the high side. By revenue share: the whole remainder is split by revenue",
    "短期借入2,300億円の期限": "Due date of the ¥230bn short-term loan",
    "2027年2月ごろ": "Around Feb 2027",
    "2026/2/4開示：2/9実行・期間1年以内。年度末の売却より先に来るため、借り換え等のつなぎが必要になる可能性（費用は含めない）": "Disclosed Feb 4, 2026: drawn Feb 9, term within one year. It falls due before the year-end sale, so bridging such as refinancing may be needed (costs not included)",
    "法人税等の支払い時期": "Timing of income tax payments",
    "発生した年度に半分、翌年度に半分": "Half in the year incurred, half the following year",
    "中間納付と確定申告を単純化した置き方。事業の税・政策保有株の売却益の税・売却にかかる税のすべてに当てはめる": "A simplification of interim and final tax payments. Applied to segment taxes, tax on cross-shareholding gains and tax on the sale alike"
  });

})();
