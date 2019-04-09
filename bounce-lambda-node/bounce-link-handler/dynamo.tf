// It's a little counter-intuitive, but ...
// You *don't* actually define all the columns here.
// Just the indexed ones.
// Anything you'd have in a WHERE clause needs to be indexed somehow.
resource "aws_dynamodb_table" "link_table" {
  name = "link"
  hash_key = "name"
  billing_mode = "PROVISIONED"
  write_capacity = 1
  read_capacity = 1

  attribute {
    name = "name"
    type = "S"
  }

  // It looks like the tfstate for this is bugged?
//  ttl {
//    attribute_name = "TimeToExist"
//    enabled = false
//  }
}

resource "aws_dynamodb_table" "user_table" {
  name = "user"
  hash_key = "email"
  billing_mode = "PROVISIONED"
  write_capacity = 1
  read_capacity = 1

  attribute {
    name = "email"
    type = "S"
  }

//  ttl {
//    attribute_name = "TimeToExist"
//    enabled = false
//  }
}
