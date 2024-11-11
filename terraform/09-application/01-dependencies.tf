module "globals" {
  source = "../01-globals"
}

module "certificate" {
  source = "../03-certificate"
}

module "lambdas" {
  source       = "../04-lambdas"
  lambdas_path = "./lambdas"
}

module "containers" {
  source = "../05-containers"
}
