(()=>{"use strict";var e,t,n,r,o,i,s,c,a,u,_,d,l,f,p={865:(e,t,n)=>{let r;function o(e){r=e}n.d(t,{AA:()=>U,EB:()=>M,KM:()=>D,Or:()=>P,P:()=>j,Tq:()=>S,Wd:()=>T,ZG:()=>A,_w:()=>x,a2:()=>C,aV:()=>y,iX:()=>O,oH:()=>W,oT:()=>o,ug:()=>k}),e=n.hmd(e);const i=new Array(128).fill(void 0);function s(e){return i[e]}i.push(void 0,null,!0,!1);let c=i.length;function a(e){const t=s(e);return function(e){e<132||(i[e]=c,c=e)}(e),t}let u=new("undefined"==typeof TextDecoder?(0,e.require)("util").TextDecoder:TextDecoder)("utf-8",{ignoreBOM:!0,fatal:!0});u.decode();let _=null;function d(){return null!==_&&0!==_.byteLength||(_=new Uint8Array(r.memory.buffer)),_}function l(e,t){return u.decode(d().subarray(e,e+t))}function f(e){c===i.length&&i.push(i.length+1);const t=c;return c=i[t],i[t]=e,t}let p=128;function g(e){if(1==p)throw new Error("out of js stack");return i[--p]=e,p}let b=0,h=new("undefined"==typeof TextEncoder?(0,e.require)("util").TextEncoder:TextEncoder)("utf-8");const w="function"==typeof h.encodeInto?function(e,t){return h.encodeInto(e,t)}:function(e,t){const n=h.encode(e);return t.set(n),{read:e.length,written:n.length}};function m(e,t,n){if(void 0===n){const n=h.encode(e),r=t(n.length);return d().subarray(r,r+n.length).set(n),b=n.length,r}let r=e.length,o=t(r);const i=d();let s=0;for(;s<r;s++){const t=e.charCodeAt(s);if(t>127)break;i[o+s]=t}if(s!==r){0!==s&&(e=e.slice(s)),o=n(o,r,r=s+3*e.length);const t=d().subarray(o+s,o+r);s+=w(e,t).written}return b=s,o}function y(){r.set_panic_hook()}let v=null;function E(){return null!==v&&0!==v.byteLength||(v=new Int32Array(r.memory.buffer)),v}class x{static __wrap(e){const t=Object.create(x.prototype);return t.ptr=e,t}__destroy_into_raw(){const e=this.ptr;return this.ptr=0,e}free(){const e=this.__destroy_into_raw();r.__wbg_lsbstego_free(e)}static new(e,t,n){try{const o=r.lsbstego_new(g(e),t,n);return x.__wrap(o)}finally{i[p++]=void 0}}get_mask_one(){return r.lsbstego_get_mask_one(this.ptr)>>>0}get_mask_zero(){return r.lsbstego_get_mask_zero(this.ptr)>>>0}put_binary_value(e){const t=m(e,r.__wbindgen_malloc,r.__wbindgen_realloc),n=b;r.lsbstego_put_binary_value(this.ptr,t,n)}next_slot(){r.lsbstego_next_slot(this.ptr)}init_encode(e,t,n,o){r.lsbstego_init_encode(this.ptr,e,t,n,o)}encode_channel(e,t){try{r.lsbstego_encode_channel(this.ptr,g(e),g(t))}finally{i[p++]=void 0,i[p++]=void 0}}get_image(){return a(r.lsbstego_get_image(this.ptr))}decode_properties(){const e=r.lsbstego_decode_properties(this.ptr);return A.__wrap(e)}decode_approximation(e,t,n){return a(r.lsbstego_decode_approximation(this.ptr,e,t,n))}}class A{static __wrap(e){const t=Object.create(A.prototype);return t.ptr=e,t}__destroy_into_raw(){const e=this.ptr;return this.ptr=0,e}free(){const e=this.__destroy_into_raw();r.__wbg_propreturn_free(e)}get 0(){return r.__wbg_get_propreturn_0(this.ptr)>>>0}set 0(e){r.__wbg_set_propreturn_0(this.ptr,e)}get 1(){return r.__wbg_get_propreturn_1(this.ptr)>>>0}set 1(e){r.__wbg_set_propreturn_1(this.ptr,e)}get 2(){return r.__wbg_get_propreturn_2(this.ptr)>>>0}set 2(e){r.__wbg_set_propreturn_2(this.ptr,e)}}function C(){return f(new Error)}function D(e,t){const n=m(s(t).stack,r.__wbindgen_malloc,r.__wbindgen_realloc),o=b;E()[e/4+1]=o,E()[e/4+0]=n}function O(e,t){try{console.error(l(e,t))}finally{r.__wbindgen_free(e,t)}}function k(e){a(e)}function S(e){return f(s(e).buffer)}function j(e,t,n){return f(new Uint8ClampedArray(s(e),t>>>0,n>>>0))}function M(e){return f(new Uint8ClampedArray(s(e)))}function T(e,t,n){s(e).set(s(t),n>>>0)}function U(e){return s(e).length}function P(e,t){throw new Error(l(e,t))}function W(){return f(r.memory)}},166:(e,t,n)=>{var r,o,i=n(865);function s(e,t){return{msg:o.ENCODED,ed:e,err:t}}function c(e,t,n,r){return{msg:o.DECODED,dd:e,dw:t,dh:n,err:r}}!function(e){e.ENCODE="encode",e.DECODE="decode"}(r||(r={})),function(e){e.ENCODED="ENCODED",e.DECODED="DECODED"}(o||(o={})),onmessage=function(e){var t,o,a,u,_,d,l,f,p,g,b=e.data,h=b.msg;switch(b.msg){case r.ENCODE:u=b.cd,_=b.cw,d=b.ch,l=b.lhs,f=b.rhs,p=b.hr,g=b.maxLsb,n.e(123).then(n.bind(n,123)).then((function(e){e.set_panic_hook();var t=i._w.new(u,_,d),n=l.red.length/p,r=f.red.length/p;if(Math.trunc(_*d*3*g/8)<=(r+n)*p*3*2+6)postMessage(s(new Uint8ClampedArray,"Cover image not large enough to hold hidden image! Adjust the image parameters until it fits!"));else{t.init_encode(r,n,p,g),t.encode_channel(new Uint8ClampedArray(l.red.buffer),new Uint8ClampedArray(f.red.buffer)),t.encode_channel(new Uint8ClampedArray(l.green.buffer),new Uint8ClampedArray(f.green.buffer)),t.encode_channel(new Uint8ClampedArray(l.blue.buffer),new Uint8ClampedArray(f.blue.buffer));var o=t.get_image();postMessage(s(o,""))}}),(function(e){console.log("Could not load WASM module! Error: ",e)}));break;case r.DECODE:t=b.d,o=b.w,a=b.h,n.e(123).then(n.bind(n,123)).then((function(e){e.set_panic_hook();var n=i._w.new(t,o,a),r=n.decode_properties(),s=r[0],u=r[1],_=r[2];if(o*a*3<3*(s+_+u*_)*2+48)postMessage(c(new Uint8ClampedArray,0,0,"Cover image not large enough to hold hidden image! Has the hidden image actually been encoded?"));else{var d=n.decode_approximation(s,u,_);postMessage(c(d,s,u,""))}}),(function(e){console.log("Could not load WASM module! Error: ",e)}));break;default:throw new Error("unrecognized command '".concat(h,"'!"))}}}},g={};function b(e){var t=g[e];if(void 0!==t)return t.exports;var n=g[e]={id:e,loaded:!1,exports:{}};return p[e](n,n.exports,b),n.loaded=!0,n.exports}b.m=p,b.c=g,b.d=(e,t)=>{for(var n in t)b.o(t,n)&&!b.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},b.f={},b.e=e=>Promise.all(Object.keys(b.f).reduce(((t,n)=>(b.f[n](e,t),t)),[])),b.u=e=>e+".worker.js",b.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),b.hmd=e=>((e=Object.create(e)).children||(e.children=[]),Object.defineProperty(e,"exports",{enumerable:!0,set:()=>{throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: "+e.id)}}),e),b.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),b.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;b.g.importScripts&&(e=b.g.location+"");var t=b.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var n=t.getElementsByTagName("script");n.length&&(e=n[n.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),b.p=e})(),(()=>{var e={371:1};b.f.i=(t,n)=>{e[t]||importScripts(b.p+b.u(t))};var t=self.webpackChunkAutoStegano=self.webpackChunkAutoStegano||[],n=t.push.bind(t);t.push=t=>{var[r,o,i]=t;for(var s in o)b.o(o,s)&&(b.m[s]=o[s]);for(i&&i(b);r.length;)e[r.pop()]=1;n(t)}})(),d={},l={986:function(){return{"./image_steganography_worker_bg.js":{__wbg_new_abda76e883ba8a5f:function(){return void 0===e&&(e=b.c[865].exports),e.a2()},__wbg_stack_658279fe44541cf6:function(e,n){return void 0===t&&(t=b.c[865].exports),t.KM(e,n)},__wbg_error_f851667af71bcfc6:function(e,t){return void 0===n&&(n=b.c[865].exports),n.iX(e,t)},__wbindgen_object_drop_ref:function(e){return void 0===r&&(r=b.c[865].exports),r.ug(e)},__wbg_buffer_cf65c07de34b9a08:function(e){return void 0===o&&(o=b.c[865].exports),o.Tq(e)},__wbg_newwithbyteoffsetandlength_a04f81daba99fdcb:function(e,t,n){return void 0===i&&(i=b.c[865].exports),i.P(e,t,n)},__wbg_new_03e65ab6ee0581bb:function(e){return void 0===s&&(s=b.c[865].exports),s.EB(e)},__wbg_set_d1017675d13cf3d5:function(e,t,n){return void 0===c&&(c=b.c[865].exports),c.Wd(e,t,n)},__wbg_length_065287541268ea52:function(e){return void 0===a&&(a=b.c[865].exports),a.AA(e)},__wbindgen_throw:function(e,t){return void 0===u&&(u=b.c[865].exports),u.Or(e,t)},__wbindgen_memory:function(){return void 0===_&&(_=b.c[865].exports),_.oH()}}}}},f={123:[986]},b.w={},b.f.wasm=function(e,t){(f[e]||[]).forEach((function(n,r){var o=d[n];if(o)t.push(o);else{var i,s=l[n](),c=fetch(b.p+""+{123:{986:"c101356ca3c5ac9d3714"}}[e][n]+".module.wasm");i=s&&"function"==typeof s.then&&"function"==typeof WebAssembly.compileStreaming?Promise.all([WebAssembly.compileStreaming(c),s]).then((function(e){return WebAssembly.instantiate(e[0],e[1])})):"function"==typeof WebAssembly.instantiateStreaming?WebAssembly.instantiateStreaming(c,s):c.then((function(e){return e.arrayBuffer()})).then((function(e){return WebAssembly.instantiate(e,s)})),t.push(d[n]=i.then((function(e){return b.w[n]=(e.instance||e).exports})))}}))},b(166)})();
//# sourceMappingURL=steg-worker.worker.js.map