// app/robots.ts
import type { MetadataRoute } from "next";

function isProd(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const cfBranch = process.env.CF_PAGES_BRANCH;

  if (nodeEnv !== "production") return false;

  // 沒 branch 就當 prod（避免誤判）
  if (!cfBranch) return true;

  return ["main", "production"].includes(cfBranch);
}

export default function robots(): MetadataRoute.Robots {
  const prod = isProd();

  // ✅ 非正式環境：整站不給索引（避免 preview duplicate）
  if (!prod) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  // ✅ Production：允許索引（tools pages 交給你在 C-4 的 robots 規則控制）
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 可選：避免爬 API（不影響使用者）
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://www.wiseconverthub.com/sitemap.xml",
  };
}
