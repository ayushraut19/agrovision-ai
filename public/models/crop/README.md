# Teachable Machine crop model

Place your exported Teachable Machine files here:

- `model.json`
- `metadata.json`
- `weights.bin` (or sharded weight files)

Then set in `.env.local`:

```
NEXT_PUBLIC_TM_MODEL_URL=/models/crop/model.json
NEXT_PUBLIC_TM_METADATA_URL=/models/crop/metadata.json
```

Without these URLs, AgroVision uses the TensorFlow.js **mock** classifier in `lib/crop-model/mock-teachable-machine.ts`.
