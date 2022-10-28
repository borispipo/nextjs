// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
function find(method, pathname) {
    let middleOnly = true;
    const fns = [];
    const params = {};
    const isHead = method === "HEAD";
    for (const route of this.routes) {
        if (route.method !== method &&
            // matches any method
            route.method !== "" &&
            // The HEAD method requests that the target resource transfer a representation of its state, as for a GET request...
            !(isHead && route.method === "GET")) {
            continue;
        }
        let matched = false;
        if ("matchAll" in route) {
            matched = true;
        }
        else {
            if (route.keys === false) {
                // routes.key is RegExp: https://github.com/lukeed/regexparam/blob/master/src/index.js#L2
                const matches = route.pattern.exec(pathname);
                if (matches === null)
                    continue;
                if (matches.groups !== void 0)
                    for (const k in matches.groups)
                        params[k] = matches.groups[k];
                matched = true;
            }
            else if (route.keys.length > 0) {
                const matches = route.pattern.exec(pathname);
                if (matches === null)
                    continue;
                for (let j = 0; j < route.keys.length;)
                    params[route.keys[j]] = matches[++j];
                matched = true;
            }
            else if (route.pattern.test(pathname)) {
                matched = true;
            } // else not a match
        }
        if (matched) {
            fns.push(...route.fns
                .map((fn) => {
                if (fn instanceof Router) {
                    const base = fn.base;
                    let stripPathname = pathname.substring(base.length);
                    // fix stripped pathname, not sure why this happens
                    if (stripPathname[0] != "/")
                        stripPathname = `/${stripPathname}`;
                    const result = fn.find(method, stripPathname);
                    if (!result.middleOnly)
                        middleOnly = false;
                    // merge params
                    Object.assign(params, result.params);
                    return result.fns;
                }
                return fn;
            })
                .flat());
            if (!route.isMiddle)
                middleOnly = false;
        }
    }
    return { fns, params, middleOnly };
}
