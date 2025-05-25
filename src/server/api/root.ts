import { postRouter } from "~/server/api/routers/post";
import { projectRouter } from "~/server/api/routers/project";
import { formRouter } from "~/server/api/routers/form";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { pdfRouter } from "./routers/process";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  project: projectRouter,
  form: formRouter,
  pdf: pdfRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
