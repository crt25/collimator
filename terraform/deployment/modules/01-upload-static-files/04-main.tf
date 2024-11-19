resource "aws_s3_object" "this" {
  for_each = fileset(var.build_directory, "**")
  bucket   = var.bucket_id
  key      = each.value
  source   = "${var.build_directory}${each.value}"
  etag     = filemd5("${var.build_directory}${each.value}")

  # set the content type based on the file extension
  content_type = lookup(local.mime_types, reverse(split(".", basename(each.value)))[0], "application/octet-stream")
}
