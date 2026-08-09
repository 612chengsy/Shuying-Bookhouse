var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_express9 = __toESM(require("express"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/routes/books.ts
var import_express = require("express");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);

// src/data/initialData.ts
var INITIAL_BOOKS = [
  // 文学诗词
  {
    id: "poetry-1",
    title: "\u8BD7\u753B\u4EBA\u95F4",
    category: "\u6587\u5B66\u8BD7\u8BCD",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-emerald-800 to-teal-900",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    backCoverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    description: "\u878D\u6C47\u56DB\u5B63\u98CE\u7269\u4E0E\u4EBA\u95F4\u70DF\u706B\u7684\u6292\u60C5\u8BD7\u96C6\u3002\u753B\u4E2D\u6709\u8BD7\uFF0C\u8BD7\u4E2D\u6709\u753B\uFF0C\u8BB0\u5F55\u7EA2\u5C18\u70DF\u706B\u91CC\u6700\u89E6\u52A8\u4EBA\u5FC3\u7684\u5C0F\u7F8E\u597D\u3002",
    tags: ["\u6292\u60C5\u8BD7", "\u56DB\u5B63\u98CE\u7269", "\u53E4\u5178\u610F\u5883", "\u539F\u521B\u8BD7\u6B4C"],
    wordCount: "1.2\u4E07\u5B57",
    likes: 128,
    views: 1450,
    createdAt: "2026-03-15",
    isOriginal: true,
    chapters: [
      {
        id: "p1-c1",
        title: "\u5377\u4E00\uFF1A\u6708\u4E0B\u758F\u5F71",
        content: `\u3010\u758F\u5F71\u3011
\u758F\u5F71\u6A2A\u659C\u6C34\u6E05\u6D45\uFF0C\u6697\u9999\u6D6E\u52A8\u6708\u9EC4\u660F\u3002
\u884C\u5C3D\u6C5F\u5357\u6570\u5341\u7A0B\uFF0C\u98CE\u5149\u4E0D\u4E0E\u56DB\u65F6\u540C\u3002
\u591C\u9759\u6C60\u5E73\u82B1\u6C14\u52A8\uFF0C\u4E00\u5E18\u5FAE\u98CE\u7167\u5B64\u660E\u3002
\u83AB\u9053\u7EA2\u5C18\u65E0\u5BC4\u5904\uFF0C\u5FC3\u5B89\u4F55\u5904\u4E0D\u5F52\u7A0B\u3002

\u3010\u665A\u6625\u5BC4\u6000\u3011
\u98CE\u8FC7\u6797\u68A2\u7AF9\u5F71\u659C\uFF0C\u5C0F\u7A97\u72EC\u5750\u8BD5\u65B0\u8336\u3002
\u6D41\u5E74\u6E10\u89C9\u97F6\u5149\u6D45\uFF0C\u7559\u5F97\u5E7D\u9999\u5728\u5BA2\u5BB6\u3002
\u95F2\u770B\u5EAD\u524D\u82B1\u843D\u5C3D\uFF0C\u4E91\u5377\u4E91\u8212\u4EFB\u897F\u659C\u3002`
      },
      {
        id: "p1-c2",
        title: "\u5377\u4E8C\uFF1A\u6625\u6C34\u714E\u8336",
        content: `\u3010\u6625\u6C34\u714E\u8336\u3011
\u6C72\u4E00\u74E2\u6E05\u51BD\u6625\u6CC9\uFF0C\u5C0F\u706B\u6162\u714E\u4E00\u58F6\u65B0\u91C7\u7684\u7EFF\u8336\u3002
\u6C34\u6C7D\u7F2D\u7ED5\u95F4\uFF0C\u4EFF\u4F5B\u770B\u89C1\u8FDC\u5C71\u7684\u4E91\u96FE\u4E0E\u9752\u82D4\u3002
\u751F\u6D3B\u4E0D\u5FC5\u603B\u662F\u98CE\u6025\u6D6A\u9AD8\uFF0C
\u9759\u5750\u7247\u523B\uFF0C\u542C\u6C34\u6CB8\u8336\u8212\uFF0C\u4FBF\u662F\u4EBA\u95F4\u6781\u597D\u7684\u65F6\u5149\u3002

\u3010\u542C\u96E8\u3011
\u6A90\u4E0B\u6C34\u6EF4\u4E32\u6210\u7EBF\uFF0C\u7838\u5728\u9752\u77F3\u677F\u4E0A\u8106\u54CD\u3002
\u7EB8\u4F1E\u4E0B\u6536\u62E2\u7684\u662F\u6574\u4E2A\u6C5F\u5357\u7684\u70DF\u96E8\uFF0C
\u653E\u4E0B\u7684\uFF0C\u662F\u4E00\u6574\u5929\u6C89\u95F7\u7684\u51E1\u4FD7\u5FC3\u4E8B\u3002`
      },
      {
        id: "p1-c3",
        title: "\u5377\u4E09\uFF1A\u4EBA\u95F4\u5BA2",
        content: `\u3010\u4EBA\u95F4\u5BA2\u3011
\u6211\u4EEC\u90FD\u662F\u8FD9\u82CD\u832B\u5B87\u5B99\u91CC\u7684\u5306\u5306\u8FC7\u5BA2\uFF0C
\u501F\u4E00\u56CA\u661F\u5149\u884C\u8DEF\uFF0C\u8E0F\u6EE1\u811A\u971C\u96EA\u957F\u6B4C\u3002
\u82E5\u662F\u8DEF\u8FC7\u4F60\u7684\u7A97\u524D\uFF0C
\u8BF7\u4E0D\u5FC5\u95EE\u6211\u6765\u8DEF\uFF0C\u53EA\u9001\u6211\u4E00\u7F15\u6708\u8272\u5373\u53EF\u3002

\u3010\u5F52\u821F\u3011
\u6E2F\u6E7E\u505C\u6CCA\u7740\u8FDC\u822A\u7684\u821F\uFF0C
\u98CE\u505C\u96E8\u6B47\u540E\uFF0C\u6EE1\u8239\u90FD\u662F\u7480\u74A8\u7684\u661F\u8F89\u3002`
      }
    ]
  },
  {
    id: "poetry-2",
    title: "\u5C0F\u8BF4\u884D\u751F\u539F\u521B\u8BD7\u5408\u96C6",
    category: "\u6587\u5B66\u8BD7\u8BCD",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-amber-700 to-stone-900",
    description: "\u4E3A\u81EA\u5BB6\u521B\u4F5C\u7684\u5C0F\u8BF4\u300A\u4E88\u68A6\u6C89\u6CA6\u300B\u3001\u300A\u5047\u5BD0\u300B\u7B49\u89D2\u8272\u4E0E\u540D\u573A\u9762\u6240\u64B0\u5199\u7684\u884D\u751F\u65E7\u4F53\u8BD7\u4E0E\u73B0\u4EE3\u8BD7\u6B4C\u5408\u8F91\u3002",
    tags: ["\u5C0F\u8BF4\u884D\u751F", "\u53E4\u98CE\u8BD7\u8BCD", "\u89D2\u8272\u6B4C\u8BCD", "\u60C5\u611F\u5BC4\u6258"],
    wordCount: "8,500\u5B57",
    likes: 95,
    views: 980,
    createdAt: "2026-04-10",
    isOriginal: true,
    chapters: [
      {
        id: "p2-c1",
        title: "\u7B2C\u4E00\u7BC7\uFF1A\u9898\u300A\u4E88\u68A6\u6C89\u6CA6\u300B\xB7\u591C\u706F",
        content: `\u3010\u591C\u706F\u3011
\u55A7\u56A3\u9000\u53BB\u7684\u90FD\u5E02\u89D2\u843D\uFF0C
\u6709\u4E00\u76CF\u6C89\u5BC2\u7684\u591C\u706F\u4F2B\u7ACB\u3002
\u5B83\u770B\u900F\u4E86\u8C0E\u8A00\u4E0E\u8FF7\u832B\uFF0C
\u5374\u4F9D\u7136\u4E3A\u8FF7\u9014\u7684\u7075\u9B42\u4FDD\u7559\u4E00\u4E1D\u5FAE\u5F31\u7684\u6E29\u5B58\u3002

\u3010\u6C89\u6CA6\u4E0E\u5FAE\u5149\u3011
\u65E0\u58F0\u5904\u542C\u96F7\u9706\u9690\uFF0C
\u6697\u591C\u884C\u81F3\u5FAE\u5149\u751F\u3002
\u83AB\u8A00\u4EBA\u5FC3\u5982\u6DF1\u6D77\uFF0C
\u4E14\u4EE5\u6B64\u8EAB\u7834\u957F\u591C\u3002`
      },
      {
        id: "p2-c2",
        title: "\u7B2C\u4E8C\u7BC7\uFF1A\u9898\u300A\u5047\u5BD0\u300B\xB7\u68A6\u9192\u65F6\u5206",
        content: `\u3010\u68A6\u9192\u65F6\u5206\u3011
\u5982\u679C\u5348\u591C\u5341\u4E8C\u70B9\u7684\u949F\u58F0\u6572\u54CD\uFF0C
\u4F60\u7684\u68A6\u5883\u4E0E\u6211\u7684\u68A6\u5883\u610F\u5916\u76F8\u649E\u3002
\u7A76\u7ADF\u662F\u6211\u8D70\u8FDB\u4E86\u4F60\u7684\u56DE\u5FC6\uFF0C
\u8FD8\u662F\u4F60\u5728\u6211\u7684\u8352\u539F\u91CC\u79CD\u4E0B\u4E86\u4E00\u6735\u82B1\uFF1F

\u3010\u5047\u5BD0\u6B4C\u3011
\u5B50\u591C\u949F\u58F0\u9519\u91CD\u8F6E\uFF0C
\u68A6\u4E2D\u6B22\u7B11\u9192\u65F6\u771F\u3002
\u4F55\u5FC5\u6DF1\u7A76\u8C01\u662F\u5BA2\uFF0C
\u76F8\u9022\u4E00\u5239\u5DF2\u6210\u6625\u3002`
      },
      {
        id: "p2-c3",
        title: "\u7B2C\u4E09\u7BC7\uFF1A\u9898\u300A\u7F18\u7EED\u6D41\u5E74\u300B\xB7\u524D\u5C18",
        content: `\u3010\u524D\u5C18\u3011
\u5C81\u6708\u5982\u540C\u4E00\u628A\u949D\u5200\uFF0C
\u78E8\u5E73\u4E86\u5E74\u5C11\u65F6\u7684\u68F1\u89D2\u4E0E\u8F7B\u72C2\u3002
\u53EF\u6BCF\u5F53\u98CE\u8D77\u65F6\uFF0C
\u4F9D\u7136\u80FD\u542C\u89C1\u5F53\u5E74\u5DF7\u5B50\u91CC\u6E05\u8106\u7684\u81EA\u884C\u8F66\u94C3\u58F0\uFF0C
\u548C\u90A3\u4E2A\u672A\u66FE\u8BF4\u51FA\u53E3\u7684\u7EA6\u5B9A\u3002`
      }
    ]
  },
  // 小说
  {
    id: "novel-1",
    title: "\u4E88\u68A6\u6C89\u6CA6",
    category: "\u5C0F\u8BF4",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-slate-800 to-indigo-950",
    description: "\u90FD\u5E02\u6C89\u6CA6\u4E0E\u5FC3\u7075\u6551\u8D4E\u5C0F\u8BF4\u3002\u5728\u9ED1\u591C\u4E0E\u9ECE\u660E\u7684\u4EA4\u754C\u5904\uFF0C\u5BFB\u627E\u4EBA\u5FC3\u6700\u6DF1\u5904\u7684\u6E29\u5B58\u4E0E\u5B88\u62A4\u3002",
    tags: ["\u60AC\u7591\u6551\u8D4E", "\u90FD\u5E02\u5FC3\u7406", "\u539F\u521B\u957F\u7BC7", "\u63A8\u7406\u60C5\u611F"],
    wordCount: "6.8\u4E07\u5B57",
    likes: 240,
    views: 3200,
    createdAt: "2026-01-20",
    isOriginal: true,
    chapters: [
      {
        id: "n1-c1",
        title: "\u7B2C\u4E00\u7AE0\uFF1A\u96E8\u591C\u7684\u4FE1\u7B3A",
        content: `\u57CE\u5E02\u5728\u66B4\u96E8\u4E2D\u6C89\u7761\uFF0C\u9713\u8679\u706F\u5149\u5728\u79EF\u6C34\u7684\u6C34\u5751\u91CC\u6298\u5C04\u51FA\u79BB\u5947\u6591\u6593\u7684\u5149\u6655\u3002

\u6797\u6C89\u5750\u5728\u5DE5\u4F5C\u5BA4\u7684\u4E66\u684C\u524D\uFF0C\u624B\u8FB9\u7684\u9ED1\u5496\u5561\u65E9\u5DF2\u51B7\u5374\u3002\u684C\u4E0A\u9759\u9759\u8EBA\u7740\u4E00\u5C01\u6CA1\u6709\u90AE\u6233\u7684\u4FE1\u7B3A\uFF0C\u4FE1\u5C01\u4E0A\u53EA\u6709\u4E00\u884C\u7528\u659C\u4F53\u5B57\u4E66\u5199\u7684\u5B57\u8FF9\uFF1A\u201C\u6709\u4E9B\u7075\u9B42\u5728\u6DF1\u6E0A\u91CC\u6C89\u6CA6\uFF0C\u53EA\u6709\u5728\u6781\u5EA6\u5B89\u9759\u7684\u65F6\u5019\uFF0C\u624D\u80FD\u542C\u89C1\u68A6\u7684\u58F0\u97F3\u3002\u201D

\u5916\u9762\u4E00\u9053\u95EA\u7535\u5212\u7834\u591C\u7A7A\uFF0C\u7D27\u63A5\u7740\u662F\u9686\u9686\u7684\u96F7\u58F0\u3002\u6797\u6C89\u4F38\u624B\u62FF\u8D77\u90A3\u5C01\u4FE1\uFF0C\u7528\u5F00\u4FE1\u5200\u5C0F\u5FC3\u5207\u5F00\u5C01\u53E3\u3002\u4FE1\u7EB8\u6563\u53D1\u7740\u4E00\u80A1\u8001\u65E7\u6728\u8D28\u4E66\u9999\u4E0E\u5FAE\u6E7F\u7684\u96E8\u6C34\u6C14\u606F\u3002

\u201C\u81F4\u6BCF\u4E00\u4E2A\u5728\u957F\u591C\u4E0E\u68A6\u5883\u4E2D\u72EC\u884C\u7684\u4EBA\u2026\u2026\u201D\u4FE1\u7684\u5F00\u5934\u8FD9\u6837\u5199\u9053\u3002

\u6797\u6C89\u5FAE\u5FAE\u8E59\u7709\u3002\u4ED6\u4F5C\u4E3A\u4E00\u540D\u5FC3\u7406\u54A8\u8BE2\u5E08\uFF0C\u89C1\u8FC7\u4E86\u592A\u591A\u4EBA\u5185\u5FC3\u7684\u9634\u6697\u4E0E\u6323\u624E\u3002\u4F46\u8FD9\u5C01\u4FE1\u7ED9\u4ED6\u7684\u611F\u89C9\u5B8C\u5168\u4E0D\u540C\u2014\u2014\u8FD9\u4E0D\u4EC5\u662F\u4E00\u5C01\u6C42\u52A9\u4FE1\uFF0C\u66F4\u50CF\u662F\u4E00\u4EFD\u6765\u81EA\u4E8E\u6DF1\u6C89\u68A6\u5883\u91CC\u7684\u9080\u7EA6\u3002`
      },
      {
        id: "n1-c2",
        title: "\u7B2C\u4E8C\u7AE0\uFF1A\u9759\u9ED8\u7684\u75D5\u8FF9",
        content: `\u7B2C\u4E8C\u5929\u6E05\u6668\uFF0C\u96E8\u8FC7\u5929\u6674\u3002

\u6797\u6C89\u6309\u7167\u4FE1\u4E2D\u63D0\u53CA\u7684\u5730\u5740\uFF0C\u6765\u5230\u4E86\u8001\u57CE\u533A\u4E00\u6761\u72ED\u7A84\u7684\u5DF7\u5B50\u91CC\u3002\u8FD9\u91CC\u7684\u5EFA\u7B51\u5927\u90FD\u6709\u7740\u4E09\u5341\u5E74\u4EE5\u4E0A\u7684\u5386\u53F2\uFF0C\u5899\u76AE\u5265\u843D\uFF0C\u722C\u5C71\u864E\u5728\u6591\u9A73\u7684\u7EA2\u7816\u4E0A\u873F\u8712\u3002

\u5728\u5DF7\u5B50\u5C3D\u5934\u7684\u4E00\u5BB6\u53E4\u65E7\u4E66\u5E97\u524D\uFF0C\u6797\u6C89\u505C\u4E0B\u4E86\u811A\u6B65\u3002\u6728\u5236\u62DB\u724C\u4E0A\u7528\u6977\u4E66\u5199\u7740\u201C\u758F\u5F71\u201D\u4E24\u4E2A\u5B57\u3002

\u63A8\u5F00\u95E8\uFF0C\u95E8\u4E0A\u7684\u94DC\u94C3\u53D1\u51FA\u6E05\u8106\u7684\u54CD\u58F0\u3002\u5C4B\u91CC\u98D8\u7740\u6C89\u9999\u4E0E\u65E7\u4E66\u7279\u6709\u7684\u6C14\u606F\u3002\u9AD8\u8038\u81F3\u5929\u82B1\u677F\u7684\u4E66\u67B6\u4E4B\u95F4\uFF0C\u7AD9\u7740\u4E00\u4E2A\u7A7F\u7740\u6DF1\u7070\u8272\u9488\u7EC7\u886B\u7684\u9752\u5E74\uFF0C\u6B63\u4F4E\u5934\u6574\u7406\u4E00\u53E0\u624B\u7A3F\u3002

\u201C\u4F60\u6765\u4E86\uFF0C\u6797\u533B\u751F\u3002\u201D\u9752\u5E74\u6CA1\u6709\u62AC\u5934\uFF0C\u58F0\u97F3\u6E29\u548C\u5374\u5E26\u6709\u67D0\u79CD\u6D1E\u5BDF\u4EBA\u5FC3\u7684\u529B\u91CF\u3002

\u201C\u4F60\u662F\u5199\u90A3\u5C01\u4FE1\u7684\u4EBA\uFF1F\u201D\u6797\u6C89\u8B66\u60D5\u5730\u95EE\u9053\u3002

\u9752\u5E74\u5FAE\u7B11\u62AC\u5934\uFF1A\u201C\u6211\u53EB\u821F\u6E21\uFF0C\u8FD9\u91CC\u662F\u6211\u7684\u5C0F\u4E66\u5C40\u3002\u4F60\u770B\u5230\u7684\u90A3\u4E9B\u4FE1\uFF0C\u4E0D\u8FC7\u662F\u6BCF\u4E2A\u5728\u73B0\u5B9E\u4E0E\u68A6\u5883\u4E2D\u6C89\u6CA6\u4E4B\u4EBA\u65E0\u6CD5\u8BC9\u8BF4\u7684\u79C1\u8BED\u3002\u201D`
      },
      {
        id: "n1-c3",
        title: "\u7B2C\u4E09\u7AE0\uFF1A\u5FAE\u5149\u4E0B\u7684\u6551\u8D4E",
        content: `\u7ECF\u8FC7\u957F\u8FBE\u6570\u5468\u7684\u7834\u8BD1\u4E0E\u8C03\u67E5\uFF0C\u6797\u6C89\u7EC8\u4E8E\u660E\u767D\u4E86\u6574\u8D77\u795E\u79D8\u4E8B\u4EF6\u7684\u771F\u76F8\u3002

\u539F\u6765\u5E76\u6CA1\u6709\u4EC0\u4E48\u60CA\u5929\u52A8\u5730\u7684\u9634\u8C0B\uFF0C\u6709\u7684\u53EA\u662F\u4E00\u7FA4\u5728\u57CE\u5E02\u89D2\u843D\u91CC\u9ED8\u9ED8\u575A\u6301\u81EA\u6211\u3001\u4E92\u76F8\u6276\u6301\u7684\u666E\u901A\u4EBA\u3002\u9752\u5E74\u821F\u6E21\u7528\u6587\u5B57\u642D\u5EFA\u8D77\u4E00\u5EA7\u7CBE\u795E\u7684\u907F\u98CE\u6E2F\uFF0C\u8BA9\u90A3\u4E9B\u5728\u751F\u6D3B\u4E2D\u53D7\u521B\u4E0E\u6C89\u6CA6\u7684\u7075\u9B42\u5F97\u4EE5\u5728\u6B64\u5598\u606F\u3002

\u201C\u4EBA\u5FC3\u867D\u7136\u590D\u6742\u5982\u8FF7\u5BAB\uFF0C\u201D\u6797\u6C89\u7AD9\u5728\u4E66\u5C40\u7684\u7A97\u524D\uFF0C\u770B\u7740\u5916\u9762\u9633\u5149\u6D12\u6EE1\u8857\u9053\uFF0C\u201C\u4F46\u53EA\u8981\u6709\u4EBA\u613F\u610F\u503E\u542C\uFF0C\u8FF7\u5BAB\u91CC\u5C31\u4F1A\u4EAE\u8D77\u706F\u706B\u3002\u201D

\u821F\u6E21\u5408\u4E0A\u624B\u4E2D\u7684\u7B14\u8BB0\u672C\uFF0C\u9012\u7ED9\u6797\u6C89\u4E00\u676F\u521A\u51B2\u597D\u7684\u70ED\u8336\uFF1A\u201C\u8FD9\u5C31\u662F\u2018\u4E88\u68A6\u6C89\u6CA6\u2019\u7684\u542B\u4E49\u3002\u4E88\u4EBA\u4EE5\u68A6\uFF0C\u4EA6\u80FD\u6551\u4EBA\u4E8E\u6C89\u6CA6\u3002\u4E0D\u5FC5\u5927\u58F0\u75BE\u547C\uFF0C\u61C2\u5F97\u7684\u4EBA\uFF0C\u81EA\u4F1A\u5728\u6587\u5B57\u91CC\u76F8\u9022\u3002\u201D`
      }
    ]
  },
  {
    id: "novel-2",
    title: "\u5047\u5BD0",
    category: "\u5C0F\u8BF4",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-purple-900 to-slate-900",
    description: "\u5947\u5E7B\u4E0E\u68A6\u5883\u91CD\u53E0\u7684\u6CBB\u6108\u4E4B\u4F5C\u3002\u5F53\u4E24\u4E2A\u539F\u672C\u6BEB\u65E0\u4EA4\u96C6\u7684\u4EBA\uFF0C\u5728\u6DF1\u591C\u7684\u68A6\u5883\u4E2D\u610F\u5916\u91CD\u53E0\u2026\u2026",
    tags: ["\u5947\u5E7B\u68A6\u5883", "\u53CC\u5411\u6CBB\u6108", "\u6D6A\u6F2B\u5947\u9047", "\u4E2D\u7BC7\u5C0F\u8BF4"],
    wordCount: "4.8\u4E07\u5B57",
    likes: 185,
    views: 2450,
    createdAt: "2026-02-14",
    isOriginal: true,
    chapters: [
      {
        id: "n2-c1",
        title: "\u7B2C\u4E00\u7AE0\uFF1A\u91CD\u53E0\u7684\u5B50\u591C",
        content: `\u5348\u591C12\u70B900\u5206\u3002

\u8BB8\u7720\u5173\u6389\u7535\u8111\uFF0C\u7CBE\u75B2\u529B\u5C3D\u5730\u762B\u5012\u5728\u5E8A\u4E0A\u3002\u4F5C\u4E3A\u4E00\u540D\u4E92\u8054\u7F51\u516C\u53F8\u7684\u52A0\u66F4\u7A0B\u5E8F\u5458\uFF0C\u4ED6\u7684\u8111\u6D77\u91CC\u8FD8\u5728\u98DE\u5FEB\u8DD1\u7740\u5404\u79CD\u62A5\u9519\u65E5\u5FD7\u548C\u9700\u6C42\u4EE3\u7801\u3002

\u7136\u800C\uFF0C\u5F53\u4ED6\u5408\u4E0A\u53CC\u773C\u8DCC\u5165\u68A6\u4E61\u7684\u77AC\u95F4\uFF0C\u8033\u8FB9\u5374\u6CA1\u6709\u5F80\u5E38\u7684\u6C89\u5BC2\uFF0C\u800C\u662F\u4F20\u6765\u4E86\u4E00\u9635\u60A0\u626C\u7684\u94A2\u7434\u58F0\u3002

\u4ED6\u7741\u5F00\u773C\uFF0C\u53D1\u73B0\u81EA\u5DF1\u7ADF\u7136\u7AD9\u5728\u4E00\u5EA7\u60AC\u6D6E\u4E8E\u4E91\u7AEF\u4E4B\u4E0A\u7684\u9732\u5929\u56FE\u4E66\u9986\u91CC\u3002\u7E41\u661F\u5982\u7011\u5E03\u822C\u4ECE\u5934\u9876\u6D41\u6DCC\u800C\u4E0B\uFF0C\u811A\u4E0B\u662F\u53D1\u5149\u7684\u6C49\u767D\u7389\u8D70\u5ECA\u3002

\u800C\u5728\u8D70\u5ECA\u5C3D\u5934\u7684\u4E09\u89D2\u94A2\u7434\u524D\uFF0C\u5750\u7740\u4E00\u4F4D\u8EAB\u7A7F\u767D\u88D9\u7684\u5973\u5B69\u3002

\u201C\u4F60\u2026\u2026\u662F\u8C01\uFF1F\u4E3A\u4EC0\u4E48\u4F1A\u5728\u6211\u7684\u68A6\u91CC\uFF1F\u201D\u8BB8\u7720\u9519\u6115\u5730\u95EE\u3002

\u5973\u5B69\u505C\u4E0B\u624B\u6307\uFF0C\u60CA\u8BB6\u5730\u8F6C\u8FC7\u8EAB\uFF1A\u201C\u8FD9\u662F\u6211\u7684\u68A6\u554A\uFF01\u4F60\u53C8\u662F\u4ECE\u54EA\u5192\u51FA\u6765\u7684\uFF1F\u201D`
      },
      {
        id: "n2-c2",
        title: "\u7B2C\u4E8C\u7AE0\uFF1A\u68A6\u5883\u4EA4\u6613\u6240",
        content: `\u63A5\u4E0B\u6765\u7684\u4E00\u6574\u5468\uFF0C\u6BCF\u5F53\u5B50\u591C\u949F\u58F0\u6572\u54CD\uFF0C\u8BB8\u7720\u90FD\u4F1A\u51C6\u65F6\u51FA\u73B0\u5728\u8FD9\u4E2A\u68A6\u5883\u7A7A\u95F4\u3002

\u4ED6\u4EEC\u53D1\u73B0\uFF0C\u4E24\u4EBA\u7684\u610F\u8BC6\u4F3C\u4E4E\u56E0\u4E3A\u67D0\u79CD\u7F55\u89C1\u7684\u5730\u78C1\u98CE\u66B4\u548C\u8111\u7535\u6CE2\u5171\u632F\uFF0C\u88AB\u6B7B\u6B7B\u7CFB\u5728\u4E86\u4E00\u8D77\u3002\u5728\u8FD9\u4E2A\u5171\u540C\u7684\u68A6\u5883\u91CC\uFF0C\u4ED6\u4EEC\u53EF\u4EE5\u968F\u5FC3\u6240\u6B32\u5730\u5EFA\u9020\u57CE\u5821\u3001\u6F2B\u6B65\u6D77\u5E95\u68EE\u6797\uFF0C\u6216\u8005\u53EA\u662F\u5E76\u80A9\u5750\u5728\u661F\u7A7A\u4E0B\u804A\u5929\u3002

\u5973\u5B69\u53EB\u9646\u661F\u665A\uFF0C\u662F\u4E00\u540D\u5E38\u5E74\u5F85\u5728\u533B\u9662\u91CC\u7684\u63D2\u753B\u5E08\u3002

\u201C\u73B0\u5B9E\u91CC\u6211\u54EA\u513F\u4E5F\u53BB\u4E0D\u4E86\uFF0C\u201D\u9646\u661F\u665A\u6307\u7740\u68A6\u91CC\u7FF1\u7FD4\u7684\u91D1\u5149\u5DE8\u9CB8\u7B11\u9053\uFF0C\u201C\u4F46\u5728\u68A6\u91CC\uFF0C\u4F60\u5E26\u6211\u770B\u904D\u4E86\u6574\u4E2A\u4E16\u754C\u3002\u201D

\u8BB8\u7720\u770B\u7740\u5973\u5B69\u773C\u91CC\u7684\u5149\u8292\uFF0C\u5FFD\u7136\u89C9\u5F97\u6BCF\u5929\u7E41\u91CD\u7684\u52A0\u73ED\u4F3C\u4E4E\u4E5F\u4E0D\u518D\u90A3\u4E48\u96BE\u71AC\u4E86\u3002`
      },
      {
        id: "n2-c3",
        title: "\u7B2C\u4E09\u7AE0\uFF1A\u6795\u8FB9\u7684\u98CE\u58F0",
        content: `\u68A6\u5883\u91CD\u53E0\u7684\u7B2C30\u5929\uFF0C\u5730\u78C1\u98CE\u66B4\u9010\u6E10\u5E73\u606F\uFF0C\u79D1\u5B66\u5BB6\u9884\u6D4B\u68A6\u5883\u5171\u632F\u5373\u5C06\u7ED3\u675F\u3002

\u201C\u6211\u4EEC\u8FD8\u80FD\u5728\u73B0\u5B9E\u91CC\u76F8\u89C1\u5417\uFF1F\u201D\u8BB8\u7720\u5728\u79BB\u522B\u7684\u68A6\u5883\u96EA\u539F\u4E0A\u63E1\u7D27\u4E86\u9646\u661F\u665A\u7684\u624B\u3002

\u9646\u661F\u665A\u5FAE\u7B11\u7740\u9012\u7ED9\u4ED6\u4E00\u5F20\u68A6\u91CC\u753B\u7684\u63D2\u56FE\uFF0C\u4E0A\u9762\u8D6B\u7136\u5199\u7740\u73B0\u5B9E\u4E2D\u5979\u6240\u5728\u7684\u533B\u9662\u4E0E\u75C5\u623F\u53F7\uFF1A\u201C\u5982\u679C\u4F60\u80FD\u5728\u73B0\u5B9E\u91CC\u627E\u5230\u6211\uFF0C\u8BB0\u5F97\u5E26\u4E00\u675F\u521A\u5F00\u7684\u767D\u8272\u5C0F\u82CD\u5170\u3002\u201D

\u6B21\u65E5\u6E05\u6668\uFF0C\u8BB8\u7720\u98DE\u5954\u5728\u6668\u5149\u71B9\u5FAE\u7684\u8857\u9053\u4E0A\uFF0C\u6000\u91CC\u7D27\u7D27\u62B1\u7740\u7528\u725B\u76AE\u7EB8\u5305\u597D\u7684\u82B1\u675F\u3002\u5F53\u4ED6\u63A8\u5F00\u90A3\u6247\u719F\u6089\u7684\u75C5\u623F\u95E8\u65F6\uFF0C\u7A97\u8FB9\u7684\u5973\u5B69\u8F6C\u8FC7\u5934\uFF0C\u9732\u51FA\u4E86\u4E0E\u68A6\u4E2D\u4E00\u6A21\u4E00\u6837\u7684\u7B11\u5BB9\u3002`
      }
    ]
  },
  {
    id: "novel-3",
    title: "\u7F18\u7EED\u6D41\u5E74",
    category: "\u5C0F\u8BF4",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-amber-800 to-orange-950",
    description: "\u8DE8\u8D8A\u591A\u5E74\u7684\u6DF1\u60C5\u6E29\u60C5\u957F\u7BC7\u3002\u5C81\u6708\u867D\u901D\uFF0C\u65E7\u65E5\u76F8\u5B88\u7684\u7F81\u7ECA\u5728\u65F6\u5149\u6CB3\u6D41\u91CC\u6C38\u4E0D\u6CEF\u706D\u3002",
    tags: ["\u6E29\u60C5\u6000\u65E7", "\u9752\u6625\u7F81\u7ECA", "\u6DF1\u60C5\u957F\u7BC7", "\u70DF\u706B\u4EBA\u95F4"],
    wordCount: "8.2\u4E07\u5B57",
    likes: 310,
    views: 4100,
    createdAt: "2025-11-08",
    isOriginal: true,
    chapters: [
      {
        id: "n3-c1",
        title: "\u7B2C\u4E00\u7AE0\uFF1A\u65E7\u4E66\u7B7E\u91CC\u7684\u5E74\u534E",
        content: `\u642C\u5BB6\u6574\u7406\u65E7\u7269\u65F6\uFF0C\u6C5F\u5BFB\u5728\u4E00\u672C\u5C18\u5C01\u7684\u300A\u5510\u8BD7\u4E09\u767E\u9996\u300B\u91CC\uFF0C\u610F\u5916\u6389\u843D\u51FA\u4E00\u679A\u5DF2\u7ECF\u6CDB\u9EC4\u7684\u538B\u82B1\u4E66\u7B7E\u3002

\u4E66\u7B7E\u4E0A\u7528\u6E05\u79C0\u7684\u5B57\u4F53\u5199\u7740\u4E00\u884C\u5B57\uFF1A\u201C\u65F6\u5149\u4F1A\u8D70\u8FDC\uFF0C\u4F46\u613F\u7F18\u5206\u672A\u7EDD\u3002\u201D

\u90A3\u662F\u5341\u4E94\u5E74\u524D\uFF0C\u4F4F\u5728\u8001\u8857\u9694\u58C1\u7684\u5973\u5B69\u6797\u6D45\u9001\u7ED9\u4ED6\u7684\u6BD5\u4E1A\u793C\u7269\u3002

\u6C5F\u5BFB\u629A\u6478\u7740\u90A3\u5E72\u67AF\u7684\u94F6\u674F\u53F6\u6807\u672C\uFF0C\u601D\u7EEA\u77AC\u95F4\u62C9\u56DE\u5230\u4E86\u90A3\u4E2A\u76DB\u590F\u3002\u68A7\u6850\u6811\u4E0A\u7684\u8749\u9E23\u58F0\u58F0\u58F0\u4F5C\u54CD\uFF0C\u51B0\u9547\u6C7D\u6C34\u74F6\u5192\u7740\u6C14\u6CE1\uFF0C\u8FD8\u6709\u4E24\u4E2A\u5C11\u5E74\u8E72\u5728\u5F04\u5802\u53E3\u8BA8\u8BBA\u672A\u6765\u7684\u6D69\u701A\u661F\u7A7A\u3002`
      },
      {
        id: "n3-c2",
        title: "\u7B2C\u4E8C\u7AE0\uFF1A\u5DF7\u53E3\u7684\u8001\u94F6\u674F",
        content: `\u6C5F\u5BFB\u4E58\u9AD8\u94C1\u56DE\u5230\u4E86\u9614\u522B\u591A\u5E74\u7684\u6545\u4E61\u5C0F\u9547\u3002

\u8001\u8857\u5DF2\u7ECF\u88AB\u6539\u9020\u6210\u4E86\u5145\u6EE1\u6587\u827A\u6C14\u606F\u7684\u8857\u533A\uFF0C\u552F\u6709\u5DF7\u53E3\u90A3\u68F5\u6709\u7740\u4E09\u767E\u5E74\u5386\u53F2\u7684\u8001\u94F6\u674F\u6811\u4F9D\u7136\u679D\u7E41\u53F6\u8302\u3002

\u79CB\u98CE\u5439\u8FC7\uFF0C\u6EE1\u6811\u91D1\u9EC4\u7684\u94F6\u674F\u53F6\u50CF\u98DE\u821E\u7684\u8774\u8776\u822C\u98D8\u843D\u3002

\u6C5F\u5BFB\u7AD9\u5728\u6811\u4E0B\u4EF0\u671B\uFF0C\u7A81\u7136\u542C\u89C1\u8EAB\u540E\u4F20\u6765\u4E00\u9053\u6709\u4E9B\u72B9\u8C6B\u7684\u58F0\u97F3\uFF1A

\u201C\u6C5F\u5BFB\u2026\u2026\u662F\u4F60\u5417\uFF1F\u201D

\u4ED6\u8F6C\u8FC7\u8EAB\uFF0C\u53EA\u89C1\u4E00\u4F4D\u8EAB\u7A7F\u7C73\u8272\u98CE\u8863\u7684\u5973\u5B50\u6B63\u6367\u7740\u76F8\u673A\u7AD9\u5728\u4E0D\u8FDC\u5904\uFF0C\u773C\u7736\u6CDB\u7EA2\uFF0C\u5634\u89D2\u5374\u5E26\u7740\u6E29\u6696\u7684\u5FAE\u7B11\u3002`
      },
      {
        id: "n3-c3",
        title: "\u7B2C\u4E09\u7AE0\uFF1A\u518D\u9022\u5FAE\u96E8\u65F6",
        content: `\u5FAE\u96E8\u6253\u6E7F\u4E86\u957F\u5ECA\u7684\u77F3\u677F\u8DEF\u3002

\u4E24\u4EBA\u5750\u5728\u8001\u8857\u8336\u9986\u7684\u6A90\u4E0B\uFF0C\u6CE1\u4E86\u4E00\u58F6\u70ED\u817E\u817E\u7684\u83CA\u82B1\u8336\u3002

\u8BB2\u8FF0\u7740\u5404\u81EA\u79BB\u522B\u8FD9\u4E9B\u5E74\u7684\u9645\u9047\uFF0C\u6709\u6B22\u7B11\uFF0C\u6709\u6CEA\u6C34\uFF0C\u4E5F\u6709\u72EC\u81EA\u5728\u5F02\u4E61\u6253\u62FC\u7684\u8F9B\u9178\u3002

\u201C\u539F\u4EE5\u4E3A\u65F6\u5149\u65E9\u628A\u6211\u4EEC\u51B2\u6563\u5230\u4E86\u5929\u6DAF\u6D77\u89D2\uFF0C\u201D\u6797\u6D45\u8F7B\u629A\u8336\u676F\uFF0C\u201C\u6CA1\u60F3\u9053\u7ED5\u4E86\u4E00\u5927\u5708\uFF0C\u5927\u5BB6\u53C8\u56DE\u5230\u4E86\u8FD9\u91CC\u3002\u201D

\u6C5F\u5BFB\u4ECE\u53E3\u888B\u91CC\u638F\u51FA\u90A3\u679A\u4FDD\u5B58\u5B8C\u597D\u7684\u94F6\u674F\u4E66\u7B7E\uFF0C\u8F7B\u8F7B\u653E\u5728\u684C\u4E0A\uFF1A\u201C\u56E0\u4E3A\u6709\u4E9B\u4EBA\uFF0C\u6709\u4E9B\u7F18\u5206\uFF0C\u4E00\u8F88\u5B50\u90FD\u4E0D\u4F1A\u771F\u6B63\u7EDD\u65AD\u3002\u201D`
      }
    ]
  },
  {
    id: "novel-4",
    title: "\u4E00\u4E2A\u5C0F\u6BB5\u5B50",
    category: "\u5C0F\u8BF4",
    author: "\u821F\u6E21\u661F\u6E2F",
    coverBg: "from-rose-800 to-amber-900",
    description: "\u8F7B\u677E\u641E\u7B11\u3001\u793E\u755C\u65E5\u5E38\u3001\u8111\u6D1E\u5927\u5F00\u4E0E\u6CBB\u6108\u7CFB\u77ED\u7BC7\u6545\u4E8B\u5408\u96C6\uFF0C\u9002\u5408\u8336\u4F59\u996D\u540E\u8F7B\u677E\u9605\u8BFB\u3002",
    tags: ["\u8F7B\u677E\u641E\u7B11", "\u793E\u755C\u65E5\u5E38", "\u6CBB\u6108\u8111\u6D1E", "\u77ED\u7BC7\u5408\u96C6"],
    wordCount: "1.5\u4E07\u5B57",
    likes: 420,
    views: 5600,
    createdAt: "2026-05-01",
    isOriginal: true,
    chapters: [
      {
        id: "n4-c1",
        title: "\u6BB5\u5B50\u4E00\uFF1A\u793E\u755C\u7684\u5468\u4E00\u89C9\u9192",
        content: `\u5468\u4E00\u65E9\u66687:00\uFF0C\u95F9\u949F\u51C6\u65F6\u54CD\u8D77\u3002

\u4F5C\u4E3A\u6253\u5DE5\u4EBA\u7684\u6211\uFF0C\u719F\u7EC3\u5730\u6267\u884C\u4E86\u4EE5\u4E0B\u6807\u51C6\u52A8\u4F5C\uFF1A
1. \u7741\u773C\uFF0C\u5BF9\u7740\u5929\u82B1\u677F\u53F9\u6C14\u4E09\u79D2\u3002
2. \u6478\u5230\u624B\u673A\uFF0C\u5173\u6389\u95F9\u949F\uFF0C\u6253\u5F00\u4F59\u989D\u67E5\u770B\uFF0C\u77AC\u95F4\u83B7\u5F97\u7EE7\u7EED\u4E0A\u73ED\u7684\u52A8\u529B\u3002
3. \u5FC3\u7406\u5EFA\u8BBE\uFF1A\u201C\u4ECA\u5929\u6211\u662F\u53BB\u62EF\u6551\u4E16\u754C\u7684\uFF0C\u987A\u4FBF\u62FF\u4E2A\u5168\u52E4\u5956\u3002\u201D

\u8D70\u5230\u5730\u94C1\u7AD9\uFF0C\u524D\u9762\u4E00\u4F4D\u5144\u5F1F\u5305\u4E0A\u6302\u7740\u4E2A\u724C\u5B50\uFF1A\u201C\u53EA\u8981\u6211\u4E0D\u5C34\u5C2C\uFF0CPPT\u5C31\u96BE\u5012\u4E0D\u4E86\u6211\u3002\u201D
\u90A3\u4E00\u523B\uFF0C\u6211\u611F\u89C9\u627E\u5230\u4E86\u7EC4\u7EC7\uFF01`
      },
      {
        id: "n4-c2",
        title: "\u6BB5\u5B50\u4E8C\uFF1A\u6211\u5BB6\u732B\u4E3B\u5B50\u4F1A\u5199\u4EE3\u7801",
        content: `\u4ECA\u5929\u5728\u5BB6\u91CC\u52A0\u73ED\u5199BUG\uFF0C\u53BB\u6D17\u624B\u95F4\u63A5\u4E86\u4E2A\u7535\u8BDD\u3002

\u56DE\u6765\u4E00\u770B\uFF0C\u6211\u5BB6\u6A58\u732B\u201C\u8089\u4E38\u201D\u6B63\u5A01\u98CE\u51DB\u51DB\u5730\u8E29\u5728\u952E\u76D8\u4E0A\uFF0C\u5C4F\u5E55\u7EC8\u7AEF\u91CC\u5C45\u7136\u8DD1\u51FA\u4E86\u4E00\u4E32\u795E\u79D8\u6307\u4EE4\uFF1A
git commit -m "meow meow meow"

\u6700\u795E\u5947\u7684\u662F\uFF0C\u5C45\u7136\u81EA\u52A8 pass \u4E86\u5355\u6D4B\uFF01
\u6211\u9677\u5165\u4E86\u6DF1\u6DF1\u7684\u81EA\u6211\u6000\u7591\uFF1A\u96BE\u9053\u6211\u7684\u4EE3\u7801\u6C34\u5E73\uFF0C\u5DF2\u7ECF\u88AB\u4E00\u53EA\u732B\u8D85\u8D8A\u4E86\u5417\uFF1F\uFF01`
      },
      {
        id: "n4-c3",
        title: "\u6BB5\u5B50\u4E09\uFF1A\u5173\u4E8E\u6478\u9C7C\u7684\u6700\u9AD8\u5883\u754C",
        content: `\u540C\u4E8B\u5C0F\u738B\u5411\u6211\u4F20\u6388\u6478\u9C7C\u79D8\u7C4D\uFF1A
\u201C\u7B2C\u4E00\uFF0C\u7535\u8111\u5C4F\u5E55\u8981\u6C38\u8FDC\u4FDD\u7559\u4E00\u4E2A\u5BC6\u5BC6\u9EBB\u9EBB\u7684Excel\u8868\u683C\uFF1B
\u7B2C\u4E8C\uFF0C\u624B\u91CC\u4E00\u5B9A\u8981\u62FF\u4E00\u628A\u5C3A\u5B50\u548C\u4E00\u652F\u7B14\uFF0C\u7709\u5934\u6DF1\u9501\uFF1B
\u7B2C\u4E09\uFF0C\u522B\u4EBA\u95EE\u4F60\u5728\u5E72\u561B\uFF0C\u4F60\u8981\u957F\u53F9\u4E00\u58F0\uFF1A\u2018\u8FD9\u4E2A\u6570\u636E\u6A21\u578B\u600E\u4E48\u5BF9\u4E0D\u4E0A\u5462\u2026\u2026\u2019
\u4FDD\u8BC1\u9886\u5BFC\u8DEF\u8FC7\u90FD\u4F1A\u62CD\u62CD\u4F60\u7684\u80A9\u8180\uFF1A\u2018\u5C0F\u738B\uFF0C\u6CE8\u610F\u4F11\u606F\uFF0C\u522B\u592A\u62FC\u4E86\uFF01\u2019\u201D

\u6211\u5927\u53D7\u9707\u64BC\uFF0C\u9ED8\u9ED8\u638F\u51FA\u5C0F\u672C\u672C\u8BB0\u4E86\u4E0B\u6765\u3002`
      }
    ]
  }
];
var INITIAL_REVIEWS = [
  {
    id: "rev-1",
    bookId: "novel-1",
    bookTitle: "\u4E88\u68A6\u6C89\u6CA6",
    userName: "\u4E66\u8352\u6551\u661F\u5C0F\u660E",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    content: "\u300A\u4E88\u68A6\u6C89\u6CA6\u300B\u771F\u7684\u592A\u89E6\u52A8\u4EBA\u4E86\uFF01\u821F\u6E21\u8001\u5E08\u5BF9\u6587\u5B57\u7684\u628A\u63A7\u529B\u975E\u5E38\u5F3A\uFF0C\u5728\u9ED1\u591C\u4E0E\u9ECE\u660E\u4EA4\u754C\u5904\u7684\u6551\u8D4E\u611F\u5199\u5F97\u975E\u5E38\u7EC6\u817B\uFF0C\u671F\u5F85\u540E\u7EED\u66F4\u65B0\uFF01",
    createdAt: "2026-07-28 14:30",
    likes: 42,
    replies: [
      {
        id: "rep-1",
        userName: "\u821F\u6E21\u661F\u6E2F",
        content: "\u611F\u8C22\u652F\u6301\uFF01\u4E00\u5B9A\u7EE7\u7EED\u52A0\u6CB9\uFF0C\u4E0D\u8F9C\u8D1F\u5927\u5BB6\u7684\u671F\u5F85\uFF01",
        createdAt: "2026-07-28 16:10"
      }
    ]
  },
  {
    id: "rev-2",
    bookId: "poetry-1",
    bookTitle: "\u8BD7\u753B\u4EBA\u95F4",
    userName: "\u6E05\u98CE\u660E\u6708",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    content: "\u610F\u5883\u6781\u4E3A\u60A0\u8FDC\uFF0C\u5C24\u5176\u662F\u201C\u758F\u5F71\u6A2A\u659C\u6C34\u6E05\u6D45\u201D\u90A3\u4E00\u9996\uFF0C\u8BFB\u6765\u5507\u9F7F\u7559\u9999\uFF0C\u5F88\u6709\u8001\u8BD7\u4EBA\u7684\u610F\u8574\u3002",
    createdAt: "2026-07-30 09:15",
    likes: 29
  },
  {
    id: "rev-3",
    bookId: "novel-4",
    bookTitle: "\u4E00\u4E2A\u5C0F\u6BB5\u5B50",
    userName: "\u6478\u9C7C\u4E13\u4E1A\u6237",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    content: "\u54C8\u54C8\u54C8\u54C8\u300A\u793E\u755C\u7684\u5468\u4E00\u89C9\u9192\u300B\u7B80\u76F4\u662F\u5728\u6211\u623F\u95F4\u88C5\u4E86\u76D1\u63A7\uFF01\u7B11\u6B7B\u6211\u4E86\uFF0C\u5468\u4E00\u4E0A\u73ED\u5FC5\u5907\u89E3\u538B\u795E\u5668\uFF01",
    createdAt: "2026-08-02 20:45",
    likes: 56
  },
  {
    id: "rev-4",
    userName: "\u58A8\u9999\u5BA2",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    content: "\u5728\u5982\u4ECA\u6EE1\u662F\u5546\u4E1A\u5316\u5FEB\u9910\u6587\u7684\u65F6\u4EE3\uFF0C\u80FD\u770B\u5230\u8FD9\u6837\u4E00\u4E2A\u7EAF\u7CB9\u3001\u5E72\u51C0\u7684\u516C\u76CA\u5199\u624B\u5C0F\u4E66\u5C4B\uFF0C\u771F\u7684\u50CF\u662F\u4E00\u7247\u4E16\u5916\u6843\u6E90\u3002\u652F\u6301\u821F\u6E21\u661F\u6E2F\u8001\u5E08\uFF01",
    createdAt: "2026-08-04 11:20",
    likes: 68
  }
];
var INITIAL_GUESTBOOK = [
  {
    id: "g-1",
    userName: "\u98CE\u8FC7\u7684\u590F\u5929",
    content: "\u4F5C\u8005\u5927\u5927\uFF0C\u4F60\u5E73\u5E38\u5199\u6B4C\u5531\u6B4C\u662F\u5728\u54EA\u91CC\u53D1\u5E03\u7684\u5440\uFF1F\u597D\u60F3\u542C\u4F60\u5F39\u5531\uFF01",
    createdAt: "2026-07-20 18:22",
    authorReply: "\u54C8\u54C8\u4E1A\u4F59\u5174\u8DA3\u800C\u5DF2\uFF01\u6709\u65F6\u4F1A\u5728\u793E\u7FA4\u6216\u8005\u4E2A\u4EBA\u4E3B\u9875\u5206\u4EAB\u968F\u624B\u5F55\u7684\u97F3\u8F68\uFF0C\u8C22\u8C22\u5173\u5FC3\uFF5E",
    likes: 18
  },
  {
    id: "g-2",
    userName: "\u665A\u5B89\u6708\u4EAE",
    content: "\u975E\u5E38\u559C\u6B22\u300A\u5047\u5BD0\u300B\u7684\u8BBE\u5B9A\uFF0C\u8BF7\u95EE\u7B2C\u4E8C\u90E8\u4EC0\u4E48\u65F6\u5019\u80FD\u5B89\u6392\u4E0A\uFF1F",
    createdAt: "2026-07-25 22:40",
    authorReply: "\u793E\u755C\u6700\u8FD1\u52A0\u73ED\u7565\u591A\uFF0C\u6B63\u5728\u6784\u601D\u4E2D\uFF01\u5927\u7EB2\u5199\u5B8C\u5C31\u4F1A\u66F4\u65B0\u7684\uFF5E",
    likes: 24
  }
];
var INITIAL_COMMENTS = [
  {
    id: "c-101",
    bookId: "novel-1",
    userName: "\u4E91\u6E38\u8BD7\u4EBA",
    content: "\u7B2C\u4E00\u7AE0\u7684\u96E8\u591C\u6C14\u6C1B\u6E32\u67D3\u592A\u5230\u4F4D\u4E86\uFF0C\u8BFB\u8D77\u6765\u975E\u5E38\u6709\u4EE3\u5165\u611F\uFF01",
    createdAt: "2026-08-01 14:20",
    likes: 12
  },
  {
    id: "c-102",
    bookId: "poetry-1",
    userName: "\u7AF9\u6797\u6E05\u98CE",
    content: "\u201C\u758F\u5F71\u6A2A\u659C\u6C34\u6E05\u6D45\u201D\u5199\u5F97\u5F88\u7075\u52A8\uFF0C\u6709\u53E4\u98CE\u96C5\u97F5\u3002",
    createdAt: "2026-08-03 10:15",
    likes: 8
  }
];

// server/db.ts
var DEFAULT_MUSIC_TRACKS = [
  { id: "default_1", title: "\u300A\u5FAE\u5149\u300B\u2014\u2014 \u5C0F\u8BF4\u300A\u4E88\u68A6\u6C89\u6CA6\u300B\u884D\u751F\u5409\u4ED6\u5F39\u5531 Demo", duration: "03:45", durationSec: 225, mood: "\u6E29\u6696\u6C89\u9759" },
  { id: "default_2", title: "\u300A\u6708\u4E0B\u758F\u5F71\u300B\u2014\u2014 \u8BD7\u6B4C\u6717\u8BF5\u4E0E\u53E4\u98CE\u8F7B\u97F3\u4E50", duration: "02:30", durationSec: 150, mood: "\u53E4\u5178\u610F\u5883" },
  { id: "default_3", title: "\u300A\u793E\u755C\u7684\u5468\u672B\u6E05\u6668\u300B\u2014\u2014 \u968F\u6027\u5F39\u5531\u788E\u788E\u5FF5", duration: "04:12", durationSec: 252, mood: "\u8F7B\u677E\u6CBB\u6108" }
];
var DEFAULT_STATUS_LOGS = [
  {
    id: "log-1",
    tag: "\u{1F4D6} \u8FD1\u671F\u66F4\u65B0\u52A8\u6001",
    tagColor: "amber",
    date: "2026-08-05",
    content: "\u300A\u4E88\u68A6\u6C89\u6CA6\u300B\u540E\u7EED\u5927\u7EB2\u5DF2\u5B8C\u6210\u590D\u5BA1\uFF0C\u5468\u672B\u6253\u7B97\u62BD\u7A7A\u6574\u7406\u300A\u8BD7\u753B\u4EBA\u95F4\u300B\u65B0\u589E\u7684\u51E0\u9996\u590F\u672B\u6292\u60C5\u8BD7\u3002"
  },
  {
    id: "log-2",
    tag: "\u2615 \u6253\u5DE5\u4EBA\u65E5\u5E38",
    tagColor: "emerald",
    date: "2026-08-01",
    content: "\u4ECA\u5929\u4E0B\u73ED\u540E\u559D\u5230\u4E86\u6781\u4E3A\u6E05\u751C\u7684\u51BB\u9876\u4E4C\u9F99\uFF0C\u7075\u611F\u7206\u53D1\u5199\u4E0B\u4E86\u300A\u4E00\u4E2A\u5C0F\u6BB5\u5B50\u300B\u91CC\u7684\u6478\u9C7C\u5FC3\u5F97\uFF01"
  },
  {
    id: "log-3",
    tag: "\u{1F48C} \u521B\u4F5C\u5BC4\u8BED",
    tagColor: "rose",
    date: "\u81F4\u6240\u6709\u8BFB\u8005",
    content: "\u6587\u5B57\u662F\u7A7F\u900F\u51B7\u6F20\u90FD\u5E02\u7684\u5FAE\u5149\u3002\u65E0\u8BBA\u751F\u6D3B\u591A\u5FD9\u788C\uFF0C\u5E0C\u671B\u758F\u5F71\u4E66\u5C4B\u80FD\u4E3A\u60A8\u5E26\u6765\u4E00\u4E1D\u6170\u85C9\u3002"
  }
];
var DEFAULT_STATUS_QUOTE = "\u201C\u751F\u6D3B\u4E07\u822C\u7686\u82E6\uFF0C\u552F\u6709\u6587\u5B57\u4E0E\u7231\u6C38\u6052\u3002\u201D";
var DATA_DIR = import_path.default.join(process.cwd(), "server", "data");
var STORE_FILE = import_path.default.join(DATA_DIR, "store.json");
var UPLOADS_DIR = import_path.default.join(DATA_DIR, "uploads");
var currentStore = null;
function initStore() {
  if (!import_fs.default.existsSync(DATA_DIR)) {
    import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!import_fs.default.existsSync(UPLOADS_DIR)) {
    import_fs.default.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (import_fs.default.existsSync(STORE_FILE)) {
    try {
      const raw = import_fs.default.readFileSync(STORE_FILE, "utf-8");
      currentStore = JSON.parse(raw);
    } catch (err) {
      console.error("Error reading store.json, reinitializing default:", err);
    }
  }
  if (!currentStore) {
    currentStore = {
      books: INITIAL_BOOKS,
      comments: INITIAL_COMMENTS,
      reviews: INITIAL_REVIEWS,
      guestbook: INITIAL_GUESTBOOK,
      musicTracks: DEFAULT_MUSIC_TRACKS,
      statusLogs: DEFAULT_STATUS_LOGS,
      statusQuote: DEFAULT_STATUS_QUOTE,
      totalViews: 2e3
    };
    saveStore();
  }
  return currentStore;
}
function getStore() {
  if (!currentStore) {
    return initStore();
  }
  return currentStore;
}
function saveStore() {
  if (!currentStore) return;
  try {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    import_fs.default.writeFileSync(STORE_FILE, JSON.stringify(currentStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save store.json:", err);
  }
}
function updateStore(fn) {
  const store = getStore();
  const nextStore = fn(store);
  currentStore = nextStore;
  saveStore();
  return currentStore;
}
function resetStoreToDefault() {
  currentStore = {
    books: INITIAL_BOOKS,
    comments: INITIAL_COMMENTS,
    reviews: INITIAL_REVIEWS,
    guestbook: INITIAL_GUESTBOOK,
    musicTracks: DEFAULT_MUSIC_TRACKS,
    statusLogs: DEFAULT_STATUS_LOGS,
    statusQuote: DEFAULT_STATUS_QUOTE,
    totalViews: 2e3
  };
  saveStore();
  return currentStore;
}

// server/routes/books.ts
var router = (0, import_express.Router)();
router.get("/", (req, res) => {
  const store = getStore();
  res.json(store.books);
});
router.post("/", (req, res) => {
  const newBook = req.body;
  if (!newBook || !newBook.title) {
    return res.status(400).json({ error: "Book title is required" });
  }
  updateStore((store) => {
    return {
      ...store,
      books: [newBook, ...store.books]
    };
  });
  res.json({ success: true, book: newBook });
});
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const updatedBookData = req.body;
  let found = false;
  let updatedBook = null;
  updateStore((store) => {
    const nextBooks = store.books.map((b) => {
      if (b.id === id) {
        found = true;
        updatedBook = { ...b, ...updatedBookData };
        return updatedBook;
      }
      return b;
    });
    return {
      ...store,
      books: nextBooks
    };
  });
  if (!found) {
    return res.status(404).json({ error: "Book not found" });
  }
  res.json({ success: true, book: updatedBook });
});
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  updateStore((store) => {
    return {
      ...store,
      books: store.books.filter((b) => b.id !== id)
    };
  });
  res.json({ success: true, message: "Book deleted" });
});
router.post("/reset", (req, res) => {
  const store = resetStoreToDefault();
  res.json({ success: true, books: store.books });
});
var books_default = router;

