import { describe, it, expect } from "vitest";
import { checklistProgress, workspaceSchema, validateImage, MAX_IMAGE_BYTES, safeExternalUrl } from "@/lib/idea-workspace";
describe("optional private idea workspace", () => {
  it("allows an idea without any sections or checklist", () => { expect(workspaceSchema.parse({ version: 1, sections: [] }).sections).toHaveLength(0); });
  it("preserves checked and unchecked tasks across persistence", () => {
    const workspace = { version: 1, sections: [{ id: "trip", kind: "checklist", title: "Viaje", tasks: [{ id: "hotel", text: "Reservar hotel", done: true }, { id: "tickets", text: "Comprar boletos", done: false }] }] };
    const restored = workspaceSchema.parse(JSON.parse(JSON.stringify(workspace)));
    expect(restored.sections[0]?.tasks).toEqual(workspace.sections[0]?.tasks);
    expect(checklistProgress(restored.sections[0]?.tasks ?? [])).toEqual({ completed: 1, total: 2 });
  });
  it("accepts supported images up to 10 MB", () => { expect(validateImage({ type: "image/png", size: MAX_IMAGE_BYTES })).toBeNull(); expect(validateImage({ type: "image/png", size: MAX_IMAGE_BYTES + 1 })).not.toBeNull(); });
  it("rejects executable or SVG files", () => { expect(validateImage({ type: "image/svg+xml", size: 100 })).not.toBeNull(); expect(validateImage({ type: "text/html", size: 100 })).not.toBeNull(); });
  it("only permits web links", () => { expect(safeExternalUrl("javascript:alert(1)")).toBeNull(); expect(safeExternalUrl("https://example.com/trip")).toBe("https://example.com/trip"); });
});