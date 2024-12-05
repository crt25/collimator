locals {
  # create a map from file extension to mime type
  mime_types = {
    # HTML files
    "txt"  = "text/plain"
    "html" = "text/html"
    "css"  = "text/css"
    "js"   = "application/javascript"
    "cjs"  = "application/javascript"
    "json" = "application/json"

    # source maps
    "map" = "application/json"

    # images
    "png"  = "image/png"
    "jpg"  = "image/jpeg"
    "jpeg" = "image/jpeg"
    "gif"  = "image/gif"
    "svg"  = "image/svg+xml"
    "ico"  = "image/x-icon"

    # audio files
    "mp3" = "audio/mpeg"
    "wav" = "audio/wav"
    "ogg" = "audio/ogg"

    # fonts
    "ttf" = "font/ttf"
    "otf" = "font/otf"
  }
}

resource "aws_s3_object" "this" {
  for_each = fileset(var.directory, "**")
  bucket   = var.bucket_id
  key      = "${var.bucket_path_prefix}${each.value}"
  source   = "${var.directory}/${each.value}"
  etag     = filemd5("${var.directory}/${each.value}")

  # set the content type based on the file extension
  content_type = lookup(local.mime_types, reverse(split(".", basename(each.value)))[0], "application/octet-stream")
}
