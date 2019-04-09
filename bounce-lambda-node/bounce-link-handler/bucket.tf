// This bucket stores the source zip
resource "aws_s3_bucket" "app_bucket" {
  bucket = "is-ricko-bounce"
  acl    = "private"
}

// This uploads the file to the bucket.
// It will automagically move/reupload/etc as the hash changes.
resource "aws_s3_bucket_object" "app_zip" {
  bucket = "${aws_s3_bucket.app_bucket.bucket}"
  key = "${local.app_zip}"
  source = "../${local.app_zip}"
  etag = "${filemd5("../${local.app_zip}")}"
}
