import { audioContext } from "./play.js";

/*
 RequireJS 2.1.8 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
var requirejs, require, define;
(function(Z) {
    function H(b) {
        return "[object Function]" === L.call(b)
    }
    function I(b) {
        return "[object Array]" === L.call(b)
    }
    function y(b, c) {
        if (b) {
            var d;
            for (d = 0; d < b.length && (!b[d] || !c(b[d], d, b)); d += 1)
                ;
        }
    }
    function M(b, c) {
        if (b) {
            var d;
            for (d = b.length - 1; -1 < d && (!b[d] || !c(b[d], d, b)); d -= 1)
                ;
        }
    }
    function s(b, c) {
        return ga.call(b, c)
    }
    function l(b, c) {
        return s(b, c) && b[c]
    }
    function F(b, c) {
        for (var d in b)
            if (s(b, d) && c(b[d], d))
                break
    }
    function Q(b, c, d, h) {
        c && F(c, function(c, j) {
            if (d || !s(b, j))
                h && "string" !== typeof c ? (b[j] || (b[j] = {}),
                Q(b[j], c, d, h)) : b[j] = c
        });
        return b
    }
    function u(b, c) {
        return function() {
            return c.apply(b, arguments)
        }
    }
    function aa(b) {
        throw b;
    }
    function ba(b) {
        if (!b)
            return b;
        var c = Z;
        y(b.split("."), function(b) {
            c = c[b]
        });
        return c
    }
    function A(b, c, d, h) {
        c = Error(c + "\nhttp://requirejs.org/docs/errors.html#" + b);
        c.requireType = b;
        c.requireModules = h;
        d && (c.originalError = d);
        return c
    }
    function ha(b) {
        function c(a, f, b) {
            var e, m, c, g, d, h, j, i = f && f.split("/");
            e = i;
            var n = k.map
              , p = n && n["*"];
            if (a && "." === a.charAt(0))
                if (f) {
                    e = l(k.pkgs, f) ? i = [f] : i.slice(0, i.length - 1);
                    f = a = e.concat(a.split("/"));
                    for (e = 0; f[e]; e += 1)
                        if (m = f[e],
                        "." === m)
                            f.splice(e, 1),
                            e -= 1;
                        else if (".." === m)
                            if (1 === e && (".." === f[2] || ".." === f[0]))
                                break;
                            else
                                0 < e && (f.splice(e - 1, 2),
                                e -= 2);
                    e = l(k.pkgs, f = a[0]);
                    a = a.join("/");
                    e && a === f + "/" + e.main && (a = f)
                } else
                    0 === a.indexOf("./") && (a = a.substring(2));
            if (b && n && (i || p)) {
                f = a.split("/");
                for (e = f.length; 0 < e; e -= 1) {
                    c = f.slice(0, e).join("/");
                    if (i)
                        for (m = i.length; 0 < m; m -= 1)
                            if (b = l(n, i.slice(0, m).join("/")))
                                if (b = l(b, c)) {
                                    g = b;
                                    d = e;
                                    break
                                }
                    if (g)
                        break;
                    !h && (p && l(p, c)) && (h = l(p, c),
                    j = e)
                }
                !g && h && (g = h,
                d = j);
                g && (f.splice(0, d, g),
                a = f.join("/"))
            }
            return a
        }
        function d(a) {
            z && y(document.getElementsByTagName("script"), function(f) {
                if (f.getAttribute("data-requiremodule") === a && f.getAttribute("data-requirecontext") === i.contextName)
                    return f.parentNode.removeChild(f),
                    !0
            })
        }
        function h(a) {
            var f = l(k.paths, a);
            if (f && I(f) && 1 < f.length)
                return d(a),
                f.shift(),
                i.require.undef(a),
                i.require([a]),
                !0
        }
        function $(a) {
            var f, b = a ? a.indexOf("!") : -1;
            -1 < b && (f = a.substring(0, b),
            a = a.substring(b + 1, a.length));
            return [f, a]
        }
        function n(a, f, b, e) {
            var m, B, g = null, d = f ? f.name : null, h = a, j = !0, k = "";
            a || (j = !1,
            a = "_@r" + (L += 1));
            a = $(a);
            g = a[0];
            a = a[1];
            g && (g = c(g, d, e),
            B = l(r, g));
            a && (g ? k = B && B.normalize ? B.normalize(a, function(a) {
                return c(a, d, e)
            }) : c(a, d, e) : (k = c(a, d, e),
            a = $(k),
            g = a[0],
            k = a[1],
            b = !0,
            m = i.nameToUrl(k)));
            b = g && !B && !b ? "_unnormalized" + (M += 1) : "";
            return {
                prefix: g,
                name: k,
                parentMap: f,
                unnormalized: !!b,
                url: m,
                originalName: h,
                isDefine: j,
                id: (g ? g + "!" + k : k) + b
            }
        }
        function q(a) {
            var f = a.id
              , b = l(p, f);
            b || (b = p[f] = new i.Module(a));
            return b
        }
        function t(a, f, b) {
            var e = a.id
              , m = l(p, e);
            if (s(r, e) && (!m || m.defineEmitComplete))
                "defined" === f && b(r[e]);
            else if (m = q(a),
            m.error && "error" === f)
                b(m.error);
            else
                m.on(f, b)
        }
        function v(a, f) {
            var b = a.requireModules
              , e = !1;
            if (f)
                f(a);
            else if (y(b, function(f) {
                if (f = l(p, f))
                    f.error = a,
                    f.events.error && (e = !0,
                    f.emit("error", a))
            }),
            !e)
                j.onError(a)
        }
        function w() {
            R.length && (ia.apply(G, [G.length - 1, 0].concat(R)),
            R = [])
        }
        function x(a) {
            delete p[a];
            delete T[a]
        }
        function E(a, f, b) {
            var e = a.map.id;
            a.error ? a.emit("error", a.error) : (f[e] = !0,
            y(a.depMaps, function(e, c) {
                var g = e.id
                  , d = l(p, g);
                d && (!a.depMatched[c] && !b[g]) && (l(f, g) ? (a.defineDep(c, r[g]),
                a.check()) : E(d, f, b))
            }),
            b[e] = !0)
        }
        function C() {
            var a, f, b, e, m = (b = 1E3 * k.waitSeconds) && i.startTime + b < (new Date).getTime(), c = [], g = [], j = !1, l = !0;
            if (!U) {
                U = !0;
                F(T, function(b) {
                    a = b.map;
                    f = a.id;
                    if (b.enabled && (a.isDefine || g.push(b),
                    !b.error))
                        if (!b.inited && m)
                            h(f) ? j = e = !0 : (c.push(f),
                            d(f));
                        else if (!b.inited && (b.fetched && a.isDefine) && (j = !0,
                        !a.prefix))
                            return l = !1
                });
                if (m && c.length)
                    return b = A("timeout", "Load timeout for modules: " + c, null, c),
                    b.contextName = i.contextName,
                    v(b);
                l && y(g, function(a) {
                    E(a, {}, {})
                });
                if ((!m || e) && j)
                    if ((z || da) && !V)
                        V = setTimeout(function() {
                            V = 0;
                            C()
                        }, 50);
                U = !1
            }
        }
        function D(a) {
            s(r, a[0]) || q(n(a[0], null, !0)).init(a[1], a[2])
        }
        function J(a) {
            var a = a.currentTarget || a.srcElement
              , b = i.onScriptLoad;
            a.detachEvent && !W ? a.detachEvent("onreadystatechange", b) : a.removeEventListener("load", b, !1);
            b = i.onScriptError;
            (!a.detachEvent || W) && a.removeEventListener("error", b, !1);
            return {
                node: a,
                id: a && a.getAttribute("data-requiremodule")
            }
        }
        function K() {
            var a;
            for (w(); G.length; ) {
                a = G.shift();
                if (null === a[0])
                    return v(A("mismatch", "Mismatched anonymous define() module: " + a[a.length - 1]));
                D(a)
            }
        }
        var U, X, i, N, V, k = {
            waitSeconds: 7,
            baseUrl: "./",
            paths: {},
            pkgs: {},
            shim: {},
            config: {}
        }, p = {}, T = {}, Y = {}, G = [], r = {}, S = {}, L = 1, M = 1;
        N = {
            require: function(a) {
                return a.require ? a.require : a.require = i.makeRequire(a.map)
            },
            exports: function(a) {
                a.usingExports = !0;
                if (a.map.isDefine)
                    return a.exports ? a.exports : a.exports = r[a.map.id] = {}
            },
            module: function(a) {
                return a.module ? a.module : a.module = {
                    id: a.map.id,
                    uri: a.map.url,
                    config: function() {
                        var b = l(k.pkgs, a.map.id);
                        return (b ? l(k.config, a.map.id + "/" + b.main) : l(k.config, a.map.id)) || {}
                    },
                    exports: r[a.map.id]
                }
            }
        };
        X = function(a) {
            this.events = l(Y, a.id) || {};
            this.map = a;
            this.shim = l(k.shim, a.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0
        }
        ;
        X.prototype = {
            init: function(a, b, c, e) {
                e = e || {};
                if (!this.inited) {
                    this.factory = b;
                    if (c)
                        this.on("error", c);
                    else
                        this.events.error && (c = u(this, function(a) {
                            this.emit("error", a)
                        }));
                    this.depMaps = a && a.slice(0);
                    this.errback = c;
                    this.inited = !0;
                    this.ignore = e.ignore;
                    e.enabled || this.enabled ? this.enable() : this.check()
                }
            },
            defineDep: function(a, b) {
                this.depMatched[a] || (this.depMatched[a] = !0,
                this.depCount -= 1,
                this.depExports[a] = b)
            },
            fetch: function() {
                if (!this.fetched) {
                    this.fetched = !0;
                    i.startTime = (new Date).getTime();
                    var a = this.map;
                    if (this.shim)
                        i.makeRequire(this.map, {
                            enableBuildCallback: !0
                        })(this.shim.deps || [], u(this, function() {
                            return a.prefix ? this.callPlugin() : this.load()
                        }));
                    else
                        return a.prefix ? this.callPlugin() : this.load()
                }
            },
            load: function() {
                var a = this.map.url;
                S[a] || (S[a] = !0,
                i.load(this.map.id, a))
            },
            check: function() {
                if (this.enabled && !this.enabling) {
                    var a, b, c = this.map.id;
                    b = this.depExports;
                    var e = this.exports
                      , m = this.factory;
                    if (this.inited)
                        if (this.error)
                            this.emit("error", this.error);
                        else {
                            if (!this.defining) {
                                this.defining = !0;
                                if (1 > this.depCount && !this.defined) {
                                    if (H(m)) {
                                        if (this.events.error && this.map.isDefine || j.onError !== aa)
                                            try {
                                                e = i.execCb(c, m, b, e)
                                            } catch (d) {
                                                a = d
                                            }
                                        else
                                            e = i.execCb(c, m, b, e);
                                        this.map.isDefine && ((b = this.module) && void 0 !== b.exports && b.exports !== this.exports ? e = b.exports : void 0 === e && this.usingExports && (e = this.exports));
                                        if (a)
                                            return a.requireMap = this.map,
                                            a.requireModules = this.map.isDefine ? [this.map.id] : null,
                                            a.requireType = this.map.isDefine ? "define" : "require",
                                            v(this.error = a)
                                    } else
                                        e = m;
                                    this.exports = e;
                                    if (this.map.isDefine && !this.ignore && (r[c] = e,
                                    j.onResourceLoad))
                                        j.onResourceLoad(i, this.map, this.depMaps);
                                    x(c);
                                    this.defined = !0
                                }
                                this.defining = !1;
                                this.defined && !this.defineEmitted && (this.defineEmitted = !0,
                                this.emit("defined", this.exports),
                                this.defineEmitComplete = !0)
                            }
                        }
                    else
                        this.fetch()
                }
            },
            callPlugin: function() {
                var a = this.map
                  , b = a.id
                  , d = n(a.prefix);
                this.depMaps.push(d);
                t(d, "defined", u(this, function(e) {
                    var m, d;
                    d = this.map.name;
                    var g = this.map.parentMap ? this.map.parentMap.name : null
                      , h = i.makeRequire(a.parentMap, {
                        enableBuildCallback: !0
                    });
                    if (this.map.unnormalized) {
                        if (e.normalize && (d = e.normalize(d, function(a) {
                            return c(a, g, !0)
                        }) || ""),
                        e = n(a.prefix + "!" + d, this.map.parentMap),
                        t(e, "defined", u(this, function(a) {
                            this.init([], function() {
                                return a
                            }, null, {
                                enabled: !0,
                                ignore: !0
                            })
                        })),
                        d = l(p, e.id)) {
                            this.depMaps.push(e);
                            if (this.events.error)
                                d.on("error", u(this, function(a) {
                                    this.emit("error", a)
                                }));
                            d.enable()
                        }
                    } else
                        m = u(this, function(a) {
                            this.init([], function() {
                                return a
                            }, null, {
                                enabled: !0
                            })
                        }),
                        m.error = u(this, function(a) {
                            this.inited = !0;
                            this.error = a;
                            a.requireModules = [b];
                            F(p, function(a) {
                                0 === a.map.id.indexOf(b + "_unnormalized") && x(a.map.id)
                            });
                            v(a)
                        }),
                        m.fromText = u(this, function(e, c) {
                            var d = a.name
                              , g = n(d)
                              , B = O;
                            c && (e = c);
                            B && (O = !1);
                            q(g);
                            s(k.config, b) && (k.config[d] = k.config[b]);
                            try {
                                j.exec(e)
                            } catch (ca) {
                                return v(A("fromtexteval", "fromText eval for " + b + " failed: " + ca, ca, [b]))
                            }
                            B && (O = !0);
                            this.depMaps.push(g);
                            i.completeLoad(d);
                            h([d], m)
                        }),
                        e.load(a.name, h, m, k)
                }));
                i.enable(d, this);
                this.pluginMaps[d.id] = d
            },
            enable: function() {
                T[this.map.id] = this;
                this.enabling = this.enabled = !0;
                y(this.depMaps, u(this, function(a, b) {
                    var c, e;
                    if ("string" === typeof a) {
                        a = n(a, this.map.isDefine ? this.map : this.map.parentMap, !1, !this.skipMap);
                        this.depMaps[b] = a;
                        if (c = l(N, a.id)) {
                            this.depExports[b] = c(this);
                            return
                        }
                        this.depCount += 1;
                        t(a, "defined", u(this, function(a) {
                            this.defineDep(b, a);
                            this.check()
                        }));
                        this.errback && t(a, "error", u(this, this.errback))
                    }
                    c = a.id;
                    e = p[c];
                    !s(N, c) && (e && !e.enabled) && i.enable(a, this)
                }));
                F(this.pluginMaps, u(this, function(a) {
                    var b = l(p, a.id);
                    b && !b.enabled && i.enable(a, this)
                }));
                this.enabling = !1;
                this.check()
            },
            on: function(a, b) {
                var c = this.events[a];
                c || (c = this.events[a] = []);
                c.push(b)
            },
            emit: function(a, b) {
                y(this.events[a], function(a) {
                    a(b)
                });
                "error" === a && delete this.events[a]
            }
        };
        i = {
            config: k,
            contextName: b,
            registry: p,
            defined: r,
            urlFetched: S,
            defQueue: G,
            Module: X,
            makeModuleMap: n,
            nextTick: j.nextTick,
            onError: v,
            configure: function(a) {
                a.baseUrl && "/" !== a.baseUrl.charAt(a.baseUrl.length - 1) && (a.baseUrl += "/");
                var b = k.pkgs
                  , c = k.shim
                  , e = {
                    paths: !0,
                    config: !0,
                    map: !0
                };
                F(a, function(a, b) {
                    e[b] ? "map" === b ? (k.map || (k.map = {}),
                    Q(k[b], a, !0, !0)) : Q(k[b], a, !0) : k[b] = a
                });
                a.shim && (F(a.shim, function(a, b) {
                    I(a) && (a = {
                        deps: a
                    });
                    if ((a.exports || a.init) && !a.exportsFn)
                        a.exportsFn = i.makeShimExports(a);
                    c[b] = a
                }),
                k.shim = c);
                a.packages && (y(a.packages, function(a) {
                    a = "string" === typeof a ? {
                        name: a
                    } : a;
                    b[a.name] = {
                        name: a.name,
                        location: a.location || a.name,
                        main: (a.main || "main").replace(ja, "").replace(ea, "")
                    }
                }),
                k.pkgs = b);
                F(p, function(a, b) {
                    !a.inited && !a.map.unnormalized && (a.map = n(b))
                });
                if (a.deps || a.callback)
                    i.require(a.deps || [], a.callback)
            },
            makeShimExports: function(a) {
                return function() {
                    var b;
                    a.init && (b = a.init.apply(Z, arguments));
                    return b || a.exports && ba(a.exports)
                }
            },
            makeRequire: function(a, f) {
                function d(e, c, h) {
                    var g, k;
                    f.enableBuildCallback && (c && H(c)) && (c.__requireJsBuild = !0);
                    if ("string" === typeof e) {
                        if (H(c))
                            return v(A("requireargs", "Invalid require call"), h);
                        if (a && s(N, e))
                            return N[e](p[a.id]);
                        if (j.get)
                            return j.get(i, e, a, d);
                        g = n(e, a, !1, !0);
                        g = g.id;
                        return !s(r, g) ? v(A("notloaded", 'Module name "' + g + '" has not been loaded yet for context: ' + b + (a ? "" : ". Use require([])"))) : r[g]
                    }
                    K();
                    i.nextTick(function() {
                        K();
                        k = q(n(null, a));
                        k.skipMap = f.skipMap;
                        k.init(e, c, h, {
                            enabled: !0
                        });
                        C()
                    });
                    return d
                }
                f = f || {};
                Q(d, {
                    isBrowser: z,
                    toUrl: function(b) {
                        var d, f = b.lastIndexOf("."), g = b.split("/")[0];
                        if (-1 !== f && (!("." === g || ".." === g) || 1 < f))
                            d = b.substring(f, b.length),
                            b = b.substring(0, f);
                        return i.nameToUrl(c(b, a && a.id, !0), d, !0)
                    },
                    defined: function(b) {
                        return s(r, n(b, a, !1, !0).id)
                    },
                    specified: function(b) {
                        b = n(b, a, !1, !0).id;
                        return s(r, b) || s(p, b)
                    }
                });
                a || (d.undef = function(b) {
                    w();
                    var c = n(b, a, !0)
                      , f = l(p, b);
                    delete r[b];
                    delete S[c.url];
                    delete Y[b];
                    f && (f.events.defined && (Y[b] = f.events),
                    x(b))
                }
                );
                return d
            },
            enable: function(a) {
                l(p, a.id) && q(a).enable()
            },
            completeLoad: function(a) {
                var b, c, e = l(k.shim, a) || {}, d = e.exports;
                for (w(); G.length; ) {
                    c = G.shift();
                    if (null === c[0]) {
                        c[0] = a;
                        if (b)
                            break;
                        b = !0
                    } else
                        c[0] === a && (b = !0);
                    D(c)
                }
                c = l(p, a);
                if (!b && !s(r, a) && c && !c.inited) {
                    if (k.enforceDefine && (!d || !ba(d)))
                        return h(a) ? void 0 : v(A("nodefine", "No define call for " + a, null, [a]));
                    D([a, e.deps || [], e.exportsFn])
                }
                C()
            },
            nameToUrl: function(a, b, c) {
                var e, d, h, g, i, n;
                if (j.jsExtRegExp.test(a))
                    g = a + (b || "");
                else {
                    e = k.paths;
                    d = k.pkgs;
                    g = a.split("/");
                    for (i = g.length; 0 < i; i -= 1)
                        if (n = g.slice(0, i).join("/"),
                        h = l(d, n),
                        n = l(e, n)) {
                            I(n) && (n = n[0]);
                            g.splice(0, i, n);
                            break
                        } else if (h) {
                            a = a === h.name ? h.location + "/" + h.main : h.location;
                            g.splice(0, i, a);
                            break
                        }
                    g = g.join("/");
                    g += b || (/\?/.test(g) || c ? "" : ".js");
                    g = ("/" === g.charAt(0) || g.match(/^[\w\+\.\-]+:/) ? "" : k.baseUrl) + g
                }
                return k.urlArgs ? g + ((-1 === g.indexOf("?") ? "?" : "&") + k.urlArgs) : g
            },
            load: function(a, b) {
                j.load(i, a, b)
            },
            execCb: function(a, b, c, e) {
                return b.apply(e, c)
            },
            onScriptLoad: function(a) {
                if ("load" === a.type || ka.test((a.currentTarget || a.srcElement).readyState))
                    P = null,
                    a = J(a),
                    i.completeLoad(a.id)
            },
            onScriptError: function(a) {
                var b = J(a);
                if (!h(b.id))
                    return v(A("scripterror", "Script error for: " + b.id, a, [b.id]))
            }
        };
        i.require = i.makeRequire();
        return i
    }
    var j, w, x, C, J, D, P, K, q, fa, la = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, ma = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g, ea = /\.js$/, ja = /^\.\//;
    w = Object.prototype;
    var L = w.toString
      , ga = w.hasOwnProperty
      , ia = Array.prototype.splice
      , z = !!("undefined" !== typeof window && navigator && window.document)
      , da = !z && "undefined" !== typeof importScripts
      , ka = z && "PLAYSTATION 3" === navigator.platform ? /^complete$/ : /^(complete|loaded)$/
      , W = "undefined" !== typeof opera && "[object Opera]" === opera.toString()
      , E = {}
      , t = {}
      , R = []
      , O = !1;
    if ("undefined" === typeof define) {
        if ("undefined" !== typeof requirejs) {
            if (H(requirejs))
                return;
            t = requirejs;
            requirejs = void 0
        }
        "undefined" !== typeof require && !H(require) && (t = require,
        require = void 0);
        j = requirejs = function(b, c, d, h) {
            var q, n = "_";
            !I(b) && "string" !== typeof b && (q = b,
            I(c) ? (b = c,
            c = d,
            d = h) : b = []);
            q && q.context && (n = q.context);
            (h = l(E, n)) || (h = E[n] = j.s.newContext(n));
            q && h.configure(q);
            return h.require(b, c, d)
        }
        ;
        j.config = function(b) {
            return j(b)
        }
        ;
        j.nextTick = "undefined" !== typeof setTimeout ? function(b) {
            setTimeout(b, 4)
        }
        : function(b) {
            b()
        }
        ;
        require || (require = j);
        j.version = "2.1.8";
        j.jsExtRegExp = /^\/|:|\?|\.js$/;
        j.isBrowser = z;
        w = j.s = {
            contexts: E,
            newContext: ha
        };
        j({});
        y(["toUrl", "undef", "defined", "specified"], function(b) {
            j[b] = function() {
                var c = E._;
                return c.require[b].apply(c, arguments)
            }
        });
        if (z && (x = w.head = document.getElementsByTagName("head")[0],
        C = document.getElementsByTagName("base")[0]))
            x = w.head = C.parentNode;
        j.onError = aa;
        j.createNode = function(b) {
            var c = b.xhtml ? document.createElementNS("http://www.w3.org/1999/xhtml", "html:script") : document.createElement("script");
            c.type = b.scriptType || "text/javascript";
            c.charset = "utf-8";
            c.async = !0;
            return c
        }
        ;
        j.load = function(b, c, d) {
            var h = b && b.config || {};
            if (z)
                return h = j.createNode(h, c, d),
                h.setAttribute("data-requirecontext", b.contextName),
                h.setAttribute("data-requiremodule", c),
                h.attachEvent && !(h.attachEvent.toString && 0 > h.attachEvent.toString().indexOf("[native code")) && !W ? (O = !0,
                h.attachEvent("onreadystatechange", b.onScriptLoad)) : (h.addEventListener("load", b.onScriptLoad, !1),
                h.addEventListener("error", b.onScriptError, !1)),
                h.src = d,
                K = h,
                // C ? x.insertBefore(h, C) : x.appendChild(h),
                K = null,
                h;
            if (da)
                try {
                    importScripts(d),
                    b.completeLoad(c)
                } catch (l) {
                    b.onError(A("importscripts", "importScripts failed for " + c + " at " + d, l, [c]))
                }
        }
        ;
        z && M(document.getElementsByTagName("script"), function(b) {
            x || (x = b.parentNode);
            if (J = b.getAttribute("data-main"))
                return q = J,
                t.baseUrl || (D = q.split("/"),
                q = D.pop(),
                fa = D.length ? D.join("/") + "/" : "./",
                t.baseUrl = fa),
                q = q.replace(ea, ""),
                j.jsExtRegExp.test(q) && (q = J),
                t.deps = t.deps ? t.deps.concat(q) : [q],
                !0
        });
        define = function(b, c, d) {
            var h, j;
            "string" !== typeof b && (d = c,
            c = b,
            b = null);
            I(c) || (d = c,
            c = null);
            !c && H(d) && (c = [],
            d.length && (d.toString().replace(la, "").replace(ma, function(b, d) {
                c.push(d)
            }),
            c = (1 === d.length ? ["require"] : ["require", "exports", "module"]).concat(c)));
            if (O) {
                if (!(h = K))
                    P && "interactive" === P.readyState || M(document.getElementsByTagName("script"), function(b) {
                        if ("interactive" === b.readyState)
                            return P = b
                    }),
                    h = P;
                h && (b || (b = h.getAttribute("data-requiremodule")),
                j = E[h.getAttribute("data-requirecontext")])
            }
            (j ? j.defQueue : R).push([b, c, d])
        }
        ;
        define.amd = {
            jQuery: !0
        };
        j.exec = function(b) {
            return eval(b)
        }
        ;
        j(t)
    }
}
)(this);

//Code adapted from VexWarp

function saveWavFile(audioDataInt16, sampleRate, numChannels) {
    // MAKE SAMPLE RATE ADJUSTABLE
    let decimalLength = audioDataInt16.length * 2 + 44
    const part1 = decimalLength / Math.pow(256, 3)
    const part2 = decimalLength % Math.pow(256, 3) / Math.pow(256, 2)
    const part3 = decimalLength % Math.pow(256, 3) % Math.pow(256, 2) / Math.pow(256, 1)
    const part4 = decimalLength % Math.pow(256, 3) % Math.pow(256, 2) % Math.pow(256, 1) / Math.pow(256, 0)
    decimalLength =  audioDataInt16.length * 2
    const part1b = decimalLength / Math.pow(256, 3)
    const part2b = decimalLength % Math.pow(256, 3) / Math.pow(256, 2)
    const part3b = decimalLength % Math.pow(256, 3) % Math.pow(256, 2) / Math.pow(256, 1)
    const part4b = decimalLength % Math.pow(256, 3) % Math.pow(256, 2) % Math.pow(256, 1) / Math.pow(256, 0)
    let header = [
        82,
        73,
        70,
        70,
        parseInt(part4),
        parseInt(part3),
        parseInt(part2),
        parseInt(part1),
        87,
        65,
        86,
        69,
        102,
        109,
        116,
        32,
        16,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        128,
        187,
        0,
        0,
        136,
        88,
        1,
        0,
        2,
        0,
        16,
        0,
        100,
        97,
        116,
        97,
        parseInt(part4b),
        parseInt(part3b),
        parseInt(part2b),
        parseInt(part1b)
    ]
    let audioData = audioDataInt16.getChannelData(0);

    let maxValue = audioData[0];
    let minValue = audioData[0];
    
    for (let i = 1; i < audioData.length; i++) {
        if (audioData[i] > maxValue) {
            maxValue = audioData[i];
        }
        if (audioData[i] < minValue) {
            minValue = audioData[i];
        }
    }

    const factor = maxValue - minValue;

    for (let i = 0; i < audioDataInt16.length; i++) {
        let byte = ((audioData[i] / factor) + 0.6)*(256**2 - 1)*0.8
        if (byte > (16**4)/2) {
            byte = byte - ((256**2)/2 - 1)
        }
        else if (byte < (16**4)/2){
            byte = byte + ((256**2)/2 - 1)
        }
        header.push(parseInt(byte % 256));
        header.push(parseInt(byte / 256));
    }
    return header;
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = filename || 'audio.wav';
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
    // URL.revokeObjectURL(url);
}

function WindowFunction(e, t) {
    this.alpha = t;
    switch (e) {
    case DSP.BARTLETT:
        this.func = WindowFunction.Bartlett;
        break;
    case DSP.BARTLETTHANN:
        this.func = WindowFunction.BartlettHann;
        break;
    case DSP.BLACKMAN:
        this.func = WindowFunction.Blackman,
        this.alpha = this.alpha || .16;
        break;
    case DSP.COSINE:
        this.func = WindowFunction.Cosine;
        break;
    case DSP.GAUSS:
        this.func = WindowFunction.Gauss,
        this.alpha = this.alpha || .25;
        break;
    case DSP.HAMMING:
        this.func = WindowFunction.Hamming;
        break;
    case DSP.HANN:
        this.func = WindowFunction.Hann;
        break;
    case DSP.LANCZOS:
        this.func = WindowFunction.Lanczoz;
        break;
    case DSP.RECTANGULAR:
        this.func = WindowFunction.Rectangular;
        break;
    case DSP.TRIANGULAR:
        this.func = WindowFunction.Triangular
    }
}
var DSP = {
    LEFT: 0,
    RIGHT: 1,
    MIX: 2,
    SINE: 1,
    TRIANGLE: 2,
    SAW: 3,
    SQUARE: 4,
    LOWPASS: 0,
    HIGHPASS: 1,
    BANDPASS: 2,
    NOTCH: 3,
    BARTLETT: 1,
    BARTLETTHANN: 2,
    BLACKMAN: 3,
    COSINE: 4,
    GAUSS: 5,
    HAMMING: 6,
    HANN: 7,
    LANCZOS: 8,
    RECTANGULAR: 9,
    TRIANGULAR: 10,
    OFF: 0,
    FW: 1,
    BW: 2,
    FWBW: 3,
    TWO_PI: 2 * Math.PI
};
WindowFunction.prototype.process = function(e) {
    var t = e.length;
    for (var n = 0; n < t; n++)
        e[n] *= this.func(t, n, this.alpha);
    return e
}
,
WindowFunction.Hann = function(e, t) {
    return .5 * (1 - Math.cos(DSP.TWO_PI * t / (e - 1)))
}
async function save(samples, noteAdjust) {
    const audioData = samples;
    const sampleRate = 48000;
    const numChannels = 1;
    const filename = `${parseInt(noteAdjust)}.wav`;
    const waveBuffer = saveWavFile(audioData, sampleRate, numChannels);
    await fetch('/osc-samples' + '?filename=' + filename + '&osc=1', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: `${waveBuffer.toString()}`
    });
}

function getFileName(filePath) {
  // Split by forward slash and then by backslash to handle mixed paths
  const parts = filePath.split('/').pop().split('\\');
  return parts.at(-1);
}

require(["main"], function(main) {
    var warp = new main.warpApp();
    const sampleSelectInput = document.getElementById("openSampleInput");
    const folderBtn = document.getElementById('openSampleBtn');
    const sampleSelect = document.getElementById('sampleSelect'); 
    const playSampleBtn = document.getElementById('playSampleBtn'); 

    // make folder button trigger dropdown
    folderBtn.addEventListener('click', () => {
        sampleSelectInput.focus();
        sampleSelectInput.click();
    });

    // when user selects a preset
    sampleSelect.addEventListener('change', async () => {
    const fileName = sampleSelect.value;
    if (!fileName) return;
    
    try {
        const res = await fetch(`/samples/${fileName}`);
        const arrayBuffer = await res.arrayBuffer();
        var sampleBuffer = await audioContext.decodeAudioData(arrayBuffer);
        sampleSelect.options[0].textContent = "Choose a preset";
        let pitch = await fetch("/pitch", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file: `/samples/${fileName}`
            })
        }).then(response => {
            return response.text();
        });
        if (pitch == null || pitch > 10000 || pitch < 40) {
            // NOTIFY USER OF PITCH NOT BEING DETECTED 
            pitch = 440;
        }
        const noteAdjust = (12 * Math.log2(pitch / 440));
        for (let i = - noteAdjust; i < 128 - noteAdjust; i++) {
            await save(warp.setup.init(i - 69, sampleBuffer), Math.round(i + noteAdjust));
        }
        playSampleBtn.disabled = false;
    } catch (err) {
        console.error("Sample load error:", err);
        playSampleBtn.disabled = true;
    }
    });

    sampleSelectInput.addEventListener('change', async (e) => {
            const openName = document.getElementById('sampleSelect'); 
            const file = e.target.files && e.target.files[0];
            const fileName = sampleSelectInput.value;
            if (!file) return;
            openName.options[0].textContent = getFileName(fileName);
            try {
                var sampleBuffer = (await audioContext.decodeAudioData(await file.arrayBuffer()));
                var audioBuffer = sampleBuffer;
                const buffer = saveWavFile(audioBuffer, audioContext.sampleRate, 1);
                let pitch = await fetch("/pitch", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        buffer: buffer.toString(),
                    })
                }).then(response => {
                    return response.text();
                });
                if (pitch == null || pitch > 10000 || pitch < 40) {
                    // NOTIFY USER OF PITCH NOT BEING DETECTED 
                    pitch = 440;
                }
                const noteAdjust = (12 * Math.log2(pitch / 440));
                for (let i = - noteAdjust; i < 128 - noteAdjust; i++) {
                    await save(warp.setup.init(i - 69, sampleBuffer), Math.round(i + noteAdjust));
                }
            } catch (err) {
                console.error("Sample load error:", err);
            }
        });
}),
define("main", function() {
var Spectrum = function() {
        function t() {
            e // && console.log(Array.prototype.slice.call(arguments).join(" "))
        }
        function i(e, t) {
            this.init(e, t)
        }
        var e = !0;
        // return hanning = new s(r.HANN),
        i.calculatePeaks = function(e) {
            var t = 0
              , n = 0;
            for (var r = 0; r < e.length; ++r) {
                var i = e[r];
                i > 0 && i > t && (t = i),
                i < 0 && i < n && (n = i)
            }
            return [n, t]
        }
        ,
        i.prototype = {
            init: function(e, t) {
                this.options = {
                    fftSize: 256,
                    frameSize: 8192,
                    sampleRate: 44100
                },
                this.buffers = e,
                n.merge(this.options, t)
            },
            getSampleNumber: function(e) {
                return parseInt(e * this.options.sampleRate)
            },
            getBuffer: function(e, n, r) {
                if (!n)
                    return this.buffers[e];
                var i = this.buffers[e].length
                  , s = this.getSampleNumber(n)
                  , o = r > 0 ? this.getSampleNumber(r) : i - s;
                return t("getBuffer: ", s, o),
                this.buffers[e].subarray(s, s + o)
            },
            getNumFrames: function(e) {
                return Math.ceil(buffers[e].length / frameSize)
            },
            getNumChannels: function() {
                return this.buffers.length
            },
            getFrameBuffer: function(e, t) {
                return this.buffers[e].subarray(t * frameSize, t * frameSize + frameSize)
            },
            getLengthSeconds: function() {
                return this.buffers[0].length / this.options.sampleRate
            },
            plot: function(e, t, r, s, o, u) {
                var a = this.getBuffer(s, o, u)
                  , f = i.calculatePeaks(a)
                  , l = r
                  , c = l / 2
                  , h = 0;
                for (var p = 0; p < a.length; p += parseInt(a.length / t) * 2) {
                    n.onProgress({
                        total_stages: 0,
                        current_window: p,
                        total_windows: a.length
                    }, "Plot: ");
                    var d = a[p];
                    d > 0 ? e.fillRect(h, c, 2, d / f[1] * c) : d < 0 && e.fillRect(h, c, 2, d / f[0] * -c),
                    h += 2
                }
                return n.onProgress({
                    complete: !0
                }, "Plot: "),
                this
            }
        }
    }
    class TimeStretcher {
        o() {
            n // && console.log(Array.prototype.slice.call(arguments).join(" "))
        }
        u(e) {
            this.init(e)
        }
        a(e, n) {
            n || (n = ""),
            t.onProgress(e, n)
        }
        f(e, t) {
            return Math.atan2(e.imag[t], e.real[t])
        }
        stretchFactor = 1;
        n = !0
            init(e) {
                return this.options = {
                    vocode: !1,
                    stftBins: 8192,
                    stftHop: .25,
                    stretchFactor: 1.5,
                    sampleRate: 44100,
                    progressCallback: a
                },
                t.merge(this.options, e),
                this.stretched_buffer = null,
                this.resampled_buffer = null,
                this
            }
            setBuffer(e, t) {
                return this.buffer = e,
                this.stretched_buffer = null,
                this.resampled_buffer = null,
                t && (this.options.sampleRate = t),
                this
            }
            getBuffer() {
                return this.buffer
            }
            getStretchFactor() {
                return this.options.stretchFactor
            }
            getStretchedBuffer() {
                return this.stretched_buffer
            }
            getPitchShiftedBuffer() {
                return this.resampled_buffer
            }
            getOptions() {
                return this.options
            }
            stretch() {
                if (!this.buffer)
                    throw "Error: TimeStretcher.setBuffer() must be called before stretch()";
                if (this.stretched_buffer)
                    return this.stretched_buffer;
                var e = this
                  , n = 8192
                  , u = !1
                  , a = parseInt(n * 0.25)
                  , l = parseInt(a * 1 * this.stretchFactor) // speed
                  , c = 48000
                  , h = this.buffer
                  , p = 1 / c
                  , d = h.length
                  , v = new WindowFunction(DSP.HANN)
                  , m = 1.5 * this.stretchFactor; // speed and pitch
                // console.log("Starting time stretch (" + m + "x). Buffer size: " + d);
                var g = 0
                  , y = [];
                for (var b = 0; b < d - n; b += a) {
                    var w = new Float32Array(n);
                    w.set(h.subarray(b, b + n));
                    if (w.length < n)
                        break;
                    if (u) {
                        var E = new i(n,c);
                        E.forward(v.process(w)),
                        y.push(E);
                        var S = E;
                        g++;
                        if (g > 1) {
                            var x = y[g - 2];
                            for (var T = 0; T < n; ++T) {
                                var N = f(S, T) - f(x, T)
                                  , C = N / (a / c) - E.getBandFrequency(T)
                                  , k = (C + Math.PI) % (2 * Math.PI) - Math.PI
                                  , A = E.getBandFrequency(T) + k
                                  , O = f(x, T) + l / c * A
                                  , M = Math.sqrt(S.real[T] * S.real[T] + S.imag[T] * S.imag[T]);
                                S.real[T] = M * Math.cos(O),
                                S.imag[T] = M * Math.sin(O)
                            }
                        }
                    } else {
                        y.push(v.process(w)),
                        g++;
                    }
                }
                // console.log("Analysis complete: " + g + " frames.");
                var _ = new Float32Array(parseInt(d * m))
                  , D = 0
                  , P = 0;
                for (var H = 0; H < y.length; ++H) {
                    var E = y[H]
                      , B = u ? v.process(E.inverse()) : E;
                    for (var j = 0; j < B.length; ++j)
                        _[D + j] += B[j];
                    P += B.length,
                    D += l
                }
                return true,
                this.stretched_buffer = _,
                this
            }
            resize(e) {
                var n = this.stretched_buffer
                  , r = new Float32Array(e);
                return this.resampled_buffer = this.interpolateArray(n, r, e),
                this
            }
            interpolateArray(e, t, n) {
                var r = new Number((e.length - 1) / (n - 1));
                t[0] = e[0];
                for (var s = 1; s < n - 1; s++) {
                    var o = s * r
                    , u = Math.floor(o)
                    , a = Math.ceil(o)
                    , f = o - u;
                    t[s] = e[u] + (e[a] - e[u]) * f
                }
                return true,
                t[n - 1] = e[e.length - 1],
                t
            }
    }

  class warpApp {
        o() {
            t // && console.log(Array.prototype.slice.call(arguments).join(" "))
        }
        u(e, t, n, r) {
            var i = t.sampleRate
              , s = t.length
              , o = t.numberOfChannels
              , u = parseInt(n * i)
              , a = parseInt(r * i)
              , f = a - u
              , l = e.createBuffer(o, f, i);
            for (var c = 0; c < o; ++c)
                l.getChannelData(c).set(t.getChannelData(c).subarray(u, a));
            return l
        }
        a(t) {
            e(t).fadeIn(1e3),
            window.setTimeout(function() {
                e(t).fadeOut(1e3),
                window.setTimeout(function() {
                    a(t)
                }, 12e4)
            }, 25e3)
        }
        f(e) {
            this.init(e)
        }

        t = !0;
        setup = {
            init: function(t, samples) {
                this.actx = audioContext;
                var u = this;
                this.buffer = samples,
                this.playBuffer = null,
                this.fileName = "",
                this.loaded = !1,
                this.stretchFactor = 1,
                this.pitchShift = 0,
                this.loop = !0,
                this.playing = !1,
                typeof chrome == "object" // && (typeof chrome.app.runtime == "undefined" ? (console.log("VexWarp running in browser. Hello world!")
                // )
                // : 
                // console.log("VexWarp running in app. Hello world!"))
                return u.stretch(t);
            },
            stretch: function(pitchShift) {
                var e = this.buffer;
                var actx = audioContext;
                if (!e)
                    return;
                var a = e;
                var stretchFactor = 1.5;
                var f = Math.pow(2, pitchShift / 12)
                  , l = stretchFactor * f
                  , c = a.length * stretchFactor;
                // console.log("Stretching: ", stretchFactor, "Shifting: ", f);
                var h = new TimeStretcher({
                    sampleRate: e.sampleRate,
                    stretchFactor: l
                })
                  , p = []
                  , d = actx.createBuffer(a.numberOfChannels, c, a.sampleRate);
                h.stretchFactor = f;
                for (var v = 0; v < a.numberOfChannels; ++v) {
                    // console.log("Stretching channel: ", v);
                    h.setBuffer(a.getChannelData(v)).stretch();
                    p[v] = f ? h.resize(c).getPitchShiftedBuffer() : h.getStretchedBuffer();
                    d.getChannelData(v).set(p[v]);
                }
                this.playBuffer = d;
                return this.playBuffer;
            },
            loadFile: function(t) {
                var n = t.target.files
                  , i = new FileReader
                  , o = this;
                i.onerror = function(e) {
                    // console.log.error("Couldn't decode audio format.")
                }
                ,
                i.onabort = function(e) {
                    // console.log.error("Load cancelled.")
                }
                ,
                i.onloadstart = function(e) {
                    // console.log("Loading...")
                }
                ,
                i.onloadend = function(t) {
                    // console.log("Decoding..."),
                    o.actx.decodeAudioData(t.target.result, function(t) {
                        o.buffer = t;
                    }, i.onerror)
                }
                ;
                for (var u = 0, a; a = n[u]; u++)
                    o.fileName = a.name,
                    i.readAsArrayBuffer(a)
            }
        }
        f
  }
  return {
    warpApp
  };

});