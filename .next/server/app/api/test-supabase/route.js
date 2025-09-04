"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/test-supabase/route";
exports.ids = ["app/api/test-supabase/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftest-supabase%2Froute&page=%2Fapi%2Ftest-supabase%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftest-supabase%2Froute.ts&appDir=C%3A%5CUsers%5CHP%5CDesktop%5Cprojectt%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CHP%5CDesktop%5Cprojectt&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftest-supabase%2Froute&page=%2Fapi%2Ftest-supabase%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftest-supabase%2Froute.ts&appDir=C%3A%5CUsers%5CHP%5CDesktop%5Cprojectt%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CHP%5CDesktop%5Cprojectt&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_HP_Desktop_projectt_src_app_api_test_supabase_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/test-supabase/route.ts */ \"(rsc)/./src/app/api/test-supabase/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/test-supabase/route\",\n        pathname: \"/api/test-supabase\",\n        filename: \"route\",\n        bundlePath: \"app/api/test-supabase/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\HP\\\\Desktop\\\\projectt\\\\src\\\\app\\\\api\\\\test-supabase\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_HP_Desktop_projectt_src_app_api_test_supabase_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/test-supabase/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZ0ZXN0LXN1cGFiYXNlJTJGcm91dGUmcGFnZT0lMkZhcGklMkZ0ZXN0LXN1cGFiYXNlJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGdGVzdC1zdXBhYmFzZSUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNIUCU1Q0Rlc2t0b3AlNUNwcm9qZWN0dCU1Q3NyYyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDSFAlNUNEZXNrdG9wJTVDcHJvamVjdHQmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9c3RhbmRhbG9uZSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ3dCO0FBQ3JHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsdUdBQXVHO0FBQy9HO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDNko7O0FBRTdKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vb2JzaWRpYW4td2Vhci8/MDdiMyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxIUFxcXFxEZXNrdG9wXFxcXHByb2plY3R0XFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXHRlc3Qtc3VwYWJhc2VcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwic3RhbmRhbG9uZVwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS90ZXN0LXN1cGFiYXNlL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvdGVzdC1zdXBhYmFzZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdGVzdC1zdXBhYmFzZS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXEhQXFxcXERlc2t0b3BcXFxccHJvamVjdHRcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcdGVzdC1zdXBhYmFzZVxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS90ZXN0LXN1cGFiYXNlL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftest-supabase%2Froute&page=%2Fapi%2Ftest-supabase%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftest-supabase%2Froute.ts&appDir=C%3A%5CUsers%5CHP%5CDesktop%5Cprojectt%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CHP%5CDesktop%5Cprojectt&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/test-supabase/route.ts":
/*!********************************************!*\
  !*** ./src/app/api/test-supabase/route.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\n\n// Ensure we use Node.js runtime for Supabase compatibility\nconst runtime = \"nodejs\";\nasync function GET() {\n    try {\n        // Check if environment variables are set\n        const supabaseUrl = \"https://zrmxcjklkthpyanfslsw.supabase.co\";\n        const supabaseKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybXhjamtsa3RocHlhbmZzbHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDYxMzAsImV4cCI6MjA3MjQ4MjEzMH0.2Tjh9pPzc6BUGoV3lDUBymXzE_dvAGs1O_WewTdetE0\";\n        if (!supabaseUrl || !supabaseKey) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                success: false,\n                error: \"Missing Supabase environment variables\",\n                details: {\n                    hasUrl: !!supabaseUrl,\n                    hasKey: !!supabaseKey,\n                    url: supabaseUrl ? \"Set\" : \"Missing\",\n                    key: supabaseKey ? \"Set\" : \"Missing\"\n                }\n            }, {\n                status: 500\n            });\n        }\n        // Create Supabase client\n        const supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(supabaseUrl, supabaseKey);\n        // Test connection by querying a simple table\n        const { data, error } = await supabase.from(\"products\").select(\"count\").limit(1);\n        if (error) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                success: false,\n                error: \"Supabase connection failed\",\n                details: {\n                    error: error.message,\n                    code: error.code,\n                    hint: error.hint\n                }\n            }, {\n                status: 500\n            });\n        }\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            success: true,\n            message: \"Supabase connection successful\",\n            details: {\n                url: supabaseUrl,\n                hasData: !!data,\n                timestamp: new Date().toISOString()\n            }\n        });\n    } catch (error) {\n        console.error(\"Supabase test error:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            success: false,\n            error: \"Unexpected error\",\n            details: {\n                message: error instanceof Error ? error.message : \"Unknown error\"\n            }\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS90ZXN0LXN1cGFiYXNlL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBMkM7QUFDVTtBQUVyRCwyREFBMkQ7QUFDcEQsTUFBTUUsVUFBVSxTQUFTO0FBRXpCLGVBQWVDO0lBQ3BCLElBQUk7UUFDRix5Q0FBeUM7UUFDekMsTUFBTUMsY0FBY0MsMENBQW9DO1FBQ3hELE1BQU1HLGNBQWNILGtOQUF5QztRQUU3RCxJQUFJLENBQUNELGVBQWUsQ0FBQ0ksYUFBYTtZQUNoQyxPQUFPUixrRkFBWUEsQ0FBQ1UsSUFBSSxDQUFDO2dCQUN2QkMsU0FBUztnQkFDVEMsT0FBTztnQkFDUEMsU0FBUztvQkFDUEMsUUFBUSxDQUFDLENBQUNWO29CQUNWVyxRQUFRLENBQUMsQ0FBQ1A7b0JBQ1ZRLEtBQUtaLGNBQWMsUUFBUTtvQkFDM0JhLEtBQUtULGNBQWMsUUFBUTtnQkFDN0I7WUFDRixHQUFHO2dCQUFFVSxRQUFRO1lBQUk7UUFDbkI7UUFFQSx5QkFBeUI7UUFDekIsTUFBTUMsV0FBV2xCLG1FQUFZQSxDQUFDRyxhQUFhSTtRQUUzQyw2Q0FBNkM7UUFDN0MsTUFBTSxFQUFFWSxJQUFJLEVBQUVSLEtBQUssRUFBRSxHQUFHLE1BQU1PLFNBQzNCRSxJQUFJLENBQUMsWUFDTEMsTUFBTSxDQUFDLFNBQ1BDLEtBQUssQ0FBQztRQUVULElBQUlYLE9BQU87WUFDVCxPQUFPWixrRkFBWUEsQ0FBQ1UsSUFBSSxDQUFDO2dCQUN2QkMsU0FBUztnQkFDVEMsT0FBTztnQkFDUEMsU0FBUztvQkFDUEQsT0FBT0EsTUFBTVksT0FBTztvQkFDcEJDLE1BQU1iLE1BQU1hLElBQUk7b0JBQ2hCQyxNQUFNZCxNQUFNYyxJQUFJO2dCQUNsQjtZQUNGLEdBQUc7Z0JBQUVSLFFBQVE7WUFBSTtRQUNuQjtRQUVBLE9BQU9sQixrRkFBWUEsQ0FBQ1UsSUFBSSxDQUFDO1lBQ3ZCQyxTQUFTO1lBQ1RhLFNBQVM7WUFDVFgsU0FBUztnQkFDUEcsS0FBS1o7Z0JBQ0x1QixTQUFTLENBQUMsQ0FBQ1A7Z0JBQ1hRLFdBQVcsSUFBSUMsT0FBT0MsV0FBVztZQUNuQztRQUNGO0lBRUYsRUFBRSxPQUFPbEIsT0FBTztRQUNkbUIsUUFBUW5CLEtBQUssQ0FBQyx3QkFBd0JBO1FBQ3RDLE9BQU9aLGtGQUFZQSxDQUFDVSxJQUFJLENBQUM7WUFDdkJDLFNBQVM7WUFDVEMsT0FBTztZQUNQQyxTQUFTO2dCQUNQVyxTQUFTWixpQkFBaUJvQixRQUFRcEIsTUFBTVksT0FBTyxHQUFHO1lBQ3BEO1FBQ0YsR0FBRztZQUFFTixRQUFRO1FBQUk7SUFDbkI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL29ic2lkaWFuLXdlYXIvLi9zcmMvYXBwL2FwaS90ZXN0LXN1cGFiYXNlL3JvdXRlLnRzPzYwY2EiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xyXG5cclxuLy8gRW5zdXJlIHdlIHVzZSBOb2RlLmpzIHJ1bnRpbWUgZm9yIFN1cGFiYXNlIGNvbXBhdGliaWxpdHlcclxuZXhwb3J0IGNvbnN0IHJ1bnRpbWUgPSAnbm9kZWpzJztcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIENoZWNrIGlmIGVudmlyb25tZW50IHZhcmlhYmxlcyBhcmUgc2V0XHJcbiAgICBjb25zdCBzdXBhYmFzZVVybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTDtcclxuICAgIGNvbnN0IHN1cGFiYXNlS2V5ID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVk7XHJcblxyXG4gICAgaWYgKCFzdXBhYmFzZVVybCB8fCAhc3VwYWJhc2VLZXkpIHtcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICBlcnJvcjogJ01pc3NpbmcgU3VwYWJhc2UgZW52aXJvbm1lbnQgdmFyaWFibGVzJyxcclxuICAgICAgICBkZXRhaWxzOiB7XHJcbiAgICAgICAgICBoYXNVcmw6ICEhc3VwYWJhc2VVcmwsXHJcbiAgICAgICAgICBoYXNLZXk6ICEhc3VwYWJhc2VLZXksXHJcbiAgICAgICAgICB1cmw6IHN1cGFiYXNlVXJsID8gJ1NldCcgOiAnTWlzc2luZycsXHJcbiAgICAgICAgICBrZXk6IHN1cGFiYXNlS2V5ID8gJ1NldCcgOiAnTWlzc2luZydcclxuICAgICAgICB9XHJcbiAgICAgIH0sIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIFN1cGFiYXNlIGNsaWVudFxyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoc3VwYWJhc2VVcmwsIHN1cGFiYXNlS2V5KTtcclxuXHJcbiAgICAvLyBUZXN0IGNvbm5lY3Rpb24gYnkgcXVlcnlpbmcgYSBzaW1wbGUgdGFibGVcclxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgIC5mcm9tKCdwcm9kdWN0cycpXHJcbiAgICAgIC5zZWxlY3QoJ2NvdW50JylcclxuICAgICAgLmxpbWl0KDEpO1xyXG5cclxuICAgIGlmIChlcnJvcikge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xyXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgIGVycm9yOiAnU3VwYWJhc2UgY29ubmVjdGlvbiBmYWlsZWQnLFxyXG4gICAgICAgIGRldGFpbHM6IHtcclxuICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlLFxyXG4gICAgICAgICAgY29kZTogZXJyb3IuY29kZSxcclxuICAgICAgICAgIGhpbnQ6IGVycm9yLmhpbnRcclxuICAgICAgICB9XHJcbiAgICAgIH0sIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgbWVzc2FnZTogJ1N1cGFiYXNlIGNvbm5lY3Rpb24gc3VjY2Vzc2Z1bCcsXHJcbiAgICAgIGRldGFpbHM6IHtcclxuICAgICAgICB1cmw6IHN1cGFiYXNlVXJsLFxyXG4gICAgICAgIGhhc0RhdGE6ICEhZGF0YSxcclxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1N1cGFiYXNlIHRlc3QgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgIGVycm9yOiAnVW5leHBlY3RlZCBlcnJvcicsXHJcbiAgICAgIGRldGFpbHM6IHtcclxuICAgICAgICBtZXNzYWdlOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ1xyXG4gICAgICB9XHJcbiAgICB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiY3JlYXRlQ2xpZW50IiwicnVudGltZSIsIkdFVCIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInN1cGFiYXNlS2V5IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkiLCJqc29uIiwic3VjY2VzcyIsImVycm9yIiwiZGV0YWlscyIsImhhc1VybCIsImhhc0tleSIsInVybCIsImtleSIsInN0YXR1cyIsInN1cGFiYXNlIiwiZGF0YSIsImZyb20iLCJzZWxlY3QiLCJsaW1pdCIsIm1lc3NhZ2UiLCJjb2RlIiwiaGludCIsImhhc0RhdGEiLCJ0aW1lc3RhbXAiLCJEYXRlIiwidG9JU09TdHJpbmciLCJjb25zb2xlIiwiRXJyb3IiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/test-supabase/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftest-supabase%2Froute&page=%2Fapi%2Ftest-supabase%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftest-supabase%2Froute.ts&appDir=C%3A%5CUsers%5CHP%5CDesktop%5Cprojectt%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CHP%5CDesktop%5Cprojectt&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();