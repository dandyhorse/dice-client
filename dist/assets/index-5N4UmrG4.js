(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=.4,t=.5,n=.5,r=.22,i=.6,a=.6,o=.82,s=r*2.2,c=-1.6,l=1.2,u=.04,d=a,f=2.5,p=.8,m=-1.8,h=.4,g=.2,_=[0,0,0],v=[0,0,-1],y=window.location.origin,b=`dice.auth.accessToken`,x=`dice.auth.refreshToken`,S=`dice.auth.accessExpiresAt`,C=`dice.auth.refreshExpiresAt`,w=`dice.auth.user`,T=e=>`${y}${e}`,E=e=>typeof e==`object`&&!!e&&!Array.isArray(e),D=e=>E(e)?typeof e.id==`string`&&e.id.length>0&&typeof e.username==`string`&&e.username.length>0&&typeof e.displayName==`string`:!1,O=e=>E(e)?D(e.user)&&typeof e.accessToken==`string`&&e.accessToken.length>0&&typeof e.refreshToken==`string`&&e.refreshToken.length>0&&typeof e.accessExpiresIn==`number`&&Number.isFinite(e.accessExpiresIn)&&typeof e.refreshExpiresIn==`number`&&Number.isFinite(e.refreshExpiresIn):!1,k=e=>{if(!O(e))throw Error(`auth server returned invalid user data`);return e},A=e=>{let t=localStorage.getItem(e);return t?Number(t):0},ee=()=>{let e=localStorage.getItem(w);if(!e)return null;try{let t=JSON.parse(e);if(D(t))return t}catch{}return localStorage.removeItem(w),null},te=e=>{k(e);let t=Date.now();return localStorage.setItem(b,e.accessToken),localStorage.setItem(x,e.refreshToken),localStorage.setItem(S,String(t+e.accessExpiresIn*1e3)),localStorage.setItem(C,String(t+e.refreshExpiresIn*1e3)),localStorage.setItem(w,JSON.stringify(e.user)),e},ne=()=>{localStorage.removeItem(b),localStorage.removeItem(x),localStorage.removeItem(S),localStorage.removeItem(C),localStorage.removeItem(w)},re=e=>E(e)&&typeof e.message==`string`&&e.message.length>0?e.message:null,j=async(e,t,n)=>{let r=await fetch(T(e),{method:`POST`,headers:{"Content-Type":`application/json`,...n?{Authorization:`Bearer ${n}`}:{}},body:JSON.stringify(t)}),i=await r.json().catch(()=>null);if(!r.ok)throw Error(re(i)||`auth request failed: ${r.status}`);return i},ie=async e=>te(k(await j(`/auth/register`,e))),ae=async e=>te(k(await j(`/auth/login`,e))),oe=async()=>{let e=localStorage.getItem(x),t=A(C);if(!e||t<=Date.now())return ne(),null;try{return te(k(await j(`/auth/refresh`,{refreshToken:e})))}catch{return ne(),null}},se=async()=>{let e=localStorage.getItem(b),t=localStorage.getItem(x);ne();try{await j(`/auth/logout`,{refreshToken:t},e??void 0)}catch{}},ce=async(e=20)=>{let t=await fetch(T(`/stats/leaderboard?limit=${encodeURIComponent(String(e))}`)),n=await t.json().catch(()=>({}));if(!t.ok)throw Error(n.message||`leaderboard request failed: ${t.status}`);return n.leaders??[]},le=async()=>{let e=ee(),t=localStorage.getItem(b),n=A(S);if(e&&t&&n>Date.now()+3e4)return{userId:e.id,displayName:e.username,accessToken:t,authenticated:!0};let r=await oe();return r?{userId:r.user.id,displayName:r.user.username,accessToken:r.accessToken,authenticated:!0}:null},ue=1e3,de=1001,fe=1002,pe=1003,me=1004,he=1005,ge=1006,_e=1007,ve=1008,ye=1009,M=1010,be=1011,xe=1012,Se=1013,Ce=1014,we=1015,Te=1016,Ee=1017,De=1018,Oe=1020,N=35902,ke=35899,P=1021,F=1022,Ae=1023,je=1026,Me=1027,Ne=1028,Pe=1029,Fe=1030,Ie=1031,Le=1033,Re=33776,ze=33777,Be=33778,Ve=33779,He=35840,Ue=35841,We=35842,Ge=35843,Ke=36196,qe=37492,Je=37496,Ye=37808,Xe=37809,Ze=37810,Qe=37811,$e=37812,et=37813,tt=37814,nt=37815,rt=37816,it=37817,at=37818,ot=37819,st=37820,ct=37821,lt=36492,ut=36494,dt=36495,ft=36283,pt=36284,mt=36285,ht=36286,gt=2300,_t=2301,vt=2302,yt=2400,bt=2401,xt=2402,St=3200,Ct=3201,wt=`srgb`,Tt=`srgb-linear`,Et=`linear`,Dt=`srgb`,Ot=7680,kt=35044,At=2e3;function jt(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Mt(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Nt(){let e=Mt(`canvas`);return e.style.display=`block`,e}var Pt={},Ft=null;function It(...e){let t=`THREE.`+e.shift();Ft?Ft(`log`,t,...e):console.log(t,...e)}function I(...e){let t=`THREE.`+e.shift();Ft?Ft(`warn`,t,...e):console.warn(t,...e)}function L(...e){let t=`THREE.`+e.shift();Ft?Ft(`error`,t,...e):console.error(t,...e)}function Lt(...e){let t=e.join(` `);t in Pt||(Pt[t]=!0,I(...e))}function Rt(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var zt=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Bt=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Vt=Math.PI/180,Ht=180/Math.PI;function Ut(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Bt[e&255]+Bt[e>>8&255]+Bt[e>>16&255]+Bt[e>>24&255]+`-`+Bt[t&255]+Bt[t>>8&255]+`-`+Bt[t>>16&15|64]+Bt[t>>24&255]+`-`+Bt[n&63|128]+Bt[n>>8&255]+`-`+Bt[n>>16&255]+Bt[n>>24&255]+Bt[r&255]+Bt[r>>8&255]+Bt[r>>16&255]+Bt[r>>24&255]).toLowerCase()}function R(e,t,n){return Math.max(t,Math.min(n,e))}function Wt(e,t){return(e%t+t)%t}function Gt(e,t,n){return(1-n)*e+n*t}function Kt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function qt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var z=class e{constructor(t=0,n=0){e.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=R(this.x,e.x,t.x),this.y=R(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=R(this.x,e,t),this.y=R(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(R(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(R(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Jt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(o<=0){e[t+0]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u;return}if(o>=1){e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=m;return}if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:I(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(R(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},B=class e{constructor(t=0,n=0,r=0){e.prototype.isVector3=!0,this.x=t,this.y=n,this.z=r}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Xt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Xt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=R(this.x,e.x,t.x),this.y=R(this.y,e.y,t.y),this.z=R(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=R(this.x,e,t),this.y=R(this.y,e,t),this.z=R(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(R(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Yt.copy(this).projectOnVector(e),this.sub(Yt)}reflect(e){return this.sub(Yt.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(R(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Yt=new B,Xt=new Jt,V=class e{constructor(t,n,r,i,a,o,s,c,l){e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Zt.makeScale(e,t)),this}rotate(e){return this.premultiply(Zt.makeRotation(-e)),this}translate(e,t){return this.premultiply(Zt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Zt=new V,Qt=new V().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),$t=new V().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function en(){let e={enabled:!0,workingColorSpace:Tt,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=tn(e.r),e.g=tn(e.g),e.b=tn(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=nn(e.r),e.g=nn(e.g),e.b=nn(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Et:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return Lt(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return Lt(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Tt]:{primaries:t,whitePoint:r,transfer:Et,toXYZ:Qt,fromXYZ:$t,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:wt},outputColorSpaceConfig:{drawingBufferColorSpace:wt}},[wt]:{primaries:t,whitePoint:r,transfer:Dt,toXYZ:Qt,fromXYZ:$t,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:wt}}}),e}var H=en();function tn(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function nn(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var rn,an=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{rn===void 0&&(rn=Mt(`canvas`)),rn.width=e.width,rn.height=e.height;let t=rn.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=rn}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Mt(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=tn(i[e]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(tn(t[e]/255)*255):t[e]=tn(t[e]);return{data:t,width:e.width,height:e.height}}else return I(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},on=0,sn=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,`id`,{value:on++}),this.uuid=Ut(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(cn(r[t].image)):e.push(cn(r[t]))}else e=cn(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function cn(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?an.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(I(`Texture: Unable to serialize Texture.`),{})}var ln=0,un=new B,dn=class e extends zt{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=de,i=de,a=ge,o=ve,s=Ae,c=ye,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,`id`,{value:ln++}),this.uuid=Ut(),this.name=``,this.source=new sn(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new z(0,0),this.repeat=new z(1,1),this.center=new z(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new V,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(un).x}get height(){return this.source.getSize(un).y}get depth(){return this.source.getSize(un).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){I(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){I(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ue:e.x-=Math.floor(e.x);break;case de:e.x=e.x<0?0:1;break;case fe:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ue:e.y-=Math.floor(e.y);break;case de:e.y=e.y<0?0:1;break;case fe:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};dn.DEFAULT_IMAGE=null,dn.DEFAULT_MAPPING=300,dn.DEFAULT_ANISOTROPY=1;var fn=class e{constructor(t=0,n=0,r=0,i=1){e.prototype.isVector4=!0,this.x=t,this.y=n,this.z=r,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=R(this.x,e.x,t.x),this.y=R(this.y,e.y,t.y),this.z=R(this.z,e.z,t.z),this.w=R(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=R(this.x,e,t),this.y=R(this.y,e,t),this.z=R(this.z,e,t),this.w=R(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(R(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},pn=class extends zt{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ge,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new fn(0,0,e,t),this.scissorTest=!1,this.viewport=new fn(0,0,e,t);let r=new dn({width:e,height:t,depth:n.depth});this.textures=[];let i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:ge,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new sn(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:`dispose`})}},mn=class extends pn{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},hn=class extends dn{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=pe,this.minFilter=pe,this.wrapR=de,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},gn=class extends dn{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=pe,this.minFilter=pe,this.wrapR=de,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},_n=class{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(yn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(yn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=yn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,yn):yn.fromBufferAttribute(r,t),yn.applyMatrix4(e.matrixWorld),this.expandByPoint(yn);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),bn.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),bn.copy(e.boundingBox)),bn.applyMatrix4(e.matrixWorld),this.union(bn)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,yn),yn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Dn),On.subVectors(this.max,Dn),xn.subVectors(e.a,Dn),Sn.subVectors(e.b,Dn),Cn.subVectors(e.c,Dn),wn.subVectors(Sn,xn),Tn.subVectors(Cn,Sn),En.subVectors(xn,Cn);let t=[0,-wn.z,wn.y,0,-Tn.z,Tn.y,0,-En.z,En.y,wn.z,0,-wn.x,Tn.z,0,-Tn.x,En.z,0,-En.x,-wn.y,wn.x,0,-Tn.y,Tn.x,0,-En.y,En.x,0];return!jn(t,xn,Sn,Cn,On)||(t=[1,0,0,0,1,0,0,0,1],!jn(t,xn,Sn,Cn,On))?!1:(kn.crossVectors(wn,Tn),t=[kn.x,kn.y,kn.z],jn(t,xn,Sn,Cn,On))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,yn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(yn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(vn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),vn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),vn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),vn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),vn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),vn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),vn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),vn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(vn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},vn=[new B,new B,new B,new B,new B,new B,new B,new B],yn=new B,bn=new _n,xn=new B,Sn=new B,Cn=new B,wn=new B,Tn=new B,En=new B,Dn=new B,On=new B,kn=new B,An=new B;function jn(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){An.fromArray(e,a);let o=i.x*Math.abs(An.x)+i.y*Math.abs(An.y)+i.z*Math.abs(An.z),s=t.dot(An),c=n.dot(An),l=r.dot(An);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Mn=new _n,Nn=new B,Pn=new B,Fn=class{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?Mn.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Nn.subVectors(e,this.center);let t=Nn.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Nn,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Pn.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Nn.copy(e.center).add(Pn)),this.expandByPoint(Nn.copy(e.center).sub(Pn))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},In=new B,Ln=new B,Rn=new B,zn=new B,Bn=new B,Vn=new B,Hn=new B,Un=class{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,In)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=In.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(In.copy(this.origin).addScaledVector(this.direction,t),In.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Ln.copy(e).add(t).multiplyScalar(.5),Rn.copy(t).sub(e).normalize(),zn.copy(this.origin).sub(Ln);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Rn),o=zn.dot(this.direction),s=-zn.dot(Rn),c=zn.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0)if(u=a*s-o,d=a*o-s,p=i*l,u>=0)if(d>=-p)if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c);else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Ln).addScaledVector(Rn,d),f}intersectSphere(e,t){In.subVectors(e.center,this.origin);let n=In.dot(this.direction),r=In.dot(In)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,In)!==null}intersectTriangle(e,t,n,r,i){Bn.subVectors(t,e),Vn.subVectors(n,e),Hn.crossVectors(Bn,Vn);let a=this.direction.dot(Hn),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;zn.subVectors(this.origin,e);let s=o*this.direction.dot(Vn.crossVectors(zn,Vn));if(s<0)return null;let c=o*this.direction.dot(Bn.cross(zn));if(c<0||s+c>a)return null;let l=-o*zn.dot(Hn);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Wn=class e{constructor(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g){e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/Gn.setFromMatrixColumn(e,0).length(),i=1/Gn.setFromMatrixColumn(e,1).length(),a=1/Gn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(qn,e,Jn)}lookAt(e,t,n){let r=this.elements;return Zn.subVectors(e,t),Zn.lengthSq()===0&&(Zn.z=1),Zn.normalize(),Yn.crossVectors(n,Zn),Yn.lengthSq()===0&&(Math.abs(n.z)===1?Zn.x+=1e-4:Zn.z+=1e-4,Zn.normalize(),Yn.crossVectors(n,Zn)),Yn.normalize(),Xn.crossVectors(Zn,Yn),r[0]=Yn.x,r[4]=Xn.x,r[8]=Zn.x,r[1]=Yn.y,r[5]=Xn.y,r[9]=Zn.y,r[2]=Yn.z,r[6]=Xn.z,r[10]=Zn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],ee=r[10],te=r[14],ne=r[3],re=r[7],j=r[11],ie=r[15];return i[0]=a*x+o*T+s*k+c*ne,i[4]=a*S+o*E+s*A+c*re,i[8]=a*C+o*D+s*ee+c*j,i[12]=a*w+o*O+s*te+c*ie,i[1]=l*x+u*T+d*k+f*ne,i[5]=l*S+u*E+d*A+f*re,i[9]=l*C+u*D+d*ee+f*j,i[13]=l*w+u*O+d*te+f*ie,i[2]=p*x+m*T+h*k+g*ne,i[6]=p*S+m*E+h*A+g*re,i[10]=p*C+m*D+h*ee+g*j,i[14]=p*w+m*O+h*te+g*ie,i[3]=_*x+v*T+y*k+b*ne,i[7]=_*S+v*E+y*A+b*re,i[11]=_*C+v*D+y*ee+b*j,i[15]=_*w+v*O+y*te+b*ie,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15];return p*(+i*s*u-r*c*u-i*o*d+n*c*d+r*o*f-n*s*f)+m*(+t*s*f-t*c*d+i*a*d-r*a*f+r*c*l-i*s*l)+h*(+t*c*u-t*o*f-i*a*u+n*a*f+i*o*l-n*c*l)+g*(-r*o*l-t*s*u+t*o*d+r*a*u-n*a*d+n*s*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=u*h*c-m*d*c+m*s*f-o*h*f-u*s*g+o*d*g,v=p*d*c-l*h*c-p*s*f+a*h*f+l*s*g-a*d*g,y=l*m*c-p*u*c+p*o*f-a*m*f-l*o*g+a*u*g,b=p*u*s-l*m*s-p*o*d+a*m*d+l*o*h-a*u*h,x=t*_+n*v+r*y+i*b;if(x===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/x;return e[0]=_*S,e[1]=(m*d*i-u*h*i-m*r*f+n*h*f+u*r*g-n*d*g)*S,e[2]=(o*h*i-m*s*i+m*r*c-n*h*c-o*r*g+n*s*g)*S,e[3]=(u*s*i-o*d*i-u*r*c+n*d*c+o*r*f-n*s*f)*S,e[4]=v*S,e[5]=(l*h*i-p*d*i+p*r*f-t*h*f-l*r*g+t*d*g)*S,e[6]=(p*s*i-a*h*i-p*r*c+t*h*c+a*r*g-t*s*g)*S,e[7]=(a*d*i-l*s*i+l*r*c-t*d*c-a*r*f+t*s*f)*S,e[8]=y*S,e[9]=(p*u*i-l*m*i-p*n*f+t*m*f+l*n*g-t*u*g)*S,e[10]=(a*m*i-p*o*i+p*n*c-t*m*c-a*n*g+t*o*g)*S,e[11]=(l*o*i-a*u*i-l*n*c+t*u*c+a*n*f-t*o*f)*S,e[12]=b*S,e[13]=(l*m*r-p*u*r+p*n*d-t*m*d-l*n*h+t*u*h)*S,e[14]=(p*o*r-a*m*r-p*n*s+t*m*s+a*n*h-t*o*h)*S,e[15]=(a*u*r-l*o*r+l*n*s-t*u*s-a*n*d+t*o*d)*S,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,i=Gn.set(r[0],r[1],r[2]).length(),a=Gn.set(r[4],r[5],r[6]).length(),o=Gn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(i=-i),e.x=r[12],e.y=r[13],e.z=r[14],Kn.copy(this);let s=1/i,c=1/a,l=1/o;return Kn.elements[0]*=s,Kn.elements[1]*=s,Kn.elements[2]*=s,Kn.elements[4]*=c,Kn.elements[5]*=c,Kn.elements[6]*=c,Kn.elements[8]*=l,Kn.elements[9]*=l,Kn.elements[10]*=l,t.setFromRotationMatrix(Kn),n.x=i,n.y=a,n.z=o,this}makePerspective(e,t,n,r,i,a,o=At,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=At,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Gn=new B,Kn=new Wn,qn=new B(0,0,0),Jn=new B(1,1,1),Yn=new B,Xn=new B,Zn=new B,Qn=new Wn,$n=new Jt,er=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(R(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-R(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(R(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-R(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(R(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-R(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:I(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Qn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Qn,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return $n.setFromEuler(this),this.setFromQuaternion($n,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};er.DEFAULT_ORDER=`XYZ`;var tr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!=0}},nr=0,rr=new B,ir=new Jt,ar=new Wn,or=new B,sr=new B,cr=new B,lr=new Jt,ur=new B(1,0,0),dr=new B(0,1,0),fr=new B(0,0,1),pr={type:`added`},mr={type:`removed`},hr={type:`childadded`,child:null},gr={type:`childremoved`,child:null},_r=class e extends zt{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,`id`,{value:nr++}),this.uuid=Ut(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new B,n=new er,r=new Jt,i=new B(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Wn},normalMatrix:{value:new V}}),this.matrix=new Wn,this.matrixWorld=new Wn,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new tr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ir.setFromAxisAngle(e,t),this.quaternion.multiply(ir),this}rotateOnWorldAxis(e,t){return ir.setFromAxisAngle(e,t),this.quaternion.premultiply(ir),this}rotateX(e){return this.rotateOnAxis(ur,e)}rotateY(e){return this.rotateOnAxis(dr,e)}rotateZ(e){return this.rotateOnAxis(fr,e)}translateOnAxis(e,t){return rr.copy(e).applyQuaternion(this.quaternion),this.position.add(rr.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ur,e)}translateY(e){return this.translateOnAxis(dr,e)}translateZ(e){return this.translateOnAxis(fr,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ar.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?or.copy(e):or.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),sr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ar.lookAt(sr,or,this.up):ar.lookAt(or,sr,this.up),this.quaternion.setFromRotationMatrix(ar),r&&(ar.extractRotation(r.matrixWorld),ir.setFromRotationMatrix(ar),this.quaternion.premultiply(ir.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(L(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(pr),hr.child=e,this.dispatchEvent(hr),hr.child=null):L(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(mr),gr.child=e,this.dispatchEvent(gr),gr.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ar.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ar.multiply(e.parent.matrixWorld)),e.applyMatrix4(ar),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(pr),hr.child=e,this.dispatchEvent(hr),hr.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(sr,e,cr),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(sr,lr,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material);if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};_r.DEFAULT_UP=new B(0,1,0),_r.DEFAULT_MATRIX_AUTO_UPDATE=!0,_r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var vr=new B,yr=new B,br=new B,xr=new B,Sr=new B,Cr=new B,wr=new B,Tr=new B,Er=new B,Dr=new B,Or=new fn,kr=new fn,Ar=new fn,jr=class e{constructor(e=new B,t=new B,n=new B){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),vr.subVectors(e,t),r.cross(vr);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){vr.subVectors(r,t),yr.subVectors(n,t),br.subVectors(e,t);let a=vr.dot(vr),o=vr.dot(yr),s=vr.dot(br),c=yr.dot(yr),l=yr.dot(br),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,xr)===null?!1:xr.x>=0&&xr.y>=0&&xr.x+xr.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,xr)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,xr.x),s.addScaledVector(a,xr.y),s.addScaledVector(o,xr.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Or.setScalar(0),kr.setScalar(0),Ar.setScalar(0),Or.fromBufferAttribute(e,t),kr.fromBufferAttribute(e,n),Ar.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Or,i.x),a.addScaledVector(kr,i.y),a.addScaledVector(Ar,i.z),a}static isFrontFacing(e,t,n,r){return vr.subVectors(n,t),yr.subVectors(e,t),vr.cross(yr).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return vr.subVectors(this.c,this.b),yr.subVectors(this.a,this.b),vr.cross(yr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Sr.subVectors(r,n),Cr.subVectors(i,n),Tr.subVectors(e,n);let s=Sr.dot(Tr),c=Cr.dot(Tr);if(s<=0&&c<=0)return t.copy(n);Er.subVectors(e,r);let l=Sr.dot(Er),u=Cr.dot(Er);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(Sr,a);Dr.subVectors(e,i);let f=Sr.dot(Dr),p=Cr.dot(Dr);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Cr,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return wr.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(wr,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Sr,a).addScaledVector(Cr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Mr={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Nr={h:0,s:0,l:0},Pr={h:0,s:0,l:0};function Fr(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var U=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=wt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,H.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=H.workingColorSpace){return this.r=e,this.g=t,this.b=n,H.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=H.workingColorSpace){if(e=Wt(e,1),t=R(t,0,1),n=R(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Fr(i,r,e+1/3),this.g=Fr(i,r,e),this.b=Fr(i,r,e-1/3)}return H.colorSpaceToWorking(this,r),this}setStyle(e,t=wt){function n(t){t!==void 0&&parseFloat(t)<1&&I(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:I(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);I(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=wt){let n=Mr[e.toLowerCase()];return n===void 0?I(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=tn(e.r),this.g=tn(e.g),this.b=tn(e.b),this}copyLinearToSRGB(e){return this.r=nn(e.r),this.g=nn(e.g),this.b=nn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=wt){return H.workingToColorSpace(Ir.copy(this),e),Math.round(R(Ir.r*255,0,255))*65536+Math.round(R(Ir.g*255,0,255))*256+Math.round(R(Ir.b*255,0,255))}getHexString(e=wt){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=H.workingColorSpace){H.workingToColorSpace(Ir.copy(this),t);let n=Ir.r,r=Ir.g,i=Ir.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4;break}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=H.workingColorSpace){return H.workingToColorSpace(Ir.copy(this),t),e.r=Ir.r,e.g=Ir.g,e.b=Ir.b,e}getStyle(e=wt){H.workingToColorSpace(Ir.copy(this),e);let t=Ir.r,n=Ir.g,r=Ir.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Nr),this.setHSL(Nr.h+e,Nr.s+t,Nr.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Nr),e.getHSL(Pr);let n=Gt(Nr.h,Pr.h,t),r=Gt(Nr.s,Pr.s,t),i=Gt(Nr.l,Pr.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ir=new U;U.NAMES=Mr;var Lr=0,Rr=class extends zt{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,`id`,{value:Lr++}),this.uuid=Ut(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new U(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ot,this.stencilZFail=Ot,this.stencilZPass=Ot,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){I(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){I(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},zr=class extends Rr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new U(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new er,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Br=new B,Vr=new z,Hr=0,Ur=class{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,`id`,{value:Hr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=kt,this.updateRanges=[],this.gpuType=we,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Vr.fromBufferAttribute(this,t),Vr.applyMatrix3(e),this.setXY(t,Vr.x,Vr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Br.fromBufferAttribute(this,t),Br.applyMatrix3(e),this.setXYZ(t,Br.x,Br.y,Br.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Br.fromBufferAttribute(this,t),Br.applyMatrix4(e),this.setXYZ(t,Br.x,Br.y,Br.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Br.fromBufferAttribute(this,t),Br.applyNormalMatrix(e),this.setXYZ(t,Br.x,Br.y,Br.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Br.fromBufferAttribute(this,t),Br.transformDirection(e),this.setXYZ(t,Br.x,Br.y,Br.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Kt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=qt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Kt(t,this.array)),t}setX(e,t){return this.normalized&&(t=qt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Kt(t,this.array)),t}setY(e,t){return this.normalized&&(t=qt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Kt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=qt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Kt(t,this.array)),t}setW(e,t){return this.normalized&&(t=qt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=qt(t,this.array),n=qt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=qt(t,this.array),n=qt(n,this.array),r=qt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=qt(t,this.array),n=qt(n,this.array),r=qt(r,this.array),i=qt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}},Wr=class extends Ur{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Gr=class extends Ur{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Kr=class extends Ur{constructor(e,t,n){super(new Float32Array(e),t,n)}},qr=0,Jr=new Wn,Yr=new _r,Xr=new B,Zr=new _n,Qr=new _n,$r=new B,ei=class e extends zt{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,`id`,{value:qr++}),this.uuid=Ut(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(jt(e)?Gr:Wr)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new V().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Jr.makeRotationFromQuaternion(e),this.applyMatrix4(Jr),this}rotateX(e){return Jr.makeRotationX(e),this.applyMatrix4(Jr),this}rotateY(e){return Jr.makeRotationY(e),this.applyMatrix4(Jr),this}rotateZ(e){return Jr.makeRotationZ(e),this.applyMatrix4(Jr),this}translate(e,t,n){return Jr.makeTranslation(e,t,n),this.applyMatrix4(Jr),this}scale(e,t,n){return Jr.makeScale(e,t,n),this.applyMatrix4(Jr),this}lookAt(e){return Yr.lookAt(e),Yr.updateMatrix(),this.applyMatrix4(Yr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Xr).negate(),this.translate(Xr.x,Xr.y,Xr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Kr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&I(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new _n);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){L(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Zr.setFromBufferAttribute(n),this.morphTargetsRelative?($r.addVectors(this.boundingBox.min,Zr.min),this.boundingBox.expandByPoint($r),$r.addVectors(this.boundingBox.max,Zr.max),this.boundingBox.expandByPoint($r)):(this.boundingBox.expandByPoint(Zr.min),this.boundingBox.expandByPoint(Zr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&L(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Fn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){L(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new B,1/0);return}if(e){let n=this.boundingSphere.center;if(Zr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Qr.setFromBufferAttribute(n),this.morphTargetsRelative?($r.addVectors(Zr.min,Qr.min),Zr.expandByPoint($r),$r.addVectors(Zr.max,Qr.max),Zr.expandByPoint($r)):(Zr.expandByPoint(Qr.min),Zr.expandByPoint(Qr.max))}Zr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)$r.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared($r));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)$r.fromBufferAttribute(a,t),o&&(Xr.fromBufferAttribute(e,t),$r.add(Xr)),r=Math.max(r,n.distanceToSquared($r))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&L(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){L(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new Ur(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new B,s[e]=new B;let c=new B,l=new B,u=new B,d=new z,f=new z,p=new z,m=new B,h=new B;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new B,y=new B,b=new B,x=new B;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new Ur(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new B,i=new B,a=new B,o=new B,s=new B,c=new B,l=new B,u=new B;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)$r.fromBufferAttribute(e,t),$r.normalize(),e.setXYZ(t,$r.x,$r.y,$r.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Ur(a,r,i)}if(this.index===null)return I(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},ti=new Wn,ni=new Un,ri=new Fn,ii=new B,ai=new B,oi=new B,si=new B,ci=new B,li=new B,ui=new B,di=new B,fi=class extends _r{constructor(e=new ei,t=new zr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){li.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(ci.fromBufferAttribute(s,e),a?li.addScaledVector(ci,r):li.addScaledVector(ci.sub(t),r))}t.add(li)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ri.copy(n.boundingSphere),ri.applyMatrix4(i),ni.copy(e.ray).recast(e.near),!(ri.containsPoint(ni.origin)===!1&&(ni.intersectSphere(ri,ii)===null||ni.origin.distanceToSquared(ii)>(e.far-e.near)**2))&&(ti.copy(i).invert(),ni.copy(e.ray).applyMatrix4(ti),!(n.boundingBox!==null&&ni.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ni)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null)if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=mi(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=mi(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}else if(s!==void 0)if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=mi(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=mi(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}};function pi(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;di.copy(s),di.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(di);return l<n.near||l>n.far?null:{distance:l,point:di.clone(),object:e}}function mi(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,ai),e.getVertexPosition(c,oi),e.getVertexPosition(l,si);let u=pi(e,t,n,r,ai,oi,si,ui);if(u){let e=new B;jr.getBarycoord(ui,ai,oi,si,e),i&&(u.uv=jr.getInterpolatedAttribute(i,s,c,l,e,new z)),a&&(u.uv1=jr.getInterpolatedAttribute(a,s,c,l,e,new z)),o&&(u.normal=jr.getInterpolatedAttribute(o,s,c,l,e,new B),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new B,materialIndex:0};jr.getNormal(ai,oi,si,t.normal),u.face=t,u.barycoord=e}return u}var hi=class e extends ei{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Kr(c,3)),this.setAttribute(`normal`,new Kr(l,3)),this.setAttribute(`uv`,new Kr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new B;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function gi(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(I(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone():Array.isArray(i)?t[n][r]=i.slice():t[n][r]=i}}return t}function _i(e){let t={};for(let n=0;n<e.length;n++){let r=gi(e[n]);for(let e in r)t[e]=r[e]}return t}function vi(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function yi(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:H.workingColorSpace}var bi={clone:gi,merge:_i},xi=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Si=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ci=class extends Rr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=xi,this.fragmentShader=Si,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=gi(e.uniforms),this.uniformsGroups=vi(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},wi=class extends _r{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Wn,this.projectionMatrix=new Wn,this.projectionMatrixInverse=new Wn,this.coordinateSystem=At,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Ti=new B,Ei=new z,Di=new z,Oi=class extends wi{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ht*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Vt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ht*2*Math.atan(Math.tan(Vt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ti.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ti.x,Ti.y).multiplyScalar(-e/Ti.z),Ti.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ti.x,Ti.y).multiplyScalar(-e/Ti.z)}getViewSize(e,t){return this.getViewBounds(e,Ei,Di),t.subVectors(Di,Ei)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Vt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ki=-90,Ai=1,ji=class extends _r{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Oi(ki,Ai,e,t);r.layers=this.layers,this.add(r);let i=new Oi(ki,Ai,e,t);i.layers=this.layers,this.add(i);let a=new Oi(ki,Ai,e,t);a.layers=this.layers,this.add(a);let o=new Oi(ki,Ai,e,t);o.layers=this.layers,this.add(o);let s=new Oi(ki,Ai,e,t);s.layers=this.layers,this.add(s);let c=new Oi(ki,Ai,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,i),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,s),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Mi=class extends dn{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ni=class extends mn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1};this.texture=new Mi([n,n,n,n,n,n]),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new hi(5,5,5),i=new Ci({name:`CubemapFromEquirect`,uniforms:gi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new fi(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=ge),new ji(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},Pi=class extends _r{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Fi={type:`move`},Ii=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Pi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Pi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Pi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position),s=.02,l=.005;c.inputState.pinching&&o>s+l?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=s-l&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Fi)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Pi;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Li=class extends _r{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new er,this.environmentIntensity=1,this.environmentRotation=new er,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Ri=class extends dn{constructor(e=null,t=1,n=1,r,i,a,o,s,c=pe,l=pe,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},zi=new B,Bi=new B,Vi=new V,Hi=class{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=zi.subVectors(n,t).cross(Bi.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(zi),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let i=-(e.start.dot(this.normal)+this.constant)/r;return i<0||i>1?null:t.copy(e.start).addScaledVector(n,i)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Vi.getNormalMatrix(e),r=this.coplanarPoint(zi).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ui=new Fn,Wi=new z(.5,.5),Gi=new B,Ki=class{constructor(e=new Hi,t=new Hi,n=new Hi,r=new Hi,i=new Hi,a=new Hi){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=At,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ui.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ui.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ui)}intersectsSprite(e){return Ui.center.set(0,0,0),Ui.radius=.7071067811865476+Wi.distanceTo(e.center),Ui.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ui)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Gi.x=r.normal.x>0?e.max.x:e.min.x,Gi.y=r.normal.y>0?e.max.y:e.min.y,Gi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Gi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},qi=class extends dn{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ji=class extends dn{constructor(e,t,n=Ce,r,i,a,o=pe,s=pe,c,l=je,u=1){if(l!==1026&&l!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new sn(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Yi=class extends dn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Xi=class e extends ei{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Kr(p,3)),this.setAttribute(`normal`,new Kr(m,3)),this.setAttribute(`uv`,new Kr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Zi=class extends Rr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new U(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new U(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new z(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new er,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Qi=class extends Rr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=St,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},$i=class extends Rr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ea(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function ta(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}var na=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},ra=class extends na{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:yt,endingEnd:yt}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case bt:i=e,o=2*t-n;break;case xt:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case bt:a=e,s=2*n-t;break;case xt:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},ia=class extends na{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},aa=class extends na{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},oa=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=ea(t,this.TimeBufferType),this.values=ea(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ea(e.times,Array),values:ea(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new aa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ia(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ra(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case gt:t=this.InterpolantFactoryMethodDiscrete;break;case _t:t=this.InterpolantFactoryMethodLinear;break;case vt:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t);return I(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return gt;case this.InterpolantFactoryMethodLinear:return _t;case this.InterpolantFactoryMethodSmooth:return vt}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(L(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(L(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){L(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){L(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&ta(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){L(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===vt,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0]))if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};oa.prototype.ValueTypeName=``,oa.prototype.TimeBufferType=Float32Array,oa.prototype.ValueBufferType=Float32Array,oa.prototype.DefaultInterpolation=_t;var sa=class extends oa{constructor(e,t,n){super(e,t,n)}};sa.prototype.ValueTypeName=`bool`,sa.prototype.ValueBufferType=Array,sa.prototype.DefaultInterpolation=gt,sa.prototype.InterpolantFactoryMethodLinear=void 0,sa.prototype.InterpolantFactoryMethodSmooth=void 0;var ca=class extends oa{constructor(e,t,n,r){super(e,t,n,r)}};ca.prototype.ValueTypeName=`color`;var la=class extends oa{constructor(e,t,n,r){super(e,t,n,r)}};la.prototype.ValueTypeName=`number`;var ua=class extends na{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Jt.slerpFlat(i,0,a,c-o,a,c,s);return i}},da=class extends oa{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new ua(this.times,this.values,this.getValueSize(),e)}};da.prototype.ValueTypeName=`quaternion`,da.prototype.InterpolantFactoryMethodSmooth=void 0;var fa=class extends oa{constructor(e,t,n){super(e,t,n)}};fa.prototype.ValueTypeName=`string`,fa.prototype.ValueBufferType=Array,fa.prototype.DefaultInterpolation=gt,fa.prototype.InterpolantFactoryMethodLinear=void 0,fa.prototype.InterpolantFactoryMethodSmooth=void 0;var pa=class extends oa{constructor(e,t,n,r){super(e,t,n,r)}};pa.prototype.ValueTypeName=`vector`;var ma={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(this.files[e]=t)},get:function(e){if(this.enabled!==!1)return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}},ha=new class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}},ga=class{constructor(e){this.manager=e===void 0?ha:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};ga.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var _a=new WeakMap,va=class extends ga{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=ma.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=_a.get(a);e===void 0&&(e=[],_a.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=Mt(`img`);function s(){l(),t&&t(this);let n=_a.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}_a.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),ma.remove(`image:${e}`);let n=_a.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}_a.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),ma.add(`image:${e}`,o),i.manager.itemStart(e),o.src=e,o}},ya=class extends ga{constructor(e){super(e)}load(e,t,n,r){let i=new dn,a=new va(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},ba=class extends _r{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new U(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},xa=new Wn,Sa=new B,Ca=new B,wa=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new z(512,512),this.mapType=ye,this.map=null,this.mapPass=null,this.matrix=new Wn,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ki,this._frameExtents=new z(1,1),this._viewportCount=1,this._viewports=[new fn(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Sa.setFromMatrixPosition(e.matrixWorld),t.position.copy(Sa),Ca.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ca),t.updateMatrixWorld(),xa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(xa,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(xa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ta=new Wn,Ea=new B,Da=new B,Oa=class extends wa{constructor(){super(new Oi(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new z(4,2),this._viewportCount=6,this._viewports=[new fn(2,1,1,1),new fn(0,1,1,1),new fn(3,1,1,1),new fn(1,1,1,1),new fn(3,0,1,1),new fn(1,0,1,1)],this._cubeDirections=[new B(1,0,0),new B(-1,0,0),new B(0,0,1),new B(0,0,-1),new B(0,1,0),new B(0,-1,0)],this._cubeUps=[new B(0,1,0),new B(0,1,0),new B(0,1,0),new B(0,1,0),new B(0,0,1),new B(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,r=this.matrix,i=e.distance||n.far;i!==n.far&&(n.far=i,n.updateProjectionMatrix()),Ea.setFromMatrixPosition(e.matrixWorld),n.position.copy(Ea),Da.copy(n.position),Da.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Da),n.updateMatrixWorld(),r.makeTranslation(-Ea.x,-Ea.y,-Ea.z),Ta.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ta,n.coordinateSystem,n.reversedDepth)}},ka=class extends ba{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new Oa}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Aa=class extends wi{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ja=class extends wa{constructor(){super(new Aa(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ma=class extends ba{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(_r.DEFAULT_UP),this.updateMatrix(),this.target=new _r,this.shadow=new ja}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Na=class extends ba{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type=`AmbientLight`}},Pa=class extends Oi{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Fa=`\\[\\]\\.:\\/`,Ia=RegExp(`[`+Fa+`]`,`g`),La=`[^`+Fa+`]`,Ra=`[^`+Fa.replace(`\\.`,``)+`]`,za=`((?:WC+[\\/:])*)`.replace(`WC`,La),Ba=`(WCOD+)?`.replace(`WCOD`,Ra),Va=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,La),Ha=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,La),Ua=RegExp(`^`+za+Ba+Va+Ha+`$`),Wa=[`material`,`materials`,`bones`,`map`],Ga=class{constructor(e,t,n){let r=n||Ka.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Ka=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Ia,``)}static parseTrackName(e){let t=Ua.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Wa.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){I(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){L(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){L(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){L(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){L(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){L(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){L(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){L(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;L(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){L(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){L(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ka.Composite=Ga,Ka.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Ka.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Ka.prototype.GetterByBindingType=[Ka.prototype._getValue_direct,Ka.prototype._getValue_array,Ka.prototype._getValue_arrayElement,Ka.prototype._getValue_toArray],Ka.prototype.SetterByBindingTypeAndVersioning=[[Ka.prototype._setValue_direct,Ka.prototype._setValue_direct_setNeedsUpdate,Ka.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ka.prototype._setValue_array,Ka.prototype._setValue_array_setNeedsUpdate,Ka.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ka.prototype._setValue_arrayElement,Ka.prototype._setValue_arrayElement_setNeedsUpdate,Ka.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ka.prototype._setValue_fromArray,Ka.prototype._setValue_fromArray_setNeedsUpdate,Ka.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var qa=new Wn,Ja=class{constructor(e,t,n=0,r=1/0){this.ray=new Un(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new tr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):L(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return qa.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(qa),this}intersectObject(e,t=!0,n=[]){return Xa(e,this,n,t),n.sort(Ya),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Xa(e[r],this,n,t);return n.sort(Ya),n}};function Ya(e,t){return e.distance-t.distance}function Xa(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Xa(r[e],t,n,!0)}}function Za(e,t,n,r){let i=Qa(r);switch(n){case P:return e*t;case Ne:return e*t/i.components*i.byteLength;case Pe:return e*t/i.components*i.byteLength;case Fe:return e*t*2/i.components*i.byteLength;case Ie:return e*t*2/i.components*i.byteLength;case F:return e*t*3/i.components*i.byteLength;case Ae:return e*t*4/i.components*i.byteLength;case Le:return e*t*4/i.components*i.byteLength;case Re:case ze:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Be:case Ve:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ue:case Ge:return Math.max(e,16)*Math.max(t,8)/4;case He:case We:return Math.max(e,8)*Math.max(t,8)/2;case Ke:case qe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Je:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ye:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Xe:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Ze:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Qe:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case $e:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case et:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case tt:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case nt:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case rt:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case it:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case at:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case ot:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case st:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case ct:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case lt:case ut:case dt:return Math.ceil(e/4)*Math.ceil(t/4)*16;case ft:case pt:return Math.ceil(e/4)*Math.ceil(t/4)*8;case mt:case ht:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Qa(e){switch(e){case ye:case M:return{byteLength:1,components:1};case xe:case be:case Te:return{byteLength:2,components:1};case Ee:case De:return{byteLength:2,components:4};case Ce:case Se:case we:return{byteLength:4,components:1};case N:case ke:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`181`}})),typeof window<`u`&&(window.__THREE__?I(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`181`);function $a(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function eo(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var W={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 uv = vec2( roughness, dotNV );
	return texture2D( dfgLUT, uv ).rg;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNV * dotNV), 0.0, dotNV), material.roughness );
	vec2 dfgL = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNL * dotNL), 0.0, dotNL), material.roughness );
	vec3 FssEss_V = material.specularColor * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColor * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColor + ( 1.0 - material.specularColor ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},G={common:{diffuse:{value:new U(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new V},alphaMap:{value:null},alphaMapTransform:{value:new V},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new V}},envmap:{envMap:{value:null},envMapRotation:{value:new V},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new V}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new V}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new V},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new V},normalScale:{value:new z(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new V},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new V}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new V}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new V}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new U(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new U(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new V},alphaTest:{value:0},uvTransform:{value:new V}},sprite:{diffuse:{value:new U(16777215)},opacity:{value:1},center:{value:new z(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new V},alphaMap:{value:null},alphaMapTransform:{value:new V},alphaTest:{value:0}}},to={basic:{uniforms:_i([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.fog]),vertexShader:W.meshbasic_vert,fragmentShader:W.meshbasic_frag},lambert:{uniforms:_i([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.fog,G.lights,{emissive:{value:new U(0)}}]),vertexShader:W.meshlambert_vert,fragmentShader:W.meshlambert_frag},phong:{uniforms:_i([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.fog,G.lights,{emissive:{value:new U(0)},specular:{value:new U(1118481)},shininess:{value:30}}]),vertexShader:W.meshphong_vert,fragmentShader:W.meshphong_frag},standard:{uniforms:_i([G.common,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.roughnessmap,G.metalnessmap,G.fog,G.lights,{emissive:{value:new U(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:W.meshphysical_vert,fragmentShader:W.meshphysical_frag},toon:{uniforms:_i([G.common,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.gradientmap,G.fog,G.lights,{emissive:{value:new U(0)}}]),vertexShader:W.meshtoon_vert,fragmentShader:W.meshtoon_frag},matcap:{uniforms:_i([G.common,G.bumpmap,G.normalmap,G.displacementmap,G.fog,{matcap:{value:null}}]),vertexShader:W.meshmatcap_vert,fragmentShader:W.meshmatcap_frag},points:{uniforms:_i([G.points,G.fog]),vertexShader:W.points_vert,fragmentShader:W.points_frag},dashed:{uniforms:_i([G.common,G.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:W.linedashed_vert,fragmentShader:W.linedashed_frag},depth:{uniforms:_i([G.common,G.displacementmap]),vertexShader:W.depth_vert,fragmentShader:W.depth_frag},normal:{uniforms:_i([G.common,G.bumpmap,G.normalmap,G.displacementmap,{opacity:{value:1}}]),vertexShader:W.meshnormal_vert,fragmentShader:W.meshnormal_frag},sprite:{uniforms:_i([G.sprite,G.fog]),vertexShader:W.sprite_vert,fragmentShader:W.sprite_frag},background:{uniforms:{uvTransform:{value:new V},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:W.background_vert,fragmentShader:W.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new V}},vertexShader:W.backgroundCube_vert,fragmentShader:W.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:W.cube_vert,fragmentShader:W.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:W.equirect_vert,fragmentShader:W.equirect_frag},distanceRGBA:{uniforms:_i([G.common,G.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:W.distanceRGBA_vert,fragmentShader:W.distanceRGBA_frag},shadow:{uniforms:_i([G.lights,G.fog,{color:{value:new U(0)},opacity:{value:1}}]),vertexShader:W.shadow_vert,fragmentShader:W.shadow_frag}};to.physical={uniforms:_i([to.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new V},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new V},clearcoatNormalScale:{value:new z(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new V},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new V},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new V},sheen:{value:0},sheenColor:{value:new U(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new V},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new V},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new V},transmissionSamplerSize:{value:new z},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new V},attenuationDistance:{value:0},attenuationColor:{value:new U(0)},specularColor:{value:new U(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new V},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new V},anisotropyVector:{value:new z},anisotropyMap:{value:null},anisotropyMapTransform:{value:new V}}]),vertexShader:W.meshphysical_vert,fragmentShader:W.meshphysical_frag};var no={r:0,b:0,g:0},ro=new er,io=new Wn;function ao(e,t,n,r,i,a,o){let s=new U(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new fi(new hi(1,1,1),new Ci({name:`BackgroundCubeMaterial`,uniforms:gi(to.backgroundCube.uniforms),vertexShader:to.backgroundCube.vertexShader,fragmentShader:to.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,`envMap`,{get:function(){return this.uniforms.envMap.value}}),i.update(u)),ro.copy(n.backgroundRotation),ro.x*=-1,ro.y*=-1,ro.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(ro.y*=-1,ro.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(io.makeRotationFromEuler(ro)),u.material.toneMapped=H.getTransfer(r.colorSpace)!==Dt,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new fi(new Xi(2,2),new Ci({name:`BackgroundMaterial`,uniforms:gi(to.background.uniforms),vertexShader:to.background.vertexShader,fragmentShader:to.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,`map`,{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=H.getTransfer(r.colorSpace)!==Dt,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(no,yi(e)),r.buffers.color.setClear(no.r,no.g,no.b,n,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function oo(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function so(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function co(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return!(t!==1023&&r.convert(t)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(I(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function lo(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Hi,s=new V,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function uo(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304)if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}else{let a=r.image;if(a&&a.height>0){let o=new Ni(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}else return null}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var fo=4,po=[.125,.215,.35,.446,.526,.582],mo=20,ho=256,go=new Aa,_o=new U,vo=null,yo=0,bo=0,xo=!1,So=new B,Co=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=So}=i;vo=this._renderer.getRenderTarget(),yo=this._renderer.getActiveCubeFace(),bo=this._renderer.getActiveMipmapLevel(),xo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ao(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ko(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(vo,yo,bo),this._renderer.xr.enabled=xo,e.scissorTest=!1,Eo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),vo=this._renderer.getRenderTarget(),yo=this._renderer.getActiveCubeFace(),bo=this._renderer.getActiveMipmapLevel(),xo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:ge,minFilter:ge,generateMipmaps:!1,type:Te,format:Ae,colorSpace:Tt,depthBuffer:!1},r=To(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=To(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=wo(r)),this._blurMaterial=Oo(r,e,t),this._ggxMaterial=Do(r,e,t)}return r}_compileMaterial(e){let t=new fi(new ei,e);this._renderer.compile(t,go)}_sceneToCubeUV(e,t,n,r,i){let a=new Oi(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(_o),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new fi(new hi,new zr({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(_o),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Eo(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ao()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ko());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Eo(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,go)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(.05+c*.95),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-fo?n-d+fo:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,Eo(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,go),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,Eo(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,go)}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&L(`blur direction must be either latitudinal or longitudinal!`);let l=this._lodMeshes[r];l.material=c;let u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/(2*mo-1),p=i/f,m=isFinite(i)?1+Math.floor(3*p):mo;m>mo&&I(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${mo}`);let h=[],g=0;for(let e=0;e<mo;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];Eo(t,3*v*(r>_-fo?r-_+fo:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,go)}};function wo(e){let t=[],n=[],r=[],i=e,a=e-fo+1+po.length;for(let o=0;o<a;o++){let a=2**i;t.push(a);let s=1/a;o>e-fo?s=po[o-e+fo-1]:o===0&&(s=0),n.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new ei;h.setAttribute(`position`,new Ur(f,3)),h.setAttribute(`uv`,new Ur(p,2)),h.setAttribute(`faceIndex`,new Ur(m,1)),r.push(new fi(h,null)),i>fo&&i--}return{lodMeshes:r,sizeLods:t,sigmas:n}}function To(e,t,n){let r=new mn(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Eo(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Do(e,t,n){return new Ci({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:ho,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:jo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Oo(e,t,n){let r=new Float32Array(mo),i=new B(0,1,0);return new Ci({name:`SphericalGaussianBlur`,defines:{n:mo,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:jo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function ko(){return new Ci({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:jo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ao(){return new Ci({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:jo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function jo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Mo(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new Co(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new Co(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function No(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Lt(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Po(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(jt(n)?Gr:Wr)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Fo(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function Io(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:L(`WebGLInfo: Unknown draw mode:`,r);break}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Lo(e,t,n){let r=new WeakMap,i=new fn;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new hn(h,p,m,u);g.type=we,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new z(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Ro(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var zo=new dn,Bo=new Ji(1,1),Vo=new hn,Ho=new gn,Uo=new Mi,Wo=[],Go=[],Ko=new Float32Array(16),qo=new Float32Array(9),Jo=new Float32Array(4);function Yo(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Wo[i];if(a===void 0&&(a=new Float32Array(i),Wo[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Xo(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Zo(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Qo(e,t){let n=Go[t];n===void 0&&(n=new Int32Array(t),Go[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function $o(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function es(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xo(n,t))return;e.uniform2fv(this.addr,t),Zo(n,t)}}function ts(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Xo(n,t))return;e.uniform3fv(this.addr,t),Zo(n,t)}}function ns(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xo(n,t))return;e.uniform4fv(this.addr,t),Zo(n,t)}}function rs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Xo(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Zo(n,t)}else{if(Xo(n,r))return;Jo.set(r),e.uniformMatrix2fv(this.addr,!1,Jo),Zo(n,r)}}function is(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Xo(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Zo(n,t)}else{if(Xo(n,r))return;qo.set(r),e.uniformMatrix3fv(this.addr,!1,qo),Zo(n,r)}}function as(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Xo(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Zo(n,t)}else{if(Xo(n,r))return;Ko.set(r),e.uniformMatrix4fv(this.addr,!1,Ko),Zo(n,r)}}function os(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function ss(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xo(n,t))return;e.uniform2iv(this.addr,t),Zo(n,t)}}function cs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Xo(n,t))return;e.uniform3iv(this.addr,t),Zo(n,t)}}function ls(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xo(n,t))return;e.uniform4iv(this.addr,t),Zo(n,t)}}function us(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function ds(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xo(n,t))return;e.uniform2uiv(this.addr,t),Zo(n,t)}}function fs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Xo(n,t))return;e.uniform3uiv(this.addr,t),Zo(n,t)}}function ps(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xo(n,t))return;e.uniform4uiv(this.addr,t),Zo(n,t)}}function ms(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Bo.compareFunction=515,a=Bo):a=zo,n.setTexture2D(t||a,i)}function hs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Ho,i)}function gs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Uo,i)}function _s(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Vo,i)}function vs(e){switch(e){case 5126:return $o;case 35664:return es;case 35665:return ts;case 35666:return ns;case 35674:return rs;case 35675:return is;case 35676:return as;case 5124:case 35670:return os;case 35667:case 35671:return ss;case 35668:case 35672:return cs;case 35669:case 35673:return ls;case 5125:return us;case 36294:return ds;case 36295:return fs;case 36296:return ps;case 35678:case 36198:case 36298:case 36306:case 35682:return ms;case 35679:case 36299:case 36307:return hs;case 35680:case 36300:case 36308:case 36293:return gs;case 36289:case 36303:case 36311:case 36292:return _s}}function ys(e,t){e.uniform1fv(this.addr,t)}function bs(e,t){let n=Yo(t,this.size,2);e.uniform2fv(this.addr,n)}function xs(e,t){let n=Yo(t,this.size,3);e.uniform3fv(this.addr,n)}function Ss(e,t){let n=Yo(t,this.size,4);e.uniform4fv(this.addr,n)}function Cs(e,t){let n=Yo(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function ws(e,t){let n=Yo(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Ts(e,t){let n=Yo(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Es(e,t){e.uniform1iv(this.addr,t)}function Ds(e,t){e.uniform2iv(this.addr,t)}function Os(e,t){e.uniform3iv(this.addr,t)}function ks(e,t){e.uniform4iv(this.addr,t)}function As(e,t){e.uniform1uiv(this.addr,t)}function js(e,t){e.uniform2uiv(this.addr,t)}function Ms(e,t){e.uniform3uiv(this.addr,t)}function Ns(e,t){e.uniform4uiv(this.addr,t)}function Ps(e,t,n){let r=this.cache,i=t.length,a=Qo(n,i);Xo(r,a)||(e.uniform1iv(this.addr,a),Zo(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||zo,a[e])}function Fs(e,t,n){let r=this.cache,i=t.length,a=Qo(n,i);Xo(r,a)||(e.uniform1iv(this.addr,a),Zo(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Ho,a[e])}function Is(e,t,n){let r=this.cache,i=t.length,a=Qo(n,i);Xo(r,a)||(e.uniform1iv(this.addr,a),Zo(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Uo,a[e])}function Ls(e,t,n){let r=this.cache,i=t.length,a=Qo(n,i);Xo(r,a)||(e.uniform1iv(this.addr,a),Zo(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Vo,a[e])}function Rs(e){switch(e){case 5126:return ys;case 35664:return bs;case 35665:return xs;case 35666:return Ss;case 35674:return Cs;case 35675:return ws;case 35676:return Ts;case 5124:case 35670:return Es;case 35667:case 35671:return Ds;case 35668:case 35672:return Os;case 35669:case 35673:return ks;case 5125:return As;case 36294:return js;case 36295:return Ms;case 36296:return Ns;case 35678:case 36198:case 36298:case 36306:case 35682:return Ps;case 35679:case 36299:case 36307:return Fs;case 35680:case 36300:case 36308:case 36293:return Is;case 36289:case 36303:case 36311:case 36292:return Ls}}var zs=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=vs(t.type)}},Bs=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Rs(t.type)}},Vs=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Hs=/(\w+)(\])?(\[|\.)?/g;function Us(e,t){e.seq.push(t),e.map[t.id]=t}function Ws(e,t,n){let r=e.name,i=r.length;for(Hs.lastIndex=0;;){let a=Hs.exec(r),o=Hs.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Us(n,l===void 0?new zs(s,e,t):new Bs(s,e,t));break}else{let e=n.map[s];e===void 0&&(e=new Vs(s),Us(n,e)),n=e}}}var Gs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Ws(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Ks(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var qs=37297,Js=0;function Ys(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Xs=new V;function Zs(e){H._getMatrix(Xs,H.workingColorSpace,e);let t=`mat3( ${Xs.elements.map(e=>e.toFixed(4))} )`;switch(H.getTransfer(e)){case Et:return[t,`LinearTransferOETF`];case Dt:return[t,`sRGBTransferOETF`];default:return I(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Qs(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Ys(e.getShaderSource(t),r)}else return i}function $s(e,t){let n=Zs(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function ec(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:I(`WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var tc=new B;function nc(){return H.getLuminanceCoefficients(tc),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${tc.x.toFixed(4)}, ${tc.y.toFixed(4)}, ${tc.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function rc(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(oc).join(`
`)}function ic(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function ac(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function oc(e){return e!==``}function sc(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function cc(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var lc=/^[ \t]*#include +<([\w\d./]+)>/gm;function uc(e){return e.replace(lc,fc)}var dc=new Map;function fc(e,t){let n=W[t];if(n===void 0){let e=dc.get(t);if(e!==void 0)n=W[e],I(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return uc(n)}var pc=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function mc(e){return e.replace(pc,hc)}function hc(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function gc(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}function _c(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function vc(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`;break}return t}function yc(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`;break}return t}function bc(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`;break}return t}function xc(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Sc(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=_c(n),l=vc(n),u=yc(n),d=bc(n),f=xc(n),p=rc(n),m=ic(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(oc).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(oc).join(`
`),_.length>0&&(_+=`
`)):(g=[gc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(oc).join(`
`),_=[gc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:W.tonemapping_pars_fragment,n.toneMapping===0?``:ec(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,W.colorspace_pars_fragment,$s(`linearToOutputTexel`,n.outputColorSpace),nc(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(oc).join(`
`)),o=uc(o),o=sc(o,n),o=cc(o,n),s=uc(s),s=sc(s,n),s=cc(s,n),o=mc(o),s=mc(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Ks(i,i.VERTEX_SHADER,y),S=Ks(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1)if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Qs(i,x,`vertex`),n=Qs(i,S,`fragment`);L(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}else o===``?(s===``||c===``)&&(u=!1):I(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Gs(i,h),T=ac(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,qs)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Js++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var Cc=0,wc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Tc(e),t.set(e,n)),n}},Tc=class{constructor(e){this.id=Cc++,this.code=e,this.usedTimes=0}};function Ec(e,t,n,r,i,a,o){let s=new tr,c=new wc,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&I(`WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=to[C];D=e.vertexShader,O=e.fragmentShader}else D=a.vertexShader,O=a.fragmentShader,c.update(a),k=c.getVertexShaderID(a),A=c.getFragmentShaderID(a);let ee=e.getRenderTarget(),te=e.state.buffers.depth.getReversed(),ne=_.isInstancedMesh===!0,re=_.isBatchedMesh===!0,j=!!a.map,ie=!!a.matcap,ae=!!x,oe=!!a.aoMap,se=!!a.lightMap,ce=!!a.bumpMap,le=!!a.normalMap,ue=!!a.displacementMap,de=!!a.emissiveMap,fe=!!a.metalnessMap,pe=!!a.roughnessMap,me=a.anisotropy>0,he=a.clearcoat>0,ge=a.dispersion>0,_e=a.iridescence>0,ve=a.sheen>0,ye=a.transmission>0,M=me&&!!a.anisotropyMap,be=he&&!!a.clearcoatMap,xe=he&&!!a.clearcoatNormalMap,Se=he&&!!a.clearcoatRoughnessMap,Ce=_e&&!!a.iridescenceMap,we=_e&&!!a.iridescenceThicknessMap,Te=ve&&!!a.sheenColorMap,Ee=ve&&!!a.sheenRoughnessMap,De=!!a.specularMap,Oe=!!a.specularColorMap,N=!!a.specularIntensityMap,ke=ye&&!!a.transmissionMap,P=ye&&!!a.thicknessMap,F=!!a.gradientMap,Ae=!!a.alphaMap,je=a.alphaTest>0,Me=!!a.alphaHash,Ne=!!a.extensions,Pe=0;a.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Pe=e.toneMapping);let Fe={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:O,defines:a.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:re,batchingColor:re&&_._colorsTexture!==null,instancing:ne,instancingColor:ne&&_.instanceColor!==null,instancingMorph:ne&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ee===null?e.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:Tt,alphaToCoverage:!!a.alphaToCoverage,map:j,matcap:ie,envMap:ae,envMapMode:ae&&x.mapping,envMapCubeUVHeight:S,aoMap:oe,lightMap:se,bumpMap:ce,normalMap:le,displacementMap:f&&ue,emissiveMap:de,normalMapObjectSpace:le&&a.normalMapType===1,normalMapTangentSpace:le&&a.normalMapType===0,metalnessMap:fe,roughnessMap:pe,anisotropy:me,anisotropyMap:M,clearcoat:he,clearcoatMap:be,clearcoatNormalMap:xe,clearcoatRoughnessMap:Se,dispersion:ge,iridescence:_e,iridescenceMap:Ce,iridescenceThicknessMap:we,sheen:ve,sheenColorMap:Te,sheenRoughnessMap:Ee,specularMap:De,specularColorMap:Oe,specularIntensityMap:N,transmission:ye,transmissionMap:ke,thicknessMap:P,gradientMap:F,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:Ae,alphaTest:je,alphaHash:Me,combine:a.combine,mapUv:j&&h(a.map.channel),aoMapUv:oe&&h(a.aoMap.channel),lightMapUv:se&&h(a.lightMap.channel),bumpMapUv:ce&&h(a.bumpMap.channel),normalMapUv:le&&h(a.normalMap.channel),displacementMapUv:ue&&h(a.displacementMap.channel),emissiveMapUv:de&&h(a.emissiveMap.channel),metalnessMapUv:fe&&h(a.metalnessMap.channel),roughnessMapUv:pe&&h(a.roughnessMap.channel),anisotropyMapUv:M&&h(a.anisotropyMap.channel),clearcoatMapUv:be&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:xe&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Se&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:Ce&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:we&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:Te&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&h(a.sheenRoughnessMap.channel),specularMapUv:De&&h(a.specularMap.channel),specularColorMapUv:Oe&&h(a.specularColorMap.channel),specularIntensityMapUv:N&&h(a.specularIntensityMap.channel),transmissionMapUv:ke&&h(a.transmissionMap.channel),thicknessMapUv:P&&h(a.thicknessMap.channel),alphaMapUv:Ae&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(le||me),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(j||Ae),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:te,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:Pe,decodeVideoTexture:j&&a.map.isVideoTexture===!0&&H.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:de&&a.emissiveMap.isVideoTexture===!0&&H.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Ne&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Ne&&a.extensions.multiDraw===!0||re)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return Fe.vertexUv1s=l.has(1),Fe.vertexUv2s=l.has(2),Fe.vertexUv3s=l.has(3),l.clear(),Fe}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=to[t];n=bi.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new Sc(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function Dc(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Oc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function kc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Ac(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||Oc),r.length>1&&r.sort(t||kc),i.length>1&&i.sort(t||kc)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function jc(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Ac,e.set(t,[i])):n>=r.length?(i=new Ac,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Mc(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new B,color:new U};break;case`SpotLight`:n={position:new B,direction:new B,color:new U,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new B,color:new U,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new B,skyColor:new U,groundColor:new U};break;case`RectAreaLight`:n={color:new U,position:new B,halfWidth:new B,halfHeight:new B};break}return e[t.id]=n,n}}}function Nc(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new z};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new z};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new z,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var Pc=0;function Fc(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Ic(e){let t=new Mc,n=Nc(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new B);let i=new B,a=new Wn,o=new Wn;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(Fc);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=G.LTC_FLOAT_1,r.rectAreaLTC2=G.LTC_FLOAT_2):(r.rectAreaLTC1=G.LTC_HALF_1,r.rectAreaLTC2=G.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=Pc++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Lc(e){let t=new Ic(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function Rc(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Lc(e),t.set(n,[a])):r>=i.length?(a=new Lc(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var zc=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Bc=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Vc(e,t,n){let r=new Ki,i=new z,a=new z,o=new fn,s=new Qi({depthPacking:Ct}),c=new $i,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Ci({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new z},radius:{value:4}},vertexShader:zc,fragmentShader:Bc}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new ei;m.setAttribute(`position`,new Ur(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new fi(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==3&&this.type===3,m=_===3&&this.type!==3;for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){I(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let h=d.getFrameExtents();if(i.multiply(h),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/h.x),i.x=a.x*h.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/h.y),i.y=a.y*h.y,d.mapSize.y=a.y)),d.map===null||p===!0||m===!0){let e=this.type===3?{}:{minFilter:pe,magFilter:pe};d.map!==null&&d.map.dispose(),d.map=new mn(i.x,i.y,e),d.map.texture.name=l.name+`.shadowMap`,d.camera.updateProjectionMatrix()}e.setRenderTarget(d.map),e.clear();let g=d.getViewportCount();for(let e=0;e<g;e++){let t=d.getViewport(e);o.set(a.x*t.x,a.y*t.y,a.x*t.z,a.y*t.w),f.viewport(o),d.updateMatrices(l,e),r=d.getFrustum(),b(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new mn(i.x,i.y)),f.uniforms.shadow_pass.value=n.map.texture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var Hc={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function Uc(e,t){function n(){let t=!1,n=new fn,r=null,i=new fn(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?de(e.DEPTH_TEST):fe(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Hc[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?de(e.STENCIL_TEST):fe(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new U(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,ee=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),te=!1,ne=0,re=e.getParameter(e.VERSION);re.indexOf(`WebGL`)===-1?re.indexOf(`OpenGL ES`)!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),te=ne>=2):(ne=parseFloat(/^WebGL (\d)/.exec(re)[1]),te=ne>=1);let j=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new fn().fromArray(ae),ce=new fn().fromArray(oe);function le(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ue={};ue[e.TEXTURE_2D]=le(e.TEXTURE_2D,e.TEXTURE_2D,1),ue[e.TEXTURE_CUBE_MAP]=le(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[e.TEXTURE_2D_ARRAY]=le(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ue[e.TEXTURE_3D]=le(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),de(e.DEPTH_TEST),o.setFunc(3),M(!1),be(1),de(e.CULL_FACE),ve(0);function de(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function fe(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function pe(t,n){return d[t]===n?!1:(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function me(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function he(t){return m===t?!1:(e.useProgram(t),m=t,!0)}let ge={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ge[103]=e.MIN,ge[104]=e.MAX;let _e={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ve(t,n,r,i,a,o,s,c,l,u){if(t===0){h===!0&&(fe(e.BLEND),h=!1);return}if(h===!1&&(de(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:L(`WebGLState: Invalid blending: `,t);break}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:L(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:L(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:L(`WebGLState: Invalid blending: `,t);break}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}return}a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(ge[n],ge[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(_e[r],_e[i],_e[o],_e[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function ye(t,n){t.side===2?fe(e.CULL_FACE):de(e.CULL_FACE);let r=t.side===1;n&&(r=!r),M(r),t.blending===1&&t.transparent===!1?ve(0):ve(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Se(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?de(e.SAMPLE_ALPHA_TO_COVERAGE):fe(e.SAMPLE_ALPHA_TO_COVERAGE)}function M(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function be(t){t===0?fe(e.CULL_FACE):(de(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function xe(t){t!==O&&(te&&e.lineWidth(t),O=t)}function Se(t,n,r){t?(de(e.POLYGON_OFFSET_FILL),(k!==n||A!==r)&&(e.polygonOffset(n,r),k=n,A=r)):fe(e.POLYGON_OFFSET_FILL)}function Ce(t){t?de(e.SCISSOR_TEST):fe(e.SCISSOR_TEST)}function we(t){t===void 0&&(t=e.TEXTURE0+ee-1),j!==t&&(e.activeTexture(t),j=t)}function Te(t,n,r){r===void 0&&(r=j===null?e.TEXTURE0+ee-1:j);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(j!==r&&(e.activeTexture(r),j=r),e.bindTexture(t,n||ue[t]),i.type=t,i.texture=n)}function Ee(){let t=ie[j];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function De(){try{e.compressedTexImage2D(...arguments)}catch(e){e(`WebGLState:`,e)}}function Oe(){try{e.compressedTexImage3D(...arguments)}catch(e){e(`WebGLState:`,e)}}function N(){try{e.texSubImage2D(...arguments)}catch(e){e(`WebGLState:`,e)}}function ke(){try{e.texSubImage3D(...arguments)}catch(e){e(`WebGLState:`,e)}}function P(){try{e.compressedTexSubImage2D(...arguments)}catch(e){e(`WebGLState:`,e)}}function F(){try{e.compressedTexSubImage3D(...arguments)}catch(e){e(`WebGLState:`,e)}}function Ae(){try{e.texStorage2D(...arguments)}catch(e){e(`WebGLState:`,e)}}function je(){try{e.texStorage3D(...arguments)}catch(e){e(`WebGLState:`,e)}}function Me(){try{e.texImage2D(...arguments)}catch(e){e(`WebGLState:`,e)}}function Ne(){try{e.texImage3D(...arguments)}catch(e){e(`WebGLState:`,e)}}function Pe(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function Fe(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function Ie(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Le(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Re(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},j=null,ie={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new U(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:de,disable:fe,bindFramebuffer:pe,drawBuffers:me,useProgram:he,setBlending:ve,setMaterial:ye,setFlipSided:M,setCullFace:be,setLineWidth:xe,setPolygonOffset:Se,setScissorTest:Ce,activeTexture:we,bindTexture:Te,unbindTexture:Ee,compressedTexImage2D:De,compressedTexImage3D:Oe,texImage2D:Me,texImage3D:Ne,updateUBOMapping:Ie,uniformBlockBinding:Le,texStorage2D:Ae,texStorage3D:je,texSubImage2D:N,texSubImage3D:ke,compressedTexSubImage2D:P,compressedTexSubImage3D:F,scissor:Pe,viewport:Fe,reset:Re}}function Wc(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new z,u=new WeakMap,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function m(e,t){return p?new OffscreenCanvas(e,t):Mt(`canvas`)}function h(e,t,n){let r=1,i=je(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1)if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);d===void 0&&(d=m(n,a));let o=t?m(n,a):d;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),I(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}else return`data`in e&&I(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e;return e}function g(e){return e.generateMipmaps}function _(t){e.generateMipmap(t)}function v(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];I(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(s=e.R11F_G11F_B10F)),r===e.RGBA){let t=o?Et:H.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function b(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,I(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function x(e,t){return g(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function S(e){let t=e.target;t.removeEventListener(`dispose`,S),w(t),t.isVideoTexture&&u.delete(t)}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),E(t)}function w(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=f.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&T(e),Object.keys(i).length===0&&f.delete(n)}r.remove(e)}function T(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=f.get(i);delete a[n.__cacheKey],o.memory.textures--}function E(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let D=0;function O(){D=0}function k(){let e=D;return e>=i.maxTextures&&I(`WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),D+=1,e}function A(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function ee(t,i){let a=r.get(t);if(t.isVideoTexture&&F(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)I(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)I(`WebGLRenderer: Texture marked for update but image is incomplete`);else{ye(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function te(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){ye(a,t,i);return}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function ne(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){ye(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function re(t,i){let a=r.get(t);if(t.version>0&&a.__version!==t.version){M(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let j={[ue]:e.REPEAT,[de]:e.CLAMP_TO_EDGE,[fe]:e.MIRRORED_REPEAT},ie={[pe]:e.NEAREST,[me]:e.NEAREST_MIPMAP_NEAREST,[he]:e.NEAREST_MIPMAP_LINEAR,[ge]:e.LINEAR,[_e]:e.LINEAR_MIPMAP_NEAREST,[ve]:e.LINEAR_MIPMAP_LINEAR},ae={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function oe(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&I(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,j[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,j[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,j[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,ie[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,ie[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,ae[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function se(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,S));let i=n.source,a=f.get(i);a===void 0&&(a={},f.set(i,a));let s=A(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&T(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function ce(e,t,n){return Math.floor(Math.floor(e/n)/t)}function le(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=ce(n.start,r.width,4),c=ce(t.start,r.width,4);n.start<=i+1&&a===c&&ce(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=e.getParameter(e.UNPACK_ROW_LENGTH),l=e.getParameter(e.UNPACK_SKIP_PIXELS),u=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;e.pixelStorei(e.UNPACK_SKIP_PIXELS,u),e.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,c),e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function ye(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=se(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=H.getPrimaries(H.workingColorSpace),r=o.colorSpace===``?null:H.getPrimaries(o.colorSpace),f=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=h(o.image,!1,i.maxTextureSize);p=Ae(o,p);let m=a.convert(o.format,o.colorSpace),v=a.convert(o.type),S=y(o.internalFormat,m,v,o.colorSpace,o.isVideoTexture);oe(c,o);let C,w=o.mipmaps,T=o.isVideoTexture!==!0,E=d.__version===void 0||l===!0,D=u.dataReady,O=x(o,p);if(o.isDepthTexture)S=b(o.format===Me,o.type),E&&(T?n.texStorage2D(e.TEXTURE_2D,1,S,p.width,p.height):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,null));else if(o.isDataTexture)if(w.length>0){T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data);o.generateMipmaps=!1}else T?(E&&n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height),D&&le(o,p,m,v)):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,p.data);else if(o.isCompressedTexture)if(o.isCompressedArrayTexture){T&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,w[0].width,w[0].height,p.depth);for(let t=0,r=w.length;t<r;t++)if(C=w[t],o.format!==1023)if(m!==null)if(T){if(D)if(o.layerUpdates.size>0){let r=Za(C.width,C.height,o.format,o.type);for(let i of o.layerUpdates){let a=C.data.subarray(i*r/C.data.BYTES_PER_ELEMENT,(i+1)*r/C.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,C.width,C.height,1,m,a)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,C.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,C.data,0,0);else I(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`);else T?D&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,v,C.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,m,v,C.data)}else{T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data):m===null?I(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,C.data):n.compressedTexImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,C.data)}else if(o.isDataArrayTexture)if(T){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,p.width,p.height,p.depth),D)if(o.layerUpdates.size>0){let t=Za(p.width,p.height,o.format,o.type);for(let r of o.layerUpdates){let i=p.data.subarray(r*t/p.data.BYTES_PER_ELEMENT,(r+1)*t/p.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,p.width,p.height,1,m,v,i)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,S,p.width,p.height,p.depth,0,m,v,p.data);else if(o.isData3DTexture)T?(E&&n.texStorage3D(e.TEXTURE_3D,O,S,p.width,p.height,p.depth),D&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)):n.texImage3D(e.TEXTURE_3D,0,S,p.width,p.height,p.depth,0,m,v,p.data);else if(o.isFramebufferTexture){if(E)if(T)n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height);else{let t=p.width,r=p.height;for(let i=0;i<O;i++)n.texImage2D(e.TEXTURE_2D,i,S,t,r,0,m,v,null),t>>=1,r>>=1}}else if(w.length>0){if(T&&E){let t=je(w[0]);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m,v,C):n.texImage2D(e.TEXTURE_2D,t,S,m,v,C);o.generateMipmaps=!1}else if(T){if(E){let t=je(p);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,m,v,p)}else n.texImage2D(e.TEXTURE_2D,0,S,m,v,p);g(o)&&_(c),d.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function M(t,o,s){if(o.image.length!==6)return;let c=se(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=H.getPrimaries(H.workingColorSpace),r=o.colorSpace===``?null:H.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=h(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=Ae(o,m[e]);let v=m[0],b=a.convert(o.format,o.colorSpace),S=a.convert(o.type),C=y(o.internalFormat,b,S,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=x(o,v);oe(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,v.width,v.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,b,S,i.data):b===null?I(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=je(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,b,S,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,b,S,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,b,S,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,b,S,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,b,S,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,b,S,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,b,S,i.image[t])}}}g(o)&&_(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function be(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=y(o.internalFormat,d,f,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),P(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,ke(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function xe(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=b(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=ke(n);P(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=y(o.internalFormat,c,l,o.colorSpace),d=ke(n);r&&P(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):P(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Se(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let a=r.get(i.depthTexture);a.__renderTarget=i,(!a.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),ee(i.depthTexture,0);let o=a.__webglTexture,c=ke(i);if(i.depthTexture.format===1026)P(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0);else if(i.depthTexture.format===1027)P(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0);else throw Error(`Unknown depthTexture format`)}function Ce(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?Se(i.__webglFramebuffer[0],t):Se(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),xe(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),xe(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function we(t,n,i){let a=r.get(t);n!==void 0&&be(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&Ce(t)}function Te(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,C);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&P(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=y(r.internalFormat,i,o,r.colorSpace,t.isXRRenderTarget===!0),u=ke(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),xe(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),oe(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)be(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else be(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);g(i)&&_(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),oe(c,a),be(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),g(a)&&_(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),oe(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)be(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else be(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);g(i)&&_(r),n.unbindTexture()}t.depthBuffer&&Ce(t)}function Ee(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(g(a)){let t=v(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),_(t),n.unbindTexture()}}}let De=[],Oe=[];function N(t){if(t.samples>0){if(P(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(De.length=0,Oe.length=0,De.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(De.push(l),Oe.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Oe)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,De))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function ke(e){return Math.min(i.maxSamples,e.samples)}function P(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function F(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function Ae(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(H.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&I(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):L(`WebGLTextures: Unsupported texture color space:`,n)),t}function je(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=O,this.setTexture2D=ee,this.setTexture2DArray=te,this.setTexture3D=ne,this.setTextureCube=re,this.rebindTextures=we,this.setupRenderTarget=Te,this.updateRenderTargetMipmap=Ee,this.updateMultisampleRenderTarget=N,this.setupDepthRenderbuffer=Ce,this.setupFrameBufferTexture=be,this.useMultisampledRTT=P}function Gc(e,t){function n(n,r=``){let i,a=H.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779)if(a===`srgb`)if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===35840||n===35841||n===35842||n===35843)if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===36196||n===37492||n===37496)if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821)if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===36492||n===36494||n===36495)if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===36283||n===36284||n===36285||n===36286)if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Kc=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,qc=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Jc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Yi(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ci({vertexShader:Kc,fragmentShader:qc,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new fi(new Xi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Yc=class extends zt{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new Jc,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new z,C=null,w=new Oi;w.viewport=new fn;let T=new Oi;T.viewport=new fn;let E=[w,T],D=new Pa,O=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new Ii,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new Ii,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new Ii,b[e]=t),t.getHandSpace()};function A(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ee(){r.removeEventListener(`select`,A),r.removeEventListener(`selectstart`,A),r.removeEventListener(`selectend`,A),r.removeEventListener(`squeeze`,A),r.removeEventListener(`squeezestart`,A),r.removeEventListener(`squeezeend`,A),r.removeEventListener(`end`,ee),r.removeEventListener(`inputsourceschange`,te);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}O=null,k=null,h.reset();for(let e in g)delete g[e];e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,ce.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&I(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&I(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,A),r.addEventListener(`selectstart`,A),r.addEventListener(`selectend`,A),r.addEventListener(`squeeze`,A),r.addEventListener(`squeezestart`,A),r.addEventListener(`squeezeend`,A),r.addEventListener(`end`,ee),r.addEventListener(`inputsourceschange`,te),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?Me:je,a=_.stencil?Oe:Ce);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new mn(d.textureWidth,d.textureHeight,{format:Ae,type:ye,depthTexture:new Ji(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new mn(f.framebufferWidth,f.framebufferHeight,{format:Ae,type:ye,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ce.setContext(r),ce.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function te(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let ne=new B,re=new B;function j(e,t,n){ne.setFromMatrixPosition(t.matrixWorld),re.setFromMatrixPosition(n.matrixWorld);let r=ne.distanceTo(re),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ie(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),D.near=T.near=w.near=t,D.far=T.far=w.far=n,(O!==D.near||k!==D.far)&&(r.updateRenderState({depthNear:D.near,depthFar:D.far}),O=D.near,k=D.far),D.layers.mask=e.layers.mask|6,w.layers.mask=D.layers.mask&3,T.layers.mask=D.layers.mask&5;let i=e.parent,a=D.cameras;ie(D,i);for(let e=0;e<a.length;e++)ie(a[e],i);a.length===2?j(D,w,T):D.projectionMatrix.copy(w.projectionMatrix),ae(e,D,i)};function ae(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Ht*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(!(d===null&&f===null))return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(D)},this.getCameraTexture=function(e){return g[e]};let oe=null;function se(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==D.cameras.length&&(D.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=E[n];o===void 0&&(o=new Oi,o.layers.enable(n),o.viewport=new fn,E[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(D.matrix.copy(o.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),i===!0&&D.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new Yi,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}oe&&oe(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let ce=new $a;ce.setAnimationLoop(se),this.setAnimationLoop=function(e){oe=e},this.dispose=function(){}}},Xc=new er,Zc=new Wn;function Qc(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,yi(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,Xc.copy(o),Xc.x*=-1,Xc.y*=-1,Xc.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(Xc.y*=-1,Xc.z*=-1),e.envMapRotation.value.setFromMatrix4(Zc.makeRotationFromEuler(Xc)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function $c(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return L(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return typeof i==`number`||typeof i==`boolean`?r[a]=i:r[a]=i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?I(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):I(`WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var el=new Uint16Array([11481,15204,11534,15171,11808,15015,12385,14843,12894,14716,13396,14600,13693,14483,13976,14366,14237,14171,14405,13961,14511,13770,14605,13598,14687,13444,14760,13305,14822,13066,14876,12857,14923,12675,14963,12517,14997,12379,15025,12230,15049,12023,15070,11843,15086,11687,15100,11551,15111,11433,15120,11330,15127,11217,15132,11060,15135,10922,15138,10801,15139,10695,15139,10600,13012,14923,13020,14917,13064,14886,13176,14800,13349,14666,13513,14526,13724,14398,13960,14230,14200,14020,14383,13827,14488,13651,14583,13491,14667,13348,14740,13132,14803,12908,14856,12713,14901,12542,14938,12394,14968,12241,14992,12017,15010,11822,15024,11654,15034,11507,15041,11380,15044,11269,15044,11081,15042,10913,15037,10764,15031,10635,15023,10520,15014,10419,15003,10330,13657,14676,13658,14673,13670,14660,13698,14622,13750,14547,13834,14442,13956,14317,14112,14093,14291,13889,14407,13704,14499,13538,14586,13389,14664,13201,14733,12966,14792,12758,14842,12577,14882,12418,14915,12272,14940,12033,14959,11826,14972,11646,14980,11490,14983,11355,14983,11212,14979,11008,14971,10830,14961,10675,14950,10540,14936,10420,14923,10315,14909,10204,14894,10041,14089,14460,14090,14459,14096,14452,14112,14431,14141,14388,14186,14305,14252,14130,14341,13941,14399,13756,14467,13585,14539,13430,14610,13272,14677,13026,14737,12808,14790,12617,14833,12449,14869,12303,14896,12065,14916,11845,14929,11655,14937,11490,14939,11347,14936,11184,14930,10970,14921,10783,14912,10621,14900,10480,14885,10356,14867,10247,14848,10062,14827,9894,14805,9745,14400,14208,14400,14206,14402,14198,14406,14174,14415,14122,14427,14035,14444,13913,14469,13767,14504,13613,14548,13463,14598,13324,14651,13082,14704,12858,14752,12658,14795,12483,14831,12330,14860,12106,14881,11875,14895,11675,14903,11501,14905,11351,14903,11178,14900,10953,14892,10757,14880,10589,14865,10442,14847,10313,14827,10162,14805,9965,14782,9792,14757,9642,14731,9507,14562,13883,14562,13883,14563,13877,14566,13862,14570,13830,14576,13773,14584,13689,14595,13582,14613,13461,14637,13336,14668,13120,14704,12897,14741,12695,14776,12516,14808,12358,14835,12150,14856,11910,14870,11701,14878,11519,14882,11361,14884,11187,14880,10951,14871,10748,14858,10572,14842,10418,14823,10286,14801,10099,14777,9897,14751,9722,14725,9567,14696,9430,14666,9309,14702,13604,14702,13604,14702,13600,14703,13591,14705,13570,14707,13533,14709,13477,14712,13400,14718,13305,14727,13106,14743,12907,14762,12716,14784,12539,14807,12380,14827,12190,14844,11943,14855,11727,14863,11539,14870,11376,14871,11204,14868,10960,14858,10748,14845,10565,14829,10406,14809,10269,14786,10058,14761,9852,14734,9671,14705,9512,14674,9374,14641,9253,14608,9076,14821,13366,14821,13365,14821,13364,14821,13358,14821,13344,14821,13320,14819,13252,14817,13145,14815,13011,14814,12858,14817,12698,14823,12539,14832,12389,14841,12214,14850,11968,14856,11750,14861,11558,14866,11390,14867,11226,14862,10972,14853,10754,14840,10565,14823,10401,14803,10259,14780,10032,14754,9820,14725,9635,14694,9473,14661,9333,14627,9203,14593,8988,14557,8798,14923,13014,14922,13014,14922,13012,14922,13004,14920,12987,14919,12957,14915,12907,14909,12834,14902,12738,14894,12623,14888,12498,14883,12370,14880,12203,14878,11970,14875,11759,14873,11569,14874,11401,14872,11243,14865,10986,14855,10762,14842,10568,14825,10401,14804,10255,14781,10017,14754,9799,14725,9611,14692,9445,14658,9301,14623,9139,14587,8920,14548,8729,14509,8562,15008,12672,15008,12672,15008,12671,15007,12667,15005,12656,15001,12637,14997,12605,14989,12556,14978,12490,14966,12407,14953,12313,14940,12136,14927,11934,14914,11742,14903,11563,14896,11401,14889,11247,14879,10992,14866,10767,14851,10570,14833,10400,14812,10252,14789,10007,14761,9784,14731,9592,14698,9424,14663,9279,14627,9088,14588,8868,14548,8676,14508,8508,14467,8360,15080,12386,15080,12386,15079,12385,15078,12383,15076,12378,15072,12367,15066,12347,15057,12315,15045,12253,15030,12138,15012,11998,14993,11845,14972,11685,14951,11530,14935,11383,14920,11228,14904,10981,14887,10762,14870,10567,14850,10397,14827,10248,14803,9997,14774,9771,14743,9578,14710,9407,14674,9259,14637,9048,14596,8826,14555,8632,14514,8464,14471,8317,14427,8182,15139,12008,15139,12008,15138,12008,15137,12007,15135,12003,15130,11990,15124,11969,15115,11929,15102,11872,15086,11794,15064,11693,15041,11581,15013,11459,14987,11336,14966,11170,14944,10944,14921,10738,14898,10552,14875,10387,14850,10239,14824,9983,14794,9758,14762,9563,14728,9392,14692,9244,14653,9014,14611,8791,14569,8597,14526,8427,14481,8281,14436,8110,14391,7885,15188,11617,15188,11617,15187,11617,15186,11618,15183,11617,15179,11612,15173,11601,15163,11581,15150,11546,15133,11495,15110,11427,15083,11346,15051,11246,15024,11057,14996,10868,14967,10687,14938,10517,14911,10362,14882,10206,14853,9956,14821,9737,14787,9543,14752,9375,14715,9228,14675,8980,14632,8760,14589,8565,14544,8395,14498,8248,14451,8049,14404,7824,14357,7630,15228,11298,15228,11298,15227,11299,15226,11301,15223,11303,15219,11302,15213,11299,15204,11290,15191,11271,15174,11217,15150,11129,15119,11015,15087,10886,15057,10744,15024,10599,14990,10455,14957,10318,14924,10143,14891,9911,14856,9701,14820,9516,14782,9352,14744,9200,14703,8946,14659,8725,14615,8533,14568,8366,14521,8220,14472,7992,14423,7770,14374,7578,14315,7408,15260,10819,15260,10819,15259,10822,15258,10826,15256,10832,15251,10836,15246,10841,15237,10838,15225,10821,15207,10788,15183,10734,15151,10660,15120,10571,15087,10469,15049,10359,15012,10249,14974,10041,14937,9837,14900,9647,14860,9475,14820,9320,14779,9147,14736,8902,14691,8688,14646,8499,14598,8335,14549,8189,14499,7940,14448,7720,14397,7529,14347,7363,14256,7218,15285,10410,15285,10411,15285,10413,15284,10418,15282,10425,15278,10434,15272,10442,15264,10449,15252,10445,15235,10433,15210,10403,15179,10358,15149,10301,15113,10218,15073,10059,15033,9894,14991,9726,14951,9565,14909,9413,14865,9273,14822,9073,14777,8845,14730,8641,14682,8459,14633,8300,14583,8129,14531,7883,14479,7670,14426,7482,14373,7321,14305,7176,14201,6939,15305,9939,15305,9940,15305,9945,15304,9955,15302,9967,15298,9989,15293,10010,15286,10033,15274,10044,15258,10045,15233,10022,15205,9975,15174,9903,15136,9808,15095,9697,15053,9578,15009,9451,14965,9327,14918,9198,14871,8973,14825,8766,14775,8579,14725,8408,14675,8259,14622,8058,14569,7821,14515,7615,14460,7435,14405,7276,14350,7108,14256,6866,14149,6653,15321,9444,15321,9445,15321,9448,15320,9458,15317,9470,15314,9490,15310,9515,15302,9540,15292,9562,15276,9579,15251,9577,15226,9559,15195,9519,15156,9463,15116,9389,15071,9304,15025,9208,14978,9023,14927,8838,14878,8661,14827,8496,14774,8344,14722,8206,14667,7973,14612,7749,14556,7555,14499,7382,14443,7229,14385,7025,14322,6791,14210,6588,14100,6409,15333,8920,15333,8921,15332,8927,15332,8943,15329,8965,15326,9002,15322,9048,15316,9106,15307,9162,15291,9204,15267,9221,15244,9221,15212,9196,15175,9134,15133,9043,15088,8930,15040,8801,14990,8665,14938,8526,14886,8391,14830,8261,14775,8087,14719,7866,14661,7664,14603,7482,14544,7322,14485,7178,14426,6936,14367,6713,14281,6517,14166,6348,14054,6198,15341,8360,15341,8361,15341,8366,15341,8379,15339,8399,15336,8431,15332,8473,15326,8527,15318,8585,15302,8632,15281,8670,15258,8690,15227,8690,15191,8664,15149,8612,15104,8543,15055,8456,15001,8360,14948,8259,14892,8122,14834,7923,14776,7734,14716,7558,14656,7397,14595,7250,14534,7070,14472,6835,14410,6628,14350,6443,14243,6283,14125,6135,14010,5889,15348,7715,15348,7717,15348,7725,15347,7745,15345,7780,15343,7836,15339,7905,15334,8e3,15326,8103,15310,8193,15293,8239,15270,8270,15240,8287,15204,8283,15163,8260,15118,8223,15067,8143,15014,8014,14958,7873,14899,7723,14839,7573,14778,7430,14715,7293,14652,7164,14588,6931,14524,6720,14460,6531,14396,6362,14330,6210,14207,6015,14086,5781,13969,5576,15352,7114,15352,7116,15352,7128,15352,7159,15350,7195,15348,7237,15345,7299,15340,7374,15332,7457,15317,7544,15301,7633,15280,7703,15251,7754,15216,7775,15176,7767,15131,7733,15079,7670,15026,7588,14967,7492,14906,7387,14844,7278,14779,7171,14714,6965,14648,6770,14581,6587,14515,6420,14448,6269,14382,6123,14299,5881,14172,5665,14049,5477,13929,5310,15355,6329,15355,6330,15355,6339,15355,6362,15353,6410,15351,6472,15349,6572,15344,6688,15337,6835,15323,6985,15309,7142,15287,7220,15260,7277,15226,7310,15188,7326,15142,7318,15090,7285,15036,7239,14976,7177,14914,7045,14849,6892,14782,6736,14714,6581,14645,6433,14576,6293,14506,6164,14438,5946,14369,5733,14270,5540,14140,5369,14014,5216,13892,5043,15357,5483,15357,5484,15357,5496,15357,5528,15356,5597,15354,5692,15351,5835,15347,6011,15339,6195,15328,6317,15314,6446,15293,6566,15268,6668,15235,6746,15197,6796,15152,6811,15101,6790,15046,6748,14985,6673,14921,6583,14854,6479,14785,6371,14714,6259,14643,6149,14571,5946,14499,5750,14428,5567,14358,5401,14242,5250,14109,5111,13980,4870,13856,4657,15359,4555,15359,4557,15358,4573,15358,4633,15357,4715,15355,4841,15353,5061,15349,5216,15342,5391,15331,5577,15318,5770,15299,5967,15274,6150,15243,6223,15206,6280,15161,6310,15111,6317,15055,6300,14994,6262,14928,6208,14860,6141,14788,5994,14715,5838,14641,5684,14566,5529,14492,5384,14418,5247,14346,5121,14216,4892,14079,4682,13948,4496,13822,4330,15359,3498,15359,3501,15359,3520,15359,3598,15358,3719,15356,3860,15355,4137,15351,4305,15344,4563,15334,4809,15321,5116,15303,5273,15280,5418,15250,5547,15214,5653,15170,5722,15120,5761,15064,5763,15002,5733,14935,5673,14865,5597,14792,5504,14716,5400,14640,5294,14563,5185,14486,5041,14410,4841,14335,4655,14191,4482,14051,4325,13918,4183,13790,4012,15360,2282,15360,2285,15360,2306,15360,2401,15359,2547,15357,2748,15355,3103,15352,3349,15345,3675,15336,4020,15324,4272,15307,4496,15285,4716,15255,4908,15220,5086,15178,5170,15128,5214,15072,5234,15010,5231,14943,5206,14871,5166,14796,5102,14718,4971,14639,4833,14559,4687,14480,4541,14402,4401,14315,4268,14167,4142,14025,3958,13888,3747,13759,3556,15360,923,15360,925,15360,946,15360,1052,15359,1214,15357,1494,15356,1892,15352,2274,15346,2663,15338,3099,15326,3393,15309,3679,15288,3980,15260,4183,15226,4325,15185,4437,15136,4517,15080,4570,15018,4591,14950,4581,14877,4545,14800,4485,14720,4411,14638,4325,14556,4231,14475,4136,14395,3988,14297,3803,14145,3628,13999,3465,13861,3314,13729,3177,15360,263,15360,264,15360,272,15360,325,15359,407,15358,548,15356,780,15352,1144,15347,1580,15339,2099,15328,2425,15312,2795,15292,3133,15264,3329,15232,3517,15191,3689,15143,3819,15088,3923,15025,3978,14956,3999,14882,3979,14804,3931,14722,3855,14639,3756,14554,3645,14470,3529,14388,3409,14279,3289,14124,3173,13975,3055,13834,2848,13701,2658,15360,49,15360,49,15360,52,15360,75,15359,111,15358,201,15356,283,15353,519,15348,726,15340,1045,15329,1415,15314,1795,15295,2173,15269,2410,15237,2649,15197,2866,15150,3054,15095,3140,15032,3196,14963,3228,14888,3236,14808,3224,14725,3191,14639,3146,14553,3088,14466,2976,14382,2836,14262,2692,14103,2549,13952,2409,13808,2278,13674,2154,15360,4,15360,4,15360,4,15360,13,15359,33,15358,59,15357,112,15353,199,15348,302,15341,456,15331,628,15316,827,15297,1082,15272,1332,15241,1601,15202,1851,15156,2069,15101,2172,15039,2256,14970,2314,14894,2348,14813,2358,14728,2344,14640,2311,14551,2263,14463,2203,14376,2133,14247,2059,14084,1915,13930,1761,13784,1609,13648,1464,15360,0,15360,0,15360,0,15360,3,15359,18,15358,26,15357,53,15354,80,15348,97,15341,165,15332,238,15318,326,15299,427,15275,529,15245,654,15207,771,15161,885,15108,994,15046,1089,14976,1170,14900,1229,14817,1266,14731,1284,14641,1282,14550,1260,14460,1223,14370,1174,14232,1116,14066,1050,13909,981,13761,910,13623,839]),tl=null;function nl(){return tl===null&&(tl=new Ri(el,32,32,Fe,Te),tl.minFilter=ge,tl.magFilter=ge,tl.wrapS=de,tl.wrapT=de,tl.generateMipmaps=!1,tl.needsUpdate=!0),tl}var rl=class{constructor(e={}){let{canvas:t=Nt(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);f=n.getContextAttributes().alpha}else f=a;let p=new Set([Le,Ie,Pe]),m=new Set([ye,Ce,xe,Oe,Ee,De]),h=new Uint32Array(4),g=new Int32Array(4),_=null,v=null,y=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let x=this,S=!1;this._outputColorSpace=wt;let C=0,w=0,T=null,E=-1,D=null,O=new fn,k=new fn,A=null,ee=new U(0),te=0,ne=t.width,re=t.height,j=1,ie=null,ae=null,oe=new fn(0,0,ne,re),se=new fn(0,0,ne,re),ce=!1,le=new Ki,ue=!1,de=!1,fe=new Wn,pe=new B,me=new fn,he={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ge=!1;function _e(){return T===null?j:1}let M=n;function be(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r181`),t.addEventListener(`webglcontextlost`,$e,!1),t.addEventListener(`webglcontextrestored`,et,!1),t.addEventListener(`webglcontextcreationerror`,tt,!1),M===null){let t=`webgl2`;if(M=be(t,e),M===null)throw be(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw e(`WebGLRenderer: `+e.message),e}let Se,we,N,ke,P,F,Ae,je,Me,Ne,Fe,Re,ze,Be,Ve,He,Ue,We,Ge,Ke,qe,Je,Ye,Xe;function Ze(){Se=new No(M),Se.init(),Je=new Gc(M,Se),we=new co(M,Se,e,Je),N=new Uc(M,Se),we.reversedDepthBuffer&&d&&N.buffers.depth.setReversed(!0),ke=new Io(M),P=new Dc,F=new Wc(M,Se,N,P,we,Je,ke),Ae=new uo(x),je=new Mo(x),Me=new eo(M),Ye=new oo(M,Me),Ne=new Po(M,Me,ke,Ye),Fe=new Ro(M,Ne,Me,ke),Ge=new Lo(M,we,F),He=new lo(P),Re=new Ec(x,Ae,je,Se,we,Ye,He),ze=new Qc(x,P),Be=new jc,Ve=new Rc(Se),We=new ao(x,Ae,je,N,Fe,f,s),Ue=new Vc(x,Fe,we),Xe=new $c(M,ke,we,N),Ke=new so(M,Se,ke),qe=new Fo(M,Se,ke),ke.programs=Re.programs,x.capabilities=we,x.extensions=Se,x.properties=P,x.renderLists=Be,x.shadowMap=Ue,x.state=N,x.info=ke}Ze();let Qe=new Yc(x,M);this.xr=Qe,this.getContext=function(){return M},this.getContextAttributes=function(){return M.getContextAttributes()},this.forceContextLoss=function(){let e=Se.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Se.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(e){e!==void 0&&(j=e,this.setSize(ne,re,!1))},this.getSize=function(e){return e.set(ne,re)},this.setSize=function(e,n,r=!0){if(Qe.isPresenting){I(`WebGLRenderer: Can't change size while VR device is presenting.`);return}ne=e,re=n,t.width=Math.floor(e*j),t.height=Math.floor(n*j),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(ne*j,re*j).floor()},this.setDrawingBufferSize=function(e,n,r){ne=e,re=n,j=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(O)},this.getViewport=function(e){return e.copy(oe)},this.setViewport=function(e,t,n,r){e.isVector4?oe.set(e.x,e.y,e.z,e.w):oe.set(e,t,n,r),N.viewport(O.copy(oe).multiplyScalar(j).round())},this.getScissor=function(e){return e.copy(se)},this.setScissor=function(e,t,n,r){e.isVector4?se.set(e.x,e.y,e.z,e.w):se.set(e,t,n,r),N.scissor(k.copy(se).multiplyScalar(j).round())},this.getScissorTest=function(){return ce},this.setScissorTest=function(e){N.setScissorTest(ce=e)},this.setOpaqueSort=function(e){ie=e},this.setTransparentSort=function(e){ae=e},this.getClearColor=function(e){return e.copy(We.getClearColor())},this.setClearColor=function(){We.setClearColor(...arguments)},this.getClearAlpha=function(){return We.getClearAlpha()},this.setClearAlpha=function(){We.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(T!==null){let t=T.texture.format;e=p.has(t)}if(e){let e=T.texture.type,t=m.has(e),n=We.getClearColor(),r=We.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(h[0]=i,h[1]=a,h[2]=o,h[3]=r,M.clearBufferuiv(M.COLOR,0,h)):(g[0]=i,g[1]=a,g[2]=o,g[3]=r,M.clearBufferiv(M.COLOR,0,g))}else r|=M.COLOR_BUFFER_BIT}t&&(r|=M.DEPTH_BUFFER_BIT),n&&(r|=M.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),M.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,$e,!1),t.removeEventListener(`webglcontextrestored`,et,!1),t.removeEventListener(`webglcontextcreationerror`,tt,!1),We.dispose(),Be.dispose(),Ve.dispose(),P.dispose(),Ae.dispose(),je.dispose(),Fe.dispose(),Ye.dispose(),Xe.dispose(),Re.dispose(),Qe.dispose(),Qe.removeEventListener(`sessionstart`,ct),Qe.removeEventListener(`sessionend`,lt),ut.stop()};function $e(e){e.preventDefault(),It(`WebGLRenderer: Context Lost.`),S=!0}function et(){It(`WebGLRenderer: Context Restored.`),S=!1;let e=ke.autoReset,t=Ue.enabled,n=Ue.autoUpdate,r=Ue.needsUpdate,i=Ue.type;Ze(),ke.autoReset=e,Ue.enabled=t,Ue.autoUpdate=n,Ue.needsUpdate=r,Ue.type=i}function tt(e){L(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function nt(e){let t=e.target;t.removeEventListener(`dispose`,nt),rt(t)}function rt(e){it(e),P.remove(e)}function it(e){let t=P.get(e).programs;t!==void 0&&(t.forEach(function(e){Re.releaseProgram(e)}),e.isShaderMaterial&&Re.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=he);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=yt(e,t,n,r,i);N.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ne.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Ye.setup(i,r,s,n,c);let h,g=Ke;if(c!==null&&(h=Me.get(c),g=qe,g.setIndex(h)),i.isMesh)r.wireframe===!0?(N.setLineWidth(r.wireframeLinewidth*_e()),g.setMode(M.LINES)):g.setMode(M.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),N.setLineWidth(e*_e()),i.isLineSegments?g.setMode(M.LINES):i.isLineLoop?g.setMode(M.LINE_LOOP):g.setMode(M.LINE_STRIP)}else i.isPoints?g.setMode(M.POINTS):i.isSprite&&g.setMode(M.TRIANGLES);if(i.isBatchedMesh)if(i._multiDrawInstances!==null)Lt(`WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(Se.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Me.get(c).bytesPerElement:1,o=P.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(M,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function at(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,gt(e,t,n),e.side=0,e.needsUpdate=!0,gt(e,t,n),e.side=2):gt(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),v=Ve.get(n),v.init(t),b.push(v),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(v.pushLight(e),e.castShadow&&v.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(v.pushLight(e),e.castShadow&&v.pushShadow(e))}),v.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t)if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];at(a,n,e),r.add(a)}else at(t,n,e),r.add(t)}),v=b.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){P.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}Se.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let ot=null;function st(e){ot&&ot(e)}function ct(){ut.stop()}function lt(){ut.start()}let ut=new $a;ut.setAnimationLoop(st),typeof self<`u`&&ut.setContext(self),this.setAnimationLoop=function(e){ot=e,Qe.setAnimationLoop(e),e===null?ut.stop():ut.start()},Qe.addEventListener(`sessionstart`,ct),Qe.addEventListener(`sessionend`,lt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){L(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(S===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Qe.enabled===!0&&Qe.isPresenting===!0&&(Qe.cameraAutoUpdate===!0&&Qe.updateCamera(t),t=Qe.getCamera()),e.isScene===!0&&e.onBeforeRender(x,e,t,T),v=Ve.get(e,b.length),v.init(t),b.push(v),fe.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),le.setFromProjectionMatrix(fe,At,t.reversedDepth),de=this.localClippingEnabled,ue=He.init(this.clippingPlanes,de),_=Be.get(e,y.length),_.init(),y.push(_),Qe.enabled===!0&&Qe.isPresenting===!0){let e=x.xr.getDepthSensingMesh();e!==null&&dt(e,t,-1/0,x.sortObjects)}dt(e,t,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(ie,ae),ge=Qe.enabled===!1||Qe.isPresenting===!1||Qe.hasDepthSensing()===!1,ge&&We.addToRenderList(_,e),this.info.render.frame++,ue===!0&&He.beginShadows();let n=v.state.shadowsArray;Ue.render(n,e,t),ue===!0&&He.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=_.opaque,i=_.transmissive;if(v.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];pt(r,i,e,a)}ge&&We.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];ft(_,e,r,r.viewport)}}else i.length>0&&pt(r,i,e,t),ge&&We.render(e),ft(_,e,t);T!==null&&w===0&&(F.updateMultisampleRenderTarget(T),F.updateRenderTargetMipmap(T)),e.isScene===!0&&e.onAfterRender(x,e,t),Ye.resetDefaultState(),E=-1,D=null,b.pop(),b.length>0?(v=b[b.length-1],ue===!0&&He.setGlobalState(x.clippingPlanes,v.state.camera)):v=null,y.pop(),_=y.length>0?y[y.length-1]:null};function dt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)v.pushLight(e),e.castShadow&&v.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||le.intersectsSprite(e)){r&&me.setFromMatrixPosition(e.matrixWorld).applyMatrix4(fe);let t=Fe.update(e),i=e.material;i.visible&&_.push(e,t,i,n,me.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||le.intersectsObject(e))){let t=Fe.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),me.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),me.copy(e.boundingSphere.center)),me.applyMatrix4(e.matrixWorld).applyMatrix4(fe)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&_.push(e,t,s,n,me.z,o)}}else i.visible&&_.push(e,t,i,n,me.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)dt(i[e],t,n,r)}function ft(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;v.setupLightsView(n),ue===!0&&He.setGlobalState(x.clippingPlanes,n),r&&N.viewport(O.copy(r)),i.length>0&&mt(i,t,n),a.length>0&&mt(a,t,n),o.length>0&&mt(o,t,n),N.buffers.depth.setTest(!0),N.buffers.depth.setMask(!0),N.buffers.color.setMask(!0),N.setPolygonOffset(!1)}function pt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;v.state.transmissionRenderTarget[r.id]===void 0&&(v.state.transmissionRenderTarget[r.id]=new mn(1,1,{generateMipmaps:!0,type:Se.has(`EXT_color_buffer_half_float`)||Se.has(`EXT_color_buffer_float`)?Te:ye,minFilter:ve,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:H.workingColorSpace}));let a=v.state.transmissionRenderTarget[r.id],o=r.viewport||O;a.setSize(o.z*x.transmissionResolutionScale,o.w*x.transmissionResolutionScale);let s=x.getRenderTarget(),c=x.getActiveCubeFace(),l=x.getActiveMipmapLevel();x.setRenderTarget(a),x.getClearColor(ee),te=x.getClearAlpha(),te<1&&x.setClearColor(16777215,.5),x.clear(),ge&&We.render(n);let u=x.toneMapping;x.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),v.setupLightsView(r),ue===!0&&He.setGlobalState(x.clippingPlanes,r),mt(e,n,r),F.updateMultisampleRenderTarget(a),F.updateRenderTargetMipmap(a),Se.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,ht(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(F.updateMultisampleRenderTarget(a),F.updateRenderTargetMipmap(a))}x.setRenderTarget(s,c,l),x.setClearColor(ee,te),d!==void 0&&(r.viewport=d),x.toneMapping=u}function mt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&ht(o,t,n,s,l,c)}}function ht(e,t,n,r,i,a){e.onBeforeRender(x,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(x,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,x.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,x.renderBufferDirect(n,t,r,i,e,a),i.side=2):x.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(x,t,n,r,i,a)}function gt(e,t,n){t.isScene!==!0&&(t=he);let r=P.get(e),i=v.state.lights,a=v.state.shadowsArray,o=i.state.version,s=Re.getParameters(e,i.state,a,t,n),c=Re.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?je:Ae).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,nt),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return vt(e,s),u}else s.uniforms=Re.getUniforms(e),e.onBeforeCompile(s,x),u=Re.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=He.uniform),vt(e,s),r.needsLights=xt(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function _t(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Gs.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function vt(e,t){let n=P.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function yt(e,t,n,r,i){t.isScene!==!0&&(t=he),F.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=T===null?x.outputColorSpace:T.isXRRenderTarget===!0?T.texture.colorSpace:Tt,c=(r.isMeshStandardMaterial?je:Ae).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(T===null||T.isXRRenderTarget===!0)&&(m=x.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,g=h===void 0?0:h.length,_=P.get(r),y=v.state.lights;if(ue===!0&&(de===!0||e!==D)){let t=e===D&&r.id===E;He.setState(r,e,t)}let b=!1;r.version===_.__version?_.needsLights&&_.lightsStateVersion!==y.state.version?b=!0:_.outputColorSpace===s?i.isBatchedMesh&&_.batching===!1||!i.isBatchedMesh&&_.batching===!0||i.isBatchedMesh&&_.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&_.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&_.instancing===!1||!i.isInstancedMesh&&_.instancing===!0||i.isSkinnedMesh&&_.skinning===!1||!i.isSkinnedMesh&&_.skinning===!0||i.isInstancedMesh&&_.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&_.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&_.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&_.instancingMorph===!1&&i.morphTexture!==null?b=!0:_.envMap===c?r.fog===!0&&_.fog!==a||_.numClippingPlanes!==void 0&&(_.numClippingPlanes!==He.numPlanes||_.numIntersection!==He.numIntersection)?b=!0:_.vertexAlphas===l&&_.vertexTangents===u&&_.morphTargets===d&&_.morphNormals===f&&_.morphColors===p&&_.toneMapping===m?_.morphTargetsCount!==g&&(b=!0):b=!0:b=!0:b=!0:(b=!0,_.__version=r.version);let S=_.currentProgram;b===!0&&(S=gt(r,t,i));let C=!1,w=!1,O=!1,k=S.getUniforms(),A=_.uniforms;if(N.useProgram(S.program)&&(C=!0,w=!0,O=!0),r.id!==E&&(E=r.id,w=!0),C||D!==e){N.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),k.setValue(M,`projectionMatrix`,e.projectionMatrix),k.setValue(M,`viewMatrix`,e.matrixWorldInverse);let t=k.map.cameraPosition;t!==void 0&&t.setValue(M,pe.setFromMatrixPosition(e.matrixWorld)),we.logarithmicDepthBuffer&&k.setValue(M,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&k.setValue(M,`isOrthographic`,e.isOrthographicCamera===!0),D!==e&&(D=e,w=!0,O=!0)}if(i.isSkinnedMesh){k.setOptional(M,i,`bindMatrix`),k.setOptional(M,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),k.setValue(M,`boneTexture`,e.boneTexture,F))}i.isBatchedMesh&&(k.setOptional(M,i,`batchingTexture`),k.setValue(M,`batchingTexture`,i._matricesTexture,F),k.setOptional(M,i,`batchingIdTexture`),k.setValue(M,`batchingIdTexture`,i._indirectTexture,F),k.setOptional(M,i,`batchingColorTexture`),i._colorsTexture!==null&&k.setValue(M,`batchingColorTexture`,i._colorsTexture,F));let ee=n.morphAttributes;if((ee.position!==void 0||ee.normal!==void 0||ee.color!==void 0)&&Ge.update(i,n,S),(w||_.receiveShadow!==i.receiveShadow)&&(_.receiveShadow=i.receiveShadow,k.setValue(M,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(A.envMap.value=c,A.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),A.dfgLUT!==void 0&&(A.dfgLUT.value=nl()),w&&(k.setValue(M,`toneMappingExposure`,x.toneMappingExposure),_.needsLights&&bt(A,O),a&&r.fog===!0&&ze.refreshFogUniforms(A,a),ze.refreshMaterialUniforms(A,r,j,re,v.state.transmissionRenderTarget[e.id]),Gs.upload(M,_t(_),A,F)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Gs.upload(M,_t(_),A,F),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&k.setValue(M,`center`,i.center),k.setValue(M,`modelViewMatrix`,i.modelViewMatrix),k.setValue(M,`normalMatrix`,i.normalMatrix),k.setValue(M,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Xe.update(n,S),Xe.bind(n,S)}}return S}function bt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function xt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return T},this.setRenderTargetTextures=function(e,t,n){let r=P.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),P.get(e.texture).__webglTexture=t,P.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=P.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let St=M.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){T=e,C=t,w=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=P.get(e);if(s.__useDefaultFramebuffer!==void 0)N.bindFramebuffer(M.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)F.setupRenderTarget(e);else if(s.__hasExternalTextures)F.rebindTextures(e,P.get(e.texture).__webglTexture,P.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&P.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);F.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=P.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&F.useMultisampledRTT(e)===!1?P.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,O.copy(e.viewport),k.copy(e.scissor),A=e.scissorTest}else O.copy(oe).multiplyScalar(j).floor(),k.copy(se).multiplyScalar(j).floor(),A=ce;if(n!==0&&(i=St),N.bindFramebuffer(M.FRAMEBUFFER,i)&&r&&N.drawBuffers(e,i),N.viewport(O),N.scissor(k),N.setScissorTest(A),a){let r=P.get(e.texture);M.framebufferTexture2D(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=P.get(e.textures[t]);M.framebufferTextureLayer(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=P.get(e.texture);M.framebufferTexture2D(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,t.__webglTexture,n)}E=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){L(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=P.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){N.bindFramebuffer(M.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!we.textureFormatReadable(c)){L(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!we.textureTypeReadable(l)){L(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&M.readBuffer(M.COLOR_ATTACHMENT0+s),M.readPixels(t,n,r,i,Je.convert(c),Je.convert(l),a))}finally{let e=T===null?null:P.get(T).__webglFramebuffer;N.bindFramebuffer(M.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=P.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c)if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){N.bindFramebuffer(M.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!we.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!we.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=M.createBuffer();M.bindBuffer(M.PIXEL_PACK_BUFFER,d),M.bufferData(M.PIXEL_PACK_BUFFER,a.byteLength,M.STREAM_READ),e.textures.length>1&&M.readBuffer(M.COLOR_ATTACHMENT0+s),M.readPixels(t,n,r,i,Je.convert(l),Je.convert(u),0);let f=T===null?null:P.get(T).__webglFramebuffer;N.bindFramebuffer(M.FRAMEBUFFER,f);let p=M.fenceSync(M.SYNC_GPU_COMMANDS_COMPLETE,0);return M.flush(),await Rt(M,p,4),M.bindBuffer(M.PIXEL_PACK_BUFFER,d),M.getBufferSubData(M.PIXEL_PACK_BUFFER,0,a),M.deleteBuffer(d),M.deleteSync(p),a}else throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;F.setTexture2D(e,0),M.copyTexSubImage2D(M.TEXTURE_2D,n,0,0,o,s,i,a),N.unbindTexture()};let Ct=M.createFramebuffer(),Et=M.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(Lt(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Je.convert(t.format),_=Je.convert(t.type),v;t.isData3DTexture?(F.setTexture3D(t,0),v=M.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(F.setTexture2DArray(t,0),v=M.TEXTURE_2D_ARRAY):(F.setTexture2D(t,0),v=M.TEXTURE_2D),M.pixelStorei(M.UNPACK_FLIP_Y_WEBGL,t.flipY),M.pixelStorei(M.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),M.pixelStorei(M.UNPACK_ALIGNMENT,t.unpackAlignment);let y=M.getParameter(M.UNPACK_ROW_LENGTH),b=M.getParameter(M.UNPACK_IMAGE_HEIGHT),x=M.getParameter(M.UNPACK_SKIP_PIXELS),S=M.getParameter(M.UNPACK_SKIP_ROWS),C=M.getParameter(M.UNPACK_SKIP_IMAGES);M.pixelStorei(M.UNPACK_ROW_LENGTH,h.width),M.pixelStorei(M.UNPACK_IMAGE_HEIGHT,h.height),M.pixelStorei(M.UNPACK_SKIP_PIXELS,l),M.pixelStorei(M.UNPACK_SKIP_ROWS,u),M.pixelStorei(M.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=P.get(e),r=P.get(t),h=P.get(n.__renderTarget),g=P.get(r.__renderTarget);N.bindFramebuffer(M.READ_FRAMEBUFFER,h.__webglFramebuffer),N.bindFramebuffer(M.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(M.framebufferTextureLayer(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,P.get(e).__webglTexture,i,d+n),M.framebufferTextureLayer(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,P.get(t).__webglTexture,a,m+n)),M.blitFramebuffer(l,u,o,s,f,p,o,s,M.DEPTH_BUFFER_BIT,M.NEAREST);N.bindFramebuffer(M.READ_FRAMEBUFFER,null),N.bindFramebuffer(M.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||P.has(e)){let n=P.get(e),r=P.get(t);N.bindFramebuffer(M.READ_FRAMEBUFFER,Ct),N.bindFramebuffer(M.DRAW_FRAMEBUFFER,Et);for(let e=0;e<c;e++)w?M.framebufferTextureLayer(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):M.framebufferTexture2D(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,n.__webglTexture,i),T?M.framebufferTextureLayer(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):M.framebufferTexture2D(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,r.__webglTexture,a),i===0?T?M.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):M.copyTexSubImage2D(v,a,f,p,l,u,o,s):M.blitFramebuffer(l,u,o,s,f,p,o,s,M.COLOR_BUFFER_BIT,M.NEAREST);N.bindFramebuffer(M.READ_FRAMEBUFFER,null),N.bindFramebuffer(M.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?M.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?M.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):M.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?M.texSubImage2D(M.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?M.compressedTexSubImage2D(M.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):M.texSubImage2D(M.TEXTURE_2D,a,f,p,o,s,g,_,h);M.pixelStorei(M.UNPACK_ROW_LENGTH,y),M.pixelStorei(M.UNPACK_IMAGE_HEIGHT,b),M.pixelStorei(M.UNPACK_SKIP_PIXELS,x),M.pixelStorei(M.UNPACK_SKIP_ROWS,S),M.pixelStorei(M.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&M.generateMipmap(v),N.unbindTexture()},this.initRenderTarget=function(e){P.get(e).__webglFramebuffer===void 0&&F.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?F.setTextureCube(e,0):e.isData3DTexture?F.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?F.setTexture2DArray(e,0):F.setTexture2D(e,0),N.unbindTexture()},this.resetState=function(){C=0,w=0,T=null,N.reset(),Ye.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return At}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=H._getDrawingBufferColorSpace(e),t.unpackColorSpace=H._getUnpackColorSpace()}},il=class e{constructor(e){e===void 0&&(e=[0,0,0,0,0,0,0,0,0]),this.elements=e}identity(){let e=this.elements;e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=1,e[5]=0,e[6]=0,e[7]=0,e[8]=1}setZero(){let e=this.elements;e[0]=0,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=0,e[6]=0,e[7]=0,e[8]=0}setTrace(e){let t=this.elements;t[0]=e.x,t[4]=e.y,t[8]=e.z}getTrace(e){e===void 0&&(e=new K);let t=this.elements;return e.x=t[0],e.y=t[4],e.z=t[8],e}vmult(e,t){t===void 0&&(t=new K);let n=this.elements,r=e.x,i=e.y,a=e.z;return t.x=n[0]*r+n[1]*i+n[2]*a,t.y=n[3]*r+n[4]*i+n[5]*a,t.z=n[6]*r+n[7]*i+n[8]*a,t}smult(e){for(let t=0;t<this.elements.length;t++)this.elements[t]*=e}mmult(t,n){n===void 0&&(n=new e);let r=this.elements,i=t.elements,a=n.elements,o=r[0],s=r[1],c=r[2],l=r[3],u=r[4],d=r[5],f=r[6],p=r[7],m=r[8],h=i[0],g=i[1],_=i[2],v=i[3],y=i[4],b=i[5],x=i[6],S=i[7],C=i[8];return a[0]=o*h+s*v+c*x,a[1]=o*g+s*y+c*S,a[2]=o*_+s*b+c*C,a[3]=l*h+u*v+d*x,a[4]=l*g+u*y+d*S,a[5]=l*_+u*b+d*C,a[6]=f*h+p*v+m*x,a[7]=f*g+p*y+m*S,a[8]=f*_+p*b+m*C,n}scale(t,n){n===void 0&&(n=new e);let r=this.elements,i=n.elements;for(let e=0;e!==3;e++)i[3*e+0]=t.x*r[3*e+0],i[3*e+1]=t.y*r[3*e+1],i[3*e+2]=t.z*r[3*e+2];return n}solve(e,t){t===void 0&&(t=new K);let n=[],r,i;for(r=0;r<12;r++)n.push(0);for(r=0;r<3;r++)for(i=0;i<3;i++)n[r+4*i]=this.elements[r+3*i];n[3]=e.x,n[7]=e.y,n[11]=e.z;let a=3,o=a,s,c;do{if(r=o-a,n[r+4*r]===0){for(i=r+1;i<o;i++)if(n[r+4*i]!==0){s=4;do c=4-s,n[c+4*r]+=n[c+4*i];while(--s);break}}if(n[r+4*r]!==0)for(i=r+1;i<o;i++){let e=n[r+4*i]/n[r+4*r];s=4;do c=4-s,n[c+4*i]=c<=r?0:n[c+4*i]-n[c+4*r]*e;while(--s)}}while(--a);if(t.z=n[11]/n[10],t.y=(n[7]-n[6]*t.z)/n[5],t.x=(n[3]-n[2]*t.z-n[1]*t.y)/n[0],isNaN(t.x)||isNaN(t.y)||isNaN(t.z)||t.x===1/0||t.y===1/0||t.z===1/0)throw`Could not solve equation! Got x=[${t.toString()}], b=[${e.toString()}], A=[${this.toString()}]`;return t}e(e,t,n){if(n===void 0)return this.elements[t+3*e];this.elements[t+3*e]=n}copy(e){for(let t=0;t<e.elements.length;t++)this.elements[t]=e.elements[t];return this}toString(){let e=``;for(let t=0;t<9;t++)e+=this.elements[t]+`,`;return e}reverse(t){t===void 0&&(t=new e);let n=al,r,i;for(r=0;r<3;r++)for(i=0;i<3;i++)n[r+6*i]=this.elements[r+3*i];n[3]=1,n[9]=0,n[15]=0,n[4]=0,n[10]=1,n[16]=0,n[5]=0,n[11]=0,n[17]=1;let a=3,o=a,s,c;do{if(r=o-a,n[r+6*r]===0){for(i=r+1;i<o;i++)if(n[r+6*i]!==0){s=6;do c=6-s,n[c+6*r]+=n[c+6*i];while(--s);break}}if(n[r+6*r]!==0)for(i=r+1;i<o;i++){let e=n[r+6*i]/n[r+6*r];s=6;do c=6-s,n[c+6*i]=c<=r?0:n[c+6*i]-n[c+6*r]*e;while(--s)}}while(--a);r=2;do{i=r-1;do{let e=n[r+6*i]/n[r+6*r];s=6;do c=6-s,n[c+6*i]=n[c+6*i]-n[c+6*r]*e;while(--s)}while(i--)}while(--r);r=2;do{let e=1/n[r+6*r];s=6;do c=6-s,n[c+6*r]=n[c+6*r]*e;while(--s)}while(r--);r=2;do{i=2;do{if(c=n[3+i+6*r],isNaN(c)||c===1/0)throw`Could not reverse! A=[${this.toString()}]`;t.e(r,i,c)}while(i--)}while(r--);return t}setRotationFromQuaternion(e){let t=e.x,n=e.y,r=e.z,i=e.w,a=t+t,o=n+n,s=r+r,c=t*a,l=t*o,u=t*s,d=n*o,f=n*s,p=r*s,m=i*a,h=i*o,g=i*s,_=this.elements;return _[0]=1-(d+p),_[1]=l-g,_[2]=u+h,_[3]=l+g,_[4]=1-(c+p),_[5]=f-m,_[6]=u-h,_[7]=f+m,_[8]=1-(c+d),this}transpose(t){t===void 0&&(t=new e);let n=this.elements,r=t.elements,i;return r[0]=n[0],r[4]=n[4],r[8]=n[8],i=n[1],r[1]=n[3],r[3]=i,i=n[2],r[2]=n[6],r[6]=i,i=n[5],r[5]=n[7],r[7]=i,t}},al=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],K=class e{constructor(e,t,n){e===void 0&&(e=0),t===void 0&&(t=0),n===void 0&&(n=0),this.x=e,this.y=t,this.z=n}cross(t,n){n===void 0&&(n=new e);let r=t.x,i=t.y,a=t.z,o=this.x,s=this.y,c=this.z;return n.x=s*a-c*i,n.y=c*r-o*a,n.z=o*i-s*r,n}set(e,t,n){return this.x=e,this.y=t,this.z=n,this}setZero(){this.x=this.y=this.z=0}vadd(t,n){if(n)n.x=t.x+this.x,n.y=t.y+this.y,n.z=t.z+this.z;else return new e(this.x+t.x,this.y+t.y,this.z+t.z)}vsub(t,n){if(n)n.x=this.x-t.x,n.y=this.y-t.y,n.z=this.z-t.z;else return new e(this.x-t.x,this.y-t.y,this.z-t.z)}crossmat(){return new il([0,-this.z,this.y,this.z,0,-this.x,-this.y,this.x,0])}normalize(){let e=this.x,t=this.y,n=this.z,r=Math.sqrt(e*e+t*t+n*n);if(r>0){let e=1/r;this.x*=e,this.y*=e,this.z*=e}else this.x=0,this.y=0,this.z=0;return r}unit(t){t===void 0&&(t=new e);let n=this.x,r=this.y,i=this.z,a=Math.sqrt(n*n+r*r+i*i);return a>0?(a=1/a,t.x=n*a,t.y=r*a,t.z=i*a):(t.x=1,t.y=0,t.z=0),t}length(){let e=this.x,t=this.y,n=this.z;return Math.sqrt(e*e+t*t+n*n)}lengthSquared(){return this.dot(this)}distanceTo(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z;return Math.sqrt((i-t)*(i-t)+(a-n)*(a-n)+(o-r)*(o-r))}distanceSquared(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z;return(i-t)*(i-t)+(a-n)*(a-n)+(o-r)*(o-r)}scale(t,n){n===void 0&&(n=new e);let r=this.x,i=this.y,a=this.z;return n.x=t*r,n.y=t*i,n.z=t*a,n}vmul(t,n){return n===void 0&&(n=new e),n.x=t.x*this.x,n.y=t.y*this.y,n.z=t.z*this.z,n}addScaledVector(t,n,r){return r===void 0&&(r=new e),r.x=this.x+t*n.x,r.y=this.y+t*n.y,r.z=this.z+t*n.z,r}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}isZero(){return this.x===0&&this.y===0&&this.z===0}negate(t){return t===void 0&&(t=new e),t.x=-this.x,t.y=-this.y,t.z=-this.z,t}tangents(e,t){let n=this.length();if(n>0){let r=ol,i=1/n;r.set(this.x*i,this.y*i,this.z*i);let a=sl;Math.abs(r.x)<.9?(a.set(1,0,0),r.cross(a,e)):(a.set(0,1,0),r.cross(a,e)),r.cross(e,t)}else e.set(1,0,0),t.set(0,1,0)}toString(){return`${this.x},${this.y},${this.z}`}toArray(){return[this.x,this.y,this.z]}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}lerp(e,t,n){let r=this.x,i=this.y,a=this.z;n.x=r+(e.x-r)*t,n.y=i+(e.y-i)*t,n.z=a+(e.z-a)*t}almostEquals(e,t){return t===void 0&&(t=1e-6),!(Math.abs(this.x-e.x)>t||Math.abs(this.y-e.y)>t||Math.abs(this.z-e.z)>t)}almostZero(e){return e===void 0&&(e=1e-6),!(Math.abs(this.x)>e||Math.abs(this.y)>e||Math.abs(this.z)>e)}isAntiparallelTo(e,t){return this.negate(cl),cl.almostEquals(e,t)}clone(){return new e(this.x,this.y,this.z)}};K.ZERO=new K(0,0,0),K.UNIT_X=new K(1,0,0),K.UNIT_Y=new K(0,1,0),K.UNIT_Z=new K(0,0,1);var ol=new K,sl=new K,cl=new K,ll=class e{constructor(e){e===void 0&&(e={}),this.lowerBound=new K,this.upperBound=new K,e.lowerBound&&this.lowerBound.copy(e.lowerBound),e.upperBound&&this.upperBound.copy(e.upperBound)}setFromPoints(e,t,n,r){let i=this.lowerBound,a=this.upperBound,o=n;i.copy(e[0]),o&&o.vmult(i,i),a.copy(i);for(let t=1;t<e.length;t++){let n=e[t];o&&(o.vmult(n,ul),n=ul),n.x>a.x&&(a.x=n.x),n.x<i.x&&(i.x=n.x),n.y>a.y&&(a.y=n.y),n.y<i.y&&(i.y=n.y),n.z>a.z&&(a.z=n.z),n.z<i.z&&(i.z=n.z)}return t&&(t.vadd(i,i),t.vadd(a,a)),r&&(i.x-=r,i.y-=r,i.z-=r,a.x+=r,a.y+=r,a.z+=r),this}copy(e){return this.lowerBound.copy(e.lowerBound),this.upperBound.copy(e.upperBound),this}clone(){return new e().copy(this)}extend(e){this.lowerBound.x=Math.min(this.lowerBound.x,e.lowerBound.x),this.upperBound.x=Math.max(this.upperBound.x,e.upperBound.x),this.lowerBound.y=Math.min(this.lowerBound.y,e.lowerBound.y),this.upperBound.y=Math.max(this.upperBound.y,e.upperBound.y),this.lowerBound.z=Math.min(this.lowerBound.z,e.lowerBound.z),this.upperBound.z=Math.max(this.upperBound.z,e.upperBound.z)}overlaps(e){let t=this.lowerBound,n=this.upperBound,r=e.lowerBound,i=e.upperBound,a=r.x<=n.x&&n.x<=i.x||t.x<=i.x&&i.x<=n.x,o=r.y<=n.y&&n.y<=i.y||t.y<=i.y&&i.y<=n.y,s=r.z<=n.z&&n.z<=i.z||t.z<=i.z&&i.z<=n.z;return a&&o&&s}volume(){let e=this.lowerBound,t=this.upperBound;return(t.x-e.x)*(t.y-e.y)*(t.z-e.z)}contains(e){let t=this.lowerBound,n=this.upperBound,r=e.lowerBound,i=e.upperBound;return t.x<=r.x&&n.x>=i.x&&t.y<=r.y&&n.y>=i.y&&t.z<=r.z&&n.z>=i.z}getCorners(e,t,n,r,i,a,o,s){let c=this.lowerBound,l=this.upperBound;e.copy(c),t.set(l.x,c.y,c.z),n.set(l.x,l.y,c.z),r.set(c.x,l.y,l.z),i.set(l.x,c.y,l.z),a.set(c.x,l.y,c.z),o.set(c.x,c.y,l.z),s.copy(l)}toLocalFrame(e,t){let n=dl,r=n[0],i=n[1],a=n[2],o=n[3],s=n[4],c=n[5],l=n[6],u=n[7];this.getCorners(r,i,a,o,s,c,l,u);for(let t=0;t!==8;t++){let r=n[t];e.pointToLocal(r,r)}return t.setFromPoints(n)}toWorldFrame(e,t){let n=dl,r=n[0],i=n[1],a=n[2],o=n[3],s=n[4],c=n[5],l=n[6],u=n[7];this.getCorners(r,i,a,o,s,c,l,u);for(let t=0;t!==8;t++){let r=n[t];e.pointToWorld(r,r)}return t.setFromPoints(n)}overlapsRay(e){let{direction:t,from:n}=e,r=1/t.x,i=1/t.y,a=1/t.z,o=(this.lowerBound.x-n.x)*r,s=(this.upperBound.x-n.x)*r,c=(this.lowerBound.y-n.y)*i,l=(this.upperBound.y-n.y)*i,u=(this.lowerBound.z-n.z)*a,d=(this.upperBound.z-n.z)*a,f=Math.max(Math.max(Math.min(o,s),Math.min(c,l)),Math.min(u,d)),p=Math.min(Math.min(Math.max(o,s),Math.max(c,l)),Math.max(u,d));return!(p<0||f>p)}},ul=new K,dl=[new K,new K,new K,new K,new K,new K,new K,new K],fl=class{constructor(){this.matrix=[]}get(e,t){let{index:n}=e,{index:r}=t;if(r>n){let e=r;r=n,n=e}return this.matrix[(n*(n+1)>>1)+r-1]}set(e,t,n){let{index:r}=e,{index:i}=t;if(i>r){let e=i;i=r,r=e}this.matrix[(r*(r+1)>>1)+i-1]=+!!n}reset(){for(let e=0,t=this.matrix.length;e!==t;e++)this.matrix[e]=0}setNumObjects(e){this.matrix.length=e*(e-1)>>1}},pl=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;return n[e]===void 0&&(n[e]=[]),n[e].includes(t)||n[e].push(t),this}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return!!(n[e]!==void 0&&n[e].includes(t))}hasAnyEventListener(e){return this._listeners===void 0?!1:this._listeners[e]!==void 0}removeEventListener(e,t){if(this._listeners===void 0)return this;let n=this._listeners;if(n[e]===void 0)return this;let r=n[e].indexOf(t);return r!==-1&&n[e].splice(r,1),this}dispatchEvent(e){if(this._listeners===void 0)return this;let t=this._listeners[e.type];if(t!==void 0){e.target=this;for(let n=0,r=t.length;n<r;n++)t[n].call(this,e)}return this}},ml=class e{constructor(e,t,n,r){e===void 0&&(e=0),t===void 0&&(t=0),n===void 0&&(n=0),r===void 0&&(r=1),this.x=e,this.y=t,this.z=n,this.w=r}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}toString(){return`${this.x},${this.y},${this.z},${this.w}`}toArray(){return[this.x,this.y,this.z,this.w]}setFromAxisAngle(e,t){let n=Math.sin(t*.5);return this.x=e.x*n,this.y=e.y*n,this.z=e.z*n,this.w=Math.cos(t*.5),this}toAxisAngle(e){e===void 0&&(e=new K),this.normalize();let t=2*Math.acos(this.w),n=Math.sqrt(1-this.w*this.w);return n<.001?(e.x=this.x,e.y=this.y,e.z=this.z):(e.x=this.x/n,e.y=this.y/n,e.z=this.z/n),[e,t]}setFromVectors(e,t){if(e.isAntiparallelTo(t)){let t=hl,n=gl;e.tangents(t,n),this.setFromAxisAngle(t,Math.PI)}else{let n=e.cross(t);this.x=n.x,this.y=n.y,this.z=n.z,this.w=Math.sqrt(e.length()**2*t.length()**2)+e.dot(t),this.normalize()}return this}mult(t,n){n===void 0&&(n=new e);let r=this.x,i=this.y,a=this.z,o=this.w,s=t.x,c=t.y,l=t.z,u=t.w;return n.x=r*u+o*s+i*l-a*c,n.y=i*u+o*c+a*s-r*l,n.z=a*u+o*l+r*c-i*s,n.w=o*u-r*s-i*c-a*l,n}inverse(t){t===void 0&&(t=new e);let n=this.x,r=this.y,i=this.z,a=this.w;this.conjugate(t);let o=1/(n*n+r*r+i*i+a*a);return t.x*=o,t.y*=o,t.z*=o,t.w*=o,t}conjugate(t){return t===void 0&&(t=new e),t.x=-this.x,t.y=-this.y,t.z=-this.z,t.w=this.w,t}normalize(){let e=Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);return e===0?(this.x=0,this.y=0,this.z=0,this.w=0):(e=1/e,this.x*=e,this.y*=e,this.z*=e,this.w*=e),this}normalizeFast(){let e=(3-(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w))/2;return e===0?(this.x=0,this.y=0,this.z=0,this.w=0):(this.x*=e,this.y*=e,this.z*=e,this.w*=e),this}vmult(e,t){t===void 0&&(t=new K);let n=e.x,r=e.y,i=e.z,a=this.x,o=this.y,s=this.z,c=this.w,l=c*n+o*i-s*r,u=c*r+s*n-a*i,d=c*i+a*r-o*n,f=-a*n-o*r-s*i;return t.x=l*c+f*-a+u*-s-d*-o,t.y=u*c+f*-o+d*-a-l*-s,t.z=d*c+f*-s+l*-o-u*-a,t}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w,this}toEuler(e,t){t===void 0&&(t=`YZX`);let n,r,i,a=this.x,o=this.y,s=this.z,c=this.w;switch(t){case`YZX`:let e=a*o+s*c;if(e>.499&&(n=2*Math.atan2(a,c),r=Math.PI/2,i=0),e<-.499&&(n=-2*Math.atan2(a,c),r=-Math.PI/2,i=0),n===void 0){let t=a*a,l=o*o,u=s*s;n=Math.atan2(2*o*c-2*a*s,1-2*l-2*u),r=Math.asin(2*e),i=Math.atan2(2*a*c-2*o*s,1-2*t-2*u)}break;default:throw Error(`Euler order ${t} not supported yet.`)}e.y=n,e.z=r,e.x=i}setFromEuler(e,t,n,r){r===void 0&&(r=`XYZ`);let i=Math.cos(e/2),a=Math.cos(t/2),o=Math.cos(n/2),s=Math.sin(e/2),c=Math.sin(t/2),l=Math.sin(n/2);return r===`XYZ`?(this.x=s*a*o+i*c*l,this.y=i*c*o-s*a*l,this.z=i*a*l+s*c*o,this.w=i*a*o-s*c*l):r===`YXZ`?(this.x=s*a*o+i*c*l,this.y=i*c*o-s*a*l,this.z=i*a*l-s*c*o,this.w=i*a*o+s*c*l):r===`ZXY`?(this.x=s*a*o-i*c*l,this.y=i*c*o+s*a*l,this.z=i*a*l+s*c*o,this.w=i*a*o-s*c*l):r===`ZYX`?(this.x=s*a*o-i*c*l,this.y=i*c*o+s*a*l,this.z=i*a*l-s*c*o,this.w=i*a*o+s*c*l):r===`YZX`?(this.x=s*a*o+i*c*l,this.y=i*c*o+s*a*l,this.z=i*a*l-s*c*o,this.w=i*a*o-s*c*l):r===`XZY`&&(this.x=s*a*o-i*c*l,this.y=i*c*o-s*a*l,this.z=i*a*l+s*c*o,this.w=i*a*o+s*c*l),this}clone(){return new e(this.x,this.y,this.z,this.w)}slerp(t,n,r){r===void 0&&(r=new e);let i=this.x,a=this.y,o=this.z,s=this.w,c=t.x,l=t.y,u=t.z,d=t.w,f,p,m,h,g;return p=i*c+a*l+o*u+s*d,p<0&&(p=-p,c=-c,l=-l,u=-u,d=-d),1-p>1e-6?(f=Math.acos(p),m=Math.sin(f),h=Math.sin((1-n)*f)/m,g=Math.sin(n*f)/m):(h=1-n,g=n),r.x=h*i+g*c,r.y=h*a+g*l,r.z=h*o+g*u,r.w=h*s+g*d,r}integrate(t,n,r,i){i===void 0&&(i=new e);let a=t.x*r.x,o=t.y*r.y,s=t.z*r.z,c=this.x,l=this.y,u=this.z,d=this.w,f=n*.5;return i.x+=f*(a*d+o*u-s*l),i.y+=f*(o*d+s*c-a*u),i.z+=f*(s*d+a*l-o*c),i.w+=f*(-a*c-o*l-s*u),i}},hl=new K,gl=new K,_l={SPHERE:1,PLANE:2,BOX:4,COMPOUND:8,CONVEXPOLYHEDRON:16,HEIGHTFIELD:32,PARTICLE:64,CYLINDER:128,TRIMESH:256},q=class e{constructor(t){t===void 0&&(t={}),this.id=e.idCounter++,this.type=t.type||0,this.boundingSphereRadius=0,this.collisionResponse=t.collisionResponse?t.collisionResponse:!0,this.collisionFilterGroup=t.collisionFilterGroup===void 0?1:t.collisionFilterGroup,this.collisionFilterMask=t.collisionFilterMask===void 0?-1:t.collisionFilterMask,this.material=t.material?t.material:null,this.body=null}updateBoundingSphereRadius(){throw`computeBoundingSphereRadius() not implemented for shape type ${this.type}`}volume(){throw`volume() not implemented for shape type ${this.type}`}calculateLocalInertia(e,t){throw`calculateLocalInertia() not implemented for shape type ${this.type}`}calculateWorldAABB(e,t,n,r){throw`calculateWorldAABB() not implemented for shape type ${this.type}`}};q.idCounter=0,q.types=_l;var J=class e{constructor(e){e===void 0&&(e={}),this.position=new K,this.quaternion=new ml,e.position&&this.position.copy(e.position),e.quaternion&&this.quaternion.copy(e.quaternion)}pointToLocal(t,n){return e.pointToLocalFrame(this.position,this.quaternion,t,n)}pointToWorld(t,n){return e.pointToWorldFrame(this.position,this.quaternion,t,n)}vectorToWorldFrame(e,t){return t===void 0&&(t=new K),this.quaternion.vmult(e,t),t}static pointToLocalFrame(e,t,n,r){return r===void 0&&(r=new K),n.vsub(e,r),t.conjugate(vl),vl.vmult(r,r),r}static pointToWorldFrame(e,t,n,r){return r===void 0&&(r=new K),t.vmult(n,r),r.vadd(e,r),r}static vectorToWorldFrame(e,t,n){return n===void 0&&(n=new K),e.vmult(t,n),n}static vectorToLocalFrame(e,t,n,r){return r===void 0&&(r=new K),t.w*=-1,t.vmult(n,r),t.w*=-1,r}},vl=new ml,yl=class e extends q{constructor(e){e===void 0&&(e={});let{vertices:t=[],faces:n=[],normals:r=[],axes:i,boundingSphereRadius:a}=e;super({type:q.types.CONVEXPOLYHEDRON}),this.vertices=t,this.faces=n,this.faceNormals=r,this.faceNormals.length===0&&this.computeNormals(),a?this.boundingSphereRadius=a:this.updateBoundingSphereRadius(),this.worldVertices=[],this.worldVerticesNeedsUpdate=!0,this.worldFaceNormals=[],this.worldFaceNormalsNeedsUpdate=!0,this.uniqueAxes=i?i.slice():null,this.uniqueEdges=[],this.computeEdges()}computeEdges(){let e=this.faces,t=this.vertices,n=this.uniqueEdges;n.length=0;let r=new K;for(let i=0;i!==e.length;i++){let a=e[i],o=a.length;for(let e=0;e!==o;e++){let i=(e+1)%o;t[a[e]].vsub(t[a[i]],r),r.normalize();let s=!1;for(let e=0;e!==n.length;e++)if(n[e].almostEquals(r)||n[e].almostEquals(r)){s=!0;break}s||n.push(r.clone())}}}computeNormals(){this.faceNormals.length=this.faces.length;for(let e=0;e<this.faces.length;e++){for(let t=0;t<this.faces[e].length;t++)if(!this.vertices[this.faces[e][t]])throw Error(`Vertex ${this.faces[e][t]} not found!`);let t=this.faceNormals[e]||new K;this.getFaceNormal(e,t),t.negate(t),this.faceNormals[e]=t;let n=this.vertices[this.faces[e][0]];if(t.dot(n)<0){console.error(`.faceNormals[${e}] = Vec3(${t.toString()}) looks like it points into the shape? The vertices follow. Make sure they are ordered CCW around the normal, using the right hand rule.`);for(let t=0;t<this.faces[e].length;t++)console.warn(`.vertices[${this.faces[e][t]}] = Vec3(${this.vertices[this.faces[e][t]].toString()})`)}}}getFaceNormal(t,n){let r=this.faces[t],i=this.vertices[r[0]],a=this.vertices[r[1]],o=this.vertices[r[2]];e.computeNormal(i,a,o,n)}static computeNormal(e,t,n,r){let i=new K,a=new K;t.vsub(e,a),n.vsub(t,i),i.cross(a,r),r.isZero()||r.normalize()}clipAgainstHull(e,t,n,r,i,a,o,s,c){let l=new K,u=-1,d=-Number.MAX_VALUE;for(let e=0;e<n.faces.length;e++){l.copy(n.faceNormals[e]),i.vmult(l,l);let t=l.dot(a);t>d&&(d=t,u=e)}let f=[];for(let e=0;e<n.faces[u].length;e++){let t=n.vertices[n.faces[u][e]],a=new K;a.copy(t),i.vmult(a,a),r.vadd(a,a),f.push(a)}u>=0&&this.clipFaceAgainstHull(a,e,t,f,o,s,c)}findSeparatingAxis(e,t,n,r,i,a,o,s){let c=new K,l=new K,u=new K,d=new K,f=new K,p=new K,m=Number.MAX_VALUE,h=this;if(h.uniqueAxes)for(let o=0;o!==h.uniqueAxes.length;o++){n.vmult(h.uniqueAxes[o],c);let s=h.testSepAxis(c,e,t,n,r,i);if(s===!1)return!1;s<m&&(m=s,a.copy(c))}else{let s=o?o.length:h.faces.length;for(let l=0;l<s;l++){let s=o?o[l]:l;c.copy(h.faceNormals[s]),n.vmult(c,c);let u=h.testSepAxis(c,e,t,n,r,i);if(u===!1)return!1;u<m&&(m=u,a.copy(c))}}if(e.uniqueAxes)for(let o=0;o!==e.uniqueAxes.length;o++){i.vmult(e.uniqueAxes[o],l);let s=h.testSepAxis(l,e,t,n,r,i);if(s===!1)return!1;s<m&&(m=s,a.copy(l))}else{let o=s?s.length:e.faces.length;for(let c=0;c<o;c++){let o=s?s[c]:c;l.copy(e.faceNormals[o]),i.vmult(l,l);let u=h.testSepAxis(l,e,t,n,r,i);if(u===!1)return!1;u<m&&(m=u,a.copy(l))}}for(let o=0;o!==h.uniqueEdges.length;o++){n.vmult(h.uniqueEdges[o],d);for(let o=0;o!==e.uniqueEdges.length;o++)if(i.vmult(e.uniqueEdges[o],f),d.cross(f,p),!p.almostZero()){p.normalize();let o=h.testSepAxis(p,e,t,n,r,i);if(o===!1)return!1;o<m&&(m=o,a.copy(p))}}return r.vsub(t,u),u.dot(a)>0&&a.negate(a),!0}testSepAxis(t,n,r,i,a,o){let s=this;e.project(s,t,r,i,bl),e.project(n,t,a,o,xl);let c=bl[0],l=bl[1],u=xl[0],d=xl[1];if(c<d||u<l)return!1;let f=c-d,p=u-l;return f<p?f:p}calculateLocalInertia(e,t){let n=new K,r=new K;this.computeLocalAABB(r,n);let i=n.x-r.x,a=n.y-r.y,o=n.z-r.z;t.x=1/12*e*(2*a*2*a+2*o*2*o),t.y=1/12*e*(2*i*2*i+2*o*2*o),t.z=1/12*e*(2*a*2*a+2*i*2*i)}getPlaneConstantOfFace(e){let t=this.faces[e],n=this.faceNormals[e],r=this.vertices[t[0]];return-n.dot(r)}clipFaceAgainstHull(e,t,n,r,i,a,o){let s=new K,c=new K,l=new K,u=new K,d=new K,f=new K,p=new K,m=new K,h=this,g=[],_=r,v=g,y=-1,b=Number.MAX_VALUE;for(let t=0;t<h.faces.length;t++){s.copy(h.faceNormals[t]),n.vmult(s,s);let r=s.dot(e);r<b&&(b=r,y=t)}if(y<0)return;let x=h.faces[y];x.connectedFaces=[];for(let e=0;e<h.faces.length;e++)for(let t=0;t<h.faces[e].length;t++)x.indexOf(h.faces[e][t])!==-1&&e!==y&&x.connectedFaces.indexOf(e)===-1&&x.connectedFaces.push(e);let S=x.length;for(let e=0;e<S;e++){let r=h.vertices[x[e]],i=h.vertices[x[(e+1)%S]];r.vsub(i,c),l.copy(c),n.vmult(l,l),t.vadd(l,l),u.copy(this.faceNormals[y]),n.vmult(u,u),t.vadd(u,u),l.cross(u,d),d.negate(d),f.copy(r),n.vmult(f,f),t.vadd(f,f);let a=x.connectedFaces[e];p.copy(this.faceNormals[a]);let o=this.getPlaneConstantOfFace(a);m.copy(p),n.vmult(m,m);let s=o-m.dot(t);for(this.clipFaceAgainstPlane(_,v,m,s);_.length;)_.shift();for(;v.length;)_.push(v.shift())}p.copy(this.faceNormals[y]);let C=this.getPlaneConstantOfFace(y);m.copy(p),n.vmult(m,m);let w=C-m.dot(t);for(let e=0;e<_.length;e++){let t=m.dot(_[e])+w;if(t<=i&&(console.log(`clamped: depth=${t} to minDist=${i}`),t=i),t<=a){let n=_[e];if(t<=1e-6){let e={point:n,normal:m,depth:t};o.push(e)}}}}clipFaceAgainstPlane(e,t,n,r){let i,a,o=e.length;if(o<2)return t;let s=e[e.length-1],c=e[0];i=n.dot(s)+r;for(let l=0;l<o;l++){if(c=e[l],a=n.dot(c)+r,i<0)if(a<0){let e=new K;e.copy(c),t.push(e)}else{let e=new K;s.lerp(c,i/(i-a),e),t.push(e)}else if(a<0){let e=new K;s.lerp(c,i/(i-a),e),t.push(e),t.push(c)}s=c,i=a}return t}computeWorldVertices(e,t){for(;this.worldVertices.length<this.vertices.length;)this.worldVertices.push(new K);let n=this.vertices,r=this.worldVertices;for(let i=0;i!==this.vertices.length;i++)t.vmult(n[i],r[i]),e.vadd(r[i],r[i]);this.worldVerticesNeedsUpdate=!1}computeLocalAABB(e,t){let n=this.vertices;e.set(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE),t.set(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE);for(let r=0;r<this.vertices.length;r++){let i=n[r];i.x<e.x?e.x=i.x:i.x>t.x&&(t.x=i.x),i.y<e.y?e.y=i.y:i.y>t.y&&(t.y=i.y),i.z<e.z?e.z=i.z:i.z>t.z&&(t.z=i.z)}}computeWorldFaceNormals(e){let t=this.faceNormals.length;for(;this.worldFaceNormals.length<t;)this.worldFaceNormals.push(new K);let n=this.faceNormals,r=this.worldFaceNormals;for(let i=0;i!==t;i++)e.vmult(n[i],r[i]);this.worldFaceNormalsNeedsUpdate=!1}updateBoundingSphereRadius(){let e=0,t=this.vertices;for(let n=0;n!==t.length;n++){let r=t[n].lengthSquared();r>e&&(e=r)}this.boundingSphereRadius=Math.sqrt(e)}calculateWorldAABB(e,t,n,r){let i=this.vertices,a,o,s,c,l,u,d=new K;for(let n=0;n<i.length;n++){d.copy(i[n]),t.vmult(d,d),e.vadd(d,d);let r=d;(a===void 0||r.x<a)&&(a=r.x),(c===void 0||r.x>c)&&(c=r.x),(o===void 0||r.y<o)&&(o=r.y),(l===void 0||r.y>l)&&(l=r.y),(s===void 0||r.z<s)&&(s=r.z),(u===void 0||r.z>u)&&(u=r.z)}n.set(a,o,s),r.set(c,l,u)}volume(){return 4*Math.PI*this.boundingSphereRadius/3}getAveragePointLocal(e){e===void 0&&(e=new K);let t=this.vertices;for(let n=0;n<t.length;n++)e.vadd(t[n],e);return e.scale(1/t.length,e),e}transformAllPoints(e,t){let n=this.vertices.length,r=this.vertices;if(t){for(let e=0;e<n;e++){let n=r[e];t.vmult(n,n)}for(let e=0;e<this.faceNormals.length;e++){let n=this.faceNormals[e];t.vmult(n,n)}}if(e)for(let t=0;t<n;t++){let n=r[t];n.vadd(e,n)}}pointIsInside(e){let t=this.vertices,n=this.faces,r=this.faceNormals,i=new K;this.getAveragePointLocal(i);for(let a=0;a<this.faces.length;a++){let o=r[a],s=t[n[a][0]],c=new K;e.vsub(s,c);let l=o.dot(c),u=new K;i.vsub(s,u);let d=o.dot(u);if(l<0&&d>0||l>0&&d<0)return!1}return-1}static project(e,t,n,r,i){let a=e.vertices.length,o=Sl,s=0,c=0,l=Cl,u=e.vertices;l.setZero(),J.vectorToLocalFrame(n,r,t,o),J.pointToLocalFrame(n,r,l,l);let d=l.dot(o);c=s=u[0].dot(o);for(let e=1;e<a;e++){let t=u[e].dot(o);t>s&&(s=t),t<c&&(c=t)}if(c-=d,s-=d,c>s){let e=c;c=s,s=e}i[0]=s,i[1]=c}},bl=[],xl=[];new K;var Sl=new K,Cl=new K,wl=class e extends q{constructor(e){super({type:q.types.BOX}),this.halfExtents=e,this.convexPolyhedronRepresentation=null,this.updateConvexPolyhedronRepresentation(),this.updateBoundingSphereRadius()}updateConvexPolyhedronRepresentation(){let e=this.halfExtents.x,t=this.halfExtents.y,n=this.halfExtents.z,r=K,i=new yl({vertices:[new r(-e,-t,-n),new r(e,-t,-n),new r(e,t,-n),new r(-e,t,-n),new r(-e,-t,n),new r(e,-t,n),new r(e,t,n),new r(-e,t,n)],faces:[[3,2,1,0],[4,5,6,7],[5,4,0,1],[2,3,7,6],[0,4,7,3],[1,2,6,5]],axes:[new r(0,0,1),new r(0,1,0),new r(1,0,0)]});this.convexPolyhedronRepresentation=i,i.material=this.material}calculateLocalInertia(t,n){return n===void 0&&(n=new K),e.calculateInertia(this.halfExtents,t,n),n}static calculateInertia(e,t,n){let r=e;n.x=1/12*t*(2*r.y*2*r.y+2*r.z*2*r.z),n.y=1/12*t*(2*r.x*2*r.x+2*r.z*2*r.z),n.z=1/12*t*(2*r.y*2*r.y+2*r.x*2*r.x)}getSideNormals(e,t){let n=e,r=this.halfExtents;if(n[0].set(r.x,0,0),n[1].set(0,r.y,0),n[2].set(0,0,r.z),n[3].set(-r.x,0,0),n[4].set(0,-r.y,0),n[5].set(0,0,-r.z),t!==void 0)for(let e=0;e!==n.length;e++)t.vmult(n[e],n[e]);return n}volume(){return 8*this.halfExtents.x*this.halfExtents.y*this.halfExtents.z}updateBoundingSphereRadius(){this.boundingSphereRadius=this.halfExtents.length()}forEachWorldCorner(e,t,n){let r=this.halfExtents,i=[[r.x,r.y,r.z],[-r.x,r.y,r.z],[-r.x,-r.y,r.z],[-r.x,-r.y,-r.z],[r.x,-r.y,-r.z],[r.x,r.y,-r.z],[-r.x,r.y,-r.z],[r.x,-r.y,r.z]];for(let r=0;r<i.length;r++)Tl.set(i[r][0],i[r][1],i[r][2]),t.vmult(Tl,Tl),e.vadd(Tl,Tl),n(Tl.x,Tl.y,Tl.z)}calculateWorldAABB(e,t,n,r){let i=this.halfExtents;El[0].set(i.x,i.y,i.z),El[1].set(-i.x,i.y,i.z),El[2].set(-i.x,-i.y,i.z),El[3].set(-i.x,-i.y,-i.z),El[4].set(i.x,-i.y,-i.z),El[5].set(i.x,i.y,-i.z),El[6].set(-i.x,i.y,-i.z),El[7].set(i.x,-i.y,i.z);let a=El[0];t.vmult(a,a),e.vadd(a,a),r.copy(a),n.copy(a);for(let i=1;i<8;i++){let a=El[i];t.vmult(a,a),e.vadd(a,a);let o=a.x,s=a.y,c=a.z;o>r.x&&(r.x=o),s>r.y&&(r.y=s),c>r.z&&(r.z=c),o<n.x&&(n.x=o),s<n.y&&(n.y=s),c<n.z&&(n.z=c)}}},Tl=new K,El=[new K,new K,new K,new K,new K,new K,new K,new K],Dl={DYNAMIC:1,STATIC:2,KINEMATIC:4},Ol={AWAKE:0,SLEEPY:1,SLEEPING:2},Y=class e extends pl{constructor(t){t===void 0&&(t={}),super(),this.id=e.idCounter++,this.index=-1,this.world=null,this.vlambda=new K,this.collisionFilterGroup=typeof t.collisionFilterGroup==`number`?t.collisionFilterGroup:1,this.collisionFilterMask=typeof t.collisionFilterMask==`number`?t.collisionFilterMask:-1,this.collisionResponse=typeof t.collisionResponse==`boolean`?t.collisionResponse:!0,this.position=new K,this.previousPosition=new K,this.interpolatedPosition=new K,this.initPosition=new K,t.position&&(this.position.copy(t.position),this.previousPosition.copy(t.position),this.interpolatedPosition.copy(t.position),this.initPosition.copy(t.position)),this.velocity=new K,t.velocity&&this.velocity.copy(t.velocity),this.initVelocity=new K,this.force=new K;let n=typeof t.mass==`number`?t.mass:0;this.mass=n,this.invMass=n>0?1/n:0,this.material=t.material||null,this.linearDamping=typeof t.linearDamping==`number`?t.linearDamping:.01,this.type=n<=0?e.STATIC:e.DYNAMIC,typeof t.type==typeof e.STATIC&&(this.type=t.type),this.allowSleep=t.allowSleep===void 0?!0:t.allowSleep,this.sleepState=e.AWAKE,this.sleepSpeedLimit=t.sleepSpeedLimit===void 0?.1:t.sleepSpeedLimit,this.sleepTimeLimit=t.sleepTimeLimit===void 0?1:t.sleepTimeLimit,this.timeLastSleepy=0,this.wakeUpAfterNarrowphase=!1,this.torque=new K,this.quaternion=new ml,this.initQuaternion=new ml,this.previousQuaternion=new ml,this.interpolatedQuaternion=new ml,t.quaternion&&(this.quaternion.copy(t.quaternion),this.initQuaternion.copy(t.quaternion),this.previousQuaternion.copy(t.quaternion),this.interpolatedQuaternion.copy(t.quaternion)),this.angularVelocity=new K,t.angularVelocity&&this.angularVelocity.copy(t.angularVelocity),this.initAngularVelocity=new K,this.shapes=[],this.shapeOffsets=[],this.shapeOrientations=[],this.inertia=new K,this.invInertia=new K,this.invInertiaWorld=new il,this.invMassSolve=0,this.invInertiaSolve=new K,this.invInertiaWorldSolve=new il,this.fixedRotation=t.fixedRotation===void 0?!1:t.fixedRotation,this.angularDamping=t.angularDamping===void 0?.01:t.angularDamping,this.linearFactor=new K(1,1,1),t.linearFactor&&this.linearFactor.copy(t.linearFactor),this.angularFactor=new K(1,1,1),t.angularFactor&&this.angularFactor.copy(t.angularFactor),this.aabb=new ll,this.aabbNeedsUpdate=!0,this.boundingRadius=0,this.wlambda=new K,this.isTrigger=!!t.isTrigger,t.shape&&this.addShape(t.shape),this.updateMassProperties()}wakeUp(){let t=this.sleepState;this.sleepState=e.AWAKE,this.wakeUpAfterNarrowphase=!1,t===e.SLEEPING&&this.dispatchEvent(e.wakeupEvent)}sleep(){this.sleepState=e.SLEEPING,this.velocity.set(0,0,0),this.angularVelocity.set(0,0,0),this.wakeUpAfterNarrowphase=!1}sleepTick(t){if(this.allowSleep){let n=this.sleepState,r=this.velocity.lengthSquared()+this.angularVelocity.lengthSquared(),i=this.sleepSpeedLimit**2;n===e.AWAKE&&r<i?(this.sleepState=e.SLEEPY,this.timeLastSleepy=t,this.dispatchEvent(e.sleepyEvent)):n===e.SLEEPY&&r>i?this.wakeUp():n===e.SLEEPY&&t-this.timeLastSleepy>this.sleepTimeLimit&&(this.sleep(),this.dispatchEvent(e.sleepEvent))}}updateSolveMassProperties(){this.sleepState===e.SLEEPING||this.type===e.KINEMATIC?(this.invMassSolve=0,this.invInertiaSolve.setZero(),this.invInertiaWorldSolve.setZero()):(this.invMassSolve=this.invMass,this.invInertiaSolve.copy(this.invInertia),this.invInertiaWorldSolve.copy(this.invInertiaWorld))}pointToLocalFrame(e,t){return t===void 0&&(t=new K),e.vsub(this.position,t),this.quaternion.conjugate().vmult(t,t),t}vectorToLocalFrame(e,t){return t===void 0&&(t=new K),this.quaternion.conjugate().vmult(e,t),t}pointToWorldFrame(e,t){return t===void 0&&(t=new K),this.quaternion.vmult(e,t),t.vadd(this.position,t),t}vectorToWorldFrame(e,t){return t===void 0&&(t=new K),this.quaternion.vmult(e,t),t}addShape(e,t,n){let r=new K,i=new ml;return t&&r.copy(t),n&&i.copy(n),this.shapes.push(e),this.shapeOffsets.push(r),this.shapeOrientations.push(i),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,e.body=this,this}removeShape(e){let t=this.shapes.indexOf(e);return t===-1?(console.warn(`Shape does not belong to the body`),this):(this.shapes.splice(t,1),this.shapeOffsets.splice(t,1),this.shapeOrientations.splice(t,1),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,e.body=null,this)}updateBoundingRadius(){let e=this.shapes,t=this.shapeOffsets,n=e.length,r=0;for(let i=0;i!==n;i++){let n=e[i];n.updateBoundingSphereRadius();let a=t[i].length(),o=n.boundingSphereRadius;a+o>r&&(r=a+o)}this.boundingRadius=r}updateAABB(){let e=this.shapes,t=this.shapeOffsets,n=this.shapeOrientations,r=e.length,i=kl,a=Al,o=this.quaternion,s=this.aabb,c=jl;for(let l=0;l!==r;l++){let r=e[l];o.vmult(t[l],i),i.vadd(this.position,i),o.mult(n[l],a),r.calculateWorldAABB(i,a,c.lowerBound,c.upperBound),l===0?s.copy(c):s.extend(c)}this.aabbNeedsUpdate=!1}updateInertiaWorld(e){let t=this.invInertia;if(!(t.x===t.y&&t.y===t.z&&!e)){let e=Ml,n=Nl;e.setRotationFromQuaternion(this.quaternion),e.transpose(n),e.scale(t,e),e.mmult(n,this.invInertiaWorld)}}applyForce(t,n){if(n===void 0&&(n=new K),this.type!==e.DYNAMIC)return;this.sleepState===e.SLEEPING&&this.wakeUp();let r=Pl;n.cross(t,r),this.force.vadd(t,this.force),this.torque.vadd(r,this.torque)}applyLocalForce(t,n){if(n===void 0&&(n=new K),this.type!==e.DYNAMIC)return;let r=Fl,i=Il;this.vectorToWorldFrame(t,r),this.vectorToWorldFrame(n,i),this.applyForce(r,i)}applyTorque(t){this.type===e.DYNAMIC&&(this.sleepState===e.SLEEPING&&this.wakeUp(),this.torque.vadd(t,this.torque))}applyImpulse(t,n){if(n===void 0&&(n=new K),this.type!==e.DYNAMIC)return;this.sleepState===e.SLEEPING&&this.wakeUp();let r=n,i=Ll;i.copy(t),i.scale(this.invMass,i),this.velocity.vadd(i,this.velocity);let a=Rl;r.cross(t,a),this.invInertiaWorld.vmult(a,a),this.angularVelocity.vadd(a,this.angularVelocity)}applyLocalImpulse(t,n){if(n===void 0&&(n=new K),this.type!==e.DYNAMIC)return;let r=zl,i=Bl;this.vectorToWorldFrame(t,r),this.vectorToWorldFrame(n,i),this.applyImpulse(r,i)}updateMassProperties(){let e=Vl;this.invMass=this.mass>0?1/this.mass:0;let t=this.inertia,n=this.fixedRotation;this.updateAABB(),e.set((this.aabb.upperBound.x-this.aabb.lowerBound.x)/2,(this.aabb.upperBound.y-this.aabb.lowerBound.y)/2,(this.aabb.upperBound.z-this.aabb.lowerBound.z)/2),wl.calculateInertia(e,this.mass,t),this.invInertia.set(t.x>0&&!n?1/t.x:0,t.y>0&&!n?1/t.y:0,t.z>0&&!n?1/t.z:0),this.updateInertiaWorld(!0)}getVelocityAtWorldPoint(e,t){let n=new K;return e.vsub(this.position,n),this.angularVelocity.cross(n,t),this.velocity.vadd(t,t),t}integrate(t,n,r){if(this.previousPosition.copy(this.position),this.previousQuaternion.copy(this.quaternion),!(this.type===e.DYNAMIC||this.type===e.KINEMATIC)||this.sleepState===e.SLEEPING)return;let i=this.velocity,a=this.angularVelocity,o=this.position,s=this.force,c=this.torque,l=this.quaternion,u=this.invMass,d=this.invInertiaWorld,f=this.linearFactor,p=u*t;i.x+=s.x*p*f.x,i.y+=s.y*p*f.y,i.z+=s.z*p*f.z;let m=d.elements,h=this.angularFactor,g=c.x*h.x,_=c.y*h.y,v=c.z*h.z;a.x+=t*(m[0]*g+m[1]*_+m[2]*v),a.y+=t*(m[3]*g+m[4]*_+m[5]*v),a.z+=t*(m[6]*g+m[7]*_+m[8]*v),o.x+=i.x*t,o.y+=i.y*t,o.z+=i.z*t,l.integrate(this.angularVelocity,t,this.angularFactor,l),n&&(r?l.normalizeFast():l.normalize()),this.aabbNeedsUpdate=!0,this.updateInertiaWorld()}};Y.idCounter=0,Y.COLLIDE_EVENT_NAME=`collide`,Y.DYNAMIC=Dl.DYNAMIC,Y.STATIC=Dl.STATIC,Y.KINEMATIC=Dl.KINEMATIC,Y.AWAKE=Ol.AWAKE,Y.SLEEPY=Ol.SLEEPY,Y.SLEEPING=Ol.SLEEPING,Y.wakeupEvent={type:`wakeup`},Y.sleepyEvent={type:`sleepy`},Y.sleepEvent={type:`sleep`};var kl=new K,Al=new ml,jl=new ll,Ml=new il,Nl=new il;new il;var Pl=new K,Fl=new K,Il=new K,Ll=new K,Rl=new K,zl=new K,Bl=new K,Vl=new K,Hl=class{constructor(){this.world=null,this.useBoundingBoxes=!1,this.dirty=!0}collisionPairs(e,t,n){throw Error(`collisionPairs not implemented for this BroadPhase class!`)}needBroadphaseCollision(e,t){return!((e.collisionFilterGroup&t.collisionFilterMask)===0||(t.collisionFilterGroup&e.collisionFilterMask)===0||((e.type&Y.STATIC)!==0||e.sleepState===Y.SLEEPING)&&((t.type&Y.STATIC)!==0||t.sleepState===Y.SLEEPING))}intersectionTest(e,t,n,r){this.useBoundingBoxes?this.doBoundingBoxBroadphase(e,t,n,r):this.doBoundingSphereBroadphase(e,t,n,r)}doBoundingSphereBroadphase(e,t,n,r){let i=Ul;t.position.vsub(e.position,i);let a=(e.boundingRadius+t.boundingRadius)**2;i.lengthSquared()<a&&(n.push(e),r.push(t))}doBoundingBoxBroadphase(e,t,n,r){e.aabbNeedsUpdate&&e.updateAABB(),t.aabbNeedsUpdate&&t.updateAABB(),e.aabb.overlaps(t.aabb)&&(n.push(e),r.push(t))}makePairsUnique(e,t){let n=Wl,r=Gl,i=Kl,a=e.length;for(let n=0;n!==a;n++)r[n]=e[n],i[n]=t[n];e.length=0,t.length=0;for(let e=0;e!==a;e++){let t=r[e].id,a=i[e].id,o=t<a?`${t},${a}`:`${a},${t}`;n[o]=e,n.keys.push(o)}for(let a=0;a!==n.keys.length;a++){let a=n.keys.pop(),o=n[a];e.push(r[o]),t.push(i[o]),delete n[a]}}setWorld(e){}static boundingSphereCheck(e,t){let n=new K;e.position.vsub(t.position,n);let r=e.shapes[0],i=t.shapes[0];return(r.boundingSphereRadius+i.boundingSphereRadius)**2>n.lengthSquared()}aabbQuery(e,t,n){return console.warn(`.aabbQuery is not implemented in this Broadphase subclass.`),[]}},Ul=new K;new K,new ml,new K;var Wl={keys:[]},Gl=[],Kl=[];new K,new K,new K;var ql=class extends Hl{constructor(){super()}collisionPairs(e,t,n){let r=e.bodies,i=r.length,a,o;for(let e=0;e!==i;e++)for(let i=0;i!==e;i++)a=r[e],o=r[i],this.needBroadphaseCollision(a,o)&&this.intersectionTest(a,o,t,n)}aabbQuery(e,t,n){n===void 0&&(n=[]);for(let r=0;r<e.bodies.length;r++){let i=e.bodies[r];i.aabbNeedsUpdate&&i.updateAABB(),i.aabb.overlaps(t)&&n.push(i)}return n}},Jl=class{constructor(){this.rayFromWorld=new K,this.rayToWorld=new K,this.hitNormalWorld=new K,this.hitPointWorld=new K,this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}reset(){this.rayFromWorld.setZero(),this.rayToWorld.setZero(),this.hitNormalWorld.setZero(),this.hitPointWorld.setZero(),this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}abort(){this.shouldStop=!0}set(e,t,n,r,i,a,o){this.rayFromWorld.copy(e),this.rayToWorld.copy(t),this.hitNormalWorld.copy(n),this.hitPointWorld.copy(r),this.shape=i,this.body=a,this.distance=o}},Yl,Xl,Zl,Ql,$l,eu,tu,nu={CLOSEST:1,ANY:2,ALL:4};Yl=q.types.SPHERE,Xl=q.types.PLANE,Zl=q.types.BOX,Ql=q.types.CYLINDER,$l=q.types.CONVEXPOLYHEDRON,eu=q.types.HEIGHTFIELD,tu=q.types.TRIMESH;var ru=class e{get[Yl](){return this._intersectSphere}get[Xl](){return this._intersectPlane}get[Zl](){return this._intersectBox}get[Ql](){return this._intersectConvex}get[$l](){return this._intersectConvex}get[eu](){return this._intersectHeightfield}get[tu](){return this._intersectTrimesh}constructor(t,n){t===void 0&&(t=new K),n===void 0&&(n=new K),this.from=t.clone(),this.to=n.clone(),this.direction=new K,this.precision=1e-4,this.checkCollisionResponse=!0,this.skipBackfaces=!1,this.collisionFilterMask=-1,this.collisionFilterGroup=-1,this.mode=e.ANY,this.result=new Jl,this.hasHit=!1,this.callback=e=>{}}intersectWorld(t,n){return this.mode=n.mode||e.ANY,this.result=n.result||new Jl,this.skipBackfaces=!!n.skipBackfaces,this.collisionFilterMask=n.collisionFilterMask===void 0?-1:n.collisionFilterMask,this.collisionFilterGroup=n.collisionFilterGroup===void 0?-1:n.collisionFilterGroup,this.checkCollisionResponse=n.checkCollisionResponse===void 0?!0:n.checkCollisionResponse,n.from&&this.from.copy(n.from),n.to&&this.to.copy(n.to),this.callback=n.callback||(()=>{}),this.hasHit=!1,this.result.reset(),this.updateDirection(),this.getAABB(iu),au.length=0,t.broadphase.aabbQuery(t,iu,au),this.intersectBodies(au),this.hasHit}intersectBody(e,t){t&&(this.result=t,this.updateDirection());let n=this.checkCollisionResponse;if(n&&!e.collisionResponse||(this.collisionFilterGroup&e.collisionFilterMask)===0||(e.collisionFilterGroup&this.collisionFilterMask)===0)return;let r=cu,i=lu;for(let t=0,a=e.shapes.length;t<a;t++){let a=e.shapes[t];if(!(n&&!a.collisionResponse)&&(e.quaternion.mult(e.shapeOrientations[t],i),e.quaternion.vmult(e.shapeOffsets[t],r),r.vadd(e.position,r),this.intersectShape(a,i,r,e),this.result.shouldStop))break}}intersectBodies(e,t){t&&(this.result=t,this.updateDirection());for(let t=0,n=e.length;!this.result.shouldStop&&t<n;t++)this.intersectBody(e[t])}updateDirection(){this.to.vsub(this.from,this.direction),this.direction.normalize()}intersectShape(e,t,n,r){let i=this.from;if(Mu(i,this.direction,n)>e.boundingSphereRadius)return;let a=this[e.type];a&&a.call(this,e,t,n,r,e)}_intersectBox(e,t,n,r,i){return this._intersectConvex(e.convexPolyhedronRepresentation,t,n,r,i)}_intersectPlane(e,t,n,r,i){let a=this.from,o=this.to,s=this.direction,c=new K(0,0,1);t.vmult(c,c);let l=new K;a.vsub(n,l);let u=l.dot(c);if(o.vsub(n,l),u*l.dot(c)>0||a.distanceTo(o)<u)return;let d=c.dot(s);if(Math.abs(d)<this.precision)return;let f=new K,p=new K,m=new K;a.vsub(n,f);let h=-c.dot(f)/d;s.scale(h,p),a.vadd(p,m),this.reportIntersection(c,m,i,r,-1)}getAABB(e){let{lowerBound:t,upperBound:n}=e,r=this.to,i=this.from;t.x=Math.min(r.x,i.x),t.y=Math.min(r.y,i.y),t.z=Math.min(r.z,i.z),n.x=Math.max(r.x,i.x),n.y=Math.max(r.y,i.y),n.z=Math.max(r.z,i.z)}_intersectHeightfield(e,t,n,r,i){e.data,e.elementSize;let a=gu;a.from.copy(this.from),a.to.copy(this.to),J.pointToLocalFrame(n,t,a.from,a.from),J.pointToLocalFrame(n,t,a.to,a.to),a.updateDirection();let o=_u,s,c,l,u;s=c=0,l=u=e.data.length-1;let d=new ll;a.getAABB(d),e.getIndexOfPosition(d.lowerBound.x,d.lowerBound.y,o,!0),s=Math.max(s,o[0]),c=Math.max(c,o[1]),e.getIndexOfPosition(d.upperBound.x,d.upperBound.y,o,!0),l=Math.min(l,o[0]+1),u=Math.min(u,o[1]+1);for(let o=s;o<l;o++)for(let s=c;s<u;s++){if(this.result.shouldStop)return;if(e.getAabbAtIndex(o,s,d),d.overlapsRay(a)){if(e.getConvexTrianglePillar(o,s,!1),J.pointToWorldFrame(n,t,e.pillarOffset,hu),this._intersectConvex(e.pillarConvex,t,hu,r,i,mu),this.result.shouldStop)return;e.getConvexTrianglePillar(o,s,!0),J.pointToWorldFrame(n,t,e.pillarOffset,hu),this._intersectConvex(e.pillarConvex,t,hu,r,i,mu)}}}_intersectSphere(e,t,n,r,i){let a=this.from,o=this.to,s=e.radius,c=(o.x-a.x)**2+(o.y-a.y)**2+(o.z-a.z)**2,l=2*((o.x-a.x)*(a.x-n.x)+(o.y-a.y)*(a.y-n.y)+(o.z-a.z)*(a.z-n.z)),u=(a.x-n.x)**2+(a.y-n.y)**2+(a.z-n.z)**2-s**2,d=l**2-4*c*u,f=vu,p=yu;if(!(d<0))if(d===0)a.lerp(o,d,f),f.vsub(n,p),p.normalize(),this.reportIntersection(p,f,i,r,-1);else{let e=(-l-Math.sqrt(d))/(2*c),t=(-l+Math.sqrt(d))/(2*c);if(e>=0&&e<=1&&(a.lerp(o,e,f),f.vsub(n,p),p.normalize(),this.reportIntersection(p,f,i,r,-1)),this.result.shouldStop)return;t>=0&&t<=1&&(a.lerp(o,t,f),f.vsub(n,p),p.normalize(),this.reportIntersection(p,f,i,r,-1))}}_intersectConvex(t,n,r,i,a,o){let s=bu,c=xu,l=o&&o.faceList||null,u=t.faces,d=t.vertices,f=t.faceNormals,p=this.direction,m=this.from,h=this.to,g=m.distanceTo(h),_=l?l.length:u.length,v=this.result;for(let t=0;!v.shouldStop&&t<_;t++){let o=l?l[t]:t,h=u[o],_=f[o],y=n,b=r;c.copy(d[h[0]]),y.vmult(c,c),c.vadd(b,c),c.vsub(m,c),y.vmult(_,s);let x=p.dot(s);if(Math.abs(x)<this.precision)continue;let S=s.dot(c)/x;if(!(S<0)){p.scale(S,uu),uu.vadd(m,uu),du.copy(d[h[0]]),y.vmult(du,du),b.vadd(du,du);for(let t=1;!v.shouldStop&&t<h.length-1;t++){fu.copy(d[h[t]]),pu.copy(d[h[t+1]]),y.vmult(fu,fu),y.vmult(pu,pu),b.vadd(fu,fu),b.vadd(pu,pu);let n=uu.distanceTo(m);!(e.pointInTriangle(uu,du,fu,pu)||e.pointInTriangle(uu,fu,du,pu))||n>g||this.reportIntersection(s,uu,a,i,o)}}}}_intersectTrimesh(t,n,r,i,a,o){let s=Su,c=Ou,l=ku,u=xu,d=Cu,f=wu,p=Tu,m=Du,h=Eu,g=t.indices;t.vertices;let _=this.from,v=this.to,y=this.direction;l.position.copy(r),l.quaternion.copy(n),J.vectorToLocalFrame(r,n,y,d),J.pointToLocalFrame(r,n,_,f),J.pointToLocalFrame(r,n,v,p),p.x*=t.scale.x,p.y*=t.scale.y,p.z*=t.scale.z,f.x*=t.scale.x,f.y*=t.scale.y,f.z*=t.scale.z,p.vsub(f,d),d.normalize();let b=f.distanceSquared(p);t.tree.rayQuery(this,l,c);for(let o=0,l=c.length;!this.result.shouldStop&&o!==l;o++){let l=c[o];t.getNormal(l,s),t.getVertex(g[l*3],du),du.vsub(f,u);let p=d.dot(s),_=s.dot(u)/p;if(_<0)continue;d.scale(_,uu),uu.vadd(f,uu),t.getVertex(g[l*3+1],fu),t.getVertex(g[l*3+2],pu);let v=uu.distanceSquared(f);!(e.pointInTriangle(uu,fu,du,pu)||e.pointInTriangle(uu,du,fu,pu))||v>b||(J.vectorToWorldFrame(n,s,h),J.pointToWorldFrame(r,n,uu,m),this.reportIntersection(h,m,a,i,l))}c.length=0}reportIntersection(t,n,r,i,a){let o=this.from,s=this.to,c=o.distanceTo(n),l=this.result;if(!(this.skipBackfaces&&t.dot(this.direction)>0))switch(l.hitFaceIndex=a===void 0?-1:a,this.mode){case e.ALL:this.hasHit=!0,l.set(o,s,t,n,r,i,c),l.hasHit=!0,this.callback(l);break;case e.CLOSEST:(c<l.distance||!l.hasHit)&&(this.hasHit=!0,l.hasHit=!0,l.set(o,s,t,n,r,i,c));break;case e.ANY:this.hasHit=!0,l.hasHit=!0,l.set(o,s,t,n,r,i,c),l.shouldStop=!0;break}}static pointInTriangle(e,t,n,r){r.vsub(t,Au),n.vsub(t,ou),e.vsub(t,su);let i=Au.dot(Au),a=Au.dot(ou),o=Au.dot(su),s=ou.dot(ou),c=ou.dot(su),l,u;return(l=s*o-a*c)>=0&&(u=i*c-a*o)>=0&&l+u<i*s-a*a}};ru.CLOSEST=nu.CLOSEST,ru.ANY=nu.ANY,ru.ALL=nu.ALL;var iu=new ll,au=[],ou=new K,su=new K,cu=new K,lu=new ml,uu=new K,du=new K,fu=new K,pu=new K;new K,new Jl;var mu={faceList:[0]},hu=new K,gu=new ru,_u=[],vu=new K,yu=new K,bu=new K;new K,new K;var xu=new K,Su=new K,Cu=new K,wu=new K,Tu=new K,Eu=new K,Du=new K;new ll;var Ou=[],ku=new J,Au=new K,ju=new K;function Mu(e,t,n){n.vsub(e,Au);let r=Au.dot(t);return t.scale(r,ju),ju.vadd(e,ju),n.distanceTo(ju)}var Nu=class e extends Hl{static checkBounds(e,t,n){let r,i;n===0?(r=e.position.x,i=t.position.x):n===1?(r=e.position.y,i=t.position.y):n===2&&(r=e.position.z,i=t.position.z);let a=e.boundingRadius,o=t.boundingRadius,s=r+a;return i-o<s}static insertionSortX(e){for(let t=1,n=e.length;t<n;t++){let n=e[t],r;for(r=t-1;r>=0&&!(e[r].aabb.lowerBound.x<=n.aabb.lowerBound.x);r--)e[r+1]=e[r];e[r+1]=n}return e}static insertionSortY(e){for(let t=1,n=e.length;t<n;t++){let n=e[t],r;for(r=t-1;r>=0&&!(e[r].aabb.lowerBound.y<=n.aabb.lowerBound.y);r--)e[r+1]=e[r];e[r+1]=n}return e}static insertionSortZ(e){for(let t=1,n=e.length;t<n;t++){let n=e[t],r;for(r=t-1;r>=0&&!(e[r].aabb.lowerBound.z<=n.aabb.lowerBound.z);r--)e[r+1]=e[r];e[r+1]=n}return e}constructor(e){super(),this.axisList=[],this.world=null,this.axisIndex=0;let t=this.axisList;this._addBodyHandler=e=>{t.push(e.body)},this._removeBodyHandler=e=>{let n=t.indexOf(e.body);n!==-1&&t.splice(n,1)},e&&this.setWorld(e)}setWorld(e){this.axisList.length=0;for(let t=0;t<e.bodies.length;t++)this.axisList.push(e.bodies[t]);e.removeEventListener(`addBody`,this._addBodyHandler),e.removeEventListener(`removeBody`,this._removeBodyHandler),e.addEventListener(`addBody`,this._addBodyHandler),e.addEventListener(`removeBody`,this._removeBodyHandler),this.world=e,this.dirty=!0}collisionPairs(t,n,r){let i=this.axisList,a=i.length,o=this.axisIndex,s,c;for(this.dirty&&=(this.sortList(),!1),s=0;s!==a;s++){let t=i[s];for(c=s+1;c<a;c++){let a=i[c];if(this.needBroadphaseCollision(t,a)){if(!e.checkBounds(t,a,o))break;this.intersectionTest(t,a,n,r)}}}}sortList(){let t=this.axisList,n=this.axisIndex,r=t.length;for(let e=0;e!==r;e++){let n=t[e];n.aabbNeedsUpdate&&n.updateAABB()}n===0?e.insertionSortX(t):n===1?e.insertionSortY(t):n===2&&e.insertionSortZ(t)}autoDetectAxis(){let e=0,t=0,n=0,r=0,i=0,a=0,o=this.axisList,s=o.length,c=1/s;for(let c=0;c!==s;c++){let s=o[c],l=s.position.x;e+=l,t+=l*l;let u=s.position.y;n+=u,r+=u*u;let d=s.position.z;i+=d,a+=d*d}let l=t-e*e*c,u=r-n*n*c,d=a-i*i*c;l>u?l>d?this.axisIndex=0:this.axisIndex=2:u>d?this.axisIndex=1:this.axisIndex=2}aabbQuery(e,t,n){n===void 0&&(n=[]),this.dirty&&=(this.sortList(),!1);let r=this.axisIndex,i=`x`;r===1&&(i=`y`),r===2&&(i=`z`);let a=this.axisList;t.lowerBound[i],t.upperBound[i];for(let e=0;e<a.length;e++){let r=a[e];r.aabbNeedsUpdate&&r.updateAABB(),r.aabb.overlaps(t)&&n.push(r)}return n}},Pu=class{static defaults(e,t){e===void 0&&(e={});for(let n in t)n in e||(e[n]=t[n]);return e}},Fu=class e{constructor(t,n,r){r===void 0&&(r={}),r=Pu.defaults(r,{collideConnected:!0,wakeUpBodies:!0}),this.equations=[],this.bodyA=t,this.bodyB=n,this.id=e.idCounter++,this.collideConnected=r.collideConnected,r.wakeUpBodies&&(t&&t.wakeUp(),n&&n.wakeUp())}update(){throw Error(`method update() not implmemented in this Constraint subclass!`)}enable(){let e=this.equations;for(let t=0;t<e.length;t++)e[t].enabled=!0}disable(){let e=this.equations;for(let t=0;t<e.length;t++)e[t].enabled=!1}};Fu.idCounter=0;var Iu=class{constructor(){this.spatial=new K,this.rotational=new K}multiplyElement(e){return e.spatial.dot(this.spatial)+e.rotational.dot(this.rotational)}multiplyVectors(e,t){return e.dot(this.spatial)+t.dot(this.rotational)}},Lu=class e{constructor(t,n,r,i){r===void 0&&(r=-1e6),i===void 0&&(i=1e6),this.id=e.idCounter++,this.minForce=r,this.maxForce=i,this.bi=t,this.bj=n,this.a=0,this.b=0,this.eps=0,this.jacobianElementA=new Iu,this.jacobianElementB=new Iu,this.enabled=!0,this.multiplier=0,this.setSpookParams(1e7,4,1/60)}setSpookParams(e,t,n){let r=t,i=e,a=n;this.a=4/(a*(1+4*r)),this.b=4*r/(1+4*r),this.eps=4/(a*a*i*(1+4*r))}computeB(e,t,n){let r=this.computeGW(),i=this.computeGq(),a=this.computeGiMf();return-i*e-r*t-a*n}computeGq(){let e=this.jacobianElementA,t=this.jacobianElementB,n=this.bi,r=this.bj,i=n.position,a=r.position;return e.spatial.dot(i)+t.spatial.dot(a)}computeGW(){let e=this.jacobianElementA,t=this.jacobianElementB,n=this.bi,r=this.bj,i=n.velocity,a=r.velocity,o=n.angularVelocity,s=r.angularVelocity;return e.multiplyVectors(i,o)+t.multiplyVectors(a,s)}computeGWlambda(){let e=this.jacobianElementA,t=this.jacobianElementB,n=this.bi,r=this.bj,i=n.vlambda,a=r.vlambda,o=n.wlambda,s=r.wlambda;return e.multiplyVectors(i,o)+t.multiplyVectors(a,s)}computeGiMf(){let e=this.jacobianElementA,t=this.jacobianElementB,n=this.bi,r=this.bj,i=n.force,a=n.torque,o=r.force,s=r.torque,c=n.invMassSolve,l=r.invMassSolve;return i.scale(c,Ru),o.scale(l,zu),n.invInertiaWorldSolve.vmult(a,Bu),r.invInertiaWorldSolve.vmult(s,Vu),e.multiplyVectors(Ru,Bu)+t.multiplyVectors(zu,Vu)}computeGiMGt(){let e=this.jacobianElementA,t=this.jacobianElementB,n=this.bi,r=this.bj,i=n.invMassSolve,a=r.invMassSolve,o=n.invInertiaWorldSolve,s=r.invInertiaWorldSolve,c=i+a;return o.vmult(e.rotational,Hu),c+=Hu.dot(e.rotational),s.vmult(t.rotational,Hu),c+=Hu.dot(t.rotational),c}addToWlambda(e){let t=this.jacobianElementA,n=this.jacobianElementB,r=this.bi,i=this.bj,a=Uu;r.vlambda.addScaledVector(r.invMassSolve*e,t.spatial,r.vlambda),i.vlambda.addScaledVector(i.invMassSolve*e,n.spatial,i.vlambda),r.invInertiaWorldSolve.vmult(t.rotational,a),r.wlambda.addScaledVector(e,a,r.wlambda),i.invInertiaWorldSolve.vmult(n.rotational,a),i.wlambda.addScaledVector(e,a,i.wlambda)}computeC(){return this.computeGiMGt()+this.eps}};Lu.idCounter=0;var Ru=new K,zu=new K,Bu=new K,Vu=new K,Hu=new K,Uu=new K,Wu=class extends Lu{constructor(e,t,n){n===void 0&&(n=1e6),super(e,t,0,n),this.restitution=0,this.ri=new K,this.rj=new K,this.ni=new K}computeB(e){let t=this.a,n=this.b,r=this.bi,i=this.bj,a=this.ri,o=this.rj,s=Gu,c=Ku,l=r.velocity,u=r.angularVelocity;r.force,r.torque;let d=i.velocity,f=i.angularVelocity;i.force,i.torque;let p=qu,m=this.jacobianElementA,h=this.jacobianElementB,g=this.ni;a.cross(g,s),o.cross(g,c),g.negate(m.spatial),s.negate(m.rotational),h.spatial.copy(g),h.rotational.copy(c),p.copy(i.position),p.vadd(o,p),p.vsub(r.position,p),p.vsub(a,p);let _=g.dot(p),v=this.restitution+1,y=v*d.dot(g)-v*l.dot(g)+f.dot(c)-u.dot(s),b=this.computeGiMf();return-_*t-y*n-e*b}getImpactVelocityAlongNormal(){let e=Ju,t=Yu,n=Xu,r=Zu,i=Qu;return this.bi.position.vadd(this.ri,n),this.bj.position.vadd(this.rj,r),this.bi.getVelocityAtWorldPoint(n,e),this.bj.getVelocityAtWorldPoint(r,t),e.vsub(t,i),this.ni.dot(i)}},Gu=new K,Ku=new K,qu=new K,Ju=new K,Yu=new K,Xu=new K,Zu=new K,Qu=new K;new K,new K,new K,new K,new K,new K,new K,new K,new K,new K;var $u=class extends Lu{constructor(e,t,n){super(e,t,-n,n),this.ri=new K,this.rj=new K,this.t=new K}computeB(e){this.a;let t=this.b;this.bi,this.bj;let n=this.ri,r=this.rj,i=ed,a=td,o=this.t;n.cross(o,i),r.cross(o,a);let s=this.jacobianElementA,c=this.jacobianElementB;o.negate(s.spatial),i.negate(s.rotational),c.spatial.copy(o),c.rotational.copy(a);let l=this.computeGW(),u=this.computeGiMf();return-l*t-e*u}},ed=new K,td=new K,nd=class e{constructor(t,n,r){r=Pu.defaults(r,{friction:.3,restitution:.3,contactEquationStiffness:1e7,contactEquationRelaxation:3,frictionEquationStiffness:1e7,frictionEquationRelaxation:3}),this.id=e.idCounter++,this.materials=[t,n],this.friction=r.friction,this.restitution=r.restitution,this.contactEquationStiffness=r.contactEquationStiffness,this.contactEquationRelaxation=r.contactEquationRelaxation,this.frictionEquationStiffness=r.frictionEquationStiffness,this.frictionEquationRelaxation=r.frictionEquationRelaxation}};nd.idCounter=0;var rd=class e{constructor(t){t===void 0&&(t={});let n=``;typeof t==`string`&&(n=t,t={}),this.name=n,this.id=e.idCounter++,this.friction=t.friction===void 0?-1:t.friction,this.restitution=t.restitution===void 0?-1:t.restitution}};rd.idCounter=0,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new ru,new K,new K,new K,new K(1,0,0),new K(0,1,0),new K(0,0,1),new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new K,new ll,new K,new ll,new K,new K,new K,new K,new K,new K,new K,new ll,new K,new J,new ll;var id=class{constructor(){this.equations=[]}solve(e,t){return 0}addEquation(e){e.enabled&&!e.bi.isTrigger&&!e.bj.isTrigger&&this.equations.push(e)}removeEquation(e){let t=this.equations,n=t.indexOf(e);n!==-1&&t.splice(n,1)}removeAllEquations(){this.equations.length=0}},ad=class extends id{constructor(){super(),this.iterations=10,this.tolerance=1e-7}solve(e,t){let n=0,r=this.iterations,i=this.tolerance*this.tolerance,a=this.equations,o=a.length,s=t.bodies,c=s.length,l=e,u,d,f,p,m,h;if(o!==0)for(let e=0;e!==c;e++)s[e].updateSolveMassProperties();let g=sd,_=cd,v=od;g.length=o,_.length=o,v.length=o;for(let e=0;e!==o;e++){let t=a[e];v[e]=0,_[e]=t.computeB(l),g[e]=1/t.computeC()}if(o!==0){for(let e=0;e!==c;e++){let t=s[e],n=t.vlambda,r=t.wlambda;n.set(0,0,0),r.set(0,0,0)}for(n=0;n!==r;n++){p=0;for(let e=0;e!==o;e++){let t=a[e];u=_[e],d=g[e],h=v[e],m=t.computeGWlambda(),f=d*(u-m-t.eps*h),h+f<t.minForce?f=t.minForce-h:h+f>t.maxForce&&(f=t.maxForce-h),v[e]+=f,p+=f>0?f:-f,t.addToWlambda(f)}if(p*p<i)break}for(let e=0;e!==c;e++){let t=s[e],n=t.velocity,r=t.angularVelocity;t.vlambda.vmul(t.linearFactor,t.vlambda),n.vadd(t.vlambda,n),t.wlambda.vmul(t.angularFactor,t.wlambda),r.vadd(t.wlambda,r)}let e=a.length,t=1/l;for(;e--;)a[e].multiplier=v[e]*t}return n}},od=[],sd=[],cd=[];Y.STATIC;var ld=class{constructor(){this.objects=[],this.type=Object}release(){let e=arguments.length;for(let t=0;t!==e;t++)this.objects.push(t<0||arguments.length<=t?void 0:arguments[t]);return this}get(){return this.objects.length===0?this.constructObject():this.objects.pop()}constructObject(){throw Error(`constructObject() not implemented in this Pool subclass yet!`)}resize(e){let t=this.objects;for(;t.length>e;)t.pop();for(;t.length<e;)t.push(this.constructObject());return this}},ud=class extends ld{constructor(){super(...arguments),this.type=K}constructObject(){return new K}},dd={sphereSphere:q.types.SPHERE,spherePlane:q.types.SPHERE|q.types.PLANE,boxBox:q.types.BOX|q.types.BOX,sphereBox:q.types.SPHERE|q.types.BOX,planeBox:q.types.PLANE|q.types.BOX,convexConvex:q.types.CONVEXPOLYHEDRON,sphereConvex:q.types.SPHERE|q.types.CONVEXPOLYHEDRON,planeConvex:q.types.PLANE|q.types.CONVEXPOLYHEDRON,boxConvex:q.types.BOX|q.types.CONVEXPOLYHEDRON,sphereHeightfield:q.types.SPHERE|q.types.HEIGHTFIELD,boxHeightfield:q.types.BOX|q.types.HEIGHTFIELD,convexHeightfield:q.types.CONVEXPOLYHEDRON|q.types.HEIGHTFIELD,sphereParticle:q.types.PARTICLE|q.types.SPHERE,planeParticle:q.types.PLANE|q.types.PARTICLE,boxParticle:q.types.BOX|q.types.PARTICLE,convexParticle:q.types.PARTICLE|q.types.CONVEXPOLYHEDRON,cylinderCylinder:q.types.CYLINDER,sphereCylinder:q.types.SPHERE|q.types.CYLINDER,planeCylinder:q.types.PLANE|q.types.CYLINDER,boxCylinder:q.types.BOX|q.types.CYLINDER,convexCylinder:q.types.CONVEXPOLYHEDRON|q.types.CYLINDER,heightfieldCylinder:q.types.HEIGHTFIELD|q.types.CYLINDER,particleCylinder:q.types.PARTICLE|q.types.CYLINDER,sphereTrimesh:q.types.SPHERE|q.types.TRIMESH,planeTrimesh:q.types.PLANE|q.types.TRIMESH},fd=class{get[dd.sphereSphere](){return this.sphereSphere}get[dd.spherePlane](){return this.spherePlane}get[dd.boxBox](){return this.boxBox}get[dd.sphereBox](){return this.sphereBox}get[dd.planeBox](){return this.planeBox}get[dd.convexConvex](){return this.convexConvex}get[dd.sphereConvex](){return this.sphereConvex}get[dd.planeConvex](){return this.planeConvex}get[dd.boxConvex](){return this.boxConvex}get[dd.sphereHeightfield](){return this.sphereHeightfield}get[dd.boxHeightfield](){return this.boxHeightfield}get[dd.convexHeightfield](){return this.convexHeightfield}get[dd.sphereParticle](){return this.sphereParticle}get[dd.planeParticle](){return this.planeParticle}get[dd.boxParticle](){return this.boxParticle}get[dd.convexParticle](){return this.convexParticle}get[dd.cylinderCylinder](){return this.convexConvex}get[dd.sphereCylinder](){return this.sphereConvex}get[dd.planeCylinder](){return this.planeConvex}get[dd.boxCylinder](){return this.boxConvex}get[dd.convexCylinder](){return this.convexConvex}get[dd.heightfieldCylinder](){return this.heightfieldCylinder}get[dd.particleCylinder](){return this.particleCylinder}get[dd.sphereTrimesh](){return this.sphereTrimesh}get[dd.planeTrimesh](){return this.planeTrimesh}constructor(e){this.contactPointPool=[],this.frictionEquationPool=[],this.result=[],this.frictionResult=[],this.v3pool=new ud,this.world=e,this.currentContactMaterial=e.defaultContactMaterial,this.enableFrictionReduction=!1}createContactEquation(e,t,n,r,i,a){let o;this.contactPointPool.length?(o=this.contactPointPool.pop(),o.bi=e,o.bj=t):o=new Wu(e,t),o.enabled=e.collisionResponse&&t.collisionResponse&&n.collisionResponse&&r.collisionResponse;let s=this.currentContactMaterial;o.restitution=s.restitution,o.setSpookParams(s.contactEquationStiffness,s.contactEquationRelaxation,this.world.dt);let c=n.material||e.material,l=r.material||t.material;return c&&l&&c.restitution>=0&&l.restitution>=0&&(o.restitution=c.restitution*l.restitution),o.si=i||n,o.sj=a||r,o}createFrictionEquationsFromContact(e,t){let n=e.bi,r=e.bj,i=e.si,a=e.sj,o=this.world,s=this.currentContactMaterial,c=s.friction,l=i.material||n.material,u=a.material||r.material;if(l&&u&&l.friction>=0&&u.friction>=0&&(c=l.friction*u.friction),c>0){let i=c*(o.frictionGravity||o.gravity).length(),a=n.invMass+r.invMass;a>0&&(a=1/a);let l=this.frictionEquationPool,u=l.length?l.pop():new $u(n,r,i*a),d=l.length?l.pop():new $u(n,r,i*a);return u.bi=d.bi=n,u.bj=d.bj=r,u.minForce=d.minForce=-i*a,u.maxForce=d.maxForce=i*a,u.ri.copy(e.ri),u.rj.copy(e.rj),d.ri.copy(e.ri),d.rj.copy(e.rj),e.ni.tangents(u.t,d.t),u.setSpookParams(s.frictionEquationStiffness,s.frictionEquationRelaxation,o.dt),d.setSpookParams(s.frictionEquationStiffness,s.frictionEquationRelaxation,o.dt),u.enabled=d.enabled=e.enabled,t.push(u,d),!0}return!1}createFrictionFromAverage(e){let t=this.result[this.result.length-1];if(!this.createFrictionEquationsFromContact(t,this.frictionResult)||e===1)return;let n=this.frictionResult[this.frictionResult.length-2],r=this.frictionResult[this.frictionResult.length-1];pd.setZero(),md.setZero(),hd.setZero();let i=t.bi;t.bj;for(let n=0;n!==e;n++)t=this.result[this.result.length-1-n],t.bi===i?(pd.vsub(t.ni,pd),md.vadd(t.rj,md),hd.vadd(t.ri,hd)):(pd.vadd(t.ni,pd),md.vadd(t.ri,md),hd.vadd(t.rj,hd));let a=1/e;md.scale(a,n.ri),hd.scale(a,n.rj),r.ri.copy(n.ri),r.rj.copy(n.rj),pd.normalize(),pd.tangents(n.t,r.t)}getContacts(e,t,n,r,i,a,o){this.contactPointPool=i,this.frictionEquationPool=o,this.result=r,this.frictionResult=a;let s=vd,c=yd,l=gd,u=_d;for(let r=0,i=e.length;r!==i;r++){let i=e[r],a=t[r],o=null;i.material&&a.material&&(o=n.getContactMaterial(i.material,a.material)||null);let d=i.type&Y.KINEMATIC&&a.type&Y.STATIC||i.type&Y.STATIC&&a.type&Y.KINEMATIC||i.type&Y.KINEMATIC&&a.type&Y.KINEMATIC;for(let e=0;e<i.shapes.length;e++){i.quaternion.mult(i.shapeOrientations[e],s),i.quaternion.vmult(i.shapeOffsets[e],l),l.vadd(i.position,l);let t=i.shapes[e];for(let e=0;e<a.shapes.length;e++){a.quaternion.mult(a.shapeOrientations[e],c),a.quaternion.vmult(a.shapeOffsets[e],u),u.vadd(a.position,u);let r=a.shapes[e];if(!(t.collisionFilterMask&r.collisionFilterGroup&&r.collisionFilterMask&t.collisionFilterGroup)||l.distanceTo(u)>t.boundingSphereRadius+r.boundingSphereRadius)continue;let f=null;t.material&&r.material&&(f=n.getContactMaterial(t.material,r.material)||null),this.currentContactMaterial=f||o||n.defaultContactMaterial;let p=t.type|r.type,m=this[p];if(m){let e=!1;e=t.type<r.type?m.call(this,t,r,l,u,s,c,i,a,t,r,d):m.call(this,r,t,u,l,c,s,a,i,t,r,d),e&&d&&(n.shapeOverlapKeeper.set(t.id,r.id),n.bodyOverlapKeeper.set(i.id,a.id))}}}}}sphereSphere(e,t,n,r,i,a,o,s,c,l,u){if(u)return n.distanceSquared(r)<(e.radius+t.radius)**2;let d=this.createContactEquation(o,s,e,t,c,l);r.vsub(n,d.ni),d.ni.normalize(),d.ri.copy(d.ni),d.rj.copy(d.ni),d.ri.scale(e.radius,d.ri),d.rj.scale(-t.radius,d.rj),d.ri.vadd(n,d.ri),d.ri.vsub(o.position,d.ri),d.rj.vadd(r,d.rj),d.rj.vsub(s.position,d.rj),this.result.push(d),this.createFrictionEquationsFromContact(d,this.frictionResult)}spherePlane(e,t,n,r,i,a,o,s,c,l,u){let d=this.createContactEquation(o,s,e,t,c,l);if(d.ni.set(0,0,1),a.vmult(d.ni,d.ni),d.ni.negate(d.ni),d.ni.normalize(),d.ni.scale(e.radius,d.ri),n.vsub(r,Rd),d.ni.scale(d.ni.dot(Rd),zd),Rd.vsub(zd,d.rj),-Rd.dot(d.ni)<=e.radius){if(u)return!0;let e=d.ri,t=d.rj;e.vadd(n,e),e.vsub(o.position,e),t.vadd(r,t),t.vsub(s.position,t),this.result.push(d),this.createFrictionEquationsFromContact(d,this.frictionResult)}}boxBox(e,t,n,r,i,a,o,s,c,l,u){return e.convexPolyhedronRepresentation.material=e.material,t.convexPolyhedronRepresentation.material=t.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexConvex(e.convexPolyhedronRepresentation,t.convexPolyhedronRepresentation,n,r,i,a,o,s,e,t,u)}sphereBox(e,t,n,r,i,a,o,s,c,l,u){let d=this.v3pool,f=Jd;n.vsub(r,Wd),t.getSideNormals(f,a);let p=e.radius,m=!1,h=Xd,g=Zd,_=Qd,v=null,y=0,b=0,x=0,S=null;for(let e=0,t=f.length;e!==t&&m===!1;e++){let t=Gd;t.copy(f[e]);let n=t.length();t.normalize();let r=Wd.dot(t);if(r<n+p&&r>0){let i=Kd,a=qd;i.copy(f[(e+1)%3]),a.copy(f[(e+2)%3]);let o=i.length(),s=a.length();i.normalize(),a.normalize();let c=Wd.dot(i),l=Wd.dot(a);if(c<o&&c>-o&&l<s&&l>-s){let e=Math.abs(r-n-p);if((S===null||e<S)&&(S=e,b=c,x=l,v=n,h.copy(t),g.copy(i),_.copy(a),y++,u))return!0}}}if(y){m=!0;let i=this.createContactEquation(o,s,e,t,c,l);h.scale(-p,i.ri),i.ni.copy(h),i.ni.negate(i.ni),h.scale(v,h),g.scale(b,g),h.vadd(g,h),_.scale(x,_),h.vadd(_,i.rj),i.ri.vadd(n,i.ri),i.ri.vsub(o.position,i.ri),i.rj.vadd(r,i.rj),i.rj.vsub(s.position,i.rj),this.result.push(i),this.createFrictionEquationsFromContact(i,this.frictionResult)}let C=d.get(),w=Yd;for(let i=0;i!==2&&!m;i++)for(let a=0;a!==2&&!m;a++)for(let d=0;d!==2&&!m;d++)if(C.set(0,0,0),i?C.vadd(f[0],C):C.vsub(f[0],C),a?C.vadd(f[1],C):C.vsub(f[1],C),d?C.vadd(f[2],C):C.vsub(f[2],C),r.vadd(C,w),w.vsub(n,w),w.lengthSquared()<p*p){if(u)return!0;m=!0;let i=this.createContactEquation(o,s,e,t,c,l);i.ri.copy(w),i.ri.normalize(),i.ni.copy(i.ri),i.ri.scale(p,i.ri),i.rj.copy(C),i.ri.vadd(n,i.ri),i.ri.vsub(o.position,i.ri),i.rj.vadd(r,i.rj),i.rj.vsub(s.position,i.rj),this.result.push(i),this.createFrictionEquationsFromContact(i,this.frictionResult)}d.release(C),C=null;let T=d.get(),E=d.get(),D=d.get(),O=d.get(),k=d.get(),A=f.length;for(let i=0;i!==A&&!m;i++)for(let a=0;a!==A&&!m;a++)if(i%3!=a%3){f[a].cross(f[i],T),T.normalize(),f[i].vadd(f[a],E),D.copy(n),D.vsub(E,D),D.vsub(r,D);let d=D.dot(T);T.scale(d,O);let h=0;for(;h===i%3||h===a%3;)h++;k.copy(n),k.vsub(O,k),k.vsub(E,k),k.vsub(r,k);let g=Math.abs(d),_=k.length();if(g<f[h].length()&&_<p){if(u)return!0;m=!0;let i=this.createContactEquation(o,s,e,t,c,l);E.vadd(O,i.rj),i.rj.copy(i.rj),k.negate(i.ni),i.ni.normalize(),i.ri.copy(i.rj),i.ri.vadd(r,i.ri),i.ri.vsub(n,i.ri),i.ri.normalize(),i.ri.scale(p,i.ri),i.ri.vadd(n,i.ri),i.ri.vsub(o.position,i.ri),i.rj.vadd(r,i.rj),i.rj.vsub(s.position,i.rj),this.result.push(i),this.createFrictionEquationsFromContact(i,this.frictionResult)}}d.release(T,E,D,O,k)}planeBox(e,t,n,r,i,a,o,s,c,l,u){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,t.convexPolyhedronRepresentation.id=t.id,this.planeConvex(e,t.convexPolyhedronRepresentation,n,r,i,a,o,s,e,t,u)}convexConvex(e,t,n,r,i,a,o,s,c,l,u,d,f){let p=mf;if(!(n.distanceTo(r)>e.boundingSphereRadius+t.boundingSphereRadius)&&e.findSeparatingAxis(t,n,i,r,a,p,d,f)){let d=[],f=hf;e.clipAgainstHull(n,i,t,r,a,p,-100,100,d);let m=0;for(let i=0;i!==d.length;i++){if(u)return!0;let a=this.createContactEquation(o,s,e,t,c,l),h=a.ri,g=a.rj;p.negate(a.ni),d[i].normal.negate(f),f.scale(d[i].depth,f),d[i].point.vadd(f,h),g.copy(d[i].point),h.vsub(n,h),g.vsub(r,g),h.vadd(n,h),h.vsub(o.position,h),g.vadd(r,g),g.vsub(s.position,g),this.result.push(a),m++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(a,this.frictionResult)}this.enableFrictionReduction&&m&&this.createFrictionFromAverage(m)}}sphereConvex(e,t,n,r,i,a,o,s,c,l,u){let d=this.v3pool;n.vsub(r,$d);let f=t.faceNormals,p=t.faces,m=t.vertices,h=e.radius,g=!1;for(let i=0;i!==m.length;i++){let d=m[i],f=rf;a.vmult(d,f),r.vadd(f,f);let p=nf;if(f.vsub(n,p),p.lengthSquared()<h*h){if(u)return!0;g=!0;let i=this.createContactEquation(o,s,e,t,c,l);i.ri.copy(p),i.ri.normalize(),i.ni.copy(i.ri),i.ri.scale(h,i.ri),f.vsub(r,i.rj),i.ri.vadd(n,i.ri),i.ri.vsub(o.position,i.ri),i.rj.vadd(r,i.rj),i.rj.vsub(s.position,i.rj),this.result.push(i),this.createFrictionEquationsFromContact(i,this.frictionResult);return}}for(let i=0,_=p.length;i!==_&&g===!1;i++){let _=f[i],v=p[i],y=af;a.vmult(_,y);let b=of;a.vmult(m[v[0]],b),b.vadd(r,b);let x=sf;y.scale(-h,x),n.vadd(x,x);let S=cf;x.vsub(b,S);let C=S.dot(y),w=lf;if(n.vsub(b,w),C<0&&w.dot(y)>0){let i=[];for(let e=0,t=v.length;e!==t;e++){let t=d.get();a.vmult(m[v[e]],t),r.vadd(t,t),i.push(t)}if(Ud(i,y,n)){if(u)return!0;g=!0;let a=this.createContactEquation(o,s,e,t,c,l);y.scale(-h,a.ri),y.negate(a.ni);let f=d.get();y.scale(-C,f);let p=d.get();y.scale(-h,p),n.vsub(r,a.rj),a.rj.vadd(p,a.rj),a.rj.vadd(f,a.rj),a.rj.vadd(r,a.rj),a.rj.vsub(s.position,a.rj),a.ri.vadd(n,a.ri),a.ri.vsub(o.position,a.ri),d.release(f),d.release(p),this.result.push(a),this.createFrictionEquationsFromContact(a,this.frictionResult);for(let e=0,t=i.length;e!==t;e++)d.release(i[e]);return}else for(let f=0;f!==v.length;f++){let p=d.get(),g=d.get();a.vmult(m[v[(f+1)%v.length]],p),a.vmult(m[v[(f+2)%v.length]],g),r.vadd(p,p),r.vadd(g,g);let _=ef;g.vsub(p,_);let y=tf;_.unit(y);let b=d.get(),x=d.get();n.vsub(p,x);let S=x.dot(y);y.scale(S,b),b.vadd(p,b);let C=d.get();if(b.vsub(n,C),S>0&&S*S<_.lengthSquared()&&C.lengthSquared()<h*h){if(u)return!0;let a=this.createContactEquation(o,s,e,t,c,l);b.vsub(r,a.rj),b.vsub(n,a.ni),a.ni.normalize(),a.ni.scale(h,a.ri),a.rj.vadd(r,a.rj),a.rj.vsub(s.position,a.rj),a.ri.vadd(n,a.ri),a.ri.vsub(o.position,a.ri),this.result.push(a),this.createFrictionEquationsFromContact(a,this.frictionResult);for(let e=0,t=i.length;e!==t;e++)d.release(i[e]);d.release(p),d.release(g),d.release(b),d.release(C),d.release(x);return}d.release(p),d.release(g),d.release(b),d.release(C),d.release(x)}for(let e=0,t=i.length;e!==t;e++)d.release(i[e])}}}planeConvex(e,t,n,r,i,a,o,s,c,l,u){let d=uf,f=df;f.set(0,0,1),i.vmult(f,f);let p=0,m=ff;for(let i=0;i!==t.vertices.length;i++)if(d.copy(t.vertices[i]),a.vmult(d,d),r.vadd(d,d),d.vsub(n,m),f.dot(m)<=0){if(u)return!0;let i=this.createContactEquation(o,s,e,t,c,l),a=pf;f.scale(f.dot(m),a),d.vsub(a,a),a.vsub(n,i.ri),i.ni.copy(f),d.vsub(r,i.rj),i.ri.vadd(n,i.ri),i.ri.vsub(o.position,i.ri),i.rj.vadd(r,i.rj),i.rj.vsub(s.position,i.rj),this.result.push(i),p++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(i,this.frictionResult)}this.enableFrictionReduction&&p&&this.createFrictionFromAverage(p)}boxConvex(e,t,n,r,i,a,o,s,c,l,u){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexConvex(e.convexPolyhedronRepresentation,t,n,r,i,a,o,s,e,t,u)}sphereHeightfield(e,t,n,r,i,a,o,s,c,l,u){let d=t.data,f=e.radius,p=t.elementSize,m=kf,h=Of;J.pointToLocalFrame(r,a,n,h);let g=Math.floor((h.x-f)/p)-1,_=Math.ceil((h.x+f)/p)+1,v=Math.floor((h.y-f)/p)-1,y=Math.ceil((h.y+f)/p)+1;if(_<0||y<0||g>d.length||v>d[0].length)return;g<0&&(g=0),_<0&&(_=0),v<0&&(v=0),y<0&&(y=0),g>=d.length&&(g=d.length-1),_>=d.length&&(_=d.length-1),y>=d[0].length&&(y=d[0].length-1),v>=d[0].length&&(v=d[0].length-1);let b=[];t.getRectMinMax(g,v,_,y,b);let x=b[0],S=b[1];if(h.z-f>S||h.z+f<x)return;let C=this.result;for(let c=g;c<_;c++)for(let l=v;l<y;l++){let d=C.length,f=!1;if(t.getConvexTrianglePillar(c,l,!1),J.pointToWorldFrame(r,a,t.pillarOffset,m),n.distanceTo(m)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(f=this.sphereConvex(e,t.pillarConvex,n,m,i,a,o,s,e,t,u)),u&&f||(t.getConvexTrianglePillar(c,l,!0),J.pointToWorldFrame(r,a,t.pillarOffset,m),n.distanceTo(m)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(f=this.sphereConvex(e,t.pillarConvex,n,m,i,a,o,s,e,t,u)),u&&f))return!0;if(C.length-d>2)return}}boxHeightfield(e,t,n,r,i,a,o,s,c,l,u){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexHeightfield(e.convexPolyhedronRepresentation,t,n,r,i,a,o,s,e,t,u)}convexHeightfield(e,t,n,r,i,a,o,s,c,l,u){let d=t.data,f=t.elementSize,p=e.boundingSphereRadius,m=Ef,h=Df,g=Tf;J.pointToLocalFrame(r,a,n,g);let _=Math.floor((g.x-p)/f)-1,v=Math.ceil((g.x+p)/f)+1,y=Math.floor((g.y-p)/f)-1,b=Math.ceil((g.y+p)/f)+1;if(v<0||b<0||_>d.length||y>d[0].length)return;_<0&&(_=0),v<0&&(v=0),y<0&&(y=0),b<0&&(b=0),_>=d.length&&(_=d.length-1),v>=d.length&&(v=d.length-1),b>=d[0].length&&(b=d[0].length-1),y>=d[0].length&&(y=d[0].length-1);let x=[];t.getRectMinMax(_,y,v,b,x);let S=x[0],C=x[1];if(!(g.z-p>C||g.z+p<S))for(let c=_;c<v;c++)for(let l=y;l<b;l++){let d=!1;if(t.getConvexTrianglePillar(c,l,!1),J.pointToWorldFrame(r,a,t.pillarOffset,m),n.distanceTo(m)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(d=this.convexConvex(e,t.pillarConvex,n,m,i,a,o,s,null,null,u,h,null)),u&&d||(t.getConvexTrianglePillar(c,l,!0),J.pointToWorldFrame(r,a,t.pillarOffset,m),n.distanceTo(m)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(d=this.convexConvex(e,t.pillarConvex,n,m,i,a,o,s,null,null,u,h,null)),u&&d))return!0}}sphereParticle(e,t,n,r,i,a,o,s,c,l,u){let d=yf;if(d.set(0,0,1),r.vsub(n,d),d.lengthSquared()<=e.radius*e.radius){if(u)return!0;let n=this.createContactEquation(s,o,t,e,c,l);d.normalize(),n.rj.copy(d),n.rj.scale(e.radius,n.rj),n.ni.copy(d),n.ni.negate(n.ni),n.ri.set(0,0,0),this.result.push(n),this.createFrictionEquationsFromContact(n,this.frictionResult)}}planeParticle(e,t,n,r,i,a,o,s,c,l,u){let d=gf;d.set(0,0,1),o.quaternion.vmult(d,d);let f=_f;if(r.vsub(o.position,f),d.dot(f)<=0){if(u)return!0;let n=this.createContactEquation(s,o,t,e,c,l);n.ni.copy(d),n.ni.negate(n.ni),n.ri.set(0,0,0);let i=vf;d.scale(d.dot(r),i),r.vsub(i,i),n.rj.copy(i),this.result.push(n),this.createFrictionEquationsFromContact(n,this.frictionResult)}}boxParticle(e,t,n,r,i,a,o,s,c,l,u){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexParticle(e.convexPolyhedronRepresentation,t,n,r,i,a,o,s,e,t,u)}convexParticle(e,t,n,r,i,a,o,s,c,l,u){let d=-1,f=Sf,p=wf,m=null,h=xf;if(h.copy(r),h.vsub(n,h),i.conjugate(bf),bf.vmult(h,h),e.pointIsInside(h)){e.worldVerticesNeedsUpdate&&e.computeWorldVertices(n,i),e.worldFaceNormalsNeedsUpdate&&e.computeWorldFaceNormals(i);for(let t=0,n=e.faces.length;t!==n;t++){let n=[e.worldVertices[e.faces[t][0]]],i=e.worldFaceNormals[t];r.vsub(n[0],Cf);let a=-i.dot(Cf);if(m===null||Math.abs(a)<Math.abs(m)){if(u)return!0;m=a,d=t,f.copy(i)}}if(d!==-1){let i=this.createContactEquation(s,o,t,e,c,l);f.scale(m,p),p.vadd(r,p),p.vsub(n,p),i.rj.copy(p),f.negate(i.ni),i.ri.set(0,0,0);let a=i.ri,u=i.rj;a.vadd(r,a),a.vsub(s.position,a),u.vadd(n,u),u.vsub(o.position,u),this.result.push(i),this.createFrictionEquationsFromContact(i,this.frictionResult)}else console.warn(`Point found inside convex, but did not find penetrating face!`)}}heightfieldCylinder(e,t,n,r,i,a,o,s,c,l,u){return this.convexHeightfield(t,e,r,n,a,i,s,o,c,l,u)}particleCylinder(e,t,n,r,i,a,o,s,c,l,u){return this.convexParticle(t,e,r,n,a,i,s,o,c,l,u)}sphereTrimesh(e,t,n,r,i,a,o,s,c,l,u){let d=Dd,f=Od,p=kd,m=Ad,h=jd,g=Md,_=Id,v=Ed,y=wd,b=Ld;J.pointToLocalFrame(r,a,n,h);let x=e.radius;_.lowerBound.set(h.x-x,h.y-x,h.z-x),_.upperBound.set(h.x+x,h.y+x,h.z+x),t.getTrianglesInAABB(_,b);let S=Td,C=e.radius*e.radius;for(let i=0;i<b.length;i++)for(let d=0;d<3;d++)if(t.getVertex(t.indices[b[i]*3+d],S),S.vsub(h,y),y.lengthSquared()<=C){if(v.copy(S),J.pointToWorldFrame(r,a,v,S),S.vsub(n,y),u)return!0;let i=this.createContactEquation(o,s,e,t,c,l);i.ni.copy(y),i.ni.normalize(),i.ri.copy(i.ni),i.ri.scale(e.radius,i.ri),i.ri.vadd(n,i.ri),i.ri.vsub(o.position,i.ri),i.rj.copy(S),i.rj.vsub(s.position,i.rj),this.result.push(i),this.createFrictionEquationsFromContact(i,this.frictionResult)}for(let i=0;i<b.length;i++)for(let _=0;_<3;_++){t.getVertex(t.indices[b[i]*3+_],d),t.getVertex(t.indices[b[i]*3+(_+1)%3],f),f.vsub(d,p),h.vsub(f,g);let v=g.dot(p);h.vsub(d,g);let y=g.dot(p);if(y>0&&v<0&&(h.vsub(d,g),m.copy(p),m.normalize(),y=g.dot(m),m.scale(y,g),g.vadd(d,g),g.distanceTo(h)<e.radius)){if(u)return!0;let i=this.createContactEquation(o,s,e,t,c,l);g.vsub(h,i.ni),i.ni.normalize(),i.ni.scale(e.radius,i.ri),i.ri.vadd(n,i.ri),i.ri.vsub(o.position,i.ri),J.pointToWorldFrame(r,a,g,g),g.vsub(s.position,i.rj),J.vectorToWorldFrame(a,i.ni,i.ni),J.vectorToWorldFrame(a,i.ri,i.ri),this.result.push(i),this.createFrictionEquationsFromContact(i,this.frictionResult)}}let w=Nd,T=Pd,E=Fd,D=Cd;for(let i=0,d=b.length;i!==d;i++){t.getTriangleVertices(b[i],w,T,E),t.getNormal(b[i],D),h.vsub(w,g);let d=g.dot(D);if(D.scale(d,g),h.vsub(g,g),d=g.distanceTo(h),ru.pointInTriangle(g,w,T,E)&&d<e.radius){if(u)return!0;let i=this.createContactEquation(o,s,e,t,c,l);g.vsub(h,i.ni),i.ni.normalize(),i.ni.scale(e.radius,i.ri),i.ri.vadd(n,i.ri),i.ri.vsub(o.position,i.ri),J.pointToWorldFrame(r,a,g,g),g.vsub(s.position,i.rj),J.vectorToWorldFrame(a,i.ni,i.ni),J.vectorToWorldFrame(a,i.ri,i.ri),this.result.push(i),this.createFrictionEquationsFromContact(i,this.frictionResult)}}b.length=0}planeTrimesh(e,t,n,r,i,a,o,s,c,l,u){let d=new K,f=bd;f.set(0,0,1),i.vmult(f,f);for(let i=0;i<t.vertices.length/3;i++){t.getVertex(i,d);let p=new K;p.copy(d),J.pointToWorldFrame(r,a,p,d);let m=xd;if(d.vsub(n,m),f.dot(m)<=0){if(u)return!0;let n=this.createContactEquation(o,s,e,t,c,l);n.ni.copy(f);let r=Sd;f.scale(m.dot(f),r),d.vsub(r,r),n.ri.copy(r),n.ri.vsub(o.position,n.ri),n.rj.copy(d),n.rj.vsub(s.position,n.rj),this.result.push(n),this.createFrictionEquationsFromContact(n,this.frictionResult)}}}},pd=new K,md=new K,hd=new K,gd=new K,_d=new K,vd=new ml,yd=new ml,bd=new K,xd=new K,Sd=new K,Cd=new K,wd=new K;new K;var Td=new K,Ed=new K,Dd=new K,Od=new K,kd=new K,Ad=new K,jd=new K,Md=new K,Nd=new K,Pd=new K,Fd=new K,Id=new ll,Ld=[],Rd=new K,zd=new K,Bd=new K,Vd=new K,Hd=new K;function Ud(e,t,n){let r=null,i=e.length;for(let a=0;a!==i;a++){let o=e[a],s=Bd;e[(a+1)%i].vsub(o,s);let c=Vd;s.cross(t,c);let l=Hd;n.vsub(o,l);let u=c.dot(l);if(r===null||u>0&&r===!0||u<=0&&r===!1){r===null&&(r=u>0);continue}else return!1}return!0}var Wd=new K,Gd=new K,Kd=new K,qd=new K,Jd=[new K,new K,new K,new K,new K,new K],Yd=new K,Xd=new K,Zd=new K,Qd=new K,$d=new K,ef=new K,tf=new K,nf=new K,rf=new K,af=new K,of=new K,sf=new K,cf=new K,lf=new K;new K,new K;var uf=new K,df=new K,ff=new K,pf=new K,mf=new K,hf=new K,gf=new K,_f=new K,vf=new K,yf=new K,bf=new ml,xf=new K;new K;var Sf=new K,Cf=new K,wf=new K,Tf=new K,Ef=new K,Df=[0],Of=new K,kf=new K,Af=class{constructor(){this.current=[],this.previous=[]}getKey(e,t){if(t<e){let n=t;t=e,e=n}return e<<16|t}set(e,t){let n=this.getKey(e,t),r=this.current,i=0;for(;n>r[i];)i++;if(n!==r[i]){for(let e=r.length-1;e>=i;e--)r[e+1]=r[e];r[i]=n}}tick(){let e=this.current;this.current=this.previous,this.previous=e,this.current.length=0}getDiff(e,t){let n=this.current,r=this.previous,i=n.length,a=r.length,o=0;for(let t=0;t<i;t++){let i=!1,a=n[t];for(;a>r[o];)o++;i=a===r[o],i||jf(e,a)}o=0;for(let e=0;e<a;e++){let i=!1,a=r[e];for(;a>n[o];)o++;i=n[o]===a,i||jf(t,a)}}};function jf(e,t){e.push((t&4294901760)>>16,t&65535)}var Mf=(e,t)=>e<t?`${e}-${t}`:`${t}-${e}`,Nf=class{constructor(){this.data={keys:[]}}get(e,t){let n=Mf(e,t);return this.data[n]}set(e,t,n){let r=Mf(e,t);this.get(e,t)||this.data.keys.push(r),this.data[r]=n}delete(e,t){let n=Mf(e,t),r=this.data.keys.indexOf(n);r!==-1&&this.data.keys.splice(r,1),delete this.data[n]}reset(){let e=this.data,t=e.keys;for(;t.length>0;){let n=t.pop();delete e[n]}}},Pf=class extends pl{constructor(e){e===void 0&&(e={}),super(),this.dt=-1,this.allowSleep=!!e.allowSleep,this.contacts=[],this.frictionEquations=[],this.quatNormalizeSkip=e.quatNormalizeSkip===void 0?0:e.quatNormalizeSkip,this.quatNormalizeFast=e.quatNormalizeFast===void 0?!1:e.quatNormalizeFast,this.time=0,this.stepnumber=0,this.default_dt=1/60,this.nextId=0,this.gravity=new K,e.gravity&&this.gravity.copy(e.gravity),e.frictionGravity&&(this.frictionGravity=new K,this.frictionGravity.copy(e.frictionGravity)),this.broadphase=e.broadphase===void 0?new ql:e.broadphase,this.bodies=[],this.hasActiveBodies=!1,this.solver=e.solver===void 0?new ad:e.solver,this.constraints=[],this.narrowphase=new fd(this),this.collisionMatrix=new fl,this.collisionMatrixPrevious=new fl,this.bodyOverlapKeeper=new Af,this.shapeOverlapKeeper=new Af,this.contactmaterials=[],this.contactMaterialTable=new Nf,this.defaultMaterial=new rd(`default`),this.defaultContactMaterial=new nd(this.defaultMaterial,this.defaultMaterial,{friction:.3,restitution:0}),this.doProfiling=!1,this.profile={solve:0,makeContactConstraints:0,broadphase:0,integrate:0,narrowphase:0},this.accumulator=0,this.subsystems=[],this.addBodyEvent={type:`addBody`,body:null},this.removeBodyEvent={type:`removeBody`,body:null},this.idToBodyMap={},this.broadphase.setWorld(this)}getContactMaterial(e,t){return this.contactMaterialTable.get(e.id,t.id)}collisionMatrixTick(){let e=this.collisionMatrixPrevious;this.collisionMatrixPrevious=this.collisionMatrix,this.collisionMatrix=e,this.collisionMatrix.reset(),this.bodyOverlapKeeper.tick(),this.shapeOverlapKeeper.tick()}addConstraint(e){this.constraints.push(e)}removeConstraint(e){let t=this.constraints.indexOf(e);t!==-1&&this.constraints.splice(t,1)}rayTest(e,t,n){n instanceof Jl?this.raycastClosest(e,t,{skipBackfaces:!0},n):this.raycastAll(e,t,{skipBackfaces:!0},n)}raycastAll(e,t,n,r){return n===void 0&&(n={}),n.mode=ru.ALL,n.from=e,n.to=t,n.callback=r,Ff.intersectWorld(this,n)}raycastAny(e,t,n,r){return n===void 0&&(n={}),n.mode=ru.ANY,n.from=e,n.to=t,n.result=r,Ff.intersectWorld(this,n)}raycastClosest(e,t,n,r){return n===void 0&&(n={}),n.mode=ru.CLOSEST,n.from=e,n.to=t,n.result=r,Ff.intersectWorld(this,n)}addBody(e){this.bodies.includes(e)||(e.index=this.bodies.length,this.bodies.push(e),e.world=this,e.initPosition.copy(e.position),e.initVelocity.copy(e.velocity),e.timeLastSleepy=this.time,e instanceof Y&&(e.initAngularVelocity.copy(e.angularVelocity),e.initQuaternion.copy(e.quaternion)),this.collisionMatrix.setNumObjects(this.bodies.length),this.addBodyEvent.body=e,this.idToBodyMap[e.id]=e,this.dispatchEvent(this.addBodyEvent))}removeBody(e){e.world=null;let t=this.bodies.length-1,n=this.bodies,r=n.indexOf(e);if(r!==-1){n.splice(r,1);for(let e=0;e!==n.length;e++)n[e].index=e;this.collisionMatrix.setNumObjects(t),this.removeBodyEvent.body=e,delete this.idToBodyMap[e.id],this.dispatchEvent(this.removeBodyEvent)}}getBodyById(e){return this.idToBodyMap[e]}getShapeById(e){let t=this.bodies;for(let n=0;n<t.length;n++){let r=t[n].shapes;for(let t=0;t<r.length;t++){let n=r[t];if(n.id===e)return n}}return null}addContactMaterial(e){this.contactmaterials.push(e),this.contactMaterialTable.set(e.materials[0].id,e.materials[1].id,e)}removeContactMaterial(e){let t=this.contactmaterials.indexOf(e);t!==-1&&(this.contactmaterials.splice(t,1),this.contactMaterialTable.delete(e.materials[0].id,e.materials[1].id))}fixedStep(e,t){e===void 0&&(e=1/60),t===void 0&&(t=10);let n=If.now()/1e3;if(!this.lastCallTime)this.step(e,void 0,t);else{let r=n-this.lastCallTime;this.step(e,r,t)}this.lastCallTime=n}step(e,t,n){if(n===void 0&&(n=10),t===void 0)this.internalStep(e),this.time+=e;else{this.accumulator+=t;let r=If.now(),i=0;for(;this.accumulator>=e&&i<n&&(this.internalStep(e),this.accumulator-=e,i++,!(If.now()-r>e*1e3)););this.accumulator%=e;let a=this.accumulator/e;for(let e=0;e!==this.bodies.length;e++){let t=this.bodies[e];t.previousPosition.lerp(t.position,a,t.interpolatedPosition),t.previousQuaternion.slerp(t.quaternion,a,t.interpolatedQuaternion),t.previousQuaternion.normalize()}this.time+=t}}internalStep(e){this.dt=e;let t=this.contacts,n=Hf,r=Uf,i=this.bodies.length,a=this.bodies,o=this.solver,s=this.gravity,c=this.doProfiling,l=this.profile,u=Y.DYNAMIC,d=-1/0,f=this.constraints,p=Vf;s.length();let m=s.x,h=s.y,g=s.z,_=0;for(c&&(d=If.now()),_=0;_!==i;_++){let e=a[_];if(e.type===u){let t=e.force,n=e.mass;t.x+=n*m,t.y+=n*h,t.z+=n*g}}for(let e=0,t=this.subsystems.length;e!==t;e++)this.subsystems[e].update();c&&(d=If.now()),n.length=0,r.length=0,this.broadphase.collisionPairs(this,n,r),c&&(l.broadphase=If.now()-d);let v=f.length;for(_=0;_!==v;_++){let e=f[_];if(!e.collideConnected)for(let t=n.length-1;t>=0;--t)(e.bodyA===n[t]&&e.bodyB===r[t]||e.bodyB===n[t]&&e.bodyA===r[t])&&(n.splice(t,1),r.splice(t,1))}this.collisionMatrixTick(),c&&(d=If.now());let y=Bf,b=t.length;for(_=0;_!==b;_++)y.push(t[_]);t.length=0;let x=this.frictionEquations.length;for(_=0;_!==x;_++)p.push(this.frictionEquations[_]);for(this.frictionEquations.length=0,this.narrowphase.getContacts(n,r,this,t,y,this.frictionEquations,p),c&&(l.narrowphase=If.now()-d),c&&(d=If.now()),_=0;_<this.frictionEquations.length;_++)o.addEquation(this.frictionEquations[_]);let S=t.length;for(let e=0;e!==S;e++){let n=t[e],r=n.bi,i=n.bj,a=n.si,s=n.sj,c;c=r.material&&i.material&&this.getContactMaterial(r.material,i.material)||this.defaultContactMaterial,c.friction,r.material&&i.material&&(r.material.friction>=0&&i.material.friction>=0&&r.material.friction*i.material.friction,r.material.restitution>=0&&i.material.restitution>=0&&(n.restitution=r.material.restitution*i.material.restitution)),o.addEquation(n),r.allowSleep&&r.type===Y.DYNAMIC&&r.sleepState===Y.SLEEPING&&i.sleepState===Y.AWAKE&&i.type!==Y.STATIC&&i.velocity.lengthSquared()+i.angularVelocity.lengthSquared()>=i.sleepSpeedLimit**2*2&&(r.wakeUpAfterNarrowphase=!0),i.allowSleep&&i.type===Y.DYNAMIC&&i.sleepState===Y.SLEEPING&&r.sleepState===Y.AWAKE&&r.type!==Y.STATIC&&r.velocity.lengthSquared()+r.angularVelocity.lengthSquared()>=r.sleepSpeedLimit**2*2&&(i.wakeUpAfterNarrowphase=!0),this.collisionMatrix.set(r,i,!0),this.collisionMatrixPrevious.get(r,i)||(zf.body=i,zf.contact=n,r.dispatchEvent(zf),zf.body=r,i.dispatchEvent(zf)),this.bodyOverlapKeeper.set(r.id,i.id),this.shapeOverlapKeeper.set(a.id,s.id)}for(this.emitContactEvents(),c&&(l.makeContactConstraints=If.now()-d,d=If.now()),_=0;_!==i;_++){let e=a[_];e.wakeUpAfterNarrowphase&&=(e.wakeUp(),!1)}for(v=f.length,_=0;_!==v;_++){let e=f[_];e.update();for(let t=0,n=e.equations.length;t!==n;t++){let n=e.equations[t];o.addEquation(n)}}o.solve(e,this),c&&(l.solve=If.now()-d),o.removeAllEquations();let C=Math.pow;for(_=0;_!==i;_++){let t=a[_];if(t.type&u){let n=C(1-t.linearDamping,e),r=t.velocity;r.scale(n,r);let i=t.angularVelocity;if(i){let n=C(1-t.angularDamping,e);i.scale(n,i)}}}this.dispatchEvent(Rf),c&&(d=If.now());let w=this.stepnumber%(this.quatNormalizeSkip+1)===0,T=this.quatNormalizeFast;for(_=0;_!==i;_++)a[_].integrate(e,w,T);this.clearForces(),this.broadphase.dirty=!0,c&&(l.integrate=If.now()-d),this.stepnumber+=1,this.dispatchEvent(Lf);let E=!0;if(this.allowSleep)for(E=!1,_=0;_!==i;_++){let e=a[_];e.sleepTick(this.time),e.sleepState!==Y.SLEEPING&&(E=!0)}this.hasActiveBodies=E}emitContactEvents(){let e=this.hasAnyEventListener(`beginContact`),t=this.hasAnyEventListener(`endContact`);if((e||t)&&this.bodyOverlapKeeper.getDiff(Wf,Gf),e){for(let e=0,t=Wf.length;e<t;e+=2)Kf.bodyA=this.getBodyById(Wf[e]),Kf.bodyB=this.getBodyById(Wf[e+1]),this.dispatchEvent(Kf);Kf.bodyA=Kf.bodyB=null}if(t){for(let e=0,t=Gf.length;e<t;e+=2)qf.bodyA=this.getBodyById(Gf[e]),qf.bodyB=this.getBodyById(Gf[e+1]),this.dispatchEvent(qf);qf.bodyA=qf.bodyB=null}Wf.length=Gf.length=0;let n=this.hasAnyEventListener(`beginShapeContact`),r=this.hasAnyEventListener(`endShapeContact`);if((n||r)&&this.shapeOverlapKeeper.getDiff(Wf,Gf),n){for(let e=0,t=Wf.length;e<t;e+=2){let t=this.getShapeById(Wf[e]),n=this.getShapeById(Wf[e+1]);Jf.shapeA=t,Jf.shapeB=n,t&&(Jf.bodyA=t.body),n&&(Jf.bodyB=n.body),this.dispatchEvent(Jf)}Jf.bodyA=Jf.bodyB=Jf.shapeA=Jf.shapeB=null}if(r){for(let e=0,t=Gf.length;e<t;e+=2){let t=this.getShapeById(Gf[e]),n=this.getShapeById(Gf[e+1]);Yf.shapeA=t,Yf.shapeB=n,t&&(Yf.bodyA=t.body),n&&(Yf.bodyB=n.body),this.dispatchEvent(Yf)}Yf.bodyA=Yf.bodyB=Yf.shapeA=Yf.shapeB=null}}clearForces(){let e=this.bodies,t=e.length;for(let n=0;n!==t;n++){let t=e[n];t.force,t.torque,t.force.set(0,0,0),t.torque.set(0,0,0)}}};new ll;var Ff=new ru,If=globalThis.performance||{};if(!If.now){let e=Date.now();If.timing&&If.timing.navigationStart&&(e=If.timing.navigationStart),If.now=()=>Date.now()-e}new K;var Lf={type:`postStep`},Rf={type:`preStep`},zf={type:Y.COLLIDE_EVENT_NAME,body:null,contact:null},Bf=[],Vf=[],Hf=[],Uf=[],Wf=[],Gf=[],Kf={type:`beginContact`,bodyA:null,bodyB:null},qf={type:`endContact`,bodyA:null,bodyB:null},Jf={type:`beginShapeContact`,bodyA:null,bodyB:null,shapeA:null,shapeB:null},Yf={type:`endShapeContact`,bodyA:null,bodyB:null,shapeA:null,shapeB:null},Xf=[1,6,2,5,3,4],Zf=[{axis:new K(1,0,0),face:1},{axis:new K(-1,0,0),face:6},{axis:new K(0,1,0),face:2},{axis:new K(0,-1,0),face:5},{axis:new K(0,0,1),face:3},{axis:new K(0,0,-1),face:4}],Qf={1:[[.5,.5]],2:[[.25,.25],[.75,.75]],3:[[.25,.25],[.5,.5],[.75,.75]],4:[[.25,.25],[.75,.25],[.25,.75],[.75,.75]],5:[[.25,.25],[.75,.25],[.5,.5],[.25,.75],[.75,.75]],6:[[.25,.25],[.75,.25],[.25,.5],[.75,.5],[.25,.75],[.75,.75]]},$f=128,ep=.09,tp=`#f5f5f0`,np=`#1a1a1a`,rp=`/assets/dice/plastered-stone-wall-1k/`,ip=`${rp}plastered_stone_wall_diff_1k.jpg`,ap=`${rp}plastered_stone_wall_nor_gl_1k.png`,op=`${rp}plastered_stone_wall_rough_1k.png`,sp=1.45,cp=.035,lp=.68,up=.0114,dp=null,fp=!1,pp=null,mp=null,hp=e=>{let{ctx:t,value:n}=e;t.fillStyle=tp,t.fillRect(0,0,$f,$f),dp&&(t.filter=`brightness(${sp}) contrast(95%)`,t.drawImage(dp,0,0,$f,$f),t.filter=`none`),t.fillStyle=np;let r=$f*ep;for(let[e,i]of Qf[n]??[])t.beginPath(),t.arc(e*$f,i*$f,r,0,Math.PI*2),t.fill();e.texture.needsUpdate=!0},gp=()=>{if(dp||fp)return;fp=!0;let e=new Image;e.onload=()=>{dp=e,fp=!1;for(let e of pp??[])hp(e)},e.onerror=()=>{fp=!1},e.src=ip},_p=e=>{let t=document.createElement(`canvas`);t.width=$f,t.height=$f;let n=t.getContext(`2d`),r=new qi(t);r.colorSpace=wt,r.magFilter=pe,r.minFilter=pe,r.generateMipmaps=!1,r.anisotropy=4;let i={value:e,canvas:t,ctx:n,texture:r};return hp(i),gp(),i},vp=()=>(pp||=Xf.map(e=>_p(e)),pp.map(e=>e.texture)),yp=()=>{if(mp)return mp;let e=new ya,t=e.load(ap),n=e.load(op);for(let e of[t,n])e.magFilter=pe,e.minFilter=pe,e.generateMipmaps=!1,e.anisotropy=1;return mp={normalMap:t,roughnessMap:n},mp},bp=()=>{let e=yp();return vp().map(t=>new Zi({map:t,normalMap:e.normalMap,roughnessMap:e.roughnessMap,roughness:1,metalness:0,normalScale:new z(.076,.076),flatShading:!0}))},xp=(e,t,n)=>{let r=Math.sin(e*157.31+t*311.17+n*613.73)*43758.5453;return r-Math.floor(r)},Sp=e=>{let t=new hi(e,e,e,4,4,4),n=t.attributes.position,r=e/2,i=e*cp,a=e*up;for(let e=0;e<n.count;e++){let t=n.getX(e),o=n.getY(e),s=n.getZ(e),c=Math.abs(t)/r,l=Math.abs(o)/r,u=Math.abs(s)/r,d=Math.max(0,(c-lp)/(1-lp)),f=Math.max(0,(l-lp)/(1-lp)),p=Math.max(0,(u-lp)/(1-lp)),m=Math.sign(t),h=Math.sign(o),g=Math.sign(s),_=xp(t,o,s)-.5;n.setXYZ(e,t-m*i*(f+p)*.5+m*_*a*f*p,o-h*i*(d+p)*.5+h*_*a*d*p,s-g*i*(d+f)*.5+g*_*a*d*f)}return n.needsUpdate=!0,t.computeVertexNormals(),t},Cp=-1e3,wp=8,Tp=120,Ep=250,Dp=(e,t,n)=>Math.min(n,Math.max(t,e)),Op=class{scene;world;material;mode;shadowsEnabled;isHeld=!1;interpolationRampStartMs=0;tmpDeltaQ=new Jt;localDice=[];localActiveIndices=[];remoteDice=[];constructor(e,t,n,r=`local`,i={}){this.scene=e,this.world=t,this.material=n,this.mode=r,this.shadowsEnabled=i.shadowsEnabled??r===`local`}spawn(){let e=Sp(r*2);for(let t=0;t<6;t++){let n=new fi(e,bp());n.castShadow=this.shadowsEnabled,n.receiveShadow=this.shadowsEnabled,this.scene.add(n);let o=(t-5/2)*a;if(this.mode===`local`){let e=new Y({mass:i,shape:new wl(new K(r,r,r)),material:this.material??void 0,linearDamping:.1,angularDamping:.1});e.allowSleep=!0,e.sleepSpeedLimit=.25,e.sleepTimeLimit=.2,this.world&&this.world.addBody(e),e.position.set(o,r+.05,0),n.position.copy(e.position),this.localDice.push({mesh:n,body:e,spawnOffset:new B(o,0,0)})}else n.position.set(o,r+.05,0),n.visible=!1,this.remoteDice.push({mesh:n,p:n.position.clone(),q:new Jt,v:new B,w:new B,lastUpdateMs:0,samples:this.createRemoteSamples(),sampleCursor:0,sampleCount:0})}this.mode===`local`&&(this.localActiveIndices=this.allLocalIndices())}pickup(){if(!this.isHeld){if(this.isHeld=!0,this.mode===`local`){let e=new Set(this.localActiveIndices);for(let t=0;t<this.localDice.length;t++){if(!e.has(t))continue;let n=this.localDice[t];n.mesh.visible=!1,n.body.type=Y.KINEMATIC,n.body.velocity.setZero(),n.body.angularVelocity.setZero(),n.body.force.setZero(),n.body.torque.setZero(),n.body.position.set(0,Cp,0),n.body.sleep()}return}for(let e of this.remoteDice)e.mesh.visible=!1,this.clearRemoteSamples(e),e.v.set(0,0,0),e.w.set(0,0,0);this.interpolationRampStartMs=0}}release(e,t){if(!this.isHeld||(this.isHeld=!1,this.mode!==`local`))return;let n=this.localActiveIndices.length>0?this.localActiveIndices:this.allLocalIndices(),r=new Set(n);for(let e=0;e<this.localDice.length;e++)r.has(e)||this.parkLocalDie(this.localDice[e]);let i=(n.length-1)/2,o=this.clampReleasePosition(t,n.length);for(let t=0;t<n.length;t++){let r=this.localDice[n[t]];r.mesh.visible=!0,r.body.type=Y.DYNAMIC,r.body.position.set(o.x+(t-i)*a,o.y,o.z+r.spawnOffset.z),r.body.quaternion.setFromAxisAngle(new K(Math.random(),Math.random(),Math.random()).unit(),Math.random()*Math.PI*2),r.body.wakeUp(),r.body.velocity.set(e.x,e.y,e.z),r.body.angularVelocity.set((Math.random()-.5)*5,(Math.random()-.5)*5,(Math.random()-.5)*5),r.mesh.position.set(r.body.position.x,r.body.position.y,r.body.position.z),r.mesh.quaternion.set(r.body.quaternion.x,r.body.quaternion.y,r.body.quaternion.z,r.body.quaternion.w)}}clampReleasePosition(e,t){let i=(t-1)/2*a,o=Math.max(0,16/2-n-i-r-g),s=Math.max(0,9/2-n-r-g);return new B(Dp(Number.isFinite(e.x)?e.x:0,-o,o),f,Dp(Number.isFinite(e.z)?e.z:0,-s,s))}syncMeshes(){if(this.mode===`local`)for(let e of this.localDice)e.mesh.visible&&(e.mesh.position.set(e.body.position.x,e.body.position.y,e.body.position.z),e.mesh.quaternion.set(e.body.quaternion.x,e.body.quaternion.y,e.body.quaternion.z,e.body.quaternion.w))}getActiveDiceMeshes(){if(this.mode===`network`)return this.getActiveRemoteMeshes();let e=[];for(let t of this.localActiveIndices){let n=this.localDice[t];n?.mesh.visible&&e.push({mesh:n.mesh,index:t})}return e}getDiceMeshes(){return this.mode===`network`?this.getRemoteMeshes():this.localDice.map((e,t)=>({mesh:e.mesh,index:t}))}getLocalActiveIndices(){return[...this.localActiveIndices]}setLocalActiveIndices(e){if(this.mode!==`local`)return;let t=new Set;for(let n of e)Number.isInteger(n)&&n>=0&&n<this.localDice.length&&t.add(n);this.localActiveIndices=t.size>0?[...t].sort((e,t)=>e-t):this.allLocalIndices();let n=new Set(this.localActiveIndices);for(let e=0;e<this.localDice.length;e++){let t=this.localDice[e];n.has(e)?(!t.mesh.visible||t.body.position.y<-100)&&this.resetLocalDieToSpawn(e,t):this.parkLocalDie(t)}}resetLocalForNewTurn(){if(this.mode===`local`){this.localActiveIndices=this.allLocalIndices();for(let e=0;e<this.localDice.length;e++)this.resetLocalDieToSpawn(e,this.localDice[e])}}areLocalActiveDiceAtRest(){return this.mode===`local`?this.localActiveIndices.every(e=>{let t=this.localDice[e];return t!==void 0&&t.body.sleepState===Y.SLEEPING}):!1}resolveLocalRestAmbiguities(){if(this.mode!==`local`)return!1;let e=this.getValidLocalActiveIndices(),t=e.filter(e=>this.localDice[e].body.position.y>=s);if(t.length>0){for(let n of t)this.rerollLocalDie(n,e);return!0}let n=e.filter(e=>{let t=this.localDice[e];return this.readFaceAlignment(t.body).dot<o});if(n.length>0){for(let e of n)this.alignAmbiguousLocalDie(e);return!0}return!1}getLocalActiveFaces(){return this.mode===`local`?this.localActiveIndices.map(e=>this.readFaceValue(this.localDice[e].body)):[]}applySnapshot(e,t,n={}){if(this.mode!==`network`)return;let r=Math.min(e.length,this.remoteDice.length);for(let i=0;i<r;i++){let r=e[i],a=this.remoteDice[i];if(a.p.set(r.p[0],r.p[1],r.p[2]),a.q.set(r.q[0],r.q[1],r.q[2],r.q[3]),a.v.set(r.v[0],r.v[1],r.v[2]),a.w.set(r.w[0],r.w[1],r.w[2]),a.lastUpdateMs=t,r.p[1]<-100){a.mesh.visible=!1,this.clearRemoteSamples(a);continue}if(this.isHeld)continue;let o=a.sampleCount===0;n.immediate&&this.clearRemoteSamples(a),this.pushRemoteSample(a,t),o&&!n.immediate&&(this.interpolationRampStartMs=t),a.mesh.visible=!0,(o||n.immediate)&&(a.mesh.position.copy(a.p),a.mesh.quaternion.copy(a.q))}}getActiveRemoteMeshes(){if(this.mode!==`network`)return[];let e=[];for(let t=0;t<this.remoteDice.length;t++){let n=this.remoteDice[t];n.mesh.visible&&e.push({mesh:n.mesh,index:t})}return e}getRemoteMeshes(){return this.mode===`network`?this.remoteDice.map((e,t)=>({mesh:e.mesh,index:t})):[]}extrapolate(e){if(this.mode!==`network`)return;let t=e-this.getInterpolationDelayMs(e);for(let e of this.remoteDice){if(!e.mesh.visible||e.sampleCount===0)continue;let n=this.getRemoteSample(e,0),r=this.getRemoteSample(e,e.sampleCount-1);if(!n||!r)continue;if(t<=n.atMs){e.mesh.position.copy(n.p),e.mesh.quaternion.copy(n.q);continue}let i=n,a=null;for(let n=1;n<e.sampleCount;n++){let r=this.getRemoteSample(e,n);if(!r)break;if(r.atMs>=t){a=r;break}i=r}if(a){let n=Math.max(1,a.atMs-i.atMs),r=Math.min(1,Math.max(0,(t-i.atMs)/n));e.mesh.position.lerpVectors(i.p,a.p,r),e.mesh.quaternion.copy(i.q).slerp(a.q,r)}else this.renderExtrapolated(e,r,t)}}createRemoteSamples(){return Array.from({length:wp},()=>({atMs:0,p:new B,q:new Jt,v:new B,w:new B}))}getInterpolationDelayMs(e){if(this.interpolationRampStartMs<=0)return 50;let t=e-this.interpolationRampStartMs;return t>=Tp?50:50*Math.max(0,t/Tp)}clearRemoteSamples(e){e.sampleCursor=0,e.sampleCount=0}pushRemoteSample(e,t){let n=e.samples[e.sampleCursor];n.atMs=t,n.p.copy(e.p),n.q.copy(e.q),n.v.copy(e.v),n.w.copy(e.w),e.sampleCursor=(e.sampleCursor+1)%wp,e.sampleCount=Math.min(wp,e.sampleCount+1)}getRemoteSample(e,t){if(t<0||t>=e.sampleCount)return null;let n=(e.sampleCursor-e.sampleCount+wp)%wp;return e.samples[(n+t)%wp]??null}renderExtrapolated(e,t,n){let r=n-t.atMs;if(r<=0||r>Ep){e.mesh.position.copy(t.p),e.mesh.quaternion.copy(t.q);return}let i=r/1e3;e.mesh.position.set(t.p.x+t.v.x*i,t.p.y+t.v.y*i,t.p.z+t.v.z*i);let a=t.w.lengthSq();if(a<=1e-12){e.mesh.quaternion.copy(t.q);return}let o=Math.sqrt(a),s=o*i/2,c=Math.sin(s)/o;this.tmpDeltaQ.set(t.w.x*c,t.w.y*c,t.w.z*c,Math.cos(s)),e.mesh.quaternion.multiplyQuaternions(this.tmpDeltaQ,t.q)}allLocalIndices(){return Array.from({length:this.localDice.length},(e,t)=>t)}parkLocalDie(e){e.mesh.visible=!1,e.body.type=Y.KINEMATIC,e.body.velocity.setZero(),e.body.angularVelocity.setZero(),e.body.force.setZero(),e.body.torque.setZero(),e.body.position.set(0,Cp,0),e.body.sleep()}resetLocalDieToSpawn(e,t){let n=(e-(this.localDice.length-1)/2)*a;t.mesh.visible=!0,t.body.type=Y.DYNAMIC,t.body.velocity.setZero(),t.body.angularVelocity.setZero(),t.body.force.setZero(),t.body.torque.setZero(),t.body.position.set(n,r+.05,0),t.body.quaternion.set(0,0,0,1),t.body.wakeUp(),t.mesh.position.set(t.body.position.x,t.body.position.y,t.body.position.z),t.mesh.quaternion.set(0,0,0,1)}getValidLocalActiveIndices(){let e=new Set,t=[];for(let n of this.localActiveIndices){if(!Number.isInteger(n)||n<0||n>=this.localDice.length||e.has(n))continue;let r=this.localDice[n];r.body.type!==Y.DYNAMIC||r.body.position.y<-100||(e.add(n),t.push(n))}return t}rerollLocalDie(e,t){let n=this.localDice[e],[r,i]=this.pickLocalRerollPosition(e,t),a=this.randomUnitAxis();n.mesh.visible=!0,n.body.type=Y.DYNAMIC,n.body.force.setZero(),n.body.torque.setZero(),n.body.velocity.set(0,c,0),n.body.angularVelocity.set((Math.random()-.5)*l*2,(Math.random()-.5)*l*2,(Math.random()-.5)*l*2),n.body.position.set(r,f,i),n.body.quaternion.setFromAxisAngle(a,Math.random()*Math.PI*2),n.body.wakeUp()}alignAmbiguousLocalDie(e){let t=this.localDice[e],n=this.readBottomFaceNormal(t.body),i=new ml,a=new ml(t.body.quaternion.x,t.body.quaternion.y,t.body.quaternion.z,t.body.quaternion.w);i.setFromVectors(n,new K(0,-1,0)),i.mult(a,t.body.quaternion),t.body.quaternion.normalize(),t.body.type=Y.DYNAMIC,t.body.force.setZero(),t.body.torque.setZero(),t.body.position.y=r+u,t.body.velocity.set(0,c,0),t.body.angularVelocity.setZero(),t.body.wakeUp()}readBottomFaceNormal(e){let t=new K(0,1,0),n=1/0,r=new K(0,-1,0);for(let{axis:i}of Zf){let a=e.quaternion.vmult(i),o=a.dot(t);o<n&&(n=o,r=a)}return r.normalize(),r}pickLocalRerollPosition(e,t){let i=Math.max(0,16/2-n-r-g),o=Math.max(0,9/2-n-r-g);for(let n=0;n<16;n++){let n=Math.random()*i*2-i,r=Math.random()*o*2-o;if(this.hasLocalRerollClearance(e,t,n,r))return[n,r]}return[Dp((e-(this.localDice.length-1)/2)*a,-i,i),0]}hasLocalRerollClearance(e,t,n,r){let i=d*d;for(let a of t){if(a===e)continue;let t=this.localDice[a];if(t.body.position.y<-100)continue;let o=t.body.position.x-n,s=t.body.position.z-r;if(o*o+s*s<i)return!1}return!0}randomUnitAxis(){let e=0,t=0,n=0;do e=Math.random()-.5,t=Math.random()-.5,n=Math.random()-.5;while(Math.hypot(e,t,n)<1e-6);let r=new K(e,t,n);return r.normalize(),r}readFaceValue(e){return this.readFaceAlignment(e).faceValue}readFaceAlignment(e){let t=new K(0,1,0),n=-1/0,r=1;for(let{axis:i,face:a}of Zf){let o=e.quaternion.vmult(i).dot(t);o>n&&(n=o,r=a)}return{faceValue:r,dot:n}}},kp=class{events=new Map;on(e,t){this.events.has(e)||this.events.set(e,[]),this.events.get(e).push(t)}off(e){this.events.get(e)&&this.events.delete(e)}emit(e,...t){let n=this.events.get(e);n&&n.forEach(e=>e(...t))}},Ap=1,jp=6,Mp=e=>e===1?1e3:e*100,Np=(e,t)=>{if(t<3)return 0;let n=Mp(e);return t===3?n:t===4?n*2:t===5?n*4:n*8},Pp=e=>{let t=Array(jp+1).fill(0);for(let n of e)Number.isInteger(n)&&n>=Ap&&n<=jp&&t[n]++;return t},Fp=e=>{let t=Array.from({length:jp+1},()=>[]);for(let n=0;n<e.length;n++){let r=e[n];Number.isInteger(r)&&r>=Ap&&r<=jp&&t[r].push(n)}return t},Ip=e=>e[1]>=1&&e[2]>=1&&e[3]>=1&&e[4]>=1&&e[5]>=1,Lp=e=>e[2]>=1&&e[3]>=1&&e[4]>=1&&e[5]>=1&&e[6]>=1,Rp=e=>e[1]>=1&&e[2]>=1&&e[3]>=1&&e[4]>=1&&e[5]>=1&&e[6]>=1,zp=e=>{let t=Pp(e),n=Fp(e),r=[];if(Rp(t)){let e=[];for(let t=1;t<=6;t++)e.push(n[t][0]);r.push({dieIndices:e,points:1500,label:`straight-1-6`})}if(Ip(t)){let e=[];for(let t=1;t<=5;t++)e.push(n[t][0]);r.push({dieIndices:e,points:500,label:`straight-1-5`})}if(Lp(t)){let e=[];for(let t=2;t<=6;t++)e.push(n[t][0]);r.push({dieIndices:e,points:750,label:`straight-2-6`})}for(let e=1;e<=6;e++){let i=t[e];for(let t=3;t<=i;t++)r.push({dieIndices:n[e].slice(0,t),points:Np(e,t),label:`${Bp(t)}-of-a-kind:${e}`})}for(let e of n[1])r.push({dieIndices:[e],points:100,label:`single-1`});for(let e of n[5])r.push({dieIndices:[e],points:50,label:`single-5`});return r},Bp=e=>{switch(e){case 3:return`three`;case 4:return`four`;case 5:return`five`;case 6:return`six`;default:return String(e)}},Vp=e=>zp(e).length===0,Hp=(e,t)=>{if(t.length===0)return{valid:!1,reason:`must pick at least one scoring die`};let n=new Set;for(let r of t){if(!Number.isInteger(r)||r<0||r>=e.length)return{valid:!1,reason:`index out of range: ${r}`};if(n.has(r))return{valid:!1,reason:`duplicate index: ${r}`};n.add(r)}let r=Pp(t.map(t=>e[t])),i=t.length,a=0;if(Rp(r)){a+=1500;for(let e=1;e<=6;e++)r[e]--;i-=6}else if(Ip(r)){a+=500;for(let e=1;e<=5;e++)r[e]--;i-=5}else if(Lp(r)){a+=750;for(let e=2;e<=6;e++)r[e]--;i-=5}for(let e=1;e<=6;e++)r[e]>=3&&(a+=Np(e,r[e]),i-=r[e],r[e]=0);return r[1]>0&&(a+=r[1]*100,i-=r[1],r[1]=0),r[5]>0&&(a+=r[5]*50,i-=r[5],r[5]=0),i===0?{valid:!0,points:a}:{valid:!1,reason:`selection contains non-scoring dice`}},Up=`dice.language`,Wp={en:{mobileSoon:`Mobile version is coming soon!`,back:`Back`,room:`Room`,test:`test`,waiting:`waiting`,active:`active`,paused:`paused`,finished:`finished`,unknown:`unknown`,roomOwner:`Room owner`,waitingForStart:`Waiting for start`,players:`Players`,spectators:`Spectators`,startGame:`Start game`,online:`online`,offline:`offline`,youSuffix:`you`,noValue:`none`,target:`Target`,minBank:`Min Bank`,hotDice:`Hot Dice`,enabled:`on`,authRegister:`Register`,authLogin:`Login`,authLogout:`Log out`,authCreate:`Create`,authCancel:`Cancel`,controls:`Controls`,controlsTitle:`Controls`,throwDice:`Throw`,selectAllAction:`Select all`,continueAction:`Continue`,bankAction:`Bank`,pressKey:`Press a key`,save:`Save`,resetDefaults:`Reset defaults`,duplicateControls:`Each action needs a different key`,invalidControlKey:`Use letter, number, numpad, or Space`,displayName:`Display name`,username:`Username`,password:`Password`,soloGame:`Solo Game`,multiplayer:`Multiplayer`,mode:`Mode`,createGame:`Create game`,match:`Match`,ranked:`Ranked`,testRoom:`Test room`,gameName:`Game name`,gameNameRequired:`Game name is required`,browseLobbies:`Browse lobbies`,lobbies:`Lobbies`,noRooms:`No open games`,owner:`Owner`,status:`Status`,action:`Action`,join:`Join`,spectate:`Spectate`,close:`Close`,leaderboard:`Leaderboard`,wins:`Wins`,losses:`Losses`,rating:`Rating`,authRequiredRanked:`Login is required for ranked games`,targetScore:`Target score`,bankRule:`Bank rule`,roomCode:`Room code`,joinByCode:`Join by code`,connecting:`Connecting...`,turnOwner:`Turn`,turnPoints:`Turn points`,bench:`Bench`,rolled:`Rolled`,scoringNone:`Scoring: -`,availableScoring:`Available:`,selected:`Selected`,incompleteSet:`incomplete set`,spectatorMode:`You are spectating`,yourTurnRoll:`Your turn. Roll the dice`,waitingFor:`Waiting for`,rolling:`Rolling...`,selectingDice:`selecting dice`,won:`Won`,readyToRoll:`Ready to roll`,chooseScoringDice:`Choose scoring dice`,total:`Total`,turn:`Turn`,turnScore:`Turn score`,activeDice:`Active dice`,banks:`Banks`,busts:`Busts`,bestBank:`Best bank`,scoring:`Scoring`,history:`History`,bank:`bank`,burned:`burned`,targetReached:`Target reached`,runFailed:`Run failed`,finalScore:`Final score`,resetRun:`Reset run`,continue:`Continue`,pause:`Pause`},ru:{mobileSoon:`Мобильная версия скоро`,back:`Назад`,room:`Комната`,test:`тест`,waiting:`ожидание`,active:`активна`,paused:`пауза`,finished:`завершена`,unknown:`неизвестно`,roomOwner:`Автор комнаты`,waitingForStart:`Ожидание старта`,players:`Игроки`,spectators:`Зрители`,startGame:`Начать игру`,online:`online`,offline:`offline`,youSuffix:`ты`,noValue:`нет`,target:`Цель`,minBank:`Мин. банк`,hotDice:`Hot Dice`,enabled:`вкл`,authRegister:`Регистрация`,authLogin:`Вход`,authLogout:`Выйти`,authCreate:`Создать`,authCancel:`Отмена`,controls:`Управление`,controlsTitle:`Управление`,throwDice:`Бросок`,selectAllAction:`Выбрать всё`,continueAction:`Continue`,bankAction:`Bank`,pressKey:`Нажми клавишу`,save:`Сохранить`,resetDefaults:`По умолчанию`,duplicateControls:`Для каждого действия нужна своя клавиша`,invalidControlKey:`Используй букву, цифру, numpad или Space`,displayName:`Имя игрока`,username:`Username`,password:`Password`,soloGame:`Одиночная игра`,multiplayer:`Мультиплеер`,mode:`Режим`,createGame:`Создать игру`,match:`Матч`,ranked:`Рейтинг`,testRoom:`Тестовая комната`,gameName:`Имя игры`,gameNameRequired:`Укажи имя игры`,browseLobbies:`Список лобби`,lobbies:`Лобби и игры`,noRooms:`Открытых игр нет`,owner:`Автор`,status:`Статус`,action:`Действие`,join:`Войти`,spectate:`Смотреть`,close:`Закрыть`,leaderboard:`Лидерборд`,wins:`Победы`,losses:`Поражения`,rating:`Рейтинг`,authRequiredRanked:`Для рейтинговой игры нужен вход`,targetScore:`Целевой счёт`,bankRule:`Правило банка`,roomCode:`Код комнаты`,joinByCode:`Войти по коду`,connecting:`Подключение...`,turnOwner:`Чей ход`,turnPoints:`Накоплено в ходу`,bench:`Bench`,rolled:`Выпало`,scoringNone:`Scoring: -`,availableScoring:`Можно взять:`,selected:`Выбрано`,incompleteSet:`набор неполный`,spectatorMode:`Ты зритель`,yourTurnRoll:`Твой ход. Бросай кости`,waitingFor:`Ждём`,rolling:`Бросаем...`,selectingDice:`выбирает кости`,won:`Победил`,readyToRoll:`Готово к броску`,chooseScoringDice:`Выбери scoring dice`,total:`Всего`,turn:`Ход`,turnScore:`Очки хода`,activeDice:`Активные кости`,banks:`Банки`,busts:`Bust`,bestBank:`Лучший банк`,scoring:`Scoring`,history:`История`,bank:`банк`,burned:`сгорело`,targetReached:`Цель достигнута`,runFailed:`Забег провален`,finalScore:`Финальный счёт`,resetRun:`Сбросить run`,continue:`Continue`,pause:`Пауза`}},Gp={en:{practice:[`Practice`,`Free training without win or loss.`],"score-attack-short":[`Score Attack Short`,`Maximum score in 5 turns.`],"score-attack-classic":[`Score Attack Classic`,`Maximum score in 10 turns.`],"score-attack-long":[`Score Attack Long`,`Maximum score in 20 turns.`],"target-easy":[`Easy Target`,`Reach 3000 in 10 turns.`],"target-classic":[`Classic Target`,`Reach 4000 in 8 turns.`],"target-hard":[`Hard Target`,`Reach 6000 in 10 turns.`],"target-long":[`Long Target`,`Reach 10000 in 15 turns.`]},ru:{practice:[`Практика`,`Свободная тренировка без победы и поражения.`],"score-attack-short":[`Score Attack Short`,`Максимум очков за 5 ходов.`],"score-attack-classic":[`Score Attack Classic`,`Максимум очков за 10 ходов.`],"score-attack-long":[`Score Attack Long`,`Максимум очков за 20 ходов.`],"target-easy":[`Easy Target`,`Набрать 3000 за 10 ходов.`],"target-classic":[`Classic Target`,`Набрать 4000 за 8 ходов.`],"target-hard":[`Hard Target`,`Набрать 6000 за 10 ходов.`],"target-long":[`Long Target`,`Набрать 10000 за 15 ходов.`]}},Kp=new Set,qp=()=>{let e=localStorage.getItem(Up);return e===`en`||e===`ru`?e:`ru`},Jp=e=>{localStorage.setItem(Up,e);for(let e of Kp)e()},Yp=e=>(Kp.add(e),()=>Kp.delete(e)),X=e=>Wp[qp()][e],Xp=(e,t=e)=>Gp[qp()][e]?.[0]??t,Zp=(e,t=``)=>Gp[qp()][e]?.[1]??t,Qp=e=>e.code===`Space`||e.code===`Enter`||e.key===` `||e.key===`Enter`||e.key===`Spacebar`,$p=(e,t)=>{e.type=`button`,e.tabIndex=-1,e.addEventListener(`mousedown`,e=>{e.preventDefault()}),e.addEventListener(`keydown`,e=>{Qp(e)&&(e.preventDefault(),e.stopPropagation())}),e.addEventListener(`keyup`,e=>{Qp(e)&&(e.preventDefault(),e.stopPropagation())}),e.addEventListener(`click`,n=>{if(e.blur(),n.detail===0){n.preventDefault(),n.stopPropagation();return}t(),e.blur()})},em=1.2,tm=1.35,Z=e=>`${Math.round(e*em)}px`,nm=e=>`${Math.round(e*em*tm)}px`,Q={ui:`var(--font-ui)`,title:`var(--font-title)`},$={mobileTitle:`clamp(34px, 12vw, 58px)`,lang:nm(12),badge:nm(12),auth:nm(11),playerName:nm(16),roomTitle:nm(18),roomText:nm(12),roomMeta:nm(11),card:nm(16),title:nm(24),error:nm(12),menuButton:nm(18),control:nm(16),label:nm(14),hud:nm(14),overlay:nm(24),logo:Z(34)},rm={langButtonWidth:Z(34),langButtonHeight:Z(28),authButtonWidth:Z(150),authButtonHeight:Z(42),authIconButtonSize:Z(34),controlHeight:Z(42),menuButtonHeight:Z(52),hudButtonWidth:Z(120),hudButtonHeight:Z(42)},im={PLAYER:0,SPECTATOR:1},am={WAITING:0,ACTIVE:1,PAUSED:2,FINISHED:3},om={MATCH:0,TEST:1,RANKED:2},sm={BASE_D6:`base-d6`},cm={targetScore:4e3,minBank:0,allowHotDice:!0,scoringRuleset:sm.BASE_D6},lm=new Set([3e3,4e3,5e3,1e4]),um=new Set([0,300,500]),dm=e=>({targetScore:lm.has(e?.targetScore??0)?e.targetScore:cm.targetScore,minBank:um.has(e?.minBank??-1)?e.minBank:cm.minBank,allowHotDice:e?.allowHotDice??cm.allowHotDice,scoringRuleset:e?.scoringRuleset===sm.BASE_D6?sm.BASE_D6:cm.scoringRuleset}),fm={WAITING:0,ROLLING:1,SELECTING:2,FINISHED:3},pm=`rgba(0,0,0,0.6)`,mm=`#eee`,hm=`6px`,gm=`10px 12px`,_m=`#3b82f6`,vm=`#fff`,ym=`0.4`,bm=2500,xm=(e,t)=>e?e===t?X(`youSuffix`):Cm(e):`-`,Sm=(e,t,n)=>t===n?`${e||X(`youSuffix`)} (${X(`youSuffix`)})`:e||Cm(t),Cm=e=>e.length<=8?e:e.slice(0,8),wm=class{events=new kp;root;leftPanel;rightPanel;actionsPanel;statusPanel;errorPanel;continueBtn;bankBtn;unsubscribeLanguage;state=null;roomState=null;selectedCount=0;selectionValid=!1;selectedPoints=0;errorTimer=null;statusTimer=null;lastRolledFaces=[];ownUserId;constructor(e){this.ownUserId=e,this.root=document.createElement(`div`),this.root.id=`hud`,Object.assign(this.root.style,{position:`fixed`,inset:`0`,pointerEvents:`none`,zIndex:`15`,fontFamily:Q.ui}),this.leftPanel=this.makePanel({top:`60px`,left:`12px`}),this.leftPanel.id=`hud-left`,Object.assign(this.leftPanel.style,{minWidth:`180px`,whiteSpace:`pre-line`}),this.rightPanel=this.makePanel({top:`60px`,right:`12px`}),this.rightPanel.id=`hud-right`,Object.assign(this.rightPanel.style,{minWidth:`180px`,whiteSpace:`pre-line`,textAlign:`right`}),this.actionsPanel=document.createElement(`div`),this.actionsPanel.id=`hud-actions`,Object.assign(this.actionsPanel.style,{position:`fixed`,bottom:`70px`,left:`50%`,transform:`translateX(-50%)`,display:`none`,gap:`12px`,pointerEvents:`auto`}),this.continueBtn=this.makeButton(X(`continue`),()=>{this.continueBtn.disabled||this.events.emit(`continue-clicked`)}),this.bankBtn=this.makeButton(X(`bank`),()=>{this.bankBtn.disabled||this.events.emit(`bank-clicked`)}),this.actionsPanel.appendChild(this.continueBtn),this.actionsPanel.appendChild(this.bankBtn),this.statusPanel=document.createElement(`div`),this.statusPanel.id=`hud-status`,Object.assign(this.statusPanel.style,{position:`fixed`,bottom:`20px`,left:`50%`,transform:`translateX(-50%)`,padding:gm,background:pm,color:mm,fontFamily:Q.ui,fontSize:$.hud,borderRadius:hm,pointerEvents:`none`,maxWidth:`70vw`,textAlign:`center`}),this.errorPanel=document.createElement(`div`),this.errorPanel.id=`hud-error`,Object.assign(this.errorPanel.style,{position:`fixed`,top:`50%`,left:`50%`,transform:`translate(-50%, -50%)`,padding:`14px 28px`,background:`rgba(180,40,40,0.85)`,color:`#fff`,fontFamily:Q.ui,fontSize:$.overlay,fontWeight:`bold`,borderRadius:hm,pointerEvents:`none`,display:`none`,letterSpacing:`0.05em`}),this.root.appendChild(this.leftPanel),this.root.appendChild(this.rightPanel),document.body.appendChild(this.root),document.body.appendChild(this.actionsPanel),document.body.appendChild(this.statusPanel),document.body.appendChild(this.errorPanel),this.unsubscribeLanguage=Yp(()=>{this.continueBtn.textContent=X(`continue`),this.bankBtn.textContent=X(`bank`),this.render()}),this.render()}setMatchState(e){e.phase!==fm.SELECTING&&(this.lastRolledFaces=[],this.selectedCount=0,this.selectionValid=!1,this.selectedPoints=0),this.state=e,this.updateStatusTimer(),this.render()}setRoomState(e){this.roomState=e,this.updateStatusTimer(),this.render()}setRollResult(e){this.lastRolledFaces=[...e],this.render()}setSelectionState(e,t,n=0){this.selectedCount=e,this.selectionValid=t,this.selectedPoints=n,this.renderActions(),this.renderLeft()}showError(e){this.errorPanel.textContent=e,this.errorPanel.style.display=`block`,this.errorTimer!==null&&clearTimeout(this.errorTimer),this.errorTimer=window.setTimeout(()=>{this.errorPanel.style.display=`none`,this.errorTimer=null},bm)}destroy(){this.errorTimer!==null&&clearTimeout(this.errorTimer),this.statusTimer!==null&&clearInterval(this.statusTimer),this.errorTimer=null,this.statusTimer=null,this.unsubscribeLanguage(),this.root.remove(),this.actionsPanel.remove(),this.statusPanel.remove(),this.errorPanel.remove()}render(){this.renderLeft(),this.renderRight(),this.renderActions(),this.renderStatus()}renderLeft(){let e=this.state;if(!e){this.leftPanel.textContent=X(`connecting`);return}let t=xm(e.currentPlayer,this.ownUserId),n=e.bench.length>0?e.bench.join(`, `):`-`,r=this.roomState?.options.minBank??cm.minBank,i=[`${X(`turnOwner`)}: ${t}`,`${X(`turnPoints`)}: ${e.turnPoints}`,`${X(`bench`)}: ${n}`,r>0?`${X(`minBank`)}: ${r}`:`${X(`minBank`)}: -`],a=e.currentPlayer===this.ownUserId;if(a&&e.phase===fm.SELECTING&&this.lastRolledFaces.length>0&&!this.isRanked()){i.push(``),i.push(`${X(`rolled`)}: ${this.lastRolledFaces.join(`, `)}`);let e=zp(this.lastRolledFaces);if(e.length===0)i.push(X(`scoringNone`));else{i.push(X(`availableScoring`));for(let t of e){let e=t.dieIndices.map(e=>e+1).join(`,`);i.push(`• ${t.label} (поз. ${e}) → ${t.points}`)}}}a&&e.phase===fm.SELECTING&&this.selectedCount>0&&(i.push(``),i.push(`${X(`selected`)}: ${this.selectedCount}${this.selectionValid?``:` (${X(`incompleteSet`)})`}`)),this.leftPanel.textContent=i.join(`
`)}renderRight(){let e=this.state,t=this.roomState,n=t?.options.targetScore??cm.targetScore;if(!t){if(!e||e.totals.length===0){this.rightPanel.textContent=`—`;return}let t=e.totals.map(e=>`${xm(e.userId,this.ownUserId)}: ${e.total} / ${n}`);this.rightPanel.textContent=t.join(`
`);return}let r=new Map((e?.totals??[]).map(e=>[e.userId,e.total])),i=[X(`players`)],a=t.members.filter(e=>e.role===im.PLAYER);if(a.length===0)i.push(`—`);else for(let t of a){let a=Sm(t.displayName,t.userId,this.ownUserId),o=r.get(t.userId)??0,s=e?.currentPlayer===t.userId?` · ${X(`turn`)}`:``,c=t.online?X(`online`):X(`offline`);i.push(`${a}: ${o} / ${n} · ${c}${s}`)}let o=t.members.filter(e=>e.role===im.SPECTATOR);if(i.push(``),i.push(X(`spectators`)),o.length===0)i.push(`—`);else for(let e of o){let t=Sm(e.displayName,e.userId,this.ownUserId);i.push(`${t} · ${e.online?X(`online`):X(`offline`)}`)}this.rightPanel.textContent=i.join(`
`)}getOwnRole(){return this.roomState?.members.find(e=>e.userId===this.ownUserId)?.role??null}renderActions(){let e=this.state,t=e!==null&&!e.paused&&this.getOwnRole()!==im.SPECTATOR&&e.phase===fm.SELECTING&&e.currentPlayer===this.ownUserId;this.actionsPanel.style.display=t?`flex`:`none`;let n=t&&this.selectedCount>0&&this.selectionValid,r=this.roomState?.options.minBank??cm.minBank,i=n&&e!==null&&e.turnPoints+this.selectedPoints>=r;this.setButtonEnabled(this.continueBtn,n),this.setButtonEnabled(this.bankBtn,i)}renderStatus(){let e=this.state;if(!e){this.statusPanel.textContent=``,this.statusPanel.style.display=`none`;return}if(e.paused){this.statusPanel.textContent=e.pauseReason?`${X(`pause`)}: ${e.pauseReason}`:X(`pause`),this.statusPanel.style.display=`block`;return}if(this.getOwnRole()===im.SPECTATOR){this.statusPanel.textContent=X(`spectatorMode`),this.statusPanel.style.display=`block`;return}let t=e.currentPlayer===this.ownUserId,n=e.currentPlayer?xm(e.currentPlayer,this.ownUserId):`-`,r=``;switch(e.phase){case fm.WAITING:r=t?X(`yourTurnRoll`):`${X(`waitingFor`)} ${n}`;break;case fm.ROLLING:r=X(`rolling`);break;case fm.SELECTING:r=t?``:`${X(`turnOwner`)}: ${n}, ${X(`selectingDice`)}`;break;case fm.FINISHED:{let t=e.winner?xm(e.winner,this.ownUserId):`-`;r=`${X(`won`)}: ${t}`;break}default:r=``}let i=this.formatTurnTimer();i&&(r=r?`${r} · ${i}`:i),this.statusPanel.textContent=r,this.statusPanel.style.display=r?`block`:`none`}isRanked(){return this.roomState?.mode===om.RANKED}formatTurnTimer(){let e=this.state?.turnDeadlineAt??0;return e<=0||this.state?.phase!==fm.SELECTING?``:`${Math.max(0,Math.ceil((e-Date.now())/1e3))}s`}updateStatusTimer(){let e=(this.state?.turnDeadlineAt??0)>Date.now()&&this.state?.phase===fm.SELECTING;if(e&&this.statusTimer===null){this.statusTimer=window.setInterval(()=>{this.updateStatusTimer(),this.renderStatus()},250);return}!e&&this.statusTimer!==null&&(clearInterval(this.statusTimer),this.statusTimer=null)}makePanel(e){let t=document.createElement(`div`);return Object.assign(t.style,{position:`fixed`,padding:gm,background:pm,color:mm,fontFamily:Q.ui,fontSize:$.hud,borderRadius:hm,pointerEvents:`none`,lineHeight:`1.5`}),Object.assign(t.style,e),t}makeButton(e,t){let n=document.createElement(`button`);return n.textContent=e,Object.assign(n.style,{padding:`8px 16px`,background:_m,color:vm,border:`none`,borderRadius:hm,fontFamily:Q.ui,fontSize:$.hud,width:rm.hudButtonWidth,height:rm.hudButtonHeight,boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,lineHeight:`1`,whiteSpace:`nowrap`,cursor:`pointer`,pointerEvents:`auto`}),$p(n,t),n}setButtonEnabled(e,t){e.disabled=!t,e.style.opacity=t?`1`:ym,e.style.cursor=t?`pointer`:`not-allowed`}},Tm={ROOM_CREATE:16,ROOM_JOIN:17,ROOM_LEAVE:18,ROOM_START:19,ROOM_LIST:20,MATCH_RELEASE:48,MATCH_SELECT_DICE:49,MATCH_BANK:50,ROOM_STATE:32,MATCH_DICE_SPAWN:64,MATCH_DICE_SNAPSHOT:65,MATCH_DICE_REST:66,MATCH_STATE:67,MATCH_ROLL_RESULT:68,MATCH_TURN_RESULT:69,ACK_OK:128,ACK_ERROR:129},Em=new TextEncoder,Dm=new TextDecoder,Om=52,km=29,Am=6,jm=0,Mm=e=>new DataView(e.buffer,e.byteOffset,e.byteLength),Nm=(e,t,n,r)=>(e.setUint16(n,r.length),t.set(r,n+2),n+2+r.length),Pm=(e,t,n)=>{let r=e.getUint16(n);return{value:Dm.decode(t.subarray(n+2,n+2+r)),next:n+2+r}},Fm=(e,t,n)=>{let r=dm(n);return e.setUint16(t,r.targetScore),e.setUint16(t+2,r.minBank),e.setUint8(t+4,+!!r.allowHotDice),e.setUint8(t+5,jm),t+Am},Im=(e,t)=>{let n=e.getUint8(t+5);return dm({targetScore:e.getUint16(t),minBank:e.getUint16(t+2),allowHotDice:e.getUint8(t+4)!==0,scoringRuleset:n===jm?sm.BASE_D6:cm.scoringRuleset})},Lm=(e,t)=>({p:[e.getFloat32(t),e.getFloat32(t+4),e.getFloat32(t+8)],q:[e.getFloat32(t+12),e.getFloat32(t+16),e.getFloat32(t+20),e.getFloat32(t+24)],v:[e.getFloat32(t+28),e.getFloat32(t+32),e.getFloat32(t+36)],w:[e.getFloat32(t+40),e.getFloat32(t+44),e.getFloat32(t+48)]}),Rm=e=>{let t=Mm(e),n=t.getUint32(1),r=(e.length-5)/Om,i=Array(r),a=5;for(let e=0;e<r;e++)i[e]=Lm(t,a),a+=Om;return{tick:n,dice:i}},zm=e=>{let t=Mm(e),n=t.getUint32(1),r=(e.length-5)/km,i=Array(r),a=5;for(let e=0;e<r;e++)i[e]={p:[t.getFloat32(a),t.getFloat32(a+4),t.getFloat32(a+8)],q:[t.getFloat32(a+12),t.getFloat32(a+16),t.getFloat32(a+20),t.getFloat32(a+24)],faceValue:t.getUint8(a+28)},a+=km;return{tick:n,dice:i}},Bm=e=>{let t=Em.encode(e.roomId),n=new Uint8Array(3+t.length+12+12),r=Mm(n);r.setUint8(0,Tm.MATCH_RELEASE);let i=Nm(r,n,1,t);return r.setFloat32(i,e.velocity[0]),r.setFloat32(i+4,e.velocity[1]),r.setFloat32(i+8,e.velocity[2]),r.setFloat32(i+12,e.position[0]),r.setFloat32(i+16,e.position[1]),r.setFloat32(i+20,e.position[2]),n},Vm=e=>{let t=Em.encode(e.gameName??``),n=new Uint8Array(6+Am+2+t.length),r=Mm(n);return r.setUint8(0,Tm.ROOM_CREATE),r.setUint32(1,e.requestId>>>0),r.setUint8(5,(e.mode??0)&255),Nm(r,n,Fm(r,6,e.options),t),n},Hm=e=>{let t=Em.encode(e.code),n=new Uint8Array(7+t.length),r=Mm(n);return r.setUint8(0,Tm.ROOM_JOIN),r.setUint32(1,e.requestId>>>0),Nm(r,n,5,t),n},Um=e=>{let t=Em.encode(e.roomId),n=new Uint8Array(7+t.length),r=Mm(n);return r.setUint8(0,Tm.ROOM_START),r.setUint32(1,e.requestId>>>0),Nm(r,n,5,t),n},Wm=e=>{let t=new Uint8Array(5),n=Mm(t);return n.setUint8(0,Tm.ROOM_LIST),n.setUint32(1,e.requestId>>>0),t},Gm=e=>{let t=Mm(e),n=1,r=t.getUint8(n);n+=1;let i=Array(r);for(let a=0;a<r;a++){let r=Pm(t,e,n);n=r.next;let o=Pm(t,e,n);n=o.next;let s=Pm(t,e,n);n=s.next;let c=Pm(t,e,n);n=c.next;let l=Pm(t,e,n);n=l.next;let u=t.getUint8(n);n+=1;let d=t.getUint8(n);n+=1;let f=t.getUint16(n);n+=2;let p=t.getUint16(n);n+=2;let m=t.getUint8(n)!==0;n+=1;let h=t.getUint8(n)!==0;n+=1,i[a]={id:r.value,code:o.value,gameName:s.value,ownerId:c.value,ownerDisplayName:l.value,status:u,mode:d,playerCount:f,spectatorCount:p,canJoinAsPlayer:m,canSpectate:h}}return{rooms:i}},Km=e=>{let t=Mm(e),n=1,r=Pm(t,e,n);n=r.next;let i=Pm(t,e,n);n=i.next;let a=Pm(t,e,n);n=a.next;let o=t.getUint8(n);n+=1;let s=t.getUint8(n);n+=1;let c=t.getUint8(n);n+=1;let l=Array(c);for(let r=0;r<c;r++){let i=Pm(t,e,n);n=i.next;let a=Pm(t,e,n);n=a.next;let o=Pm(t,e,n);n=o.next;let s=t.getUint8(n);n+=1;let c=t.getUint8(n)!==0;n+=1,l[r]={userId:i.value,socketId:a.value,displayName:o.value,role:s,online:c}}let u=n+Am<=e.length?Im(t,n):cm;n+=n+Am<=e.length?Am:0;let d=n+2<=e.length?Pm(t,e,n).value:i.value;return{id:r.value,code:i.value,gameName:d,ownerId:a.value,status:o,mode:s,options:u,members:l}},qm=e=>({requestId:Mm(e).getUint32(1),body:e.length>5?e.subarray(5):void 0}),Jm=e=>{let t=Mm(e),n=t.getUint32(1),r=5,i=Pm(t,e,r);r=i.next;let a=Pm(t,e,r);return{requestId:n,code:i.value,message:a.value}},Ym=(e,t,n,r)=>{let i=Em.encode(n),a=r.length;if(a>255)throw Error(`indices too long: ${a} > 255`);let o=new Uint8Array(7+i.length+1+a),s=Mm(o);s.setUint8(0,e),s.setUint32(1,t>>>0);let c=Nm(s,o,5,i);s.setUint8(c,a&255),c+=1;for(let e=0;e<a;e++)s.setUint8(c+e,r[e]&255);return o},Xm=e=>Ym(Tm.MATCH_SELECT_DICE,e.requestId,e.roomId,e.indices),Zm=e=>Ym(Tm.MATCH_BANK,e.requestId,e.roomId,e.indices),Qm=e=>{let t=Mm(e),n=t.getUint8(1),r=Array(n);for(let e=0;e<n;e++)r[e]=t.getUint8(2+e);return{rolledFaces:r,bust:t.getUint8(2+n)!==0}},$m=e=>{let t=Mm(e),n=Pm(t,e,1),r=n.next,i=t.getUint8(r)!==0;r+=1;let a=t.getUint32(r);r+=4;let o=t.getUint32(r);return{userId:n.value,bust:i,banked:a,totalAfter:o}},eh=e=>{let t=Mm(e),n=1,r=t.getUint8(n);n+=1;let i=Pm(t,e,n);n=i.next;let a=t.getUint8(n)!==0;n+=1;let o=Pm(t,e,n);n=o.next;let s=t.getUint8(n);n+=1;let c=Array(s);for(let r=0;r<s;r++){let i=Pm(t,e,n);n=i.next,c[r]=i.value}let l=t.getUint32(n);n+=4;let u=t.getUint8(n);n+=1;let d=t.getUint8(n);n+=1;let f=Array(d);for(let e=0;e<d;e++)f[e]=t.getUint8(n+e);n+=d;let p=t.getUint8(n);n+=1;let m=Array(p);for(let r=0;r<p;r++){let i=Pm(t,e,n);n=i.next;let a=t.getUint32(n);n+=4,m[r]={userId:i.value,total:a}}let h=Pm(t,e,n);n=h.next;let g=n+8<=e.length?t.getFloat64(n):0;return{phase:r,currentPlayer:i.value,paused:a,pauseReason:o.value,onlinePlayers:c,turnPoints:l,remainingDice:u,bench:f,totals:m,winner:h.value,turnDeadlineAt:g}},th=1e3,nh=3e4,rh=(e,t,n)=>`${y.replace(/^http/,`ws`)}/ws?${(n?new URLSearchParams({t:n}):new URLSearchParams({u:e,n:t})).toString()}`,ih=class{events=new kp;ws=null;currentRoomId=null;currentRoomCode=null;currentRoomState=null;userId=null;displayName=`Player`;accessToken;requestSeq=1;pending=new Map;reconnectTimer=null;reconnectDelay=th;autoReconnect=!0;connect=(e,t,n)=>this.ws?Promise.resolve():(this.userId=e,this.displayName=t.trim()||`Player`,this.accessToken=n,this.autoReconnect=!0,new Promise((e,t)=>{this.openSocket(e,t)}));disconnect=()=>{this.autoReconnect=!1,this.reconnectTimer!==null&&(clearTimeout(this.reconnectTimer),this.reconnectTimer=null),this.ws?.close(),this.ws=null,this.currentRoomId=null,this.currentRoomCode=null,this.currentRoomState=null,this.userId=null,this.displayName=`Player`,this.accessToken=void 0;for(let e of this.pending.values())e.reject(Error(`disconnected`));this.pending.clear()};getUserId=()=>this.userId;getRoomId=()=>this.currentRoomId;getRoomState=()=>this.currentRoomState;createRoom=(e=om.MATCH,t,n)=>this.sendCommand(r=>Vm({requestId:r,mode:e,options:t,gameName:n})).then(e=>{if(!e)throw Error(`empty ROOM_CREATE response`);let t=Km(e);return this.currentRoomId=t.id,this.currentRoomCode=t.code,this.currentRoomState=t,t});listRooms=()=>this.sendCommand(e=>Wm({requestId:e})).then(e=>{if(!e)throw Error(`empty ROOM_LIST response`);return Gm(e).rooms});joinRoom=e=>this.sendCommand(t=>Hm({requestId:t,code:e})).then(e=>{if(!e)throw Error(`empty ROOM_JOIN response`);let t=Km(e);return this.currentRoomId=t.id,this.currentRoomCode=t.code,this.currentRoomState=t,t});startRoom=()=>{let e=this.currentRoomId;return e?this.sendCommand(t=>Um({requestId:t,roomId:e})).then(e=>{if(!e)throw Error(`empty ROOM_START response`);let t=Km(e);return this.currentRoomId=t.id,this.currentRoomCode=t.code,this.currentRoomState=t,t}):Promise.reject(Error(`not in a room`))};sendRelease=(e,t)=>{let n=this.ws,r=this.currentRoomId;!n||n.readyState!==WebSocket.OPEN||!r||n.send(Bm({roomId:r,velocity:[e.x,e.y,e.z],position:[t.x,t.y,t.z]}))};sendSelectDice=e=>{let t=this.currentRoomId;return t?this.sendCommand(n=>Xm({requestId:n,roomId:t,indices:e})).then(()=>void 0):Promise.reject(Error(`not in a room`))};sendBank=e=>{let t=this.currentRoomId;return t?this.sendCommand(n=>Zm({requestId:n,roomId:t,indices:e})).then(()=>void 0):Promise.reject(Error(`not in a room`))};sendCommand=e=>{let t=this.ws;if(!t||t.readyState!==WebSocket.OPEN)return Promise.reject(Error(`not connected`));let n=this.requestSeq++;return new Promise((r,i)=>{this.pending.set(n,{resolve:r,reject:i}),t.send(e(n))})};openSocket=(e,t)=>{if(!this.userId){t?.(Error(`userId required`));return}let n=new WebSocket(rh(this.userId,this.displayName,this.accessToken));n.binaryType=`arraybuffer`;let r=!1;n.onopen=()=>{r=!0,this.reconnectDelay=th,e?.(),!e&&this.currentRoomCode&&this.joinRoom(this.currentRoomCode).catch(()=>{this.currentRoomId=null,this.currentRoomCode=null})},n.onerror=()=>{r||t?.(Error(`connection failed`))},n.onclose=()=>{this.ws=null;for(let e of this.pending.values())e.reject(Error(`socket closed`));this.pending.clear(),this.autoReconnect&&this.scheduleReconnect()},n.onmessage=e=>{e.data instanceof ArrayBuffer&&this.dispatch(new Uint8Array(e.data))},this.ws=n};scheduleReconnect=()=>{if(this.reconnectTimer!==null)return;let e=this.reconnectDelay;this.reconnectDelay=Math.min(nh,this.reconnectDelay*2),this.reconnectTimer=window.setTimeout(()=>{this.reconnectTimer=null,this.autoReconnect&&this.openSocket()},e)};dispatch=e=>{if(!(e.length<1))switch(e[0]){case Tm.ROOM_STATE:{let t=Km(e);this.currentRoomId=t.id,this.currentRoomCode=t.code,this.currentRoomState=t,this.events.emit(`room-state`,t);return}case Tm.MATCH_DICE_SPAWN:{let t=Rm(e);this.events.emit(`dice-spawn`,t);return}case Tm.MATCH_DICE_SNAPSHOT:{let t=Rm(e);this.events.emit(`dice-snapshot`,t);return}case Tm.MATCH_DICE_REST:{let t=zm(e);this.events.emit(`dice-rest`,t);return}case Tm.MATCH_STATE:{let t=eh(e);this.events.emit(`match-state`,t);return}case Tm.MATCH_ROLL_RESULT:{let t=Qm(e);this.events.emit(`match-roll-result`,t);return}case Tm.MATCH_TURN_RESULT:{let t=$m(e);this.events.emit(`match-turn-result`,t);return}case Tm.ACK_OK:{let t=qm(e),n=this.pending.get(t.requestId);if(this.pending.delete(t.requestId),!n)return;n.resolve(t.body&&t.body.length>0?t.body:void 0);return}case Tm.ACK_ERROR:{let t=Jm(e),n=this.pending.get(t.requestId);this.pending.delete(t.requestId),n?.reject(Error(`${t.code}: ${t.message}`));return}default:return}}},ah=12,oh=[{id:`practice`,title:`Practice`,description:`Свободная тренировка без победы и поражения.`,allowHotDice:!0,scoringRuleset:`base-d6`},{id:`score-attack-short`,title:`Score Attack Short`,description:`Максимум очков за 5 ходов.`,turnLimit:5,allowHotDice:!0,scoringRuleset:`base-d6`},{id:`score-attack-classic`,title:`Score Attack Classic`,description:`Максимум очков за 10 ходов.`,turnLimit:10,allowHotDice:!0,scoringRuleset:`base-d6`},{id:`score-attack-long`,title:`Score Attack Long`,description:`Максимум очков за 20 ходов.`,turnLimit:20,allowHotDice:!0,scoringRuleset:`base-d6`},{id:`target-easy`,title:`Easy Target`,description:`Набрать 3000 за 10 ходов.`,targetScore:3e3,turnLimit:10,allowHotDice:!0,scoringRuleset:`base-d6`},{id:`target-classic`,title:`Classic Target`,description:`Набрать 4000 за 8 ходов.`,targetScore:4e3,turnLimit:8,allowHotDice:!0,scoringRuleset:`base-d6`},{id:`target-hard`,title:`Hard Target`,description:`Набрать 6000 за 10 ходов.`,targetScore:6e3,turnLimit:10,allowHotDice:!0,scoringRuleset:`base-d6`},{id:`target-long`,title:`Long Target`,description:`Набрать 10000 за 15 ходов.`,targetScore:1e4,turnLimit:15,allowHotDice:!0,scoringRuleset:`base-d6`}],sh=oh[0],ch=e=>oh.find(t=>t.id===e)??sh,lh=e=>({modeId:e.id,status:`active`,totalScore:0,turnScore:0,turnIndex:1,activeDiceCount:6,bustCount:0,bankCount:0,hotDiceCount:0,bestSingleTurnBank:0,history:[]}),uh=e=>e.status!==`active`,dh=(e,t,n,r)=>{if(uh(e))return e;let i=Math.max(0,Math.min(e.activeDiceCount,r)),a=t.allowHotDice&&i>=e.activeDiceCount;return{...e,turnScore:e.turnScore+n,activeDiceCount:a?6:Math.max(1,e.activeDiceCount-i),hotDiceCount:a?e.hotDiceCount+1:e.hotDiceCount}},fh=(e,t,n,r=0)=>{if(uh(e))return e;let i=e.turnScore+n,a=e.totalScore+i,o=t.allowHotDice&&r>=e.activeDiceCount;return mh({...e,totalScore:a,turnScore:0,bankCount:e.bankCount+1,hotDiceCount:o?e.hotDiceCount+1:e.hotDiceCount,bestSingleTurnBank:Math.max(e.bestSingleTurnBank,i),history:hh(e.history,{turnIndex:e.turnIndex,result:`bank`,banked:i,totalScore:a,burned:0})},t)},ph=(e,t)=>uh(e)?e:mh({...e,turnScore:0,bustCount:e.bustCount+1,history:hh(e.history,{turnIndex:e.turnIndex,result:`bust`,banked:0,totalScore:e.totalScore,burned:e.turnScore})},t),mh=(e,t)=>t.targetScore!==void 0&&e.totalScore>=t.targetScore?{...e,status:`won`,activeDiceCount:6}:t.turnLimit!==void 0&&e.turnIndex>=t.turnLimit?{...e,status:t.targetScore===void 0?`finished`:`lost`,activeDiceCount:6}:{...e,turnIndex:e.turnIndex+1,activeDiceCount:6},hh=(e,t)=>[t,...e].slice(0,ah),gh=`rgba(0,0,0,0.62)`,_h=`#eee`,vh=`6px`,yh=`10px 12px`,bh=`#3b82f6`,xh=`0.4`,Sh=2500,Ch=class{events=new kp;root;leftPanel;rightPanel;actionsPanel;statusPanel;errorPanel;continueBtn;bankBtn;resetBtn;unsubscribeLanguage;config;state;selectedCount=0;selectionValid=!1;selectedPoints=0;lastRolledFaces=[];statusText=``;errorTimer=null;constructor(e,t){this.config=e,this.state=t,this.root=document.createElement(`div`),this.root.id=`solo-hud`,Object.assign(this.root.style,{position:`fixed`,inset:`0`,pointerEvents:`none`,zIndex:`15`,fontFamily:Q.ui}),this.leftPanel=this.makePanel({top:`12px`,left:`12px`}),this.leftPanel.id=`solo-hud-left`,Object.assign(this.leftPanel.style,{minWidth:`220px`,whiteSpace:`pre-line`}),this.rightPanel=this.makePanel({top:`60px`,right:`12px`}),this.rightPanel.id=`solo-hud-right`,Object.assign(this.rightPanel.style,{minWidth:`260px`,maxWidth:`360px`,whiteSpace:`pre-line`,textAlign:`right`}),this.actionsPanel=document.createElement(`div`),this.actionsPanel.id=`solo-hud-actions`,Object.assign(this.actionsPanel.style,{position:`fixed`,bottom:`70px`,left:`50%`,transform:`translateX(-50%)`,display:`flex`,gap:`12px`,pointerEvents:`auto`}),this.continueBtn=this.makeButton(X(`continue`),()=>{this.continueBtn.disabled||this.events.emit(`continue-clicked`)}),this.bankBtn=this.makeButton(X(`bank`),()=>{this.bankBtn.disabled||this.events.emit(`bank-clicked`)}),this.resetBtn=this.makeButton(X(`resetRun`),()=>this.events.emit(`reset-clicked`)),this.resetBtn.style.background=`#52525b`,this.actionsPanel.appendChild(this.continueBtn),this.actionsPanel.appendChild(this.bankBtn),this.actionsPanel.appendChild(this.resetBtn),this.statusPanel=document.createElement(`div`),this.statusPanel.id=`solo-hud-status`,Object.assign(this.statusPanel.style,{position:`fixed`,bottom:`20px`,left:`50%`,transform:`translateX(-50%)`,padding:yh,background:gh,color:_h,fontFamily:Q.ui,fontSize:$.hud,borderRadius:vh,pointerEvents:`none`,maxWidth:`70vw`,textAlign:`center`}),this.errorPanel=document.createElement(`div`),this.errorPanel.id=`solo-hud-error`,Object.assign(this.errorPanel.style,{position:`fixed`,top:`50%`,left:`50%`,transform:`translate(-50%, -50%)`,padding:`14px 28px`,background:`rgba(180,40,40,0.85)`,color:`#fff`,fontFamily:Q.ui,fontSize:$.overlay,fontWeight:`bold`,borderRadius:vh,pointerEvents:`none`,display:`none`,letterSpacing:`0.05em`}),this.root.appendChild(this.leftPanel),this.root.appendChild(this.rightPanel),document.body.appendChild(this.root),document.body.appendChild(this.actionsPanel),document.body.appendChild(this.statusPanel),document.body.appendChild(this.errorPanel),this.unsubscribeLanguage=Yp(()=>{this.continueBtn.textContent=X(`continue`),this.bankBtn.textContent=X(`bank`),this.resetBtn.textContent=X(`resetRun`),this.render()}),this.render()}setState(e){this.state=e,e.status!==`active`&&(this.lastRolledFaces=[],this.selectedCount=0,this.selectionValid=!1,this.selectedPoints=0),this.render()}setStatus(e){this.statusText=e,this.renderStatus()}setRollResult(e){this.lastRolledFaces=[...e],this.render()}clearRollResult(){this.lastRolledFaces=[],this.selectedCount=0,this.selectionValid=!1,this.selectedPoints=0,this.render()}setSelectionState(e,t,n=0){this.selectedCount=e,this.selectionValid=t,this.selectedPoints=n,this.renderActions(),this.renderLeft()}showError(e){this.errorPanel.textContent=e,this.errorPanel.style.display=`block`,this.errorTimer!==null&&clearTimeout(this.errorTimer),this.errorTimer=window.setTimeout(()=>{this.errorPanel.style.display=`none`,this.errorTimer=null},Sh)}destroy(){this.errorTimer!==null&&clearTimeout(this.errorTimer),this.errorTimer=null,this.unsubscribeLanguage(),this.root.remove(),this.actionsPanel.remove(),this.statusPanel.remove(),this.errorPanel.remove()}render(){this.renderLeft(),this.renderRight(),this.renderActions(),this.renderStatus()}renderLeft(){let e=this.state,t=[Xp(this.config.id,this.config.title),`${X(`total`)}: ${e.totalScore}${this.config.targetScore?` / ${this.config.targetScore}`:``}`,`${X(`turn`)}: ${e.turnIndex}${this.config.turnLimit?` / ${this.config.turnLimit}`:``}`,`${X(`turnScore`)}: ${e.turnScore}`,`${X(`activeDice`)}: ${e.activeDiceCount}`,`${X(`banks`)}: ${e.bankCount} · ${X(`busts`)}: ${e.bustCount}`,`${X(`hotDice`)}: ${e.hotDiceCount}`,`${X(`bestBank`)}: ${e.bestSingleTurnBank}`];this.lastRolledFaces.length>0&&(t.push(``),t.push(`${X(`rolled`)}: ${this.lastRolledFaces.join(`, `)}`),this.selectedCount>0&&t.push(`${X(`selected`)}: ${this.selectedCount}${this.selectionValid?` · +${this.selectedPoints}`:` · ${X(`incompleteSet`)}`}`)),this.leftPanel.textContent=t.join(`
`)}renderRight(){let e=[];if(this.lastRolledFaces.length>0){let t=zp(this.lastRolledFaces);if(e.push(X(`scoring`)),t.length===0)e.push(`—`);else for(let n of t){let t=n.dieIndices.map(e=>e+1).join(`,`);e.push(`${n.label} (${t}) → ${n.points}`)}}if(this.state.history.length>0){e.length>0&&e.push(``),e.push(X(`history`));for(let t of this.state.history)t.result===`bank`?e.push(`#${t.turnIndex}: ${X(`bank`)} ${t.banked} → ${t.totalScore}`):e.push(`#${t.turnIndex}: bust, ${X(`burned`)} ${t.burned}`)}this.rightPanel.textContent=e.length>0?e.join(`
`):Zp(this.config.id,this.config.description)}renderActions(){let e=this.state.status===`active`&&this.lastRolledFaces.length>0,t=e&&this.selectedCount>0&&this.selectionValid;this.continueBtn.style.display=e?`inline-block`:`none`,this.bankBtn.style.display=e?`inline-block`:`none`,this.setButtonEnabled(this.continueBtn,t),this.setButtonEnabled(this.bankBtn,t)}renderStatus(){this.state.status===`won`?this.statusPanel.textContent=X(`targetReached`):this.state.status===`lost`?this.statusPanel.textContent=X(`runFailed`):this.state.status===`finished`?this.statusPanel.textContent=`${X(`finalScore`)}: ${this.state.totalScore}`:this.statusPanel.textContent=this.statusText,this.statusPanel.style.display=this.statusPanel.textContent?`block`:`none`}makePanel(e){let t=document.createElement(`div`);return Object.assign(t.style,{position:`fixed`,padding:yh,background:gh,color:_h,fontFamily:Q.ui,fontSize:$.hud,borderRadius:vh,pointerEvents:`none`,lineHeight:`1.5`}),Object.assign(t.style,e),t}makeButton(e,t){let n=document.createElement(`button`);return n.textContent=e,Object.assign(n.style,{padding:`8px 16px`,background:bh,color:`#fff`,border:`none`,borderRadius:vh,fontFamily:Q.ui,fontSize:$.hud,width:rm.hudButtonWidth,height:rm.hudButtonHeight,boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,lineHeight:`1`,whiteSpace:`nowrap`,cursor:`pointer`,pointerEvents:`auto`}),$p(n,t),n}setButtonEnabled(e,t){e.disabled=!t,e.style.opacity=t?`1`:xh,e.style.cursor=t?`pointer`:`not-allowed`}},wh=[`throwDice`,`selectAll`,`continueTurn`,`bankTurn`],Th={version:1,controls:{throwDice:`Space`,selectAll:`KeyF`,continueTurn:`KeyQ`,bankTurn:`KeyE`}},Eh=`dice.playerSettings.guest`,Dh=/^(Space|Key[A-Z]|Digit[0-9]|Numpad[0-9])$/,Oh=new Set,kh=Mh(Th),Ah=e=>`${y}${e}`,jh=e=>typeof e==`object`&&!!e&&!Array.isArray(e);function Mh(e){return{version:1,controls:{...e.controls}}}var Nh=e=>typeof e==`string`&&Dh.test(e),Ph=e=>e===`Space`?`Space`:e.startsWith(`Key`)?e.slice(3):e.startsWith(`Digit`)?e.slice(5):e.startsWith(`Numpad`)?`Num ${e.slice(6)}`:e,Fh=e=>{if(!jh(e)||e.version!==1||!jh(e.controls))return Mh(Th);let t={...Th.controls};for(let n of wh){let r=e.controls[n];if(!Nh(r))return Mh(Th);t[n]=r}return Uh(t)?Mh(Th):{version:1,controls:t}},Ih=e=>{for(let t of wh)if(!Nh(e.controls[t]))return{valid:!1,message:`Invalid key: ${t}`};return Uh(e.controls)?{valid:!1,message:`Keys must be unique`}:{valid:!0}},Lh=()=>Mh(kh),Rh=e=>(Oh.add(e),()=>Oh.delete(e)),zh=async()=>{let e=await le();if(e?.authenticated&&e.accessToken){let t=await fetch(Ah(`/auth/settings`),{headers:{Authorization:`Bearer ${e.accessToken}`}}),n=await t.json().catch(()=>null);if(!t.ok)throw Error(Wh(n)||`settings request failed: ${t.status}`);return Hh(Fh(jh(n)?n.settings:null)),Lh()}return Hh(Vh()),Lh()},Bh=async e=>{let t=Ih(e);if(!t.valid)throw Error(t.message);let n=Fh(e),r=await le();if(r?.authenticated&&r.accessToken){let e=await fetch(Ah(`/auth/settings`),{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${r.accessToken}`},body:JSON.stringify({settings:n})}),t=await e.json().catch(()=>null);if(!e.ok)throw Error(Wh(t)||`settings save failed: ${e.status}`);return Hh(Fh(jh(t)?t.settings:null)),Lh()}return localStorage.setItem(Eh,JSON.stringify(n)),Hh(n),Lh()},Vh=()=>{let e=localStorage.getItem(Eh);if(!e)return Mh(Th);try{return Fh(JSON.parse(e))}catch{return localStorage.removeItem(Eh),Mh(Th)}},Hh=e=>{kh=Mh(e);let t=Lh();for(let e of Oh)e(t)},Uh=e=>{let t=new Set;for(let n of wh){let r=e[n];if(t.has(r))return!0;t.add(r)}return!1},Wh=e=>jh(e)&&typeof e.message==`string`&&e.message.length>0?e.message:null,Gh={color:0,intensity:0},Kh={straight:{color:3719538,intensity:.18,selectedColor:7794848,selectedIntensity:.55},kind:{color:4491519,intensity:.2,selectedColor:6989567,selectedIntensity:.58},single:{color:15906891,intensity:.18,selectedColor:16765286,selectedIntensity:.52}},qh=class{events=new kp;raycaster=new Ja;ndc=new z;selected=new Set;orderedSelection=[];selectable=new Set;highlights=new Map;rollIndexBySnapshotIndex=new Map;rolledFaces=[];enabled=!1;canvas;camera;dice;constructor(e,t,n){this.canvas=e,this.camera=t,this.dice=n,e.addEventListener(`mouseup`,this.onMouseUp)}enable(){this.enabled=!0,this.applyAllHighlights()}disable(){this.enabled=!1,this.clearScoringOptions()}getSelectedIndices(){return[...this.orderedSelection]}getSelectedRollIndices(){return this.orderedSelection.map(e=>this.rollIndexBySnapshotIndex.get(e)??-1)}clear(){this.selected.clear(),this.orderedSelection.length=0,this.applyAllHighlights(),this.emitSelectionChanged()}selectAllAvailable(){if(this.enabled){this.selected.clear(),this.orderedSelection.length=0;for(let e of this.dice.getActiveDiceMeshes())this.selectable.has(e.index)&&(this.selected.add(e.index),this.orderedSelection.push(e.index));this.applyAllHighlights(),this.emitSelectionChanged()}}setScoringOptions(e,t,n=!0){this.clearScoringOptions(!1),this.rolledFaces=[...e];let r=this.dice.getActiveDiceMeshes();for(let e=0;e<this.rolledFaces.length;e++){let t=r[e]?.index??e;this.rollIndexBySnapshotIndex.set(t,e)}for(let e of t){let t=this.kindForOption(e),i=this.priorityForKind(t);for(let a of e.dieIndices){let e=r[a]?.index??a;this.selectable.add(e);let o=this.highlights.get(e);n&&(!o||i>o.priority)&&this.highlights.set(e,{kind:t,priority:i})}}this.applyAllHighlights(),this.emitSelectionChanged()}clearScoringOptions(e=!0){this.selected.clear(),this.orderedSelection.length=0,this.selectable.clear(),this.highlights.clear(),this.rollIndexBySnapshotIndex.clear(),this.rolledFaces=[],this.clearAllHighlights(),e&&this.emitSelectionChanged()}destroy(){this.enabled=!1,this.canvas.removeEventListener(`mouseup`,this.onMouseUp),this.clearScoringOptions(!1)}onMouseUp=e=>{if(!this.enabled||e.button!==0)return;let t=this.canvas.getBoundingClientRect();this.ndc.x=(e.clientX-t.left)/t.width*2-1,this.ndc.y=-((e.clientY-t.top)/t.height)*2+1,this.raycaster.setFromCamera(this.ndc,this.camera);let n=this.dice.getActiveDiceMeshes();if(n.length===0)return;let r=n.map(e=>e.mesh),i=this.raycaster.intersectObjects(r,!1);if(i.length===0)return;let a=i[0].object,o=n.find(e=>e.mesh===a);o&&this.selectable.has(o.index)&&this.toggle(o.index,a)};toggle(e,t){if(this.selected.has(e)){this.selected.delete(e);let t=this.orderedSelection.indexOf(e);t>=0&&this.orderedSelection.splice(t,1)}else this.selected.add(e),this.orderedSelection.push(e);this.applyHighlight(e,t),this.emitSelectionChanged()}applyAllHighlights(){for(let e of this.dice.getDiceMeshes())this.applyHighlight(e.index,e.mesh)}clearAllHighlights(){for(let e of this.dice.getDiceMeshes())this.applyMaterialHighlight(e.mesh,Gh.color,Gh.intensity)}applyHighlight(e,t){let n=this.highlights.get(e);if(!n){this.applyMaterialHighlight(t,Gh.color,Gh.intensity);return}let r=Kh[n.kind],i=this.selected.has(e);this.applyMaterialHighlight(t,i?r.selectedColor:r.color,i?r.selectedIntensity:r.intensity)}applyMaterialHighlight(e,t,n){let r=Array.isArray(e.material)?e.material:[e.material];for(let e of r){let r=e;r.emissive&&(r.emissive.setHex(t),r.emissiveIntensity=n,r.needsUpdate=!0)}}emitSelectionChanged(){let e=[...this.orderedSelection],t=this.getSelectedRollIndices(),n=e.length>0?Hp(this.rolledFaces,t):null,r=n?.valid===!0,i=n?.valid===!0?n.points:0;this.events.emit(`selection-changed`,e,r,i)}kindForOption(e){return e.label.startsWith(`straight`)?`straight`:e.label.includes(`of-a-kind`)?`kind`:`single`}priorityForKind(e){switch(e){case`straight`:return 3;case`kind`:return 2;case`single`:return 1;default:return 0}}},Jh=(e,t,n)=>Math.min(n,Math.max(t,e)),Yh=.2,Xh=`Space`,Zh=e=>{if(!(e instanceof Element))return!1;if(e.closest(`input, textarea, select, button`))return!0;let t=e.closest(`[contenteditable]`);return t instanceof HTMLElement&&t.isContentEditable},Qh=class{events=new kp;isHolding=!1;enabled=!0;throwKeyCode=Xh;samples=[];currentPos=new B;lastEmittedPos=new B;lastSpeed=0;raycaster=new Ja;holdPlane=new Hi(new B(0,1,0),-f);ndc=new z;tmpHit=new B;canvas;camera;constructor(e,t,n=Xh){this.canvas=e,this.camera=t,this.throwKeyCode=n,e.addEventListener(`mousedown`,this.onMouseDown),e.addEventListener(`mousemove`,this.onMouseMove),window.addEventListener(`mouseup`,this.onMouseUp),window.addEventListener(`keydown`,this.onKeyDown),e.addEventListener(`contextmenu`,this.onContextMenu)}update(e){let t=e-90;for(;this.samples.length>0&&this.samples[0].time<t;)this.samples.shift()}setEnabled(e){this.enabled!==e&&(this.enabled=e,!e&&this.isHolding&&(this.isHolding=!1,this.samples.length=0))}setThrowKeyCode(e){this.throwKeyCode=e}destroy(){this.setEnabled(!1),this.canvas.removeEventListener(`mousedown`,this.onMouseDown),this.canvas.removeEventListener(`mousemove`,this.onMouseMove),this.canvas.removeEventListener(`contextmenu`,this.onContextMenu),window.removeEventListener(`mouseup`,this.onMouseUp),window.removeEventListener(`keydown`,this.onKeyDown),this.samples.length=0}onContextMenu=e=>{e.preventDefault()};onMouseDown=e=>{this.enabled&&e.button===0&&this.projectToHoldPlane(e)&&(this.isHolding=!0,this.samples.length=0,this.pushSample(performance.now()),this.lastEmittedPos.copy(this.currentPos),this.events.emit(`hold-start`,this.currentPos.clone()))};onMouseMove=e=>{if(!this.enabled||!this.isHolding||!this.projectToHoldPlane(e))return;let t=performance.now(),n=this.samples[this.samples.length-1];if(n){let e=Math.max(.001,(t-n.time)/1e3);this.lastSpeed=this.currentPos.distanceTo(n.pos)/e}this.pushSample(t),this.events.emit(`hold-move`,this.currentPos.clone(),this.lastSpeed)};onMouseUp=e=>{if(!this.enabled||e.button!==0||!this.isHolding)return;this.isHolding=!1;let t=performance.now();this.update(t);let n=new B;if(this.samples.length>=2){let e=this.samples[0],t=this.samples[this.samples.length-1],r=Math.max(.001,(t.time-e.time)/1e3);n.subVectors(t.pos,e.pos).divideScalar(r)}if(n.multiplyScalar(p),n.length()<.4){let e=new B;this.camera.getWorldDirection(e),e.y=0,e.normalize().multiplyScalar(h),n.add(e)}n.y+=m,n.length()>12&&n.setLength(12),this.samples.length=0,this.events.emit(`release`,n,this.currentPos.clone())};onKeyDown=e=>{this.enabled&&e.code===this.throwKeyCode&&(e.repeat||e.defaultPrevented||this.isHolding||Zh(e.target)||(e.preventDefault(),this.emitSpaceThrow()))};emitSpaceThrow(){if(this.isHolding=!0,this.samples.length=0,this.currentPos.set(0,f,0),this.lastEmittedPos.copy(this.currentPos),this.events.emit(`hold-start`,this.currentPos.clone()),!this.enabled||!this.isHolding)return;this.isHolding=!1;let e=this.createSpaceThrowVelocity();this.events.emit(`release`,e,this.currentPos.clone())}createSpaceThrowVelocity(){let e=new B().copy(this.camera.up);e.y=0,e.lengthSq()===0?e.set(0,0,-1):e.normalize();let t=e.multiplyScalar(12*Yh);return t.y=m,t.length()>12&&t.setLength(12),t}pushSample(e){this.samples.push({pos:this.currentPos.clone(),time:e})}projectToHoldPlane(e){let t=this.canvas.getBoundingClientRect();this.ndc.x=(e.clientX-t.left)/t.width*2-1,this.ndc.y=-((e.clientY-t.top)/t.height)*2+1,this.raycaster.setFromCamera(this.ndc,this.camera);let n=this.raycaster.ray.intersectPlane(this.holdPlane,this.tmpHit);return n?(this.currentPos.copy(n),this.clampCurrentPosToThrowZone(),!0):!1}clampCurrentPosToThrowZone(){let e=Math.max(0,16/2-n-r-g),t=Math.max(0,9/2-n-r-g);this.currentPos.x=Jh(this.currentPos.x,-e,e),this.currentPos.y=f,this.currentPos.z=Jh(this.currentPos.z,-t,t)}},$h=e=>{if(!(e instanceof Element))return!1;if(e.closest(`input, textarea, select, button`))return!0;let t=e.closest(`[contenteditable]`);return t instanceof HTMLElement&&t.isContentEditable},eg=class{events=new kp;enabled=!1;bindings;constructor(e=Th.controls){this.bindings={...e},window.addEventListener(`keydown`,this.onKeyDown)}setEnabled(e){this.enabled=e}setBindings(e){this.bindings={...e}}destroy(){this.enabled=!1,window.removeEventListener(`keydown`,this.onKeyDown)}onKeyDown=e=>{if(!this.enabled||e.repeat||e.defaultPrevented||$h(e.target))return;let t=this.actionForCode(e.code);t&&(e.preventDefault(),this.events.emit(t))};actionForCode(e){return e===this.bindings.selectAll?`select-all`:e===this.bindings.continueTurn?`continue`:e===this.bindings.bankTurn?`bank`:null}},tg=500,ng=`/assets/table/wood-cabinet-worn-long-1k/`,rg=`${ng}wood_cabinet_worn_long_diff_1k.jpg`,ig=`${ng}wood_cabinet_worn_long_nor_gl_1k.png`,ag=`${ng}wood_cabinet_worn_long_rough_1k.png`,og=1.04,sg=9.5,cg=1.1,lg=-5.8,ug=512,dg=9.5,fg=6.5,pg=25,mg=.48,hg=256,gg=2,_g=24,vg=()=>{if(new URLSearchParams(window.location.search).has(`perf`))return!0;try{return window.localStorage.getItem(`dice:perf`)===`1`}catch{return!1}},yg=class{scene;camera;renderer;physicsWorld;diceMaterial;tableMaterial;mode;dice;input;turnHotkeys;network;selection;hud;soloConfig;soloHud;currentRoomState=null;currentMatchState=null;soloState=null;localRolling=!1;localRestCorrectionPasses=0;localLastRolledFaces=[];networkLastRolledFaces=[];tableVisualMesh=null;tableTextures=[];lastTime=0;rafId=null;perf=null;constructor(e={}){this.mode=e.mode??`local`,this.network=e.network??null,this.soloConfig=this.mode===`local`?e.soloConfig??sh:null,this.scene=this.createScene(),this.camera=this.createCamera(),this.renderer=this.createRenderer(),this.mode===`local`?(this.physicsWorld=this.createPhysicsWorld(),this.diceMaterial=new rd(`dice`),this.tableMaterial=new rd(`table`),this.setupContactMaterials(),this.createPlayArea(!0)):(this.physicsWorld=null,this.diceMaterial=null,this.tableMaterial=null,this.createPlayArea(!1)),this.dice=new Op(this.scene,this.physicsWorld,this.diceMaterial,this.mode,{shadowsEnabled:this.areShadowsEnabled()}),this.dice.spawn(),this.perf=this.createPerfStats();let t=e.playerSettings??Th;if(this.input=new Qh(this.renderer.domElement,this.camera,t.controls.throwDice),this.turnHotkeys=new eg(t.controls),this.turnHotkeys.events.on(`select-all`,this.handleHotkeySelectAll),this.turnHotkeys.events.on(`continue`,this.handleHotkeyContinue),this.turnHotkeys.events.on(`bank`,this.handleHotkeyBank),this.input.events.on(`hold-start`,()=>{this.dice.pickup()}),this.input.events.on(`release`,(e,t)=>{this.dice.release(e,t),this.mode===`network`&&this.network?this.network.sendRelease(e,t):this.mode===`local`&&this.soloState&&!uh(this.soloState)&&(this.localRolling=!0,this.localRestCorrectionPasses=0,this.localLastRolledFaces=[],this.selection?.disable(),this.input.setEnabled(!1),this.syncTurnHotkeysEnabled(),this.soloHud?.clearRollResult(),this.soloHud?.setStatus(X(`rolling`)))}),this.mode===`network`&&this.network){this.soloHud=null;let e=this.network;e.events.on(`dice-spawn`,e=>{this.recordSnapshot(performance.now()),this.dice.applySnapshot(e.dice,performance.now())}),e.events.on(`dice-snapshot`,e=>{let t=performance.now();this.recordSnapshot(t),this.dice.applySnapshot(e.dice,t)}),e.events.on(`dice-rest`,e=>{let t=performance.now();this.recordSnapshot(t);let n=[0,0,0];this.dice.applySnapshot(e.dice.map(e=>({p:e.p,q:e.q,v:n,w:n})),t,{immediate:!0})}),this.currentRoomState=e.getRoomState();let t=e.getUserId()??``,n=this.currentRoomState?.mode===om.TEST;this.selection=n?null:new qh(this.renderer.domElement,this.camera,this.dice),this.hud=n?null:new wm(t),this.currentRoomState&&this.hud?.setRoomState(this.currentRoomState),e.events.on(`room-state`,e=>{this.currentRoomState=e,this.hud?.setRoomState(e),n&&this.input.setEnabled(this.canUseTestInput(t)),this.syncTurnHotkeysEnabled()}),n?(e.events.on(`match-state`,e=>{this.currentMatchState=e,this.input.setEnabled(this.canUseTestInput(t))}),this.input.setEnabled(this.canUseTestInput(t))):(e.events.on(`match-state`,e=>{this.currentMatchState=e,e.phase!==fm.SELECTING&&(this.networkLastRolledFaces=[]),this.hud?.setMatchState(e);let n=this.isOwnPlayer(t),r=e.currentPlayer===t,i=e.phase===fm.SELECTING,a=e.phase===fm.WAITING;!n||e.paused?(this.input.setEnabled(!1),this.selection?.disable()):r&&i?(this.input.setEnabled(!1),this.selection?.enable()):r&&a?(this.input.setEnabled(!0),this.selection?.disable()):(this.input.setEnabled(!1),this.selection?.disable()),this.syncTurnHotkeysEnabled()}),e.events.on(`match-roll-result`,e=>{e.bust?(this.networkLastRolledFaces=[],this.selection?.clearScoringOptions(),this.isRankedRoom()||this.hud?.showError(`BUST`)):(this.currentMatchState?.currentPlayer===t&&this.isOwnPlayer(t)?(this.networkLastRolledFaces=[...e.rolledFaces],this.selection?.setScoringOptions(e.rolledFaces,zp(e.rolledFaces),!this.isRankedRoom())):(this.networkLastRolledFaces=[],this.selection?.clearScoringOptions()),this.hud?.setRollResult(this.isRankedRoom()?[]:e.rolledFaces)),this.syncTurnHotkeysEnabled()}),e.events.on(`match-turn-result`,e=>{this.isRankedRoom()&&e.bust&&this.hud?.showError(`BUST`)}),this.selection?.events.on(`selection-changed`,(e,t,n)=>{this.hud?.setSelectionState(e.length,t,n)}),this.hud?.events.on(`continue-clicked`,this.handleNetworkContinue),this.hud?.events.on(`bank-clicked`,this.handleNetworkBank),this.input.setEnabled(!1))}else this.mode===`local`&&this.soloConfig?(this.hud=null,this.selection=new qh(this.renderer.domElement,this.camera,this.dice),this.selection.disable(),this.soloState=lh(this.soloConfig),this.soloHud=new Ch(this.soloConfig,this.soloState),this.input.setEnabled(!0),this.selection.events.on(`selection-changed`,(e,t,n)=>{this.soloHud?.setSelectionState(e.length,t,n)}),this.soloHud.events.on(`continue-clicked`,this.handleSoloContinue),this.soloHud.events.on(`bank-clicked`,this.handleSoloBank),this.soloHud.events.on(`reset-clicked`,this.resetSoloRun),this.soloHud.setStatus(X(`readyToRoll`))):(this.selection=null,this.hud=null,this.soloHud=null);window.addEventListener(`resize`,this.onResize)}finishSoloRoll(){let e=this.soloState,t=this.soloConfig;if(!e||!t||uh(e))return;this.localRolling=!1,this.localRestCorrectionPasses=0;let n=this.dice.getLocalActiveFaces();if(this.localLastRolledFaces=n,Vp(n)){this.soloState=ph(e,t),this.dice.resetLocalForNewTurn(),this.selection?.disable(),this.soloHud?.setState(this.soloState),this.soloHud?.clearRollResult(),this.soloHud?.showError(`BUST`),this.setSoloWaitingState();return}this.selection?.setScoringOptions(n,zp(n)),this.selection?.enable(),this.syncTurnHotkeysEnabled(),this.soloHud?.setRollResult(n),this.soloHud?.setStatus(X(`chooseScoringDice`))}handleSoloContinue=()=>{let e=this.soloState,t=this.soloConfig,n=this.selection;if(!e||!t||!n||uh(e))return;let r=Hp(this.localLastRolledFaces,n.getSelectedRollIndices());if(r.valid!==!0){this.soloHud?.showError(r.reason);return}let i=new Set(n.getSelectedIndices()),a=this.dice.getLocalActiveIndices().filter(e=>!i.has(e));this.soloState=dh(e,t,r.points,n.getSelectedIndices().length),a.length===0?this.dice.resetLocalForNewTurn():this.dice.setLocalActiveIndices(a),this.localLastRolledFaces=[],n.disable(),this.soloHud?.setState(this.soloState),this.soloHud?.clearRollResult(),this.setSoloWaitingState()};handleSoloBank=()=>{let e=this.soloState,t=this.soloConfig,n=this.selection;if(!e||!t||!n||uh(e))return;let r=Hp(this.localLastRolledFaces,n.getSelectedRollIndices());if(r.valid!==!0){this.soloHud?.showError(r.reason);return}this.soloState=fh(e,t,r.points,n.getSelectedIndices().length),this.dice.resetLocalForNewTurn(),this.localLastRolledFaces=[],n.disable(),this.soloHud?.setState(this.soloState),this.soloHud?.clearRollResult(),this.setSoloWaitingState()};resetSoloRun=()=>{let e=this.soloConfig;e&&(this.localRolling=!1,this.localRestCorrectionPasses=0,this.localLastRolledFaces=[],this.networkLastRolledFaces=[],this.soloState=lh(e),this.dice.resetLocalForNewTurn(),this.selection?.disable(),this.soloHud?.setState(this.soloState),this.soloHud?.clearRollResult(),this.setSoloWaitingState())};setSoloWaitingState(){let e=this.soloState;if(!e)return;let t=!uh(e);this.input.setEnabled(t),this.syncTurnHotkeysEnabled(),t?this.soloHud?.setStatus(X(`readyToRoll`)):this.soloHud?.setStatus(``)}handleLocalActiveRest(){if(this.localRolling){if(this.localRestCorrectionPasses<3&&this.dice.resolveLocalRestAmbiguities()){this.localRestCorrectionPasses+=1;return}this.finishSoloRoll()}}handleHotkeySelectAll=()=>{this.canUseTurnHotkeys()&&this.selection?.selectAllAvailable()};handleHotkeyContinue=()=>{if(this.mode===`local`){if(!this.canSubmitSoloSelection())return;this.handleSoloContinue();return}!this.canUseNetworkHotkeys()||!this.canSubmitNetworkSelection()||this.handleNetworkContinue()};handleHotkeyBank=()=>{if(this.mode===`local`){if(!this.canSubmitSoloSelection())return;this.handleSoloBank();return}!this.canUseNetworkHotkeys()||!this.canSubmitNetworkBank()||this.handleNetworkBank()};handleNetworkContinue=()=>{let e=this.selection,t=this.network;if(!e||!t||!this.canSubmitNetworkSelection())return;let n=e.getSelectedIndices();t.sendSelectDice(n).then(()=>{this.networkLastRolledFaces=[],e.clear(),this.syncTurnHotkeysEnabled()}).catch(e=>this.hud?.showError(e.message))};handleNetworkBank=()=>{let e=this.selection,t=this.network;if(!e||!t||!this.canSubmitNetworkBank())return;let n=e.getSelectedIndices();t.sendBank(n).then(()=>{this.networkLastRolledFaces=[],e.clear(),this.syncTurnHotkeysEnabled()}).catch(e=>this.hud?.showError(e.message))};syncTurnHotkeysEnabled(){this.turnHotkeys.setEnabled(this.canUseTurnHotkeys())}canUseTurnHotkeys(){return this.mode===`local`?this.canUseSoloHotkeys():this.canUseNetworkHotkeys()}canUseSoloHotkeys(){let e=this.soloState;return this.mode===`local`&&e!==null&&!uh(e)&&!this.localRolling&&this.selection!==null&&this.localLastRolledFaces.length>0}canUseNetworkSelectionControls(){let e=this.currentMatchState,t=this.network?.getUserId()??``;return this.mode===`network`&&this.selection!==null&&e!==null&&!e.paused&&e.phase===fm.SELECTING&&e.currentPlayer===t&&this.isOwnPlayer(t)&&this.networkLastRolledFaces.length>0}canUseNetworkHotkeys(){return this.canUseNetworkSelectionControls()&&!this.isRankedRoom()}canSubmitSoloSelection(){let e=this.selection;return!this.canUseSoloHotkeys()||!e?!1:Hp(this.localLastRolledFaces,e.getSelectedRollIndices()).valid===!0}getNetworkSelectionPoints(){let e=this.selection;if(!this.canUseNetworkSelectionControls()||!e)return null;let t=Hp(this.networkLastRolledFaces,e.getSelectedRollIndices());return t.valid===!0?t.points:null}canSubmitNetworkSelection(){return this.getNetworkSelectionPoints()!==null}canSubmitNetworkBank(){let e=this.getNetworkSelectionPoints(),t=this.currentMatchState;if(e===null||t===null)return!1;let n=this.currentRoomState?.options.minBank??cm.minBank;return t.turnPoints+e>=n}isOwnPlayer(e){return this.currentRoomState?.members.find(t=>t.userId===e)?.role===im.PLAYER}isRankedRoom(){return this.currentRoomState?.mode===om.RANKED}canUseTestInput(e){let t=this.currentRoomState?.members.find(t=>t.userId===e),n=this.currentRoomState?.status===am.ACTIVE,r=this.currentMatchState?.phase===fm.ROLLING,i=this.currentMatchState?.paused===!0||this.currentRoomState?.status===am.PAUSED;return t?.role===im.PLAYER&&t.online&&n&&!i&&!r}start(){this.lastTime=performance.now(),this.rafId=requestAnimationFrame(this.gameLoop)}stop(){this.rafId!==null&&cancelAnimationFrame(this.rafId),this.rafId=null}destroy(){this.stop(),window.removeEventListener(`resize`,this.onResize),this.turnHotkeys.destroy(),this.input.destroy(),this.selection?.destroy(),this.hud?.destroy(),this.soloHud?.destroy(),this.perf?.el.remove(),this.renderer.domElement.remove(),this.renderer.dispose()}setPlayerSettings(e){this.input.setThrowKeyCode(e.controls.throwDice),this.turnHotkeys.setBindings(e.controls)}areShadowsEnabled(){return this.mode===`local`}createScene(){let e=new Li;e.background=new U(1710626);let t=this.areShadowsEnabled(),n=new Na(15790847,.46),r=new Ma(16774618,.72);r.position.set(.001,sg,lg),r.castShadow=t,t&&(r.shadow.mapSize.width=ug,r.shadow.mapSize.height=ug,r.shadow.bias=-1e-4,r.shadow.normalBias=0,r.shadow.radius=2,r.shadow.camera.left=-dg,r.shadow.camera.right=dg,r.shadow.camera.top=fg,r.shadow.camera.bottom=-fg,r.shadow.camera.near=.5,r.shadow.camera.far=pg);let i=new ka(16773584,1.4,14,1.2);return i.position.set(0,4-cg,lg),e.add(n),e.add(r),e.add(i),e}createCamera(){let e=new Oi(45,window.innerWidth/window.innerHeight,.1,200);return e.up.set(...v),e.position.set(0,this.computeCameraY(e.aspect),0),e.lookAt(..._),e}createRenderer(){let e=new rl({antialias:!1,powerPreference:`high-performance`});return e.domElement.style.width=`100vw`,e.domElement.style.height=`100vh`,e.domElement.style.imageRendering=`pixelated`,e.setPixelRatio(1),this.setRendererPixelSize(e),e.shadowMap.enabled=this.areShadowsEnabled(),e.shadowMap.enabled&&(e.shadowMap.type=0),e}setRendererPixelSize(e){let t=Math.max(320,Math.floor(window.innerWidth*mg)),n=Math.max(180,Math.floor(window.innerHeight*mg));e.setSize(t,n,!1)}createPhysicsWorld(){let e=new Pf({gravity:new K(0,-25,0)});return e.broadphase=new Nu(e),e.quatNormalizeSkip=2,e.allowSleep=!0,e.solver.iterations=10,e}setupContactMaterials(){!this.physicsWorld||!this.diceMaterial||!this.tableMaterial||(this.physicsWorld.addContactMaterial(new nd(this.diceMaterial,this.tableMaterial,{friction:.45,restitution:.35,contactEquationStiffness:1e8,contactEquationRelaxation:3})),this.physicsWorld.addContactMaterial(new nd(this.diceMaterial,this.diceMaterial,{friction:.35,restitution:.12})))}computeCameraY(e=this.camera.aspect){let t=Math.tan(45*Math.PI/360),n=9/2/t,r=16/2/(t*e);return Math.max(n,r)}createPlayArea(e){this.createTable(e),this.createWalls(e),e&&this.createCeiling()}createTable(t){let n=new fi(new hi(1,e,1),new Zi({color:16777215,map:this.createTableTexture(rg,wt,!0),normalMap:this.createTableTexture(ig),roughnessMap:this.createTableTexture(ag),roughness:1,metalness:0,normalScale:new z(.35,.35),flatShading:!0}));if(n.position.set(0,-e/2,0),n.receiveShadow=this.areShadowsEnabled(),this.scene.add(n),this.tableVisualMesh=n,this.updateVisualTableSize(),t&&this.physicsWorld&&this.tableMaterial){let t=new Y({mass:0,shape:new wl(new K(16/2,e/2,9/2)),material:this.tableMaterial,position:new K(0,-e/2,0)});this.physicsWorld.addBody(t)}}createTableTexture(e,t,n=!1){let r=new ya().load(e,e=>{n&&this.applyPs1TablePalette(e)});return r.wrapS=ue,r.wrapT=ue,r.repeat.set(1,1),r.magFilter=pe,r.minFilter=pe,r.generateMipmaps=!1,r.anisotropy=1,t&&(r.colorSpace=t),this.tableTextures.push(r),r}applyPs1TablePalette(e){let t=e.image;if(!t||t.naturalWidth<=0||t.naturalHeight<=0)return;let n=document.createElement(`canvas`);n.width=hg,n.height=hg;let r=n.getContext(`2d`);r.imageSmoothingEnabled=!1,r.drawImage(t,0,0,n.width,n.height);let i=r.getImageData(0,0,n.width,n.height);for(let e=0;e<i.data.length;e+=4){let t=e/4,r=((t%n.width+Math.floor(t/n.width))%2==0?1:-1)*gg;i.data[e]=this.quantizeTableChannel(i.data[e],r),i.data[e+1]=this.quantizeTableChannel(i.data[e+1],r),i.data[e+2]=this.quantizeTableChannel(i.data[e+2],r)}r.putImageData(i,0,0),e.image=n,e.wrapS=ue,e.wrapT=ue,e.magFilter=pe,e.minFilter=pe,e.generateMipmaps=!1,e.needsUpdate=!0}quantizeTableChannel(e,t){return Math.max(0,Math.min(255,Math.round((e+t)/_g)*_g))}updateVisualTableSize(){if(!this.tableVisualMesh)return;let e=Math.tan(45*Math.PI/360),t=this.camera.position.y*2*e,n=t*this.camera.aspect,r=Math.max(16,n)*og,i=Math.max(9,t)*og;this.tableVisualMesh.scale.set(r,1,i);for(let e of this.tableTextures)e.repeat.set(r/16,i/9)}createWalls(e){let r=16/2-n,i=9/2-n,a=t/2,o=[{halfExtents:[r+a,2,a],pos:[0,2,-i-a]},{halfExtents:[r+a,2,a],pos:[0,2,i+a]},{halfExtents:[a,2,i+a],pos:[r+a,2,0]},{halfExtents:[a,2,i+a],pos:[-r-a,2,0]}];if(!(!e||!this.physicsWorld||!this.tableMaterial))for(let e of o){let t=new Y({mass:0,shape:new wl(new K(...e.halfExtents)),material:this.tableMaterial,position:new K(...e.pos)});this.physicsWorld.addBody(t)}}createCeiling(){if(!this.physicsWorld||!this.tableMaterial)return;let e=16/2-n,r=9/2-n,i=t/2,a=new Y({mass:0,shape:new wl(new K(e,i,r)),material:this.tableMaterial,position:new K(0,4+i,0)});this.physicsWorld.addBody(a)}onResize=()=>{this.camera.aspect=window.innerWidth/window.innerHeight,this.camera.position.y=this.computeCameraY(),this.camera.lookAt(..._),this.camera.updateProjectionMatrix(),this.setRendererPixelSize(this.renderer),this.updateVisualTableSize()};gameLoop=()=>{let e=performance.now(),t=e,n=(t-this.lastTime)/1e3;this.lastTime=t,(n>.1||Number.isNaN(n)||!Number.isFinite(n))&&(n=1/60);let r=performance.now();this.input.update(t),this.mode===`local`&&this.physicsWorld?(this.physicsWorld.step(1/60,n,3),this.dice.syncMeshes(),this.localRolling&&this.dice.areLocalActiveDiceAtRest()&&this.handleLocalActiveRest()):this.dice.extrapolate(t);let i=performance.now()-r,a=performance.now();this.renderer.render(this.scene,this.camera);let o=performance.now()-a;this.updatePerfStats(performance.now(),performance.now()-e,i,o),this.rafId=requestAnimationFrame(this.gameLoop)};createPerfStats(){if(!vg())return null;let e=document.createElement(`div`);return e.style.cssText=[`position:fixed`,`left:8px`,`bottom:8px`,`z-index:50`,`padding:6px 8px`,`border-radius:6px`,`background:rgba(0,0,0,.72)`,`color:#dfffe0`,`font:12px/1.35 monospace`,`white-space:pre`,`pointer-events:none`].join(`;`),e.textContent=`perf...`,document.body.appendChild(e),{el:e,lastUiMs:performance.now(),frames:0,frameMs:0,simMs:0,renderMs:0,lastSnapshotMs:0,snapshotGapMs:0,snapshotGaps:0,maxSnapshotGapMs:0}}recordSnapshot(e){let t=this.perf;if(t){if(t.lastSnapshotMs>0){let n=e-t.lastSnapshotMs;t.snapshotGapMs+=n,t.snapshotGaps+=1,t.maxSnapshotGapMs=Math.max(t.maxSnapshotGapMs,n)}t.lastSnapshotMs=e}}updatePerfStats(e,t,n,r){let i=this.perf;if(!i)return;i.frames+=1,i.frameMs+=t,i.simMs+=n,i.renderMs+=r;let a=e-i.lastUiMs;if(a<tg)return;let o=Math.max(1,i.frames),s=i.frames*1e3/a,c=i.snapshotGaps>0?i.snapshotGapMs/i.snapshotGaps:0;i.el.textContent=[`fps ${s.toFixed(0)}  frame ${(i.frameMs/o).toFixed(1)}ms`,`sim ${(i.simMs/o).toFixed(2)}ms  render ${(i.renderMs/o).toFixed(2)}ms`,`calls ${this.renderer.info.render.calls}  tris ${this.renderer.info.render.triangles}`,`snap gap ${c.toFixed(1)}ms  max ${i.maxSnapshotGapMs.toFixed(1)}ms`].join(`
`),i.lastUiMs=e,i.frames=0,i.frameMs=0,i.simMs=0,i.renderMs=0,i.snapshotGapMs=0,i.snapshotGaps=0,i.maxSnapshotGapMs=0}},bg=`dice.userId`,xg=`dice.displayName`,Sg=`auth-controls`,Cg=`auth-modal`,wg=`settings-modal`,Tg=`back-button`,Eg=`room-badge`,Dg=`lang-controls`,Og=`room-list-modal`,kg=`leaderboard-panel`,Ag=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,jg={en:`/assets/lang/united-kingdom.png`,ru:`/assets/lang/russia.png`},Mg=Z(35),Ng={en:`English`,ru:`Русский`},Pg=()=>{let e=globalThis.crypto;if(typeof e.randomUUID==`function`)return e.randomUUID();let t=new Uint8Array(16);e.getRandomValues(t),t[6]=t[6]&15|64,t[8]=t[8]&63|128;let n=Array.from(t,e=>e.toString(16).padStart(2,`0`));return`${n.slice(0,4).join(``)}-${n.slice(4,6).join(``)}-${n.slice(6,8).join(``)}-${n.slice(8,10).join(``)}-${n.slice(10,16).join(``)}`},Fg=()=>{let e=localStorage.getItem(bg);return e||(e=Pg(),localStorage.setItem(bg,e)),e},Ig=()=>localStorage.getItem(xg)??``,Lg=e=>{let t=e.trim().slice(0,32)||`Player`;return localStorage.setItem(xg,t),t},Rg=document.getElementById(`app`);if(!Rg)throw Error(`#app element not found`);var zg=()=>navigator.userAgentData?.mobile===!0||Ag.test(navigator.userAgent)||navigator.platform===`MacIntel`&&navigator.maxTouchPoints>1?!0:window.matchMedia(`(max-width: 920px) and (pointer: coarse)`).matches,Bg=()=>{document.title=X(`mobileSoon`),Rg.replaceChildren();let e=document.createElement(`main`);Object.assign(e.style,{minHeight:`100vh`,display:`grid`,placeItems:`center`,padding:`24px`,boxSizing:`border-box`,background:`#111`,color:`#f4f4f5`,fontFamily:Q.ui,textAlign:`center`});let t=document.createElement(`h1`);t.textContent=X(`mobileSoon`),Object.assign(t.style,{margin:`0`,maxWidth:`14ch`,fontSize:$.mobileTitle,lineHeight:`1.05`,fontWeight:`800`}),e.appendChild(t),Rg.appendChild(e)},Vg=zg();Vg&&Bg();var Hg=null,Ug=null,Wg=`home`;Rh(e=>{Hg?.setPlayerSettings(e)});var Gg=(e=sh)=>{Jg(),Yg(),Xg(),Zg(),t_();let t=new yg({mode:`local`,soloConfig:e,playerSettings:Lh()});Rg.appendChild(t.renderer.domElement),t.start(),Hg=t,i_()},Kg=async(e,t,n,r=om.MATCH,i,a)=>{let o=await qg(t);Ug=o;let s;try{s=e===`create`?await o.createRoom(r,i,a):await o.joinRoom(n)}catch(e){throw Ug===o&&(Ug=null),o.disconnect(),e}Jg(),Xg(),Zg(),c_(o,s)},qg=async e=>{let t=new ih,n=await le(),r=n?n.displayName:Lg(e),i=n??{userId:Fg(),displayName:r,accessToken:void 0,authenticated:!1};return t.events.on(`room-state`,e=>{c_(t,e)}),await t.connect(i.userId,i.displayName,i.accessToken),t},Jg=()=>{let e=document.getElementById(`lobby`);e&&e.remove()},Yg=()=>{let e=document.getElementById(`room-screen`);e&&e.remove()},Xg=()=>{let e=document.getElementById(Sg);e&&e.remove()},Zg=()=>{let e=document.getElementById(Cg);e&&e.remove()},Qg=()=>{let e=document.getElementById(wg);e&&e.remove()},$g=()=>{let e=document.getElementById(Og);e&&e.remove()},e_=()=>{let e=document.getElementById(Tg);e&&e.remove()},t_=()=>{let e=document.getElementById(Eg);e&&e.remove()},n_=()=>{let e=document.getElementById(Dg);e&&e.remove()},r_=()=>{Hg?.destroy(),Hg=null,Ug?.disconnect(),Ug=null,Jg(),Yg(),t_(),e_(),Zg(),Qg(),$g(),O_()},i_=()=>{e_();let e=document.createElement(`div`);e.id=Tg,Object.assign(e.style,{position:`fixed`,right:`12px`,bottom:`12px`,display:`flex`,gap:`8px`,zIndex:`35`});let t=P_(X(`controls`),b_);Object.assign(t.style,{background:`rgba(82,82,91,0.9)`,border:`1px solid rgba(255,255,255,0.18)`,boxShadow:`0 8px 22px rgba(0,0,0,0.35)`}),e.appendChild(t);let n=P_(X(`back`),r_);Object.assign(n.style,{background:`rgba(15,15,22,0.86)`,border:`1px solid rgba(255,255,255,0.22)`,boxShadow:`0 8px 22px rgba(0,0,0,0.35)`}),e.appendChild(n),document.body.appendChild(e)},a_=()=>{if(Vg){Bg(),o_();return}if(o_(),Hg)return;let e=Ug?.getRoomState();if(Ug&&e){c_(Ug,e);return}switch(Wg){case`solo`:k_();break;case`multiplayer`:A_();break;default:O_();break}},o_=()=>{n_();let e=document.createElement(`div`);e.id=Dg,Object.assign(e.style,{position:`fixed`,top:`12px`,right:`12px`,display:`flex`,gap:`0`,padding:`0`,background:`rgba(12,12,18,0.78)`,border:`1px solid rgba(255,255,255,0.12)`,borderRadius:`8px`,zIndex:`45`,fontFamily:Q.ui});let t=qp();for(let n of[`en`,`ru`]){let r=document.createElement(`button`);r.type=`button`,r.title=Ng[n],r.setAttribute(`aria-label`,Ng[n]),r.setAttribute(`aria-pressed`,String(t===n)),Object.assign(r.style,{padding:`0`,display:`grid`,placeItems:`center`,background:t===n?`rgba(59,130,246,0.28)`:`transparent`,color:`#fff`,border:`none`,borderRadius:`5px`,cursor:`pointer`,fontFamily:Q.ui,lineHeight:`1`,width:Mg,height:Mg,boxSizing:`border-box`,overflow:`hidden`});let i=document.createElement(`img`);i.src=jg[n],i.alt=``,i.draggable=!1,Object.assign(i.style,{width:`100%`,height:`100%`,display:`block`,objectFit:`cover`,pointerEvents:`none`}),r.appendChild(i),r.addEventListener(`click`,()=>{qp()!==n&&Jp(n)}),e.appendChild(r)}document.body.appendChild(e)},s_=(e,t,n)=>{let r=document.getElementById(Eg);r||(r=document.createElement(`div`),r.id=Eg,document.body.appendChild(r)),r.id=Eg,r.textContent=`${n||X(`room`)}: ${e} · ${t}`,Object.assign(r.style,{position:`fixed`,top:`12px`,left:`12px`,padding:`6px 10px`,background:`rgba(0,0,0,0.55)`,color:`#eee`,fontFamily:Q.ui,fontSize:$.badge,borderRadius:`6px`,zIndex:`10`,userSelect:`text`})},c_=(e,t)=>{if(t.status===am.WAITING){l_(e,t);return}Jg(),Yg(),s_(t.code,t.mode===om.TEST?X(`test`):f_(t.status),t.gameName),i_(),o_(),Hg||(Hg=new yg({mode:`network`,network:e,playerSettings:Lh()}),Rg.appendChild(Hg.renderer.domElement),Hg.start())},l_=(e,t)=>{Jg(),Xg(),Yg(),i_();let n=document.createElement(`div`);n.id=`room-screen`,Object.assign(n.style,{position:`fixed`,inset:`0`,display:`flex`,alignItems:`center`,justifyContent:`center`,background:`rgba(10,10,15,0.9)`,zIndex:`20`,fontFamily:Q.ui,color:`#eee`});let r=document.createElement(`div`);Object.assign(r.style,{width:`min(460px, calc(100vw - 32px))`,padding:`22px`,background:`#1c1c24`,borderRadius:`8px`,boxShadow:`0 12px 32px rgba(0,0,0,0.5)`,display:`flex`,flexDirection:`column`,gap:`16px`});let i=document.createElement(`div`);i.textContent=`${t.gameName||X(`room`)} · ${t.code}`,Object.assign(i.style,{fontSize:$.roomTitle,fontWeight:`700`}),r.appendChild(i);let a=document.createElement(`div`);a.textContent=t.ownerId===e.getUserId()?X(`roomOwner`):X(`waitingForStart`),Object.assign(a.style,{color:`#b8b8c8`,fontSize:$.roomText,lineHeight:`1.4`}),r.appendChild(a);let o=document.createElement(`div`);o.textContent=`${p_(t.mode)} · ${m_(t.options)}`,Object.assign(o.style,{padding:`8px`,background:`rgba(255,255,255,0.06)`,borderRadius:`6px`,color:`#d8d8e8`,fontSize:$.roomMeta}),r.appendChild(o),r.appendChild(u_(X(`players`),t,im.PLAYER,e.getUserId())),r.appendChild(u_(X(`spectators`),t,im.SPECTATOR,e.getUserId()));let s=document.createElement(`div`);Object.assign(s.style,{color:`#f66`,fontSize:$.roomMeta,minHeight:`18px`});let c=P_(X(`startGame`),()=>{c.disabled=!0,e.startRoom().then(t=>c_(e,t)).catch(e=>{c.disabled=!1,s.textContent=e.message})});c.disabled=t.ownerId!==e.getUserId(),c.disabled&&(c.style.opacity=`0.45`,c.style.cursor=`default`),r.appendChild(c),r.appendChild(s),n.appendChild(r),document.body.appendChild(n)},u_=(e,t,n,r)=>{let i=document.createElement(`div`),a=document.createElement(`div`);a.textContent=e,Object.assign(a.style,{fontWeight:`700`,marginBottom:`6px`}),i.appendChild(a);let o=t.members.filter(e=>e.role===n),s=document.createElement(`div`);if(Object.assign(s.style,{display:`flex`,flexDirection:`column`,gap:`6px`}),o.length===0){let e=document.createElement(`div`);e.textContent=`—`,e.style.color=`#777`,s.appendChild(e)}else for(let e of o){let t=document.createElement(`div`);t.textContent=`${d_(e.displayName,e.userId,r)} · ${e.online?X(`online`):X(`offline`)}`,Object.assign(t.style,{padding:`6px 8px`,background:`rgba(255,255,255,0.06)`,borderRadius:`6px`,color:e.online?`#eee`:`#888`}),s.appendChild(t)}return i.appendChild(s),i},d_=(e,t,n)=>{let r=e||(t.length<=8?t:t.slice(0,8));return t===n?`${r} (${X(`youSuffix`)})`:r},f_=e=>{switch(e){case am.WAITING:return X(`waiting`);case am.ACTIVE:return X(`active`);case am.PAUSED:return X(`paused`);case am.FINISHED:return X(`finished`);default:return X(`unknown`)}},p_=e=>{switch(e){case om.RANKED:return X(`ranked`);case om.TEST:return X(`testRoom`);case om.MATCH:default:return X(`match`)}},m_=(e=cm)=>{let t=e.minBank>0?e.minBank:X(`noValue`);return`${X(`target`)}: ${e.targetScore} · ${X(`minBank`)}: ${t} · ${X(`hotDice`)}: ${X(`enabled`)}`},h_=e=>{Object.assign(e.style,{flex:`0 0 ${rm.authButtonWidth}`,width:rm.authButtonWidth,height:rm.authButtonHeight,padding:`0 ${Z(8)}`,fontSize:$.auth})},g_=e=>{Object.assign(e.style,{flex:`0 0 ${rm.authIconButtonSize}`,width:rm.authIconButtonSize,height:rm.authIconButtonSize,padding:`0`,borderRadius:`999px`,fontSize:$.menuButton})},__=()=>{Xg();let e=document.createElement(`div`);e.id=Sg,Object.assign(e.style,{position:`fixed`,top:`12px`,left:`12px`,display:`flex`,alignItems:`center`,gap:`8px`,padding:`8px`,background:`rgba(12,12,18,0.78)`,border:`1px solid rgba(255,255,255,0.12)`,borderRadius:`8px`,color:`#eee`,fontFamily:Q.ui,fontSize:$.auth,zIndex:`30`});let t=ee();if(t){let n=document.createElement(`span`);n.textContent=t.username,Object.assign(n.style,{fontFamily:Q.title,fontSize:$.playerName,fontWeight:`400`,lineHeight:`1`,letterSpacing:`0.04em`}),e.appendChild(n);let r=P_(`×`,()=>{se().then(()=>zh()).then(()=>{__(),O_()}).catch(F_)});r.title=X(`authLogout`),r.setAttribute(`aria-label`,X(`authLogout`)),r.style.background=`transparent`,r.style.border=`none`,r.style.color=`#b8b8c8`,g_(r),e.appendChild(r)}else{let t=P_(X(`authRegister`),()=>v_(`register`));t.style.background=`#16a34a`,h_(t),e.appendChild(t);let n=P_(X(`authLogin`),()=>v_(`login`));n.style.background=`transparent`,n.style.border=`1px solid #555`,h_(n),e.appendChild(n)}let n=P_(X(`controls`),b_);n.style.background=`#52525b`,h_(n),e.appendChild(n),document.body.appendChild(e)},v_=e=>{Zg();let t=document.createElement(`div`);t.id=Cg,Object.assign(t.style,{position:`fixed`,inset:`0`,display:`flex`,alignItems:`center`,justifyContent:`center`,background:`rgba(0,0,0,0.58)`,zIndex:`40`,fontFamily:Q.ui});let n=document.createElement(`div`);Object.assign(n.style,{width:`min(340px, calc(100vw - 32px))`,display:`flex`,flexDirection:`column`,gap:`12px`,padding:`22px`,background:`#1c1c24`,color:`#eee`,borderRadius:`8px`,boxShadow:`0 12px 32px rgba(0,0,0,0.5)`});let r=document.createElement(`h2`);r.textContent=X(e===`register`?`authRegister`:`authLogin`),Object.assign(r.style,{margin:`0`,fontFamily:Q.title,fontSize:$.title}),n.appendChild(r);let i=j_(X(`username`));i.maxLength=32,n.appendChild(i);let a=j_(X(`password`));a.type=`password`,a.maxLength=128,n.appendChild(a);let o=document.createElement(`div`);Object.assign(o.style,{minHeight:`16px`,color:`#f66`,fontSize:$.error}),n.appendChild(o);let s=document.createElement(`div`);Object.assign(s.style,{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`8px`});let c=P_(X(e===`register`?`authCreate`:`authLogin`),()=>{o.textContent=``,c.disabled=!0,(e===`register`?ie({username:i.value,password:a.value,guestId:Fg()}):ae({username:i.value,password:a.value})).then(e=>(Lg(e.user.username),zh())).then(()=>{Zg(),__(),O_()}).catch(e=>{c.disabled=!1,o.textContent=e.message})});s.appendChild(c);let l=P_(X(`authCancel`),()=>Zg());l.style.background=`transparent`,l.style.border=`1px solid #555`,s.appendChild(l),n.appendChild(s),t.addEventListener(`click`,e=>{e.target===t&&Zg()}),n.addEventListener(`click`,e=>e.stopPropagation()),t.appendChild(n),document.body.appendChild(t),i.focus()},y_=e=>{switch(e){case`throwDice`:return X(`throwDice`);case`selectAll`:return X(`selectAllAction`);case`continueTurn`:return X(`continueAction`);case`bankTurn`:return X(`bankAction`)}},b_=()=>{Qg();let e={...Lh().controls},t=null,n=!1,r=new Map,i=document.createElement(`div`);i.id=wg,Object.assign(i.style,{position:`fixed`,inset:`0`,display:`flex`,alignItems:`center`,justifyContent:`center`,background:`rgba(0,0,0,0.58)`,zIndex:`45`,fontFamily:Q.ui});let a=document.createElement(`div`);Object.assign(a.style,{width:`min(420px, calc(100vw - 32px))`,display:`flex`,flexDirection:`column`,gap:`12px`,padding:`22px`,background:`#1c1c24`,color:`#eee`,borderRadius:`8px`,boxShadow:`0 12px 32px rgba(0,0,0,0.5)`});let o=document.createElement(`h2`);o.textContent=X(`controlsTitle`),Object.assign(o.style,{margin:`0`,fontFamily:Q.title,fontSize:$.title}),a.appendChild(o);let s=document.createElement(`div`);Object.assign(s.style,{display:`grid`,gap:`8px`});for(let e of wh){let n=P_(``,()=>{t=e,h()});Object.assign(n.style,{width:`100%`,justifyContent:`space-between`,background:`#111`,border:`1px solid #444`}),r.set(e,n),s.appendChild(n)}a.appendChild(s);let c=document.createElement(`div`);Object.assign(c.style,{minHeight:Z(16),color:`#f66`,fontSize:$.error}),a.appendChild(c);let l=document.createElement(`div`);Object.assign(l.style,{display:`grid`,gridTemplateColumns:`1fr 1fr 1fr`,gap:`8px`});let u=P_(X(`resetDefaults`),()=>{e={...Th.controls},t=null,h()});u.style.background=`#52525b`,l.appendChild(u);let d=P_(X(`authCancel`),()=>m());d.style.background=`transparent`,d.style.border=`1px solid #555`,l.appendChild(d);let f=P_(X(`save`),()=>{let t={version:1,controls:{...e}};!Ih(t).valid||n||(n=!0,f.disabled=!0,Bh(t).then(()=>m()).catch(e=>{n=!1,c.textContent=e.message,h()}))});l.appendChild(f),a.appendChild(l);let p=n=>{if(t){if(n.preventDefault(),n.stopPropagation(),!Nh(n.code)){c.textContent=X(`invalidControlKey`);return}e={...e,[t]:n.code},t=null,h()}};function m(){window.removeEventListener(`keydown`,p,!0),Qg()}function h(){for(let n of wh){let i=r.get(n);i&&(i.textContent=t===n?`${y_(n)}: ${X(`pressKey`)}`:`${y_(n)}: ${Ph(e[n])}`)}let i=Ih({version:1,controls:{...e}});c.textContent=i.valid?``:X(`duplicateControls`),f.disabled=!i.valid||n,f.style.opacity=f.disabled?`0.4`:`1`,f.style.cursor=f.disabled?`not-allowed`:`pointer`}i.addEventListener(`click`,e=>{e.target===i&&m()}),a.addEventListener(`click`,e=>e.stopPropagation()),window.addEventListener(`keydown`,p,!0),i.appendChild(a),document.body.appendChild(i),h()},x_=(e=340)=>{Jg(),e_(),t_();let t=document.createElement(`div`);t.id=`lobby`,Object.assign(t.style,{position:`fixed`,inset:`0`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:Z(22),background:`rgba(10,10,15,0.85)`,zIndex:`20`});let n=document.createElement(`div`);return Object.assign(n.style,{display:`flex`,flexDirection:`column`,gap:Z(12),padding:Z(24),width:Z(e),maxWidth:`calc(100vw - 32px)`,boxSizing:`border-box`,background:`#1c1c24`,borderRadius:`8px`,color:`#eee`,fontFamily:Q.ui,fontSize:$.card,boxShadow:`0 12px 32px rgba(0,0,0,0.5)`}),t.appendChild(n),document.body.appendChild(t),n},S_=e=>{let t=document.createElement(`div`);t.textContent=`FARKLEPIT`,Object.assign(t.style,{color:`#f4f4f5`,fontFamily:Q.title,fontSize:$.logo,fontWeight:`800`,letterSpacing:`0.08em`,textTransform:`uppercase`,textAlign:`center`}),e.parentElement?.insertBefore(t,e)},C_=(e,t)=>{let n=document.createElement(`h2`);n.textContent=t,Object.assign(n.style,{margin:`0`,fontFamily:Q.title,fontSize:$.title,lineHeight:`1.2`}),e.appendChild(n)},w_=e=>{let t=document.createElement(`div`);return t.id=`lobby-error`,Object.assign(t.style,{color:`#f66`,fontSize:$.error,minHeight:Z(16)}),e.appendChild(t),t},T_=()=>{let e=document.getElementById(`lobby`);if(!e)return;let t=document.createElement(`aside`);t.id=kg,Object.assign(t.style,{position:`fixed`,top:`50%`,right:`calc(50% + 220px)`,transform:`translateY(-50%)`,width:`260px`,maxWidth:`calc(50vw - 240px)`,padding:Z(14),boxSizing:`border-box`,background:`rgba(28,28,36,0.92)`,border:`1px solid rgba(255,255,255,0.08)`,borderRadius:`8px`,color:`#eee`,fontFamily:Q.ui,fontSize:$.card,boxShadow:`0 12px 32px rgba(0,0,0,0.35)`,lineHeight:`1.35`});let n=document.createElement(`div`);n.textContent=X(`leaderboard`),Object.assign(n.style,{marginBottom:Z(10),fontWeight:`700`}),t.appendChild(n);let r=document.createElement(`div`);r.textContent=X(`connecting`),Object.assign(r.style,{display:`flex`,flexDirection:`column`,gap:Z(6)}),t.appendChild(r),e.appendChild(t),ce(10).then(e=>{if(document.getElementById(kg)){if(r.replaceChildren(),e.length===0){r.textContent=`—`;return}for(let[t,n]of e.entries()){let e=document.createElement(`div`);e.textContent=`${t+1}. ${n.displayName||n.username}: ${n.rating} · ${n.wins}/${n.losses}`,Object.assign(e.style,{padding:`4px 0`,borderBottom:`1px solid rgba(255,255,255,0.06)`,color:t===0?`#facc15`:`#eee`}),r.appendChild(e)}}}).catch(()=>{document.getElementById(kg)&&(r.textContent=`—`)})},E_=e=>{$g();let t=document.createElement(`div`);t.id=Og,Object.assign(t.style,{position:`fixed`,inset:`0`,display:`flex`,alignItems:`center`,justifyContent:`center`,background:`rgba(0,0,0,0.62)`,zIndex:`42`,fontFamily:Q.ui,color:`#eee`});let n=document.createElement(`div`);Object.assign(n.style,{width:`min(760px, calc(100vw - 32px))`,maxHeight:`min(680px, calc(100vh - 32px))`,overflow:`auto`,padding:Z(18),background:`#1c1c24`,borderRadius:`8px`,boxShadow:`0 12px 32px rgba(0,0,0,0.5)`,display:`flex`,flexDirection:`column`,gap:Z(12)});let r=document.createElement(`div`);Object.assign(r.style,{display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:Z(12)});let i=document.createElement(`h2`);i.textContent=X(`lobbies`),Object.assign(i.style,{margin:`0`,fontFamily:Q.title,fontSize:$.title}),r.appendChild(i);let a=P_(X(`close`),()=>{s?.disconnect(),$g()});a.style.background=`transparent`,a.style.border=`1px solid #555`,r.appendChild(a),n.appendChild(r);let o=document.createElement(`div`);o.textContent=X(`connecting`),n.appendChild(o),t.appendChild(n),t.addEventListener(`click`,e=>{e.target===t&&(s?.disconnect(),$g())}),n.addEventListener(`click`,e=>e.stopPropagation()),document.body.appendChild(t);let s=null,c=(e,t)=>{if(o.replaceChildren(),t.length===0){o.textContent=X(`noRooms`);return}let n=document.createElement(`table`);Object.assign(n.style,{width:`100%`,borderCollapse:`collapse`,fontSize:$.card});let r=document.createElement(`tr`);for(let e of[X(`gameName`),X(`mode`),X(`status`),X(`players`),X(`owner`),X(`action`)]){let t=document.createElement(`th`);t.textContent=e,Object.assign(t.style,{textAlign:`left`,padding:`8px`,borderBottom:`1px solid #444`,color:`#b8b8c8`}),r.appendChild(t)}n.appendChild(r);for(let r of t){let t=document.createElement(`tr`),i=[r.gameName,p_(r.mode),f_(r.status),`${r.playerCount} / ${r.spectatorCount}`,r.ownerDisplayName];for(let e of i){let n=document.createElement(`td`);n.textContent=e,Object.assign(n.style,{padding:`8px`,borderBottom:`1px solid rgba(255,255,255,0.08)`,verticalAlign:`middle`}),t.appendChild(n)}let a=document.createElement(`td`);Object.assign(a.style,{padding:`8px`,borderBottom:`1px solid rgba(255,255,255,0.08)`});let c=P_(r.canJoinAsPlayer?X(`join`):X(`spectate`),()=>{c.disabled=!0,e.joinRoom(r.code).then(t=>{Ug=e,s=null,$g(),Jg(),Xg(),Zg(),c_(e,t)}).catch(e=>{c.disabled=!1,o.appendChild(D_(e.message))})});a.appendChild(c),t.appendChild(a),n.appendChild(t)}o.appendChild(n)};qg(e).then(e=>document.getElementById(Og)?(s=e,e.listRooms().then(t=>{if(!document.getElementById(Og)){e.disconnect();return}c(e,t)})):(e.disconnect(),Promise.resolve())).catch(e=>{o.replaceChildren(D_(e.message))})},D_=e=>{let t=document.createElement(`div`);return t.textContent=e,Object.assign(t.style,{color:`#f66`,fontSize:$.error,minHeight:Z(16)}),t},O_=()=>{Wg=`home`,__(),o_();let e=x_(360);S_(e),T_();let t=P_(X(`soloGame`),k_);t.style.fontSize=$.menuButton,t.style.padding=Z(12),t.style.height=rm.menuButtonHeight,e.appendChild(t);let n=P_(X(`multiplayer`),A_);n.style.fontSize=$.menuButton,n.style.padding=Z(12),n.style.height=rm.menuButtonHeight,n.style.background=`#0f766e`,e.appendChild(n)},k_=()=>{Wg=`solo`,__(),o_();let e=x_(420);C_(e,X(`soloGame`));let t=M_(oh.map(e=>[e.id,Xp(e.id,e.title)]));t.value=sh.id,e.appendChild(N_(X(`mode`),t));let n=P_(X(`createGame`),()=>{Gg(ch(t.value))});e.appendChild(n);let r=P_(X(`back`),O_);r.style.background=`transparent`,r.style.border=`1px solid #555`,e.appendChild(r)},A_=()=>{Wg=`multiplayer`,__(),o_();let e=x_(460);C_(e,X(`multiplayer`));let t=ee(),n=null;t||(n=j_(X(`displayName`)),n.maxLength=32,n.value=Ig(),e.appendChild(n));let r=()=>t?.username??n?.value??``,i=j_(X(`gameName`));i.maxLength=40,i.value=`${r().trim()||`Player`} game`,e.appendChild(i);let a=M_([[`match`,X(`match`)],[`ranked`,X(`ranked`)],[`test`,X(`testRoom`)]]);e.appendChild(N_(X(`mode`),a));let o=M_([[`3000`,`Quick 3000`],[`4000`,`Classic 4000`],[`5000`,`Long 5000`],[`10000`,`Marathon 10000`]]);o.value=String(cm.targetScore),e.appendChild(N_(X(`targetScore`),o));let s=M_([[`0`,`${X(`minBank`)}: ${X(`noValue`)}`],[`300`,`${X(`minBank`)}: 300`],[`500`,`${X(`minBank`)}: 500`]]);s.value=String(cm.minBank),e.appendChild(N_(X(`bankRule`),s));let c=()=>({...cm,targetScore:Number(o.value),minBank:Number(s.value)}),l=()=>a.value===`test`?om.TEST:a.value===`ranked`?om.RANKED:om.MATCH,u=P_(X(`createGame`),()=>{let e=l();if(e===om.RANKED&&!ee()){F_(Error(X(`authRequiredRanked`)));return}let t=i.value.trim();if(!t){F_(Error(X(`gameNameRequired`)));return}Kg(`create`,r(),void 0,e,c(),t).catch(F_)});e.appendChild(u);let d=P_(X(`browseLobbies`),()=>{E_(r())});d.style.background=`#52525b`,e.appendChild(d);let f=document.createElement(`input`);f.placeholder=X(`roomCode`),f.maxLength=16,f.autocapitalize=`characters`,Object.assign(f.style,{padding:Z(8),fontSize:$.control,height:rm.controlHeight,boxSizing:`border-box`,border:`1px solid #444`,background:`#111`,color:`#eee`,borderRadius:`6px`,textTransform:`uppercase`,fontFamily:Q.ui}),e.appendChild(f);let p=P_(X(`joinByCode`),()=>{let e=f.value.trim().toUpperCase();e&&Kg(`join`,r(),e).catch(F_)});e.appendChild(p);let m=P_(X(`back`),O_);m.style.background=`transparent`,m.style.border=`1px solid #555`,e.appendChild(m),w_(e)},j_=e=>{let t=document.createElement(`input`);return t.placeholder=e,Object.assign(t.style,{padding:Z(8),fontSize:$.control,height:rm.controlHeight,boxSizing:`border-box`,border:`1px solid #444`,background:`#111`,color:`#eee`,borderRadius:`6px`,fontFamily:Q.ui}),t},M_=e=>{let t=document.createElement(`select`);for(let[n,r]of e){let e=document.createElement(`option`);e.value=n,e.textContent=r,t.appendChild(e)}return Object.assign(t.style,{padding:Z(8),fontSize:$.control,height:rm.controlHeight,boxSizing:`border-box`,border:`1px solid #444`,background:`#111`,color:`#eee`,borderRadius:`6px`,fontFamily:Q.ui}),t},N_=(e,t)=>{let n=document.createElement(`label`);Object.assign(n.style,{display:`flex`,flexDirection:`column`,gap:Z(6),color:`#b8b8c8`,fontSize:$.label});let r=document.createElement(`span`);return r.textContent=e,n.appendChild(r),n.appendChild(t),n},P_=(e,t)=>{let n=document.createElement(`button`);return n.textContent=e,Object.assign(n.style,{padding:`${Z(8)} ${Z(12)}`,background:`#3b82f6`,color:`#fff`,border:`none`,borderRadius:`6px`,cursor:`pointer`,fontSize:$.control,fontFamily:Q.ui,height:rm.controlHeight,boxSizing:`border-box`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,lineHeight:`1`,whiteSpace:`nowrap`}),$p(n,t),n},F_=e=>{let t=document.getElementById(`lobby-error`);t&&(t.textContent=e instanceof Error?e.message:String(e))};Yp(a_),zh().catch(e=>{console.warn(`settings load failed: ${e.message}`)}).finally(()=>{o_(),Vg||O_()});