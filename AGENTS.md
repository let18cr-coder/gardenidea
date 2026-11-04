<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Idea workspaces
- Store optional idea sections as one versioned JSON workspace on the existing owner-protected ideas row; existing metadata updates must not overwrite workspace content.
- Store image object paths (never signed URLs) inside workspace sections; private Storage access requires both the authenticated owner folder and an owned idea ID.
- Keep rich-text content as Tiptap JSON, with shared workspace validation and private image helpers; do not render untrusted HTML.