// server/routes/comments.ts
var import_express2 = require("express");
var router2 = (0, import_express2.Router)();
router2.get("/", (req, res) => {
  const store = getStore();
  res.json(store.comments);
});
router2.post("/", (req, res) => {
  const comment = req.body;
  if (!comment || !comment.content || !comment.bookId) {
    return res.status(400).json({ error: "BookId and content are required" });
  }
  const newComment = {
    ...comment,
    id: comment.id || "comment-" + Date.now(),
    createdAt: comment.createdAt || (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
    likes: comment.likes || 0
  };
  updateStore((store) => ({
    ...store,
    comments: [newComment, ...store.comments]
  }));
  res.json({ success: true, comment: newComment });
});
router2.delete("/:id", (req, res) => {
  const { id } = req.params;
  updateStore((store) => ({
    ...store,
    comments: store.comments.filter((c) => c.id !== id)
  }));
  res.json({ success: true });
});
router2.post("/:id/like", (req, res) => {
  const { id } = req.params;
  updateStore((store) => ({
    ...store,
    comments: store.comments.map((c) => c.id === id ? { ...c, likes: c.likes + 1 } : c)
  }));
  res.json({ success: true });
});
var comments_default = router2;

// server/routes/reviews.ts
var import_express3 = require("express");
var router3 = (0, import_express3.Router)();
router3.get("/", (req, res) => {
  const store = getStore();
  res.json(store.reviews);
});
router3.post("/", (req, res) => {
  const review = req.body;
  if (!review || !review.content) {
    return res.status(400).json({ error: "Review content is required" });
  }
  const newReview = {
    ...review,
    id: review.id || "rev-" + Date.now(),
    createdAt: review.createdAt || (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
    likes: review.likes || 0,
    replies: review.replies || []
  };
  updateStore((store) => ({
    ...store,
    reviews: [newReview, ...store.reviews]
  }));
  res.json({ success: true, review: newReview });
});
router3.delete("/:id", (req, res) => {
  const { id } = req.params;
  updateStore((store) => ({
    ...store,
    reviews: store.reviews.filter((r) => r.id !== id)
  }));
  res.json({ success: true });
});
router3.post("/:id/reply", (req, res) => {
  const { id } = req.params;
  const { userName, content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Reply content is required" });
  }
  const reply = {
    id: "rep-" + Date.now(),
    userName: userName || "\u70ED\u5FC3\u8BFB\u8005",
    content,
    createdAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16)
  };
  updateStore((store) => ({
    ...store,
    reviews: store.reviews.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          replies: [...r.replies || [], reply]
        };
      }
      return r;
    })
  }));
  res.json({ success: true, reply });
});
router3.post("/:id/like", (req, res) => {
  const { id } = req.params;
  updateStore((store) => ({
    ...store,
    reviews: store.reviews.map((r) => r.id === id ? { ...r, likes: r.likes + 1 } : r)
  }));
  res.json({ success: true });
});
var reviews_default = router3;

