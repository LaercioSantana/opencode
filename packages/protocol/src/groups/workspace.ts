import { Workspace } from "@opencode-ai/schema/workspace"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { ConflictError, ProviderNotFoundError } from "../errors.js"

export const WorkspaceGroup = HttpApiGroup.make("server.workspace")
  .add(
    HttpApiEndpoint.post("workspace.create", "/api/workspace", {
      payload: Schema.Struct({
        id: Workspace.ID.pipe(Schema.optional),
        provider: Schema.String,
      }),
      success: Schema.Struct({ data: Workspace.ID }),
      error: [ConflictError, ProviderNotFoundError],
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.workspace.create",
        summary: "Create workspace",
        description:
          "Create a logical workspace. A caller-supplied ID is idempotent when retried with the same provider; reusing it with another provider returns a conflict.",
      }),
    ),
  )
  .annotateMerge(OpenApi.annotations({ title: "workspace", description: "Logical workspace management routes." }))
