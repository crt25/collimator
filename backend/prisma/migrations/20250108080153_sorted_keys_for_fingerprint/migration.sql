WITH encoded_coordinates AS (
	SELECT
		k.id,
		-- jsonb replaces escaped characters, check with '"\u0041, \uD835\uDC9C and 𝒜"'::jsonb::text
		convert_from(
			"publicKey",
			'UTF-8'
		)::jsonb ->> 'x' as x,
		convert_from(
			"publicKey",
			'UTF-8'
		)::jsonb ->> 'y' as y
	
	FROM "KeyPair" k
),

fingerprints AS (
  SELECT
  	"id",
    REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              encode(
                sha512(
                  -- concat x and y and use a non-base64 character to separate them
                  convert_to("x" || '@' || "y", 'utf-8')
                ),
                'base64'
              ),
              -- convert to base64url
              '+',
              '-'
            ),
            -- convert to base64url
            '/',
            '_'
          ),
          -- convert to base64url
          '=',
          ''
        ),
        -- remove newlines added by postgres when encoding in base64
        E'\n',
        ''
      ) as fingerprint

    FROM encoded_coordinates
)

UPDATE "KeyPair" k
  SET "publicKeyFingerprint" = s."fingerprint"
FROM fingerprints s 
WHERE k.id = s.id
