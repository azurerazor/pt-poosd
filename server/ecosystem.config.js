module.exports = {
  apps : [{
    name   : "avalon",
    script : "./dist/app.js",
    node_args: "-r tsconfig-paths/register",
  }]
}
