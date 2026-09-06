/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var _a;
const t$3 = globalThis, e$6 = t$3.ShadowRoot && (void 0 === t$3.ShadyCSS || t$3.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, s$5 = Symbol(), o$4 = /* @__PURE__ */ new WeakMap();
let n$4 = class n {
  constructor(t2, e3, o2) {
    if (this._$cssResult$ = true, o2 !== s$5) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t2, this.t = e3;
  }
  get styleSheet() {
    let t2 = this.o;
    const s4 = this.t;
    if (e$6 && void 0 === t2) {
      const e3 = void 0 !== s4 && 1 === s4.length;
      e3 && (t2 = o$4.get(s4)), void 0 === t2 && ((this.o = t2 = new CSSStyleSheet()).replaceSync(this.cssText), e3 && o$4.set(s4, t2));
    }
    return t2;
  }
  toString() {
    return this.cssText;
  }
};
const r$3 = (t2) => new n$4("string" == typeof t2 ? t2 : t2 + "", void 0, s$5), i$4 = (t2, ...e3) => {
  const o2 = 1 === t2.length ? t2[0] : e3.reduce((e4, s4, o3) => e4 + ((t3) => {
    if (true === t3._$cssResult$) return t3.cssText;
    if ("number" == typeof t3) return t3;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t3 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t2[o3 + 1], t2[0]);
  return new n$4(o2, t2, s$5);
}, S$1 = (s4, o2) => {
  if (e$6) s4.adoptedStyleSheets = o2.map((t2) => t2 instanceof CSSStyleSheet ? t2 : t2.styleSheet);
  else for (const e3 of o2) {
    const o3 = document.createElement("style"), n3 = t$3.litNonce;
    void 0 !== n3 && o3.setAttribute("nonce", n3), o3.textContent = e3.cssText, s4.appendChild(o3);
  }
}, c$3 = e$6 ? (t2) => t2 : (t2) => t2 instanceof CSSStyleSheet ? ((t3) => {
  let e3 = "";
  for (const s4 of t3.cssRules) e3 += s4.cssText;
  return r$3(e3);
})(t2) : t2;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: i$3, defineProperty: e$5, getOwnPropertyDescriptor: h$1, getOwnPropertyNames: r$2, getOwnPropertySymbols: o$3, getPrototypeOf: n$3 } = Object, a$1 = globalThis, c$2 = a$1.trustedTypes, l$1 = c$2 ? c$2.emptyScript : "", p$1 = a$1.reactiveElementPolyfillSupport, d$1 = (t2, s4) => t2, u$1 = { toAttribute(t2, s4) {
  switch (s4) {
    case Boolean:
      t2 = t2 ? l$1 : null;
      break;
    case Object:
    case Array:
      t2 = null == t2 ? t2 : JSON.stringify(t2);
  }
  return t2;
}, fromAttribute(t2, s4) {
  let i3 = t2;
  switch (s4) {
    case Boolean:
      i3 = null !== t2;
      break;
    case Number:
      i3 = null === t2 ? null : Number(t2);
      break;
    case Object:
    case Array:
      try {
        i3 = JSON.parse(t2);
      } catch (t3) {
        i3 = null;
      }
  }
  return i3;
} }, f$1 = (t2, s4) => !i$3(t2, s4), b$1 = { attribute: true, type: String, converter: u$1, reflect: false, useDefault: false, hasChanged: f$1 };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), a$1.litPropertyMetadata ?? (a$1.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let y$1 = class y extends HTMLElement {
  static addInitializer(t2) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t2);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t2, s4 = b$1) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t2) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t2, s4), !s4.noAccessor) {
      const i3 = Symbol(), h2 = this.getPropertyDescriptor(t2, i3, s4);
      void 0 !== h2 && e$5(this.prototype, t2, h2);
    }
  }
  static getPropertyDescriptor(t2, s4, i3) {
    const { get: e3, set: r2 } = h$1(this.prototype, t2) ?? { get() {
      return this[s4];
    }, set(t3) {
      this[s4] = t3;
    } };
    return { get: e3, set(s5) {
      const h2 = e3 == null ? void 0 : e3.call(this);
      r2 == null ? void 0 : r2.call(this, s5), this.requestUpdate(t2, h2, i3);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t2) {
    return this.elementProperties.get(t2) ?? b$1;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d$1("elementProperties"))) return;
    const t2 = n$3(this);
    t2.finalize(), void 0 !== t2.l && (this.l = [...t2.l]), this.elementProperties = new Map(t2.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d$1("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d$1("properties"))) {
      const t3 = this.properties, s4 = [...r$2(t3), ...o$3(t3)];
      for (const i3 of s4) this.createProperty(i3, t3[i3]);
    }
    const t2 = this[Symbol.metadata];
    if (null !== t2) {
      const s4 = litPropertyMetadata.get(t2);
      if (void 0 !== s4) for (const [t3, i3] of s4) this.elementProperties.set(t3, i3);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t3, s4] of this.elementProperties) {
      const i3 = this._$Eu(t3, s4);
      void 0 !== i3 && this._$Eh.set(i3, t3);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i3 = [];
    if (Array.isArray(s4)) {
      const e3 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e3) i3.unshift(c$3(s5));
    } else void 0 !== s4 && i3.push(c$3(s4));
    return i3;
  }
  static _$Eu(t2, s4) {
    const i3 = s4.attribute;
    return false === i3 ? void 0 : "string" == typeof i3 ? i3 : "string" == typeof t2 ? t2.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var _a2;
    this._$ES = new Promise((t2) => this.enableUpdating = t2), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (_a2 = this.constructor.l) == null ? void 0 : _a2.forEach((t2) => t2(this));
  }
  addController(t2) {
    var _a2;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t2), void 0 !== this.renderRoot && this.isConnected && ((_a2 = t2.hostConnected) == null ? void 0 : _a2.call(t2));
  }
  removeController(t2) {
    var _a2;
    (_a2 = this._$EO) == null ? void 0 : _a2.delete(t2);
  }
  _$E_() {
    const t2 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i3 of s4.keys()) this.hasOwnProperty(i3) && (t2.set(i3, this[i3]), delete this[i3]);
    t2.size > 0 && (this._$Ep = t2);
  }
  createRenderRoot() {
    const t2 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S$1(t2, this.constructor.elementStyles), t2;
  }
  connectedCallback() {
    var _a2;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t2) => {
      var _a3;
      return (_a3 = t2.hostConnected) == null ? void 0 : _a3.call(t2);
    });
  }
  enableUpdating(t2) {
  }
  disconnectedCallback() {
    var _a2;
    (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t2) => {
      var _a3;
      return (_a3 = t2.hostDisconnected) == null ? void 0 : _a3.call(t2);
    });
  }
  attributeChangedCallback(t2, s4, i3) {
    this._$AK(t2, i3);
  }
  _$ET(t2, s4) {
    var _a2;
    const i3 = this.constructor.elementProperties.get(t2), e3 = this.constructor._$Eu(t2, i3);
    if (void 0 !== e3 && true === i3.reflect) {
      const h2 = (void 0 !== ((_a2 = i3.converter) == null ? void 0 : _a2.toAttribute) ? i3.converter : u$1).toAttribute(s4, i3.type);
      this._$Em = t2, null == h2 ? this.removeAttribute(e3) : this.setAttribute(e3, h2), this._$Em = null;
    }
  }
  _$AK(t2, s4) {
    var _a2, _b;
    const i3 = this.constructor, e3 = i3._$Eh.get(t2);
    if (void 0 !== e3 && this._$Em !== e3) {
      const t3 = i3.getPropertyOptions(e3), h2 = "function" == typeof t3.converter ? { fromAttribute: t3.converter } : void 0 !== ((_a2 = t3.converter) == null ? void 0 : _a2.fromAttribute) ? t3.converter : u$1;
      this._$Em = e3;
      const r2 = h2.fromAttribute(s4, t3.type);
      this[e3] = r2 ?? ((_b = this._$Ej) == null ? void 0 : _b.get(e3)) ?? r2, this._$Em = null;
    }
  }
  requestUpdate(t2, s4, i3, e3 = false, h2) {
    var _a2;
    if (void 0 !== t2) {
      const r2 = this.constructor;
      if (false === e3 && (h2 = this[t2]), i3 ?? (i3 = r2.getPropertyOptions(t2)), !((i3.hasChanged ?? f$1)(h2, s4) || i3.useDefault && i3.reflect && h2 === ((_a2 = this._$Ej) == null ? void 0 : _a2.get(t2)) && !this.hasAttribute(r2._$Eu(t2, i3)))) return;
      this.C(t2, s4, i3);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t2, s4, { useDefault: i3, reflect: e3, wrapped: h2 }, r2) {
    i3 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t2) && (this._$Ej.set(t2, r2 ?? s4 ?? this[t2]), true !== h2 || void 0 !== r2) || (this._$AL.has(t2) || (this.hasUpdated || i3 || (s4 = void 0), this._$AL.set(t2, s4)), true === e3 && this._$Em !== t2 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t2));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t3) {
      Promise.reject(t3);
    }
    const t2 = this.scheduleUpdate();
    return null != t2 && await t2, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var _a2;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t4, s5] of this._$Ep) this[t4] = s5;
        this._$Ep = void 0;
      }
      const t3 = this.constructor.elementProperties;
      if (t3.size > 0) for (const [s5, i3] of t3) {
        const { wrapped: t4 } = i3, e3 = this[s5];
        true !== t4 || this._$AL.has(s5) || void 0 === e3 || this.C(s5, void 0, i3, e3);
      }
    }
    let t2 = false;
    const s4 = this._$AL;
    try {
      t2 = this.shouldUpdate(s4), t2 ? (this.willUpdate(s4), (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t3) => {
        var _a3;
        return (_a3 = t3.hostUpdate) == null ? void 0 : _a3.call(t3);
      }), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t2 = false, this._$EM(), s5;
    }
    t2 && this._$AE(s4);
  }
  willUpdate(t2) {
  }
  _$AE(t2) {
    var _a2;
    (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t3) => {
      var _a3;
      return (_a3 = t3.hostUpdated) == null ? void 0 : _a3.call(t3);
    }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t2)), this.updated(t2);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t2) {
    return true;
  }
  update(t2) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t3) => this._$ET(t3, this[t3]))), this._$EM();
  }
  updated(t2) {
  }
  firstUpdated(t2) {
  }
};
y$1.elementStyles = [], y$1.shadowRootOptions = { mode: "open" }, y$1[d$1("elementProperties")] = /* @__PURE__ */ new Map(), y$1[d$1("finalized")] = /* @__PURE__ */ new Map(), p$1 == null ? void 0 : p$1({ ReactiveElement: y$1 }), (a$1.reactiveElementVersions ?? (a$1.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2 = globalThis, i$2 = (t2) => t2, s$4 = t$2.trustedTypes, e$4 = s$4 ? s$4.createPolicy("lit-html", { createHTML: (t2) => t2 }) : void 0, h = "$lit$", o$2 = `lit$${Math.random().toFixed(9).slice(2)}$`, n$2 = "?" + o$2, r$1 = `<${n$2}>`, l = document, c$1 = () => l.createComment(""), a = (t2) => null === t2 || "object" != typeof t2 && "function" != typeof t2, u = Array.isArray, d = (t2) => u(t2) || "function" == typeof (t2 == null ? void 0 : t2[Symbol.iterator]), f = "[ 	\n\f\r]", v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _ = /-->/g, m = />/g, p = RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), g = /'/g, $ = /"/g, y2 = /^(?:script|style|textarea|title)$/i, x = (t2) => (i3, ...s4) => ({ _$litType$: t2, strings: i3, values: s4 }), b = x(1), E = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), C = /* @__PURE__ */ new WeakMap(), P = l.createTreeWalker(l, 129);
function V(t2, i3) {
  if (!u(t2) || !t2.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e$4 ? e$4.createHTML(i3) : i3;
}
const N = (t2, i3) => {
  const s4 = t2.length - 1, e3 = [];
  let n3, l2 = 2 === i3 ? "<svg>" : 3 === i3 ? "<math>" : "", c2 = v;
  for (let i4 = 0; i4 < s4; i4++) {
    const s5 = t2[i4];
    let a2, u2, d2 = -1, f2 = 0;
    for (; f2 < s5.length && (c2.lastIndex = f2, u2 = c2.exec(s5), null !== u2); ) f2 = c2.lastIndex, c2 === v ? "!--" === u2[1] ? c2 = _ : void 0 !== u2[1] ? c2 = m : void 0 !== u2[2] ? (y2.test(u2[2]) && (n3 = RegExp("</" + u2[2], "g")), c2 = p) : void 0 !== u2[3] && (c2 = p) : c2 === p ? ">" === u2[0] ? (c2 = n3 ?? v, d2 = -1) : void 0 === u2[1] ? d2 = -2 : (d2 = c2.lastIndex - u2[2].length, a2 = u2[1], c2 = void 0 === u2[3] ? p : '"' === u2[3] ? $ : g) : c2 === $ || c2 === g ? c2 = p : c2 === _ || c2 === m ? c2 = v : (c2 = p, n3 = void 0);
    const x2 = c2 === p && t2[i4 + 1].startsWith("/>") ? " " : "";
    l2 += c2 === v ? s5 + r$1 : d2 >= 0 ? (e3.push(a2), s5.slice(0, d2) + h + s5.slice(d2) + o$2 + x2) : s5 + o$2 + (-2 === d2 ? i4 : x2);
  }
  return [V(t2, l2 + (t2[s4] || "<?>") + (2 === i3 ? "</svg>" : 3 === i3 ? "</math>" : "")), e3];
};
class S {
  constructor({ strings: t2, _$litType$: i3 }, e3) {
    let r2;
    this.parts = [];
    let l2 = 0, a2 = 0;
    const u2 = t2.length - 1, d2 = this.parts, [f2, v2] = N(t2, i3);
    if (this.el = S.createElement(f2, e3), P.currentNode = this.el.content, 2 === i3 || 3 === i3) {
      const t3 = this.el.content.firstChild;
      t3.replaceWith(...t3.childNodes);
    }
    for (; null !== (r2 = P.nextNode()) && d2.length < u2; ) {
      if (1 === r2.nodeType) {
        if (r2.hasAttributes()) for (const t3 of r2.getAttributeNames()) if (t3.endsWith(h)) {
          const i4 = v2[a2++], s4 = r2.getAttribute(t3).split(o$2), e4 = /([.?@])?(.*)/.exec(i4);
          d2.push({ type: 1, index: l2, name: e4[2], strings: s4, ctor: "." === e4[1] ? I : "?" === e4[1] ? L : "@" === e4[1] ? z : H }), r2.removeAttribute(t3);
        } else t3.startsWith(o$2) && (d2.push({ type: 6, index: l2 }), r2.removeAttribute(t3));
        if (y2.test(r2.tagName)) {
          const t3 = r2.textContent.split(o$2), i4 = t3.length - 1;
          if (i4 > 0) {
            r2.textContent = s$4 ? s$4.emptyScript : "";
            for (let s4 = 0; s4 < i4; s4++) r2.append(t3[s4], c$1()), P.nextNode(), d2.push({ type: 2, index: ++l2 });
            r2.append(t3[i4], c$1());
          }
        }
      } else if (8 === r2.nodeType) if (r2.data === n$2) d2.push({ type: 2, index: l2 });
      else {
        let t3 = -1;
        for (; -1 !== (t3 = r2.data.indexOf(o$2, t3 + 1)); ) d2.push({ type: 7, index: l2 }), t3 += o$2.length - 1;
      }
      l2++;
    }
  }
  static createElement(t2, i3) {
    const s4 = l.createElement("template");
    return s4.innerHTML = t2, s4;
  }
}
function M(t2, i3, s4 = t2, e3) {
  var _a2, _b;
  if (i3 === E) return i3;
  let h2 = void 0 !== e3 ? (_a2 = s4._$Co) == null ? void 0 : _a2[e3] : s4._$Cl;
  const o2 = a(i3) ? void 0 : i3._$litDirective$;
  return (h2 == null ? void 0 : h2.constructor) !== o2 && ((_b = h2 == null ? void 0 : h2._$AO) == null ? void 0 : _b.call(h2, false), void 0 === o2 ? h2 = void 0 : (h2 = new o2(t2), h2._$AT(t2, s4, e3)), void 0 !== e3 ? (s4._$Co ?? (s4._$Co = []))[e3] = h2 : s4._$Cl = h2), void 0 !== h2 && (i3 = M(t2, h2._$AS(t2, i3.values), h2, e3)), i3;
}
class R {
  constructor(t2, i3) {
    this._$AV = [], this._$AN = void 0, this._$AD = t2, this._$AM = i3;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t2) {
    const { el: { content: i3 }, parts: s4 } = this._$AD, e3 = ((t2 == null ? void 0 : t2.creationScope) ?? l).importNode(i3, true);
    P.currentNode = e3;
    let h2 = P.nextNode(), o2 = 0, n3 = 0, r2 = s4[0];
    for (; void 0 !== r2; ) {
      if (o2 === r2.index) {
        let i4;
        2 === r2.type ? i4 = new k(h2, h2.nextSibling, this, t2) : 1 === r2.type ? i4 = new r2.ctor(h2, r2.name, r2.strings, this, t2) : 6 === r2.type && (i4 = new Z(h2, this, t2)), this._$AV.push(i4), r2 = s4[++n3];
      }
      o2 !== (r2 == null ? void 0 : r2.index) && (h2 = P.nextNode(), o2++);
    }
    return P.currentNode = l, e3;
  }
  p(t2) {
    let i3 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t2, s4, i3), i3 += s4.strings.length - 2) : s4._$AI(t2[i3])), i3++;
  }
}
class k {
  get _$AU() {
    var _a2;
    return ((_a2 = this._$AM) == null ? void 0 : _a2._$AU) ?? this._$Cv;
  }
  constructor(t2, i3, s4, e3) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t2, this._$AB = i3, this._$AM = s4, this.options = e3, this._$Cv = (e3 == null ? void 0 : e3.isConnected) ?? true;
  }
  get parentNode() {
    let t2 = this._$AA.parentNode;
    const i3 = this._$AM;
    return void 0 !== i3 && 11 === (t2 == null ? void 0 : t2.nodeType) && (t2 = i3.parentNode), t2;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t2, i3 = this) {
    t2 = M(this, t2, i3), a(t2) ? t2 === A || null == t2 || "" === t2 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t2 !== this._$AH && t2 !== E && this._(t2) : void 0 !== t2._$litType$ ? this.$(t2) : void 0 !== t2.nodeType ? this.T(t2) : d(t2) ? this.k(t2) : this._(t2);
  }
  O(t2) {
    return this._$AA.parentNode.insertBefore(t2, this._$AB);
  }
  T(t2) {
    this._$AH !== t2 && (this._$AR(), this._$AH = this.O(t2));
  }
  _(t2) {
    this._$AH !== A && a(this._$AH) ? this._$AA.nextSibling.data = t2 : this.T(l.createTextNode(t2)), this._$AH = t2;
  }
  $(t2) {
    var _a2;
    const { values: i3, _$litType$: s4 } = t2, e3 = "number" == typeof s4 ? this._$AC(t2) : (void 0 === s4.el && (s4.el = S.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (((_a2 = this._$AH) == null ? void 0 : _a2._$AD) === e3) this._$AH.p(i3);
    else {
      const t3 = new R(e3, this), s5 = t3.u(this.options);
      t3.p(i3), this.T(s5), this._$AH = t3;
    }
  }
  _$AC(t2) {
    let i3 = C.get(t2.strings);
    return void 0 === i3 && C.set(t2.strings, i3 = new S(t2)), i3;
  }
  k(t2) {
    u(this._$AH) || (this._$AH = [], this._$AR());
    const i3 = this._$AH;
    let s4, e3 = 0;
    for (const h2 of t2) e3 === i3.length ? i3.push(s4 = new k(this.O(c$1()), this.O(c$1()), this, this.options)) : s4 = i3[e3], s4._$AI(h2), e3++;
    e3 < i3.length && (this._$AR(s4 && s4._$AB.nextSibling, e3), i3.length = e3);
  }
  _$AR(t2 = this._$AA.nextSibling, s4) {
    var _a2;
    for ((_a2 = this._$AP) == null ? void 0 : _a2.call(this, false, true, s4); t2 !== this._$AB; ) {
      const s5 = i$2(t2).nextSibling;
      i$2(t2).remove(), t2 = s5;
    }
  }
  setConnected(t2) {
    var _a2;
    void 0 === this._$AM && (this._$Cv = t2, (_a2 = this._$AP) == null ? void 0 : _a2.call(this, t2));
  }
}
class H {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t2, i3, s4, e3, h2) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t2, this.name = i3, this._$AM = e3, this.options = h2, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t2, i3 = this, s4, e3) {
    const h2 = this.strings;
    let o2 = false;
    if (void 0 === h2) t2 = M(this, t2, i3, 0), o2 = !a(t2) || t2 !== this._$AH && t2 !== E, o2 && (this._$AH = t2);
    else {
      const e4 = t2;
      let n3, r2;
      for (t2 = h2[0], n3 = 0; n3 < h2.length - 1; n3++) r2 = M(this, e4[s4 + n3], i3, n3), r2 === E && (r2 = this._$AH[n3]), o2 || (o2 = !a(r2) || r2 !== this._$AH[n3]), r2 === A ? t2 = A : t2 !== A && (t2 += (r2 ?? "") + h2[n3 + 1]), this._$AH[n3] = r2;
    }
    o2 && !e3 && this.j(t2);
  }
  j(t2) {
    t2 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t2 ?? "");
  }
}
class I extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t2) {
    this.element[this.name] = t2 === A ? void 0 : t2;
  }
}
class L extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t2) {
    this.element.toggleAttribute(this.name, !!t2 && t2 !== A);
  }
}
class z extends H {
  constructor(t2, i3, s4, e3, h2) {
    super(t2, i3, s4, e3, h2), this.type = 5;
  }
  _$AI(t2, i3 = this) {
    if ((t2 = M(this, t2, i3, 0) ?? A) === E) return;
    const s4 = this._$AH, e3 = t2 === A && s4 !== A || t2.capture !== s4.capture || t2.once !== s4.once || t2.passive !== s4.passive, h2 = t2 !== A && (s4 === A || e3);
    e3 && this.element.removeEventListener(this.name, this, s4), h2 && this.element.addEventListener(this.name, this, t2), this._$AH = t2;
  }
  handleEvent(t2) {
    var _a2;
    "function" == typeof this._$AH ? this._$AH.call(((_a2 = this.options) == null ? void 0 : _a2.host) ?? this.element, t2) : this._$AH.handleEvent(t2);
  }
}
class Z {
  constructor(t2, i3, s4) {
    this.element = t2, this.type = 6, this._$AN = void 0, this._$AM = i3, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t2) {
    M(this, t2);
  }
}
const B = t$2.litHtmlPolyfillSupport;
B == null ? void 0 : B(S, k), (t$2.litHtmlVersions ?? (t$2.litHtmlVersions = [])).push("3.3.3");
const D = (t2, i3, s4) => {
  const e3 = (s4 == null ? void 0 : s4.renderBefore) ?? i3;
  let h2 = e3._$litPart$;
  if (void 0 === h2) {
    const t3 = (s4 == null ? void 0 : s4.renderBefore) ?? null;
    e3._$litPart$ = h2 = new k(i3.insertBefore(c$1(), t3), t3, void 0, s4 ?? {});
  }
  return h2._$AI(t2), h2;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const s$3 = globalThis;
let i$1 = class i extends y$1 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a2;
    const t2 = super.createRenderRoot();
    return (_a2 = this.renderOptions).renderBefore ?? (_a2.renderBefore = t2.firstChild), t2;
  }
  update(t2) {
    const r2 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t2), this._$Do = D(r2, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var _a2;
    super.connectedCallback(), (_a2 = this._$Do) == null ? void 0 : _a2.setConnected(true);
  }
  disconnectedCallback() {
    var _a2;
    super.disconnectedCallback(), (_a2 = this._$Do) == null ? void 0 : _a2.setConnected(false);
  }
  render() {
    return E;
  }
};
i$1._$litElement$ = true, i$1["finalized"] = true, (_a = s$3.litElementHydrateSupport) == null ? void 0 : _a.call(s$3, { LitElement: i$1 });
const o$1 = s$3.litElementPolyfillSupport;
o$1 == null ? void 0 : o$1({ LitElement: i$1 });
(s$3.litElementVersions ?? (s$3.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1 = (t2) => (e3, o2) => {
  void 0 !== o2 ? o2.addInitializer(() => {
    customElements.define(t2, e3);
  }) : customElements.define(t2, e3);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o = { attribute: true, type: String, converter: u$1, reflect: false, hasChanged: f$1 }, r = (t2 = o, e3, r2) => {
  const { kind: n3, metadata: i3 } = r2;
  let s4 = globalThis.litPropertyMetadata.get(i3);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i3, s4 = /* @__PURE__ */ new Map()), "setter" === n3 && ((t2 = Object.create(t2)).wrapped = true), s4.set(r2.name, t2), "accessor" === n3) {
    const { name: o2 } = r2;
    return { set(r3) {
      const n4 = e3.get.call(this);
      e3.set.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    }, init(e4) {
      return void 0 !== e4 && this.C(o2, void 0, t2, e4), e4;
    } };
  }
  if ("setter" === n3) {
    const { name: o2 } = r2;
    return function(r3) {
      const n4 = this[o2];
      e3.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    };
  }
  throw Error("Unsupported decorator location: " + n3);
};
function n$1(t2) {
  return (e3, o2) => "object" == typeof o2 ? r(t2, e3, o2) : ((t3, e4, o3) => {
    const r2 = e4.hasOwnProperty(o3);
    return e4.constructor.createProperty(o3, t3), r2 ? Object.getOwnPropertyDescriptor(e4, o3) : void 0;
  })(t2, e3, o2);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e$3 = (e3, t2, c2) => (c2.configurable = true, c2.enumerable = true, Reflect.decorate && "object" != typeof t2 && Object.defineProperty(e3, t2, c2), c2);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function e$2(e3, r2) {
  return (n3, s4, i3) => {
    const o2 = (t2) => {
      var _a2;
      return ((_a2 = t2.renderRoot) == null ? void 0 : _a2.querySelector(e3)) ?? null;
    };
    return e$3(n3, s4, { get() {
      return o2(this);
    } });
  };
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let s$2 = class s extends Event {
  constructor(s4, t2, e3, o2) {
    super("context-request", { bubbles: true, composed: true }), this.context = s4, this.contextTarget = t2, this.callback = e3, this.subscribe = o2 ?? false;
  }
};
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function n2(n3) {
  return n3;
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let s$1 = class s2 {
  constructor(t2, s4, i3, h2) {
    if (this.subscribe = false, this.provided = false, this.value = void 0, this.t = (t3, s5) => {
      this.unsubscribe && (this.unsubscribe !== s5 && (this.provided = false, this.unsubscribe()), this.subscribe || this.unsubscribe()), this.value = t3, this.host.requestUpdate(), this.provided && !this.subscribe || (this.provided = true, this.callback && this.callback(t3, s5)), this.unsubscribe = s5;
    }, this.host = t2, void 0 !== s4.context) {
      const t3 = s4;
      this.context = t3.context, this.callback = t3.callback, this.subscribe = t3.subscribe ?? false;
    } else this.context = s4, this.callback = i3, this.subscribe = h2 ?? false;
    this.host.addController(this);
  }
  hostConnected() {
    this.dispatchRequest();
  }
  hostDisconnected() {
    this.unsubscribe && (this.unsubscribe(), this.unsubscribe = void 0);
  }
  dispatchRequest() {
    this.host.dispatchEvent(new s$2(this.context, this.host, this.t, this.subscribe));
  }
};
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class s3 {
  get value() {
    return this.o;
  }
  set value(s4) {
    this.setValue(s4);
  }
  setValue(s4, t2 = false) {
    const i3 = t2 || !Object.is(s4, this.o);
    this.o = s4, i3 && this.updateObservers();
  }
  constructor(s4) {
    this.subscriptions = /* @__PURE__ */ new Map(), this.updateObservers = () => {
      for (const [s5, { disposer: t2 }] of this.subscriptions) s5(this.o, t2);
    }, void 0 !== s4 && (this.value = s4);
  }
  addCallback(s4, t2, i3) {
    if (!i3) return void s4(this.value);
    this.subscriptions.has(s4) || this.subscriptions.set(s4, { disposer: () => {
      this.subscriptions.delete(s4);
    }, consumerHost: t2 });
    const { disposer: h2 } = this.subscriptions.get(s4);
    s4(this.value, h2);
  }
  clearCallbacks() {
    this.subscriptions.clear();
  }
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let e$1 = class e extends Event {
  constructor(t2, s4) {
    super("context-provider", { bubbles: true, composed: true }), this.context = t2, this.contextTarget = s4;
  }
};
class i2 extends s3 {
  constructor(s4, e3, i3) {
    var _a2, _b;
    super(void 0 !== e3.context ? e3.initialValue : i3), this.onContextRequest = (t2) => {
      if (t2.context !== this.context) return;
      const s5 = t2.contextTarget ?? t2.composedPath()[0];
      s5 !== this.host && (t2.stopPropagation(), this.addCallback(t2.callback, s5, t2.subscribe));
    }, this.onProviderRequest = (s5) => {
      if (s5.context !== this.context) return;
      if ((s5.contextTarget ?? s5.composedPath()[0]) === this.host) return;
      const e4 = /* @__PURE__ */ new Set();
      for (const [s6, { consumerHost: i4 }] of this.subscriptions) e4.has(s6) || (e4.add(s6), i4.dispatchEvent(new s$2(this.context, i4, s6, true)));
      s5.stopPropagation();
    }, this.host = s4, void 0 !== e3.context ? this.context = e3.context : this.context = e3, this.attachListeners(), (_b = (_a2 = this.host).addController) == null ? void 0 : _b.call(_a2, this);
  }
  attachListeners() {
    this.host.addEventListener("context-request", this.onContextRequest), this.host.addEventListener("context-provider", this.onProviderRequest);
  }
  hostConnected() {
    this.host.dispatchEvent(new e$1(this.context, this.host));
  }
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class t {
  constructor() {
    this.pendingContextRequests = /* @__PURE__ */ new Map(), this.onContextProvider = (t2) => {
      const s4 = this.pendingContextRequests.get(t2.context);
      if (void 0 === s4) return;
      this.pendingContextRequests.delete(t2.context);
      const { requests: o2 } = s4;
      for (const { elementRef: s5, callbackRef: n3 } of o2) {
        const o3 = s5.deref(), c2 = n3.deref();
        void 0 === o3 || void 0 === c2 || o3.dispatchEvent(new s$2(t2.context, o3, c2, true));
      }
    }, this.onContextRequest = (e3) => {
      if (true !== e3.subscribe) return;
      const t2 = e3.contextTarget ?? e3.composedPath()[0], s4 = e3.callback;
      let o2 = this.pendingContextRequests.get(e3.context);
      void 0 === o2 && this.pendingContextRequests.set(e3.context, o2 = { callbacks: /* @__PURE__ */ new WeakMap(), requests: [] });
      let n3 = o2.callbacks.get(t2);
      void 0 === n3 && o2.callbacks.set(t2, n3 = /* @__PURE__ */ new WeakSet()), n3.has(s4) || (n3.add(s4), o2.requests.push({ elementRef: new WeakRef(t2), callbackRef: new WeakRef(s4) }));
    };
  }
  attach(e3) {
    e3.addEventListener("context-request", this.onContextRequest), e3.addEventListener("context-provider", this.onContextProvider);
  }
  detach(e3) {
    e3.removeEventListener("context-request", this.onContextRequest), e3.removeEventListener("context-provider", this.onContextProvider);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function e2({ context: e3 }) {
  return (n3, i$12) => {
    const r2 = /* @__PURE__ */ new WeakMap();
    if ("object" == typeof i$12) return { get() {
      return n3.get.call(this);
    }, set(t2) {
      return r2.get(this).setValue(t2), n3.set.call(this, t2);
    }, init(n4) {
      return r2.set(this, new i2(this, { context: e3, initialValue: n4 })), n4;
    } };
    {
      n3.constructor.addInitializer(((n4) => {
        r2.set(n4, new i2(n4, { context: e3 }));
      }));
      const o2 = Object.getOwnPropertyDescriptor(n3, i$12);
      let s4;
      if (void 0 === o2) {
        const t2 = /* @__PURE__ */ new WeakMap();
        s4 = { get() {
          return t2.get(this);
        }, set(e4) {
          r2.get(this).setValue(e4), t2.set(this, e4);
        }, configurable: true, enumerable: true };
      } else {
        const t2 = o2.set;
        s4 = { ...o2, set(e4) {
          r2.get(this).setValue(e4), t2 == null ? void 0 : t2.call(this, e4);
        } };
      }
      return void Object.defineProperty(n3, i$12, s4);
    }
  };
}
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function c({ context: c2, subscribe: e3 }) {
  return (o2, n3) => {
    "object" == typeof n3 ? n3.addInitializer((function() {
      new s$1(this, { context: c2, callback: (t2) => {
        o2.set.call(this, t2);
      }, subscribe: e3 });
    })) : o2.constructor.addInitializer(((o3) => {
      new s$1(o3, { context: c2, callback: (t2) => {
        o3[n3] = t2;
      }, subscribe: e3 });
    }));
  };
}
export {
  i$1 as a,
  b,
  c,
  n2 as d,
  e$2 as e,
  t as f,
  e2 as g,
  i$4 as i,
  n$1 as n,
  t$1 as t
};
//# sourceMappingURL=lit-WUgPma2W.js.map
