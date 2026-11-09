import { defineTool } from "@deepseek-ai/dsh-tools";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export const name = "dsh-error-lessons";

// 档案级共享存储：所有会话读同一份
const LESSONS_DIR = process.env.DSH_LESSONS_DIR || join(homedir(), ".dsh", "lessons");
const LESSONS_FILE = join(LESSONS_DIR, "lessons.json");

function loadLessons() {
  if (!existsSync(LESSONS_FILE)) return [];
  try {
    const data = JSON.parse(readFileSync(LESSONS_FILE, "utf-8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveLessons(list) {
  mkdirSync(LESSONS_DIR, { recursive: true });
  writeFileSync(LESSONS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

/** 简单多关键词打分检索：命中关键词越多、越靠前，得分越高 */
function score(lesson, query) {
  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0) return 0;
  const hay = JSON.stringify(lesson).toLowerCase();
  let total = 0;
  for (const t of tokens) {
    const idx = hay.indexOf(t);
    if (idx >= 0) total += 2 - Math.min(idx, 2000) / 2000;
  }
  return total;
}

const SEARCH_DESC = `Search the cross-session error lessons library (shared across all DSH sessions on this machine). Call this BEFORE handling an error or debugging a problem, to check whether the same or a similar mistake was made before. Each lesson records: symptom (现象), root cause (根因), fix (解法), result (结果), tags. If a lesson matches, reuse its fix directly instead of rediscovering it.`;

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: "error_lessons.search",
    description: SEARCH_DESC,
    parameters: {
      query: {
        type: "string",
        description: "Keywords describing the current error or symptom, e.g. \"CUDA out of memory\" or \"spawn ENOENT\" (space separated, language-independent).",
        required: true
      },
      limit: {
        type: "integer",
        description: "Max lessons to return, 1..10. Default 3."
      }
    },
    output: {
      schema: { type: "json" },
      render: (_args, value) => [{
        type: "text",
        text: JSON.stringify(value, null, 2)
      }]
    },
    async execute(args) {
      const query = String(args.query || "");
      const limit = Math.min(10, Math.max(1, args.limit ?? 3));
      const lessons = loadLessons();
      if (lessons.length === 0) return { matched: 0, lessons: [], hint: "lessons library is empty" };
      const scored = lessons
        .map((l, i) => ({ i, s: score(l, query) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || a.i - b.i)
        .slice(0, limit);
      return {
        matched: scored.length,
        lessons: scored.map((x) => lessons[x.i]),
        hint: scored.length === 0 ? "no matching lesson; consider recording this new mistake with error_lessons.add" : undefined
      };
    }
  }));

  ctx.tools.register(defineTool({
    name: "error_lessons.add",
    description: "Record a mistake as a new lesson in the cross-session lessons library, so later sessions can search it and never repeat it. Write AFTER the fix is verified. Fields: symptom (what went wrong, the error text), cause (the root cause), fix (exactly what solved it), result (the verified outcome), tags (optional keywords, space separated).",
    parameters: {
      symptom: { type: "string", description: "The error symptom or error message observed.", required: true },
      cause: { type: "string", description: "The root cause found.", required: true },
      fix: { type: "string", description: "The exact fix that worked.", required: true },
      result: { type: "string", description: "The verified result after the fix.", required: true },
      tags: { type: "string", description: "Optional space-separated keywords for retrieval, e.g. \"torch cuda rvc\"." }
    },
    output: {
      schema: { type: "json" },
      render: (_args, value) => [{
        type: "text",
        text: JSON.stringify(value, null, 2)
      }]
    },
    async execute(args) {
      const lessons = loadLessons();
      const lesson = {
        id: `L${Date.now().toString(36)}`,
        at: new Date().toISOString(),
        symptom: String(args.symptom || ""),
        cause: String(args.cause || ""),
        fix: String(args.fix || ""),
        result: String(args.result || ""),
        tags: String(args.tags || "").trim().split(/\s+/).filter(Boolean)
      };
      lessons.push(lesson);
      saveLessons(lessons);
      return { ok: true, id: lesson.id, total: lessons.length, path: LESSONS_FILE };
    }
  }));
}
