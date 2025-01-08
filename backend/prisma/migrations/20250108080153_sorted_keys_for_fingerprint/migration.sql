WITH sortedJson AS (
  SELECT
    k.id,
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            encode(
              sha512(
                convert_to(
                  REPLACE(
                    json_object_agg(
                      j.key,
                      j.value
                      
                      ORDER BY j.key
                    )::text,
                    ' ',
                    ''
                  ),
                  'UTF-8'
                )
              ),
              'base64'
            ),
            '+',
            '-'
          ),
          '/',
          '_'
        ),
        '=',
        ''
      ),
      E'\n',
      ''
    ) AS sorted

  FROM "KeyPair" k
  INNER JOIN json_each(convert_from(
    "publicKey",
    'UTF-8'
  )::json) j ON true

  GROUP BY k.id
)

UPDATE "KeyPair" k
  SET "publicKeyFingerprint" = s."sorted"
FROM sortedJson s 
WHERE k.id = s.id