// server/routes/guestbook.ts
var import_express4 = require("express");
var router4 = (0, import_express4.Router)();
router4.get("/", (req, res) => {
  const store = getStore();
  res.json(store.guestbook);
});
router4.post("/", (req, res) => {
  const msg = req.body;
  if (!msg || !msg.content) {
    return res.status(400).json({ error: "Message content is required" });
  }
  const newMsg = {
    ...msg,
    id: msg.id || "gb-" + Date.now(),
    createdAt: msg.createdAt || (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
    likes: msg.likes || 0
  };
  updateStore((store) => ({
    ...store,
    guestbook: [newMsg, ...store.guestbook]
  }));
  res.json({ success: true, message: newMsg });
});
router4.delete("/:id", (req, res) => {
  const { id } = req.params;
  updateStore((store) => ({
    ...store,
    guestbook: store.guestbook.filter((m) => m.id !== id)
  }));
  res.json({ success: true });
});
router4.post("/:id/reply", (req, res) => {
  const { id } = req.params;
  const { authorReply } = req.body;
  updateStore((store) => ({
    ...store,
    guestbook: store.guestbook.map((m) => m.id === id ? { ...m, authorReply } : m)
  }));
  res.json({ success: true });
});
router4.post("/:id/like", (req, res) => {
  const { id } = req.params;
  updateStore((store) => ({
    ...store,
    guestbook: store.guestbook.map((m) => m.id === id ? { ...m, likes: m.likes + 1 } : m)
  }));
  res.json({ success: true });
});
var guestbook_default = router4;

// server/routes/logs.ts
var import_express5 = require("express");
var router5 = (0, import_express5.Router)();
router5.get("/", (req, res) => {
  const store = getStore();
  res.json({
    logs: store.statusLogs,
    quote: store.statusQuote
  });
});
router5.post("/", (req, res) => {
  const log = req.body;
  if (!log || !log.content) {
    return res.status(400).json({ error: "Log content is required" });
  }
  const newLog = {
    ...log,
    id: log.id || "log-" + Date.now(),
    date: log.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  };
  updateStore((store) => ({
    ...store,
    statusLogs: [newLog, ...store.statusLogs]
  }));
  res.json({ success: true, log: newLog });
});
router5.put("/:id", (req, res) => {
  const { id } = req.params;
  const logData = req.body;
  updateStore((store) => ({
    ...store,
    statusLogs: store.statusLogs.map((l) => l.id === id ? { ...l, ...logData } : l)
  }));
  res.json({ success: true });
});
router5.delete("/:id", (req, res) => {
  const { id } = req.params;
  updateStore((store) => ({
    ...store,
    statusLogs: store.statusLogs.filter((l) => l.id !== id)
  }));
  res.json({ success: true });
});
router5.put("/quote/update", (req, res) => {
  const { quote } = req.body;
  if (!quote) {
    return res.status(400).json({ error: "Quote is required" });
  }
  updateStore((store) => ({
    ...store,
    statusQuote: quote
  }));
  res.json({ success: true, quote });
});
var logs_default = router5;

// server/routes/music.ts
var import_express6 = require("express");
var router6 = (0, import_express6.Router)();
router6.get("/", (req, res) => {
  const store = getStore();
  res.json(store.musicTracks);
});
router6.post("/", (req, res) => {
  const track = req.body;
  if (!track || !track.title) {
    return res.status(400).json({ error: "Track title is required" });
  }
  const newTrack = {
    ...track,
    id: track.id || "track-" + Date.now()
  };
  updateStore((store) => ({
    ...store,
    musicTracks: [...store.musicTracks, newTrack]
  }));
  res.json({ success: true, track: newTrack });
});
router6.delete("/:id", (req, res) => {
  const { id } = req.params;
  updateStore((store) => ({
    ...store,
    musicTracks: store.musicTracks.filter((t) => t.id !== id)
  }));
  res.json({ success: true });
});
var music_default = router6;

// server/routes/stats.ts
var import_express7 = require("express");
var router7 = (0, import_express7.Router)();
router7.get("/", (req, res) => {
  const store = getStore();
  const totalCommentsCount = store.comments.length + store.reviews.length + store.guestbook.length;
  const totalLikesCount = store.books.reduce((acc, b) => acc + (b.likes || 0), 0);
  res.json({
    views: store.totalViews,
    booksCount: store.books.length,
    commentsCount: totalCommentsCount,
    likesCount: totalLikesCount
  });
});
router7.post("/view", (req, res) => {
  const store = updateStore((s) => ({
    ...s,
    totalViews: s.totalViews + 1
  }));
  res.json({ success: true, views: store.totalViews });
});
var stats_default = router7;

// server/routes/upload.ts
var import_express8 = require("express");
var import_multer = __toESM(require("multer"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var router8 = (0, import_express8.Router)();
var storage = import_multer.default.diskStorage({
  destination: (req, file, cb) => {
    if (!import_fs2.default.existsSync(UPLOADS_DIR)) {
      import_fs2.default.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = import_path2.default.extname(file.originalname);
    const basename = import_path2.default.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, "_");
    const uniqueName = `${Date.now()}-${basename}${ext}`;
    cb(null, uniqueName);
  }
});
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
  // 50MB max
});
router8.post("/file", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  });
});
router8.post("/base64", (req, res) => {
  const { data, filename, type } = req.body;
  if (!data) {
    return res.status(400).json({ error: "No base64 data provided" });
  }
  try {
    const base64Data = data.replace(/^data:[^;]+;base64,/, "");
    const ext = filename ? import_path2.default.extname(filename) : type === "audio" ? ".mp3" : ".jpg";
    const nameWithoutExt = filename ? import_path2.default.basename(filename, ext).replace(/[^a-zA-Z0-9_\-]/g, "_") : "upload";
    const safeFilename = `${Date.now()}-${nameWithoutExt}${ext}`;
    const filePath = import_path2.default.join(UPLOADS_DIR, safeFilename);
    if (!import_fs2.default.existsSync(UPLOADS_DIR)) {
      import_fs2.default.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    import_fs2.default.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
    const fileUrl = `/uploads/${safeFilename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: safeFilename
    });
  } catch (err) {
    console.error("Base64 upload failed:", err);
    res.status(500).json({ error: "Failed to save uploaded file" });
  }
});
var upload_default = router8;

// server/index.ts
async function startServer() {
  const app = (0, import_express9.default)();
  const PORT = 3e3;
  initStore();
  app.use(import_express9.default.json({ limit: "50mb" }));
  app.use(import_express9.default.urlencoded({ extended: true, limit: "50mb" }));
  app.use("/uploads", import_express9.default.static(UPLOADS_DIR));
  app.use("/api/books", books_default);
  app.use("/api/comments", comments_default);
  app.use("/api/reviews", reviews_default);
  app.use("/api/guestbook", guestbook_default);
  app.use("/api/logs", logs_default);
  app.use("/api/music", music_default);
  app.use("/api/stats", stats_default);
  app.use("/api/upload", upload_default);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app.use(import_express9.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path3.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Shuying Server] Express + Vite backend listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
