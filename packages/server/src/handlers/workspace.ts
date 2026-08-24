import { Workspace } from "@opencode-ai/core/workspace"
import { ProviderNotFoundError } from "@opencode-ai/protocol/errors"
import { WorkspaceCreateConflictError } from "@opencode-ai/protocol/groups/workspace"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"

export const WorkspaceHandler = HttpApiBuilder.group(Api, "server.workspace", (handlers) =>
  Effect.gen(function* () {
    const workspace = yield* Workspace.Service

    return handlers.handle("workspace.create", (ctx) =>
      workspace.create(ctx.payload).pipe(
        Effect.map((workspaceID) => ({ data: workspaceID })),
        Effect.catchTag(
          "Workspace.CreateConflict",
          (error) =>
            new WorkspaceCreateConflictError({
              workspaceID: error.workspaceID,
              provider: error.provider,
              existingProvider: error.existingProvider,
              message: `Workspace ${error.workspaceID} already uses provider ${error.existingProvider}`,
            }),
        ),
        Effect.catchTag(
          "WorkspaceDriver.ProviderNotFound",
          (error) =>
            new ProviderNotFoundError({
              providerID: error.provider,
              message: `Workspace provider not found: ${error.provider}`,
            }),
        ),
      ),
    )
  }),
)
