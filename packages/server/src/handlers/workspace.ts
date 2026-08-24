import { Workspace } from "@opencode-ai/core/workspace"
import { ConflictError, ProviderNotFoundError } from "@opencode-ai/protocol/errors"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"

export const WorkspaceHandler = HttpApiBuilder.group(Api, "server.workspace", (handlers) =>
  Effect.gen(function* () {
    const workspace = yield* Workspace.Service

    return handlers.handle("workspace.create", (ctx) =>
      workspace.create(ctx.payload).pipe(
        Effect.map((workspaceID) => ({ data: workspaceID })),
        Effect.catchTags({
          "Workspace.CreateConflict": (error) =>
            new ConflictError({
              resource: error.workspaceID,
              message: `Workspace ${error.workspaceID} already uses provider ${error.existingProvider}, not ${error.provider}`,
            }),
          "WorkspaceDriver.ProviderNotFound": (error) =>
            new ProviderNotFoundError({
              providerID: error.provider,
              message: `Workspace provider not found: ${error.provider}`,
            }),
        }),
      ),
    )
  }),
)
