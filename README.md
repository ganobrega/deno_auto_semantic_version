## Auto Semantic Version

Auto-generate integrity hash with versioning suggestion for your Deno módule.

- Can you have different version from percentage of changes.
- Can you create a hook to always change the version when pushing commit.

This is experimental, I'm using for a Google Tag Manager script code project.

## Usage

```
{
    "task": {
        "integrity": "deno run --allow-read --allow-run --allow-write https://deno.land/x/deno_auto_semantic_version/mod.ts version.ts <output-file>"
    }
}
```

