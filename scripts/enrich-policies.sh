#!/bin/bash

# Script to enrich all policies with short content using AI
echo "Starting batch policy enrichment..."

# Policy IDs that need enrichment (content < 600 chars)
policies=(
  "ba65dd05-d391-49fe-afa1-fc58152a6a91"
  "4485733d-08ba-479b-9cbe-2edb69e4e5e8"
  "66fbf8b2-71b1-4776-805d-b394a0f879c8"
  "81674f42-e097-456b-8a31-5660b9b649b6"
  "398c066c-6551-4147-851d-1008ad780f1b"
  "85429e6d-5368-43a8-9b7b-3727bae00f2f"
  "9e233971-aa86-459a-95f3-27be4c788b8f"
  "80760ddf-6317-424c-b312-221bc7573579"
  "b98c8711-7f6c-42f3-9c0c-b035a963c45e"
  "93a58bd3-bb59-4cae-8498-421ea9f4a5ef"
  "5f7b84d8-275e-4f98-8801-bbaa29c07623"
  "f4e60e2d-e5d9-4e33-a53b-abaa38c89d32"
  "b42c0a31-0392-466e-a943-ee791b2c7145"
  "39e7dc52-a852-460f-b1a1-a19291a6a948"
  "2728dde4-cf5e-4f25-925b-5ccf6bb024bd"
  "66bfd632-f40d-46c9-bf21-2d7307843fd8"
  "84d2fa75-5cb4-4f9f-ad23-6a02486461cf"
  "9c4c70e8-c097-41e3-8f0e-dae49cd94b7c"
  "8da65fe5-c8d8-4d3a-96dd-1f76202f08eb"
  "ec3833bb-0e00-4631-9271-8741af865faf"
  "e36e689e-8757-4f21-a006-16babf5d4d06"
  "eb331b49-7318-4b25-8f9e-42ffd420b8a1"
  "5f6bf02a-150d-474f-92ce-1186d69359ac"
  "5765d417-0387-40c4-9f25-437556be3011"
  "896a2599-113e-4d7e-bb3e-10553b69bee2"
  "d32bc486-ef45-42e2-9515-0acfcfeb5fb6"
  "f7e173ce-a144-40c1-9310-fa6069fc7acf"
  "1fe71bf7-ccdf-48c0-88f3-f1952bd29b8c"
  "edb6e6b0-d90f-4fd8-87d5-8499c20409bc"
  "5e3eda2d-a86d-420d-9a03-b0ab4f312e6c"
  "c08f8b6b-baa5-47d6-b6ce-a3b6be621ebf"
  "101cfc48-a9cb-4837-a2aa-b3873af5d07c"
  "31edb9ed-d234-446a-8fff-9a3967849c38"
  "3c78b6b4-8bd6-449f-8d1f-4f09deecf147"
  "e00aa0c0-fa5b-40fb-92b2-5fb4cafb19bb"
  "c8825cb9-2b04-4e96-916b-38756b063411"
  "59122793-10e6-4d7d-a6be-a68d65c6d11d"
  "eb8b789a-e9f4-4b47-8b12-0d048ad1e720"
  "8a3d688a-319b-4c28-83cb-dc29b6ed387e"
  "417c9837-6663-4d33-9c1c-d94c44d483f8"
  "506e1e11-0053-49a7-90a6-7dc377980142"
  "1548eab9-a3b0-4e65-b568-f7d49167c8e5"
  "ab0761de-ef39-4490-bef4-881011c1dc8b"
  "1517901a-f4a6-4bac-bc19-cce41477fb2a"
  "b2378ea6-128b-4931-a6f7-88f374feb146"
  "0be23650-a944-42d8-a5b1-530376f062f0"
  "9133ce24-7c50-4db2-a6b0-0d15c3842b67"
  "f3b72b8a-38c7-4a3a-bd58-b03b7eea48c6"
)

total=${#policies[@]}
count=0

for policy_id in "${policies[@]}"; do
  count=$((count + 1))
  echo "[$count/$total] Enriching policy: $policy_id"
  
  result=$(curl -s -X POST "http://localhost:5000/api/policies/$policy_id/ai-enrich-save" \
    -H "Content-Type: application/json" \
    -d '{}')
  
  if echo "$result" | grep -q '"success":true'; then
    echo "  ✓ Successfully enriched"
  else
    echo "  ✗ Failed: $result"
  fi
  
  # Small delay to avoid rate limiting
  sleep 1
done

echo "Batch enrichment complete!"
