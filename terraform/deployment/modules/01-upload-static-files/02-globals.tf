
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
